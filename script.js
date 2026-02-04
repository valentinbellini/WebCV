document.addEventListener('DOMContentLoaded', () => {
    
    // --- LÓGICA DE FILTRADO DE PROYECTOS ---
    const filterButtons = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Actualizar clase activa visualmente
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            const filterValue = button.getAttribute('data-filter');

            projectCards.forEach(card => {
                const cardCategory = card.getAttribute('data-category');
                
                if (filterValue === 'all' || cardCategory === filterValue) {
                    card.classList.remove('hidden');
                    // Pequeña animación de entrada (opcional)
                    card.style.opacity = '0';
                    setTimeout(() => card.style.opacity = '1', 50);
                } else {
                    card.classList.add('hidden');
                }
            });
        });
    });

    // --- LÓGICA DE MODO CLARO / OSCURO ---
    const themeToggle = document.getElementById('theme-toggle');
    const htmlElement = document.documentElement;
    const icon = themeToggle.querySelector('i');

    // 1. Revisar si hay una preferencia guardada en el navegador
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme) {
        htmlElement.setAttribute('data-theme', savedTheme);
        updateIcon(savedTheme);
    } else if (prefersDark) {
        htmlElement.setAttribute('data-theme', 'dark');
        updateIcon('dark');
    }

    // 2. Evento Click
    themeToggle.addEventListener('click', () => {
        const currentTheme = htmlElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        htmlElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme); // Guardar preferencia
        updateIcon(newTheme);
    });

    function updateIcon(theme) {
        if (theme === 'dark') {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun'); // Mostrar sol para cambiar a claro
        } else {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon'); // Mostrar luna para cambiar a oscuro
        }
    }

    // --- MENÚ HAMBURGUESA ---
    const menuToggle = document.querySelector('#mobile-menu');
    const navLinks = document.querySelector('.nav-links');

    // 1. Abrir / Cerrar menú al tocar el icono
    menuToggle.addEventListener('click', () => {
        menuToggle.classList.toggle('is-active'); // Anima el icono
        navLinks.classList.toggle('active');      // Desliza el menú
    });

    // 2. Cerrar el menú automáticamente al hacer clic en un enlace
    // (Mejora UX: el usuario elige "Projects" y el menú se quita solo)
    const navItems = document.querySelectorAll('.nav-links a');
    
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            if (navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                menuToggle.classList.remove('is-active');
            }
        });
    });

});