const express = require("express");
const UsuarioController = require("../controllers/usuario.controller.js");
const verifyToken = require('../middleware/auth.js');
const passport = require('../middleware/oauth2.js'); 

class UsuarioRoutes {
  constructor(app) {
    this.router = express.Router();
    this.controller = new UsuarioController();
    this.registerRoutes();
    app.use("/api/usuario", this.router);
  }

  registerRoutes() {
    // Verificación de token básica
    this.router.get('/', verifyToken, (req, res) => {
      res.status(200).send({
        message: "Token verificado correctamente.",
        userId: req.user.id,
        email: req.user.email
      });
    });

    this.router.get("/protected", verifyToken, (req, res) => {
      res.status(200).send({
        message: "Acceso permitido.",
        userId: req.user.id,
        email: req.user.email
      });
    });

    // Auth tradicional
    this.router.post("/login", (req, res) => {
      this.controller.login(req, res);
    });

    this.router.post("/register", (req, res) => {
      try {
        this.controller.create(req, res);
      } catch (err) {
        console.error(`Error al registrar el usuario: ${err.message}`);
        res.status(500).send({ message: "Error al registrar el usuario" });
      }
    });

    this.router.post("/logout", (req, res) => {
      try {
        this.controller.logout(req, res);
      } catch (err) {
        console.error(`Error al cerrar sesión: ${err.message}`);
        res.status(500).send({ message: "Error al cerrar sesión" });
      }
    });

    this.router.post("/refreshToken", (req, res) => {
      this.controller.refreshToken(req, res);
    });

    // Reestablecimiento de contraseña
    this.router.post("/forgot-password", (req, res) => {
      try {
        this.controller.sendResetPassword(req, res);
      } catch (err) {
        console.error(`Error al procesar solicitud de restablecimiento de contraseña: ${err.message}`);
        res.status(500).send({ message: "Error interno del servidor" });
      }
    });

    this.router.post("/reset-password", (req, res) => {
      try {
        this.controller.resetPassword(req, res);
      } catch (err) {
        console.error(`Error al procesar restablecimiento: ${err.message}`);
        res.status(500).send({ message: "Error interno del servidor" });
      }
    });

    // Rutas de usuario protegidas
    this.router.put("/:id", verifyToken, (req, res) => {
      this.controller.update(req, res);
    });

    this.router.post("/deactivateAccount/:id", verifyToken, (req, res) => {
      this.controller.deactivateAccount(req, res);
    });

    this.router.get("/findOne/:id", verifyToken, (req, res) => {
      this.controller.findOne(req, res);
    });

    this.router.get("/findAll", verifyToken, (req, res) => {
      this.controller.findAll(req, res);
    });

    this.router.get("/findAllActivos", verifyToken, (req, res) => {
      this.controller.findAllActivos(req, res);
    });

    this.router.delete("/:id", verifyToken, (req, res) => {
      this.controller.delete(req, res);
    });

    // Google OAuth2
    this.router.get("/auth/google", passport.authenticate("google", {
      scope: ["profile", "email"]
    }));

    this.router.get(
      "/auth/google/callback",
      passport.authenticate("google", {
        session: false,
        failureRedirect: "/api/usuario/login", // Puedes cambiar esto a tu frontend
      }),
      (req, res) => this.controller.googleCallBackHandler(req, res)
    );
  }
}

module.exports = UsuarioRoutes;
