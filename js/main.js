document.addEventListener('DOMContentLoaded', () => {
  const header = document.getElementById('header');
  const mobileToggle = document.getElementById('mobileToggle');
  const mobileNav = document.getElementById('mobileNav');
  const themeToggle = document.getElementById('themeToggle');
  const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');
  const sections = document.querySelectorAll('section[id]');

  // Theme toggle functionality
  const toggleTheme = () => {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    try {
      localStorage.setItem('theme', newTheme);
    } catch (e) {
      console.warn('Unable to save theme preference to localStorage:', e);
    }
  };

  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
  }

  // Update header styling on scroll
  const handleScroll = () => {
    if (window.scrollY > 20) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  // Toggle mobile navigation drawer
  const toggleMobileMenu = () => {
    const isExpanded = mobileToggle.getAttribute('aria-expanded') === 'true';
    mobileToggle.setAttribute('aria-expanded', !isExpanded);
    mobileToggle.classList.toggle('is-active');
    mobileNav.classList.toggle('is-open');
    mobileNav.setAttribute('aria-hidden', isExpanded);
  };

  if (mobileToggle && mobileNav) {
    mobileToggle.addEventListener('click', toggleMobileMenu);
  }

  // Initialize Lenis Smooth Scroll
  let lenis;
  if (typeof Lenis !== 'undefined') {
    lenis = new Lenis({
      duration: 1.2, // Smooth duration (around 1.2s)
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // easeOutExpo easing curve
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true, // Smooth mouse wheel scrolling enabled
      touchMultiplier: 2,
      // Native touch scrolling is preserved on mobile devices by default
    });

    // RequestAnimationFrame Loop
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }

  // Smooth scroll and close mobile drawer on anchor link click
  const allAnchorLinks = document.querySelectorAll('a[href^="#"]');
  allAnchorLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      const targetId = link.getAttribute('href');
      if (targetId && targetId !== '#' && targetId.length > 1) {
        try {
          const targetElement = document.querySelector(targetId);
          if (targetElement) {
            event.preventDefault();
            
            if (mobileNav && mobileNav.classList.contains('is-open')) {
              toggleMobileMenu();
            }

            const headerOffset = 80;

            if (lenis) {
              // Smooth scroll via Lenis with header offset
              lenis.scrollTo(targetElement, {
                offset: -headerOffset,
                duration: 1.2
              });
            } else {
              // Native fallback if Lenis CDN is unavailable
              const elementPosition = targetElement.getBoundingClientRect().top;
              const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

              window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
              });
            }
          }
        } catch (e) {
          // Ignore invalid selector queries if any
        }
      }
    });
  });

  // Track active section in navigation using intersection observer
  const observerOptions = {
    root: null,
    rootMargin: '-20% 0px -70% 0px',
    threshold: 0
  };

  const observerCallback = (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const activeId = entry.target.getAttribute('id');
        navLinks.forEach((link) => {
          const href = link.getAttribute('href');
          if (href === `#${activeId}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  };

  const observer = new IntersectionObserver(observerCallback, observerOptions);
  sections.forEach((section) => observer.observe(section));

  // Dynamic projects visibility toggle
  const projectsGrid = document.querySelector('.projects-grid');
  const toggleProjectsBtn = document.getElementById('toggleProjectsBtn');
  const projectsActions = document.getElementById('projectsActions');
  const initialVisibleCount = 3;

  if (projectsGrid && toggleProjectsBtn && projectsActions) {
    const projectCards = Array.from(projectsGrid.querySelectorAll('.project-card'));
    const totalProjects = projectCards.length;

    if (totalProjects <= initialVisibleCount) {
      projectsActions.style.display = 'none';
    } else {
      projectsActions.style.display = 'flex';

      // Hide projects beyond the initial visible count
      projectCards.forEach((card, index) => {
        if (index >= initialVisibleCount) {
          card.classList.add('is-hidden');
        }
      });

      let isExpanded = false;

      toggleProjectsBtn.addEventListener('click', () => {
        isExpanded = !isExpanded;
        const btnText = toggleProjectsBtn.querySelector('.btn-toggle-text');

        if (isExpanded) {
          projectCards.forEach((card, index) => {
            if (index >= initialVisibleCount) {
              card.classList.remove('is-hidden');
              card.classList.add('animate-in');
            }
          });

          if (btnText) {
            btnText.textContent = 'SHOW LESS';
          }
          toggleProjectsBtn.classList.add('is-expanded');
          toggleProjectsBtn.setAttribute('aria-expanded', 'true');

          if (lenis) {
            lenis.resize();
          }
        } else {
          projectCards.forEach((card, index) => {
            if (index >= initialVisibleCount) {
              card.classList.add('is-hidden');
              card.classList.remove('animate-in');
            }
          });

          if (btnText) {
            btnText.textContent = 'VIEW MORE';
          }
          toggleProjectsBtn.classList.remove('is-expanded');
          toggleProjectsBtn.setAttribute('aria-expanded', 'false');

          if (lenis) {
            lenis.resize();
          }

          // Smoothly scroll to the top of the projects section
          const worksSection = document.getElementById('works');
          if (worksSection) {
            const headerOffset = 80;
            if (lenis) {
              lenis.scrollTo(worksSection, {
                offset: -headerOffset,
                duration: 1.2
              });
            } else {
              const elementPosition = worksSection.getBoundingClientRect().top;
              const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
              window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
              });
            }
          }
        }
      });
    }
  }

  // Hero Image 3D Tilt & Cursor Follower Badge
  const heroImageFrame = document.getElementById('heroImageFrame');
  const heroBadge = document.getElementById('heroBadge');

  if (heroImageFrame && heroBadge) {
    let isHovered = false;
    let rafId = null;
    let mouseX = 0;
    let mouseY = 0;

    const updateTiltAndBadge = () => {
      if (!isHovered) return;

      const rect = heroImageFrame.getBoundingClientRect();
      const x = mouseX - rect.left;
      const y = mouseY - rect.top;

      // 3D Tilt Calculations
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const maxTilt = 10; // Max tilt in degrees

      // rotateX: cursor at top tilts top back (+deg), cursor at bottom tilts bottom back (-deg)
      const rotateX = ((centerY - y) / centerY) * maxTilt;
      // rotateY: cursor at right tilts right back (+deg), cursor at left tilts left back (-deg)
      const rotateY = ((x - centerX) / centerX) * maxTilt;

      heroImageFrame.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.03, 1.03, 1.03)`;

      // Cursor follower badge positioning with offset
      const offset = 18;
      let badgeX = x + offset;
      let badgeY = y + offset;

      const badgeWidth = heroBadge.offsetWidth || 110;
      const badgeHeight = heroBadge.offsetHeight || 30;

      // Boundary collision checks to keep badge neatly inside the frame
      if (badgeX + badgeWidth > rect.width - 8) {
        badgeX = x - badgeWidth - 14;
      }
      if (badgeY + badgeHeight > rect.height - 8) {
        badgeY = y - badgeHeight - 14;
      }

      badgeX = Math.max(8, badgeX);
      badgeY = Math.max(8, badgeY);

      heroBadge.style.left = `${badgeX}px`;
      heroBadge.style.top = `${badgeY}px`;
    };

    heroImageFrame.addEventListener('mouseenter', (e) => {
      isHovered = true;
      mouseX = e.clientX;
      mouseY = e.clientY;

      heroImageFrame.style.transition = 'transform 0.1s ease-out';
      heroBadge.classList.add('is-visible');

      updateTiltAndBadge();
    });

    heroImageFrame.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      rafId = requestAnimationFrame(updateTiltAndBadge);
    });

    heroImageFrame.addEventListener('mouseleave', () => {
      isHovered = false;
      if (rafId) {
        cancelAnimationFrame(rafId);
      }

      // Smooth reset transition
      heroImageFrame.style.transition = 'transform 0.2s ease-out, box-shadow 0.2s ease-out';
      heroImageFrame.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';

      // Hide badge
      heroBadge.classList.remove('is-visible');
    });
  }
});

