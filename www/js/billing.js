/* =====================================================================
   BILLING — Compras dentro de la app
   ---------------------------------------------------------------------
   Ahora mismo SIMULA el pago (espera 1,5 s y devuelve éxito).

   Para publicar en Google Play hay que sustituir purchase() por una
   compra real con Google Play Billing, por ejemplo con:
     - cordova-plugin-purchase (CdvPurchase) — compatible con Capacitor
     - RevenueCat (@revenuecat/purchases-capacitor)
   El producto "world2" debe crearse como "producto gestionado" (pago
   único, no consumible) en Google Play Console. Recuerda también
   implementar "Restaurar compras" para reinstalaciones.
   ===================================================================== */
const Billing = (() => {
  "use strict";

  const PRODUCTS = {
    world2: { id: "world2_fantasy", price: "2,99€" }
  };

  async function purchase(worldId) {
    const product = PRODUCTS[worldId];
    if (!product) throw new Error("Producto desconocido: " + worldId);

    // TODO (Play Store): reemplazar esta simulación por Google Play Billing.
    await new Promise(r => setTimeout(r, 1500));
    return { ok: true, productId: product.id, simulated: true };
  }

  return { purchase, price: (id) => (PRODUCTS[id] || {}).price };
})();
