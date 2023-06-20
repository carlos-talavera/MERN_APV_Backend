import Veterinario from '../models/Veterinario.js';
import generarJWT from '../helpers/generarJWT.js';
import generarID from '../helpers/generarID.js';
import emailRegistro from '../helpers/emailRegistro.js';
import emailOlvidePassword from '../helpers/emailOlvidePassword.js';

// Registrar veterinario
const registrar = async (req, res) => {

    const { email, nombre } = req.body;

    // Prevenir usuarios duplicados

    const existeUsuario = await Veterinario.findOne({email: email});

    if (existeUsuario) {

        const error = new Error('Usuario ya registrado');
        return res.status(400).json({msg: error.message});

    }

    try {

        // Guardar un Nuevo Veterinario

        const veterinario = new Veterinario(req.body);
        const veterinarioGuardado = await veterinario.save();

        // Enviar email para confirmar cuenta (importante colocarlo después de guardarlo en la BD)
        emailRegistro({
            email,
            nombre,
            token: veterinarioGuardado.token
        });

        res.json(veterinarioGuardado);
        
    } catch (error) {

        console.error(error);
        
    }

};

// Mostrar perfil
const perfil = (req, res) => {

    const { veterinario } = req;

    res.json(veterinario);

}

// Confirmar cuenta
const confirmar = async (req, res) => {

    // Leer token
    const { token } = req.params;

    const usuarioConfirmar = await Veterinario.findOne({token});

    if (!usuarioConfirmar) {

        const error = new Error('Token no válido');
        return res.status(404).json({msg: error.message});

    }

    try {

        usuarioConfirmar.token = null;
        usuarioConfirmar.confirmado = true; // Marcar cuenta como confirmada

        await usuarioConfirmar.save(); // Guardar cambios en la BD

        res.json({
            msg: "Usuario Confirmado Correctamente"
        });
        
    } catch (error) {

        console.error(error);
        
    }

}

// Autenticar veterinario
const autenticar = async (req, res) => {

    const { email, password } = req.body;

    // Comprobar si el usuario existe
    const usuario = await Veterinario.findOne({email});

    if (!usuario) {

        const error = new Error('Usuario no registrado');
        return res.status(403).json({ msg: error.message });

    }

    // Comprobar si el usuario está confirmado
    if (!usuario.confirmado) {

        const error = new Error('Tu cuenta no ha sido confirmada');
        return res.status(403).json({ msg: error.message });

    }

    // Autenticar al usuario
    
    // Revisar si el password es correcto
    if (await usuario.comprobarPassword(password)) {

        // Crear sesión
        res.json({
            _id: usuario._id,
            nombre: usuario.nombre,
            email: usuario.email,
            token: generarJWT(usuario.id)
        });

    } else {

        const error = new Error('La contraseña es incorrecta');
        return res.status(403).json({ msg: error.message });

    }

}

// Enviar email para establecer nuevo password
const olvidePassword = async (req, res) => {

    const { email } = req.body;

    const existeVeterinario = await Veterinario.findOne({email});
    
    // Verificar que exista el veterinario
    if (!existeVeterinario) {

        const error = new Error('El usuario no existe');
        return res.status(400).json({msg: error.message});

    }

    try {

        existeVeterinario.token = generarID();
        await existeVeterinario.save();

        // Enviar email para restablecer contraseña (importante colocarlo después de guardarlo en la BD)
        emailOlvidePassword({
            email,
            nombre: existeVeterinario.nombre,
            token: existeVeterinario.token
        });

        res.json({msg: "Hemos enviado un email con las instrucciones"});
        
    } catch (error) {

        console.error(error);
        
    }

}

// Comprobar el token para URL de establecimiento de nuevo password
const comprobarToken = async (req, res) => {

    const { token } = req.params;

    const tokenValido = await Veterinario.findOne({token});

    if (tokenValido) {

        // El token es válido, el usuario existe

        res.json({msg: "Token válido y el usuario existe"});

    } else {

        const error = new Error('Token no válido');
        return res.status(400).json({msg: error.message});

    }

}

// Cambiar password del veterinario
const nuevoPassword = async (req, res) => {

    const { token } = req.params;
    const { password } = req.body;

    const veterinario = await Veterinario.findOne({token});

    if (!veterinario) {

        const error = new Error('Token no válido');
        return res.status(400).json({msg: error.message});

    }

    try {

        // Eliminar token de la BD para que no pueda volver a usarse
        veterinario.token = null;
        veterinario.password = password;

        if (!veterinario.confirmado) {

            veterinario.confirmado = true;

        }

        await veterinario.save();
        res.json({msg: "Contraseña modificada correctamente"});
        
    } catch (error) {

        console.error(error);
        
    }

}

// Actualizar perfil
const actualizarPerfil = async (req, res) => {

    const veterinario = await Veterinario.findById(req.params.id);

    if (!veterinario) {

        const error = new Error('Hubo un error');
        return res.status(400).json({msg: error.message});

    }

    const { nombre, email, web, telefono } = req.body;

    if (veterinario.email !== email) {

        const existeEmail = await Veterinario.findOne({email});

        if (existeEmail) {

            const error = new Error('Ese email ya está en uso');
            return res.status(400).json({msg: error.message});

        }

    }

    try {

        veterinario.nombre = nombre;
        veterinario.email = email;
        veterinario.web = web;
        veterinario.telefono = telefono;

        const veterinarioActualizado = await veterinario.save();
        res.json(veterinarioActualizado);
        
    } catch (error) {

        console.error(error);
        
    }

}

// Actualizar contraseña desde el panel de administración
const actualizarPassword = async (req, res) => {

    // Leer los datos

    const { id } = req.veterinario;
    const { pwd_actual, pwd_nuevo } = req.body;

    // Comprobar que el veterinario existe

    const veterinario = await Veterinario.findById(id);

    if (!veterinario) {

        const error = new Error('Hubo un error');
        return res.status(400).json({ msg: error.message });

    }

    // Comprobar su password

    if (!await veterinario.comprobarPassword(pwd_actual)) {
        
        const error = new Error('Contraseña actual incorrecta');
        return res.status(400).json({ msg: error.message })

    }

    // Almacenar el nuevo password

    try {

        veterinario.password = pwd_nuevo;
        await veterinario.save();
        return res.json({msg: 'Contraseña actualizada correctamente'});
        
    } catch (err) {

        const error = new Error('Hubo un error');
        return res.status(400).json({ msg: error.message });
        
    }

}

export {

    registrar,
    perfil,
    confirmar,
    autenticar,
    olvidePassword,
    comprobarToken,
    nuevoPassword,
    actualizarPerfil,
    actualizarPassword

}