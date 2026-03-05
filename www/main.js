// ============================================================
//  SISTEMA DE PAN + ZOOM  (touch & mouse)
// ============================================================

const SVG_W = 2477;   // viewBox original del SVG
const SVG_H = 1595;

// Estado de la cámara
let camX = 0, camY = 0, camScale = 1;

// Límites de zoom
const ZOOM_MIN = 0.3;
const ZOOM_MAX = 5;

// Centro aproximado del Edificio_A en coordenadas del SVG
// (ajusta estos valores si el edificio A está en otra posición)
const EDIFICIO_A_CX = 1650;
const EDIFICIO_A_CY = 750;

// ── Aplicar transformación al SVG ──
function applyTransform(animated = false) {
    const svg = document.getElementById('svg-mapa');
    if (!svg) return;
    if (animated) svg.style.transition = 'transform 0.35s cubic-bezier(0.25,0.46,0.45,0.94)';
    else          svg.style.transition = 'none';
    svg.style.transform = `translate(${camX}px, ${camY}px) scale(${camScale})`;
    svg.style.transformOrigin = '0 0';
}

// ── Centrar la vista en un punto SVG ──
function centrarEn(svgX, svgY, escala, animated = true) {
    const contenedor = document.getElementById('vista-mapa');
    const cw = contenedor.clientWidth;
    const ch = contenedor.clientHeight;
    camScale = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, escala));
    camX = cw / 2 - svgX * camScale;
    camY = ch / 2 - svgY * camScale;
    applyTransform(animated);
}

// ── Zoom con rueda de ratón (desktop) ──
function initMouseWheel() {
    const contenedor = document.getElementById('vista-mapa');
    contenedor.addEventListener('wheel', (e) => {
        e.preventDefault();
        const rect   = contenedor.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const delta   = e.deltaY > 0 ? 0.85 : 1.18;
        const newScale = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, camScale * delta));

        // Zoom hacia el punto del cursor
        camX = mouseX - (mouseX - camX) * (newScale / camScale);
        camY = mouseY - (mouseY - camY) * (newScale / camScale);
        camScale = newScale;
        applyTransform(false);
    }, { passive: false });
}

// ── Pan con ratón (desktop) ──
function initMousePan() {
    const contenedor = document.getElementById('vista-mapa');
    let dragging = false;
    let startX, startY, startCamX, startCamY;
    let moved = false;

    contenedor.addEventListener('mousedown', (e) => {
        // Solo botón izquierdo
        if (e.button !== 0) return;
        dragging = true;
        moved    = false;
        startX   = e.clientX;
        startY   = e.clientY;
        startCamX = camX;
        startCamY = camY;
        contenedor.style.cursor = 'grabbing';
        e.preventDefault();
    });

    window.addEventListener('mousemove', (e) => {
        if (!dragging) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        if (Math.abs(dx) > 3 || Math.abs(dy) > 3) moved = true;
        camX = startCamX + dx;
        camY = startCamY + dy;
        applyTransform(false);
    });

    window.addEventListener('mouseup', () => {
        dragging = false;
        contenedor.style.cursor = 'grab';
    });

    // Si el usuario arrastró, cancelar el clic siguiente
    contenedor.addEventListener('click', (e) => {
        if (moved) {
            e.stopPropagation();
            moved = false;
        }
    }, true);
}

// ── Touch: pan + pinch-zoom ──
function initTouch() {
    const contenedor = document.getElementById('vista-mapa');
    let touches = {};
    let lastDist = null;
    let startCamX, startCamY;
    let startMidX, startMidY;
    let moved = false;

    function getTouches(e) {
        return Array.from(e.touches);
    }

    function dist(t1, t2) {
        const dx = t1.clientX - t2.clientX;
        const dy = t1.clientY - t2.clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }

    contenedor.addEventListener('touchstart', (e) => {
        e.preventDefault();
        moved = false;
        const ts = getTouches(e);
        if (ts.length === 1) {
            startCamX = camX;
            startCamY = camY;
            startMidX = ts[0].clientX;
            startMidY = ts[0].clientY;
            lastDist  = null;
        } else if (ts.length === 2) {
            lastDist  = dist(ts[0], ts[1]);
            startCamX = camX;
            startCamY = camY;
            const rect = contenedor.getBoundingClientRect();
            startMidX = (ts[0].clientX + ts[1].clientX) / 2 - rect.left;
            startMidY = (ts[0].clientY + ts[1].clientY) / 2 - rect.top;
        }
    }, { passive: false });

    contenedor.addEventListener('touchmove', (e) => {
        e.preventDefault();
        const ts = getTouches(e);

        if (ts.length === 1 && lastDist === null) {
            // Pan con un dedo
            const dx = ts[0].clientX - startMidX;
            const dy = ts[0].clientY - startMidY;
            if (Math.abs(dx) > 3 || Math.abs(dy) > 3) moved = true;
            camX = startCamX + dx;
            camY = startCamY + dy;
            applyTransform(false);

        } else if (ts.length === 2) {
            // Pinch-zoom con dos dedos
            moved = true;
            const currentDist = dist(ts[0], ts[1]);
            const rect = contenedor.getBoundingClientRect();
            const midX = (ts[0].clientX + ts[1].clientX) / 2 - rect.left;
            const midY = (ts[0].clientY + ts[1].clientY) / 2 - rect.top;

            if (lastDist !== null) {
                const delta    = currentDist / lastDist;
                const newScale = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, camScale * delta));
                camX = midX - (midX - camX) * (newScale / camScale);
                camY = midY - (midY - camY) * (newScale / camScale);
                camScale = newScale;
            }
            lastDist = currentDist;
            applyTransform(false);
        }
    }, { passive: false });

    contenedor.addEventListener('touchend', (e) => {
        if (e.touches.length < 2) lastDist = null;
        // Si hubo movimiento, el tap no debe disparar un clic
        if (moved) {
            e.preventDefault();
            moved = false;
        }
    }, { passive: false });
}

