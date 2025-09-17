const { Model, DataTypes, Sequelize } = require('sequelize');

class Rol extends Model {
  // Getters
  get Nombre() {
    return this.getDataValue('nombre');
  }
  // Setters
  set Nombre(newNombre) {
    this.setDataValue('nombre', newNombre);
  }
}

module.exports = (sequelize) => {
  Rol.init(
    {
      id: {
        type: DataTypes.BIGINT,      
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,         
      },
      nombre: {
        type: DataTypes.STRING(100), 
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: true,
          len: [1, 100],
        },
      },
    },
    {
      sequelize,
      modelName: 'Rol',       
      tableName: 'ROLES',     
      timestamps: true,       
      underscored: true,      
      indexes: [
        { unique: true, fields: ['nombre'] },
      ],
    }
  );

  return Rol;
};
