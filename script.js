/* ==========================================================================
   Optimum Performance — Immersive Experience
   Page loader, scroll progress, word reveals, cursor glow, ambient shapes
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');
    const navAnchors = navLinks.querySelectorAll('a');
    const revealElements = document.querySelectorAll('.reveal');
    const parallaxSections = document.querySelectorAll('[data-parallax]');
    const tiltCards = document.querySelectorAll('.tilt-card');
    const scrollProgress = document.getElementById('scrollProgress');
    const pageLoader = document.getElementById('pageLoader');
    const heroGlow = document.getElementById('heroGlow');

    // --- Page Loader ---
    document.body.classList.add('loading');

    const loaderFill = pageLoader.querySelector('.loader-fill');
    let loadProgress = 0;
    const loadInterval = setInterval(() => {
        loadProgress += Math.random() * 25 + 10;
        if (loadProgress > 100) loadProgress = 100;
        loaderFill.style.width = loadProgress + '%';
        if (loadProgress >= 100) {
            clearInterval(loadInterval);
            setTimeout(() => {
                pageLoader.classList.add('done');
                document.body.classList.remove('loading');
            }, 400);
        }
    }, 200);

    // --- Scroll Progress Bar ---
    const updateScrollProgress = () => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        scrollProgress.style.width = progress + '%';
    };

    window.addEventListener('scroll', updateScrollProgress, { passive: true });

    // --- Sticky Navbar ---
    const handleScroll = () => {
        if (window.scrollY > 300) {
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

    // --- Word-by-Word Title Reveal ---
    document.querySelectorAll('[data-word-reveal]').forEach(title => {
        const text = title.textContent.trim();
        title.textContent = '';
        text.split(/\s+/).forEach((word, i) => {
            const span = document.createElement('span');
            span.classList.add('word');
            span.textContent = word;
            span.style.transitionDelay = (i * 0.12) + 's';
            title.appendChild(span);
            if (i < text.split(/\s+/).length - 1) {
                title.appendChild(document.createTextNode('\u00A0'));
            }
        });
    });

    // --- Staggered Reveal Animations ---
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;

                // Trigger word reveals inside this element
                el.querySelectorAll('.word').forEach(word => {
                    word.classList.add('word-visible');
                });

                // Find stagger siblings within same parent
                if (el.classList.contains('stagger')) {
                    const parent = el.parentElement;
                    const staggerChildren = parent.querySelectorAll('.stagger');
                    staggerChildren.forEach((child, i) => {
                        setTimeout(() => {
                            child.classList.add('visible');
                        }, i * 120);
                    });
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

    // Word reveal for non-.reveal titles (like CEO section)
    const wordTitleObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.querySelectorAll('.word').forEach(word => {
                    word.classList.add('word-visible');
                });
                wordTitleObserver.unobserve(entry.target);
            }
        });
    }, { rootMargin: '0px 0px -60px 0px', threshold: 0.1 });

    document.querySelectorAll('[data-word-reveal]:not(.reveal)').forEach(el => {
        wordTitleObserver.observe(el);
    });

    // --- Advantage Line Animation ---
    const advantageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const parent = entry.target.parentElement;
                const items = parent.querySelectorAll('.advantage-item');
                items.forEach((item, i) => {
                    setTimeout(() => {
                        item.classList.add('line-visible');
                    }, i * 150);
                });
                items.forEach(item => advantageObserver.unobserve(item));
            }
        });
    }, { rootMargin: '0px 0px -60px 0px', threshold: 0.1 });

    document.querySelectorAll('.advantage-item').forEach(el => {
        advantageObserver.observe(el);
    });

    // --- Parallax Effect ---
    const handleParallax = () => {
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

    // --- 3D Tilt Cards with Cursor Glow ---
    tiltCards.forEach(card => {
        // Add glow element
        const glow = document.createElement('div');
        glow.classList.add('card-glow');
        card.appendChild(glow);

        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * -6;
            const rotateY = ((x - centerX) / centerX) * 6;
            card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;

            // Move glow
            glow.style.left = x + 'px';
            glow.style.top = y + 'px';
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(800px) rotateX(0) rotateY(0) scale(1)';
        });
    });

    // --- Hero Mouse-Following Glow ---
    if (heroGlow) {
        const hero = document.getElementById('hero');
        hero.addEventListener('mousemove', (e) => {
            const rect = hero.getBoundingClientRect();
            heroGlow.style.left = (e.clientX - rect.left) + 'px';
            heroGlow.style.top = (e.clientY - rect.top) + 'px';
        });
    }

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

    // --- Section Ambient Shapes ---
    document.querySelectorAll('.section-shapes').forEach(container => {
        const count = 3 + Math.floor(Math.random() * 3);
        for (let i = 0; i < count; i++) {
            const shape = document.createElement('div');
            shape.classList.add('shape');
            const size = 80 + Math.random() * 200;
            shape.style.width = size + 'px';
            shape.style.height = size + 'px';
            shape.style.left = Math.random() * 100 + '%';
            shape.style.top = Math.random() * 100 + '%';
            shape.style.animationDelay = (Math.random() * 10) + 's';
            shape.style.animationDuration = (20 + Math.random() * 20) + 's';
            container.appendChild(shape);
        }
    });

    // --- Stats Counter Animation ---
    const statNumbers = document.querySelectorAll('.stat-number[data-count]');

    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const target = parseInt(el.dataset.count);
                const duration = 2000;
                const startTime = performance.now();

                const animate = (currentTime) => {
                    const elapsed = currentTime - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    const eased = 1 - Math.pow(1 - progress, 3);
                    el.textContent = Math.floor(target * eased);
                    if (progress < 1) {
                        requestAnimationFrame(animate);
                    } else {
                        el.textContent = target;
                    }
                };

                requestAnimationFrame(animate);
                counterObserver.unobserve(el);
            }
        });
    }, { rootMargin: '0px 0px -60px 0px', threshold: 0.1 });

    statNumbers.forEach(el => counterObserver.observe(el));

    // --- Language Toggle ---
    const langToggle = document.getElementById('langToggle');
    if (langToggle) {
        langToggle.addEventListener('click', () => {
            const active = langToggle.querySelector('.lang-active');
            const inactive = langToggle.querySelector('.lang-inactive');
            const currentActive = active.textContent;
            active.textContent = inactive.textContent;
            inactive.textContent = currentActive;
        });
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
