document.addEventListener('DOMContentLoaded', () => {
    const edificios = document.querySelectorAll('.edificio-interactivo');
    const contenedorMensaje = document.getElementById('mensaje-seleccion');
    const textoMensaje = document.getElementById('nombre-seleccionado');
    
    edificios.forEach(edificio => {
        edificio.addEventListener('click', function(e) {
            e.preventDefault();

            // 1. Efecto visual de selección en el mapa
            edificios.forEach(b => b.classList.remove('seleccionado'));
            this.classList.add('seleccionado');
            
            // 2. Vibración suave
            if (window.navigator.vibrate) {
                window.navigator.vibrate(50);
            }

            // 3. ✨ ACTUALIZAR EL MENSAJE FLOTANTE ✨
            const id = this.id;
            const datos = universidadData[id]; // Buscamos la info del edificio tocado
            
            if (datos) {
                // Si existe en datos.js, mostramos su nombre
                textoMensaje.innerText = datos.nombre;
                contenedorMensaje.classList.remove('mensaje-oculto'); // Lo hacemos visible
                
                // (Opcional) Ocultar el mensaje después de 3 segundos
                // setTimeout(() => { contenedorMensaje.classList.add('mensaje-oculto'); }, 3000);
            } else {
                // Si no hay datos (por si el Dev 2 agregó un edificio nuevo y Apoyo no lo ha llenado)
                textoMensaje.innerText = id.replace('_', ' '); // Ej: "Edificio_C" -> "Edificio C"
                contenedorMensaje.classList.remove('mensaje-oculto');
            }

            // 4. Llamar al Modal
            mostrarInfo(id);
        });
    });
});

// --- FUNCIONES DEL MODAL ---
function mostrarInfo(idEdificio) {
    // Extrae la información de datos.js basado en el ID tocado
    const datos = universidadData[idEdificio]; 
    
    if(datos) {
        document.getElementById('modal-titulo').innerText = datos.nombre;
        document.getElementById('modal-servicios').innerText = datos.servicios;
        document.getElementById('modal-contacto').innerText = datos.contactos;
        document.getElementById('modal-horarios').innerText = datos.horarios;
        
        document.getElementById('modal-info').classList.add('activo'); // Sube el modal
    } else {
        console.warn("Faltan datos en datos.js para el ID: " + idEdificio);
    }
}

function cerrarModal() {
    document.getElementById('modal-info').classList.remove('activo'); // Baja el modal
}

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