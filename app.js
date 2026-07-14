// Ranchillo App Mobile-First PWA Logic

// --- REGISTRO DE SERVICE WORKER (Para funcionamiento offline) ---
function registrarServiceWorker() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./sw.js')
                .then(reg => console.log('Service Worker registrado con éxito:', reg.scope))
                .catch(err => console.error('Fallo al registrar Service Worker:', err));
        });
    }
}

// --- CONFIGURACIÓN DE INSTALACIÓN COMO PWA ---
let deferredPrompt;
function configurarInstalacionPWA() {
    const installBanner = document.getElementById('installBanner');
    const installBtn = document.getElementById('installBtn');
    
    if (!installBanner || !installBtn) return;

    window.addEventListener('beforeinstallprompt', (e) => {
        // Prevenir que Chrome muestre el prompt automático
        e.preventDefault();
        // Guardar el evento para dispararlo luego
        deferredPrompt = e;
        // Mostrar el banner personalizado de instalación
        installBanner.style.display = 'flex';
    });

    installBtn.addEventListener('click', () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then((choiceResult) => {
                if (choiceResult.outcome === 'accepted') {
                    console.log('El usuario aceptó instalar la app');
                } else {
                    console.log('El usuario canceló la instalación');
                }
                deferredPrompt = null;
                installBanner.style.display = 'none';
            });
        }
    });
}

function cerrarBannerInstalacion() {
    vibrar(15);
    const installBanner = document.getElementById('installBanner');
    if (installBanner) {
        installBanner.style.display = 'none';
    }
}

// --- ESTADO DE LA APLICACIÓN ---
let productos = JSON.parse(localStorage.getItem('ranchillo_productos')) || [
    // Perros
    { id: 1, nombre: 'Master Dog Adulto 15kg', precio: 18500 },
    { id: 2, nombre: 'Master Dog Cachorro 15kg', precio: 21000 },
    { id: 3, nombre: 'Champion Dog Adulto 15kg', precio: 19990 },
    { id: 4, nombre: 'Pedigree Adulto Carne 15kg', precio: 22500 },
    { id: 5, nombre: 'Dog Chow Adulto Raza Mediana 15kg', precio: 26990 },
    { id: 6, nombre: 'Fit Formula Adulto 15kg', precio: 17500 },
    { id: 7, nombre: 'Royal Canin Maxi Adult 15kg', precio: 62900 },
    { id: 8, nombre: 'Pro Plan Adulto Raza Mediana 15kg', precio: 58900 },
    { id: 9, nombre: 'Cannes Adulto Carne 15kg', precio: 16500 },
    { id: 10, nombre: 'Doko Adulto Carne y Verduras 15kg', precio: 15990 },
    // Gatos
    { id: 11, nombre: 'Champion Cat Adulto Mariscos 8kg', precio: 12000 },
    { id: 12, nombre: 'Cat Chow Gatos Adultos Pescado 8kg', precio: 18990 },
    { id: 13, nombre: 'Whiskas Gato Adulto Carne 10kg', precio: 24990 },
    { id: 14, nombre: 'Gati Gato Adulto Mixto 15kg', precio: 22900 },
    { id: 15, nombre: 'Master Cat Carne y Leche 8kg', precio: 11500 },
    { id: 16, nombre: 'Purina Excellent Gato Adulto 7.5kg', precio: 29900 },
    { id: 17, nombre: 'Royal Canin Fit 32 Gato 7.5kg', precio: 48900 },
    { id: 18, nombre: 'Pro Plan Gato Adulto Optirenal 7.5kg', precio: 39900 },
    { id: 19, nombre: 'Felix Gato Adulto Mix Selección 8kg', precio: 19500 },
    { id: 20, nombre: 'Nutra Gold Gato Pro Active 3kg', precio: 14990 }
];

let ventas = JSON.parse(localStorage.getItem('ranchillo_ventas')) || [];

function guardarDatos() {
    localStorage.setItem('ranchillo_productos', JSON.stringify(productos));
    localStorage.setItem('ranchillo_ventas', JSON.stringify(ventas));
}

// --- NAVEGACIÓN POR PESTAÑAS (TAB NAVIGATION) ---
function cambiarTab(tabId, element) {
    vibrar(20);
    
    // Ocultar todos los contenidos de pestaña
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => tab.classList.remove('active-tab'));
    
    // Quitar clase activa de los botones de navegación
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => item.classList.remove('active-nav'));
    
    // Mostrar la pestaña seleccionada
    const targetTab = document.getElementById(tabId);
    if (targetTab) {
        targetTab.classList.add('active-tab');
    }
    
    // Activar botón pulsado
    if (element) {
        element.classList.add('active-nav');
    }

    // Mostrar/ocultar FAB de registro de ventas según la pestaña activa (solo en Panel)
    const fab = document.getElementById('salesFAB');
    if (fab) {
        if (tabId === 'tab-dashboard') {
            fab.style.display = 'flex';
        } else {
            fab.style.display = 'none';
        }
    }

    // Scroll al inicio de la página al cambiar
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// --- CONTROLES DE BOTTOM SHEET (MODAL DE REGISTRO) ---
function abrirModalRegistro() {
    vibrar(25);
    document.getElementById('bottomSheetRegistro').classList.add('active');
    // Scroll lock
    document.body.style.overflow = 'hidden';
}

