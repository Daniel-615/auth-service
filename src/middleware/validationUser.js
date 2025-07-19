class ValidationUser{
    static userName(username){
        if(typeof username !=='string' || username.trim()===''){
            throw new Error("El nombre de usuario es obligatorio y debe ser una cadena de texto.");
        }
        if(username.length < 3 ){
            throw new Error("El nombre de usuario debe tener al menos 3 caracteres.");
        }
    }
    static email(email){
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if(!emailRegex.test(email)){
            throw new Error("El correo electrónico no es válido.");
        }
    }
    static password(password){
        if(typeof password !== 'string' || password.trim() === ''){
            throw new Error("La contraseña es obligatoria y debe ser una cadena de texto.");
        }
        if(password.length < 6){
            throw new Error("La contraseña debe tener al menos 6 caracteres.");
        }
    }
}
module.exports = ValidationUser;