document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // 0. Scroll Progress Bar & Scroll Tracking
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
    // 1. Anime.js Exploded Hardware Dissection Canvas
    // ==========================================
    const disCanvas = document.getElementById('dissection-canvas');
    if (disCanvas) {
        const ctx = disCanvas.getContext('2d');
        const ACCENT = '#56CCF2';
        const ACCENT_BLUE = '#3B82F6';
        const ACCENT_PURPLE = '#8B5CF6';
        const ACCENT_RED = '#EB5757';

        function resizeDissection() {
            disCanvas.width = window.innerWidth;
            disCanvas.height = window.innerHeight;
        }
        resizeDissection();
        window.addEventListener('resize', resizeDissection);

        // Animated Pulse Data Particles moving across bus traces
        const dataPackets = [];
        for (let i = 0; i < 25; i++) {
            dataPackets.push({
                layer: i % 5,
                progress: Math.random(),
                speed: 0.003 + Math.random() * 0.005,
                track: Math.floor(Math.random() * 4)
            });
        }

        // Isometric Helper: Transforms 3D relative coordinates (x, y, z) into 2D canvas coordinates
        function projectIso(x, y, z, cx, cy, isoScale) {
            const isoX = cx + (x - y) * Math.cos(Math.PI / 6) * isoScale;
            const isoY = cy + (x + y) * Math.sin(Math.PI / 6) * isoScale - z * isoScale;
            return { x: isoX, y: isoY };
        }

        // Polygon Renderer for Isometric Boxes & Plates
        function drawIsoBlock(ctx, cx, cy, w, h, thickness, zOffset, isoScale, strokeColor, fillColor, fillAlpha = 0.15) {
            const halfW = w / 2;
            const halfH = h / 2;

            // Top surface corners
            const p1 = projectIso(-halfW, -halfH, zOffset + thickness, cx, cy, isoScale);
            const p2 = projectIso(halfW, -halfH, zOffset + thickness, cx, cy, isoScale);
            const p3 = projectIso(halfW, halfH, zOffset + thickness, cx, cy, isoScale);
            const p4 = projectIso(-halfW, halfH, zOffset + thickness, cx, cy, isoScale);

            // Bottom surface corners
            const b1 = projectIso(-halfW, -halfH, zOffset, cx, cy, isoScale);
            const b2 = projectIso(halfW, -halfH, zOffset, cx, cy, isoScale);
            const b3 = projectIso(halfW, halfH, zOffset, cx, cy, isoScale);
            const b4 = projectIso(-halfW, halfH, zOffset, cx, cy, isoScale);

            ctx.save();
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = 1.2;

            // Side faces
            ctx.fillStyle = fillColor;
            ctx.globalAlpha = fillAlpha * 0.6;
            
            // Left Face (p1-p4-b4-b1)
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y); ctx.lineTo(p4.x, p4.y); ctx.lineTo(b4.x, b4.y); ctx.lineTo(b1.x, b1.y);
            ctx.closePath(); ctx.fill(); ctx.stroke();

            // Right Face (p4-p3-b3-b4)
            ctx.beginPath();
            ctx.moveTo(p4.x, p4.y); ctx.lineTo(p3.x, p3.y); ctx.lineTo(b3.x, b3.y); ctx.lineTo(b4.x, b4.y);
            ctx.closePath(); ctx.fill(); ctx.stroke();

            // Top Face (p1-p2-p3-p4)
            ctx.globalAlpha = fillAlpha;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.lineTo(p3.x, p3.y); ctx.lineTo(p4.x, p4.y);
            ctx.closePath(); ctx.fill(); ctx.stroke();

            ctx.restore();
            return { p1, p2, p3, p4, b1, b2, b3, b4 };
        }

        // Draw exploded schematic layers
        function renderDissection() {
            ctx.clearRect(0, 0, disCanvas.width, disCanvas.height);

            // Anchor canvas positioning (right side on large screens, center on smaller screens)
            const cx = disCanvas.width > 992 ? disCanvas.width * 0.72 : disCanvas.width * 0.5;
            const cy = disCanvas.height * 0.52;
            const isoScale = Math.min(disCanvas.width, disCanvas.height) * 0.0017 + 0.55;

            // Base explosion gap derived from scrollProgress
            const explosionFactor = Math.min(scrollProgress * 2.5, 1.8);
            const layerGap = 80 * explosionFactor + 25;

            // Define Hardware Layers (bottom to top)
            const layers = [
                { name: 'CHASSIS BACKPLANE & PCIe BUS', z: 0, w: 260, h: 220, color: ACCENT_BLUE, fill: 'rgba(59, 130, 246, 0.12)' },
                { name: 'SILICON INTERPOSER & BUS TRACES', z: layerGap, w: 220, h: 180, color: ACCENT, fill: 'rgba(86, 204, 242, 0.15)' },
                { name: 'MULTI-CORE CPU TILE & L3 CACHE', z: layerGap * 2, w: 160, h: 140, color: ACCENT_PURPLE, fill: 'rgba(139, 92, 246, 0.18)' },
                { name: 'GPU CUDA MATRIX & HBM3 STACKS', z: layerGap * 3, w: 180, h: 150, color: ACCENT, fill: 'rgba(86, 204, 242, 0.2)' },
                { name: 'LIQUID COOLING HEATPLATE', z: layerGap * 4, w: 240, h: 200, color: ACCENT_RED, fill: 'rgba(235, 87, 87, 0.15)' }
            ];

            // Draw vertical explosion guide pins / corner pillars connecting the exploded layers
            const bottomZ = layers[0].z;
            const topZ = layers[4].z + 10;
            const cornerCoords = [
                { x: -120, y: -100 }, { x: 120, y: -100 },
                { x: 120, y: 100 }, { x: -120, y: 100 }
            ];

            cornerCoords.forEach(pt => {
                const botPt = projectIso(pt.x, pt.y, bottomZ, cx, cy, isoScale);
                const topPt = projectIso(pt.x, pt.y, topZ, cx, cy, isoScale);
                ctx.save();
                ctx.strokeStyle = 'rgba(86, 204, 242, 0.15)';
                ctx.lineWidth = 1;
                ctx.setLineDash([4, 4]);
                ctx.beginPath();
                ctx.moveTo(botPt.x, botPt.y);
                ctx.lineTo(topPt.x, topPt.y);
                ctx.stroke();
                ctx.restore();
            });

            // Draw Layers Bottom to Top
            layers.forEach((layer, idx) => {
                drawIsoBlock(ctx, cx, cy, layer.w, layer.h, 8, layer.z, isoScale, layer.color, layer.fill, 0.2);

                // Add component-specific schematics inside the layer
                ctx.save();
                if (idx === 0) { // PCIe Bus & Trace Lines
                    for (let line = -80; line <= 80; line += 20) {
                        const start = projectIso(-100, line, layer.z + 9, cx, cy, isoScale);
                        const end = projectIso(100, line, layer.z + 9, cx, cy, isoScale);
                        ctx.strokeStyle = 'rgba(59, 130, 246, 0.25)';
                        ctx.lineWidth = 0.8;
                        ctx.beginPath(); ctx.moveTo(start.x, start.y); ctx.lineTo(end.x, end.y); ctx.stroke();
                    }
                } else if (idx === 1) { // Silicon Interposer Grid
                    for (let gx = -70; gx <= 70; gx += 35) {
                        for (let gy = -50; gy <= 50; gy += 25) {
                            const p = projectIso(gx, gy, layer.z + 9, cx, cy, isoScale);
                            ctx.fillStyle = ACCENT;
                            ctx.globalAlpha = 0.4;
                            ctx.fillRect(p.x - 2, p.y - 2, 4, 4);
                        }
                    }
                } else if (idx === 2) { // CPU Core Clusters
                    const cores = [-40, 40];
                    cores.forEach(cxPos => {
                        cores.forEach(cyPos => {
                            drawIsoBlock(ctx, cx, cy, 35, 35, 4, layer.z + 9, isoScale, ACCENT_PURPLE, 'rgba(139, 92, 246, 0.4)', 0.5);
                        });
                    });
                } else if (idx === 3) { // GPU Tensor Tiles & HBM3 Stacked Memory
                    // GPU Core in Center
                    drawIsoBlock(ctx, cx, cy, 70, 70, 6, layer.z + 9, isoScale, ACCENT, 'rgba(86, 204, 242, 0.5)', 0.6);
                    // HBM Memory chips surrounding GPU
                    const hbmOffsets = [[-60, 0], [60, 0], [0, -50], [0, 50]];
                    hbmOffsets.forEach(off => {
                        const hbmCenter = projectIso(off[0], off[1], layer.z + 9, cx, cy, isoScale);
                        ctx.fillStyle = ACCENT_BLUE;
                        ctx.globalAlpha = 0.6;
                        ctx.fillRect(hbmCenter.x - 6, hbmCenter.y - 6, 12, 12);
                    });
                } else if (idx === 4) { // Heatplate Copper Pipes
                    for (let hp = -60; hp <= 60; hp += 30) {
                        const sPt = projectIso(hp, -80, layer.z + 9, cx, cy, isoScale);
                        const ePt = projectIso(hp, 80, layer.z + 9, cx, cy, isoScale);
                        ctx.strokeStyle = ACCENT_RED;
                        ctx.lineWidth = 2.5;
                        ctx.globalAlpha = 0.4;
                        ctx.beginPath(); ctx.moveTo(sPt.x, sPt.y); ctx.lineTo(ePt.x, ePt.y); ctx.stroke();
                    }
                }
                ctx.restore();

                // Draw Data Packets along layer perimeter
                dataPackets.filter(p => p.layer === idx).forEach(packet => {
                    packet.progress = (packet.progress + packet.speed) % 1;
                    const pathT = packet.progress * 4;
                    let px = 0, py = 0;
                    const hw = layer.w / 2, hh = layer.h / 2;
                    if (pathT < 1) { px = -hw + pathT * layer.w; py = -hh; }
                    else if (pathT < 2) { px = hw; py = -hh + (pathT - 1) * layer.h; }
                    else if (pathT < 3) { px = hw - (pathT - 2) * layer.w; py = hh; }
                    else { px = -hw; py = hh - (pathT - 3) * layer.h; }

                    const packPt = projectIso(px, py, layer.z + 10, cx, cy, isoScale);
                    ctx.save();
                    ctx.fillStyle = layer.color;
                    ctx.shadowColor = layer.color;
                    ctx.shadowBlur = 8;
                    ctx.beginPath();
                    ctx.arc(packPt.x, packPt.y, 2.5, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();
                });
            });

            requestAnimationFrame(renderDissection);
        }
        requestAnimationFrame(renderDissection);
    }

    // ==========================================
    // 2. HUD Telemetry Section Observer
    // ==========================================
    const hudBadges = {
        'hero': document.getElementById('hud-hero'),
        'about': document.getElementById('hud-about'),
        'experience': document.getElementById('hud-experience'),
        'projects': document.getElementById('hud-projects'),
        'contact': document.getElementById('hud-contact')
    };

    const sectionHudObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const sectionId = entry.target.id;
                Object.keys(hudBadges).forEach(key => {
                    if (hudBadges[key]) {
                        hudBadges[key].classList.toggle('active', key === sectionId);
                    }
                });
            }
        });
    }, { threshold: 0.3 });

    document.querySelectorAll('header.section, section.section').forEach(sec => {
        sectionHudObserver.observe(sec);
    });

    // ==========================================
    // 3. Initial Hero Entrance Animation
    // ==========================================
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

    // ==========================================
    // 4. Typed.js Subtitle Effect
    // ==========================================
    if (window.Typed) {
        new Typed('.typed-subtitle', {
            strings: [
                'I build things for the web and cloud.',
                'I architect resilient cloud infrastructure.',
                'I optimize large-scale distributed HPC systems.'
            ],
            typeSpeed: 38,
            backSpeed: 25,
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
                } else if (entry.target.classList.contains('glass-panel') && !entry.target.classList.contains('project-card')) {
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

    document.querySelectorAll('.animate-title, .animate-panel, .animate-item, .skill-pill').forEach(el => {
        el.style.opacity = '0';
    });

    document.querySelectorAll('.animate-title, .animate-panel').forEach(el => sectionObserver.observe(el));
    document.getElementById('experience-list') && listObserver.observe(document.getElementById('experience-list'));
    document.getElementById('projects-list') && listObserver.observe(document.getElementById('projects-list'));
    document.getElementById('skills-list') && listObserver.observe(document.getElementById('skills-list'));
    document.getElementById('extras-list') && listObserver.observe(document.getElementById('extras-list'));
    document.getElementById('contact-list') && listObserver.observe(document.getElementById('contact-list'));

    // ==========================================
    // 6. Interactive 3D Card Tilt & Mouse Spotlight
    // ==========================================
    const projectCards = document.querySelectorAll('.project-card');

    projectCards.forEach(card => {
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

    // ==========================================
    // 7. Interactive Project Category Filter
    // ==========================================
    const filterButtons = document.querySelectorAll('.filter-btn');

    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filterValue = btn.getAttribute('data-filter');

            projectCards.forEach(card => {
                const category = card.getAttribute('data-category');
                if (filterValue === 'all' || category === filterValue) {
                    card.style.display = 'flex';
                    anime({
                        targets: card,
                        scale: [0.85, 1],
                        opacity: [0, 1],
                        duration: 400,
                        easing: 'easeOutQuad'
                    });
                } else {
                    anime({
                        targets: card,
                        scale: [1, 0.85],
                        opacity: [1, 0],
                        duration: 300,
                        easing: 'easeInQuad',
                        complete: () => {
                            card.style.display = 'none';
                        }
                    });
                }
            });
        });
    });

});