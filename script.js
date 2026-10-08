document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Mobile Navigation Toggle
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });

    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
        });
    });

    // 2. Scroll Reveal Animation
    const revealElements = document.querySelectorAll('.reveal');

    const revealOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };

    const revealOnScroll = new IntersectionObserver(function(entries, observer) {
        entries.forEach(entry => {
            if (!entry.isIntersecting) {
                return;
            } else {
                entry.target.classList.add('show');
                observer.unobserve(entry.target);
            }
        });
    }, revealOptions);

    revealElements.forEach(el => {
        revealOnScroll.observe(el);
    });

    // 4. Typing Animation untuk Nama
    const typedTextElement = document.getElementById('typed-text');
    const fullName = "Jason Alexander Wijaya";
    let charIndex = 0;
    const typingSpeed = 100;

    function typeName() {
        if (charIndex < fullName.length) {
            typedTextElement.textContent += fullName.charAt(charIndex);
            charIndex++;
            setTimeout(typeName, typingSpeed);
        }
    }

    // Mulai mengetik setelah intro loading selesai (dipanggil dari bagian wow di bawah)
    let typingStarted = false;
    window.startTyping = () => {
        if (typingStarted) return;
        typingStarted = true;
        typedTextElement.textContent = '';
        charIndex = 0;
        typeName();
    };
    setTimeout(window.startTyping, 4000); // cadangan kalau intro tidak berjalan

});

document.addEventListener('DOMContentLoaded', () => {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
    const $ = (s) => [...document.querySelectorAll(s)];
    const add = (tag, cls, parent = document.body) => {
        const e = document.createElement(tag);
        e.className = cls;
        parent.appendChild(e);
        return e;
    };

    // 1. Aurora, progress bar, cursor glow, tombol ke atas, toast
    add('div', 'aurora');
    const bar = add('div', 'scroll-progress');
    const glow = fine ? add('div', 'cursor-glow') : null;
    const toTop = add('button', 'to-top');
    toTop.innerHTML = '<i class="fas fa-arrow-up"></i>';
    toTop.setAttribute('aria-label', 'Kembali ke atas');
    toTop.onclick = () => scrollTo({ top: 0 });
    const toast = add('div', 'toast');

    addEventListener('scroll', () => {
        const h = document.documentElement.scrollHeight - innerHeight;
        bar.style.width = (h > 0 ? (scrollY / h) * 100 : 0) + '%';
        toTop.classList.toggle('show', scrollY > 600);
    }, { passive: true });

    if (glow) {
        addEventListener('pointermove', e => {
            glow.style.transform = `translate(${e.clientX - 250}px, ${e.clientY - 250}px)`;
        });
    }

    // 2. Partikel jaringan interaktif di hero (menghindari kursor)
    const hero = document.getElementById('hero');
    if (hero && !reduce) {
        const cv = add('canvas', 'hero-canvas', hero);
        const ctx = cv.getContext('2d');
        let w, h, pts = [], m = { x: -999, y: -999 }, visible = true;
        const size = () => {
            w = cv.width = hero.offsetWidth;
            h = cv.height = hero.offsetHeight;
            const n = Math.min(70, Math.floor((w * h) / 16000));
            pts = Array.from({ length: n }, () => ({
                x: Math.random() * w, y: Math.random() * h,
                vx: (Math.random() - .5) * .4, vy: (Math.random() - .5) * .4
            }));
        };
        size();
        addEventListener('resize', size);
        hero.addEventListener('pointermove', e => {
            const r = cv.getBoundingClientRect();
            m.x = e.clientX - r.left; m.y = e.clientY - r.top;
        });
        hero.addEventListener('pointerleave', () => { m.x = -999; });
        new IntersectionObserver(e => { visible = e[0].isIntersecting; }).observe(hero);

        (function loop() {
            if (visible) {
                ctx.clearRect(0, 0, w, h);
                pts.forEach((p, i) => {
                    p.x += p.vx; p.y += p.vy;
                    if (p.x < 0 || p.x > w) p.vx *= -1;
                    if (p.y < 0 || p.y > h) p.vy *= -1;
                    const dx = p.x - m.x, dy = p.y - m.y, d = Math.hypot(dx, dy);
                    if (d < 120 && d > 0) { p.x += (dx / d) * 1.5; p.y += (dy / d) * 1.5; }
                    ctx.fillStyle = 'rgba(6,182,212,.7)';
                    ctx.beginPath(); ctx.arc(p.x, p.y, 1.8, 0, 7); ctx.fill();
                    for (let j = i + 1; j < pts.length; j++) {
                        const q = pts[j], l = Math.hypot(p.x - q.x, p.y - q.y);
                        if (l < 120) {
                            ctx.strokeStyle = `rgba(59,130,246,${.25 * (1 - l / 120)})`;
                            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
                        }
                    }
                });
            }
            requestAnimationFrame(loop);
        })();
    }

    // 3. Kartu muncul bertahap
    const io = new IntersectionObserver((entries, ob) => entries.forEach(x => {
        if (x.isIntersecting) { x.target.classList.add('in'); ob.unobserve(x.target); }
    }), { threshold: 0.1 });
    ['.stats-grid', '.skills-grid', '.projects-container', '.timeline', '.contact-grid'].forEach(g =>
        $(g).forEach(c => [...c.children].forEach((el, i) => {
            el.classList.add('stagger');
            el.style.setProperty('--d', (i % 8) * 70 + 'ms');
            io.observe(el);
        })));

    // 4. Spotlight + efek miring 3D pada kartu
    $('.project-card, .stat-card, .skill-card').forEach(c => {
        c.classList.add('spot');
        c.addEventListener('pointermove', e => {
            const r = c.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
            c.style.setProperty('--mx', x + 'px');
            c.style.setProperty('--my', y + 'px');
            if (reduce || !fine) return;
            const max = c.classList.contains('project-card') ? 4 : 10;
            const rx = (y / r.height - .5) * -max, ry = (x / r.width - .5) * max;
            c.style.transition = 'transform .1s, border-color .3s, box-shadow .3s, background .3s';
            c.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-6px)`;
        });
        c.addEventListener('pointerleave', () => { c.style.transform = ''; c.style.transition = ''; });
    });

    // 5. Tombol magnetik
    if (fine && !reduce) {
        $('.btn-primary, .btn-secondary, .btn-resume-download, .btn-resume-view, .social-links a').forEach(b => {
            b.addEventListener('pointermove', e => {
                const r = b.getBoundingClientRect();
                b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .25}px, ${(e.clientY - r.top - r.height / 2) * .35}px)`;
            });
            b.addEventListener('pointerleave', () => { b.style.transform = ''; });
        });
    }

    // 6. Menu navbar aktif sesuai bagian yang sedang dilihat
    const links = $('.nav-links a[href^="#"]');
    const so = new IntersectionObserver(en => en.forEach(x => {
        if (x.isIntersecting) links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + x.target.id));
    }), { rootMargin: '-45% 0px -50% 0px' });
    ['about', 'skills', 'personal-projects', 'projects', 'contact'].forEach(id => {
        const s = document.getElementById(id);
        if (s) so.observe(s);
    });

    // 7. Klik info kontak untuk menyalin
    let t;
    const say = msg => {
        toast.textContent = msg;
        toast.classList.add('show');
        clearTimeout(t);
        t = setTimeout(() => toast.classList.remove('show'), 1800);
    };
    $('.contact-item p').forEach(p => {
        p.classList.add('copyable');
        p.title = 'Klik untuk menyalin';
        p.addEventListener('click', () => {
            const txt = p.textContent.trim();
            navigator.clipboard.writeText(txt).then(() => say('Tersalin: ' + txt), () => say('Gagal menyalin'));
        });
    });
});


