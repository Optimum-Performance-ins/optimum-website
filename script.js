/* ==========================================================================
   Optimum Performance — Dynamic & Immersive
   Parallax, staggered reveals, particles, tilt cards, active nav
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');
    const navAnchors = navLinks.querySelectorAll('a');
    const revealElements = document.querySelectorAll('.reveal');
    const parallaxSections = document.querySelectorAll('[data-parallax]');
    const tiltCards = document.querySelectorAll('.tilt-card');

    // --- Sticky Navbar ---
    const handleScroll = () => {
        if (window.scrollY > 60) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    // --- Active Nav Highlighting ---
    const sections = document.querySelectorAll('section[id]');

    const updateActiveNav = () => {
        const scrollY = window.scrollY + 120;
        sections.forEach(section => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            const id = section.getAttribute('id');
            const link = navLinks.querySelector(`a[href="#${id}"]`);
            if (link) {
                if (scrollY >= top && scrollY < top + height) {
                    link.classList.add('active');
                } else {
                    link.classList.remove('active');
                }
            }
        });
    };

    window.addEventListener('scroll', updateActiveNav, { passive: true });
    updateActiveNav();

    // --- Mobile Menu Toggle ---
    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('active');
        navLinks.classList.toggle('open');
    });

    navAnchors.forEach(anchor => {
        anchor.addEventListener('click', () => {
            navToggle.classList.remove('active');
            navLinks.classList.remove('open');
        });
    });

    document.addEventListener('click', (e) => {
        if (!navbar.contains(e.target) && navLinks.classList.contains('open')) {
            navToggle.classList.remove('active');
            navLinks.classList.remove('open');
        }
    });

    // --- Staggered Reveal Animations ---
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;

                // Find stagger siblings within same parent
                if (el.classList.contains('stagger')) {
                    const parent = el.parentElement;
                    const staggerChildren = parent.querySelectorAll('.stagger');
                    staggerChildren.forEach((child, i) => {
                        setTimeout(() => {
                            child.classList.add('visible');
                        }, i * 120);
                    });
                    // Unobserve all siblings
                    staggerChildren.forEach(child => revealObserver.unobserve(child));
                } else {
                    const delay = parseInt(el.dataset.delay) || 0;
                    setTimeout(() => {
                        el.classList.add('visible');
                    }, delay);
                    revealObserver.unobserve(el);
                }
            }
        });
    }, {
        root: null,
        rootMargin: '0px 0px -80px 0px',
        threshold: 0.1
    });

    revealElements.forEach(el => revealObserver.observe(el));

    // --- Parallax Effect ---
    const handleParallax = () => {
        const scrollY = window.scrollY;
        parallaxSections.forEach(section => {
            const speed = parseFloat(section.dataset.parallax) || 0.2;
            const rect = section.getBoundingClientRect();
            const offset = (rect.top + rect.height / 2 - window.innerHeight / 2) * speed;
            const container = section.querySelector('.container');
            if (container) {
                container.style.transform = `translateY(${offset * 0.15}px)`;
            }
        });
    };

    window.addEventListener('scroll', handleParallax, { passive: true });

    // --- 3D Tilt Cards ---
    tiltCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * -6;
            const rotateY = ((x - centerX) / centerX) * 6;
            card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(800px) rotateX(0) rotateY(0) scale(1)';
        });
    });

    // --- Hero Particles ---
    const particleContainer = document.getElementById('particles');
    if (particleContainer) {
        for (let i = 0; i < 40; i++) {
            const particle = document.createElement('div');
            particle.classList.add('particle');
            particle.style.left = Math.random() * 100 + '%';
            particle.style.top = (50 + Math.random() * 50) + '%';
            particle.style.width = (2 + Math.random() * 3) + 'px';
            particle.style.height = particle.style.width;
            particle.style.animationDelay = Math.random() * 6 + 's';
            particle.style.animationDuration = (4 + Math.random() * 4) + 's';
            particleContainer.appendChild(particle);
        }
    }

    // --- Smooth Scroll ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            const href = anchor.getAttribute('href');
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                const navHeight = navbar.offsetHeight;
                const targetPosition = target.getBoundingClientRect().top + window.scrollY - navHeight;
                window.scrollTo({ top: targetPosition, behavior: 'smooth' });
            }
        });
    });

});
