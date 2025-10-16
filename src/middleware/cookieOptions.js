const {NODE_ENV } = require("../config/config.js");
const isProduction = NODE_ENV === "production";

module.exports = {
  httpOnly: true,
  secure: isProduction, 
  sameSite: isProduction ? "none" : "lax",
  path: "/", 
};
