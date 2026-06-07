/* =========================================================
   SECTION 1 — OBJET 3D QUI SUIT LA SOURIS
   ========================================================= */
(function(){
  const canvas = document.getElementById('three-canvas');
  const hero   = document.getElementById('hero');

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.z = 6;

  const renderer = new THREE.WebGLRenderer({canvas, antialias:true, alpha:true});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const SIZE = 2.4;
  const geo = new THREE.BoxGeometry(SIZE, SIZE, SIZE, 4, 4, 4);
  const mat = new THREE.MeshStandardMaterial({
    color:0x333336,
    roughness:0.32,
    metalness:0.6,
    flatShading:true
  });
  const cube = new THREE.Mesh(geo, mat);
  scene.add(cube);

  const edges = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.BoxGeometry(SIZE, SIZE, SIZE)),
    new THREE.LineBasicMaterial({color:0x333336})
  );
  cube.add(edges);

  const wire = new THREE.Mesh(
    new THREE.BoxGeometry(SIZE*0.62, SIZE*0.62, SIZE*0.62),
    new THREE.MeshBasicMaterial({color:0x333336, wireframe:true, transparent:true, opacity:0.12})
  );
  cube.add(wire);

  scene.add(new THREE.AmbientLight(0xfef9f5, 0.65));
  const key = new THREE.DirectionalLight(0xffffff, 1.4);
  key.position.set(4, 5, 6);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xfef9f5, 0.9);
  rim.position.set(-6, -3, -4);
  scene.add(rim);

  function resize(){
    const w = hero.clientWidth, h = hero.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize', resize);

  let targetX = 0, targetY = 0, curX = 0, curY = 0;
  window.addEventListener('mousemove', e=>{
    targetX = (e.clientX / window.innerWidth  - 0.5) * 2;
    targetY = (e.clientY / window.innerHeight - 0.5) * 2;
  });
  window.addEventListener('touchmove', e=>{
    if(!e.touches[0]) return;
    targetX = (e.touches[0].clientX / window.innerWidth  - 0.5) * 2;
    targetY = (e.touches[0].clientY / window.innerHeight - 0.5) * 2;
  }, {passive:true});

  const clock = new THREE.Clock();
  function loop(){
    requestAnimationFrame(loop);
    const t = clock.getElapsedTime();
    curX += (targetX - curX) * 0.05;
    curY += (targetY - curY) * 0.05;
    cube.rotation.y = curX * 0.9 + t * 0.15;
    cube.rotation.x = curY * 0.9 + t * 0.08;
    cube.position.x = curX * 0.6;
    cube.position.y = -curY * 0.4;
    camera.position.x += (curX * 0.5 - camera.position.x) * 0.04;
    camera.position.y += (-curY * 0.5 - camera.position.y) * 0.04;
    camera.lookAt(0, 0, 0);
    renderer.render(scene, camera);
  }
  loop();
})();

/* =========================================================
   REVEAL AU SCROLL
   ========================================================= */
(function(){
  const obs = new IntersectionObserver(entries=>{
    entries.forEach(en=>{
      if(en.isIntersecting){
        en.target.classList.add('in');
        obs.unobserve(en.target);
      }
    });
  }, {threshold:0.12});
  document.querySelectorAll('.reveal').forEach(el=>obs.observe(el));
})();

/* =========================================================
   LIGHTBOX — IMAGES DE LA GRILLE
   ========================================================= */
(function(){
  var lb  = document.getElementById('lightbox');
  var img = document.getElementById('lightboxImg');
  var btn = document.getElementById('lightboxClose');
  if(!lb || !img) return;

  function open(src, alt){
    img.src = src;
    img.alt = alt || '';
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function close(){
    lb.classList.remove('open');
    document.body.style.overflow = '';
  }

  document.querySelectorAll('.art-grid .cell').forEach(function(cell){
    var cellImg = cell.querySelector('img');
    if(!cellImg) return;
    cell.addEventListener('click', function(){ open(cellImg.src, cellImg.alt); });
  });

  if(btn) btn.addEventListener('click', close);
  lb.addEventListener('click', function(e){ if(e.target === lb) close(); });
  document.addEventListener('keydown', function(e){ if(e.key === 'Escape') close(); });
})();
