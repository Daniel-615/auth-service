const db = require("../models");
const RolPermiso = db.getModel("RolPermiso");
const Rol = db.getModel("Rol");
const Permiso = db.getModel("Permiso");

class RolPermisoController {
  async createMany(req, res) {
    const relaciones = req.body;

    if (!Array.isArray(relaciones) || relaciones.length === 0) {
      return res.status(400).send({ message: "Se requiere un arreglo de relaciones rol-permiso." });
    }

    try {
      const relacionesUnicas = Array.from(
        new Map(relaciones.map(r => [`${r.rolId}-${r.permisoId}`, r])).values()
      );

      const existentes = await RolPermiso.findAll({
        where: {
          [db.Sequelize.Op.or]: relacionesUnicas
        }
      });

      const existentesSet = new Set(existentes.map(r => `${r.rolId}-${r.permisoId}`));

      const nuevos = relacionesUnicas.filter(r =>
        !existentesSet.has(`${r.rolId}-${r.permisoId}`)
      );

      if (nuevos.length === 0) {
        return res.status(409).send({ message: "Todas las relaciones ya existen." });
      }

      const creados = await RolPermiso.bulkCreate(nuevos);
      res.status(201).send({
        message: "Relaciones creadas exitosamente.",
        creadas: creados
      });
    } catch (err) {
      console.error("Error en createMany:", err);
      res.status(500).send({
        message: "Error al crear múltiples relaciones.",
        error: err.message
      });
    }
  }

  async create(req, res) {
    const { rolId, permisoId } = req.body;

    if (!rolId || !permisoId) {
      return res.status(400).json({ message: "rolId y permisoId son obligatorios." });
    }

    try {
      const existing = await RolPermiso.findOne({ where: { rolId, permisoId } });

      if (existing) {
        return res.status(400).json({ message: "La relación rol-permiso ya existe." });
      }

      const nuevaRelacion = await RolPermiso.create({ rolId, permisoId });

      return res.status(201).json({
        message: "Relación rol-permiso creada exitosamente.",
        rolPermiso: nuevaRelacion
      });
    } catch (err) {
      console.error("Error en create:", err);
      return res.status(500).json({ message: "Error al crear la relación rol-permiso.", error: err.message });
    }
  }

  async findAll(req, res) {
    try {
      const relaciones = await RolPermiso.findAll({
        include: [
          { model: Rol, as: 'rol',attributes: ["id", "nombre"] },
          { model: Permiso, as: 'permiso',attributes: ["id", "nombre"] }
        ]
      });
      return res.status(200).json(relaciones);
    } catch (err) {
      console.error("Error en findAll:", err);
      return res.status(500).json({ message: "Error al obtener las relaciones rol-permiso.", error: err.message });
    }
  }

  async findOne(req, res) {
    const { rolId, permisoId } = req.params;

    if (!rolId || !permisoId) {
      return res.status(400).json({ message: "rolId y permisoId son requeridos como parámetros." });
    }

    try {
      const relacion = await RolPermiso.findOne({
        where: { rolId, permisoId },
        include: [
          { model: Rol, as:'rol',attributes: ["id", "nombre"] },
          { model: Permiso, as: 'permiso', attributes: ["id", "nombre"] }
        ]
      });

      if (!relacion) {
        return res.status(404).json({ message: "Relación rol-permiso no encontrada." });
      }

      return res.status(200).json(relacion);
    } catch (err) {
      console.error("Error en findOne:", err);
      return res.status(500).json({ message: "Error al obtener la relación.", error: err.message });
    }
  }

  async delete(req, res) {
    const { rolId, permisoId } = req.params;

    if (!rolId || !permisoId) {
      return res.status(400).json({ message: "rolId y permisoId son requeridos como parámetros." });
    }

    try {
      const deleted = await RolPermiso.destroy({ where: { rolId, permisoId } });

      if (deleted === 1) {
        return res.json({ message: "Relación eliminada exitosamente." });
      } else {
        return res.status(404).json({ message: "Relación no encontrada." });
      }
    } catch (err) {
      console.error("Error en delete:", err);
      return res.status(500).json({ message: "Error al eliminar la relación.", error: err.message });
    }
  }
}

module.exports = RolPermisoController;
