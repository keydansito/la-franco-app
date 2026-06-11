// 1. Botón de Farmacia de Turno
document.getElementById('btn-turno').addEventListener('click', async () => {
    try {
        const respuesta = await fetch('http://localhost:3000/turno');
        const datos = await respuesta.json();

        const tarjetaTurno = document.getElementById('btn-turno');
        tarjetaTurno.innerHTML = `
            <div class="card-icon icon-turno"><i class="fa-solid fa-house-medical"></i></div>
            <div class="card-text">
                <h3>${datos.farmacias_de_turno_ahora}</h3>
                <p>📍 ${datos.direccion} (${datos.nota})</p>
            </div>
        `;
    } catch (error) {
        alert("No se pudo conectar con el servidor de turnos.");
    }
});

// 2. Botón de Consulta de Puntos
document.getElementById('btn-puntos').addEventListener('click', async () => {
    const dni = document.getElementById('input-dni').value;
    const displayResultado = document.getElementById('resultado-puntos');

    if (!dni) {
        alert("Por favor, ingresá un DNI.");
        return;
    }

    try {
        const respuesta = await fetch(`http://localhost:3000/puntos?dni=${dni}`);
        const datos = await respuesta.json();

        displayResultado.classList.remove('hidden');

        if (datos.error) {
            displayResultado.innerHTML = `
                <p style="color: #ef4444;"><i class="fa-solid fa-circle-xmark"></i> ${datos.error}</p>
                <span style="font-size: 11px; color: #94a3b8;">${datos.motivo || ''}</span>
            `;
        } else {
            displayResultado.innerHTML = `
                <p style="color: #38bdf8; font-weight: 700;">¡Hola, ${datos.nombre_cliente || 'Usuario'}!</p>
                <p style="font-size: 18px; margin-top: 5px;">Tienes: <strong style="color: #10b981;">${datos.puntos_disponibles || datos.puntos}</strong> puntos</p>
                <span style="font-size: 11px; color: #94a3b8;">Categoría: ${datos.tarjeta || 'Fidely Digital'}</span>
            `;
        }
    } catch (error) {
        alert("Error al conectar con el servidor de puntos.");
    }
});