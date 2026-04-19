// file: app/routes/_index.tsx
import { useEffect } from "react";
import type { LinksFunction, MetaFunction } from "@remix-run/cloudflare";

export const meta: MetaFunction = () => [{ title: "LUKAIRO" }];

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: "/css/hero.css" },
];

export default function Index() {
  useEffect(() => {
    const threeId = "three-cdn";
    const globeId = "hero-globe";

    const loadScript = (id: string, src: string) =>
      new Promise<void>((resolve, reject) => {
        const existing = document.getElementById(id) as HTMLScriptElement | null;
        if (existing) {
          resolve();
          return;
        }

        const script = document.createElement("script");
        script.id = id;
        script.src = src;
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Failed to load ${src}`));
        document.body.appendChild(script);
      });

    let cancelled = false;

    (async () => {
      try {
        await loadScript(
          threeId,
          "https://cdnjs.cloudflare.com/ajax/libs/three.js/r167/three.min.js"
        );
        if (cancelled) return;
        await loadScript(globeId, "/js/hero-globe.js");
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
