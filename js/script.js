// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize AOS (Animate On Scroll)
    AOS.init({
        duration: 800,
        easing: 'ease-in-out',
        once: true,
        offset: 100
    });

    // Initialize components
    initNavigation();
    initContactForm();
    initPhoneMask();
    initMap();
    initScrollAnimations();
    initLoadingStates();
});

// Navigation functionality
function initNavigation() {
    const navbar = document.querySelector('.navbar');
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Navbar scroll effect
    window.addEventListener('scroll', function() {
        if (window.scrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
    
    // Smooth scroll for navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            if (href.startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(href);
                
                if (target) {
                    const offsetTop = target.offsetTop - 80; // Account for fixed navbar
                    
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
                
                // Close mobile menu if open
                const navbarCollapse = document.querySelector('.navbar-collapse');
                if (navbarCollapse.classList.contains('show')) {
                    const bsCollapse = new bootstrap.Collapse(navbarCollapse);
                    bsCollapse.hide();
                }
            }
        });
    });
    
    // Active section highlighting
    window.addEventListener('scroll', highlightActiveSection);
}

// Highlight active navigation section
function highlightActiveSection() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 100;
        const sectionHeight = section.clientHeight;
        
        if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
}

// Contact form functionality
function initContactForm() {
    const form = document.querySelector('.contact-form');
    
    if (!form) return;
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (validateForm(this)) {
            // Show loading state
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<span class="loading"></span> Отправка...';
            submitBtn.disabled = true;
            
            // Submit form via AJAX
            const formData = new FormData(this);
            
            fetch('contact.php', {
                method: 'POST',
                body: formData
            })
            .then(response => response.text())
            .then(data => {
                // Show success message
                const alertHtml = `<div class="alert alert-success alert-dismissible fade show" role="alert">
                    ${data}
                    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                </div>`;
                document.querySelector('#contact .container').insertAdjacentHTML('afterbegin', alertHtml);
                
                // Reset form
                form.reset();
                form.classList.remove('was-validated');
                
                // Reset button
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            })
            .catch(error => {
                // Show error message
                const alertHtml = `<div class="alert alert-danger alert-dismissible fade show" role="alert">
                    Произошла ошибка при отправке формы. Попробуйте позже.
                    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                </div>`;
                document.querySelector('#contact .container').insertAdjacentHTML('afterbegin', alertHtml);
                
                // Reset button
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            });
        }
    });
    
    // Real-time validation
    const inputs = form.querySelectorAll('input, textarea');
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateField(this);
        });
        
        input.addEventListener('input', function() {
            if (this.classList.contains('is-invalid')) {
                validateField(this);
            }
        });
    });
}

// Form validation
function validateForm(form) {
    let isValid = true;
    const inputs = form.querySelectorAll('input[required], textarea[required]');
    
    inputs.forEach(input => {
        if (!validateField(input)) {
            isValid = false;
        }
    });
    
    // Check consent checkbox
    const consent = form.querySelector('#consent');
    if (consent && !consent.checked) {
        consent.setCustomValidity('Необходимо согласие на обработку данных');
        consent.classList.add('is-invalid');
        isValid = false;
    } else if (consent) {
        consent.setCustomValidity('');
        consent.classList.remove('is-invalid');
    }
    
    form.classList.add('was-validated');
    return isValid;
}

// Individual field validation
function validateField(field) {
    const value = field.value.trim();
    let isValid = true;
    let message = '';
    
    // Required field check
    if (field.hasAttribute('required') && !value) {
        isValid = false;
        message = 'Это поле обязательно для заполнения';
    }
    
    // Specific validations
    if (value) {
        switch (field.type) {
            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) {
                    isValid = false;
                    message = 'Введите корректный email адрес';
                }
                break;
                
            case 'tel':
                const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
                if (!phoneRegex.test(value.replace(/\s/g, ''))) {
                    isValid = false;
                    message = 'Введите корректный номер телефона';
                }
                break;
                
            case 'text':
                if (field.name === 'name' && value.length < 2) {
                    isValid = false;
                    message = 'Имя должно содержать минимум 2 символа';
                }
                break;
                
            default:
                if (field.tagName === 'TEXTAREA' && value.length < 10) {
                    isValid = false;
                    message = 'Сообщение должно содержать минимум 10 символов';
                }
        }
    }
    
    // Apply validation state
    if (isValid) {
        field.setCustomValidity('');
        field.classList.remove('is-invalid');
        field.classList.add('is-valid');
    } else {
        field.setCustomValidity(message);
        field.classList.remove('is-valid');
        field.classList.add('is-invalid');
        
        // Update feedback message
        const feedback = field.nextElementSibling;
        if (feedback && feedback.classList.contains('invalid-feedback')) {
            feedback.textContent = message;
        }
    }
    
    return isValid;
}