// 8. Filter kategori Skills
document.addEventListener('DOMContentLoaded', () => {
    const grid = document.querySelector('.skills-grid');
    if (!grid) return;

    const categories = {
        'Programming': ['Python', 'Java', 'C', 'JavaScript', 'HTML5', 'CSS3', 'MySQL', 'Vercel'],
        'Data & BI': ['MySQL', 'Power BI', 'Pentaho', 'Tableau', 'Excel', 'Python'],
        'Design & Office': ['Figma', 'Canva', 'Excel', 'Word', 'PowerPoint']
    };

    const bar = document.createElement('div');
    bar.className = 'skill-filters';
    ['All', ...Object.keys(categories)].forEach((name, i) => {
        const b = document.createElement('button');
        b.className = 'filter-chip' + (i === 0 ? ' active' : '');
        b.textContent = name;
        b.setAttribute('aria-pressed', i === 0);
        b.addEventListener('click', () => {
            bar.querySelectorAll('.filter-chip').forEach(c => {
                c.classList.toggle('active', c === b);
                c.setAttribute('aria-pressed', c === b);
            });
            let n = 0;
            grid.querySelectorAll('.skill-card').forEach(card => {
                const skill = card.querySelector('span').textContent.trim();
                const show = name === 'All' || categories[name].includes(skill);
                card.classList.toggle('hide', !show);
                if (show) {
                    card.style.animation = 'none';
                    void card.offsetWidth; // restart animasi
                    card.style.setProperty('--d', (n++ * 40) + 'ms');
                    card.style.animation = '';
                }
            });
        });
        bar.appendChild(b);
    });
    grid.before(bar);
});

