import jwt from 'jsonwebtoken';
import Veterinario from '../models/Veterinario.js';

const checkAuth = async (req, res, next) => {

    let token;

    // Validar que el usuario esté autenticado
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {

        try {

            // Validar token
            token = req.headers.authorization.split(' ')[1];

            // Decodificar el token (que contiene el ID del registro en la BD)
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Obtener el veterinario por ID sin los campos de password, token y confirmado
            // (información sensible)
            // Guardarlo en la petición de Express para de esa forma tener disponible la sesión
            // en todas las páginas
            req.veterinario = await Veterinario.findById(decoded.id).select(
                "-password -token -confirmado"
            );
            return next();
            
        } catch (err) {

            const error = new Error('Token no válido');
            res.status(403).json({ msg: error.message });
            
        }

    }

    if (!token) {

        const error = new Error('Token no válido o inexistente');
        res.status(403).json({ msg: error.message });

    }

    next();

}

export default checkAuth;