// Phone number mask
function initPhoneMask() {
    const phoneInput = document.querySelector('#phone');
    
    if (!phoneInput) return;
    
    phoneInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        
        if (value.startsWith('7')) {
            value = value.substring(1);
        }
        
        if (value.startsWith('8')) {
            value = value.substring(1);
        }
        
        if (value.length > 0) {
            let formatted = '+7';
            
            if (value.length >= 1) {
                formatted += ' (' + value.substring(0, 3);
            }
            if (value.length >= 4) {
                formatted += ') ' + value.substring(3, 6);
            }
            if (value.length >= 7) {
                formatted += '-' + value.substring(6, 8);
            }
            if (value.length >= 9) {
                formatted += '-' + value.substring(8, 10);
            }
            
            e.target.value = formatted;
        }
    });
    
    phoneInput.addEventListener('keydown', function(e) {
        // Allow special keys
        if ([8, 9, 27, 13, 46].includes(e.keyCode) ||
            // Allow Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
            (e.keyCode === 65 && e.ctrlKey) ||
            (e.keyCode === 67 && e.ctrlKey) ||
            (e.keyCode === 86 && e.ctrlKey) ||
            (e.keyCode === 88 && e.ctrlKey)) {
            return;
        }
        
        // Ensure only numbers
        if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
            e.preventDefault();
        }
    });
}

// Initialize Yandex Map
function initMap() {
    // Check if ymaps is loaded
    if (typeof ymaps === 'undefined') {
        console.warn('Yandex Maps API not loaded');
        return;
    }
    
    ymaps.ready(function() {
        const map = new ymaps.Map('map', {
            center: [47.217212, 39.719118], // Ростов-на-Дону, ул. Баумана, 64
            zoom: 16,
            controls: ['zoomControl', 'fullscreenControl']
        });
        
        // Create placemark
        const placemark = new ymaps.Placemark([47.217212, 39.719118], {
            balloonContent: `
                <div style="padding: 10px;">
                    <strong>Home Service Rostov</strong><br>
                    г. Ростов-на-Дону, ул. Баумана, 64, офис 404<br>
                    <a href="tel:+79879230259">+7 987 923-02-59</a><br>
                    <a href="mailto:elitstroyservice123@bk.ru">elitstroyservice123@bk.ru</a>
                </div>
            `,
            hintContent: 'Home Service Rostov - Кадровое агентство'
        }, {
            preset: 'islands#redIcon',
            iconColor: '#ff6f00'
        });
        
        map.geoObjects.add(placemark);
        
        // Disable map interaction on mobile for better UX
        if (window.innerWidth < 768) {
            map.behaviors.disable('scrollZoom');
        }
    });
}

// Scroll animations and effects
function initScrollAnimations() {
    // Parallax effect for hero section
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const heroOverlay = document.querySelector('.hero-overlay');
        
        if (heroOverlay) {
            const speed = scrolled * 0.5;
            heroOverlay.style.transform = `translateY(${speed}px)`;
        }
    });
    
    // Counter animation
    const observerOptions = {
        threshold: 0.5,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const statNumbers = entry.target.querySelectorAll('.stat-number');
                statNumbers.forEach(stat => {
                    animateCounter(stat);
                });
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    const advantagesSection = document.querySelector('#advantages');
    if (advantagesSection) {
        observer.observe(advantagesSection);
    }
}

// Counter animation
function animateCounter(element) {
    const target = parseInt(element.textContent.replace(/\D/g, ''));
    const suffix = element.textContent.replace(/\d/g, '');
    const duration = 2000;
    const step = target / (duration / 16);
    let current = 0;
    
    const timer = setInterval(() => {
        current += step;
        
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        
        element.textContent = Math.floor(current) + suffix;
    }, 16);
}

// Loading states
function initLoadingStates() {
    // Add loading state to all buttons that trigger navigation
    const buttons = document.querySelectorAll('[href^="#"], .btn-accent');
    
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            if (this.getAttribute('href') && this.getAttribute('href').startsWith('#')) {
                return; // Skip for anchor links
            }
            
            // Add loading state for external actions
            const originalText = this.innerHTML;
            this.innerHTML = '<span class="loading"></span> Загрузка...';
            this.disabled = true;
            
            // Reset after 3 seconds (fallback)
            setTimeout(() => {
                this.innerHTML = originalText;
                this.disabled = false;
            }, 3000);
        });
    });
}

// Utility functions
function debounce(func, wait, immediate) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            timeout = null;
            if (!immediate) func(...args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func(...args);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Performance optimizations
window.addEventListener('scroll', throttle(() => {
    highlightActiveSection();
}, 100));

// Error handling
window.addEventListener('error', function(e) {
    console.error('JavaScript error:', e.error);
});

// Service Worker removed for compatibility

// Analytics helpers
function trackEvent(category, action, label) {
    if (typeof gtag !== 'undefined') {
        gtag('event', action, {
            event_category: category,
            event_label: label
        });
    }
}

// Track form submissions
document.addEventListener('submit', function(e) {
    if (e.target.classList.contains('contact-form')) {
        trackEvent('Form', 'Submit', 'Contact Form');
    }
});

// Track phone clicks
document.addEventListener('click', function(e) {
    if (e.target.closest('a[href^="tel:"]')) {
        trackEvent('Contact', 'Phone Click', e.target.href);
    }
    
    if (e.target.closest('a[href^="mailto:"]')) {
        trackEvent('Contact', 'Email Click', e.target.href);
    }
});
