document.addEventListener('DOMContentLoaded', () => {

    // 0. Drone Background Initialization
    const gridEl = document.querySelector('.drone-grid');
    if (gridEl) {
        // Generate Matrix
        for(let i = 0; i < 40; i++) {
            for(let j = 0; j < 30; j++) {
                const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                circle.setAttribute('cx', i * 20);
                circle.setAttribute('cy', j * 20);
                circle.setAttribute('r', '1');
                circle.setAttribute('fill', 'rgba(110, 231, 183, 0.15)');
                circle.classList.add('grid-dot');
                gridEl.appendChild(circle);
            }
        }

        // Draw Drone Paths
        anime.timeline({ loop: false })
        .add({
            targets: '.drone-path',
            strokeDashoffset: [anime.setDashoffset, 0],
            easing: 'easeInOutSine',
            duration: 2500,
            delay: function(el, i) { return i * 200 }
        })
        .add({
            targets: '.grid-dot',
            scale: [0, 1],
            opacity: [0, 1],
            easing: 'easeOutQuad',
            delay: anime.stagger(10, {grid: [40, 30], from: 'center'}),
            duration: 500
        }, '-=1500');

        // Continuous Loops
        anime({
            targets: '.hud-ring',
            rotate: '1turn',
            easing: 'linear',
            duration: 15000,
            loop: true,
            transformOrigin: '0px 0px'
        });
        anime({
            targets: '.hud-ring-reverse',
            rotate: '-1turn',
            easing: 'linear',
            duration: 20000,
            loop: true,
            transformOrigin: '0px 0px'
        });
        anime({
            targets: '.drone-prop',
            rotate: '1turn',
            easing: 'linear',
            duration: 800,
            loop: true,
            transformOrigin: '0px 0px'
        });
    }

    // 1. Initial Hero Loading Animation
    anime.timeline({
        easing: 'easeOutExpo',
    })
    .add({
        targets: 'nav',
        translateY: [-50, 0],
        opacity: [0, 1],
        duration: 1000,
    })
    .add({
        targets: '.animate-hero',
        translateY: [20, 0],
        opacity: [0, 1],
        duration: 800,
        delay: anime.stagger(150),
    }, '-=500');

    // 2. Typing Effect using Typed.js for the subtitle
    new Typed('.typed-subtitle', {
        strings: ['I build things for the web and cloud.', 'I architect resilient cloud infrastructure.', 'I optimize large-scale distributed systems.'],
        typeSpeed: 40,
        backSpeed: 30,
        backDelay: 2000,
        loop: true,
        showCursor: true,
        cursorChar: '|'
    });

    // 3. Setup Scroll Observers for Sections
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const sectionObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                
                // Animate Section Titles
                if (entry.target.classList.contains('section-title')) {
                    anime({
                        targets: entry.target,
                        opacity: [0, 1],
                        translateX: [-20, 0],
                        easing: 'easeOutQuart',
                        duration: 800
                    });
                }
                
                // Animate Glass Panels
                else if (entry.target.classList.contains('glass-panel') && !entry.target.classList.contains('project-card')) {
                    anime({
                        targets: entry.target,
                        opacity: [0, 1],
                        translateY: [40, 0],
                        easing: 'easeOutQuart',
                        duration: 1000
                    });
                }
                
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // List Observer for staggering arrays (experience, projects, skills)
    const listObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                
                let targetItems = entry.target.querySelectorAll('.animate-item, .skill-pill');
                if(targetItems.length > 0) {
                    anime({
                        targets: targetItems,
                        translateY: [30, 0],
                        opacity: [0, 1],
                        easing: 'easeOutElastic(1, .8)',
                        duration: 1000,
                        delay: anime.stagger(150)
                    });
                }
                
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Initial Hide for IntersectionTargets
    document.querySelectorAll('.animate-title, .animate-panel, .animate-item, .skill-pill').forEach(el => {
        el.style.opacity = '0';
    });

    // Attach Section Observers
    document.querySelectorAll('.animate-title, .animate-panel').forEach(el => {
        sectionObserver.observe(el);
    });

    // Attach List Observers
    document.getElementById('experience-list') && listObserver.observe(document.getElementById('experience-list'));
    document.getElementById('projects-list') && listObserver.observe(document.getElementById('projects-list'));
    document.getElementById('skills-list') && listObserver.observe(document.getElementById('skills-list'));
    document.getElementById('extras-list') && listObserver.observe(document.getElementById('extras-list'));
    document.getElementById('contact-list') && listObserver.observe(document.getElementById('contact-list'));

    // 4. Hover Interactions for Project Cards
    const projectCards = document.querySelectorAll('.project-card');
    
    projectCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            anime({
                targets: card,
                translateY: -10,
                boxShadow: '0 10px 30px rgba(110, 231, 183, 0.15)',
                duration: 300,
                easing: 'easeOutQuart'
            });
            anime({
                targets: card.querySelector('.folder-icon svg'),
                scale: 1.1,
                rotate: 5,
                duration: 300,
                easing: 'easeOutQuad'
            });
        });
        
        card.addEventListener('mouseleave', () => {
            anime({
                targets: card,
                translateY: 0,
                boxShadow: '0 0px 0px rgba(0,0,0,0)',
                duration: 300,
                easing: 'easeOutQuart'
            });
            anime({
                targets: card.querySelector('.folder-icon svg'),
                scale: 1,
                rotate: 0,
                duration: 300,
                easing: 'easeOutQuad'
            });
        });
    });

});