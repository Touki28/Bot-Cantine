import fs from "fs";
import fetch from "node-fetch";
import path from "path";

// Webhook Discord
const WEBHOOK_URL = process.env.WEBHOOK_URL;

// Icônes des catégories
const icones = {
  "Hors d'œuvre": "🥗",
  "Entrée chaude": "🍲",
  "Plats": "🍽️",
  "Légumes / féculents": "🥔",
  "Fromages": "🧀",
  "Desserts": "🍰"
};

// Fonction pour calculer le numéro de la semaine
function getCurrentWeekNumber() {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const pastDaysOfYear = Math.floor((now - startOfYear) / (24 * 60 * 60 * 1000));
  return Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7);
}

// Déterminer le fichier JSON à charger
const semaine = getCurrentWeekNumber();
let jsonPath = path.join("./menus", `menu_semaine_${semaine}.json`);

// Si le fichier n'existe pas, on prend le fichier par défaut
if (!fs.existsSync(jsonPath)) {
  console.warn(`⚠️ Le fichier ${jsonPath} n'existe pas. Utilisation du fichier par défaut menu_semaine.json`);
  jsonPath = path.join("./menus", "menu_semaine.json");
}

// Charger le menu
const data = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));

// Forcer le jour actuel à vendredi si c'est samedi ou dimanche
const jours = ["DIMANCHE","LUNDI","MARDI","MERCREDI","JEUDI","VENDREDI","SAMEDI"];
const today = new Date();
let jourActuel = jours[today.getDay()];
if (jourActuel === "SAMEDI" || jourActuel === "DIMANCHE") {
  jourActuel = "VENDREDI";
}

const menu = data[jourActuel];
if (!menu) {
  console.log(`❌ Aucun menu disponible pour ${jourActuel}`);
  process.exit(0);
}

const ROLE_ID = "cantine";
// Construire le message
let message = `<@&${ROLE_ID}>\n\n📅 **Menu du ${jourActuel} (${menu.date || "date inconnue"})**\n\n`;
for (const [categorie, plats] of Object.entries(menu)) {
  if (Array.isArray(plats) && plats.length > 0) {
    const icone = icones[categorie] || "📌";
    message += `${icone} **${categorie}**\n${plats.map(p => `• ${p}`).join("\n")}\n\n`;
  }
}

// Envoyer sur Discord via webhook
console.log("Webhook utilisé :", WEBHOOK_URL);
await fetch(WEBHOOK_URL, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ content: message }),
});

console.log(`✅ Menu du ${jourActuel} envoyé avec succès !`);
