# Exemples de Payloads API - Module ICM

## 1. Questions ICM

### Créer une question ICM
```json
{
  "label": "Entretiens mensuels individuels réalisés",
  "category": "RH",
  "periodicity": "Mensuel",
  "expectedProof": "Fiche d'entretien signée par les agents et le coordonnateur",
  "order": 1
}
```

### Mettre à jour une question
```json
{
  "label": "Entretiens mensuels individuels réalisés (Mis à jour)",
  "category": "RH",
  "order": 2
}
```

### Activer/Désactiver une question
```
PATCH /icm-questions/1/toggle-status
```

### Lister les questions avec filtres
```
GET /icm-questions?category=RH&periodicity=Mensuel&isActive=true&page=1&limit=10
```

### Récupérer les questions actives
```
GET /icm-questions/active
```

## 2. Checklists ICM

### Initialiser une checklist
```json
{
  "coordinationId": 1,
  "month": 4,
  "year": 2026
}
```

**Réponse** (Checklist avec réponses générées automatiquement):
```json
{
  "id": 1,
  "coordinationId": 1,
  "month": 4,
  "year": 2026,
  "status": "Brouillon",
  "scoreICM": null,
  "createdBy": 1,
  "submittedAt": null,
  "validatedBy": null,
  "validatedAt": null,
  "rejectionReason": null,
  "createdAt": "2026-04-30T10:30:00Z",
  "updatedAt": "2026-04-30T10:30:00Z",
  "deletedAt": null,
  "responses": [
    {
      "id": 1,
      "checklistId": 1,
      "questionId": 1,
      "realised": false,
      "conformityLevel": null,
      "comment": null,
      "proofProvided": null,
      "scoreItem": 0,
      "createdAt": "2026-04-30T10:30:00Z",
      "updatedAt": "2026-04-30T10:30:00Z",
      "question": {
        "id": 1,
        "label": "Entretiens mensuels individuels réalisés",
        "category": "RH",
        "periodicity": "Mensuel",
        "expectedProof": "Fiche d'entretien signée par les agents et le coordonnateur",
        "order": 1,
        "isActive": true
      }
    },
    {
      "id": 2,
      "checklistId": 1,
      "questionId": 2,
      "realised": false,
      "conformityLevel": null,
      "comment": null,
      "proofProvided": null,
      "scoreItem": 0,
      "createdAt": "2026-04-30T10:30:00Z",
      "updatedAt": "2026-04-30T10:30:00Z",
      "question": {
        "id": 2,
        "label": "État de présence du personnel",
        "category": "RH",
        "periodicity": "Hebdomadaire",
        "expectedProof": "Fichier signé / Rapport de pointage signé",
        "order": 2,
        "isActive": true
      }
    }
  ]
}
```

### Mettre à jour les réponses d'une checklist
```json
{
  "responses": [
    {
      "id": 1,
      "realised": true,
      "conformityLevel": "Conforme",
      "comment": "Tous les entretiens ont été réalisés sans problème",
      "proofProvided": "https://bucket.s3.com/entretien-avril-2026.pdf"
    },
    {
      "id": 2,
      "realised": true,
      "conformityLevel": "Partiellement conforme",
      "comment": "Présence à 95% due à une absence justifiée",
      "proofProvided": "https://bucket.s3.com/rapport-pointage-avril-2026.pdf"
    },
    {
      "id": 3,
      "realised": false,
      "conformityLevel": null,
      "comment": "Non réalisé",
      "proofProvided": null
    }
  ]
}
```

### Soumettre une checklist
```
PATCH /icm-checklists/1/submit
```

**Réponse** (avec score ICM calculé):
```json
{
  "id": 1,
  "coordinationId": 1,
  "month": 4,
  "year": 2026,
  "status": "Soumis",
  "scoreICM": 83.33,
  "createdBy": 1,
  "submittedAt": "2026-04-30T11:00:00Z",
  "validatedBy": null,
  "validatedAt": null,
  "rejectionReason": null,
  "createdAt": "2026-04-30T10:30:00Z",
  "updatedAt": "2026-04-30T11:00:00Z",
  "deletedAt": null
}
```

### Valider une checklist
```
PATCH /icm-checklists/1/validate
```

**Réponse**:
```json
{
  "id": 1,
  "coordinationId": 1,
  "month": 4,
  "year": 2026,
  "status": "Validé",
  "scoreICM": 83.33,
  "createdBy": 1,
  "submittedAt": "2026-04-30T11:00:00Z",
  "validatedBy": 2,
  "validatedAt": "2026-04-30T14:30:00Z",
  "rejectionReason": null,
  "createdAt": "2026-04-30T10:30:00Z",
  "updatedAt": "2026-04-30T14:30:00Z",
  "deletedAt": null
}
```

