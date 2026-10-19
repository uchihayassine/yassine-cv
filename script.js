// ===== NASA-style interactive space background (NVIDIA palette) =====
(function initSpaceBackground() {
  const canvas = document.getElementById('particles');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const NV_GREEN = { r: 118, g: 185, b: 0 };
  const NV_GREEN_BRIGHT = { r: 143, g: 212, b: 0 };

  let width = 0;
  let height = 0;
  let animId = 0;
  let stars = [];
  let nodes = [];
  let shootingStars = [];
  let time = 0;

  const mouse = { x: 0, y: 0, active: false };
  const parallax = { x: 0, y: 0, targetX: 0, targetY: 0 };

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    buildStars();
    buildNodes();
  }

  function buildStars() {
    const count = Math.min(Math.floor((width * height) / 2200), 420);
    stars = Array.from({ length: count }, () => {
      const depth = Math.random();
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        depth,
        r: depth * 1.6 + 0.15,
        twinkle: Math.random() * Math.PI * 2,
        twinkleSpeed: 0.008 + Math.random() * 0.02,
        tint: Math.random() > 0.82 ? 'green' : 'white',
      };
    });
  }

  function buildNodes() {
    const count = Math.min(Math.floor(width / 14), 95);
    nodes = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r: Math.random() * 1.4 + 0.6,
      opacity: Math.random() * 0.45 + 0.15,
    }));
  }

  function spawnShootingStar() {
    if (Math.random() > 0.992 || shootingStars.length > 2) return;
    shootingStars.push({
      x: Math.random() * width,
      y: Math.random() * height * 0.45,
      len: 80 + Math.random() * 120,
      speed: 6 + Math.random() * 8,
      angle: Math.PI / 4 + (Math.random() - 0.5) * 0.35,
      life: 1,
    });
  }

  function drawNebula() {
    const cx = width * 0.72 + parallax.x * 0.3;
    const cy = height * 0.28 + parallax.y * 0.25;
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(width, height) * 0.55);
    grad.addColorStop(0, 'rgba(118, 185, 0, 0.14)');
    grad.addColorStop(0.35, 'rgba(118, 185, 0, 0.05)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    const cx2 = width * 0.15 - parallax.x * 0.2;
    const cy2 = height * 0.75 - parallax.y * 0.15;
    const grad2 = ctx.createRadialGradient(cx2, cy2, 0, cx2, cy2, width * 0.4);
    grad2.addColorStop(0, 'rgba(143, 212, 0, 0.08)');
    grad2.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad2;
    ctx.fillRect(0, 0, width, height);
  }

  function drawStars() {
    stars.forEach((star) => {
      star.twinkle += star.twinkleSpeed;
      const flicker = 0.55 + Math.sin(star.twinkle) * 0.45;
      const px = star.x + parallax.x * (star.depth * 28);
      const py = star.y + parallax.y * (star.depth * 28);

      let alpha = (0.25 + star.depth * 0.75) * flicker;
      if (star.tint === 'green') {
        ctx.fillStyle = `rgba(${NV_GREEN_BRIGHT.r}, ${NV_GREEN_BRIGHT.g}, ${NV_GREEN_BRIGHT.b}, ${alpha})`;
      } else {
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.9})`;
      }

      ctx.beginPath();
      ctx.arc(px, py, star.r, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  function drawNodes() {
    const linkDist = 130;
    const mouseRadius = 180;

    nodes.forEach((node, i) => {
      if (mouse.active) {
        const dx = mouse.x - node.x;
        const dy = mouse.y - node.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        if (dist < mouseRadius) {
          const force = (mouseRadius - dist) / mouseRadius;
          node.vx -= (dx / dist) * force * 0.04;
          node.vy -= (dy / dist) * force * 0.04;
        }
      }

      node.x += node.vx;
      node.y += node.vy;
      node.vx *= 0.99;
      node.vy *= 0.99;

      if (node.x < 0) node.x = width;
      if (node.x > width) node.x = 0;
      if (node.y < 0) node.y = height;
      if (node.y > height) node.y = 0;

      ctx.beginPath();
      ctx.arc(node.x, node.y, node.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${NV_GREEN.r}, ${NV_GREEN.g}, ${NV_GREEN.b}, ${node.opacity})`;
      ctx.fill();

      for (let j = i + 1; j < nodes.length; j++) {
        const other = nodes[j];
        const dx = node.x - other.x;
        const dy = node.y - other.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < linkDist) {
          const alpha = 0.12 * (1 - dist / linkDist);
          ctx.beginPath();
          ctx.moveTo(node.x, node.y);
          ctx.lineTo(other.x, other.y);
          ctx.strokeStyle = `rgba(${NV_GREEN.r}, ${NV_GREEN.g}, ${NV_GREEN.b}, ${alpha})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    });

    if (mouse.active) {
      nodes.forEach((node) => {
        const dx = mouse.x - node.x;
        const dy = mouse.y - node.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 160) {
          const alpha = 0.25 * (1 - dist / 160);
          ctx.beginPath();
          ctx.moveTo(mouse.x, mouse.y);
          ctx.lineTo(node.x, node.y);
          ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.35})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      });

      const glow = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 120);
      glow.addColorStop(0, 'rgba(118, 185, 0, 0.12)');
      glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, 120, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawShootingStars() {
    shootingStars = shootingStars.filter((s) => {
      s.x += Math.cos(s.angle) * s.speed;
      s.y += Math.sin(s.angle) * s.speed;
      s.life -= 0.02;

      const tailX = s.x - Math.cos(s.angle) * s.len;
      const tailY = s.y - Math.sin(s.angle) * s.len;
      const grad = ctx.createLinearGradient(tailX, tailY, s.x, s.y);
      grad.addColorStop(0, 'rgba(255, 255, 255, 0)');
      grad.addColorStop(0.6, `rgba(${NV_GREEN_BRIGHT.r}, ${NV_GREEN_BRIGHT.g}, ${NV_GREEN_BRIGHT.b}, ${s.life * 0.5})`);
      grad.addColorStop(1, `rgba(255, 255, 255, ${s.life})`);

      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(tailX, tailY);
      ctx.lineTo(s.x, s.y);
      ctx.stroke();

      return s.life > 0 && s.x < width + 200 && s.y < height + 200;
    });
  }

  function drawScanline() {
    const y = (time * 0.35) % (height + 80) - 40;
    const grad = ctx.createLinearGradient(0, y - 40, 0, y + 40);
    grad.addColorStop(0, 'rgba(118, 185, 0, 0)');
    grad.addColorStop(0.5, 'rgba(118, 185, 0, 0.03)');
    grad.addColorStop(1, 'rgba(118, 185, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, y - 40, width, 80);
  }

  function draw() {
    time += 1;
    parallax.x += (parallax.targetX - parallax.x) * 0.06;
    parallax.y += (parallax.targetY - parallax.y) * 0.06;

    ctx.clearRect(0, 0, width, height);
    drawNebula();
    drawStars();
    drawNodes();
    spawnShootingStar();
    drawShootingStars();
    drawScanline();

    animId = requestAnimationFrame(draw);
  }

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.active = true;
    parallax.targetX = (e.clientX / width - 0.5) * 40;
    parallax.targetY = (e.clientY / height - 0.5) * 40;
  });

  window.addEventListener('mouseleave', () => {
    mouse.active = false;
    parallax.targetX = 0;
    parallax.targetY = 0;
  });

  window.addEventListener(
    'touchmove',
    (e) => {
      if (!e.touches[0]) return;
      mouse.x = e.touches[0].clientX;
      mouse.y = e.touches[0].clientY;
      mouse.active = true;
      parallax.targetX = (mouse.x / width - 0.5) * 30;
      parallax.targetY = (mouse.y / height - 0.5) * 30;
    },
    { passive: true }
  );

  window.addEventListener('resize', () => {
    cancelAnimationFrame(animId);
    resize();
    draw();
  });

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  resize();
  if (reducedMotion) {
    ctx.clearRect(0, 0, width, height);
    drawNebula();
    buildStars();
    stars.forEach((star) => {
      ctx.fillStyle =
        star.tint === 'green'
          ? `rgba(${NV_GREEN_BRIGHT.r}, ${NV_GREEN_BRIGHT.g}, ${NV_GREEN_BRIGHT.b}, 0.6)`
          : 'rgba(255, 255, 255, 0.5)';
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
      ctx.fill();
    });
  } else {
    draw();
  }
})();

// ===== Typing Effect =====
(function initTyping() {
  const el = document.getElementById('typedText');
  const phrases = [
    'Computer Science Student',
    'AI Automation Engineer',
    'Python, FastAPI & RAG',
    'Seeking Werkstudent Role',
  ];
  let phraseIdx = 0;
  let charIdx = 0;
  let deleting = false;

  function type() {
    const current = phrases[phraseIdx];

    if (!deleting) {
      el.textContent = current.slice(0, charIdx + 1);
      charIdx++;

      if (charIdx === current.length) {
        deleting = true;
        setTimeout(type, 2000);
        return;
      }
    } else {
      el.textContent = current.slice(0, charIdx - 1);
      charIdx--;

      if (charIdx === 0) {
        deleting = false;
        phraseIdx = (phraseIdx + 1) % phrases.length;
      }
    }

    setTimeout(type, deleting ? 40 : 80);
  }

  type();
})();

// ===== Scroll Reveal =====
(function initReveal() {
  const reveals = document.querySelectorAll('.reveal');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const delay = entry.target.closest('.projects-grid, .about-highlights, .certs-grid, .contact-grid')
            ? [...entry.target.parentElement.children].indexOf(entry.target) * 100
            : 0;
          setTimeout(() => entry.target.classList.add('visible'), delay);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );

  reveals.forEach((el) => observer.observe(el));
})();

// ===== Skill Bars Animation =====
(function initSkillBars() {
  const bars = document.querySelectorAll('.skill-bar');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const level = entry.target.dataset.level;
          const fill = entry.target.querySelector('.fill');
          fill.style.width = level + '%';
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  bars.forEach((bar) => observer.observe(bar));
})();

// ===== Navigation =====
(function initNav() {
  const nav = document.getElementById('nav');
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');
  const sections = document.querySelectorAll('section[id]');
  const navLinks = links.querySelectorAll('a');

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 50);

    let current = '';
    sections.forEach((section) => {
      if (window.scrollY >= section.offsetTop - 200) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach((link) => {
      link.classList.toggle('active', link.getAttribute('href') === '#' + current);
    });
  });

  toggle.addEventListener('click', () => {
    toggle.classList.toggle('open');
    links.classList.toggle('open');
  });

  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      toggle.classList.remove('open');
      links.classList.remove('open');
    });
  });
})();

// ===== Social Links Config =====
const SOCIAL_LINKS = {
  github: 'https://github.com/uchihayassine',
  linkedin: 'https://www.linkedin.com/in/yassine-ben-lazreg-747a67359',
};

document.querySelectorAll('[data-link]').forEach((el) => {
  const platform = el.dataset.link;
  if (SOCIAL_LINKS[platform]) {
    el.href = SOCIAL_LINKS[platform];
  }
});
