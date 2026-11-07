// ===== 1. Hududlar ro'yxati (14 ta) =====
const hududlar = [
  { nom: "Toshkent shahri", lat: 41.2995, lon: 69.2401 },
  { nom: "Toshkent viloyati", lat: 41.0167, lon: 69.35 },
  { nom: "Andijon", lat: 40.7821, lon: 72.3442 },
  { nom: "Buxoro", lat: 39.7747, lon: 64.4286 },
  { nom: "Farg'ona", lat: 40.3842, lon: 71.7843 },
  { nom: "Jizzax", lat: 40.1158, lon: 67.8422 },
  { nom: "Xorazm", lat: 41.55, lon: 60.6333 },
  { nom: "Namangan", lat: 40.9983, lon: 71.6726 },
  { nom: "Navoiy", lat: 40.0844, lon: 65.3792 },
  { nom: "Qashqadaryo", lat: 38.8606, lon: 65.7891 },
  { nom: "Qoraqalpog'iston", lat: 42.4531, lon: 59.6103 },
  { nom: "Samarqand", lat: 39.627, lon: 66.975 },
  { nom: "Sirdaryo", lat: 40.4897, lon: 68.7842 },
  { nom: "Surxondaryo", lat: 37.2242, lon: 67.2783 },
];

// ===== 2. HTML'dagi elementlar =====
const viloyatlarBolimi = document.getElementById("viloyatlar");
const temaTugma = document.getElementById("temaTugma");
// YANGI:
const malumotBolimi = document.getElementById("malumot");
const orqagaTugma = document.getElementById("orqagaTugma");
const hududNomi = document.getElementById("hududNomi");
const hozirgiBlok = document.getElementById("hozirgi");
const havoSifatiBlok = document.getElementById("havoSifati");
const prognozBlok = document.getElementById("prognoz");
const yuklanmoqda = document.getElementById("yuklanmoqda");
const xatoXabar = document.getElementById("xato");

// ===== 3. Kartochkalarni yaratish =====
function kartochkalarniYaratish() {
  hududlar.forEach(function (hudud) {
    const tugma = document.createElement("button");
    tugma.className = "kartochka";
    tugma.textContent = hudud.nom;

    tugma.addEventListener("click", function () {
      hududniTanlash(hudud);
    });

    viloyatlarBolimi.appendChild(tugma);
  });
}

// ===== 4. YANGI: ob-havo kodini belgi va matnga aylantirish =====
function havoBelgisi(kod) {
  if (kod === 0) return { emoji: "☀️", matn: "Ochiq" };
  if (kod <= 2) return { emoji: "⛅", matn: "Qisman bulutli" };
  if (kod === 3) return { emoji: "☁️", matn: "Bulutli" };
  if (kod === 45 || kod === 48) return { emoji: "🌫️", matn: "Tuman" };
  if (kod >= 51 && kod <= 57) return { emoji: "🌦️", matn: "Mayda yomg'ir" };
  if ((kod >= 61 && kod <= 67) || (kod >= 80 && kod <= 82)) {
    return { emoji: "🌧️", matn: "Yomg'ir" };
  }
  if ((kod >= 71 && kod <= 77) || kod === 85 || kod === 86) {
    return { emoji: "❄️", matn: "Qor" };
  }
  if (kod >= 95) return { emoji: "⛈️", matn: "Momaqaldiroq" };
  return { emoji: "🌡️", matn: "Noma'lum" };
}

function havoSifatiMatni(aqi) {
  if (aqi <= 20) return "Juda yaxshi";
  if (aqi <= 40) return "Yaxshi";
  if (aqi <= 60) return "O'rtacha";
  if (aqi <= 80) return "Yomon";
  if (aqi <= 100) return "Juda yomon";
  return "Xavfli";
}

const haftaKunlari = ["Yak", "Dush", "Sesh", "Chor", "Pay", "Juma", "Shan"];

