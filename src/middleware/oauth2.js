const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const { OAUTH2_CLIENT_ID, OAUTH2_CLIENT_SECRET, CALL_BACK_URL} = require("../config/config");
const db = require("../models");
const Usuario = db.getModel("Usuario");
const bcrypt = require("bcrypt");
const UsuarioRol = db.getModel("UsuarioRol");
passport.use(
  new GoogleStrategy({
      clientID: OAUTH2_CLIENT_ID,
      clientSecret: OAUTH2_CLIENT_SECRET,
      callbackURL: `${CALL_BACK_URL.replace(/\/+$/, "")}/api-gateway/usuario/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        let user = await Usuario.findOne({ where: { email: email } });

        if (!user) {
            const hashedDummyPassword = await bcrypt.hash(crypto.randomUUID(), 10);
            user = await Usuario.create({
                nombre: profile.name.givenName,
                apellido: profile.name.familyName || "",
                email: email,
                password: hashedDummyPassword,
                status: true
            });
        }
        //Asignar rol de CLIENTE (rolId: 2) si no existe
        const rolExistente = await UsuarioRol.findOne({
          where: { usuarioId: user.id, rolId: 2 }
        });

        if (!rolExistente) {
          await UsuarioRol.create({
            usuarioId: user.id,
            rolId: 2
          });
        }

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  const user = await Usuario.findByPk(id);
  done(null, user);
});

module.exports = passport;