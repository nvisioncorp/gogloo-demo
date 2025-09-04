document.querySelector('.hero-btn').addEventListener('click', () => {
    alert('Fonctionnalité de commande en cours de développement !');
});

document.addEventListener('DOMContentLoaded', () => {
    const filtersContainer = document.querySelector('.filters');
    const leftArrow = document.querySelector('.left-arrow');
    const rightArrow = document.querySelector('.right-arrow');
    const filterPills = document.querySelectorAll('.filter-pill');

    // Toggle active state
    filterPills.forEach(pill => {
        pill.addEventListener('click', () => {
            filterPills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
        });
    });

    // Scroll functionality
    const scrollAmount = 150;

    rightArrow.addEventListener('click', () => {
        filtersContainer.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        updateArrowVisibility();
    });

    leftArrow.addEventListener('click', () => {
        filtersContainer.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        updateArrowVisibility();
    });

    // Swipe support
    let touchStartX = 0;
    let touchEndX = 0;

    filtersContainer.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    });

    filtersContainer.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });

    function handleSwipe() {
        const swipeDistance = touchEndX - touchStartX;
        if (swipeDistance > 50) {
            filtersContainer.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        } else if (swipeDistance < -50) {
            filtersContainer.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
        updateArrowVisibility();
    }

    // Update arrow visibility
    function updateArrowVisibility() {
        const maxScroll = filtersContainer.scrollWidth - filtersContainer.clientWidth;
        const currentScroll = filtersContainer.scrollLeft;

        leftArrow.style.display = currentScroll > 0 ? 'block' : 'none';
        rightArrow.style.display = currentScroll < maxScroll ? 'block' : 'none';
    }

    // Initial visibility check
    updateArrowVisibility();

    // Update on scroll
    filtersContainer.addEventListener('scroll', updateArrowVisibility);
});

/* JavaScript pour basculer l'état de l'icône cœur (à ajouter dans script.js) */
document.addEventListener('DOMContentLoaded', () => {
    const favoriteIcons = document.querySelectorAll('.favorite-icon');
    favoriteIcons.forEach(icon => {
        icon.addEventListener('click', () => {
            icon.classList.toggle('active');
        });
    });
    // ... (reste du code existant pour filters)
});