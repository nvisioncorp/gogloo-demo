console.log('🦶 Module footer.js chargé');

// ============================================
// CONFIGURATION
// ============================================

const CONFIG = {
    toastDuration: 3000,
    animationDelay: 100,
    scrollThreshold: 100,
    socialLinks: {
        tiktok: 'https://tiktok.com/@gogloo',
        instagram: 'https://instagram.com/gogloo',
        twitter: 'https://twitter.com/gogloo',
        facebook: 'https://facebook.com/gogloo'
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
    setupTrustLogos();
    setupLegalLinks();
    setupBackToTop();
    setupIntersectionObserver();
    setupKeyboardNavigation();
    highlightActiveLink();
    handleImageErrors();
    trackFooterInteractions();

    console.log('✅ Footer initialisé avec succès');
}

// ============================================
// LIENS CATÉGORIES
// ============================================

function setupCategoryLinks() {
    const categoryLinks = footer.querySelectorAll('.footer-categories a');

    categoryLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const category = link.textContent.trim();
            console.log(`📂 Navigation vers: ${category}`);
            trackEvent('footer_category_click', { category });
        });

        // Hover effect
        link.addEventListener('mouseenter', () => {
            link.style.transform = 'translateX(3px)';
        });

        link.addEventListener('mouseleave', () => {
            link.style.transform = 'translateX(0)';
        });
    });

    console.log(`📂 ${categoryLinks.length} liens catégories configurés`);
}

// ============================================
// LIENS SERVICE CLIENT
// ============================================

function setupServiceLinks() {
    const serviceLinks = footer.querySelectorAll('.footer-service-block a');

    serviceLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const service = link.textContent.trim();
            console.log(`🛎️ Service: ${service}`);
            trackEvent('footer_service_click', { service });
        });

        // Hover effect
        link.addEventListener('mouseenter', () => {
            link.style.transform = 'translateX(3px)';
        });

        link.addEventListener('mouseleave', () => {
            link.style.transform = 'translateX(0)';
        });
    });

    console.log(`🛎️ ${serviceLinks.length} liens service client configurés`);
}

// ============================================
// LIENS À PROPOS
// ============================================

function setupAboutLinks() {
    const aboutLinks = footer.querySelectorAll('.footer-about-block a');

    aboutLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const page = link.textContent.trim();
            console.log(`ℹ️ Page: ${page}`);
            trackEvent('footer_about_click', { page });
        });

        // Hover effect
        link.addEventListener('mouseenter', () => {
            link.style.transform = 'translateX(3px)';
        });

        link.addEventListener('mouseleave', () => {
            link.style.transform = 'translateX(0)';
        });
    });

    console.log(`ℹ️ ${aboutLinks.length} liens à propos configurés`);
}

// ============================================
// LIENS RÉSEAUX SOCIAUX
// ============================================

function setupSocialLinks() {
    const socialLinks = footer.querySelectorAll('.social-icon');

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
            link.style.transform = 'translateY(-3px) scale(1.15)';
        });

        link.addEventListener('mouseleave', () => {
            link.style.transform = 'translateY(0) scale(1)';
        });
    });

    console.log(`🔗 ${socialLinks.length} liens sociaux configurés`);
}

function trackSocialClick(platform) {
    console.log(`🔗 Clic réseau social: ${platform}`);

    trackEvent('social_click', { platform });
}

// ============================================
// LOGOS DE CONFIANCE (PAIEMENTS + SÉCURITÉ)
// ============================================

function setupTrustLogos() {
    // Logos de paiement
    const paymentLogos = footer.querySelectorAll('.payment-logo');

    paymentLogos.forEach(img => {
        const paymentName = img.alt;
        img.setAttribute('title', `Paiement sécurisé via ${paymentName}`);

        // Animation hover
        img.addEventListener('mouseenter', () => {
            img.style.transform = 'scale(1.1)';
        });

        img.addEventListener('mouseleave', () => {
            img.style.transform = 'scale(1)';
        });

        // Click pour info
        img.addEventListener('click', () => {
            showInfoToast(`💳 Paiement sécurisé via ${paymentName}`);
        });

        // Gestion erreur image
        img.addEventListener('error', () => {
            img.style.display = 'none';
            console.warn(`⚠️ Logo ${paymentName} non trouvé`);
        });
    });

    // Badges de sécurité
    const securityBadges = footer.querySelectorAll('.security-badge');

    securityBadges.forEach(img => {
        const badgeName = img.alt;
        img.setAttribute('title', badgeName);

        // Animation hover
        img.addEventListener('mouseenter', () => {
            img.style.transform = 'scale(1.1) rotate(2deg)';
        });

        img.addEventListener('mouseleave', () => {
            img.style.transform = 'scale(1) rotate(0deg)';
        });

        // Click pour info
        img.addEventListener('click', () => {
            showInfoToast(`🔒 Site certifié ${badgeName}`);
        });

        // Gestion erreur
        img.addEventListener('error', () => {
            img.style.display = 'none';
            console.warn(`⚠️ Badge ${badgeName} non trouvé`);
        });
    });

    console.log(`🔒 ${paymentLogos.length} moyens de paiement et ${securityBadges.length} badges configurés`);
}

