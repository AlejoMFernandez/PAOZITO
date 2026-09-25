/* =========================================================
   PÃOZITO — interações
   ========================================================= */
(() => {
  'use strict';

  const WA = '5571996077121';
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;

  const NAVY = '#1E3668', BLUE = '#2E5BC7', PAPER = '#FBF7F0', CRUMB = '#F2DDB4', RED = '#E0262A';

  /* ---------- dados ---------- */
  const CATS = {
    trad: { label: 'tradicional', bg: CRUMB, fg: NAVY, prices: [20, 32, 60] },
    esp: { label: 'especial', bg: BLUE, fg: '#fff', prices: [30, 48, 90] },
    doce: { label: 'doce', bg: NAVY, fg: PAPER, prices: [30, 48, 90] }
  };
  const FLAVORS = [
    { id: 'creme-de-queijo', name: 'Creme de queijo', cat: 'trad', desc: 'O clássico da casa: pão delícia macio com creme de queijo.', note: 'o clássico', tile: CRUMB, think: 'o clássico...' },
    { id: 'salaminho', name: 'Salaminho', cat: 'esp', desc: 'Salaminho com catupiry.', tile: PAPER, think: 'salaminho!' },
    { id: 'reino', name: 'Queijo reino', cat: 'esp', desc: 'Pão delícia com queijo reino.', tile: BLUE, tfg: '#fff', think: 'queijo reino, hmm' },
    { id: 'nutella', name: 'Nutella', cat: 'doce', desc: 'Recheado de Nutella, com açúcar por cima.', note: 'perigo!', tile: PAPER, think: 'nutellaaa...' },
    { id: 'parma', name: 'Parma', cat: 'esp', desc: 'Parma com cream cheese.', tile: CRUMB, think: 'parma...' },
    { id: 'doce-de-leite', name: 'Doce de leite', cat: 'doce', desc: 'Pão delícia com doce de leite.', tile: RED, tfg: '#fff', think: 'doce de leite!' },
    { id: 'brie-com-damasco', name: 'Brie com damasco', cat: 'esp', desc: 'Brie com damasco.', tile: RED, tfg: '#fff', think: 'brie, chique!' },
    { id: 'red-velvet', name: 'Red velvet', cat: 'doce', desc: 'Pão delícia red velvet.', tile: BLUE, tfg: '#fff', think: 'esse vermelhinho...' },
    { id: 'romeu-e-julieta', name: 'Romeu e Julieta', cat: 'doce', desc: 'Goiabada com queijo.', tile: CRUMB, think: 'goiabada!' }
  ].map((f) => ({ ...f, img: `img/sabores/${f.id}.webp` }));

  const brl = (n) => 'R$ ' + n + ',00';

  /* =========================================================
     MENU MOBILE
     ========================================================= */
  const burger = $('.top__burger'), mmenu = $('#mobile-menu');
  const setMenu = (open) => {
    mmenu.hidden = !open;
    burger.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) $('.mmenu__close').focus();
  };
  burger.addEventListener('click', () => setMenu(true));
  $('.mmenu__close').addEventListener('click', () => setMenu(false));
  $$('#mobile-menu a').forEach((a) => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !mmenu.hidden) setMenu(false); });

  /* =========================================================
     REVEAL
     ========================================================= */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
  }, { threshold: 0.18 });
  $$('[data-reveal]').forEach((el) => io.observe(el));

  /* =========================================================
     SABORES — pilha
     ========================================================= */
  const stack = $('#stack');
  stack.innerHTML = FLAVORS.map((f, i) => {
    const c = CATS[f.cat];
    return `
    <li class="fl" style="--bg:${c.bg};--fg:${c.fg}" data-i="${i}">
      <div class="fl__info" aria-hidden="true">
        <div class="fl__txt">
          <div class="fl__tags"><span class="fl__tag">${c.label}</span>${f.note ? `<span class="fl__note marker">${f.note}</span>` : ''}</div>
          <p class="fl__big">${f.name.toUpperCase()}</p>
          <p class="fl__desc">${f.desc}</p>
        </div>
      </div>
      <img class="fl__pop sticker" src="${f.img}" alt="" loading="lazy">
      <button type="button" class="fl__cover" aria-expanded="false">
        <span class="fl__num">${String(i + 1).padStart(2, '0')}</span>
        <span class="fl__name">${f.name.toUpperCase()}</span>
        <span class="fl__cat">${c.label}</span>
        <img class="fl__thumb" src="${f.img}" alt="" loading="lazy">
      </button>
    </li>`;
  }).join('');

  const rows = $$('.fl', stack);
  const openRow = (i) => {
    rows.forEach((r, j) => {
      const on = j === i;
      r.classList.toggle('is-open', on);
      $('.fl__cover', r).setAttribute('aria-expanded', String(on));
      $('.fl__info', r).setAttribute('aria-hidden', String(!on));
    });
    if (i != null) pal.think(FLAVORS[i].think);
  };
  rows.forEach((r, i) => {
    $('.fl__cover', r).addEventListener('click', () => openRow(r.classList.contains('is-open') && !finePointer ? null : i));
    if (finePointer) r.addEventListener('mouseenter', () => openRow(i));
  });

  /* =========================================================
     SAQUINHO — física simples
     ========================================================= */
  const kit = (() => {
    const bagEl = $('#bag'), itemsEl = $('#bag-items'), tray = $('#kit-tray'), ghost = $('#ghost');
    const els = { count: $('#kit-count'), size: $('#kit-size'), price: $('#kit-price'), bar: $('#kit-bar'), sum: $('#kit-summary'), cta: $('#kit-cta') };
    let size = 8, bodies = [], raf = null, still = 0, G = null;

    tray.innerHTML = FLAVORS.map((f, i) => `
      <button type="button" class="tile" data-i="${i}" style="--tile:${f.tile};--tfg:${f.tfg || NAVY};--r:${[-6, 5, -3, 7, -8, 4, -5, 6, -4][i]}deg" aria-label="Adicionar ${f.name}">
        <img src="${f.img}" alt="" draggable="false" loading="lazy"><span>${f.name}</span>
      </button>`).join('');

    const geo = () => {
      const w = bagEl.clientWidth, h = bagEl.clientHeight;
      const r = Math.max(30, Math.min(52, w * 0.105));
      G = { w, h, r, left: w * 0.05 + r, right: w * 0.95 - r, floor: h * 0.53 + h * 0.05 - r, sw: r * 2.7 };
    };
    geo();
    addEventListener('resize', () => {
      const old = G; geo();
      if (old && old.w) bodies.forEach((b) => { b.x *= G.w / old.w; b.y *= G.h / old.h; b.el.style.width = G.sw + 'px'; });
      kick();
    });

    const render = () => {
      for (const b of bodies) b.el.style.transform = `translate(${b.x - G.sw / 2}px, ${b.y - G.sw * 0.36}px) rotate(${b.rot}deg)`;
    };

    const step = () => {
      const dt = 1 / 60, g = G.h * 3.9, R = G.r, min = R * 1.85;
      for (const b of bodies) {
        b.vy += g * dt; b.x += b.vx * dt; b.y += b.vy * dt; b.rot += b.vr * dt; b.vr *= 0.95;
      }
      for (let it = 0; it < 6; it++) {
        for (let i = 0; i < bodies.length; i++) {
          const a = bodies[i];
          if (a.x < G.left) { a.x = G.left; a.vx = Math.abs(a.vx) * 0.3; }
          if (a.x > G.right) { a.x = G.right; a.vx = -Math.abs(a.vx) * 0.3; }
          if (a.y > G.floor) { a.y = G.floor; if (a.vy > 0) a.vy = -a.vy * 0.22; a.vx *= 0.92; }
          for (let j = i + 1; j < bodies.length; j++) {
            const c = bodies[j], dx = c.x - a.x, dy = c.y - a.y, d = Math.hypot(dx, dy);
            if (d < min && d > 0.001) {
              const nx = dx / d, ny = dy / d, o = (min - d) / 2;
              a.x -= nx * o; a.y -= ny * o; c.x += nx * o; c.y += ny * o;
              const rv = (c.vx - a.vx) * nx + (c.vy - a.vy) * ny;
              if (rv < 0) { const imp = -0.6 * rv; a.vx -= imp * nx; a.vy -= imp * ny; c.vx += imp * nx; c.vy += imp * ny; }
            }
          }
        }
      }
      render();
      let mx = 0; for (const b of bodies) mx = Math.max(mx, Math.abs(b.vx), Math.abs(b.vy));
      still = mx < 12 ? still + 1 : 0;
      raf = still > 45 ? null : requestAnimationFrame(step);
    };
    const kick = () => { still = 0; if (!raf) raf = requestAnimationFrame(step); };

    const update = () => {
      const n = bodies.length, full = n >= size;
      const allTrad = n > 0 && bodies.every((b) => FLAVORS[b.fl].cat === 'trad');
      const idx = { 5: 0, 8: 1, 15: 2 }[size];
      const price = n ? (allTrad ? CATS.trad : CATS.esp).prices[idx] : null;
      const tally = {};
      bodies.forEach((b) => { tally[b.fl] = (tally[b.fl] || 0) + 1; });
      const parts = Object.keys(tally).map((k) => `${tally[k]} ${FLAVORS[k].name}`);
      els.count.textContent = n; els.size.textContent = size;
      els.price.textContent = price ? brl(price) : 'R$ —';
      els.bar.style.width = Math.min(100, (n / size) * 100) + '%';
      els.sum.textContent = parts.length ? parts.join(' · ') : 'Seu saquinho está vazio.';
      els.cta.classList.toggle('is-disabled', !full);
      els.cta.setAttribute('aria-disabled', String(!full));
      els.cta.textContent = full ? 'pedir no whatsapp' : `faltam ${size - n}`;
      els.cta.href = full ? `https://wa.me/${WA}?text=${encodeURIComponent(`Oi! Quero um kit de ${size}: ${parts.join(', ')}.`)}` : '#';
      if (full) { els.cta.target = '_blank'; els.cta.rel = 'noopener'; } else { els.cta.removeAttribute('target'); }
    };

    const add = (fl, x, y) => {
      if (bodies.length >= size) {
        bagEl.classList.remove('is-shake'); void bagEl.offsetWidth; bagEl.classList.add('is-shake');
        pal.say('opa, tá cheio!'); return;
      }
      const el = document.createElement('img');
      el.src = FLAVORS[fl].img; el.alt = FLAVORS[fl].name; el.style.width = G.sw + 'px';
      itemsEl.appendChild(el);
      bodies.push({
        el, fl,
        x: x != null ? Math.max(G.left, Math.min(G.right, x)) : G.w / 2 + (Math.random() - 0.5) * G.w * 0.4,
        y: y != null ? Math.min(y, G.h * 0.35) : -G.r,
        vx: (Math.random() - 0.5) * 160, vy: 0, rot: (Math.random() - 0.5) * 40, vr: (Math.random() - 0.5) * 260
      });
      update(); render(); kick();
      if (bodies.length >= size) { pal.say('saquinho pronto!'); pal.happy(); } else pal.eatQuick(FLAVORS[fl].think);
    };

    const setSize = (k) => {
      size = k;
      $$('.pill').forEach((p) => p.classList.toggle('is-on', +p.dataset.kit === k));
      while (bodies.length > size) bodies.pop().el.remove();
      update(); kick();
    };
    $$('.pill').forEach((p) => p.addEventListener('click', () => setSize(+p.dataset.kit)));
    $('#kit-clear').addEventListener('click', () => { bodies.forEach((b) => b.el.remove()); bodies = []; update(); });

    /* arrastar (mouse / caneta); toque = tocar para adicionar */
    let drag = null;
    tray.addEventListener('pointerdown', (e) => {
      const t = e.target.closest('.tile'); if (!t || e.pointerType === 'touch' || e.button !== 0) return;
      drag = { i: +t.dataset.i, sx: e.clientX, sy: e.clientY, moved: false, tile: t };
    });
    addEventListener('pointermove', (e) => {
      if (!drag) return;
      if (!drag.moved && Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy) > 8) {
        drag.moved = true; ghost.src = FLAVORS[drag.i].img; ghost.hidden = false; drag.tile.classList.add('is-grabbed');
        document.body.style.cursor = 'grabbing'; pal.think(FLAVORS[drag.i].think);
      }
      if (drag.moved) ghost.style.transform = `translate(${e.clientX - 75}px, ${e.clientY - 55}px) rotate(-8deg) scale(1.08)`;
    });
    addEventListener('pointerup', (e) => {
      if (!drag) return;
      const d = drag; drag = null;
      ghost.hidden = true; d.tile.classList.remove('is-grabbed'); document.body.style.cursor = '';
      if (!d.moved) return;
      d.cancelClick = true; tray.dataset.skip = '1';
      const r = bagEl.getBoundingClientRect();
      if (e.clientX > r.left - 40 && e.clientX < r.right + 40 && e.clientY > r.top - 200 && e.clientY < r.bottom) add(d.i, e.clientX - r.left, e.clientY - r.top);
    });
    tray.addEventListener('click', (e) => {
      const t = e.target.closest('.tile'); if (!t) return;
      if (tray.dataset.skip) { delete tray.dataset.skip; return; }
      add(+t.dataset.i);
    });

    update();
    return { add: (i) => add(i) };
  })();

  /* =========================================================
     CARDÁPIO COMPLETO
     ========================================================= */
  const I = (n, p, d) => ({ n, p, d });
  const kits = (a, b, c) => [I('Kit 05 unidades', a), I('Kit 08 unidades', b), I('Kit 15 unidades', c)];
  const troca = { note: '* Troca para leite vegetal ou zero lactose', noteP: '+ R$ 6,90' };
  const MENU = {
    comer: [
      [
        { title: 'PÃOZITO', sub: 'TRADICIONAL', lead: 'Sem recheio / creme de queijo', items: kits('R$ 20,00', 'R$ 32,00', 'R$ 60,00') },
        { sub: 'ESPECIAL', lead: 'Salaminho com catupiry / quatro queijos / queijo reino / parma com cream cheese / brie com damasco', items: kits('R$ 30,00', 'R$ 48,00', 'R$ 90,00') },
        { sub: 'DOCE', lead: 'Doce de leite / Nutella / red velvet / romeu e julieta', items: kits('R$ 30,00', 'R$ 48,00', 'R$ 90,00') }
      ],
      [
        { title: 'PÃOZITO LANCHE', items: [I('Creme queijo', 'R$ 18,00'), I('Queijo reino', 'R$ 22,00'), I('Salaminho', 'R$ 22,00'), I('Peito de peru', 'R$ 22,00')] },
        { title: 'SANDUÍCHES', lead: 'Sanduíches feitos com pão delícia tamanho lanche', items: [
          I('Misto royal', 'R$ 32,00', 'Mussarela e presunto royal'),
          I('Frango proteíco', 'R$ 32,00', 'Frango desfiado, creme de ricota, alho poró e mussarela'),
          I('Peito de peru com geleia de pimenta', 'R$ 32,00', 'Peito de peru, cream cheese, geleia de pimenta e mussarela'),
          I('Pesto sertanejo', 'R$ 35,00', 'Carne seca, creme de ricota, banana da terra e molho pesto')] }
      ],
      [
        { title: 'CROISSANT', sub: 'SALGADO', items: [I('Queijo e presunto gratinado / queijo quente', 'R$ 32,00'), I('Frango cremoso / caprese / parma e brie', 'R$ 35,00')] },
        { sub: 'DOCE', items: [I('Nutella / pistache / Biscoff', 'R$ 35,00')] },
        { title: 'TORTA SALGADA', items: [I('Torta do dia', 'R$ 35,00', 'Perguntar o sabor do dia')] },
        { title: 'SOBREMESA', items: [
          I('Torta cookie', 'R$ 24,00', 'Brigadeiro, Nutella e red velvet'),
          I('Bolo do dia', 'R$ 18,00'),
          I('Açaí com banana', 'R$ 25,00', 'Bowl de 300ml, com granola e mel'),
          I('Açaí com morango', 'R$ 25,00', 'Bowl de 300ml, com granola e mel')] }
      ]
    ],
    beber: [
      [
        { title: 'CAFÉS', ...troca, items: [
          I('Espresso curto (30ml)', 'R$ 9,00'), I('Carioca (60ml)', 'R$ 10,00'), I('Espresso (60ml)', 'R$ 12,00'), I('Espresso duplo (120ml)', 'R$ 16,00'),
          I('Capuccino italiano (150ml)', 'R$ 16,00', 'Contém lactose e contém canela'), I('Capuccino axé (150ml)', 'R$ 18,00', 'Contém lactose'),
          I('Espresso macchiato (60ml)', 'R$ 14,00', 'Contém lactose'), I('Café coado (150ml)', 'R$ 15,00'), I('Café latte (220ml)', 'R$ 16,00', 'Contém lactose'),
          I('Caramel macchiato (60ml)', 'R$ 16,00', 'Contém lactose'), I('Chocolate (150ml)', 'R$ 22,00', 'Quente ou frio. Contém lactose')] }
      ],
      [
        { title: 'CAFÉS GELADOS', ...troca, items: [
          I('Tônica coffee (280ml)', 'R$ 24,00', 'Tônica, gelo, xarope de limão siciliano e café espresso'),
          I('Ice mel coffee (265ml)', 'R$ 24,00', 'Mel puro, gelo, leite e café expresso. Contém lactose'),
          I('Ice caramel coffee (265ml)', 'R$ 30,00', 'Caramelo, gelo, leite, capuccino tradicional e café expresso. Contém lactose'),
          I('Ice mocatella coffee (265ml)', 'R$ 30,00', 'Nutella, leite integral, gelo e café expresso. Contém lactose'),
          I('Ice canelinha (265ml)', 'R$ 30,00', 'Cappuccino, leite vaporizado, canela cristalizada, gelo'),
          I('Expresso orange (265ml)', 'R$ 24,00', 'Suco de laranja, expresso 30ml, gelo'),
          I('Ice latte (265ml)', 'R$ 22,00', 'Leite gelado, expresso 30ml, gelo')] },
        { title: 'MATCHA GELADO', items: [
          I('Matcha latte', 'R$ 25,00', 'Gelo, matcha, leite (verificar disponibilidade)'),
          I('Matcha cranberry', 'R$ 28,00', 'Gelo, matcha, cranberry, frutas vermelhas, leite (verificar disponibilidade)'),
          I('Matcha tônica lemon', 'R$ 28,00', 'Gelo, matcha, calda de limão siciliano, tônica'),
          I('Matcha tangerine lemon', 'R$ 28,00', 'Gelo, matcha, xarope de tangerina, tônica')] }
      ],
      [
        { title: 'MOCKTAILS', items: [
          I('Malandrinha', 'R$ 30,00', 'Frutas vermelhas, sumo de limão e água tônica'),
          I('Baianinha', 'R$ 30,00', 'Xarope de gengibre, capim santo, sumo de limão, água tônica'),
          I('Calmaria', 'R$ 30,00', 'Maracujá, sumo de limão, anis estrelado, água tônica'),
          I('Mainha', 'R$ 30,00', 'Néctar de caju, limão siciliano, borda crustada com sal e pimenta, água tônica'),
          I('Delicinha', 'R$ 30,00', 'Mel de cacau, tônica, xarope de gengibre, gelo')] },
        { title: 'SUCOS', items: [I('Morango (300ml)', 'R$ 15,00'), I('Abacaxi ou abacaxi com hortelã (300ml)', 'R$ 12,00'), I('Maracujá (300ml)', 'R$ 15,00'), I('Laranja (300ml)', 'R$ 12,00')] },
        { title: 'OUTRAS BEBIDAS', items: [I('Água sem gás', 'R$ 8,00'), I('Água com gás', 'R$ 8,00'), I('Coca-Cola normal/zero', 'R$ 9,00'), I('Guaraná normal/zero', 'R$ 9,00'), I('Água de coco', 'R$ 9,00'), I('Kombucha', 'R$ 18,00'), I('Mel de cacau (300ml)', 'R$ 18,00'), I('Mel de cacau (1L)', 'R$ 40,00')] }
      ]
    ]
  };
  const sheet = $('#sheet'), sheetMasc = $('#sheet-masc');
  const renderMenu = (tab) => {
    sheet.innerHTML = MENU[tab].map((col) => `<div class="sheet__col">${col.map((b) => `
      <div class="blk">
        ${b.title ? `<h3 class="blk__title">${b.title}</h3>` : ''}
        ${b.sub ? `<p class="blk__sub">${b.sub}</p>` : ''}
        ${b.lead ? `<p class="blk__lead">${b.lead}</p>` : ''}
        ${b.note ? `<p class="blk__note"><span>${b.note}</span><span>${b.noteP}</span></p>` : ''}
        ${b.items.map((it) => `<div class="it"><p class="it__line"><span>${it.n}</span><span class="it__dots"></span><span class="it__price">${it.p}</span></p>${it.d ? `<p class="it__desc">${it.d}</p>` : ''}</div>`).join('')}
      </div>`).join('')}</div>`).join('');
    sheetMasc.src = tab === 'comer' ? 'img/marca/mascota-corazon-sticker.webp' : 'img/marca/isotipo-sticker.webp';
    $$('.tab').forEach((t) => { const on = t.dataset.tab === tab; t.classList.toggle('is-on', on); t.setAttribute('aria-selected', String(on)); });
  };
  $$('.tab').forEach((t) => t.addEventListener('click', () => renderMenu(t.dataset.tab)));
  renderMenu('comer');

  /* =========================================================
     MASCOTE
     ========================================================= */
  const pal = (() => {
    const root = $('#pal'), body = $('#pal-body'), say = $('#pal-say'), hint = $('#pal-hint');
    const eyes = $$('.pal__eye', root);
    const chat = $('#chat'), log = $('#chat-log'), chips = $('#chat-chips'), status = $('#chat-status');
    let last = Date.now(), sayT, eatT, pokes = [], hinted = false;

    const QA = [
      { q: 'Quais são os sabores?', a: 'Tradicional: sem recheio ou creme de queijo. Especial: salaminho com catupiry, quatro queijos, queijo reino, parma com cream cheese e brie com damasco. Doce: doce de leite, Nutella, red velvet e romeu e julieta.' },
      { q: 'Quanto custa um kit?', a: 'Tradicional: 5 por R$ 20, 8 por R$ 32 e 15 por R$ 60. Especial e doce: 5 por R$ 30, 8 por R$ 48 e 15 por R$ 90.' },
      { q: 'Onde ficam as lojas?', a: 'Pelourinho (R. da Misericórdia, 3), Pituba (R. das Hortênsias, 478) e Patamares (R. Bicuíba, 630, Colina A).' },
      { q: 'Como faço meu pedido?', a: 'Chama no WhatsApp 71 99607-7121, ou monta seu saquinho aqui no site que eu já deixo a mensagem pronta!' },
      { q: 'Tem sem lactose?', a: 'Nos cafés dá pra trocar por leite vegetal ou zero lactose por + R$ 6,90.' },
      { q: 'Qual o horário?', a: 'Isso eu ainda tô aprendendo! Chama no WhatsApp que a equipe te responde rapidinho.' },
      { q: 'Você é de comer?', a: 'Eu sou um pãozito! Mas prefiro ver você comendo um.' }
    ];

    const wake = () => { last = Date.now(); root.classList.remove('is-sleep'); };
    setInterval(() => { if (Date.now() - last > 8000 && chat.hidden) root.classList.add('is-sleep'); }, 600);
    ['pointermove', 'scroll', 'keydown', 'touchstart'].forEach((ev) => addEventListener(ev, wake, { passive: true }));

    /* olhinhos */
    let tx = 0, ty = 0, ex = 0, ey = 0, eyeRaf = null;
    const moveEyes = () => {
      ex += (tx - ex) * 0.25; ey += (ty - ey) * 0.25;
      eyes.forEach((e) => { e.style.transform = `translate(${ex}px, ${ey}px)`; });
      eyeRaf = Math.abs(tx - ex) + Math.abs(ty - ey) > 0.1 ? requestAnimationFrame(moveEyes) : null;
    };
    const lookAt = (x, y) => {
      const r = body.getBoundingClientRect();
      const cx = r.left + r.width * 0.49, cy = r.top + r.height * 0.31;
      const dx = x - cx, dy = y - cy, d = Math.hypot(dx, dy) || 1, k = Math.min(r.width * 0.022, d / 40);
      tx = (dx / d) * k; ty = (dy / d) * k;
      if (!eyeRaf) eyeRaf = requestAnimationFrame(moveEyes);
    };
    if (!reduced) addEventListener('pointermove', (e) => lookAt(e.clientX, e.clientY), { passive: true });

    const sayIt = (txt, ms = 1600) => {
      say.textContent = txt; say.classList.add('is-on'); hint.classList.remove('is-on');
      clearTimeout(sayT); sayT = setTimeout(() => { say.classList.remove('is-on'); root.classList.remove('is-drool'); }, ms);
    };
    const think = (txt) => { wake(); root.classList.add('is-drool'); sayIt(txt, 1800); };
    const eat = (ms = 2400) => {
      root.classList.add('is-eat'); clearTimeout(eatT);
      eatT = setTimeout(() => root.classList.remove('is-eat'), ms);
    };
    const eatQuick = (txt) => { wake(); sayIt('hmmm! ' + (txt || ''), 1400); eat(900); };
    const happy = () => { wake(); body.animate?.([{ transform: 'translateY(0)' }, { transform: 'translateY(-26px) rotate(-6deg)' }, { transform: 'translateY(0)' }], { duration: 650, easing: 'cubic-bezier(.2,1.6,.4,1)' }); };

    /* chat */
    const bubble = (who, txt) => {
      const m = document.createElement('p');
      m.className = 'msg msg--' + who; m.textContent = txt;
      log.appendChild(m); log.scrollTop = log.scrollHeight; return m;
    };
    chips.innerHTML = QA.map((x, i) => `<button type="button" class="chip" data-q="${i}">${x.q}</button>`).join('');
    let busy = false;
    chips.addEventListener('click', (e) => {
      const b = e.target.closest('.chip'); if (!b || busy) return;
      const qa = QA[+b.dataset.q]; busy = true; b.classList.add('is-asked');
      bubble('me', qa.q);
      const t = document.createElement('p'); t.className = 'msg msg--bot msg--typing'; t.innerHTML = '<i></i><i></i><i></i>';
      log.appendChild(t); log.scrollTop = log.scrollHeight; status.textContent = 'digitando...';
      setTimeout(() => { t.remove(); bubble('bot', qa.a); status.textContent = 'online agora'; busy = false; }, 850);
    });
    const openChat = (open) => {
      chat.hidden = !open; body.setAttribute('aria-expanded', String(open));
      if (open) {
        wake(); hint.classList.remove('is-on');
        if (!log.children.length) bubble('bot', 'Oi! Eu sou o Pãozito. Toca numa pergunta aí embaixo.');
      }
    };
    $('#chat-close').addEventListener('click', () => { openChat(false); body.focus(); });
    hint.addEventListener('click', () => openChat(true));
    addEventListener('keydown', (e) => { if (e.key === 'Escape' && !chat.hidden) openChat(false); });

    /* cutucar: abre o chat; 5 cutucadas rápidas = ele come */
    body.addEventListener('click', () => {
      wake();
      const now = Date.now();
      pokes = pokes.filter((t) => now - t < 1600).concat(now);
      body.classList.add('is-poke'); setTimeout(() => body.classList.remove('is-poke'), 180);
      if (pokes.length >= 5) { pokes = []; eat(2600); sayIt('nhac!', 1600); return; }
      if (pokes.length === 3) sayIt('faz cócegas!', 1000);
      if (pokes.length === 1) openChat(chat.hidden);
    });

    setTimeout(() => { if (!hinted && chat.hidden) { hinted = true; hint.classList.add('is-on'); setTimeout(() => hint.classList.remove('is-on'), 6000); } }, 3500);

    return { say: sayIt, think, eatQuick, happy };
  })();
})();
