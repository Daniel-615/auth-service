const express= require("express");
const PermisoController = require("../controllers/permiso.controller.js");
const verifyToken = require('../middleware/auth.js');
const { checkPermisosDesdeRoles } = require('../middleware/checkRole.js');
class PermisoRoutes{
    constructor(app){
        this.router=express.Router();
        this.controller=new PermisoController();
        this.registerRoutes();
        app.use("/api/permiso",this.router);
    }
    registerRoutes(){
        // Crear un nuevo permiso
        this.router.post("/", verifyToken, checkPermisosDesdeRoles(["asignar_permisos"]),(req, res) => {
            this.controller.create(req, res);
        });

        // Obtener todos los permisos
        this.router.get("/", verifyToken, checkPermisosDesdeRoles(["ver_permisos"]), (req, res) => {
            this.controller.findAll(req, res);
        });

        // Obtener un permiso por ID
        this.router.get("/:id", verifyToken, checkPermisosDesdeRoles(["ver_permiso"]), (req, res) => {
            this.controller.findOne(req, res);
        });

        // Actualizar un permiso
        this.router.put("/:id", verifyToken, checkPermisosDesdeRoles(["actualizar_permiso"]),(req, res) => {
            this.controller.update(req, res);
        });

        // Eliminar un permiso
        this.router.delete("/:id", verifyToken, checkPermisosDesdeRoles(["eliminar_permiso"]),(req, res) => {
            this.controller.delete(req, res);
        });
    }
}
module.exports = PermisoRoutes;