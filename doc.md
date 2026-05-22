# Documentation API Cockpit-360 - Style OpenAPI/Swagger 🚀

**Base URL:** `http://localhost:3000`  
**Version:** 1.0.0  
**Format:** JSON  

---

## 📋 Sommaire des Modules

| Module | Tag Swagger | Base Path |
|--------|-------------|-----------|
| Authentification | `auth` | `/auth` |
| Utilisateurs | `user` | `/user` |
| Activités | `Activité` | `/activity` |
| Sous-Activités | `SousActivity` | `/sous-activity` |
| Tableau de Bord | `Tableau de Bord (Tour de Contrôle)` | `/dashboard` |
| Trésorerie | `Trésorerie provinciale` | `/tresorerie` |
| Présence | `Suivi de Présence` | `/presence` |
| Coordinations | `Coordinations Provinciales` | `/coordination` |
| Antennes | `Antennes` | `/antenne` |
| Livrables | `livrable` | `/livrable` |
| Assignations | `Assignations utilisateurs ↔ sous-activités` | `/user-activities-assignment` |
| Chat | `Chat Collaboratif (Sous-activités)` | `/chat-sous-activity` |
| Demandes Prolongation | `Demande Prolongation` | `/demande-prolongation` |
| Performance | `Suivi des Performances` | `/performance` |
| SATVI | `SatVi - Satisfaction visiteurs` | `/satvi` |
| Audit & Logs | - | `/audit-log` |

---

## 📝 SATVI - Satisfaction visiteurs

Base path: `/satvi`

### Endpoints ajoutés

---

#### GET `/satvi?missionId={missionId}` - Lister les soumissions SATVI par mission
**Description:** Retourne les questionnaires SATVI filtrés par `missionId`, avec les filtres et la pagination déjà supportés par la liste globale.

**Query params:**
```text
missionId=1
page=1
limit=10
sortBy=createdAt
sortOrder=DESC
```

**Response 200:**
```json
{
  "data": [
    {
      "id": 12,
      "missionId": 1,
      "referenceCode": "SATVI-20260521-ABC123",
      "provinceVisitee": "Kinshasa",
      "directionMetier": "Coordination de Kinshasa",
      "evaluationAverage": 4.36,
      "scoreGlobal": 4.4,
      "questionCount": 19,
      "evaluationCount": 14,
      "status": "soumis"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalItems": 1,
    "totalPages": 1
  }
}
```

---

#### GET `/satvi/missions/{id}/soumissions` - Soumissions d'une mission SATVI
**Description:** Retourne la mission SATVI et ses soumissions paginées.

**Path params:**
```text
id=1
```

**Query params:**
```text
page=1
limit=10
sortBy=createdAt
sortOrder=DESC
```

**Response 200:**
```json
{
  "mission": {
    "id": 1,
    "referenceCode": "SATVI-M-20260521-A1B2C3",
    "titre": "Mission de suivi Kinshasa",
    "province": "Kinshasa",
    "evaluations": 3,
    "scoreMoyen": 4.2,
    "alertesActives": 0
  },
  "soumissions": {
    "data": [
      {
        "id": 12,
        "missionId": 1,
        "referenceCode": "SATVI-20260521-ABC123",
        "province": "Kinshasa",
        "directionTechnique": "Coordination de Kinshasa",
        "score": 4.4,
        "scoreLabel": "Bien",
        "statut": "OK",
        "status": "soumis"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "totalItems": 3,
      "totalPages": 1
    }
  }
}
```

---

#### GET `/satvi/missions/{id}/questionnaires` - Alias des soumissions d'une mission
**Description:** Alias de `/satvi/missions/{id}/soumissions`, utile si le front préfère le terme `questionnaires`.

**Response 200:** Même format que `GET /satvi/missions/{id}/soumissions`.

---

## 🔐 Authentification

Base path: `/auth`

### Schémas

#### AuthPayloadDto (Login)
```json
{
  "username": "string (required)",
  "password": "string (required)"
}
```

### Endpoints

---

#### POST `/auth/login` - Connexion utilisateur
**Description:** Connexion et génération de tokens JWT (access + refresh)

**Request Body:** `AuthPayloadDto`
```json
{
  "username": "jkabongo",
  "password": "motdepasse123"
}
```

