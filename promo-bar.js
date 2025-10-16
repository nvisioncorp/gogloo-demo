// ============================================
// MODULE PROMO BAR - GOGLOO
// Fichier: promo-bar.js
// Version: 2.1.0 (CORRIGÉ - Sans gestion padding-top)
// Description: Gestion complète de la barre promo sticky avec rotation automatique
// ============================================

(function initPromoBarModule() {
    'use strict';

    console.log('🎯 Module Promo Bar chargé');

    // ============================================
    // CONFIGURATION
    // ============================================

    const CONFIG = {
        // Liste des promotions à afficher en rotation
        promos: [
            {
                text: "-15% sur les cosmétiques cette semaine | Livraison gratuite dès 30 000 FCFA",
                link: "/promotions",
                linkText: "En savoir plus"
            },
            {
                text: "🎉 Nouveautés High-Tech en stock | Profitez de -20% sur tout l'électronique",
                link: "/high-tech",
                linkText: "Découvrir"
            },
            {
                text: "🚚 Livraison express disponible | Commandez avant 15h, livré demain",
                link: "/livraison",
                linkText: "Commander"
            },
            {
                text: "💎 Programme fidélité : gagnez des points à chaque achat !",
                link: "/fidelite",
                linkText: "Rejoindre"
            }
        ],

        // Délais en millisecondes
        rotationDelay: 5000,        // Rotation toutes les 5 secondes
        fadeOutDuration: 300,       // Durée du fade out
        fadeInDuration: 300,        // Durée du fade in
        closeDuration: 300,         // Durée de l'animation de fermeture

        // Date d'expiration (optionnel)
        expirationDate: '2026-12-31T23:59:59',

        // LocalStorage keys (uniquement pour l'index, pas pour la fermeture)
        storageKeys: {
            currentIndex: 'promoCurrentIndex'
        },

        // Options
        pauseOnHover: true,         // Pause la rotation au hover (desktop uniquement)
        trackAnalytics: true,       // Activer le tracking analytics
        persistIndex: false         // Sauvegarder l'index de promo entre les sessions
    };

    // ============================================
    // VARIABLES GLOBALES
    // ============================================

    let currentPromoIndex = 0;
    let rotationInterval = null;
    let isPaused = false;
    let isTransitioning = false;
    let isClosedThisSession = false;

    let promoBar = null;
    let promoText = null;
    let promoLink = null;
    let closeButton = null;

    // ============================================
    // INITIALISATION
    // ============================================

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    function init() {
        console.log('🚀 Initialisation de la Promo Bar...');

        // Récupérer les éléments DOM
        promoBar = document.getElementById('promo-bar');
        promoText = document.getElementById('promo-text');
        promoLink = document.querySelector('.promo-link');
        closeButton = document.querySelector('.close-promo');

        if (!promoBar || !promoText || !promoLink) {
            console.warn('⚠️ Éléments de la Promo Bar introuvables');
            return;
        }

        // Vérifier la date d'expiration
        if (isPromoExpired()) {
            hidePromoBar();
            console.log('📅 Promo Bar masquée (promotion expirée)');
            return;
        }

        // Toujours afficher la promo au chargement
        showPromoBar();

        // Charger l'index de promo sauvegardé
        if (CONFIG.persistIndex) {
            const savedIndex = localStorage.getItem(CONFIG.storageKeys.currentIndex);
            if (savedIndex !== null) {
                currentPromoIndex = parseInt(savedIndex, 10);
                if (currentPromoIndex >= CONFIG.promos.length) {
                    currentPromoIndex = 0;
                }
            }
        }

        // Afficher la première promo
        displayPromo(currentPromoIndex);

        // Configurer les event listeners
        setupEventListeners();

        // Démarrer la rotation automatique
        startRotation();

        // Tracking analytics
        if (CONFIG.trackAnalytics) {
            trackEvent('promo_bar_viewed', {
                promo_text: promoText.textContent,
                promo_index: currentPromoIndex
            });
        }

        console.log('✅ Promo Bar initialisée avec succès');
    }

    // ============================================
    // VÉRIFICATIONS
    // ============================================

    function isPromoExpired() {
        if (!CONFIG.expirationDate) return false;
        
        const expirationDate = new Date(CONFIG.expirationDate);
        const now = new Date();
        
        return now > expirationDate;
    }

    // ============================================
    // AFFICHAGE DES PROMOS
    // ============================================

    function displayPromo(index) {
        if (index < 0 || index >= CONFIG.promos.length) {
            console.warn(`⚠️ Index invalide: ${index}`);
            return;
        }

        const promo = CONFIG.promos[index];

        // Mettre à jour le contenu
        promoText.textContent = promo.text;
        promoLink.href = promo.link;
        promoLink.textContent = promo.linkText || 'En savoir plus';

        // Sauvegarder l'index si option activée
        if (CONFIG.persistIndex) {
            localStorage.setItem(CONFIG.storageKeys.currentIndex, index.toString());
        }

        console.log(`📢 Promo ${index + 1}/${CONFIG.promos.length} affichée`);
    }

    function transitionToNextPromo() {
        if (isTransitioning) return;

        isTransitioning = true;

        // Fade out
        fadeOut(promoText, CONFIG.fadeOutDuration);

        setTimeout(() => {
            // Passer à la promo suivante
            currentPromoIndex = (currentPromoIndex + 1) % CONFIG.promos.length;
            displayPromo(currentPromoIndex);

            // Fade in
            fadeIn(promoText, CONFIG.fadeInDuration);

            // Tracking analytics
            if (CONFIG.trackAnalytics) {
                trackEvent('promo_rotated', {
                    promo_index: currentPromoIndex,
                    promo_text: promoText.textContent
                });
            }

            setTimeout(() => {
                isTransitioning = false;
            }, CONFIG.fadeInDuration);

        }, CONFIG.fadeOutDuration);
    }

    // ============================================
    // ROTATION AUTOMATIQUE
    // ============================================

    function startRotation() {
        if (rotationInterval) {
            clearInterval(rotationInterval);
        }

        rotationInterval = setInterval(() => {
            if (!isPaused && !isClosedThisSession) {
                transitionToNextPromo();
            }
        }, CONFIG.rotationDelay);

        console.log('▶️ Rotation automatique démarrée');
    }

    function stopRotation() {
        if (rotationInterval) {
            clearInterval(rotationInterval);
            rotationInterval = null;
        }
        console.log('⏹️ Rotation automatique arrêtée');
    }

    function pauseRotation() {
        isPaused = true;
        console.log('⏸️ Rotation en pause');
    }

    function resumeRotation() {
        isPaused = false;
        console.log('▶️ Rotation reprise');
    }

    // ============================================
    // FERMETURE TEMPORAIRE (SESSION SEULEMENT)
    // ============================================

    function closePromoBar() {
        if (!promoBar) return;

        // Marquer comme fermée pour cette session uniquement
        isClosedThisSession = true;

        // Arrêter la rotation
        stopRotation();

        // Animation de fermeture
        promoBar.classList.add('closing');

        // Tracking analytics
        if (CONFIG.trackAnalytics) {
            trackEvent('promo_bar_closed', {
                promo_index: currentPromoIndex,
                promo_text: promoText.textContent
            });
        }

        setTimeout(() => {
            hidePromoBar();
            console.log('❌ Promo Bar fermée (temporaire - cette session uniquement)');
        }, CONFIG.closeDuration);
    }

    function hidePromoBar() {
        if (promoBar) {
            promoBar.style.display = 'none';
        }
    }

    function showPromoBar() {
        if (promoBar) {
            promoBar.style.display = 'flex';
            promoBar.classList.remove('closing');
        }
    }

    // ============================================
    // EVENT LISTENERS
    // ============================================

    function setupEventListeners() {
        // Bouton de fermeture
        if (closeButton) {
            closeButton.addEventListener('click', closePromoBar);
        }

        // Pause au hover (desktop uniquement)
        if (CONFIG.pauseOnHover && !isTouchDevice()) {
            promoBar.addEventListener('mouseenter', pauseRotation);
            promoBar.addEventListener('mouseleave', resumeRotation);
        }

        // Tracking des clics sur le lien
        if (promoLink) {
            promoLink.addEventListener('click', (e) => {
                if (CONFIG.trackAnalytics) {
                    trackEvent('promo_link_clicked', {
                        promo_index: currentPromoIndex,
                        promo_link: promoLink.href,
                        promo_text: promoText.textContent
                    });
                }
            });
        }

        // Navigation clavier (accessibilité)
        if (closeButton) {
            closeButton.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    closePromoBar();
                }
            });
        }

        console.log('🎯 Event listeners configurés');
    }

    // ============================================
    // ANIMATIONS - FADE IN/OUT
    // ============================================

    function fadeOut(element, duration) {
        if (!element) return;
        element.style.transition = `opacity ${duration}ms ease`;
        element.style.opacity = '0';
    }

    function fadeIn(element, duration) {
        if (!element) return;
        element.style.transition = `opacity ${duration}ms ease`;
        element.style.opacity = '1';
    }

    // ============================================
    // ANALYTICS TRACKING
    // ============================================

    function trackEvent(eventName, params = {}) {
        // Google Analytics 4
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, {
                event_category: 'promo_bar',
                ...params
            });
        }
        
        // Facebook Pixel
        if (typeof fbq !== 'undefined') {
            fbq('trackCustom', eventName, params);
        }
        
        console.log(`📊 Event tracked: ${eventName}`, params);
    }

    // ============================================
    // UTILITAIRES
    // ============================================

    function isTouchDevice() {
        return window.matchMedia('(hover: none) and (pointer: coarse)').matches;
    }

    function getDeviceType() {
        const width = window.innerWidth;
        if (width >= 1025) return 'desktop';
        if (width >= 769 && width <= 1024) return 'tablet';
        if (width === 768) return 'tablet-768';
        if (width <= 320) return 'small-mobile';
        return 'mobile';
    }

    // ============================================
    // API PUBLIQUE
    // ============================================

    window.GoglooPromoBar = {
        /**
         * Afficher manuellement la promo bar
         */
        show: function() {
            isClosedThisSession = false;
            showPromoBar();
            startRotation();
            console.log('✅ Promo Bar affichée');
        },

        /**
         * Masquer manuellement la promo bar
         */
        hide: function() {
            closePromoBar();
        },

        /**
         * Aller à une promo spécifique
         * @param {number} index - Index de la promo (0-based)
         */
        goToPromo: function(index) {
            if (index >= 0 && index < CONFIG.promos.length) {
                stopRotation();
                fadeOut(promoText, CONFIG.fadeOutDuration);
                
                setTimeout(() => {
                    currentPromoIndex = index;
                    displayPromo(currentPromoIndex);
                    fadeIn(promoText, CONFIG.fadeInDuration);
                    startRotation();
                }, CONFIG.fadeOutDuration);
            } else {
                console.error(`❌ Index invalide: ${index} (valide: 0-${CONFIG.promos.length - 1})`);
            }
        },

        /**
         * Passer à la promo suivante
         */
        next: function() {
            transitionToNextPromo();
        },

        /**
         * Revenir à la promo précédente
         */
        previous: function() {
            stopRotation();
            fadeOut(promoText, CONFIG.fadeOutDuration);
            
            setTimeout(() => {
                currentPromoIndex = (currentPromoIndex - 1 + CONFIG.promos.length) % CONFIG.promos.length;
                displayPromo(currentPromoIndex);
                fadeIn(promoText, CONFIG.fadeInDuration);
                startRotation();
            }, CONFIG.fadeOutDuration);
        },

        /**
         * Mettre en pause la rotation
         */
        pause: function() {
            pauseRotation();
        },

        /**
         * Reprendre la rotation
         */
        resume: function() {
            resumeRotation();
        },

        /**
         * Arrêter complètement la rotation
         */
        stop: function() {
            stopRotation();
        },

        /**
         * Redémarrer la rotation
         */
        restart: function() {
            startRotation();
        },

        /**
         * Ajouter une nouvelle promo dynamiquement
         * @param {object} promo - {text, link, linkText}
         */
        addPromo: function(promo) {
            if (!promo || !promo.text || !promo.link) {
                console.error('❌ Format de promo invalide. Requis: {text, link, linkText}');
                return;
            }

            CONFIG.promos.push(promo);
            console.log(`✅ Promo ajoutée (total: ${CONFIG.promos.length})`);
        },

        /**
         * Supprimer une promo
         * @param {number} index - Index de la promo à supprimer
         */
        removePromo: function(index) {
            if (index >= 0 && index < CONFIG.promos.length) {
                const removed = CONFIG.promos.splice(index, 1);
                console.log(`✅ Promo supprimée: "${removed[0].text}" (total: ${CONFIG.promos.length})`);
                
                // Ajuster l'index actuel si nécessaire
                if (currentPromoIndex >= CONFIG.promos.length) {
                    currentPromoIndex = 0;
                    displayPromo(currentPromoIndex);
                }
            } else {
                console.error(`❌ Index invalide: ${index}`);
            }
        },

        /**
         * Obtenir l'index actuel
         * @returns {number}
         */
        getCurrentIndex: function() {
            return currentPromoIndex;
        },

        /**
         * Obtenir la promo actuelle
         * @returns {object}
         */
        getCurrentPromo: function() {
            return CONFIG.promos[currentPromoIndex];
        },

        /**
         * Obtenir toutes les promos
         * @returns {array}
         */
        getAllPromos: function() {
            return CONFIG.promos;
        },

        /**
         * Vérifier si la promo bar est visible
         * @returns {boolean}
         */
        isVisible: function() {
            return promoBar && promoBar.style.display !== 'none';
        },

        /**
         * Vérifier si la rotation est active
         * @returns {boolean}
         */
        isRotating: function() {
            return rotationInterval !== null && !isPaused;
        },

        /**
         * Obtenir des statistiques détaillées
         * @returns {object}
         */
        getStats: function() {
            return {
                currentIndex: currentPromoIndex,
                currentPromo: CONFIG.promos[currentPromoIndex],
                totalPromos: CONFIG.promos.length,
                isVisible: this.isVisible(),
                isRotating: this.isRotating(),
                isPaused: isPaused,
                isTransitioning: isTransitioning,
                isClosedThisSession: isClosedThisSession,
                isExpired: isPromoExpired(),
                deviceType: getDeviceType(),
                promoBarHeight: promoBar ? promoBar.offsetHeight : 0
            };
        },

        /**
         * Mettre à jour la configuration
         * @param {object} newConfig - Nouvelles options
         */
        updateConfig: function(newConfig) {
            const oldRotationDelay = CONFIG.rotationDelay;
            
            Object.assign(CONFIG, newConfig);
            
            // Redémarrer la rotation si le délai a changé
            if (newConfig.rotationDelay && newConfig.rotationDelay !== oldRotationDelay) {
                stopRotation();
                startRotation();
            }
            
            console.log('⚙️ Configuration mise à jour', CONFIG);
        },

        /**
         * Obtenir la configuration actuelle
         * @returns {object}
         */
        getConfig: function() {
            return { ...CONFIG };
        },

        /**
         * Afficher les commandes disponibles
         */
        help: function() {
            console.log(`
🎯 API PROMO BAR - COMMANDES DISPONIBLES:

📊 Informations:
  - GoglooPromoBar.getStats()           : Statistiques complètes
  - GoglooPromoBar.getCurrentPromo()    : Promo actuelle
  - GoglooPromoBar.getAllPromos()       : Liste des promos
  - GoglooPromoBar.getConfig()          : Configuration actuelle

🎮 Contrôles:
  - GoglooPromoBar.show()               : Afficher
  - GoglooPromoBar.hide()               : Masquer
  - GoglooPromoBar.next()               : Promo suivante
  - GoglooPromoBar.previous()           : Promo précédente
  - GoglooPromoBar.goToPromo(index)     : Aller à la promo N

⏯️ Rotation:
  - GoglooPromoBar.pause()              : Pause
  - GoglooPromoBar.resume()             : Reprendre
  - GoglooPromoBar.stop()               : Arrêter
  - GoglooPromoBar.restart()            : Redémarrer

✏️ Modifications:
  - GoglooPromoBar.addPromo({...})      : Ajouter une promo
  - GoglooPromoBar.removePromo(index)   : Supprimer une promo
  - GoglooPromoBar.updateConfig({...})  : Modifier la config

🔧 Utilitaires:
  - GoglooPromoBar.help()               : Afficher cette aide
            `);
        }
    };

    // ============================================
    // NETTOYAGE AU DÉCHARGEMENT
    // ============================================

    window.addEventListener('beforeunload', () => {
        stopRotation();
        console.log('🧹 Nettoyage Promo Bar effectué');
    });

    // ============================================
    // EXPOSITION DE L'API
    // ============================================

    console.log('✅ API publique GoglooPromoBar exposée');
    console.log('💡 Tapez GoglooPromoBar.help() pour voir les commandes disponibles');

})();