// ============================================================
//  PAN + ZOOM sobre SVG inline
//  El SVG tiene pointer-events: none; los clics se capturan
//  en el contenedor y se traducen a coordenadas SVG.
// ============================================================

const ZOOM_MIN = 0.3;
const ZOOM_MAX = 6;

let camX = 0, camY = 0, camScale = 1;
let wasDrag = false;

// ── Aplica la transformación al layer ──
function applyTransform(animated) {
    const layer = document.getElementById('mapa-layer');
    if (!layer) return;
    layer.style.transition = animated
        ? 'transform 0.35s cubic-bezier(0.25,0.46,0.45,0.94)'
        : 'none';
    layer.style.transform = `translate(${camX}px,${camY}px) scale(${camScale})`;
}

// ── Centra la vista en coordenadas SVG ──
function centrarEn(svgX, svgY, escala, animated) {
    const c = document.getElementById('vista-mapa');
    camScale = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, escala));
    camX = c.clientWidth  / 2 - svgX * camScale;
    camY = c.clientHeight / 2 - svgY * camScale;
    applyTransform(animated);
}

// ── Zoom desde un punto del contenedor ──
function zoomAt(cx, cy, factor) {
    const newScale = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, camScale * factor));
    camX = cx - (cx - camX) * (newScale / camScale);
    camY = cy - (cy - camY) * (newScale / camScale);
    camScale = newScale;
    applyTransform(false);
}

// ── Convierte coordenadas del contenedor → SVG ──
function containerToSVG(cx, cy) {
    return {
        x: (cx - camX) / camScale,
        y: (cy - camY) / camScale
    };
}

// ── Rueda de ratón ──
function initWheel() {
    const c = document.getElementById('vista-mapa');
    c.addEventListener('wheel', e => {
        e.preventDefault();
        const r = c.getBoundingClientRect();
        zoomAt(e.clientX - r.left, e.clientY - r.top, e.deltaY > 0 ? 0.85 : 1.18);
    }, { passive: false });
}

// ── Pan con ratón ──
function initMousePan() {
    const c = document.getElementById('vista-mapa');
    let down = false, sx, sy, scx, scy, moved;

    c.addEventListener('mousedown', e => {
        if (e.button !== 0) return;
        down = true; moved = false;
        sx = e.clientX; sy = e.clientY;
        scx = camX; scy = camY;
        c.style.cursor = 'grabbing';
        e.preventDefault();
    });
    window.addEventListener('mousemove', e => {
        if (!down) return;
        const dx = e.clientX - sx, dy = e.clientY - sy;
        if (Math.abs(dx) > 4 || Math.abs(dy) > 4) moved = true;
        camX = scx + dx; camY = scy + dy;
        applyTransform(false);
    });
    window.addEventListener('mouseup', () => {
        if (moved) { wasDrag = true; setTimeout(() => { wasDrag = false; }, 80); }
        down = false;
        c.style.cursor = 'grab';
    });

    // Cancelar clic si hubo arrastre
    c.addEventListener('click', e => {
        if (wasDrag) e.stopPropagation();
    }, true);
}

// ── Touch: pan (1 dedo) + pinch-zoom (2 dedos) ──
function initTouch() {
    const c = document.getElementById('vista-mapa');
    let t2active = false, scx, scy, startMx, startMy, lastDist, moved;

    function dist(a, b) { return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY); }

    c.addEventListener('touchstart', e => {
        e.preventDefault();
        moved = false;
        if (e.touches.length === 1) {
            t2active = false;
            scx = camX; scy = camY;
            startMx = e.touches[0].clientX;
            startMy = e.touches[0].clientY;
            lastDist = null;
        } else if (e.touches.length === 2) {
            t2active = true;
            lastDist = dist(e.touches[0], e.touches[1]);
        }
    }, { passive: false });

    c.addEventListener('touchmove', e => {
        e.preventDefault();
        if (e.touches.length === 1 && !t2active) {
            const dx = e.touches[0].clientX - startMx;
            const dy = e.touches[0].clientY - startMy;
            if (Math.abs(dx) > 4 || Math.abs(dy) > 4) moved = true;
            camX = scx + dx; camY = scy + dy;
            applyTransform(false);
        } else if (e.touches.length >= 2) {
            moved = true;
            const a = e.touches[0], b = e.touches[1];
            const r = c.getBoundingClientRect();
            const mx = (a.clientX + b.clientX) / 2 - r.left;
            const my = (a.clientY + b.clientY) / 2 - r.top;
            const d = dist(a, b);
            if (lastDist) zoomAt(mx, my, d / lastDist);
            lastDist = d;
        }
    }, { passive: false });

    c.addEventListener('touchend', e => {
        if (moved) { wasDrag = true; setTimeout(() => { wasDrag = false; }, 80); }
        if (e.touches.length < 2) { t2active = false; lastDist = null; }
    }, { passive: false });
}

