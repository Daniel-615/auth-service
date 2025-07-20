const express = require("express");
const RolPermisoController = require("../controllers/rol.permiso.controller.js");
const verifyToken = require('../middleware/auth.js');

class RolPermisoRoutes {
  constructor(app) {
    this.router = express.Router();
    this.controller = new RolPermisoController();
    this.registerRoutes();
    app.use("/api/rol-permiso", this.router);
  }

  registerRoutes() {
    // Crear una relación rol-permiso
    this.router.post("/", verifyToken, this.controller.create.bind(this.controller));

    // Crear múltiples relaciones rol-permiso
    this.router.post("/many", verifyToken, (req,res)=>{
        try{
            this.controller.createMany.bind(this.controller)
        }catch(err){
            console.error("Error al crear múltiples relaciones:", err);
        }
    });

    // Obtener todas las relaciones rol-permiso
    this.router.get("/", verifyToken, this.controller.findAll.bind(this.controller));

    // Obtener una relación específica por usuarioId y rolId
    this.router.get("/:rolId/:permisoId", verifyToken, this.controller.findOne.bind(this.controller));

    // Eliminar una relación específica por usuarioId y rolId
    this.router.delete("/:rolId/:permisoId", verifyToken, this.controller.delete.bind(this.controller));
  }
}

module.exports = RolPermisoRoutes;
