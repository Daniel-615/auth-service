const { Model, DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');
const { SALT_ROUNDS } = require('../config/config');
class Usuario extends Model {
    //Getters
    get FullName() {
        return `${this.nombre} ${this.apellido}`;
    }
    get Status(){
        return `${this.status ? 'Activo' : 'Inactivo'}`;
    }
    get Email(){
        return this.email;
    }
    async isValid(password, passwordHash){
      const value= await bcrypt.compare(password, passwordHash);
      return value;
    }
    //Setters
    set Password(newPassword) {
        const hashedPassword = bcrypt.hashSync(newPassword, SALT_ROUNDS);
        this.password = hashedPassword;
        console.log(`Contraseña actualizada para el usuario ${this.FullName}`);
    }
    
    set Email(newEmail){
        this.email=newEmail;
    }
    set Status(newStatus) {
        this.status = newStatus;
    }
    set Nombre(newNombre) {
        this.nombre = newNombre;
    }
    set Apellido(newApellido) {
        this.apellido = newApellido;
    }
    
   
}

module.exports = (sequelize) => {
  Usuario.init(
    {
      nombre: {
        type: DataTypes.STRING,
        allowNull: false
      },
      apellido: {
        type: DataTypes.STRING
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false
      },
      status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },
      id:{
        type:DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      refreshToken:{
        type: DataTypes.TEXT,
        allowNull: true
      },
      resetToken: {
        type: DataTypes.STRING,
        allowNull: true
      }
    },
    {
      sequelize,
      modelName: 'usuario',
      tableName: 'usuarios',
      timestamps: true
    }
  );

  return Usuario;
};