// ── Detecta qué edificio fue tocado usando getBBox() ──
// Convierte el punto del toque a coordenadas SVG y comprueba
// si cae dentro del bounding box de cada grupo.
function detectarEdificio(containerX, containerY) {
    const svgPt = containerToSVG(containerX, containerY);

    for (const id of Object.keys(universidadData)) {
        const el = document.getElementById(id);
        if (!el) continue;
        try {
            const bb = el.getBBox();
            if (svgPt.x >= bb.x && svgPt.x <= bb.x + bb.width &&
                svgPt.y >= bb.y && svgPt.y <= bb.y + bb.height) {
                return id;
            }
        } catch(e) { /* elemento no visible aún */ }
    }
    return null;
}

// ── Clic en el mapa (desktop) ──
function initMapClick() {
    const c = document.getElementById('vista-mapa');
    c.addEventListener('click', e => {
        if (wasDrag) return;
        const r = c.getBoundingClientRect();
        const id = detectarEdificio(e.clientX - r.left, e.clientY - r.top);
        if (id) mostrarInfo(id);
    });
}

// ── Tap en el mapa (móvil) ──
function initMapTap() {
    const c = document.getElementById('vista-mapa');
    let tapX, tapY;

    c.addEventListener('touchstart', e => {
        if (e.touches.length === 1) {
            tapX = e.touches[0].clientX;
            tapY = e.touches[0].clientY;
        }
    }, { passive: true });

    c.addEventListener('touchend', e => {
        if (wasDrag) return;
        if (e.changedTouches.length === 1) {
            const r = c.getBoundingClientRect();
            const id = detectarEdificio(
                e.changedTouches[0].clientX - r.left,
                e.changedTouches[0].clientY - r.top
            );
            if (id) {
                e.preventDefault();
                mostrarInfo(id);
            }
        }
    });
}

// ============================================================
//  INFO PANEL
// ============================================================
function mostrarInfo(id) {
    const lugar = universidadData[id];
    if (!lugar) { console.warn('Sin datos para:', id); return; }

    document.getElementById('info-titulo').innerText = lugar.nombre;
    document.getElementById('info-descripcion').innerHTML = `
        <div class="info-item"><strong>Servicios:</strong> ${lugar.servicios}</div>
        <div class="info-item"><strong>Horario:</strong> ${lugar.horarios}</div>
        <div class="info-item"><strong>Contacto:</strong> ${lugar.contactos}</div>
    `;
    document.getElementById('info-panel').classList.add('visible');

    // Highlight visual en el SVG
    const el = document.getElementById(id);
    if (el) {
        el.classList.add('highlight-lugar');
        setTimeout(() => el.classList.remove('highlight-lugar'), 2000);
    }
}

// ============================================================
//  BUSCADOR
// ============================================================
function buscarServicio() {
    const input = document.getElementById('buscador').value.toLowerCase().trim();
    if (!input) return;

    const id = Object.keys(universidadData).find(id => {
        const d = universidadData[id];
        return d.nombre.toLowerCase().includes(input) ||
               d.palabrasClave.toLowerCase().includes(input);
    });

    if (id) {
        mostrarInfo(id);
        navegarA(id);
    } else {
        alert('No se encontró: ' + input);
    }
}

// ── Navega animado al centro de un edificio ──
function navegarA(id) {
    const el = document.getElementById(id);
    if (!el) return;
    try {
        const bb = el.getBBox();
        centrarEn(bb.x + bb.width / 2, bb.y + bb.height / 2, 2.8, true);
    } catch(e) {}
}

// ============================================================
//  INIT
// ============================================================
document.addEventListener('DOMContentLoaded', () => {

    // Cursor
    const vistaMapa = document.getElementById('vista-mapa');
    vistaMapa.style.cursor = 'grab';

    // Inicializar controles
    initWheel();
    initMousePan();
    initTouch();
    initMapClick();
    initMapTap();

    // Vista inicial: centrada en Edificio_A
    requestAnimationFrame(() => {
        const edA = document.getElementById('Edificio_A');
        if (edA) {
            try {
                const bb = edA.getBBox();
                centrarEn(bb.x + bb.width / 2, bb.y + bb.height / 2, 1.8, false);
            } catch(e) {
                centrarEn(1725, 760, 1.8, false);
            }
        } else {
            centrarEn(1725, 760, 1.8, false);
        }
    });

    // Buscador con Enter
    document.getElementById('buscador')?.addEventListener('keydown', e => {
        if (e.key === 'Enter') buscarServicio();
    });

    // Filtros rápidos
    const filtros = { "Aulas": "Edificio_B", "Baños": "Baños_Vec", "Cafetería": "Cafetería", "Caja": "Edificio_A" };
    document.querySelectorAll('.filter-chip').forEach(chip => {
        const texto = chip.textContent.trim();
        if (filtros[texto]) {
            chip.style.cursor = 'pointer';
            chip.addEventListener('click', () => {
                mostrarInfo(filtros[texto]);
                navegarA(filtros[texto]);
            });
        }
    });

    // Cerrar panel con handle
    document.querySelector('.panel-handle')?.addEventListener('click', () => {
        document.getElementById('info-panel').classList.remove('visible');
    });

    // Cerrar panel al tocar fuera
    document.addEventListener('click', e => {
        const panel = document.getElementById('info-panel');
        if (panel.classList.contains('visible') && !panel.contains(e.target) && !e.target.closest('#vista-mapa')) {
            panel.classList.remove('visible');
        }
    });
});