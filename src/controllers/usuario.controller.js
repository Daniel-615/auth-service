const db = require("../models");
const Usuario = db.getModel("Usuario");
const Op = db.Sequelize.Op;
const jwt = require("jsonwebtoken");
const { generarTokensYEnviar } = require("../middleware/sendTokens.js");
const { SECRET_JWT_KEY,FRONTEND_URL} = require("../config/config.js");
const validation_user= require("../middleware/validationUser.js");
const { enviarCorreoRecuperacion } = require("../middleware/mailer.js");
const cookieOptions = require("../middleware/cookieOptions.js");
const UsuarioRol = db.getModel("UsuarioRol");
class UsuarioController {
    async verifyRefreshToken(req,res){
      const token=req.cookies?.refresh_token;
      if(!token){
        return res
        .status(401).send({
          message: "No se encontró el token de sesión."
        })
      }
      try{
        const decoded=jwt.verify(token,SECRET_JWT_KEY);
        const usuario=await Usuario.findOne({
          where:{
            id: decoded.id,
            email: decoded.email,
            refreshToken: token,
            status:true
          }
        })
        if(!usuario){
          return res
          .status(404)
          .send({
            message: "Usuario no encontrado"
          })
        }
        return res
        .status(200)
        .send({
          "userId": usuario.id,
          "email": usuario.email,
          "rol": decoded.rol
        })
      }catch(error){
        return res
        .status(403)
        .send({
          message: "Token inválido o expirado:"
        })

      }
    }
  async create(req, res) {
    const { nombre, apellido, email, password, status, rolId } = req.body;

    if (!nombre || !apellido ||!email || !password) {
      return res.status(400).send({ message: "Faltan campos obligatorios." });
    }

    try {
      // Validaciones
      validation_user.userName(nombre,res);
      validation_user.email(email,res);
      validation_user.password(password,res);

      // Verificar duplicados
      const existingUsername = await Usuario.findOne({ where: { nombre, apellido } });
      if (existingUsername) {
        return res.status(400).send({ message: "El nombre de usuario ya está en uso." });
      }

      const existingUserEmail = await Usuario.findOne({ where: { email } });
      if (existingUserEmail) {
        return res.status(400).send({ message: "El correo ya está registrado." });
      }

      // Crear usuario
      const nuevoUsuario = Usuario.build(); 
      nuevoUsuario.Nombre = nombre;
      nuevoUsuario.Apellido = apellido;
      nuevoUsuario.Email = email;
      nuevoUsuario.Password = password;
      nuevoUsuario.Status = status ?? true;

      
      let rolAsignado = 2;
      
      if (req.user && req.user.id) {
        // Usuario autenticado: debe proporcionar rolId
        if (!rolId) {
          return res.status(400).send({
            message: "El campo 'rolId' es obligatorio al registrar usuarios autenticado."
          });
        }
        
        if (rolId !== 1) {
          return res.status(400).send({
            message: "Solo se permite asignar el rol de empleado"
          });
        }
        
        rolAsignado = rolId;
      }
      //Pasa por todos los filtros de validación si estos se cumplen crea el usuario
      await nuevoUsuario.save();
      
      await UsuarioRol.create({
        usuarioId: nuevoUsuario.id,
        rolId: rolAsignado
      });

      const roles = await nuevoUsuario.getRoles({
        include: [
          {
            model: db.getModel("Permiso"),
            as: "Permisos"  // usa el alias correcto
          }
        ]
      }); 
      const rolesNombre = roles.map(r => r.nombre);

      // Generar y enviar tokens solo si es registro público
      if (!req.user) {
        await generarTokensYEnviar(nuevoUsuario, res, rolesNombre);
      }

      // Enviar respuesta
      return res.status(201).send({
        message: "Usuario registrado exitosamente.",
        id: nuevoUsuario.id,
        nombre: nuevoUsuario.nombre,
        apellido:nuevoUsuario.apellido,
        email: nuevoUsuario.Email,
        status: nuevoUsuario.Status,
        rolAsignado: rolAsignado
      });

    } catch (err) {
      console.error("Error al crear usuario:", err);
      return res.status(500).send({
        message: err.message || "Ocurrió un error al crear el usuario."
      });
    }
  }


  // Obtener todos los usuarios
  async findAll(req, res) {
    const nombre = req.query.nombre;
    const condition = nombre ? { nombre: { [Op.iLike]: `%${nombre}%` } } : null;

    try {
      const usuarios = await Usuario.findAll({ where: condition });

      const usuariosConFullName = usuarios.map(u => ({
        id: u.id,
        fullName: u.FullName,
        email: u.Email,
        status: u.Status,
      }));

      res.send(usuariosConFullName);
    } catch (err) {
      res.status(500).send({
        message: err.message || "Error al obtener los usuarios."
      });
    }
  }
 
