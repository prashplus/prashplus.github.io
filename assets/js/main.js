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
    // 1. Breathtaking 8-Layer Server/SoC Dissection Canvas Engine
    // ==========================================
    const disCanvas = document.getElementById('dissection-canvas');
    if (disCanvas) {
        const ctx = disCanvas.getContext('2d');

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
            pcbGreen: '#1A5C3A',
        };

        function resizeDissection() {
            disCanvas.width = window.innerWidth;
            disCanvas.height = window.innerHeight;
        }
        resizeDissection();
        window.addEventListener('resize', resizeDissection);

        // Animated Data Pulse Particles
        const dataPackets = [];
        for (let i = 0; i < 40; i++) {
            dataPackets.push({
                layer: i % 8,
                progress: Math.random(),
                speed: 0.002 + Math.random() * 0.004,
                track: Math.floor(Math.random() * 6),
                size: 1.5 + Math.random() * 2,
            });
        }

        // Scanline phase
        let scanPhase = 0;

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

        // Draw a small isometric box offset from center
        function drawOffsetBox(cx, cy, ox, oy, w, h, t, z, s, stroke, fill, alpha) {
            const cxo = cx, cyo = cy;
            // Offset the center point using iso projection of the offset
            const off = iso(ox, oy, 0, 0, 0, s);
            return drawBox(cx + off.x, cy + off.y, w, h, t, z, s, stroke, fill, alpha);
        }

        // Draw PCB trace lines
        function drawTraces(cx, cy, z, s, count, w, h, color, alpha) {
            ctx.save();
            ctx.strokeStyle = color;
            ctx.lineWidth = 0.6;
            ctx.globalAlpha = alpha;
            for (let i = 0; i < count; i++) {
                const t = (i / (count - 1)) * 2 - 1; // -1 to 1
                const startX = t * w / 2;
                const a = iso(startX, -h / 2, z, cx, cy, s);
                const b2 = iso(startX, h / 2, z, cx, cy, s);
                ctx.beginPath();
                ctx.moveTo(a.x, a.y);
                // Add slight jog for realistic routing
                if (i % 3 === 0) {
                    const mid = iso(startX + 8, 0, z, cx, cy, s);
                    ctx.lineTo(mid.x, mid.y);
                }
                ctx.lineTo(b2.x, b2.y);
                ctx.stroke();
            }
            ctx.restore();
        }

        // Draw BGA ball grid
        function drawBGA(cx, cy, ox, oy, z, s, rows, cols, spacing, color) {
            ctx.save();
            ctx.fillStyle = color;
            ctx.globalAlpha = 0.5;
            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    const px = ox + (c - (cols - 1) / 2) * spacing;
                    const py = oy + (r - (rows - 1) / 2) * spacing;
                    const pt = iso(px, py, z, cx, cy, s);
                    ctx.beginPath();
                    ctx.arc(pt.x, pt.y, 1.2 * s, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
            ctx.restore();
        }

        // Draw capacitor/resistor array
        function drawPassives(cx, cy, ox, oy, z, s, count, vertical, color) {
            ctx.save();
            ctx.fillStyle = color;
            ctx.globalAlpha = 0.6;
            for (let i = 0; i < count; i++) {
                let px, py;
                if (vertical) {
                    px = ox;
                    py = oy + (i - (count - 1) / 2) * 8;
                } else {
                    px = ox + (i - (count - 1) / 2) * 8;
                    py = oy;
                }
                const pt = iso(px, py, z, cx, cy, s);
                ctx.fillRect(pt.x - 2 * s, pt.y - 1 * s, 4 * s, 2.5 * s);
            }
            ctx.restore();
        }

        // Draw honeycomb pattern
        function drawHoneycomb(cx, cy, z, s, w, h, cellSize, color) {
            ctx.save();
            ctx.strokeStyle = color;
            ctx.lineWidth = 0.5;
            ctx.globalAlpha = 0.35;
            const hexR = cellSize;
            for (let row = -Math.floor(h / (hexR * 1.5)); row <= Math.floor(h / (hexR * 1.5)); row++) {
                for (let col = -Math.floor(w / (hexR * 1.8)); col <= Math.floor(w / (hexR * 1.8)); col++) {
                    const offX = col * hexR * 1.8 + (row % 2) * hexR * 0.9;
                    const offY = row * hexR * 1.5;
                    if (Math.abs(offX) > w / 2 - 5 || Math.abs(offY) > h / 2 - 5) continue;
                    const center = iso(offX, offY, z, cx, cy, s);
                    ctx.beginPath();
                    for (let a = 0; a < 6; a++) {
                        const angle = Math.PI / 3 * a + Math.PI / 6;
                        const hx = center.x + Math.cos(angle) * hexR * s * 0.5;
                        const hy = center.y + Math.sin(angle) * hexR * s * 0.35;
                        if (a === 0) ctx.moveTo(hx, hy); else ctx.lineTo(hx, hy);
                    }
                    ctx.closePath();
                    ctx.stroke();
                }
            }
            ctx.restore();
        }

        // Draw heatpipes
        function drawHeatpipes(cx, cy, z, s, count, length, color) {
            ctx.save();
            for (let i = 0; i < count; i++) {
                const px = (i - (count - 1) / 2) * 28;
                const a = iso(px, -length / 2, z, cx, cy, s);
                const b = iso(px, length / 2, z, cx, cy, s);

                // Pipe body (thick with gradient feel)
                ctx.strokeStyle = color;
                ctx.lineWidth = 4 * s;
                ctx.globalAlpha = 0.35;
                ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();

                // Pipe highlight
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 1;
                ctx.globalAlpha = 0.12;
                ctx.beginPath(); ctx.moveTo(a.x - 1, a.y - 1); ctx.lineTo(b.x - 1, b.y - 1); ctx.stroke();
            }
            ctx.restore();
        }

        // Draw LED indicators
        function drawLEDs(cx, cy, z, s, positions, colors, time) {
            ctx.save();
            positions.forEach((pos, i) => {
                const pt = iso(pos[0], pos[1], z, cx, cy, s);
                const blink = Math.sin(time * 3 + i * 1.5) * 0.5 + 0.5;
                ctx.fillStyle = colors[i % colors.length];
                ctx.globalAlpha = 0.4 + blink * 0.6;
                ctx.shadowColor = colors[i % colors.length];
                ctx.shadowBlur = 8;
                ctx.beginPath();
                ctx.arc(pt.x, pt.y, 2.5 * s, 0, Math.PI * 2);
                ctx.fill();
            });
            ctx.restore();
        }

        // Draw wire harness between layers
        function drawWireHarness(cx, cy, s, z1, z2, xOff, yOff, color) {
            ctx.save();
            ctx.strokeStyle = color;
            ctx.lineWidth = 1.2;
            ctx.globalAlpha = 0.3;
            ctx.setLineDash([3, 5]);
            const top = iso(xOff, yOff, z2, cx, cy, s);
            const bot = iso(xOff + 5, yOff + 5, z1, cx, cy, s);
            const midZ = (z1 + z2) / 2;
            const mid = iso(xOff + 15, yOff - 10, midZ, cx, cy, s);
            ctx.beginPath();
            ctx.moveTo(bot.x, bot.y);
            ctx.quadraticCurveTo(mid.x, mid.y, top.x, top.y);
            ctx.stroke();
            ctx.restore();
        }

        // Main render loop
        let time = 0;
        function renderDissection() {
            ctx.clearRect(0, 0, disCanvas.width, disCanvas.height);
            time += 0.016;
            scanPhase = (scanPhase + 0.003) % 1;

            const cx = disCanvas.width > 992 ? disCanvas.width * 0.7 : disCanvas.width * 0.5;
            const cy = disCanvas.height * 0.5;
            const s = Math.min(disCanvas.width, disCanvas.height) * 0.0015 + 0.5;

            const ef = Math.min(scrollProgress * 2.8, 1.9);
            const gap = 65 * ef + 18;

            // 8 Layer Z positions
            const Z = [0, gap, gap * 2, gap * 3, gap * 4, gap * 5, gap * 6, gap * 7];

            // Vertical guide pillars
            const corners = [[-130, -110], [130, -110], [130, 110], [-130, 110]];
            corners.forEach(pt => {
                const a = iso(pt[0], pt[1], Z[0], cx, cy, s);
                const b = iso(pt[0], pt[1], Z[7] + 15, cx, cy, s);
                ctx.save();
                ctx.strokeStyle = 'rgba(86, 204, 242, 0.08)';
                ctx.lineWidth = 0.8;
                ctx.setLineDash([3, 6]);
                ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
                ctx.restore();
            });

            // ─── LAYER 0: SERVER CHASSIS BACKPLANE ───
            drawBox(cx, cy, 280, 230, 6, Z[0], s, COL.silver, 'rgba(30, 41, 59, 0.5)', 0.25);
            // Screw holes at corners
            [[-125, -100], [125, -100], [125, 100], [-125, 100]].forEach(p => {
                const pt = iso(p[0], p[1], Z[0] + 7, cx, cy, s);
                ctx.save();
                ctx.strokeStyle = COL.silver;
                ctx.lineWidth = 1;
                ctx.globalAlpha = 0.5;
                ctx.beginPath(); ctx.arc(pt.x, pt.y, 3 * s, 0, Math.PI * 2); ctx.stroke();
                ctx.fillStyle = 'rgba(148, 163, 184, 0.3)';
                ctx.fill();
                ctx.restore();
            });
            // Airflow perforation pattern
            for (let ax = -90; ax <= 90; ax += 15) {
                for (let ay = -80; ay <= 80; ay += 18) {
                    const pt = iso(ax, ay, Z[0] + 7, cx, cy, s);
                    ctx.save();
                    ctx.fillStyle = 'rgba(5, 5, 16, 0.5)';
                    ctx.globalAlpha = 0.3;
                    ctx.beginPath(); ctx.arc(pt.x, pt.y, 1.5 * s, 0, Math.PI * 2); ctx.fill();
                    ctx.restore();
                }
            }

            // ─── LAYER 1: PCB MOTHERBOARD ───
            drawBox(cx, cy, 260, 210, 5, Z[1], s, COL.pcbGreen, 'rgba(26, 92, 58, 0.45)', 0.3);
            // Copper trace routing
            drawTraces(cx, cy, Z[1] + 6, s, 18, 240, 190, COL.copper, 0.25);
            // Cross traces
            ctx.save();
            ctx.strokeStyle = COL.copper;
            ctx.lineWidth = 0.5;
            ctx.globalAlpha = 0.2;
            for (let i = -8; i <= 8; i++) {
                const a = iso(-120, i * 12, Z[1] + 6, cx, cy, s);
                const b = iso(120, i * 12, Z[1] + 6, cx, cy, s);
                ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
            }
            ctx.restore();
            // VRM MOSFETs
            drawPassives(cx, cy, -100, -60, Z[1] + 6, s, 8, true, COL.silver);
            drawPassives(cx, cy, -100, 60, Z[1] + 6, s, 6, true, COL.silver);
            // Capacitor arrays
            drawPassives(cx, cy, 90, -40, Z[1] + 6, s, 5, true, COL.yellow);
            drawPassives(cx, cy, 90, 40, Z[1] + 6, s, 5, true, COL.yellow);
            // PCIe slots (raised rectangles)
            for (let slot = 0; slot < 3; slot++) {
                drawOffsetBox(cx, cy, 60, -60 + slot * 45, 50, 8, 3, Z[1] + 6, s, COL.gold, 'rgba(230, 183, 74, 0.3)', 0.3);
            }
            // SATA/USB headers
            drawOffsetBox(cx, cy, -70, 80, 15, 10, 4, Z[1] + 6, s, COL.silver, 'rgba(148, 163, 184, 0.4)', 0.35);
            drawOffsetBox(cx, cy, -45, 80, 12, 10, 4, Z[1] + 6, s, COL.blue, 'rgba(59, 130, 246, 0.3)', 0.35);

            // ─── LAYER 2: RAM DIMM MODULES ───
            drawBox(cx, cy, 240, 190, 3, Z[2], s, COL.green, 'rgba(39, 174, 96, 0.15)', 0.15);
            // Four DDR5 DIMMs in dual-channel
            const dimmPositions = [[-60, -50], [-60, 50], [60, -50], [60, 50]];
            dimmPositions.forEach((dp, di) => {
                drawOffsetBox(cx, cy, dp[0], dp[1], 12, 55, 6, Z[2] + 4, s, COL.green, 'rgba(39, 174, 96, 0.4)', 0.45);
                // Gold contact edge
                const edgePt = iso(dp[0], dp[1] - 28, Z[2] + 4, cx, cy, s);
                ctx.save();
                ctx.fillStyle = COL.gold;
                ctx.globalAlpha = 0.5;
                ctx.fillRect(edgePt.x - 2, edgePt.y - 1, 5 * s, 2 * s);
                ctx.restore();
                // IC chips on DIMM
                for (let ic = 0; ic < 4; ic++) {
                    const icPt = iso(dp[0], dp[1] - 18 + ic * 12, Z[2] + 11, cx, cy, s);
                    ctx.save();
                    ctx.fillStyle = '#1e293b';
                    ctx.globalAlpha = 0.7;
                    ctx.fillRect(icPt.x - 3 * s, icPt.y - 2 * s, 6 * s, 4 * s);
                    ctx.restore();
                }
            });

            // ─── LAYER 3: CPU SOCKET & INTERPOSER ───
            drawBox(cx, cy, 180, 160, 4, Z[3], s, COL.blue, 'rgba(59, 130, 246, 0.2)', 0.2);
            // LGA socket frame
            drawOffsetBox(cx, cy, 0, 0, 90, 90, 3, Z[3] + 5, s, COL.silver, 'rgba(148, 163, 184, 0.25)', 0.25);
            // Contact pad grid (LGA dots)
            drawBGA(cx, cy, 0, 0, Z[3] + 9, s, 12, 12, 6, COL.gold);
            // CPU package heatspreader
            drawOffsetBox(cx, cy, 0, 0, 70, 70, 5, Z[3] + 9, s, COL.silver, 'rgba(180, 200, 220, 0.3)', 0.35);
            // Substrate label text
            const cpuLabelPt = iso(0, 42, Z[3] + 15, cx, cy, s);
            ctx.save();
            ctx.fillStyle = COL.silver;
            ctx.globalAlpha = 0.4;
            ctx.font = `${Math.max(7, 8 * s)}px "Space Grotesk", monospace`;
            ctx.fillText('LGA 4677', cpuLabelPt.x - 18, cpuLabelPt.y);
            ctx.restore();

            // ─── LAYER 4: SILICON DIE (EXPOSED) ───
            drawBox(cx, cy, 140, 120, 3, Z[4], s, COL.purple, 'rgba(139, 92, 246, 0.25)', 0.2);
            // Die surface with core clusters
            const corePositions = [[-30, -25], [30, -25], [-30, 25], [30, 25]];
            corePositions.forEach((cp, ci) => {
                drawOffsetBox(cx, cy, cp[0], cp[1], 28, 22, 2, Z[4] + 4, s, COL.purple, 'rgba(139, 92, 246, 0.5)', 0.5);
                // Core sub-blocks
                for (let sb = 0; sb < 4; sb++) {
                    const sbx = cp[0] + (sb % 2 - 0.5) * 10;
                    const sby = cp[1] + (Math.floor(sb / 2) - 0.5) * 8;
                    const sbPt = iso(sbx, sby, Z[4] + 7, cx, cy, s);
                    ctx.save();
                    ctx.fillStyle = COL.purple;
                    ctx.globalAlpha = 0.3 + Math.sin(time * 2 + ci + sb) * 0.15;
                    ctx.fillRect(sbPt.x - 2.5 * s, sbPt.y - 2 * s, 5 * s, 4 * s);
                    ctx.restore();
                }
            });
            // L3 cache block (center strip)
            drawOffsetBox(cx, cy, 0, 0, 15, 60, 2, Z[4] + 4, s, COL.cyan, 'rgba(86, 204, 242, 0.4)', 0.4);
            // I/O ring (perimeter trace)
            ctx.save();
            ctx.strokeStyle = COL.cyan;
            ctx.lineWidth = 1;
            ctx.globalAlpha = 0.3;
            const ioCorners = [[-55, -45], [55, -45], [55, 45], [-55, 45]];
            ctx.beginPath();
            for (let i = 0; i < 4; i++) {
                const pt = iso(ioCorners[i][0], ioCorners[i][1], Z[4] + 7, cx, cy, s);
                if (i === 0) ctx.moveTo(pt.x, pt.y); else ctx.lineTo(pt.x, pt.y);
            }
            ctx.closePath();
            ctx.stroke();
            ctx.restore();

            // ─── LAYER 5: GPU MODULE & HBM3 STACKS ───
            drawBox(cx, cy, 200, 170, 5, Z[5], s, COL.cyan, 'rgba(86, 204, 242, 0.15)', 0.18);
            // GPU die (center)
            drawOffsetBox(cx, cy, 0, 0, 80, 80, 6, Z[5] + 6, s, COL.cyan, 'rgba(86, 204, 242, 0.5)', 0.55);
            // GPU internal grid (tensor cores)
            for (let gx = -30; gx <= 30; gx += 12) {
                for (let gy = -30; gy <= 30; gy += 12) {
                    const gPt = iso(gx, gy, Z[5] + 13, cx, cy, s);
                    ctx.save();
                    ctx.fillStyle = COL.cyan;
                    ctx.globalAlpha = 0.2 + Math.sin(time * 1.5 + gx * 0.1 + gy * 0.1) * 0.15;
                    ctx.fillRect(gPt.x - 2.5 * s, gPt.y - 2 * s, 5 * s, 4 * s);
                    ctx.restore();
                }
            }
            // HBM3 memory tower stacks (4 surrounding GPU)
            const hbmPos = [[-70, 0], [70, 0], [0, -65], [0, 65]];
            hbmPos.forEach((hp, hi) => {
                // Each HBM stack = layered chips
                for (let layer = 0; layer < 4; layer++) {
                    drawOffsetBox(cx, cy, hp[0], hp[1], 22, 18, 3, Z[5] + 6 + layer * 3.5, s,
                        COL.blue, 'rgba(59, 130, 246, 0.4)', 0.35 + layer * 0.05);
                }
                // Micro-bump interconnects (tiny dots)
                for (let mb = 0; mb < 6; mb++) {
                    const mbPt = iso(hp[0] + (mb - 2.5) * 3, hp[1], Z[5] + 6, cx, cy, s);
                    ctx.save();
                    ctx.fillStyle = COL.gold;
                    ctx.globalAlpha = 0.5;
                    ctx.beginPath(); ctx.arc(mbPt.x, mbPt.y, 1 * s, 0, Math.PI * 2); ctx.fill();
                    ctx.restore();
                }
            });
            // Silicon interposer trace fan-out
            hbmPos.forEach(hp => {
                ctx.save();
                ctx.strokeStyle = COL.copper;
                ctx.lineWidth = 0.6;
                ctx.globalAlpha = 0.2;
                const from = iso(hp[0] * 0.4, hp[1] * 0.4, Z[5] + 12, cx, cy, s);
                const to = iso(hp[0], hp[1], Z[5] + 8, cx, cy, s);
                ctx.beginPath(); ctx.moveTo(from.x, from.y); ctx.lineTo(to.x, to.y); ctx.stroke();
                ctx.restore();
            });

            // ─── LAYER 6: COOLING ASSEMBLY ───
            drawBox(cx, cy, 250, 210, 4, Z[6], s, COL.copper, 'rgba(212, 136, 90, 0.15)', 0.15);
            // Vapor chamber base
            drawOffsetBox(cx, cy, 0, 0, 100, 90, 3, Z[6] + 5, s, COL.copper, 'rgba(212, 136, 90, 0.35)', 0.35);
            // Copper heatpipes
            drawHeatpipes(cx, cy, Z[6] + 9, s, 6, 160, COL.copper);
            // Aluminum fin stack (many thin lines)
            ctx.save();
            ctx.strokeStyle = COL.silver;
            ctx.lineWidth = 0.4;
            for (let fin = -80; fin <= 80; fin += 5) {
                ctx.globalAlpha = 0.15 + Math.abs(fin / 80) * 0.1;
                const a = iso(fin, -90, Z[6] + 12, cx, cy, s);
                const b = iso(fin, 90, Z[6] + 12, cx, cy, s);
                ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
            }
            ctx.restore();
            // Thermal paste zone (center glow)
            const tpCenter = iso(0, 0, Z[6] + 5, cx, cy, s);
            ctx.save();
            const tpGrad = ctx.createRadialGradient(tpCenter.x, tpCenter.y, 0, tpCenter.x, tpCenter.y, 40 * s);
            tpGrad.addColorStop(0, 'rgba(148, 163, 184, 0.2)');
            tpGrad.addColorStop(1, 'rgba(148, 163, 184, 0)');
            ctx.fillStyle = tpGrad;
            ctx.globalAlpha = 0.5;
            ctx.fillRect(tpCenter.x - 40 * s, tpCenter.y - 30 * s, 80 * s, 60 * s);
            ctx.restore();

            // ─── LAYER 7: TOP SHROUD & I/O PANEL ───
            drawBox(cx, cy, 280, 230, 5, Z[7], s, COL.silver, 'rgba(30, 41, 59, 0.4)', 0.2);
            // Honeycomb ventilation pattern
            drawHoneycomb(cx, cy, Z[7] + 6, s, 250, 200, 10, COL.silver);
            // I/O panel ports (back edge)
            const ioPortTypes = [
                { x: -80, color: COL.cyan, w: 8, h: 6 },   // Fiber 1
                { x: -55, color: COL.cyan, w: 8, h: 6 },   // Fiber 2
                { x: -30, color: COL.blue, w: 10, h: 6 },   // RJ45
                { x: 0, color: COL.blue, w: 10, h: 6 },     // RJ45
                { x: 30, color: COL.silver, w: 12, h: 5 },   // USB
                { x: 60, color: COL.silver, w: 6, h: 6 },    // Serial
            ];
            ioPortTypes.forEach(port => {
                drawOffsetBox(cx, cy, port.x, -100, port.w, port.h, 3, Z[7] + 6, s,
                    port.color, port.color, 0.3);
            });
            // Status LEDs
            drawLEDs(cx, cy, Z[7] + 6, s,
                [[100, -90], [100, -80], [100, -70]],
                [COL.green, COL.cyan, COL.yellow], time);

            // ─── WIRE HARNESSES BETWEEN LAYERS ───
            drawWireHarness(cx, cy, s, Z[0] + 6, Z[1], -100, 0, COL.yellow);
            drawWireHarness(cx, cy, s, Z[1] + 5, Z[2], 90, -30, COL.green);
            drawWireHarness(cx, cy, s, Z[2] + 3, Z[3], -60, 40, COL.blue);
            drawWireHarness(cx, cy, s, Z[4] + 3, Z[5], 50, -20, COL.purple);
            drawWireHarness(cx, cy, s, Z[5] + 5, Z[6], -40, 50, COL.copper);

            // ─── DATA PULSE PARTICLES ───
            dataPackets.forEach(packet => {
                packet.progress = (packet.progress + packet.speed) % 1;
                const li = packet.layer;
                const layerW = [280, 260, 240, 180, 140, 200, 250, 280][li];
                const layerH = [230, 210, 190, 160, 120, 170, 210, 230][li];
                const hw = layerW / 2, hh = layerH / 2;
                const pathT = packet.progress * 4;
                let px = 0, py = 0;
                if (pathT < 1) { px = -hw + pathT * layerW; py = -hh; }
                else if (pathT < 2) { px = hw; py = -hh + (pathT - 1) * layerH; }
                else if (pathT < 3) { px = hw - (pathT - 2) * layerW; py = hh; }
                else { px = -hw; py = hh - (pathT - 3) * layerH; }

                const pPt = iso(px, py, Z[li] + 8, cx, cy, s);
                const colors = [COL.silver, COL.copper, COL.green, COL.blue, COL.purple, COL.cyan, COL.copper, COL.silver];
                ctx.save();
                ctx.fillStyle = colors[li];
                ctx.shadowColor = colors[li];
                ctx.shadowBlur = 10;
                ctx.globalAlpha = 0.8;
                ctx.beginPath();
                ctx.arc(pPt.x, pPt.y, packet.size * s, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            });

            // ─── SCANLINE SWEEP ───
            const scanY = cy - disCanvas.height * 0.5 + scanPhase * disCanvas.height;
            ctx.save();
            const scanGrad = ctx.createLinearGradient(0, scanY - 30, 0, scanY + 30);
            scanGrad.addColorStop(0, 'rgba(86, 204, 242, 0)');
            scanGrad.addColorStop(0.5, 'rgba(86, 204, 242, 0.04)');
            scanGrad.addColorStop(1, 'rgba(86, 204, 242, 0)');
            ctx.fillStyle = scanGrad;
            ctx.fillRect(0, scanY - 30, disCanvas.width, 60);
            ctx.restore();

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