// ============================================
// LIENS LÉGAUX
// ============================================

function setupLegalLinks() {
    const legalLinks = footer.querySelectorAll('.footer-legal-links a');

    legalLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const page = link.textContent.trim();
            console.log(`⚖️ Page légale: ${page}`);
            trackEvent('footer_legal_click', { page });
        });

        link.addEventListener('mouseenter', () => {
            link.style.textDecoration = 'none';
        });
    });

    console.log(`⚖️ ${legalLinks.length} liens légaux configurés`);
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
    window.addEventListener('scroll', handleScroll, { passive: true });

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
    showSuccessToast('⬆️ Retour en haut...');
    
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
        threshold: 0.15
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
    const columns = footer.querySelectorAll('.footer-main > *');
    
    columns.forEach((column, index) => {
        setTimeout(() => {
            column.style.opacity = '1';
            column.style.transform = 'translateY(0)';
        }, index * CONFIG.animationDelay);
    });
}

// ============================================
// NAVIGATION CLAVIER
// ============================================

function setupKeyboardNavigation() {
    const focusableElements = footer.querySelectorAll(
        'a, button, [tabindex="0"]'
    );

    focusableElements.forEach((el, index) => {
        el.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowDown') {
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
// HIGHLIGHT LIEN ACTIF
// ============================================

function highlightActiveLink() {
    const currentPath = window.location.pathname;
    const links = footer.querySelectorAll('.footer-col-list a, .footer-legal-links a');
    
    links.forEach(link => {
        const href = link.getAttribute('href');
        if (href && currentPath.includes(href) && href !== '/') {
            link.classList.add('active');
        }
    });
    
    console.log('🔗 Liens actifs mis en surbrillance');
}

// ============================================
// GESTION DES ERREURS IMAGES
// ============================================

function handleImageErrors() {
    const images = footer.querySelectorAll('img');
    
    images.forEach(img => {
        if (!img.complete || img.naturalHeight === 0) {
            img.addEventListener('error', () => {
                const alt = img.alt || 'Image';
                console.warn(`⚠️ Erreur de chargement: ${alt}`);
                img.style.display = 'none';
            });
        }
    });
}

// ============================================
// TRACKING ANALYTICS
// ============================================

function trackFooterInteractions() {
    console.log('📊 Tracking analytics configuré');
}

function trackEvent(eventName, params = {}) {
    // Google Analytics 4
    if (typeof gtag !== 'undefined') {
        gtag('event', eventName, {
            event_category: 'footer',
            ...params
        });
    }
    
    // Facebook Pixel
    if (typeof fbq !== 'undefined') {
        fbq('trackCustom', eventName, params);
    }
    
    console.log(`📊 Event: ${eventName}`, params);
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

function showInfoToast(message) {
    showToast(message, 'info');
}

// ============================================
// UTILITAIRES
// ============================================

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
    showToast: function(message, type = 'info') {
        showToast(message, type);
    },

    scrollToTop: function() {
        scrollToTop();
    },

    resetAnimations: function() {
        const columns = footer.querySelectorAll('.footer-main > *');
        columns.forEach(column => {
            column.style.opacity = '0';
            column.style.transform = 'translateY(30px)';
        });
        animateFooterEntrance();
        console.log('🔄 Animations footer réinitialisées');
    },

    getStats: function() {
        return {
            totalLinks: footer.querySelectorAll('a').length,
            socialLinks: footer.querySelectorAll('.social-icon').length,
            paymentMethods: footer.querySelectorAll('.payment-logo').length,
            securityBadges: footer.querySelectorAll('.security-badge').length,
            deviceType: getDeviceType(),
            isVisible: isVisible
        };
    },

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