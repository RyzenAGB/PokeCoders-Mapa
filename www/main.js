const datosEdificios = {
    "Edificio_C": {
        titulo: "Edificio C - Aulas",
        desc: "Principal bloque de salones de clases y cubículos de profesores.",
        color: "#C88D4A"
    },
    "Edificio_B": {
        titulo: "Edificio B - Laboratorios",
        desc: "Aquí se encuentran los laboratorios de ingeniería y ciencias básicas.",
        color: "#40832F"
    },
    "Biblioteca": {
        titulo: "Biblioteca Central",
        desc: "Área de estudio silencioso, préstamos de libros y centro de cómputo.",
        color: "#A02E60"
    },
    "Edificio_E": {
        titulo: "Edificio E - Rectoría",
        desc: "Oficinas administrativas, servicios escolares y tesorería.",
        color: "#914AC8"
    }
    // Agrega aquí todos los IDs que tienes en tu SVG
};

document.addEventListener('DOMContentLoaded', () => {
    // Buscamos todos los elementos dentro del grupo "Mapa_Uni_Vec" que tengan un ID
    const elementosMapa = document.querySelectorAll('#Mapa_Uni_Vec [id]');

    elementosMapa.forEach(el => {
        // Agregamos la clase para que el cursor cambie y tenga efectos
        el.classList.add('edificio-interactivo');

        el.addEventListener('click', function() {
            const idClick = this.id;
            mostrarInfo(idClick);
            
            // Efecto visual de selección
            elementosMapa.forEach(path => path.classList.remove('seleccionado'));
            this.classList.add('seleccionado');
            
            if (window.navigator.vibrate) window.navigator.vibrate(40);
        });
    });
});


// --- FUNCIONES DE REALIDAD AUMENTADA ---
function activarAR() {
    document.getElementById('vista-mapa').style.display = 'none';
    document.querySelector('.search-container').style.display = 'none';
    document.getElementById('vista-ar').style.display = 'block';
    
    const btn = document.querySelector('.fab-ar');
    btn.innerHTML = '⬅ Volver al Mapa';
    btn.style.background = 'var(--azul-uni)';
    btn.onclick = desactivarAR;
}

function desactivarAR() {
    document.getElementById('vista-mapa').style.display = 'flex';
    document.querySelector('.search-container').style.display = 'flex';
    document.getElementById('vista-ar').style.display = 'none';
    
    const btn = document.querySelector('.fab-ar');
    btn.innerHTML = '📷 Escanear Mapa';
    btn.style.background = 'var(--teal-uni)';
    btn.onclick = activarAR;
}

// --- FUNCIÓN DEL BUSCADOR ---
function buscarServicio() {
    const busqueda = document.getElementById('buscador').value.toLowerCase();
    alert("Buscando: " + busqueda);
}

function mostrarInfo(id) {
    const panel = document.getElementById('info-panel');
    const titulo = document.getElementById('info-titulo');
    const desc = document.getElementById('info-descripcion');
    
    const info = datosEdificios[id];

    if (info) {
        titulo.innerText = info.titulo;
        desc.innerText = info.desc;
        titulo.style.color = info.color;
        panel.classList.add('visible');
    } else {
        // Si el ID no está en nuestro diccionario, mostramos algo genérico
        titulo.innerText = "Lugar: " + id.replace('_', ' ');
        desc.innerText = "Información detallada próximamente.";
        panel.classList.add('visible');
    }
}

function cerrarPanel() {
    document.getElementById('info-panel').classList.remove('visible');
    document.querySelectorAll('.edificio-interactivo').forEach(el => el.classList.remove('seleccionado'));
}