document.addEventListener("DOMContentLoaded", () => {
  
  /* ================= scrool a ================= */
  const observerOptions = {
    threshold: 0.15,
    rootMargin: "0px 0px -100px 0px"
  };

  const scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
      }
    });
  }, observerOptions);

  const addScrollReveal = () => {
    document.querySelectorAll('h2').forEach(el => {
      el.classList.add('scroll-reveal');
      scrollObserver.observe(el);
    });


    document.querySelectorAll('.card, .course-card, .placement-stat, .contact-card').forEach(el => {
      el.classList.add('scroll-reveal-scale');
      scrollObserver.observe(el);
    });

    document.querySelectorAll('.feature-list li').forEach((el, index) => {
      el.style.animationDelay = `${index * 0.1}s`;
      el.classList.add('scroll-reveal-left');
      scrollObserver.observe(el);
    });

    document.querySelectorAll('.gallery-item').forEach((el, index) => {
      el.style.animationDelay = `${index * 0.08}s`;
      el.classList.add('scroll-reveal-scale');
      scrollObserver.observe(el);
    });

    document.querySelectorAll('.about-left, .about-right').forEach(el => {
      el.classList.add('scroll-reveal');
      scrollObserver.observe(el);
    });
  };

  addScrollReveal();

  /* =================nav ================= */
  const nav = document.querySelector('.nav');
  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
    
    lastScroll = currentScroll;
  });

  /* ================hro slid ================= */
  const slides = document.querySelectorAll(".slide");
  const prevBtn = document.querySelector(".slider-prev");
  const nextBtn = document.querySelector(".slider-next");
  const dotsContainer = document.getElementById("sliderDots");

  let current = 0;
  let autoSlideInterval;
  const slideDelay = 5000;

  slides.forEach((_, i) => {
    const dot = document.createElement("button");
    dot.classList.add("slider-dot");
    dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
    if (i === 0) dot.classList.add("active");
    dot.addEventListener("click", () => {
      goToSlide(i);
      safeStartAutoSlide();
    });
    dotsContainer.appendChild(dot);
  });

  const dots = document.querySelectorAll(".slider-dot");

  function safeStartAutoSlide() {
    clearInterval(autoSlideInterval);
    autoSlideInterval = setInterval(nextSlide, slideDelay);
  }

  function showSlide(index) {
    slides.forEach((slide, i) => {
      slide.classList.remove('active');
      if (i === index) {
        slide.classList.add('active');
      }
    });
    
    dots.forEach((dot, i) => {
      dot.classList.toggle("active", i === index);
    });
  }

  function goToSlide(index) {
    current = (index + slides.length) % slides.length;
    showSlide(current);
  }

  function nextSlide() {
    goToSlide(current + 1);
  }

  function prevSlide() {
    goToSlide(current - 1);
  }

  function startAutoSlide() {
    autoSlideInterval = setInterval(nextSlide, slideDelay);
  }

  function safeStartAutoSlide() {
    if (autoSlideInterval) clearInterval(autoSlideInterval);
    autoSlideInterval = setInterval(nextSlide, slideDelay);
  }

  function resetAutoSlide() {
    clearInterval(autoSlideInterval);
    safeStartAutoSlide();
  }

  nextBtn.addEventListener("click", () => {
    nextSlide();
    safeStartAutoSlide();
  });

  prevBtn.addEventListener("click", () => {
    prevSlide();
    safeStartAutoSlide();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
      prevSlide();
      safeStartAutoSlide();
    } else if (e.key === 'ArrowRight') {
      nextSlide();
      safeStartAutoSlide();
    }
  });

  const heroSlider = document.querySelector('.hero-slider');
  heroSlider.addEventListener('mouseenter', () => {
    clearInterval(autoSlideInterval);
  });
  heroSlider.addEventListener('mouseleave', () => {
    startAutoSlide();
  });

  // init slider
  showSlide(current);
  startAutoSlide();

  /* ================= rctrs ================= */
  const strip = document.querySelector(".recruiters-strip");
  const track = document.querySelector(".recruiters-track");

  if (strip && track) {
    const clone = track.cloneNode(true);
    strip.appendChild(clone);

    let pos1 = 0;
    let pos2 = track.offsetWidth;
    const speed = 1.2;

    function scrollLogos() {
      pos1 -= speed;
      pos2 -= speed;

      if (pos1 <= -track.offsetWidth) {
        pos1 = pos2 + track.offsetWidth - speed;
      }
      if (pos2 <= -track.offsetWidth) {
        pos2 = pos1 + track.offsetWidth - speed;
      }

      track.style.transform = `translateX(${pos1}px)`;
      clone.style.transform = `translateX(${pos2}px)`;

      requestAnimationFrame(scrollLogos);
    }

    scrollLogos();
  }

  /* ================= fee modal ================= */
  const feesModal = document.getElementById("feesModal");
  const feesButtonsWrap = document.getElementById("feesButtons");
  const feesContent = document.getElementById("feesContent");
  const modalClose = document.querySelector(".modal-close");
  const courseFeeBtns = document.querySelectorAll("[data-course]");

  let feesData = {};


  fetch("assets/data/fees.json")
    .then(res => res.json())
    .then(data => {
      feesData = data;

 
      feesButtonsWrap.innerHTML = "";
      Object.keys(feesData).forEach(course => {
        const btn = document.createElement("button");
        btn.className = "btn btn-outline small";
        btn.textContent = course;
        btn.addEventListener("click", () => {
          showFees(course);

          document.querySelectorAll('#feesButtons .btn').forEach(b => {
            b.classList.remove('btn-primary');
            b.classList.add('btn-outline');
          });
          btn.classList.remove('btn-outline');
          btn.classList.add('btn-primary');
        });
        feesButtonsWrap.appendChild(btn);
      });
    })
    .catch(err => {
      console.error('Failed to load fees data:', err);
      feesContent.innerHTML = '<p style="color: var(--error);">Failed to load fees data. Please try again later.</p>';
    });

  // fee generator
  function showFees(courseName) {
    const fees = feesData[courseName];
    if (!fees) return;

    feesContent.innerHTML = `
      <h3 style="margin-bottom: 1.5rem; color: var(--primary-700); font-size: 1.75rem;">${courseName}</h3>

      <div class="fee-section-title">📘 Academic Fees</div>
      <div class="fee-row"><h4>Duration</h4><p>${fees.duration || "-"}</p></div>
      <div class="fee-row"><h4>Tuition Fee</h4><p>${fees.tuition || "-"}</p></div>
      <div class="fee-row"><h4>Admission Fee</h4><p>${fees.admission_fee || "-"}</p></div>
      <div class="fee-row"><h4>Exam Fee</h4><p>${fees.exam_fee || "-"}</p></div>
      <div class="fee-row"><h4>Books & Study Material</h4><p>${fees.books_material || "-"}</p></div>
      <div class="fee-row"><h4>Lab Charges</h4><p>${fees.lab_fee || "-"}</p></div>

      <div class="fee-section-title">🏫 Hostel & Living</div>
      <div class="fee-row"><h4>Hostel (Non-AC)</h4><p>${fees.hostel_non_ac || "-"}</p></div>
      <div class="fee-row"><h4>Hostel (AC)</h4><p>${fees.hostel_ac || "-"}</p></div>
      <div class="fee-row"><h4>Security (Refundable)</h4><p>${fees.security_refundable || "-"}</p></div>
      <div class="fee-row"><h4>Transport (Optional)</h4><p>${fees.transport_optional || "-"}</p></div>

      <div class="fee-section-title">📚 Extra Support</div>
      <div class="fee-row"><h4>Additional Classes</h4><p>${fees.extra_classes || "-"}</p></div>
    `;

    setTimeout(() => {
      document.querySelectorAll('.fee-row').forEach((row, index) => {
        row.style.animation = `fadeInUp 0.4s ease-out ${index * 0.05}s both`;
      });
    }, 100);
  }

  function openFeesModal(course = null) {
    feesModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = 'hidden';
    if (course) {
      showFees(course);
    } else if (Object.keys(feesData).length > 0) {

      const firstCourse = Object.keys(feesData)[0];
      showFees(firstCourse);
      const firstBtn = feesButtonsWrap.querySelector('.btn');
      if (firstBtn) {
        firstBtn.classList.remove('btn-outline');
        firstBtn.classList.add('btn-primary');
      }
    }
  }

  function closeFeesModal() {
    feesModal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = '';
  }

  modalClose.addEventListener("click", closeFeesModal);

  feesModal.addEventListener("click", e => {
    if (e.target === feesModal) {
      closeFeesModal();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && feesModal.getAttribute('aria-hidden') === 'false') {
      closeFeesModal();
    }
  });


  courseFeeBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const course = btn.getAttribute("data-course");
      openFeesModal(course);
    });
  });

  const feesTopBtn = document.getElementById("feesTopBtn");
  if (feesTopBtn) {
    feesTopBtn.addEventListener("click", () => openFeesModal());
  }

  const heroFeesBtn = document.getElementById("heroFeesBtn");
  if (heroFeesBtn) {
    heroFeesBtn.addEventListener("click", () => openFeesModal());
  }

  /* frm handle*/
  const leadForm = document.getElementById("leadForm");
  const responseMsg = document.getElementById("responseMsg");
  const resetBtn = document.getElementById("resetFormBtn");

  if (leadForm) {
    leadForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const formData = new FormData(leadForm);
      const data = Object.fromEntries(formData.entries());

      
      const submitBtn = leadForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'Submitting...';
      submitBtn.disabled = true;

      try {
        const response = await fetch('https://eooa3uhg2tdos2n.m.pipedream.net', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data)
        });

        if (response.ok) {
          responseMsg.textContent = "Thank you! We'll contact you within 24-48 hours.";
          responseMsg.className = "response-msg success";
          leadForm.reset();
        } else {
          throw new Error('Submission failed');
        }
      } catch (error) {
        responseMsg.textContent = "Submission failed. Please try again or contact us directly.";
        responseMsg.className = "response-msg error";
      } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        
        setTimeout(() => {
          responseMsg.style.display = 'none';
        }, 5000);
      }
    });


    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        leadForm.reset();
        responseMsg.style.display = 'none';
      });
    }
  }

  /* =================smooth scrol ================= */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        const offsetTop = target.offsetTop - 80;
        window.scrollTo({
          top: offsetTop,
          behavior: 'smooth'
        });
      }
    });
  });

  /* ================= glry high================= */
  const galleryItems = document.querySelectorAll('.gallery-item');
  
  galleryItems.forEach(item => {
    item.addEventListener('click', () => {
      const img = item.querySelector('img');
      if (img) {
        const lightbox = document.createElement('div');
        lightbox.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.95);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          cursor: pointer;
          animation: fadeIn 0.3s ease-out;
        `;
        
        const clonedImg = img.cloneNode();
        clonedImg.style.cssText = `
          max-width: 90%;
          max-height: 90%;
          border-radius: 1rem;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          animation: modalSlideUp 0.4s ease-out;
        `;
        
        lightbox.appendChild(clonedImg);
        document.body.appendChild(lightbox);
        document.body.style.overflow = 'hidden';
        
        lightbox.addEventListener('click', () => {
          lightbox.style.animation = 'fadeOut 0.3s ease-out';
          setTimeout(() => {
            document.body.removeChild(lightbox);
            document.body.style.overflow = '';
          }, 300);
        });
      }
    });
  });

  /* ================= button hand0ler ================= */
  const applyButtons = document.querySelectorAll('[data-apply-course]');
  
  applyButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const course = btn.getAttribute('data-apply-course');
      const contactSection = document.getElementById('contact');
      const courseInput = document.getElementById('course');
      
      if (contactSection && courseInput) {
        courseInput.value = course;
        contactSection.scrollIntoView({ behavior: 'smooth' });
        
        setTimeout(() => {
          const form = document.getElementById('leadForm');
          form.style.animation = 'pulse 0.6s ease-out';
          setTimeout(() => {
            form.style.animation = '';
          }, 600);
        }, 800);
      }
    });
  });

  /* ================= parallex ================= */
  window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero');
    if (hero && scrolled < hero.offsetHeight) {
      const activeSlide = document.querySelector('.slide.active');
      if (activeSlide) {
        activeSlide.style.transform = `translateY(${scrolled * 0.5}px) scale(1)`;
      }
    }
  });

  /* ================= animation================= */
  const animateCounter = (element, target, duration = 2000) => {
    const start = 0;
    const increment = target / (duration / 16);
    let current = start;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        element.textContent = target;
        clearInterval(timer);
      } else {
        element.textContent = Math.floor(current);
      }
    }, 16);
  };

  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.dataset.animated) {
        const num = entry.target.querySelector('.num');
        if (num) {
          const text = num.textContent.trim();
          const value = parseInt(text.replace(/\D/g, ''));
          if (!isNaN(value)) {
            num.textContent = '0';
            animateCounter(num, value);
            entry.target.dataset.animated = 'true';
          }
        }
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('.stat').forEach(stat => {
    statsObserver.observe(stat);
  });

  console.log('✅ Enhanced University Website Loaded Successfully');
});

// inline cs ani
const style = document.createElement('style');
style.textContent = `
  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.02); }
  }
  
  @keyframes fadeOut {
    from { opacity: 1; }
    to { opacity: 0; }
  }
`;
document.head.appendChild(style);

/* ================= mobile hamburg ================= */
const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");

if (navToggle) {
  navToggle.addEventListener("click", () => {
    const expanded = navToggle.getAttribute("aria-expanded") === "true";
    navToggle.setAttribute("aria-expanded", !expanded);

    navLinks.style.display = expanded ? "none" : "flex";
    navLinks.style.flexDirection = "column";
    navLinks.style.position = "absolute";
    navLinks.style.top = "100%";
    navLinks.style.left = "0";
    navLinks.style.width = "100%";
    navLinks.style.background = "white";
    navLinks.style.padding = "1rem 0";
    navLinks.style.boxShadow = "0 10px 20px rgba(0,0,0,0.1)";
    navLinks.style.zIndex = "9999";
  });
}

if (window.lucide) {
  lucide.createIcons();
}
