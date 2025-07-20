const express= require("express");
const PermisoController = require("../controllers/permiso.controller.js");
const verifyToken = require('../middleware/auth.js');
class PermisoRoutes{
    constructor(app){
        this.router=express.Router();
        this.controller=new PermisoController();
        this.registerRoutes();
        app.use("/api/permiso",this.router);
    }
    registerRoutes(){
        // Crear un nuevo rol
        this.router.post("/", verifyToken, (req, res) => {
            this.controller.create(req, res);
        });

        // Obtener todos los roles
        this.router.get("/", verifyToken, (req, res) => {
            this.controller.findAll(req, res);
        });

        // Obtener un rol por ID
        this.router.get("/:id", verifyToken, (req, res) => {
            this.controller.findOne(req, res);
        });

        // Actualizar un rol
        this.router.put("/:id", verifyToken, (req, res) => {
            this.controller.update(req, res);
        });

        // Eliminar un rol
        this.router.delete("/:id", verifyToken, (req, res) => {
            this.controller.delete(req, res);
        });
    }
}
module.exports = PermisoRoutes;