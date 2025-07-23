const express = require("express");
const RolPermisoController = require("../controllers/rol.permiso.controller.js");
const verifyToken = require('../middleware/auth.js');
const { checkPermisosDesdeRoles } = require("../middleware/checkRole.js");

class RolPermisoRoutes {
  constructor(app) {
    this.router = express.Router();
    this.controller = new RolPermisoController();
    this.registerRoutes();
    app.use("/auth-service/rol-permiso", this.router);
  }

  registerRoutes() {
    // Crear una relación rol-permiso
    this.router.post("/", verifyToken,checkPermisosDesdeRoles(["asignar_permisos","asignar_roles"]), this.controller.create.bind(this.controller));

    // Crear múltiples relaciones rol-permiso
    this.router.post("/many", verifyToken, checkPermisosDesdeRoles(["asignar_permisos","asignar_roles"]), (req,res)=>{
        try{
            this.controller.createMany.bind(this.controller)
        }catch(err){
            console.error("Error al crear múltiples relaciones:", err);
        }
    });

    // Obtener todas las relaciones rol-permiso
    this.router.get("/", verifyToken, checkPermisosDesdeRoles(["ver_roles","ver_permisos"]),this.controller.findAll.bind(this.controller));

    // Obtener una relación específica por permisoId y rolId
    this.router.get("/:rolId/:permisoId", verifyToken,checkPermisosDesdeRoles(["ver_permiso","ver_rol"]), this.controller.findOne.bind(this.controller));

    // Eliminar una relación específica por permisoId y rolId
    this.router.delete("/:rolId/:permisoId", verifyToken, checkPermisosDesdeRoles(["eliminar_rol","eliminar_permiso"]),this.controller.delete.bind(this.controller));
  }
}

module.exports = RolPermisoRoutes;
