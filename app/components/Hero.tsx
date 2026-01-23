import { useEffect, useRef, useState } from "react";
import "./hero-lukairo.css";

type HeroProps = {
  bookingHref?: string;
};

export default function Hero({ bookingHref }: HeroProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let renderer: import("three").WebGLRenderer | null = null;
    let scene: import("three").Scene | null = null;
    let camera: import("three").PerspectiveCamera | null = null;
    let coreGroup: import("three").Group | null = null;
    let frameId = 0;
    let iconSystem: any = null;

    const labels: HTMLDivElement[] = [];
    const nodes: import("three").Mesh[] = [];
    const beams: import("three").Line[] = [];

    const disposeObject = (obj?: { traverse?: (fn: (c: any) => void) => void }) => {
      obj?.traverse?.((child: any) => {
        child.geometry?.dispose?.();
        if (child.material) {
          if (Array.isArray(child.material)) child.material.forEach((m: any) => m.dispose?.());
          else child.material.dispose?.();
        }
        child.texture?.dispose?.();
      });
    };

    const toScreen = (pos: import("three").Vector3) => {
      if (!camera) return { x: 0, y: 0, z: 0 };
      const projected = pos.clone().project(camera);
      return {
        x: (projected.x + 1) * 0.5 * window.innerWidth,
        y: (-projected.y + 1) * 0.5 * window.innerHeight,
        z: projected.z,
      };
    };

    const createGears = (THREE: typeof import("three"), parent: import("three").Group) => {
      const gears = [
        { radius: 2.4, teeth: 18, thickness: 0.24, speed: 0.005, color: 0x00e5d1 },
        { radius: 1.6, teeth: 14, thickness: 0.22, speed: -0.007, color: 0x6cead9 },
        { radius: 1.1, teeth: 10, thickness: 0.2, speed: 0.009, color: 0x00ffee },
      ];

      return gears.map((g, i) => {
        const points = [] as import("three").Vector2[];
        for (let t = 0; t < g.teeth; t++) {
          const a1 = (t / g.teeth) * Math.PI * 2;
          const a2 = ((t + 0.5) / g.teeth) * Math.PI * 2;
          points.push(new THREE.Vector2(Math.cos(a1) * g.radius, Math.sin(a1) * g.radius));
          points.push(new THREE.Vector2(Math.cos(a2) * (g.radius * 1.08), Math.sin(a2) * (g.radius * 1.08)));
        }
        const shape = new THREE.Shape(points);
        const geo = new THREE.ExtrudeGeometry(shape, { depth: g.thickness, bevelEnabled: false });
        geo.center();
        const mat = new THREE.MeshStandardMaterial({
          color: g.color,
          metalness: 0.8,
          roughness: 0.3,
          emissive: g.color,
          emissiveIntensity: 0.3,
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.rotation.x = Math.PI * 0.5;
        mesh.position.y = i * 0.05;
        parent.add(mesh);
        return { mesh, speed: g.speed };
      });
    };

    const createAtmosphere = (
      THREE: typeof import("three"),
      parent: import("three").Group
    ) => {
      const layers = [
        { radius: 3.5, color: 0x00ffee, opacity: 0.08, spin: 0.0015 },
        { radius: 4.2, color: 0x00e5d1, opacity: 0.06, spin: -0.0012 },
        { radius: 5.6, color: 0x6cead9, opacity: 0.04, spin: 0.0008 },
      ];

      return layers.map((l) => {
        const g = new THREE.SphereGeometry(l.radius, 64, 64);
        const m = new THREE.MeshStandardMaterial({
          color: l.color,
          transparent: true,
          opacity: l.opacity,
          wireframe: true,
        });
        const mesh = new THREE.Mesh(g, m);
        parent.add(mesh);
        return { mesh, spin: l.spin };
      });
    };

    // CHANNELS: replace icon URLs with your own public icons if you have them.
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

    // Helpers: CORS-safe load and canvas fallback
    function makeCanvasIcon(THREE: typeof import("three"), text = 'LK', bg = '#00e5d1', size = 256) {
      const c = document.createElement('canvas'); c.width = c.height = size;
      const ctx = c.getContext('2d')!;
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

    function hexToRgba(hex: string, a = 1){
      if (hex[0] === '#') hex = hex.slice(1);
      const bigint = parseInt(hex,16);
      const r = (bigint>>16)&255, g = (bigint>>8)&255, b = bigint&255;
      return `rgba(${r},${g},${b},${a})`;
    }

    function loadTextureSafe(THREE: typeof import("three"), url: string, fallbackText='LK', fallbackColor='#00e5d1'){
      return new Promise<import("three").Texture>(resolve => {
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

    const createIconNodes = async (
      THREE: typeof import("three"),
      scene: import("three").Scene,
      camera: import("three").PerspectiveCamera,
      renderer: import("three").WebGLRenderer,
      options: { orbitBase?: number; planeSize?: number } = {}
    ) => {
      // options: orbitBase, planeSize
      const orbitBase = options.orbitBase || 9.6;
      const planeSize = options.planeSize || 1.9;
      const nodeGeo = new THREE.PlaneGeometry(planeSize, planeSize);
      const nodes: import("three").Mesh[] = [], beams: import("three").Line[] = [], labels: HTMLDivElement[] = [];

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
      let hovered: import("three").Mesh | null = null;

      function onPointerMove(e: PointerEvent){
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        ray.setFromCamera(mouse, camera);
        const hits = ray.intersectObjects(nodes, true);
        if (hits.length) {
          const obj = hits[0].object as import("three").Mesh;
          if (hovered !== obj) {
            if (hovered) hovered.scale.setScalar(1);
            hovered = obj; hovered.scale.setScalar(1.25);
          }
        } else {
          if (hovered) hovered.scale.setScalar(1);
          hovered = null;
        }
      }
      function onPointerDown(e: PointerEvent){
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        ray.setFromCamera(mouse, camera);
        const hits = ray.intersectObjects(nodes, true);
        if (hits.length) {
          const obj = hits[0].object as import("three").Mesh;
          const link = obj.userData.link;
          if (link) window.open(link, '_blank', 'noopener');
        }
      }
      renderer.domElement.addEventListener('pointermove', onPointerMove);
      renderer.domElement.addEventListener('pointerdown', onPointerDown);

      // animation updater — call this in your main animate loop
      function updateIcons(now: number, camera: import("three").PerspectiveCamera) {
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
    };

    const createStarfield = (
      THREE: typeof import("three"),
      parent: import("three").Scene
    ) => {
      const geometry = new THREE.BufferGeometry();
      const count = 5400;
      const positions = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        const r = 180 + Math.random() * 520;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = r * Math.cos(phi);
      }
      geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      const material = new THREE.PointsMaterial({
        color: 0x00e5d1,
        size: 0.45,
        transparent: true,
        opacity: 0.35,
        depthWrite: false,
      });
      const points = new THREE.Points(geometry, material);
      parent.add(points);
      return points;
    };

    const onResize = () => {
      if (!renderer || !camera || !mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    const init = async () => {
      if (!mountRef.current) return;
      const THREE = await import("three");

      const width = mountRef.current.clientWidth || window.innerWidth;
      const height = mountRef.current.clientHeight || 640;

      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(62, width / height, 0.1, 1200);
      camera.position.set(0, 0, 22);

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      mountRef.current.appendChild(renderer.domElement);

      const ambient = new THREE.AmbientLight(0x00e5d1, 0.4);
      const key = new THREE.PointLight(0x00ffee, 1.3, 120);
      key.position.set(10, 12, 18);
      const fill = new THREE.PointLight(0x6cead9, 0.8, 90);
      fill.position.set(-14, -6, 16);
      scene.add(ambient, key, fill);

      coreGroup = new THREE.Group();
      scene.add(coreGroup);

      const baseCore = new THREE.Mesh(
        new THREE.IcosahedronGeometry(3.6, 3),
        new THREE.MeshStandardMaterial({
          color: 0x04110f,
          metalness: 0.7,
          roughness: 0.2,
          emissive: 0x003833,
          emissiveIntensity: 0.6,
        })
      );
      coreGroup.add(baseCore);

      const gears = createGears(THREE, coreGroup);
      const atmospheres = createAtmosphere(THREE, coreGroup);
      iconSystem = await createIconNodes(THREE, scene, camera, renderer, { orbitBase: 7.5, planeSize: 1.9 });
      // assign to global arrays for compatibility
      nodes.push(...iconSystem.nodes);
      beams.push(...iconSystem.beams);
      labels.push(...iconSystem.labels);
      const stars = createStarfield(THREE, scene);

      const hudPlane = new THREE.Mesh(
        new THREE.PlaneGeometry(8, 5),
        new THREE.MeshBasicMaterial({
          color: 0x04110f,
          transparent: true,
          opacity: 0.35,
        })
      );
      hudPlane.position.set(-5.5, -5.5, -6);
      hudPlane.rotation.x = -0.08;
      hudPlane.rotation.y = 0.24;
      coreGroup.add(hudPlane);

      const start = performance.now();
      const motionReduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

      const animate = () => {
        frameId = requestAnimationFrame(animate);
        if (!renderer || !scene || !camera || !coreGroup) return;

        const t = (performance.now() - start) * 0.001;

        coreGroup.rotation.y = t * 0.12;
        baseCore.rotation.x = t * 0.16;
        baseCore.rotation.y = t * 0.14;

        gears.forEach(({ mesh, speed }) => {
          mesh.rotation.z += speed;
        });

        atmospheres.forEach(({ mesh, spin }) => {
          mesh.rotation.y += spin;
        });

        if (iconSystem) iconSystem.update(performance.now(), camera);

        if (!motionReduced) {
          stars.rotation.y += 0.0006;
          stars.rotation.x += 0.0003;
          camera.position.z = 22 + Math.sin(t * 0.3) * 0.5;
          camera.lookAt(0, 0, 0);
        }

        renderer.render(scene, camera);
      };

      animate();
      setLoaded(true);
      window.addEventListener("resize", onResize);
    };

    init();

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", onResize);
      if (iconSystem) iconSystem.dispose();
      labels.forEach((el) => el.remove());
      disposeObject(coreGroup ?? undefined);
      if (renderer) {
        renderer.dispose?.();
        renderer.forceContextLoss?.();
        renderer.domElement?.remove();
      }
      scene = null;
      camera = null;
      coreGroup = null;
      iconSystem = null;
    };
  }, []);

  return (
    <section id="lukairo-engine">
      <div className="lukairo-header">
        <div className="lukairo-header-inner">
          <div className="lukairo-brand">
            <div className="lukairo-logo" aria-hidden="true" />
            <span className="lukairo-brand-text">LUKAIRO</span>
          </div>
          <nav className="lukairo-nav" aria-label="Primary">
            <a href="#services">Services</a>
            <a href="#chat">Chat</a>
            <a href="#booking">Booking</a>
          </nav>
          <div className="lukairo-cta">
            <a
              className="lk-btn primary"
              href={
                bookingHref ??
                "https://www.lukairoengine.com/widget/booking/SGgO7LS3M1CVcD0ok6xV"
              }
            >
              Book a call
            </a>
            <a className="lk-btn ghost" href="#chat">
              Open chat
            </a>
          </div>
        </div>
      </div>

      <div className="lukairo-hud">
        <h1 className="lukairo-title">
          LUKAIRO <span>ENGINE</span>
        </h1>
        <p className="lukairo-sub">Connect • Orchestrate • Automate</p>
      </div>

      <div className="lukairo-core-glow" aria-hidden="true" />

      <div id="lukairo-canvas" ref={mountRef} aria-label="3D engine visualization" />

      {!loaded && (
        <div className="lukairo-loader" role="status" aria-live="polite">
          <div className="loader-wrap">
            <div className="loader-rings">
              <span className="ring r1" />
              <span className="ring r2" />
              <span className="ring r3" />
            </div>
            <div>Starting engines...</div>
          </div>
        </div>
      )}
    </section>
  );
}