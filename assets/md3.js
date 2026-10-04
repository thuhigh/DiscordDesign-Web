/* Material You (Material 3) dynamic color – dùng chung cho cả site */
(() => {
  const SEEDS = ["#6750A4","#0B57D0","#00677D","#006A6A","#386A20","#6F5B00","#8B5000","#A33B20","#BA1A1A","#984061","#7B4E9E","#605D62"];
  const ls = (k, v) => { try{ if(v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); }catch(_){} };
  const toLin = c => c <= .04045 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4;
  const fromLin = v => v <= .0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - .055;
  const finv = t => t ** 3 > 216 / 24389 ? t ** 3 : (116 * t - 16) * 27 / 24389;
  function hex2lch(h){
    const n = parseInt(h.slice(1), 16), [r, g, b] = [n >> 16 & 255, n >> 8 & 255, n & 255].map(v => toLin(v / 255));
    const X = (.4124 * r + .3576 * g + .1805 * b) / .95047, Y = .2126 * r + .7152 * g + .0722 * b, Z = (.0193 * r + .1192 * g + .9505 * b) / 1.08883;
    const f = t => t > 216 / 24389 ? Math.cbrt(t) : (24389 / 27 * t + 16) / 116, fx = f(X), fy = f(Y), fz = f(Z);
    const a = 500 * (fx - fy), bb = 200 * (fy - fz);
    return [116 * fy - 16, Math.hypot(a, bb), (Math.atan2(bb, a) * 180 / Math.PI + 360) % 360];
  }
  function lch2rgb(L, C, H){
    const a = C * Math.cos(H * Math.PI / 180), b = C * Math.sin(H * Math.PI / 180), fy = (L + 16) / 116, fx = fy + a / 500, fz = fy - b / 200;
    const X = .95047 * finv(fx), Y = finv(fy), Z = 1.08883 * finv(fz);
    return [3.2406 * X - 1.5372 * Y - .4986 * Z, -.9689 * X + 1.8758 * Y + .0415 * Z, .0557 * X - .2040 * Y + 1.0570 * Z].map(fromLin);
  }
  const hx = rgb => "#" + rgb.map(v => Math.round(Math.min(1, Math.max(0, v)) * 255).toString(16).padStart(2, "0")).join("");
  function tone(L, C, H){
    if(L >= 99.5) return "#ffffff"; if(L <= .5) return "#000000";
    for(let c = C; c >= 0; c -= 1.5){ const rgb = lch2rgb(L, c, H); if(rgb.every(v => v >= -.0005 && v <= 1.0005)) return hx(rgb); }
    return "#808080";
  }
  const pal = (C, H) => t => tone(t, C, H);
  const R = (P, S, T, N, V, E) => [
    ["primary",P,40,80],["on-primary",P,100,20],["primary-container",P,90,30],["on-primary-container",P,10,90],
    ["secondary",S,40,80],["on-secondary",S,100,20],["secondary-container",S,90,30],["on-secondary-container",S,10,90],
    ["tertiary",T,40,80],["on-tertiary",T,100,20],["tertiary-container",T,90,30],["on-tertiary-container",T,10,90],
    ["error",E,40,80],["on-error",E,100,20],["error-container",E,90,30],["on-error-container",E,10,90],
    ["surface",N,98,6],["on-surface",N,10,90],["surface-variant",V,90,30],["on-surface-variant",V,30,80],
    ["outline",V,50,60],["outline-variant",V,80,30],
    ["surface-container-lowest",N,100,4],["surface-container-low",N,96,10],["surface-container",N,94,12],["surface-container-high",N,92,17],["surface-container-highest",N,90,22],
    ["surface-dim",N,87,6],["surface-bright",N,98,24],["inverse-surface",N,20,90],["inverse-on-surface",N,95,20],["inverse-primary",P,80,40]];
  const ALIAS = {"--bg":"surface","--card":"surface-container","--chip":"surface-container-high","--bd":"outline-variant","--ln":"outline-variant","--tx":"on-surface","--mu":"on-surface-variant","--acc":"primary","--tint":"primary","--sel":"secondary-container","--segon":"secondary-container","--grad":"primary","--err":"error","--wrn":"tertiary"};
  let scrim, sw, seg, cin;
  let seed = /^#[0-9a-f]{6}$/i.test(ls("m3seed") || "") ? ls("m3seed") : SEEDS[0], mode = ls("m3mode") || "auto";
  const mq = matchMedia("(prefers-color-scheme:dark)");
  function scheme(sd, dark){
    const [, C, H] = hex2lch(sd), out = {};
    R(pal(Math.max(C, 56), H), pal(20, H), pal(32, (H + 60) % 360), pal(5, H), pal(10, H), pal(84, 27)).forEach(([n, p, l, d]) => out[n] = p(dark ? d : l));
    return out;
  }
  function apply(){
    const dark = mode === "dark" || (mode === "auto" && mq.matches), r = document.documentElement, s = scheme(seed, dark);
    for(const n in s){ r.style.setProperty("--md-" + n, s[n]); r.style.setProperty("--md-sys-color-" + n, s[n]); }
    [["background", "surface"], ["on-background", "on-surface"], ["surface-tint", "primary"]].forEach(([a, b]) => r.style.setProperty("--md-sys-color-" + a, s[b]));
    r.style.setProperty("--md-sys-color-shadow", "#000"); r.style.setProperty("--md-sys-color-scrim", "#000");
    r.style.setProperty("--md-ref-typeface-brand", "Roboto, system-ui, sans-serif"); r.style.setProperty("--md-ref-typeface-plain", "Roboto, system-ui, sans-serif");
    for(const k in ALIAS) r.style.setProperty(k, "var(--md-" + ALIAS[k] + ")");
    r.style.setProperty("--bar", "color-mix(in srgb,var(--md-surface-container) 92%,transparent)");
    r.style.setProperty("--g2", "linear-gradient(95deg,var(--md-primary),var(--md-tertiary))");
    r.style.colorScheme = dark ? "dark" : "light"; r.dataset.m3 = dark ? "dark" : "light";
    let m = document.querySelector('meta[name="theme-color"]');
    if(!m){ m = document.createElement("meta"); m.name = "theme-color"; document.head.appendChild(m); }
    m.content = s.surface;
    syncUI();
  }
  mq.addEventListener("change", () => mode === "auto" && apply());
  window.M3 = {scheme, tone, hex2lch};
  apply();

  // ----- Lấy màu từ ảnh nền -----
  function fromImage(file){
    const img = new Image();
    img.onload = () => {
      const c = document.createElement("canvas"); c.width = c.height = 48;
      const x = c.getContext("2d"); x.drawImage(img, 0, 0, 48, 48);
      const d = x.getImageData(0, 0, 48, 48).data, bins = {}; let ar = 0, ag = 0, ab = 0;
      for(let i = 0; i < d.length; i += 4){
        const r = d[i], g = d[i+1], b = d[i+2]; ar += r; ag += g; ab += b;
        const mx = Math.max(r, g, b), sat = mx ? (mx - Math.min(r, g, b)) / mx : 0;
        if(mx < 40 || sat < .2) continue;
        const k = (r >> 5) + "," + (g >> 5) + "," + (b >> 5), o = bins[k] || (bins[k] = {n:0, r:0, g:0, b:0, s:0});
        o.n++; o.r += r; o.g += g; o.b += b; o.s += sat;
      }
      let best = null, top = 0;
      for(const k in bins){ const o = bins[k], sc = o.n * (1 + o.s / o.n); if(sc > top){ top = sc; best = o; } }
      const px = d.length / 4, h = best ? hx([best.r / best.n / 255, best.g / best.n / 255, best.b / best.n / 255]) : hx([ar / px / 255, ag / px / 255, ab / px / 255]);
      setSeed(h); URL.revokeObjectURL(img.src);
    };
    img.src = URL.createObjectURL(file);
  }
  function setSeed(h){ seed = h; ls("m3seed", h); apply(); }
  function setMode(m){ mode = m; ls("m3mode", m); apply(); }

  // ----- Giao diện chọn màu (bottom sheet / dialog) -----
  function build(){
    scrim = document.createElement("div"); scrim.className = "m3-scrim"; scrim.hidden = true;
    scrim.innerHTML = `<div class="m3-sheet" role="dialog" aria-modal="true" aria-label="Màu chủ đạo"><div class="m3-grab"></div>
      <h2>Màu chủ đạo</h2><p>Cả giao diện đổi màu theo màu bạn chọn, giống Material You.</p>
      <div class="m3-sw" id="m3sw"></div>
      <div class="m3-row"><label class="m3-btn">Lấy màu từ ảnh<input type="file" accept="image/*" hidden id="m3img"></label><label class="m3-btn">Màu tùy chọn<input type="color" hidden id="m3col"></label></div>
      <div class="m3-seg" id="m3seg"></div>
      <button class="m3-done" type="button" id="m3done">Xong</button></div>`;
    document.body.appendChild(scrim);
    sw = scrim.querySelector("#m3sw"); seg = scrim.querySelector("#m3seg"); cin = scrim.querySelector("#m3col");
    SEEDS.forEach(h => { const b = document.createElement("button"); b.type = "button"; b.className = "m3-dot"; b.dataset.h = h; b.setAttribute("aria-label", "Màu " + h); b.style.background = scheme(h, false).primary; b.onclick = () => setSeed(h); sw.appendChild(b); });
    [["auto", "Tự động"], ["light", "Sáng"], ["dark", "Tối"]].forEach(([k, l]) => { const b = document.createElement("button"); b.type = "button"; b.dataset.k = k; b.textContent = l; b.onclick = () => setMode(k); seg.appendChild(b); });
    cin.oninput = () => setSeed(cin.value);
    scrim.querySelector("#m3img").onchange = e => e.target.files[0] && fromImage(e.target.files[0]);
    scrim.querySelector("#m3done").onclick = close;
    scrim.onclick = e => { if(e.target === scrim) close(); };
    addEventListener("keydown", e => { if(e.key === "Escape") close(); });
  }
  function syncUI(){
    if(!scrim) return;
    sw.querySelectorAll(".m3-dot").forEach(b => b.classList.toggle("on", b.dataset.h.toLowerCase() === seed.toLowerCase()));
    seg.querySelectorAll("button").forEach(b => b.classList.toggle("on", b.dataset.k === mode));
    cin.value = seed;
  }
  function open(){ if(!scrim) build(); scrim.hidden = false; syncUI(); requestAnimationFrame(() => scrim.classList.add("in")); }
  function close(){ if(!scrim) return; scrim.classList.remove("in"); setTimeout(() => scrim.hidden = true, 220); }
  function init(){
    const btn = document.createElement("button");
    btn.type = "button"; btn.className = "m3-ib"; btn.setAttribute("aria-label", "Màu chủ đạo");
    btn.innerHTML = '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a9 9 0 0 0 0 18c1.1 0 1.8-.8 1.8-1.7 0-.5-.2-.9-.5-1.2-.3-.3-.5-.7-.5-1.2 0-.9.8-1.7 1.7-1.7H17a4 4 0 0 0 4-4c0-4.4-4-8.2-9-8.2z"/><circle cx="7.5" cy="11" r="1"/><circle cx="10.5" cy="7" r="1"/><circle cx="15" cy="7.5" r="1"/></svg>';
    btn.onclick = open;
    const slot = document.querySelector("[data-md3-slot]");
    if(slot) slot.appendChild(btn); else { btn.classList.add("fixed"); document.body.appendChild(btn); }
  }
  // ----- Ripple -----
  const RIP = ".btn,.chip,.mini,.tb,.row,.rd,.m3-ib,.sym,.pill,.sg,.seg button,.dc-copy,summary,.m3-btn,.m3-done,.pg a,.chips button,.m3-seg button";
  document.addEventListener("pointerdown", e => {
    const t = e.target.closest(RIP); if(!t || matchMedia("(prefers-reduced-motion:reduce)").matches) return;
    if(getComputedStyle(t).position === "static") t.style.position = "relative";
    t.style.overflow = "hidden";
    const r = t.getBoundingClientRect(), s = Math.max(r.width, r.height) * 2, p = document.createElement("span");
    p.className = "m3-rip"; p.style.cssText = `width:${s}px;height:${s}px;left:${e.clientX - r.left - s / 2}px;top:${e.clientY - r.top - s / 2}px`;
    t.appendChild(p); p.addEventListener("animationend", () => p.remove());
  });
  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
     