function cerrarModalRegistro() {
    vibrar(15);
    document.getElementById('bottomSheetRegistro').classList.remove('active');
    // Scroll release
    document.body.style.overflow = '';
}

// --- INICIALIZACIÓN DE LA APP ---
function inicializar() {
    registrarServiceWorker();
    configurarInstalacionPWA();
    actualizarSelectProductos();
    actualizarTablaVentas();
    actualizarTablaModalProductos();
    inicializarTema();
    configurarEventos();
}

function configurarEventos() {
    // Cerrar bottom sheet al pulsar fuera (en el overlay)
    const overlay = document.getElementById('bottomSheetRegistro');
    if (overlay) {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) cerrarModalRegistro();
        });
    }

    // Cerrar menú desplegable al hacer clic afuera
    document.addEventListener('click', (e) => {
        const wrapper = document.querySelector('.dropdown-wrapper');
        const menu = document.getElementById('paletteDropdownMenu');
        if (wrapper && menu && !wrapper.contains(e.target)) {
            menu.style.display = 'none';
        }
    });
}

// --- MANEJO DE VENTAS ---
function actualizarSelectProductos() {
    const select = document.getElementById('productoSelect');
    if (!select) return;
    
    select.innerHTML = '';
    
    if (productos.length === 0) {
        const option = document.createElement('option');
        option.text = 'Primero agrega productos en catálogo';
        option.disabled = true;
        select.appendChild(option);
        return;
    }

    productos.forEach(prod => {
        const option = document.createElement('option');
        option.value = prod.id;
        option.text = `${prod.nombre} - ${formatoMoneda(prod.precio)}`;
        select.appendChild(option);
    });
}

function registrarVenta() {
    const select = document.getElementById('productoSelect');
    if (productos.length === 0) {
        vibrar(40);
        return showToast('❌ Agrega productos en catálogo primero.');
    }
    
    const productoId = parseInt(select.value);
    const cantidadInput = document.getElementById('cantidad');
    const cantidad = parseInt(cantidadInput.value);
    const metodoPago = document.querySelector('input[name="pago"]:checked').value;
    
    if (isNaN(cantidad) || cantidad <= 0) {
        vibrar(40);
        return showToast('❌ Ingresa una cantidad válida.');
    }

    const producto = productos.find(p => p.id === productoId);
    if (!producto) return;

    const totalVenta = (producto.precio * cantidad) + (metodoPago === 'Débito' ? 500 : 0);

    // Agregar al inicio del listado de ventas
    ventas.unshift({
        id: Date.now(),
        fecha: new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }),
        producto: producto.nombre,
        cantidad: cantidad,
        precioUnitario: producto.precio,
        total: totalVenta,
        pago: metodoPago
    });

    guardarDatos();
    actualizarTablaVentas();
    cantidadInput.value = 1; // reset
    cerrarModalRegistro();
    showToast('✅ Venta registrada con éxito');
    vibrar(50);
}

function cambiarCantidad(diff) {
    vibrar(15);
    const input = document.getElementById('cantidad');
    let val = parseInt(input.value) || 1;
    val += diff;
    if (val < 1) val = 1;
    input.value = val;
}

function actualizarTablaVentas(ventasFiltradas = null) {
    const listado = ventasFiltradas || ventas;
    
    // 1. Actualizar tabla en pestaña 2
    const tbody = document.getElementById('listaVentas');
    if (tbody) {
        tbody.innerHTML = '';
        if (listado.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; color: var(--text-secondary); padding: 24px;">No hay registros de ventas.</td></tr>`;
        } else {
            listado.forEach(venta => {
                const tr = document.createElement('tr');
                let badgeClass = 'badge-transferencia';
                let paymentEmoji = '🏦';
                if (venta.pago === 'Efectivo') {
                    badgeClass = 'badge-efectivo';
                    paymentEmoji = '💵';
                } else if (venta.pago === 'Débito') {
                    badgeClass = 'badge-debito';
                    paymentEmoji = '💳';
                }
                tr.innerHTML = `
                    <td style="font-weight: 500;">
                        ${venta.producto}
                        <div style="font-size: 0.75rem; color: var(--text-secondary);">${venta.fecha}</div>
                    </td>
                    <td style="font-weight: 600;">x${venta.cantidad}</td>
                    <td>
                        <span class="badge-pago ${badgeClass}">
                            ${paymentEmoji} ${venta.pago}
                        </span>
                    </td>
                    <td style="font-weight: 700; color: var(--text-primary);">${formatoMoneda(venta.total)}</td>
                `;
                tbody.appendChild(tr);
            });
        }
    }

    // 2. Actualizar KPIs de caja en el Dashboard (Panel)
    let general = 0;
    let efectivo = 0;
    let transferencia = 0;
    let articulos = 0;

    ventas.forEach(v => {
        general += v.total;
        articulos += v.cantidad;
        if (v.pago === 'Efectivo') {
            efectivo += v.total;
        } else {
            // Transferencia y Débito sumados
            transferencia += v.total;
        }
    });

    const lblGeneral = document.getElementById('totalGeneral');
    const lblEfectivo = document.getElementById('totalEfectivo');
    const lblTransferencia = document.getElementById('totalTransferencia');
    const lblArticulos = document.getElementById('totalArticulos');

    if (lblGeneral) lblGeneral.innerText = formatoMoneda(general);
    if (lblEfectivo) lblEfectivo.innerText = formatoMoneda(efectivo);
    if (lblTransferencia) lblTransferencia.innerText = formatoMoneda(transferencia);
    if (lblArticulos) lblArticulos.innerText = articulos;

    // 3. Actualizar lista de movimientos rápidos en Dashboard
    actualizarVentasRecientesDashboard();
}

