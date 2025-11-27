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
    const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzT53rll12oXQK3TLVe6hZGvImWX-VryRDb5KpuFf8qn4a8E2AIMiQyVHNwO8l9SlF6qA/exec";

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
    /* =========================================
       5. SISTEMA DE COMENTARIOS Y ESTRELLAS
    ========================================= */
    
    // 1. Lógica de las Estrellas (Visual)
    const stars = document.querySelectorAll('.star');
    const ratingInput = document.getElementById('rating-value');

    stars.forEach(star => {
        star.addEventListener('click', () => {
            const value = parseInt(star.getAttribute('data-value'));
            ratingInput.value = value; // Guardamos el valor (1 al 5)
            
            // Pintamos las estrellas
            stars.forEach(s => {
                if (parseInt(s.getAttribute('data-value')) <= value) {
                    s.classList.add('active');
                } else {
                    s.classList.remove('active');
                }
            });
        });
    });
    
    // Iniciar con 5 estrellas marcadas por defecto
    stars.forEach(s => s.classList.add('active'));

    // 2. Enviar el comentario
    const btnEnviar = document.getElementById('btn-enviar-review');
    
    if (btnEnviar) {
        btnEnviar.addEventListener('click', () => {
            const nombre = document.getElementById('comment-name').value.trim();
            const mensaje = document.getElementById('comment-text').value.trim();
            const estrellas = ratingInput.value;

            if (nombre === "" || mensaje === "") {
                alert("Por favor completá tu nombre y el mensaje.");
                return;
            }

            // Feedback visual de carga
            const textoOriginal = btnEnviar.innerHTML;
            btnEnviar.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> ENVIANDO...';
            btnEnviar.disabled = true;

            // Preparamos el paquete de datos
            const datosReview = {
                nombre: nombre,
                mensaje: mensaje,
                estrellas: estrellas
            };

            // Enviamos con POST (método especial para guardar)
            fetch(SCRIPT_URL, {
                method: 'POST',
                body: JSON.stringify(datosReview)
            })
            .then(response => response.json())
            .then(data => {
                if (data.resultado === "exito") {
                    alert("¡Gracias! Tu comentario se guardó correctamente.");
                    // Limpiamos el formulario
                    document.getElementById('comment-name').value = "";
                    document.getElementById('comment-text').value = "";
                } else {
                    alert("Hubo un error al guardar. Intenta de nuevo.");
                }
            })
            .catch(error => {
                console.error("Error:", error);
                alert("Error de conexión.");
            })
            .finally(() => {
                btnEnviar.innerHTML = textoOriginal;
                btnEnviar.disabled = false;
            });
        });
    }
   /* =========================================
       6. CARGAR COMENTARIOS + SWIPER INFINITO
    ========================================= */
    const reviewsContainer = document.getElementById('reviews-container');

    if (reviewsContainer) {
        // 1. Pedimos comentarios
        fetch(`${SCRIPT_URL}?action=comentarios`)
            .then(response => response.json())
            .then(data => {
                // Preparamos los comentarios (Reales + Ejemplos para que no quede vacío)
                let comentariosAmostrar = [];
                
                // Si hay reales, los ponemos primero
                if (data.tipo === "comentarios" && data.datos.length > 0) {
                    comentariosAmostrar = data.datos;
                }
                
                // Agregamos algunos ejemplos fijos si hay pocos reales (para rellenar el slider)
                if (comentariosAmostrar.length < 3) {
                    comentariosAmostrar.push(
                        { nombre: "Lucas M.", mensaje: "Mi PC volaba de temperatura. Ahora corre a 144fps estables.", puntos: 5, esEjemplo: true },
                        { nombre: "Sofía R.", mensaje: "Armé mi setup con ellos. El cable management quedó impecable.", puntos: 5, esEjemplo: true },
                        { nombre: "Matías G.", mensaje: "Revivieron mi notebook vieja para la facultad.", puntos: 4, esEjemplo: true }
                    );
                }

                // 2. Generamos el HTML (Slide por Slide)
                comentariosAmostrar.forEach(review => {
                    let estrellasHTML = '';
                    for (let i = 1; i <= 5; i++) {
                        estrellasHTML += (i <= review.puntos) ? '<i class="fa-solid fa-star"></i>' : '<i class="fa-regular fa-star"></i>';
                    }
                    
                    // Definimos colores según si es real o ejemplo
                    const bordeColor = review.esEjemplo ? '#00e5ff' : '#00e5ff'; // Puedes cambiarlo si quieres distinguir
                    const badgeHTML = review.esEjemplo 
                        ? `<span class="reviewer-badge">GAMER</span>`
                        : `<span class="reviewer-badge" style="background: rgba(0, 229, 255, 0.1); color: #00e5ff;">CLIENTE VERIFICADO</span>`;

                    const slideHTML = `
                    <div class="swiper-slide">
                        <div class="review-card" style="border-left-color: ${bordeColor};">
                            <div class="stars" style="color: #FFD700;">${estrellasHTML}</div>
                            <p class="review-text">"${review.mensaje}"</p>
                            <div class="reviewer">
                                <span class="reviewer-name">${review.nombre}</span>
                                ${badgeHTML}
                            </div>
                        </div>
                    </div>`;
                    
                    reviewsContainer.innerHTML += slideHTML;
                });

                // 3. INICIAMOS SWIPER (LA MAGIA)
                new Swiper(".mySwiper", {
                    slidesPerView: 1, // En celular se ve 1
                    spaceBetween: 30,
                    loop: true, // ¡ESTO HACE EL EFECTO INFINITO!
                    autoplay: {
                        delay: 3000,
                        disableOnInteraction: false,
                    },
                    pagination: {
                        el: ".swiper-pagination",
                        clickable: true,
                    },
                    navigation: {
                        nextEl: ".swiper-button-next",
                        prevEl: ".swiper-button-prev",
                    },
                    breakpoints: {
                        768: {
                            slidesPerView: 2, // Tablet: 2 tarjetas
                        },
                        1024: {
                            slidesPerView: 3, // PC: 3 tarjetas
                        },
                    },
                });

            })
            .catch(error => console.error("Error Swiper:", error));
    }
});