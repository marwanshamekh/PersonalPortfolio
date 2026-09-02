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

  // Project details dataset
  const projectsData = [
    {
      id: 0,
      title: 'Hospital Crowding Prediction System',
      image: 'assets/images/project-7.webp',
      liveUrl: null,
      sourceUrl: 'https://github.com/marwanshamekh/Hospital-Crowding-Prediction',
      role: 'Machine Learning & AI Developer',
      techStack: 'PYTHON, PANDAS, NUMPY, SCIKIT-LEARN, MACHINE LEARNING, DECISION TREE, FLASK, REST API, JAVASCRIPT, HTML, CSS',
      coreFeatures: [
        'Real-time AI prediction engine forecasting hospital crowding and emergency room occupancy levels',
        'High accuracy classification pipeline (99.17%) powered by optimized Decision Tree algorithms',
        'Strategic healthcare feature engineering incorporating patient triage, bed occupancy, and staff ratios',
        'Actionable early warning alerts enabling hospital administrators to proactively allocate critical resources',
        'Comprehensive data visualization dashboard designed for rapid clinical decision-making'
      ]
    },
    {
      id: 1,
      title: 'Mechatronics Engineer Portfolio',
      image: 'assets/images/project-5.webp',
      liveUrl: 'https://mahmoudshamekh.vercel.app/',
      sourceUrl: 'https://github.com/marwanmuhmmed25122007-tech/portfolio-mahmoud',
      role: 'Front-End Developer & UI/UX Designer',
      techStack: 'HTML5, CSS3, JavaScript, GSAP, 3D Canvas, Responsive Web Design',
      coreFeatures: [
        'Industrial-inspired visual identity tailored specifically for mechatronics and engineering showcases',
        'Smooth performance-optimized animations and interactive motion sequences powered by GSAP',
        'Immersive 3D visual components showcasing mechanical projects with high fidelity',
        'Interactive skills matrix, engineering project documentation, and achievements timeline',
        'Fully responsive, accessible design with lightning-fast load times and seamless cross-platform support'
      ]
    },
    {
      id: 2,
      title: 'MOODk - Fashion E-Commerce',
      image: 'assets/images/project-1.webp',
      liveUrl: 'https://clothes-store-lilac.vercel.app/',
      sourceUrl: 'https://github.com/marwanmuhmmed25122007-tech/clothes-store',
      role: 'Front-End Developer',
      techStack: 'HTML5, CSS3, JavaScript (ES6+), LocalStorage, Responsive Web Design',
      coreFeatures: [
        'Interactive product catalog with multi-category browsing across Men, Women, and Kids collections',
        'Instant real-time search filtering with dynamic keyword matching and product sorting',
        'Comprehensive shopping cart system with persistent quantity updates and automated subtotal calculation',
        'Dedicated user wishlist functionality allowing customers to save and curate favorite items',
        'Optimized mobile-first responsive checkout preview experience'
      ]
    },
    {
      id: 3,
      title: 'Airline Website - Flight Booking Platform',
      image: 'assets/images/project-2.webp',
      liveUrl: 'https://airline-website-silk.vercel.app/',
      sourceUrl: 'https://github.com/Mo2men-Be3der74/airline-website',
      role: 'Front-End Developer',
      techStack: 'HTML5, CSS3, JavaScript (ES6+), CSS Custom Properties, UI/UX Design',
      coreFeatures: [
        'Interactive flight search engine with dynamic destination selection and travel date validation',
        'Seamless dual-theme switching with tailored Light and Dark color schemes',
        'Detailed flight timetable and seat reservation interface with transparent pricing metrics',
        'Personalized user dashboard for managing reservations, profile settings, and travel history',
        'Comprehensive passenger help center with accordion FAQs and real-time form validation'
      ]
    },
    {
      id: 4,
      title: 'Game Review - Gaming Platform',
      image: 'assets/images/project-3.webp',
      liveUrl: 'https://game-reviews-omega.vercel.app/',
      sourceUrl: 'http://github.com/marwanmuhmmed25122007-tech/game-review-website',
      role: 'Front-End Developer',
      techStack: 'HTML5, CSS3, JavaScript (ES6+),  Modern CSS Grid',
      coreFeatures: [
        'Dynamic game discovery hub with platform filtering, genre categorization, and release tracking',
        'Immersive individual game review pages with high-resolution visual previews and gameplay summaries',
        'Interactive review rating breakdown covering gameplay mechanics, graphics, audio, and replayability',
        'Fast search and instant filtering across PC, PlayStation, Xbox, and Nintendo games',
        'Modern dark-themed aesthetic with polished hover effects and fluid layout transitions'
      ]
    },
    {
      id: 5,
      title: 'Courses Website - Learning Platform',
      image: 'assets/images/project-4.webp',
      liveUrl: 'https://courses-six-bay.vercel.app/',
      sourceUrl: 'https://github.com/marwanmuhmmed25122007-tech/courses-project',
      role: 'UI/Web Developer',
      techStack: 'HTML5, CSS3, Semantic HTML, Responsive Web Design, Flexbox',
      coreFeatures: [
        'Structured multi-page educational curriculum organized by skill levels and domains',
        'Interactive course cards highlighting syllabus outlines, lecture counts, and instructor credentials',
        'Clean, semantic, and accessible interface built with pure vanilla HTML5 and CSS3',
        'Fully fluid responsive grid ensuring an optimal reading experience on mobile, tablet, and desktop',
        'Optimized asset loading and typography crafted for prolonged study and clear readability'
      ]
    },
    {
      id: 6,
      title: 'Old Personal Portfolio',
      image: 'assets/images/project-6.webp',
      liveUrl: 'https://marwan-shamekh.vercel.app/',
      sourceUrl: 'https://github.com/marwanmuhmmed25122007-tech/old-portfolio',
      role: 'Web Developer (First Milestone)',
      techStack: 'HTML5, CSS3, JavaScript, Git & GitHub, Vercel Deployment',
      coreFeatures: [
        'Inaugural personal website created during the IEEE BUB SB Web Development Training track',
        'Multi-section responsive portfolio presenting biography, skills, and early web projects',
        'Custom CSS animations and JavaScript interactive navigation menus',
        'Hands-on application of Git version control, branch management, and continuous Vercel deployment',
        'Foundational milestone project reflecting the starting point of continuous growth in web engineering'
      ]
    }
  ];

  // Project details modal controller
  const projectModal = document.getElementById('projectModal');
  const projectModalDialog = document.getElementById('projectModalDialog');
  const projectModalClose = document.getElementById('projectModalClose');
  const modalLiveLink = document.getElementById('modalLiveLink');
  const modalSourceLink = document.getElementById('modalSourceLink');
  const modalMockupImg = document.getElementById('modalMockupImg');
  const modalProjectTitle = document.getElementById('modalProjectTitle');
  const modalFeaturesList = document.getElementById('modalFeaturesList');
  const modalRoleText = document.getElementById('modalRoleText');
  const modalTechStackText = document.getElementById('modalTechStackText');
  const modalPrevBtn = document.getElementById('modalPrevBtn');
  const modalNextBtn = document.getElementById('modalNextBtn');
  const modalPrevTitle = document.getElementById('modalPrevTitle');
  const modalNextTitle = document.getElementById('modalNextTitle');

  let currentProjectIndex = 0;

  const renderProjectModal = (index) => {
    if (index < 0 || index >= projectsData.length) return;
    currentProjectIndex = index;

    const currentProject = projectsData[index];
    const total = projectsData.length;
    const prevIndex = (index - 1 + total) % total;
    const nextIndex = (index + 1) % total;

    // Update images and accessibility
    if (modalMockupImg) {
      modalMockupImg.src = currentProject.image;
      modalMockupImg.alt = `${currentProject.title} Preview`;
    }

    if (modalProjectTitle) {
      modalProjectTitle.textContent = currentProject.title;
    }

    // Update header links
    if (modalLiveLink) {
      if (currentProject.liveUrl) {
        modalLiveLink.href = currentProject.liveUrl;
        modalLiveLink.style.display = 'inline-flex';
      } else {
        modalLiveLink.style.display = 'none';
      }
    }

    if (modalSourceLink) {
      if (currentProject.sourceUrl) {
        modalSourceLink.href = currentProject.sourceUrl;
        modalSourceLink.style.display = 'inline-flex';
      } else {
        modalSourceLink.style.display = 'none';
      }
    }

    // Update core features numbered list
    if (modalFeaturesList) {
      modalFeaturesList.innerHTML = '';
      currentProject.coreFeatures.forEach((feature, idx) => {
        const item = document.createElement('li');
        item.className = 'project-feature-item';

        const numSpan = document.createElement('span');
        numSpan.className = 'project-feature-num';
        numSpan.textContent = String(idx + 1).padStart(2, '0');

        const textSpan = document.createElement('span');
        textSpan.className = 'project-feature-text';
        textSpan.textContent = feature;

        item.appendChild(numSpan);
        item.appendChild(textSpan);
        modalFeaturesList.appendChild(item);
      });
    }

    // Update details column
    if (modalRoleText) {
      modalRoleText.textContent = currentProject.role;
    }

    if (modalTechStackText) {
      modalTechStackText.textContent = currentProject.techStack;
    }

    // Update bottom navigation
    if (modalPrevTitle) {
      modalPrevTitle.textContent = projectsData[prevIndex].title;
    }

    if (modalNextTitle) {
      modalNextTitle.textContent = projectsData[nextIndex].title;
    }

    // Trigger subtle switch animation
    if (projectModalDialog) {
      projectModalDialog.scrollTop = 0;
      projectModalDialog.classList.remove('modal-content-switch');
      void projectModalDialog.offsetWidth;
      projectModalDialog.classList.add('modal-content-switch');
    }
  };

  const openProjectModal = (index) => {
    if (!projectModal) return;
    renderProjectModal(index);
    if (projectModalDialog) {
      projectModalDialog.scrollTop = 0;
    }
    projectModal.classList.add('is-active');
    projectModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    if (lenis) {
      lenis.stop();
    }
  };

  const closeProjectModal = () => {
    if (!projectModal) return;
    projectModal.classList.remove('is-active');
    projectModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';

    if (lenis) {
      lenis.start();
    }
  };

  // Attach card click handlers for project showcase
  if (projectsGrid) {
    projectsGrid.addEventListener('click', (e) => {
      const card = e.target.closest('.project-card');
      if (!card) return;

      const indexAttr = card.getAttribute('data-project-index');
      if (indexAttr !== null) {
        const index = parseInt(indexAttr, 10);
        if (!isNaN(index)) {
          e.preventDefault();
          openProjectModal(index);
        }
      }
    });
  }

  // Close button click
  if (projectModalClose) {
    projectModalClose.addEventListener('click', closeProjectModal);
  }

  // Backdrop click to close (when clicking outside the modal dialog)
  if (projectModal) {
    projectModal.addEventListener('click', (e) => {
      if (e.target === projectModal) {
        closeProjectModal();
      }
    });
  }

  // Previous and next buttons in modal
  if (modalPrevBtn) {
    modalPrevBtn.addEventListener('click', () => {
      const prevIndex = (currentProjectIndex - 1 + projectsData.length) % projectsData.length;
      renderProjectModal(prevIndex);
    });
  }

  if (modalNextBtn) {
    modalNextBtn.addEventListener('click', () => {
      const nextIndex = (currentProjectIndex + 1) % projectsData.length;
      renderProjectModal(nextIndex);
    });
  }

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (!projectModal || !projectModal.classList.contains('is-active')) return;

    if (e.key === 'Escape') {
      closeProjectModal();
    } else if (e.key === 'ArrowLeft') {
      const prevIndex = (currentProjectIndex - 1 + projectsData.length) % projectsData.length;
      renderProjectModal(prevIndex);
    } else if (e.key === 'ArrowRight') {
      const nextIndex = (currentProjectIndex + 1) % projectsData.length;
      renderProjectModal(nextIndex);
    }
  });
});

