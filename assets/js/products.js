/* products.js — carga el catálogo (catalog.json) y lo expone globalmente */
(function(){
  "use strict";
  function inject(products){
    window.CREMA_PRODUCTS = products;
    document.dispatchEvent(new CustomEvent("crema:catalog", {detail:products}));
    // si el catalogo ya esta en el DOM (app.js corrio antes), renderizar
    if(document.readyState!=="loading"){
      document.dispatchEvent(new Event("crema:render-now"));
    }
  }
  // cargar JSON
  fetch("assets/data/catalog.json")
    .then(r=>{ if(!r.ok) throw new Error(r.status); return r.json(); })
    .then(inject)
    .catch(err=>{
      console.warn("No se pudo cargar catalog.json:", err);
      // fallback: arreglo vacio para que la UI no se rompa
      window.CREMA_PRODUCTS = window.CREMA_PRODUCTS || [];
      document.dispatchEvent(new CustomEvent("crema:catalog",{detail:[]}));
    });
})();
