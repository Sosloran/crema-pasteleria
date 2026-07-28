/* ===========================================================
   CREMA PASTELERÍA — app.js
   Catálogo dinámico · Carrito · Pedido WhatsApp · Checkout
   =========================================================== */
(function(){
  "use strict";

  /* ---- Config (marca) ---- */
  const BRAND = {
    name: "Crema Pastelería",
    phone: "18098132103",          // teléfono principal para WhatsApp (sin +)
    waDisplay: "(809) 813-2103",
    altPhone: "(829) 761-1728",
    address: "C/ Francisco Richiez #61, La Romana, Rep. Dom.",
    ig: "https://instagram.com/cremapasteleria",
    fb: "https://facebook.com/cremapasteleria",
    maps: "https://maps.google.com/?q=Crema+Pasteleria+La+Romana"
  };

  /* ---- Estado del carrito ---- */
  const CART_KEY = "crema_cart_v1";
  let cart = loadCart();
  let deliveryMode = "pickup"; // 'pickup' | 'delivery'
  let deliveryZone = "central";

  function loadCart(){
    try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
    catch(e){ return []; }
  }
  function saveCart(){ localStorage.setItem(CART_KEY, JSON.stringify(cart)); }

  /* ---- Utilidades ---- */
  const $  = (s,r=document)=>r.querySelector(s);
  const $$ = (s,r=document)=>Array.from(r.querySelectorAll(s));
  const money = n => "$" + Number(n).toLocaleString("es-DO",{minimumFractionDigits:2,maximumFractionDigits:2});
  function toast(msg){
    const t=$("#toast"); if(!t) return;
    t.textContent=msg; t.classList.add("show");
    clearTimeout(t._t); t._t=setTimeout(()=>t.classList.remove("show"),2600);
  }
  // placeholder visual cuando el producto no tiene foto real
  function thumbHTML(p){
    if(p.img && p.img.indexOf("NO-IMAGEN")===-1){
      return `<img src="${p.img}" alt="${esc(p.name)}" loading="lazy"
              onerror="this.parentNode.innerHTML='<div class=&quot;ph&quot;>${(p.name[0]||'C').toUpperCase()}</div>'">`;
    }
    return `<div class="ph">${(p.name[0]||'C').toUpperCase()}</div>`;
  }
  function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}

  /* ---- Render de tarjetas de producto ---- */
  function productCard(p){
    return `<article class="product-card" data-id="${p.id}" data-cat="${esc(p.cat)}" data-name="${esc(p.name.toLowerCase())}">
      <div class="product-thumb">${thumbHTML(p)}</div>
      <div class="product-body">
        <div class="product-name">${esc(p.name)}</div>
        <div class="product-price">${money(p.price)}</div>
        <button class="btn btn-primary btn-block" data-add="${p.id}">+ Añadir al pedido</button>
      </div>
    </article>`;
  }

  /* ---- Página Catálogo ---- */
  function initCatalog(){
    const grid = $("#cat-grid");
    if(!grid) return;
    const all = window.CREMA_PRODUCTS || [];
    // construir chips de categoría a partir de los datos
    const cats = [{id:"all",label:"Todo"}];
    const seen={};
    all.forEach(p=>{ if(!seen[p.cat]){seen[p.cat]=1;cats.push({id:p.cat,label:p.catLabel||p.cat});} });
    const filters = $("#cat-filters");
    filters.innerHTML = cats.map((c,i)=>`<button class="chip ${i===0?'active':''}" data-cat="${esc(c.id)}">${esc(c.label)}</button>`).join("");

    let activeCat="all", query="";
    function render(){
      const q=query.trim().toLowerCase();
      const list = all.filter(p=>{
        const okCat = activeCat==="all" || p.cat===activeCat;
        const okQ = !q || p.name.toLowerCase().includes(q) || (p.catLabel||"").toLowerCase().includes(q);
        return okCat && okQ;
      });
      grid.innerHTML = list.length ? list.map(productCard).join("")
                                  : `<p class="muted center" style="grid-column:1/-1;padding:2em">No encontramos productos con esos filtros.</p>`;
      const res=$("#cat-results");
      if(res) res.textContent = `${list.length} producto${list.length!==1?'s':''} mostrado${list.length!==1?'s':''}`;
    }
    filters.addEventListener("click",e=>{
      const b=e.target.closest(".chip"); if(!b) return;
      $$(".chip",filters).forEach(x=>x.classList.remove("active"));
      b.classList.add("active"); activeCat=b.dataset.cat; render();
    });
    const search=$("#cat-search");
    if(search) search.addEventListener("input",e=>{query=e.target.value;render();});

    render();
    grid.addEventListener("click",e=>{
      const b=e.target.closest("[data-add]"); if(!b) return;
      addToCart(b.dataset.add);
    });
  }

  /* ---- Carrito ---- */
  function addToCart(id){
    const p=(window.CREMA_PRODUCTS||[]).find(x=>x.id===id);
    if(!p) return;
    const line=cart.find(x=>x.id===id);
    if(line) line.qty++; else cart.push({id, name:p.name, price:p.price, img:p.img, qty:1});
    saveCart(); updateCartUI(); toast(`${p.name} añadido`);
  }
  function changeQty(id,d){
    const line=cart.find(x=>x.id===id); if(!line) return;
    line.qty+=d; if(line.qty<=0) cart=cart.filter(x=>x.id!==id);
    saveCart(); updateCartUI();
  }
  function removeLine(id){ cart=cart.filter(x=>x.id!==id); saveCart(); updateCartUI(); }

  function cartCount(){ return cart.reduce((s,l)=>s+l.qty,0); }
  function cartTotal(){ return cart.reduce((s,l)=>s+l.qty*l.price,0); }

  function updateCartUI(){
    const countEl=$("#cart-count");
    if(countEl) countEl.textContent=cartCount();
    const drawer=$("#cart-items");
    if(!drawer) return;
    if(!cart.length){
      drawer.innerHTML=`<div class="cart-empty">Tu pedido está vacío 🛒<br><small class="muted">Añade algo rico del catálogo.</small></div>`;
    } else {
      drawer.innerHTML = cart.map(l=>`
        <div class="cart-item">
          <div class="product-thumb" style="width:48px;height:48px;border-radius:10px">${thumbHTML(l)}</div>
          <div>
            <div class="ci-name">${esc(l.name)}</div>
            <div class="ci-price">${money(l.price)}</div>
            <span class="ci-remove" data-rm="${esc(l.id)}">quitar</span>
          </div>
          <div class="qty">
            <button data-dec="${esc(l.id)}">−</button>
            <span>${l.qty}</span>
            <button data-inc="${esc(l.id)}">+</button>
          </div>
        </div>`).join("");
    }
    const tot=$("#cart-total"); if(tot) tot.textContent=money(cartTotal());
    // mostrar/ocultar bloque de delivery
    const dBlock=$("#delivery-block");
    if(dBlock) dBlock.style.display = cart.length ? "block" : "none";
  }

  function buildWhatsApp(){
    if(!cart.length) return null;
    let msg = `🧁 *Pedido — ${BRAND.name}*\n`;
    msg += "────────────────────\n";
    cart.forEach(l=>{
      msg += `• ${l.qty}x ${l.name} — ${money(l.price*l.qty)}\n`;
    });
    msg += "────────────────────\n";
    msg += `*Total:* ${money(cartTotal())}\n\n`;
    if(deliveryMode==="delivery"){
      msg += `🛵 *Entrega a domicilio* (zona ${zoneName(deliveryZone)})\n`;
      const d=$("#sched-date"), t=$("#sched-time");
      if(d && d.value) msg += `📅 Fecha: ${d.value}\n`;
      if(t && t.value) msg += `⏰ Hora: ${t.value}\n`;
      msg += "📍 *Dirección:* (indicar en seguimiento)\n";
    } else {
      msg += "🏪 *Retiro en tienda*\n";
      const d=$("#sched-date"), t=$("#sched-time");
      if(d && d.value) msg += `📅 Fecha: ${d.value}\n`;
      if(t && t.value) msg += `⏰ Hora: ${t.value}\n`;
    }
    msg += `\nGracias ${BRAND.name} 💛`;
    return encodeURIComponent(msg);
  }
  function zoneName(z){return {central:"La Romana Centro",este:"Romana Este",colonia:"Villa Hermosa/Colonia",out:"Fuera de zona (+cargo)"}[z]||z;}

  function openCart(){ $("#cart-overlay").classList.add("open"); $("#cart-drawer").classList.add("open"); }
  function closeCart(){ $("#cart-overlay").classList.remove("open"); $("#cart-drawer").classList.remove("open"); }

  /* ---- Wire global ---- */
  function initCommon(){
    // menú móvil
    const ham=$("#hamburger"), mm=$("#mobile-menu");
    if(ham) ham.addEventListener("click",()=>mm.classList.toggle("open"));
    // cart open
    $$("[data-open-cart]").forEach(b=>b.addEventListener("click",openCart));
    const ov=$("#cart-overlay");
    if(ov) ov.addEventListener("click",closeCart);
    $$("[data-close-cart]").forEach(b=>b.addEventListener("click",closeCart));

    // delegación del carrito
    const drawer=$("#cart-items");
    if(drawer){
      drawer.addEventListener("click",e=>{
        const inc=e.target.closest("[data-inc]"); if(inc){changeQty(inc.dataset.inc,1);return;}
        const dec=e.target.closest("[data-dec]"); if(dec){changeQty(dec.dataset.dec,-1);return;}
        const rm=e.target.closest("[data-rm]"); if(rm){removeLine(rm.dataset.rm);return;}
      });
    }
    // toggle delivery
    $$("[data-mode]").forEach(b=>b.addEventListener("click",()=>{
      deliveryMode=b.dataset.mode;
      $$("[data-mode]").forEach(x=>x.classList.toggle("active",x===b));
      const zone=$("#zone-wrap"); if(zone) zone.style.display = deliveryMode==="delivery"?"block":"none";
    }));
    const zone=$("#zone-sel");
    if(zone) zone.addEventListener("change",()=>{deliveryZone=zone.value;});

    // enviar pedido por WhatsApp
    const send=$("#send-wa");
    if(send) send.addEventListener("click",()=>{
      const url=buildWhatsApp();
      if(!url){toast("El carrito está vacío");return;}
      if(deliveryMode==="delivery" && !$("#sched-date").value){toast("Elige fecha de entrega");return;}
      window.open(`https://wa.me/${BRAND.phone}?text=${url}`,"_blank");
    });

    // botón flotante
    const fab=$("#cart-fab");
    if(fab) fab.addEventListener("click",openCart);

    updateCartUI();

    // suscripción a newsletter
    const sub=$("#subscribe-form");
    if(sub) sub.addEventListener("submit",e=>{
      e.preventDefault();
      const email=$("#sub-email").value.trim();
      if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)){ $("#sub-msg").textContent="Ingresa un correo válido."; return; }
      let subs=[]; try{subs=JSON.parse(localStorage.getItem("crema_subs")||"[]");}catch(e){}
      if(!subs.includes(email)) subs.push(email);
      localStorage.setItem("crema_subs",JSON.stringify(subs));
      $("#sub-msg").textContent="¡Listo! Te enviamos los descuentos exclusivos. 🎉";
      sub.reset();
    });

    // formulario de contacto
    const cf=$("#contact-form");
    if(cf) cf.addEventListener("submit",e=>{
      e.preventDefault();
      const f=new FormData(cf);
      const msg=`✉️ *Mensaje desde la web*\n\n👤 ${f.get("nombre")||"-"}\n📧 ${f.get("email")||"-"}\n💬 ${f.get("mensaje")||"-"}\n\n${BRAND.name}`;
      window.open(`https://wa.me/${BRAND.phone}?text=${encodeURIComponent(msg)}`,"_blank");
      $("#contact-msg").textContent="¡Gracias! Te contactaremos por WhatsApp. 💬";
      cf.reset();
    });

    // año footer
    const y=$("#year"); if(y) y.textContent=new Date().getFullYear();
  }

  /* ---- Modal personalizar torta ---- */
  function initCakeModal(){
    const open=$("#open-cake");
    if(!open) return;
    const overlay=$("#cake-modal");
    open.addEventListener("click",e=>{e.preventDefault();overlay.classList.add("open");});
    overlay.addEventListener("click",e=>{ if(e.target===overlay || e.target.closest(".close")) overlay.classList.remove("open"); });
    const form=$("#cake-form");
    form.addEventListener("submit",e=>{
      e.preventDefault();
      const f=new FormData(form);
      const msg = `🎂 *Pedido Especial — Torta Personalizada*\n`
        + `────────────────────\n`
        + `• *Tamaño:* ${f.get("size")}\n`
        + `• *Bizcocho:* ${f.get("bizcocho")}\n`
        + `• *Relleno:* ${f.get("relleno")}\n`
        + `• *Cubierta:* ${f.get("cubierta")}\n`
        + `• *Mensaje:* ${f.get("mensaje")||"—"}\n`
        + `• *Fecha entrega:* ${f.get("fecha")||"—"}\n`
        + `• *Nombre/Contacto:* ${f.get("nombre")||"—"}\n`
        + `\n${BRAND.name} 💛`;
      window.open(`https://wa.me/${BRAND.phone}?text=${encodeURIComponent(msg)}`,"_blank");
      overlay.classList.remove("open");
    });
  }

  /* ---- Init ---- */
  document.addEventListener("DOMContentLoaded",()=>{
    initCommon();
    // el catálogo puede llegar después de products.js (fetch async)
    function tryRender(){
      if(window.CREMA_PRODUCTS){
        initCatalog();
        // home: disparar render de mas vendidos
        document.dispatchEvent(new Event("crema:render-now"));
      }
    }
    tryRender();
    document.addEventListener("crema:catalog", tryRender);
    initCakeModal();
  });

  // exponer para debugging/consola
  window.CremaApp={addToCart,cart:()=>cart};
})();
