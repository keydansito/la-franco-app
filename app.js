// REQUERIMOS LAS HERRAMIENTAS
require('dotenv').config(); // Activa la lectura del archivo secreto .env
const express = require('express');
const axios = require('axios'); // Nuestro nuevo motor para hacer llamadas a internet
const cors = require('cors'); // Requerimos CORS de forma limpia

// INICIALIZAMOS EL SERVIDOR (¡Primero creamos la app!)
const app = express();
const PORT = process.env.PORT || 3000;

// ACTIVAMOS LOS PERMISOS (Ahora que 'app' ya existe, le asignamos CORS)
app.use(cors()); // Esto le dice al servidor: "Aceptá peticiones de mi propia compu"
app.use(express.static(__dirname)); // Le dice a Node que comparta el HTML, CSS y JS con el mundo

// 1. Ruta de bienvenida
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// 2. Sistema de turnos inteligente (El que ya probamos y funciona genial)
app.get('/turno', (req, res) => {
    const fechaHoy = new Date();
    let numeroDiaParaTurno = fechaHoy.getDate(); 
    const horaActual = fechaHoy.getHours(); 

    if (horaActual < 9) {
        numeroDiaParaTurno = numeroDiaParaTurno - 1;
    }

    const cronogramaMensual = {
        8: { nombre: "La Franco Gregores y Farmacia Moderna", direccion: "Av. Gregores" },
        9: { nombre: "La Franco San Benito y Farmacia Moderna", direccion: "Calle 13 y 22" },
        10: { nombre: "La Franco del Sur - Sucursal Central", direccion: "Av. Kirchner 1234" } // Sumamos el día de hoy
    };

    const farmaciaDeTurnoHoy = cronogramaMensual[numeroDiaParaTurno];

    if (!farmaciaDeTurnoHoy) {
        return res.json({ error: "Cronograma no actualizado." });
    }

    res.json({
        hora_de_consulta: `${horaActual}:${fechaHoy.getMinutes()} hs`,
        farmacias_de_turno_ahora: farmaciaDeTurnoHoy.nombre,
        direccion: farmaciaDeTurnoHoy.direccion,
        nota: "Turno vigente de 21:00 hs a 09:00 hs."
    });
});


// 3. CONEXIÓN REAL CON LA API DE FIDELY (Usando Axios)
// Prueba local: http://localhost:3000/puntos?dni=1234
app.get('/puntos', async (req, res) => {
    const dniCliente = req.query.dni;

    if (!dniCliente) {
        return res.json({ error: "Falta el parámetro DNI en la consulta." });
    }

    try {
        // Configuramos la llamada hacia internet usando Axios.
        // Mandamos el DNI del cliente en la URL y las llaves secretas en los HEADERS (cabeceras ocultas)
        const respuestaFidely = await axios.get(`https://fidely.online/api/v1/customers/${dniCliente}`, {
            headers: {
                'X-Client-Id': process.env.FIDELY_CLIENT_ID,
                'X-Client-Secret': process.env.FIDELY_CLIENT_SECRET
            }
        });

        // Si Fidely encuentra al cliente, nos va a devolver sus datos.
        // Agarramos esa respuesta y se la mandamos limpita a tu aplicación móvil.
        res.json({
            conexion: "Exitosa con Fidely",
            dni: dniCliente,
            nombre_cliente: respuestaFidely.data.nombre, // Cambia según los campos reales de Fidely
            puntos_disponibles: respuestaFidely.data.puntos
        });

    } catch (error) {
        // Si las credenciales son de prueba (falsas) o el servidor de Fidely falla, va a saltar acá:
        console.log("Error al conectar con Fidely:", error.message);
        
        res.status(500).json({
            error: "No se pudo obtener los puntos desde Fidely",
            motivo: "Credenciales de prueba o cliente inexistente",
            detalle_tecnico: error.message
        });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor de La Franco App corriendo en http://localhost:${PORT}`);
});