// ===== 5. YANGI: hududni tanlaganda ma'lumot olish =====
async function hududniTanlash(hudud) {
  viloyatlarBolimi.hidden = true;
  malumotBolimi.hidden = true;
  xatoXabar.hidden = true;
  yuklanmoqda.hidden = false;

  try {
    const obHavoUrl =
      "https://api.open-meteo.com/v1/forecast" +
      "?latitude=" + hudud.lat +
      "&longitude=" + hudud.lon +
      "&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code" +
      "&daily=weather_code,temperature_2m_max,temperature_2m_min" +
      "&timezone=Asia%2FTashkent";

    const havoUrl =
      "https://air-quality-api.open-meteo.com/v1/air-quality" +
      "?latitude=" + hudud.lat +
      "&longitude=" + hudud.lon +
      "&current=european_aqi";

    const [obHavoJavob, havoJavob] = await Promise.all([
      fetch(obHavoUrl),
      fetch(havoUrl),
    ]);

    if (!obHavoJavob.ok) {
      throw new Error("Ob-havo olinmadi");
    }

    const obHavo = await obHavoJavob.json();
    const havo = havoJavob.ok ? await havoJavob.json() : null;

    malumotniKorsatish(hudud, obHavo, havo);
    localStorage.setItem("oxirgiHudud", hudud.nom);
    malumotBolimi.hidden = false;
  } catch (xato) {
    console.error(xato);
    xatoXabar.textContent =
      "Ma'lumot olinmadi. Internetni tekshirib, qayta urinib ko'ring.";
    xatoXabar.hidden = false;
    viloyatlarBolimi.hidden = false;
  } finally {
    yuklanmoqda.hidden = true;
  }
}

// ===== 6. YANGI: ma'lumotni sahifada ko'rsatish =====
function malumotniKorsatish(hudud, obHavo, havo) {
  hududNomi.textContent = hudud.nom;

  // Hozirgi ob-havo
  const h = obHavo.current;
  const belgi = havoBelgisi(h.weather_code);
  hozirgiBlok.innerHTML = `
    <div class="katta-belgi">${belgi.emoji}</div>
    <div class="katta-harorat">${Math.round(h.temperature_2m)}°C</div>
    <div>${belgi.matn}</div>
    <p class="och-matn">
      Sezilishi: ${Math.round(h.apparent_temperature)}°C ·
      Namlik: ${h.relative_humidity_2m}% ·
      Shamol: ${Math.round(h.wind_speed_10m)} km/soat
    </p>
  `;

  // Havo sifati
  if (havo && havo.current && havo.current.european_aqi != null) {
    const aqi = Math.round(havo.current.european_aqi);
    havoSifatiBlok.innerHTML =
      "<strong>Havo sifati:</strong> " + havoSifatiMatni(aqi) + " (AQI " + aqi + ")";
    havoSifatiBlok.hidden = false;
  } else {
    havoSifatiBlok.hidden = true;
  }

  // 7 kunlik prognoz
  prognozBlok.innerHTML = "";
  obHavo.daily.time.forEach(function (sana, i) {
    const kunBelgisi = havoBelgisi(obHavo.daily.weather_code[i]);
    const hafta = haftaKunlari[new Date(sana + "T12:00:00").getDay()];
    const eng_yuqori = Math.round(obHavo.daily.temperature_2m_max[i]);
    const eng_past = Math.round(obHavo.daily.temperature_2m_min[i]);

    const kun = document.createElement("div");
    kun.className = "kun";
    kun.innerHTML = `
      <strong>${hafta}</strong>
      <div class="kun-belgi">${kunBelgisi.emoji}</div>
      <div>${eng_yuqori}°</div>
      <div class="och-matn">${eng_past}°</div>
    `;
    prognozBlok.appendChild(kun);
  });
}

// ===== 7. YANGI: "Orqaga" tugmasi =====
orqagaTugma.addEventListener("click", function () {
  malumotBolimi.hidden = true;
  viloyatlarBolimi.hidden = false;
});

// ===== 8. Qorong'u rejim =====
function temaniQollash(qorongi) {
  document.body.classList.toggle("qorongi", qorongi);
  temaTugma.textContent = qorongi ? "☀️" : "🌙";
  localStorage.setItem("tema", qorongi ? "qorongi" : "yorug");
}

temaTugma.addEventListener("click", function () {
  const hozirQorongi = document.body.classList.contains("qorongi");
  temaniQollash(!hozirQorongi);
});

// ===== 9. Sahifa ochilganda ishga tushadi =====
kartochkalarniYaratish();
temaniQollash(localStorage.getItem("tema") === "qorongi");

// YANGI: oxirgi tanlangan hudud bo'lsa, uni darrov ochamiz
const oxirgiHudud = localStorage.getItem("oxirgiHudud");
if (oxirgiHudud) {
  const topilgan = hududlar.find(function (h) {
    return h.nom === oxirgiHudud;
  });
  if (topilgan) {
    hududniTanlash(topilgan);
  }
}