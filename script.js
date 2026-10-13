(() => {
  const canvas = document.querySelector('#particles');
  const ctx = canvas.getContext('2d');
  const colors = ['#ff7f9f', '#ffb14f', '#72c9a6', '#75a8ff', '#a88cf4'];
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let particles = [];
  let frame;
  function resize() {
    const box = canvas.getBoundingClientRect();
    const scale = Math.min(devicePixelRatio || 1, 2);
    canvas.width = box.width * scale;
    canvas.height = box.height * scale;
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    particles = Array.from({ length: Math.min(42, Math.floor(box.width / 28)) }, () => ({ x: Math.random() * box.width, y: Math.random() * box.height, r: 1 + Math.random() * 2.2, vx: (Math.random() - .5) * .24, vy: (Math.random() - .5) * .2, color: colors[Math.floor(Math.random() * colors.length)], alpha: .18 + Math.random() * .32 }));
    draw();
  }
  function draw() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    ctx.clearRect(0, 0, w, h);
    for (const p of particles) {
      if (!reducedMotion) { p.x += p.vx; p.y += p.vy; if (p.x < 0 || p.x > w) p.vx *= -1; if (p.y < 0 || p.y > h) p.vy *= -1; }
      ctx.globalAlpha = p.alpha; ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
    for (let i = 0; i < particles.length; i++) for (let j = i + 1; j < particles.length; j++) {
      const a = particles[i], b = particles[j], dx = a.x - b.x, dy = a.y - b.y, distance = Math.hypot(dx, dy);
      if (distance < 105) { ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.strokeStyle = '#7a73a4'; ctx.globalAlpha = (1 - distance / 105) * .11; ctx.lineWidth = 1; ctx.stroke(); }
    }
    ctx.globalAlpha = 1;
    if (!reducedMotion) frame = requestAnimationFrame(draw);
  }
  resize();
  addEventListener('resize', () => { cancelAnimationFrame(frame); resize(); });

  async function loadProfile() {
    let profile;
    try {
      const response = await fetch('/api/profile');
      if (!response.ok) throw new Error('API unavailable');
      profile = await response.json();
    } catch {
      try {
        const response = await fetch('data/profile.json');
        if (!response.ok) return;
        profile = await response.json();
      } catch { return; }
    }
    const name = document.querySelector('.name-gradient');
    if (name && profile.name) name.firstChild.textContent = profile.name;
    const role = document.querySelector('.eyebrow');
    if (role && profile.role) role.lastChild.textContent = ` 一位正在好好生活的${profile.role}`;
    const intro = document.querySelector('.hero-text');
    if (intro && profile.intro) intro.firstChild.textContent = profile.intro;
  }
  loadProfile();

  const form = document.querySelector('#contact-form');
  const status = document.querySelector('#form-status');
  form.addEventListener('submit', async event => {
    event.preventDefault();
    const message = new FormData(form).get('message').trim();
    if (!message) { status.textContent = '請先寫下訊息。'; return; }
    try {
      const response = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message }) });
      const data = await response.json();
      status.textContent = data.message || data.error;
      if (response.ok) form.reset();
    } catch { status.textContent = '目前無法連線，請稍後再試。'; }
  });
})();
