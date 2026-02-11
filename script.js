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
    const initWordReveal = () => {
        document.querySelectorAll('[data-word-reveal]').forEach(title => {
            if (title.querySelector('.word')) return;
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
    };

    initWordReveal();

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

    // --- Translation System ---
    const translations = {
        ar: {
            // Navigation
            'nav.about': 'من نحن',
            'nav.vision': 'الرؤية والرسالة',
            'nav.services': 'خدماتنا',
            'nav.advantage': 'لماذا نحن',
            'nav.testimonials': 'آراء العملاء',
            'nav.contact': 'تواصل معنا',

            // Hero
            'hero.tagline': 'ليس مجرد تأمين، إنها ثقافة أعمال',
            'hero.cta': 'احصل على عرض سعر',
            'hero.fra.label': 'مرخصة ومنظمة من الهيئة العامة للرقابة المالية',
            'hero.fra.reg': 'رقم القيد <strong>٩١</strong>',

            // Who We Are
            'about.title': 'من نحن',
            'about.lead': 'أوبتيموم بيرفورمنس هي شركة وساطة تأمينية رائدة مكرّسة لحماية ما يهمّك أكثر — عملك، وموظفيك، ومستقبلك.',
            'about.p1': 'تأسست على إيمان راسخ بأن التغطية المناسبة تبدأ بالعلاقة الصحيحة، حيث نتشارك مع المؤسسات للتنقل بثقة في عالم التأمين المعقد. يضم فريقنا وسطاء ذوي خبرة واسعة تمتد لعقود في مختلف القطاعات، لتأمين تغطية مصممة خصيصاً توفر حماية حقيقية وراحة بال دائمة.',
            'about.p2': 'نحن لا نكتفي بإصدار الوثائق — بل ننغمس في عملياتكم لفهم المخاطر الفريدة التي تواجهونها ونصمم برامج تأمينية شاملة وتنافسية ومبنية لتدوم. من الشركات الناشئة إلى المؤسسات الكبرى، أوبتيموم بيرفورمنس هي الوسيط الموثوق الذي يحوّل المخاطر إلى مرونة.',

            // Stats
            'stat.1': 'سنوات الخبرة',
            'stat.2': 'وثيقة تأمين',
            'stat.3': 'شريك تأمين',
            'stat.4': 'نسبة نجاح المطالبات',

            // Vision & Mission
            'vm.title': 'الرؤية والرسالة',
            'vision.title': 'رؤيتنا',
            'vision.text': 'أن نكون شركة وساطة التأمين الأكثر ثقة في المنطقة — نضع معايير جديدة للحماية والشفافية والدفاع عن مصالح العملاء في بيئة مخاطر متغيرة باستمرار.',
            'mission.title': 'رسالتنا',
            'mission.text': 'تقديم حلول تأمينية عالمية المستوى تحمي الشركات والأفراد من عدم اليقين. نلتزم بتأمين أفضل تغطية بشروط تنافسية من خلال معرفتنا العميقة بالسوق وعلاقاتنا القوية مع شركات التأمين وتركيزنا الدائم على مصالح عملائنا.',

            // Core Values
            'values.title': 'قيمنا الأساسية',
            'value.1.title': 'التميّز',
            'value.1.text': 'نسعى لأعلى المعايير في كل وثيقة نصدرها، لضمان تغطية تفوق التوقعات وتضع معايير جديدة.',
            'value.2.title': 'النزاهة',
            'value.2.text': 'الشفافية والصدق والسلوك الأخلاقي هي أساس كل علاقة نبنيها وكل توصية نقدمها.',
            'value.3.title': 'المناصرة',
            'value.3.text': 'نعمل حصرياً لصالحك — نتفاوض مع شركات التأمين ونتحدى الشروط غير العادلة وندافع عن كل مطالبة نيابة عنك.',
            'value.4.title': 'التركيز على العميل',
            'value.4.text': 'عملاؤنا في صميم كل ما نقوم به. نستمع ونقيّم المخاطر بعناية ونصمم تغطية تلبي احتياجاتهم الفريدة.',
            'value.5.title': 'الشراكة',
            'value.5.text': 'نبني علاقات دائمة — مع عملائنا ومع أبرز شركات التأمين في العالم — لتقديم حماية يمكنك الاعتماد عليها.',
            'value.6.title': 'التوجه نحو النتائج',
            'value.6.text': 'نقيس نجاحنا بالمطالبات التي نسوّيها والتوفيرات التي نحققها وراحة البال التي نوفرها لكل عميل.',

            // Services
            'services.title': 'خدماتنا',
            'services.subtitle': 'تغطية شاملة مصممة لحماية أعمالك وموظفيك',
            'service.1.title': 'التأمين التجاري',
            'service.1.text': 'احمِ أعمالك بتغطية مخصصة للممتلكات والمسؤولية وانقطاع الأعمال مصممة للحفاظ على استمرارية عملياتك مهما حدث.',
            'service.2.title': 'تأمين الحياة والصحة',
            'service.2.text': 'اضمن رفاهية موظفيك مع خطط تأمين شاملة للحياة والصحة والتأمين الطبي من أبرز مقدمي الخدمات في المنطقة.',
            'service.3.title': 'إدارة المخاطر',
            'service.3.text': 'نقيّم ونحدد ونخفف من تعرضك للمخاطر — نبني أطر إدارة مخاطر تقلل الخسائر وتعزز مرونتك.',
            'service.4.title': 'مزايا الموظفين',
            'service.4.text': 'استقطب أفضل الكفاءات واحتفظ بها من خلال برامج تأمين جماعية تنافسية — من التأمين الطبي وطب الأسنان إلى التقاعد والرعاية الصحية.',
            'service.5.title': 'التأمين البحري والشحن',
            'service.5.text': 'احمِ بضائعك أثناء النقل مع حلول التأمين البحري والشحن واللوجستيات التي تغطي كل مرحلة من سلسلة التوريد.',
            'service.6.title': 'إدارة المطالبات',
            'service.6.text': 'عندما يكون الأمر أكثر أهمية، نقف بجانبك. فريق المطالبات المخصص لدينا يدافع عن تسويات سريعة وعادلة — حتى تتمكن من التركيز على عملك.',

            // How We Work
            'process.title': 'كيف نعمل',
            'process.subtitle': 'عملية مثبتة تضع حمايتك أولاً',
            'process.1.title': 'تقييم المخاطر',
            'process.1.text': 'نحلل عملياتك وأصولك وتعرضاتك — نبني صورة شاملة لملف المخاطر الخاص بك من الأساس.',
            'process.2.title': 'التسويق والتفاوض',
            'process.2.text': 'نتواصل مع عدة شركات تأمين نيابة عنك، نقارن الشروط ونتفاوض للحصول على أفضل تغطية بأكثر الأقساط تنافسية.',
            'process.3.title': 'الإصدار والتفعيل',
            'process.3.text': 'بعد موافقتك، ننهي ونفعّل وثيقتك — نتولى جميع المستندات والملحقات والتنسيق مع شركات الاكتتاب.',
            'process.4.title': 'الدعم المستمر',
            'process.4.text': 'من التجديدات والتعديلات خلال فترة الوثيقة إلى المناصرة في المطالبات، ندير محفظتك على مدار العام لضمان حمايتك الدائمة.',

            // Competitive Advantage
            'advantage.title': 'ميزتنا التنافسية',
            'advantage.subtitle': 'ما يميزنا في سوق التأمين',
            'advantage.1.title': 'مستقلون وغير منحازين',
            'advantage.1.text': 'لسنا مرتبطين بأي شركة تأمين واحدة. استقلاليتنا تعني أننا نوصي دائماً بالتغطية الأفضل لك — وليس لشركة التأمين.',
            'advantage.2.title': 'تغطية مخصصة',
            'advantage.2.text': 'لا تواجه شركتان نفس المخاطر. كل برنامج تأمين نصممه مبني خصيصاً لمعالجة تعرضاتك وأهدافك المحددة.',
            'advantage.3.title': 'المناصرة في المطالبات',
            'advantage.3.text': 'عندما تحتاج لتقديم مطالبة، لا نختفي. فريقنا يدافع عنك لضمان تسويات سريعة وعادلة وكاملة.',
            'advantage.4.title': 'علاقات قوية مع شركات التأمين',
            'advantage.4.text': 'شراكاتنا الطويلة مع كبرى شركات التأمين المحلية والدولية تمنحنا وصولاً لشروط حصرية وأسعار تنافسية.',
            'advantage.5.title': 'خبرة متعددة القطاعات',
            'advantage.5.text': 'من البناء إلى الرعاية الصحية إلى اللوجستيات، يتمتع وسطاؤنا بمعرفة عميقة بالقطاعات لتقييم المخاطر المتخصصة وتأمينها بدقة.',
            'advantage.6.title': 'خدمة على مدار العام',
            'advantage.6.text': 'التأمين لا يتوقف عند إصدار الوثيقة. ندير التجديدات والتعديلات ومراجعات المخاطر المستمرة للحفاظ على تغطيتك محدثة.',

            // Testimonials
            'testimonials.title': 'ماذا يقول عملاؤنا',
            'testimonials.subtitle': 'حماية حقيقية، شراكات حقيقية',
            'testimonial.1.quote': '\u201Cأوبتيموم بيرفورمنس وفرت لنا 30% من أقساط التأمين التجاري مع تحسين التغطية فعلياً. معرفتهم بالسوق لا مثيل لها.\u201D',
            'testimonial.1.name': 'أحمد حسن',
            'testimonial.1.role': 'الرئيس التنفيذي، شركة تصنيع إقليمية',
            'testimonial.2.quote': '\u201Cعندما تعرضنا لمطالبة حريق كبيرة، كان فريقهم في الموقع خلال ساعات. تولوا كل شيء مع شركة التأمين وحصلنا على التسوية الكاملة في وقت قياسي.\u201D',
            'testimonial.2.name': 'سارة المصري',
            'testimonial.2.role': 'المدير المالي، مجموعة ضيافة',
            'testimonial.3.quote': '\u201Cصمموا حزمة مزايا موظفين ساعدتنا على استقطاب أفضل الكفاءات مع البقاء ضمن الميزانية. شريك حقيقي، وليس مجرد وسيط.\u201D',
            'testimonial.3.name': 'محمد خليل',
            'testimonial.3.role': 'مدير الموارد البشرية، مؤسسة لوجستية',

            // Trusted By
            'trusted.title': 'يثقون بنا',
            'trusted.subtitle': 'شراكات مع مؤسسات رائدة في المنطقة',

            // CEO Message
            'ceo.title': 'كلمة الرئيس التنفيذي',
            'ceo.p1': '\u201Cفي أوبتيموم بيرفورمنس، نؤمن بأن التأمين أكثر من مجرد وثيقة — إنه وعد. وعد مبني على الثقة والخبرة العميقة والالتزام الراسخ بحماية ما بناه عملاؤنا بجهد كبير.',
            'ceo.p2': 'فريقنا مدفوع بهدف واحد: أن نكون الوسيط الذي يمكنك الاعتماد عليه عندما يكون الأمر أكثر أهمية. نحن لا نكتفي بتوفير التغطية — نستمع وندافع ونقدم. كل خطر هو فرصة لإثبات قيمتنا، وكل عميل هو شريك نفخر بخدمته.',
            'ceo.p3': 'شكراً لثقتكم بنا لحمايتكم. معاً، سنواصل وضع معايير جديدة للتميز في وساطة التأمين.\u201D',
            'ceo.name': 'الرئيس التنفيذي',
            'ceo.company': 'أوبتيموم بيرفورمنس',

            // FRA Strip
            'fra.label': 'مرخصة ومنظمة من',
            'fra.authority': 'الهيئة العامة للرقابة المالية',
            'fra.authority.ar': 'Financial Regulatory Authority (FRA)',
            'fra.reg.number': 'رقم القيد <strong>٩١</strong>',
            'fra.reg.date': 'تاريخ القيد: أكتوبر 2019',
            'fra.reg.number.ar': 'Registration No. <strong>91</strong>',
            'fra.reg.date.ar': 'Issued on: October 2019',

            // Footer
            'footer.tagline': 'ليس مجرد تأمين،<br>إنها ثقافة أعمال',
            'footer.quicklinks': 'روابط سريعة',
            'footer.link.about': 'من نحن',
            'footer.link.vision': 'الرؤية والرسالة',
            'footer.link.values': 'قيمنا الأساسية',
            'footer.link.services': 'خدماتنا',
            'footer.link.advantage': 'لماذا نحن',
            'footer.getintouch': 'تواصل معنا',
            'footer.email': 'info@optimumperformance.com',
            'footer.phone': '+00 000 000 0000',
            'footer.address': 'منطقة الأعمال، المدينة',
            'footer.copyright': '\u00A9 2026 أوبتيموم بيرفورمنس. جميع الحقوق محفوظة.',
            'footer.regulatory': 'أوبتيموم بيرفورمنس مرخصة ومنظمة من الهيئة العامة للرقابة المالية، رقم القيد ٩١.',
        }
    };

    // Store original English content
    const originalContent = {};

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        originalContent[key] = el.textContent;
    });
    document.querySelectorAll('[data-i18n-html]').forEach(el => {
        const key = el.getAttribute('data-i18n-html');
        originalContent[key] = el.innerHTML;
    });

    let currentLang = 'en';

    const applyTranslation = (lang) => {
        const htmlEl = document.documentElement;

        if (lang === 'ar') {
            htmlEl.setAttribute('lang', 'ar');
            htmlEl.setAttribute('dir', 'rtl');
            document.body.classList.add('lang-ar');

            document.querySelectorAll('[data-i18n]').forEach(el => {
                const key = el.getAttribute('data-i18n');
                if (translations.ar[key]) {
                    el.textContent = translations.ar[key];
                }
            });
            document.querySelectorAll('[data-i18n-html]').forEach(el => {
                const key = el.getAttribute('data-i18n-html');
                if (translations.ar[key]) {
                    el.innerHTML = translations.ar[key];
                }
            });
        } else {
            htmlEl.setAttribute('lang', 'en');
            htmlEl.setAttribute('dir', 'ltr');
            document.body.classList.remove('lang-ar');

            document.querySelectorAll('[data-i18n]').forEach(el => {
                const key = el.getAttribute('data-i18n');
                if (originalContent[key]) {
                    el.textContent = originalContent[key];
                }
            });
            document.querySelectorAll('[data-i18n-html]').forEach(el => {
                const key = el.getAttribute('data-i18n-html');
                if (originalContent[key]) {
                    el.innerHTML = originalContent[key];
                }
            });
        }

        // Re-initialize word reveal for translated titles
        document.querySelectorAll('[data-word-reveal]').forEach(title => {
            // Clear existing word spans
            const text = title.textContent.trim();
            title.innerHTML = '';
            text.split(/\s+/).forEach((word, i) => {
                const span = document.createElement('span');
                span.classList.add('word', 'word-visible');
                span.textContent = word;
                span.style.transitionDelay = (i * 0.12) + 's';
                title.appendChild(span);
                if (i < text.split(/\s+/).length - 1) {
                    title.appendChild(document.createTextNode('\u00A0'));
                }
            });
        });

        currentLang = lang;
    };

    // --- Language Toggle ---
    const langToggle = document.getElementById('langToggle');
    if (langToggle) {
        langToggle.addEventListener('click', () => {
            const active = langToggle.querySelector('.lang-active');
            const inactive = langToggle.querySelector('.lang-inactive');
            const currentActive = active.textContent;
            active.textContent = inactive.textContent;
            inactive.textContent = currentActive;

            const newLang = currentLang === 'en' ? 'ar' : 'en';
            applyTranslation(newLang);
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
