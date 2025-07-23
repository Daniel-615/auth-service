const express= require("express");
const RolController = require("../controllers/rol.controller.js");
const verifyToken = require('../middleware/auth.js');
const { checkPermisosDesdeRoles } = require('../middleware/checkRole.js');
class RolRoutes{
    constructor(app){
        this.router=express.Router();
        this.controller=new RolController();
        this.registerRoutes();
        app.use("/auth-service/rol",this.router);
    }
    registerRoutes(){
        // Crear un nuevo rol
        this.router.post("/", verifyToken, checkPermisosDesdeRoles(["asignar_roles"]),(req, res) => {
            this.controller.create(req, res);
        });

        // Obtener todos los roles
        this.router.get("/", verifyToken, checkPermisosDesdeRoles(["ver_roles"]), (req, res) => {
            this.controller.findAll(req, res);
        });

        // Obtener un rol por ID
        this.router.get("/:id", verifyToken, checkPermisosDesdeRoles(["ver_rol"]),(req, res) => {
            this.controller.findOne(req, res);
        });

        // Actualizar un rol
        this.router.put("/:id", verifyToken, checkPermisosDesdeRoles(["actualizar_rol"]),(req, res) => {
            this.controller.update(req, res);
        });

        // Eliminar un rol
        this.router.delete("/:id", verifyToken, checkPermisosDesdeRoles(["eliminar_rol"]), (req, res) => {
            this.controller.delete(req, res);
        });
    }
}
module.exports = RolRoutes;