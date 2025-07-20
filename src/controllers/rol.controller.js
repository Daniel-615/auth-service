const db = require("../models");
const Rol = db.getModel("Rol");
class RolController {
  async create(req, res) {
    const { nombre } = req.body;

    if (!nombre) {
      return res.status(400).send({ message: "El nombre del rol es obligatorio." });
    }

    try {
      const existing = await Rol.findOne({ where: { nombre } });
      if (existing) {
        return res.status(400).send({ message: "El rol ya existe." });
      }

      const nuevoRol = await Rol.create({ nombre });

      res.status(201).send({
        message: "Rol creado exitosamente.",
        rol: { id: nuevoRol.id, nombre: nuevoRol.Nombre }
      });
    } catch (err) {
      res.status(500).send({
        message: err.message || "Error al crear el rol."
      });
    }
  }

  // Obtener todos los roles
  async findAll(req, res) {
    try {
      const roles = await Rol.findAll();
      res.send(roles);
    } catch (err) {
      res.status(500).send({ message: err.message || "Error al obtener los roles." });
    }
  }

  // Obtener un rol por ID
  async findOne(req, res) {
    const id = req.params.id;
    try {
      const rol = await Rol.findByPk(id);
      if (!rol) {
        return res.status(404).send({ message: "Rol no encontrado." });
      }
      res.send(rol);
    } catch (err) {
      res.status(500).send({ message: "Error al obtener el rol." });
    }
  }

  // Actualizar un rol
  async update(req, res) {
    const id = req.params.id;
    const { nombre } = req.body;

    try {
      const rol = await Rol.findByPk(id);
      if (!rol) {
        return res.status(404).send({ message: "Rol no encontrado." });
      }

      rol.Nombre = nombre;
      await rol.save();

      res.send({
        message: "Rol actualizado.",
        rol: { id: rol.id, nombre: rol.Nombre }
      });
    } catch (err) {
      res.status(500).send({ message: "Error al actualizar el rol." });
    }
  }

  // Eliminar un rol
  async delete(req, res) {
    const id = req.params.id;

    try {
      const deleted = await Rol.destroy({ where: { id } });

      if (deleted === 1) {
        res.send({ message: "Rol eliminado exitosamente." });
      } else {
        res.status(404).send({ message: "Rol no encontrado." });
      }
    } catch (err) {
      res.status(500).send({ message: "Error al eliminar el rol." });
    }
  }
}

module.exports = RolController;
