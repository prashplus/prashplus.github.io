/**
 * main.js — Main page logic
 * Depends on: utils.js, anime.js, typed.js
 */
document.addEventListener("DOMContentLoaded", function () {
  // Shared init (server-disassembly.js handles the 3D background)
  initScrollProgress();
  initParticleNetwork("particle-canvas");
  initHeroEntrance();

  // Typed.js subtitle
  if (window.Typed) {
    new Typed(".typed-subtitle", {
      strings: [
        "I build things for the web and cloud.",
        "I architect resilient cloud infrastructure.",
        "I optimize large-scale distributed HPC systems.",
      ],
      typeSpeed: 38,
      backSpeed: 25,
      backDelay: 2200,
      loop: true,
      showCursor: true,
      cursorChar: "|",
    });
  }

  // Scroll observers for sections
  initScrollObservers([
    "experience-list",
    "projects-list",
    "skills-list",
    "extras-list",
    "contact-list",
  ]);

  // 3D card tilt on project cards
  initCardTilt(".project-card");

  // Project category filter
  var filterButtons = document.querySelectorAll(".filter-btn");
  var projectCards = document.querySelectorAll(".project-card");

  filterButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      filterButtons.forEach(function (b) {
        b.classList.remove("active");
      });
      btn.classList.add("active");

      var filter = btn.getAttribute("data-filter");

      projectCards.forEach(function (card) {
        var category = card.getAttribute("data-category");
        if (filter === "all" || category === filter) {
          card.style.display = "flex";
          if (window.anime) {
            anime({
              targets: card,
              scale: [0.85, 1],
              opacity: [0, 1],
              duration: 400,
              easing: "easeOutQuad",
            });
          }
        } else {
          if (window.anime) {
            anime({
              targets: card,
              scale: [1, 0.85],
              opacity: [1, 0],
              duration: 300,
              easing: "easeInQuad",
              complete: function () {
                card.style.display = "none";
              },
            });
          } else {
            card.style.display = "none";
          }
        }
      });
    });
  });
});