### Rejeter une checklist
```json
{
  "rejectionReason": "Preuves incomplètes pour les questions RH. Veuillez fournir les fiches d'entretien manquantes."
}
```

**Réponse**:
```json
{
  "id": 1,
  "coordinationId": 1,
  "month": 4,
  "year": 2026,
  "status": "Rejeté",
  "scoreICM": 83.33,
  "createdBy": 1,
  "submittedAt": "2026-04-30T11:00:00Z",
  "validatedBy": 2,
  "validatedAt": "2026-04-30T14:30:00Z",
  "rejectionReason": "Preuves incomplètes pour les questions RH. Veuillez fournir les fiches d'entretien manquantes.",
  "createdAt": "2026-04-30T10:30:00Z",
  "updatedAt": "2026-04-30T14:30:00Z",
  "deletedAt": null
}
```

### Lister les checklists avec filtres
```
GET /icm-checklists?coordinationId=1&month=4&year=2026&status=Soumis&page=1&limit=10
```

### Récupérer une checklist
```
GET /icm-checklists/1
```

## 3. Données initiales - Questions ICM

Voici les questions ICM à créer en base de données:

```json
[
  {
    "label": "Entretiens mensuels individuels réalisés",
    "category": "RH",
    "periodicity": "Mensuel",
    "expectedProof": "Fiche d'entretien signée par les agents et le coordonnateur",
    "order": 1
  },
  {
    "label": "État de présence du personnel (Retard, Absence, maladie, congé...) – Recrutement & intégration",
    "category": "RH",
    "periodicity": "Hebdomadaire",
    "expectedProof": "Fichier signé / Rapport de pointage signé",
    "order": 2
  },
  {
    "label": "Réunion d'équipe tenue (animation d'équipe)",
    "category": "RH",
    "periodicity": "Mensuel",
    "expectedProof": "Compte-rendu signé",
    "order": 3
  },
  {
    "label": "État des véhicules",
    "category": "LOGISTIQUE",
    "periodicity": "Mensuel",
    "expectedProof": "Rapport + photos",
    "order": 4
  },
  {
    "label": "Gestion des consommables + stocks",
    "category": "LOGISTIQUE",
    "periodicity": "Mensuel",
    "expectedProof": "Fiche stock",
    "order": 5
  },
  {
    "label": "Trésorerie - Justification des dépenses",
    "category": "FINANCE",
    "periodicity": "Mensuel",
    "expectedProof": "Factures + bons de caisse",
    "order": 6
  },
  {
    "label": "Rapports administratifs",
    "category": "ADMINISTRATION",
    "periodicity": "Mensuel",
    "expectedProof": "Rapports signés",
    "order": 7
  }
]
```

## 4. Calcul du Score ICM

### Formule
```
ICM (%) = (Total des scores des tâches / Nombre total des tâches) × 100
```

### Règles de calcul
- **Tâche non réalisée**: scoreItem = 0
- **Tâche réalisée et conforme**: scoreItem = 1
- **Tâche réalisée partiellement conforme**: scoreItem = 0.5
- **Tâche réalisée non conforme**: scoreItem = 0

### Exemple
Si vous avez 10 tâches:
- 8 conformes (8 × 1 = 8)
- 1 partiellement conforme (1 × 0.5 = 0.5)
- 1 non réalisée (1 × 0 = 0)

**Total**: (8 + 0.5 + 0) / 10 × 100 = **85%**

## 5. Messages d'erreur courants

### Erreur 409 - Conflit
```json
{
  "statusCode": 409,
  "message": "Une checklist existe déjà pour cette coordination et cette période (4/2026).",
  "error": "Conflict"
}
```

### Erreur 400 - Mauvaise requête
```json
{
  "statusCode": 400,
  "message": "Seules les checklists en brouillon peuvent être modifiées.",
  "error": "Bad Request"
}
```

### Erreur 404 - Non trouvé
```json
{
  "statusCode": 404,
  "message": "Question ICM avec l'ID 999 non trouvée",
  "error": "Not Found"
}
```

## 6. Index SQL unique

Pour s'assurer qu'une seule checklist existe par coordination/mois/année:

```sql
CREATE UNIQUE INDEX IDX_ICM_CHECKLIST_UNIQUE 
ON icm_checklist (coordinationId, month, year) 
WHERE deletedAt IS NULL;
```

Cette contrainte est gérée automatiquement par la migration TypeORM.
