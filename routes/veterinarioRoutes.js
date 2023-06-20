import express from 'express';
import { 
    registrar, 
    perfil, 
    confirmar, 
    autenticar,
    olvidePassword,
    comprobarToken,
    nuevoPassword,
    actualizarPerfil,
    actualizarPassword
} from '../controllers/veterinarioController.js';
import checkAuth from '../middleware/authMiddleware.js';

const router = express.Router();

// Páginas públicas (sin cuenta)
router.post('/', registrar);
router.get('/confirmar/:token', confirmar);
router.post('/login', autenticar);
router.post('/olvide-password', olvidePassword); // Enviar email para nuevo password

// Forma corta para una misma URL con métodos distintos
router.route('/olvide-password/:token').get(comprobarToken).post(nuevoPassword);

/*
// Forma larga para una misma URL con métodos distintos
router.get('/olvide-password/:token', comprobarToken); // Validar token para nuevo password
router.post('/olvide-password/:token', nuevoPassword); // Establecer nuevo password
*/

// Páginas privadas (con cuenta) - Utiliza un middleware propio (checkAuth) para checar que el usuario
// esté autenticado
router.get('/perfil', checkAuth, perfil);
router.put('/perfil/:id', checkAuth, actualizarPerfil);
router.put('/actualizar-password', checkAuth, actualizarPassword);

export default router;