(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const el = (tag, cls, html, parent) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    if (parent) parent.append(e);
    return e;
  };
  const say = msg => {
    const t = $('.toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 1800);
  };
  const flash = c => {
    c.scrollIntoView({ behavior: 'smooth', block: 'center' });
    c.classList.add('flash');
    setTimeout(() => c.classList.remove('flash'), 2200);
  };

  /* 1. Tema terang / gelap */
  const root = document.documentElement;
  const nav = $('.navbar');
  const tools = el('div', 'nav-tools', null, nav);
  nav.insertBefore(tools, $('.hamburger'));
  const isMac = /Mac/i.test(navigator.platform);
  const palBtn = el('button', 'nav-btn kbd', `<i class="fas fa-magnifying-glass"></i><span>${isMac ? '⌘ K' : 'Ctrl K'}</span>`, tools);
  palBtn.title = 'Command palette';
  const themeBtn = el('button', 'nav-btn icon', '', tools);
  themeBtn.setAttribute('aria-label', 'Ganti tema');
  const setTheme = t => {
    root.dataset.theme = t;
    try { localStorage.setItem('theme', t); } catch (e) {}
    themeBtn.innerHTML = `<i class="fas fa-${t === 'light' ? 'moon' : 'sun'}"></i>`;
  };
  let saved = 'dark';
  try { saved = localStorage.getItem('theme') || 'dark'; } catch (e) {}
  setTheme(saved);
  themeBtn.onclick = () => setTheme(root.dataset.theme === 'light' ? 'dark' : 'light');

  /* 2. Confetti / percikan */
  const cv = el('canvas', 'fx', null, document.body);
  const cx = cv.getContext('2d');
  let ps = [], running = false;
  const fit = () => { cv.width = innerWidth; cv.height = innerHeight; };
  fit();
  addEventListener('resize', fit);
  const tick = () => {
    cx.clearRect(0, 0, cv.width, cv.height);
    ps = ps.filter(p => p.life > 0);
    ps.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.vy += .15; p.vx *= .99; p.life -= .016;
      cx.globalAlpha = Math.max(p.life, 0);
      cx.fillStyle = p.c;
      cx.fillRect(p.x, p.y, p.s, p.s * 1.6);
    });
    if (ps.length) requestAnimationFrame(tick); else running = false;
  };
  const burst = (x, y, n = 14, power = 5) => {
    if (reduce) return;
    for (let i = 0; i < n; i++) {
      const a = Math.random() * 6.28, v = (.4 + Math.random()) * power;
      ps.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 2, life: 1, s: 2 + Math.random() * 3,
        c: `hsl(${185 + Math.random() * 60},90%,60%)` });
    }
    if (!running) { running = true; tick(); }
  };
  const celebrate = () => {
    for (let i = 0; i < 8; i++)
      setTimeout(() => burst(innerWidth * (.1 + .8 * Math.random()), innerHeight * .3, 40, 8), i * 120);
  };
  addEventListener('pointerdown', e => burst(e.clientX, e.clientY, 10, 3.5));

  /* 3. Role yang berganti di hero */
  const h2 = $('.hero h2');
  if (h2) {
    const r = el('div', 'roles', 'Aspiring <b></b>');
    h2.after(r);
    const w = $('b', r), list = ['Data Analyst', 'Data Scientist', 'Data Engineer'];
    let i = 0;
    const swap = () => {
      w.textContent = list[i++ % list.length];
      w.classList.remove('in'); void w.offsetWidth; w.classList.add('in');
    };
    swap();
    setInterval(swap, 2400);
  }

  /* 7. Klik skill -> lihat dipakai di project mana */
  const grid = $('.skills-grid');
  if (grid) {
    const panel = el('div', 'skill-panel');
    grid.after(panel);
    const norm = s => ' ' + s.toLowerCase().replace(/[\/&]/g, ' ').replace(/\s+/g, ' ').trim() + ' ';
    const alias = { html5: 'html', css3: 'css' };
    const projects = $$('.project-card').map(c => ({
      c, name: $('h3', c).textContent.trim(),
      tags: $$('.tech-stack span', c).map(s => norm(s.textContent))
    }));
    $$('.skill-card', grid).forEach(card => card.addEventListener('click', () => {
      const name = $('span', card).textContent.trim();
      const key = ' ' + (alias[name.toLowerCase()] || name.toLowerCase()) + ' ';
      $$('.skill-card', grid).forEach(x => x.classList.toggle('picked', x === card));
      const hits = projects.filter(p => p.tags.some(t => t.includes(key)));
      panel.replaceChildren();
      panel.classList.add('open');
      el('strong', null, '', panel).textContent = name;
      el('span', null, '', panel).textContent = hits.length
        ? ` — used in ${hits.length} project${hits.length > 1 ? 's' : ''}`
        : ' — not tagged in any project yet';
      const row = el('div', 'panel-chips', null, panel);
      hits.forEach(h => {
        const b = el('button', 'chip-link', null, row);
        b.textContent = h.name;
        b.onclick = () => { h.c.classList.remove('hide'); flash(h.c); };
      });
    }));
  }

  /* 8. Command palette (Ctrl/Cmd + K) */
  const pal = el('div', 'palette',
    '<div class="pal-box"><input type="text" placeholder="Type a command or search… (Esc to close)" aria-label="Command palette"><ul></ul></div>',
    document.body);
  const inp = $('input', pal), list = $('ul', pal);
  const go = id => () => { const t = document.getElementById(id); if (t) t.scrollIntoView({ behavior: 'smooth' }); };
  const cmds = [
    ['fas fa-user', 'Go to About', go('about')],
    ['fas fa-code', 'Go to Skills', go('skills')],
    ['fas fa-rocket', 'Go to Personal Projects', go('personal-projects')],
    ['fas fa-graduation-cap', 'Go to Course Projects', go('projects')],
    ['fas fa-people-group', 'Go to Organizations', go('organizations')],
    ['fas fa-envelope', 'Go to Contact', go('contact')],
    ['fas fa-circle-half-stroke', 'Toggle light / dark theme', () => setTheme(root.dataset.theme === 'light' ? 'dark' : 'light')],
    ['fas fa-copy', 'Copy email address', () => navigator.clipboard.writeText('jason.jzhu168@gmail.com').then(() => say('Tersalin: jason.jzhu168@gmail.com'), () => say('Gagal menyalin'))],
    ['fab fa-github', 'Open GitHub', () => window.open('https://github.com/jasonalexanderjsnaldr', '_blank')],
    ['fas fa-download', 'Download resume', () => { const a = $('.btn-resume-download'); if (a) a.click(); }],
    ['fas fa-wand-magic-sparkles', 'Celebrate 🎉', celebrate],
    ...$$('.project-card').map(c => ['fas fa-folder-open', 'Project: ' + $('h3', c).textContent.trim(), () => flash(c)])
  ];
  let sel = 0, shown = [];
  const render = () => {
    const q = inp.value.trim().toLowerCase();
    shown = cmds.filter(c => c[1].toLowerCase().includes(q));
    sel = Math.min(sel, Math.max(shown.length - 1, 0));
    list.replaceChildren(...shown.map((c, i) => {
      const li = el('li', i === sel ? 'sel' : '', `<i class="${c[0]}"></i><span></span>`);
      $('span', li).textContent = c[1];
      li.onclick = () => run(i);
      return li;
    }));
    if (!shown.length) el('li', 'none', 'No results', list);
    const s = $('.sel', list);
    if (s) s.scrollIntoView({ block: 'nearest' });
  };
  const openPal = () => { pal.classList.add('open'); inp.value = ''; sel = 0; render(); inp.focus(); };
  const closePal = () => pal.classList.remove('open');
  const run = i => { const c = shown[i]; if (!c) return; closePal(); setTimeout(c[2], 50); };
  palBtn.onclick = openPal;
  inp.addEventListener('input', () => { sel = 0; render(); });
  pal.addEventListener('pointerdown', e => { if (e.target === pal) closePal(); });
  addEventListener('keydown', e => {
    const isOpen = pal.classList.contains('open');
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      isOpen ? closePal() : openPal();
      return;
    }
    if (!isOpen) return;
    if (e.key === 'Escape') closePal();
    else if (e.key === 'Enter') run(sel);
    else if (shown.length && e.key === 'ArrowDown') { e.preventDefault(); sel = (sel + 1) % shown.length; render(); }
    else if (shown.length && e.key === 'ArrowUp') { e.preventDefault(); sel = (sel - 1 + shown.length) % shown.length; render(); }
  });
})();

