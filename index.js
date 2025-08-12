const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { PORT,FRONTEND_URL } = require('./src/config/config.js')
const db = require('./src/models'); 
const cookieParser = require('cookie-parser');
const passport = require('./src/middleware/oauth2.js'); 
const UsuarioRoutes = require('./src/routes/usuario.route.js');
const RolRoutes = require('./src/routes/rol.route.js');
const PermisoRoutes = require('./src/routes/permiso.route.js'); 
const RolPermisoRoutes=require('./src/routes/rol.permiso.route.js')
const UsuarioRolRoutes = require('./src/routes/usuario.rol.route.js');
class Server {
  constructor() {
    this.app = express();
    this.port = PORT;
    this.app.use(cookieParser()); // Middleware para manejar cookies
    this.app.use(express.json()); // Middleware para parsear JSON
    this.app.use(passport.initialize());
    this.configureMiddlewares();
    this.configureRoutes();
    this.connectDatabase();
  }

  configureMiddlewares() {
    this.app.use(cors({
      origin: FRONTEND_URL,
      credentials: true // Permitir cookies y credenciales
    }));
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({ extended: true }));
  }

  configureRoutes() {
    new UsuarioRoutes(this.app); // Instancia las rutas de Usuario
    new RolRoutes(this.app); // Instancia las rutas de Rol
    new PermisoRoutes(this.app); // Instancia las rutas de Permiso
    new RolPermisoRoutes(this.app); // Instancia las rutas de Rol-Permiso
    new UsuarioRolRoutes(this.app); // Instancia las rutas de Usuario-Rol
  }

  async connectDatabase() {
    try {
      await db.sequelize.sync({alter: true}); // o sync({ force: true }) si estás en desarrollo
      console.log('Base de datos conectada y sincronizada.');

      const tables = await db.sequelize.getQueryInterface().showAllTables();
      console.log('Tablas en la base de datos:', tables);
    } catch (error) {
      console.error('Error al conectar con la base de datos:', error);
    }
  }

  start() {
    this.app.listen(this.port, () => {
      console.log(`Servidor corriendo en el puerto ${this.port}`);
    });
  }
}

const server = new Server();
server.start();
