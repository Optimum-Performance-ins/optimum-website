/* ==========================================================================
   Optimum Performance — Scripts
   Smooth scroll, sticky nav, fade-in animations, mobile menu
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');
    const navAnchors = navLinks.querySelectorAll('a');
    const fadeElements = document.querySelectorAll('.fade-in');

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

    // --- Mobile Menu Toggle ---
    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('active');
        navLinks.classList.toggle('open');
    });

    // Close mobile menu on link click
    navAnchors.forEach(anchor => {
        anchor.addEventListener('click', () => {
            navToggle.classList.remove('active');
            navLinks.classList.remove('open');
        });
    });

    // Close mobile menu on outside click
    document.addEventListener('click', (e) => {
        if (!navbar.contains(e.target) && navLinks.classList.contains('open')) {
            navToggle.classList.remove('active');
            navLinks.classList.remove('open');
        }
    });

    // --- Scroll-triggered Fade-in Animations ---
    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -60px 0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    fadeElements.forEach(el => observer.observe(el));

    // --- Smooth Scroll for Nav Links (fallback for older browsers) ---
    navAnchors.forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            const href = anchor.getAttribute('href');
            if (href && href.startsWith('#')) {
                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    const navHeight = navbar.offsetHeight;
                    const targetPosition = target.getBoundingClientRect().top + window.scrollY - navHeight;
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    // Also handle the scroll indicator and footer links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        if (!anchor.closest('.nav-links')) {
            anchor.addEventListener('click', (e) => {
                const href = anchor.getAttribute('href');
                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    const navHeight = navbar.offsetHeight;
                    const targetPosition = target.getBoundingClientRect().top + window.scrollY - navHeight;
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        }
    });

});