/* ===== wow.js — tambahan baru, tidak mengubah script.js ===== */
document.addEventListener('DOMContentLoaded', () => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const el = (tag, cls, html, parent) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html) e.innerHTML = html;
    if (parent) parent.append(e);
    return e;
  };
  const skills = $$('.skill-card span').map(s => s.textContent.trim());
  const cards = $$('.project-card');
  const reveal = new IntersectionObserver((en, ob) => en.forEach(x => {
    if (x.isIntersecting) { x.target.classList.add('show'); ob.unobserve(x.target); }
  }), { threshold: .15 });

  /* 1. Intro: logo + loading 0-100%, lalu nama diketik dari awal */
  const startTyping = () => window.startTyping && window.startTyping();
  if (reduce) {
    setTimeout(startTyping, 300);
  } else {
    const intro = el('div', 'intro', '<div class="intro-in"><div class="intro-logo">JW.</div><div class="intro-line"><i></i></div><div class="intro-pct">0%</div></div>', document.body);
    const pct = $('.intro-pct', intro), t0 = performance.now();
    (function n(t) {
      const p = Math.max(0, Math.min(100, Math.round((t - t0 - 300) / 12)));
      pct.textContent = p + '%';
      if (p < 100) requestAnimationFrame(n);
    })(t0);
    let done = false;
    const finish = () => { if (done) return; done = true; intro.remove(); startTyping(); };
    intro.addEventListener('animationend', e => { if (e.animationName === 'introOut') finish(); });
    setTimeout(finish, 2200);
  }

  /* 2. Marquee teknologi di bawah hero */
  const hero = $('#hero');
  if (hero && skills.length) {
    const m = el('div', 'marquee', '<div class="marquee-track"></div>');
    m.setAttribute('aria-hidden', 'true');
    [...skills, ...skills].forEach(s => { el('span', null, null, $('.marquee-track', m)).textContent = s; });
    hero.after(m);
  }

  /* 3. Terminal interaktif */
  const foot = $('#contact');
  if (!foot) return;
  const sec = el('section', 'section reveal', `<div class="section-header"><span class="section-tag">INTERACTIVE</span><h2>Ask My Terminal</h2></div>
    <div class="term"><div class="term-bar"><i></i><i></i><i></i><span>jason@portfolio: ~</span></div>
    <div class="term-body"><div class="term-out"></div><label class="term-row"><b>$</b><input type="text" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Terminal input"></label></div></div>
    <div class="term-chips"></div>`);
  foot.before(sec);
  reveal.observe(sec);

  const out = $('.term-out', sec), inp = $('input', sec), body = $('.term-body', sec);
  const print = (t, c) => { const d = el('div', c); d.textContent = t; out.append(d); body.scrollTop = body.scrollHeight; };
  const lines = (arr, c) => arr.forEach(l => print(l, c));
  const C = {
    help: () => print('Commands: ' + Object.keys(C).join(', '), 't-ok'),
    about: () => lines(['Jason Alexander Wijaya, Computer Science at BINUS University.',
      '5th semester, expected graduation 2028.',
      'Focus: data analytics, data engineering, and software logic.']),
    skills: () => print(skills.join(', ')),
    projects: () => { cards.forEach((c, i) => print(`[${i + 1}] ${$('h3', c).textContent.trim()}`)); print('Type "open <number>" to jump to a project.', 't-dim'); },
    open: n => {
      const c = cards[(+n || 0) - 1];
      if (!c) return print('No project with that number. Type "projects" to see the list.', 't-err');
      print('Opening ' + $('h3', c).textContent.trim() + '...', 't-ok');
      c.scrollIntoView({ behavior: 'smooth', block: 'center' });
      c.classList.add('flash');
      setTimeout(() => c.classList.remove('flash'), 2200);
    },
    contact: () => lines(['Email    jason.jzhu168@gmail.com', 'LinkedIn linkedin.com/in/jasonalexander8', 'GitHub   github.com/jasonalexanderjsnaldr', 'Location Jakarta, Indonesia']),
    theme: () => { const b = $('.nav-btn.icon'); if (b) b.click(); print('Theme switched.', 't-ok'); },
    hire: () => {
      lines(['Preparing offer letter...', 'Done. Jason is open to internships in data analytics, data science, and data engineering.'], 't-ok');
      if (!reduce) for (let i = 0; i < 6; i++) setTimeout(() => dispatchEvent(new PointerEvent('pointerdown', { clientX: innerWidth * (.15 + .7 * Math.random()), clientY: innerHeight * .35 })), i * 140);
    },
    clear: () => out.replaceChildren()
  };
  const hist = []; let hi = 0;
  const run = line => {
    print('$ ' + line, 't-dim');
    let [cmd, ...a] = line.toLowerCase().split(/\s+/);
    if (cmd === 'sudo') cmd = a.shift();
    if (C[cmd]) C[cmd](...a); else print(`command not found: ${cmd}. Type "help" to see what works.`, 't-err');
  };
  inp.addEventListener('keydown', e => {
    if (e.key === 'Enter' && inp.value.trim()) {
      hist.push(inp.value.trim()); hi = hist.length;
      run(inp.value.trim()); inp.value = '';
    } else if (e.key === 'ArrowUp' && hist.length) { e.preventDefault(); inp.value = hist[--hi < 0 ? (hi = 0) : hi]; }
    else if (e.key === 'ArrowDown' && hist.length) { e.preventDefault(); inp.value = hist[++hi] || (hi = hist.length, ''); }
    else if (e.key === 'Tab') {
      const m = Object.keys(C).find(k => inp.value && k.startsWith(inp.value.toLowerCase()));
      if (m) { e.preventDefault(); inp.value = m; }
    }
  });
  body.addEventListener('click', () => inp.focus({ preventScroll: true }));
  ['help', 'about', 'skills', 'projects', 'contact', 'sudo hire jason'].forEach(t => {
    const b = el('button', 'chip-link', null, $('.term-chips', sec));
    b.type = 'button'; b.textContent = t;
    b.onclick = () => run(t);
  });
  print('Welcome! Type "help" to see what I can do, or tap a command below.', 't-ok');
});

