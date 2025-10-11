import fs from "fs";
import fetch from "node-fetch";

const WEBHOOK_URL = process.env.WEBHOOK_URL;

// Définir les icônes pour chaque catégorie
const icones = {
  "Hors d'œuvre": "🥗",
  "Entrée chaude": "🍲",
  "Plats": "🍽️",
  "Légumes / féculents": "🥔",
  "Fromages": "🧀",
  "Desserts": "🍰"
};

// Charger le menu
const data = JSON.parse(fs.readFileSync("./menus/menu_semaine.json", "utf-8"));

// Trouver le jour actuel (forcé à vendredi pour "truquer")
const jours = ["DIMANCHE","LUNDI","MARDI","MERCREDI","JEUDI","VENDREDI","SAMEDI"];
// const today = new Date();
// const jourActuel = jours[today.getDay()];
const jourActuel = "VENDREDI"; // Forcer à vendredi
const menu = data[jourActuel];

if (!menu) {
  console.log(`❌ Aucun menu disponible pour ${jourActuel}`);
  process.exit(0);
}

// Construire le message
let message = `@cantine\n📅 **Menu du ${jourActuel} (${menu.date || "date inconnue"})**\n\n`;
for (const [categorie, plats] of Object.entries(menu)) {
  if (Array.isArray(plats) && plats.length > 0) {
    const icone = icones[categorie] || "📌";
    message += `${icone} **${categorie}**\n${plats.map(p => `• ${p}`).join("\n")}\n\n`;
  }
}

console.log("Webhook utilisé :", WEBHOOK_URL);

// Envoyer sur Discord
await fetch(WEBHOOK_URL, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ content: message }),
});

console.log(`✅ Menu du ${jourActuel} envoyé avec succès !`);
