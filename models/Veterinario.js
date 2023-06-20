import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import generarID from '../helpers/generarID.js';

const veterinarioSchema = mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    telefono: {
        type: String,
        default: null,
        trim: true
    },
    web: {
        type: String,
        default: null
    },
    token: {
        type: String,
        default: generarID()
    },
    confirmado: {
        type: Boolean,
        default: false
    }
});

veterinarioSchema.pre('save', async function(next) { // Usar function() para que this sea el objeto
    // del registro a guardar

    // Ir al siguiente middleware si el password no ha sido modificado, ya que eso significa
    // que otros campos están siendo actualizados
    if (!this.isModified('password')) {

        next();

    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);

});

// Ejecutar métodos específicamente en este schema
veterinarioSchema.methods.comprobarPassword = async function(passwordFormulario) {

    return await bcrypt.compare(passwordFormulario, this.password);

}

const Veterinario = mongoose.model("Veterinario", veterinarioSchema);
export default Veterinario;