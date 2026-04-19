// file: app/root.tsx
import type { LinksFunction } from "@remix-run/cloudflare";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";

export const links: LinksFunction = () => [];

export default function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}

// file: app/routes/_index.tsx
import { useEffect } from "react";
import type { LinksFunction, MetaFunction } from "@remix-run/cloudflare";

export const meta: MetaFunction = () => [{ title: "LUKAIRO" }];

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: "/css/hero.css" },
];

export default function Index() {
  useEffect(() => {
    let cancelled = false;

    const loadScript = (id: string, src: string) =>
      new Promise<void>((resolve, reject) => {
        const existing = document.getElementById(id) as HTMLScriptElement | null;

        if (existing) {
          if (existing.dataset.loaded === "true") {
            resolve();
            return;
          }
          existing.addEventListener("load", () => resolve(), { once: true });
          existing.addEventListener(
            "error",
            () => reject(new Error(`Failed to load ${src}`)),
            { once: true }
          );
          return;
        }

        const script = document.createElement("script");
        script.id = id;
        script.src = src;
        script.async = true;
        script.onload = () => {
          script.dataset.loaded = "true";
          resolve();
        };
        script.onerror = () => reject(new Error(`Failed to load ${src}`));
        document.body.appendChild(script);
      });

    (async () => {
      try {
        await loadScript(
          "three-cdn",
          "https://cdnjs.cloudflare.com/ajax/libs/three.js/r167/three.min.js"
        );
        if (cancelled) return;
        await loadScript("hero-globe", "/js/hero-globe.js");
      } catch (error) {
        console.error(error);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="globe-stage">
      <canvas id="globe" />
      <div className="hero-overlay">
        <h1>We build and run revenue systems.</h1>
        <p>
          We connect execution, systems, and growth into a single operating
          layer.
        </p>
        <span>From direct sales floors to elite SaaS and enterprise GTM.</span>
      </div>
    </section>
  );
}

// file: public/css/hero.css
:root {
  --bg: #0e0e11;
  --ink: #f3f5f7;
  --muted: #b7bec7;
  --accent: #00e5d1;
}

* {
  box-sizing: border-box;
}

html,
body {
  margin: 0;
  width: 100%;
  height: 100%;
  background: var(--bg);
  font-family: Inter, system-ui, sans-serif;
  overflow: hidden;
}

.globe-stage {
  position: relative;
  width: 100vw;
  height: 100vh;
  background: var(--bg);
}

.globe-stage::after {
  content: "";
  position: absolute;
  inset: 0;
  background: radial-gradient(
    80% 60% at 50% 45%,
    transparent 40%,
    rgba(14, 14, 17, 0.6) 75%,
    rgba(14, 14, 17, 0.9) 100%
  );
  pointer-events: none;
  z-index: 1;
}

canvas {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  display: block;
  z-index: 0;
}

.hero-overlay {
  position: fixed;
  left: 50%;
  bottom: 14vh;
  transform: translateX(-50%);
  max-width: 720px;
  text-align: center;
  z-index: 2;
  color: var(--ink);
  pointer-events: none;
}

.hero-overlay h1 {
  margin: 0 0 12px;
  font-size: clamp(38px, 5vw, 64px);
  line-height: 1.05;
  font-weight: 900;
  letter-spacing: -0.01em;
}

.hero-overlay p {
  margin: 0 0 10px;
  font-size: 18px;
  line-height: 1.45;
  color: var(--muted);
}

.hero-overlay span {
  display: block;
  margin-top: 6px;
  font-size: 12px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  opacity: 0.65;
}

.lk-label {
  position: fixed;
  z-index: 3;
  color: var(--ink);
  font-family: Inter, system-ui, sans-serif;
  pointer-events: none;
  white-space: nowrap;
  text-shadow: 0 0 18px rgba(0, 229, 209, 0.15);
}

.lk-label--small {
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(243, 245, 247, 0.82);
}

@media (max-width: 768px) {
  .hero-overlay {
    left: 6vw;
    right: 6vw;
    transform: none;
    bottom: 10vh;
    text-align: left;
  }

  .hero-overlay h1 {
    font-size: clamp(32px, 8vw, 44px);
  }

  .hero-overlay p {
    font-size: 16px;
  }
}

// file: public/js/hero-globe.js
(function () {
  "use strict";

  let initialized = false;

  function initGlobe() {
    if (initialized) return;
    initialized = true;

    const canvas = document.getElementById("globe");
    if (!canvas) {
      console.error("Canvas element not found");
      return;
    }

    if (typeof window.THREE === "undefined") {
      console.error("Three.js not loaded");
      return;
    }

    const THREE = window.THREE;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
      });
    } catch (error) {
      console.error("Failed to create WebGL renderer:", error);
      return;
    }

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);

    const geometry = new THREE.SphereGeometry(5, 32, 32);
    const material = new THREE.MeshBasicMaterial({
      color: 0x00e5d1,
      wireframe: true,
      transparent: false,
      opacity: 1,
    });
    const globe = new THREE.Mesh(geometry, material);
    scene.add(globe);

    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    camera.position.z = 10;

    const CHANNELS = [
      { id: "Web Chat", icon: "", link: "#" },
      { id: "SMS", icon: "", link: "sms:+14374947028" },
      { id: "WhatsApp", icon: "", link: "https://wa.me/14374947028" },
      { id: "Messenger", icon: "", link: "#" },
      { id: "Instagram", icon: "", link: "#" },
      { id: "Email", icon: "", link: "mailto:hello@lukairo.com" },
      { id: "Calls", icon: "", link: "tel:+14374947028" },
      { id: "Booking", icon: "", link: "#" },
      { id: "CRM", icon: "", link: "#" },
      { id: "Automation", icon: "", link: "#" },
    ];

    function hexToRgba(hex, alpha) {
      let value = hex;
      if (value.startsWith("#")) value = value.slice(1);
      const int = parseInt(value, 16);
      const r = (int >> 16) & 255;
      const g = (int >> 8) & 255;
      const b = int & 255;
      return `rgba(${r},${g},${b},${alpha})`;
    }

    function makeCanvasIcon(text = "LK", bg = "#00e5d1", size = 256) {
      const iconCanvas = document.createElement("canvas");
      iconCanvas.width = size;
      iconCanvas.height = size;

      const ctx = iconCanvas.getContext("2d");
      if (!ctx) {
        return new THREE.CanvasTexture(iconCanvas);
      }

      const cx = size / 2;
      const cy = size / 2;
      const r = size * 0.45;

      const gradient = ctx.createRadialGradient(cx, cy, r * 0.15, cx, cy, r * 1.15);
      gradient.addColorStop(0, bg);
      gradient.addColorStop(0.5, hexToRgba(bg, 0.55));
      gradient.addColorStop(1, hexToRgba(bg, 0.06));

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, size, size);

      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.78, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(0,0,0,0.18)";
      ctx.fill();

      ctx.fillStyle = "#021515";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = `bold ${Math.floor(size * 0.34)}px system-ui, sans-serif`;
      ctx.fillText(text.slice(0, 2).toUpperCase(), cx, cy + 2);

      const texture = new THREE.CanvasTexture(iconCanvas);
      texture.needsUpdate = true;
      return texture;
    }

    function loadTextureSafe(url, fallbackText = "LK", fallbackColor = "#00e5d1") {
      return new Promise((resolve) => {
        if (!url) {
          resolve(makeCanvasIcon(fallbackText, fallbackColor));
          return;
        }

        const img = new Image();
        img.crossOrigin = "anonymous";
        let done = false;

        img.onload = () => {
          try {
            const texture = new THREE.Texture(img);
            texture.needsUpdate = true;
            done = true;
            resolve(texture);
          } catch (_error) {
            done = true;
            resolve(makeCanvasIcon(fallbackText, fallbackColor));
          }
        };

        img.onerror = () => {
          if (!done) {
            resolve(makeCanvasIcon(fallbackText, fallbackColor));
          }
        };

        img.src = url;

        window.setTimeout(() => {
          if (!done) {
            resolve(makeCanvasIcon(fallbackText, fallbackColor));
          }
        }, 3000);
      });
    }

    async function createIconNodes() {
      const orbitBase = 9.6;
      const planeSize = 1.9;
      const nodeGeo = new THREE.PlaneGeometry(planeSize, planeSize);
      const nodes = [];
      const beams = [];
      const labels = [];

      const textures = await Promise.all(
        CHANNELS.map((channel) =>
          loadTextureSafe(channel.icon, channel.id.slice(0, 2), "#00e5d1")
        )
      );

      CHANNELS.forEach((channel, i) => {
        const planeMaterial = new THREE.MeshBasicMaterial({
          map: textures[i],
          transparent: true,
          side: THREE.DoubleSide,
          depthTest: false,
          depthWrite: false,
        });

        const plane = new THREE.Mesh(nodeGeo, planeMaterial);
        plane.userData = {
          angle: Math.random() * Math.PI * 2,
          speed: 0.002 + Math.random() * 0.0012,
          elev: Math.random() * 0.8 - 0.4,
          beatPhase: Math.random() * Math.PI * 2,
          orbit: orbitBase + i * 0.9,
          link: channel.link || null,
        };
        plane.renderOrder = 9999;
        scene.add(plane);
        nodes.push(plane);

        const beam = new THREE.Line(
          new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(),
            new THREE.Vector3(),
          ]),
          new THREE.LineBasicMaterial({
            color: 0x00e5d1,
            transparent: true,
            opacity: 0.22,
          })
        );
        scene.add(beam);
        beams.push(beam);

        const label = document.createElement("div");
        label.className = "lk-label lk-label--small";
        label.innerText = channel.id;
        document.body.appendChild(label);
        labels.push(label);
      });

      const raycaster = new THREE.Raycaster();
      const mouse = new THREE.Vector2();
      let hovered = null;

      function updateMouse(event) {
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      }

      function onPointerMove(event) {
        updateMouse(event);
        raycaster.setFromCamera(mouse, camera);
        const hits = raycaster.intersectObjects(nodes, true);

        if (hits.length > 0) {
          const object = hits[0].object;
          if (hovered !== object) {
            if (hovered) hovered.scale.setScalar(1);
            hovered = object;
            hovered.scale.setScalar(1.2);
          }
        } else if (hovered) {
          hovered.scale.setScalar(1);
          hovered = null;
        }
      }

      function onPointerDown(event) {
        updateMouse(event);
        raycaster.setFromCamera(mouse, camera);
        const hits = raycaster.intersectObjects(nodes, true);

        if (hits.length > 0) {
          const link = hits[0].object.userData.link;
          if (link && link !== "#") {
            window.open(link, "_blank", "noopener");
          }
        }
      }

      renderer.domElement.addEventListener("pointermove", onPointerMove);
      renderer.domElement.addEventListener("pointerdown", onPointerDown);

      return {
        update(now) {
          const time = now * 0.001;

          nodes.forEach((node, i) => {
            node.userData.angle += node.userData.speed;

            const orbit = node.userData.orbit + Math.sin(time * 0.6 + i) * 0.35;
            node.position.set(
              Math.cos(node.userData.angle) * orbit,
              Math.sin(node.userData.angle * 2) * 0.9 + node.userData.elev * 2.2,
              Math.sin(node.userData.angle) * orbit
            );

            node.lookAt(camera.position);

            const beat = 1 + 0.12 * Math.sin(time + node.userData.beatPhase);
            node.scale.setScalar(beat);

            beams[i].geometry.setFromPoints([new THREE.Vector3(), node.position.clone()]);

            const projected = node.position.clone().project(camera);
            const x = (projected.x * 0.5 + 0.5) * window.innerWidth;
            const y = (-projected.y * 0.5 + 0.5) * window.innerHeight;

            labels[i].style.transform =
              `translate3d(${Math.round(x)}px, ${Math.round(y)}px, 0) translate(-50%,-50%)`;
            labels[i].style.opacity = "1";
          });
        },
        dispose() {
          renderer.domElement.removeEventListener("pointermove", onPointerMove);
          renderer.domElement.removeEventListener("pointerdown", onPointerDown);
          labels.forEach((label) => label.remove());
        },
      };
    }

    let iconSystem = null;

    createIconNodes()
      .then((system) => {
        iconSystem = system;
      })
      .catch((error) => {
        console.error("Failed to create icon nodes:", error);
      });

    function animate() {
      window.requestAnimationFrame(animate);

      globe.rotation.y += 0.005;
      globe.rotation.x += 0.002;

      if (iconSystem) {
        iconSystem.update(performance.now());
      }

      renderer.render(scene, camera);
    }

    function handleResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }

    window.addEventListener("resize", handleResize, false);
    animate();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initGlobe, { once: true });
  } else {
    initGlobe();
  }
})();
