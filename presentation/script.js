let currentSlide = 0;
const slides = document.querySelectorAll('.slide');
const totalSlides = slides.length;

function showSlide(n) {
    slides.forEach(slide => slide.style.display = 'none');
    
    if (n >= totalSlides) {
        currentSlide = 0;
    } else if (n < 0) {
        currentSlide = totalSlides - 1;
    } else {
        currentSlide = n;
    }
    
    slides[currentSlide].style.display = 'flex';
    document.getElementById('slideNumber').textContent = `${currentSlide + 1} / ${totalSlides}`;
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function nextSlide() {
    showSlide(currentSlide + 1);
}

function previousSlide() {
    showSlide(currentSlide - 1);
}

// Keyboard navigation
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        nextSlide();
    } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        previousSlide();
    }
});

// Initialize
showSlide(0);

