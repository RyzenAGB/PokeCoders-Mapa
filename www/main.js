// Función para mostrar el panel con información y animar el mapa
function mostrarInfo(id) {
    const lugar = universidadData[id];
    const panel = document.getElementById('info-panel');
    
    if (lugar) {
        // 1. Llenar el panel con la información de datos.js
        document.getElementById('info-titulo').innerText = lugar.nombre;
        document.getElementById('info-descripcion').innerHTML = `
            <div class="info-item"><strong>Servicios:</strong> ${lugar.servicios}</div>
            <div class="info-item"><strong>Horario:</strong> ${lugar.horarios}</div>
            <div class="info-item"><strong>Contacto:</strong> ${lugar.contactos}</div>
        `;
        
        // 2. Abrir panel (la animación viene del CSS)
        panel.classList.add('visible');
        
        // 3. Animación visual en el mapa (resaltado temporal)
        const elementoMapa = document.getElementById(id);
        if (elementoMapa) {
            elementoMapa.classList.add('highlight-lugar');
            setTimeout(() => elementoMapa.classList.remove('highlight-lugar'), 2000);
        }
    }
}

// Buscador por Nombre y Palabras Clave
function buscarServicio() {
    const input = document.getElementById('buscador').value.toLowerCase().trim();
    if (input === "") return;

    // Buscamos en el objeto universidadData
    const encontradoId = Object.keys(universidadData).find(id => {
        const data = universidadData[id];
        return data.nombre.toLowerCase().includes(input) || 
               data.palabrasClave.toLowerCase().includes(input);
    });

    if (encontradoId) {
        mostrarInfo(encontradoId);
        // Opcional: Centrar el mapa en el elemento (si el SVG es muy grande)
        document.getElementById(encontradoId).scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
        alert("No encontramos resultados para '" + input + "'. Prueba con otra palabra.");
    }
}

// Inicialización de clics
document.addEventListener("DOMContentLoaded", () => {
    // Asignar evento click a cada ID que exista en universidadData
    Object.keys(universidadData).forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.style.cursor = "pointer";
            el.addEventListener('click', () => mostrarInfo(id));
        }
    });

    // Cerrar panel al deslizar hacia abajo (handle)
    document.querySelector('.panel-handle').onclick = () => {
        document.getElementById('info-panel').classList.remove('visible');
    };
});