/* ===== extra.js — tambahan baru, tidak mengubah kode di atas ===== */
document.addEventListener('DOMContentLoaded', () => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const el = (t, c, h, p) => { const e = document.createElement(t); if (c) e.className = c; if (h) e.innerHTML = h; if (p) p.append(e); return e; };
  const once = (list, fn, opt) => {
    const io = new IntersectionObserver((en, ob) => en.forEach(x => { if (x.isIntersecting) { fn(x.target); ob.unobserve(x.target); } }), opt);
    list.forEach(t => io.observe(t));
  };

  /* 1. Kursor cincin + titik + jejak komet */
  if (fine && !reduce) {
    const ring = el('div', 'cur', null, document.body), dot = el('div', 'cur-dot', null, document.body);
    const tr = el('canvas', 'trail', null, document.body), tx = tr.getContext('2d'), hist = [];
    const fit = () => { tr.width = innerWidth; tr.height = innerHeight; };
    fit(); addEventListener('resize', fit);
    let mx = 0, my = 0, rx = 0, ry = 0, inside = false;
    addEventListener('pointermove', e => {
      if (!inside) { rx = e.clientX; ry = e.clientY; inside = true; ring.classList.add('on'); dot.classList.add('on'); }
      mx = e.clientX; my = e.clientY;
      dot.style.transform = `translate(${mx}px,${my}px) translate(-50%,-50%)`;
      ring.classList.toggle('link', !!(e.target.closest && e.target.closest('a,button,input,li,.skill-card,.copyable')));
    });
    addEventListener('pointerdown', () => ring.classList.add('down'));
    addEventListener('pointerup', () => ring.classList.remove('down'));
    document.documentElement.addEventListener('pointerleave', () => { inside = false; hist.length = 0; ring.classList.remove('on'); dot.classList.remove('on'); });
    (function f() {
      rx += (mx - rx) * .18; ry += (my - ry) * .18;
      ring.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%)`;
      tx.clearRect(0, 0, tr.width, tr.height);
      if (inside) {
        hist.push([mx, my]); if (hist.length > 26) hist.shift();
        tx.lineCap = 'round';
        for (let i = 1; i < hist.length; i++) {
          const a = hist[i - 1], b = hist[i], t = i / hist.length;
          if (Math.hypot(b[0] - a[0], b[1] - a[1]) < .5) continue;
          tx.strokeStyle = `rgba(6,182,212,${t * .55})`; tx.lineWidth = t * 8;
          tx.beginPath(); tx.moveTo(a[0], a[1]); tx.lineTo(b[0], b[1]); tx.stroke();
        }
      }
      requestAnimationFrame(f);
    })();
  }

  /* 2. Hero: token kode melayang dengan kedalaman (parallax) */
  const hero = $('#hero');
  if (hero) {
    const tk = el('div', 'tokens', null, hero);
    tk.setAttribute('aria-hidden', 'true');
    ['</>', 'SELECT *', 'import pandas', 'df.head()', 'JOIN', 'ETL', 'DAX', 'Spark', '{ }', 'git push', '0101', 'GROUP BY'].forEach((t, i) => {
      const s = el('span', null, null, tk);
      s.textContent = t;
      s.style.cssText = `left:${(i * 37 + 6) % 92}%;top:${(i * 53 + 8) % 86}%;--k:${(.4 + (i % 5) * .3).toFixed(1)};animation-delay:${-i * 1.3}s`;
    });
    if (!reduce) hero.addEventListener('pointermove', e => {
      const r = hero.getBoundingClientRect();
      hero.style.setProperty('--px', ((e.clientX - r.left) / r.width - .5) * 2);
      hero.style.setProperty('--py', ((e.clientY - r.top) / r.height - .5) * 2);
    });
  }

  /* 3. Ringkasan: kata-kata menyala satu per satu saat di-scroll */
  const st = $('.summary-text');
  if (st && !reduce) {
    const ws = st.textContent.trim().split(/\s+/).map(w => { const s = el('span', 'w'); s.textContent = w + ' '; return s; });
    st.textContent = '';
    st.append(...ws);
    const upd = () => {
      const n = clamp((innerHeight * .85 - st.getBoundingClientRect().top) / (innerHeight * .45)) * ws.length;
      ws.forEach((s, i) => s.classList.toggle('lit', i < n));
    };
    addEventListener('scroll', upd, { passive: true });
    upd();
  }

  /* 4. Marquee teknologi miring mengikuti kecepatan scroll */
  const mq = $('.marquee');
  if (mq && !reduce) {
    let ly = scrollY, tm;
    addEventListener('scroll', () => {
      mq.style.setProperty('--sk', clamp((scrollY - ly) * .6, -14, 14) + 'deg');
      ly = scrollY;
      clearTimeout(tm);
      tm = setTimeout(() => mq.style.setProperty('--sk', '0deg'), 100);
    }, { passive: true });
  }

  /* 5. Judul section "terdekripsi" saat muncul */
  const G = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<>/{}_';
  if (!reduce) once($$('.section-header h2'), h => {
    const s = h.textContent, t0 = performance.now();
    h.setAttribute('aria-label', s);
    (function f(t) {
      const p = (t - t0) / 800;
      h.textContent = p >= 1 ? s : [...s].map((ch, i) => /[\s&]/.test(ch) || i / s.length < p ? ch : G[Math.random() * G.length | 0]).join('');
      if (p < 1) requestAnimationFrame(f);
    })(t0);
  }, { threshold: .9 });

  /* 6. Garis timeline menyala sesuai posisi scroll */
  const tl = $('.timeline');
  if (tl) {
    const upd = () => tl.style.setProperty('--tp', clamp((innerHeight * .65 - tl.getBoundingClientRect().top) / tl.getBoundingClientRect().height));
    addEventListener('scroll', upd, { passive: true });
    upd();
  }

  /* 7. Teks raksasa "Let's work together": terisi warna di mana kursor berada */
  const foot = $('#contact');
  if (foot) {
    const a = el('a', 'big-cta', '<span>Let\'s work together</span><small>jason.jzhu168@gmail.com</small>');
    a.href = 'mailto:jason.jzhu168@gmail.com';
    foot.before(a);
    const sp = $('span', a);
    a.addEventListener('pointermove', e => {
      const r = sp.getBoundingClientRect();
      sp.style.setProperty('--mx', e.clientX - r.left + 'px');
      sp.style.setProperty('--my', e.clientY - r.top + 'px');
    });
  }
});

/* ===== extra2.js — tambahan ronde 3, tidak mengubah kode di atas ===== */
document.addEventListener('DOMContentLoaded', () => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const el = (t, c, h, p) => { const e = document.createElement(t); if (c) e.className = c; if (h) e.innerHTML = h; if (p) p.append(e); return e; };

  /* 1. Skill Sphere 3D: skill berputar di bola, klik untuk lihat dipakai di project mana */
  const sk = $('#skills'), names = $$('#skills .skill-card span').map(s => s.textContent.trim());
  if (sk && names.length > 2) {
    const box = el('div', 'sphere', '<canvas></canvas><p>Hover to spin · click a skill to see where I used it</p>');
    $('.section-header', sk).after(box);
    const cv = $('canvas', box), c = cv.getContext('2d'), cs = getComputedStyle(document.documentElement), n = names.length;
    const pts = names.map((name, i) => { const y = 1 - 2 * i / (n - 1), r = Math.sqrt(1 - y * y), a = i * 2.4; return { name, x: Math.cos(a) * r, y, z: Math.sin(a) * r }; });
    let W = 0, H = 0, vx = .002, vy = .006, px = -1, py = -1, over = false, hot = -1, seen = true;
    const fit = () => { const d = devicePixelRatio || 1; W = cv.clientWidth; H = cv.clientHeight; cv.width = W * d; cv.height = H * d; c.setTransform(d, 0, 0, d, 0, 0); };
    fit(); addEventListener('resize', fit);
    new IntersectionObserver(e => { seen = e[0].isIntersecting; }).observe(box);
    const aim = e => { const r = cv.getBoundingClientRect(); px = e.clientX - r.left; py = e.clientY - r.top; over = true; };
    cv.addEventListener('pointermove', aim);
    cv.addEventListener('pointerdown', aim);
    cv.addEventListener('pointerleave', e => { over = false; if (e.pointerType === 'mouse') hot = -1; });
    cv.addEventListener('click', () => {
      const card = hot > -1 && $$('#skills .skill-card').find(k => $('span', k).textContent.trim() === pts[hot].name);
      if (!card) return;
      card.click();
      const pn = $('.skill-panel');
      if (pn) pn.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
    (function loop() {
      requestAnimationFrame(loop);
      if (!seen) return;
      const on = over && !reduce;
      vy += ((on ? (px / W - .5) * .05 : reduce ? 0 : .006) - vy) * .06;
      vx += ((on ? -(py / H - .5) * .05 : reduce ? 0 : .002) - vx) * .06;
      const cY = Math.cos(vy), sY = Math.sin(vy), cX = Math.cos(vx), sX = Math.sin(vx);
      pts.forEach(p => {
        const x = p.x * cY + p.z * sY, z = -p.x * sY + p.z * cY;
        const y = p.y * cX - z * sX, z2 = p.y * sX + z * cX;
        p.x = x; p.y = y; p.z = z2;
      });
      const R = Math.min(W * .3, H * .27);
      const col = cs.getPropertyValue('--text-main').trim() || '#F8FAFC', acc = cs.getPropertyValue('--accent-1').trim() || '#06B6D4';
      c.clearRect(0, 0, W, H);
      c.textAlign = 'center'; c.textBaseline = 'middle';
      const pr = pts.map((p, i) => {
        const k = 2.2 / (2.2 - p.z), d = (p.z + 1) / 2;
        return { i, name: p.name, d, s: 12 + 12 * d, x: W / 2 + p.x * R * k, y: H / 2 + p.y * R * k };
      }).sort((a, b) => a.d - b.d);
      if (over) {
        hot = -1;
        for (let j = pr.length - 1; j >= 0; j--) {
          const q = pr[j];
          if (q.d < .4) break;
          c.font = `600 ${q.s}px Outfit,sans-serif`;
          if (Math.abs(px - q.x) < c.measureText(q.name).width / 2 + 10 && Math.abs(py - q.y) < q.s / 2 + 6) { hot = q.i; break; }
        }
      }
      cv.style.cursor = hot > -1 ? 'pointer' : 'grab';
      pr.forEach(q => {
        c.font = `600 ${q.s}px Outfit,sans-serif`;
        if (q.i === hot) {
          const w = c.measureText(q.name).width + 24;
          c.globalAlpha = 1; c.fillStyle = 'rgba(6,182,212,.2)'; c.strokeStyle = acc; c.lineWidth = 1.5;
          c.beginPath(); c.roundRect(q.x - w / 2, q.y - q.s / 2 - 7, w, q.s + 14, 20); c.fill(); c.stroke();
          c.fillStyle = acc;
        } else { c.globalAlpha = .2 + .8 * q.d; c.fillStyle = col; }
        c.fillText(q.name, q.x, q.y);
      });
      c.globalAlpha = 1;
    })();
  }

  /* 2. Ganti tema dengan lingkaran yang melebar dari tombolnya */
  const tb = $('.nav-btn.icon');
  if (tb && tb.onclick && document.startViewTransition && !reduce) {
    const orig = tb.onclick;
    tb.onclick = e => {
      const r = tb.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2;
      const rad = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
      document.startViewTransition(() => orig.call(tb, e)).ready.then(() =>
        document.documentElement.animate(
          { clipPath: [`circle(0 at ${x}px ${y}px)`, `circle(${rad}px at ${x}px ${y}px)`] },
          { duration: 800, easing: 'ease-in-out', pseudoElement: '::view-transition-new(root)' }));
    };
  }

  /* 3. Hero memudar sinematik saat di-scroll */
  const hero = $('#hero');
  if (hero && !reduce) addEventListener('scroll', () => hero.style.setProperty('--hs', clamp(scrollY / (innerHeight * .9))), { passive: true });

  /* 4. Titik navigasi section di sisi kanan */
  const secs = [['hero', 'Top'], ['about', 'About'], ['skills', 'Skills'], ['personal-projects', 'Personal'], ['projects', 'Course'], ['organizations', 'Orgs'], ['contact', 'Contact']]
    .filter(([id]) => document.getElementById(id));
  const dots = el('nav', 'dots', null, document.body);
  dots.setAttribute('aria-label', 'Sections');
  const btns = secs.map(([id, label]) => {
    const b = el('button', null, null, dots);
    b.type = 'button'; b.dataset.l = label; b.setAttribute('aria-label', label);
    b.onclick = () => document.getElementById(id).scrollIntoView({ behavior: 'smooth' });
    return b;
  });
  const so = new IntersectionObserver(en => en.forEach(x => {
    if (x.isIntersecting) btns.forEach((b, i) => b.classList.toggle('on', secs[i][0] === x.target.id));
  }), { rootMargin: '-45% 0px -50% 0px' });
  secs.forEach(([id]) => so.observe(document.getElementById(id)));
});

/* ===== extra3.js — perbaikan: section yang sangat tinggi (misal di HP) tidak pernah muncul ===== */
document.addEventListener('DOMContentLoaded', () => {
  const io = new IntersectionObserver((en, ob) => en.forEach(x => {
    if (x.isIntersecting) { x.target.classList.add('show'); ob.unobserve(x.target); }
  }), { rootMargin: '0px 0px -25% 0px' });
  document.querySelectorAll('.reveal:not(.show)').forEach(e => io.observe(e));
});

/* ===== extra4.js — galeri foto kegiatan + lightbox ===== */
document.addEventListener('DOMContentLoaded', () => {
  const exts = ['jpg', 'jpeg', 'png', 'webp'];
  const box = document.createElement('div');
  box.className = 'lightbox';
  box.innerHTML = '<button type="button" aria-label="Close">&times;</button><img alt=""><p></p>';
  document.body.append(box);
  const lb = box.querySelector('img'), cap = box.querySelector('p');
  const close = () => box.classList.remove('open');
  box.onclick = close;
  addEventListener('keydown', e => { if (e.key === 'Escape') close(); });

  document.querySelectorAll('.photo-gallery').forEach(g => {
    const { name, count = 3, folder } = g.dataset;
    const dirs = folder ? [folder] : ['files/foto', 'foto', 'images'];
    const caps = (g.dataset.captions || '').split('|');
    for (let i = 1; i <= +count; i++) {
      const text = caps[i - 1] || `Documentation ${i}`, fig = document.createElement('figure');
      const urls = dirs.flatMap(d => exts.map(x => `${d}/${name}-${i}.${x}`));
      fig.className = 'photo-slot empty';
      fig.innerHTML = `<div class="ph"><i class="fas fa-camera"></i><span>Add photo ${i}</span><code>${dirs[0]}/${name}-${i}.jpg</code></div><figcaption>${text}</figcaption>`;
      g.append(fig);
      let k = 0;
      const img = new Image();
      img.alt = text; img.decoding = 'async';
      img.onload = () => {
        const open = () => { lb.src = img.src; lb.alt = text; cap.textContent = text; box.classList.add('open'); };
        fig.classList.remove('empty');
        fig.querySelector('.ph').remove();
        fig.prepend(img);
        fig.tabIndex = 0;
        fig.onclick = open;
        fig.onkeydown = e => { if (e.key === 'Enter') open(); };
      };
      img.onerror = () => { if (++k < urls.length) img.src = urls[k]; };
      img.src = urls[0];
    }
  });
});

/* ===== extra5.js — muat foto profil otomatis ke hero ===== */
document.addEventListener('DOMContentLoaded', () => {
  const frame = document.getElementById('avatar-frame');
  if (!frame) return;
  const exts = ['jpg', 'jpeg', 'png', 'webp'];
  const dirs = ['images', 'files/foto', 'foto'];
  const urls = dirs.flatMap(d => exts.map(x => `${d}/profile.${x}`));
  let k = 0;
  const img = new Image();
  img.alt = 'Jason Alexander Wijaya';
  img.decoding = 'async';
  img.onload = () => {
    frame.classList.add('filled');
    frame.querySelector('.avatar-slot').remove();
    frame.prepend(img);
  };
  img.onerror = () => { if (++k < urls.length) img.src = urls[k]; };
  img.src = urls[0];
});