**Response 200:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "jkabongo",
    "nom": "KABONGO",
    "prenom": "Jean",
    "email": "jkabongo@fonarev.cd"
  }
}
```

**Response 401:**
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

---

#### POST `/auth/refresh` - Rafraîchir le token
**Description:** Génère un nouveau access_token à partir du refresh_token

**Headers:**
```
Authorization: Bearer {refresh_token}
```

**Response 200:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

#### PATCH `/auth/update-password` - Mise à jour du mot de passe
**Description:** Modifie le mot de passe d'un utilisateur (authentification requise)

**Request Body:**
```json
{
  "username": "jkabongo",
  "oldPassword": "ancien_pass",
  "newPassword": "nouveau_pass"
}
```

**Response 200:**
```json
{
  "message": "Mot de passe mis à jour avec succès"
}
```

**Response 400:**
```json
{
  "statusCode": 400,
  "message": "Ancien mot de passe incorrect"
}
```

---

## 👥 Utilisateurs

Base path: `/user`

### Schémas

#### CreateUserDto
```json
{
  "nom": "string (required)",
  "postnom": "string (optional)",
  "prenom": "string (optional)",
  "sexe": "string (required) - M ou F",
  "telephone": "string (optional)",
  "directionId": "number (optional)",
  "directionGeneraleId": "number (optional)",
  "direction": "string (optional)",
  "fonction": "string (optional)",
  "grade": "string (optional)",
  "directeurId": "number (optional)",
  "agentDelegueId": "number (optional)",
  "username": "string (required) - unique",
  "isSupervisor": "boolean (optional) - default: false",
  "otp": "string (optional)",
  "password": "string (required)",
  "email": "string (required) - email valide",
  "isActive": "boolean (optional) - default: false",
  "signature": "string (optional)",
  "status": "boolean (optional) - default: true",
  "isSetPassword": "boolean (optional) - default: false"
}
```

### Endpoints

---

#### POST `/user` - Créer un utilisateur
**Request Body:** `CreateUserDto`
```json
{
  "nom": "KABONGO",
  "postnom": "MUSAMBA",
  "prenom": "Jean",
  "sexe": "M",
  "telephone": "+243 812 345 678",
  "username": "jkabongo",
  "password": "motdepasse123",
  "email": "jkabongo@fonarev.cd",
  "direction": "Informatique",
  "fonction": "Développeur",
  "isSupervisor": false,
  "isActive": true
}
```

**Response 201:**
```json
{
  "id": 1,
  "nom": "KABONGO",
  "username": "jkabongo",
  "email": "jkabongo@fonarev.cd",
  "createdAt": "2026-04-23T10:00:00Z"
}
```

---

#### POST `/user/import` - Importation massive
**Request Body:** `CreateUserDto[]` (tableau d'utilisateurs)
```json
[
  {
    "nom": "KABONGO",
    "username": "jkabongo",
    "email": "jkabongo@fonarev.cd",
    "password": "pass123",
    "sexe": "M"
  },
  {
    "nom": "MUKENDI",
    "username": "pmukendi",
    "email": "pmukendi@fonarev.cd",
    "password": "pass123",
    "sexe": "M"
  }
]
```

**Response 201:**
```json
{
  "created": 2,
  "failed": 0,
  "users": [...]
}
```

---

#### GET `/user` - Lister tous les utilisateurs
**Response 200:**
```json
[
  {
    "id": 1,
    "nom": "KABONGO",
    "prenom": "Jean",
    "username": "jkabongo",
    "email": "jkabongo@fonarev.cd",
    "direction": "Informatique",
    "isActive": true
  }
]
```

---

#### GET `/user/:id` - Détail utilisateur
**Path Parameters:**
- `id` (number, required) - ID de l'utilisateur

**Response 200:**
```json
{
  "id": 1,
  "nom": "KABONGO",
  "postnom": "MUSAMBA",
  "prenom": "Jean",
  "sexe": "M",
  "telephone": "+243 812 345 678",
  "username": "jkabongo",
  "email": "jkabongo@fonarev.cd",
  "direction": "Informatique",
  "fonction": "Développeur",
  "isSupervisor": false,
  "isActive": true,
  "createdAt": "2026-04-23T10:00:00Z"
}
```

---

#### GET `/user/agent/supervisor` - Liste des superviseurs
**Response 200:**
```json
[
  {
    "id": 2,
    "nom": "MUKENDI",
    "prenom": "Paul",
    "username": "pmukendi",
    "isSupervisor": true
  }
]
```

---

#### GET `/user/agent/enqueteur` - Liste des enquêteurs
**Response 200:** Liste d'utilisateurs avec rôle enquêteur

---

#### GET `/user/username/:username` - Recherche par username
**Path Parameters:**
- `username` (string, required)

**Response 200:** Objet User

**Response 404:**
```json
{
  "statusCode": 404,
  "message": "Utilisateur non trouvé"
}
```

---

#### GET `/user/status` - Vérifier statut connexion
**Headers:**
```
Authorization: Bearer {access_token}
```

**Response 200:** Informations de l'utilisateur connecté

---

#### PATCH `/user/update/:username` - Mettre à jour
**Path Parameters:**
- `username` (string, required)

**Request Body:** Partial `CreateUserDto` (champs à modifier)
```json
{
  "telephone": "+243 999 888 777",
  "fonction": "Senior Développeur"
}
```

**Response 200:** Utilisateur mis à jour

---

#### DELETE `/user/:id` - Supprimer (soft delete)
**Path Parameters:**
- `id` (number, required)

**Response 200:**
```json
{
  "message": "Utilisateur supprimé avec succès"
}
```

---

## 🏃 Activités

Base path: `/activity`

### Schémas

#### CreateActivityDto
```json
{
  "titre": "string (required)",
  "description": "string (optional)",
  "dateDebut": "string (optional) - YYYY-MM-DD",
  "dateFin": "string (optional) - YYYY-MM-DD",
  "deadlineRate": "number (optional)",
  "nbre_ressource": "number (optional)",
  "status": "string (optional)",
  "etat": "string (optional)",
  "direction": "string (optional)",
  "budget": "number (optional)",
  "livrable": "string (optional)",
  "typelivrable": "string (optional)",
  "userId": "number (required)",
  "subactivities": "CreateSousActivityDto[] (optional)",
  "dateFinReel": "string (optional)",
  "resultatObtenu": "string (optional)",
  "budgetConsomme": "number (optional)",
  "resultat": "string (optional)",
  "province": "string (optional)",
  "responsable": "string (optional)"
}
```

### Endpoints

---

#### POST `/activity` - Créer une activité
**Request Body:** `CreateActivityDto`
```json
{
  "titre": "Développement du module Trésorerie",
  "description": "Implémentation des fonctionnalités de gestion financière",
  "dateDebut": "2026-04-01",
  "dateFin": "2026-06-30",
  "status": "En cours",
  "etat": "Actif",
  "direction": "Informatique",
  "budget": 5000000,
  "livrable": "Module opérationnel",
  "typelivrable": "Application",
  "userId": 1,
  "province": "Kinshasa",
  "responsable": "John Doe"
}
```

**Response 201:**
```json
{
  "id": 5,
  "titre": "Développement du module Trésorerie",
  "description": "Implémentation des fonctionnalités de gestion financière",
  "dateDebut": "2026-04-01",
  "dateFin": "2026-06-30",
  "status": "En cours",
  "direction": "Informatique",
  "budget": 5000000,
  "userId": 1,
  "createdAt": "2026-04-23T10:00:00Z"
}
```

---

#### GET `/activity` - Lister toutes les activités
**Query Parameters:**
- `annee` (number, optional) - Filtre par année

**Response 200:**
```json
[
  {
    "id": 5,
    "titre": "Développement du module Trésorerie",
    "status": "En cours",
    "direction": "Informatique",
    "budget": 5000000,
    "userId": 1
  }
]
```

---

#### GET `/activity/dashboard` - Statistiques activités
**Query Parameters:**
- `dateDebut` (string, optional) - YYYY-MM-DD
- `dateFin` (string, optional) - YYYY-MM-DD
- `periode` (string, optional)
- `annee` (number, optional)

**Response 200:**
```json
{
  "totalActivites": 45,
  "enCours": 20,
  "terminees": 15,
  "enAttente": 10,
  "tauxAvancement": 65.5
}
```

---

#### GET `/activity/statut/dashboard` - Stats par statut
**Query Parameters:**
- `annee` (number, optional)

**Response 200:** Statistiques groupées par statut

---

#### GET `/activity/dashboard/echeances/:year` - Échéances par année
**Path Parameters:**
- `year` (number, required)

**Response 200:** Liste des activités avec échéances pour l'année

---

#### GET `/activity/dashboard/budget/:year` - Budget total
**Path Parameters:**
- `year` (number, required)

**Response 200:**
```json
{
  "totalBudget": 150000000,
  "budgetConsomme": 75000000,
  "tauxConsommation": 50
}
```

---

#### GET `/activity/direction` - Activités par direction
**Query Parameters:**
- `etat` (string, optional)
- `status` (string, optional)
- `responsable` (string, optional)
- `direction` (string, optional)
- `province` (string, optional)
- `titre` (string, optional)
- `page` (string, optional) - default: 1
- `limit` (string, optional) - default: 10
- `dateDebut` (string, optional)
- `dateFin` (string, optional)
- `annee` (number, optional)

**Response 200:**
```json
{
  "activites": {
    "Informatique": [...],
    "Finance": [...]
  },
  "totalCount": 45,
  "totalPages": 5,
  "hasNextPage": true,
  "hasPrevPage": false
}
```

---

#### GET `/activity/division` - Activités par division
**Query Parameters:** Mêmes filtres que `/direction`

**Response 200:**
```json
{
  "activites": {
    "Informatique": {
      "John Doe": [...],
      "Jane Smith": [...]
    }
  },
  "totalCount": 45,
  "totalPages": 5,
  "hasNextPage": true,
  "hasPrevPage": false
}
```

---

#### GET `/activity/etat/:etat` - Filtrer par état
**Path Parameters:**
- `etat` (string, required) - ex: "En cours", "Terminé", "En attente"

**Response 200:** Liste d'activités filtrées

---

#### GET `/activity/:id` - Détail d'une activité
**Path Parameters:**
- `id` (string, required)

**Response 200:**
```json
{
  "id": 5,
  "titre": "Développement du module Trésorerie",
  "description": "Implémentation des fonctionnalités de gestion financière",
  "dateDebut": "2026-04-01",
  "dateFin": "2026-06-30",
  "status": "En cours",
  "etat": "Actif",
  "direction": "Informatique",
  "budget": 5000000,
  "budgetConsomme": 2500000,
  "livrable": "Module opérationnel",
  "userId": 1,
  "province": "Kinshasa",
  "responsable": "John Doe",
  "subactivities": [...],
  "createdAt": "2026-04-23T10:00:00Z"
}
```

---

#### PATCH `/activity/:id` - Modifier une activité
**Path Parameters:**
- `id` (string, required)

**Query Parameters:**
- `idLivrable` (string, optional)

**Request Body:** Partial `CreateActivityDto`
```json
{
  "status": "Terminé",
  "budgetConsomme": 4500000,
  "resultat": "Module livré et testé"
}
```

**Response 200:** Activité mise à jour

---

#### DELETE `/activity/:id` - Supprimer une activité
**Path Parameters:**
- `id` (string, required)

**Response 200:**
```json
{
  "message": "Activité supprimée avec succès"
}
```

---

#### GET `/activity/all/actualisation` - Actualiser toutes
**Response 200:**
```json
{
  "message": "Toutes les activités ont été actualisées",
  "actualisees": 45
}
```

---

#### GET `/activity/one/actualisation/:id` - Actualiser une activité
**Path Parameters:**
- `id` (string, required)

**Response 200:** Activité actualisée

---

## 📝 Sous-Activités

Base path: `/sous-activity`

### Schémas

#### SousActivityAssignmentDto
```json
{
  "userId": "number (required)"
}
```

#### CreateSousActivityDto
```json
{
  "titre": "string (required)",
  "resultat": "string (required)",
  "province": "string (required)",
  "responsable": "string (required)",
  "autreService": "string (optional)",
  "debut": "string (optional)",
  "fin": "string (optional)",
  "indicateur": "string (optional)",
  "budget": "number (optional)",
  "budgetConsomme": "number (optional)",
  "observations": "string (optional)",
  "status": "string (optional)",
  "livrable": "string (optional)",
  "typelivrable": "string (optional)",
  "userId": "number (required)",
  "activityId": "number (optional)",
  "dateFinReel": "string (optional)",
  "resultatObtenu": "string (optional)",
  "deadlineRate": "number (optional)",
  "nbre_ressource": "number (optional)",
  "userActivitiesAssignments": "SousActivityAssignmentDto[] (optional)"
}
```

### Endpoints

---

#### POST `/sous-activity` - Créer une sous-activité
**Request Body:** `CreateSousActivityDto`
```json
{
  "titre": "Conception de la base de données",
  "resultat": "Schéma validé",
  "province": "Kinshasa",
  "responsable": "Jane Smith",
  "debut": "2026-04-01",
  "fin": "2026-04-15",
  "indicateur": "Achèvement à 100%",
  "budget": 1000000,
  "budgetConsomme": 800000,
  "status": "En cours",
  "livrable": "Script SQL",
  "typelivrable": "Document",
  "userId": 2,
  "activityId": 5,
  "userActivitiesAssignments": [
    { "userId": 3 },
    { "userId": 4 }
  ]
}
```

**Response 201:** Sous-activité créée avec assignations

---

#### POST `/sous-activity/post/many` - Création multiple
**Request Body:** `CreateSousActivityDto[]`
```json
[
  {
    "titre": "Tâche 1",
    "resultat": "Résultat 1",
    "province": "Kinshasa",
    "responsable": "User1",
    "userId": 1,
    "activityId": 5
  },
  {
    "titre": "Tâche 2",
    "resultat": "Résultat 2",
    "province": "Kinshasa",
    "responsable": "User2",
    "userId": 1,
    "activityId": 5
  }
]
```

**Response 201:** Tableau des sous-activités créées

---

#### GET `/sous-activity` - Lister toutes
**Response 200:** Liste de sous-activités

---

#### GET `/sous-activity/:id` - Détail
**Path Parameters:**
- `id` (string, required)

**Response 200:** Objet SousActivité

---

#### PATCH `/sous-activity/:id/:idActivity` - Mettre à jour
**Path Parameters:**
- `id` (string, required) - ID sous-activité
- `idActivity` (string, required) - ID activité parente

**Query Parameters:**
- `idLivrable` (string, optional)

**Request Body:** Partial `CreateSousActivityDto`

**Response 200:** Sous-activité mise à jour

---

#### DELETE `/sous-activity/:id` - Supprimer
**Path Parameters:**
- `id` (string, required)

**Response 200:** Confirmation de suppression

---

## 📊 Tableau de Bord

Base path: `/dashboard`

### Endpoints

---

#### GET `/dashboard/overview` - Données complètes du dashboard
**Description:** Agrège toutes les données pour le chargement initial du dashboard stratégique

**Response 200:**
```json
{
  "stats": { ... },
  "activities": { ... },
  "livrables": { ... },
  "finance": { ... },
  "alerts": { ... },
  "charroi": { ... },
  "projects": { ... },
  "risks": { ... },
  "forecasts": { ... },
  "efficiency": { ... },
  "governance": { ... },
  "liveFeed": { ... }
}
```

---

#### GET `/dashboard/stats` - Statistiques globales
**Response 200:**
```json
{
  "totalActivites": 45,
  "totalBudget": 150000000,
  "totalAgents": 120,
  "totalCoordinations": 26
}
```

---

#### GET `/dashboard/activities` - Aperçu activités
**Response 200:** Avancement des activités par coordination

---

#### GET `/dashboard/livrables` - Aperçu livrables
**Response 200:** Derniers livrables soumis

---

#### GET `/dashboard/finance` - Aperçu financier
**Response 200:** Consommation budgétaire

---

#### GET `/dashboard/alerts` - Alertes intelligentes
**Response 200:**
```json
[
  {
    "id": 1,
    "level": "critical",
    "message": "Dépassement de budget sur l'activité #5",
    "activityId": 5,
    "createdAt": "2026-04-23T10:00:00Z"
  }
]
```

---

#### GET `/dashboard/charroi` - Gestion parc automobile
**Response 200:** Statistiques du parc automobile

---

#### GET `/dashboard/projets-copir` - Projets COPIR
**Response 200:** Suivi des projets par direction

---

#### GET `/dashboard/risks` - Matrice des risques
**Response 200:** Activités critiques et risques

---

#### GET `/dashboard/forecasts` - Prévisions budgétaires
**Response 200:** Burn-rate et projections

---

#### GET `/dashboard/efficiency` - Index d'efficacité
**Response 200:** Performance des ressources

---

#### GET `/dashboard/governance` - Indice de gouvernance
**Response 200:** Activité d'audit et gouvernance

---

#### GET `/dashboard/live-feed` - Flux d'activité
**Response 200:** Chats et mises à jour en direct

---

## 💰 Trésorerie

Base path: `/tresorerie`

### Schémas

#### CreateTresorerieDto
```json
{
  "dateOperation": "string (required) - YYYY-MM-DD",
  "typeMouvement": "string (required) - 'entree' ou 'sortie'",
  "coordination": "string (required) - max 150 car",
  "motif": "string (required) - max 255 car",
  "referenceFed": "string (optional) - max 100 car",
  "beneficiaire": "string (optional) - max 200 car",
  "montant": "number (required) - positif",
  "soldeApres": "number (optional)",
  "devise": "string (optional) - default: 'FC'",
  "agentSaisi": "string (optional) - max 150 car",
  "observation": "string (optional)"
}
```

#### QueryTresorerieDto (Filtres)
```json
{
  "page": "number (optional) - default: 1",
  "limit": "number (optional) - default: 10",
  "coordination": "string (optional)",
  "typeMouvement": "string (optional) - 'entree' ou 'sortie'",
  "dateDebut": "string (optional) - YYYY-MM-DD",
  "dateFin": "string (optional) - YYYY-MM-DD",
  "search": "string (optional) - motif, ref, bénéficiaire"
}
```

### Endpoints

---

#### POST `/tresorerie` - Créer un mouvement
**Request Body:** `CreateTresorerieDto`

**Exemple - Entrée:**
```json
{
  "dateOperation": "2026-04-23",
  "typeMouvement": "entree",
  "coordination": "Kinshasa",
  "motif": "Dotation du budget provincial",
  "referenceFed": "FED-ENT-2026-04-001",
  "montant": 50000000,
  "devise": "FC",
  "agentSaisi": "Jean KABONGO",
  "observation": "Budget trimestriel"
}
```

**Exemple - Sortie:**
```json
{
  "dateOperation": "2026-04-23",
  "typeMouvement": "sortie",
  "coordination": "Kinshasa",
  "motif": "Frais de déplacement",
  "referenceFed": "FED-DEP-2026-04-002",
  "montant": 850000,
  "beneficiaire": "Transporteur ABC",
  "devise": "FC",
  "agentSaisi": "Jean KABONGO",
  "observation": "Mission terrain"
}
```

**Response 201:**
```json
{
  "id": 1,
  "dateOperation": "2026-04-23",
  "typeMouvement": "entree",
  "coordination": "Kinshasa",
  "motif": "Dotation du budget provincial",
  "referenceFed": "FED-ENT-2026-04-001",
  "montant": 50000000,
  "soldeApres": 50000000,
  "devise": "FC",
  "createdAt": "2026-04-23T10:00:00Z"
}
```

**Response 400 (Référence FED dupliquée):**
```json
{
  "statusCode": 400,
  "message": "La référence FED existe déjà"
}
```

---

#### GET `/tresorerie` - Lister les mouvements
**Query Parameters:** Voir `QueryTresorerieDto`

**Response 200:**
```json
{
  "data": [
    {
      "id": 1,
      "dateOperation": "2026-04-23",
      "typeMouvement": "entree",
      "coordination": "Kinshasa",
      "motif": "Dotation",
      "montant": 50000000,
      "soldeApres": 50000000
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalItems": 42,
    "totalPages": 5
  }
}
```

---

#### GET `/tresorerie/summary` - Résumé financier
**Query Parameters:**
- `coordination` (string, optional)
- `dateDebut` (string, optional) - YYYY-MM-DD
- `dateFin` (string, optional) - YYYY-MM-DD

**Response 200:**
```json
{
  "soldeCourant": 119880000,
  "totalEntrees": 130000000,
  "totalSorties": 10120000,
  "nombreMouvements": 13
}
```

---

#### GET `/tresorerie/synthese-par-coordination` - Synthèse par province
**Query Parameters:**
- `dateDebut` (string, optional)
- `dateFin` (string, optional)

**Response 200:**
```json
[
  {
    "coordination": "Haut-Katanga",
    "totalEntrees": 75000000,
    "totalSorties": 7800000,
    "solde": 67200000,
    "nombreMouvements": 7
  },
  {
    "coordination": "Nord-Kivu",
    "totalEntrees": 55000000,
    "totalSorties": 2320000,
    "solde": 52680000,
    "nombreMouvements": 6
  }
]
```

---

#### GET `/tresorerie/:id` - Détail d'un mouvement
**Path Parameters:**
- `id` (number, required)

**Response 200:** Objet TresorerieMouvement

**Response 404:**
```json
{
  "statusCode": 404,
  "message": "Mouvement introuvable"
}
```

---

#### PATCH `/tresorerie/:id` - Modifier un mouvement
**Path Parameters:**
- `id` (number, required)

**Request Body:** Partial `CreateTresorerieDto`

**Response 200:** Mouvement mis à jour

---

#### DELETE `/tresorerie/:id` - Supprimer (soft delete)
**Path Parameters:**
- `id` (number, required)

**Response 200:**
```json
{
  "message": "Mouvement supprimé avec succès"
}
```

---

#### PATCH `/tresorerie/:id/restore` - Restaurer un mouvement
**Path Parameters:**
- `id` (number, required)

**Response 200:**
```json
{
  "message": "Mouvement restauré avec succès"
}
```

---

## 📍 Présence

Base path: `/presence`

### Schémas

#### CheckInDto
```json
{
  "latitude": "number (required)",
  "longitude": "number (required)",
  "deviceInfo": "string (optional)",
  "commentaire": "string (optional)"
}
```

#### CheckOutDto
```json
{
  "latitude": "number (required)",
  "longitude": "number (required)",
  "commentaire": "string (optional)"
}
```

### Endpoints

---

#### POST `/presence/check-in` - Pointage arrivée
**Headers:**
```
Authorization: Bearer {access_token}
```

**Request Body:** `CheckInDto`
```json
{
  "latitude": -4.32142,
  "longitude": 15.31257,
  "deviceInfo": "iPhone 13, iOS 15.4",
  "commentaire": "Arrivée normale"
}
```

**Response 201:**
```json
{
  "id": 1,
  "userId": 5,
  "checkIn": "2026-04-23T08:00:00Z",
  "latitude": -4.32142,
  "longitude": 15.31257,
  "commentaire": "Arrivée normale"
}
```

---

#### POST `/presence/check-out` - Pointage départ
**Headers:**
```
Authorization: Bearer {access_token}
```

**Request Body:** `CheckOutDto`
```json
{
  "latitude": -4.32145,
  "longitude": 15.31259,
  "commentaire": "Journée terminée"
}
```

**Response 200:**
```json
{
  "id": 1,
  "userId": 5,
  "checkIn": "2026-04-23T08:00:00Z",
  "checkOut": "2026-04-23T17:00:00Z",
  "duree": "9h00"
}
```

---

#### GET `/presence/dashboard` - Stats globales présence
**Response 200:**
```json
{
  "totalCheckIns": 85,
  "totalCheckOuts": 72,
  "enCours": 13,
  "tauxPresence": 95.5
}
```

---

#### GET `/presence/summary` - Résumé mensuel
**Query Parameters:**
- `month` (number, required) - 1-12
- `year` (number, required)

**Response 200:**
```json
{
  "mois": 4,
  "annee": 2026,
  "joursTravailles": 22,
  "heuresTravaillees": 176,
  "retards": 2,
  "absences": 0,
  "details": [
    {
      "date": "2026-04-01",
      "checkIn": "08:00",
      "checkOut": "17:00",
      "duree": "9h00"
    }
  ]
}
```

---

## 🏢 Coordinations

Base path: `/coordination`

### Schémas

#### CreateCoordinationDto
```json
{
  "nom": "string (required)",
  "type": "string (required) - enum: RECOUVREMENT, ADMINISTRATIF, etc.",
  "province": "string (required)",
  "adresse": "string (optional)",
  "status": "string (optional) - enum: ACTIVE, INACTIVE",
  "coordonnateurNom": "string (optional)",
  "coordonnateurTelephone": "string (optional)",
  "coordonnateurEmail": "string (optional) - email",
  "effectifActuel": "number (optional) - min: 0",
  "effectifPrevu": "number (optional) - min: 0"
}
```

### Endpoints

---

#### POST `/coordination` - Créer une coordination
**Request Body:** `CreateCoordinationDto`
```json
{
  "nom": "Coordination Provinciale du Haut-Katanga",
  "type": "RECOUVREMENT",
  "province": "Haut-Katanga",
  "adresse": "Avenue Lumumba, n°45, Lubumbashi",
  "status": "ACTIVE",
  "coordonnateurNom": "Jean-Pierre Kabongo",
  "coordonnateurTelephone": "+243 812 345 678",
  "coordonnateurEmail": "jp.kabongo@fonarev.cd",
  "effectifActuel": 98,
  "effectifPrevu": 120
}
```

**Response 201:** Coordination créée

---

#### GET `/coordination` - Lister les coordinations
**Query Parameters:**
- `page` (number, optional) - default: 1
- `limit` (number, optional) - default: 10
- `search` (string, optional) - nom, province, coordonnateur
- `type` (enum, optional) - RECOUVREMENT, ADMINISTRATIF, etc.

**Response 200:** Liste paginée des coordinations

---

#### GET `/coordination/summary` - Résumé pour dashboard
**Response 200:** Stats pour les cartes coordinations

---

#### GET `/coordination/:id` - Détail
**Path Parameters:**
- `id` (number, required)

**Response 200:** Objet Coordination

---

#### PATCH `/coordination/:id` - Mettre à jour
**Path Parameters:**
- `id` (number, required)

**Request Body:** Partial `CreateCoordinationDto`

**Response 200:** Coordination mise à jour

---

#### DELETE `/coordination/:id` - Supprimer
**Path Parameters:**
- `id` (number, required)

**Response 204:** No Content

---

## 📡 Antennes

Base path: `/antenne`

### Endpoints

---

#### POST `/antenne` - Créer une antenne
**Request Body:**
```json
{
  "nom": "Antenne de Lubumbashi",
  "code": "ANT-LUB-001",
  "coordinationId": 1,
  "responsable": "Marie DILU",
  "telephone": "+243 999 888 777",
  "email": "lubumbashi@fonarev.cd",
  "adresse": "123 Boulevard du 30 Juin",
  "status": "ACTIVE"
}
```

---

#### GET `/antenne` - Lister les antennes
**Query Parameters:**
- `page` (number, optional)
- `limit` (number, optional)
- `search` (string, optional)
- `status` (enum, optional)
- `coordinationId` (number, optional)

---

#### GET `/antenne/summary` - Résumé par province
**Response 200:** Résumé des antennes

---

#### GET `/antenne/:id` - Détail
**Path Parameters:**
- `id` (number, required)

---

#### PATCH `/antenne/:id` - Mettre à jour
**Path Parameters:**
- `id` (number, required)

---

#### DELETE `/antenne/:id` - Supprimer
**Path Parameters:**
- `id` (number, required)

**Response 204:** No Content

---

## 📄 Livrables

Base path: `/livrable`

### Schémas

#### CreateLivrableDto
```json
{
  "livrable": "string (required)",
  "description": "string (optional)",
  "status": "string (optional) - default: 'En attente'",
  "responsable": "string (optional)",
  "dateLivraisonAttendue": "string (optional) - YYYY-MM-DD",
  "dateLivraisonReelle": "string (optional) - YYYY-MM-DD",
  "typelivrable": "string (optional)",
  "support": "string (optional)",
  "subActivityId": "number (optional)",
  "activityId": "number (optional)",
  "livrablefileName": "string (optional)",
  "dateValidationAttendue": "string (optional) - YYYY-MM-DD",
  "dateValidationReel": "string (optional) - YYYY-MM-DD",
  "livrableQuality": "number (optional)",
  "commentaire": "string (optional)"
}
```

### Endpoints

---

#### POST `/livrable` - Créer un livrable
**Request Body:** `CreateLivrableDto`
```json
{
  "livrable": "Rapport trimestriel Q1 2026",
  "description": "Synthèse des activités du premier trimestre",
  "status": "En cours",
  "responsable": "Paul MUKENDI",
  "dateLivraisonAttendue": "2026-04-30",
  "typelivrable": "Rapport",
  "support": "PDF",
  "activityId": 5,
  "livrablefileName": "rapport_q1_2026.pdf"
}
```

**Response 201:** Livrable créé

---

#### GET `/livrable` - Lister tous les livrables
**Response 200:** Liste de livrables

---

#### GET `/livrable/dashboard` - Stats par statut
**Response 200:**
```json
{
  "enCours": 15,
  "soumis": 8,
  "enAttente": 5,
  "valides": 12,
  "rejetes": 2
}
```

---

#### GET `/livrable/summary` - Résumé global
**Response 200:**
```json
{
  "total": 42,
  "soumis": 20,
  "enAttente": 15,
  "valides": 5,
  "rejetes": 2
}
```

---

#### GET `/livrable/dashboard/advanced` - Détaillé par direction
**Response 200:** Livrables groupés par direction avec statut et pourcentage

---

#### GET `/livrable/:id` - Détail
**Path Parameters:**
- `id` (string, required)

**Response 200:** Objet Livrable

---

#### PATCH `/livrable/:id` - Mettre à jour
**Path Parameters:**
- `id` (string, required)

**Request Body:** Partial `CreateLivrableDto`

---

#### DELETE `/livrable/:id` - Supprimer
**Path Parameters:**
- `id` (string, required)

---

## 🤝 Assignations Utilisateurs ↔ Sous-activités

Base path: `/user-activities-assignment`

### Schémas

#### CreateUserActivitiesAssignmentDto
```json
{
  "userId": "number (required)",
  "sousActivityId": "number (required)"
}
```

### Endpoints

---

#### POST `/user-activities-assignment` - Créer une assignation
**Request Body:** `CreateUserActivitiesAssignmentDto`
```json
{
  "userId": 3,
  "sousActivityId": 7
}
```

**Response 201:** Assignation créée

**Response 409 (Doublon):**
```json
{
  "statusCode": 409,
  "message": "Cette assignation existe déjà"
}
```

---

#### GET `/user-activities-assignment` - Lister les assignations
**Query Parameters:**
- `page` (number, optional) - default: 1
- `limit` (number, optional) - default: 10
- `userId` (number, optional)
- `sousActivityId` (number, optional)

**Response 200:**
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalItems": 25,
    "totalPages": 3
  }
}
```

---

#### GET `/user-activities-assignment/by-user/:userId` - Tâches d'un utilisateur
**Path Parameters:**
- `userId` (number, required)

**Response 200:** Liste des sous-activités assignées

---

#### GET `/user-activities-assignment/by-sous-activity/:sousActivityId` - Agents sur une tâche
**Path Parameters:**
- `sousActivityId` (number, required)

**Response 200:** Liste des utilisateurs assignés

---

#### GET `/user-activities-assignment/:id` - Détail assignation
**Path Parameters:**
- `id` (number, required)

---

#### PATCH `/user-activities-assignment/:id` - Mettre à jour
**Path Parameters:**
- `id` (number, required)

**Request Body:** Partial `CreateUserActivitiesAssignmentDto`

---

#### DELETE `/user-activities-assignment/:id` - Supprimer par ID
**Path Parameters:**
- `id` (number, required)

---

#### DELETE `/user-activities-assignment/pair/:userId/:sousActivityId` - Désassigner
**Path Parameters:**
- `userId` (number, required)
- `sousActivityId` (number, required)

**Response 200:**
```json
{
  "message": "Assignation supprimée avec succès"
}
```

---

## 💬 Chat & Collaboration

Base path: `/chat-sous-activity`

### Endpoints

---

#### POST `/chat-sous-activity/:sousActivityId` - Envoyer un message
**Path Parameters:**
- `sousActivityId` (number, required)

**Headers:**
```
Authorization: Bearer {access_token}
```

**Request Body:**
```json
{
  "message": "Le rapport est prêt pour révision",
  "resources": ["https://storage.com/doc1.pdf", "https://storage.com/doc2.pdf"],
  "isProgressUpdate": false
}
```

**Response 201:** Message créé

---

#### GET `/chat-sous-activity/:sousActivityId` - Historique du chat
**Path Parameters:**
- `sousActivityId` (number, required)

**Response 200:**
```json
[
  {
    "id": 1,
    "userId": 5,
    "sousActivityId": 7,
    "message": "Le rapport est prêt pour révision",
    "resources": [...],
    "isProgressUpdate": false,
    "createdAt": "2026-04-23T10:00:00Z",
    "user": {
      "nom": "KABONGO",
      "prenom": "Jean"
    }
  }
]
```

---

#### DELETE `/chat-sous-activity/:id` - Supprimer son message
**Path Parameters:**
- `id` (number, required)

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response 200:** Confirmation

---

## ⚠️ Demandes de Prolongation

Base path: `/demande-prolongation`

### Endpoints

---

#### POST `/demande-prolongation` - Créer une demande
**Request Body:**
```json
{
  "activityId": 5,
  "sousActivityId": 12,
  "dateEcheanceInitiale": "2026-04-30",
  "nouvelleDateEcheance": "2026-05-15",
  "motif": "Retard de livraison des matériaux",
  "status": "En attente",
  "demandeurId": 3
}
```

---

#### GET `/demande-prolongation` - Lister toutes
**Response 200:** Liste des demandes

---

#### GET `/demande-prolongation/dashboard` - Stats par statut
**Response 200:** Statistiques des demandes

---

#### GET `/demande-prolongation/dashboard/advanced` - Détaillé par direction
**Response 200:** Demandes groupées par direction

---

#### GET `/demande-prolongation/:id` - Détail
**Path Parameters:**
- `id` (string, required)

---

#### PATCH `/demande-prolongation/:id` - Mettre à jour
**Path Parameters:**
- `id` (string, required)

---

#### DELETE `/demande-prolongation/:id` - Supprimer
**Path Parameters:**
- `id` (string, required)

---

## 👤 Demandes Utilisateur

Base path: `/demande-user`

### Endpoints

---

#### POST `/demande-user` - Créer une demande
#### GET `/demande-user` - Lister toutes
#### GET `/demande-user/:id` - Détail
#### PATCH `/demande-user/:id` - Mettre à jour
#### DELETE `/demande-user/:id` - Supprimer

---

## 📈 Performance

Base path: `/performance`

### Endpoints

---

#### GET `/performance/global` - KPIs globaux
**Response 200:**
```json
{
  "tauxRealisation": 75.5,
  "tauxRespectDelais": 82.0,
  "tauxSatisfaction": 88.5,
  "productiviteGlobale": 80.0
}
```

---

#### GET `/performance/coordinations` - Classement des provinces
**Response 200:**
```json
[
  {
    "coordination": "Haut-Katanga",
    "score": 92.5,
    "rank": 1
  },
  {
    "coordination": "Kinshasa",
    "score": 88.0,
    "rank": 2
  }
]
```

---

## 🔍 Audit & Logs

Base path: `/audit-log`

### Endpoints

---

#### POST `/audit-log` - Créer un log
**Request Body:**
```json
{
  "tableName": "activity",
  "entityId": 5,
  "action": "UPDATE",
  "oldData": { "status": "En cours" },
  "newData": { "status": "Terminé" },
  "userId": 3
}
```

---

#### GET `/audit-log` - Lister les logs
**Query Parameters:**
- `table` (string, optional)
- `action` (string, optional)
- `userId` (number, optional)
- `entityId` (number, optional)

---

#### GET `/audit-log/log` - Journal complet
**Query Parameters:**
- `table` (string, optional)
- `userId` (number, optional)

---

#### GET `/audit-log/getLogById/:id` - Détail d'un log
**Path Parameters:**
- `id` (number, required)

---

#### DELETE `/audit-log/:id` - Supprimer un log
**Path Parameters:**
- `id` (number, required)

---

## 📝 Annotations Activités

Base path: `/annotation-activity`

### Endpoints

#### POST `/annotation-activity` - Créer
#### GET `/annotation-activity` - Lister
#### GET `/annotation-activity/:id` - Détail
#### PATCH `/annotation-activity/:id` - Mettre à jour
#### DELETE `/annotation-activity/:id` - Supprimer

---

## 👥 Utilisateurs-Livrables

Base path: `/user-livrable`

### Endpoints

#### POST `/user-livrable` - Créer association
#### GET `/user-livrable` - Lister
#### GET `/user-livrable/:id` - Détail
#### PATCH `/user-livrable/:id` - Mettre à jour
#### DELETE `/user-livrable/:id` - Supprimer

---

## 📋 Codes de Réponse HTTP

| Code | Description | Usage |
|------|-------------|-------|
| 200 | OK | Requête réussie (GET, PATCH, DELETE) |
| 201 | Created | Création réussie (POST) |
| 204 | No Content | Suppression réussie sans contenu retourné |
| 400 | Bad Request | Données invalides ou manquantes |
| 401 | Unauthorized | Authentification requise ou token invalide |
| 403 | Forbidden | Permissions insuffisantes |
| 404 | Not Found | Ressource non trouvée |
| 409 | Conflict | Conflit (doublon détecté) |
| 422 | Unprocessable Entity | Validation échouée |
| 500 | Internal Server Error | Erreur serveur |

---

---

## 🔔 Notifications

Base path: `/notification`

### Endpoints

---

#### GET `/notification` - Lister mes notifications
**Headers:**
```
Authorization: Bearer {access_token}
```
**Response 200:** Liste des notifications (Tags, Assignations, etc.)

---

#### PATCH `/notification/:id/read` - Marquer comme lue
**Path Parameters:**
- `id` (number, required)

---

#### PATCH `/notification/read-all` - Tout marquer comme lu
**Headers:**
```
Authorization: Bearer {access_token}
```

---

#### DELETE `/notification/:id` - Supprimer une notification
**Path Parameters:**
- `id` (number, required)

---

## 🔒 Authentification

Tous les endpoints (sauf `/auth/login`) nécessitent un token JWT dans le header:

```
Authorization: Bearer {access_token}
```

---

## 📌 Notes Importantes

### Types de données
- **Dates:** Format ISO 8601 `YYYY-MM-DD` ou `YYYY-MM-DDTHH:mm:ssZ`
- **Devise:** Franc Congolais (FC) par défaut
- **Montants:** Nombres décimaux avec max 2 décimales

### Pagination
Les endpoints listant des données supportent la pagination:
- `page` (default: 1)
- `limit` (default: 10, max: 100)

Réponse type:
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalItems": 100,
    "totalPages": 10
  }
}
```

### Soft Delete
Les suppressions sont logiques (soft delete) sauf indication contraire. Utilisez les endpoints `/restore` pour restaurer.

---

*Documentation API Cockpit-360 - Version 1.0.0 - Avril 2026*
