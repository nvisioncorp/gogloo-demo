console.log('🦶 Module footer.js chargé');

// ============================================
// CONFIGURATION
// ============================================

const CONFIG = {
    toastDuration: 3000,
    animationDelay: 100,
    scrollThreshold: 100,
    socialLinks: {
        facebook: 'https://facebook.com/gogloo',
        twitter: 'https://twitter.com/gogloo',
        instagram: 'https://instagram.com/gogloo',
        linkedin: 'https://linkedin.com/company/gogloo',
        youtube: 'https://youtube.com/@gogloo'
    }
};

// ============================================
// VARIABLES GLOBALES
// ============================================

let footer = null;
let backToTopBtn = null;
let isVisible = false;
let observer = null;

// ============================================
// INITIALISATION
// ============================================

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

function init() {
    console.log('🚀 Initialisation du footer...');

    footer = document.querySelector('.footer');

    if (!footer) {
        console.warn('⚠️ Footer non trouvé dans le DOM');
        return;
    }

    // Initialiser les composants
    setupCategoryLinks();
    setupServiceLinks();
    setupAboutLinks();
    setupSocialLinks();
    setupPaymentInfo();
    setupSecurityBadges();
    setupLegalLinks();
    setupBackToTop();
    setupIntersectionObserver();
    setupKeyboardNavigation();

    console.log('✅ Footer initialisé avec succès');
}

// ============================================
// LIENS CATÉGORIES
// ============================================

function setupCategoryLinks() {
    const categoryLinks = footer.querySelectorAll('.footer-categories li');

    categoryLinks.forEach(link => {
        // Rendre focusable
        link.setAttribute('tabindex', '0');
        link.setAttribute('role', 'button');

        link.addEventListener('click', (e) => {
            e.preventDefault();
            const category = link.textContent.trim();
            handleCategoryClick(category);
        });

        link.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                link.click();
            }
        });

        // Hover effect
        link.addEventListener('mouseenter', () => {
            link.style.transform = 'translateX(5px)';
        });

        link.addEventListener('mouseleave', () => {
            link.style.transform = 'translateX(0)';
        });
    });

    console.log(`📂 ${categoryLinks.length} liens catégories configurés`);
}

function handleCategoryClick(category) {
    console.log(`📂 Navigation vers: ${category}`);
    
    // Animation de chargement
    showLoadingToast('Chargement...');

    // Simuler navigation (à remplacer par vraie navigation)
    setTimeout(() => {
        const slug = category.toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/&/g, 'et')
            .replace(/\s+/g, '-');
        
        window.location.href = `/categorie/${slug}`;
    }, 300);
}

// ============================================
// LIENS SERVICE CLIENT
// ============================================

function setupServiceLinks() {
    const serviceLinks = footer.querySelectorAll('.footer-service li');

    serviceLinks.forEach(link => {
        link.setAttribute('tabindex', '0');
        link.setAttribute('role', 'button');

        link.addEventListener('click', (e) => {
            e.preventDefault();
            const service = link.textContent.trim();
            handleServiceClick(service);
        });

        link.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                link.click();
            }
        });

        // Hover effect
        link.addEventListener('mouseenter', () => {
            link.style.transform = 'translateX(5px)';
        });

        link.addEventListener('mouseleave', () => {
            link.style.transform = 'translateX(0)';
        });
    });

    console.log(`🛎️ ${serviceLinks.length} liens service client configurés`);
}

function handleServiceClick(service) {
    console.log(`🛎️ Service: ${service}`);

    const routes = {
        'Nous contacter': '/contact',
        'FAQ': '/faq',
        'Livraison': '/livraison',
        'Retours': '/retours'
    };

    const route = routes[service];
    if (route) {
        showLoadingToast('Redirection...');
        setTimeout(() => {
            window.location.href = route;
        }, 300);
    }
}

// ============================================
// LIENS À PROPOS
// ============================================

function setupAboutLinks() {
    const aboutLinks = footer.querySelectorAll('.footer-about li');

    aboutLinks.forEach(link => {
        link.setAttribute('tabindex', '0');
        link.setAttribute('role', 'button');

        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.textContent.trim();
            handleAboutClick(page);
        });

        link.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                link.click();
            }
        });

        // Hover effect
        link.addEventListener('mouseenter', () => {
            link.style.transform = 'translateX(5px)';
        });

        link.addEventListener('mouseleave', () => {
            link.style.transform = 'translateX(0)';
        });
    });

    console.log(`ℹ️ ${aboutLinks.length} liens à propos configurés`);
}

function handleAboutClick(page) {
    console.log(`ℹ️ Page: ${page}`);

    const routes = {
        'À propos de nous': '/a-propos',
        'Accessibilité': '/accessibilite',
        'Centre d\'aide et FAQ': '/centre-aide',
        'Contactez-nous': '/contact'
    };

    const route = routes[page];
    if (route) {
        showLoadingToast('Chargement...');
        setTimeout(() => {
            window.location.href = route;
        }, 300);
    }
}

// ============================================
// LIENS RÉSEAUX SOCIAUX
// ============================================

