const db=require("../models")
const Permiso=db.getModel("Permiso")

class PermisoController{
    async create(req,res){
        const { nombre }= req.body
        if(!nombre){
            return res.status(400).send({message:"El nombre del permiso es obligatorio."})
        }
        try{
            const existing=await Permiso.findOne({ where: {nombre}})
            if(existing){
                return res.status(400).send({message:"El permiso ya existe."})
            }
            const newPermiso=await Permiso.create({nombre})
            res.status(201).send({
                message:"Permiso creado exitosamente.",
                permiso:{id:newPermiso.id, nombre:newPermiso.nombre}
            });
        }catch(err){
            return res.status(500).send({message:err.message || "Error al verificar el permiso."})
        }
    }
    //Obtener todos los permisos
    async findAll(req,res){
        try{
            const permisos=await Permiso.findAll()
            res.send(permisos)
        }catch(err){
            return res.status(500).send({message:err.message || "Error al obtener los permisos."})
        }
    }
    async findOne(req,res){
        const id=req.params.id
        try{
            const permiso= await Permiso.findByPk(id);
            if(!permiso){
                return res.status(404).send({message:"Permiso no encontrado."})
            }
            res.send(permiso)
        }catch(err){
            return res.status(500).send({message:"Error al obtener el permiso."})
        }
    }
    async update(req,res){
        const id=req.params.id
        const {nombre}= req.body
        try{
            const permiso=await Permiso.findByPk(id)
            if(!permiso){
                return res.status(404).send({message:"Permiso no encontrado."})
            }
            permiso.nombre=nombre
            await permiso.save()
            res.send({
                message:"Permiso actualizado exitosamente.",
                permiso:{id:permiso.id, nombre:permiso.nombre}
            })
        }catch(err){
            return res.status(500).send({message:"Error al actualizar el permiso."})
        }
    }
    async delete(req,res){
        const id=req.params.id
        try{
            const deleted=await Permiso.destroy({where: {id}})
            if(deleted===1){
                return res.status(200).send({message:"Permiso eliminado correctamente."})
            }else{
                return res.status(404).send({message:"Permiso no encontrado."})
            }
        }catch(err){
            return res.status(500).send({message:"Error al eliminar el permiso."})
        }
    }
}
module.exports=PermisoController