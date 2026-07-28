/* Home dinámico: más vendidos, reseñas, IG feed */
(function(){
  "use strict";
  const REVIEWS = [
    {stars:5, text:"La mejor repostería de La Romana. El cheesecake es increíble y siempre fresco.", who:"— María T."},
    {stars:5, text:"Pedí una torta de cumpleaños personalizada y quedó perfecta. La entrega puntual.", who:"— Carlos R."},
    {stars:5, text:"El café y los panes por la mañana no tienen comparación. Atención súper amable.", who:"— Jennifer L."},
  ];
  const IG = ["🍰","🥐","🎂","☕","🧁","🍫"];

  function money(n){return "$"+Number(n).toLocaleString("es-DO",{minimumFractionDigits:2,maximumFractionDigits:2});}
  function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}

  function renderBest(){
    const best = $("#best-grid");
    if(!best) return;
    const all = window.CREMA_PRODUCTS || [];
    if(!all.length){ best.innerHTML='<p class="muted center" style="grid-column:1/-1">Catálogo cargando... 🧁</p>'; return; }
    const picks = all.filter(p=>p.img && p.img.indexOf("NO-IMAGEN")===-1).slice(0,8);
    best.innerHTML = picks.map(p=>`
      <article class="product-card">
        <div class="product-thumb"><img src="${esc(p.img)}" alt="${esc(p.name)}" loading="lazy"
           onerror="this.parentNode.innerHTML='<div class=&quot;ph&quot;>${esc((p.name[0]||'C').toUpperCase())}</div>'"></div>
        <div class="product-body">
          <div class="product-name">${esc(p.name)}</div>
          <div class="product-price">${money(p.price)}</div>
          <button class="btn btn-primary btn-block" data-add="${esc(p.id)}">+ Añadir al pedido</button>
        </div>
      </article>`).join("");
  }

  function renderStatic(){
    // Reseñas
    const rg = $("#reviews-grid");
    if(rg) rg.innerHTML = REVIEWS.map(r=>`
      <div class="review">
        <div class="stars">${"★".repeat(r.stars)}${"☆".repeat(5-r.stars)}</div>
        <p>${esc(r.text)}</p>
        <div class="who">${esc(r.who)}</div>
      </div>`).join("");
    // IG
    const ig = $("#ig-grid");
    if(ig) ig.innerHTML = IG.map(e=>`<a href="https://instagram.com/cremapasteleria" target="_blank" aria-label="Instagram">${e}</a>`).join("");
  }

  function syncCount(){
    const c=document.querySelector("#cart-count");
    const c2=document.querySelector("#cart-count2");
    const n=c?c.textContent:"0";
    if(c2) c2.textContent=n;
  }

  document.addEventListener("DOMContentLoaded",function(){
    renderStatic();
    renderBest();
    document.addEventListener("crema:render-now", renderBest);
    document.addEventListener("crema:catalog", renderBest);
    syncCount();
    document.addEventListener("click", syncCount);
  });
})();
