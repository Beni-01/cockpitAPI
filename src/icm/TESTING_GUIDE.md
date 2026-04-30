# Guide de Test et d'Intégration - Module ICM

Ce guide vous explique comment tester et intégrer le module ICM dans votre application.

## 📋 Checklist de vérification

- [ ] Module ICM importé dans `app.module.ts`
- [ ] Migration TypeORM exécutée
- [ ] Tables créées en base de données
- [ ] Questions ICM initialisées
- [ ] API testée avec Postman/Insomnia

## 🚀 Installation rapide

### 1. Vérifier l'import du module

```typescript
// src/app.module.ts
import { IcmModule } from './icm/icm.module';

@Module({
  imports: [
    // ...
    IcmModule,
  ],
})
export class AppModule {}
```

### 2. Exécuter la migration

```bash
# Afficher les migrations en attente
npm run typeorm migration:show

# Exécuter les migrations
npm run typeorm migration:run

# Vérifier que les tables ont été créées
mysql -u root -p cockpit -e "SHOW TABLES LIKE 'icm_%';"
```

### 3. Initialiser les données

#### Option A : Via SQL

```bash
# Exécuter les données initiales
mysql -u root -p cockpit < src/icm/INITIAL_DATA.sql

# Vérifier
mysql -u root -p cockpit -e "SELECT COUNT(*) FROM icm_question;"
```

#### Option B : Via API

```bash
# Créer les questions une à une
curl -X POST http://localhost:3000/icm-questions \
  -H "Content-Type: application/json" \
  -d '{
    "label": "Entretiens mensuels individuels réalisés",
    "category": "RH",
    "periodicity": "Mensuel",
    "expectedProof": "Fiche d'"'"'entretien signée par les agents et le coordonnateur",
    "order": 1
  }'
```

## 🧪 Tests avec Postman

### 1. Configurer la collection

Créer une nouvelle collection Postman nommée "ICM Module"

### 2. Tester les endpoints

#### Test 1 : Lister les questions actives

```
GET /icm-questions/active
```

**Résultat attendu** : 200 OK, liste des 7 questions

#### Test 2 : Initialiser une checklist

```
POST /icm-checklists/init
Content-Type: application/json

{
  "coordinationId": 1,
  "month": 4,
  "year": 2026
}
```

**Résultat attendu** : 201 Created, checklist avec 7 réponses générées

#### Test 3 : Remplir les réponses

```
PATCH /icm-checklists/1/responses
Content-Type: application/json

{
  "responses": [
    {
      "id": 1,
      "realised": true,
      "conformityLevel": "Conforme",
      "comment": "Test",
      "proofProvided": "https://example.com/proof.pdf"
    },
    {
      "id": 2,
      "realised": true,
      "conformityLevel": "Partiellement conforme"
    },
    {
      "id": 3,
      "realised": false,
      "conformityLevel": null
    },
    {
      "id": 4,
      "realised": true,
      "conformityLevel": "Conforme"
    },
    {
      "id": 5,
      "realised": true,
      "conformityLevel": "Conforme"
    },
    {
      "id": 6,
      "realised": true,
      "conformityLevel": "Conforme"
    },
    {
      "id": 7,
      "realised": true,
      "conformityLevel": "Non conforme"
    }
  ]
}
```

**Résultat attendu** : 200 OK, réponses mises à jour

#### Test 4 : Soumettre la checklist

```
PATCH /icm-checklists/1/submit
```

**Résultat attendu** : 200 OK, score ICM calculé = 71.43%

Calcul: (1 + 0.5 + 0 + 1 + 1 + 1 + 0) / 7 * 100 = 71.43%

#### Test 5 : Valider la checklist

```
PATCH /icm-checklists/1/validate
```

**Résultat attendu** : 200 OK, statut = "Validé"

#### Test 6 : Tester l'erreur de doublon

```
POST /icm-checklists/init
{
  "coordinationId": 1,
  "month": 4,
  "year": 2026
}
```

**Résultat attendu** : 409 Conflict
```json
{
  "statusCode": 409,
  "message": "Une checklist existe déjà pour cette coordination et cette période (4/2026)."
}
```

## 🔍 Vérifications en base de données

### Vérifier les tables créées

```sql
-- Afficher la structure de icm_question
DESCRIBE icm_question;

-- Afficher la structure de icm_checklist
DESCRIBE icm_checklist;

-- Afficher la structure de icm_checklist_response
DESCRIBE icm_checklist_response;
```

### Vérifier les données créées

```sql
-- Questions
SELECT id, label, category, order FROM icm_question WHERE deletedAt IS NULL;

-- Checklists
SELECT id, coordinationId, month, year, status, scoreICM FROM icm_checklist WHERE deletedAt IS NULL;

-- Réponses
SELECT id, checklistId, questionId, realised, conformityLevel, scoreItem FROM icm_checklist_response;
```

