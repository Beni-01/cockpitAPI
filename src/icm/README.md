# Module ICM - Index de Conformité Managériale

Ce module complet gère l'ensemble du processus de conformité managériale pour les coordinations. Il permet une configuration flexible des questions ICM et la génération automatique de checklists avec calcul de score.

## 📋 Table des matières

1. [Architecture](#architecture)
2. [Installation et Configuration](#installation-et-configuration)
3. [Utilisation](#utilisation)
4. [Flux de travail](#flux-de-travail)
5. [Structure des données](#structure-des-données)
6. [Calcul du score ICM](#calcul-du-score-icm)
7. [Endpoints API](#endpoints-api)
8. [Exemples pratiques](#exemples-pratiques)

## 🏗️ Architecture

### Modules et Services

```
src/icm/
├── entities/              # Entités TypeORM
│   ├── icm-question.entity.ts
│   ├── icm-checklist.entity.ts
│   └── icm-checklist-response.entity.ts
├── dto/                   # Data Transfer Objects
│   ├── create-icm-question.dto.ts
│   ├── update-icm-question.dto.ts
│   ├── filter-icm-question.dto.ts
│   ├── init-icm-checklist.dto.ts
│   ├── update-icm-response.dto.ts
│   └── ...
├── enums/                 # Énumérations
│   ├── icm-category.enum.ts
│   ├── icm-periodicity.enum.ts
│   ├── conformity-level.enum.ts
│   └── checklist-status.enum.ts
├── services/
│   ├── icm-question.service.ts      # Gestion des questions
│   └── icm-checklist.service.ts     # Gestion des checklists
├── controllers/
│   ├── icm-question.controller.ts
│   └── icm-checklist.controller.ts
└── icm.module.ts          # Module principal
```

### Relations entre entités

```
IcmQuestion (1) ──────── (N) IcmChecklistResponse
    ↓                              ↓
    │                              └──→ IcmChecklist (1)
    │
    └──────────────────────────────────→ Coordination (N)
                                         └───→ User
```

## 🚀 Installation et Configuration

### 1. Migration de la base de données

La migration `1777700000000-ADD_ICM_MODULE.ts` crée automatiquement les trois tables avec tous les index.

```bash
npm run typeorm migration:run
```

### 2. Vérifier que le module est importé

Le module est déjà importé dans `app.module.ts`:

```typescript
import { IcmModule } from './icm/icm.module';

@Module({
  imports: [
    // ... autres modules
    IcmModule,
  ],
})
export class AppModule {}
```

### 3. Initialiser les questions ICM

Créer les questions de base via l'API:

```bash
POST /icm-questions
{
  "label": "Entretiens mensuels individuels réalisés",
  "category": "RH",
  "periodicity": "Mensuel",
  "expectedProof": "Fiche d'entretien signée par les agents et le coordonnateur",
  "order": 1
}
```

Voir `API_EXAMPLES.md` pour les données complètes à charger.

## 📖 Utilisation

### Étape 1 : Configurer les questions ICM

L'administrateur configure les questions que les coordonnateurs devront remplir:

```bash
POST /icm-questions
```

Les questions doivent être actives (`isActive: true`) pour être utilisées dans les checklists.

### Étape 2 : Initialiser une checklist

Le coordonnateur sélectionne une coordination et une période pour initialiser une checklist:

```bash
POST /icm-checklists/init
{
  "coordinationId": 1,
  "month": 4,
  "year": 2026
}
```

**Automatiquement**, le backend:
- ✅ Vérifie qu'aucune checklist n'existe pour cette coordination/mois/année
- ✅ Crée la checklist en statut "Brouillon"
- ✅ Génère les réponses automatiquement à partir des questions actives
- ✅ Initialise chaque réponse avec `realised: false` et `scoreItem: 0`

### Étape 3 : Remplir la checklist

Le coordonnateur remplit chaque tâche:

```bash
PATCH /icm-checklists/1/responses
{
  "responses": [
    {
      "id": 1,
      "realised": true,
      "conformityLevel": "Conforme",
      "comment": "Tous les entretiens ont été réalisés",
      "proofProvided": "https://bucket.s3.com/entretien-avril-2026.pdf"
    },
    // ... autres réponses
  ]
}
```

### Étape 4 : Soumettre la checklist

Une fois complétée, le coordonnateur soumet:

```bash
PATCH /icm-checklists/1/submit
```

**Le backend**:
- ✅ Vérifie que toutes les tâches réalisées ont un niveau de conformité
- ✅ Calcule le score ICM avec la formule officielle
- ✅ Change le statut à "Soumis"
- ✅ Enregistre la date/heure de soumission

### Étape 5 : Valider ou Rejeter

L'administrateur ou validateur valide ou rejette:

```bash
# Valider
PATCH /icm-checklists/1/validate

# Rejeter
PATCH /icm-checklists/1/reject
{
  "rejectionReason": "Preuves incomplètes"
}
```

## 🔄 Flux de travail

```
┌─────────────────┐
│  Brouillon      │  (Créée par init)
│  (modifiable)   │
└────────┬────────┘
         │ PATCH /submit
┌─────────▼────────┐
│  Soumis         │  (Calcul du score)
│  (en attente)   │
└────────┬────────┘
         │
    ┌────┴──────────┐
    │               │
    │               │
PATCH /validate  PATCH /reject
    │               │
    ▼               ▼
┌──────────┐    ┌──────────┐
│ Validé   │    │ Rejeté   │
│ (Finalisé)    │ (motif)  │
└──────────┘    └──────────┘
```

## 💾 Structure des données

### IcmQuestion

| Champ | Type | Description |
|-------|------|-------------|
| id | INT | ID unique |
| label | VARCHAR(500) | Libellé de la tâche |
| category | ENUM | RH, LOGISTIQUE, FINANCE, ADMINISTRATION |
| periodicity | ENUM | Hebdomadaire, Mensuel, Trimestriel, Semestriel, Annuel |
| expectedProof | TEXT | Description de la preuve attendue |
| order | INT | Ordre d'affichage |
| isActive | BOOLEAN | Statut actif/inactif |
| createdAt | DATETIME | Date de création |
| updatedAt | DATETIME | Date de mise à jour |
| deletedAt | DATETIME | Date de suppression (soft delete) |

### IcmChecklist

| Champ | Type | Description |
|-------|------|-------------|
| id | INT | ID unique |
| coordinationId | INT | Référence à Coordination |
| month | INT | Mois (1-12) |
| year | INT | Année |
| status | ENUM | Brouillon, Soumis, Validé, Rejeté |
| scoreICM | FLOAT | Score ICM (0-100) |
| createdBy | INT | Utilisateur créateur |
| submittedAt | DATETIME | Date de soumission |
| validatedBy | INT | Utilisateur validateur |
| validatedAt | DATETIME | Date de validation |
| rejectionReason | VARCHAR(500) | Motif du rejet |
| createdAt | DATETIME | Date de création |
| updatedAt | DATETIME | Date de mise à jour |
| deletedAt | DATETIME | Date de suppression (soft delete) |

**Contrainte unique**: `UNIQUE(coordinationId, month, year) WHERE deletedAt IS NULL`

### IcmChecklistResponse

| Champ | Type | Description |
|-------|------|-------------|
| id | INT | ID unique |
| checklistId | INT | Référence à IcmChecklist |
| questionId | INT | Référence à IcmQuestion |
| realised | BOOLEAN | Tâche réalisée (O/N) |
| conformityLevel | ENUM | Conforme, Partiellement conforme, Non conforme |
| comment | TEXT | Commentaire |
| proofProvided | TEXT | Preuve fournie (URL/texte) |
| scoreItem | FLOAT | Score de l'item (0, 0.5, ou 1) |
| createdAt | DATETIME | Date de création |
| updatedAt | DATETIME | Date de mise à jour |

## 📊 Calcul du score ICM

### Formule officielle

$$\text{ICM (\%)} = \frac{\text{Total des scores des tâches}}{\text{Nombre total des tâches}} \times 100$$

### Règles de calcul

1. **Tâche non réalisée**: `scoreItem = 0`
2. **Tâche réalisée et conforme**: `scoreItem = 1`
3. **Tâche réalisée partiellement conforme**: `scoreItem = 0.5`
4. **Tâche réalisée non conforme**: `scoreItem = 0`

### Exemple concret

Si vous avez 10 tâches:
- 8 conformes (8 × 1 = 8)
- 1 partiellement conforme (1 × 0.5 = 0.5)
- 1 non réalisée (1 × 0 = 0)
- **Total**: (8 + 0.5 + 0) / 10 × 100 = **85%**

## 🔌 Endpoints API

### Questions ICM

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/icm-questions` | Créer une question |
| GET | `/icm-questions` | Lister avec filtres et pagination |
| GET | `/icm-questions/active` | Récupérer les questions actives |
| GET | `/icm-questions/:id` | Récupérer une question |
| PATCH | `/icm-questions/:id` | Mettre à jour une question |
| PATCH | `/icm-questions/:id/toggle-status` | Activer/Désactiver |
| DELETE | `/icm-questions/:id` | Supprimer (soft delete) |

### Checklists ICM

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/icm-checklists/init` | Initialiser une checklist |
| GET | `/icm-checklists` | Lister avec filtres et pagination |
| GET | `/icm-checklists/:id` | Récupérer une checklist |
| PATCH | `/icm-checklists/:id/responses` | Mettre à jour les réponses |
| PATCH | `/icm-checklists/:id/submit` | Soumettre |
| PATCH | `/icm-checklists/:id/validate` | Valider |
| PATCH | `/icm-checklists/:id/reject` | Rejeter |
| DELETE | `/icm-checklists/:id` | Supprimer (si brouillon) |

Voir `API_EXAMPLES.md` pour tous les payloads détaillés.

## 💡 Exemples pratiques

### Exemple 1 : Initialiser et remplir une checklist

```bash
# 1. Initialiser la checklist
curl -X POST http://localhost:3000/icm-checklists/init \
  -H "Content-Type: application/json" \
  -d '{
    "coordinationId": 1,
    "month": 4,
    "year": 2026
  }'

# Réponse: Checklist créée avec réponses générées

# 2. Remplir les réponses
curl -X PATCH http://localhost:3000/icm-checklists/1/responses \
  -H "Content-Type: application/json" \
  -d '{
    "responses": [
      {
        "id": 1,
        "realised": true,
        "conformityLevel": "Conforme"
      }
    ]
  }'

# 3. Soumettre
curl -X PATCH http://localhost:3000/icm-checklists/1/submit

# Réponse: Score ICM calculé et statut = "Soumis"
```

### Exemple 2 : Gérer les questions

```bash
# Créer une question
curl -X POST http://localhost:3000/icm-questions \
  -H "Content-Type: application/json" \
  -d '{
    "label": "Nouvelle question RH",
    "category": "RH",
    "periodicity": "Mensuel",
    "expectedProof": "Document signé",
    "order": 8
  }'

# Désactiver une question
curl -X PATCH http://localhost:3000/icm-questions/1/toggle-status

# Lister les questions RH actives
curl "http://localhost:3000/icm-questions?category=RH&isActive=true"
```

## 🛡️ Gestion des erreurs

### Erreur 409 - Conflit (Checklist en doublon)

```json
{
  "statusCode": 409,
  "message": "Une checklist existe déjà pour cette coordination et cette période (4/2026).",
  "error": "Conflict"
}
```

**Solution**: Récupérer la checklist existante avec `GET /icm-checklists/:id`

### Erreur 400 - Checklist non modifiable

```json
{
  "statusCode": 400,
  "message": "Seules les checklists en brouillon peuvent être modifiées.",
  "error": "Bad Request"
}
```

**Solution**: Les checklists soumises/validées ne peuvent pas être modifiées. Elles doivent être rejetées d'abord.

### Erreur 400 - Soumission incomplète

```json
{
  "statusCode": 400,
  "message": "2 tâche(s) réalisée(s) n'ont pas de niveau de conformité défini.",
  "error": "Bad Request"
}
```

**Solution**: Compléter tous les niveaux de conformité avant de soumettre.

## 📝 Maintenance

### Voir les checklists en attente

```sql
SELECT * FROM icm_checklist 
WHERE status = 'Soumis' 
AND deletedAt IS NULL
ORDER BY submittedAt ASC;
```

### Statistiques par coordination

```sql
SELECT 
  coord.nom,
  COUNT(DISTINCT c.id) as totalChecklists,
  AVG(c.scoreICM) as averageScore
FROM coordination coord
LEFT JOIN icm_checklist c ON coord.id = c.coordinationId
WHERE coord.deletedAt IS NULL
GROUP BY coord.id
ORDER BY averageScore DESC;
```

Voir `SQL_QUERIES.sql` pour plus de requêtes utiles.

## 🔐 Sécurité

- ✅ Soft delete - Les données ne sont jamais complètement supprimées
- ✅ Transactions - L'initialisation d'une checklist est atomique
- ✅ Validation - Class-validator validé tous les DTOs
- ✅ Exceptions - Gestion robuste avec try/catch et exceptions NestJS
- ✅ Index unique - Empêche les doublons de checklists
- ✅ Contraintes FK - Références intégrales maintenues

## 📚 Fichiers importants

- `API_EXAMPLES.md` - Tous les payloads et exemples d'utilisation
- `SQL_QUERIES.sql` - Requêtes SQL utiles
- `db/migrations/1777700000000-ADD_ICM_MODULE.ts` - Migration de création des tables
- `src/icm/icm.module.ts` - Configuration du module

---

**Version**: 1.0.0  
**Date de création**: 30 Avril 2026  
**Dernière mise à jour**: 30 Avril 2026
