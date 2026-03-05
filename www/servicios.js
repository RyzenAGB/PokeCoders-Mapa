function toggle(id) {
    const card = document.getElementById(id);
    const isOpen = card.classList.contains('open');
    // Cerrar todas
    document.querySelectorAll('.service-card').forEach(c => c.classList.remove('open'));
    // Abrir la seleccionada si estaba cerrada
    if (!isOpen) card.classList.add('open');
}