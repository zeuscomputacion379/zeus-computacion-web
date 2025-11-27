document.addEventListener('DOMContentLoaded', () => {
    
    /* =========================================
       1. MENÚ HAMBURGUESA (MÓVIL)
    ========================================= */
    const menuToggle = document.getElementById('mobile-menu');
    const navLinks = document.querySelector('.nav-links');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            // Alternar la clase 'active' para mostrar/ocultar menú
            navLinks.classList.toggle('active');
            
            // Cambiar el icono de las 3 barras (fa-bars) a una X (fa-xmark)
            const icon = menuToggle.querySelector('i');
            if (navLinks.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-xmark'); // Necesitas FontAwesome 6 para este icono
            } else {
                icon.classList.remove('fa-xmark');
                icon.classList.add('fa-bars');
            }
        });
    }

    /* =========================================
       2. CERRAR MENÚ AL HACER CLICK EN UN LINK
    ========================================= */
    // Seleccionamos todos los enlaces dentro del menú
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            // Si el menú está abierto, lo cerramos
            if (navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                
                // Volvemos el icono a su estado original (barras)
                const icon = menuToggle.querySelector('i');
                icon.classList.remove('fa-xmark');
                icon.classList.add('fa-bars');
            }
        });
    });

    /* =========================================
       3. CONSULTA DE ESTADO (CONEXIÓN GOOGLE SHEETS)
    ========================================= */
    // CONEXIÓN CON TU GOOGLE SHEET (API ZEUS)
    const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxBstxBYHMHYQbjgzf0ohEUho-Ua2n1f9wuXsm80mNQ_OKtfkkM0PLhA3hIVpTugXfB/exec";

    const trackingBtn = document.querySelector('.tracking-form button');
    // Seleccionamos los inputs por su ID nuevo
    const inputOrden = document.getElementById('input-orden');
    const inputNombre = document.getElementById('input-nombre');
    let resultadoDiv = document.getElementById('resultado-busqueda');

    if (trackingBtn) {
        trackingBtn.addEventListener('click', (e) => {
            e.preventDefault(); 
            
            const ordenVal = inputOrden.value.trim();
            const nombreVal = inputNombre.value.trim();

            // Validación: Ambos campos son obligatorios
            if (ordenVal === "" || nombreVal === "") {
                alert("Por seguridad, debés ingresar el N° de Orden y tu Nombre.");
                return;
            }

            // UI de "Cargando..."
            const textoOriginal = trackingBtn.innerHTML;
            trackingBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> VERIFICANDO...';
            trackingBtn.disabled = true;
            
            if(resultadoDiv) resultadoDiv.style.display = 'none';

            // ENVIAMOS AMBOS DATOS: ?orden=XXX&nombre=YYY
            fetch(`${SCRIPT_URL}?orden=${ordenVal}&nombre=${nombreVal}`)
                .then(response => response.json())
                .then(data => {
                    if (!resultadoDiv) {
                        resultadoDiv = document.createElement('div');
                        resultadoDiv.id = 'resultado-busqueda';
                        resultadoDiv.className = 'tracking-result';
                        document.querySelector('.tracking-content').appendChild(resultadoDiv);
                    }

                    if (data.encontrado) {
                        // === SI COINCIDEN ORDEN Y NOMBRE ===
                        let colorEstado = "#00e5ff"; 
                        const estado = data.datos.estado.toLowerCase();
                        
                        if(estado.includes("entregado") || estado.includes("terminado")) colorEstado = "#25D366"; 
                        if(estado.includes("proceso") || estado.includes("revisión")) colorEstado = "#FFD700"; 
                        if(estado.includes("espera")) colorEstado = "#FF4444"; 

                        resultadoDiv.innerHTML = `
                            <div class="result-box" style="border-top: 4px solid ${colorEstado}">
                                <div class="result-header">
                                    <h3>ORDEN #${ordenVal}</h3>
                                    <span class="status-badge" style="background:${colorEstado}; color:#000;">
                                        ${data.datos.estado.toUpperCase()}
                                    </span>
                                </div>
                                
                                <div class="result-details">
                                    <p class="highlight-row"><strong>👤 Cliente:</strong> ${data.datos.cliente}</p>
                                    <p><strong>💻 Equipo:</strong> ${data.datos.equipo}</p>
                                    <p><strong>📅 Ingreso:</strong> ${data.datos.fechaIngreso}</p>
                                    <p><strong>⚠️ Motivo:</strong> ${data.datos.motivo}</p>
                                    
                                    <div class="timeline-box">
                                        <div class="timeline-item">
                                            <span>🔎 <strong>Diagnóstico (${data.datos.fechaRevision}):</strong></span>
                                            <p class="obs-text">"${data.datos.obsRevision || 'Sin observaciones'}"</p>
                                        </div>
                                        <div class="timeline-item">
                                            <span>✅ <strong>Trabajo Realizado (${data.datos.fechaTerminado}):</strong></span>
                                            <p class="obs-text">"${data.datos.obsFinal || 'En proceso'}"</p>
                                        </div>
                                    </div>

                                    ${data.datos.costo ? `
                                    <div class="cost-box">
                                        <span>TOTAL:</span>
                                        <span class="price-tag">$${data.datos.costo}</span>
                                    </div>
                                    ` : ''}

                                    ${data.datos.fechaEntrega !== '-' ? `<p class="date-delivery">🚀 Entregado el: ${data.datos.fechaEntrega}</p>` : ''}
                                    
                                    <div style="text-align: center; margin-top: 20px;">
                                        <button id="btn-limpiar" style="background: transparent; border: 1px solid #333; color: #888; padding: 5px 15px; cursor: pointer; border-radius: 4px; font-size: 0.8rem;">
                                            <i class="fa-solid fa-rotate-right"></i> Nueva Consulta
                                        </button>
                                    </div>
                                </div>
                            </div>
                        `;

                        // Lógica para el botón de limpiar (esto va justo después de cerrar el innerHTML)
                        setTimeout(() => {
                            document.getElementById('btn-limpiar').addEventListener('click', () => {
                                document.getElementById('input-orden').value = '';
                                document.getElementById('input-nombre').value = '';
                                resultadoDiv.style.display = 'none';
                                document.getElementById('input-orden').focus();
                            });
                        }, 100);
                    } else {
                        // === SI NO COINCIDEN ===
                        resultadoDiv.innerHTML = `
                            <div class="result-error">
                                <i class="fa-solid fa-lock"></i>
                                <p><strong>Datos incorrectos</strong></p>
                                <p class="sm-text">El número de orden o el nombre no coinciden con nuestros registros.</p>
                                <p class="sm-text">Por favor verificá o escribinos por WhatsApp.</p>
                            </div>
                        `;
                    }
                    resultadoDiv.style.display = 'block';
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert("Error de conexión.");
                })
                .finally(() => {
                    trackingBtn.innerHTML = textoOriginal;
                    trackingBtn.disabled = false;
                });
        });
    }
});