const { Model, DataTypes } = require('sequelize');

class Permiso extends Model {
  get Nombre() {
    return this.getDataValue('nombre');
  }
  set Nombre(newNombre) {
    this.setDataValue('nombre', newNombre);
  }
}

module.exports = (sequelize) => {
  Permiso.init(
    {
      id: {
        type: DataTypes.BIGINT,        
        primaryKey: true,
        allowNull: false,
        autoIncrement: true           
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
      modelName: 'Permiso',
      tableName: 'PERMISOS',   
      timestamps: true,       
      underscored: true,       
      indexes: [
        { unique: true, fields: ['nombre'] },
      ],
    }
  );

  return Permiso;
};
