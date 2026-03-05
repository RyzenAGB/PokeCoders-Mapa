// Función única para mostrar la información
function mostrarInfo(id) {
    const lugar = universidadData[id];
    const panel = document.getElementById('info-panel');

    if (lugar) {
        // 1. Llenar el panel con los datos de datos.js
        document.getElementById('info-titulo').innerText = lugar.nombre;
        document.getElementById('info-descripcion').innerHTML = `
            <div class="info-item"><strong>Servicios:</strong> ${lugar.servicios}</div>
            <div class="info-item"><strong>Horario:</strong> ${lugar.horarios}</div>
            <div class="info-item"><strong>Contacto:</strong> ${lugar.contactos}</div>
        `;

        // 2. Mostrar el panel con la animación CSS
        panel.classList.add('visible');

        // 3. Efecto de resaltado visual en el SVG
        const elementoMapa = document.getElementById(id);
        if (elementoMapa) {
            elementoMapa.classList.add('highlight-lugar');
            setTimeout(() => elementoMapa.classList.remove('highlight-lugar'), 2000);
        }
    } else {
        console.warn("No se encontraron datos en datos.js para el ID:", id);
    }
}

// Lógica del buscador por palabras clave
function buscarServicio() {
    const input = document.getElementById('buscador').value.toLowerCase().trim();
    if (input === "") return;

    const encontradoId = Object.keys(universidadData).find(id => {
        const data = universidadData[id];
        return data.nombre.toLowerCase().includes(input) ||
               data.palabrasClave.toLowerCase().includes(input);
    });

    if (encontradoId) {
        mostrarInfo(encontradoId);

        // Hacer scroll suave hacia el edificio en el mapa
        const el = document.getElementById(encontradoId);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
        }
    } else {
        alert("No se encontró: " + input);
    }
}

// Buscar también al presionar Enter en el input
document.addEventListener("DOMContentLoaded", () => {
    const buscadorInput = document.getElementById('buscador');
    if (buscadorInput) {
        buscadorInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') buscarServicio();
        });
    }

    // Asignar clics a los filtros rápidos
    const filtros = {
        "Aulas":      "Edificio_B",
        "Baños":      "Baños_Vec",
        "Cafetería":  "Cafetería",
        "Caja":       "Edificio_A"
    };
    document.querySelectorAll('.filter-chip').forEach(chip => {
        const texto = chip.textContent.trim();
        if (filtros[texto]) {
            chip.style.cursor = "pointer";
            chip.addEventListener('click', () => mostrarInfo(filtros[texto]));
        }
    });

    // Asignar clics a los grupos del SVG que tengan datos definidos
    Object.keys(universidadData).forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.style.cursor = "pointer";

            // Agregar evento al grupo y a todos sus hijos (paths)
            el.addEventListener('click', (e) => {
                e.stopPropagation();
                mostrarInfo(id);
            });

            // Asegurar que los paths internos también disparen el clic del grupo
            el.querySelectorAll('path, rect, circle, polygon').forEach(child => {
                child.style.cursor = "pointer";
                child.addEventListener('click', (e) => {
                    e.stopPropagation();
                    mostrarInfo(id);
                });
            });
        } else {
            console.warn(`Elemento SVG no encontrado para ID: "${id}" — revisa que coincida exactamente con el SVG.`);
        }
    });

    // Cerrar el panel al hacer clic en la barra gris superior (handle)
    const handle = document.querySelector('.panel-handle');
    if (handle) {
        handle.style.cursor = "pointer";
        handle.onclick = () => {
            document.getElementById('info-panel').classList.remove('visible');
        };
    }

    // Cerrar el panel al hacer clic fuera de él
    document.addEventListener('click', (e) => {
        const panel = document.getElementById('info-panel');
        if (panel.classList.contains('visible') && !panel.contains(e.target)) {
            // Verificar que no se hizo clic en un elemento del mapa
            const esMapa = e.target.closest('#vista-mapa');
            if (!esMapa) {
                panel.classList.remove('visible');
            }
        }
    });
});