function actualizarVentasRecientesDashboard() {
    const list = document.getElementById('listaVentasRecientes');
    const emptyMsg = document.getElementById('noRecentSalesMsg');
    if (!list) return;

    list.innerHTML = '';
    
    // Mostrar máximo las 4 últimas ventas
    const ultimas = ventas.slice(0, 4);
    
    if (ultimas.length === 0) {
        if (emptyMsg) emptyMsg.style.display = 'flex';
        return;
    }

    if (emptyMsg) emptyMsg.style.display = 'none';

    ultimas.forEach(v => {
        const li = document.createElement('li');
        li.className = 'recent-sale-item';
        let paymentEmoji = '🏦';
        if (v.pago === 'Efectivo') paymentEmoji = '💵';
        else if (v.pago === 'Débito') paymentEmoji = '💳';
        
        li.innerHTML = `
            <div class="recent-sale-details">
                <span class="recent-sale-name">${v.producto}</span>
                <span class="recent-sale-meta">${v.fecha} • Cantidad: x${v.cantidad} • ${paymentEmoji}</span>
            </div>
            <span class="recent-sale-total">${formatoMoneda(v.total)}</span>
        `;
        list.appendChild(li);
    });
}

function eliminarVenta(id) {
    vibrar(20);
    if (confirm('¿Eliminar este registro de venta?')) {
        ventas = ventas.filter(v => v.id !== id);
        guardarDatos();
        actualizarTablaVentas();
        showToast('🗑️ Registro eliminado');
        vibrar(30);
    }
}

function eliminarVentas() {
    vibrar(40);
    if (confirm('⚠️ ¿Estás seguro que deseas reiniciar la caja diaria? Esto borrará todas las ventas registradas hoy.')) {
        ventas = [];
        guardarDatos();
        actualizarTablaVentas();
        showToast('🔄 Caja diaria reiniciada');
        vibrar(60);
    }
}

function filtrarVentas() {
    const query = document.getElementById('buscarVenta').value.toLowerCase().trim();
    const filtroPago = document.getElementById('filtroPago').value;
    const msgVacio = document.getElementById('noVentasMsg');

    const filtradas = ventas.filter(v => {
        const matchesQuery = v.producto.toLowerCase().includes(query);
        const matchesPago = (filtroPago === 'todos') || (v.pago === filtroPago);
        return matchesQuery && matchesPago;
    });

    actualizarTablaVentas(filtradas);
    
    if (msgVacio) {
        msgVacio.style.display = (filtradas.length === 0 && ventas.length > 0) ? 'flex' : 'none';
    }
}

