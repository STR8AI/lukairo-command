// Hero Globe Animation using Three.js
document.addEventListener('DOMContentLoaded', function() {
  const canvas = document.getElementById('globe');
  if (!canvas) return;

  // Scene, Camera, Renderer
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0); // Transparent background

  // Globe Geometry and Material
  const geometry = new THREE.SphereGeometry(5, 32, 32);
  const material = new THREE.MeshBasicMaterial({ color: 0x4a90e2, wireframe: true });
  const globe = new THREE.Mesh(geometry, material);
  scene.add(globe);

  // Lighting
  const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
  directionalLight.position.set(1, 1, 1);
  scene.add(directionalLight);

  // Camera Position
  camera.position.z = 10;

  // Animation Loop
  function animate() {
    requestAnimationFrame(animate);

    // Rotate the globe
    globe.rotation.y += 0.005;

    renderer.render(scene, camera);
  }
  animate();

  // Handle Window Resize
  window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
});