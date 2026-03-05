const botones = ['Edificio_E', 'Areas_Verdes', 'Edificio_C'];
const textoPantalla = document.getElementById('mensaje');

botones.forEach(id => {
    const elemento = document.getElementById(id);
    
    elemento.addEventListener('click', function(e) {
        // Prevenir comportamiento por defecto de click en algunos navegadores móviles
        e.preventDefault();

        const color = this.getAttribute('fill');
        textoPantalla.innerText = `Has seleccionado: ${id.replace('_', ' ')}`;
        textoPantalla.style.color = color;

        // Feedback visual de selección
        botones.forEach(b => document.getElementById(b).classList.remove('seleccionado'));
        this.classList.add('seleccionado');
        
        // Feedback háptico (si el dispositivo lo permite)
        if (window.navigator.vibrate) {
            window.navigator.vibrate(50);
        }
    });
});

function mostrarInfo(idEdificio) {
      // 1. Obtener datos (Asegúrense de que universidadData exista en su datos.js)
      const datos = universidadData[idEdificio];
      
      if(datos) {
        // 2. Llenar los campos
        document.getElementById('modal-titulo').innerText = datos.nombre;
        document.getElementById('modal-servicios').innerText = datos.servicios;
        document.getElementById('modal-contacto').innerText = datos.contactos;
        document.getElementById('modal-horarios').innerText = datos.horarios;
        
        // 3. Deslizar el modal hacia arriba
        document.getElementById('modal-info').classList.add('activo');
      }
    }

    function cerrarModal() {
      // Deslizar el modal hacia abajo
      document.getElementById('modal-info').classList.remove('activo');
    }

    function activarAR() {
      // Ocultar mapa y buscador, mostrar cámara
      document.getElementById('vista-mapa').style.display = 'none';
      document.querySelector('.search-container').style.display = 'none';
      document.getElementById('vista-ar').style.display = 'block';
      
      // Cambiar la función del botón flotante para que ahora sirva para "Regresar"
      const btn = document.querySelector('.fab-ar');
      btn.innerHTML = '⬅ Volver al Mapa';
      btn.style.background = 'var(--azul-uni)';
      btn.onclick = desactivarAR;
    }

    function desactivarAR() {
      // Restaurar mapa y ocultar cámara
      document.getElementById('vista-mapa').style.display = 'flex';
      document.querySelector('.search-container').style.display = 'flex';
      document.getElementById('vista-ar').style.display = 'none';
      
      // Restaurar el botón original
      const btn = document.querySelector('.fab-ar');
      btn.innerHTML = '📷 Escanear Mapa';
      btn.style.background = 'var(--teal-uni)';
      btn.onclick = activarAR;
    }
    
    // Función vacía para el buscador (Dev 3 puede programar la lógica aquí)
    function buscarServicio() {
        alert("Buscando: " + document.getElementById('buscador').value);
    }