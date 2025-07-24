const db = require("../models");

function checkPermisosDesdeRoles(permisosRequeridos = []) {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ message: "No autenticado." });
      }

      // Buscar al usuario con sus roles y permisos (usando alias definidos en Database.js)
      const usuario = await db.getModel("Usuario").findByPk(req.user.id, {
        include: {
          model: db.getModel("Rol"),
          as: "roles",
          include: {
            model: db.getModel("Permiso"),
            as: "Permisos"
          }
        }
      });

      if (!usuario) {
        return res.status(404).json({ message: "Usuario no encontrado." });
      }

      // Extraer permisos del usuario a partir de sus roles
      const permisosDelUsuario = usuario.roles.flatMap(rol =>
        rol.Permisos.map(p => p.nombre)
      );

      // Verificar si tiene todos los permisos requeridos
      const tienePermiso = permisosRequeridos.every(p =>
        permisosDelUsuario.includes(p)
      );

      if (!tienePermiso) {
        return res.status(403).json({
          message: "Acceso denegado: no tienes los permisos requeridos.",
          permisosDelUsuario,
          permisosRequeridos
        });
      }

      next();
    } catch (err) {
      console.error("Error en middleware de permisos:", err.message);
      res.status(500).json({ message: "Error interno al verificar permisos." });
    }
  };
}

module.exports = {
  checkPermisosDesdeRoles
};
