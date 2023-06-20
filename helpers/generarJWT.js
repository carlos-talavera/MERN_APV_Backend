import jwt from 'jsonwebtoken';

// Generar un JSON Web Token que funcione como sesión
const generarJWT = (id) => {

    return jwt.sign({
        id
    }, 
    process.env.JWT_SECRET, {
        expiresIn: "30d"
    });

}

export default generarJWT;