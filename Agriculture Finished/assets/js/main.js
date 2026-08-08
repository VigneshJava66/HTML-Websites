/**
 * Agriculture Website Core JS
 * Features: Dark/Light Mode, RTL Switcher, 3D Card Hover, Scroll Reveal, Header Scroll
 */

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initRtl();
  initScrollEffects();
  initMobileMenu();
  initDropdownA11y();
  initCard3D();
  initScrollReveal();
});

/* ==========================================
   Theme Handler (Light / Dark Mode)
   ========================================== */
function initTheme() {
  const themeToggleBtn = document.getElementById('theme-toggle');
  if (!themeToggleBtn) return;

  // Retrieve theme or default to system
  const currentTheme = localStorage.getItem('color-scheme') || 
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

  // Apply theme on load
  setTheme(currentTheme);

  // Toggle theme click event
  themeToggleBtn.addEventListener('click', () => {
    const activeTheme = document.documentElement.getAttribute('data-theme') || 
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    const newTheme = activeTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  });

  // Watch for system preference changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('color-scheme')) {
      setTheme(e.matches ? 'dark' : 'light');
    }
  });
}

function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('color-scheme', theme);
  
  // Update meta color-scheme
  const metaColorScheme = document.querySelector('meta[name="color-scheme"]');
  if (metaColorScheme) {
    metaColorScheme.content = theme === 'dark' ? 'dark' : 'light';
  }
}

/* ==========================================
   RTL Switcher Handler
   ========================================== */
function initRtl() {
  const rtlToggleBtn = document.getElementById('rtl-toggle');
  if (!rtlToggleBtn) return;

  // Read saved direction or default to LTR
  const currentDir = localStorage.getItem('site-dir') || 'ltr';
  setDirection(currentDir);

  rtlToggleBtn.addEventListener('click', () => {
    const activeDir = document.documentElement.getAttribute('dir') || 'ltr';
    const newDir = activeDir === 'rtl' ? 'ltr' : 'rtl';
    setDirection(newDir);
  });
}

function setDirection(dir) {
  document.documentElement.setAttribute('dir', dir);
  localStorage.setItem('site-dir', dir);
}

/* ==========================================
   Header Scroll Transitions
   ========================================== */
function initScrollEffects() {
  const header = document.querySelector('.header');
  if (!header) return;

  const handleScroll = () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  // Run on load and bind to scroll
  handleScroll();
  window.addEventListener('scroll', handleScroll);
}

/* ==========================================
   Mobile Responsive Menu
   ========================================== */
function initMobileMenu() {
  const menuToggle = document.getElementById('menu-toggle');
  const navMenu = document.getElementById('nav-menu');

  if (!menuToggle || !navMenu) return;

  menuToggle.addEventListener('click', () => {
    const isActive = navMenu.classList.toggle('active');
    menuToggle.setAttribute('aria-expanded', isActive ? 'true' : 'false');
    
    // Toggle icon (hamburger vs close)
    const icon = menuToggle.querySelector('svg');
    if (icon) {
      if (isActive) {
        icon.innerHTML = '<path d="M18 6 6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>';
      } else {
        icon.innerHTML = '<path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>';
      }
    }
  });

  // Close menu when clicking links
  navMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', (e) => {
      // Do not close if click is on dropdown trigger
      if (e.target.closest('.dropdown-trigger')) return;
      navMenu.classList.remove('active');
      menuToggle.setAttribute('aria-expanded', 'false');
      const icon = menuToggle.querySelector('svg');
      if (icon) {
        icon.innerHTML = '<path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>';
      }
    });
  });
}

/* ==========================================
   3D Tilt Card Animations
   ========================================== */
function initCard3D() {
  const cards = document.querySelectorAll('.card-3d');
  
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const cardRect = card.getBoundingClientRect();
      
      // Get mouse position relative to card (0 to width, 0 to height)
      const mouseX = e.clientX - cardRect.left;
      const mouseY = e.clientY - cardRect.top;
      
      // Calculate rotation (-15deg to +15deg)
      const rotateY = -15 + (mouseX / cardRect.width) * 30;
      const rotateX = 15 - (mouseY / cardRect.height) * 30;
      
      // Apply transforms
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    });
  });
}

/* ==========================================
   Scroll Reveal Observer
   ========================================== */
function initScrollReveal() {
  const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
  
  if (!('IntersectionObserver' in window)) {
    // Fallback for older browsers
    revealElements.forEach(el => el.classList.add('active'));
    return;
  }

  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.15
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        // Unobserve once revealed
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  revealElements.forEach(el => {
    observer.observe(el);
  });
}

/* ==========================================
   Dropdown Accessibility (A11y) & Touch Handler
   ========================================== */
function initDropdownA11y() {
  const dropdowns = document.querySelectorAll('.nav-item-dropdown');
  
  dropdowns.forEach(dropdown => {
    const trigger = dropdown.querySelector('.dropdown-trigger');
    if (!trigger) return;
    
    // Toggle on click for touch screens and keyboards
    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const expanded = trigger.getAttribute('aria-expanded') === 'true';
      
      // Close other dropdowns
      document.querySelectorAll('.dropdown-trigger').forEach(btn => {
        if (btn !== trigger) btn.setAttribute('aria-expanded', 'false');
      });
      
      trigger.setAttribute('aria-expanded', !expanded ? 'true' : 'false');
    });

    // Update aria-expanded on focus/blur inside dropdown
    dropdown.addEventListener('focusin', () => {
      trigger.setAttribute('aria-expanded', 'true');
    });
    
    dropdown.addEventListener('focusout', () => {
      trigger.setAttribute('aria-expanded', 'false');
    });

    // Hover listeners to keep aria-expanded in sync
    dropdown.addEventListener('mouseenter', () => {
      trigger.setAttribute('aria-expanded', 'true');
    });
    
    dropdown.addEventListener('mouseleave', () => {
      trigger.setAttribute('aria-expanded', 'false');
    });
  });

  // Click outside closes dropdowns
  document.addEventListener('click', () => {
    document.querySelectorAll('.dropdown-trigger').forEach(btn => {
      btn.setAttribute('aria-expanded', 'false');
    });
  });
}
