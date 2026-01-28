// Hero Globe Animation using Three.js with Icon Nodes
function initGlobe() {
  console.log('Initializing globe...');
  const canvas = document.getElementById('globe');
  console.log('Canvas element:', canvas);
  if (!canvas) {
    console.error('Canvas element not found!');
    // Create a fallback message
    const msg = document.createElement('div');
    msg.textContent = 'Canvas not found!';
    msg.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);color:red;font-size:24px;background:black;padding:20px;';
    document.body.appendChild(msg);
    return;
  }

  console.log('Three.js available:', typeof THREE);
  if (!THREE) {
    console.error('Three.js not loaded!');
    return;
  }

  // Scene, Camera, Renderer
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    console.log('WebGL renderer created successfully');
  } catch (e) {
    console.error('Failed to create WebGL renderer:', e);
    // Fallback: show error message
    canvas.style.display = 'none';
    const errorMsg = document.createElement('div');
    errorMsg.textContent = 'WebGL not supported - globe cannot be displayed';
    errorMsg.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);color:white;font-family:monospace;background:black;padding:20px;border-radius:10px;';
    document.body.appendChild(errorMsg);
    return;
  }
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0); // Transparent background for overlay

  // Globe Geometry and Material
  const geometry = new THREE.SphereGeometry(5, 32, 32);
  const material = new THREE.MeshBasicMaterial({ color: 0x00e5d1, wireframe: true, transparent: false, opacity: 1 });
  const globe = new THREE.Mesh(geometry, material);
  scene.add(globe);
  console.log('Globe mesh added to scene');

  // Lighting
  const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
  directionalLight.position.set(1, 1, 1);
  scene.add(directionalLight);

  // Camera Position
  camera.position.z = 10;

  // 1) CHANNELS: replace icon URLs with your own public icons if you have them.
  // Make sure icons are CORS-friendly (Access-Control-Allow-Origin: *) or host on your domain.
  const CHANNELS = [
    { id: 'Web Chat',   icon: 'https://cdn.example.com/icons/webchat.svg',   link: 'https://your-webchat-link' },
    { id: 'SMS',        icon: 'https://cdn.example.com/icons/sms.svg',       link: 'sms:+14374947028' },
    { id: 'WhatsApp',   icon: 'https://cdn.example.com/icons/whatsapp.svg',  link: 'https://wa.me/14374947028' },
    { id: 'Messenger',  icon: 'https://cdn.example.com/icons/messenger.svg', link: 'https://m.me/...' },
    { id: 'Instagram',  icon: 'https://cdn.example.com/icons/instagram.svg', link: 'https://instagram.com/...' },
    { id: 'Email',      icon: 'https://cdn.example.com/icons/email.svg',     link: 'mailto:...' },
    { id: 'Calls',      icon: 'https://cdn.example.com/icons/phone.svg',     link: 'tel:+14374947028' },
    { id: 'Booking',    icon: 'https://cdn.example.com/icons/calendar.svg',  link: 'https://www.lukairoengine.com/...' },
    { id: 'CRM',        icon: 'https://cdn.example.com/icons/hubspot.svg',   link: 'https://crm.example.com/...' },
    { id: 'Automation', icon: 'https://cdn.example.com/icons/automation.svg', link: 'https://automation.link' }
  ];

  // 2) Helpers: CORS-safe load and canvas fallback
  function makeCanvasIcon(THREE, text = 'LK', bg = '#00e5d1', size = 256) {
    const c = document.createElement('canvas'); c.width = c.height = size;
    const ctx = c.getContext('2d');
    // background radial
    const cx = size/2, cy = size/2, r = size*0.45;
    const g = ctx.createRadialGradient(cx, cy, r*0.15, cx, cy, r*1.15);
    g.addColorStop(0, bg);
    g.addColorStop(0.5, hexToRgba(bg, 0.55));
    g.addColorStop(1, hexToRgba(bg, 0.06));
    ctx.fillStyle = g; ctx.fillRect(0,0,size,size);
    // center dark disc
    ctx.beginPath(); ctx.arc(cx,cy,r*0.78,0,Math.PI*2); ctx.fillStyle = 'rgba(0,0,0,0.18)'; ctx.fill();
    // text
    ctx.fillStyle = '#021515'; ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.font = `bold ${Math.floor(size*0.46)}px Inter, system-ui`;
    ctx.fillText(text.slice(0,2).toUpperCase(), cx, cy+2);
    // soft highlight
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = hexToRgba('#ffffff', 0.06); ctx.beginPath(); ctx.arc(cx, cy - r*0.28, r*1.05, 0, Math.PI*2); ctx.fill();
    const tex = new THREE.CanvasTexture(c); return tex;
  }

  function hexToRgba(hex, a = 1){
    if (hex[0] === '#') hex = hex.slice(1);
    const bigint = parseInt(hex,16);
    const r = (bigint>>16)&255, g = (bigint>>8)&255, b = bigint&255;
    return `rgba(${r},${g},${b},${a})`;
  }

  function loadTextureSafe(THREE, url, fallbackText='LK', fallbackColor='#00e5d1'){
    return new Promise(resolve => {
      if (!url) { resolve(makeCanvasIcon(THREE, fallbackText, fallbackColor)); return; }
      const img = new Image();
      img.crossOrigin = 'anonymous';
      let done = false;
      img.onload = () => {
        try {
          const tex = new THREE.Texture(img); tex.needsUpdate = true;
          // try set color space if supported
          try { tex.colorSpace = THREE.SRGBColorSpace; } catch(e){}
          done = true; resolve(tex);
        } catch(e){ done = true; resolve(makeCanvasIcon(THREE, fallbackText, fallbackColor)); }
      };
      img.onerror = (e) => { if (!done) { console.warn('Icon load failed', url, e); resolve(makeCanvasIcon(THREE, fallbackText, fallbackColor)); } };
      img.src = url;
      // safety timeout -> fallback
      setTimeout(()=>{ if (!done) resolve(makeCanvasIcon(THREE, fallbackText, fallbackColor)); }, 4500);
    });
  }

  // 3) Icon node creation
  async function createIconNodes(THREE, scene, camera, renderer, options = {}) {
    // options: orbitBase, planeSize
    const orbitBase = options.orbitBase || 9.6;
    const planeSize = options.planeSize || 1.9;
    const nodeGeo = new THREE.PlaneGeometry(planeSize, planeSize);
    const nodes = [], beams = [], labels = [];

    // load all textures first (parallel)
    const texPromises = CHANNELS.map((ch) =>
      loadTextureSafe(THREE, ch.icon, (ch.id||'')[0]||'LK', '#00e5d1')
    );

    const textures = await Promise.all(texPromises);

    // create nodes
    CHANNELS.forEach((ch, i) => {
      const tex = textures[i];
      // make material render on top
      const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide, depthTest:false, depthWrite:false });
      const plane = new THREE.Mesh(nodeGeo, mat);
      plane.userData = {
        angle: (Math.random()*Math.PI*2),
        speed: 0.002 + Math.random()*0.0012,
        elev: Math.random()*0.8 - 0.4,
        beatPhase: Math.random()*Math.PI*2,
        orbit: orbitBase + i*0.9
      };
      plane.renderOrder = 9999;
      scene.add(plane);
      nodes.push(plane);

      // beam line
      const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]), new THREE.LineBasicMaterial({ color: 0x00e5d1, transparent:true, opacity:0.22 }));
      scene.add(line); beams.push(line);

      // DOM label
      const lbl = document.createElement('div');
      lbl.className = 'lk-label lk-label--small';
      lbl.innerText = ch.id;
      document.body.appendChild(lbl);
      labels.push(lbl);

      // click handling by storing link
      plane.userData.link = ch.link || null;
    });

    // mouse interactivity: raycaster
    const ray = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let hovered = null;

    function onPointerMove(e){
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      ray.setFromCamera(mouse, camera);
      const hits = ray.intersectObjects(nodes, true);
      if (hits.length) {
        const obj = hits[0].object;
        if (hovered !== obj) {
          if (hovered) hovered.scale.setScalar(1);
          hovered = obj; hovered.scale.setScalar(1.25);
        }
      } else {
        if (hovered) hovered.scale.setScalar(1);
        hovered = null;
      }
    }
    function onPointerDown(e){
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      ray.setFromCamera(mouse, camera);
      const hits = ray.intersectObjects(nodes, true);
      if (hits.length) {
        const obj = hits[0].object;
        const link = obj.userData.link;
        if (link) window.open(link, '_blank', 'noopener');
      }
    }
    renderer.domElement.addEventListener('pointermove', onPointerMove);
    renderer.domElement.addEventListener('pointerdown', onPointerDown);

    // animation updater — call this in your main animate loop
    function updateIcons(now, camera) {
      const t = now * 0.001;
      nodes.forEach((n,i) => {
        n.userData.angle += n.userData.speed;
        const rr = n.userData.orbit + Math.sin(t*0.6 + i) * 0.35;
        n.position.set(Math.cos(n.userData.angle) * rr, Math.sin(n.userData.angle * 2) * 0.9 + n.userData.elev * 2.2, Math.sin(n.userData.angle) * rr);
        // face camera
        n.lookAt(camera.position);
        // small beat
        const s = 1 + 0.12 * Math.sin(t + n.userData.beatPhase);
        n.scale.setScalar(s);
        // update beam
        const beam = beams[i];
        beam.geometry.setFromPoints([new THREE.Vector3(), n.position.clone()]);
        // DOM label update
        const v = n.position.clone().project(camera);
        const x = (v.x * 0.5 + 0.5) * window.innerWidth;
        const y = (-v.y * 0.5 + 0.5) * window.innerHeight;
        const lbl = labels[i];
        if (lbl) { lbl.style.transform = `translate3d(${Math.round(x)}px, ${Math.round(y)}px, 0) translate(-50%,-50%)`; lbl.style.opacity = beam.material.opacity > 0.18 ? '1' : '0.48'; }
      });
    }

    // return handle so caller can call updateIcons from main loop and clean up
    return {
      nodes, beams, labels,
      update: updateIcons,
      dispose: () => {
        renderer.domElement.removeEventListener('pointermove', onPointerMove);
        renderer.domElement.removeEventListener('pointerdown', onPointerDown);
        labels.forEach(l => l.remove());
      }
    };
  }

  // Initialize icon system
  let iconSystem;
  createIconNodes(THREE, scene, camera, renderer, { orbitBase: 9.6, planeSize: 1.9 }).then(system => {
    iconSystem = system;
  });

  // Animation Loop
  function animate() {
    requestAnimationFrame(animate);

    // Rotate the globe
    globe.rotation.y += 0.005;
    globe.rotation.x += 0.002;

    // Update icons if loaded
    if (iconSystem) {
      iconSystem.update(performance.now(), camera);
    }

    renderer.render(scene, camera);
  }
  console.log('Starting animation loop');
  animate();

  // Handle Window Resize
  window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

// Initialize when both DOM and Three.js are ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initGlobe);
} else {
  initGlobe();
}

// Also check if Three.js is already loaded
if (typeof THREE !== 'undefined') {
  initGlobe();
} else {
  // Wait for Three.js to load
  window.addEventListener('load', function() {
    setTimeout(initGlobe, 100); // Small delay to ensure Three.js is ready
  });
}