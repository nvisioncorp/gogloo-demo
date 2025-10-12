document.addEventListener('DOMContentLoaded', () => {

    // ============================================
    // GÉOLOCALISATION ET POSITION
    // ============================================
    const positionValue = document.getElementById('position-value');
    const positionDropdown = document.getElementById('position-dropdown');
    const manualPosition = document.getElementById('manual-position');

    const savedPosition = localStorage.getItem('position');
    if (savedPosition) {
        positionValue.textContent = savedPosition;
    } else {
        positionValue.textContent = 'Non définie';
    }

    // Gestion du dropdown de position
    document.querySelector('.position-zone')?.addEventListener('click', (e) => {
        e.stopPropagation();
        togglePositionDropdown();
    });

    function togglePositionDropdown() {
        // Fermer les autres dropdowns
        document.querySelectorAll('.nav-item .dropdown.show').forEach(d => {
            d.classList.remove('show');
        });
        const optionsList = document.querySelector('.options-list.show');
        if (optionsList) optionsList.classList.remove('show');
        
        positionDropdown.classList.toggle('show');
    }

    // Fermer le dropdown de position si clic en dehors (géré par l'événement global document.click ci-dessus)

    window.detectLocation = () => {
        if (navigator.geolocation) {
            const icon = document.querySelector('.position-icon') || document.querySelector('.position-icon-mobile');
            if (icon) icon.classList.add('fa-spin');
            
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const detected = 'Bénin';
                    positionValue.textContent = detected;
                    localStorage.setItem('position', detected);
                    showFeedback('Position mise à jour ✅');
                    if (icon) icon.classList.remove('fa-spin');
                    positionDropdown.classList.remove('show');
                },
                (err) => {
                    showFeedback('Impossible de détecter votre position ❌');
                    if (icon) icon.classList.remove('fa-spin');
                }
            );
        }
    };

    window.savePosition = () => {
        const selected = manualPosition.value;
        positionValue.textContent = selected;
        localStorage.setItem('position', selected);
        positionDropdown.classList.remove('show');
        showFeedback('Position enregistrée ✅');
    };

    function showFeedback(message) {
        const feedback = document.createElement('div');
        feedback.textContent = message;
        feedback.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: #4CAF50;
            color: white;
            padding: 10px 20px;
            border-radius: 5px;
            z-index: 10000;
        `;
        document.body.appendChild(feedback);
        setTimeout(() => feedback.remove(), 3000);
    }

    // ============================================
    // LANGUE
    // ============================================
    window.changeLang = (lang) => {
        localStorage.setItem('lang', lang);
        location.reload();
    };

    // ============================================
    // COMPTE
    // ============================================
    const accountDropdown = document.querySelector('.account-dropdown');
    const userToken = localStorage.getItem('user_token');
    
    if (accountDropdown) {
        if (userToken) {
            accountDropdown.innerHTML = `
                <a href="/account">Mon compte</a>
                <a href="/orders">Commandes</a>
                <button onclick="logout()">Déconnexion</button>
            `;
        } else {
            accountDropdown.innerHTML = `
                <a href="/login">Se connecter</a>
                <a href="/register">S'inscrire</a>
            `;
        }
    }

    window.logout = () => {
        localStorage.removeItem('user_token');
        localStorage.removeItem('cart');
        location.reload();
    };

    // ============================================
    // PANIER - FONCTION CORRIGÉE
    // ============================================
    function updateCartBadge() {
        const cartCount = document.getElementById('cart-count');
        const cartCountMobile = document.getElementById('cart-count-mobile');
        
        if (!cartCount && !cartCountMobile) {
            console.warn('Badges panier non trouvés dans le DOM');
            return;
        }

        let cart = [];
        try {
            const cartData = localStorage.getItem('cart');
            cart = cartData ? JSON.parse(cartData) : [];
            if (!Array.isArray(cart)) {
                cart = [];
                localStorage.setItem('cart', JSON.stringify(cart));
            }
        } catch (e) {
            console.error('Erreur parsing cart:', e);
            cart = [];
            localStorage.setItem('cart', JSON.stringify(cart));
        }

        const count = cart.length;
        if (cartCount) cartCount.textContent = count;
        if (cartCountMobile) cartCountMobile.textContent = count;
        console.log('Badge panier mis à jour:', count);
    }

    // Initialiser le badge au chargement
    updateCartBadge();

    // ============================================
    // RECHERCHE
    // ============================================
    const searchInput = document.getElementById('search-input');
    const searchButton = document.querySelector('.search-button');
    let debounceTimer;

    if (searchInput) {
        searchInput.addEventListener('input', () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                console.log('Suggestions pour:', searchInput.value);
            }, 300);
        });
    }

    if (searchButton) {
        searchButton.addEventListener('click', () => {
            console.log('Recherche déclenchée:', searchInput?.value);
        });
    }

    // ============================================
    // MENU MOBILE
    // ============================================
    window.toggleMenu = () => {
        const menu = document.getElementById('side-menu');
        let overlay = document.querySelector('.menu-overlay');
        
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'menu-overlay';
            document.body.appendChild(overlay);
            
            overlay.addEventListener('click', () => {
                window.toggleMenu();
            });
        }
        
        if (menu) {
            menu.classList.toggle('show');
            overlay.classList.toggle('show');
            
            // Empêcher le scroll du body quand le menu est ouvert
            if (menu.classList.contains('show')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        }
    };

    window.toggleDropdown = (id) => {
        const dropdown = document.getElementById(id);
        if (dropdown) dropdown.classList.toggle('show');
    };

    // ============================================
    // NAV ITEMS DROPDOWNS
    // ============================================
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.stopPropagation();
            const dropdown = item.querySelector('.dropdown');
            if (dropdown) {
                // Fermer les autres dropdowns
                document.querySelectorAll('.nav-item .dropdown.show').forEach(d => {
                    if (d !== dropdown) d.classList.remove('show');
                });
                dropdown.classList.toggle('show');
            }
        });
    });

    // Fermer tous les dropdowns au clic extérieur
    document.addEventListener('click', (e) => {
        // Fermer dropdowns nav
        if (!e.target.closest('.nav-item')) {
            document.querySelectorAll('.nav-item .dropdown.show').forEach(d => {
                d.classList.remove('show');
            });
        }
        
        // Fermer custom-select
        if (!e.target.closest('.custom-select')) {
            const optionsList = document.querySelector('.options-list.show');
            if (optionsList) optionsList.classList.remove('show');
        }
        
        // Fermer position dropdown
        if (!e.target.closest('.position-zone') && !e.target.closest('.position-dropdown')) {
            const posDropdown = document.getElementById('position-dropdown');
            if (posDropdown) posDropdown.classList.remove('show');
        }
    });

    window.openChat = () => {
        console.log('Chat ouvert');
    };

    // ============================================
    // CUSTOM SELECT (CATÉGORIES)
    // ============================================
    const customSelect = document.querySelector('.custom-select');
    const selectedOption = customSelect?.querySelector('.selected-option');
    const optionsList = customSelect?.querySelector('.options-list');
    const options = optionsList?.querySelectorAll('li');

    if (customSelect && selectedOption && optionsList) {
        customSelect.addEventListener('click', (e) => {
            e.stopPropagation();
            
            // Fermer les autres dropdowns
            document.querySelectorAll('.nav-item .dropdown.show').forEach(d => {
                d.classList.remove('show');
            });
            const posDropdown = document.getElementById('position-dropdown');
            if (posDropdown) posDropdown.classList.remove('show');
            
            optionsList.classList.toggle('show');
        });

        if (options) {
            options.forEach(option => {
                option.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const span = selectedOption.querySelector('span');
                    if (span) span.textContent = option.textContent;
                    selectedOption.dataset.value = option.dataset.value;
                    optionsList.classList.remove('show');
                    console.log('Catégorie sélectionnée:', selectedOption.dataset.value);
                });
            });
        }
    }

    // ============================================
    // PROMO BAR
    // ============================================
    const promoBar = document.getElementById('promo-bar');
    if (promoBar) {
        if (localStorage.getItem('promoClosed') === 'true') {
            promoBar.style.display = 'none';
        } else {
            const promoEndDate = new Date('2025-10-12');
            if (new Date() > promoEndDate) {
                promoBar.style.display = 'none';
            }
        }
    }

    window.closePromoBar = () => {
        if (promoBar) {
            promoBar.style.display = 'none';
            localStorage.setItem('promoClosed', 'true');
        }
    };

    const promos = [
        "-15% sur les cosmetique cette semaine | Livraisons gratuite dès 30 000 FCFA",
        "Autre promo exemple | Détails ici"
    ];
    let currentPromo = 0;
    const promoText = document.querySelector('.promo-text');
    
    if (promoText && promos.length > 1) {
        setInterval(() => {
            currentPromo = (currentPromo + 1) % promos.length;
            promoText.textContent = promos[promos.length - 1 - currentPromo];
        }, 5000);
    }

    window.trackEvent = (event) => {
        console.log(`Event tracked: ${event}`);
    };

    // ============================================
    // CTA BUTTON
    // ============================================
    const ctaButtons = document.querySelectorAll('.cta-button');
    ctaButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector('#recommended-products');
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // ============================================
    // CARROUSEL CATÉGORIES - CORRIGÉ
    // ============================================
    (function setupCategoryCarousel() {
        const categoryList = document.querySelector('.category-list');
        const prevArrow = document.getElementById('prev-arrow');
        const nextArrow = document.getElementById('next-arrow');
        
        if (!categoryList || !prevArrow || !nextArrow) return;

        function getScrollAmount() {
            return Math.max(categoryList.clientWidth * 0.6, 160);
        }

        function updateArrows() {
            const scrollLeft = Math.round(categoryList.scrollLeft);
            const maxScroll = Math.max(0, categoryList.scrollWidth - categoryList.clientWidth);
            
            prevArrow.disabled = scrollLeft <= 5;
            nextArrow.disabled = scrollLeft >= maxScroll - 5;
            prevArrow.setAttribute('aria-disabled', prevArrow.disabled ? 'true' : 'false');
            nextArrow.setAttribute('aria-disabled', nextArrow.disabled ? 'true' : 'false');
        }

        // Événements de clic sur les flèches
        nextArrow.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            categoryList.scrollBy({ left: getScrollAmount(), behavior: 'smooth' });
        });

        prevArrow.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            categoryList.scrollBy({ left: -getScrollAmount(), behavior: 'smooth' });
        });

        // Mise à jour des flèches au scroll
        let scrollTimeout;
        categoryList.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(updateArrows, 50);
        });

        // Touch events
        let touchStartX = 0;
        categoryList.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
        }, { passive: true });

        categoryList.addEventListener('touchend', (e) => {
            const touchEndX = e.changedTouches[0].clientX;
            const delta = touchEndX - touchStartX;
            if (Math.abs(delta) > 40) {
                categoryList.scrollBy({ left: -delta, behavior: 'smooth' });
            }
        }, { passive: true });

        // Clavier
        categoryList.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight') {
                categoryList.scrollBy({ left: 120, behavior: 'smooth' });
                e.preventDefault();
            }
            if (e.key === 'ArrowLeft') {
                categoryList.scrollBy({ left: -120, behavior: 'smooth' });
                e.preventDefault();
            }
        });

        // Clic sur catégorie
        categoryList.addEventListener('click', (e) => {
            const btn = e.target.closest('.category-item');
            if (!btn) return;
            
            document.querySelectorAll('.category-item.is-active').forEach(x => x.classList.remove('is-active'));
            btn.classList.add('is-active');
            
            const rect = btn.getBoundingClientRect();
            const containerRect = categoryList.getBoundingClientRect();
            const offset = (rect.left + rect.width / 2) - (containerRect.left + containerRect.width / 2);
            categoryList.scrollBy({ left: offset, behavior: 'smooth' });
        });

        updateArrows();
        window.addEventListener('resize', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(updateArrows, 100);
        });
    })();

    // ============================================
    // TRENDS CARDS - COMPORTEMENT UX CORRIGÉ
    // ============================================
    let activeCard = null;
    let hideTimeout = null;

    function showActionBanner(card) {
        // Fermer la carte active précédente
        if (activeCard && activeCard !== card) {
            hideActionBanner(activeCard);
        }

        card.classList.add('active');
        card.setAttribute('aria-expanded', 'true');
        const actions = card.querySelector('.card-actions');
        if (actions) actions.setAttribute('aria-hidden', 'false');
        
        activeCard = card;

        // Timer d'inactivité (4.5s)
        clearTimeout(hideTimeout);
        hideTimeout = setTimeout(() => {
            hideActionBanner(card);
        }, 4500);
    }

    function hideActionBanner(card) {
        if (!card) return;
        
        clearTimeout(hideTimeout);
        card.classList.remove('active');
        card.setAttribute('aria-expanded', 'false');
        const actions = card.querySelector('.card-actions');
        if (actions) actions.setAttribute('aria-hidden', 'true');
        
        if (activeCard === card) {
            activeCard = null;
        }
    }

    function hideAllActionBanners() {
        document.querySelectorAll('.trend-card.active').forEach(card => {
            hideActionBanner(card);
        });
    }

    // Gestion des trend cards
    document.querySelectorAll('.trend-card').forEach(card => {
        const isTouchDevice = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
        
        // Desktop: hover
        if (!isTouchDevice) {
            card.addEventListener('mouseenter', () => {
                const actions = card.querySelector('.card-actions');
                if (actions) {
                    actions.style.opacity = '1';
                    actions.style.bottom = '20px';
                }
            });

            card.addEventListener('mouseleave', () => {
                const actions = card.querySelector('.card-actions');
                if (actions) {
                    actions.style.opacity = '0';
                    actions.style.bottom = '-50px';
                }
            });

            // Clic sur la carte (pas sur les boutons) = redirection
            card.addEventListener('click', (e) => {
                if (!e.target.closest('.card-actions')) {
                    const productId = card.querySelector('p').id.replace('prod-', '');
                    window.location.href = `/product/${productId}`;
                }
            });
        } else {
            // Mobile/Tablette: tap pour toggle
            card.addEventListener('click', (e) => {
                if (!e.target.closest('.card-actions')) {
                    e.preventDefault();
                    if (card.classList.contains('active')) {
                        hideActionBanner(card);
                    } else {
                        showActionBanner(card);
                    }
                }
            });
        }

        // Clavier
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                if (isTouchDevice || window.innerWidth <= 767) {
                    if (card.classList.contains('active')) {
                        hideActionBanner(card);
                    } else {
                        showActionBanner(card);
                    }
                } else {
                    const productId = card.querySelector('p').id.replace('prod-', '');
                    window.location.href = `/product/${productId}`;
                }
            }
            if (e.key === 'Escape') {
                hideActionBanner(card);
            }
        });

        // Boutons
        const previewBtn = card.querySelector('.card-actions button:nth-child(1)');
        const addToCartBtn = card.querySelector('.card-actions button:nth-child(2)');

        if (previewBtn) {
            previewBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                showQuickView(card);
                hideActionBanner(card);
            });
        }

        if (addToCartBtn) {
            addToCartBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                addToCart(card);
                hideActionBanner(card);
            });
        }
    });

    // Tap outside pour fermer
    document.addEventListener('click', (e) => {
        if (activeCard && !e.target.closest('.trend-card')) {
            hideActionBanner(activeCard);
        }
    });

    // Scroll pour fermer
    let lastScrollY = window.scrollY;
    window.addEventListener('scroll', () => {
        if (Math.abs(window.scrollY - lastScrollY) > 30) {
            hideAllActionBanners();
            lastScrollY = window.scrollY;
        }
    });

    // Swipe horizontal pour fermer
    let swipeStartX = 0;
    document.addEventListener('touchstart', (e) => {
        swipeStartX = e.touches[0].clientX;
    }, { passive: true });

    document.addEventListener('touchend', (e) => {
        const swipeEndX = e.changedTouches[0].clientX;
        if (Math.abs(swipeEndX - swipeStartX) > 50) {
            hideAllActionBanners();
        }
    }, { passive: true });

    // Intersection Observer pour animation
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    document.querySelectorAll('.trend-card').forEach(card => observer.observe(card));

    // ============================================
    // QUICK VIEW MODAL
    // ============================================
    function showQuickView(card) {
        const modal = document.createElement('div');
        modal.className = 'quick-view-modal';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        
        const imgSrc = card.querySelector('.trend-image img')?.src || '';
        const imgAlt = card.querySelector('.trend-image img')?.alt || '';
        const productName = card.querySelector('p')?.textContent || '';
        
        modal.innerHTML = `
            <div class="modal-content">
                <img src="${imgSrc}" alt="${imgAlt}">
                <p>${productName}</p>
                <button aria-label="Ajouter au panier ${productName}" class="add-to-cart-modal">Ajouter au panier</button>
                <button class="close-modal" aria-label="Fermer la modale">Fermer</button>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Focus trap
        const closeBtn = modal.querySelector('.close-modal');
        const addBtn = modal.querySelector('.add-to-cart-modal');
        if (closeBtn) closeBtn.focus();

        // Fermer modal
        const closeModal = () => {
            modal.remove();
            card.focus();
        };

        if (closeBtn) {
            closeBtn.addEventListener('click', closeModal);
        }

        if (addBtn) {
            addBtn.addEventListener('click', () => {
                addToCart(card);
                closeModal();
            });
        }

        // Esc pour fermer
        const handleEsc = (e) => {
            if (e.key === 'Escape') {
                closeModal();
                document.removeEventListener('keydown', handleEsc);
            }
        };
        document.addEventListener('keydown', handleEsc);

        // Clic outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
    }

    // ============================================
    // AJOUTER AU PANIER - CORRIGÉ
    // ============================================
    function addToCart(card) {
        let cart = [];
        try {
            const cartData = localStorage.getItem('cart');
            cart = cartData ? JSON.parse(cartData) : [];
            if (!Array.isArray(cart)) {
                cart = [];
            }
        } catch (e) {
            console.error('Erreur parsing cart:', e);
            cart = [];
        }

        const productId = card.querySelector('p')?.id?.replace('prod-', '') || Date.now().toString();
        const productName = card.querySelector('p')?.textContent || 'Produit';
        const productImage = card.querySelector('.trend-image img')?.src || '';

        const product = {
            id: productId,
            name: productName,
            image: productImage
        };
        
        cart.push(product);
        localStorage.setItem('cart', JSON.stringify(cart));

        // Animation
        const flyElement = document.createElement('div');
        flyElement.className = 'fly-to-cart';
        flyElement.style.backgroundImage = `url(${productImage})`;
        flyElement.style.position = 'fixed';
        flyElement.style.zIndex = '9999';
        
        const cardRect = card.getBoundingClientRect();
        flyElement.style.left = cardRect.left + 'px';
        flyElement.style.top = cardRect.top + 'px';
        
        document.body.appendChild(flyElement);

        setTimeout(() => {
            flyElement.remove();
            updateCartBadge();
            showFeedback('✅ Produit ajouté au panier');
        }, 500);
    }

    window.removeFromCart = (productId) => {
        let cart = [];
        try {
            const cartData = localStorage.getItem('cart');
            cart = cartData ? JSON.parse(cartData) : [];
            if (!Array.isArray(cart)) {
                cart = [];
            }
        } catch (e) {
            console.error('Erreur parsing cart:', e);
            cart = [];
        }

        cart = cart.filter(item => item.id !== productId);
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartBadge();
        showFeedback('🗑️ Produit retiré du panier');
    };

    // ============================================
    // SECTION PRODUITS RECOMMANDÉS - CORRIGÉ
    // ============================================
    const filters = document.querySelectorAll('.filter-pill');
    const productsGrid = document.querySelector('.products-grid');
    const loadMoreButton = document.querySelector('.load-more');
    const filterContainer = document.querySelector('.filters');
    const leftArrow = document.querySelector('.filter-arrow.left-arrow');
    const rightArrow = document.querySelector('.filter-arrow.right-arrow');

    if (filters.length && productsGrid && loadMoreButton && filterContainer && leftArrow && rightArrow) {
        
        // Filtres - Événement de clic
        filters.forEach(filter => {
            filter.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                // Désactiver tous les filtres
                filters.forEach(f => {
                    f.classList.remove('active');
                    f.setAttribute('aria-checked', 'false');
                });
                
                // Activer le filtre cliqué
                filter.classList.add('active');
                filter.setAttribute('aria-checked', 'true');

                const category = filter.dataset.filter;
                const productCards = document.querySelectorAll('.product-card');

                productCards.forEach(card => {
                    const cardCategory = card.dataset.category;
                    card.style.display = (category === 'recommended' || cardCategory === category) ? 'block' : 'none';
                });

                updateLoadMoreButton();
                console.log(`Filtre appliqué : ${filter.textContent}`);
            });
        });

        // Flèches de défilement
        function updateFilterArrows() {
            const scrollLeft = Math.round(filterContainer.scrollLeft);
            const maxScroll = Math.max(0, filterContainer.scrollWidth - filterContainer.clientWidth);
            
            leftArrow.disabled = scrollLeft <= 5;
            rightArrow.disabled = scrollLeft >= maxScroll - 5;
            leftArrow.setAttribute('aria-disabled', leftArrow.disabled ? 'true' : 'false');
            rightArrow.setAttribute('aria-disabled', rightArrow.disabled ? 'true' : 'false');
        }

        function getFilterScrollAmount() {
            return Math.max(filterContainer.clientWidth * 0.5, 100);
        }

        leftArrow.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!leftArrow.disabled) {
                filterContainer.scrollBy({ left: -getFilterScrollAmount(), behavior: 'smooth' });
            }
        });

        rightArrow.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!rightArrow.disabled) {
                filterContainer.scrollBy({ left: getFilterScrollAmount(), behavior: 'smooth' });
            }
        });

        let filterScrollTimeout;
        filterContainer.addEventListener('scroll', () => {
            clearTimeout(filterScrollTimeout);
            filterScrollTimeout = setTimeout(updateFilterArrows, 50);
        });

        // Touch events pour filtres
        let filterTouchStartX = 0;
        filterContainer.addEventListener('touchstart', (e) => {
            filterTouchStartX = e.touches[0].clientX;
        }, { passive: true });

        filterContainer.addEventListener('touchend', (e) => {
            const touchEndX = e.changedTouches[0].clientX;
            const delta = touchEndX - filterTouchStartX;
            if (Math.abs(delta) > 40) {
                filterContainer.scrollBy({ left: -delta, behavior: 'smooth' });
            }
        }, { passive: true });

        filterContainer.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight') {
                filterContainer.scrollBy({ left: 100, behavior: 'smooth' });
                e.preventDefault();
            } else if (e.key === 'ArrowLeft') {
                filterContainer.scrollBy({ left: -100, behavior: 'smooth' });
                e.preventDefault();
            }
        });

        // Bouton "Afficher plus"
        function updateLoadMoreButton() {
            const productCards = document.querySelectorAll('.product-card');
            const visibleCards = Array.from(productCards).filter(card => card.style.display !== 'none');
            const isDisabled = visibleCards.length === productCards.length;
            
            loadMoreButton.disabled = isDisabled;
            loadMoreButton.setAttribute('aria-disabled', isDisabled ? 'true' : 'false');
            loadMoreButton.setAttribute('aria-label', isDisabled ? 'Aucun produit supplémentaire à charger' : 'Charger plus de produits');
        }

        loadMoreButton.addEventListener('click', () => {
            const productCards = document.querySelectorAll('.product-card');
            const hiddenCards = Array.from(productCards).filter(card => card.style.display === 'none');
            const cardsToShow = hiddenCards.slice(0, 4);

            cardsToShow.forEach(card => {
                card.style.display = 'block';
            });

            updateLoadMoreButton();
            console.log(`Cartes affichées : ${cardsToShow.length}`);
        });

        updateFilterArrows();
        updateLoadMoreButton();
        
        window.addEventListener('resize', () => {
            clearTimeout(filterScrollTimeout);
            filterScrollTimeout = setTimeout(updateFilterArrows, 100);
        });
    }

    // ============================================
    // PRODUCT CARDS (Recommended Products)
    // ============================================
    document.querySelectorAll('.product-card').forEach(card => {
        const isTouchDevice = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
        
        if (isTouchDevice || window.innerWidth <= 1024) {
            card.addEventListener('click', (e) => {
                if (!e.target.closest('.card-actions')) {
                    e.preventDefault();
                    if (card.classList.contains('active')) {
                        hideActionBanner(card);
                    } else {
                        showActionBanner(card);
                    }
                }
            });
        } else {
            // Desktop: hover
            card.addEventListener('mouseenter', () => {
                const actions = card.querySelector('.card-actions');
                if (actions) {
                    actions.style.opacity = '1';
                    actions.style.bottom = '20px';
                }
            });

            card.addEventListener('mouseleave', () => {
                const actions = card.querySelector('.card-actions');
                if (actions) {
                    actions.style.opacity = '0';
                    actions.style.bottom = '-50px';
                }
            });

            card.addEventListener('click', (e) => {
                if (!e.target.closest('.card-actions')) {
                    const productName = card.querySelector('.product-name')?.textContent || 'product';
                    window.location.href = `/product/${productName}`;
                }
            });
        }

        // Clavier
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                if (isTouchDevice || window.innerWidth <= 1024) {
                    if (card.classList.contains('active')) {
                        hideActionBanner(card);
                    } else {
                        showActionBanner(card);
                    }
                } else {
                    const productName = card.querySelector('.product-name')?.textContent || 'product';
                    window.location.href = `/product/${productName}`;
                }
            }
            if (e.key === 'Escape') {
                hideActionBanner(card);
            }
        });

        // Boutons dans .card-actions
        const previewBtn = card.querySelector('.card-actions button:nth-child(1)');
        const addToCartBtn = card.querySelector('.card-actions button:nth-child(2)');

        if (previewBtn) {
            previewBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                showQuickViewProduct(card);
                hideActionBanner(card);
            });
        }

        if (addToCartBtn) {
            addToCartBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                addToCartFromProduct(card);
                hideActionBanner(card);
            });
        }
    });

    // ============================================
    // FONCTIONS POUR PRODUCT CARDS
    // ============================================
    function showQuickViewProduct(card) {
        const modal = document.createElement('div');
        modal.className = 'quick-view-modal';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        
        const imgSrc = card.querySelector('.product-image')?.src || '';
        const imgAlt = card.querySelector('.product-image')?.alt || '';
        const productName = card.querySelector('.product-name')?.textContent || '';
        const currentPrice = card.querySelector('.current-price')?.textContent || '';
        
        modal.innerHTML = `
            <div class="modal-content">
                <img src="${imgSrc}" alt="${imgAlt}">
                <h3>${productName}</h3>
                <p style="font-size: 18px; font-weight: bold; color: #003087; margin: 10px 0;">${currentPrice}</p>
                <button aria-label="Ajouter au panier ${productName}" class="add-to-cart-modal" style="background: #FFB74D; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin: 10px;">Ajouter au panier</button>
                <button class="close-modal" aria-label="Fermer la modale" style="background: #1F2A44; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">Fermer</button>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        const closeBtn = modal.querySelector('.close-modal');
        const addBtn = modal.querySelector('.add-to-cart-modal');
        if (closeBtn) closeBtn.focus();

        const closeModal = () => {
            modal.remove();
            card.focus();
        };

        if (closeBtn) {
            closeBtn.addEventListener('click', closeModal);
        }

        if (addBtn) {
            addBtn.addEventListener('click', () => {
                addToCartFromProduct(card);
                closeModal();
            });
        }

        const handleEsc = (e) => {
            if (e.key === 'Escape') {
                closeModal();
                document.removeEventListener('keydown', handleEsc);
            }
        };
        document.addEventListener('keydown', handleEsc);

        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
    }

    function addToCartFromProduct(card) {
        let cart = [];
        try {
            const cartData = localStorage.getItem('cart');
            cart = cartData ? JSON.parse(cartData) : [];
            if (!Array.isArray(cart)) {
                cart = [];
            }
        } catch (e) {
            console.error('Erreur parsing cart:', e);
            cart = [];
        }

        const productName = card.querySelector('.product-name')?.textContent || 'Produit';
        const productImage = card.querySelector('.product-image')?.src || '';
        const productId = 'prod-' + Date.now();

        const product = {
            id: productId,
            name: productName,
            image: productImage
        };
        
        cart.push(product);
        localStorage.setItem('cart', JSON.stringify(cart));

        // Animation fly-to-cart
        const flyElement = document.createElement('div');
        flyElement.className = 'fly-to-cart';
        flyElement.style.backgroundImage = `url(${productImage})`;
        flyElement.style.position = 'fixed';
        flyElement.style.zIndex = '9999';
        
        const cardRect = card.getBoundingClientRect();
        flyElement.style.left = cardRect.left + 'px';
        flyElement.style.top = cardRect.top + 'px';
        
        document.body.appendChild(flyElement);

        setTimeout(() => {
            flyElement.remove();
            updateCartBadge();
            showFeedback('✅ Produit ajouté au panier');
        }, 500);
    }

    // ============================================
    // REDIRECTION CATÉGORIES
    // ============================================
    window.redirectToCategory = (categoryName) => {
        console.log('Redirection vers catégorie:', categoryName);
        window.location.href = `/category/${encodeURIComponent(categoryName)}`;
    };

    // ============================================
    // CART MANAGEMENT
    // ============================================
    window.openCart = () => {
        console.log('Ouverture du panier');
        window.location.href = '/cart';
    };




    console.log('✅ Script entièrement chargé et fonctionnel');
});