const KESH = "ob-havo-v1";
const FAYLLAR = [
  "./",
  "index.html",
  "style.css",
  "script.js",
  "logo.svg",
  "icon-192.png",
  "icon-512.png",
];

self.addEventListener("install", function (hodisa) {
  hodisa.waitUntil(
    caches.open(KESH).then(function (kesh) {
      return kesh.addAll(FAYLLAR);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", function (hodisa) {
  hodisa.waitUntil(
    caches.keys().then(function (nomlar) {
      return Promise.all(
        nomlar
          .filter(function (nom) {
            return nom !== KESH;
          })
          .map(function (nom) {
            return caches.delete(nom);
          })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", function (hodisa) {
  const sorov = hodisa.request;
  const manzil = new URL(sorov.url);

  // Faqat o'zimizning fayllarni keshlaymiz. Ob-havo doim internetdan olinadi.
  if (sorov.method !== "GET" || manzil.origin !== self.location.origin) {
    return;
  }

  hodisa.respondWith(
    fetch(sorov)
      .then(function (javob) {
        const nusxa = javob.clone();
        caches.open(KESH).then(function (kesh) {
          kesh.put(sorov, nusxa);
        });
        return javob;
      })
      .catch(function () {
        return caches.match(sorov);
      })
  );
});