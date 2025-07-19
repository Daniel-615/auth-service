const { BACKEND_URL, EMAIL_PASSWORD, EMAIL_USER } = require("../config/config.js");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASSWORD
  }
});

async function enviarCorreoRecuperacion(destinatario, token) {
  const resetLink = `${BACKEND_URL}/api/usuario/reset-password?token=${token}`;

  try {
    const info = await transporter.sendMail({
      from: `"Soporte" <${EMAIL_USER}>`,
      to: destinatario,
      subject: "Restablecer contraseña",
      html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; background-color: #f4f4f4; border-radius: 8px;">
            <div style="background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
              <h2 style="color: #333333; text-align: center;">Restablecer tu contraseña</h2>
              <p style="font-size: 16px; color: #555555;">
                Hola, hemos recibido una solicitud para restablecer tu contraseña. Si no realizaste esta solicitud, puedes ignorar este mensaje.
              </p>
              <p style="font-size: 16px; color: #555555;">
                Haz clic en el siguiente botón para restablecer tu contraseña:
              </p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetLink}" 
                  style="padding: 12px 24px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
                  Restablecer contraseña
                </a>
              </div>
              <p style="font-size: 14px; color: #999999; text-align: center;">
                Este enlace expirará en 15 minutos.
              </p>
            </div>
            <p style="font-size: 12px; color: #aaaaaa; text-align: center; margin-top: 20px;">
              © ${new Date().getFullYear()} Tu Aplicación. Todos los derechos reservados.
            </p>
          </div>
        `

    });

    console.log("Correo de recuperación enviado: %s", info.messageId);
  } catch (error) {
    console.error("Error al enviar el correo:", error.message);
    throw new Error("No se pudo enviar el correo de recuperación.");
  }
}

module.exports = { enviarCorreoRecuperacion };
