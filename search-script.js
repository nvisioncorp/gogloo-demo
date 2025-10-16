

console.log('🔍 Initialisation Search Container...');
// ============================================
// CONFIGURATION
// ============================================
const SEARCH_CONFIG = {
    apiEndpoint: '/api/search/suggest',
    debounceDelay: 250,
    minQueryLength: 2,
    maxSuggestions: 8,
    localStorageKeys: {
        recent: 'gogloo_recent_searches',
        trending: 'gogloo_trending_searches'
    }
};

// ============================================
// VARIABLES GLOBALES
// ============================================
let currentQuery = '';
let currentCategory = 'all';
let activeSuggestionIndex = -1;
let suggestions = [];
let debounceTimer = null;
let abortController = null;
let recognition = null;
let isVoiceListening = false;
let suggestionsCache = new Map();


// ============================================
// ÉLÉMENTS DOM
// ============================================
let searchElements = {};
// ============================================
// INITIALISATION - CORRIGÉE
// ============================================
function initSearch() {
    console.log('🚀 Démarrage initialisation recherche...');
    // Récupérer TOUS les éléments DOM
    searchElements = {
        container: document.getElementById('search-container'),
        input: document.getElementById('search-input'),
        categoryButton: document.getElementById('category-button'),
        categoryLabel: document.getElementById('category-label'),
        categoryDropdown: document.getElementById('category-dropdown'),
        clearButton: document.getElementById('clear-button'),
        voiceButton: document.getElementById('voice-button'),
        searchButton: document.getElementById('search-button'),
        suggestionsContainer: document.getElementById('search-suggestions'),
        suggestionsLoading: document.getElementById('suggestions-loading'),
        suggestionsList: document.getElementById('suggestions-list'),
        suggestionsEmpty: document.getElementById('suggestions-empty'),
        suggestionsHeader: document.getElementById('suggestions-header'),
        resultsCount: document.getElementById('results-count'),
        announcer: document.getElementById('search-announcer')
    };

    // Vérifier éléments critiques
    if (!searchElements.input || !searchElements.categoryButton) {
        console.error('❌ Éléments de recherche manquants');
        return;
    }

    console.log('✅ Éléments DOM récupérés:', Object.keys(searchElements).length);

    // Initialiser dans le bon ordre
    setupCategoryDropdown();
    setupSearchInput();
    setupClearButton();
    setupVoiceSearch();
    setupSearchButton();
    setupGlobalEvents();
    loadTrendingSearches();

    // ✅ AJOUTER CETTE LIGNE ICI :
    integrateWithDropdownManager();


    console.log('✅ Module de recherche initialisé');
}

// Attendre que le DOM soit prêt
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSearch);
} else {
    initSearch();
}


// ============================================
// CATEGORY DROPDOWN - VERSION CORRIGÉE
// ============================================
function setupCategoryDropdown() {
    const { categoryButton, categoryDropdown } = searchElements;
    if (!categoryButton || !categoryDropdown) {
        console.warn('⚠️ Category elements manquants');
        return;
    }

    console.log('📂 Configuration category dropdown...');

    // ✅ FIX 1: Event click avec stopPropagation
    categoryButton.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        console.log('🔘 Click sur category button');
        toggleCategoryDropdown();
    });

    // ✅ FIX 2: Event sur les options
    const categoryOptions = categoryDropdown.querySelectorAll('.category-option');

    categoryOptions.forEach(option => {
        option.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            console.log('✅ Option sélectionnée:', option.dataset.label);
            selectCategory(option);
        });

        // Navigation clavier
        option.addEventListener('keydown', (e) => {
            handleCategoryKeyboard(e, option);
        });
    });

    console.log('✅ Category dropdown configuré:', categoryOptions.length, 'options');
}

function toggleCategoryDropdown() {
    // Utiliser le DropdownManager si disponible
    if (window.DropdownManager) {
        window.DropdownManager.toggle('category-dropdown');
    } else {
        // Fallback si le manager n'est pas chargé
        const { categoryButton, categoryDropdown } = searchElements;
        const isOpen = categoryDropdown.classList.contains('show');
        
        if (isOpen) {
            closeCategoryDropdown();
        } else {
            openCategoryDropdown();
        }
    }
}

