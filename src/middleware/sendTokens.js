const jwt = require("jsonwebtoken");
const { SECRET_JWT_KEY, NODE_ENV } = require("../config/config.js");
const db = require("../models");
const Rol = db.getModel("Rol");
const Permiso = db.getModel("Permiso");

async function generarTokensYEnviar(usuario, res, rolesNombre) {
  // Obtener permisos desde los roles
  const roles = await Rol.findAll({
    where: { nombre: rolesNombre },
    include: {
      model: Permiso,
      attributes: ["nombre"],
      through: { attributes: [] } // no incluir tabla intermedia
    }
  });

  // Extraer permisos únicos
  const permisosNombre = [...new Set(roles.flatMap(r => r.Permisos.map(p => p.nombre)))];

  // Generar tokens
  const accessToken = jwt.sign(
    {
      id: usuario.id,
      email: usuario.email,
      rol: rolesNombre,
      permisos: permisosNombre
    },
    SECRET_JWT_KEY,
    { expiresIn: "1h" }
  );

  const refreshToken = jwt.sign(
    {
      id: usuario.id,
      email: usuario.email,
      rol: rolesNombre,
      permisos: permisosNombre
    },
    SECRET_JWT_KEY,
    { expiresIn: "7d" }
  );

  usuario.refreshToken = refreshToken;

  return usuario.save().then(() => {
    res
      .cookie("access_token", accessToken, {
        httpOnly: true,
        secure: NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 1000 // 1 hora
      })
      .cookie("refresh_token", refreshToken, {
        httpOnly: true,
        secure: NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 días
      });
  });
}

module.exports = {
  generarTokensYEnviar
};
