#!/usr/bin/env bash

# ============================================================================
# SCRIPTS DE CONFIGURATION - Module ICM
# ============================================================================
# Scripts utiles pour configurer et tester le module ICM

# ============================================================================
# 1. MIGRATIONS
# ============================================================================

# Vérifier les migrations en attente
run_show_migrations() {
  echo "📋 Affichage des migrations en attente..."
  npm run typeorm migration:show
}

# Exécuter les migrations
run_migrations() {
  echo "🚀 Exécution des migrations..."
  npm run typeorm migration:run
}

# Revenir aux migrations précédentes
rollback_migrations() {
  echo "⏮️  Annulation de la dernière migration..."
  npm run typeorm migration:revert
}

# ============================================================================
# 2. DONNÉES INITIALES
# ============================================================================

# Charger les données initiales SQL
load_initial_data() {
  echo "📥 Chargement des données initiales..."
  
  # À adapter selon votre configuration MySQL
  MYSQL_USER=${MYSQL_USER:-root}
  MYSQL_PASS=${MYSQL_PASSWORD:-}
  MYSQL_DB=${MYSQL_DATABASE:-cockpit}
  
  if [ -z "$MYSQL_PASS" ]; then
    mysql -u "$MYSQL_USER" "$MYSQL_DB" < src/icm/INITIAL_DATA.sql
  else
    mysql -u "$MYSQL_USER" -p"$MYSQL_PASS" "$MYSQL_DB" < src/icm/INITIAL_DATA.sql
  fi
  
  echo "✅ Données initiales chargées"
}

# ============================================================================
# 3. VÉRIFICATIONS
# ============================================================================

# Vérifier que les tables ICM existent
verify_tables() {
  echo "🔍 Vérification des tables ICM..."
  
  MYSQL_USER=${MYSQL_USER:-root}
  MYSQL_PASS=${MYSQL_PASSWORD:-}
  MYSQL_DB=${MYSQL_DATABASE:-cockpit}
  
  if [ -z "$MYSQL_PASS" ]; then
    mysql -u "$MYSQL_USER" "$MYSQL_DB" -e "SHOW TABLES LIKE 'icm_%';"
  else
    mysql -u "$MYSQL_USER" -p"$MYSQL_PASS" "$MYSQL_DB" -e "SHOW TABLES LIKE 'icm_%';"
  fi
}

# Compter les questions ICM
count_questions() {
  echo "📊 Nombre de questions ICM..."
  
  MYSQL_USER=${MYSQL_USER:-root}
  MYSQL_PASS=${MYSQL_PASSWORD:-}
  MYSQL_DB=${MYSQL_DATABASE:-cockpit}
  
  if [ -z "$MYSQL_PASS" ]; then
    mysql -u "$MYSQL_USER" "$MYSQL_DB" -e "SELECT COUNT(*) as total_questions FROM icm_question WHERE deletedAt IS NULL;"
  else
    mysql -u "$MYSQL_USER" -p"$MYSQL_PASS" "$MYSQL_DB" -e "SELECT COUNT(*) as total_questions FROM icm_question WHERE deletedAt IS NULL;"
  fi
}

# ============================================================================
# 4. TESTS API
# ============================================================================

# Tester endpoint GET questions
test_get_questions() {
  echo "🧪 Test GET /icm-questions..."
  curl -s http://localhost:3000/icm-questions | jq .
}

# Tester endpoint GET questions actives
test_get_active_questions() {
  echo "🧪 Test GET /icm-questions/active..."
  curl -s http://localhost:3000/icm-questions/active | jq .
}

# Tester création de question
test_create_question() {
  echo "🧪 Test POST /icm-questions..."
  curl -X POST http://localhost:3000/icm-questions \
    -H "Content-Type: application/json" \
    -d '{
      "label": "Question test",
      "category": "RH",
      "periodicity": "Mensuel",
      "expectedProof": "Preuve",
      "order": 100
    }' | jq .
}

# ============================================================================
# 5. NETTOYAGE
# ============================================================================

