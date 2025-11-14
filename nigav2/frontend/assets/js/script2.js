//script 2 uni2
(function() {
    'use strict';

    // config
    const CONFIG = {
        DATA_PATH: 'assets/data/ntu-data.json',
        FEES_PATH: 'assets/data/fees.json',
        ANIMATION_DELAY: 100,
        SCROLL_THRESHOLD: 0.15,
        SCROLL_MARGIN: '-80px'
    };

    // utility
    const $ = {
        qs: (selector, context = document) => context.querySelector(selector),
        qsa: (selector, context = document) => Array.from(context.querySelectorAll(selector)),
        
        create: (tag, attrs = {}, html = '') => {
            const el = document.createElement(tag);
            Object.entries(attrs).forEach(([key, value]) => {
                if (key === 'class') el.className = value;
                else if (key === 'dataset') Object.assign(el.dataset, value);
                else el.setAttribute(key, value);
            });
            if (html) el.innerHTML = html;
            return el;
        },
        
        on: (element, event, handler) => {
            if (!element) return;
            element.addEventListener(event, handler);
        },
        
        delegate: (parent, event, selector, handler) => {
            if (!parent) return;
            parent.addEventListener(event, e => {
                if (e.target.matches(selector) || e.target.closest(selector)) {
                    handler(e);
                }
            });
        }
    };

    // scmooth scroll
    const initSmoothScroll = () => {
        $.qsa('a[href^="#"]').forEach(link => {
            $.on(link, 'click', (e) => {
                const href = link.getAttribute('href');
                if (href === '#') return;
                
                e.preventDefault();
                const target = $.qs(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                    
                    history.pushState(null, null, href);
                }
            });
        });
    };

    // scroll navbar effects
    const initNavbarEffects = () => {
        const nav = $.qs('.nav');
        if (!nav) return;

        let lastScroll = 0;
        const threshold = 100;

        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;

            if (currentScroll > threshold) {
                nav.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.2)';
            } else {
                nav.style.boxShadow = '';
            }

            lastScroll = currentScroll;
        }, { passive: true });
    };

