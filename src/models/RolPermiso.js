const { Model, DataTypes } = require('sequelize');

class RolPermiso extends Model {
  get RolPermiso() {
    return `${this.getDataValue('rolId')} - ${this.getDataValue('permisoId')}`;
  }
  set RolId(newRolId) {
    this.setDataValue('rolId', newRolId);
  }
  set PermisoId(newPermisoId) {
    this.setDataValue('permisoId', newPermisoId);
  }
}

module.exports = (sequelize) => {
  RolPermiso.init(
    {
      rolId: {
        type: DataTypes.BIGINT,       
        allowNull: false,
        primaryKey: true,              
        references: { model: 'ROLES', key: 'ID' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      permisoId: {
        type: DataTypes.BIGINT,       
        allowNull: false,
        primaryKey: true,              
        references: { model: 'PERMISOS', key: 'ID' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
    },
    {
      sequelize,
      modelName: 'RolPermiso',
      tableName: 'ROL_PERMISO',   
      timestamps: true,
      underscored: true,          
      indexes: [
      ],
    }
  );

  return RolPermiso;
};