function openCategoryDropdown() {
    const { categoryButton, categoryDropdown } = searchElements;
    console.log('📂 Ouverture category dropdown');

    // Utiliser le manager si disponible
    if (window.DropdownManager) {
        window.DropdownManager.open('category-dropdown');
    } else {
        // Fallback manuel
        categoryDropdown.style.display = 'block';
        categoryDropdown.classList.add('show');
        categoryButton.setAttribute('aria-expanded', 'true');

        setTimeout(() => {
            const firstOption = categoryDropdown.querySelector('.category-option');
            if (firstOption) {
                firstOption.focus();
            }
        }, 100);
    }

    console.log('✅ Dropdown ouvert');
}

function closeCategoryDropdown() {
    const { categoryButton, categoryDropdown } = searchElements;
    console.log('📂 Fermeture category dropdown');

    // Utiliser le manager si disponible
    if (window.DropdownManager) {
        window.DropdownManager.close('category-dropdown');
    } else {
        // Fallback manuel
        categoryDropdown.classList.remove('show');
        categoryDropdown.style.display = 'none';
        categoryButton.setAttribute('aria-expanded', 'false');
    }
}

function selectCategory(option) {
    const value = option.dataset.value;
    const label = option.dataset.label;
    console.log('✅ Catégorie sélectionnée:', label, '(', value, ')');

    // Retirer active de toutes les options
    const allOptions = searchElements.categoryDropdown.querySelectorAll('.category-option');
    allOptions.forEach(opt => opt.classList.remove('active'));

    // Ajouter active à l'option sélectionnée
    option.classList.add('active');

    // Mettre à jour le label (sauf sur très petit mobile)
    if (searchElements.categoryLabel && window.innerWidth > 320) {
        searchElements.categoryLabel.textContent = label;
    }

    currentCategory = value;

    // Fermer le dropdown
    closeCategoryDropdown();

    // Relancer la recherche si query existe
    if (currentQuery.length >= SEARCH_CONFIG.minQueryLength) {
        performSearch(currentQuery);
    }
}


function handleFocus() {
    console.log('🎯 Focus sur input');
    searchElements.container.classList.add('focused');

    if (currentQuery.length >= SEARCH_CONFIG.minQueryLength) {
        showSuggestions();
    } else if (currentQuery.length === 0) {
        showTrendingSearches();
    }
}

function showSuggestions() {
    console.log('👁️ Affichage suggestions');
    
    // Utiliser le manager si disponible
    if (window.DropdownManager) {
        window.DropdownManager.open('search-suggestions');
    } else {
        // Fallback manuel
        searchElements.suggestionsContainer.style.display = 'block';
        searchElements.suggestionsEmpty.style.display = 'none';
    }
}

function hideSuggestions() {
    console.log('🙈 Masquage suggestions');
    
    // Utiliser le manager si disponible
    if (window.DropdownManager) {
        window.DropdownManager.close('search-suggestions');
    } else {
        // Fallback manuel
        searchElements.suggestionsContainer.style.display = 'none';
        activeSuggestionIndex = -1;
    }
}

// ============================================
// SEARCH INPUT - VERSION CORRIGÉE
// ============================================
function setupSearchInput() {
    const { input } = searchElements;
    console.log('⌨️ Configuration search input');

    input.addEventListener('input', handleInput);
    input.addEventListener('focus', handleFocus);
    input.addEventListener('blur', handleBlur);
    input.addEventListener('keydown', handleInputKeyboard);

    console.log('✅ Search input configuré');
}

function handleInput(e) {
    const query = e.target.value.trim();
    currentQuery = query;
    console.log('📝 Input:', query);

    // Afficher/masquer bouton clear
    toggleClearButton(query.length > 0);

    // Annuler recherche précédente
    clearTimeout(debounceTimer);

    if (query.length === 0) {
        hideSuggestions();
        showTrendingSearches();
        return;
    }

    if (query.length < SEARCH_CONFIG.minQueryLength) {
        hideSuggestions();
        return;
    }

    // Debounce
    debounceTimer = setTimeout(() => {
        performSearch(query);
    }, SEARCH_CONFIG.debounceDelay);
}

