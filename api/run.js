const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");

// Icônes pour les catégories
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

module.exports = async (req, res) => {
  const WEBHOOK_URL = process.env.WEBHOOK_URL;
  if (!WEBHOOK_URL) return res.status(500).send("WEBHOOK_URL manquant !");

  // Déterminer le fichier JSON de la semaine en cours
  const semaine = getCurrentWeekNumber();
  let jsonPath = path.resolve(`./menus/menu_semaine_${semaine}.json`);

  if (!fs.existsSync(jsonPath)) {
    console.log(`ℹ️ Aucun fichier de menu pour la semaine ${semaine}, aucune action effectuée.`);
    return res.status(200).send(`Aucun menu trouvé pour la semaine ${semaine}, rien à faire.`);
  }

  let menuData;
  try {
    menuData = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
  } catch (err) {
    console.error("Erreur lecture JSON:", err);
    return res.status(500).send("Impossible de lire le menu.");
  }

  // Déterminer le jour actuel (vendredi si weekend)
  const jours = ["DIMANCHE","LUNDI","MARDI","MERCREDI","JEUDI","VENDREDI","SAMEDI"];
  const today = new Date();
  let jourActuel = jours[today.getDay()];
  if (jourActuel === "SAMEDI" || jourActuel === "DIMANCHE") jourActuel = "VENDREDI";

  const menu = menuData[jourActuel];
  if (!menu) return res.status(500).send(`Aucun menu pour ${jourActuel}`);

  // Construire la date lisible pour Discord
  const options = { day: '2-digit', month: 'long', year: 'numeric' };
  const dateLisible = today.toLocaleDateString('fr-FR', options);

  let message = `@everyone\n\n📅 **Menu du ${jourActuel} (${dateLisible})**\n\n`;

  for (const [categorie, plats] of Object.entries(menu)) {
    if (Array.isArray(plats) && plats.length > 0) {
      const icone = icones[categorie] || "📌";
      message += `${icone} ${categorie}\n`;
      message += plats.map(p => `• ${p}`).join("\n") + "\n\n";
    }
  }

  try {
    await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: message }),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).send("Erreur lors de l'envoi sur Discord");
  }

  res.status(200).send(`✅ Menu du ${jourActuel} envoyé !`);
};