  // Obtener un usuario por ID
  async findOne(req, res) {
    const id = req.params.id;

    try {
      const usuario = await Usuario.findByPk(id);
      if (!usuario) {
        return res.status(404).send({ message: "Usuario no encontrado." });
      }

      res.send({
        id: usuario.id,
        fullName: usuario.FullName,
        email: usuario.Email,
        status: usuario.Status
      });
    } catch (err) {
      res.status(500).send({
        message: `Error al obtener el usuario con id=${id}`
      });
    }
  }
  async refreshToken(req, res) {
    const refreshToken = req.cookies.refresh_token;

    if (!refreshToken) {
      return res.status(403).send({ message: "No hay refresh token." });
    }

    try {
      const usuario = await Usuario.findOne({ where: { refreshToken } });

      if (!usuario) {
        return res.status(403).send({ message: "Token inválido o usuario no encontrado." });
      }

      jwt.verify(refreshToken, SECRET_JWT_KEY, async(err, decoded) => {
        if (err || usuario.email !== decoded.email) {
          return res.status(403).send({ message: "Token inválido." });
        }

        const newAccessToken = jwt.sign(
          { id: usuario.id, email: usuario.email },
          SECRET_JWT_KEY,
          { expiresIn: "1h" }
        );

        res
          .cookie("access_token", newAccessToken, {
            ...cookieOptions,
            maxAge: 60*60*1000 // 1 hora de vida
          })
          .send({
              message: "Token renovado exitosamente.",
              success: true,
              "user":{
                username: usuario.nombre + " "+ usuario.apellido
              } 
            });
      });
    } catch (err) {
      console.error("Error al renovar token:", err.message);
      res.status(500).send({ message: "Error al renovar el token." });
    }
  }

  async login(req,res){
    const { email, password } = req.body;
    validation_user.email(email,res);
    validation_user.password(password,res);
    try{
      const usuario=await Usuario.findOne({ where: { email, status: true}});
      
      if (!usuario) {
        return res.status(404).send({ message: "Usuario no encontrado." });
      }

      const call = await usuario.isValid(password, usuario.password);
      if (!call) {
        return res.status(401).send({ message: "Contraseña incorrecta." });
      }
      const roles = await usuario.getRoles({
        include: [
          {
            model: db.getModel("Permiso"),
            as: "Permisos"  // usa el alias correcto
          }
        ]
      }); 
      const rolesNombre = roles.map(r => r.nombre);

      await generarTokensYEnviar(usuario, res,rolesNombre);

      await usuario.save();

      res
        .status(200).send({
        message: "Inicio de sesión exitoso.",
        "user":{
          "id": usuario.id, 
          "nombre": usuario.nombre,
          "apellido": usuario.apellido,
          "rol": rolesNombre
        }
      })
    }catch(err){
       console.log(`Error al iniciar sesión: ${err.message}`);
      return res.status(500).send({
        message: "Error al iniciar sesión"
      });
    }
  }
  // Actualizar un usuario
  async update(req, res) {
    const id = req.params.id;

    try {
      const usuario = await Usuario.findByPk(id);
      if (!usuario) {
        return res.status(404).send({ message: "Usuario no encontrado o inactivo." });
      }

      const { nombre, apellido, email } = req.body;
      if(!nombre || !apellido){
        return res
        .status(400)
        .send({
          message: "Se requieren todos los campos."
        })
      }
      validation_user.nombre(nombre)
      validation_user.apellido(apellido)
      usuario.nombre = nombre;
      usuario.apellido = apellido;
      if(email){
        validation_user.email(email)
        usuario.email = email;
      }
      await usuario.save();

      res.send({
        message: "Usuario actualizado.",
        fullName: usuario.nombre + " "+ usuario.apellido,
        email: usuario.email,
      });
    } catch (err) {
      res.status(500).send({
        message: `Error al actualizar el usuario con id=${id}`
      });
    }
  }
  async logout(req, res) {
    try {
      const refreshToken = req.cookies.refresh_token;

      if (refreshToken) {
        const usuario = await Usuario.findOne({ where: { refreshToken } });
        if (usuario) {
          usuario.refreshToken = null;
          await usuario.save();
        }
      }

      res.clearCookie("access_token",{cookieOptions,maxAge:0});
      res.clearCookie("refresh_token",{cookieOptions,maxAge:0});
      res.status(200).json({ message: "Sesión cerrada exitosamente" });
    } catch (err) {
      console.error("Error al cerrar sesión:", err.message);
      res.status(500).json({ message: "Error al cerrar sesión" });
    }
  }