// --- ENVÍO DE REPORTE POR WHATSAPP ---
function enviarWhatsApp() {
    vibrar(25);
    if (ventas.length === 0) {
        return showToast('❌ No hay ventas para reportar.');
    }

    let texto = `*🐾 RANCHILLO - REPORTE DE CAJA DIARIO 🐾*\n`;
    texto += `_Fecha: ${new Date().toLocaleDateString('es-CL')}_\n\n`;

    let totalG = 0;
    let efectivo = 0;
    let transferencia = 0;
    let debito = 0;
    let totalSacos = 0;

    // Agrupar por producto
    const agrupado = {};
    ventas.forEach(v => {
        if (!agrupado[v.producto]) {
            agrupado[v.producto] = { cant: 0, total: 0 };
        }
        agrupado[v.producto].cant += v.cantidad;
        agrupado[v.producto].total += v.total;
        
        totalG += v.total;
        totalSacos += v.cantidad;
        if (v.pago === 'Efectivo') {
            efectivo += v.total;
        } else if (v.pago === 'Débito') {
            debito += v.total;
        } else {
            transferencia += v.total;
        }
    });

    texto += `*Detalle de Ventas:*\n`;
    Object.keys(agrupado).forEach((key, index) => {
        const item = agrupado[key];
        texto += `*${index + 1}.* ${key}\n   • Cantidad: x${item.cant} unids.\n   • Total: *${formatoMoneda(item.total)}*\n`;
    });

    texto += `\n*Resumen Financiero:*\n`;
    texto += `💵 Total Efectivo: *${formatoMoneda(efectivo)}*\n`;
    texto += `🏦 Total Transferencia: *${formatoMoneda(transferencia)}*\n`;
    texto += `💳 Total Débito: *${formatoMoneda(debito)}*\n`;
    texto += `📦 Total Sacos/Productos: *${totalSacos} unids.*\n`;
    texto += `💰 *TOTAL GENERAL CAJA: ${formatoMoneda(totalG)}*`;

    const url = `https://wa.me/?text=${encodeURIComponent(texto)}`;
    window.open(url, '_blank');
}

// --- SECCIÓN CATALOGO DE PRODUCTOS ---
function guardarProducto() {
    vibrar(20);
    const nombreInput = document.getElementById('nuevoProductoNombre');
    const precioInput = document.getElementById('nuevoProductoPrecio');
    
    const nombre = nombreInput.value.trim();
    const precio = parseInt(precioInput.value);
    
    if (!nombre || isNaN(precio) || precio < 0) {
        vibrar(40);
        return showToast('❌ Completa el nombre y un precio válido.');
    }

    const id = productos.length > 0 ? Math.max(...productos.map(p => p.id)) + 1 : 1;
    
    productos.push({ id, nombre, precio });
    
    nombreInput.value = '';
    precioInput.value = '';
    
    guardarDatos();
    actualizarTablaModalProductos();
    actualizarSelectProductos();
    showToast('📦 Producto agregado al catálogo');
    vibrar(30);
}

function eliminarProducto(id) {
    vibrar(20);
    const producto = productos.find(p => p.id === id);
    if (!producto) return;

    if (confirm(`¿Eliminar "${producto.nombre}" del catálogo?`)) {
        productos = productos.filter(p => p.id !== id);
        guardarDatos();
        actualizarTablaModalProductos();
        actualizarSelectProductos();
        showToast('🗑️ Producto eliminado');
        vibrar(30);
    }
}

function actualizarTablaModalProductos() {
    const tbody = document.getElementById('listaProductosModal');
    if (!tbody) return;
    tbody.innerHTML = '';
    
    if (productos.length === 0) {
        tbody.innerHTML = `<tr><td colspan="3" style="text-align:center; color: var(--text-secondary); padding: 20px;">El catálogo está vacío.</td></tr>`;
        return;
    }

    productos.forEach(prod => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td style="font-weight: 500;">${prod.nombre}</td>
            <td style="font-weight: 700; color: var(--primary-color);">
                <div>${formatoMoneda(prod.precio)}</div>
                <button class="btn-price-adjust" onclick="ajustarPrecio(${prod.id})">✏️ Editar</button>
            </td>
            <td style="text-align: center;">
                <button class="btn-delete-row" onclick="eliminarProducto(${prod.id})" title="Eliminar del catálogo">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function ajustarPrecio(id) {
    vibrar(15);
    const prod = productos.find(p => p.id === id);
    if (!prod) return;
    
    const nuevoPrecioStr = prompt(`Cambiar precio de:\n"${prod.nombre}"\n\nIngresa el nuevo precio unitario ($):`, prod.precio);
    if (nuevoPrecioStr === null) return;
    
    const nuevoPrecio = parseInt(nuevoPrecioStr);
    if (isNaN(nuevoPrecio) || nuevoPrecio < 0) {
        vibrar(40);
        return showToast('❌ Precio no válido.');
    }
    
    prod.precio = nuevoPrecio;
    guardarDatos();
    actualizarTablaModalProductos();
    actualizarSelectProductos();
    showToast('✅ Precio actualizado');
    vibrar(30);
}

// --- UTILERÍAS & AUXILIARES ---
function formatoMoneda(valor) {
    return new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
        minimumFractionDigits: 0
    }).format(valor);
}

function showToast(message) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function vibrar(ms) {
    if ('vibrate' in navigator) {
        navigator.vibrate(ms);
    }
}

