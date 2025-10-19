// Funcionalidad del menú de navegación
document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const mobileMenu = document.getElementById('mobile-menu');
    const navbarMenu = document.querySelector('.navbar-menu');
    const dropdowns = document.querySelectorAll('.dropdown');
    
    // Toggle del menú móvil
    if (mobileMenu && navbarMenu) {
        mobileMenu.addEventListener('click', function() {
            mobileMenu.classList.toggle('active');
            navbarMenu.classList.toggle('active');
        });
    }

    // Cerrar menú móvil al hacer click en un enlace
    const navLinks = document.querySelectorAll('.navbar-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (navbarMenu.classList.contains('active')) {
                mobileMenu.classList.remove('active');
                navbarMenu.classList.remove('active');
            }
        });
    });

    // Funcionalidad mejorada para dropdowns en móvil
    dropdowns.forEach(dropdown => {
        const toggle = dropdown.querySelector('.dropdown-toggle');
        const menu = dropdown.querySelector('.dropdown-menu');
        
        if (toggle && menu) {
            toggle.addEventListener('click', function(e) {
                // En dispositivos móviles, prevenir el comportamiento por defecto
                if (window.innerWidth <= 768) {
                    e.preventDefault();
                    
                    // Cerrar otros dropdowns abiertos
                    dropdowns.forEach(otherDropdown => {
                        if (otherDropdown !== dropdown) {
                            otherDropdown.classList.remove('active');
                        }
                    });
                    
                    // Toggle del dropdown actual
                    dropdown.classList.toggle('active');
                }
            });
        }
    });

    // Cerrar dropdowns al hacer click fuera
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.dropdown')) {
            dropdowns.forEach(dropdown => {
                dropdown.classList.remove('active');
            });
        }
    });

    // Smooth scroll para enlaces internos
    const internalLinks = document.querySelectorAll('a[href^="#"]');
    internalLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                e.preventDefault();
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Efecto de aparición progresiva para las tarjetas
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observar las tarjetas de operaciones
    const cards = document.querySelectorAll('.card-operacion');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = `opacity 0.6s ease ${index * 0.2}s, transform 0.6s ease ${index * 0.2}s`;
        observer.observe(card);
    });

    // Manejo responsivo del menú
    function handleResize() {
        if (window.innerWidth > 768) {
            // Limpiar clases de móvil en pantallas grandes
            mobileMenu.classList.remove('active');
            navbarMenu.classList.remove('active');
            dropdowns.forEach(dropdown => {
                dropdown.classList.remove('active');
            });
        }
    }

    window.addEventListener('resize', handleResize);

    // Añadir indicador visual al hover de los enlaces del menú
    const menuLinks = document.querySelectorAll('.navbar-link');
    menuLinks.forEach(link => {
        link.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
        });
        
        link.addEventListener('mouseleave', function() {
            if (!this.closest('.dropdown:hover')) {
                this.style.transform = 'translateY(0)';
            }
        });
    });

    // Funcionalidad adicional para mejorar la experiencia del usuario
    
    // Precargar páginas al hacer hover (opcional)
    const pageLinks = document.querySelectorAll('a[href$=".html"]');
    pageLinks.forEach(link => {
        link.addEventListener('mouseenter', function() {
            const href = this.getAttribute('href');
            if (href && !document.querySelector(`link[href="${href}"]`)) {
                const prefetchLink = document.createElement('link');
                prefetchLink.rel = 'prefetch';
                prefetchLink.href = href;
                document.head.appendChild(prefetchLink);
            }
        });
    });

    // Feedback visual para enlaces externos
    const externalLinks = document.querySelectorAll('a[href^="http"]');
    externalLinks.forEach(link => {
        link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener noreferrer');
        link.title = 'Se abre en nueva pestaña';
    });

    console.log('Menu de navegación inicializado correctamente');
});

// Función para destacar la página actual en el menú
function highlightCurrentPage() {
    const currentPath = window.location.pathname;
    const menuLinks = document.querySelectorAll('.navbar-link, .dropdown-menu a');
    
    menuLinks.forEach(link => {
        const linkPath = new URL(link.href, window.location.origin).pathname;
        if (linkPath === currentPath) {
            link.classList.add('active');
            // Si está en un dropdown, también marcar el padre
            const parentDropdown = link.closest('.dropdown');
            if (parentDropdown) {
                const parentLink = parentDropdown.querySelector('.dropdown-toggle');
                if (parentLink) {
                    parentLink.classList.add('active');
                }
            }
        }
    });
}

// Ejecutar al cargar la página
document.addEventListener('DOMContentLoaded', highlightCurrentPage);