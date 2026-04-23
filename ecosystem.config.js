module.exports = {
  apps: [
    {
      name: "cockpitAPI",          // Nom de votre application
      script: "dist/src/main.js",    // Point d'entrée de votre application (après compilation TypeScript)
      watch: false,               // Désactive le rechargement automatique en production
      max_memory_restart: "300M", // Redémarre l'application si elle dépasse 300 MB de mémoire
      env: {
        NODE_ENV: "production",  // Définir l'environnement à "production"
      }
    }
  ]
};