function setupSocialLinks() {
    const socialLinks = footer.querySelectorAll('.social-link');

    socialLinks.forEach(link => {
        const platform = link.dataset.social;

        link.addEventListener('click', (e) => {
            e.preventDefault();
            trackSocialClick(platform);
            
            showSuccessToast(`Ouverture de ${platform}...`);
            
            setTimeout(() => {
                window.open(link.href, '_blank', 'noopener,noreferrer');
            }, 300);
        });

        link.addEventListener('mouseenter', () => {
            link.style.transform = 'translateY(-3px) scale(1.1)';
        });

        link.addEventListener('mouseleave', () => {
            link.style.transform = 'translateY(0) scale(1)';
        });

        // Animation pulse périodique
        setInterval(() => {
            if (!link.matches(':hover')) {
                link.style.animation = 'socialPulse 0.5s ease';
                setTimeout(() => {
                    link.style.animation = '';
                }, 500);
            }
        }, 5000 + Math.random() * 3000);
    });

    console.log(`🔗 ${socialLinks.length} liens sociaux configurés`);
}

function trackSocialClick(platform) {
    console.log(`🔗 Clic réseau social: ${platform}`);

    // Google Analytics
    if (typeof gtag !== 'undefined') {
        gtag('event', 'social_click', {
            'event_category': 'engagement',
            'event_label': platform,
            'value': 1
        });
    }

    // Facebook Pixel
    if (typeof fbq !== 'undefined') {
        fbq('track', 'Contact', {
            content_name: `Social - ${platform}`
        });
    }
}

// ============================================
// MOYENS DE PAIEMENT
// ============================================

function setupPaymentInfo() {
    const paymentLogos = footer.querySelectorAll('.payment-logo');

    paymentLogos.forEach(img => {
        // Tooltip au hover
        const paymentName = img.alt.replace('Paiement ', '');
        img.setAttribute('title', `Paiement sécurisé via ${paymentName}`);

        // Animation hover
        img.addEventListener('mouseenter', () => {
            img.style.transform = 'scale(1.15)';
            img.style.filter = 'brightness(1.2)';
        });

        img.addEventListener('mouseleave', () => {
            img.style.transform = 'scale(1)';
            img.style.filter = 'brightness(1)';
        });

        // Gestion erreur image
        img.addEventListener('error', () => {
            img.style.display = 'none';
            console.warn(`⚠️ Logo ${paymentName} non trouvé`);
        });

        // Click pour info
        img.addEventListener('click', () => {
            showInfoToast(`Paiement sécurisé via ${paymentName}`);
        });
    });

    console.log(`💳 ${paymentLogos.length} moyens de paiement configurés`);
}

// ============================================
// BADGES SÉCURITÉ
// ============================================

function setupSecurityBadges() {
    const securityBadges = footer.querySelectorAll('.security-badge');

    securityBadges.forEach(img => {
        // Tooltip
        const badgeName = img.alt;
        img.setAttribute('title', badgeName);

        // Animation hover
        img.addEventListener('mouseenter', () => {
            img.style.transform = 'scale(1.15) rotate(5deg)';
            img.style.filter = 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))';
        });

        img.addEventListener('mouseleave', () => {
            img.style.transform = 'scale(1) rotate(0deg)';
            img.style.filter = 'none';
        });

        // Gestion erreur
        img.addEventListener('error', () => {
            img.style.display = 'none';
            console.warn(`⚠️ Badge ${badgeName} non trouvé`);
        });

        // Click pour info
        img.addEventListener('click', () => {
            showInfoToast(`Site certifié ${badgeName}`);
        });
    });

    console.log(`🔒 ${securityBadges.length} badges sécurité configurés`);
}

// ============================================
// LIENS LÉGAUX
// ============================================

function setupLegalLinks() {
    const legalLinks = footer.querySelectorAll('.footer-legal a');

    legalLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.textContent.trim();
            handleLegalClick(page, link.href);
        });

        link.addEventListener('mouseenter', () => {
            link.style.textDecoration = 'underline';
        });

        link.addEventListener('mouseleave', () => {
            link.style.textDecoration = 'none';
        });
    });

    console.log(`⚖️ ${legalLinks.length} liens légaux configurés`);
}

function handleLegalClick(page, url) {
    console.log(`⚖️ Page légale: ${page}`);
    showLoadingToast('Chargement du document...');
    
    setTimeout(() => {
        window.location.href = url;
    }, 300);
}

// ============================================
// BOUTON RETOUR EN HAUT
// ============================================

function setupBackToTop() {
    backToTopBtn = footer.querySelector('.back-to-top');

    if (!backToTopBtn) {
        console.warn('⚠️ Bouton retour en haut non trouvé');
        return;
    }

    // Afficher/masquer selon scroll
    window.addEventListener('scroll', handleScroll);

    // Click event
    backToTopBtn.addEventListener('click', (e) => {
        e.preventDefault();
        scrollToTop();
    });

    // Keyboard
    backToTopBtn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            scrollToTop();
        }
    });

    console.log('⬆️ Bouton retour en haut configuré');
}

