/* ==========================================================================
   Optimum Performance — Lead Generation Website
   Tabs, accordion, form validation, scroll effects, translation
   ========================================================================== */

// --- Logo Intro Controller ---
// Plays only when the <head> pre-paint script added .intro-play (refresh / first open).
(function initIntro() {
    const root = document.documentElement;
    const overlay = document.getElementById('intro');
    if (!root.classList.contains('intro-play')) return;
    if (!overlay) { root.classList.remove('intro-play'); return; }

    let finished = false;
    const finish = () => {
        if (finished) return;
        finished = true;
        root.classList.remove('intro-play');          // unlock scroll, reveal nav logo
        overlay.remove();
        document.dispatchEvent(new CustomEvent('intro:done'));
    };

    const skip = () => {
        if (finished) return;
        overlay.classList.add('intro-skipped');        // 200ms opacity fade (CSS)
        setTimeout(finish, 200);
    };

    // Skip inputs: click/tap, scroll attempt, Escape
    overlay.addEventListener('click', skip);
    window.addEventListener('wheel', skip, { passive: true, once: true });
    window.addEventListener('touchmove', skip, { passive: true, once: true });
    window.addEventListener('keydown', (e) => { if (e.key === 'Escape') skip(); });

    // Final phase: FLIP glide into the nav logo (starts after the wordmark animation + hold)
    let glideStarted = false;
    const glide = () => {
        if (finished || glideStarted) return;
        glideStarted = true;
        try {
            const logo = overlay.querySelector('.intro-logo');
            const target = document.querySelector('.nav-logo img');
            const from = logo.getBoundingClientRect();
            const to = target.getBoundingClientRect();
            if (!to.width || !from.width) throw new Error('unmeasurable');
            const scale = to.height / from.height;
            logo.style.transformOrigin = 'top left';
            logo.style.transition = 'transform 0.8s cubic-bezier(0.65, 0.05, 0.36, 1)';
            logo.style.transform =
                'translate(' + (to.left - from.left) + 'px,' + (to.top - from.top) + 'px) ' +
                'scale(' + scale + ')';
            overlay.classList.add('intro-gliding');    // fades ::before bg (CSS, 0.3s delay)
            logo.addEventListener('transitionend', finish, { once: true });
            setTimeout(finish, 1200);                  // transitionend fallback
        } catch (e) {
            // Fallback: simple fade instead of glide
            overlay.classList.add('intro-skipped');
            setTimeout(finish, 250);
        }
    };

    // Primary trigger: timer matching the CSS timeline (wordmark write-on done ~3.2s + hold).
    // The group's own glow animationend accelerates it if the timeline ran late relative
    // to this script (letter animations bubble up too, so filter by target).
    setTimeout(glide, 3500);
    const wordmark = overlay.querySelector('.wordmark');
    if (wordmark) {
        wordmark.addEventListener('animationend', (e) => {
            if (e.target === wordmark) setTimeout(glide, 300);
        });
    }

    setTimeout(finish, 6000);                          // absolute safety net
})();

