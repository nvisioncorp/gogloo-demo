// ============================================
// SECTION TESTIMONIALS - GOGLOO
// Fichier: testimonials.js
// Version: 1.0.0
// Description: Carrousel automatique avec navigation manuelle
// ============================================

(function initTestimonialsCarousel() {
    'use strict';

    console.log('📢 Module testimonials.js chargé');

    // ============================================
    // CONFIGURATION
    // ============================================

    const CONFIG = {
        autoplayDelay: 5000,        // Délai entre les slides (5s)
        pauseOnInteraction: 3000,   // Pause après interaction manuelle (3s)
        transitionDuration: 500,    // Durée de la transition (0.5s)
        swipeThreshold: 50,         // Distance minimum pour un swipe
    };

    // ============================================
    // VARIABLES GLOBALES
    // ============================================

    let currentIndex = 0;
    let totalSlides = 0;
    let autoplayInterval = null;
    let isPaused = false;
    let isTransitioning = false;

    let slides = [];
    let dots = [];
    let wrapper = null;
    let prevBtn = null;
    let nextBtn = null;

    // Touch handling
    let touchStartX = 0;
    let touchEndX = 0;

    // ============================================
    // INITIALISATION
    // ============================================

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    function init() {
        console.log('🚀 Initialisation du carrousel testimonials...');

        // Récupérer les éléments DOM
        wrapper = document.getElementById('testimonials-wrapper');
        slides = Array.from(document.querySelectorAll('.testimonial-slide'));
        dots = Array.from(document.querySelectorAll('.testimonial-dot'));
        prevBtn = document.querySelector('.testimonial-nav-prev');
        nextBtn = document.querySelector('.testimonial-nav-next');

        if (!wrapper || slides.length === 0) {
            console.warn('⚠️ Carrousel testimonials introuvable');
            return;
        }

        totalSlides = slides.length;
        console.log(`✅ ${totalSlides} témoignages détectés`);

        // Initialiser les event listeners
        setupEventListeners();

        // Démarrer l'autoplay
        startAutoplay();

        // Animation d'entrée
        animateEntrance();

        console.log('✅ Carrousel testimonials initialisé');
    }

    // ============================================
    // EVENT LISTENERS
    // ============================================

    function setupEventListeners() {
        // Dots (pagination)
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                goToSlide(index, true);
            });

            dot.addEventListener('keydown', (e) => {
                handleDotKeyboard(e, index);
            });
        });

        // Boutons navigation
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                previousSlide(true);
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                nextSlide(true);
            });
        }

        // Navigation clavier globale
        document.addEventListener('keydown', handleGlobalKeyboard);

        // Touch/swipe sur mobile
        wrapper.addEventListener('touchstart', handleTouchStart, { passive: true });
        wrapper.addEventListener('touchend', handleTouchEnd, { passive: true });

        // Pause au hover (desktop uniquement)
        const carousel = document.getElementById('testimonials-carousel');
        if (carousel && !isTouchDevice()) {
            carousel.addEventListener('mouseenter', () => {
                pauseAutoplay();
            });

            carousel.addEventListener('mouseleave', () => {
                resumeAutoplay();
            });
        }

        // Intersection Observer pour animation au scroll
        setupIntersectionObserver();

        console.log('🎯 Event listeners configurés');
    }

    // ============================================
    // NAVIGATION SLIDES
    // ============================================

    function goToSlide(index, isManual = false) {
        if (isTransitioning || index === currentIndex) return;

        if (index < 0 || index >= totalSlides) {
            console.warn(`⚠️ Index invalide: ${index}`);
            return;
        }

        isTransitioning = true;

        // Retirer l'état actif de l'ancien slide
        slides[currentIndex].classList.remove('active');
        dots[currentIndex].classList.remove('active');
        dots[currentIndex].setAttribute('aria-selected', 'false');
        dots[currentIndex].setAttribute('tabindex', '-1');

        // Mettre à jour l'index
        currentIndex = index;

        // Activer le nouveau slide
        slides[currentIndex].classList.add('active');
        dots[currentIndex].classList.add('active');
        dots[currentIndex].setAttribute('aria-selected', 'true');
        dots[currentIndex].setAttribute('tabindex', '0');

        // Annoncer le changement pour les lecteurs d'écran
        announceSlideChange();

        // Fin de la transition
        setTimeout(() => {
            isTransitioning = false;
        }, CONFIG.transitionDuration);

        // Si navigation manuelle, pause temporaire de l'autoplay
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
            if (!isPaused) {
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
    // NAVIGATION CLAVIER
    // ============================================

    function handleGlobalKeyboard(e) {
        // Ne pas interférer si focus dans un input/textarea
        if (e.target.matches('input, textarea, select')) {
            return;
        }

        // Navigation uniquement si focus sur un élément du carrousel
        const carousel = document.getElementById('testimonials-carousel');
        if (!carousel || !carousel.contains(document.activeElement)) {
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
                const prevDotIndex = (index - 1 + totalSlides) % totalSlides;
                dots[prevDotIndex].focus();
                break;
            case 'ArrowRight':
            case 'ArrowDown':
                e.preventDefault();
                const nextDotIndex = (index + 1) % totalSlides;
                dots[nextDotIndex].focus();
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
    // TOUCH / SWIPE GESTURES
    // ============================================

    function handleTouchStart(e) {
        touchStartX = e.changedTouches[0].screenX;
    }

    function handleTouchEnd(e) {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }

    function handleSwipe() {
        const diff = touchStartX - touchEndX;

        if (Math.abs(diff) < CONFIG.swipeThreshold) {
            return; // Swipe trop court
        }

        if (diff > 0) {
            // Swipe left → slide suivant
            nextSlide(true);
        } else {
            // Swipe right → slide précédent
            previousSlide(true);
        }
    }

    // ============================================
    // ANIMATIONS
    // ============================================

    function animateEntrance() {
        const section = document.querySelector('.testimonials');
        if (!section) return;

        // Animation du titre déjà gérée par CSS
        // On pourrait ajouter d'autres animations ici si nécessaire
    }

    function setupIntersectionObserver() {
        const section = document.querySelector('.testimonials');
        if (!section) return;

        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.3
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    section.classList.add('in-view');
                    // Démarrer l'autoplay si pas encore fait
                    if (!autoplayInterval) {
                        startAutoplay();
                    }
                } else {
                    section.classList.remove('in-view');
                }
            });
        }, observerOptions);

        observer.observe(section);
    }

    // ============================================
    // ACCESSIBILITÉ
    // ============================================

    function announceSlideChange() {
        // Annoncer le changement pour les lecteurs d'écran
        const liveRegion = document.getElementById('testimonial-live-region');
        
        if (!liveRegion) {
            // Créer la région ARIA live si elle n'existe pas
            const region = document.createElement('div');
            region.id = 'testimonial-live-region';
            region.className = 'visually-hidden';
            region.setAttribute('role', 'status');
            region.setAttribute('aria-live', 'polite');
            region.setAttribute('aria-atomic', 'true');
            document.body.appendChild(region);
        }

        const region = document.getElementById('testimonial-live-region');
        if (region) {
            const author = slides[currentIndex].querySelector('.testimonial-author')?.textContent || '';
            region.textContent = `Témoignage ${currentIndex + 1} sur ${totalSlides}. ${author}`;
        }
    }

    // ============================================
    // UTILITAIRES
    // ============================================

    function isTouchDevice() {
        return window.matchMedia('(hover: none) and (pointer: coarse)').matches;
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
         * Mettre en pause l'autoplay
         */
        pause: function() {
            pauseAutoplay();
        },

        /**
         * Reprendre l'autoplay
         */
        resume: function() {
            resumeAutoplay();
        },

        /**
         * Arrêter complètement l'autoplay
         */
        stop: function() {
            stopAutoplay();
        },

        /**
         * Redémarrer l'autoplay
         */
        restart: function() {
            startAutoplay();
        },

        /**
         * Obtenir l'index actuel
         * @returns {number}
         */
        getCurrentIndex: function() {
            return currentIndex;
        },

        /**
         * Obtenir le nombre total de slides
         * @returns {number}
         */
        getTotalSlides: function() {
            return totalSlides;
        },

        /**
         * Obtenir des statistiques
         * @returns {object}
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
        },

        /**
         * Ajouter un nouveau témoignage dynamiquement
         * @param {object} testimonial - Objet avec avatar, quote, author
         */
        addTestimonial: function(testimonial) {
            if (!testimonial || !testimonial.quote || !testimonial.author) {
                console.error('❌ Données de témoignage invalides');
                return;
            }

            const newSlide = document.createElement('article');
            newSlide.className = 'testimonial-slide';
            newSlide.setAttribute('role', 'group');
            newSlide.setAttribute('aria-roledescription', 'slide');
            newSlide.setAttribute('data-testimonial-index', totalSlides);

            newSlide.innerHTML = `
                <div class="testimonial-content">
                    <div class="testimonial-avatar-wrapper">
                        <img src="${testimonial.avatar || 'assets/testimonials/default-avatar.jpg'}" 
                             alt="Photo de ${testimonial.author}" 
                             class="testimonial-avatar"
                             loading="lazy">
                    </div>
                    <blockquote class="testimonial-quote">
                        <p>« ${testimonial.quote} »</p>
                    </blockquote>
                    <cite class="testimonial-author">— ${testimonial.author}</cite>
                </div>
            `;

            wrapper.appendChild(newSlide);

            // Ajouter un dot
            const newDot = document.createElement('button');
            newDot.className = 'testimonial-dot';
            newDot.setAttribute('role', 'tab');
            newDot.setAttribute('aria-label', `Voir le témoignage ${totalSlides + 1}`);
            newDot.setAttribute('aria-selected', 'false');
            newDot.setAttribute('data-dot-index', totalSlides);
            newDot.setAttribute('tabindex', '-1');

            const dotsContainer = document.querySelector('.testimonials-dots');
            if (dotsContainer) {
                dotsContainer.appendChild(newDot);
            }

            // Mettre à jour les références
            slides = Array.from(document.querySelectorAll('.testimonial-slide'));
            dots = Array.from(document.querySelectorAll('.testimonial-dot'));
            totalSlides = slides.length;

            // Re-setup event listeners pour le nouveau dot
            newDot.addEventListener('click', () => {
                goToSlide(totalSlides - 1, true);
            });

            console.log(`✅ Témoignage ajouté (total: ${totalSlides})`);
        }
    };

    // ============================================
    // NETTOYAGE
    // ============================================

    window.addEventListener('beforeunload', () => {
        stopAutoplay();
        document.removeEventListener('keydown', handleGlobalKeyboard);
        console.log('🧹 Nettoyage testimonials effectué');
    });

    console.log('✅ API publique TestimonialsCarousel exposée');

})();