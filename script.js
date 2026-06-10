/* ==========================================================================
   Optimum Performance — Lead Generation Website
   Tabs, accordion, form validation, scroll effects, translation
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  // --- Device Capability Detection ---
  const isLowEnd =
    (navigator.deviceMemory && navigator.deviceMemory < 2) ||
    (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2) ||
    (navigator.connection && navigator.connection.effectiveType === "2g");

  if (isLowEnd) {
    document.body.classList.add("low-end-device");
  }

  const navbar = document.getElementById("navbar");
  const navToggle = document.getElementById("navToggle");
  const navLinks = document.getElementById("navLinks");
  const navAnchors = navLinks.querySelectorAll("a");
  const revealElements = document.querySelectorAll(".reveal");
  const scrollProgress = document.getElementById("scrollProgress");

  // --- Combined Scroll Handler (RAF-throttled) ---
  const sections = document.querySelectorAll("section[id]");
  let scrollTicking = false;

  const onScroll = () => {
    if (scrollTicking) return;
    scrollTicking = true;
    requestAnimationFrame(() => {
      const scrollTop = window.scrollY;

      // Progress bar
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      scrollProgress.style.width =
        (docHeight > 0 ? (scrollTop / docHeight) * 100 : 0) + "%";

      // Sticky navbar
      navbar.classList.toggle("scrolled", scrollTop > 100);

      // Active nav highlighting
      const scrollY = scrollTop + 120;
      sections.forEach((section) => {
        const top = section.offsetTop;
        const height = section.offsetHeight;
        const id = section.getAttribute("id");
        const link = navLinks.querySelector(`a[href="#${id}"]`);
        if (link) {
          link.classList.toggle(
            "active",
            scrollY >= top && scrollY < top + height,
          );
        }
      });

      scrollTicking = false;
    });
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // --- Mobile Menu Toggle ---
  navToggle.addEventListener("click", () => {
    navToggle.classList.toggle("active");
    navLinks.classList.toggle("open");
  });

  navAnchors.forEach((anchor) => {
    anchor.addEventListener("click", () => {
      navToggle.classList.remove("active");
      navLinks.classList.remove("open");
    });
  });

  document.addEventListener("click", (e) => {
    if (!navbar.contains(e.target) && navLinks.classList.contains("open")) {
      navToggle.classList.remove("active");
      navLinks.classList.remove("open");
    }
  });

  // --- Word-by-Word Title Reveal ---
  const initWordReveal = () => {
    document.querySelectorAll("[data-word-reveal]").forEach((title) => {
      if (title.querySelector(".word")) return;
      const nodes = [...title.childNodes];
      title.textContent = "";
      let wordIndex = 0;
      nodes.forEach((node) => {
        if (node.nodeName === "BR") {
          title.appendChild(document.createElement("br"));
          return;
        }
        const words = node.textContent.trim().split(/\s+/);
        words.forEach((word) => {
          if (!word) return;
          const span = document.createElement("span");
          span.classList.add("word");
          span.textContent = word;
          span.style.transitionDelay = wordIndex * 0.1 + "s";
          title.appendChild(span);
          title.appendChild(document.createTextNode("\u00A0"));
          wordIndex++;
        });
      });
    });
  };

  initWordReveal();

  // --- Staggered Reveal Animations ---
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;

          el.querySelectorAll(".word").forEach((word) => {
            word.classList.add("word-visible");
          });

          if (el.classList.contains("stagger")) {
            const parent = el.parentElement;
            const staggerChildren = parent.querySelectorAll(".stagger");
            staggerChildren.forEach((child, i) => {
              setTimeout(() => {
                child.classList.add("visible");
              }, i * 100);
            });
            staggerChildren.forEach((child) => revealObserver.unobserve(child));
          } else {
            const delay = parseInt(el.dataset.delay) || 0;
            setTimeout(() => {
              el.classList.add("visible");
            }, delay);
            revealObserver.unobserve(el);
          }
        }
      });
    },
    {
      root: null,
      rootMargin: "0px 0px -60px 0px",
      threshold: 0.1,
    },
  );

  revealElements.forEach((el) => revealObserver.observe(el));

  // Word reveal for non-.reveal titles
  const wordTitleObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.querySelectorAll(".word").forEach((word) => {
            word.classList.add("word-visible");
          });
          wordTitleObserver.unobserve(entry.target);
        }
      });
    },
    { rootMargin: "0px 0px -60px 0px", threshold: 0.1 },
  );

  document.querySelectorAll("[data-word-reveal]:not(.reveal)").forEach((el) => {
    wordTitleObserver.observe(el);
  });

  // --- Hero Particles ---
  const particleContainer = document.getElementById("particles");
  if (particleContainer && !isLowEnd) {
    const particleCount = window.innerWidth < 768 ? 10 : 30;
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement("div");
      particle.classList.add("particle");
      particle.style.left = Math.random() * 100 + "%";
      particle.style.top = 50 + Math.random() * 50 + "%";
      particle.style.width = 2 + Math.random() * 3 + "px";
      particle.style.height = particle.style.width;
      particle.style.animationDelay = Math.random() * 6 + "s";
      particle.style.animationDuration = 4 + Math.random() * 4 + "s";
      particleContainer.appendChild(particle);
    }
  }

  // --- Section Ambient Shapes ---
  const isMobile = window.innerWidth < 768;
  document.querySelectorAll(".section-shapes").forEach((container) => {
    const count = isLowEnd
      ? 0
      : isMobile
        ? 2
        : 4 + Math.floor(Math.random() * 3);
    for (let i = 0; i < count; i++) {
      const shape = document.createElement("div");
      shape.classList.add("shape");
      const size = 100 + Math.random() * 250;
      shape.style.width = size + "px";
      shape.style.height = size + "px";
      shape.style.left = Math.random() * 120 - 10 + "%";
      // Spread shapes across full range including edges that cross into adjacent sections
      const edgeBias = Math.random();
      if (edgeBias < 0.3) {
        shape.style.top = -15 + Math.random() * 30 + "%"; // near top edge
      } else if (edgeBias > 0.7) {
        shape.style.top = 70 + Math.random() * 30 + "%"; // near bottom edge
      } else {
        shape.style.top = 20 + Math.random() * 60 + "%"; // middle
      }
      shape.style.animationDelay = Math.random() * 10 + "s";
      shape.style.animationDuration = 20 + Math.random() * 20 + "s";
      container.appendChild(shape);
    }
  });

  // --- Stats Counter Animation ---
  const statNumbers = document.querySelectorAll(".stat-number[data-count]");

  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
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
    },
    { rootMargin: "0px 0px -60px 0px", threshold: 0.1 },
  );

  statNumbers.forEach((el) => counterObserver.observe(el));

  // --- Segment Tab Switching ---
  const segmentTabs = document.querySelectorAll(".segment-tab");
  const segmentContents = document.querySelectorAll(".segment-content");

  segmentTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const segment = tab.dataset.segment;

      segmentTabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");

      segmentContents.forEach((content) => {
        content.classList.remove("active");
        if (content.id === `segment-${segment}`) {
          content.classList.add("active");
          // Trigger reveal animations for newly visible cards
          content.querySelectorAll(".reveal:not(.visible)").forEach((el) => {
            revealObserver.observe(el);
          });
        }
      });
    });
  });

  // --- Service Card → Quote Form Pre-fill ---
  document.querySelectorAll(".service-card[data-service]").forEach((card) => {
    card.style.cursor = "pointer";
    card.addEventListener("click", (e) => {
      // Don't double-handle if the CTA link itself was clicked (it already navigates)
      if (e.target.closest(".card-cta")) {
        e.preventDefault();
      }

      const serviceValue = card.dataset.service;
      const clientType = card.dataset.clientType; // 'individual' or 'corporate'

      // 1. Select client type radio
      const radio = document.querySelector(
        `input[name="clientType"][value="${clientType}"]`,
      );
      if (radio) {
        radio.checked = true;
        radio.dispatchEvent(new Event("change", { bubbles: true }));
      }

      // 2. After dropdown populates, select the insurance type
      setTimeout(() => {
        const insuranceSelect = document.getElementById("insuranceType");
        if (insuranceSelect) {
          insuranceSelect.value = serviceValue;
        }
      }, 50);

      // 3. Scroll to quote section
      const quoteSection = document.getElementById("quote");
      if (quoteSection) {
        const navHeight = navbar.offsetHeight;
        const targetPosition =
          quoteSection.getBoundingClientRect().top + window.scrollY - navHeight;
        window.scrollTo({ top: targetPosition, behavior: "smooth" });
      }
    });
  });

  // --- Dynamic Insurance Type Dropdown ---
  const clientTypeRadios = document.querySelectorAll(
    'input[name="clientType"]',
  );
  const insuranceTypeSelect = document.getElementById("insuranceType");
  const currentLang = document.documentElement.lang || "en";

  const insuranceOptions = {
    individual: [
      { value: "life-health", label: "Medical Insurance" },
      { value: "home", label: "Home Insurance" },
      { value: "motor", label: "Motor Insurance" },
      { value: "personal-accident", label: "Personal Accident" },
    ],
    corporate: [
      { value: "property", label: "Property Insurance" },
      { value: "employee-benefits", label: "Employee Benefits" },
      { value: "marine-cargo", label: "Marine & Cargo Insurance" },
      { value: "liability", label: "Liability" },
      { value: "cybersecurity", label: "Cybersecurity Insurance" },
    ],
  };

  const insuranceOptionsAr = {
    individual: [
      { value: "life-health", label: "التأمين الطبي" },
      { value: "home", label: "تأمين المنزل" },
      { value: "motor", label: "تأمين السيارات" },
      { value: "personal-accident", label: "الحوادث الشخصية" },
    ],
    corporate: [
      { value: "property", label: "تأمين الممتلكات" },
      { value: "employee-benefits", label: "مزايا الموظفين" },
      { value: "marine-cargo", label: "التأمين البحري والشحن" },
      { value: "liability", label: "المسؤولية" },
      { value: "cybersecurity", label: "التأمين السيبراني" },
    ],
  };

  if (clientTypeRadios.length && insuranceTypeSelect) {
    clientTypeRadios.forEach((radio) =>
      radio.addEventListener("change", () => {
        const type = radio.value;
        const options =
          currentLang === "ar"
            ? insuranceOptionsAr[type]
            : insuranceOptions[type];

        insuranceTypeSelect.innerHTML = "";

        const placeholder = document.createElement("option");
        placeholder.value = "";
        placeholder.disabled = true;
        placeholder.selected = true;
        placeholder.textContent =
          currentLang === "ar" ? "اختر نوع التأمين" : "Select insurance type";
        insuranceTypeSelect.appendChild(placeholder);

        if (options) {
          options.forEach((opt) => {
            const option = document.createElement("option");
            option.value = opt.value;
            option.textContent = opt.label;
            insuranceTypeSelect.appendChild(option);
          });
        }
      }),
    );
  }

  // --- Accordion ---
  // كود شامل يعمل مع أي أكورديون في الموقع (العربي أو الإنجليزي)
  document.addEventListener("click", (e) => {
    // التأكد من أن العنصر الذي تم الضغط عليه هو هيدر لأكورديون
    const header = e.target.closest(
      ".accordion-header, .card-accordion-header",
    );

    if (!header) return;

    e.preventDefault();
    e.stopPropagation();

    // تحديد العنصر الأب والـ Body الخاص به
    const item = header.parentElement;
    const body = item.querySelector(".accordion-body, .card-accordion-body");
    const isOpen = item.classList.contains("open");

    // إغلاق أي عناصر مفتوحة أخرى (اختياري)
    const container = item.closest(".accordion, .card-accordion");
    if (container) {
      container
        .querySelectorAll(".accordion-item, .card-accordion-item")
        .forEach((i) => {
          if (i !== item) {
            i.classList.remove("open");
            const b = i.querySelector(".accordion-body, .card-accordion-body");
            if (b) b.style.maxHeight = null;
          }
        });
    }

    // فتح أو إغلاق العنصر الحالي
    if (!isOpen) {
      item.classList.add("open");
      header.setAttribute("aria-expanded", "true");
      if (body) body.style.maxHeight = body.scrollHeight + "px";
    } else {
      item.classList.remove("open");
      header.setAttribute("aria-expanded", "false");
      if (body) body.style.maxHeight = null;
    }
  });

  // --- Form Validation ---
  const quoteForm = document.getElementById("quoteForm");
  const formSuccess = document.getElementById("formSuccess");

  if (quoteForm) {
    quoteForm.addEventListener("submit", (e) => {
      e.preventDefault();
      let isValid = true;

      // Clear previous errors
      quoteForm.querySelectorAll(".form-group").forEach((group) => {
        group.classList.remove("error");
      });

      // Validate required fields
      const fullName = document.getElementById("fullName");
      if (!fullName.value.trim()) {
        fullName.closest(".form-group").classList.add("error");
        isValid = false;
      }

      const email = document.getElementById("email");
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.value.trim())) {
        email.closest(".form-group").classList.add("error");
        isValid = false;
      }

      const phone = document.getElementById("phone");
      if (!phone.value.trim()) {
        phone.closest(".form-group").classList.add("error");
        isValid = false;
      }

      const clientTypeChecked = document.querySelector(
        'input[name="clientType"]:checked',
      );
      if (!clientTypeChecked) {
        document
          .getElementById("clientType")
          .closest(".form-group")
          .classList.add("error");
        isValid = false;
      }

      const insuranceType = document.getElementById("insuranceType");
      if (!insuranceType.value) {
        insuranceType.closest(".form-group").classList.add("error");
        isValid = false;
      }

      if (isValid) {
        // Show success
        document.querySelector(".form-grid").style.display = "none";
        formSuccess.classList.add("show");

        // Scroll to success message
        formSuccess.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    });
  }

  // --- Meeting Form ---
  const meetingBtn = document.getElementById("meetingBtn");
  if (meetingBtn) {
    meetingBtn.addEventListener("click", () => {
      const name = document.getElementById("meetingName");
      const phone = document.getElementById("meetingPhone");

      let valid = true;

      if (!name.value.trim()) {
        name.style.borderColor = "#c0392b";
        valid = false;
      } else {
        name.style.borderColor = "";
      }

      if (!phone.value.trim()) {
        phone.style.borderColor = "#c0392b";
        valid = false;
      } else {
        phone.style.borderColor = "";
      }

      if (valid) {
        document.querySelector(".form-grid").style.display = "none";
        formSuccess.classList.add("show");
        formSuccess.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    });
  }

  // // --- Smooth Scroll ---
  // document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  //   anchor.addEventListener("click", (e) => {
  //     const href = anchor.getAttribute("href");
  //     const target = document.querySelector(href);
  //     if (target) {
  //       e.preventDefault();
  //       const navHeight = navbar.offsetHeight;
  //       const targetPosition =
  //         target.getBoundingClientRect().top + window.scrollY - navHeight;
  //       window.scrollTo({ top: targetPosition, behavior: "smooth" });
  //     }
  //   });
  // });
  window.addEventListener("load", () => {
    const preloader = document.getElementById("preloader");
    const curtain = document.getElementById("transition-curtain");

    setTimeout(() => {
      curtain.style.transform = "translateY(0%)";

      setTimeout(() => {
        preloader.style.opacity = "0";
        preloader.style.visibility = "hidden";
      }, 500);

      setTimeout(() => {
        curtain.style.transform = "translateY(-100%)";
        setTimeout(() => {
          preloader.remove();
          curtain.remove();
        }, 800);
      }, 1200);
    }, 1500);
  });
  window.addEventListener("load", () => {
    const track = document.querySelector("#trusted .marquee-track");
    if (!track) return;

    const originalContent = track.innerHTML;
    track.innerHTML += originalContent;

    setTimeout(() => {
      const singleWidth = track.scrollWidth / 2;

      const speedFactor = 50;
      const duration = singleWidth / speedFactor;

      track.style.setProperty("--scroll-width", `-${singleWidth}px`);
      track.style.animation = `marquee-scroll ${duration}s linear infinite`;
    }, 100);
  });
});
