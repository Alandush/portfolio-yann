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

  // --- objet 3D : cube géométrique ---
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

  // arêtes marquées par-dessus pour le côté graphique / net
  const edges = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.BoxGeometry(SIZE, SIZE, SIZE)),
    new THREE.LineBasicMaterial({color:0x333336})
  );
  cube.add(edges);

  // léger halo wireframe interne pour la profondeur
  const wire = new THREE.Mesh(
    new THREE.BoxGeometry(SIZE*0.62, SIZE*0.62, SIZE*0.62),
    new THREE.MeshBasicMaterial({color:0x333336, wireframe:true, transparent:true, opacity:0.12})
  );
  cube.add(wire);

  // --- lumières ---
  scene.add(new THREE.AmbientLight(0xfef9f5, 0.65));
  const key = new THREE.DirectionalLight(0xffffff, 1.4);
  key.position.set(4, 5, 6);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xfef9f5, 0.9);
  rim.position.set(-6, -3, -4);
  scene.add(rim);

  // --- resize ---
  function resize(){
    const w = hero.clientWidth, h = hero.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize', resize);

  // --- suivi de la souris ---
  let targetX = 0, targetY = 0, curX = 0, curY = 0;
  window.addEventListener('mousemove', e=>{
    targetX = (e.clientX / window.innerWidth  - 0.5) * 2;
    targetY = (e.clientY / window.innerHeight - 0.5) * 2;
  });
  // support tactile
  window.addEventListener('touchmove', e=>{
    if(!e.touches[0]) return;
    targetX = (e.touches[0].clientX / window.innerWidth  - 0.5) * 2;
    targetY = (e.touches[0].clientY / window.innerHeight - 0.5) * 2;
  }, {passive:true});

  // --- boucle d'animation ---
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
   PLAYER CUSTOM — REEL
   ========================================================= */
(function(){
  const reel     = document.getElementById('reelPlayer');
  if(!reel) return;
  const video    = reel.querySelector('video');
  if(!video) return;
  const overlay  = document.getElementById('reelOverlay');
  const bigPlay  = document.getElementById('reelBigPlay');
  const playBtn  = document.getElementById('reelPlayBtn');
  const progress = document.getElementById('reelProgress');
  const fill     = document.getElementById('reelFill');
  const timeEl   = document.getElementById('reelTime');
  const volBtn   = document.getElementById('reelVol');
  const fsBtn    = document.getElementById('reelFs');

  const SVG_PLAY  = `<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>`;
  const SVG_PAUSE = `<svg viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`;
  const SVG_VOL   = `<svg viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>`;
  const SVG_MUTE  = `<svg viewBox="0 0 24 24"><path d="M16.5 12A4.5 4.5 0 0 0 14 7.97v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3 3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06a8.99 8.99 0 0 0 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4 9.91 6.09 12 8.18V4z"/></svg>`;
  const SVG_FS    = `<svg viewBox="0 0 24 24"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>`;
  const SVG_EXIT  = `<svg viewBox="0 0 24 24"><path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/></svg>`;

  function fmt(s){
    if(isNaN(s)) return '0:00';
    const m = Math.floor(s/60), sec = Math.floor(s%60);
    return m+':'+(sec<10?'0':'')+sec;
  }

  function setPlaying(playing){
    playBtn.innerHTML = playing ? SVG_PAUSE : SVG_PLAY;
    bigPlay.innerHTML = playing
      ? SVG_PAUSE
      : `<svg class="ico-play" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>`;
    overlay.classList.toggle('playing', playing);
  }

  function toggle(e){
    if(e) e.stopPropagation();
    video.paused ? video.play() : video.pause();
  }

  overlay.addEventListener('click', toggle);
  playBtn.addEventListener('click', toggle);

  video.addEventListener('play',  ()=> setPlaying(true));
  video.addEventListener('pause', ()=> setPlaying(false));
  video.addEventListener('ended', ()=> setPlaying(false));

  video.addEventListener('timeupdate', ()=>{
    if(!video.duration) return;
    const pct = video.currentTime / video.duration * 100;
    fill.style.width = pct+'%';
    timeEl.textContent = fmt(video.currentTime)+' / '+fmt(video.duration);
  });
  video.addEventListener('loadedmetadata', ()=>{
    timeEl.textContent = '0:00 / '+fmt(video.duration);
  });

  let seeking = false;
  function seek(e){
    const r = progress.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0,(e.clientX-r.left)/r.width));
    video.currentTime = ratio * video.duration;
  }
  progress.addEventListener('mousedown', e=>{ seeking=true; seek(e); });
  window.addEventListener('mousemove',   e=>{ if(seeking) seek(e); });
  window.addEventListener('mouseup',     ()=>{ seeking=false; });

  volBtn.innerHTML = SVG_VOL;
  volBtn.addEventListener('click', e=>{
    e.stopPropagation();
    video.muted = !video.muted;
    volBtn.innerHTML = video.muted ? SVG_MUTE : SVG_VOL;
  });

  fsBtn.innerHTML = SVG_FS;
  fsBtn.addEventListener('click', e=>{
    e.stopPropagation();
    if(document.fullscreenElement){ document.exitFullscreen(); }
    else { reel.requestFullscreen(); }
  });
  document.addEventListener('fullscreenchange', ()=>{
    fsBtn.innerHTML = document.fullscreenElement ? SVG_EXIT : SVG_FS;
  });

  setPlaying(false);
})();

/* clic simple sur les vidéos des articles */
document.querySelectorAll('.art-video').forEach(box=>{
  box.addEventListener('click', ()=>{
    const v = box.querySelector('video');
    if(v){ v.paused ? v.play() : v.pause(); }
  });
});
