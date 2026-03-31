// header footer

document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.querySelector('.nav-menu');

    hamburger.addEventListener('click', () => {
        // Toggle Menu
        navMenu.classList.toggle('active');
        // Toggle Hamburger Animation
        hamburger.classList.toggle('active');
    });

    // Close menu when clicking a link (mobile fix)
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            hamburger.classList.remove('active');
        });
    });
});




// public/js/script.js -> 3 line mobile responsive
document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            // Check karne ke liye ki click ho raha hai ya nahi
            console.log("Hamburger Clicked!"); 
            
            navMenu.classList.toggle('active');
            hamburger.classList.toggle('active');
        });
    } else {
        console.log("Hamburger or NavMenu not found in DOM");
    }
});






// home.ejs -> crausol


document.addEventListener('DOMContentLoaded', () => {
    // Navbar Toggle Logic (Purana wala rehne dena)
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.querySelector('.nav-menu');
    if(hamburger) {
        hamburger.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            hamburger.classList.toggle('active');
        });
    }

    // --- 🎠 CAROUSEL LOGIC ---
    const slides = document.querySelectorAll('.carousel-slide');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    let currentSlide = 0;

    function showSlide(index) {
        // Purani active slide hatao
        slides[currentSlide].classList.remove('active');
        // Naya index set karo
        currentSlide = (index + slides.length) % slides.length;
        // Nayi active slide dikhao
        slides[currentSlide].classList.add('active');
    }

    if(nextBtn && prevBtn) {
        nextBtn.addEventListener('click', () => showSlide(currentSlide + 1));
        prevBtn.addEventListener('click', () => showSlide(currentSlide - 1));

        // Auto Slide (Har 5 second mein)
        setInterval(() => {
            showSlide(currentSlide + 1);
        }, 5000);
    }
});