// --- CONTROL DEL TEMA VISUAL Y PALETA DE COLORES ---
const TEMAS_PALETA = {
    azul: {
        nombre: 'Azul Midnight',
        color: '#2563eb',
        claro: {
            '--bg-primary': '#f8fafc',
            '--bg-card': '#ffffff',
            '--text-primary': '#0f172a',
            '--text-secondary': '#64748b',
            '--border-color': '#e2e8f0',
            '--primary-color': '#2563eb',
            '--primary-hover': '#1d4ed8',
            '--primary-light': '#eff6ff'
        },
        oscuro: {
            '--bg-primary': '#0b0f19',
            '--bg-card': '#151e30',
            '--text-primary': '#f8fafc',
            '--text-secondary': '#94a3b8',
            '--border-color': '#1e293b',
            '--primary-color': '#3b82f6',
            '--primary-hover': '#60a5fa',
            '--primary-light': 'rgba(59, 130, 246, 0.12)'
        }
    },
    verde: {
        nombre: 'Verde Esmeralda',
        color: '#16a34a',
        claro: {
            '--bg-primary': '#f8fafc',
            '--bg-card': '#ffffff',
            '--text-primary': '#0f172a',
            '--text-secondary': '#64748b',
            '--border-color': '#e2e8f0',
            '--primary-color': '#16a34a',
            '--primary-hover': '#15803d',
            '--primary-light': '#f0fdf4'
        },
        oscuro: {
            '--bg-primary': '#061a10',
            '--bg-card': '#0e2b1d',
            '--text-primary': '#f8fafc',
            '--text-secondary': '#94a3b8',
            '--border-color': '#133d27',
            '--primary-color': '#10b981',
            '--primary-hover': '#34d399',
            '--primary-light': 'rgba(16, 185, 129, 0.12)'
        }
    },
    morado: {
        nombre: 'Violeta Profundo',
        color: '#8b5cf6',
        claro: {
            '--bg-primary': '#f8fafc',
            '--bg-card': '#ffffff',
            '--text-primary': '#0f172a',
            '--text-secondary': '#64748b',
            '--border-color': '#e2e8f0',
            '--primary-color': '#8b5cf6',
            '--primary-hover': '#7c3aed',
            '--primary-light': '#f5f3ff'
        },
        oscuro: {
            '--bg-primary': '#110b1a',
            '--bg-card': '#1d132b',
            '--text-primary': '#f8fafc',
            '--text-secondary': '#94a3b8',
            '--border-color': '#27193b',
            '--primary-color': '#a78bfa',
            '--primary-hover': '#c4b5fd',
            '--primary-light': 'rgba(139, 92, 246, 0.12)'
        }
    },
    rojo: {
        nombre: 'Rojo Rubí',
        color: '#dc2626',
        claro: {
            '--bg-primary': '#f8fafc',
            '--bg-card': '#ffffff',
            '--text-primary': '#0f172a',
            '--text-secondary': '#64748b',
            '--border-color': '#e2e8f0',
            '--primary-color': '#dc2626',
            '--primary-hover': '#b91c1c',
            '--primary-light': '#fef2f2'
        },
        oscuro: {
            '--bg-primary': '#1a0b0b',
            '--bg-card': '#2d1414',
            '--text-primary': '#f8fafc',
            '--text-secondary': '#94a3b8',
            '--border-color': '#3f1c1c',
            '--primary-color': '#f87171',
            '--primary-hover': '#fca5a5',
            '--primary-light': 'rgba(220, 38, 38, 0.12)'
        }
    },
    naranja: {
        nombre: 'Naranja Sunset',
        color: '#ea580c',
        claro: {
            '--bg-primary': '#f8fafc',
            '--bg-card': '#ffffff',
            '--text-primary': '#0f172a',
            '--text-secondary': '#64748b',
            '--border-color': '#e2e8f0',
            '--primary-color': '#ea580c',
            '--primary-hover': '#c2410c',
            '--primary-light': '#fff7ed'
        },
        oscuro: {
            '--bg-primary': '#1c100b',
            '--bg-card': '#2e1c14',
            '--text-primary': '#f8fafc',
            '--text-secondary': '#94a3b8',
            '--border-color': '#3e261b',
            '--primary-color': '#fb923c',
            '--primary-hover': '#fdba74',
            '--primary-light': 'rgba(234, 88, 12, 0.12)'
        }
    }
};

function aplicarEstilosTema() {
    const theme = document.documentElement.getAttribute('data-theme') || 'light';
    const paletteKey = localStorage.getItem('ranchillo_palette') || 'naranja';
    
    const propsALimpiar = [
        '--bg-primary', '--bg-card', '--border-color',
        '--text-primary', '--text-secondary',
        '--primary-color', '--primary-hover', '--primary-light'
    ];
    propsALimpiar.forEach(prop => {
        document.documentElement.style.removeProperty(prop);
    });

    const palette = TEMAS_PALETA[paletteKey] || TEMAS_PALETA.naranja;
    const styles = theme === 'dark' ? palette.oscuro : palette.claro;
    
    Object.keys(styles).forEach(prop => {
        document.documentElement.style.setProperty(prop, styles[prop]);
    });
}

function cambiarPaleta(key) {
    vibrar(25);
    if (!TEMAS_PALETA[key]) return;
    
    localStorage.setItem('ranchillo_palette', key);
    aplicarEstilosTema();
    showToast(`Paleta activa: ${TEMAS_PALETA[key].nombre}`);
}

