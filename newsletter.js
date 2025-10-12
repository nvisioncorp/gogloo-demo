// ============================================
// MODULE NEWSLETTER - GOGLOO
// Fichier: newsletter.js
// Version: 1.0.0
// Description: Gestion complète de la newsletter avec validation temps réel
// ============================================

(function initNewsletterModule() {
    'use strict';

    console.log('📰 Module newsletter.js chargé');

    // ============================================
    // CONFIGURATION
    // ============================================

    const CONFIG = {
        apiEndpoint: '/api/newsletter/subscribe', // À adapter selon votre backend
        toastDuration: 3000,
        debounceDelay: 500,
        localStorageKey: 'gogloo_newsletter_subscribed'
    };

    // Regex pour validation email (RFC 5322 simplifié)
    const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // ============================================
    // VARIABLES GLOBALES
    // ============================================

    let form = null;
    let emailInput = null;
    let submitButton = null;
    let errorMessage = null;
    let successMessage = null;
    let toast = null;
    let debounceTimeout = null;

    // ============================================
    // INITIALISATION
    // ============================================

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    function init() {
        console.log('🚀 Initialisation du module Newsletter...');

        // Récupérer les éléments DOM
        form = document.getElementById('newsletter-form');
        emailInput = document.getElementById('newsletter-email');
        submitButton = form?.querySelector('.newsletter-button');
        errorMessage = document.getElementById('newsletter-error');
        successMessage = document.getElementById('newsletter-success');
        toast = document.getElementById('newsletter-toast');

        if (!form || !emailInput || !submitButton) {
            console.warn('⚠️ Éléments de la newsletter introuvables');
            return;
        }

        // Vérifier si déjà inscrit
        checkExistingSubscription();

        // Event listeners
        setupEventListeners();

        console.log('✅ Module Newsletter initialisé');
    }

    // ============================================
    // VÉRIFICATION INSCRIPTION EXISTANTE
    // ============================================

    function checkExistingSubscription() {
        const isSubscribed = localStorage.getItem(CONFIG.localStorageKey);
        
        if (isSubscribed === 'true') {
            // Optionnel : masquer le formulaire ou afficher un message
            console.log('ℹ️ Utilisateur déjà inscrit');
            // Vous pouvez ajouter une logique ici si nécessaire
        }
    }

    // ============================================
    // EVENT LISTENERS
    // ============================================

    function setupEventListeners() {
        // Soumission du formulaire
        form.addEventListener('submit', handleSubmit);

        // Validation en temps réel (debounced)
        emailInput.addEventListener('input', handleInput);

        // Validation au blur
        emailInput.addEventListener('blur', () => {
            if (emailInput.value.trim()) {
                validateEmail(emailInput.value);
            }
        });

        // Reset des messages au focus
        emailInput.addEventListener('focus', () => {
            hideMessages();
            removeValidationClasses();
        });

        // Empêcher la soumission avec Entrée si invalide
        emailInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !isValidEmail(emailInput.value)) {
                e.preventDefault();
                validateEmail(emailInput.value);
            }
        });

        console.log('🎯 Event listeners configurés');
    }

    // ============================================
    // GESTION INPUT - VALIDATION TEMPS RÉEL
    // ============================================

    function handleInput() {
        // Debounce pour éviter trop de validations
        clearTimeout(debounceTimeout);
        
        debounceTimeout = setTimeout(() => {
            const email = emailInput.value.trim();
            
            if (email.length > 0) {
                validateEmail(email);
            } else {
                removeValidationClasses();
                hideMessages();
            }
        }, CONFIG.debounceDelay);
    }

    // ============================================
    // VALIDATION EMAIL
    // ============================================

    function validateEmail(email) {
        removeValidationClasses();
        hideMessages();

        if (!email || email.length === 0) {
            return false;
        }

        // Vérifications progressives
        if (email.length < 5) {
            setError('L\'adresse e-mail est trop courte');
            return false;
        }

        if (!email.includes('@')) {
            setError('L\'adresse e-mail doit contenir un @');
            return false;
        }

        if (!EMAIL_REGEX.test(email)) {
            setError('Veuillez entrer une adresse e-mail valide');
            return false;
        }

        // Email valide
        setValid();
        return true;
    }

    function isValidEmail(email) {
        return EMAIL_REGEX.test(email?.trim());
    }

    // ============================================
    // ÉTATS VISUELS - ERROR / VALID
    // ============================================

    function setError(message) {
        emailInput.classList.add('error');
        emailInput.classList.remove('valid');
        emailInput.setAttribute('aria-invalid', 'true');
        
        if (message && errorMessage) {
            errorMessage.textContent = message;
            errorMessage.classList.add('show');
        }
    }

    function setValid() {
        emailInput.classList.add('valid');
        emailInput.classList.remove('error');
        emailInput.setAttribute('aria-invalid', 'false');
        hideMessages();
    }

    function removeValidationClasses() {
        emailInput.classList.remove('valid', 'error');
        emailInput.removeAttribute('aria-invalid');
    }

    function hideMessages() {
        if (errorMessage) {
            errorMessage.classList.remove('show');
            errorMessage.textContent = '';
        }
        if (successMessage) {
            successMessage.classList.remove('show');
            successMessage.textContent = '';
        }
    }

    // ============================================
    // SOUMISSION FORMULAIRE
    // ============================================

    async function handleSubmit(e) {
        e.preventDefault();

        const email = emailInput.value.trim();

        // Validation finale
        if (!validateEmail(email)) {
            emailInput.focus();
            return;
        }

        // État loading
        setLoadingState(true);

        try {
            // Simuler un appel API (à remplacer par votre vraie API)
            const response = await submitToAPI(email);

            if (response.success) {
                handleSuccess(email);
            } else {
                handleError(response.message || 'Une erreur est survenue');
            }

        } catch (error) {
            console.error('❌ Erreur lors de l\'inscription:', error);
            handleError('Impossible de vous inscrire pour le moment. Veuillez réessayer.');
        } finally {
            setLoadingState(false);
        }
    }

    // ============================================
    // APPEL API - INSCRIPTION
    // ============================================

    async function submitToAPI(email) {
        // SIMULATION d'un appel API
        // À REMPLACER par votre vraie logique backend
        
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Simuler différents cas
                const random = Math.random();
                
                if (random > 0.9) {
                    // 10% de chance d'erreur (email déjà inscrit)
                    resolve({
                        success: false,
                        message: 'Cet e-mail est déjà inscrit à notre newsletter'
                    });
                } else if (random > 0.95) {
                    // 5% de chance d'erreur serveur
                    reject(new Error('Erreur serveur'));
                } else {
                    // 85% de succès
                    resolve({
                        success: true,
                        message: 'Inscription réussie ! Vérifiez votre boîte mail.'
                    });
                }
            }, 1500); // Simuler délai réseau
        });

        /* 
        // EXEMPLE de vraie implémentation avec fetch:
        
        try {
            const response = await fetch(CONFIG.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;

        } catch (error) {
            console.error('Erreur API:', error);
            throw error;
        }
        */
    }

    // ============================================
    // GESTION SUCCÈS
    // ============================================

    function handleSuccess(email) {
        console.log('✅ Inscription réussie pour:', email);

        // Sauvegarder dans localStorage
        localStorage.setItem(CONFIG.localStorageKey, 'true');

        // Afficher message de succès
        if (successMessage) {
            successMessage.textContent = '🎉 Merci ! Vous êtes maintenant inscrit à notre newsletter.';
            successMessage.classList.add('show');
        }

        // Toast notification
        showToast('Inscription réussie ! Bienvenue chez Gogloo 🎉', 'success');

        // Reset du formulaire après 2 secondes
        setTimeout(() => {
            resetForm();
        }, 2000);

        // Analytics (optionnel)
        trackNewsletterSubscription(email);
    }

    // ============================================
    // GESTION ERREUR
    // ============================================

    function handleError(message) {
        console.error('❌ Erreur d\'inscription:', message);

        // Afficher message d'erreur
        if (errorMessage) {
            errorMessage.textContent = message;
            errorMessage.classList.add('show');
        }

        // Toast notification
        showToast(message, 'error');

        // Focus sur l'input pour correction
        emailInput.focus();
    }

    // ============================================
    // ÉTATS DU BOUTON
    // ============================================

    function setLoadingState(isLoading) {
        if (isLoading) {
            submitButton.classList.add('loading');
            submitButton.disabled = true;
            emailInput.disabled = true;
        } else {
            submitButton.classList.remove('loading');
            submitButton.disabled = false;
            emailInput.disabled = false;
        }
    }

    // ============================================
    // RESET FORMULAIRE
    // ============================================

    function resetForm() {
        form.reset();
        removeValidationClasses();
        hideMessages();
        emailInput.blur();
    }

    // ============================================
    // TOAST NOTIFICATION
    // ============================================

    function showToast(message, type = 'success') {
        if (!toast) return;

        // Reset classes
        toast.className = 'newsletter-toast';
        
        // Ajouter type
        if (type === 'success') {
            toast.classList.add('success');
        } else if (type === 'error') {
            toast.classList.add('error');
        }

        // Ajouter message
        toast.textContent = message;

        // Afficher
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);

        // Masquer après délai
        setTimeout(() => {
            toast.classList.remove('show');
        }, CONFIG.toastDuration);
    }

    // ============================================
    // ANALYTICS - TRACKING (OPTIONNEL)
    // ============================================

    function trackNewsletterSubscription(email) {
        // Google Analytics 4
        if (typeof gtag !== 'undefined') {
            gtag('event', 'newsletter_subscription', {
                'event_category': 'engagement',
                'event_label': 'newsletter_signup',
                'value': 1
            });
        }

        // Facebook Pixel
        if (typeof fbq !== 'undefined') {
            fbq('track', 'Subscribe', {
                content_name: 'Newsletter Gogloo',
                value: 1,
                currency: 'XOF'
            });
        }

        // Votre propre système d'analytics
        console.log('📊 Event tracked: newsletter_subscription');
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
    // ============================================

    window.GoglooNewsletter = {
        /**
         * Valider manuellement un email
         * @param {string} email
         * @returns {boolean}
         */
        validate: function(email) {
            return isValidEmail(email);
        },

        /**
         * Soumettre manuellement le formulaire
         */
        submit: function() {
            if (form) {
                form.dispatchEvent(new Event('submit', { cancelable: true }));
            }
        },

        /**
         * Reset le formulaire
         */
        reset: function() {
            resetForm();
        },

        /**
         * Afficher un toast
         * @param {string} message
         * @param {string} type - 'success' ou 'error'
         */
        showToast: function(message, type = 'success') {
            showToast(message, type);
        },

        /**
         * Vérifier si l'utilisateur est déjà inscrit
         * @returns {boolean}
         */
        isSubscribed: function() {
            return localStorage.getItem(CONFIG.localStorageKey) === 'true';
        },

        /**
         * Réinitialiser le statut d'inscription (pour tests)
         */
        resetSubscription: function() {
            localStorage.removeItem(CONFIG.localStorageKey);
            console.log('🔄 Statut d\'inscription réinitialisé');
        },

        /**
         * Obtenir des statistiques
         * @returns {object}
         */
        getStats: function() {
            return {
                isInitialized: form !== null,
                isSubscribed: this.isSubscribed(),
                currentEmail: emailInput?.value || '',
                isValid: isValidEmail(emailInput?.value)
            };
        }
    };

    // ============================================
    // NETTOYAGE AU DÉCHARGEMENT
    // ============================================

    window.addEventListener('beforeunload', () => {
        clearTimeout(debounceTimeout);
        console.log('🧹 Nettoyage newsletter effectué');
    });

    console.log('✅ API publique GoglooNewsletter exposée');

})();