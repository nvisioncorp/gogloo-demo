// ============================================
// DROPDOWN MANAGER - GOGLOO
// Fichier: dropdown-manager.js
// Version: 1.0.0
// Description: Gestionnaire centralisé pour tous les dropdowns du header
//              Gère clic outside, ESC, et conflits entre dropdowns
// ============================================

(function initDropdownManager() {
    'use strict';

    console.log('🎯 Module dropdown-manager.js chargé');

    // ============================================
    // CONFIGURATION
    // ============================================

    const CONFIG = {
        closeOnEscape: true,
        closeOnOutsideClick: true,
        closeOnScroll: false, // Optionnel
        debug: false // Activer les logs détaillés
    };

    // ============================================
    // REGISTRY - Tous les dropdowns enregistrés
    // ============================================

    const dropdownRegistry = new Map();

    // ============================================
    // INITIALISATION
    // ============================================

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    function init() {
        console.log('🚀 Initialisation du Dropdown Manager...');

        // Enregistrer tous les dropdowns existants
        registerDefaultDropdowns();

        // Setup des event listeners globaux
        setupGlobalEventListeners();

        console.log('✅ Dropdown Manager initialisé');
        console.log(`📋 ${dropdownRegistry.size} dropdowns enregistrés`);
    }

    // ============================================
    // ENREGISTREMENT DES DROPDOWNS PAR DÉFAUT
    // ============================================

    function registerDefaultDropdowns() {
        // 1. Position Dropdown
        registerDropdown({
            id: 'position-dropdown',
            element: document.getElementById('position-dropdown'),
            trigger: document.querySelector('.position-zone'),
            type: 'click'
        });

        // 2. Nav Items (Langue, Aide, Compte, Panier)
        document.querySelectorAll('.nav-item').forEach((navItem, index) => {
            const dropdown = navItem.querySelector('.dropdown');
            if (dropdown) {
                registerDropdown({
                    id: `nav-item-${index}`,
                    element: dropdown,
                    trigger: navItem,
                    type: 'click'
                });
            }
        });

        // 3. Category Dropdown (Search)
        registerDropdown({
            id: 'category-dropdown',
            element: document.getElementById('category-dropdown'),
            trigger: document.getElementById('category-button'),
            type: 'click',
            closeOnTriggerClick: false // Ne pas fermer si on clique sur le bouton
        });

        // 4. Search Suggestions
        registerDropdown({
            id: 'search-suggestions',
            element: document.getElementById('search-suggestions'),
            trigger: document.getElementById('search-input'),
            type: 'focus',
            closeOnTriggerClick: false
        });

        // 5. Custom Select (si présent)
        const customSelect = document.querySelector('.custom-select');
        if (customSelect) {
            registerDropdown({
                id: 'custom-select',
                element: customSelect.querySelector('.options-list'),
                trigger: customSelect.querySelector('.selected-option'),
                type: 'click'
            });
        }

        log('Dropdowns par défaut enregistrés');
    }

    // ============================================
    // ENREGISTREMENT DYNAMIQUE
    // ============================================

    function registerDropdown(config) {
        const {
            id,
            element,
            trigger,
            type = 'click',
            closeOnTriggerClick = true,
            onOpen = null,
            onClose = null
        } = config;

        if (!id || !element) {
            console.warn('⚠️ Dropdown invalide:', config);
            return false;
        }

        // Stocker dans le registry
        dropdownRegistry.set(id, {
            id,
            element,
            trigger,
            type,
            closeOnTriggerClick,
            onOpen,
            onClose,
            isOpen: false
        });

        log(`✅ Dropdown enregistré: ${id}`);
        return true;
    }

    // ============================================
    // EVENT LISTENERS GLOBAUX
    // ============================================

    function setupGlobalEventListeners() {
        // 1. Clic outside
        if (CONFIG.closeOnOutsideClick) {
            document.addEventListener('click', handleOutsideClick, true);
            log('👆 Click outside listener activé');
        }

        // 2. Touche ESC
        if (CONFIG.closeOnEscape) {
            document.addEventListener('keydown', handleEscapeKey);
            log('⌨️ ESC listener activé');
        }

        // 3. Scroll (optionnel)
        if (CONFIG.closeOnScroll) {
            window.addEventListener('scroll', handleScroll, { passive: true });
            log('📜 Scroll listener activé');
        }

        // 4. Resize (pour réajuster les positions)
        window.addEventListener('resize', handleResize);
    }

    // ============================================
    // GESTION CLIC OUTSIDE
    // ============================================

    function handleOutsideClick(e) {
        const openDropdowns = getOpenDropdowns();
        
        if (openDropdowns.length === 0) return;

        openDropdowns.forEach(dropdown => {
            const { element, trigger, closeOnTriggerClick } = dropdown;

            // Vérifier si le clic est à l'intérieur du dropdown ou du trigger
            const isInsideDropdown = element && element.contains(e.target);
            const isInsideTrigger = trigger && trigger.contains(e.target);

            // Cas spécial pour les éléments du dropdown qui déclenchent une action
            const isActionElement = e.target.closest('[data-dropdown-action]');

            if (isActionElement) {
                // Si c'est un élément d'action, fermer après l'action
                setTimeout(() => closeDropdown(dropdown.id), 100);
                return;
            }

            // Logique de fermeture
            if (!isInsideDropdown && !isInsideTrigger) {
                // Clic complètement en dehors
                closeDropdown(dropdown.id);
            } else if (isInsideTrigger && closeOnTriggerClick) {
                // Clic sur le trigger avec option closeOnTriggerClick
                toggleDropdown(dropdown.id);
            }
        });
    }

    // ============================================
    // GESTION TOUCHE ESC
    // ============================================

    function handleEscapeKey(e) {
        if (e.key !== 'Escape') return;

        const openDropdowns = getOpenDropdowns();
        
        if (openDropdowns.length === 0) return;

        // Fermer le dernier dropdown ouvert (LIFO)
        const lastOpened = openDropdowns[openDropdowns.length - 1];
        closeDropdown(lastOpened.id);

        log(`⌨️ ESC pressed - Fermé: ${lastOpened.id}`);
    }

    // ============================================
    // GESTION SCROLL (OPTIONNEL)
    // ============================================

    function handleScroll() {
        const openDropdowns = getOpenDropdowns();
        openDropdowns.forEach(dropdown => {
            closeDropdown(dropdown.id);
        });
    }

    // ============================================
    // GESTION RESIZE
    // ============================================

    let resizeTimeout;
    function handleResize() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            const openDropdowns = getOpenDropdowns();
            openDropdowns.forEach(dropdown => {
                // Réajuster la position si nécessaire
                repositionDropdown(dropdown);
            });
        }, 200);
    }

    // ============================================
    // FONCTIONS DE CONTRÔLE
    // ============================================

    function openDropdown(id) {
        const dropdown = dropdownRegistry.get(id);
        
        if (!dropdown || !dropdown.element) {
            console.warn(`⚠️ Dropdown introuvable: ${id}`);
            return false;
        }

        if (dropdown.isOpen) {
            log(`ℹ️ Dropdown déjà ouvert: ${id}`);
            return false;
        }

        // Fermer les autres dropdowns (sauf si sticky)
        closeAllDropdowns(id);

        // Ouvrir le dropdown
        dropdown.element.classList.add('show');
        dropdown.element.style.display = 'block';
        dropdown.isOpen = true;

        // Callback onOpen
        if (dropdown.onOpen) {
            dropdown.onOpen(dropdown);
        }

        // ARIA
        if (dropdown.trigger) {
            dropdown.trigger.setAttribute('aria-expanded', 'true');
        }

        log(`✅ Dropdown ouvert: ${id}`);
        return true;
    }

    function closeDropdown(id) {
        const dropdown = dropdownRegistry.get(id);
        
        if (!dropdown || !dropdown.element) {
            console.warn(`⚠️ Dropdown introuvable: ${id}`);
            return false;
        }

        if (!dropdown.isOpen) {
            return false;
        }

        // Fermer le dropdown
        dropdown.element.classList.remove('show');
        
        // Délai avant de masquer complètement (pour animation CSS)
        setTimeout(() => {
            if (!dropdown.isOpen) {
                dropdown.element.style.display = 'none';
            }
        }, 300);

        dropdown.isOpen = false;

        // Callback onClose
        if (dropdown.onClose) {
            dropdown.onClose(dropdown);
        }

        // ARIA
        if (dropdown.trigger) {
            dropdown.trigger.setAttribute('aria-expanded', 'false');
        }

        log(`❌ Dropdown fermé: ${id}`);
        return true;
    }

    function toggleDropdown(id) {
        const dropdown = dropdownRegistry.get(id);
        
        if (!dropdown) {
            console.warn(`⚠️ Dropdown introuvable: ${id}`);
            return false;
        }

        if (dropdown.isOpen) {
            closeDropdown(id);
        } else {
            openDropdown(id);
        }

        return true;
    }

    function closeAllDropdowns(exceptId = null) {
        dropdownRegistry.forEach((dropdown, id) => {
            if (id !== exceptId && dropdown.isOpen) {
                closeDropdown(id);
            }
        });

        log(`🧹 Tous les dropdowns fermés (sauf ${exceptId || 'aucun'})`);
    }

    // ============================================
    // UTILITAIRES
    // ============================================

    function getOpenDropdowns() {
        const open = [];
        dropdownRegistry.forEach(dropdown => {
            if (dropdown.isOpen) {
                open.push(dropdown);
            }
        });
        return open;
    }

    function repositionDropdown(dropdown) {
        // TODO: Implémenter le repositionnement dynamique si nécessaire
        log(`📍 Repositionnement de ${dropdown.id}`);
    }

    function isDropdownOpen(id) {
        const dropdown = dropdownRegistry.get(id);
        return dropdown ? dropdown.isOpen : false;
    }

    function log(message) {
        if (CONFIG.debug) {
            console.log(`[DropdownManager] ${message}`);
        }
    }

    // ============================================
    // API PUBLIQUE
    // ============================================

    window.DropdownManager = {
        /**
         * Enregistrer un nouveau dropdown
         * @param {object} config - Configuration du dropdown
         * @returns {boolean}
         */
        register: registerDropdown,

        /**
         * Supprimer un dropdown du registry
         * @param {string} id
         */
        unregister: function(id) {
            const deleted = dropdownRegistry.delete(id);
            if (deleted) {
                log(`🗑️ Dropdown supprimé: ${id}`);
            }
            return deleted;
        },

        /**
         * Ouvrir un dropdown spécifique
         * @param {string} id
         * @returns {boolean}
         */
        open: openDropdown,

        /**
         * Fermer un dropdown spécifique
         * @param {string} id
         * @returns {boolean}
         */
        close: closeDropdown,

        /**
         * Toggle un dropdown
         * @param {string} id
         * @returns {boolean}
         */
        toggle: toggleDropdown,

        /**
         * Fermer tous les dropdowns
         * @param {string|null} exceptId - ID du dropdown à ne pas fermer
         */
        closeAll: closeAllDropdowns,

        /**
         * Vérifier si un dropdown est ouvert
         * @param {string} id
         * @returns {boolean}
         */
        isOpen: isDropdownOpen,

        /**
         * Obtenir la liste des dropdowns ouverts
         * @returns {array}
         */
        getOpenDropdowns: getOpenDropdowns,

        /**
         * Obtenir tous les dropdowns enregistrés
         * @returns {array}
         */
        getAllDropdowns: function() {
            return Array.from(dropdownRegistry.values());
        },

        /**
         * Activer/désactiver le mode debug
         * @param {boolean} enabled
         */
        setDebug: function(enabled) {
            CONFIG.debug = enabled;
            console.log(`🐛 Debug mode: ${enabled ? 'ON' : 'OFF'}`);
        },

        /**
         * Obtenir les statistiques
         * @returns {object}
         */
        getStats: function() {
            const open = getOpenDropdowns();
            return {
                total: dropdownRegistry.size,
                open: open.length,
                closed: dropdownRegistry.size - open.length,
                openIds: open.map(d => d.id),
                allIds: Array.from(dropdownRegistry.keys())
            };
        },

        /**
         * Réinitialiser complètement le manager
         */
        reset: function() {
            closeAllDropdowns();
            dropdownRegistry.clear();
            registerDefaultDropdowns();
            log('🔄 Manager réinitialisé');
        }
    };

    // ============================================
    // INTÉGRATION AVEC LES MODULES EXISTANTS
    // ============================================

    // Exposer des hooks pour les autres modules
    window.addEventListener('dropdown:open', (e) => {
        if (e.detail && e.detail.id) {
            openDropdown(e.detail.id);
        }
    });

    window.addEventListener('dropdown:close', (e) => {
        if (e.detail && e.detail.id) {
            closeDropdown(e.detail.id);
        }
    });

    window.addEventListener('dropdown:toggle', (e) => {
        if (e.detail && e.detail.id) {
            toggleDropdown(e.detail.id);
        }
    });

    // ============================================
    // NETTOYAGE
    // ============================================

    window.addEventListener('beforeunload', () => {
        closeAllDropdowns();
        dropdownRegistry.clear();
        log('🧹 Nettoyage effectué');
    });

    console.log('✅ API publique DropdownManager exposée');
    console.log('💡 Utilisez DropdownManager.setDebug(true) pour voir les logs détaillés');

})();