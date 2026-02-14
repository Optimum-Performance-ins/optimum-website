/* ==========================================================================
   Optimum Performance — Lead Generation Website
   Tabs, accordion, form validation, scroll effects, translation
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');
    const navAnchors = navLinks.querySelectorAll('a');
    const revealElements = document.querySelectorAll('.reveal');
    const scrollProgress = document.getElementById('scrollProgress');

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
        if (window.scrollY > 100) {
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
                span.style.transitionDelay = (i * 0.1) + 's';
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

    revealElements.forEach(el => revealObserver.observe(el));

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

    document.querySelectorAll('[data-word-reveal]:not(.reveal)').forEach(el => {
        wordTitleObserver.observe(el);
    });

    // --- Hero Particles ---
    const particleContainer = document.getElementById('particles');
    if (particleContainer) {
        for (let i = 0; i < 30; i++) {
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
        const count = 4 + Math.floor(Math.random() * 3);
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

    // --- Dynamic Insurance Type Dropdown ---
    const clientTypeRadios = document.querySelectorAll('input[name="clientType"]');
    const insuranceTypeSelect = document.getElementById('insuranceType');

    const insuranceOptions = {
        individual: [
            { value: 'life-health', label: 'Medical Insurance' },
            { value: 'home', label: 'Home Insurance' },
            { value: 'motor', label: 'Motor Insurance' },
            { value: 'personal-accident', label: 'Personal Accident' }
        ],
        corporate: [
            { value: 'commercial', label: 'Commercial Insurance' },
            { value: 'employee-benefits', label: 'Employee Benefits' },
            { value: 'marine-cargo', label: 'Marine & Cargo Insurance' },
            { value: 'risk-management', label: 'Risk Management' },
            { value: 'claims-management', label: 'Claims Management' },
            { value: 'professional-liability', label: 'Professional Liability' }
        ]
    };

    const insuranceOptionsAr = {
        individual: [
            { value: 'home', label: 'تأمين المنزل' },
            { value: 'motor', label: 'تأمين السيارات' },
            { value: 'personal-accident', label: 'الحوادث الشخصية' }
        ],
        corporate: [
            { value: 'commercial', label: 'التأمين التجاري' },
            { value: 'employee-benefits', label: 'مزايا الموظفين' },
            { value: 'marine-cargo', label: 'التأمين البحري والشحن' },
            { value: 'risk-management', label: 'إدارة المخاطر' },
            { value: 'claims-management', label: 'إدارة المطالبات' },
            { value: 'professional-liability', label: 'المسؤولية المهنية' }
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
                document.querySelector('.form-grid').style.display = 'none';
                formSuccess.classList.add('show');
                formSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        });
    }

    // --- Translation System ---
    const translations = {
        ar: {
            // Navigation
            'nav.services': 'خدماتنا',
            'nav.whyus': 'لماذا نحن',
            'nav.process': 'كيف نعمل',
            'nav.testimonials': 'آراء العملاء',
            'nav.contact': 'تواصل معنا',
            'nav.cta.quote': 'طلب عرض سعر',
            'nav.cta.meeting': 'حجز اجتماع',

            // Hero
            'hero.headline': 'توقف عن دفع مبالغ زائدة لتأمين لا يحميك',
            'hero.sub': 'نتفاوض للحصول على التغطية المناسبة بالسعر المناسب — حتى تركز على تنمية أعمالك.',
            'hero.cta.quote': 'طلب عرض سعر',
            'hero.cta.meeting': 'حجز اجتماع',
            'hero.fra': 'مرخصة ومنظمة من الهيئة العامة للرقابة المالية — رقم القيد ٩١',
            'hero.fra.label': 'مرخصة ومنظمة من الهيئة العامة للرقابة المالية',
            'hero.fra.reg': 'رقم القيد <strong>٩١</strong>',

            // Pain points
            'pain.1': 'تدفع أقساط زائدة؟',
            'pain.2': 'مطالبات مرفوضة أو متأخرة؟',
            'pain.3': 'ثغرات في الوثيقة لا تعلم عنها؟',
            'pain.4': 'لا يوجد وسيط مخصص لدعمك؟',

            // Services
            'services.title': 'حلول تأمينية تناسبك',
            'services.subtitle': 'سواء كنت تحمي عائلتك أو عملك، نحن نوفر لك التغطية',
            'segment.individual': 'للأفراد',
            'segment.corporate': 'للشركات',

            // Individual services
            'ind.1.title': 'التأمين الطبي',
            'ind.1.text': 'خطط طبية شاملة لحمايتك أنت وعائلتك.',
            'ind.2.title': 'تأمين المنزل',
            'ind.2.text': 'احمِ منزلك وممتلكاتك ضد الحريق والسرقة والكوارث الطبيعية.',
            'ind.3.title': 'تأمين السيارات',
            'ind.3.text': 'تغطية شاملة وتأمين ضد الغير بأسعار تنافسية.',
            'ind.4.title': 'تأمين السفر',
            'ind.4.text': 'سافر براحة بال — تغطية الطوارئ الطبية وإلغاء الرحلة والأمتعة المفقودة.',
            'ind.5.title': 'الحوادث الشخصية',
            'ind.5.text': 'حماية مالية لك ولعائلتك في حالة الإصابة العرضية أو الإعاقة.',

            // Corporate services
            'corp.1.title': 'التأمين التجاري',
            'corp.1.text': 'تغطية الممتلكات والمسؤولية وانقطاع الأعمال للحفاظ على استمرارية عملياتك.',
            'corp.2.title': 'مزايا الموظفين',
            'corp.2.text': 'استقطب واحتفظ بالكفاءات مع خطط طبية وأسنان وتأمين حياة وتقاعد جماعية.',
            'corp.3.title': 'التأمين البحري والشحن',
            'corp.3.text': 'احمِ البضائع أثناء النقل — تغطية كل مرحلة من سلسلة التوريد واللوجستيات.',
            'corp.4.title': 'إدارة المخاطر',
            'corp.4.text': 'نقيّم ونحدد ونخفف من تعرضك — نبني أطر عمل تقلل الخسائر.',
            'corp.5.title': 'إدارة المطالبات',
            'corp.5.text': 'فريق المطالبات المخصص لدينا يدافع عن تسويات سريعة وعادلة نيابة عنك.',
            'corp.6.title': 'المسؤولية المهنية',
            'corp.6.text': 'احمِ عملك من دعاوى الإهمال والأخطاء والسهو.',
            'card.cta': 'احصل على عرض سعر ←',

            // Why Us
            'whyus.title': 'ما يُميّز أوبتيموم بيرفورمنس',
            'whyus.1.title': 'توفير من خلال الاستقلالية',
            'whyus.1.text': 'نقارن بين أكثر من 50 شركة تأمين لنحصل لك على أفضل سعر — وليس العرض الذي يدفع لنا أكثر.',
            'whyus.2.title': 'دعم حقيقي عند الحاجة',
            'whyus.2.text': 'عندما تكون المطالبة على المحك، فريقنا يقاتل من أجل تسوية كاملة وعادلة — وينجح في 98% من الحالات.',
            'whyus.3.title': 'شريك وليس مجرد مزوّد خدمة',
            'whyus.3.text': 'وسيط مخصص واحد، دعم على مدار العام. ندير محفظتك التأمينية حتى تركّز على أعمالك.',
            'cinematic.text': 'أكثر من 50 شريك تأمين. وسيط واحد يعمل لمصلحتك.',

            // How We Work
            'process.title': 'كيف نعمل',
            'process.subtitle': 'عملية مثبتة تضع حمايتك أولاً',
            'process.1.title': 'تقييم المخاطر',
            'process.1.text': 'نحلل عملياتك وأصولك وتعرضاتك لبناء ملف مخاطر شامل.',
            'process.2.title': 'التسويق والتفاوض',
            'process.2.text': 'نتواصل مع عدة شركات تأمين، نقارن الشروط، ونتفاوض للحصول على أفضل تغطية بأسعار تنافسية.',
            'process.3.title': 'الإصدار والتفعيل',
            'process.3.text': 'بعد موافقتك، ننهي ونفعّل وثيقتك — نتولى جميع المستندات والتنسيق.',
            'process.4.title': 'الدعم المستمر',
            'process.4.text': 'التجديدات والتعديلات والمناصرة في المطالبات — ندير محفظتك على مدار العام.',
            'process.cta': 'مستعد للبدء؟ اطلب عرض سعر',

            // Stats
            'stat.1': 'سنوات الخبرة',
            'stat.2': 'وثيقة تأمين',
            'stat.3': 'شريك تأمين',
            'stat.4': 'نسبة نجاح المطالبات',

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
            'testimonials.cta': 'انضم لأكثر من 200 شركة نحميها',

            // Quote Form
            'quote.title': 'احصل على عرض تأمين مجاني',
            'quote.subtitle': 'أخبرنا بما تحتاج — سنرد عليك خلال 24 ساعة',
            'form.name.label': 'الاسم الكامل',
            'form.name.error': 'يرجى إدخال اسمك',
            'form.email.label': 'البريد الإلكتروني',
            'form.email.error': 'يرجى إدخال بريد إلكتروني صحيح',
            'form.phone.label': 'الهاتف',
            'form.phone.error': 'يرجى إدخال رقم هاتفك',
            'form.clientType.label': 'أنا',
            'form.clientType.error': 'يرجى اختيار نوع العميل',
            'form.insuranceType.label': 'نوع التأمين',
            'form.insuranceType.error': 'يرجى اختيار نوع التأمين',
            'form.message.label': 'رسالة <span class="optional">(اختياري)</span>',
            'form.submit': 'طلب عرض سعر',
            'form.success.title': 'شكراً لك!',
            'form.success.text': 'تم استلام طلبك وسنرد عليك خلال 24 ساعة.',

            // Meeting
            'meeting.title': 'تفضل التحدث؟',
            'meeting.text': 'احجز استشارة مجانية مع أحد متخصصي التأمين لدينا. بدون التزام.',
            'meeting.name.label': 'اسمك',
            'meeting.phone.label': 'رقم الهاتف',
            'meeting.time.label': 'الوقت المفضل',
            'meeting.time.morning': 'صباحاً (9ص - 12م)',
            'meeting.time.afternoon': 'ظهراً (12م - 4م)',
            'meeting.time.evening': 'مساءً (4م - 7م)',
            'meeting.submit': 'حجز اجتماع',

            // Trust signals
            'trust.1': 'مرخصة من الهيئة المالية — رقم ٩١',
            'trust.2': 'الرد خلال 24 ساعة',
            'trust.3': 'بدون التزام، عرض مجاني',

            // Trusted By
            'trusted.title': 'يثقون بنا',
            'trusted.subtitle': 'شراكات مع مؤسسات رائدة في المنطقة',

            // About accordion
            'about.accordion.title': 'تعرف علينا أكثر',
            'about.title': 'من نحن',
            'about.lead': 'أوبتيموم بيرفورمنس هي شركة وساطة تأمينية رائدة مكرّسة لحماية ما يهمّك أكثر — عملك، وموظفيك، ومستقبلك.',
            'about.p1': 'تأسست على إيمان راسخ بأن التغطية المناسبة تبدأ بالعلاقة الصحيحة، حيث نتشارك مع المؤسسات للتنقل بثقة في عالم التأمين المعقد. يضم فريقنا وسطاء ذوي خبرة واسعة تمتد لعقود في مختلف القطاعات، لتأمين تغطية مصممة خصيصاً توفر حماية حقيقية وراحة بال دائمة.',
            'about.p2': 'نحن لا نكتفي بإصدار الوثائق — بل ننغمس في عملياتكم لفهم المخاطر الفريدة التي تواجهونها ونصمم برامج تأمينية شاملة وتنافسية ومبنية لتدوم. من الشركات الناشئة إلى المؤسسات الكبرى، أوبتيموم بيرفورمنس هي الوسيط الموثوق الذي يحوّل المخاطر إلى مرونة.',

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

            // CEO
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
            'footer.link.services': 'خدماتنا',
            'footer.link.whyus': 'لماذا نحن',
            'footer.link.process': 'كيف نعمل',
            'footer.link.quote': 'طلب عرض سعر',
            'footer.link.about': 'من نحن',
            'footer.getintouch': 'تواصل معنا',
            'footer.email': 'info@optimumperformance.com',
            'footer.phone': '+00 000 000 0000',
            'footer.address': 'منطقة الأعمال، المدينة',
            'footer.copyright': '\u00A9 2026 أوبتيموم بيرفورمنس. جميع الحقوق محفوظة.',
            'footer.regulatory': 'أوبتيموم بيرفورمنس مرخصة ومنظمة من الهيئة العامة للرقابة المالية، رقم القيد ٩١.',
        }
    };

    // Placeholder translations
    const placeholderTranslations = {
        ar: {
            'form.name.placeholder': 'أدخل اسمك الكامل',
            'form.email.placeholder': 'your@email.com',
            'form.phone.placeholder': '+20 xxx xxx xxxx',
            'form.clientType.placeholder': 'اختر نوع العميل',
            'form.clientType.individual': 'فرد',
            'form.clientType.corporate': 'شركة / مؤسسة',
            'form.insuranceType.placeholder': 'اختر نوع التأمين',
            'form.message.placeholder': 'أخبرنا عن احتياجاتك التأمينية...',
            'meeting.name.placeholder': 'أدخل اسمك',
            'meeting.phone.placeholder': '+20 xxx xxx xxxx',
        }
    };

    // Store original content
    const originalContent = {};

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        originalContent[key] = el.textContent;
    });
    document.querySelectorAll('[data-i18n-html]').forEach(el => {
        const key = el.getAttribute('data-i18n-html');
        originalContent[key] = el.innerHTML;
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        originalContent[key] = el.getAttribute('placeholder');
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
            document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
                const key = el.getAttribute('data-i18n-placeholder');
                if (placeholderTranslations.ar[key]) {
                    el.setAttribute('placeholder', placeholderTranslations.ar[key]);
                }
            });

            // Update select options
            document.querySelectorAll('select option[data-i18n]').forEach(opt => {
                const key = opt.getAttribute('data-i18n');
                if (translations.ar[key]) {
                    opt.textContent = translations.ar[key];
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
            document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
                const key = el.getAttribute('data-i18n-placeholder');
                if (originalContent[key]) {
                    el.setAttribute('placeholder', originalContent[key]);
                }
            });

            document.querySelectorAll('select option[data-i18n]').forEach(opt => {
                const key = opt.getAttribute('data-i18n');
                if (originalContent[key]) {
                    opt.textContent = originalContent[key];
                }
            });
        }

        // Re-initialize word reveal for translated titles
        document.querySelectorAll('[data-word-reveal]').forEach(title => {
            const text = title.textContent.trim();
            title.innerHTML = '';
            text.split(/\s+/).forEach((word, i) => {
                const span = document.createElement('span');
                span.classList.add('word', 'word-visible');
                span.textContent = word;
                span.style.transitionDelay = (i * 0.1) + 's';
                title.appendChild(span);
                if (i < text.split(/\s+/).length - 1) {
                    title.appendChild(document.createTextNode('\u00A0'));
                }
            });
        });

        // Re-populate insurance dropdown if client type is selected
        const checkedRadio = document.querySelector('input[name="clientType"]:checked');
        if (checkedRadio) {
            checkedRadio.dispatchEvent(new Event('change'));
        }

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