function handleFocus() {
    console.log('🎯 Focus sur input');
    searchElements.container.classList.add('focused');

    if (currentQuery.length >= SEARCH_CONFIG.minQueryLength) {
        showSuggestions();
    } else if (currentQuery.length === 0) {
        showTrendingSearches();
    }
}
function handleBlur(e) {
    console.log('👋 Blur sur input');
    // Petit délai pour permettre le clic sur suggestion
    setTimeout(() => {
        const relatedTarget = e.relatedTarget;
        const isInsideSearch = searchElements.container.contains(relatedTarget);
        
        if (!isInsideSearch) {
            searchElements.container.classList.remove('focused');
            hideSuggestions();
        }
    }, 200);
}
function handleInputKeyboard(e) {
    switch (e.key) {
    case 'ArrowDown':
    e.preventDefault();
    navigateSuggestions(1);
    break;
        case 'ArrowUp':
            e.preventDefault();
            navigateSuggestions(-1);
            break;

        case 'Enter':
            e.preventDefault();
            if (activeSuggestionIndex >= 0 && suggestions[activeSuggestionIndex]) {
                selectSuggestion(suggestions[activeSuggestionIndex]);
            } else {
                submitSearch(currentQuery);
            }
            break;

        case 'Escape':
            e.preventDefault();
            hideSuggestions();
            searchElements.input.blur();
            break;
    }
}


// ============================================
// SUGGESTIONS - VERSION CORRIGÉE
// ============================================
async function performSearch(query) {
    console.log('🔍 Recherche:', query, 'Catégorie:', currentCategory);
    const cacheKey = `${currentCategory}:${query}`;

    // Vérifier cache
    if (suggestionsCache.has(cacheKey)) {
        console.log('💾 Résultat depuis cache');
        displaySuggestions(suggestionsCache.get(cacheKey));
        return;
    }

    // Annuler requête précédente
    if (abortController) {
        abortController.abort();
    }

    abortController = new AbortController();

    showLoading();

    try {
        const results = await fetchSuggestions(query, currentCategory, abortController.signal);
        
        console.log('✅ Résultats reçus:', results.length);
        
        suggestionsCache.set(cacheKey, results);
        displaySuggestions(results);

    } catch (error) {
        if (error.name !== 'AbortError') {
            console.error('❌ Erreur recherche:', error);
            showEmptySuggestions();
        }
    } finally {
        hideLoading();
    }
}

async function fetchSuggestions(query, category, signal) {
    // SIMULATION - Remplacer par vraie API
    return new Promise((resolve) => {
    setTimeout(() => {
    if (signal.aborted) return;
            const mockData = generateMockSuggestions(query, category);
            resolve(mockData);
        }, 300);
    });
}

function generateMockSuggestions(query, category) {
    const allSuggestions = [
    { type: 'product', title: 'Samsung Galaxy Z Fold', price: '450 000 FCFA', category: 'High-Tech' },
    { type: 'product', title: 'iPhone 15 Pro Max', price: '850 000 FCFA', category: 'High-Tech' },
    { type: 'product', title: 'Sneakers Nike Air Max', price: '45 000 FCFA', category: 'Mode' },
    { type: 'product', title: 'Robe africaine Wax', price: '25 000 FCFA', category: 'Mode' },
    { type: 'service', title: 'Maçonnerie professionnelle', category: 'Services BTP' },
    { type: 'service', title: 'Électricien agréé', category: 'Services BTP' },
    { type: 'product', title: 'Ordinateur portable Dell', price: '320 000 FCFA', category: 'High-Tech' },
    { type: 'product', title: 'Chaussures de sport Adidas', price: '35 000 FCFA', category: 'Mode' },
    ];
    const filtered = allSuggestions
        .filter(item => {
            const matchesQuery = item.title.toLowerCase().includes(query.toLowerCase());
            const matchesCategory = category === 'all' || item.category.toLowerCase().includes(category.toLowerCase());
            return matchesQuery && matchesCategory;
        })
        .slice(0, SEARCH_CONFIG.maxSuggestions);

    return filtered;
}

