import mongoose from 'mongoose';

const pacienteSchema = mongoose.Schema({
    nombre: {
        type: String,
        required: true
    },
    propietario: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    fecha: {
        type: Date,
        required: true,
        default: Date.now()
    },
    sintomas: {
        type: String,
        required: true
    },
    veterinario: {
        type: mongoose.Types.ObjectId,
        ref: "Veterinario"
    }
}, {
    timestamps: true // Campos de editado y creado
});

const Paciente = mongoose.model('Paciente', pacienteSchema);
export default Paciente;