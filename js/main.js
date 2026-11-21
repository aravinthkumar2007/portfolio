/* ============================================================
   Aravinth Kumar — Portfolio Interactions (jQuery + vanilla)
   ============================================================ */

(function ($) {
  'use strict';

  $(function () {

    /* ---------- Preloader ---------- */
    $(window).on('load', function () {
      setTimeout(function () {
        $('#preloader').addClass('hidden');
        startCounters();
      }, 900);
    });
    setTimeout(function () { $('#preloader').addClass('hidden'); }, 2200);

    $('#year').text(new Date().getFullYear());

    /* ---------- SEO: resolve absolute URLs at runtime ---------- */
    var pageUrl = window.location.href.split('#')[0];
    $('#canonicalUrl').attr('href', pageUrl);
    $('#ogUrl').attr('content', pageUrl);
    var schemaEl = document.getElementById('schemaJson');
    if (schemaEl) {
      try {
        var schema = JSON.parse(schemaEl.textContent);
        schema['@graph'].forEach(function (node) { if ('url' in node) node.url = pageUrl; });
        schemaEl.textContent = JSON.stringify(schema);
      } catch (e) {}
    }

    /* ---------- Theme (dark / light) ---------- */
    var isLight = false;
    try { isLight = localStorage.getItem('ak-theme') === 'light'; } catch (e) { isLight = false; }
    if (isLight) {
      document.body.classList.add('light-theme');
      document.documentElement.setAttribute('data-theme', 'light');
    }
    function syncThemeIcon() {
      $('#themeIcon').attr('class', isLight ? 'fa-solid fa-moon' : 'fa-solid fa-sun');
      $('#themeToggle').attr('title', isLight ? 'Switch to dark theme' : 'Switch to light theme');
    }
    syncThemeIcon();
    $('#themeToggle').on('click', function () {
      isLight = !isLight;
      document.body.classList.toggle('light-theme', isLight);
      if (isLight) document.documentElement.setAttribute('data-theme', 'light');
      else document.documentElement.removeAttribute('data-theme');
      try { localStorage.setItem('ak-theme', isLight ? 'light' : 'dark'); } catch (e) {}
      syncThemeIcon();
      if (window.akReveal) window.akReveal();
    });

    /* ---------- Animated coding background (real code lines) ---------- */
    var canvas = document.getElementById('codeCanvas');
    var ctx = canvas.getContext('2d');
    var CODE_LINES = [
      'const dev = "Aravinth";',
      'function buildApp() {',
      '  return <MERN />;',
      '}',
      'app.get("/api", handler);',
      'await db.collection("users")',
      'mongoose.connect(uri);',
      'useState(0);',
      'npm install react',
      'git commit -m "ship it"',
      'if (logic) solve();',
      'console.log("Hello, world!");',
      'export default App;',
      'className="active"',
      'res.status(200).json(data);',
      'while (coding) learn();',
      'import express from "express";',
      'prompt => betterOutput'
    ];
    var fontSize = 14;
    var gap = 190;
    var streams = [];
    var darkPalette = { base: '#7dd3fc', keyword: '#c084fc', string: '#86efac', number: '#fbbf24', comment: '#64748b' };
    var lightPalette = { base: '#0e7490', keyword: '#7c3aed', string: '#047857', number: '#b45309', comment: '#94a3b8' };
    var KEYWORDS = ['const', 'function', 'return', 'await', 'import', 'from', 'export', 'default', 'if', 'while', 'new', 'let', 'var'];
    var TOKEN_RE = /("[^"]*"|'[^']*'|\/\/.*$|\b(?:const|function|return|await|import|from|export|default|if|while|new|let|var)\b|\b\d+\b|\s+)/g;

    function tokenColor(token, palette) {
      if (/^\s+$/.test(token)) return null;
      if (/^["']/.test(token)) return palette.string;
      if (/^\/\//.test(token)) return palette.comment;
      if (/^\d+$/.test(token)) return palette.number;
      if (KEYWORDS.indexOf(token) !== -1) return palette.keyword;
      return palette.base;
    }

    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      var count = Math.max(6, Math.ceil(canvas.width / gap) + 1);
      streams = [];
      for (var i = 0; i < count; i++) {
        streams.push({
          x: i * gap + 12,
          y: Math.random() * canvas.height,
          speed: 0.35 + Math.random() * 0.75,
          line: Math.floor(Math.random() * CODE_LINES.length),
          alpha: 0.5 + Math.random() * 0.5
        });
      }
    }
    resizeCanvas();
    $(window).on('resize', resizeCanvas);

    function drawCodeLine(line, x, y, palette, alpha) {
      var parts = line.split(TOKEN_RE);
      var cursor = x;
      for (var p = 0; p < parts.length; p++) {
        var token = parts[p];
        if (!token) continue;
        var color = tokenColor(token, palette);
        if (color) {
          ctx.fillStyle = color;
          ctx.globalAlpha = alpha;
          ctx.fillText(token, cursor, y);
        }
        cursor += ctx.measureText(token).width;
      }
      ctx.globalAlpha = 0.3 * alpha;
      ctx.fillStyle = palette.comment;
      ctx.fillText('// keep coding', x, y - fontSize * 2.1);
      ctx.globalAlpha = 1;
    }

    function drawRain() {
      var w = canvas.width, h = canvas.height;
      ctx.fillStyle = isLight ? 'rgba(243, 246, 251, 0.13)' : 'rgba(7, 11, 20, 0.11)';
      ctx.fillRect(0, 0, w, h);
      ctx.font = fontSize + 'px "Fira Code", monospace';
      ctx.textBaseline = 'top';
      var palette = isLight ? lightPalette : darkPalette;

      for (var i = 0; i < streams.length; i++) {
        var s = streams[i];
        drawCodeLine(CODE_LINES[s.line], s.x, s.y, palette, s.alpha);
        s.y += s.speed * 5;
        if (s.y > h + 30) {
          s.y = -fontSize * 4;
          s.line = Math.floor(Math.random() * CODE_LINES.length);
          s.speed = 0.35 + Math.random() * 0.75;
          s.alpha = 0.5 + Math.random() * 0.5;
        }
      }
    }
    setInterval(drawRain, 45);

    /* ---------- Typing effect ---------- */
    var phrases = [
      'Full Stack Developer', 'MERN Stack Enthusiast', 'Logical Thinker',
      'AI Prompt Engineer', 'Problem Solver'
    ];
    var typedEl = document.getElementById('typedText');
    var pIndex = 0, charIndex = 0, deleting = false;

    function typeTick() {
      if (!typedEl) return;
      var current = phrases[pIndex];
      if (!deleting) {
        typedEl.textContent = current.substring(0, charIndex + 1);
        charIndex++;
        if (charIndex === current.length) { deleting = true; return setTimeout(typeTick, 1800); }
        setTimeout(typeTick, 90);
      } else {
        typedEl.textContent = current.substring(0, charIndex - 1);
        charIndex--;
        if (charIndex === 0) {
          deleting = false;
          pIndex = (pIndex + 1) % phrases.length;
          return setTimeout(typeTick, 350);
        }
        setTimeout(typeTick, 45);
      }
    }
    setTimeout(typeTick, 1800);

    /* ---------- Scroll reveal ---------- */
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    function initReveal() {
      document.querySelectorAll('.reveal').forEach(function (el, i) {
        if (el.classList.contains('visible')) return;
        el.style.transitionDelay = (i % 4) * 70 + 'ms';
        revealObserver.observe(el);
      });
    }
    initReveal();
    window.akReveal = initReveal;

    /* ---------- Counters ---------- */
    var countersDone = false;
    function startCounters() {
      if (countersDone) return;
      countersDone = true;
      $('.counter').each(function () {
        var $el = $(this);
        var target = parseInt($el.attr('data-target'), 10);
        var suffix = $el.attr('data-suffix') || '';
        $({ count: 0 }).animate({ count: target }, {
          duration: 1600, easing: 'swing',
          step: function () { $el.text(Math.floor(this.count) + suffix); },
          complete: function () { $el.text(target + suffix); }
        });
      });
    }
    var statsEl = document.querySelector('.stats-section');
    if (statsEl) {
      var counterObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) { startCounters(); counterObserver.disconnect(); }
        });
      }, { threshold: 0.5 });
      counterObserver.observe(statsEl);
    }

    /* ---------- Fallback content (works even if React CDN is blocked) ---------- */
    var FB_SKILLS = [
      { name: 'HTML5', icon: 'devicon-html5-plain colored', cat: 'Frontend', color: '#e34f26' },
      { name: 'CSS3', icon: 'devicon-css3-plain colored', cat: 'Frontend', color: '#2965f1' },
      { name: 'JavaScript', icon: 'devicon-javascript-plain colored', cat: 'Frontend', color: '#f7df1e' },
      { name: 'jQuery', icon: 'devicon-jquery-plain colored', cat: 'Frontend', color: '#0769ad' },
      { name: 'Bootstrap', icon: 'devicon-bootstrap-plain colored', cat: 'Frontend', color: '#7952b3' },
      { name: 'React', icon: 'devicon-react-original colored', cat: 'Frontend', color: '#61dafb' },
      { name: 'Node.js', icon: 'devicon-nodejs-plain colored', cat: 'Backend', color: '#339933' },
      { name: 'Express.js', icon: 'devicon-express-original', cat: 'Backend', color: '#b9b9b9' },
      { name: 'MongoDB', icon: 'devicon-mongodb-plain colored', cat: 'Database', color: '#47a248' },
      { name: 'Cursor', icon: 'fa-solid fa-code', cat: 'AI & Tools', color: '#a78bfa' },
      { name: 'Antigravity', icon: 'fa-solid fa-rocket', cat: 'AI & Tools', color: '#f43f5e' },
      { name: 'Lovable AI', icon: 'fa-solid fa-heart', cat: 'AI & Tools', color: '#f472b6' },
      { name: 'Prompt Engineer', icon: 'fa-solid fa-comment-dots', cat: 'AI & Tools', color: '#22d3ee' }
    ];
    var FB_CATS = ['All', 'Frontend', 'Backend', 'Database', 'AI & Tools'];
    var FB_BARS = [
      { name: 'HTML / CSS', level: 92 }, { name: 'JavaScript', level: 82 },
      { name: 'React', level: 78 }, { name: 'Node & Express', level: 72 },
      { name: 'MongoDB', level: 68 }, { name: 'Prompt Engineering', level: 75 }
    ];
    var FB_PROJECTS = [
      { title: 'Personal Portfolio', type: 'Frontend', icon: 'fa-solid fa-user-astronaut',
        desc: 'A fully animated, responsive portfolio website showcasing skills, projects and contact — built with clean UI and smooth interactions.',
        tags: ['HTML', 'CSS', 'JavaScript', 'React'], gradient: 'linear-gradient(135deg,#0f766e,#22d3ee)' },
      { title: 'Healthcare System', type: 'Full Stack · MERN', icon: 'fa-solid fa-heartbeat',
        desc: 'A healthcare management application to organise patient records and streamline hospital workflows with a modern, intuitive dashboard.',
        tags: ['React', 'Node.js', 'Express', 'MongoDB'], gradient: 'linear-gradient(135deg,#7c3aed,#f472b6)' },
      { title: 'Appointment Management', type: 'Full Stack · MERN', icon: 'fa-solid fa-calendar-check',
        desc: 'A smart appointment booking system for scheduling, managing and tracking appointments with an easy-to-use interface and reliable backend.',
        tags: ['React', 'Express', 'MongoDB'], gradient: 'linear-gradient(135deg,#2563eb,#38bdf8)' }
    ];

    function skillCardHtml(s) {
      return '<div class="skill-card" style="--card-color:' + s.color + ';--card-glow:' + s.color + '">' +
        '<div class="skill-logo"><i class="' + s.icon + '"></i></div>' +
        '<span class="skill-name">' + s.name + '</span>' +
        '<span class="skill-cat">' + s.cat + '</span></div>';
    }
    function renderFallbackSkills(filter) {
      var list = (!filter || filter === 'All') ? FB_SKILLS : FB_SKILLS.filter(function (s) { return s.cat === filter; });
      var html = '<div class="skill-filter">' + FB_CATS.map(function (c) {
        return '<button class="filter-btn' + ((!filter || filter === 'All' ? 'All' : filter) === c ? ' active' : '') +
          '" data-filter="' + c + '">' + c + '</button>';
      }).join('') + '</div><div class="skills-grid">' + list.map(skillCardHtml).join('') + '</div>';
      $('#skills-root').html(html);
    }
    function renderFallback() {
      if ($('#skills-root').children().length === 0) {
        renderFallbackSkills('All');
        $(document).on('click', '#skills-root .filter-btn', function () {
          renderFallbackSkills($(this).attr('data-filter'));
        });
      }
      if ($('#bars-root').children().length === 0) {
        $('#bars-root').html(FB_BARS.map(function (b) {
          return '<div class="skill-bar-item"><div class="skill-bar-top"><span>' + b.name +
            '</span><span>' + b.level + '%</span></div><div class="skill-bar-track">' +
            '<div class="skill-bar-fill" data-level="' + b.level + '" style="width:' + b.level + '%"></div></div></div>';
        }).join(''));
      }
      if ($('#projects-root').children().length === 0) {
        $('#projects-root').html('<div class="row g-4">' + FB_PROJECTS.map(function (p) {
          return '<div class="col-md-6 col-lg-4"><article class="projects-card">' +
            '<div class="project-banner" style="background:' + p.gradient + '"><i class="' + p.icon + '"></i></div>' +
            '<div class="project-body"><span class="project-type">' + p.type + '</span>' +
            '<h5>' + p.title + '</h5><p>' + p.desc + '</p><div class="project-tags">' +
            p.tags.map(function (t) { return '<span>' + t + '</span>'; }).join('') +
            '</div></div></article></div>';
        }).join('') + '</div>');
      }
      onScroll();
    }
    setTimeout(renderFallback, 900);

    /* ---------- Navbar scroll state + progress + active link ---------- */
    var sections = $('section[id]');
    function onScroll() {
      var y = $(window).scrollTop();
      var docH = $(document).height() - $(window).height();
      var progress = docH > 0 ? (y / docH) * 100 : 0;
      $('#scrollProgress').css('width', progress + '%');

      $('#mainNav').toggleClass('scrolled', y > 50);
      $('#backToTop').toggleClass('show', y > 400);

      var current = '';
      sections.each(function () {
        if (y >= $(this).offset().top - 120) current = $(this).attr('id');
      });
      $('.navbar-nav .nav-link').removeClass('active');
      $('.navbar-nav .nav-link[href="#' + current + '"]').addClass('active');

      $('#bars-root .skill-bar-fill').each(function () {
        var $bar = $(this);
        if ($bar.attr('data-filled')) return;
        if (y + $(window).height() > $bar.offset().top + 20) {
          $bar.attr('data-filled', '1').css('width', $bar.attr('data-level') + '%');
        }
      });
    }
    $(window).on('scroll', onScroll);
    onScroll();
    setTimeout(onScroll, 1300);

    /* ---------- Back to top ---------- */
    $('#backToTop').on('click', function () { $('html, body').animate({ scrollTop: 0 }, 700); });

    /* ---------- Smooth scroll + close mobile menu ---------- */
    $('a[href^="#"]').on('click', function (e) {
      var hash = $(this).attr('href');
      if (hash && hash !== '#' && $(hash).length) {
        e.preventDefault();
        $('html, body').animate({ scrollTop: $(hash).offset().top - 70 }, 750);
        var collapse = bootstrap.Collapse.getInstance(document.getElementById('navMenu'));
        if (collapse) collapse.hide();
      }
    });

    /* ---------- Card tilt effect (desktop only) ---------- */
    if (window.matchMedia('(pointer: fine)').matches) {
      $(document).on('mousemove', '.skill-card, .projects-card', function (e) {
        var rect = this.getBoundingClientRect();
        var x = (e.clientX - rect.left) / rect.width - 0.5;
        var y = (e.clientY - rect.top) / rect.height - 0.5;
        $(this).css('transform', 'perspective(700px) rotateY(' + (x * 8) + 'deg) rotateX(' + (-y * 8) + 'deg) translateY(-8px)');
      });
      $(document).on('mouseleave', '.skill-card, .projects-card', function () { $(this).css('transform', ''); });
    }

  });
})(jQuery);
