class ValidationUser{
    static userName(username,res){
        if(typeof username !=='string' || username.trim()===''){
            return res
            .status(400)
            .send({
                message: "El nombre de usuario es obligatorio y debe ser una cadena de texto."
            })
        }
        if(username.length < 3 ){
            return res
            .status(400)
            .send({
                message: "El nombre de usuario debe tener al menos 3 caracteres."
            })
        }
    }
    static email(email,res){
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if(!emailRegex.test(email)){
            return res
            .status(400)
            .send({
                message: "El correo electrónico no es válido."
            })
        }
    }
    static password(password,res){
        if(typeof password !== 'string' || password.trim() === ''){
            return res
            .status(400)
            .send({
                message:"La contraseña es obligatoria y debe ser una cadena de texto."
            })
        }
        if(password.length < 6){
            return res
            .status(400)
            .send({
                message: "La contraseña debe tener al menos 6 caracteres."
            })
        }
    }
}
module.exports = ValidationUser;