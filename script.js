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

    // 3. GPA Gauge Animation
    const gpaCard = document.querySelector('.gpa-card');
    const gaugeFill = document.querySelector('.gauge-fill');
    
    if (gpaCard && gaugeFill) {
        const gpaObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const gpa = 3.60;
                    const maxGpa = 4.00;
                    const percentage = gpa / maxGpa;
                    const totalLength = 157.08;
                    const offset = totalLength * (1 - percentage);
                    
                    setTimeout(() => {
                        gaugeFill.style.strokeDashoffset = offset;
                    }, 300);
                    
                    gpaObserver.unobserve(gpaCard);
                }
            });
        }, { threshold: 0.5 });

        gpaObserver.observe(gpaCard);
    }

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

    setTimeout(typeName, 500);

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