function setTemaManual(newTheme) {
    vibrar(25);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('ranchillo_theme', newTheme);
    aplicarEstilosTema();
    actualizarIconosTema(newTheme);
    showToast(`Fondo ${newTheme === 'dark' ? 'Oscuro 🌙' : 'Claro ☀️'}`);
}

function toggleFondoPerrito() {
    vibrar(25);
    const isBgImg = document.body.classList.toggle('theme-bg-image');
    localStorage.setItem('ranchillo_bg_image', isBgImg ? 'true' : 'false');
    actualizarBotonFondo();
    showToast(isBgImg ? '🐶 Fondo de perrito activado' : 'Fondo liso activado');
}

function actualizarBotonFondo() {
    const btn = document.getElementById('btnFondoPerrito');
    if (!btn) return;
    const isBgImg = document.body.classList.contains('theme-bg-image');
    if (isBgImg) {
        btn.style.borderColor = 'var(--primary-color)';
        btn.style.backgroundColor = 'var(--primary-light)';
        btn.style.color = 'var(--primary-color)';
    } else {
        btn.style.borderColor = 'var(--border-color)';
        btn.style.backgroundColor = 'var(--bg-primary)';
        btn.style.color = 'var(--text-primary)';
    }
}

function togglePaletteDropdown() {
    vibrar(15);
    const menu = document.getElementById('paletteDropdownMenu');
    if (!menu) return;
    const isShowing = menu.style.display === 'block';
    menu.style.display = isShowing ? 'none' : 'block';
}

