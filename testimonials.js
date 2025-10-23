// ============================================
// TESTIMONIALS CAROUSEL - NOUVEAU DESIGN
// Version: 2.0.0
// Description: Carrousel avec 2 cards par slide
// ============================================

(function() {
    'use strict';

    console.log('🎯 Testimonials Carousel v2.0 - Initialisation...');

    // ============================================
    // CONFIGURATION
    // ============================================

    const CONFIG = {
        autoplayDelay: 5000,        // 5 secondes entre slides
        transitionDuration: 500,    // Durée transition
        swipeThreshold: 50,         // Distance minimum swipe
        pauseOnHover: true,         // Pause au hover
        pauseOnInteraction: 3000,   // Pause après interaction manuelle
    };

    // ============================================
    // VARIABLES GLOBALES
    // ============================================

    let currentIndex = 0;
    let totalSlides = 0;
    let autoplayInterval = null;
    let isPaused = false;
    let isTransitioning = false;

    // DOM Elements
    let slidesContainer = null;
    let slides = [];
    let dots = [];
    let wrapper = null;

    // Touch handling
    let touchStartX = 0;
    let touchEndX = 0;
    let touchStartY = 0;
    let touchEndY = 0;

    // ============================================
    // INITIALISATION
    // ============================================

    function init() {
        // Attendre que le DOM soit prêt
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initCarousel);
        } else {
            initCarousel();
        }
    }

    function initCarousel() {
        console.log('🚀 Initialisation du carrousel...');

        // Récupérer les éléments DOM
        wrapper = document.getElementById('testimonials-carousel-wrapper');
        slidesContainer = document.getElementById('testimonials-slides');
        slides = Array.from(document.querySelectorAll('.testimonial-slide'));
        dots = Array.from(document.querySelectorAll('.testimonial-dot'));

        // Vérifier que les éléments existent
        if (!wrapper || !slidesContainer || slides.length === 0 || dots.length === 0) {
            console.warn('⚠️ Éléments testimonials introuvables');
            return;
        }

        totalSlides = slides.length;
        console.log(`✅ ${totalSlides} slides détectés`);

        // Configuration initiale
        setupInitialState();

        // Event listeners
        setupEventListeners();

        // Démarrer autoplay
        startAutoplay();

        // Intersection Observer
        setupIntersectionObserver();

        console.log('✅ Carrousel testimonials initialisé');
    }

    // ============================================
    // CONFIGURATION INITIALE
    // ============================================

    function setupInitialState() {
        // S'assurer que le premier slide est actif
        slides.forEach((slide, index) => {
            if (index === 0) {
                slide.classList.add('active');
            } else {
                slide.classList.remove('active');
            }
        });

        // S'assurer que le premier dot est actif
        dots.forEach((dot, index) => {
            if (index === 0) {
                dot.classList.add('active');
                dot.setAttribute('aria-current', 'true');
            } else {
                dot.classList.remove('active');
                dot.setAttribute('aria-current', 'false');
            }
        });
    }

    // ============================================
    // EVENT LISTENERS
    // ============================================

    function setupEventListeners() {
        // Dots navigation
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                goToSlide(index, true);
            });

            // Keyboard support
            dot.addEventListener('keydown', (e) => {
                handleDotKeyboard(e, index);
            });
        });

        // Hover pause (desktop seulement)
        if (CONFIG.pauseOnHover && !isTouchDevice()) {
            wrapper.addEventListener('mouseenter', () => {
                pauseAutoplay();
            });

            wrapper.addEventListener('mouseleave', () => {
                resumeAutoplay();
            });
        }

        // Touch/Swipe events
        wrapper.addEventListener('touchstart', handleTouchStart, { passive: true });
        wrapper.addEventListener('touchmove', handleTouchMove, { passive: true });
        wrapper.addEventListener('touchend', handleTouchEnd, { passive: true });

        // Keyboard navigation globale
        document.addEventListener('keydown', handleGlobalKeyboard);

        console.log('🎯 Event listeners configurés');
    }

    // ============================================
    // NAVIGATION
    // ============================================

    function goToSlide(index, isManual = false) {
        // Validations
        if (isTransitioning) return;
        if (index < 0 || index >= totalSlides) return;
        if (index === currentIndex) return;

        isTransitioning = true;

        // Retirer l'état actif
        slides[currentIndex].classList.remove('active');
        dots[currentIndex].classList.remove('active');
        dots[currentIndex].setAttribute('aria-current', 'false');

        // Mettre à jour l'index
        currentIndex = index;

        // Activer le nouveau slide
        slides[currentIndex].classList.add('active');
        dots[currentIndex].classList.add('active');
        dots[currentIndex].setAttribute('aria-current', 'true');

        // Annoncer le changement (accessibilité)
        announceSlideChange();

        // Fin de transition
        setTimeout(() => {
            isTransitioning = false;
        }, CONFIG.transitionDuration);

        // Pause temporaire si interaction manuelle
        if (isManual) {
            pauseAutoplay();
            setTimeout(() => {
                if (!isPaused) {
                    resumeAutoplay();
                }
            }, CONFIG.pauseOnInteraction);
        }

        console.log(`➡️ Slide ${currentIndex + 1}/${totalSlides}`);
    }

    function nextSlide(isManual = false) {
        const nextIndex = (currentIndex + 1) % totalSlides;
        goToSlide(nextIndex, isManual);
    }

    function previousSlide(isManual = false) {
        const prevIndex = (currentIndex - 1 + totalSlides) % totalSlides;
        goToSlide(prevIndex, isManual);
    }

    // ============================================
    // AUTOPLAY
    // ============================================

    function startAutoplay() {
        if (autoplayInterval) {
            clearInterval(autoplayInterval);
        }

        autoplayInterval = setInterval(() => {
            if (!isPaused && !isTransitioning) {
                nextSlide(false);
            }
        }, CONFIG.autoplayDelay);

        console.log('▶️ Autoplay démarré');
    }

    function pauseAutoplay() {
        isPaused = true;
        console.log('⏸️ Autoplay en pause');
    }

    function resumeAutoplay() {
        isPaused = false;
        console.log('▶️ Autoplay repris');
    }

    function stopAutoplay() {
        if (autoplayInterval) {
            clearInterval(autoplayInterval);
            autoplayInterval = null;
        }
        console.log('⏹️ Autoplay arrêté');
    }

    // ============================================
    // KEYBOARD NAVIGATION
    // ============================================

    function handleGlobalKeyboard(e) {
        // Ne pas interférer si focus dans input/textarea
        if (e.target.matches('input, textarea, select')) {
            return;
        }

        // Vérifier si le carrousel est dans le viewport
        const section = document.querySelector('.testimonials-section');
        if (!section || !isInViewport(section)) {
            return;
        }

        switch (e.key) {
            case 'ArrowLeft':
                e.preventDefault();
                previousSlide(true);
                break;
            case 'ArrowRight':
                e.preventDefault();
                nextSlide(true);
                break;
            case 'Home':
                e.preventDefault();
                goToSlide(0, true);
                break;
            case 'End':
                e.preventDefault();
                goToSlide(totalSlides - 1, true);
                break;
        }
    }

    function handleDotKeyboard(e, index) {
        switch (e.key) {
            case 'Enter':
            case ' ':
                e.preventDefault();
                goToSlide(index, true);
                break;
            case 'ArrowLeft':
            case 'ArrowUp':
                e.preventDefault();
                const prevIndex = (index - 1 + totalSlides) % totalSlides;
                dots[prevIndex].focus();
                break;
            case 'ArrowRight':
            case 'ArrowDown':
                e.preventDefault();
                const nextIndex = (index + 1) % totalSlides;
                dots[nextIndex].focus();
                break;
            case 'Home':
                e.preventDefault();
                dots[0].focus();
                break;
            case 'End':
                e.preventDefault();
                dots[totalSlides - 1].focus();
                break;
        }
    }

    // ============================================
    // TOUCH / SWIPE HANDLING
    // ============================================

    function handleTouchStart(e) {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
    }

    function handleTouchMove(e) {
        // Optionnel: empêcher le scroll si swipe horizontal dominant
        const touchCurrentX = e.changedTouches[0].screenX;
        const touchCurrentY = e.changedTouches[0].screenY;
        const diffX = Math.abs(touchCurrentX - touchStartX);
        const diffY = Math.abs(touchCurrentY - touchStartY);

        // Si le mouvement horizontal domine, empêcher le scroll vertical
        if (diffX > diffY && diffX > 10) {
            e.preventDefault();
        }
    }

    function handleTouchEnd(e) {
        touchEndX = e.changedTouches[0].screenX;
        touchEndY = e.changedTouches[0].screenY;
        handleSwipe();
    }

    function handleSwipe() {
        const diffX = touchStartX - touchEndX;
        const diffY = Math.abs(touchStartY - touchEndY);

        // Vérifier que c'est bien un swipe horizontal
        if (Math.abs(diffX) < CONFIG.swipeThreshold) {
            return;
        }

        // Vérifier que le mouvement horizontal domine
        if (Math.abs(diffX) < diffY) {
            return;
        }

        if (diffX > 0) {
            // Swipe left → slide suivant
            nextSlide(true);
        } else {
            // Swipe right → slide précédent
            previousSlide(true);
        }
    }

    // ============================================
    // ACCESSIBILITÉ
    // ============================================

    function announceSlideChange() {
        let announcer = document.getElementById('testimonials-announcer');
        
        if (!announcer) {
            // Créer l'élément si inexistant
            announcer = document.createElement('div');
            announcer.id = 'testimonials-announcer';
            announcer.className = 'visually-hidden';
            announcer.setAttribute('role', 'status');
            announcer.setAttribute('aria-live', 'polite');
            announcer.setAttribute('aria-atomic', 'true');
            document.body.appendChild(announcer);
        }

        // Annoncer le slide actuel
        const slideNumber = currentIndex + 1;
        announcer.textContent = `Groupe de témoignages ${slideNumber} sur ${totalSlides}`;
    }

    // ============================================
    // INTERSECTION OBSERVER
    // ============================================

    function setupIntersectionObserver() {
        const section = document.querySelector('.testimonials-section');
        if (!section) return;

        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.25
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Section visible → démarrer autoplay si nécessaire
                    if (!autoplayInterval) {
                        startAutoplay();
                    }
                    // Animation d'entrée (optionnel)
                    section.classList.add('in-view');
                } else {
                    // Section invisible → pause
                    section.classList.remove('in-view');
                }
            });
        }, observerOptions);

        observer.observe(section);
        console.log('👁️ Intersection Observer configuré');
    }

    // ============================================
    // UTILITAIRES
    // ============================================

    function isTouchDevice() {
        return window.matchMedia('(hover: none) and (pointer: coarse)').matches;
    }

    function isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    function getDeviceType() {
        const width = window.innerWidth;
        if (width <= 320) return 'xs-mobile';
        if (width <= 767) return 'mobile';
        if (width === 768) return 'tablet-portrait';
        if (width <= 1024) return 'tablet-landscape';
        return 'desktop';
    }

    // ============================================
    // API PUBLIQUE
    // ============================================

    window.TestimonialsCarousel = {
        /**
         * Aller à un slide spécifique
         * @param {number} index - Index du slide (0-based)
         */
        goTo: function(index) {
            goToSlide(index, true);
        },

        /**
         * Slide suivant
         */
        next: function() {
            nextSlide(true);
        },

        /**
         * Slide précédent
         */
        previous: function() {
            previousSlide(true);
        },

        /**
         * Mettre en pause
         */
        pause: function() {
            pauseAutoplay();
        },

        /**
         * Reprendre
         */
        resume: function() {
            resumeAutoplay();
        },

        /**
         * Arrêter complètement
         */
        stop: function() {
            stopAutoplay();
        },

        /**
         * Redémarrer
         */
        restart: function() {
            startAutoplay();
        },

        /**
         * Obtenir l'index actuel
         */
        getCurrentIndex: function() {
            return currentIndex;
        },

        /**
         * Obtenir le nombre de slides
         */
        getTotalSlides: function() {
            return totalSlides;
        },

        /**
         * Obtenir les statistiques
         */
        getStats: function() {
            return {
                currentIndex: currentIndex,
                totalSlides: totalSlides,
                isAutoplayActive: autoplayInterval !== null,
                isPaused: isPaused,
                isTransitioning: isTransitioning,
                deviceType: getDeviceType()
            };
        }
    };

    // ============================================
    // GESTION DU CYCLE DE VIE
    // ============================================

    // Pause autoplay si l'onglet n'est plus visible
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            pauseAutoplay();
        } else {
            resumeAutoplay();
        }
    });

    // Nettoyage avant fermeture
    window.addEventListener('beforeunload', () => {
        stopAutoplay();
        document.removeEventListener('keydown', handleGlobalKeyboard);
        console.log('🧹 Nettoyage testimonials effectué');
    });

    // ============================================
    // DÉMARRAGE
    // ============================================

    init();

    console.log('✅ TestimonialsCarousel API exposée');
    console.log('📊 Utilisation: window.TestimonialsCarousel.getStats()');

})();