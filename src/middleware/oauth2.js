const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const { OAUTH2_CLIENT_ID, OAUTH2_CLIENT_SECRET, BACKEND_URL } = require("../config/config");
const db = require("../models");
const Usuario = db.getModel("Usuario");
const bcrypt = require("bcrypt");
passport.use(
  new GoogleStrategy({
      clientID: OAUTH2_CLIENT_ID,
      clientSecret: OAUTH2_CLIENT_SECRET,
      callbackURL: `${BACKEND_URL}/api/usuario/auth/google/callback`
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