function inicializarTema() {
    const savedTheme = localStorage.getItem('ranchillo_theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    aplicarEstilosTema();
    actualizarIconosTema(savedTheme);

    // Inicializar Fondo de Perrito
    const savedBgImg = localStorage.getItem('ranchillo_bg_image') === 'true';
    if (savedBgImg) {
        document.body.classList.add('theme-bg-image');
    }
    actualizarBotonFondo();


    const btn = document.getElementById('themeToggle');
    if (btn) {
        btn.addEventListener('click', () => {
            vibrar(15);
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('ranchillo_theme', newTheme);
            aplicarEstilosTema();
            actualizarIconosTema(newTheme);
        });
    }
}

function actualizarIconosTema(theme) {
    const sun = document.querySelector('.sun-icon');
    const moon = document.querySelector('.moon-icon');
    if (!sun || !moon) return;
    
    if (theme === 'dark') {
        sun.style.display = 'none';
        moon.style.display = 'block';
    } else {
        sun.style.display = 'block';
        moon.style.display = 'none';
    }
}


const DB_PREDETERMINADA = [
    { id: 1, nombre: "Ganacan Adulto 25kg", precio: 23000 },
    { id: 2, nombre: "Acomer Cachorro 10kg", precio: 16000 },
    { id: 3, nombre: "Excellent Adulto 15kg", precio: 28000 },
    { id: 4, nombre: "Alfa Dog Adulto 25kg", precio: 32000 },
    { id: 5, nombre: "Sanson Adulto 25kg", precio: 27000 },
    { id: 6, nombre: "Strong Adulto 25kg", precio: 33000 },
    { id: 7, nombre: "Masko Adulto 25kg", precio: 25000 },
    { id: 8, nombre: "Fit Fórmula Raza Pequeña 10kg", precio: 20000 },
    { id: 9, nombre: "Nomade Adulto Raza Pequeña 10kg", precio: 19000 },
    { id: 10, nombre: "Excellent Cachorro 15kg", precio: 37000 },
    { id: 11, nombre: "Pro Plan Raza Mediana 12kg", precio: 45000 },
    { id: 12, nombre: "Pro Plan Adulto 12kg", precio: 44000 },
    { id: 13, nombre: "Nomade Senior Raza Pequeña 9kg", precio: 20000 },
    { id: 14, nombre: "Fit Senior Raza Pequeña 10kg", precio: 23000 },
    { id: 15, nombre: "Cachupín Adulto 9kg", precio: 15000 },
    { id: 16, nombre: "Nomade Senior 15kg", precio: 30000 },
    { id: 17, nombre: "Sabrokan Cachorro 8kg", precio: 13000 },
    { id: 18, nombre: "Alimento Completo para Pollita 5kg", precio: 6000 },
    { id: 19, nombre: "Champion Dog 3kg", precio: 8000 },
    { id: 20, nombre: "Alimento Completo para Conejo 5kg", precio: 5000 },
    { id: 21, nombre: "Dog Chow 3kg", precio: 7000 },
    { id: 22, nombre: "Nomade Adulto 10kg", precio: 20000 },
    { id: 23, nombre: "Nomade Adulto 20kg", precio: 31000 },
    { id: 24, nombre: "Nomade Cachorro 10kg", precio: 22000 },
    { id: 25, nombre: "Tito Perro Adulto 25kg", precio: 18000 },
    { id: 26, nombre: "Economican Adulto 25kg", precio: 19000 },
    { id: 27, nombre: "Pedigree Senior 21kg", precio: 39000 },
    { id: 28, nombre: "Alfa Dog Adulto 20kg", precio: 32000 },
    { id: 29, nombre: "Fit Fórmula Adulto 20kg", precio: 35000 },
    { id: 30, nombre: "Fit Senior 20kg", precio: 42000 },
    { id: 31, nombre: "Fit Cachorro 10kg", precio: 20000 },
    { id: 32, nombre: "Cachupín Adulto 25kg", precio: 28000 },
    { id: 33, nombre: "Sabrokan 25kg", precio: 24500 },
    { id: 34, nombre: "Champion Adulto 18kg", precio: 24000 },
    { id: 35, nombre: "Champion Senior 18kg", precio: 24000 },
    { id: 36, nombre: "Champion Adulto Raza Pequeña 18kg", precio: 24000 },
    { id: 37, nombre: "Champion Cachorro 18kg", precio: 24000 },
    { id: 38, nombre: "Master Dog Cachorro 18kg", precio: 27000 },
    { id: 39, nombre: "XT 21 Adulto 25kg", precio: 27500 },
    { id: 40, nombre: "Master Dog Adulto 18kg", precio: 27000 },
    { id: 41, nombre: "Himalaya Adulto 18kg", precio: 27000 },
    { id: 42, nombre: "Himalaya Cachorro 18kg", precio: 27000 },
    { id: 43, nombre: "Mastín Senior 20kg", precio: 33000 },
    { id: 44, nombre: "Mastín Madre y Cachorro 15kg", precio: 23500 },
    { id: 45, nombre: "Mastín Adulto 22kg", precio: 30000 },
    { id: 46, nombre: "Acomer Adulto 25kg", precio: 29000 },
    { id: 47, nombre: "Master Dog Adulto Raza Pequeña 8kg", precio: 16000 },
    { id: 48, nombre: "Master Dog Senior 8kg", precio: 16000 },
    { id: 49, nombre: "Economicat 8kg", precio: 12000 },
    { id: 50, nombre: "Champion Cat 20kg", precio: 38000 },
    { id: 51, nombre: "Molidog 20kg", precio: 11500 },
    { id: 52, nombre: "Happy Dog 20kg", precio: 13000 },
    { id: 53, nombre: "Harinilla de Arroz 25kg", precio: 8000 },
    { id: 54, nombre: "Harinilla Trigo 25kg", precio: 8000 },
    { id: 55, nombre: "Harinilla de Trigo 25kg", precio: 7000 },
    { id: 56, nombre: "Harina Molino Longaví 25kg", precio: 16000 },
    { id: 57, nombre: "Conejo Mantención 25kg", precio: 15000 },
    { id: 58, nombre: "Cerdo Crianza 25kg", precio: 16000 },
    { id: 59, nombre: "Performance Training 25kg", precio: 18000 },
    { id: 60, nombre: "Performance Sweet Feed 25kg", precio: 18000 },
    { id: 61, nombre: "Concentrado 20kg", precio: 8000 },
    { id: 62, nombre: "Ponedora Inicial 25kg", precio: 16000 },
    { id: 63, nombre: "Ponedora Final 25kg", precio: 15000 },
    { id: 64, nombre: "Recría 25kg", precio: 17000 },
    { id: 65, nombre: "Maíz 25kg", precio: 8000 },
    { id: 66, nombre: "Chancao 20kg", precio: 7000 },
    { id: 67, nombre: "Afrechillo 25kg", precio: 7000 },
    { id: 68, nombre: "Sobre Champion Dog", precio: 600 },
    { id: 69, nombre: "Casa para Mascota", precio: 10000 },
    { id: 70, nombre: "Confort Suan 20 Metros", precio: 9000 },
    { id: 71, nombre: "Confort Elite 50 Metros", precio: 18000 },
    { id: 72, nombre: "Confort Elite 20 Metros", precio: 10000 },
    { id: 73, nombre: "Detergente", precio: 3000 },
    { id: 74, nombre: "Cloro", precio: 2000 },
    { id: 75, nombre: "Plato Pet Bowl", precio: 4000 },
    { id: 76, nombre: "Plato Plástico Doble", precio: 2500 },
    { id: 77, nombre: "Plato Plástico", precio: 2000 },
    { id: 78, nombre: "Bloqueador Juguete Perro", precio: 2000 },
    { id: 79, nombre: "Botella con Pelota Juguete", precio: 3000 },
    { id: 80, nombre: "Hueso Juguete", precio: 2000 },
    { id: 81, nombre: "Plástico con Cordel Juguete Perro", precio: 2000 },
    { id: 82, nombre: "Hueso Juguete Goma", precio: 2500 },
    { id: 83, nombre: "Pino de Bolos Juguete Perro", precio: 2000 },
    { id: 84, nombre: "Comida Plástica Juguete", precio: 2500 },
    { id: 85, nombre: "3 Pelotas Rosadas", precio: 3000 },
    { id: 86, nombre: "3 Pelotas Naranjas", precio: 3000 },
    { id: 87, nombre: "Ropa Chica Talla 1-3", precio: 2500 },
    { id: 88, nombre: "Ropa Grande Talla 4-6", precio: 3500 },
    { id: 89, nombre: "Juguete Rosquilla Perro", precio: 2000 },
    { id: 90, nombre: "Pelota con Dientes Juguete", precio: 2000 },
    { id: 91, nombre: "Pelotas Deportivas Juguete", precio: 2000 },
    { id: 92, nombre: "Aro Masticable Juguete", precio: 2000 },
    { id: 93, nombre: "Pelota Sonido Juguete", precio: 2000 },
    { id: 94, nombre: "Collar Largo con Puntas", precio: 2500 },
    { id: 95, nombre: "Collar Brillante con Estrellas", precio: 2500 },
    { id: 96, nombre: "Collar con un Perro", precio: 2500 },
    { id: 97, nombre: "Collar con Cuadrados", precio: 2500 },
    { id: 98, nombre: "Collar con Corazones", precio: 2500 },
    { id: 99, nombre: "Collar Chico", precio: 2000 },
    { id: 100, nombre: "Collar para Nombre", precio: 2500 },
    { id: 101, nombre: "Collar Chico con Pañuelo", precio: 2000 },
    { id: 102, nombre: "Collar con Pañuelo", precio: 2500 },
    { id: 103, nombre: "Collar Mediano con Puntas", precio: 2500 },
    { id: 104, nombre: "Collar Grande con Pañuelo", precio: 3000 },
    { id: 105, nombre: "Collar Grande Grueso", precio: 2500 },
    { id: 106, nombre: "Collar Diseño de Flores Blanco/Negro", precio: 2500 },
    { id: 107, nombre: "Collar Diseño Perros Mirando", precio: 2000 },
    { id: 108, nombre: "Collar Pañuelo Diseños", precio: 2000 },
    { id: 109, nombre: "Collar Brillante con Corazón", precio: 2000 },
    { id: 110, nombre: "Collar Brillante Azul con Corazón", precio: 2000 },
    { id: 111, nombre: "Renovador de Goma", precio: 2000 },
    { id: 112, nombre: "Renovador de Goma con Tirador", precio: 3000 },
    { id: 113, nombre: "Desengrasante", precio: 2500 },
    { id: 114, nombre: "Shampoo Auto", precio: 2000 },
    { id: 115, nombre: "Cera Auto", precio: 2500 },
    { id: 116, nombre: "Silicona", precio: 2500 },
    { id: 117, nombre: "Desodorante Ambiental", precio: 2500 },
    { id: 118, nombre: "Renovador de Goma 5 Litros", precio: 6000 },
    { id: 119, nombre: "Escoba", precio: 7000 },
    { id: 120, nombre: "Cama Chica", precio: 7500 },
    { id: 121, nombre: "Cama Grande", precio: 10000 },
    { id: 122, nombre: "Manga Arroz 10kg", precio: 7000 }
];

function cargarBaseDatosPredeterminada() {
    vibrar(30);
    if (confirm('⚠️ Esta acción reemplazará tu catálogo actual por la base de datos predeterminada de 122 productos. ¿Deseas continuar?')) {
        productos = [...DB_PREDETERMINADA];
        guardarDatos();
        actualizarTablaModalProductos();
        actualizarSelectProductos();
        showToast('📥 Base de datos cargada');
        vibrar(50);
    }
}

// --- ASIGNACIONES DE CONTEXTO GLOBAL PARA ELEMENTOS HTML ---
window.cambiarTab = cambiarTab;
window.abrirModalRegistro = abrirModalRegistro;
window.cerrarModalRegistro = cerrarModalRegistro;
window.registrarVenta = registrarVenta;
window.eliminarVentas = eliminarVentas;
window.eliminarVenta = eliminarVenta;
window.enviarWhatsApp = enviarWhatsApp;
window.guardarProducto = guardarProducto;
window.eliminarProducto = eliminarProducto;
window.cambiarCantidad = cambiarCantidad;
window.filtrarVentas = filtrarVentas;
window.cerrarBannerInstalacion = cerrarBannerInstalacion;
window.cargarBaseDatosPredeterminada = cargarBaseDatosPredeterminada;
window.ajustarPrecio = ajustarPrecio;
window.cambiarPaleta = cambiarPaleta;
window.setTemaManual = setTemaManual;
window.toggleFondoPerrito = toggleFondoPerrito;
window.togglePaletteDropdown = togglePaletteDropdown;

// Iniciar aplicación
document.addEventListener('DOMContentLoaded', inicializar);