# Nettoyer les données ICM
clean_icm_data() {
  echo "🗑️  Nettoyage des données ICM..."
  
  MYSQL_USER=${MYSQL_USER:-root}
  MYSQL_PASS=${MYSQL_PASSWORD:-}
  MYSQL_DB=${MYSQL_DATABASE:-cockpit}
  
  SQL="
    DELETE FROM icm_checklist_response;
    DELETE FROM icm_checklist;
    DELETE FROM icm_question;
    ALTER TABLE icm_question AUTO_INCREMENT = 1;
    ALTER TABLE icm_checklist AUTO_INCREMENT = 1;
    ALTER TABLE icm_checklist_response AUTO_INCREMENT = 1;
  "
  
  if [ -z "$MYSQL_PASS" ]; then
    mysql -u "$MYSQL_USER" "$MYSQL_DB" -e "$SQL"
  else
    mysql -u "$MYSQL_USER" -p"$MYSQL_PASS" "$MYSQL_DB" -e "$SQL"
  fi
  
  echo "✅ Nettoyage effectué"
}

# ============================================================================
# 6. SETUP COMPLET
# ============================================================================

# Setup initial complet
setup_icm() {
  echo "🚀 Setup complet du module ICM..."
  echo ""
  
  echo "1️⃣  Exécution des migrations..."
  run_migrations
  echo ""
  
  echo "2️⃣  Chargement des données initiales..."
  load_initial_data
  echo ""
  
  echo "3️⃣  Vérification des tables..."
  verify_tables
  echo ""
  
  echo "4️⃣  Comptage des questions..."
  count_questions
  echo ""
  
  echo "✅ Setup terminé ! Le module ICM est prêt."
}

# ============================================================================
# 7. AFFICHAGE DU MENU
# ============================================================================

show_menu() {
  echo ""
  echo "╔════════════════════════════════════════════════════╗"
  echo "║         MODULE ICM - SCRIPTS DE GESTION            ║"
  echo "╚════════════════════════════════════════════════════╝"
  echo ""
  echo "Migrations:"
  echo "  1. Show migrations"
  echo "  2. Run migrations"
  echo "  3. Rollback migrations"
  echo ""
  echo "Données:"
  echo "  4. Load initial data"
  echo "  5. Clean ICM data"
  echo ""
  echo "Vérifications:"
  echo "  6. Verify tables"
  echo "  7. Count questions"
  echo ""
  echo "Tests API:"
  echo "  8. Test GET questions"
  echo "  9. Test GET active questions"
  echo "  10. Test CREATE question"
  echo ""
  echo "Setup:"
  echo "  11. Full setup"
  echo ""
  echo "  0. Exit"
  echo ""
}

# ============================================================================
# 8. BOUCLE PRINCIPALE
# ============================================================================

main() {
  while true; do
    show_menu
    read -p "Choisir une action (0-11): " choice
    
    case $choice in
      1) run_show_migrations ;;
      2) run_migrations ;;
      3) rollback_migrations ;;
      4) load_initial_data ;;
      5) clean_icm_data ;;
      6) verify_tables ;;
      7) count_questions ;;
      8) test_get_questions ;;
      9) test_get_active_questions ;;
      10) test_create_question ;;
      11) setup_icm ;;
      0) echo "Goodbye! 👋"; exit 0 ;;
      *) echo "❌ Choix invalide" ;;
    esac
    
    echo ""
    read -p "Appuyer sur Entrée pour continuer..."
  done
}

# ============================================================================
# EXÉCUTION
# ============================================================================

# Si des arguments sont passés, exécuter la commande directement
if [ $# -gt 0 ]; then
  case $1 in
    setup) setup_icm ;;
    migrate) run_migrations ;;
    load-data) load_initial_data ;;
    verify) verify_tables ;;
    count) count_questions ;;
    test) test_get_questions ;;
    clean) clean_icm_data ;;
    *) echo "Commande inconnue: $1" ;;
  esac
else
  # Mode interactif
  main
fi
