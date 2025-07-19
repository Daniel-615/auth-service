const dotenv = require('dotenv');
dotenv.config();
const { APP_PORT = 3000 } = process.env;
const { 
  HOST,USER,PASSWORD,DB,PORT,SECRET_JWT_KEY,
  FRONTEND_URL,BACKEND_URL,EMAIL_PASSWORD,EMAIL_USER
}= process.env;

module.exports = {
  APP_PORT,
  HOST,
  USER,
  PASSWORD,
  DB,
  PORT,
  SALT_ROUNDS:10,
  SECRET_JWT_KEY,
  FRONTEND_URL,
  BACKEND_URL,
  EMAIL_PASSWORD,
  EMAIL_USER
};