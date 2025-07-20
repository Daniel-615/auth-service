const db = require("../models");
const UsuarioRol = db.getModel("UsuarioRol");

class UsuarioRolController {
    async create(req, res) {
        const { usuarioId, rolId } = req.body;

        if (!usuarioId || !rolId) {
        return res.status(400).json({ message: "usuarioId y rolId son obligatorios." });
        }

        try {
        const existente = await UsuarioRol.findOne({ where: { usuarioId, rolId } });

        if (existente) {
            return res.status(409).json({ message: "La relación usuario-rol ya existe." });
        }

        const nuevaRelacion = await UsuarioRol.create({ usuarioId, rolId });

        return res.status(201).json({
            message: "Relación usuario-rol creada exitosamente.",
            usuarioRol: nuevaRelacion
        });
        } catch (err) {
        console.error("Error en create:", err);
        return res.status(500).json({
            message: "Error al crear la relación usuario-rol.",
            error: err.message
        });
        }
    }

    async findAll(req, res) {
        try {
        const relaciones = await UsuarioRol.findAll();
        return res.json(relaciones);
        } catch (err) {
        console.error("Error en findAll:", err);
        return res.status(500).json({
            message: "Error al obtener las relaciones usuario-rol.",
            error: err.message
        });
        }
    }

    async findOne(req, res) {
        const { usuarioId, rolId } = req.params;

        if (!usuarioId || !rolId) {
        return res.status(400).json({ message: "usuarioId y rolId son requeridos como parámetros." });
        }

        try {
        const relacion = await UsuarioRol.findOne({ where: { usuarioId, rolId } });

        if (!relacion) {
            return res.status(404).json({ message: "Relación usuario-rol no encontrada." });
        }

        return res.json(relacion);
        } catch (err) {
        console.error("Error en findOne:", err);
        return res.status(500).json({
            message: "Error al obtener la relación.",
            error: err.message
        });
        }
    }

    async delete(req, res) {
        const { usuarioId, rolId } = req.params;

        if (!usuarioId || !rolId) {
        return res.status(400).json({ message: "usuarioId y rolId son requeridos como parámetros." });
        }

        try {
        const deleted = await UsuarioRol.destroy({ where: { usuarioId, rolId } });

        if (deleted === 1) {
            return res.json({ message: "Relación eliminada exitosamente." });
        } else {
            return res.status(404).json({ message: "Relación no encontrada." });
        }
        } catch (err) {
        console.error("Error en delete:", err);
        return res.status(500).json({
            message: "Error al eliminar la relación.",
            error: err.message
        });
        }
    }
}

module.exports = UsuarioRolController;
