document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Mobile Navigation Toggle
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });

    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
        });
    });

    // 2. Scroll Reveal Animation
    const revealElements = document.querySelectorAll('.reveal');

    const revealOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };

    const revealOnScroll = new IntersectionObserver(function(entries, observer) {
        entries.forEach(entry => {
            if (!entry.isIntersecting) {
                return;
            } else {
                entry.target.classList.add('show');
                observer.unobserve(entry.target);
            }
        });
    }, revealOptions);

    revealElements.forEach(el => {
        revealOnScroll.observe(el);
    });

    // 3. GPA Gauge Animation
    const gpaCard = document.querySelector('.gpa-card');
    const gaugeFill = document.querySelector('.gauge-fill');
    
    if (gpaCard && gaugeFill) {
        const gpaObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const gpa = 3.60;
                    const maxGpa = 4.00;
                    const percentage = gpa / maxGpa;
                    const totalLength = 157.08;
                    const offset = totalLength * (1 - percentage);
                    
                    setTimeout(() => {
                        gaugeFill.style.strokeDashoffset = offset;
                    }, 300);
                    
                    gpaObserver.unobserve(gpaCard);
                }
            });
        }, { threshold: 0.5 });

        gpaObserver.observe(gpaCard);
    }

    // 4. Typing Animation untuk Nama
    const typedTextElement = document.getElementById('typed-text');
    const fullName = "Jason Alexander Wijaya";
    let charIndex = 0;
    const typingSpeed = 100;

    function typeName() {
        if (charIndex < fullName.length) {
            typedTextElement.textContent += fullName.charAt(charIndex);
            charIndex++;
            setTimeout(typeName, typingSpeed);
        }
    }

    setTimeout(typeName, 500);

});