/* CremaBot — chatbot de catálogo: busca productos y precios por palabra clave */
(function(){
  "use strict";
  const $ = s => document.querySelector(s);
  const fab = $("#chat-fab"), panel = $("#chat-panel"), body = $("#chat-body"),
        form = $("#chat-form"), input = $("#chat-text"), closeBtn = $("#chat-close");
  const money = n => "$" + Number(n).toLocaleString("es-DO",{minimumFractionDigits:2,maximumFractionDigits:2});

  function addBubble(text, who){
    const b = document.createElement("div");
    b.className = "bubble " + (who || "bot");
    b.innerHTML = text;
    body.appendChild(b);
    body.scrollTop = body.scrollHeight;
    return b;
  }
  function prodHit(p){
    return `<div class="prod-hit" data-add="${p.id}">
      <img src="${p.imgLocal || p.img || ''}" alt="${esc(p.name)}" onerror="this.style.visibility='hidden'">
      <div><div>${esc(p.name)}</div><b>${money(p.price)}</b></div>
    </div>`;
  }
  function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}

  function search(q){
    const all = window.CREMA_PRODUCTS || [];
    const term = q.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"").trim();
    if(!term) return [];
    // coincidencia por palabra
    return all.filter(p=>{
      const n = p.name.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"");
      return n.includes(term) || term.split(" ").every(w=> n.includes(w));
    }).slice(0,5);
  }

  function respond(q){
    if(!q) return;
    addBubble(esc(q), "user");
    const term = q.toLowerCase();
    // comandos especiales
    if(/(precio|cuánto|costo|vale|cuesta)/.test(term)){
      const prods = search(q.replace(/(precio|cuánto|custa|cuesta|costo|vale|de|el|la|los|las|un|una|del|cual|qué|que)\s*/gi,""));
      if(prods.length){
        let msg = "Encontré estos:<br>";
        prods.forEach(p=> msg += prodHit(p));
        addBubble(msg);
      } else addBubble("No encontré ese producto. ¿Probamos con otro nombre? 🧐");
      return;
    }
    // categoría
    if(/(menú|menu|catálogo|categoria|categoría|todo)/.test(term)){
      const cats = [...new Set((window.CREMA_PRODUCTS||[]).map(p=>p.catLabel))];
      let msg = "Tenemos estas categorías:<div class='chips'>";
      cats.forEach(c=> msg += `<span class="chip" data-cat="${esc(c)}">${esc(c)}</span>`);
      msg += "</div>";
      addBubble(msg);
      return;
    }
    // búsqueda general
    const prods = search(q);
    if(prods.length){
      let msg = `Esto es lo que encontré por "<b>${esc(q)}</b>":<br>`;
      prods.forEach(p=> msg += prodHit(p));
      addBubble(msg);
    } else {
      addBubble("Hmm, no veo eso en el catálogo 🧐. Prueba con: <i>café, torta, ensalada, pan, cheesecake</i>…");
    }
  }

  // abrir/cerrar
  fab.addEventListener("click", ()=>{
    panel.classList.toggle("open");
    if(panel.classList.contains("open") && !body.children.length){
      addBubble("¡Hola! Soy <b>CremaBot</b> 🤖. Pregúntame el precio de cualquier producto o por categoría. Ej: <i>“precio de la torta”</i> o <i>“catálogo”</i>.");
    }
    setTimeout(()=>input.focus(), 50);
  });
  closeBtn.addEventListener("click", ()=> panel.classList.remove("open"));
  form.addEventListener("submit", e=>{
    e.preventDefault();
    const v = input.value.trim(); input.value="";
    respond(v);
  });
  // clics en chips y productos
  body.addEventListener("click", e=>{
    const hit = e.target.closest(".prod-hit");
    if(hit){ document.dispatchEvent(new CustomEvent("crema:add", {detail: hit.dataset.add})); addBubble("✅ Añadido al pedido. Ábrelo con el botón 🛒", "bot"); return; }
    const chip = e.target.closest(".chip");
    if(chip){
      const cat = chip.dataset.cat;
      const prods = (window.CREMA_PRODUCTS||[]).filter(p=>p.catLabel===cat).slice(0,5);
      let msg = `<b>${esc(cat)}</b>:<br>`;
      prods.forEach(p=> msg += prodHit(p));
      addBubble(msg);
    }
  });
  // esperar catálogo
  if(window.CREMA_PRODUCTS && window.CREMA_PRODUCTS.length){
    fab.querySelector("#chat-fab-text").textContent = "🤖 CremaBot";
  } else {
    document.addEventListener("crema:catalog", ()=> fab.querySelector("#chat-fab-text").textContent = "🤖 CremaBot");
  }
})();
