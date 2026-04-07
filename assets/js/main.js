document.addEventListener('DOMContentLoaded', () => {

    // 0. Canvas-based Drone/Techie Background Engine
    const canvas = document.getElementById('drone-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        const hero = document.getElementById('hero');
        const ACCENT = '#6ee7b7';
        const MUTED = '#94a3b8';

        function resize() {
            canvas.width = hero.offsetWidth;
            canvas.height = hero.offsetHeight;
        }
        resize();
        window.addEventListener('resize', resize);

        // --- Particles ---
        const NUM_PARTICLES = 80;
        const CONNECTION_DIST = 120;
        const particles = [];
        for (let i = 0; i < NUM_PARTICLES; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 0.4,
                vy: (Math.random() - 0.5) * 0.4,
                r: Math.random() * 2 + 1,
                alpha: Math.random() * 0.4 + 0.1
            });
        }

        // --- Anime.js driven state ---
        const state = {
            hudRing1: 0,
            hudRing2: 0,
            hudRing3: 0,
            scanY: 0,
            droneDrawProgress: 0,
            pulseRadius: 0,
            pulseAlpha: 0.6
        };

        // HUD ring rotations (continuous)
        anime({ targets: state, hudRing1: 2 * Math.PI, duration: 20000, loop: true, easing: 'linear' });
        anime({ targets: state, hudRing2: -2 * Math.PI, duration: 15000, loop: true, easing: 'linear' });
        anime({ targets: state, hudRing3: 2 * Math.PI, duration: 25000, loop: true, easing: 'linear' });

        // Scan line sweep
        anime({ targets: state, scanY: [0, 1], duration: 4000, loop: true, easing: 'easeInOutSine', direction: 'alternate' });

        // Drone wireframe draw/erase
        anime({ targets: state, droneDrawProgress: [0, 1], duration: 6000, loop: true, direction: 'alternate', easing: 'easeInOutQuad' });

        // Pulse ring
        anime({ targets: state, pulseRadius: [0, 200], pulseAlpha: [0.5, 0], duration: 3000, loop: true, easing: 'easeOutCubic' });

        // --- Canvas Drawing Functions ---
        function drawParticles() {
            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];
                p.x += p.vx; p.y += p.vy;
                if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
                if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = ACCENT;
                ctx.globalAlpha = p.alpha;
                ctx.fill();

                // Connections
                for (let j = i + 1; j < particles.length; j++) {
                    const q = particles[j];
                    const dx = p.x - q.x, dy = p.y - q.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < CONNECTION_DIST) {
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(q.x, q.y);
                        ctx.strokeStyle = ACCENT;
                        ctx.globalAlpha = (1 - dist / CONNECTION_DIST) * 0.15;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }
            }
            ctx.globalAlpha = 1;
        }

        function drawHUD() {
            const cx = canvas.width * 0.7, cy = canvas.height * 0.45;
            const rings = [
                { r: 140, rot: state.hudRing1, dash: [3, 15], w: 0.8, col: ACCENT, a: 0.2 },
                { r: 110, rot: state.hudRing2, dash: [20, 30], w: 1, col: MUTED, a: 0.15 },
                { r: 80,  rot: state.hudRing3, dash: [5, 10, 15, 10], w: 0.5, col: ACCENT, a: 0.25 }
            ];
            rings.forEach(ring => {
                ctx.save();
                ctx.translate(cx, cy);
                ctx.rotate(ring.rot);
                ctx.beginPath();
                ctx.arc(0, 0, ring.r, 0, Math.PI * 2);
                ctx.strokeStyle = ring.col;
                ctx.globalAlpha = ring.a;
                ctx.lineWidth = ring.w;
                ctx.setLineDash(ring.dash);
                ctx.stroke();
                ctx.restore();
            });
            ctx.setLineDash([]);

            // Crosshairs
            ctx.globalAlpha = 0.1;
            ctx.strokeStyle = ACCENT;
            ctx.lineWidth = 0.5;
            ctx.beginPath(); ctx.moveTo(cx - 160, cy); ctx.lineTo(cx + 160, cy); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(cx, cy - 160); ctx.lineTo(cx, cy + 160); ctx.stroke();

            // Pulse ring
            if (state.pulseAlpha > 0.01) {
                ctx.beginPath();
                ctx.arc(cx, cy, state.pulseRadius, 0, Math.PI * 2);
                ctx.strokeStyle = ACCENT;
                ctx.globalAlpha = state.pulseAlpha;
                ctx.lineWidth = 1.5;
                ctx.stroke();
            }
            ctx.globalAlpha = 1;
        }

        function drawDrone() {
            const cx = canvas.width * 0.7, cy = canvas.height * 0.45;
            const s = 1.8; // scale

            // Drone wireframe points (quadcopter top-down view)
            const body = [
                [-15*s, -10*s], [15*s, -10*s], [20*s, 0], [15*s, 10*s], [-15*s, 10*s], [-20*s, 0]
            ];
            const arms = [
                [[-15*s, -10*s], [-45*s, -40*s]],
                [[15*s, -10*s], [45*s, -40*s]],
                [[-15*s, 10*s], [-45*s, 40*s]],
                [[15*s, 10*s], [45*s, 40*s]]
            ];
            const motorCenters = [[-45*s,-40*s],[45*s,-40*s],[-45*s,40*s],[45*s,40*s]];
            const motorR = 12 * s;

            const prog = state.droneDrawProgress;

            ctx.save();
            ctx.translate(cx, cy);

            // Draw body
            ctx.beginPath();
            const bodyLen = body.length;
            const bodyProg = Math.min(prog * 2, 1); // first half of progress
            const bodyPts = Math.floor(bodyProg * bodyLen);
            if (bodyPts > 0) {
                ctx.moveTo(body[0][0], body[0][1]);
                for (let i = 1; i <= bodyPts && i < bodyLen; i++) {
                    ctx.lineTo(body[i][0], body[i][1]);
                }
                if (bodyProg >= 1) ctx.closePath();
            }
            ctx.strokeStyle = ACCENT;
            ctx.globalAlpha = 0.35;
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Draw arms and motors (second half of progress)
            const armProg = Math.max(0, (prog - 0.3) / 0.7);
            if (armProg > 0) {
                arms.forEach((arm, idx) => {
                    ctx.beginPath();
                    ctx.moveTo(arm[0][0], arm[0][1]);
                    const ex = arm[0][0] + (arm[1][0] - arm[0][0]) * armProg;
                    const ey = arm[0][1] + (arm[1][1] - arm[0][1]) * armProg;
                    ctx.lineTo(ex, ey);
                    ctx.strokeStyle = MUTED;
                    ctx.globalAlpha = 0.3 * armProg;
                    ctx.lineWidth = 1.5;
                    ctx.stroke();
                });

                // Motors (propeller circles)
                const motorProg = Math.max(0, (prog - 0.6) / 0.4);
                if (motorProg > 0) {
                    motorCenters.forEach(mc => {
                        ctx.beginPath();
                        ctx.arc(mc[0], mc[1], motorR * motorProg, 0, Math.PI * 2);
                        ctx.strokeStyle = ACCENT;
                        ctx.globalAlpha = 0.25 * motorProg;
                        ctx.lineWidth = 1;
                        ctx.setLineDash([4, 4]);
                        ctx.stroke();
                        ctx.setLineDash([]);

                        // Center dot
                        ctx.beginPath();
                        ctx.arc(mc[0], mc[1], 2, 0, Math.PI * 2);
                        ctx.fillStyle = ACCENT;
                        ctx.globalAlpha = 0.5 * motorProg;
                        ctx.fill();
                    });
                }
            }

            ctx.restore();
            ctx.globalAlpha = 1;
        }

        function drawScanLine() {
            const y = state.scanY * canvas.height;
            const gradient = ctx.createLinearGradient(0, y - 30, 0, y + 30);
            gradient.addColorStop(0, 'transparent');
            gradient.addColorStop(0.5, ACCENT);
            gradient.addColorStop(1, 'transparent');
            ctx.strokeStyle = gradient;
            ctx.globalAlpha = 0.08;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
            ctx.globalAlpha = 1;
        }

        // --- Animation Loop ---
        function render() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            drawParticles();
            drawHUD();
            drawDrone();
            drawScanLine();
            requestAnimationFrame(render);
        }
        requestAnimationFrame(render);
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