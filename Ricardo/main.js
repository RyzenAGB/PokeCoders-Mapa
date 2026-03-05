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
