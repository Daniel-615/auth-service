const { Sequelize } = require('sequelize');
const dbConfig = require('../config/db.config.js');

class Database {
  constructor() {
    this._sequelize = new Sequelize({
      username: dbConfig.username,
      password: dbConfig.password,
      dialect: dbConfig.dialect,             
      dialectOptions: dbConfig.dialectOptions, 
      pool: dbConfig.pool,
      logging: false,                        
      define: {
        underscored: true,                    
      },
    });

    this.Sequelize = Sequelize;
    this.models = {};

    this._loadModels();
    this._associateModels();
  }

  _loadModels() {
    const sequelize = this._sequelize;

    //carga modelos
    this.models.Usuario      = require('./Usuario.js')(sequelize);
    this.models.Rol          = require('./Rol.js')(sequelize);
    this.models.Permiso      = require('./Permiso.js')(sequelize);
    this.models.UsuarioRol   = require('./UsuarioRol.js')(sequelize);
    this.models.RolPermiso   = require('./RolPermiso.js')(sequelize);
  }

  _associateModels() {
    const { Usuario, Rol, Permiso, UsuarioRol, RolPermiso } = this.models;

    // --- Usuario <-> Rol (N:M) via UsuarioRol ---
    Usuario.belongsToMany(Rol, {
      through: UsuarioRol,
      foreignKey: 'usuarioId',   // FK en la tabla puente apuntando a USUARIOS.ID
      otherKey: 'rolId',
      as: 'roles',
      onDelete: 'CASCADE',
    });
    Rol.belongsToMany(Usuario, {
      through: UsuarioRol,
      foreignKey: 'rolId',       // FK en la tabla puente apuntando a ROLES.ID
      otherKey: 'usuarioId',
      as: 'usuarios',
      onDelete: 'CASCADE',
    });

    // (Opcional) Relaciones 1:N para facilitar includes
    Usuario.hasMany(UsuarioRol, {
      foreignKey: 'usuarioId',
      as: 'usuario_roles',
      onDelete: 'CASCADE',
      hooks: true,
    });
    UsuarioRol.belongsTo(Usuario, {
      foreignKey: 'usuarioId',
      as: 'usuario',
    });
    Rol.hasMany(UsuarioRol, {
      foreignKey: 'rolId',
      as: 'rol_usuarios',
    });
    UsuarioRol.belongsTo(Rol, {
      foreignKey: 'rolId',
      as: 'rol',
    });

    // --- Rol <-> Permiso (N:M) via RolPermiso ---
    Rol.belongsToMany(Permiso, {
      through: RolPermiso,
      foreignKey: 'rolId',
      otherKey: 'permisoId',
      as: 'permisos',
      onDelete: 'CASCADE',
    });
    Permiso.belongsToMany(Rol, {
      through: RolPermiso,
      foreignKey: 'permisoId',
      otherKey: 'rolId',
      as: 'roles',
      onDelete: 'CASCADE',
    });

    // (Opcional) Relaciones 1:N para facilitar includes
    RolPermiso.belongsTo(Rol, {
      foreignKey: 'rolId',
      as: 'rol',
    });
    RolPermiso.belongsTo(Permiso, {
      foreignKey: 'permisoId',
      as: 'permiso',
    });
  }

  get sequelize() {
    return this._sequelize;
  }

  getModel(name) {
    return this.models[name];
  }
}

module.exports = new Database();
