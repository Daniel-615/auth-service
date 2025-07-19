const jwt = require("jsonwebtoken");
const { SECRET_JWT_KEY,NODE_ENV} = require("../config/config.js");
function generarTokensYEnviar(usuario, res) {
  const accessToken = jwt.sign(
    { id: usuario.id, email: usuario.email },
    SECRET_JWT_KEY,
    { expiresIn: "1h" }
  );

  const refreshToken = jwt.sign(
    { id: usuario.id, email: usuario.email },
    SECRET_JWT_KEY,
    { expiresIn: "7d" }
  );

  usuario.refreshToken = refreshToken;

  return usuario.save().then(() => {
    res
      .cookie("access_token", accessToken, {
        httpOnly: true,
        secure: NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 1000 // 1 hora
      })
      .cookie("refresh_token", refreshToken, {
        httpOnly: true,
        secure: NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 días
      });
  });
}
module.exports={
  generarTokensYEnviar
}