/**
 * hobbies.js — Scroll-driven FPV drone disassembly + page logic
 * Depends on: utils.js, three.js (r128), gsap, ScrollTrigger, anime.js, typed.js
 */
(function () {
  function main() {
    initScrollProgress();
    initParticleNetwork("particle-canvas");
    initHeroEntrance();

    /* ════════════════════════════════════════════════
       Three.js Scroll-Driven Drone Disassembly
       ════════════════════════════════════════════════ */

    var hasThree = typeof THREE !== "undefined" && typeof gsap !== "undefined";
    var container = hasThree
      ? document.getElementById("drone-3d-container")
      : null;

    if (hasThree && container) {
      gsap.registerPlugin(ScrollTrigger);

      var scene = new THREE.Scene();
      var camera = new THREE.PerspectiveCamera(
        40,
        window.innerWidth / window.innerHeight,
        0.1,
        100,
      );
      camera.position.set(4.5, 3.5, 6);
      camera.lookAt(0, 0.2, 0);

      var renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.15;
      container.appendChild(renderer.domElement);

      /* ── Lighting ─────────────────────────────────── */

      scene.add(new THREE.AmbientLight(0xb0c4de, 0.85));
      var keyL = new THREE.DirectionalLight(0xffffff, 1.3);
      keyL.position.set(5, 8, 5);
      scene.add(keyL);
      var accentL = new THREE.PointLight(0x2563eb, 0.6, 25);
      accentL.position.set(-3, 2, 3);
      scene.add(accentL);
      var rimL = new THREE.PointLight(0x7c3aed, 0.25, 18);
      rimL.position.set(3, -1, -4);
      scene.add(rimL);

      /* ── Materials ────────────────────────────────── */

      var carbonM = new THREE.MeshStandardMaterial({
        color: 0x1a1a1e,
        metalness: 0.35,
        roughness: 0.55,
      });
      var carbonLtM = new THREE.MeshStandardMaterial({
        color: 0x252530,
        metalness: 0.3,
        roughness: 0.6,
      });
      var metalM = new THREE.MeshStandardMaterial({
        color: 0x3a3a42,
        metalness: 0.75,
        roughness: 0.25,
      });
      var silverM = new THREE.MeshStandardMaterial({
        color: 0xbbbbbb,
        metalness: 0.85,
        roughness: 0.2,
      });
      var motorM = new THREE.MeshStandardMaterial({
        color: 0x444450,
        metalness: 0.8,
        roughness: 0.2,
      });
      var propM = new THREE.MeshStandardMaterial({
        color: 0x2563eb,
        metalness: 0.15,
        roughness: 0.45,
        transparent: true,
        opacity: 0.65,
      });
      var pcbM = new THREE.MeshStandardMaterial({
        color: 0x1a5c3a,
        metalness: 0.25,
        roughness: 0.65,
      });
      var pcbDarkM = new THREE.MeshStandardMaterial({
        color: 0x145230,
        metalness: 0.2,
        roughness: 0.7,
      });
      var chipM = new THREE.MeshStandardMaterial({
        color: 0x111118,
        metalness: 0.85,
        roughness: 0.15,
      });
      var ledM = new THREE.MeshStandardMaterial({
        color: 0x2563eb,
        emissive: 0x2563eb,
        emissiveIntensity: 1.2,
      });
      var ledRedM = new THREE.MeshStandardMaterial({
        color: 0xff3333,
        emissive: 0xff2222,
        emissiveIntensity: 1.0,
      });
      var lensM = new THREE.MeshStandardMaterial({
        color: 0x111115,
        metalness: 0.92,
        roughness: 0.08,
      });
      var antM = new THREE.MeshStandardMaterial({
        color: 0x555555,
        metalness: 0.5,
        roughness: 0.5,
      });
      var battM = new THREE.MeshStandardMaterial({
        color: 0x2a2a35,
        metalness: 0.4,
        roughness: 0.4,
      });
      var goldM = new THREE.MeshStandardMaterial({
        color: 0xdaa520,
        metalness: 0.9,
        roughness: 0.15,
      });
      var copperM = new THREE.MeshStandardMaterial({
        color: 0xb87333,
        metalness: 0.8,
        roughness: 0.3,
      });
      var wireBlkM = new THREE.MeshStandardMaterial({
        color: 0x111111,
        roughness: 0.8,
      });
      var wireRedM = new THREE.MeshStandardMaterial({
        color: 0xcc2222,
        roughness: 0.8,
      });
      var rubberM = new THREE.MeshStandardMaterial({
        color: 0x333333,
        roughness: 0.9,
      });
      var strapM = new THREE.MeshStandardMaterial({
        color: 0xcc2222,
        roughness: 0.85,
      });

      /* ── Model ────────────────────────────────────── */

      var drone = new THREE.Group();
      var parts = [];
      var propGroups = [];

      function addPart(mesh, ey, ex, ez) {
        drone.add(mesh);
        parts.push({
          mesh: mesh,
          ex: ex || 0,
          ey: ey || 0,
          ez: ez || 0,
          origX: mesh.position.x,
          origY: mesh.position.y,
          origZ: mesh.position.z,
        });
      }
      function addGroup(group, ey, ex, ez) {
        drone.add(group);
        parts.push({
          mesh: group,
          ex: ex || 0,
          ey: ey || 0,
          ez: ez || 0,
          origX: group.position.x,
          origY: group.position.y,
          origZ: group.position.z,
        });
      }

      // ─── 1. Main body frame (detailed) ───
      var bodyGroup = new THREE.Group();
      // Top plate
      var topPlate = new THREE.Mesh(
        new THREE.BoxGeometry(0.95, 0.04, 0.95),
        carbonM,
      );
      topPlate.position.y = 0.22;
      bodyGroup.add(topPlate);
      // Bottom plate
      var btmPlate = new THREE.Mesh(
        new THREE.BoxGeometry(0.95, 0.04, 0.95),
        carbonM,
      );
      btmPlate.position.y = 0.04;
      bodyGroup.add(btmPlate);
      // Side rails (standoffs between plates)
      [
        [-0.4, 0.13, -0.4],
        [0.4, 0.13, -0.4],
        [-0.4, 0.13, 0.4],
        [0.4, 0.13, 0.4],
      ].forEach(function (p) {
        var so = new THREE.Mesh(
          new THREE.CylinderGeometry(0.025, 0.025, 0.14, 8),
          metalM,
        );
        so.position.set(p[0], p[1], p[2]);
        bodyGroup.add(so);
      });
      // Center cross bracing
      bodyGroup.add(
        new THREE.Mesh(
          new THREE.BoxGeometry(0.9, 0.03, 0.06),
          carbonLtM,
        ).translateY(0.13),
      );
      bodyGroup.add(
        new THREE.Mesh(
          new THREE.BoxGeometry(0.06, 0.03, 0.9),
          carbonLtM,
        ).translateY(0.13),
      );
      bodyGroup.position.y = 0;
      addGroup(bodyGroup, 0, 0, 0);

      // ─── 2. Flight Controller (FC) ───
      var fcGroup = new THREE.Group();
      var fcPcb = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.03, 0.6), pcbM);
      fcGroup.add(fcPcb);
      // MCU chip
      var mcu = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.02, 0.12), chipM);
      mcu.position.set(0, 0.025, 0);
      fcGroup.add(mcu);
      // Gyro/Accel chip
      var gyro = new THREE.Mesh(
        new THREE.BoxGeometry(0.06, 0.015, 0.06),
        chipM,
      );
      gyro.position.set(-0.15, 0.023, 0.1);
      fcGroup.add(gyro);
      // USB-C port
      var usbc = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, 0.025, 0.04),
        metalM,
      );
      usbc.position.set(0.3, 0.02, 0);
      fcGroup.add(usbc);
      // SMD components
      for (var si = 0; si < 16; si++) {
        var smd = new THREE.Mesh(
          new THREE.BoxGeometry(0.025, 0.012, 0.015),
          chipM,
        );
        smd.position.set(
          -0.2 + Math.random() * 0.4,
          0.02,
          -0.2 + Math.random() * 0.4,
        );
        fcGroup.add(smd);
      }
      // Solder pads (gold)
      for (var sp = 0; sp < 8; sp++) {
        var spad = new THREE.Mesh(new THREE.CircleGeometry(0.01, 6), goldM);
        spad.rotation.x = -Math.PI / 2;
        spad.position.set(-0.25 + sp * 0.07, 0.018, -0.28);
        fcGroup.add(spad);
      }
      // Connector pins
      for (var cp = 0; cp < 6; cp++) {
        var pin = new THREE.Mesh(
          new THREE.CylinderGeometry(0.005, 0.005, 0.04, 4),
          goldM,
        );
        pin.position.set(-0.15 + cp * 0.06, -0.015, 0.28);
        fcGroup.add(pin);
      }
      // Mounting grommets
      [
        [-0.25, 0, -0.25],
        [0.25, 0, -0.25],
        [-0.25, 0, 0.25],
        [0.25, 0, 0.25],
      ].forEach(function (p) {
        var grom = new THREE.Mesh(
          new THREE.CylinderGeometry(0.02, 0.02, 0.035, 8),
          rubberM,
        );
        grom.position.set(p[0], p[1], p[2]);
        fcGroup.add(grom);
      });
      fcGroup.position.y = 0.3;
      addGroup(fcGroup, 1.5, 0, 0);

      // ─── 3. ESC (4-in-1) ───
      var escGroup = new THREE.Group();
      var escPcb = new THREE.Mesh(
        new THREE.BoxGeometry(0.55, 0.025, 0.55),
        pcbDarkM,
      );
      escGroup.add(escPcb);
      // 4 MOSFET chips
      for (var mi = 0; mi < 4; mi++) {
        var mosfet = new THREE.Mesh(
          new THREE.BoxGeometry(0.08, 0.015, 0.08),
          chipM,
        );
        var mx = mi < 2 ? -0.15 : 0.15;
        var mz = mi % 2 === 0 ? -0.15 : 0.15;
        mosfet.position.set(mx, 0.02, mz);
        escGroup.add(mosfet);
      }
      // Capacitors
      for (var ci = 0; ci < 3; ci++) {
        var ecap = new THREE.Mesh(
          new THREE.CylinderGeometry(0.025, 0.025, 0.04, 8),
          chipM,
        );
        ecap.position.set(-0.2 + ci * 0.2, 0.03, 0);
        escGroup.add(ecap);
      }
      // Motor wire solder pads
      for (var mw = 0; mw < 12; mw++) {
        var wpad = new THREE.Mesh(new THREE.CircleGeometry(0.012, 6), copperM);
        wpad.rotation.x = -Math.PI / 2;
        wpad.position.set(
          -0.22 + (mw % 4) * 0.15,
          0.015,
          mw < 4 ? -0.26 : mw < 8 ? 0.26 : -0.26,
        );
        escGroup.add(wpad);
      }
      escGroup.position.y = 0.02;
      addGroup(escGroup, -1.2, 0, 0);

      // ─── 4. Battery (LiPo) ───
      var battGroup = new THREE.Group();
      var battBody = new THREE.Mesh(
        new THREE.BoxGeometry(1.05, 0.16, 0.5),
        battM,
      );
      battGroup.add(battBody);
      // Cell lines
      for (var cl = 0; cl < 3; cl++) {
        var line = new THREE.Mesh(
          new THREE.BoxGeometry(1.06, 0.001, 0.005),
          new THREE.MeshStandardMaterial({ color: 0x444455 }),
        );
        line.position.set(0, 0.081, -0.15 + cl * 0.15);
        battGroup.add(line);
      }
      // XT60 connector
      var xt60 = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, 0.06, 0.12),
        new THREE.MeshStandardMaterial({ color: 0xccaa00, roughness: 0.5 }),
      );
      xt60.position.set(0.55, 0, 0);
      battGroup.add(xt60);
      // Balance lead
      var balConn = new THREE.Mesh(
        new THREE.BoxGeometry(0.06, 0.04, 0.15),
        new THREE.MeshStandardMaterial({ color: 0xeeeeee, roughness: 0.7 }),
      );
      balConn.position.set(-0.45, 0.05, 0.2);
      battGroup.add(balConn);
      // Balance wires
      var bwColors = [wireRedM, wireBlkM, wireRedM, wireBlkM];
      bwColors.forEach(function (m, i) {
        var bw = new THREE.Mesh(
          new THREE.CylinderGeometry(0.005, 0.005, 0.15, 4),
          m,
        );
        bw.rotation.z = Math.PI / 3;
        bw.position.set(-0.5, 0.08, 0.12 + i * 0.025);
        battGroup.add(bw);
      });
      // Warning label
      var warnLabel = new THREE.Mesh(
        new THREE.BoxGeometry(0.35, 0.002, 0.2),
        new THREE.MeshStandardMaterial({ color: 0xffcc00, roughness: 0.9 }),
      );
      warnLabel.position.set(0, 0.082, 0);
      battGroup.add(warnLabel);
      battGroup.position.y = -0.12;
      addGroup(battGroup, -2.2, 0, 1.0);

      // ─── 5. Battery strap ───
      var strap = new THREE.Mesh(
        new THREE.BoxGeometry(0.06, 0.26, 0.55),
        strapM,
      );
      strap.position.set(0, -0.08, 0);
      addPart(strap, -2.2, 0, 1.0);

      // ─── 6. Arms (X-config) ───
      var armLen = 1.9;
      var angles = [
        Math.PI / 4,
        -Math.PI / 4,
        (3 * Math.PI) / 4,
        (-3 * Math.PI) / 4,
      ];
      var armExp = [
        { ex: 1.3, ez: -1.3 },
        { ex: 1.3, ez: 1.3 },
        { ex: -1.3, ez: -1.3 },
        { ex: -1.3, ez: 1.3 },
      ];
      var tips = [];

      angles.forEach(function (a, idx) {
        var armGroup = new THREE.Group();
        // Main arm tube
        var arm = new THREE.Mesh(
          new THREE.BoxGeometry(armLen, 0.07, 0.14),
          carbonM,
        );
        armGroup.add(arm);
        // Arm reinforcement ribs
        for (var rib = 0; rib < 4; rib++) {
          var r = new THREE.Mesh(
            new THREE.BoxGeometry(0.02, 0.075, 0.15),
            carbonLtM,
          );
          r.position.x = -0.6 + rib * 0.4;
          armGroup.add(r);
        }
        // Motor wires along arm
        var wireColors = [wireRedM, wireBlkM, wireRedM];
        wireColors.forEach(function (wm, wi) {
          var wire = new THREE.Mesh(
            new THREE.CylinderGeometry(0.006, 0.006, armLen * 0.85, 4),
            wm,
          );
          wire.rotation.z = Math.PI / 2;
          wire.position.set(0, 0.04, -0.04 + wi * 0.04);
          armGroup.add(wire);
        });

        armGroup.position.y = 0.12;
        armGroup.rotation.y = a;
        addGroup(armGroup, 0.3, armExp[idx].ex, armExp[idx].ez);

        tips.push(
          new THREE.Vector3(
            (Math.cos(a) * armLen) / 2,
            0.12,
            (-Math.sin(a) * armLen) / 2,
          ),
        );
      });

      // ─── 7. Motors (detailed) ───
      tips.forEach(function (tip, idx) {
        var motorGroup = new THREE.Group();
        // Stator base
        var stator = new THREE.Mesh(
          new THREE.CylinderGeometry(0.12, 0.13, 0.08, 16),
          metalM,
        );
        motorGroup.add(stator);
        // Stator windings (copper coils)
        for (var sw = 0; sw < 8; sw++) {
          var coilAngle = (sw / 8) * Math.PI * 2;
          var coil = new THREE.Mesh(
            new THREE.BoxGeometry(0.03, 0.06, 0.02),
            copperM,
          );
          coil.position.set(
            Math.cos(coilAngle) * 0.08,
            0,
            Math.sin(coilAngle) * 0.08,
          );
          coil.rotation.y = coilAngle;
          motorGroup.add(coil);
        }
        // Bell (rotor)
        var bell = new THREE.Mesh(
          new THREE.CylinderGeometry(0.15, 0.13, 0.1, 16),
          motorM,
        );
        bell.position.y = 0.09;
        motorGroup.add(bell);
        // Bell top cap
        var cap = new THREE.Mesh(
          new THREE.CylinderGeometry(0.05, 0.15, 0.025, 16),
          motorM,
        );
        cap.position.y = 0.15;
        motorGroup.add(cap);
        // Shaft
        var shaft = new THREE.Mesh(
          new THREE.CylinderGeometry(0.012, 0.012, 0.2, 8),
          silverM,
        );
        shaft.position.y = 0.06;
        motorGroup.add(shaft);
        // Mounting screws
        [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].forEach(function (sa) {
          var screw = new THREE.Mesh(
            new THREE.CylinderGeometry(0.008, 0.008, 0.03, 6),
            silverM,
          );
          screw.position.set(Math.cos(sa) * 0.1, -0.05, Math.sin(sa) * 0.1);
          motorGroup.add(screw);
        });
        // Wire leads
        [wireRedM, wireBlkM, wireRedM].forEach(function (wm, wi) {
          var lead = new THREE.Mesh(
            new THREE.CylinderGeometry(0.005, 0.005, 0.12, 4),
            wm,
          );
          lead.rotation.x = Math.PI / 4;
          lead.position.set(-0.02 + wi * 0.02, -0.08, 0.08);
          motorGroup.add(lead);
        });

        motorGroup.position.copy(tip);
        motorGroup.position.y = 0.25;
        addGroup(motorGroup, 1.0, armExp[idx].ex * 1.6, armExp[idx].ez * 1.6);
      });

      // ─── 8. Propellers (detailed) ───
      tips.forEach(function (tip, idx) {
        var propGroup = new THREE.Group();
        // 2-blade prop
        for (var bi = 0; bi < 2; bi++) {
          var bladeGroup = new THREE.Group();
          // Main blade with taper
          var blade = new THREE.Mesh(
            new THREE.BoxGeometry(1.15, 0.012, 0.1),
            propM,
          );
          bladeGroup.add(blade);
          // Leading edge
          var edge = new THREE.Mesh(
            new THREE.BoxGeometry(1.1, 0.008, 0.015),
            new THREE.MeshStandardMaterial({
              color: 0x1a50cc,
              metalness: 0.2,
              roughness: 0.4,
            }),
          );
          edge.position.z = 0.05;
          bladeGroup.add(edge);
          // Tip marking
          var tipMark = new THREE.Mesh(
            new THREE.BoxGeometry(0.15, 0.013, 0.08),
            new THREE.MeshStandardMaterial({
              color: 0xffffff,
              transparent: true,
              opacity: 0.3,
            }),
          );
          tipMark.position.x = 0.48;
          bladeGroup.add(tipMark);

          bladeGroup.rotation.y = (bi * Math.PI) / 2;
          propGroup.add(bladeGroup);
        }
        // Hub
        var hub = new THREE.Mesh(
          new THREE.CylinderGeometry(0.04, 0.04, 0.025, 12),
          metalM,
        );
        propGroup.add(hub);
        // Lock nut
        var locknut = new THREE.Mesh(
          new THREE.CylinderGeometry(0.015, 0.02, 0.015, 6),
          silverM,
        );
        locknut.position.y = 0.02;
        propGroup.add(locknut);
        // Spin disc
        var discMat = new THREE.MeshStandardMaterial({
          color: 0x2563eb,
          transparent: true,
          opacity: 0,
          metalness: 0,
          roughness: 1,
        });
        propGroup.add(
          new THREE.Mesh(
            new THREE.CylinderGeometry(0.58, 0.58, 0.004, 32),
            discMat,
          ),
        );

        propGroup.position.copy(tip);
        propGroup.position.y = 0.45;
        addGroup(propGroup, 2.5, armExp[idx].ex * 2.2, armExp[idx].ez * 2.2);
        propGroups.push({
          group: propGroup,
          speed: 14 + Math.random() * 6,
          disc: discMat,
        });
      });

      // ─── 9. FPV Camera ───
      var camGroup = new THREE.Group();
      // Camera housing
      var camBody = new THREE.Mesh(
        new THREE.BoxGeometry(0.22, 0.18, 0.18),
        metalM,
      );
      camGroup.add(camBody);
      // Lens barrel
      var barrel = new THREE.Mesh(
        new THREE.CylinderGeometry(0.065, 0.07, 0.1, 16),
        lensM,
      );
      barrel.rotation.x = Math.PI / 2;
      barrel.position.z = -0.14;
      camGroup.add(barrel);
      // Lens glass
      var glass = new THREE.Mesh(
        new THREE.CircleGeometry(0.06, 16),
        new THREE.MeshStandardMaterial({
          color: 0x334455,
          metalness: 0.95,
          roughness: 0.05,
        }),
      );
      glass.position.z = -0.19;
      camGroup.add(glass);
      // Lens ring
      var lensRing = new THREE.Mesh(
        new THREE.RingGeometry(0.055, 0.065, 16),
        silverM,
      );
      lensRing.position.z = -0.191;
      camGroup.add(lensRing);
      // Tilt mount bracket
      var bracket = new THREE.Mesh(
        new THREE.BoxGeometry(0.03, 0.22, 0.04),
        metalM,
      );
      bracket.position.set(-0.12, 0, 0.05);
      camGroup.add(bracket);
      var bracket2 = new THREE.Mesh(
        new THREE.BoxGeometry(0.03, 0.22, 0.04),
        metalM,
      );
      bracket2.position.set(0.12, 0, 0.05);
      camGroup.add(bracket2);
      // Cable
      var camCable = new THREE.Mesh(
        new THREE.CylinderGeometry(0.008, 0.008, 0.2, 4),
        wireBlkM,
      );
      camCable.rotation.z = Math.PI / 3;
      camCable.position.set(0.1, 0.12, 0.08);
      camGroup.add(camCable);
      camGroup.position.set(0, 0.12, -0.58);
      addGroup(camGroup, -0.3, 0, -2.5);

      // ─── 10. VTX + Antenna ───
      var vtxGroup = new THREE.Group();
      // VTX board
      var vtxPcb = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.02, 0.2), pcbM);
      vtxGroup.add(vtxPcb);
      // Heatsink on VTX
      for (var vf = 0; vf < 4; vf++) {
        var vfin = new THREE.Mesh(
          new THREE.BoxGeometry(0.24, 0.015, 0.005),
          new THREE.MeshStandardMaterial({
            color: 0x888888,
            metalness: 0.7,
            roughness: 0.3,
          }),
        );
        vfin.position.set(0, 0.02 + vf * 0.015, -0.05 + vf * 0.04);
        vtxGroup.add(vfin);
      }
      // SMA connector
      var sma = new THREE.Mesh(
        new THREE.CylinderGeometry(0.015, 0.015, 0.05, 8),
        goldM,
      );
      sma.position.set(0, 0.035, 0);
      vtxGroup.add(sma);
      vtxGroup.position.set(0.2, 0.35, 0.3);
      addGroup(vtxGroup, 1.6, 0.8, 1.5);

      // Antenna
      var antGroup = new THREE.Group();
      var antStalk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.01, 0.01, 0.45, 6),
        antM,
      );
      antGroup.add(antStalk);
      // Lollipop antenna head
      var antHead = new THREE.Mesh(
        new THREE.SphereGeometry(0.04, 10, 10),
        antM,
      );
      antHead.position.y = 0.23;
      antGroup.add(antHead);
      // Protective cap ring
      var capRing = new THREE.Mesh(
        new THREE.RingGeometry(0.035, 0.045, 10),
        metalM,
      );
      capRing.rotation.x = Math.PI / 2;
      capRing.position.y = 0.2;
      antGroup.add(capRing);
      antGroup.position.set(0.2, 0.6, 0.3);
      antGroup.rotation.z = -0.25;
      addGroup(antGroup, 2.2, 0.8, 1.8);

      // ─── 11. Receiver (RX) ───
      var rxGroup = new THREE.Group();
      var rxPcb = new THREE.Mesh(
        new THREE.BoxGeometry(0.18, 0.015, 0.12),
        pcbDarkM,
      );
      rxGroup.add(rxPcb);
      var rxChip = new THREE.Mesh(
        new THREE.BoxGeometry(0.06, 0.01, 0.06),
        chipM,
      );
      rxChip.position.y = 0.013;
      rxGroup.add(rxChip);
      // RX antenna wire
      var rxAnt = new THREE.Mesh(
        new THREE.CylinderGeometry(0.003, 0.003, 0.3, 4),
        wireBlkM,
      );
      rxAnt.rotation.z = -0.4;
      rxAnt.position.set(0, 0.15, 0);
      rxGroup.add(rxAnt);
      rxGroup.position.set(-0.2, 0.32, 0.25);
      addGroup(rxGroup, 1.4, -0.8, 1.3);

      // ─── 12. Landing pads ───
      var padPos = [
        [-0.38, -0.38],
        [0.38, -0.38],
        [-0.38, 0.38],
        [0.38, 0.38],
      ];
      padPos.forEach(function (p) {
        var legGroup = new THREE.Group();
        var leg = new THREE.Mesh(
          new THREE.CylinderGeometry(0.02, 0.02, 0.18, 6),
          metalM,
        );
        legGroup.add(leg);
        var pad = new THREE.Mesh(
          new THREE.CylinderGeometry(0.05, 0.05, 0.015, 8),
          rubberM,
        );
        pad.position.y = -0.1;
        legGroup.add(pad);
        legGroup.position.set(p[0], -0.05, p[1]);
        addGroup(legGroup, -1.8, p[0] * 2.2, p[1] * 2.2);
      });

      // ─── 13. Rear LEDs ───
      [2, 3].forEach(function (idx) {
        var ledGroup = new THREE.Group();
        var led1 = new THREE.Mesh(
          new THREE.BoxGeometry(0.05, 0.015, 0.05),
          ledM,
        );
        ledGroup.add(led1);
        var led2 = new THREE.Mesh(
          new THREE.BoxGeometry(0.05, 0.015, 0.05),
          ledRedM,
        );
        led2.position.x = 0.07;
        ledGroup.add(led2);
        var t = tips[idx];
        ledGroup.position.set(t.x * 0.5, 0.08, t.z * 0.5);
        addGroup(ledGroup, 0.5, armExp[idx].ex, armExp[idx].ez);
      });

      // ─── 14. Buzzer ───
      var buzzer = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.04, 0.02, 12),
        chipM,
      );
      buzzer.position.set(-0.3, 0.28, -0.3);
      addPart(buzzer, 1.2, -1.0, -1.0);

      // ─── 15. GPS module (optional) ───
      var gpsGroup = new THREE.Group();
      var gpsPcb = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.12, 0.015, 16),
        pcbM,
      );
      gpsGroup.add(gpsPcb);
      var gpsCeramic = new THREE.Mesh(
        new THREE.BoxGeometry(0.12, 0.01, 0.12),
        new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.6 }),
      );
      gpsCeramic.position.y = 0.013;
      gpsGroup.add(gpsCeramic);
      // GPS mast
      var gpsMast = new THREE.Mesh(
        new THREE.CylinderGeometry(0.008, 0.008, 0.15, 6),
        metalM,
      );
      gpsMast.position.y = -0.08;
      gpsGroup.add(gpsMast);
      gpsGroup.position.set(0, 0.55, 0.1);
      addGroup(gpsGroup, 2.8, 0, 0.5);

      drone.rotation.x = -0.12;
      scene.add(drone);

      /* ── GSAP Scroll ──────────────────────────────── */

      var scrollProg = { value: 0 };
      var rotYVal = { value: 0 };

      gsap.to(scrollProg, {
        value: 1,
        ease: "none",
        scrollTrigger: {
          trigger: document.body,
          start: "top top",
          end: "bottom bottom",
          scrub: 1.5,
        },
      });
      gsap.to(rotYVal, {
        value: Math.PI * 1.5,
        ease: "none",
        scrollTrigger: {
          trigger: document.body,
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
        },
      });

      /* ── Mouse ────────────────────────────────────── */

      var mx = 0,
        my = 0;
      document.addEventListener("mousemove", function (e) {
        mx = ((e.clientX / window.innerWidth) * 2 - 1) * 0.12;
        my = ((e.clientY / window.innerHeight) * 2 - 1) * 0.06;
      });

      /* ── Resize ───────────────────────────────────── */

      window.addEventListener("resize", function () {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      });

      /* ── Render ────────────────────────────────────── */

      var clock = new THREE.Clock();

      (function render() {
        requestAnimationFrame(render);
        var t = clock.getElapsedTime();

        drone.rotation.y = rotYVal.value + mx + Math.sin(t * 0.3) * 0.03;
        drone.rotation.x = -0.12 + my + Math.sin(t * 0.2) * 0.015;
        drone.position.y = Math.sin(t * 0.8) * 0.05;

        var p = scrollProg.value;
        var ease = p < 0.08 ? 0 : Math.min((p - 0.08) / 0.65, 1);
        ease = ease * ease * (3 - 2 * ease);

        for (var i = 0; i < parts.length; i++) {
          var pt = parts[i];
          var tx = pt.origX + pt.ex * ease;
          var ty = pt.origY + pt.ey * ease;
          var tz = pt.origZ + pt.ez * ease;
          pt.mesh.position.x += (tx - pt.mesh.position.x) * 0.1;
          pt.mesh.position.y += (ty - pt.mesh.position.y) * 0.1;
          pt.mesh.position.z += (tz - pt.mesh.position.z) * 0.1;
        }

        var spin = 1 - ease * 0.7;
        propGroups.forEach(function (pg) {
          pg.group.rotation.y += pg.speed * 0.016 * spin;
          pg.disc.opacity = 0.06 * spin;
        });

        accentL.intensity = 0.6 + Math.sin(t * 1.5) * 0.12;
        renderer.render(scene, camera);
      })();
    } // end if(hasThree && container)

    /* ════════════════════════════════════════════════
       Typed.js & Section Animations
       ════════════════════════════════════════════════ */

    if (window.Typed) {
      new Typed(".typed-drone-subtitle", {
        strings: [
          "Building custom FPV quadcopters from scratch.",
          '7" Long-Range \u2022 Bee35 Cinewhoop \u2022 5" Freestyle.',
          "SpeedyBee F7/F405 \u2022 RadioMaster ELRS \u2022 Analog VTX.",
        ],
        typeSpeed: 36,
        backSpeed: 24,
        backDelay: 2200,
        loop: true,
        showCursor: true,
        cursorChar: "|",
      });
    }

    initScrollObservers(["drone-builds-list", "extras-list"]);
    initCardTilt(".drone-card");
  } // end main

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", main);
  } else {
    main();
  }
})();
