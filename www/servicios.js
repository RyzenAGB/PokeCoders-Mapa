function toggle(id) {
    const card = document.getElementById(id);
    const isOpen = card.classList.contains('open');
    document.querySelectorAll('.service-card').forEach(c => c.classList.remove('open'));
    if (!isOpen) card.classList.add('open');
}

// Guarda el destino y redirige al mapa
function irAlMapa(id, svgX, svgY, zoom) {
    sessionStorage.setItem('mapaDestino', JSON.stringify({ id, svgX, svgY, zoom }));
    window.location.href = 'index.html';
}