function displaySuggestions(results) {
    console.log('📋 Affichage suggestions:', results.length);
    suggestions = results;
    activeSuggestionIndex = -1;

    const { suggestionsList, suggestionsHeader, resultsCount } = searchElements;

    if (results.length === 0) {
        showEmptySuggestions();
        return;
    }

    // Header
    if (suggestionsHeader && resultsCount) {
        resultsCount.textContent = `${results.length} résultat${results.length > 1 ? 's' : ''}`;
        suggestionsHeader.style.display = 'block';
    }

    // Liste
    suggestionsList.innerHTML = '';

    results.forEach((item, index) => {
        const li = createSuggestionElement(item, index);
        suggestionsList.appendChild(li);
    });

    showSuggestions();
    announce(`${results.length} résultat${results.length > 1 ? 's' : ''} trouvé${results.length > 1 ? 's' : ''}`);
}

function createSuggestionElement(item, index) {
    const button = document.createElement('button');
    button.className = 'suggestion-item';
    button.setAttribute('role', 'option');
    button.setAttribute('data-index', index);
    const icon = getIconForType(item.type);
    const highlightedTitle = highlightQuery(item.title, currentQuery);

    button.innerHTML = `
        <span class="suggestion-icon">${icon}</span>
        <div class="suggestion-content">
            <div class="suggestion-title">${highlightedTitle}</div>
            <div class="suggestion-subtitle">
                <span class="suggestion-badge ${item.type}">${item.type === 'product' ? 'Produit' : 'Service'}</span>
                <span>${item.category}</span>
            </div>
        </div>
        ${item.price ? `<span class="suggestion-price">${item.price}</span>` : ''}
    `;

    button.addEventListener('click', () => selectSuggestion(item));
    button.addEventListener('mouseenter', () => setActiveSuggestion(index));

    return button;
}

function getIconForType(type) {
    const icons = {
        product: '🛍️',
        service: '🔧',
        category: '📂'
    };
    return icons[type] || '🔍';
}

function highlightQuery(text, query) {
    if (!query) return text;
    const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
}

function escapeRegex(string) {
    return string.replace(/[.*+?^{}()|[\]\\]/g, '\\&');
}

