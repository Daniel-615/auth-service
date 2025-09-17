const { HOST, USER, PASSWORD, DB, DB_PORT } = require('./config.js');

class DBConfig {
  constructor() {
    this.HOST = HOST;          
    this.USER = USER;          
    this.PASSWORD = PASSWORD;  
    this.DB = DB;              
    this.PORT = DB_PORT || 1521;


    this.dialect = "oracle";


    this.dialectOptions = {
      connectString: `${this.HOST}:${this.PORT}/${this.DB}`, 
    };

    this.pool = {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    };
  }

  getConfig() {
    return {
      username: this.USER,
      password: this.PASSWORD,
      dialect: this.dialect,
      dialectOptions: this.dialectOptions,
      pool: this.pool
    };
  }
}

module.exports = new DBConfig().getConfig();
