import { useEffect, useRef, useState } from "react";
import "./hero-lukairo.css";

type HeroProps = {
  bookingHref?: string;
  gearsTextureUrl?: string;
  circuitsTextureUrl?: string;
  globeTextureUrl?: string;
};

const DEFAULT_TEXTURES = {
  gears: "/assets/lukairo_gears.svg",
  circuits: "/assets/lukairo_circuits.svg",
  globe: "/assets/lukairo_globe.svg",
};

export default function Hero({
  bookingHref,
  gearsTextureUrl = DEFAULT_TEXTURES.gears,
  circuitsTextureUrl = DEFAULT_TEXTURES.circuits,
  globeTextureUrl = DEFAULT_TEXTURES.globe,
}: HeroProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [showFallback, setShowFallback] = useState(false);

  useEffect(() => {
    let renderer: import("three").WebGLRenderer | null = null;
    let scene: import("three").Scene | null = null;
    let camera: import("three").PerspectiveCamera | null = null;
    let frameId = 0;
    let clock: import("three").Clock | null = null;
    let gearsCore: import("three").Mesh | null = null;
    let circuitShell: import("three").Mesh | null = null;
    let globeShell: import("three").Mesh | null = null;
    let wireMesh: import("three").Mesh | null = null;
    let starField: import("three").Points | null = null;

    const disposeObject = (obj?: { traverse?: (fn: (c: any) => void) => void }) => {
      obj?.traverse?.((child: any) => {
        child.geometry?.dispose?.();
        if (child.material) {
          if (Array.isArray(child.material)) child.material.forEach((m: any) => m.dispose?.());
          else child.material.dispose?.();
        }
      });
    };

    const isWebGLAvailable = () => {
      try {
        const canvas = document.createElement("canvas");
        return !!(
          window.WebGLRenderingContext &&
          (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
        );
      } catch {
        return false;
      }
    };

    const onResize = () => {
      if (!renderer || !camera || !mountRef.current) return;
      const rect = mountRef.current.getBoundingClientRect();
      const width = Math.max(1, Math.floor(rect.width || window.innerWidth));
      const height = Math.max(1, Math.floor(rect.height || window.innerHeight));
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    const createStarfield = (THREE: typeof import("three"), count = 1200, radius = 6.5) => {
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        const r = radius * (0.6 + Math.random() * 0.4);
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = r * Math.cos(phi);
      }
      geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      const material = new THREE.PointsMaterial({
        color: 0x66ffcc,
        size: 0.01,
        transparent: true,
        opacity: 0.6,
      });
      return new THREE.Points(geometry, material);
    };

    const loadTexture = (
      loader: import("three").TextureLoader,
      url: string,
      apply: (tex: import("three").Texture) => void
    ) => {
      loader.load(
        url,
        (tex) => {
          apply(tex);
        },
        undefined,
        (err) => {
          console.warn("Texture load failed", url, err);
        }
      );
    };

    const init = async () => {
      if (!mountRef.current) return;
      if (!isWebGLAvailable()) {
        setShowFallback(true);
        return;
      }

      const THREE = await import("three");
      const rect = mountRef.current.getBoundingClientRect();
      const width = Math.max(1, Math.floor(rect.width || window.innerWidth));
      const height = Math.max(1, Math.floor(rect.height || window.innerHeight));

      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 100);
      camera.position.set(0, 0.5, 2.7);

      const motionReduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
      const pixelRatio = Math.min(window.devicePixelRatio || 1, motionReduced ? 1 : 2);

      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      });
      renderer.setPixelRatio(pixelRatio);
      renderer.setSize(width, height, false);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.2;

      mountRef.current.appendChild(renderer.domElement);

      scene.add(new THREE.AmbientLight(0x66ffcc, 0.35));
      const keyLight = new THREE.PointLight(0x4cffc4, 1.4, 10);
      keyLight.position.set(2.2, 2.3, 3.2);
      scene.add(keyLight);
      const rimLight = new THREE.PointLight(0x00ffaa, 0.8, 8);
      rimLight.position.set(-2.6, -1.4, -2.7);
      scene.add(rimLight);

      const textureLoader = new THREE.TextureLoader();
      textureLoader.setCrossOrigin("anonymous");

      const coreGeo = new THREE.SphereGeometry(0.45, 96, 96);
      const coreMat = new THREE.MeshStandardMaterial({
        color: 0x222222,
        roughness: 0.35,
        metalness: 0.85,
        emissive: new THREE.Color(0x22ffbb),
        emissiveIntensity: 0.7,
      });
      gearsCore = new THREE.Mesh(coreGeo, coreMat);
      scene.add(gearsCore);

      loadTexture(textureLoader, gearsTextureUrl, (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = Math.min(renderer?.capabilities.getMaxAnisotropy?.() || 1, 8);
        if (gearsCore?.material) {
          gearsCore.material.map = tex;
          gearsCore.material.emissiveIntensity = 0.9;
          gearsCore.material.needsUpdate = true;
        }
      });

      const circGeo = new THREE.SphereGeometry(0.65, 96, 96);
      const circMat = new THREE.MeshStandardMaterial({
        color: 0x031015,
        roughness: 0.55,
        metalness: 0.3,
        emissive: new THREE.Color(0x1bffc0),
        emissiveIntensity: 0.45,
        transparent: true,
        opacity: 0.9,
      });
      circuitShell = new THREE.Mesh(circGeo, circMat);
      scene.add(circuitShell);

      loadTexture(textureLoader, circuitsTextureUrl, (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
        tex.anisotropy = Math.min(renderer?.capabilities.getMaxAnisotropy?.() || 1, 8);
        if (circuitShell?.material) {
          circuitShell.material.map = tex;
          circuitShell.material.needsUpdate = true;
        }
      });

      const globeGeo = new THREE.SphereGeometry(0.85, 96, 96);
      const globeMat = new THREE.MeshPhongMaterial({
        color: 0x020b11,
        emissive: 0x0cf0b0,
        emissiveIntensity: 0.55,
        shininess: 16,
        transparent: true,
        opacity: 0.55,
      });
      globeShell = new THREE.Mesh(globeGeo, globeMat);
      scene.add(globeShell);

      loadTexture(textureLoader, globeTextureUrl, (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = Math.min(renderer?.capabilities.getMaxAnisotropy?.() || 1, 8);
        if (globeShell?.material) {
          globeShell.material.map = tex;
          globeShell.material.needsUpdate = true;
        }
      });

      const wireMat = new THREE.MeshBasicMaterial({
        color: 0x36ffca,
        wireframe: true,
        transparent: true,
        opacity: 0.12,
      });
      wireMesh = new THREE.Mesh(globeGeo, wireMat);
      scene.add(wireMesh);

      starField = createStarfield(THREE, 1200, 6.5);
      scene.add(starField);

      clock = new THREE.Clock();
      const animate = () => {
        frameId = requestAnimationFrame(animate);
        if (!renderer || !scene || !camera || !clock) return;
        const dt = clock.getDelta();
        if (gearsCore) gearsCore.rotation.y += 0.6 * dt;
        if (circuitShell) circuitShell.rotation.y -= 0.5 * dt;
        if (globeShell) globeShell.rotation.y += 0.3 * dt;
        if (wireMesh) wireMesh.rotation.y += 0.3 * dt;
        renderer.render(scene, camera);
      };

      animate();
      setLoaded(true);
      window.addEventListener("resize", onResize, { passive: true });
    };

    init();

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", onResize);
      disposeObject(scene ?? undefined);
      if (renderer) {
        renderer.dispose?.();
        renderer.forceContextLoss?.();
        renderer.domElement?.remove();
      }
      scene = null;
      camera = null;
      renderer = null;
      clock = null;
      gearsCore = null;
      circuitShell = null;
      globeShell = null;
      wireMesh = null;
      starField = null;
    };
  }, [gearsTextureUrl, circuitsTextureUrl, globeTextureUrl]);

  return (
    <section id="lukairo-engine" role="region" aria-label="LUKAIRO Neural Core">
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
          LUK<span>AIRO</span>
        </h1>
        <p className="lukairo-sub">The neural core · connecting everything</p>
      </div>

      <div className="lukairo-core-glow" aria-hidden="true" />

      <div
        id="lukairo-canvas"
        ref={mountRef}
        role="img"
        aria-label="Three rotating layered spheres representing gears, circuits, and a data globe with starfield backdrop."
      />

      {!loaded && !showFallback && (
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

      {showFallback && (
        <div id="lukairo-fallback" role="status" aria-live="polite">
          <h2>LUKAIRO Engine</h2>
          <p>Unable to initialize the 3D visualization. This feature requires WebGL.</p>
          <small>Check GPU settings and CDN headers, then retry.</small>
        </div>
      )}
    </section>
  );
}