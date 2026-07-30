/**
 * Shared utilities for all pages.
 * - Scroll progress bar
 * - Particle network canvas background
 * - Scroll intersection observers
 * - Card tilt effect
 */

/* ── Scroll Progress Bar ──────────────────────── */

function initScrollProgress() {
  var bar = document.getElementById("scroll-progress");
  if (!bar) return;

  function update() {
    var total = document.documentElement.scrollHeight - window.innerHeight;
    if (total > 0) {
      bar.style.width = ((window.scrollY / total) * 100).toFixed(2) + "%";
    }
  }

  window.addEventListener("scroll", update, { passive: true });
  update();
}

/* ── Particle Network Canvas ──────────────────── */

function initParticleNetwork(canvasId) {
  var canvas = document.getElementById(canvasId || "particle-canvas");
  if (!canvas) return;

  var ctx = canvas.getContext("2d");
  var mouseX = -1000;
  var mouseY = -1000;

  var CONNECTION_DIST = 150;
  var REPEL_DIST = 120;
  var REPEL_FORCE = 0.8;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  resize();
  window.addEventListener("resize", resize);

  document.addEventListener("mousemove", function (e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  var count = Math.min(
    Math.floor((window.innerWidth * window.innerHeight) / 12000),
    120,
  );
  var particles = [];

  for (var i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: 1 + Math.random() * 2,
    });
  }

  function frame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];

      // Mouse repulsion
      var dx = p.x - mouseX;
      var dy = p.y - mouseY;
      var d = Math.sqrt(dx * dx + dy * dy);
      if (d < REPEL_DIST && d > 0) {
        var f = (1 - d / REPEL_DIST) * REPEL_FORCE;
        p.vx += (dx / d) * f;
        p.vy += (dy / d) * f;
      }

      // Damping
      p.vx *= 0.99;
      p.vy *= 0.99;

      // Keep particles moving
      var speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
      if (speed < 0.15) {
        p.vx += (Math.random() - 0.5) * 0.05;
        p.vy += (Math.random() - 0.5) * 0.05;
      }

      p.x += p.vx;
      p.y += p.vy;

      // Wrap edges
      if (p.x < -10) p.x = canvas.width + 10;
      if (p.x > canvas.width + 10) p.x = -10;
      if (p.y < -10) p.y = canvas.height + 10;
      if (p.y > canvas.height + 10) p.y = -10;

      // Draw dot
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(37, 99, 235, 0.35)";
      ctx.fill();
    }

    // Draw connections
    ctx.lineWidth = 0.6;
    for (var i = 0; i < particles.length; i++) {
      for (var j = i + 1; j < particles.length; j++) {
        var dx = particles[i].x - particles[j].x;
        var dy = particles[i].y - particles[j].y;
        var d = Math.sqrt(dx * dx + dy * dy);
        if (d < CONNECTION_DIST) {
          var alpha = (1 - d / CONNECTION_DIST) * 0.2;
          ctx.strokeStyle = "rgba(37, 99, 235, " + alpha + ")";
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}

/* ── Scroll Section Observers ─────────────────── */

function initScrollObservers(listIds) {
  if (!window.anime) return;

  var opts = { root: null, rootMargin: "0px", threshold: 0.1 };

  var titleObs = new IntersectionObserver(function (entries, obs) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      if (entry.target.classList.contains("section-title")) {
        anime({
          targets: entry.target,
          opacity: [0, 1],
          translateX: [-25, 0],
          easing: "easeOutQuart",
          duration: 800,
        });
      } else if (
        entry.target.classList.contains("glass-panel") &&
        !entry.target.classList.contains("project-card")
      ) {
        anime({
          targets: entry.target,
          opacity: [0, 1],
          translateY: [40, 0],
          easing: "easeOutQuart",
          duration: 1000,
        });
      }
      obs.unobserve(entry.target);
    });
  }, opts);

  var listObs = new IntersectionObserver(function (entries, obs) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      var items = entry.target.querySelectorAll(".animate-item, .skill-pill");
      if (items.length > 0) {
        anime({
          targets: items,
          translateY: [35, 0],
          opacity: [0, 1],
          easing: "easeOutElastic(1, .8)",
          duration: 1000,
          delay: anime.stagger(120),
        });
      }
      obs.unobserve(entry.target);
    });
  }, opts);

  // Hide elements until they scroll into view
  document
    .querySelectorAll(
      ".animate-title, .animate-panel, .animate-item, .skill-pill",
    )
    .forEach(function (el) {
      el.style.opacity = "0";
    });

  // Observe titles & panels
  document
    .querySelectorAll(".animate-title, .animate-panel")
    .forEach(function (el) {
      titleObs.observe(el);
    });

  // Observe list containers
  (listIds || []).forEach(function (id) {
    var el = document.getElementById(id);
    if (el) listObs.observe(el);
  });
}

/* ── Hero Entrance Animation ──────────────────── */

function initHeroEntrance() {
  if (!window.anime) return;

  anime
    .timeline({ easing: "easeOutExpo" })
    .add({
      targets: "nav",
      translateY: [-50, 0],
      opacity: [0, 1],
      duration: 900,
    })
    .add(
      {
        targets: ".animate-hero",
        translateY: [20, 0],
        opacity: [0, 1],
        duration: 800,
        delay: anime.stagger(140),
      },
      "-=400",
    );
}

/* ── 3D Card Tilt Effect ──────────────────────── */

function initCardTilt(selector) {
  document.querySelectorAll(selector).forEach(function (card) {
    card.addEventListener("mousemove", function (e) {
      var rect = card.getBoundingClientRect();
      var x = e.clientX - rect.left;
      var y = e.clientY - rect.top;

      card.style.setProperty("--mouse-x", x + "px");
      card.style.setProperty("--mouse-y", y + "px");

      var rx = ((y - rect.height / 2) / (rect.height / 2)) * -8;
      var ry = ((x - rect.width / 2) / (rect.width / 2)) * 8;

      card.style.transform =
        "perspective(1000px) rotateX(" +
        rx.toFixed(2) +
        "deg) rotateY(" +
        ry.toFixed(2) +
        "deg) translateY(-8px)";
    });

    card.addEventListener("mouseleave", function () {
      card.style.transform =
        "perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)";
    });
  });
}
