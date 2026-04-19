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
        const material = new THREE.MeshBasicMaterial({
          map: textures[i],
          transparent: true,
          side: THREE.DoubleSide,
          depthTest: false,
          depthWrite: false,
        });

        const plane = new THREE.Mesh(nodeGeo, material);
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

        const line = new THREE.Line(
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
        scene.add(line);
        beams.push(line);

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

            labels[i].style.transform = `translate3d(${Math.round(x)}px, ${Math.round(y)}px, 0) translate(-50%,-50%)`;
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
