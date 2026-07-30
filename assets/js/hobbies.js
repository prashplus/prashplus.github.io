document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // 0. Scroll Progress Bar & Tracking
    // ==========================================
    const progressBar = document.getElementById('scroll-progress');
    let scrollProgress = 0;

    function updateScrollProgress() {
        const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
        if (totalHeight > 0) {
            scrollProgress = Math.min(Math.max(window.scrollY / totalHeight, 0), 1);
            if (progressBar) {
                progressBar.style.width = `${(scrollProgress * 100).toFixed(2)}%`;
            }
        }
    }
    window.addEventListener('scroll', updateScrollProgress, { passive: true });
    updateScrollProgress();

    // ==========================================
    // 1. Anime.js FPV Quadcopter Dissection Canvas Engine
    // ==========================================
    const droneCanvas = document.getElementById('drone-canvas-hobbies');
    if (droneCanvas) {
        const ctx = droneCanvas.getContext('2d');
        const ACCENT = '#56CCF2';
        const ACCENT_BLUE = '#3B82F6';
        const ACCENT_RED = '#EB5757';
        const ACCENT_YELLOW = '#F2C94C';

        function resizeDroneCanvas() {
            droneCanvas.width = window.innerWidth;
            droneCanvas.height = window.innerHeight;
        }
        resizeDroneCanvas();
        window.addEventListener('resize', resizeDroneCanvas);

        let propSpinAngle = 0;

        // Isometric Helper: 3D relative coords (x,y,z) to 2D canvas coords
        function projectIso(x, y, z, cx, cy, isoScale) {
            const isoX = cx + (x - y) * Math.cos(Math.PI / 6) * isoScale;
            const isoY = cy + (x + y) * Math.sin(Math.PI / 6) * isoScale - z * isoScale;
            return { x: isoX, y: isoY };
        }

        // Polygon Renderer for Isometric Plates
        function drawIsoPlate(ctx, cx, cy, w, h, thickness, zOffset, isoScale, strokeColor, fillColor, fillAlpha = 0.2) {
            const halfW = w / 2;
            const halfH = h / 2;

            const p1 = projectIso(-halfW, -halfH, zOffset + thickness, cx, cy, isoScale);
            const p2 = projectIso(halfW, -halfH, zOffset + thickness, cx, cy, isoScale);
            const p3 = projectIso(halfW, halfH, zOffset + thickness, cx, cy, isoScale);
            const p4 = projectIso(-halfW, halfH, zOffset + thickness, cx, cy, isoScale);

            const b1 = projectIso(-halfW, -halfH, zOffset, cx, cy, isoScale);
            const b4 = projectIso(-halfW, halfH, zOffset, cx, cy, isoScale);

            ctx.save();
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = 1.2;

            // Base Fill
            ctx.fillStyle = fillColor;
            ctx.globalAlpha = fillAlpha;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.lineTo(p3.x, p3.y); ctx.lineTo(p4.x, p4.y);
            ctx.closePath(); ctx.fill(); ctx.stroke();

            // Side edge
            ctx.globalAlpha = fillAlpha * 0.7;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y); ctx.lineTo(p4.x, p4.y); ctx.lineTo(b4.x, b4.y); ctx.lineTo(b1.x, b1.y);
            ctx.closePath(); ctx.fill(); ctx.stroke();

            ctx.restore();
            return { p1, p2, p3, p4 };
        }

        function renderDroneDissection() {
            ctx.clearRect(0, 0, droneCanvas.width, droneCanvas.height);

            const cx = droneCanvas.width > 992 ? droneCanvas.width * 0.72 : droneCanvas.width * 0.5;
            const cy = droneCanvas.height * 0.52;
            const isoScale = Math.min(droneCanvas.width, droneCanvas.height) * 0.0016 + 0.55;

            // Explosion offset gap driven by scrollProgress
            const explosionFactor = Math.min(scrollProgress * 2.6, 1.8);
            const gap = 85 * explosionFactor + 25;

            propSpinAngle += 0.08;

            // Define Drone Layers
            const droneLayers = [
                { name: 'CARBON FIBER MAIN FRAME & ARMS', z: 0, color: 'rgba(148, 163, 184, 0.9)' },
                { name: '4-IN-1 ESC STACK & BATTERY LEAD', z: gap, color: ACCENT_BLUE },
                { name: 'FLIGHT CONTROLLER & ELRS RECEIVER', z: gap * 2, color: ACCENT },
                { name: '5.8GHz ANALOG VTX & ANTENNA', z: gap * 3, color: ACCENT_YELLOW },
                { name: 'FPV CAMERA & CANOPY TIER', z: gap * 4, color: ACCENT_RED }
            ];

            // 1. Draw Arm Standoffs / Vertical Standoff Pins
            const armMotors = [[-110, -110], [110, -110], [110, 110], [-110, 110]];
            armMotors.forEach(m => {
                const bPt = projectIso(m[0], m[1], 0, cx, cy, isoScale);
                const tPt = projectIso(m[0], m[1], droneLayers[4].z + 10, cx, cy, isoScale);
                ctx.save();
                ctx.strokeStyle = 'rgba(86, 204, 242, 0.18)';
                ctx.lineWidth = 1;
                ctx.setLineDash([4, 4]);
                ctx.beginPath(); ctx.moveTo(bPt.x, bPt.y); ctx.lineTo(tPt.x, tPt.y); ctx.stroke();
                ctx.restore();
            });

            // 2. Render Layer 0: Carbon Fiber True-X Frame
            drawIsoPlate(ctx, cx, cy, 75, 140, 6, droneLayers[0].z, isoScale, '#94a3b8', 'rgba(30, 41, 59, 0.4)', 0.5);
            armMotors.forEach(m => {
                // Carbon Arms
                const center = projectIso(0, 0, droneLayers[0].z + 3, cx, cy, isoScale);
                const motorPt = projectIso(m[0], m[1], droneLayers[0].z + 3, cx, cy, isoScale);
                ctx.save();
                ctx.strokeStyle = 'rgba(148, 163, 184, 0.5)';
                ctx.lineWidth = 6 * isoScale;
                ctx.beginPath(); ctx.moveTo(center.x, center.y); ctx.lineTo(motorPt.x, motorPt.y); ctx.stroke();
                
                // Motor Mount Rings
                ctx.fillStyle = ACCENT;
                ctx.globalAlpha = 0.4;
                ctx.beginPath(); ctx.arc(motorPt.x, motorPt.y, 14 * isoScale, 0, Math.PI * 2); ctx.fill();
                ctx.restore();
            });

            // 3. Render Layer 1: 4-in-1 ESC Stack
            drawIsoPlate(ctx, cx, cy, 55, 55, 5, droneLayers[1].z, isoScale, ACCENT_BLUE, 'rgba(59, 130, 246, 0.3)', 0.4);
            // XT60 Battery Lead
            const batteryLead = projectIso(0, 45, droneLayers[1].z + 6, cx, cy, isoScale);
            ctx.save();
            ctx.fillStyle = ACCENT_YELLOW;
            ctx.fillRect(batteryLead.x - 6, batteryLead.y - 4, 12, 8);
            ctx.restore();

            // 4. Render Layer 2: SpeedyBee Flight Controller & RadioMaster ELRS Receiver
            drawIsoPlate(ctx, cx, cy, 55, 55, 5, droneLayers[2].z, isoScale, ACCENT, 'rgba(86, 204, 242, 0.4)', 0.5);
            // ELRS T-Antenna
            const elrsCenter = projectIso(0, -38, droneLayers[2].z + 8, cx, cy, isoScale);
            ctx.save();
            ctx.strokeStyle = ACCENT;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(elrsCenter.x - 15, elrsCenter.y); ctx.lineTo(elrsCenter.x + 15, elrsCenter.y);
            ctx.stroke();
            ctx.restore();

            // 5. Render Layer 3: 5.8GHz Analog VTX
            drawIsoPlate(ctx, cx, cy, 45, 35, 4, droneLayers[3].z, isoScale, ACCENT_YELLOW, 'rgba(242, 201, 76, 0.35)', 0.4);
            // Dipole Antenna
            const antBase = projectIso(0, -25, droneLayers[3].z + 6, cx, cy, isoScale);
            const antTop = projectIso(0, -55, droneLayers[3].z + 25, cx, cy, isoScale);
            ctx.save();
            ctx.strokeStyle = ACCENT_YELLOW;
            ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(antBase.x, antBase.y); ctx.lineTo(antTop.x, antTop.y); ctx.stroke();
            ctx.fillStyle = ACCENT_RED;
            ctx.beginPath(); ctx.arc(antTop.x, antTop.y, 4, 0, Math.PI * 2); ctx.fill();
            ctx.restore();

            // 6. Render Layer 4: FPV Camera & Canopy
            drawIsoPlate(ctx, cx, cy, 35, 40, 5, droneLayers[4].z, isoScale, ACCENT_RED, 'rgba(235, 87, 87, 0.4)', 0.5);
            // FPV Lens
            const lensPt = projectIso(0, -25, droneLayers[4].z + 8, cx, cy, isoScale);
            ctx.save();
            ctx.fillStyle = ACCENT;
            ctx.beginPath(); ctx.arc(lensPt.x, lensPt.y, 7 * isoScale, 0, Math.PI * 2); ctx.fill();
            ctx.restore();

            // 7. Render Brushless Motors & Rotating Propellers at Layer 1/2 height
            armMotors.forEach((m, idx) => {
                const motorZ = droneLayers[1].z + 12;
                const mPt = projectIso(m[0], m[1], motorZ, cx, cy, isoScale);
                
                // Motor Bell
                ctx.save();
                ctx.fillStyle = ACCENT;
                ctx.globalAlpha = 0.7;
                ctx.beginPath(); ctx.arc(mPt.x, mPt.y, 10 * isoScale, 0, Math.PI * 2); ctx.fill();

                // Rotating 3-Blade Propeller Blur
                const angleDir = idx % 2 === 0 ? propSpinAngle : -propSpinAngle;
                for (let b = 0; b < 3; b++) {
                    const bladeAngle = angleDir + (b * Math.PI * 2) / 3;
                    const bx = mPt.x + Math.cos(bladeAngle) * (35 * isoScale);
                    const by = mPt.y + Math.sin(bladeAngle) * (18 * isoScale);
                    
                    ctx.strokeStyle = 'rgba(86, 204, 242, 0.5)';
                    ctx.lineWidth = 3;
                    ctx.beginPath(); ctx.moveTo(mPt.x, mPt.y); ctx.lineTo(bx, by); ctx.stroke();
                }
                ctx.restore();
            });

            requestAnimationFrame(renderDroneDissection);
        }
        requestAnimationFrame(renderDroneDissection);
    }

    // ==========================================
    // 2. HUD Telemetry Section Observer
    // ==========================================
    const hudBadges = {
        'drone-hero': document.getElementById('hud-drone-hero'),
        'drones': document.getElementById('hud-drone-frame'),
        'extras': document.getElementById('hud-drone-extras')
    };

    const sectionHudObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const sectionId = entry.target.id;
                if (hudBadges['drone-hero']) hudBadges['drone-hero'].classList.toggle('active', sectionId === 'drone-hero');
                if (hudBadges['drones']) hudBadges['drones'].classList.toggle('active', sectionId === 'drones');
                if (hudBadges['extras']) hudBadges['extras'].classList.toggle('active', sectionId === 'extras');
            }
        });
    }, { threshold: 0.25 });

    document.querySelectorAll('header.section, section.section').forEach(sec => {
        sectionHudObserver.observe(sec);
    });

    // ==========================================
    // 3. Hero Entrance & Animations
    // ==========================================
    if (window.anime) {
        anime.timeline({ easing: 'easeOutExpo' })
            .add({
                targets: 'nav',
                translateY: [-50, 0],
                opacity: [0, 1],
                duration: 900
            })
            .add({
                targets: '.animate-hero',
                translateY: [20, 0],
                opacity: [0, 1],
                duration: 800,
                delay: anime.stagger(140)
            }, '-=400');
    }

    // ==========================================
    // 4. Typed.js Subtitle Effect
    // ==========================================
    if (window.Typed) {
        new Typed('.typed-drone-subtitle', {
            strings: [
                'Building custom FPV quadcopters from scratch.',
                '7" Long-Range • Bee35 Cinewhoop • 5" Freestyle.',
                'SpeedyBee F7/F405 • RadioMaster ELRS • Analog VTX.'
            ],
            typeSpeed: 36,
            backSpeed: 24,
            backDelay: 2200,
            loop: true,
            showCursor: true,
            cursorChar: '|'
        });
    }

    // ==========================================
    // 5. Scroll Intersection Observers
    // ==========================================
    const observerOptions = { root: null, rootMargin: '0px', threshold: 0.1 };

    const sectionObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                if (entry.target.classList.contains('section-title')) {
                    anime({
                        targets: entry.target,
                        opacity: [0, 1],
                        translateX: [-25, 0],
                        easing: 'easeOutQuart',
                        duration: 800
                    });
                }
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const listObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                let targetItems = entry.target.querySelectorAll('.animate-item, .skill-pill');
                if (targetItems.length > 0) {
                    anime({
                        targets: targetItems,
                        translateY: [35, 0],
                        opacity: [0, 1],
                        easing: 'easeOutElastic(1, .8)',
                        duration: 1000,
                        delay: anime.stagger(120)
                    });
                }
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.animate-title, .animate-item, .skill-pill').forEach(el => {
        el.style.opacity = '0';
    });

    document.querySelectorAll('.animate-title').forEach(el => sectionObserver.observe(el));
    document.getElementById('drone-builds-list') && listObserver.observe(document.getElementById('drone-builds-list'));
    document.getElementById('extras-list') && listObserver.observe(document.getElementById('extras-list'));

    // ==========================================
    // 6. Interactive 3D Card Tilt & Mouse Spotlight
    // ==========================================
    const droneCards = document.querySelectorAll('.drone-card');

    droneCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * -8;
            const rotateY = ((x - centerX) / centerX) * 8;

            card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-8px)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
        });
    });

});