document.addEventListener('DOMContentLoaded', () => {

    // --- Device Capability Detection ---
    const isLowEnd = (navigator.deviceMemory && navigator.deviceMemory < 2) ||
                     (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2) ||
                     (navigator.connection && navigator.connection.effectiveType === '2g');

    if (isLowEnd) {
        document.body.classList.add('low-end-device');
    }

    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');
    const navAnchors = navLinks.querySelectorAll('a');
    const revealElements = document.querySelectorAll('.reveal');
    const scrollProgress = document.getElementById('scrollProgress');

    // Defer entrance animations while the logo intro is playing
    const whenIntroDone = (fn) => {
        if (document.documentElement.classList.contains('intro-play')) {
            document.addEventListener('intro:done', fn, { once: true });
        } else {
            fn();
        }
    };

    // --- Combined Scroll Handler (RAF-throttled) ---
    const sections = document.querySelectorAll('section[id]');
    let scrollTicking = false;

    const onScroll = () => {
        if (scrollTicking) return;
        scrollTicking = true;
        requestAnimationFrame(() => {
            const scrollTop = window.scrollY;

            // Progress bar
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            scrollProgress.style.width = (docHeight > 0 ? (scrollTop / docHeight) * 100 : 0) + '%';

            // Sticky navbar
            navbar.classList.toggle('scrolled', scrollTop > 100);

            // Active nav highlighting
            const scrollY = scrollTop + 120;
            sections.forEach(section => {
                const top = section.offsetTop;
                const height = section.offsetHeight;
                const id = section.getAttribute('id');
                const link = navLinks.querySelector(`a[href="#${id}"]`);
                if (link) {
                    link.classList.toggle('active', scrollY >= top && scrollY < top + height);
                }
            });

            scrollTicking = false;
        });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

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
    const initWordReveal = () => {
        document.querySelectorAll('[data-word-reveal]').forEach(title => {
            if (title.querySelector('.word')) return;
            const nodes = [...title.childNodes];
            title.textContent = '';
            let wordIndex = 0;
            nodes.forEach(node => {
                if (node.nodeName === 'BR') {
                    title.appendChild(document.createElement('br'));
                    return;
                }
                const words = node.textContent.trim().split(/\s+/);
                words.forEach((word) => {
                    if (!word) return;
                    const span = document.createElement('span');
                    span.classList.add('word');
                    span.textContent = word;
                    span.style.transitionDelay = (wordIndex * 0.1) + 's';
                    title.appendChild(span);
                    title.appendChild(document.createTextNode('\u00A0'));
                    wordIndex++;
                });
            });
        });
    };

    initWordReveal();

    // --- Staggered Reveal Animations ---
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;

                el.querySelectorAll('.word').forEach(word => {
                    word.classList.add('word-visible');
                });

                if (el.classList.contains('stagger')) {
                    const parent = el.parentElement;
                    const staggerChildren = parent.querySelectorAll('.stagger');
                    staggerChildren.forEach((child, i) => {
                        setTimeout(() => {
                            child.classList.add('visible');
                        }, i * 100);
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
        rootMargin: '0px 0px -60px 0px',
        threshold: 0.1
    });

    whenIntroDone(() => revealElements.forEach(el => revealObserver.observe(el)));

    // Word reveal for non-.reveal titles
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

    whenIntroDone(() => {
        document.querySelectorAll('[data-word-reveal]:not(.reveal)').forEach(el => {
            wordTitleObserver.observe(el);
        });
    });

    // --- Hero Particles ---
    const particleContainer = document.getElementById('particles');
    if (particleContainer && !isLowEnd) {
        whenIntroDone(() => {
            const particleCount = window.innerWidth < 768 ? 10 : 30;
            for (let i = 0; i < particleCount; i++) {
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
        });
    }

    // --- Section Ambient Shapes ---
    const isMobile = window.innerWidth < 768;
    document.querySelectorAll('.section-shapes').forEach(container => {
        const count = isLowEnd ? 0 : (isMobile ? 2 : 4 + Math.floor(Math.random() * 3));
        for (let i = 0; i < count; i++) {
            const shape = document.createElement('div');
            shape.classList.add('shape');
            const size = 100 + Math.random() * 250;
            shape.style.width = size + 'px';
            shape.style.height = size + 'px';
            shape.style.left = (Math.random() * 120 - 10) + '%';
            // Spread shapes across full range including edges that cross into adjacent sections
            const edgeBias = Math.random();
            if (edgeBias < 0.3) {
                shape.style.top = (-15 + Math.random() * 30) + '%'; // near top edge
            } else if (edgeBias > 0.7) {
                shape.style.top = (70 + Math.random() * 30) + '%'; // near bottom edge
            } else {
                shape.style.top = (20 + Math.random() * 60) + '%'; // middle
            }
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

    // --- Pause logo marquees while off-screen ---
    const marquees = document.querySelectorAll('.logo-marquee');
    if (marquees.length) {
        const marqueeObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                entry.target.classList.toggle('is-paused', !entry.isIntersecting);
            });
        }, { rootMargin: '100px 0px' });

        marquees.forEach(el => marqueeObserver.observe(el));
    }

    // --- Testimonial Carousel ---
    // Endless loop: a full set of cloned cards sits on each side of the real ones. Native
    // scroll-snap does the sliding (and touch swipe); once a scroll settles inside a clone
    // set, the track jumps invisibly back to the matching real card.
    document.querySelectorAll('[data-carousel]').forEach(carousel => {
        const track = carousel.querySelector('[data-carousel-track]');
        const cards = Array.from(track.children);
        const total = cards.length;
        const prevBtn = carousel.querySelector('[data-carousel-prev]');
        const nextBtn = carousel.querySelector('[data-carousel-next]');
        const dotsWrap = carousel.querySelector('[data-carousel-dots]');
        const isRTL = getComputedStyle(track).direction === 'rtl';
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (total < 2) return;

        const makeClone = (card) => {
            const clone = card.cloneNode(true);
            clone.setAttribute('aria-hidden', 'true');
            clone.inert = true;
            return clone;
        };
        track.prepend(...cards.map(makeClone));
        track.append(...cards.map(makeClone));
        const slides = Array.from(track.children);

        // Section may be un-laid-out under content-visibility: auto, so never return 0
        const step = () => Math.max(1, Math.abs(slides[1].offsetLeft - slides[0].offsetLeft));
        const rawIndex = () => Math.round(Math.abs(track.scrollLeft) / step());
        const toLeft = (i) => (isRTL ? -1 : 1) * i * step();
        let active = 0;

        const jump = (i) => {
            track.style.scrollBehavior = 'auto';
            track.scrollLeft = toLeft(i);
            track.style.scrollBehavior = '';
        };
        const goTo = (i) => {
            if (reduceMotion) jump(i);
            else track.scrollTo({ left: toLeft(i), behavior: 'smooth' });
        };
        const move = (delta) => goTo(rawIndex() + delta);

        const dots = cards.map((_, n) => {
            const dot = document.createElement('button');
            dot.type = 'button';
            dot.className = 'carousel-dot';
            dot.setAttribute('aria-label', `${n + 1} / ${total}`);
            dot.addEventListener('click', () => {
                stopAutoplay();
                // Shortest way round the circle
                let d = n - active;
                if (d > total / 2) d -= total;
                if (d < -total / 2) d += total;
                move(d);
            });
            dotsWrap.appendChild(dot);
            return dot;
        });

        const update = () => {
            active = ((rawIndex() - total) % total + total) % total;
            dots.forEach((dot, n) => dot.setAttribute('aria-current', n === active ? 'true' : 'false'));
        };

        // Back into the real set once motion stops
        const settle = () => {
            const i = rawIndex();
            if (i < total || i >= total * 2) jump(total + active);
        };
        const recenter = () => { jump(total + active); update(); };

        // Autoplay: advance every 7s. Paused on hover/focus or off-screen,
        // stopped for good once the visitor navigates themselves.
        let timer = null;
        let inView = false;
        let hovering = false;
        let stopped = reduceMotion || isLowEnd;

        const tick = () => {
            if (!inView || hovering || document.hidden) return;
            move(1);
        };
        const syncAutoplay = () => {
            const run = !stopped && inView;
            if (run && !timer) timer = setInterval(tick, 7000);
            if (!run && timer) { clearInterval(timer); timer = null; }
        };
        const stopAutoplay = () => { stopped = true; syncAutoplay(); };

        prevBtn.addEventListener('click', () => { stopAutoplay(); move(-1); });
        nextBtn.addEventListener('click', () => { stopAutoplay(); move(1); });
        track.addEventListener('pointerdown', stopAutoplay);
        track.addEventListener('wheel', stopAutoplay, { passive: true });
        track.addEventListener('keydown', stopAutoplay);
        carousel.addEventListener('mouseenter', () => { hovering = true; });
        carousel.addEventListener('mouseleave', () => { hovering = false; });
        carousel.addEventListener('focusin', () => { hovering = true; });
        carousel.addEventListener('focusout', () => { hovering = false; });

        const hasScrollEnd = 'onscrollend' in window;
        let ticking = false;
        let settleTimer;
        track.addEventListener('scroll', () => {
            if (!hasScrollEnd) {
                clearTimeout(settleTimer);
                settleTimer = setTimeout(settle, 150);
            }
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(() => { update(); ticking = false; });
        }, { passive: true });
        if (hasScrollEnd) track.addEventListener('scrollend', settle);

        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(recenter, 150);
        });

        // First sighting: the track may only now have real layout, so line it up once
        let laidOut = false;
        new IntersectionObserver(entries => {
            inView = entries[0].isIntersecting;
            if (inView && !laidOut) { laidOut = true; recenter(); }
            syncAutoplay();
        }, { threshold: 0.4 }).observe(carousel);

        recenter();
    });

    // --- Segment Tab Switching ---
    const segmentTabs = document.querySelectorAll('.segment-tab');
    const segmentContents = document.querySelectorAll('.segment-content');

    segmentTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const segment = tab.dataset.segment;

            segmentTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            segmentContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === `segment-${segment}`) {
                    content.classList.add('active');
                    // Trigger reveal animations for newly visible cards
                    content.querySelectorAll('.reveal:not(.visible)').forEach(el => {
                        revealObserver.observe(el);
                    });
                }
            });
        });
    });

    // --- Service Card → Quote Form Pre-fill ---
    document.querySelectorAll('.service-card[data-service]').forEach(card => {
        card.style.cursor = 'pointer';
        card.addEventListener('click', (e) => {
            // Don't double-handle if the CTA link itself was clicked (it already navigates)
            if (e.target.closest('.card-cta')) {
                e.preventDefault();
            }

            const serviceValue = card.dataset.service;
            const clientType = card.dataset.clientType; // 'individual' or 'corporate'

            // Analytics: which service drives quote intent (non-PII)
            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push({
                event: 'service_card_quote_click',
                service: serviceValue,
                client_type: clientType
            });

            // 1. Select client type radio
            const radio = document.querySelector(`input[name="clientType"][value="${clientType}"]`);
            if (radio) {
                radio.checked = true;
                radio.dispatchEvent(new Event('change', { bubbles: true }));
            }

            // 2. After dropdown populates, select the insurance type
            setTimeout(() => {
                const insuranceSelect = document.getElementById('insuranceType');
                if (insuranceSelect) {
                    insuranceSelect.value = serviceValue;
                }
            }, 50);

            // 3. Scroll to quote section
            const quoteSection = document.getElementById('quote');
            if (quoteSection) {
                const navHeight = navbar.offsetHeight;
                const targetPosition = quoteSection.getBoundingClientRect().top + window.scrollY - navHeight;
                window.scrollTo({ top: targetPosition, behavior: 'smooth' });
            }
        });
    });

    // --- WhatsApp float → analytics ---
    const whatsappFloat = document.querySelector('.whatsapp-float');
    if (whatsappFloat) {
        whatsappFloat.addEventListener('click', () => {
            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push({ event: 'whatsapp_click' });
        });
    }

    // --- Dynamic Insurance Type Dropdown ---
    const clientTypeRadios = document.querySelectorAll('input[name="clientType"]');
    const insuranceTypeSelect = document.getElementById('insuranceType');
    const currentLang = document.documentElement.lang || 'en';

    const insuranceOptions = {
        individual: [
            { value: 'life-health', label: 'Medical Insurance' },
            { value: 'home', label: 'Home Insurance' },
            { value: 'motor', label: 'Motor Insurance' },
            { value: 'personal-accident', label: 'Personal Accident' }
        ],
        corporate: [
            { value: 'property', label: 'Property Insurance' },
            { value: 'employee-benefits', label: 'Employee Benefits' },
            { value: 'marine-cargo', label: 'Marine & Cargo Insurance' },
            { value: 'liability', label: 'Liability' },
            { value: 'cybersecurity', label: 'Cybersecurity Insurance' }
        ]
    };

    const insuranceOptionsAr = {
        individual: [
            { value: 'life-health', label: 'التأمين الطبي' },
            { value: 'home', label: 'تأمين المنزل' },
            { value: 'motor', label: 'تأمين السيارات' },
            { value: 'personal-accident', label: 'الحوادث الشخصية' }
        ],
        corporate: [
            { value: 'property', label: 'تأمين الممتلكات' },
            { value: 'employee-benefits', label: 'مزايا الموظفين' },
            { value: 'marine-cargo', label: 'التأمين البحري والشحن' },
            { value: 'liability', label: 'المسؤولية' },
            { value: 'cybersecurity', label: 'التأمين السيبراني' }
        ]
    };

    if (clientTypeRadios.length && insuranceTypeSelect) {
        clientTypeRadios.forEach(radio => radio.addEventListener('change', () => {
            const type = radio.value;
            const options = currentLang === 'ar' ? insuranceOptionsAr[type] : insuranceOptions[type];

            insuranceTypeSelect.innerHTML = '';

            const placeholder = document.createElement('option');
            placeholder.value = '';
            placeholder.disabled = true;
            placeholder.selected = true;
            placeholder.textContent = currentLang === 'ar' ? 'اختر نوع التأمين' : 'Select insurance type';
            insuranceTypeSelect.appendChild(placeholder);

            if (options) {
                options.forEach(opt => {
                    const option = document.createElement('option');
                    option.value = opt.value;
                    option.textContent = opt.label;
                    insuranceTypeSelect.appendChild(option);
                });
            }
        }));
    }

    // --- Accordion ---
    document.querySelectorAll('.accordion-header').forEach(header => {
        header.addEventListener('click', () => {
            const item = header.parentElement;
            const body = item.querySelector('.accordion-body');
            const isOpen = item.classList.contains('open');

            // Close all
            document.querySelectorAll('.accordion-item').forEach(i => {
                i.classList.remove('open');
                i.querySelector('.accordion-header').setAttribute('aria-expanded', 'false');
                i.querySelector('.accordion-body').style.maxHeight = null;
            });

            // Open clicked if it wasn't open
            if (!isOpen) {
                item.classList.add('open');
                header.setAttribute('aria-expanded', 'true');
                body.style.maxHeight = body.scrollHeight + 'px';
            }
        });
    });

    // --- Form Validation ---
    const quoteForm = document.getElementById('quoteForm');
    const formSuccess = document.getElementById('formSuccess');

    if (quoteForm) {
        quoteForm.addEventListener('submit', (e) => {
            e.preventDefault();
            let isValid = true;

            // Clear previous errors
            quoteForm.querySelectorAll('.form-group').forEach(group => {
                group.classList.remove('error');
            });

            // Validate required fields
            const fullName = document.getElementById('fullName');
            if (!fullName.value.trim()) {
                fullName.closest('.form-group').classList.add('error');
                isValid = false;
            }

            const email = document.getElementById('email');
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email.value.trim())) {
                email.closest('.form-group').classList.add('error');
                isValid = false;
            }

            const phone = document.getElementById('phone');
            if (!phone.value.trim()) {
                phone.closest('.form-group').classList.add('error');
                isValid = false;
            }

            const clientTypeChecked = document.querySelector('input[name="clientType"]:checked');
            if (!clientTypeChecked) {
                document.getElementById('clientType').closest('.form-group').classList.add('error');
                isValid = false;
            }

            const insuranceType = document.getElementById('insuranceType');
            if (!insuranceType.value) {
                insuranceType.closest('.form-group').classList.add('error');
                isValid = false;
            }

            if (isValid) {
                // Analytics conversion event (non-PII only).
                // NOTE: email submission is not wired yet — this currently fires on the
                // client-side success. When the Web3Forms fetch is added, MOVE this push
                // into the fetch success callback so it only fires on a real submission.
                window.dataLayer = window.dataLayer || [];
                window.dataLayer.push({
                    event: 'quote_form_submit',
                    insurance_type: insuranceType.value,
                    client_type: clientTypeChecked ? clientTypeChecked.value : ''
                });

                // Show success
                document.querySelector('.form-grid').style.display = 'none';
                formSuccess.classList.add('show');

                // Scroll to success message
                formSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        });
    }

    // --- Meeting Form ---
    const meetingBtn = document.getElementById('meetingBtn');
    if (meetingBtn) {
        meetingBtn.addEventListener('click', () => {
            const name = document.getElementById('meetingName');
            const phone = document.getElementById('meetingPhone');

            let valid = true;

            if (!name.value.trim()) {
                name.style.borderColor = '#c0392b';
                valid = false;
            } else {
                name.style.borderColor = '';
            }

            if (!phone.value.trim()) {
                phone.style.borderColor = '#c0392b';
                valid = false;
            } else {
                phone.style.borderColor = '';
            }

            if (valid) {
                // Analytics conversion event (non-PII only).
                // NOTE: relocate into the real submission callback when email is wired (see quote form above).
                window.dataLayer = window.dataLayer || [];
                window.dataLayer.push({ event: 'meeting_form_submit' });

                document.querySelector('.form-grid').style.display = 'none';
                formSuccess.classList.add('show');
                formSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
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
