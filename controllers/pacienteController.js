import Paciente from '../models/Paciente.js';

// Agregar paciente
const agregarPaciente = async (req, res) => {

    const paciente = new Paciente(req.body);
    // Colocarle al paciente la referencia del veterinario que está logueado
    paciente.veterinario = req.veterinario._id;

    try {

        // Almacenar en la BD
        const pacienteAlmacenado = await paciente.save();
        res.json(pacienteAlmacenado);
        
    } catch (error) {

        console.error(error);
    
    }

}

// Obtener pacientes asociados con un veterinario
const obtenerPacientes = async (req, res) => {

    const pacientes = await Paciente.find()
        .where('veterinario')
        .equals(req.veterinario);

    res.json(pacientes);

}

// Obtener un paciente en específico
const obtenerPaciente = async (req, res) => {

    const { id } = req.params;
    const paciente = await Paciente.findById(id);

    // Revisar que exista el paciente
    if (!paciente) {

        return res.status(404).json({ msg: "No encontrado" });

    }

    // Validar que el usuario autenticado tenga acceso a ese paciente
    if (paciente.veterinario._id.toString() !== req.veterinario._id.toString()) {

        return res.json({msg: "Acción no válida"});

    }

    res.json(paciente);

}

// Actualizar información de un paciente
const actualizarPaciente = async (req, res) => {

    const { id } = req.params;
    const paciente = await Paciente.findById(id);

    // Revisar que exista el paciente
    if (!paciente) {

        return res.status(404).json({ msg: "No encontrado" });

    }

    // Validar que el usuario autenticado tenga acceso a ese paciente
    if (paciente.veterinario._id.toString() !== req.veterinario._id.toString()) {

        return res.json({ msg: "Acción no válida" });

    }

    // Actualizar paciente
    paciente.nombre = req.body.nombre ?? paciente.nombre;
    paciente.propietario = req.body.propietario ?? paciente.propietario;
    paciente.fecha = req.body.fecha ?? paciente.fecha;
    paciente.email = req.body.email ?? paciente.email;
    paciente.sintomas = req.body.sintomas ?? paciente.sintomas;

    try {

        const pacienteActualizado = await paciente.save();
        res.json(pacienteActualizado);
        
    } catch (error) {

        console.error(error);
        
    }

}
// Eliminar un paciente
const eliminarPaciente = async (req, res) => {

    const { id } = req.params;
    const paciente = await Paciente.findById(id);

    // Revisar que exista el paciente
    if (!paciente) {

        return res.status(404).json({ msg: "No encontrado" });

    }

    // Validar que el usuario autenticado tenga acceso a ese paciente
    if (paciente.veterinario._id.toString() !== req.veterinario._id.toString()) {

        return res.json({ msg: "Acción no válida" });

    }

    try {

        await paciente.deleteOne();
        res.json({ msg: "Paciente eliminado" });
        
    } catch (error) {

        console.error(error);
        
    }

}

export {
    
    agregarPaciente,
    obtenerPacientes,
    obtenerPaciente,
    actualizarPaciente,
    eliminarPaciente

}