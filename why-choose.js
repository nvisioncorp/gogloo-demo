// ============================================
// WHY CHOOSE - MODULE JAVASCRIPT COMPLET
// Fichier: why-choose.js
// Version: 1.0.0
// Description: Gestion des animations, navigation clavier, 
//              scroll horizontal mobile avec snap automatique
// ============================================

(function initWhyChooseModule() {
    'use strict';

    console.log('📦 Module why-choose.js chargé');

    // ============================================
    // VARIABLES GLOBALES
    // ============================================
    
    let observer = null;
    let resizeTimeout = null;
    let scrollTimeout = null;

    // ============================================
    // INITIALISATION PRINCIPALE
    // ============================================

    // Attendre que le DOM soit complètement chargé
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    function init() {
        console.log('🚀 Initialisation du module Why Choose...');

        const whyItems = document.querySelectorAll('.why-item');
        
        if (!whyItems.length) {
            console.warn('⚠️ Aucun élément .why-item trouvé dans le DOM');
            return;
        }

        console.log(`✅ ${whyItems.length} cartes Why Choose détectées`);

        // 1. Intersection Observer pour animations au scroll
        setupIntersectionObserver(whyItems);

        // 2. Navigation clavier pour accessibilité
        setupKeyboardNavigation(whyItems);

        // 3. Comportement mobile (scroll horizontal + snap)
        const whyGrid = document.getElementById('why-grid');
        if (whyGrid && isMobileDevice()) {
            setupMobileScrollBehavior(whyGrid);
            console.log('📱 Mode mobile activé avec scroll horizontal');
        }

        // 4. Gestion du resize
        setupResizeHandler(whyGrid);

        console.log('✅ Module Why Choose initialisé avec succès');
    }

    // ============================================
    // INTERSECTION OBSERVER - ANIMATIONS AU SCROLL
    // ============================================

    function setupIntersectionObserver(items) {
        // Configuration de l'observer
        const observerOptions = {
            root: null, // Utilise le viewport
            rootMargin: '0px 0px -100px 0px', // Déclenche 100px avant l'entrée
            threshold: 0.2 // 20% de l'élément visible
        };

        // Callback appelé quand un élément entre/sort de la vue
        const observerCallback = (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    // Ajouter la classe qui déclenche l'animation CSS
                    entry.target.classList.add('in-view');
                    
                    // Arrêter d'observer cet élément (animation une fois)
                    observer.unobserve(entry.target);
                }
            });
        };

        // Créer l'observer
        observer = new IntersectionObserver(observerCallback, observerOptions);

        // Observer chaque carte
        items.forEach(item => {
            observer.observe(item);
        });

        console.log('👁️ Intersection Observer configuré');
    }

    // ============================================
    // NAVIGATION CLAVIER - ACCESSIBILITÉ
    // ============================================

    function setupKeyboardNavigation(items) {
        items.forEach((item, index) => {
            item.addEventListener('keydown', (e) => {
                handleKeyboardNavigation(e, items, index);
            });
        });

        console.log('⌨️ Navigation clavier activée');
    }

    function handleKeyboardNavigation(event, items, currentIndex) {
        let targetIndex = currentIndex;
        let shouldPreventDefault = false;

        switch (event.key) {
            case 'ArrowRight':
            case 'ArrowDown':
                shouldPreventDefault = true;
                targetIndex = (currentIndex + 1) % items.length;
                break;

            case 'ArrowLeft':
            case 'ArrowUp':
                shouldPreventDefault = true;
                targetIndex = (currentIndex - 1 + items.length) % items.length;
                break;

            case 'Home':
                shouldPreventDefault = true;
                targetIndex = 0;
                break;

            case 'End':
                shouldPreventDefault = true;
                targetIndex = items.length - 1;
                break;

            case 'Enter':
            case ' ':
                shouldPreventDefault = true;
                triggerClickAnimation(items[currentIndex]);
                return;

            default:
                return;
        }

        if (shouldPreventDefault) {
            event.preventDefault();
        }

        // Focus sur l'élément cible
        items[targetIndex].focus();

        // Scroll horizontal sur mobile si nécessaire
        if (isMobileDevice()) {
            scrollToCard(items[targetIndex]);
        }
    }

    function triggerClickAnimation(element) {
        element.style.transform = 'scale(0.95)';
        element.style.transition = 'transform 0.2s ease';

        setTimeout(() => {
            element.style.transform = '';
        }, 200);
    }

    // ============================================
    // COMPORTEMENT MOBILE - SCROLL HORIZONTAL
    // ============================================

    function setupMobileScrollBehavior(grid) {
        // 1. Gestion du scroll avec snap automatique
        grid.addEventListener('scroll', () => {
            handleScroll(grid);
        }, { passive: true });

        // 2. Gestion des swipes tactiles
        setupSwipeGestures(grid);

        console.log('📱 Scroll horizontal mobile configuré');
    }

    function handleScroll(grid) {
        // Ajouter classe pendant le scroll
        grid.classList.add('is-scrolling');

        // Clear timeout précédent
        clearTimeout(scrollTimeout);

        // Retirer l'indicateur et snap après 150ms d'inactivité
        scrollTimeout = setTimeout(() => {
            grid.classList.remove('is-scrolling');
            snapToNearestCard(grid);
        }, 150);
    }

    // ============================================
    // SWIPE GESTURES - MOBILE
    // ============================================

    function setupSwipeGestures(grid) {
        let touchStartX = 0;
        let touchEndX = 0;
        let touchStartTime = 0;

        grid.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
            touchStartTime = Date.now();
        }, { passive: true });

        grid.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            const touchDuration = Date.now() - touchStartTime;
            
            handleSwipeGesture(grid, touchStartX, touchEndX, touchDuration);
        }, { passive: true });
    }

    function handleSwipeGesture(grid, startX, endX, duration) {
        const swipeThreshold = 50; // 50px minimum
        const maxSwipeDuration = 300; // 300ms maximum pour un swipe rapide
        const diff = startX - endX;

        // Ignorer si trop court ou trop lent
        if (Math.abs(diff) < swipeThreshold || duration > maxSwipeDuration) {
            return;
        }

        const cards = Array.from(grid.querySelectorAll('.why-item'));
        const currentCard = getCurrentVisibleCard(grid, cards);

        if (!currentCard) return;

        const currentIndex = cards.indexOf(currentCard);

        if (diff > 0) {
            // Swipe left → carte suivante
            const nextIndex = Math.min(currentIndex + 1, cards.length - 1);
            if (nextIndex !== currentIndex) {
                scrollToCard(cards[nextIndex]);
            }
        } else {
            // Swipe right → carte précédente
            const prevIndex = Math.max(currentIndex - 1, 0);
            if (prevIndex !== currentIndex) {
                scrollToCard(cards[prevIndex]);
            }
        }
    }

    // ============================================
    // SNAP AUTOMATIQUE
    // ============================================

    function snapToNearestCard(grid) {
        const cards = grid.querySelectorAll('.why-item');
        if (!cards.length) return;

        const closestCard = findClosestCard(grid, cards);
        if (closestCard) {
            scrollToCard(closestCard);
        }
    }

    function findClosestCard(grid, cards) {
        const gridRect = grid.getBoundingClientRect();
        const gridCenter = gridRect.left + gridRect.width / 2;

        let closestCard = null;
        let minDistance = Infinity;

        cards.forEach(card => {
            const cardRect = card.getBoundingClientRect();
            const cardCenter = cardRect.left + cardRect.width / 2;
            const distance = Math.abs(cardCenter - gridCenter);

            if (distance < minDistance) {
                minDistance = distance;
                closestCard = card;
            }
        });

        return closestCard;
    }

    function getCurrentVisibleCard(grid, cards) {
        return findClosestCard(grid, cards);
    }

    function scrollToCard(card) {
        if (!card) return;
        
        card.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'center'
        });
    }

    // ============================================
    // DÉTECTION DEVICE
    // ============================================

    function isMobileDevice() {
        return window.innerWidth <= 767 || 
               (window.matchMedia && 
                window.matchMedia('(hover: none) and (pointer: coarse)').matches);
    }

    function isTabletDevice() {
        const width = window.innerWidth;
        return width >= 768 && width <= 1024;
    }

    function getDeviceType() {
        if (isMobileDevice()) return 'mobile';
        if (isTabletDevice()) return 'tablet';
        return 'desktop';
    }

    // ============================================
    // GESTION DU RESIZE
    // ============================================

    function setupResizeHandler(whyGrid) {
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                handleResize(whyGrid);
            }, 250);
        });
    }

    function handleResize(whyGrid) {
        const deviceType = getDeviceType();
        
        if (whyGrid) {
            if (deviceType === 'mobile') {
                if (!whyGrid.classList.contains('mobile-initialized')) {
                    console.log('📱 Basculement en mode mobile');
                    setupMobileScrollBehavior(whyGrid);
                    whyGrid.classList.add('mobile-initialized');
                }
            } else {
                console.log('🖥️ Basculement en mode desktop/tablette');
                whyGrid.classList.remove('is-scrolling');
                whyGrid.classList.remove('mobile-initialized');
            }
        }
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

    // ============================================
    // API PUBLIQUE
    // Permet de contrôler le module depuis l'extérieur
    // ============================================

    window.WhyChoose = {
        /**
         * Réinitialiser toutes les animations
         */
        refresh: function() {
            const items = document.querySelectorAll('.why-item');
            items.forEach(item => {
                item.classList.remove('in-view');
            });
            
            // Détruire l'observer existant
            if (observer) {
                observer.disconnect();
            }
            
            // Réinitialiser
            init();
            console.log('🔄 Module Why Choose réinitialisé');
        },

        /**
         * Forcer le snap sur la carte la plus proche (mobile uniquement)
         */
        snapToNearest: function() {
            const whyGrid = document.getElementById('why-grid');
            if (whyGrid && isMobileDevice()) {
                snapToNearestCard(whyGrid);
                console.log('📍 Snap forcé vers la carte la plus proche');
            } else {
                console.warn('⚠️ Le snap n\'est disponible qu\'en mode mobile');
            }
        },

        /**
         * Obtenir l'index de la carte actuellement visible (mobile)
         * @returns {number} Index de 0 à 5, ou -1 si non applicable
         */
        getCurrentIndex: function() {
            const whyGrid = document.getElementById('why-grid');
            if (!whyGrid || !isMobileDevice()) {
                return -1;
            }

            const cards = Array.from(whyGrid.querySelectorAll('.why-item'));
            const currentCard = getCurrentVisibleCard(whyGrid, cards);
            return currentCard ? cards.indexOf(currentCard) : -1;
        },

        /**
         * Naviguer vers une carte spécifique (mobile)
         * @param {number} index - Index de la carte (0-5)
         */
        goToCard: function(index) {
            const whyGrid = document.getElementById('why-grid');
            if (!whyGrid || !isMobileDevice()) {
                console.warn('⚠️ Navigation disponible uniquement en mode mobile');
                return;
            }

            const cards = Array.from(whyGrid.querySelectorAll('.why-item'));
            if (index >= 0 && index < cards.length) {
                scrollToCard(cards[index]);
                console.log(`📍 Navigation vers la carte ${index + 1}`);
            } else {
                console.error(`❌ Index invalide: ${index} (valide: 0-${cards.length - 1})`);
            }
        },

        /**
         * Obtenir le type de device actuel
         * @returns {string} 'mobile', 'tablet', ou 'desktop'
         */
        getDeviceType: function() {
            return getDeviceType();
        },

        /**
         * Vérifier si le mode mobile est actif
         * @returns {boolean}
         */
        isMobile: function() {
            return isMobileDevice();
        },

        /**
         * Obtenir des statistiques sur l'utilisation
         * @returns {object}
         */
        getStats: function() {
            const whyGrid = document.getElementById('why-grid');
            const items = document.querySelectorAll('.why-item');
            const visibleItems = document.querySelectorAll('.why-item.in-view');

            return {
                totalCards: items.length,
                visibleCards: visibleItems.length,
                deviceType: getDeviceType(),
                isMobile: isMobileDevice(),
                currentIndex: this.getCurrentIndex(),
                hasGrid: !!whyGrid
            };
        }
    };

    // ============================================
    // NETTOYAGE AU DÉCHARGEMENT
    // ============================================

    window.addEventListener('beforeunload', () => {
        if (observer) {
            observer.disconnect();
        }
        clearTimeout(resizeTimeout);
        clearTimeout(scrollTimeout);
    });

    console.log('✅ API publique WhyChoose exposée sur window.WhyChoose');

})();

