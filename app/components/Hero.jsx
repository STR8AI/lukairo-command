import { useEffect, useRef } from "react";
import {
  AmbientLight,
  BackSide,
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  CylinderGeometry,
  Group,
  Line,
  LineBasicMaterial,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  Points,
  PointsMaterial,
  PointLight,
  Raycaster,
  Scene,
  SphereGeometry,
  Texture,
  TextureLoader,
  TorusGeometry,
  Vector2,
  Vector3,
  WebGLRenderer,
  SRGBColorSpace,
} from "three";
import "./hero-lukairo.css";

/*
  Final Hero with real-brand icons + CORS-safe fallback.
  - Edit CHANNELS to update icon URLs or links.
  - Icons that fail to load automatically fall back to a canvas-drawn glyph.
*/

const CHANNELS = [
  { id: "Aiva",        text: "💬", color: "#00E5D1", icon: "https://cdn.example.com/icons/webchat.svg",   link: "javascript:void(0);" },
  { id: "SMS",         text: "SMS", color: "#3FD8C6", icon: "https://cdn.example.com/icons/sms.svg",       link: "sms:+14374947028" },
  { id: "WhatsApp",    text: "WA",  color: "#00BFA5", icon: "https://cdn.example.com/icons/whatsapp.svg",  link: "https://wa.me/14374947028" },
  { id: "Messenger",   text: "FB",  color: "#3CA8FF", icon: "https://cdn.example.com/icons/messenger.svg", link: "https://m.me/LUKAIRO" },
  { id: "Instagram",   text: "IG",  color: "#8AB4F8", icon: "https://cdn.example.com/icons/instagram.svg", link: "https://instagram.com/LUKAIRO" },
  { id: "Email",       text: "✉️", color: "#66FFD0", icon: "https://cdn.example.com/icons/email.svg",     link: "mailto:lukairoteam@outlook.com" },
  { id: "Calls",       text: "📞", color: "#63F1EA", icon: "https://cdn.example.com/icons/phone.svg",     link: "tel:+14374947028" },
  { id: "Booking",     text: "📅", color: "#4FDEB6", icon: "https://cdn.example.com/icons/calendar.svg",  link: "https://api.lukairo.ca/widget/bookings/booking-lukairo" },
  { id: "CRM",         text: "CRM", color: "#9FFEEE", icon: "https://cdn.example.com/icons/hubspot.svg",   link: "https://app.lukairo.app" },
  { id: "Automation",  text: "⚙️", color: "#66D6FF", icon: "https://cdn.example.com/icons/automation.svg", link: "https://app.lukairo.app" }
];

