const Sequelize = require('sequelize');
const dbConfig = require('../config/db.config.js');

class Database {
  constructor() {
    this._sequelize = new Sequelize(
      dbConfig.DB,
      dbConfig.USER,
      dbConfig.PASSWORD,
      {
        host: dbConfig.HOST,
        port: dbConfig.PORT,
        dialect: dbConfig.dialect,
        port: dbConfig.PORT,
        pool: dbConfig.pool,
        dialectOptions: {
          ssl: {
            require: true,
            rejectUnauthorized: false
          }
        },
        logging: false 
      }
    );

    this.Sequelize = Sequelize;
    this.models = {};

    this._loadModels();
    this._associateModels();
  }

  _loadModels() {
    const sequelize = this._sequelize;

    // Cargar modelos
    this.models.Usuario = require('./Usuario.js')(sequelize);
    this.models.Rol = require('./Rol.js')(sequelize);
    this.models.Permiso = require('./Permiso.js')(sequelize);
    this.models.UsuarioRol = require('./UsuarioRol.js')(sequelize);
    this.models.RolPermiso = require('./RolPermiso.js')(sequelize);
    }


  _associateModels() {
    const { Usuario, Rol, Permiso, UsuarioRol, RolPermiso } = this.models;

    // Relaciones Usuario <-> Rol
    Usuario.belongsToMany(Rol, { through: UsuarioRol, foreignKey: 'usuarioId' });
    Rol.belongsToMany(Usuario, { through: UsuarioRol, foreignKey: 'rolId' });

    // Relaciones Rol <-> Permiso
    Rol.belongsToMany(Permiso, { through: RolPermiso, foreignKey: 'rolId' });
    Permiso.belongsToMany(Rol, { through: RolPermiso, foreignKey: 'permisoId' });
  }

  get sequelize() {
    return this._sequelize;
  }

  getModel(name) {
    return this.models[name];
  }
}

module.exports = new Database();
