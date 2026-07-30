/**
 * github-projects.js — GitHub projects page logic
 * Depends on: utils.js, anime.js, typed.js
 */
document.addEventListener("DOMContentLoaded", function () {

  initScrollProgress();
  initParticleNetwork("particle-canvas");
  initHeroEntrance();

  if (window.Typed) {
    new Typed(".typed-gh-subtitle", {
      strings: [
        "HPC &bull; Cloud &bull; Machine Learning &bull; DevOps",
        "Docker &bull; Kubernetes &bull; MPI &bull; Neural Networks",
        "Open source contributions and experiments.",
      ],
      typeSpeed: 36, backSpeed: 24, backDelay: 2200,
      loop: true, showCursor: true, cursorChar: "|",
    });
  }

  initScrollObservers([]);

  // ── GitHub API ────────────────────────────────

  var USER = "prashplus";
  var API = "https://api.github.com/users/" + USER + "/repos?per_page=100&sort=updated";
  var grid = document.getElementById("github-grid");
  var sortCtrl = document.getElementById("sort-controls");
  var allRepos = [];

  var langColors = {
    "JavaScript":"#f1e05a","TypeScript":"#3178c6","Python":"#3572A5",
    "C++":"#f34b7d","C":"#555555","C#":"#178600","Go":"#00ADD8",
    "Java":"#b07219","Kotlin":"#A97BFF","Ruby":"#701516",
    "Shell":"#89e051","PowerShell":"#012456","HTML":"#e34c26",
    "CSS":"#563d7c","Jupyter Notebook":"#DA5B0B","Makefile":"#427819",
    "ASP.NET":"#9400ff","Dockerfile":"#384d54",
  };

  function timeAgo(d) {
    var s = Math.floor((new Date() - new Date(d)) / 1000);
    var iv = [{l:"year",s:31536000},{l:"month",s:2592000},{l:"week",s:604800},{l:"day",s:86400},{l:"hour",s:3600}];
    for (var i = 0; i < iv.length; i++) {
      var c = Math.floor(s / iv[i].s);
      if (c >= 1) return c + " " + iv[i].l + (c > 1 ? "s" : "") + " ago";
    }
    return "just now";
  }

  function renderRepos(repos) {
    if (!grid) return;
    grid.innerHTML = "";
    repos.forEach(function (r, idx) {
      var card = document.createElement("div");
      card.className = "glass-panel github-card";
      card.style.opacity = "0";

      var dot = r.language && langColors[r.language]
        ? '<span class="language-dot" style="background:'+langColors[r.language]+'"></span>' : "";
      var stars = r.stargazers_count > 0
        ? '<span><i class="fas fa-star" style="color:#F2C94C"></i> '+r.stargazers_count+'</span>' : "";
      var forks = r.forks_count > 0
        ? '<span><i class="fas fa-code-branch" style="color:#56CCF2"></i> '+r.forks_count+'</span>' : "";

      card.innerHTML =
        '<div class="github-card-header"><a href="'+r.html_url+'" target="_blank" rel="noopener noreferrer" class="github-card-name"><i class="fas fa-folder-open" style="color:var(--accent);font-size:0.9rem"></i> '+r.name+'</a></div>' +
        '<p class="github-card-desc">'+(r.description||"No description provided.")+'</p>' +
        '<div class="github-card-meta">'+(r.language?'<span>'+dot+' '+r.language+'</span>':'')+stars+forks+'<span style="margin-left:auto">'+timeAgo(r.updated_at)+'</span></div>';

      grid.appendChild(card);
      if (window.anime) {
        anime({targets:card, opacity:[0,1], translateY:[30,0], easing:"easeOutQuart", duration:600, delay:idx*60});
      } else { card.style.opacity = "1"; }
    });
  }

  function sortRepos(by) {
    var s = allRepos.slice();
    if (by === "stars") s.sort(function(a,b){return b.stargazers_count-a.stargazers_count;});
    else if (by === "name") s.sort(function(a,b){return a.name.localeCompare(b.name);});
    else s.sort(function(a,b){return new Date(b.updated_at)-new Date(a.updated_at);});
    renderRepos(s);
  }

  function showError(msg) {
    if (!grid) return;
    grid.innerHTML = '<div class="github-error" style="grid-column:1/-1"><p><i class="fas fa-exclamation-triangle" style="color:var(--accent);font-size:1.5rem"></i></p><p>'+msg+'</p><button onclick="location.reload()">Retry</button></div>';
  }

  if (sortCtrl) {
    sortCtrl.addEventListener("click", function(e) {
      var btn = e.target.closest(".sort-btn");
      if (!btn) return;
      sortCtrl.querySelectorAll(".sort-btn").forEach(function(b){b.classList.remove("active");});
      btn.classList.add("active");
      sortRepos(btn.dataset.sort);
    });
  }

  fetch(API)
    .then(function(res) { if (!res.ok) throw new Error("HTTP "+res.status); return res.json(); })
    .then(function(repos) {
      allRepos = repos.filter(function(r) { return !r.fork && !r.archived && r.name !== USER; });
      sortRepos("updated");
    })
    .catch(function(err) {
      console.error("GitHub fetch failed:", err);
      showError("Failed to load repositories. GitHub API may be rate-limited.");
    });
});
