import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import conectarDB from './config/db.js';
import veterinarioRoutes from './routes/veterinarioRoutes.js';
import pacienteRoutes from './routes/pacienteRoutes.js';

const app = express();
app.use(express.json()); // Habilitar soporte para la lectura de datos de tipo JSON
dotenv.config();

conectarDB();

// Configurar CORS
const dominiosPermitidos = [process.env.FRONTEND_URL];

const corsOptions = {
    origin: function(origin, callback) {

        if (dominiosPermitidos.indexOf(origin) !== -1) {

            // El origen de la petición está permitido
            callback(null, true);

        } else {

            callback(new Error('No permitido por CORS'));

        }

    }
}

// Indicarle a la app que use las opciones especificadas de CORS
app.use(cors(corsOptions));

app.use('/api/veterinarios', veterinarioRoutes);
app.use('/api/pacientes', pacienteRoutes);

const port = process.env.PORT || 4000;

app.listen(port, () => {

    console.log(`Servidor funcionando en el puerto ${port}`);

});