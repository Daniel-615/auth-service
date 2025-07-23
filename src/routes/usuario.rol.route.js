const express = require("express");
const UsuarioRolController = require("../controllers/usuario.rol.controller.js");
const verifyToken = require('../middleware/auth.js');
const { checkPermisosDesdeRoles } = require('../middleware/checkRole.js');
class RolPermisoRoutes {
  constructor(app) {
    this.router = express.Router();
    this.controller = new UsuarioRolController();
    this.registerRoutes();
    app.use("/auth-service/usuario-rol", this.router);
  }

  registerRoutes() {
    // Crear una relación usuario-rol
    this.router.post("/", verifyToken, checkPermisosDesdeRoles(["asignar_roles"]),this.controller.create.bind(this.controller));


    // Obtener todas las relaciones usuario-rol
    this.router.get("/", verifyToken, checkPermisosDesdeRoles(["ver_roles","ver_usuarios"]),this.controller.findAll.bind(this.controller));

    // Obtener una relación específica por usuario y rolId
    this.router.get("/:usuarioId/:rolId", verifyToken,checkPermisosDesdeRoles(["ver_rol","ver_usuario"]), this.controller.findOne.bind(this.controller));

    // Eliminar una relación específica por usuarioId y rolId
    this.router.delete("/:usuarioId/:rolId", verifyToken, checkPermisosDesdeRoles(["eliminar_rol","eliminar_usuario"]),this.controller.delete.bind(this.controller));
  }
}

module.exports = RolPermisoRoutes;