export default function Hero({ bookingHref = "https://www.lukairoengine.com/widget/booking/SGgO7LS3M1CVcD0ok6xV" }) {
  const mountRef = useRef(null);
  const cleanupRef = useRef(null);

  useEffect(() => {
    let renderer, scene, camera, rafId;
    let engineGroup, coreOuter, wire, halo, particles, rotatingLight;
    const nodes = [];
    const beams = [];
    const labels = [];
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const CENTER_LOGO = "https://storage.googleapis.com/funnel-ai-production/image-generation/B47X3dkLb4AkvxzX2Tck/kXYc_nXCAqrzqws92Smqv.png";

    // ---- Utility helpers ----
    function hexToRgba(hex, alpha = 1) {
      const h = hex.replace("#", "");
      const bigint = parseInt(h, 16);
      const r = (bigint >> 16) & 255;
      const g = (bigint >> 8) & 255;
      const b = bigint & 255;
      return `rgba(${r},${g},${b},${alpha})`;
    }

    function makeIconTexture(text, bgColor, size = 256) {
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = size;
      const ctx = canvas.getContext("2d");
      const cx = size / 2, cy = size / 2, r = size * 0.44;

      const grad = ctx.createRadialGradient(cx, cy, r * 0.2, cx, cy, r * 1.2);
      grad.addColorStop(0, hexToRgba(bgColor, 0.95));
      grad.addColorStop(0.35, hexToRgba(bgColor, 0.6));
      grad.addColorStop(1, hexToRgba(bgColor, 0.02));
      ctx.fillStyle = grad; ctx.fillRect(0, 0, size, size);

      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fillStyle = "rgba(0,0,0,0.14)"; ctx.fill();

      ctx.fillStyle = "#041214"; ctx.font = `${Math.floor(size * 0.44)}px Inter, system-ui`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(text, cx, cy + (text.length > 2 ? 4 : 0));

      ctx.globalCompositeOperation = "lighter";
      ctx.fillStyle = hexToRgba(bgColor, 0.12);
      ctx.beginPath(); ctx.arc(cx, cy, r * 1.05, 0, Math.PI * 2); ctx.fill();

      return new CanvasTexture(canvas);
    }

    // Safe load: try remote image with crossOrigin, fallback to canvas texture
    function loadTextureSafe(url, fallbackText, fallbackColor) {
      return new Promise((resolve) => {
        if (!url) {
          resolve(makeIconTexture(fallbackText, fallbackColor));
          return;
        }
        const img = new Image();
        img.crossOrigin = "anonymous";
        let settled = false;
        img.onload = () => {
          try {
            const tex = new Texture(img);
            tex.needsUpdate = true;
            try { tex.colorSpace = SRGBColorSpace; } catch (e) {}
            settled = true;
            resolve(tex);
          } catch (err) {
            settled = true;
            console.warn("Texture wrap failed; falling back:", err);
            resolve(makeIconTexture(fallbackText, fallbackColor));
          }
        };
        img.onerror = (err) => {
          if (!settled) {
            console.warn("Icon load failed/CORS blocked:", url, err);
            resolve(makeIconTexture(fallbackText, fallbackColor));
          }
        };
        img.src = url;
      });
    }

    // Procedural gears
    function createGears(parent) {
      const cogCount = 3;
      for (let i = 0; i < cogCount; i++) {
        const radius = 1.0 + i * 0.95;
        const thickness = 0.22;
        const segs = prefersReduced ? 24 : 48;
        const tor = new TorusGeometry(radius, thickness, 8, Math.max(32, segs));
        const mat = new MeshStandardMaterial({ color: 0x052b2b, emissive: 0x00ffd6, emissiveIntensity: 0.48, metalness: 0.95, roughness: 0.18 });
        const ring = new Mesh(tor, mat);
        ring.rotation.x = Math.PI * 0.5;
        ring.position.z = (i - 1) * 0.06;
        parent.add(ring);

        const teeth = new Group();
        const toothGeo = new BoxGeometry(0.12, 0.05, 0.32);
        const toothMat = new MeshStandardMaterial({ color: 0x042a2a, emissive: 0x00ffd6, emissiveIntensity: 0.18, metalness: 0.9, roughness: 0.18 });
        const teethCount = 10 + i * 4;
        for (let t = 0; t < teethCount; t++) {
          const angle = (t / teethCount) * Math.PI * 2;
          const tx = Math.cos(angle) * (radius + 0.14);
          const ty = Math.sin(angle) * (radius + 0.14);
          const tooth = new Mesh(toothGeo, toothMat);
          tooth.position.set(tx, ty, (i - 1) * 0.06);
          tooth.rotation.z = angle;
          teeth.add(tooth);
        }
        parent.add(teeth);

        const axle = new Mesh(new CylinderGeometry(0.12, 0.12, 0.36, 24), new MeshStandardMaterial({ color: 0x001414, metalness: 1, roughness: 0.08 }));
        axle.rotation.x = Math.PI * 0.5;
        axle.position.z = (i - 1) * 0.06;
        parent.add(axle);
      }
    }

    // Setup icon nodes with real logos (with fallback)
    function setupIconNodesWithLogos(scene, camera, renderer, nodesArr, beamsArr, labelsArr) {
      const raycaster = new Raycaster();
      const mouse = new Vector2();

      function onPointerDown(e) {
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        const hits = raycaster.intersectObjects(nodesArr, true);
        if (hits.length) {
          const obj = hits[0].object;
          const idx = nodesArr.indexOf(obj);
          if (idx >= 0) {
            const link = CHANNELS[idx].link;
            if (link) window.open(link, "_blank", "noopener");
          }
        }
      }
      renderer.domElement.addEventListener("pointerdown", onPointerDown);

      // create nodes; we await all textures to keep consistent rendering
      const promises = CHANNELS.map((ch, i) =>
        loadTextureSafe(ch.icon, ch.text, ch.color).then((tex) => {
          const planeGeo = new PlaneGeometry(1.6, 1.6);
          const mat = new MeshBasicMaterial({ map: tex, transparent: true });
          const plane = new Mesh(planeGeo, mat);
          plane.userData = { orbit: 9.6 + i * 0.9, angle: Math.random() * Math.PI * 2, phase: i, scale: 1, dir: 1 };
          plane.renderOrder = 999;
          scene.add(plane);
          nodesArr.push(plane);

          const beam = new Line(new BufferGeometry().setFromPoints([new Vector3(), new Vector3()]), new LineBasicMaterial({ color: parseInt(ch.color.replace("#", "0x")), transparent: true, opacity: 0 }));
          scene.add(beam);
          beamsArr.push(beam);

          const lbl = document.createElement("div");
          lbl.className = "lk-label lk-label--small";
          lbl.innerText = ch.id;
          lbl.style.opacity = "0.55";
          document.body.appendChild(lbl);
          labelsArr.push(lbl);
        })
      );

      return Promise.all(promises).then(() => {
        return function teardown() {
          renderer.domElement.removeEventListener("pointerdown", onPointerDown);
          labelsArr.forEach((l) => l.remove());
        };
      });
    }

    // ---- Init scene ----
    (function init() {
      if (!mountRef.current) return;

      const mount = mountRef.current;
      const w = Math.max(1, mount.clientWidth);
      const h = Math.max(1, mount.clientHeight);

      scene = new Scene();
      camera = new PerspectiveCamera(55, w / h, 0.1, 4000);
      camera.position.set(0, 0.9, 26);

      renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, prefersReduced ? 1 : 2));
      renderer.setSize(w, h, false);
      renderer.outputColorSpace = SRGBColorSpace;
      mount.appendChild(renderer.domElement);

      scene.add(new AmbientLight(0x66fff0, 0.42));
      rotatingLight = new PointLight(0x00e5d1, 1.2, 220);
      scene.add(rotatingLight);
      const key = new PointLight(0x66ffee, 0.6, 300);
      key.position.set(10, 8, 16);
      scene.add(key);

      // engine group + gears
      engineGroup = new Group();
      scene.add(engineGroup);
      createGears(engineGroup);

      // outer globe (transparent)
      coreOuter = new Mesh(new SphereGeometry(6.2, prefersReduced ? 64 : 128, prefersReduced ? 64 : 128), new MeshStandardMaterial({
        color: 0x002426, metalness: 0.6, roughness: 0.55, emissive: 0x003632, emissiveIntensity: 0.45, transparent: true, opacity: 0.18
      }));
      scene.add(coreOuter);

      const inner = new Mesh(new SphereGeometry(4.8, prefersReduced ? 64 : 96, prefersReduced ? 48 : 96), new MeshStandardMaterial({
        color: 0x071515, metalness: 0.9, roughness: 0.12, emissive: 0x002e2a, emissiveIntensity: 0.65, transparent: true, opacity: 0.95
      }));
      scene.add(inner);

      wire = new Mesh(new SphereGeometry(6.22, prefersReduced ? 64 : 128, prefersReduced ? 64 : 128), new MeshBasicMaterial({
        color: 0x00ffe0, wireframe: true, transparent: true, opacity: 0.46
      }));
      scene.add(wire);

      halo = new Mesh(new SphereGeometry(6.6, prefersReduced ? 48 : 64, prefersReduced ? 48 : 64), new MeshBasicMaterial({
        color: 0x00e5d1, transparent: true, opacity: 0.08, side: BackSide
      }));
      scene.add(halo);

      // central logo
      const texLoader = new TextureLoader();
      const logoTex = texLoader.load(CENTER_LOGO, (t) => { try { t.colorSpace = SRGBColorSpace; } catch (e) {} });
      const logoSphere = new Mesh(new SphereGeometry(1.9, prefersReduced ? 32 : 64, prefersReduced ? 32 : 64), new MeshStandardMaterial({
        map: logoTex, metalness: 0.9, roughness: 0.12, emissive: 0x002c2a, emissiveIntensity: 0.6
      }));
      engineGroup.add(logoSphere);

      // starfield
      const STAR_COUNT = Math.max(1400, Math.floor((window.innerWidth * window.innerHeight) / 2500));
      const starGeo = new BufferGeometry();
      const starPos = new Float32Array(STAR_COUNT * 3);
      for (let i = 0; i < STAR_COUNT; i++) {
        starPos[i * 3 + 0] = (Math.random() - 0.5) * 3000;
        starPos[i * 3 + 1] = (Math.random() - 0.5) * 1400;
        starPos[i * 3 + 2] = (Math.random() - 0.5) * 3000 - 400;
      }
      starGeo.setAttribute("position", new BufferAttribute(starPos, 3));
      particles = new Points(starGeo, new PointsMaterial({ color: 0x6fffe8, size: 0.06, transparent: true, opacity: 0.34, depthWrite: false }));
      scene.add(particles);

      // icons + beams
      const teardownPromise = setupIconNodesWithLogos(scene, camera, renderer, nodes, beams, labels);

      // animation
      const t0 = performance.now();
      const animate = () => {
        rafId = requestAnimationFrame(animate);
        const t = (performance.now() - t0) * 0.001;

        coreOuter.rotation.y += 0.0048;
        coreOuter.rotation.x += 0.0008;
        engineGroup.rotation.y += 0.009;
        engineGroup.children.forEach((c, idx) => (c.rotation.z += ((idx % 2 ? -1 : 1) * 0.01 * (0.9 + idx * 0.04))));
        wire.rotation.y += 0.0046;
        halo.rotation.y -= 0.002;
        particles.rotation.y += 0.0009;

        nodes.forEach((n, i) => {
          n.userData.angle += 0.0045 + (i * 0.00018);
          const phase = n.userData.angle;
          const r = n.userData.orbit + Math.sin(t * 0.6 + i) * 0.35;
          n.position.set(Math.cos(phase) * r, Math.sin(phase * 1.05) * 1.1, Math.sin(phase) * r * 0.98);
          n.userData.scale += 0.0025 * n.userData.dir;
          if (n.userData.scale > 1.15 || n.userData.scale < 0.88) n.userData.dir *= -1;
          n.scale.setScalar(n.userData.scale);

          const beam = beams[i];
          beam.geometry.setFromPoints([new Vector3(), n.position.clone()]);
          beam.material.opacity = Math.max(beam.material.opacity * 0.96, Math.min(0.7, Math.abs(Math.sin(t + i) * 0.8)));

          const scr = n.position.clone().project(camera);
          const x = (scr.x * 0.5 + 0.5) * window.innerWidth;
          const y = (-scr.y * 0.5 + 0.5) * window.innerHeight;
          const lbl = labels[i];
          if (lbl) {
            lbl.style.transform = `translate3d(${Math.round(x)}px, ${Math.round(y)}px, 0) translate(-50%,-50%)`;
            lbl.style.opacity = beam.material.opacity > 0.18 ? "1" : "0.48";
          }
        });

        camera.position.x = Math.sin(t * 0.12) * 0.9;
        camera.position.y = Math.sin(t * 0.18) * 0.55;
        camera.lookAt(0, 0, 0);

        renderer.render(scene, camera);
      };
      animate();

      cleanupRef.current = async () => {
        try {
          const teardown = await teardownPromise;
          if (teardown) teardown();
          labels.forEach(l => l.remove());
          nodes.forEach(n => { n.geometry && n.geometry.dispose?.(); n.material && n.material.dispose?.(); });
          beams.forEach(b => { b.geometry && b.geometry.dispose?.(); b.material && b.material.dispose?.(); });
          particles && particles.geometry && particles.geometry.dispose?.();
          renderer.domElement && renderer.domElement.remove();
          renderer && renderer.dispose?.();
          cancelAnimationFrame(rafId);
        } catch (e) { console.warn("cleanup error", e); }
      };

      window.addEventListener("resize", () => {
        const rect = mountRef.current.getBoundingClientRect();
        const ww = Math.max(1, Math.floor(rect.width || window.innerWidth));
        const hh = Math.max(1, Math.floor(rect.height || window.innerHeight));
        renderer.setSize(ww, hh, false);
        camera.aspect = ww / hh;
        camera.updateProjectionMatrix();
      }, { passive: true });
    })();

    return () => {
      try { if (cleanupRef.current) cleanupRef.current(); } catch (e) {}
    };
  }, []);

  return (
    <section className="lukairo-hero">
      <header className="lukairo-header">
        <div className="lukairo-header-inner">
          <div className="lukairo-brand"><img className="lukairo-logo" src="https://storage.googleapis.com/msgsndr/B47X3dkLb4AkvxzX2Tck/media/68fdb1e49c7b3a610f587b93.png" alt="LUKAIRO" /><span className="lukairo-brand-text">LUKAIRO</span></div>
          <nav className="lukairo-nav" aria-label="Main navigation"><a href="#flow">How it works</a><a href="#aiva">Aiva</a><a href="#book">Book</a><a href="#contact">Contact</a></nav>
          <div className="lukairo-header-actions"><a className="lukairo-cta" href={bookingHref} target="_blank" rel="noreferrer">Book a Call</a></div>
        </div>
      </header>

      <div id="lukairo-engine">
        <div className="lukairo-hud"><h1 className="lukairo-title">LUK<span>AIRO</span></h1><p className="lukairo-sub">THE NEURAL CORE · CONNECTING EVERYTHING</p></div>
        <div className="lukairo-core-glow" aria-hidden="true" />
        <div id="lukairo-canvas" ref={mountRef} aria-hidden="true" />
      </div>
    </section>
  );
}