function navigateSuggestions(direction) {
    if (suggestions.length === 0) return;

    const newIndex = activeSuggestionIndex + direction;

    if (newIndex < -1 || newIndex >= suggestions.length) {
        return;
    }

    setActiveSuggestion(newIndex);
    
}
function setActiveSuggestion(index) {
    // Retirer active précédent
    const items = searchElements.suggestionsList.querySelectorAll('.suggestion-item');
    items.forEach(item => item.classList.remove('active'));
    activeSuggestionIndex = index;

    if (index >= 0 && index < items.length) {
        const activeItem = items[index];
        activeItem.classList.add('active');
        activeItem.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
}

function selectSuggestion(item) {
    console.log('✅ Suggestion sélectionnée:', item);
    // Mettre à jour input
    searchElements.input.value = item.title;
    currentQuery = item.title;

    // Sauvegarder dans recherches récentes
    saveRecentSearch(item.title);

    // Masquer suggestions
    hideSuggestions();

    // Rediriger
    if (item.type === 'product') {
        window.location.href = `/product/${encodeURIComponent(item.title)}`;
    } else if (item.type === 'service') {
        window.location.href = `/service/${encodeURIComponent(item.title)}`;
    }
}

function submitSearch(query) {
    if (!query || query.length < SEARCH_CONFIG.minQueryLength) return;
    console.log('🔍 Recherche soumise:', query);

    saveRecentSearch(query);
    hideSuggestions();

    // Rediriger vers page de résultats
    window.location.href = `/search?q=${encodeURIComponent(query)}&category=${currentCategory}`;
}


// ============================================
// UI HELPERS - VERSION CORRIGÉE
// ============================================
function showSuggestions() {
    console.log('👁️ Affichage suggestions');
    searchElements.suggestionsContainer.style.display = 'block';
    searchElements.suggestionsEmpty.style.display = 'none';
}
function hideSuggestions() {
    console.log('🙈 Masquage suggestions');
    searchElements.suggestionsContainer.style.display = 'none';
    activeSuggestionIndex = -1;
}
function showEmptySuggestions() {
    searchElements.suggestionsHeader.style.display = 'none';
    searchElements.suggestionsList.innerHTML = '';
    searchElements.suggestionsEmpty.style.display = 'block';
    searchElements.suggestionsContainer.style.display = 'block';
}
function showLoading() {
    searchElements.suggestionsLoading.style.display = 'flex';
    searchElements.suggestionsHeader.style.display = 'none';
    searchElements.suggestionsList.style.display = 'none';
    searchElements.suggestionsEmpty.style.display = 'none';
    searchElements.suggestionsContainer.style.display = 'block';
}
function hideLoading() {
    searchElements.suggestionsLoading.style.display = 'none';
    searchElements.suggestionsList.style.display = 'block';
}



// ============================================
// CLEAR BUTTON
// ============================================
function setupClearButton() {
    const { clearButton, input } = searchElements;
    if (!clearButton) return;

    clearButton.addEventListener('click', () => {
        console.log('🗑️ Clear button cliqué');
        input.value = '';
        currentQuery = '';
        toggleClearButton(false);
        hideSuggestions();
        input.focus();
    });

    console.log('✅ Clear button configuré');
}

function toggleClearButton(show) {
    searchElements.clearButton.style.display = show ? 'flex' : 'none';
}


// ============================================
// VOICE SEARCH
// ============================================
function setupVoiceSearch() {
    const { voiceButton } = searchElements;
    if (!voiceButton) return;

    // Vérifier support Web Speech API
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        voiceButton.style.display = 'none';
        console.warn('⚠️ Web Speech API non supportée');
        return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.lang = 'fr-FR';
    recognition.continuous = false;
    recognition.interimResults = false;

    voiceButton.addEventListener('click', toggleVoiceSearch);

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        console.log('🎤 Transcription:', transcript);
        searchElements.input.value = transcript;
        currentQuery = transcript;
        performSearch(transcript);
        stopVoiceSearch();
    };

    recognition.onerror = (event) => {
        console.error('❌ Erreur reconnaissance vocale:', event.error);
        stopVoiceSearch();
    };

    recognition.onend = () => {
        stopVoiceSearch();
    };

    console.log('✅ Voice search configuré');
}

function toggleVoiceSearch() {
    if (isVoiceListening) {
        stopVoiceSearch();
    } else {
        startVoiceSearch();
    }
}

function startVoiceSearch() {
    if (!recognition) return;
    try {
        recognition.start();
        isVoiceListening = true;
        searchElements.voiceButton.classList.add('listening');
        showVoiceStatus();
        console.log('🎤 Écoute activée');
    } catch (error) {
        console.error('❌ Erreur démarrage voice:', error);
    }
}

function stopVoiceSearch() {
if (!recognition) return;
    try {
        recognition.stop();
        isVoiceListening = false;
        searchElements.voiceButton.classList.remove('listening');
        hideVoiceStatus();
        console.log('🎤 Écoute arrêtée');
    } catch (error) {
        console.error('❌ Erreur arrêt voice:', error);
    }
}
function showVoiceStatus() {
    const voiceStatus = document.getElementById('voice-status');
    if (voiceStatus) {
        voiceStatus.style.display = 'flex';
    }
}
function hideVoiceStatus() {
    const voiceStatus = document.getElementById('voice-status');
    if (voiceStatus) {
        voiceStatus.style.display = 'none';
    }
}




// ============================================
// SEARCH BUTTON
// ============================================
    function setupSearchButton() {
    searchElements.searchButton.addEventListener('click', (e) => {
        e.preventDefault();
        console.log('🔍 Search button cliqué');
        submitSearch(currentQuery);
    });
    console.log('✅ Search button configuré');
}


// ============================================
// GLOBAL EVENTS
// ============================================
function setupGlobalEvents() {
    // Le DropdownManager gère maintenant les clics outside et ESC
    // On garde juste les événements spécifiques à la recherche
    
    console.log('✅ Global events configurés (gérés par DropdownManager)');
}