// initialize mobile menu
const initMobileMenu = () => {
  const toggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  const navCtas = document.querySelector('.nav-ctas');

  if (!toggle) return console.warn('nav-toggle not found');

  if (!toggle.hasAttribute('aria-expanded')) toggle.setAttribute('aria-expanded', 'false');

  toggle.addEventListener('click', (e) => {
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!expanded));

    navLinks && navLinks.classList.toggle('nav-open');
    navCtas && navCtas.classList.toggle('nav-open');

    if (navLinks && navLinks.classList.contains('nav-open')) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  });

  // close menu 
  navLinks && navLinks.addEventListener('click', (e) => {
    if (e.target.tagName.toLowerCase() === 'a') {
      navLinks.classList.remove('nav-open');
      navCtas && navCtas.classList.remove('nav-open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  });
};



    // scroll reveal
    const initScrollReveal = () => {
        if (!('IntersectionObserver' in window)) {
            // fallback
            $.qsa('.scroll-reveal, .scroll-reveal-scale').forEach(el => {
                el.classList.add('revealed');
            });
            return;
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: CONFIG.SCROLL_THRESHOLD,
            rootMargin: `0px 0px ${CONFIG.SCROLL_MARGIN} 0px`
        });

        $.qsa('.scroll-reveal, .scroll-reveal-scale').forEach(el => {
            observer.observe(el);
        });
    };

    // open/close modal
    class Modal {
        constructor(modalId) {
            this.modal = $.qs(modalId);
            if (!this.modal) return;
            
            this.backdrop = $.qs('.modal-backdrop', this.modal);
            this.closeBtn = $.qs('.modal-close', this.modal);
            
            this.init();
        }

        init() {
            $.on(this.closeBtn, 'click', () => this.close());
            $.on(this.backdrop, 'click', () => this.close());
            
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.isOpen()) {
                    this.close();
                }
            });
        }

        open() {
            this.modal.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
            
            // focus tt
            const focusableElements = $.qsa(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
                this.modal
            );
            if (focusableElements[0]) {
                setTimeout(() => focusableElements[0].focus(), 100);
            }
        }

        close() {
            this.modal.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
        }

        isOpen() {
            return this.modal.getAttribute('aria-hidden') === 'false';
        }
    }

    // fee modal
    const initFeesModal = () => {
        const feesModal = new Modal('#feesModal');
        if (!feesModal.modal) return;

        const feesButtonsWrap = $.qs('#feesButtons');
        const feesContent = $.qs('#feesContent');
        let feesData = {};

        // modal triggers
        $.qsa('#feesTopBtn, #heroFeesBtn, #footerFeesBtn').forEach(btn => {
            $.on(btn, 'click', (e) => {
                e.preventDefault();
                feesModal.open();
            });
        });

        // load data fee
        fetch(CONFIG.FEES_PATH)
            .then(response => {
                if (!response.ok) throw new Error('Fees data not found');
                return response.json();
            })
            .then(data => {
                feesData = data;
                renderFeesButtons(data);
            })
            .catch(error => {
                console.warn('Fees data could not be loaded:', error);
                if (feesButtonsWrap) {
                    feesButtonsWrap.innerHTML = '<p style="color: white; text-align: center;">Fee information is currently unavailable.</p>';
                }
            });

        function renderFeesButtons(data) {
            if (!feesButtonsWrap) return;
            feesButtonsWrap.innerHTML = '';

            Object.keys(data).forEach((courseName, index) => {
                const btn = $.create('button', {
                    class: 'btn btn-outline small',
                    type: 'button'
                }, courseName);
                
                $.on(btn, 'click', () => showFees(courseName));
                feesButtonsWrap.appendChild(btn);

                // stagger animation
                setTimeout(() => {
                    btn.style.opacity = '0';
                    btn.style.transform = 'translateY(10px)';
                    btn.style.transition = 'all 0.3s ease';
                    setTimeout(() => {
                        btn.style.opacity = '1';
                        btn.style.transform = 'translateY(0)';
                    }, 50);
                }, index * 50);
            });
        }

        function showFees(courseName) {
            if (!feesContent) return;
            const fees = feesData[courseName];
            if (!fees) return;

            feesContent.innerHTML = `
                <h3>${courseName}</h3>
                <p><strong>Duration:</strong> <span>${fees.duration || 'N/A'}</span></p>
                <p><strong>Tuition Fee:</strong> <span>${fees.tuition || 'N/A'}</span></p>
                <p><strong>Admission Fee:</strong> <span>${fees.admission_fee || 'N/A'}</span></p>
                <p><strong>Hostel (Non-AC):</strong> <span>${fees.hostel_non_ac || 'N/A'}</span></p>
                <p><strong>Hostel (AC):</strong> <span>${fees.hostel_ac || 'N/A'}</span></p>
                <p><strong>Exam Fee:</strong> <span>${fees.exam_fee || 'N/A'}</span></p>
                <p><strong>Books & Material:</strong> <span>${fees.books_material || 'N/A'}</span></p>
                <p><strong>Lab Fee:</strong> <span>${fees.lab_fee || 'N/A'}</span></p>
                <p><strong>Transport (Optional):</strong> <span>${fees.transport_optional || 'N/A'}</span></p>
                <p><strong>Extra Classes:</strong> <span>${fees.extra_classes || 'N/A'}</span></p>
            `;

            // animation
            feesContent.style.opacity = '0';
            feesContent.style.transform = 'translateY(20px)';
            setTimeout(() => {
                feesContent.style.transition = 'all 0.4s ease';
                feesContent.style.opacity = '1';
                feesContent.style.transform = 'translateY(0)';
            }, 50);
        }
    };

    // modal for programs
    const initProgramModal = () => {
        let programModal = $.qs('#programModal');
        
        if (!programModal) {
            programModal = createProgramModal();
        }

        const modal = new Modal('#programModal');

        function createProgramModal() {
            const modal = $.create('div', {
                id: 'programModal',
                'aria-hidden': 'true',
                class: 'program-modal'
            });

            modal.innerHTML = `
                <div class="modal-backdrop"></div>
                <div class="modal-panel" role="dialog" aria-modal="true" aria-labelledby="programModalTitle">
                    <button class="modal-close" aria-label="Close modal">×</button>
                    <header class="modal-header">
                        <h3 id="programModalTitle"></h3>
                        <p class="modal-subtitle"></p>
                    </header>
                    <main class="modal-body">
                        <div class="modal-left">
                            <p class="modal-full-desc"></p>
                            <ul class="modal-specs"></ul>
                        </div>
                        <aside class="modal-aside">
                            <div class="meta-row">
                                <strong>Duration:</strong>
                                <span class="modal-duration"></span>
                            </div>
                            <div class="meta-row">
                                <a href="#" id="downloadBrochureBtn" class="btn btn-outline" target="_blank" rel="noopener">
                                    Download Brochure
                                </a>
                            </div>
                            <div class="meta-row">
                                <a href="#" id="applyNowModalBtn" class="btn btn-primary">
                                    Apply Now
                                </a>
                            </div>
                        </aside>
                    </main>
                </div>
            `;

            document.body.appendChild(modal);
            return modal;
        }

        // click handlers
        $.delegate(document, 'click', '.explore-program, .program-details', (e) => {
            e.preventDefault();
            const btn = e.target.closest('.explore-program, .program-details');
            const card = btn.closest('.program-card');
            const programId = card ? card.getAttribute('data-id') : btn.getAttribute('data-program');
            
            if (programId) {
                openProgramModal(programId);
            }
        });

        function openProgramModal(programId) {
            fetch(CONFIG.DATA_PATH)
                .then(response => {
                    if (!response.ok) throw new Error('Program data not found');
                    return response.json();
                })
                .then(data => {
                    const program = (data.programs || []).find(p => p.id === programId);
                    if (!program) throw new Error('Program not found');

                    populateModal(program, data.meta);
                    modal.open();
                })
                .catch(error => {
                    console.error('Failed to load program:', error);
                    alert('Unable to load program details. Please try again.');
                });
        }

        function populateModal(program, meta = {}) {
            $.qs('#programModalTitle').textContent = program.title || '';
            $.qs('.modal-subtitle').textContent = program.subtitle || '';
            $.qs('.modal-full-desc').textContent = program.fullDesc || program.shortDesc || '';
            
            const specsList = $.qs('.modal-specs');
            specsList.innerHTML = '';
            (program.specializations || []).forEach(spec => {
                const li = $.create('li', {}, spec);
                specsList.appendChild(li);
            });

            $.qs('.modal-duration').textContent = program.duration || 'N/A';
            
            const brochureBtn = $.qs('#downloadBrochureBtn');
            brochureBtn.href = program.brochure || meta.brochureUrl || '#';
            
            const applyBtn = $.qs('#applyNowModalBtn');
            applyBtn.href = program.applyUrl || '#';
        }
    };

    // render programs
    const renderPrograms = (programs) => {
        const container = $.qs('.academics-grid');
        if (!container) return;

        container.innerHTML = '';

        programs.forEach((program, index) => {
            const card = $.create('article', {
                class: 'program-card scroll-reveal-scale',
                'data-id': program.id
            });

            card.innerHTML = `
                <div class="program-icon" aria-hidden="true">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                        <path d="M2 17l10 5 10-5M2 12l10 5 10-5"></path>
                    </svg>
                </div>
                <h3>${program.title}</h3>
                <p class="program-short">${program.shortDesc || ''}</p>
                <ul class="program-list">
                    ${(program.specializations || []).slice(0, 5).map(s => `<li>${s}</li>`).join('')}
                </ul>
                <button class="btn btn-outline program-details" data-program="${program.id}">
                    Explore Program
                </button>
            `;

            container.appendChild(card);

            // stagger animation
            setTimeout(() => {
                card.style.opacity = '0';
                card.style.transform = 'translateY(30px)';
                setTimeout(() => {
                    card.classList.add('scroll-reveal-scale');
                }, 50);
            }, index * CONFIG.ANIMATION_DELAY);
        });
    };

    // research render
    const renderResearch = (items) => {
        const section = $.qs('#research .research-highlights');
        if (!section || !items.length) return;

        section.innerHTML = '';

        items.forEach(item => {
            const div = $.create('div', { class: 'research-item scroll-reveal' });
            div.innerHTML = `
                <div class="research-content">
                    <h3>${item.title}</h3>
                    <p>${item.summary}</p>
                    <ul class="research-features">
                        ${(item.highlights || []).map(h => `<li>${h}</li>`).join('')}
                    </ul>
                </div>
                <div class="research-image">
                    <img src="${item.image}" alt="${item.title}" loading="lazy">
                </div>
            `;
            section.appendChild(div);
        });
    };

    // facilities render
    const renderFacilities = (items) => {
        const grid = $.qs('.campus-grid');
        if (!grid || !items.length) return;

        grid.innerHTML = '';

        items.forEach((facility, index) => {
            const card = $.create('div', { class: 'facility-card scroll-reveal-scale' });
            card.innerHTML = `
                <img src="${facility.image}" alt="${facility.title}" loading="lazy">
                <div class="facility-content">
                    <h3>${facility.title}</h3>
                    <p>${facility.desc}</p>
                </div>
            `;
            grid.appendChild(card);
        });
    };

    // admissions render
    const renderAdmissions = (admissions) => {
        const section = $.qs('#admissions .admissions-process');
        if (!section || !admissions.steps) return;

        section.innerHTML = '';

        admissions.steps.forEach(step => {
            const div = $.create('div', { class: 'process-step scroll-reveal' });
            div.innerHTML = `
                <div class="step-number">${step.step}</div>
                <h3>${step.title}</h3>
                <p>${step.desc}</p>
            `;
            section.appendChild(div);
        });
    };

    // recruiters render
    const renderRecruiters = (recruiters) => {
    };

    // data loading
    const loadData = () => {
        fetch(CONFIG.DATA_PATH)
            .then(response => {
                if (!response.ok) throw new Error('Data not found');
                return response.json();
            })
            .then(data => {
                renderPrograms(data.programs || []);
                renderResearch(data.research || []);
                renderFacilities(data.facilities || []);
                renderAdmissions(data.admissions || {});
                renderRecruiters(data.recruiters || []);
                
                // reinitialize
                setTimeout(() => {
                    initScrollReveal();
                }, 100);
            })
            .catch(error => {
                console.warn('Data loading failed:', error);
                // strict html
            });
    };

    // handle form submission
    const initFormHandling = () => {
        const form = $.qs('#leadForm');
        if (!form) return;

        $.on(form, 'submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);

    try {
        await fetch("https://eoi56lubuugv06i.m.pipedream.net", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        // Success Toast
        const btn = form.querySelector('button[type="submit"]');
        const originalText = btn.textContent;
        btn.textContent = 'Submitted Successfully!';
        btn.style.background = 'linear-gradient(135deg, #10B981, #059669)';
        btn.disabled = true;

        form.reset();

        setTimeout(() => {
            btn.textContent = originalText;
            btn.style.background = '';
            btn.disabled = false;
        }, 3000);

    } catch (error) {
        alert("Submission failed. Please try again.");
        console.error(error);
    }
});

    };

    // cta
    const initCTAButtons = () => {
        const applyButtons = $.qsa('#applyTopBtn, #heroApplyBtn, #admissionsApplyBtn');
        applyButtons.forEach(btn => {
            $.on(btn, 'click', (e) => {
                e.preventDefault();
                const contactSection = $.qs('#contact');
                if (contactSection) {
                    contactSection.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });

        const tourButtons = $.qsa('#heroVirtualTour');
        tourButtons.forEach(btn => {
            $.on(btn, 'click', (e) => {
                e.preventDefault();
                alert('Virtual tour coming soon! For now, please explore our campus section.');
            });
        });
    };

    // keyboard navigation
    const initKeyboardNav = () => {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && document.activeElement) {
                const el = document.activeElement;
                if (el.classList.contains('explore-program') || 
                    el.classList.contains('program-details')) {
                    el.click();
                }
            }
        });
    };

    // animation on load
    const initLoadingAnimation = () => {
        window.addEventListener('load', () => {
            document.body.style.opacity = '0';
            setTimeout(() => {
                document.body.style.transition = 'opacity 0.6s ease';
                document.body.style.opacity = '1';
            }, 100);
        });
    };

    // initialization
    const init = () => {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
            return;
        }

        // initialize features
        initLoadingAnimation();
        initSmoothScroll();
        initNavbarEffects();
        initMobileMenu();
        initScrollReveal();
        initFeesModal();
        initProgramModal();
        initFormHandling();
        initCTAButtons();
        initKeyboardNav();
        loadData();

        console.log(' Website initialized successfully!');
    };

    // start init
    init();

})();