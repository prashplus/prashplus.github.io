/**
 * server-disassembly.js — Scroll-driven 3D server/SoC disassembly
 * Depends on: three.js (r128), gsap, ScrollTrigger
 */
(function () {
  function init() {
    if (typeof THREE === "undefined" || typeof gsap === "undefined") return;
    gsap.registerPlugin(ScrollTrigger);

    var container = document.getElementById("server-3d-container");
    if (!container) return;

    /* ── Renderer ────────────────────────────────── */

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(
      38,
      window.innerWidth / window.innerHeight,
      0.1,
      100,
    );
    camera.position.set(7, 5.5, 9);
    camera.lookAt(0, 0, 0);

    var renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);

    /* ── Lighting ────────────────────────────────── */

    scene.add(new THREE.AmbientLight(0xc0d0e0, 0.9));
    var key = new THREE.DirectionalLight(0xffffff, 1.3);
    key.position.set(5, 10, 7);
    scene.add(key);
    var fill = new THREE.PointLight(0x2563eb, 0.5, 30);
    fill.position.set(-4, 3, 5);
    scene.add(fill);
    var rim = new THREE.PointLight(0x7c3aed, 0.25, 20);
    rim.position.set(3, -2, -5);
    scene.add(rim);

    /* ── Materials ───────────────────────────────── */

    var chassisM = new THREE.MeshStandardMaterial({
      color: 0x2d2d35,
      metalness: 0.7,
      roughness: 0.35,
    });
    var boardM = new THREE.MeshStandardMaterial({
      color: 0x1a5c3a,
      metalness: 0.3,
      roughness: 0.6,
    });
    var boardDarkM = new THREE.MeshStandardMaterial({
      color: 0x145230,
      metalness: 0.3,
      roughness: 0.7,
    });
    var chipM = new THREE.MeshStandardMaterial({
      color: 0x1a1a20,
      metalness: 0.85,
      roughness: 0.15,
    });
    var heatsinkM = new THREE.MeshStandardMaterial({
      color: 0x8899aa,
      metalness: 0.75,
      roughness: 0.25,
    });
    var copperM = new THREE.MeshStandardMaterial({
      color: 0xb87333,
      metalness: 0.8,
      roughness: 0.3,
    });
    var ramM = new THREE.MeshStandardMaterial({
      color: 0x1e6e3e,
      metalness: 0.4,
      roughness: 0.5,
    });
    var ramChipM = new THREE.MeshStandardMaterial({
      color: 0x111115,
      metalness: 0.8,
      roughness: 0.2,
    });
    var fanM = new THREE.MeshStandardMaterial({
      color: 0x333340,
      metalness: 0.5,
      roughness: 0.4,
    });
    var accentM = new THREE.MeshStandardMaterial({
      color: 0x2563eb,
      emissive: 0x2563eb,
      emissiveIntensity: 0.6,
    });
    var ledRedM = new THREE.MeshStandardMaterial({
      color: 0xff3333,
      emissive: 0xff3333,
      emissiveIntensity: 1.0,
    });
    var ledGreenM = new THREE.MeshStandardMaterial({
      color: 0x33ff33,
      emissive: 0x33ff33,
      emissiveIntensity: 0.8,
    });
    var psuM = new THREE.MeshStandardMaterial({
      color: 0x3a3a45,
      metalness: 0.5,
      roughness: 0.5,
    });
    var silverM = new THREE.MeshStandardMaterial({
      color: 0xcccccc,
      metalness: 0.85,
      roughness: 0.2,
    });
    var goldM = new THREE.MeshStandardMaterial({
      color: 0xdaa520,
      metalness: 0.9,
      roughness: 0.15,
    });
    var cableBlkM = new THREE.MeshStandardMaterial({
      color: 0x111111,
      roughness: 0.8,
    });
    var cableRedM = new THREE.MeshStandardMaterial({
      color: 0xcc2222,
      roughness: 0.8,
    });
    var cableYelM = new THREE.MeshStandardMaterial({
      color: 0xccaa22,
      roughness: 0.8,
    });

    /* ── Model ──────────────────────────────────── */

    var model = new THREE.Group();
    var parts = [];

    function addPart(mesh, ey, ex, ez) {
      model.add(mesh);
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
      model.add(group);
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

    // ─── 1. Bottom chassis ───
    var base = new THREE.Group();
    base.add(new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.08, 3.0), chassisM));
    // Rubber feet
    [
      [-1.8, -0.06, -1.2],
      [1.8, -0.06, -1.2],
      [-1.8, -0.06, 1.2],
      [1.8, -0.06, 1.2],
    ].forEach(function (p) {
      var foot = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.1, 0.04, 8),
        new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.9 }),
      );
      foot.position.set(p[0], p[1], p[2]);
      base.add(foot);
    });
    // Vent slots on bottom
    for (var vs = 0; vs < 6; vs++) {
      var slot = new THREE.Mesh(
        new THREE.BoxGeometry(0.8, 0.09, 0.03),
        chassisM,
      );
      slot.position.set(0.5, 0, -1.0 + vs * 0.4);
      base.add(slot);
    }
    base.position.y = -0.85;
    addGroup(base, -2.0, 0, 0);

    // ─── 2. Motherboard PCB ───
    var pcb = new THREE.Group();
    var mainBoard = new THREE.Mesh(
      new THREE.BoxGeometry(3.8, 0.06, 2.6),
      boardM,
    );
    pcb.add(mainBoard);
    // PCB traces (copper lines)
    for (var tr = 0; tr < 12; tr++) {
      var trace = new THREE.Mesh(
        new THREE.BoxGeometry(0.5 + Math.random() * 1.5, 0.065, 0.015),
        copperM,
      );
      trace.position.set(
        -1.2 + Math.random() * 2.4,
        0,
        -1.0 + Math.random() * 2.0,
      );
      pcb.add(trace);
    }
    // SMD capacitors
    for (var cap = 0; cap < 20; cap++) {
      var c = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 0.06), ramChipM);
      c.position.set(
        -1.5 + Math.random() * 3.0,
        0.04,
        -1.0 + Math.random() * 2.0,
      );
      pcb.add(c);
    }
    // Resistor arrays
    for (var ra = 0; ra < 8; ra++) {
      var res = new THREE.Mesh(
        new THREE.BoxGeometry(0.06, 0.03, 0.03),
        new THREE.MeshStandardMaterial({ color: 0x332211, roughness: 0.7 }),
      );
      res.position.set(
        -1.0 + Math.random() * 2.0,
        0.04,
        -0.8 + Math.random() * 1.6,
      );
      pcb.add(res);
    }
    // Screw holes (4 corners)
    [
      [-1.7, 0.035, -1.1],
      [1.7, 0.035, -1.1],
      [-1.7, 0.035, 1.1],
      [1.7, 0.035, 1.1],
    ].forEach(function (p) {
      var hole = new THREE.Mesh(
        new THREE.RingGeometry(0.03, 0.06, 12),
        silverM,
      );
      hole.rotation.x = -Math.PI / 2;
      hole.position.set(p[0], p[1], p[2]);
      pcb.add(hole);
    });
    // Mounting standoffs
    [
      [-1.7, -0.06, -1.1],
      [1.7, -0.06, -1.1],
      [-1.7, -0.06, 1.1],
      [1.7, -0.06, 1.1],
    ].forEach(function (p) {
      var standoff = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.04, 0.12, 8),
        silverM,
      );
      standoff.position.set(p[0], p[1], p[2]);
      pcb.add(standoff);
    });
    pcb.position.y = -0.65;
    addGroup(pcb, -0.8, 0, 0);

    // ─── 3. CPU / SoC ───
    var cpuGroup = new THREE.Group();
    // IHS (Integrated Heat Spreader)
    var ihs = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.06, 0.75), silverM);
    cpuGroup.add(ihs);
    // Die beneath IHS
    var die = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.03, 0.35), chipM);
    die.position.y = -0.04;
    cpuGroup.add(die);
    // Gold contact pads on bottom
    for (var gx = 0; gx < 8; gx++) {
      for (var gz = 0; gz < 8; gz++) {
        var pad = new THREE.Mesh(
          new THREE.BoxGeometry(0.025, 0.005, 0.025),
          goldM,
        );
        pad.position.set(-0.14 + gx * 0.04, -0.055, -0.14 + gz * 0.04);
        cpuGroup.add(pad);
      }
    }
    // Accent glow ring
    var cpuRing = new THREE.Mesh(
      new THREE.RingGeometry(0.4, 0.44, 32),
      accentM,
    );
    cpuRing.rotation.x = -Math.PI / 2;
    cpuRing.position.y = 0.035;
    cpuGroup.add(cpuRing);
    cpuGroup.position.set(-0.3, -0.52, 0);
    addGroup(cpuGroup, 0.8, -0.6, 0);

    // ─── 4. Heatsink (detailed fins + heatpipes) ───
    var hsGroup = new THREE.Group();
    // Fins
    for (var fi = 0; fi < 14; fi++) {
      var fin = new THREE.Mesh(
        new THREE.BoxGeometry(0.65, 0.015, 0.65),
        heatsinkM,
      );
      fin.position.y = fi * 0.04;
      hsGroup.add(fin);
    }
    // Heatpipes (copper tubes running through fins)
    for (var hp = 0; hp < 3; hp++) {
      var pipe = new THREE.Mesh(
        new THREE.CylinderGeometry(0.025, 0.025, 0.6, 8),
        copperM,
      );
      pipe.position.set(-0.15 + hp * 0.15, 0.27, 0);
      hsGroup.add(pipe);
    }
    // Base plate
    var hsBase = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.03, 0.7), copperM);
    hsBase.position.y = -0.02;
    hsGroup.add(hsBase);
    hsGroup.position.set(-0.3, -0.3, 0);
    addGroup(hsGroup, 1.8, -0.6, 0);

    // ─── 5. Cooling fan assembly ───
    var fanAssembly = new THREE.Group();
    // Fan shroud
    var shroud = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.12, 0.8), fanM);
    fanAssembly.add(shroud);
    // Circular opening
    var fanRing = new THREE.Mesh(new THREE.RingGeometry(0.3, 0.35, 24), fanM);
    fanRing.rotation.x = -Math.PI / 2;
    fanRing.position.y = 0.065;
    fanAssembly.add(fanRing);
    // Hub
    var hub = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.06, 0.06, 16),
      silverM,
    );
    hub.position.y = 0.065;
    fanAssembly.add(hub);
    // Blades
    for (var bl = 0; bl < 7; bl++) {
      var blade = new THREE.Mesh(
        new THREE.BoxGeometry(0.25, 0.008, 0.05),
        fanM,
      );
      var angle = (bl / 7) * Math.PI * 2;
      blade.position.set(Math.cos(angle) * 0.15, 0.065, Math.sin(angle) * 0.15);
      blade.rotation.y = angle;
      fanAssembly.add(blade);
    }
    // Mounting screws
    [
      [-0.32, 0.065, -0.32],
      [0.32, 0.065, -0.32],
      [-0.32, 0.065, 0.32],
      [0.32, 0.065, 0.32],
    ].forEach(function (p) {
      var screw = new THREE.Mesh(
        new THREE.CylinderGeometry(0.02, 0.02, 0.02, 8),
        silverM,
      );
      screw.position.set(p[0], p[1], p[2]);
      fanAssembly.add(screw);
    });
    fanAssembly.position.set(-0.3, 0.28, 0);
    addGroup(fanAssembly, 2.8, -0.6, 0);

    // ─── 6. RAM sticks (4x, detailed) ───
    for (var ri = 0; ri < 4; ri++) {
      var ramStick = new THREE.Group();
      // PCB
      var ramPcb = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.5, 1.3), ramM);
      ramStick.add(ramPcb);
      // DRAM chips on both sides
      for (var rc = 0; rc < 8; rc++) {
        var dram = new THREE.Mesh(
          new THREE.BoxGeometry(0.065, 0.08, 0.1),
          ramChipM,
        );
        dram.position.set(0, -0.15 + rc * 0.06, -0.45 + rc * 0.11);
        ramStick.add(dram);
      }
      // Gold contact fingers
      for (var gf = 0; gf < 16; gf++) {
        var finger = new THREE.Mesh(
          new THREE.BoxGeometry(0.062, 0.02, 0.015),
          goldM,
        );
        finger.position.set(0, -0.25, -0.5 + gf * 0.065);
        ramStick.add(finger);
      }
      // Notch
      var notch = new THREE.Mesh(
        new THREE.BoxGeometry(0.065, 0.04, 0.03),
        boardDarkM,
      );
      notch.position.set(0, -0.23, 0.1);
      ramStick.add(notch);
      // Label sticker
      var label = new THREE.Mesh(
        new THREE.BoxGeometry(0.063, 0.15, 0.4),
        new THREE.MeshStandardMaterial({ color: 0xeeeeee, roughness: 0.9 }),
      );
      label.position.set(0, 0.1, 0);
      ramStick.add(label);

      ramStick.position.set(0.9 + ri * 0.16, -0.3, 0);
      addGroup(ramStick, 0.4 + ri * 0.35, 1.8 + ri * 0.3, 0);
    }

    // ─── 7. NVMe SSD ───
    var ssdGroup = new THREE.Group();
    var ssdPcb = new THREE.Mesh(
      new THREE.BoxGeometry(0.7, 0.03, 0.25),
      boardDarkM,
    );
    ssdGroup.add(ssdPcb);
    // NAND chip
    var nand = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.02, 0.18), chipM);
    nand.position.set(-0.1, 0.025, 0);
    ssdGroup.add(nand);
    // Controller chip
    var ctrl = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.015, 0.12), chipM);
    ctrl.position.set(0.2, 0.025, 0);
    ssdGroup.add(ctrl);
    // M.2 connector gold pins
    for (var mp = 0; mp < 10; mp++) {
      var mpin = new THREE.Mesh(
        new THREE.BoxGeometry(0.015, 0.005, 0.02),
        goldM,
      );
      mpin.position.set(0.33, -0.017, -0.1 + mp * 0.022);
      ssdGroup.add(mpin);
    }
    // Label
    var ssdLabel = new THREE.Mesh(
      new THREE.BoxGeometry(0.25, 0.005, 0.12),
      accentM,
    );
    ssdLabel.position.set(-0.15, 0.04, 0);
    ssdGroup.add(ssdLabel);
    ssdGroup.position.set(-1.3, -0.55, -0.8);
    addGroup(ssdGroup, -0.3, -1.8, -1.2);

    // ─── 8. PSU ───
    var psuGroup = new THREE.Group();
    var psuBody = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.55, 1.9), psuM);
    psuGroup.add(psuBody);
    // Fan grill (circles)
    for (var gr = 0; gr < 3; gr++) {
      var grill = new THREE.Mesh(
        new THREE.RingGeometry(0.08 + gr * 0.06, 0.1 + gr * 0.06, 20),
        fanM,
      );
      grill.rotation.z = Math.PI / 2;
      grill.position.set(-0.48, 0, 0);
      psuGroup.add(grill);
    }
    // Power cables out
    var cables = [
      { m: cableBlkM, z: -0.3 },
      { m: cableRedM, z: -0.15 },
      { m: cableYelM, z: 0 },
      { m: cableBlkM, z: 0.15 },
    ];
    cables.forEach(function (cb) {
      var cable = new THREE.Mesh(
        new THREE.CylinderGeometry(0.015, 0.015, 0.4, 6),
        cb.m,
      );
      cable.rotation.x = Math.PI / 2;
      cable.position.set(0, 0.15, cb.z + 0.95);
      psuGroup.add(cable);
    });
    // PSU label
    var psuLabel = new THREE.Mesh(
      new THREE.BoxGeometry(0.96, 0.25, 0.5),
      new THREE.MeshStandardMaterial({
        color: 0x444455,
        metalness: 0.3,
        roughness: 0.6,
      }),
    );
    psuLabel.position.set(0, 0, -0.5);
    psuGroup.add(psuLabel);
    // Power switch
    var pwrSwitch = new THREE.Mesh(
      new THREE.BoxGeometry(0.06, 0.08, 0.04),
      new THREE.MeshStandardMaterial({ color: 0xcc0000, roughness: 0.5 }),
    );
    pwrSwitch.position.set(-0.48, -0.15, -0.7);
    psuGroup.add(pwrSwitch);

    psuGroup.position.set(-1.5, -0.45, 0.3);
    addGroup(psuGroup, 0, -2.5, 0);

    // ─── 9. VRM / Power delivery module ───
    var vrmGroup = new THREE.Group();
    for (var v = 0; v < 6; v++) {
      var vrm = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.1, 0.12), chipM);
      vrm.position.set(v * 0.14, 0, 0);
      vrmGroup.add(vrm);
      // Tiny inductor coil
      var coil = new THREE.Mesh(
        new THREE.CylinderGeometry(0.035, 0.035, 0.04, 8),
        copperM,
      );
      coil.position.set(v * 0.14, 0.07, 0);
      vrmGroup.add(coil);
    }
    vrmGroup.position.set(-0.8, -0.55, -1.0);
    addGroup(vrmGroup, -0.2, 0, -1.8);

    // ─── 10. CMOS battery ───
    var battery = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.1, 0.03, 16),
      silverM,
    );
    battery.position.set(1.4, -0.58, -0.9);
    addPart(battery, -0.1, 2.0, -1.0);

    // ─── 11. BIOS chip ───
    var bios = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.04, 0.08), chipM);
    bios.position.set(1.4, -0.58, -0.5);
    addPart(bios, -0.1, 2.0, -0.5);

    // ─── 12. Top lid ───
    var lid = new THREE.Group();
    var lidPlate = new THREE.Mesh(
      new THREE.BoxGeometry(4.2, 0.06, 3.0),
      chassisM,
    );
    lid.add(lidPlate);
    // Vent holes
    for (var vr = 0; vr < 8; vr++) {
      for (var vc = 0; vc < 3; vc++) {
        var vent = new THREE.Mesh(
          new THREE.BoxGeometry(0.3, 0.065, 0.02),
          chassisM,
        );
        vent.position.set(-0.8 + vr * 0.35, 0, -0.3 + vc * 0.3);
        lid.add(vent);
      }
    }
    // Logo badge
    var badge = new THREE.Mesh(
      new THREE.BoxGeometry(0.4, 0.008, 0.15),
      accentM,
    );
    badge.position.set(0, 0.035, -1.2);
    lid.add(badge);
    lid.position.y = 0.55;
    addGroup(lid, 3.5, 0, 0);

    // ─── 13. Front panel ───
    var frontGroup = new THREE.Group();
    var frontPlate = new THREE.Mesh(
      new THREE.BoxGeometry(4.2, 1.3, 0.06),
      chassisM,
    );
    frontGroup.add(frontPlate);
    // Drive bay slots
    for (var db = 0; db < 2; db++) {
      var bay = new THREE.Mesh(
        new THREE.BoxGeometry(1.2, 0.18, 0.065),
        new THREE.MeshStandardMaterial({
          color: 0x222230,
          metalness: 0.6,
          roughness: 0.4,
        }),
      );
      bay.position.set(-0.8, 0.3 - db * 0.25, 0);
      frontGroup.add(bay);
    }
    // Power button
    var pwrBtn = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.06, 0.02, 16),
      silverM,
    );
    pwrBtn.rotation.x = Math.PI / 2;
    pwrBtn.position.set(1.5, 0.45, 0.03);
    frontGroup.add(pwrBtn);
    // Power LED
    var pwrLed = new THREE.Mesh(new THREE.CircleGeometry(0.025, 12), ledGreenM);
    pwrLed.position.set(1.3, 0.45, 0.035);
    frontGroup.add(pwrLed);
    // HDD LED
    var hddLed = new THREE.Mesh(new THREE.CircleGeometry(0.02, 12), ledRedM);
    hddLed.position.set(1.15, 0.45, 0.035);
    frontGroup.add(hddLed);
    // USB ports
    for (var usb = 0; usb < 2; usb++) {
      var usbPort = new THREE.Mesh(
        new THREE.BoxGeometry(0.12, 0.06, 0.03),
        chipM,
      );
      usbPort.position.set(1.5, 0.15 - usb * 0.12, 0.03);
      frontGroup.add(usbPort);
    }
    frontGroup.position.set(0, -0.15, -1.53);
    addGroup(frontGroup, 0, 0, -2.5);

    // ─── 14. Side panel ───
    var sideGroup = new THREE.Group();
    var sidePlate = new THREE.Mesh(
      new THREE.BoxGeometry(0.06, 1.3, 3.0),
      chassisM,
    );
    sideGroup.add(sidePlate);
    // Vent mesh
    for (var sv = 0; sv < 5; sv++) {
      var svent = new THREE.Mesh(
        new THREE.BoxGeometry(0.065, 0.02, 1.5),
        chassisM,
      );
      svent.position.set(0, -0.3 + sv * 0.15, 0);
      sideGroup.add(svent);
    }
    sideGroup.position.set(2.13, -0.15, 0);
    addGroup(sideGroup, 0, 3.0, 0);

    // ─── 15. Rear I/O panel ───
    var ioGroup = new THREE.Group();
    var ioPlate = new THREE.Mesh(
      new THREE.BoxGeometry(3.0, 0.6, 0.05),
      silverM,
    );
    ioGroup.add(ioPlate);
    // Ethernet ports
    for (var ep = 0; ep < 4; ep++) {
      var eth = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.12, 0.06), chipM);
      eth.position.set(-1.0 + ep * 0.25, 0.1, 0);
      ioGroup.add(eth);
    }
    // USB ports
    for (var rp = 0; rp < 4; rp++) {
      var rUsb = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.06, 0.06), chipM);
      rUsb.position.set(0.3 + rp * 0.2, 0.1, 0);
      ioGroup.add(rUsb);
    }
    // VGA/Display port
    var vga = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 0.1, 0.06),
      new THREE.MeshStandardMaterial({ color: 0x2222aa, roughness: 0.5 }),
    );
    vga.position.set(1.2, 0.1, 0);
    ioGroup.add(vga);
    ioGroup.position.set(0, 0.1, 1.53);
    addGroup(ioGroup, 0, 0, 2.5);

    // ─── 16. SATA cables ───
    var sataGroup = new THREE.Group();
    for (var sc = 0; sc < 3; sc++) {
      var sata = new THREE.Mesh(
        new THREE.CylinderGeometry(0.01, 0.01, 1.0, 6),
        cableRedM,
      );
      sata.rotation.z = Math.PI / 4;
      sata.position.set(0.5, 0, -0.3 + sc * 0.3);
      sataGroup.add(sata);
      // Connector
      var conn = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.04, 0.04), chipM);
      conn.position.set(0.85, 0.35, -0.3 + sc * 0.3);
      sataGroup.add(conn);
    }
    sataGroup.position.set(-0.5, -0.55, 0.5);
    addGroup(sataGroup, 0.5, -1.0, 1.5);

    // ─── 17. PCIe slot + GPU placeholder ───
    var pcieGroup = new THREE.Group();
    var pcieSlot = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 0.04, 0.12),
      chipM,
    );
    pcieGroup.add(pcieSlot);
    // GPU card
    var gpu = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.5, 0.04), boardDarkM);
    gpu.position.set(-0.05, 0.27, 0);
    pcieGroup.add(gpu);
    // GPU heatsink
    var gpuHS = new THREE.Mesh(
      new THREE.BoxGeometry(0.9, 0.15, 0.06),
      heatsinkM,
    );
    gpuHS.position.set(-0.05, 0.27, 0.05);
    pcieGroup.add(gpuHS);
    // GPU fan
    var gpuFan = new THREE.Mesh(new THREE.RingGeometry(0.08, 0.12, 16), fanM);
    gpuFan.position.set(-0.05, 0.27, 0.085);
    pcieGroup.add(gpuFan);
    // Gold contacts
    for (var gc = 0; gc < 20; gc++) {
      var gcon = new THREE.Mesh(
        new THREE.BoxGeometry(0.015, 0.005, 0.04),
        goldM,
      );
      gcon.position.set(-0.5 + gc * 0.05, -0.02, 0);
      pcieGroup.add(gcon);
    }
    pcieGroup.position.set(0, -0.55, 0.8);
    addGroup(pcieGroup, 0.3, 0, 2.0);

    model.rotation.x = -0.1;
    scene.add(model);

    /* ── GSAP Scroll ────────────────────────────── */

    var scrollProgress = { value: 0 };
    var rotY = { value: 0 };

    gsap.to(scrollProgress, {
      value: 1,
      ease: "none",
      scrollTrigger: {
        trigger: document.body,
        start: "top top",
        end: "bottom bottom",
        scrub: 1.5,
      },
    });
    gsap.to(rotY, {
      value: Math.PI * 1.2,
      ease: "none",
      scrollTrigger: {
        trigger: document.body,
        start: "top top",
        end: "bottom bottom",
        scrub: 1,
      },
    });

    /* ── Resize ──────────────────────────────────── */

    window.addEventListener("resize", function () {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    /* ── Render ──────────────────────────────────── */

    var clock = new THREE.Clock();

    (function render() {
      requestAnimationFrame(render);
      var t = clock.getElapsedTime();

      model.rotation.y = rotY.value + Math.sin(t * 0.3) * 0.04;
      model.rotation.x = -0.1 + Math.sin(t * 0.2) * 0.015;

      var p = scrollProgress.value;
      var ease = p < 0.08 ? 0 : Math.min((p - 0.08) / 0.6, 1);
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

      // Spin fan
      if (fanAssembly) fanAssembly.rotation.y += 0.03 * (1 - ease * 0.8);

      fill.intensity = 0.5 + Math.sin(t * 1.5) * 0.12;
      renderer.render(scene, camera);
    })();
  } // end init

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
