document.querySelector('.hero-btn').addEventListener('click', () => {
    alert('Fonctionnalité de commande en cours de développement !');
});


document.addEventListener('DOMContentLoaded', function() {
    const filtersContainer = document.querySelector('.filters-container');
    const filters = document.querySelector('.filters');
    const leftArrow = document.querySelector('.left-arrow');
    const rightArrow = document.querySelector('.right-arrow');
    
    // Fonction pour vérifier si le scroll est possible
    function checkScrollability() {
        const canScrollLeft = filters.scrollLeft > 0;
        const canScrollRight = filters.scrollLeft < (filters.scrollWidth - filters.clientWidth);
        
        // Afficher/masquer les masques dégradés
        if (canScrollLeft) {
            filtersContainer.classList.add('scrollable-left');
        } else {
            filtersContainer.classList.remove('scrollable-left');
        }
        
        if (canScrollRight) {
            filtersContainer.classList.add('scrollable-right');
        } else {
            filtersContainer.classList.remove('scrollable-right');
        }
        
        // Afficher/masquer les flèches
        leftArrow.style.opacity = canScrollLeft ? '0.7' : '0.3';
        rightArrow.style.opacity = canScrollRight ? '0.7' : '0.3';
        leftArrow.style.pointerEvents = canScrollLeft ? 'auto' : 'none';
        rightArrow.style.pointerEvents = canScrollRight ? 'auto' : 'none';
    }
    
    // Vérification initiale
    checkScrollability();
    
    // Écouter les changements de scroll
    filters.addEventListener('scroll', checkScrollability);
    
    // Redimensionnement de la fenêtre
    window.addEventListener('resize', checkScrollability);
    
    // Gestion du clic sur les flèches
    leftArrow.addEventListener('click', function() {
        filters.scrollBy({
            left: -200,
            behavior: 'smooth'
        });
    });
    
    rightArrow.addEventListener('click', function() {
        filters.scrollBy({
            left: 200,
            behavior: 'smooth'
        });
    });
    
    // Gestion des filtres actifs
    const filterPills = document.querySelectorAll('.filter-pill');
    
    filterPills.forEach(pill => {
        pill.addEventListener('click', function() {
            // Retirer la classe active de tous les filtres
            filterPills.forEach(p => p.classList.remove('active'));
            
            // Ajouter la classe active au filtre cliqué
            this.classList.add('active');
            
            // Ici vous pouvez ajouter la logique de filtrage des produits
            const filter = this.getAttribute('data-filter');
            console.log('Filtre sélectionné:', filter);
        });
    });
    
    // Gestion des favoris
    const favoriteIcons = document.querySelectorAll('.favorite-icon');
    
    favoriteIcons.forEach(icon => {
        icon.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // Toggle de la classe active
            this.classList.toggle('active');
            
            // Animation légère
            this.style.transform = 'scale(1.2)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);
            
            // Ici vous pouvez ajouter la logique de sauvegarde des favoris
            const isActive = this.classList.contains('active');
            console.log('Favori', isActive ? 'ajouté' : 'retiré');
        });
    });
    
    // Gestion du hover sur les cartes
    const productCards = document.querySelectorAll('.product-card');
    
    productCards.forEach(card => {
        card.addEventListener('click', function() {
            // Logique de redirection vers la page produit
            const productName = card.querySelector('.product-name')?.textContent;
            console.log('Clic sur le produit:', productName);
        });
    });
});


 // Gestion des clics sur les cartes de service
        document.addEventListener('DOMContentLoaded', function() {
            const serviceCards = document.querySelectorAll('.service-card');
            
            serviceCards.forEach(card => {
                card.addEventListener('click', function() {
                    const serviceName = this.querySelector('.service-name').textContent.trim();
                    console.log('Service sélectionné:', serviceName);
                    
                    // Ici vous pouvez ajouter la logique de redirection
                    // window.location.href = `/services/${encodeURIComponent(serviceName)}`;
                });
            });
        });