function handleScroll() {
    if (!backToTopBtn) return;

    const scrollPosition = window.scrollY;

    if (scrollPosition > CONFIG.scrollThreshold && !isVisible) {
        backToTopBtn.classList.add('visible');
        isVisible = true;
    } else if (scrollPosition <= CONFIG.scrollThreshold && isVisible) {
        backToTopBtn.classList.remove('visible');
        isVisible = false;
    }
}

function scrollToTop() {
    showSuccessToast('Retour en haut...');
    
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });

    // Focus sur le logo après scroll
    setTimeout(() => {
        const logo = document.querySelector('.logo');
        if (logo) {
            logo.focus();
        }
    }, 800);
}

// ============================================
// INTERSECTION OBSERVER
// ============================================

function setupIntersectionObserver() {
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                footer.classList.add('in-view');
                animateFooterEntrance();
            }
        });
    }, observerOptions);

    observer.observe(footer);
    console.log('👁️ Intersection Observer configuré');
}

function animateFooterEntrance() {
    const sections = footer.querySelectorAll('.footer-section');
    
    sections.forEach((section, index) => {
        setTimeout(() => {
            section.style.opacity = '1';
            section.style.transform = 'translateY(0)';
        }, index * CONFIG.animationDelay);
    });
}

// ============================================
// NAVIGATION CLAVIER
// ============================================

function setupKeyboardNavigation() {
    const focusableElements = footer.querySelectorAll(
        'a, button, [tabindex="0"], [role="button"]'
    );

    focusableElements.forEach((el, index) => {
        el.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                // Laisser le comportement par défaut
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                const nextIndex = (index + 1) % focusableElements.length;
                focusableElements[nextIndex].focus();
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                const prevIndex = (index - 1 + focusableElements.length) % focusableElements.length;
                focusableElements[prevIndex].focus();
            }
        });
    });

    console.log(`⌨️ Navigation clavier configurée (${focusableElements.length} éléments)`);
}

// ============================================
// TOAST NOTIFICATIONS
// ============================================

function showToast(message, type = 'info') {
    let toast = document.getElementById('footer-toast');
    
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'footer-toast';
        toast.className = 'footer-toast';
        toast.setAttribute('role', 'status');
        toast.setAttribute('aria-live', 'polite');
        document.body.appendChild(toast);
    }

    // Reset classes
    toast.className = 'footer-toast';
    toast.classList.add(type, 'show');
    toast.textContent = message;

    // Icon selon le type
    const icons = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ',
        loading: '⌛'
    };

    toast.textContent = `${icons[type] || ''} ${message}`;

    // Auto-hide
    setTimeout(() => {
        toast.classList.remove('show');
    }, CONFIG.toastDuration);
}

function showSuccessToast(message) {
    showToast(message, 'success');
}

function showErrorToast(message) {
    showToast(message, 'error');
}

function showWarningToast(message) {
    showToast(message, 'warning');
}

function showInfoToast(message) {
    showToast(message, 'info');
}

function showLoadingToast(message) {
    showToast(message, 'loading');
}

// ============================================
// UTILITAIRES
// ============================================

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function getDeviceType() {
    const width = window.innerWidth;
    if (width <= 767) return 'mobile';
    if (width <= 1024) return 'tablet';
    return 'desktop';
}

// ============================================
// API PUBLIQUE
// ============================================

window.GoglooFooter = {
    /**
     * Afficher un toast
     * @param {string} message
     * @param {string} type - 'success', 'error', 'warning', 'info', 'loading'
     */
    showToast: function(message, type = 'info') {
        showToast(message, type);
    },

    /**
     * Scroll to top programmatiquement
     */
    scrollToTop: function() {
        scrollToTop();
    },

    /**
     * Réinitialiser les animations
     */
    resetAnimations: function() {
        const sections = footer.querySelectorAll('.footer-section');
        sections.forEach(section => {
            section.style.opacity = '0';
            section.style.transform = 'translateY(20px)';
        });
        animateFooterEntrance();
        console.log('🔄 Animations footer réinitialisées');
    },

    /**
     * Obtenir des statistiques
     * @returns {object}
     */
    getStats: function() {
        return {
            totalLinks: footer.querySelectorAll('a, [role="button"]').length,
            socialLinks: footer.querySelectorAll('.social-link').length,
            paymentMethods: footer.querySelectorAll('.payment-logo').length,
            securityBadges: footer.querySelectorAll('.security-badge').length,
            deviceType: getDeviceType(),
            isVisible: isVisible
        };
    },

    /**
     * Toggle visibilité du bouton retour en haut
     * @param {boolean} visible
     */
    toggleBackToTop: function(visible) {
        if (!backToTopBtn) return;
        
        if (visible) {
            backToTopBtn.classList.add('visible');
            isVisible = true;
        } else {
            backToTopBtn.classList.remove('visible');
            isVisible = false;
        }
    }
};

// ============================================
// NETTOYAGE
// ============================================

window.addEventListener('beforeunload', () => {
    if (observer) {
        observer.disconnect();
    }
    window.removeEventListener('scroll', handleScroll);
    console.log('🧹 Nettoyage footer effectué');
});

console.log('✅ API publique GoglooFooter exposée');