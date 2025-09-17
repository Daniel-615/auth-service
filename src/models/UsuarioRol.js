const { Model, DataTypes } = require('sequelize');

class UsuarioRol extends Model {
  get UsuarioRol() {
    return `${this.getDataValue('usuarioId')} - ${this.getDataValue('rolId')}`;
  }
  set UsuarioId(newUsuarioId) {
    this.setDataValue('usuarioId', newUsuarioId);
  }
  set RolId(newRolId) {
    this.setDataValue('rolId', newRolId);
  }
}

module.exports = (sequelize) => {
  UsuarioRol.init(
    {
      usuarioId: {
        type: DataTypes.STRING(36),        
        allowNull: false,
        primaryKey: true,               
        references: { model: 'USUARIOS', key: 'ID' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      rolId: {
        type: DataTypes.BIGINT,             
        allowNull: false,
        primaryKey: true,                
        references: { model: 'ROLES', key: 'ID' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
    },
    {
      sequelize,
      modelName: 'UsuarioRol',
      tableName: 'USUARIO_ROL',         
      timestamps: true,
      underscored: true,                   
    }
  );

  return UsuarioRol;
};