// ── Navegar a un elemento del SVG (usado en búsqueda y filtros) ──
function navegarA(id, escala = 2.5) {
    const el = document.getElementById(id);
    if (!el) return;

    const bbox = el.getBBox();
    const cx   = bbox.x + bbox.width  / 2;
    const cy   = bbox.y + bbox.height / 2;
    centrarEn(cx, cy, escala, true);
}

// ============================================================
//  LÓGICA ORIGINAL (info panel, buscador, clics en edificios)
// ============================================================

function mostrarInfo(id) {
    const lugar = universidadData[id];
    const panel = document.getElementById('info-panel');

    if (lugar) {
        document.getElementById('info-titulo').innerText = lugar.nombre;
        document.getElementById('info-descripcion').innerHTML = `
            <div class="info-item"><strong>Servicios:</strong> ${lugar.servicios}</div>
            <div class="info-item"><strong>Horario:</strong> ${lugar.horarios}</div>
            <div class="info-item"><strong>Contacto:</strong> ${lugar.contactos}</div>
        `;
        panel.classList.add('visible');

        // Resaltado visual
        const elementoMapa = document.getElementById(id);
        if (elementoMapa) {
            elementoMapa.classList.add('highlight-lugar');
            setTimeout(() => elementoMapa.classList.remove('highlight-lugar'), 2000);
        }
    } else {
        console.warn("No se encontraron datos en datos.js para el ID:", id);
    }
}

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
        navegarA(encontradoId, 2.5);   // Zoom animado al edificio encontrado
    } else {
        alert("No se encontró: " + input);
    }
}

// ============================================================
//  INIT
// ============================================================

document.addEventListener("DOMContentLoaded", () => {

    // ── Inicializar controles del mapa ──
    initMouseWheel();
    initMousePan();
    initTouch();

    // Cursor inicial
    const contenedor = document.getElementById('vista-mapa');
    if (contenedor) contenedor.style.cursor = 'grab';

    // Vista inicial: centrada en Edificio_A con zoom moderado
    // Usamos requestAnimationFrame para asegurarnos de que el layout ya está listo
    requestAnimationFrame(() => {
        const edA = document.getElementById('Edificio_A');
        if (edA) {
            try {
                const bbox = edA.getBBox();
                centrarEn(bbox.x + bbox.width / 2, bbox.y + bbox.height / 2, 1.8, false);
            } catch(e) {
                // Fallback si getBBox falla (SVG no visible aún)
                centrarEn(EDIFICIO_A_CX, EDIFICIO_A_CY, 1.8, false);
            }
        } else {
            centrarEn(EDIFICIO_A_CX, EDIFICIO_A_CY, 1.8, false);
        }
    });

    // ── Buscador con Enter ──
    const buscadorInput = document.getElementById('buscador');
    if (buscadorInput) {
        buscadorInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') buscarServicio();
        });
    }

    // ── Filtros rápidos: muestran info Y navegan al edificio ──
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
            chip.addEventListener('click', () => {
                mostrarInfo(filtros[texto]);
                navegarA(filtros[texto], 2.5);
            });
        }
    });

    // ── Clics en edificios del SVG ──
    // Usamos un flag para distinguir tap real de fin de arrastre
    let tapCancelled = false;
    const vistaMapaEl = document.getElementById('vista-mapa');

    // Escuchar touchmove en la ventana para marcar si hubo movimiento
    vistaMapaEl.addEventListener('touchmove', () => { tapCancelled = true; }, { passive: true });

    Object.keys(universidadData).forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.style.cursor = "pointer";

            // Clic en desktop
            el.addEventListener('click', (e) => {
                e.stopPropagation();
                mostrarInfo(id);
            });

            // Tap en móvil — solo si no hubo arrastre
            el.addEventListener('touchstart', () => { tapCancelled = false; }, { passive: true });
            el.addEventListener('touchend', (e) => {
                if (!tapCancelled) {
                    e.preventDefault();
                    e.stopPropagation();
                    mostrarInfo(id);
                }
            });

            el.querySelectorAll('path, rect, circle, polygon').forEach(child => {
                child.style.cursor = "pointer";
                child.addEventListener('click', (e) => {
                    e.stopPropagation();
                    mostrarInfo(id);
                });
            });
        } else {
            console.warn(`Elemento SVG no encontrado para ID: "${id}"`);
        }
    });

    // ── Cerrar panel con el handle ──
    const handle = document.querySelector('.panel-handle');
    if (handle) {
        handle.style.cursor = "pointer";
        handle.onclick = () => {
            document.getElementById('info-panel').classList.remove('visible');
        };
    }

    // ── Cerrar panel al tocar fuera ──
    document.addEventListener('click', (e) => {
        const panel = document.getElementById('info-panel');
        if (panel.classList.contains('visible') && !panel.contains(e.target)) {
            const esMapa = e.target.closest('#vista-mapa');
            if (!esMapa) panel.classList.remove('visible');
        }
    });
});