  //PANEL ADMINISTRADOR delete y mostrar todos los usuarios activos.
  // Eliminar un usuario
  async delete(req, res) {
    const id = req.params.id;

    try {
      const deleted = await Usuario.destroy({ where: { id } });

      if (deleted === 1) {
        res.send({ message: "Usuario eliminado exitosamente." });
      } else {
        res.send({ message: `No se pudo eliminar el usuario con id=${id}.` });
      }
    } catch (err) {
      res.status(500).send({
        message: `Error al eliminar el usuario con id=${id}`
      });
    }
  }
  //Eliminar cuenta para los usuarios activos 
  async deactivateAccount(req,res){
    const id=req.params.id;
    if(!id){
      return res.status(400).send({
        message: "ID de usuario no proporcionado."
      });
    }
    try{
      const usuario = await Usuario.findByPk(id);
      if (!usuario) {
        return res.status(404).send({ message: "Usuario no encontrado." });
      }
      usuario.Status = false;
      await usuario.save();
      res.send({
        message: "Cuenta desactivada exitosamente.",
        userId: usuario.id,
        fullName: usuario.FullName,
        email: usuario.Email
      });
    }catch(err) {
      console.error(`Error al desactivar la cuenta: ${err.message}`);
      res.status(500).send({
        message: "Error al desactivar la cuenta"
      });
    }
  }
  // Obtener usuarios activos
  async findAllActivos(req, res) {
    try {
      const activos = await Usuario.findAll({ where: { status: true } });

      const resultado = activos.map(u => ({
        id: u.id,
        fullName: u.FullName,
        email: u.Email
      }));

      res.send(resultado);
    } catch (err) {
      res.status(500).send({
        message: err.message || "Error al obtener usuarios activos."
      });
    }
  }
  async resetPassword(req, res) {
    const { token } = req.query;
    const { newPassword}= req.body;
    if (!token || !newPassword) {
      return res.status(400).send({ message: "Token o nueva contraseña no proporcionados." });
    }
    try {
      const decoded = jwt.verify(token, SECRET_JWT_KEY);
      const usuario = await Usuario.findOne({ where: { id: decoded.id, resetToken: token } });

      if (!usuario) {
        return res.status(404).send({ message: "Usuario no encontrado o token inválido." });
      }

      usuario.Password = newPassword; // Utiliza el setter para actualizar la contraseña
      usuario.resetToken = null; // Limpiar el token de restablecimiento
      await usuario.save();

      res.send({ message: "Contraseña restablecida exitosamente." });
    } catch (err) {
      console.error(`Error al restablecer la contraseña: ${err.message}`);
      res.status(500).send({ message: "Error al restablecer la contraseña." });
    }
  }
  async sendResetPassword(req,res){
    const { email }= req.body;
    try{
      const usuario= await Usuario.findOne({ where: {email, status: true}})
      if (!usuario) {
        return res.status(404).send({ message: "Correo no encontrado." });
      }
      //Generar token de recuperación
      const resetToken=jwt.sign(
        { id: usuario.id, email:usuario.email},
        SECRET_JWT_KEY,
        { expiresIn: "15m" } // Expira en 15 minutos
      )
      usuario.resetToken=resetToken;
      await usuario.save();
      //Enviar correo de recuperación
      await enviarCorreoRecuperacion(email,resetToken)
      res.status(200).send({
        message: "Correo enviado para restablecer contraseña."
      })
    }catch(err){
      console.error(`Error al enviar correo de recuperación: ${err.message}`);
      res.status(500).send({
        message: "Error interno del servidor"
      });
    }
  }
  //OAUTH2
  async googleCallBackHandler(req,res){
    try{
      const usuario=req.user;
      const roles = await usuario.getRoles({
        include: [
          {
            model: db.getModel("Permiso"),
            as: "Permisos"  
          }
        ]
      });
      const rolesNombre = roles.map(r => r.nombre); 
      await generarTokensYEnviar(usuario,res,rolesNombre);
      return res.redirect(`${FRONTEND_URL}/`); 
    } catch(err){
      console.error(`Error en el callback de Google: ${err.message}`);
      return res.status(500).send({
        message: "Error al iniciar sesión con Google."
      });
    }
  }
}
module.exports = UsuarioController;