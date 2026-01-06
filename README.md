# 🥘 Bot Cantine – Envoi automatique du menu scolaire

Bot Cantine est un service automatisé qui publie chaque jour de la semaine le menu de la cantine scolaire sur Discord via webhook.  
Il lit automatiquement le fichier de menu correspondant à la semaine en cours et, grâce à **cron-job.org**, le bot est **activé automatiquement tous du lundi au vendredi** pour envoyer le menu sans aucune intervention humaine.  
Le système est entièrement déployé sur **Vercel**.

---

## ✨ Fonctionnalités

- 📅 Lecture automatique du fichier **menu de la semaine en cours** 
- 🧠 Si aucun fichier n’est trouvé → le bot **n’envoie rien**
- 🚨 Envoi du menu sur Discord via **webhook**
- 🤖 Formatage propre avec **icônes** pour chaque catégorie
- 🕒 Exécutable automatiquement via **cron-job.org**
- 🌐 Déployé sur **Vercel** via API Serverless

---

  ## 📂 Structure du projet
	
	├───api/
	│   └───run.js
	├───menus
	│   ├───menu_semaine_41.json
	│   └───...
	│      
	├───package-lock.json
	├───package.json
	└───README.md
