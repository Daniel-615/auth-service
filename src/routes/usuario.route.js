const express = require("express");
const UsuarioController=require("../controllers/usuario.controller.js");
const verifyToken = require('../middleware/auth.js');

class UsuarioRoutes {
  constructor(app) {
    this.router = express.Router();
    this.controller = new UsuarioController(); // usando instancia de clase
    this.registerRoutes();
    app.use("/api/usuario", this.router); // agrupar rutas bajo este endpoint
  }

  registerRoutes() {
    this.router.get('/', verifyToken, (req, res) => {
      res.status(200).send({
        message: "Token verificado correctamente.",
        userId: req.user.id,
        email: req.user.email
      });
    });
    //Refrescar token
    this.router.post("/refreshToken", (req, res) => {
      this.controller.refreshToken(req, res);
    });
    this.router.post("/login/", (req, res) => {
      this.controller.login(req, res);
    });
    this.router.post("/register/", (req, res)=>{
        try{
            this.controller.create(req,res)
        }catch(err){
            res.status(500).send({
                message: "Error al registrar el usuario"
            })
            console.log(`Error al registrar el usuario: ${err.message}`)
        }
    });
    this.router.put("/update/:id", verifyToken, (req, res) => {
      this.controller.update(req, res);
    });
    this.router.get("/protected", verifyToken, (req, res) => {
      res.status(200).send({
        message: "Acceso permitido.",
        userId: req.user.id,
        email: req.user.email
      });
    });
    this.router.post("/logout/", (req,res)=>{
      try{
        this.controller.logout(req,res)
      }catch(err){
        console.log(`Error al cerrar sesión: ${err.message}`); 
        return res.status(500).send({
          message: "Error al cerrar sesión"
        });
      }
    });
    this.router.post("/deactivateAccount/:id", verifyToken, (req, res) => {
      this.controller.deactivateAccount(req, res);
    });
    
    //Reestablecer contraseña
    this.router.post("/forgot-password", (req, res) => {
      try{
        this.controller.sendResetPassword(req, res);
      }catch(err){
        console.error(`Error al procesar solicitud de restablecimiento de contraseña: ${err.message}`);
        res.status(500).send({
          message: "Error interno del servidor"
        });
      }
    });
    this.router.post("/reset-password", (req, res) => {
      try{
        this.controller.resetPassword(req,res);
      }catch(err){
        console.error(`Error al procesar solicitud de restablecimiento de contraseña: ${err.message}`);
        res.status(500).send({
          message: "Error interno del servidor"
        });
      }
    })
    //Lógica solo administradores
    this.router.get("/findOne/:id", verifyToken, (req, res) => {
      this.controller.findOne(req,res);
    })
    this.router.get("/findAll/",verifyToken, (req, res) => {
      this.controller.findAll(req,res);
    })
    this.router.delete("/delete/:id", verifyToken, (req, res) => {
      this.controller.delete(req, res);
    });
    this.router.get("/findAllActivos", verifyToken, (req, res) => {
      this.controller.findAllActivos(req, res);
    });
  }
}

module.exports = UsuarioRoutes;