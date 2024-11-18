module.exports = {
    apps: [
      {
        name: "f360api",          // Nom de votre application
        script: "dist/src/main.js",    // Point d'entrée de votre application (après compilation TypeScript)
        instances: 1,              // Nombre d'instances (1 pour une seule instance, "max" pour utiliser tous les cœurs CPU disponibles)
        exec_mode: "cluster",      // Mode cluster pour répartir les charges entre les cœurs (recommandé en production)
        watch: false,               // Désactive le rechargement automatique en production
        max_memory_restart: "300M", // Redémarre l'application si elle dépasse 300 MB de mémoire
        env: {
          NODE_ENV: "production",  // Définir l'environnement à "production"
        }
      }
    ]
  };