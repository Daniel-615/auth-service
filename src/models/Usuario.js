const { Model, DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');
const { SALT_ROUNDS } = require('../config/config');

class Usuario extends Model {
  // Getters
  get FullName() {
    return `${this.getDataValue('nombre')} ${this.getDataValue('apellido')}`;
  }

  get Status() {
    return this.getDataValue('status') ? 'Activo' : 'Inactivo';
  }

  async isValid(password) {
    return bcrypt.compare(password, this.getDataValue('password'));
  }
}

module.exports = (sequelize) => {
  Usuario.init(
    {
      id: {
        type: DataTypes.STRING(36),         
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      nombre: {
        type: DataTypes.STRING(100),          
        allowNull: false,
      },
      apellido: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      email: {
        type: DataTypes.STRING(150),
        allowNull: false,
        unique: true,
        validate: { isEmail: true },
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      status: {
        type: DataTypes.INTEGER,              
        defaultValue: 1,                     
        get() {
          return this.getDataValue('status') === 1;
        },
        set(value) {
          this.setDataValue('status', value ? 1 : 0);
        },
      },
      refreshToken: {
        type: DataTypes.CLOB,                 
        allowNull: true,
      },
      resetToken: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'Usuario',
      tableName: 'USUARIOS',                 
      timestamps: true,
      underscored: true,                      
      hooks: {
        beforeCreate: async (usuario) => {
          if (usuario.password) {
            usuario.password = await bcrypt.hash(usuario.password, SALT_ROUNDS);
          }
        },
        beforeUpdate: async (usuario) => {
          if (usuario.changed('password')) {
            usuario.password = await bcrypt.hash(usuario.password, SALT_ROUNDS);
          }
        },
      },
    }
  );

  return Usuario;
};
