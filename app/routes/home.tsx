diff --git a/app/routes/home.css b/app/routes/home.css
index c2295b423025886ed5e3b39c76f892ff678aa307..c965bda4f2c0ae4d55cbaebef000a77754a11989 100644
--- a/app/routes/home.css
+++ b/app/routes/home.css
@@ -1,106 +1,38 @@
 :root {
-  color-scheme: light;
   font-family: "Inter", "Segoe UI", system-ui, sans-serif;
-  --navy: #0b1a2b;
-  --mist: #f5f7fb;
-  --red: #d94841;
-  --text: #1b2430;
-  --muted: #5c6a7a;
 }
 
 * {
   box-sizing: border-box;
 }
 
 body {
   margin: 0;
-  background: var(--mist);
-  color: var(--text);
-}
-
-a {
-  color: inherit;
-  text-decoration: none;
-}
-
-a:hover {
-  color: var(--red);
-}
-
-.maritime-home {
-  max-width: 1200px;
-  margin: 0 auto;
-  padding: 24px 20px 60px;
-}
-
-.site-header {
-  display: flex;
-  flex-wrap: wrap;
-  align-items: center;
-  justify-content: space-between;
-  gap: 16px;
-  padding: 16px 0 24px;
-  border-bottom: 2px solid #fff;
-}
-
-.brand {
-  display: flex;
-  align-items: center;
-  gap: 12px;
-}
-
-.brand-mark {
-  width: 48px;
-  height: 48px;
-  border-radius: 14px;
-  background: var(--navy);
-  color: white;
+  min-height: 100vh;
   display: grid;
   place-items: center;
-  font-weight: 800;
-  font-size: 20px;
-}
-
-.brand-name {
-  font-size: 20px;
-  font-weight: 800;
-  margin: 0;
+  background: #f8fafc;
+  color: #0f172a;
 }
 
-.brand-tag {
-  margin: 4px 0 0;
-  color: var(--muted);
-  font-weight: 500;
+.lukairo-home {
+  text-align: center;
+  padding: 2rem;
 }
 
-.main-nav {
-  display: flex;
-  flex-wrap: wrap;
-  gap: 16px;
-  font-weight: 600;
+.lukairo-logo {
+  width: 96px;
+  height: 96px;
+  margin-bottom: 1rem;
 }
 
-.header-actions {
-  display: flex;
-  flex-direction: column;
-  align-items: flex-end;
-  gap: 8px;
-}
-
-.phone {
-  font-weight: 700;
-  color: var(--navy);
-}
-
-.socials {
-  display: flex;
-  gap: 12px;
-  font-size: 14px;
-  color: var(--muted);
+h1 {
+  margin: 0;
+  font-size: clamp(2rem, 4vw, 2.75rem);
 }
 
-@media (max-width: 800px) {
-  .header-actions {
-    align-items: flex-start;
-  }
+p {
+  margin: 0.75rem 0 0;
+  color: #475569;
+  font-size: 1.1rem;
 }
