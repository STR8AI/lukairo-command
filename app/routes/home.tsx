diff --git a/app/routes/home.tsx b/app/routes/home.tsx
index f3b6d93f5954279bb6a2b247f9024a75357fd89d..3b49b47b3e1bbf412f545727c5bd8587128ed307 100644
--- a/app/routes/home.tsx
+++ b/app/routes/home.tsx
@@ -1,59 +1,24 @@
 import type { Route } from "./+types/home";
 import styles from "./home.css?url";
 
 export const links: Route.LinksFunction = () => [{ rel: "stylesheet", href: styles }];
 
 export function meta() {
   return [
-    { title: "Maritime HVAC | Home, Health & Peace of Mind" },
+    { title: "Lukairo Homepage" },
     {
       name: "description",
-      content:
-        "Maritime HVAC delivers heating, cooling, electrical, and water quality solutions across the Maritimes with trusted service and flexible payment options.",
+      content: "Welcome to Lukairo — your go-to platform for all your needs.",
     },
   ];
 }
 
 export default function Home() {
   return (
-    <main className="maritime-home">
-      <header className="site-header">
-        <div className="brand">
-          <div className="brand-mark" aria-hidden="true">
-            M
-          </div>
-          <div>
-            <p className="brand-name">Maritime HVAC</p>
-            <p className="brand-tag">Home, Health &amp; Peace of Mind</p>
-          </div>
-        </div>
-        <nav className="main-nav" aria-label="Main menu">
-          <a href="#services">Services</a>
-          <a href="#payment-options">Payment Options</a>
-          <a href="/request-service">Request Service</a>
-          <a href="https://www.financeit.io/" target="_blank" rel="noreferrer">
-            Financing
-          </a>
-          <a href="#warranty">Warranty</a>
-          <a href="#contact">Contact</a>
-        </nav>
-        <div className="header-actions">
-          <a className="phone" href="tel:19024146000">
-            Call Us (902) 414.6000
-          </a>
-          <div className="socials" aria-label="Social media links">
-            <a href="https://www.facebook.com" target="_blank" rel="noreferrer">
-              Facebook
-            </a>
-            <a href="https://www.instagram.com" target="_blank" rel="noreferrer">
-              Instagram
-            </a>
-            <a href="https://www.linkedin.com" target="_blank" rel="noreferrer">
-              LinkedIn
-            </a>
-          </div>
-        </div>
-      </header>
+    <main className="lukairo-home">
+      <img className="lukairo-logo" src="/lukairo-logo.svg" alt="Lukairo Logo" />
+      <h1>Welcome to Lukairo!</h1>
+      <p>Your go-to platform for all your needs.</p>
     </main>
   );
 }
