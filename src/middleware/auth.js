const jwt = require('jsonwebtoken');
const { SECRET_JWT_KEY } = require('../config/config');

const verifyToken = (req, res, next) => {
  const token = req.cookies.access_token; 

  if (!token) {
    return res.status(403).json({ message: "No autorizado, token no encontrado." });
  }

  try {
    const data = jwt.verify(token, SECRET_JWT_KEY);
    req.user = data;
    next();
  } catch (err) {
    console.error("Error al verificar el token:", err.message);
    return res.status(401).json({ message: "Token inválido." });
  }
};

module.exports = verifyToken;