### Vérifier l'index unique

```sql
-- Afficher les index
SHOW INDEX FROM icm_checklist;

-- Vérifier la contrainte unique
SELECT * FROM information_schema.STATISTICS 
WHERE TABLE_NAME = 'icm_checklist' 
AND INDEX_NAME = 'IDX_ICM_CHECKLIST_UNIQUE';
```

## 🧬 Tests d'intégrité

### Test 1 : Vérifier le soft delete

```typescript
// 1. Créer une question
POST /icm-questions
{ "label": "Test", "category": "RH", "periodicity": "Mensuel", "expectedProof": "Preuve", "order": 100 }

// 2. Supprimer la question
DELETE /icm-questions/{id}

// 3. Vérifier en BDD
SELECT * FROM icm_question WHERE id = {id};
// Doit avoir deletedAt NOT NULL

// 4. Vérifier qu'elle n'apparaît pas dans les listes
GET /icm-questions/active
// La question ne doit pas être dans la liste
```

### Test 2 : Vérifier les transactions

```bash
# Initialiser une checklist avec base vide
DELETE FROM icm_question;

POST /icm-checklists/init
{
  "coordinationId": 1,
  "month": 5,
  "year": 2026
}

# Doit retourner une erreur 400
# "Aucune question ICM active disponible"
```

### Test 3 : Vérifier le calcul du score

```bash
# Créer une checklist et remplir avec différentes conformités
# 3 conformes, 1 partiellement, 2 non, 1 non réalisée
# Score attendu = (3 + 0.5 + 0 + 0 + 0 + 0 + 0) / 7 * 100 = 50%

# Vérifier après soumission
GET /icm-checklists/1
# scoreICM doit être 50.0
```

## 📊 Tests de performance

### Test de pagination

```bash
# Lister avec limite
GET /icm-checklists?limit=5&page=1

# Vérifier les réponses
GET /icm-checklists?limit=10&page=2&coordinationId=1
```

### Test de filtres

```bash
# Filtrer par statut
GET /icm-checklists?status=Brouillon

# Filtrer par catégorie
GET /icm-questions?category=RH

# Filtrer par période
GET /icm-checklists?year=2026&month=4
```

## 🐛 Dépannage

### Erreur : "Module not found"

```
Error: Cannot find module 'src/icm/icm.module'
```

**Solution** : Vérifier que le module est bien importé dans `app.module.ts`

### Erreur : "Table not found"

```
QueryFailedError: ER_NO_SUCH_TABLE: Table 'icm_question' doesn't exist
```

**Solution** : Exécuter la migration

```bash
npm run typeorm migration:run
```

### Erreur : "Duplicate entry"

```
QueryFailedError: ER_DUP_ENTRY
```

**Solution** : Une checklist existe déjà. Vérifier avant d'initialiser.

### Erreur : "Foreign key constraint"

```
QueryFailedError: ER_NO_REFERENCED_ROW
```

**Solution** : Vérifier que la coordination existe avant de créer une checklist.

```sql
SELECT * FROM coordination WHERE id = 1;
```

## ✅ Checklist de validation complète

- [ ] Module importé dans app.module.ts
- [ ] Migration exécutée sans erreur
- [ ] Tables créées en BDD
- [ ] Index unique fonctionnel
- [ ] Questions initiales créées
- [ ] GET /icm-questions retourne 200 OK
- [ ] GET /icm-questions/active retourne les questions
- [ ] POST /icm-checklists/init crée une checklist
- [ ] PATCH /responses met à jour les réponses
- [ ] PATCH /submit calcule le score
- [ ] PATCH /validate change le statut
- [ ] Erreur 409 si doublon
- [ ] Soft delete fonctionne
- [ ] Transactions atomiques
- [ ] Pagination fonctionne
- [ ] Filtres fonctionnent
- [ ] Validations DTOs fonctionnent

## 📚 Documentation connexe

- `README.md` - Guide complet du module
- `API_EXAMPLES.md` - Tous les payloads d'exemple
- `SQL_QUERIES.sql` - Requêtes utiles
- `INITIAL_DATA.sql` - Données initiales
- `icm-data.ts` - Données TypeScript

## 🔐 Points de sécurité à vérifier

- [ ] Authentification requise sur tous les endpoints
- [ ] Authorization (admin vs coordonnateur)
- [ ] Validation des DTOs
- [ ] Gestion des erreurs robuste
- [ ] Logs d'audit
- [ ] Soft delete préservé

---

**Dernière mise à jour** : 30 Avril 2026
