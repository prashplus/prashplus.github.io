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
    // 1. Breathtaking 7-Layer FPV Drone Disassembly Canvas Engine
    // ==========================================
    const droneCanvas = document.getElementById('drone-canvas-hobbies');
    if (droneCanvas) {
        const ctx = droneCanvas.getContext('2d');

        // Color Palette
        const COL = {
            cyan: '#56CCF2',
            blue: '#3B82F6',
            purple: '#8B5CF6',
            red: '#EB5757',
            yellow: '#F2C94C',
            green: '#27AE60',
            copper: '#D4885A',
            gold: '#E6B74A',
            silver: '#94a3b8',
            carbon: '#2d3748',
            orange: '#F97316',
        };

        function resizeDroneCanvas() {
            droneCanvas.width = window.innerWidth;
            droneCanvas.height = window.innerHeight;
        }
        resizeDroneCanvas();
        window.addEventListener('resize', resizeDroneCanvas);

        let propSpinAngle = 0;
        let scanPhase = 0;
        let time = 0;

        // Signal flow particles (Receiver → FC → ESC → Motors)
        const signalParticles = [];
        for (let i = 0; i < 30; i++) {
            signalParticles.push({
                progress: Math.random(),
                speed: 0.003 + Math.random() * 0.004,
                path: Math.floor(Math.random() * 4), // 0-3 for each motor path
                size: 1.5 + Math.random() * 1.5,
            });
        }

        // RF wave rings from VTX antenna
        const rfWaves = [];
        for (let i = 0; i < 5; i++) {
            rfWaves.push({ phase: i * 0.2, speed: 0.008 });
        }

        // Power flow particles along ESC traces
        const powerParticles = [];
        for (let i = 0; i < 20; i++) {
            powerParticles.push({
                progress: Math.random(),
                speed: 0.004 + Math.random() * 0.003,
                arm: Math.floor(Math.random() * 4),
            });
        }

        // Isometric Projection
        function iso(x, y, z, cx, cy, s) {
            return {
                x: cx + (x - y) * Math.cos(Math.PI / 6) * s,
                y: cy + (x + y) * Math.sin(Math.PI / 6) * s - z * s
            };
        }

        // Draw isometric box with top, left-face, right-face
        function drawBox(cx, cy, w, h, t, z, s, stroke, fill, alpha) {
            const hw = w / 2, hh = h / 2;
            const p = [
                iso(-hw, -hh, z + t, cx, cy, s), iso(hw, -hh, z + t, cx, cy, s),
                iso(hw, hh, z + t, cx, cy, s),  iso(-hw, hh, z + t, cx, cy, s)
            ];
            const b = [
                iso(-hw, -hh, z, cx, cy, s), iso(hw, -hh, z, cx, cy, s),
                iso(hw, hh, z, cx, cy, s),   iso(-hw, hh, z, cx, cy, s)
            ];
            ctx.save();
            ctx.strokeStyle = stroke;
            ctx.lineWidth = 1;

            // Right face
            ctx.fillStyle = fill;
            ctx.globalAlpha = alpha * 0.5;
            ctx.beginPath();
            ctx.moveTo(p[1].x, p[1].y); ctx.lineTo(p[2].x, p[2].y);
            ctx.lineTo(b[2].x, b[2].y); ctx.lineTo(b[1].x, b[1].y);
            ctx.closePath(); ctx.fill(); ctx.stroke();

            // Left face
            ctx.globalAlpha = alpha * 0.4;
            ctx.beginPath();
            ctx.moveTo(p[3].x, p[3].y); ctx.lineTo(p[2].x, p[2].y);
            ctx.lineTo(b[2].x, b[2].y); ctx.lineTo(b[3].x, b[3].y);
            ctx.closePath(); ctx.fill(); ctx.stroke();

            // Top face
            ctx.globalAlpha = alpha;
            ctx.beginPath();
            ctx.moveTo(p[0].x, p[0].y); ctx.lineTo(p[1].x, p[1].y);
            ctx.lineTo(p[2].x, p[2].y); ctx.lineTo(p[3].x, p[3].y);
            ctx.closePath(); ctx.fill(); ctx.stroke();

            ctx.restore();
            return p;
        }

        // Draw offset box
        function drawOffsetBox(cx, cy, ox, oy, w, h, t, z, s, stroke, fill, alpha) {
            const off = iso(ox, oy, 0, 0, 0, s);
            return drawBox(cx + off.x, cy + off.y, w, h, t, z, s, stroke, fill, alpha);
        }

        // Draw carbon fiber weave texture pattern
        function drawCarbonWeave(cx, cy, z, s, w, h) {
            ctx.save();
            ctx.globalAlpha = 0.15;
            const spacing = 6;
            // Diagonal lines (two directions to create weave)
            ctx.strokeStyle = 'rgba(100, 116, 139, 0.4)';
            ctx.lineWidth = 0.5;
            for (let d = -w; d <= w; d += spacing) {
                // Direction 1: top-left to bottom-right
                const a1 = iso(d - h / 2, -h / 2, z, cx, cy, s);
                const b1 = iso(d + h / 2, h / 2, z, cx, cy, s);
                ctx.beginPath(); ctx.moveTo(a1.x, a1.y); ctx.lineTo(b1.x, b1.y); ctx.stroke();
                // Direction 2: top-right to bottom-left
                const a2 = iso(-d + h / 2, -h / 2, z, cx, cy, s);
                const b2 = iso(-d - h / 2, h / 2, z, cx, cy, s);
                ctx.beginPath(); ctx.moveTo(a2.x, a2.y); ctx.lineTo(b2.x, b2.y); ctx.stroke();
            }
            ctx.restore();
        }

        // Draw motor stator with copper windings
        function drawMotorStator(cx, cy, mx, my, z, s, heatGlow) {
            const mPt = iso(mx, my, z, cx, cy, s);

            // Stator iron ring
            ctx.save();
            ctx.strokeStyle = COL.silver;
            ctx.lineWidth = 2 * s;
            ctx.globalAlpha = 0.5;
            ctx.beginPath(); ctx.arc(mPt.x, mPt.y, 16 * s, 0, Math.PI * 2); ctx.stroke();

            // Copper windings (tooth segments around stator)
            for (let w = 0; w < 12; w++) {
                const angle = (w / 12) * Math.PI * 2;
                const wx = mPt.x + Math.cos(angle) * 12 * s;
                const wy = mPt.y + Math.sin(angle) * 8 * s;
                ctx.fillStyle = COL.copper;
                ctx.globalAlpha = 0.5 + Math.sin(time * 2 + w) * 0.15;
                ctx.beginPath(); ctx.arc(wx, wy, 2.5 * s, 0, Math.PI * 2); ctx.fill();
            }

            // Bearing center
            ctx.fillStyle = COL.silver;
            ctx.globalAlpha = 0.6;
            ctx.beginPath(); ctx.arc(mPt.x, mPt.y, 3 * s, 0, Math.PI * 2); ctx.fill();

            // Shaft
            ctx.strokeStyle = COL.silver;
            ctx.lineWidth = 1.5 * s;
            ctx.globalAlpha = 0.5;
            ctx.beginPath(); ctx.moveTo(mPt.x, mPt.y - 5 * s); ctx.lineTo(mPt.x, mPt.y + 5 * s); ctx.stroke();

            // Heat glow on stator
            if (heatGlow) {
                ctx.globalAlpha = 0.12 + Math.sin(time * 1.5) * 0.05;
                const heatGrad = ctx.createRadialGradient(mPt.x, mPt.y, 0, mPt.x, mPt.y, 20 * s);
                heatGrad.addColorStop(0, 'rgba(249, 115, 22, 0.3)');
                heatGrad.addColorStop(1, 'rgba(249, 115, 22, 0)');
                ctx.fillStyle = heatGrad;
                ctx.fillRect(mPt.x - 20 * s, mPt.y - 15 * s, 40 * s, 30 * s);
            }

            ctx.restore();
            return mPt;
        }

        // Draw spinning propeller with motion blur
        function drawPropeller(cx, cy, mx, my, z, s, spinAngle, direction) {
            const mPt = iso(mx, my, z, cx, cy, s);

            ctx.save();
            // Motion blur ring
            ctx.strokeStyle = 'rgba(86, 204, 242, 0.08)';
            ctx.lineWidth = 12 * s;
            ctx.beginPath(); ctx.arc(mPt.x, mPt.y, 32 * s, 0, Math.PI * 2); ctx.stroke();

            // 3 blades
            const dir = direction ? spinAngle : -spinAngle;
            for (let b = 0; b < 3; b++) {
                const bladeAngle = dir + (b * Math.PI * 2) / 3;
                const tipX = mPt.x + Math.cos(bladeAngle) * 38 * s;
                const tipY = mPt.y + Math.sin(bladeAngle) * 20 * s;

                // Blade body
                ctx.strokeStyle = 'rgba(86, 204, 242, 0.45)';
                ctx.lineWidth = 3.5 * s;
                ctx.beginPath(); ctx.moveTo(mPt.x, mPt.y); ctx.lineTo(tipX, tipY); ctx.stroke();

                // Blade edge highlight
                ctx.strokeStyle = 'rgba(86, 204, 242, 0.15)';
                ctx.lineWidth = 6 * s;
                ctx.beginPath(); ctx.moveTo(mPt.x, mPt.y); ctx.lineTo(tipX, tipY); ctx.stroke();

                // Blade tip glow
                ctx.fillStyle = COL.cyan;
                ctx.globalAlpha = 0.3;
                ctx.beginPath(); ctx.arc(tipX, tipY, 2 * s, 0, Math.PI * 2); ctx.fill();
            }

            // Motor bell cap
            ctx.fillStyle = COL.cyan;
            ctx.globalAlpha = 0.6;
            ctx.beginPath(); ctx.arc(mPt.x, mPt.y, 6 * s, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = COL.silver;
            ctx.lineWidth = 1;
            ctx.globalAlpha = 0.4;
            ctx.stroke();

            ctx.restore();
        }

        // Draw rubber grommets (vibration damping)
        function drawGrommets(cx, cy, z, s, positions) {
            ctx.save();
            positions.forEach(pos => {
                const pt = iso(pos[0], pos[1], z, cx, cy, s);
                // Rubber ring
                ctx.strokeStyle = '#e11d48';
                ctx.lineWidth = 2 * s;
                ctx.globalAlpha = 0.4;
                ctx.beginPath(); ctx.arc(pt.x, pt.y, 3.5 * s, 0, Math.PI * 2); ctx.stroke();
                // Soft center
                ctx.fillStyle = 'rgba(225, 29, 72, 0.2)';
                ctx.beginPath(); ctx.arc(pt.x, pt.y, 2 * s, 0, Math.PI * 2); ctx.fill();
            });
            ctx.restore();
        }

        // Draw RF signal wave rings
        function drawRFWaves(cx, cy, x, y, z, s) {
            ctx.save();
            const antPt = iso(x, y, z, cx, cy, s);
            rfWaves.forEach(wave => {
                wave.phase = (wave.phase + wave.speed) % 1;
                const radius = wave.phase * 50 * s;
                const alpha = (1 - wave.phase) * 0.3;
                ctx.strokeStyle = COL.yellow;
                ctx.lineWidth = 1.5;
                ctx.globalAlpha = alpha;
                ctx.beginPath();
                ctx.ellipse(antPt.x, antPt.y, radius, radius * 0.5, 0, 0, Math.PI * 2);
                ctx.stroke();
            });
            ctx.restore();
        }

        // Draw solder pads
        function drawSolderPads(cx, cy, z, s, positions, color) {
            ctx.save();
            ctx.fillStyle = color;
            ctx.globalAlpha = 0.5;
            positions.forEach(pos => {
                const pt = iso(pos[0], pos[1], z, cx, cy, s);
                ctx.beginPath();
                ctx.arc(pt.x, pt.y, 1.8 * s, 0, Math.PI * 2);
                ctx.fill();
            });
            ctx.restore();
        }

        // Draw IC chip package
        function drawIC(cx, cy, ox, oy, z, s, w, h, label, color) {
            const off = iso(ox, oy, 0, 0, 0, s);
            const chipCenter = { x: cx + off.x, y: cy + off.y };

            ctx.save();
            // Chip body
            ctx.fillStyle = '#0f172a';
            ctx.globalAlpha = 0.8;
            const cw = w * s, ch = h * s * 0.6;
            ctx.fillRect(chipCenter.x - cw / 2, chipCenter.y - ch / 2, cw, ch);

            // Chip border
            ctx.strokeStyle = color;
            ctx.lineWidth = 0.8;
            ctx.globalAlpha = 0.6;
            ctx.strokeRect(chipCenter.x - cw / 2, chipCenter.y - ch / 2, cw, ch);

            // Pin 1 dot
            ctx.fillStyle = color;
            ctx.globalAlpha = 0.5;
            ctx.beginPath();
            ctx.arc(chipCenter.x - cw / 2 + 3, chipCenter.y - ch / 2 + 3, 1.5, 0, Math.PI * 2);
            ctx.fill();

            // Label
            if (label && s > 0.6) {
                ctx.fillStyle = color;
                ctx.globalAlpha = 0.4;
                ctx.font = `${Math.max(6, 7 * s)}px "Space Grotesk", monospace`;
                ctx.fillText(label, chipCenter.x - cw / 2 + 2, chipCenter.y + 2);
            }

            // Legs/pins on sides
            ctx.strokeStyle = COL.gold;
            ctx.lineWidth = 0.5;
            ctx.globalAlpha = 0.4;
            const pinCount = Math.floor(w / 4);
            for (let p = 0; p < pinCount; p++) {
                const px = chipCenter.x - cw / 2 + (p + 0.5) * (cw / pinCount);
                ctx.beginPath(); ctx.moveTo(px, chipCenter.y - ch / 2); ctx.lineTo(px, chipCenter.y - ch / 2 - 3 * s); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(px, chipCenter.y + ch / 2); ctx.lineTo(px, chipCenter.y + ch / 2 + 3 * s); ctx.stroke();
            }

            ctx.restore();
        }

        // Main render loop
        function renderDroneDissection() {
            ctx.clearRect(0, 0, droneCanvas.width, droneCanvas.height);
            time += 0.016;
            propSpinAngle += 0.1;
            scanPhase = (scanPhase + 0.003) % 1;

            const cx = droneCanvas.width > 992 ? droneCanvas.width * 0.7 : droneCanvas.width * 0.5;
            const cy = droneCanvas.height * 0.5;
            const s = Math.min(droneCanvas.width, droneCanvas.height) * 0.0015 + 0.5;

            const ef = Math.min(scrollProgress * 2.8, 1.9);
            const gap = 65 * ef + 18;

            // 7 Layer Z positions
            const Z = [0, gap, gap * 2, gap * 3, gap * 4, gap * 5, gap * 6];

            // Motor arm positions (True-X geometry)
            const armTips = [[-120, -120], [120, -120], [120, 120], [-120, 120]];

            // Vertical guide standoffs
            armTips.forEach(pt => {
                const a = iso(pt[0], pt[1], Z[0], cx, cy, s);
                const b = iso(pt[0], pt[1], Z[6] + 15, cx, cy, s);
                ctx.save();
                ctx.strokeStyle = 'rgba(86, 204, 242, 0.08)';
                ctx.lineWidth = 0.8;
                ctx.setLineDash([3, 6]);
                ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
                ctx.restore();
            });
            // Center standoffs
            [[-18, -18], [18, -18], [18, 18], [-18, 18]].forEach(pt => {
                const a = iso(pt[0], pt[1], Z[0] + 6, cx, cy, s);
                const b = iso(pt[0], pt[1], Z[6], cx, cy, s);
                ctx.save();
                ctx.strokeStyle = 'rgba(148, 163, 184, 0.12)';
                ctx.lineWidth = 1.5;
                ctx.setLineDash([2, 4]);
                ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
                ctx.restore();
            });

            // ─── LAYER 0: CARBON FIBER FRAME PLATE (BOTTOM) ───
            // Main center plate
            drawBox(cx, cy, 80, 150, 5, Z[0], s, COL.silver, 'rgba(30, 41, 59, 0.6)', 0.35);
            drawCarbonWeave(cx, cy, Z[0] + 6, s, 80, 150);

            // Arms extending to motor mounts
            armTips.forEach(arm => {
                const center = iso(0, 0, Z[0] + 3, cx, cy, s);
                const tip = iso(arm[0], arm[1], Z[0] + 3, cx, cy, s);
                ctx.save();
                // Arm body
                ctx.strokeStyle = 'rgba(148, 163, 184, 0.5)';
                ctx.lineWidth = 7 * s;
                ctx.beginPath(); ctx.moveTo(center.x, center.y); ctx.lineTo(tip.x, tip.y); ctx.stroke();
                // Arm carbon texture overlay
                ctx.strokeStyle = 'rgba(100, 116, 139, 0.2)';
                ctx.lineWidth = 5 * s;
                ctx.setLineDash([2, 3]);
                ctx.beginPath(); ctx.moveTo(center.x, center.y); ctx.lineTo(tip.x, tip.y); ctx.stroke();
                ctx.restore();
            });

            // Motor mount rings on frame
            armTips.forEach(arm => {
                const pt = iso(arm[0], arm[1], Z[0] + 6, cx, cy, s);
                ctx.save();
                ctx.strokeStyle = COL.silver;
                ctx.lineWidth = 1.5;
                ctx.globalAlpha = 0.4;
                ctx.beginPath(); ctx.arc(pt.x, pt.y, 18 * s, 0, Math.PI * 2); ctx.stroke();
                // Mounting holes (4 per motor)
                for (let mh = 0; mh < 4; mh++) {
                    const angle = (mh / 4) * Math.PI * 2 + Math.PI / 4;
                    const hx = pt.x + Math.cos(angle) * 14 * s;
                    const hy = pt.y + Math.sin(angle) * 9 * s;
                    ctx.fillStyle = 'rgba(5, 5, 16, 0.5)';
                    ctx.globalAlpha = 0.5;
                    ctx.beginPath(); ctx.arc(hx, hy, 1.5 * s, 0, Math.PI * 2); ctx.fill();
                }
                ctx.restore();
            });

            // Battery strap slots
            [[-25, 0], [25, 0]].forEach(slot => {
                const pt = iso(slot[0], slot[1], Z[0] + 6, cx, cy, s);
                ctx.save();
                ctx.fillStyle = 'rgba(5, 5, 16, 0.6)';
                ctx.globalAlpha = 0.4;
                ctx.fillRect(pt.x - 1.5 * s, pt.y - 6 * s, 3 * s, 12 * s);
                ctx.restore();
            });

            // Hex standoff holes on center plate
            [[-20, -20], [20, -20], [20, 20], [-20, 20]].forEach(hole => {
                const pt = iso(hole[0], hole[1], Z[0] + 6, cx, cy, s);
                ctx.save();
                ctx.strokeStyle = COL.gold;
                ctx.lineWidth = 1;
                ctx.globalAlpha = 0.5;
                // Hex shape
                ctx.beginPath();
                for (let i = 0; i < 6; i++) {
                    const angle = (i / 6) * Math.PI * 2;
                    const hx = pt.x + Math.cos(angle) * 3 * s;
                    const hy = pt.y + Math.sin(angle) * 2 * s;
                    if (i === 0) ctx.moveTo(hx, hy); else ctx.lineTo(hx, hy);
                }
                ctx.closePath(); ctx.stroke();
                ctx.restore();
            });

            // ─── LAYER 1: MOTOR BELLS & STATOR ASSEMBLIES ───
            armTips.forEach((arm, idx) => {
                drawMotorStator(cx, cy, arm[0], arm[1], Z[1], s, true);
            });
            // Motor labels
            if (s > 0.6) {
                armTips.forEach((arm, idx) => {
                    const lPt = iso(arm[0], arm[1] + 25, Z[1] + 5, cx, cy, s);
                    ctx.save();
                    ctx.fillStyle = COL.silver;
                    ctx.globalAlpha = 0.3;
                    ctx.font = `${Math.max(6, 7 * s)}px "Space Grotesk", monospace`;
                    ctx.fillText(`M${idx + 1}`, lPt.x - 5, lPt.y);
                    ctx.restore();
                });
            }

            // ─── LAYER 2: 4-IN-1 ESC STACK ───
            drawBox(cx, cy, 55, 55, 5, Z[2], s, COL.blue, 'rgba(59, 130, 246, 0.35)', 0.35);
            // MOSFET arrays (8 on ESC board)
            const mosfetPositions = [
                [-18, -18], [-6, -18], [6, -18], [18, -18],
                [-18, 18], [-6, 18], [6, 18], [18, 18],
            ];
            mosfetPositions.forEach(pos => {
                const pt = iso(pos[0], pos[1], Z[2] + 6, cx, cy, s);
                ctx.save();
                ctx.fillStyle = '#0f172a';
                ctx.globalAlpha = 0.7;
                ctx.fillRect(pt.x - 3 * s, pt.y - 2 * s, 6 * s, 4 * s);
                // Heat glow
                ctx.globalAlpha = 0.08 + Math.sin(time * 2 + pos[0]) * 0.04;
                ctx.fillStyle = COL.orange;
                ctx.fillRect(pt.x - 4 * s, pt.y - 3 * s, 8 * s, 6 * s);
                ctx.restore();
            });
            // Capacitor bank
            [[-22, 0], [22, 0]].forEach(cap => {
                const pt = iso(cap[0], cap[1], Z[2] + 6, cx, cy, s);
                ctx.save();
                ctx.fillStyle = COL.silver;
                ctx.globalAlpha = 0.5;
                ctx.beginPath(); ctx.arc(pt.x, pt.y, 3.5 * s, 0, Math.PI * 2); ctx.fill();
                ctx.strokeStyle = COL.silver;
                ctx.lineWidth = 0.5;
                ctx.stroke();
                ctx.restore();
            });
            // Current shunt resistor
            const shuntPt = iso(0, -24, Z[2] + 6, cx, cy, s);
            ctx.save();
            ctx.fillStyle = '#1e293b';
            ctx.globalAlpha = 0.6;
            ctx.fillRect(shuntPt.x - 5 * s, shuntPt.y - 1.5 * s, 10 * s, 3 * s);
            ctx.restore();
            // XT60 power connector
            drawOffsetBox(cx, cy, 0, 32, 12, 8, 5, Z[2] + 6, s, COL.yellow, 'rgba(242, 201, 76, 0.5)', 0.5);
            const xt60Label = iso(0, 40, Z[2] + 12, cx, cy, s);
            ctx.save();
            ctx.fillStyle = COL.yellow;
            ctx.globalAlpha = 0.35;
            if (s > 0.6) {
                ctx.font = `${Math.max(6, 7 * s)}px "Space Grotesk", monospace`;
                ctx.fillText('XT60', xt60Label.x - 8, xt60Label.y);
            }
            ctx.restore();
            // Power distribution traces to arms
            armTips.forEach(arm => {
                ctx.save();
                ctx.strokeStyle = COL.red;
                ctx.lineWidth = 1;
                ctx.globalAlpha = 0.2;
                const from = iso(0, 0, Z[2] + 6, cx, cy, s);
                const to = iso(arm[0] * 0.3, arm[1] * 0.3, Z[2] + 6, cx, cy, s);
                ctx.beginPath(); ctx.moveTo(from.x, from.y); ctx.lineTo(to.x, to.y); ctx.stroke();
                ctx.restore();
            });

            // Vibration damping grommets (between ESC stack and FC)
            drawGrommets(cx, cy, Z[2] + 5, s, [[-20, -20], [20, -20], [20, 20], [-20, 20]]);

            // ─── LAYER 3: FLIGHT CONTROLLER BOARD ───
            drawBox(cx, cy, 55, 55, 4, Z[3], s, COL.cyan, 'rgba(86, 204, 242, 0.35)', 0.35);
            // STM32 Processor IC
            drawIC(cx, cy, 0, 0, Z[3] + 5, s, 18, 14, 'STM32', COL.cyan);
            // Gyroscope/Accelerometer IC
            drawIC(cx, cy, -18, -12, Z[3] + 5, s, 10, 8, 'IMU', COL.purple);
            // Barometer
            drawIC(cx, cy, 18, -12, Z[3] + 5, s, 8, 7, 'BARO', COL.green);
            // UART pads
            drawSolderPads(cx, cy, Z[3] + 5, s, [
                [24, -5], [24, 0], [24, 5], [24, 10],   // UART1
                [-24, -5], [-24, 0], [-24, 5], [-24, 10], // UART2
            ], COL.gold);
            // USB port
            drawOffsetBox(cx, cy, 0, -28, 10, 5, 3, Z[3] + 5, s, COL.silver, 'rgba(148, 163, 184, 0.4)', 0.4);
            // SD card slot
            drawOffsetBox(cx, cy, 18, 18, 12, 10, 2, Z[3] + 5, s, COL.silver, 'rgba(148, 163, 184, 0.3)', 0.3);
            // Board traces
            ctx.save();
            ctx.strokeStyle = COL.copper;
            ctx.lineWidth = 0.4;
            ctx.globalAlpha = 0.2;
            for (let t = -22; t <= 22; t += 5) {
                const a = iso(t, -25, Z[3] + 5, cx, cy, s);
                const b = iso(t, 25, Z[3] + 5, cx, cy, s);
                ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
            }
            ctx.restore();
            // ELRS Receiver module (tiny)
            drawOffsetBox(cx, cy, -18, 18, 10, 8, 2, Z[3] + 5, s, COL.cyan, 'rgba(86, 204, 242, 0.4)', 0.4);
            // ELRS T-Antenna wire
            const elrsBase = iso(-18, -28, Z[3] + 8, cx, cy, s);
            const elrsEnd1 = iso(-30, -38, Z[3] + 12, cx, cy, s);
            const elrsEnd2 = iso(-6, -38, Z[3] + 12, cx, cy, s);
            ctx.save();
            ctx.strokeStyle = COL.cyan;
            ctx.lineWidth = 1.5;
            ctx.globalAlpha = 0.4;
            ctx.beginPath();
            ctx.moveTo(elrsBase.x, elrsBase.y);
            ctx.lineTo((elrsEnd1.x + elrsEnd2.x) / 2, (elrsEnd1.y + elrsEnd2.y) / 2);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(elrsEnd1.x, elrsEnd1.y);
            ctx.lineTo(elrsEnd2.x, elrsEnd2.y);
            ctx.stroke();
            ctx.restore();

            // ─── LAYER 4: VTX MODULE & ANTENNA ───
            drawBox(cx, cy, 38, 30, 4, Z[4], s, COL.yellow, 'rgba(242, 201, 76, 0.3)', 0.3);
            // RF shielding can
            drawOffsetBox(cx, cy, 0, 0, 24, 18, 5, Z[4] + 5, s, COL.silver, 'rgba(148, 163, 184, 0.4)', 0.4);
            // SMA connector
            const smaPt = iso(0, -18, Z[4] + 8, cx, cy, s);
            ctx.save();
            ctx.fillStyle = COL.gold;
            ctx.globalAlpha = 0.6;
            ctx.beginPath(); ctx.arc(smaPt.x, smaPt.y, 3 * s, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = COL.gold;
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.restore();
            // Antenna mast (pigtail cable + RHCP cloverleaf)
            const antBase = iso(0, -20, Z[4] + 10, cx, cy, s);
            const antTop = iso(0, -45, Z[4] + 40, cx, cy, s);
            ctx.save();
            ctx.strokeStyle = '#1e293b';
            ctx.lineWidth = 2;
            ctx.globalAlpha = 0.5;
            ctx.beginPath(); ctx.moveTo(antBase.x, antBase.y); ctx.lineTo(antTop.x, antTop.y); ctx.stroke();
            ctx.restore();
            // RHCP Cloverleaf antenna lobes (4 lobes)
            for (let lobe = 0; lobe < 4; lobe++) {
                const angle = (lobe / 4) * Math.PI * 2 + time * 0.3;
                const lx = antTop.x + Math.cos(angle) * 10 * s;
                const ly = antTop.y + Math.sin(angle) * 6 * s;
                ctx.save();
                ctx.strokeStyle = COL.yellow;
                ctx.lineWidth = 1.5;
                ctx.globalAlpha = 0.5;
                ctx.beginPath();
                ctx.moveTo(antTop.x, antTop.y);
                ctx.quadraticCurveTo(lx + 3, ly - 5, lx, ly);
                ctx.stroke();
                ctx.restore();
            }
            // Antenna tip
            ctx.save();
            ctx.fillStyle = COL.red;
            ctx.globalAlpha = 0.6;
            ctx.beginPath(); ctx.arc(antTop.x, antTop.y, 3 * s, 0, Math.PI * 2); ctx.fill();
            ctx.restore();
            // RF signal wave rings
            drawRFWaves(cx, cy, 0, -50, Z[4] + 45, s);
            // VTX label
            if (s > 0.6) {
                const vtxLabel = iso(0, 18, Z[4] + 5, cx, cy, s);
                ctx.save();
                ctx.fillStyle = COL.yellow;
                ctx.globalAlpha = 0.35;
                ctx.font = `${Math.max(6, 7 * s)}px "Space Grotesk", monospace`;
                ctx.fillText('800mW VTX', vtxLabel.x - 18, vtxLabel.y);
                ctx.restore();
            }

            // ─── LAYER 5: FPV CAMERA & TILT MOUNT ───
            drawBox(cx, cy, 30, 30, 5, Z[5], s, COL.red, 'rgba(235, 87, 87, 0.35)', 0.35);
            // Camera module body
            drawOffsetBox(cx, cy, 0, 0, 22, 18, 8, Z[5] + 6, s, '#1e293b', 'rgba(30, 41, 59, 0.7)', 0.6);
            // CMOS sensor (visible through glass)
            const sensorPt = iso(0, 0, Z[5] + 15, cx, cy, s);
            ctx.save();
            ctx.fillStyle = '#312e81';
            ctx.globalAlpha = 0.5;
            ctx.fillRect(sensorPt.x - 5 * s, sensorPt.y - 3.5 * s, 10 * s, 7 * s);
            // Sensor pixel grid
            ctx.strokeStyle = COL.purple;
            ctx.lineWidth = 0.3;
            ctx.globalAlpha = 0.3;
            for (let px = -4; px <= 4; px += 2) {
                for (let py = -3; py <= 3; py += 2) {
                    const pp = iso(px, py, Z[5] + 16, cx, cy, s);
                    ctx.strokeRect(pp.x - 0.5 * s, pp.y - 0.4 * s, 1 * s, 0.8 * s);
                }
            }
            ctx.restore();
            // Lens assembly (circular rings)
            const lensPt = iso(0, -16, Z[5] + 12, cx, cy, s);
            ctx.save();
            [10, 7, 4].forEach((r, i) => {
                ctx.strokeStyle = i === 2 ? COL.cyan : COL.silver;
                ctx.lineWidth = 1.2;
                ctx.globalAlpha = 0.3 + i * 0.1;
                ctx.beginPath(); ctx.arc(lensPt.x, lensPt.y, r * s, 0, Math.PI * 2); ctx.stroke();
            });
            // Lens glass highlight
            ctx.fillStyle = 'rgba(86, 204, 242, 0.2)';
            ctx.globalAlpha = 0.4;
            ctx.beginPath(); ctx.arc(lensPt.x, lensPt.y, 3 * s, 0, Math.PI * 2); ctx.fill();
            ctx.restore();
            // Tilt bracket arms
            const bracketL = iso(-16, -8, Z[5] + 6, cx, cy, s);
            const bracketR = iso(16, -8, Z[5] + 6, cx, cy, s);
            const bracketPivotL = iso(-14, -16, Z[5] + 12, cx, cy, s);
            const bracketPivotR = iso(14, -16, Z[5] + 12, cx, cy, s);
            ctx.save();
            ctx.strokeStyle = COL.silver;
            ctx.lineWidth = 1.5;
            ctx.globalAlpha = 0.4;
            ctx.beginPath(); ctx.moveTo(bracketL.x, bracketL.y); ctx.lineTo(bracketPivotL.x, bracketPivotL.y); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(bracketR.x, bracketR.y); ctx.lineTo(bracketPivotR.x, bracketPivotR.y); ctx.stroke();
            // Adjustment screws
            [bracketPivotL, bracketPivotR].forEach(pt => {
                ctx.fillStyle = COL.silver;
                ctx.globalAlpha = 0.5;
                ctx.beginPath(); ctx.arc(pt.x, pt.y, 2 * s, 0, Math.PI * 2); ctx.fill();
            });
            ctx.restore();

            // ─── LAYER 6: TOP PLATE & CANOPY ───
            // Top carbon plate
            drawBox(cx, cy, 75, 140, 3, Z[6], s, COL.silver, 'rgba(30, 41, 59, 0.4)', 0.2);
            drawCarbonWeave(cx, cy, Z[6] + 4, s, 75, 140);
            // GoPro mount tabs
            [[-12, -55], [12, -55]].forEach(tab => {
                drawOffsetBox(cx, cy, tab[0], tab[1], 8, 12, 4, Z[6] + 4, s,
                    COL.silver, 'rgba(148, 163, 184, 0.3)', 0.3);
                // Mount bolt hole
                const holePt = iso(tab[0], tab[1], Z[6] + 9, cx, cy, s);
                ctx.save();
                ctx.strokeStyle = COL.silver;
                ctx.lineWidth = 0.8;
                ctx.globalAlpha = 0.5;
                ctx.beginPath(); ctx.arc(holePt.x, holePt.y, 2 * s, 0, Math.PI * 2); ctx.stroke();
                ctx.restore();
            });
            // TPU Canopy outline (curved shell)
            ctx.save();
            ctx.strokeStyle = COL.red;
            ctx.lineWidth = 1.5;
            ctx.globalAlpha = 0.25;
            const canopyPoints = [
                iso(-30, -50, Z[6] + 8, cx, cy, s),
                iso(-35, -20, Z[6] + 18, cx, cy, s),
                iso(-30, 20, Z[6] + 15, cx, cy, s),
                iso(-20, 40, Z[6] + 8, cx, cy, s),
                iso(20, 40, Z[6] + 8, cx, cy, s),
                iso(30, 20, Z[6] + 15, cx, cy, s),
                iso(35, -20, Z[6] + 18, cx, cy, s),
                iso(30, -50, Z[6] + 8, cx, cy, s),
            ];
            ctx.beginPath();
            ctx.moveTo(canopyPoints[0].x, canopyPoints[0].y);
            for (let i = 1; i < canopyPoints.length; i++) {
                const prev = canopyPoints[i - 1];
                const curr = canopyPoints[i];
                const cpx = (prev.x + curr.x) / 2;
                const cpy = Math.min(prev.y, curr.y) - 5;
                ctx.quadraticCurveTo(cpx, cpy, curr.x, curr.y);
            }
            ctx.closePath();
            ctx.stroke();
            // Ventilation cutouts
            ctx.globalAlpha = 0.15;
            for (let v = 0; v < 3; v++) {
                const vPt = iso(-10 + v * 10, -10, Z[6] + 14, cx, cy, s);
                ctx.beginPath();
                ctx.ellipse(vPt.x, vPt.y, 4 * s, 2 * s, 0, 0, Math.PI * 2);
                ctx.stroke();
            }
            ctx.restore();

            // ─── SPINNING PROPELLERS (ghost layer at motor height) ───
            armTips.forEach((arm, idx) => {
                drawPropeller(cx, cy, arm[0], arm[1], Z[1] + 18, s, propSpinAngle, idx % 2 === 0);
            });

            // ─── SIGNAL FLOW PARTICLES (Receiver → FC → ESC → Motors) ───
            signalParticles.forEach(particle => {
                particle.progress = (particle.progress + particle.speed) % 1;
                const arm = armTips[particle.path];
                const p = particle.progress;

                // Path: center FC → ESC → arm tip
                let px, py, pz;
                if (p < 0.4) {
                    // FC to ESC
                    const t = p / 0.4;
                    px = 0; py = 0;
                    pz = Z[3] + (Z[2] - Z[3]) * t + 5;
                } else {
                    // ESC to motor
                    const t = (p - 0.4) / 0.6;
                    px = arm[0] * t;
                    py = arm[1] * t;
                    pz = Z[2] + (Z[1] - Z[2]) * t + 5;
                }

                const pt = iso(px, py, pz, cx, cy, s);
                ctx.save();
                ctx.fillStyle = COL.cyan;
                ctx.shadowColor = COL.cyan;
                ctx.shadowBlur = 8;
                ctx.globalAlpha = 0.7;
                ctx.beginPath();
                ctx.arc(pt.x, pt.y, particle.size * s, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            });

            // ─── POWER FLOW PARTICLES (Battery → ESC → Motors) ───
            powerParticles.forEach(particle => {
                particle.progress = (particle.progress + particle.speed) % 1;
                const arm = armTips[particle.arm];
                const p = particle.progress;

                // XT60 → ESC center → arm motor
                let px, py;
                if (p < 0.3) {
                    const t = p / 0.3;
                    px = 0; py = 32 * (1 - t);
                } else {
                    const t = (p - 0.3) / 0.7;
                    px = arm[0] * 0.3 * t;
                    py = arm[1] * 0.3 * t;
                }

                const pt = iso(px, py, Z[2] + 6, cx, cy, s);
                ctx.save();
                ctx.fillStyle = COL.red;
                ctx.shadowColor = COL.red;
                ctx.shadowBlur = 6;
                ctx.globalAlpha = 0.5;
                ctx.beginPath();
                ctx.arc(pt.x, pt.y, 1.5 * s, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            });

            // ─── SCANLINE SWEEP ───
            const scanY = cy - droneCanvas.height * 0.5 + scanPhase * droneCanvas.height;
            ctx.save();
            const scanGrad = ctx.createLinearGradient(0, scanY - 25, 0, scanY + 25);
            scanGrad.addColorStop(0, 'rgba(86, 204, 242, 0)');
            scanGrad.addColorStop(0.5, 'rgba(86, 204, 242, 0.035)');
            scanGrad.addColorStop(1, 'rgba(86, 204, 242, 0)');
            ctx.fillStyle = scanGrad;
            ctx.fillRect(0, scanY - 25, droneCanvas.width, 50);
            ctx.restore();

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
