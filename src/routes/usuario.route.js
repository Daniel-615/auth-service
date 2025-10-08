const express = require("express");
const UsuarioController = require("../controllers/usuario.controller.js");
const verifyToken = require('../middleware/auth.js');
const passport = require('../middleware/oauth2.js'); 
const { checkPermisosDesdeRoles } = require('../middleware/checkRole.js');

class UsuarioRoutes {
  constructor(app) {
    this.router = express.Router();
    this.controller = new UsuarioController();
    this.registerRoutes();
    app.use("/auth-service/usuario", this.router);
  }

  registerRoutes() {
    /**
     * @openapi
     * tags:
     *   - name: Usuario
     *     description: Autenticación y gestión de usuarios
     * components:
     *   schemas:
     *     Usuario:
     *       type: object
     *       properties:
     *         id: { type: integer, example: 42 }
     *         nombre: { type: string, example: "Susy Garcia" }
     *         email: { type: string, format: email, example: "susy@example.com" }
     *         activo: { type: boolean, example: true }
     *         roles:
     *           type: array
     *           items: { type: string }
     *           example: ["admin","empleado"]
     *         createdAt: { type: string, format: date-time }
     *         updatedAt: { type: string, format: date-time }
     *     LoginInput:
     *       type: object
     *       required: [email, password]
     *       properties:
     *         email: { type: string, format: email }
     *         password: { type: string, format: password }
     *       example:
     *         email: "user@mail.com"
     *         password: "secret123"
     *     RegisterInput:
     *       type: object
     *       required: [nombre, email, password]
     *       properties:
     *         nombre: { type: string }
     *         email: { type: string, format: email }
     *         password: { type: string, format: password }
     *     UpdateUsuarioInput:
     *       type: object
     *       properties:
     *         nombre: { type: string }
     *         email: { type: string, format: email }
     *         password: { type: string, format: password }
     *     TokenPair:
     *       type: object
     *       properties:
     *         accessToken: { type: string }
     *         refreshToken: { type: string }
     *     ForgotPasswordInput:
     *       type: object
     *       required: [email]
     *       properties:
     *         email: { type: string, format: email }
     *     ResetPasswordInput:
     *       type: object
     *       required: [token, newPassword]
     *       properties:
     *         token: { type: string }
     *         newPassword: { type: string, format: password }
     *     VerifyResponse:
     *       type: object
     *       properties:
     *         valid: { type: boolean, example: true }
     *         user:
     *           $ref: '#/components/schemas/Usuario'
     *     MessageResponse:
     *       type: object
     *       properties:
     *         message: { type: string }
     *     ErrorResponse:
     *       type: object
     *       properties:
     *         error: { type: string }
     */

    /**
     * @openapi
     * /auth-service/usuario/login:
     *   post:
     *     summary: Iniciar sesión (email/password)
     *     tags: [Usuario]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema: { $ref: '#/components/schemas/LoginInput' }
     *     responses:
     *       200:
     *         description: Usuario autenticado (cookies httpOnly o tokens según implementación)
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 user: { $ref: '#/components/schemas/Usuario' }
     *                 tokens: { $ref: '#/components/schemas/TokenPair' }
     *       401:
     *         description: Credenciales inválidas
     *         content:
     *           application/json:
     *             schema: { $ref: '#/components/schemas/ErrorResponse' }
     */
    this.router.post("/login", (req, res) => {
      this.controller.login(req, res);
    });

    /**
     * @openapi
     * /auth-service/usuario/register:
     *   post:
     *     summary: Registrar usuario (self-service)
     *     tags: [Usuario]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema: { $ref: '#/components/schemas/RegisterInput' }
     *     responses:
     *       201:
     *         description: Usuario registrado
     *         content:
     *           application/json:
     *             schema: { $ref: '#/components/schemas/Usuario' }
     *       400:
     *         description: Solicitud inválida
     *       500:
     *         description: Error al registrar el usuario
     */
    this.router.post("/register", (req, res) => {
      try {
        this.controller.create(req, res);
      } catch (err) {
        console.error(`Error al registrar el usuario: ${err.message}`);
        res.status(500).send({ message: "Error al registrar el usuario" });
      }
    });

    /**
     * @openapi
     * /auth-service/usuario/register-admin:
     *   post:
     *     summary: Registrar usuario (admin) con asignación de rol
     *     tags: [Usuario]
     *     security:
     *       - cookieAuth: []
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema: { $ref: '#/components/schemas/RegisterInput' }
     *     responses:
     *       201:
     *         description: Usuario creado por admin
     *         content:
     *           application/json:
     *             schema: { $ref: '#/components/schemas/Usuario' }
     *       401: { description: No autenticado }
     *       403: { description: Sin permisos }
     */
    this.router.post(
      "/register-admin",
      verifyToken,
      checkPermisosDesdeRoles(["asignar_roles"]),
      (req, res) => {
        this.controller.create(req, res);
      }
    );

    /**
     * @openapi
     * /auth-service/usuario/logout:
     *   post:
     *     summary: Cerrar sesión (invalida refresh y limpia cookies)
     *     tags: [Usuario]
     *     security:
     *       - cookieAuth: []
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Sesión cerrada
     *         content:
     *           application/json:
     *             schema: { $ref: '#/components/schemas/MessageResponse' }
     *       401: { description: No autenticado }
     */
    this.router.post("/logout", verifyToken, checkPermisosDesdeRoles(["logout_usuario"]),(req, res) => {
      try {
        this.controller.logout(req, res);
      } catch (err) {
        console.error(`Error al cerrar sesión: ${err.message}`);
        res.status(500).send({ message: "Error al cerrar sesión" });
      }
    });

    /**
     * @openapi
     * /auth-service/usuario/refreshToken:
     *   post:
     *     summary: Renovar access token (usa cookie o body según implementación)
     *     tags: [Usuario]
     *     responses:
     *       200:
     *         description: Token renovado
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 accessToken: { type: string }
     *       401:
     *         description: Refresh inválido o expirado
     */
    this.router.post("/refreshToken", (req, res) => {
      this.controller.refreshToken(req, res);
    });

    /**
     * @openapi
     * /auth-service/usuario/forgot-password:
     *   post:
     *     summary: Enviar correo de restablecimiento
     *     tags: [Usuario]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema: { $ref: '#/components/schemas/ForgotPasswordInput' }
     *     responses:
     *       200:
     *         description: Instrucciones enviadas
     *         content:
     *           application/json:
     *             schema: { $ref: '#/components/schemas/MessageResponse' }
     *       404:
     *         description: Email no registrado
     */
    this.router.post("/forgot-password", async (req, res) => {
      try {
        await this.controller.sendResetPassword(req, res);
      } catch (err) {
        console.error(`Error al procesar solicitud de restablecimiento de contraseña: ${err.message}`);
        res.status(500).send({ message: "Error interno del servidor" });
      }
    });

    /**
     * @openapi
     * /auth-service/usuario/reset-password:
     *   post:
     *     summary: Restablecer contraseña con token
     *     tags: [Usuario]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema: { $ref: '#/components/schemas/ResetPasswordInput' }
     *     responses:
     *       200:
     *         description: Contraseña restablecida
     *         content:
     *           application/json:
     *             schema: { $ref: '#/components/schemas/MessageResponse' }
     *       400:
     *         description: Token inválido o expirado
     */
    this.router.post("/reset-password", (req, res) => {
      try {
        this.controller.resetPassword(req, res);
      } catch (err) {
        console.error(`Error al procesar restablecimiento: ${err.message}`);
        res.status(500).send({ message: "Error interno del servidor" });
      }
    });

    /**
     * @openapi
     * /auth-service/usuario/verifyToken:
     *   get:
     *     summary: Verificar token/estado de sesión
     *     tags: [Usuario]
     *     security:
     *       - cookieAuth: []
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Token válido
     *         content:
     *           application/json:
     *             schema: { $ref: '#/components/schemas/VerifyResponse' }
     *       401: { description: Token inválido/ausente }
     */
    this.router.get("/verifyToken",verifyToken,(req,res)=>{
      this.controller.verifyRefreshToken(req,res);
    });

    /**
     * @openapi
     * /auth-service/usuario/{id}:
     *   put:
     *     summary: Actualizar usuario
     *     tags: [Usuario]
     *     security:
     *       - cookieAuth: []
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         schema: { type: integer }
     *         required: true
     *         description: ID del usuario
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema: { $ref: '#/components/schemas/UpdateUsuarioInput' }
     *     responses:
     *       200:
     *         description: Usuario actualizado
     *         content:
     *           application/json:
     *             schema: { $ref: '#/components/schemas/Usuario' }
     *       401: { description: No autenticado }
     *       403: { description: Sin permisos }
     *       404: { description: No encontrado }
     */
    this.router.put("/:id", verifyToken,checkPermisosDesdeRoles(["actualizar_usuario"]), (req, res) => {
      this.controller.update(req, res);
    });

    /**
     * @openapi
     * /auth-service/usuario/deactivateAccount/{id}:
     *   post:
     *     summary: Desactivar cuenta de usuario
     *     tags: [Usuario]
     *     security:
     *       - cookieAuth: []
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         schema: { type: integer }
     *         required: true
     *         description: ID del usuario
     *     responses:
     *       200:
     *         description: Cuenta desactivada
     *         content:
     *           application/json:
     *             schema: { $ref: '#/components/schemas/MessageResponse' }
     *       401: { description: No autenticado }
     *       403: { description: Sin permisos }
     *       404: { description: No encontrado }
     */
    this.router.post("/deactivateAccount/:id", verifyToken, checkPermisosDesdeRoles(["desactivar_cuenta"]),(req, res) => {
      this.controller.deactivateAccount(req, res);
    });

    /**
     * @openapi
     * /auth-service/usuario/findOne/{id}:
     *   get:
     *     summary: Obtener un usuario por ID
     *     tags: [Usuario]
     *     security:
     *       - cookieAuth: []
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         schema: { type: integer }
     *         required: true
     *     responses:
     *       200:
     *         description: Usuario encontrado
     *         content:
     *           application/json:
     *             schema: { $ref: '#/components/schemas/Usuario' }
     *       401: { description: No autenticado }
     *       403: { description: Sin permisos }
     *       404: { description: No encontrado }
     */
    this.router.get("/findOne/:id", verifyToken, checkPermisosDesdeRoles(["ver_usuario"]),(req, res) => {
      this.controller.findOne(req, res);
    });

    /**
     * @openapi
     * /auth-service/usuario/findAll:
     *   get:
     *     summary: Listar usuarios
     *     tags: [Usuario]
     *     security:
     *       - cookieAuth: []
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Lista de usuarios
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items: { $ref: '#/components/schemas/Usuario' }
     *       401: { description: No autenticado }
     *       403: { description: Sin permisos }
     */
    this.router.get("/findAll", verifyToken, checkPermisosDesdeRoles(["ver_usuarios"]),(req, res) => {
      this.controller.findAll(req, res);
    });

    /**
     * @openapi
     * /auth-service/usuario/findAllActivos:
     *   get:
     *     summary: Listar usuarios activos
     *     tags: [Usuario]
     *     security:
     *       - cookieAuth: []
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Lista de usuarios activos
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items: { $ref: '#/components/schemas/Usuario' }
     *       401: { description: No autenticado }
     *       403: { description: Sin permisos }
     */
    this.router.get("/findAllActivos", verifyToken,checkPermisosDesdeRoles(["ver_usuarios_activos"]), (req, res) => {
      this.controller.findAllActivos(req, res);
    });

    /**
     * @openapi
     * /auth-service/usuario/{id}:
     *   delete:
     *     summary: Eliminar usuario
     *     tags: [Usuario]
     *     security:
     *       - cookieAuth: []
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         schema: { type: integer }
     *         required: true
     *     responses:
     *       204: { description: Eliminado sin contenido }
     *       401: { description: No autenticado }
     *       403: { description: Sin permisos }
     *       404: { description: No encontrado }
     */
    this.router.delete("/:id", verifyToken,checkPermisosDesdeRoles(["eliminar_usuario"]), (req, res) => {
      this.controller.delete(req, res);
    });

    /**
     * @openapi
     * /auth-service/usuario/auth/google:
     *   get:
     *     summary: Iniciar OAuth2 con Google (redirect)
     *     tags: [Usuario]
     *     responses:
     *       302:
     *         description: Redirección a Google OAuth
     */
    this.router.get("/auth/google", passport.authenticate("google", {
      scope: ["profile", "email"]
    }));

    /**
     * @openapi
     * /auth-service/usuario/auth/google/callback:
     *   get:
     *     summary: Callback de Google OAuth2
     *     tags: [Usuario]
     *     responses:
     *       302:
     *         description: Redirección a frontend con sesión iniciada
     *       401:
     *         description: Falló la autenticación con Google
     */
    this.router.get(
      "/auth/google/callback",
      passport.authenticate("google", {
        session: false,
        failureRedirect: "/api/usuario/login",
      }),
      (req, res) => this.controller.googleCallBackHandler(req, res)
    );
  }
}

module.exports = UsuarioRoutes;