function closeAllDropdowns() {
    closeCategoryDropdown();
}


// ============================================
// INTEGRATION AVEC DROPDOWN MANAGER
// ============================================

function integrateWithDropdownManager() {
    // Attendre que le DropdownManager soit disponible
    if (!window.DropdownManager) {
        console.warn('⚠️ DropdownManager non disponible, utilisation du fallback');
        return;
    }

    // Re-enregistrer avec callbacks personnalisés
    window.DropdownManager.register({
        id: 'category-dropdown',
        element: searchElements.categoryDropdown,
        trigger: searchElements.categoryButton,
        type: 'click',
        closeOnTriggerClick: false,
        onOpen: () => {
            console.log('📂 Category dropdown ouvert via Manager');
            searchElements.categoryButton.setAttribute('aria-expanded', 'true');
        },
        onClose: () => {
            console.log('📂 Category dropdown fermé via Manager');
            searchElements.categoryButton.setAttribute('aria-expanded', 'false');
        }
    });

    window.DropdownManager.register({
        id: 'search-suggestions',
        element: searchElements.suggestionsContainer,
        trigger: searchElements.input,
        type: 'focus',
        closeOnTriggerClick: false,
        onOpen: () => {
            console.log('🔍 Suggestions ouvertes via Manager');
        },
        onClose: () => {
            console.log('🔍 Suggestions fermées via Manager');
            activeSuggestionIndex = -1;
        }
    });

    console.log('✅ Intégration avec DropdownManager complète');
}




// ============================================
// TRENDING & RECENT SEARCHES
// ============================================
function showTrendingSearches() {
    const trending = getTrendingSearches();
    if (trending.length === 0) return;

    const chipsContainer = document.getElementById('trending-chips-container');
    const chipsElement = document.getElementById('trending-chips');

    if (!chipsContainer || !chipsElement) return;

    chipsElement.innerHTML = '';

    trending.slice(0, 5).forEach(term => {
        const chip = document.createElement('button');
        chip.className = 'chip trending';
        chip.textContent = term;
        chip.addEventListener('click', () => {
            searchElements.input.value = term;
            currentQuery = term;
            performSearch(term);
        });
        chipsElement.appendChild(chip);
    });

    chipsContainer.style.display = 'block';
}

function loadTrendingSearches() {
    const trending = ['iPhone 15', 'Sneakers', 'Wax', 'Électricien', 'Samsung'];
    localStorage.setItem(SEARCH_CONFIG.localStorageKeys.trending, JSON.stringify(trending));
}
function getTrendingSearches() {
    const stored = localStorage.getItem(SEARCH_CONFIG.localStorageKeys.trending);
    return stored ? JSON.parse(stored) : [];
}
function saveRecentSearch(query) {
    let recent = getRecentSearches();
    recent = recent.filter(item => item !== query);
    recent.unshift(query);
    recent = recent.slice(0, 10);

    localStorage.setItem(SEARCH_CONFIG.localStorageKeys.recent, JSON.stringify(recent));
}
function getRecentSearches() {
    const stored = localStorage.getItem(SEARCH_CONFIG.localStorageKeys.recent);
    return stored ? JSON.parse(stored) : [];
}
// ============================================
// ACCESSIBILITY
// ============================================
function announce(message) {
    if (searchElements.announcer) {
        searchElements.announcer.textContent = message;
        setTimeout(() => {
            searchElements.announcer.textContent = '';
        }, 1000);
    }
}

// ============================================
// API PUBLIQUE
// ============================================
window.GoglooSearch = {
    open: () => searchElements.input.focus(),
    close: () => {
        hideSuggestions();
        closeCategoryDropdown();
    },
    search: (query) => {
        searchElements.input.value = query;
        currentQuery = query;
        performSearch(query);
    },
    clearCache: () => {
        suggestionsCache.clear();
        console.log('🗑️ Cache vidé');
    },
    getStats: () => ({
        currentQuery,
        currentCategory,
        cacheSize: suggestionsCache.size,
        isVoiceListening
    })
};

console.log('✅ Module Search complet et fonctionnel');