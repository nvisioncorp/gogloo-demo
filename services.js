// ============================================
// GESTION DES SERVICES - GOGLOO
// Fichier: services.js
// À ajouter dans votre projet
// ============================================

(function() {
    'use strict';

    // Variables globales
    let currentService = null;
    let activeCard = null;
    let hideTimeout = null;

    // ============================================
    // DÉTECTION DU DEVICE
    // ============================================
    function getDeviceType() {
        const width = window.innerWidth;
        if (width <= 767) return 'mobile';
        if (width <= 1024) return 'tablet';
        return 'desktop';
    }

    function isTouchDevice() {
        return window.matchMedia('(hover: none) and (pointer: coarse)').matches;
    }

    // ============================================
    // GESTION DES CARTES DE SERVICES
    // ============================================
    function initServiceCards() {
        const serviceCards = document.querySelectorAll('.service-card');
        
        serviceCards.forEach(card => {
            const deviceType = getDeviceType();
            
            if (deviceType === 'mobile') {
                // Mobile : Tap ouvre action-sheet
                card.addEventListener('click', handleMobileClick);
            } else if (deviceType === 'tablet') {
                // Tablette : Tap toggle action-banner
                card.addEventListener('click', handleTabletClick);
            } else {
                // Desktop : Hover (CSS) + clic pour redirection
                card.addEventListener('click', handleDesktopClick);
            }

            // Support clavier
            card.addEventListener('keydown', handleKeydown);
        });
    }

    function handleMobileClick(e) {
        const card = e.currentTarget;
        
        // Ne pas ouvrir si clic sur un bouton
        if (e.target.closest('.action-buttons')) return;
        
        // Empêcher la propagation et le comportement par défaut
        e.preventDefault();
        e.stopPropagation();
        
        const serviceName = card.querySelector('.service-name').textContent;
        const serviceType = card.dataset.service;
        openActionSheet(serviceName, serviceType);
    }

    function handleTabletClick(e) {
        const card = e.currentTarget;
        
        // Ne pas toggle si clic sur un bouton
        if (e.target.closest('.action-buttons')) return;
        
        e.preventDefault();
        toggleActionBanner(card);
    }

    function handleDesktopClick(e) {
        const card = e.currentTarget;
        
        // Redirection seulement si clic hors des boutons
        if (!e.target.closest('.action-buttons')) {
            const serviceType = card.dataset.service;
            window.location.href = `/service/${serviceType}`;
        }
    }

    function handleKeydown(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            e.currentTarget.click();
        }
    }

    // ============================================
    // TOGGLE ACTION BANNER (TABLETTE)
    // ============================================
    function toggleActionBanner(card) {
        // Fermer les autres cartes actives
        if (activeCard && activeCard !== card) {
            activeCard.classList.remove('active');
            clearTimeout(activeCard.hideTimeout);
        }

        // Toggle la carte actuelle
        card.classList.toggle('active');
        activeCard = card.classList.contains('active') ? card : null;

        // Timer d'inactivité (5 secondes)
        if (activeCard) {
            clearTimeout(card.hideTimeout);
            card.hideTimeout = setTimeout(() => {
                card.classList.remove('active');
                activeCard = null;
            }, 5000);
        }
    }

    function closeAllActionBanners() {
        document.querySelectorAll('.service-card.active').forEach(card => {
            card.classList.remove('active');
            clearTimeout(card.hideTimeout);
        });
        activeCard = null;
    }

    // ============================================
    // ACTION SHEET (MOBILE)
    // ============================================
    function openActionSheet(serviceName, serviceType) {
        const actionSheet = document.getElementById('action-sheet');
        const backdrop = document.getElementById('action-sheet-backdrop');
        const title = document.getElementById('action-sheet-title');
        
        if (!actionSheet || !backdrop || !title) {
            console.warn('Action sheet elements not found');
            return;
        }
        
        title.textContent = serviceName;
        actionSheet.dataset.service = serviceType;
        
        actionSheet.classList.add('show');
        backdrop.classList.add('show');
        document.body.classList.add('no-scroll');

        // Focus sur le premier bouton
        setTimeout(() => {
            const firstBtn = actionSheet.querySelector('.action-btn');
            if (firstBtn) firstBtn.focus();
        }, 300);
    }

    function closeActionSheet() {
        const actionSheet = document.getElementById('action-sheet');
        const backdrop = document.getElementById('action-sheet-backdrop');
        
        if (!actionSheet || !backdrop) return;
        
        actionSheet.classList.remove('show');
        backdrop.classList.remove('show');
        document.body.classList.remove('no-scroll');
    }

    // Swipe down pour fermer l'action sheet
    function initActionSheetSwipe() {
        const actionSheet = document.getElementById('action-sheet');
        if (!actionSheet) return;
        
        let touchStartY = 0;
        let isDragging = false;
        
        actionSheet.addEventListener('touchstart', (e) => {
            touchStartY = e.touches[0].clientY;
            isDragging = false;
        });

        actionSheet.addEventListener('touchmove', (e) => {
            const touchY = e.touches[0].clientY;
            const delta = touchY - touchStartY;
            
            if (delta > 0) {
                isDragging = true;
                actionSheet.style.transform = `translateY(${delta}px)`;
            }
        });

        actionSheet.addEventListener('touchend', (e) => {
            const touchEndY = e.changedTouches[0].clientY;
            const delta = touchEndY - touchStartY;
            
            if (isDragging && delta > 100) {
                closeActionSheet();
            }
            
            actionSheet.style.transform = '';
            isDragging = false;
        });
    }

    // ============================================
    // GESTION DES ACTIONS
    // ============================================
    function initActionButtons() {
        document.addEventListener('click', (e) => {
            const btn = e.target.closest('[data-action]');
            if (!btn) return;

            const action = btn.dataset.action;
            const serviceCard = btn.closest('.service-card') || document.getElementById('action-sheet');
            const serviceType = serviceCard?.dataset.service;

            handleAction(action, serviceType, btn);
        });
    }

    function handleAction(action, serviceType, btn) {
        switch (action) {
            case 'quote':
                openQuoteModal(serviceType);
                closeActionSheet();
                break;
            case 'rdv':
                handleRdv(serviceType);
                closeActionSheet();
                break;
            case 'contact':
            case 'call':
                handleCall();
                break;
            case 'message':
                handleMessage();
                break;
            case 'details':
                window.location.href = `/service/${serviceType}`;
                break;
            case 'favorite':
                toggleFavorite(serviceType, btn);
                break;
        }
    }

    function handleRdv(serviceType) {
        // TODO: Implémenter calendrier de réservation
        showToast('🗓️ Fonctionnalité "Prendre RDV" à venir', 'success');
        console.log('RDV pour:', serviceType);
    }

    function handleCall() {
        // Numéro de téléphone à configurer
        const phoneNumber = '+22900000000';
        window.location.href = `tel:${phoneNumber}`;
    }

    function handleMessage() {
        // WhatsApp ou SMS
        const whatsappNumber = '22900000000';
        const message = encodeURIComponent('Bonjour, je souhaite obtenir plus d\'informations sur vos services.');
        window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
    }

    // ============================================
    // MODAL DEVIS
    // ============================================
    function openQuoteModal(serviceType) {
        const modal = document.getElementById('quote-modal');
        if (!modal) return;
        
        modal.classList.add('show');
        modal.style.display = 'flex';
        document.body.classList.add('no-scroll');
        
        // Charger brouillon si existe
        loadDraft(serviceType);
        
        // Focus sur le premier champ
        setTimeout(() => {
            const firstInput = document.getElementById('quote-name');
            if (firstInput) firstInput.focus();
        }, 300);

        // Stocker le service actuel
        currentService = serviceType;
    }

    function closeQuoteModal() {
        const modal = document.getElementById('quote-modal');
        if (!modal) return;
        
        modal.classList.remove('show');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
        document.body.classList.remove('no-scroll');
    }

    function initModalControls() {
        // Bouton fermer
        const closeBtn = document.querySelector('.modal-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', closeQuoteModal);
        }

        // Backdrop
        const backdrop = document.querySelector('.modal-backdrop');
        if (backdrop) {
            backdrop.addEventListener('click', closeQuoteModal);
        }

        // Action sheet backdrop
        const actionBackdrop = document.getElementById('action-sheet-backdrop');
        if (actionBackdrop) {
            actionBackdrop.addEventListener('click', closeActionSheet);
        }
    }

    // ============================================
    // VALIDATION FORMULAIRE
    // ============================================
    function initFormValidation() {
        const form = document.getElementById('quote-form');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            if (!validateForm()) return;
            
            const formData = getFormData();
            const submitBtn = e.target.querySelector('.btn-primary');
            
            // Loader
            submitBtn.classList.add('loading');
            submitBtn.disabled = true;
            
            try {
                // Simulation envoi API (remplacer par vraie API)
                await submitQuoteRequest(formData);
                
                // Optimistic UI
                showToast('✅ Demande envoyée avec succès !', 'success');
                closeQuoteModal();
                clearForm();
                clearDraft(currentService);
                
                // Redirection après 2s (optionnel)
                setTimeout(() => {
                    // window.location.href = '/mes-demandes';
                }, 2000);
                
            } catch (error) {
                showToast('❌ Erreur lors de l\'envoi. Veuillez réessayer.', 'error');
                console.error('Erreur envoi formulaire:', error);
            } finally {
                submitBtn.classList.remove('loading');
                submitBtn.disabled = false;
            }
        });

        // Bouton sauvegarder brouillon
        const saveDraftBtn = document.getElementById('save-draft');
        if (saveDraftBtn) {
            saveDraftBtn.addEventListener('click', () => {
                const data = getFormData();
                const draftKey = `draft_${currentService}`;
                localStorage.setItem(draftKey, JSON.stringify(data));
                showToast('💾 Brouillon sauvegardé', 'success');
            });
        }
    }

    function validateForm() {
        let isValid = true;
        const form = document.getElementById('quote-form');
        if (!form) return false;
        
        // Reset erreurs
        form.querySelectorAll('.error-message').forEach(msg => {
            msg.classList.remove('show');
            msg.textContent = '';
        });
        
        form.querySelectorAll('input, textarea').forEach(input => {
            input.removeAttribute('aria-invalid');
        });
        
        // Nom
        const name = document.getElementById('quote-name');
        if (name && !name.value.trim()) {
            showError(name, 'Le nom est requis');
            isValid = false;
        }
        
        // Téléphone
        const phone = document.getElementById('quote-phone');
        if (phone) {
            if (!phone.value.trim()) {
                showError(phone, 'Le téléphone est requis');
                isValid = false;
            } else if (!/^[0-9]{8,}$/.test(phone.value.replace(/\s/g, ''))) {
                showError(phone, 'Numéro invalide (min 8 chiffres)');
                isValid = false;
            }
        }
        
        // Email (optionnel mais validé si rempli)
        const email = document.getElementById('quote-email');
        if (email && email.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
            showError(email, 'Email invalide');
            isValid = false;
        }
        
        // Description
        const description = document.getElementById('quote-description');
        if (description) {
            if (!description.value.trim()) {
                showError(description, 'La description est requise');
                isValid = false;
            } else if (description.value.trim().length < 10) {
                showError(description, 'Description trop courte (min 10 caractères)');
                isValid = false;
            }
        }
        
        return isValid;
    }

    function showError(input, message) {
        const errorMsg = input.parentElement.querySelector('.error-message');
        if (errorMsg) {
            errorMsg.textContent = message;
            errorMsg.classList.add('show');
            errorMsg.setAttribute('role', 'alert');
        }
        input.setAttribute('aria-invalid', 'true');
        input.focus();
    }

    function getFormData() {
        return {
            service: currentService,
            name: document.getElementById('quote-name')?.value || '',
            phone: document.getElementById('quote-phone')?.value || '',
            email: document.getElementById('quote-email')?.value || '',
            address: document.getElementById('quote-address')?.value || '',
            description: document.getElementById('quote-description')?.value || '',
            date: document.getElementById('quote-date')?.value || '',
            budget: document.getElementById('quote-budget')?.value || '',
            timestamp: new Date().toISOString()
        };
    }

    function clearForm() {
        const form = document.getElementById('quote-form');
        if (form) form.reset();
    }

    async function submitQuoteRequest(data) {
        // Simulation d'appel API
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Simuler succès
                console.log('Données envoyées:', data);
                resolve({ success: true, requestId: Date.now() });
                
                // Pour simuler une erreur:
                // reject(new Error('Erreur serveur'));
            }, 1500);
        });
    }

    // ============================================
    // BROUILLON (LOCALSTORAGE)
    // ============================================
    function loadDraft(serviceType) {
        const draftKey = `draft_${serviceType}`;
        const draft = localStorage.getItem(draftKey);
        
        if (draft) {
            try {
                const data = JSON.parse(draft);
                
                const fields = ['name', 'phone', 'email', 'address', 'description', 'date', 'budget'];
                fields.forEach(field => {
                    const input = document.getElementById(`quote-${field}`);
                    if (input && data[field]) {
                        input.value = data[field];
                    }
                });
                
                showToast('📄 Brouillon restauré', 'success');
            } catch (e) {
                console.error('Erreur chargement brouillon:', e);
            }
        }
    }

    function clearDraft(serviceType) {
        const draftKey = `draft_${serviceType}`;
        localStorage.removeItem(draftKey);
    }

    // ============================================
    // FAVORIS
    // ============================================
    function toggleFavorite(serviceType, btn) {
        let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        const index = favorites.indexOf(serviceType);
        
        if (index > -1) {
            // Retirer des favoris
            favorites.splice(index, 1);
            btn.classList.remove('favorited');
            showToast('💔 Retiré des favoris', 'success');
        } else {
            // Ajouter aux favoris
            favorites.push(serviceType);
            btn.classList.add('favorited');
            showToast('❤️ Ajouté aux favoris', 'success');
            
            // Animation cœur
            btn.style.transform = 'scale(1.3)';
            setTimeout(() => {
                btn.style.transform = '';
            }, 300);
        }
        
        localStorage.setItem('favorites', JSON.stringify(favorites));
        
        // Mettre à jour l'UI de tous les boutons favoris pour ce service
        updateFavoriteButtons(serviceType, index === -1);
    }

    function updateFavoriteButtons(serviceType, isFavorited) {
        document.querySelectorAll(`[data-service="${serviceType}"] [data-action="favorite"]`).forEach(btn => {
            if (isFavorited) {
                btn.classList.add('favorited');
            } else {
                btn.classList.remove('favorited');
            }
        });
    }

    function loadFavorites() {
        const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        favorites.forEach(serviceType => {
            const buttons = document.querySelectorAll(`[data-service="${serviceType}"] [data-action="favorite"]`);
            buttons.forEach(btn => btn.classList.add('favorited'));
        });
    }

    // ============================================
    // TOAST NOTIFICATIONS
    // ============================================
    function showToast(message, type = 'success') {
        const toast = document.getElementById('service-toast');
        if (!toast) return;
        
        toast.textContent = message;
        toast.className = `service-toast ${type} show`;
        toast.setAttribute('role', 'status');
        toast.setAttribute('aria-live', 'polite');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    // ============================================
    // ÉVÉNEMENTS GLOBAUX
    // ============================================
    function initGlobalEvents() {
        // Fermer au tap outside (tablette)
        document.addEventListener('click', (e) => {
            if (getDeviceType() === 'tablet' && activeCard) {
                if (!e.target.closest('.service-card')) {
                    closeAllActionBanners();
                }
            }
        });

        // Fermer au scroll (tablette)
        let lastScrollY = window.scrollY;
        window.addEventListener('scroll', () => {
            if (getDeviceType() === 'tablet' && activeCard) {
                if (Math.abs(window.scrollY - lastScrollY) > 30) {
                    closeAllActionBanners();
                }
                lastScrollY = window.scrollY;
            }
        });

        // ESC pour fermer modals/action-sheet
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const modal = document.getElementById('quote-modal');
                if (modal && modal.classList.contains('show')) {
                    closeQuoteModal();
                }
                
                const actionSheet = document.getElementById('action-sheet');
                if (actionSheet && actionSheet.classList.contains('show')) {
                    closeActionSheet();
                }
                
                if (getDeviceType() === 'tablet' && activeCard) {
                    closeAllActionBanners();
                }
            }
        });

        // Ajuster comportement selon resize
        window.addEventListener('resize', debounce(() => {
            const deviceType = getDeviceType();
            if (deviceType !== 'tablet' && activeCard) {
                closeAllActionBanners();
            }
        }, 250));
    }

    // ============================================
    // UTILITIES
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
    // INITIALISATION
    // ============================================
    function init() {
        // Attendre que le DOM soit prêt
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initServices);
        } else {
            initServices();
        }
    }

    function initServices() {
        console.log('🚀 Initialisation des services...');
        
        // Vérifier que les éléments existent
        const serviceSection = document.querySelector('.service-request-section');
        if (!serviceSection) {
            console.warn('Section services non trouvée');
            return;
        }
        
        // Initialiser tous les composants
        initServiceCards();
        initActionButtons();
        initModalControls();
        initFormValidation();
        initActionSheetSwipe();
        initGlobalEvents();
        loadFavorites();
        
        console.log('✅ Services initialisés avec succès');
    }

    // Démarrer l'initialisation
    init();

    // Exposer des méthodes publiques si nécessaire
    window.GoglooServices = {
        openQuoteModal,
        closeQuoteModal,
        openActionSheet,
        closeActionSheet,
        showToast,
        toggleFavorite
    };

})();