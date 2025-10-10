const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits } = require('discord.js');
require('dotenv').config();

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

const icones = {
  "Hors d'œuvre": "🥗",
  "Entrée chaude": "🍲",
  "Plats": "🍽️",
  "Légumes / féculents": "🥔",
  "Fromages": "🧀",
  "Desserts": "🍰"
};

// Charger le menu depuis un fichier JSON
function chargerMenu() {
  const numSemaine = getCurrentWeekNumber();
  const jsonPath = path.join(__dirname, 'menus', `menu_semaine_${numSemaine}.json`);

  if (!fs.existsSync(jsonPath)) {
    console.warn(`⚠️ Le fichier ${jsonPath} n'existe pas. Utilisation du fichier menu_semaine.json par défaut.`);
    return JSON.parse(fs.readFileSync(path.join(__dirname, 'menus', 'menu_semaine.json'), 'utf-8'));
  }

  console.log(`📅 Chargement du menu de la semaine ${numSemaine}`);
  const data = fs.readFileSync(jsonPath, 'utf-8');
  return JSON.parse(data);
}

// Formater un jour
function formaterJour(jour, data) {
  let message = `\n━━━━━━━━━━━━━━━━━━━━━━\n`;
  message += `📅 **${jour} ${data.date}**\n`;
  message += `━━━━━━━━━━━━━━━━━━━━━━\n\n`;

  const ordreCategories = [
    "Hors d'œuvre",
    "Entrée chaude",
    "Plats",
    "Légumes / féculents",
    "Fromages",
    "Desserts"
  ];

  ordreCategories.forEach(categorie => {
    const items = data[categorie];
    if (items && items.length > 0) {
      const icone = icones[categorie] || "📌";
      message += `${icone} **${categorie}**\n`;
      
      if (Array.isArray(items)) {
        items.forEach(item => {
          message += `• ${item}\n`;
        });
      } else {
        message += `${items}\n`;
      }
      message += `\n`;
    }
  });

  return message;
}

function getCurrentWeekNumber() {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const days = Math.floor((now - startOfYear) / (24 * 60 * 60 * 1000));
  return Math.ceil((days + startOfYear.getDay() + 1) / 7);
}

// Envoyer message long
async function sendLongMessage(channel, content) {
  const chunkSize = 1800;
  for (let i = 0; i < content.length; i += chunkSize) {
    await channel.send(content.slice(i, i + chunkSize));
  }
}

client.once('ready', () => {
  console.log(`✅ Connecté en tant que ${client.user.tag}`);
});

client.on('messageCreate', async message => {
  if (message.author.bot) return;

  // Commande !menu
  if (message.content === '!menu' || message.content.startsWith('!menu ')) {
    try {
      const menuData = chargerMenu();

      // Afficher tous les menus
      if (message.content === '!menu') {
        for (const [jour, donnees] of Object.entries(menuData)) {
          await sendLongMessage(message.channel, formaterJour(jour, donnees));
        }
        return;
      }

      // Afficher un jour spécifique
      const jourDemande = message.content.split(' ')[1]?.toUpperCase();
      const joursValides = ['LUNDI', 'MARDI', 'MERCREDI', 'JEUDI', 'VENDREDI'];

      if (!joursValides.includes(jourDemande)) {
        return message.reply("❌ Jour invalide. Utilisez: !menu LUNDI/MARDI/MERCREDI/JEUDI/VENDREDI");
      }

      if (menuData[jourDemande]) {
        await sendLongMessage(message.channel, formaterJour(jourDemande, menuData[jourDemande]));
      } else {
        message.reply(`❌ Menu non disponible pour ${jourDemande}`);
      }

    } catch (err) {
      console.error(err);
      message.reply("❌ Erreur lors de la lecture du menu.");
    }
    return;
  }

  // Commande !help
  if (message.content === '!help' || message.content === '!aide') {
    const helpMessage = `
📖 **Commandes disponibles:**

\`!menu\` - Affiche tous les menus de la semaine
\`!menu LUNDI\` - Affiche le menu du lundi
\`!menu MARDI\` - Affiche le menu du mardi
\`!menu MERCREDI\` - Affiche le menu du mercredi
\`!menu JEUDI\` - Affiche le menu du jeudi
\`!menu VENDREDI\` - Affiche le menu du vendredi
\`!help\` - Affiche ce message d'aide

ℹ️ **Note:** Le menu est chargé depuis \`menus/menu_semaine.json\`
    `;
    return message.reply(helpMessage);
  }
});

// Connexion au bot
client.login('MTQyNTUzOTA1NjU5NDMyMTUwMA.GzVEwE.0qz8v7Zsz0O_cYf4hB-xW-qR6pVHFpAUiykmFQ');
