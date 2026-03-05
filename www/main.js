// ============================================================
//  PAN + ZOOM — carga el SVG como imagen, hotspots para clics
// ============================================================

const SVG_W = 2477;
const SVG_H = 1595;
const ZOOM_MIN = 0.4;
const ZOOM_MAX = 6;

let camX = 0, camY = 0, camScale = 1;
let wasDrag = false;

function applyTransform(animated) {
    const layer = document.getElementById('mapa-layer');
    if (!layer) return;
    layer.style.transition = animated
        ? 'transform 0.35s cubic-bezier(0.25,0.46,0.45,0.94)'
        : 'none';
    layer.style.transform = `translate(${camX}px,${camY}px) scale(${camScale})`;
}

function centrarEn(svgX, svgY, escala, animated) {
    const c = document.getElementById('vista-mapa');
    camScale = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, escala));
    camX = c.clientWidth  / 2 - svgX * camScale;
    camY = c.clientHeight / 2 - svgY * camScale;
    applyTransform(animated);
}

function zoomAt(cx, cy, factor) {
    const newScale = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, camScale * factor));
    camX = cx - (cx - camX) * (newScale / camScale);
    camY = cy - (cy - camY) * (newScale / camScale);
    camScale = newScale;
    applyTransform(false);
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
}

// ── Touch: pan + pinch-zoom ──
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

// ── Hotspots clicables sobre el mapa ──
// Coordenadas en espacio SVG (x, y, ancho, alto)
function crearHotspots() {
    const layer = document.getElementById('mapa-layer');

    const zonas = {
        "Edificio_A":  { x: 1550, y: 620,  w: 350, h: 280 },
        "Edificio_B":  { x: 910,  y: 680,  w: 420, h: 260 },
        "Edificio_C":  { x: 490,  y: 430,  w: 440, h: 280 },
        "Edificio_E":  { x: 130,  y: 140,  w: 380, h: 340 },
        "Edificio_F":  { x: 680,  y: 1340, w: 300, h: 230 },
        "Edificio G":  { x: 60,   y: 860,  w: 510, h: 470 },
        "Cafetería":   { x: 1260, y: 560,  w: 145, h: 135 },
        "Baños_Vec":   { x: 1200, y: 870,  w: 200, h: 110 },
    };

    Object.entries(zonas).forEach(([id, p]) => {
        if (!universidadData[id]) return;
        const div = document.createElement('div');
        div.className = 'mapa-hotspot';
        div.dataset.id = id;
        div.style.left   = p.x + 'px';
        div.style.top    = p.y + 'px';
        div.style.width  = p.w + 'px';
        div.style.height = p.h + 'px';

        div.addEventListener('click', e => {
            e.stopPropagation();
            if (wasDrag) return;
            mostrarInfo(id);
        });
        div.addEventListener('touchend', e => {
            if (wasDrag) return;
            e.preventDefault(); e.stopPropagation();
            mostrarInfo(id);
        });
        layer.appendChild(div);
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
    if (id) { mostrarInfo(id); navegarA(id); }
    else alert('No se encontró: ' + input);
}

function navegarA(id) {
    const div = document.querySelector(`.mapa-hotspot[data-id="${CSS.escape(id)}"]`);
    if (!div) return;
    const cx = parseFloat(div.style.left) + parseFloat(div.style.width)  / 2;
    const cy = parseFloat(div.style.top)  + parseFloat(div.style.height) / 2;
    centrarEn(cx, cy, 2.8, true);
}

// ============================================================
//  INIT
// ============================================================
document.addEventListener('DOMContentLoaded', () => {

    // ── Reemplazar SVG inline por imagen + layer de hotspots ──
    const vistaMapa = document.getElementById('vista-mapa');
    vistaMapa.innerHTML = '';

    const layer = document.createElement('div');
    layer.id = 'mapa-layer';

    const img = document.createElement('img');
    img.src = 'mapa.svg';   // ← el archivo SVG del mapa (renómbralo o ajusta aquí)
    img.id  = 'svg-mapa';
    img.draggable = false;
    img.addEventListener('dragstart', e => e.preventDefault());

    layer.appendChild(img);
    vistaMapa.appendChild(layer);

    crearHotspots();

    vistaMapa.style.cursor = 'grab';
    initWheel();
    initMousePan();
    initTouch();

    // Vista inicial centrada en Edificio_A
    requestAnimationFrame(() => {
        centrarEn(1725, 760, 1.8, false); // centro del Edificio_A
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
            chip.addEventListener('click', () => { mostrarInfo(filtros[texto]); navegarA(filtros[texto]); });
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