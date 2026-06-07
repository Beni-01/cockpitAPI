# API ICM - Obligations managériales

Documentation d'intégration frontend du module `ICM-TACHE`.

Cette API permet de :

- configurer les obligations managériales ;
- assigner une obligation à toutes les provinces ou à certaines provinces ;
- afficher les obligations par domaine ou par province ;
- suivre les statuts par coordination provinciale ;
- soumettre, valider ou retourner les livrables ;
- alimenter les écrans de dashboard ICM.

## 1. Informations générales

### URL de base

En développement :

```text
http://localhost:3000
```

Toutes les routes décrites ici commencent par :

```text
/icm-taches
```

La documentation Swagger du backend est disponible sur :

```text
http://localhost:3000/api/v1
```

### Authentification

Les contrôleurs sont documentés avec une authentification Bearer.

```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

L'activation effective de la protection dépend de la configuration des guards du
backend. Le frontend doit néanmoins être prêt à envoyer le token.

### Format des dates

Toutes les dates envoyées dans les payloads ou les query params utilisent le
format ISO :

```text
YYYY-MM-DD
```

Exemple :

```text
2026-06-30
```

## 2. Types et valeurs autorisées

### Périodicités

```ts
export type IcmPeriodicity =
  | 'Journalier'
  | 'Hebdomadaire'
  | 'Mensuel'
  | 'Trimestriel'
  | 'Semestriel'
  | 'Annuel';
```

### Portée de l'assignation

```ts
export type IcmAssignmentScope =
  | 'ALL_PROVINCES'
  | 'SPECIFIC_PROVINCES';
```

- `ALL_PROVINCES` : la tâche concerne toutes les coordinations provinciales.
- `SPECIFIC_PROVINCES` : seules les provinces contenues dans
  `provincesAssignees` sont concernées.

### Statuts d'un livrable

```ts
export type IcmTacheLivrableStatus =
  | 'NON_SOUMIS'
  | 'SOUMIS'
  | 'VALIDE'
  | 'RETOURNE';
```

| Statut | Signification |
|---|---|
| `NON_SOUMIS` | Aucun livrable n'a encore été transmis |
| `SOUMIS` | Le livrable attend une validation |
| `VALIDE` | Le livrable a été validé |
| `RETOURNE` | Le livrable doit être corrigé et renvoyé |

## 3. Interfaces TypeScript recommandées

```ts
export interface IcmTache {
  id: number;
  domaine: string;
  tacheManageriale: string;
  description: string | null;
  livrableAttendu: string;
  periodicite: IcmPeriodicity;
  dateDebut: string;
  dateLimite: string;
  porteeAssignation: IcmAssignmentScope;
  provincesAssignees: string[] | null;
  instructionsSpecifiques: string | null;
  ordre: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface IcmTacheLivrable {
  id: number;
  tacheId: number;
  coordinationId: number;
  status: IcmTacheLivrableStatus;
  nomFichier: string;
  urlFichier: string;
  commentaire: string | null;
  soumisPar: number | null;
  soumisLe: string;
  traitePar: number | null;
  traiteLe: string | null;
  motifRetour: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface IcmCoordinationStatus {
  coordinationId: number;
  coordination: string;
  province: string;
  status: IcmTacheLivrableStatus;
  livrableId: number | null;
  nomFichier: string | null;
  urlFichier: string | null;
  motifRetour: string | null;
  soumisLe: string | null;
  traiteLe: string | null;
}
```

## 4. Client Next.js minimal

```ts
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token =
    typeof window !== 'undefined'
      ? localStorage.getItem('accessToken')
      : null;

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(
      error?.message ?? `Erreur HTTP ${response.status}`,
    );
  }

  return response.json() as Promise<T>;
}
```

Pour les Server Components, le token doit être lu depuis les cookies ou la
session côté serveur, pas depuis `localStorage`.

---

# 5. Configuration des obligations

## 5.1 Créer une tâche ICM

```http
POST /icm-taches
```

### Payload pour toutes les provinces

```json
{
  "domaine": "Ressources Humaines",
  "tacheManageriale": "Entretiens mensuels réalisés",
  "description": "Chaque coordonnateur doit réaliser et documenter les entretiens individuels.",
  "livrableAttendu": "Fiche d'entretien individuel",
  "periodicite": "Mensuel",
  "dateDebut": "2026-06-01",
  "dateLimite": "2026-06-30",
  "porteeAssignation": "ALL_PROVINCES",
  "instructionsSpecifiques": "Utiliser le modèle officiel DCP.",
  "ordre": 1,
  "isActive": true
}
```

### Payload pour certaines provinces

```json
{
  "domaine": "Finances",
  "tacheManageriale": "Justification des dépenses",
  "description": "Transmettre les pièces justificatives des dépenses.",
  "livrableAttendu": "Rapport financier",
  "periodicite": "Mensuel",
  "dateDebut": "2026-06-01",
  "dateLimite": "2026-06-15",
  "porteeAssignation": "SPECIFIC_PROVINCES",
  "provincesAssignees": [
    "Kinshasa",
    "Haut-Katanga"
  ],
  "instructionsSpecifiques": "Joindre les factures et les bons de commande.",
  "ordre": 2
}
```

### Règles métier

- `domaine`, `tacheManageriale`, `livrableAttendu`, `periodicite`,
  `dateDebut` et `dateLimite` sont obligatoires.
- `dateLimite` doit être supérieure ou égale à `dateDebut`.
- Pour `ALL_PROVINCES`, `provincesAssignees` est automatiquement enregistré à
  `null`.
- Pour `SPECIFIC_PROVINCES`, au moins une province est obligatoire.
- Les provinces doivent exister dans les coordinations provinciales du backend.
- `ordre` vaut `1` par défaut.
- `isActive` vaut `true` par défaut.

### Réponse

Statut HTTP :

```text
201 Created
```

Le backend retourne la tâche créée avec son `id` et ses timestamps.

## 5.2 Lister toutes les tâches

```http
GET /icm-taches
```

### Query params

| Paramètre | Type | Obligatoire | Description |
|---|---:|---:|---|
| `domaine` | string | Non | Filtre exact par domaine |
| `periodicite` | enum | Non | Filtre par périodicité |
| `search` | string | Non | Recherche dans la tâche, le domaine et le livrable |
| `isActive` | boolean | Non | `true` ou `false` |
| `page` | number | Non | Défaut : `1` |
| `limit` | number | Non | Défaut : `10`, maximum : `100` |

### Exemple

```http
GET /icm-taches?domaine=Finances&periodicite=Mensuel&isActive=true&page=1&limit=20
```

### Réponse

```json
{
  "data": [
    {
      "id": 2,
      "domaine": "Finances",
      "tacheManageriale": "Justification des dépenses",
      "description": "Transmettre les pièces justificatives.",
      "livrableAttendu": "Rapport financier",
      "periodicite": "Mensuel",
      "dateDebut": "2026-06-01",
      "dateLimite": "2026-06-15",
      "porteeAssignation": "SPECIFIC_PROVINCES",
      "provincesAssignees": ["Kinshasa", "Haut-Katanga"],
      "instructionsSpecifiques": null,
      "ordre": 2,
      "isActive": true
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 20,
  "totalPages": 1
}
```

## 5.3 Récupérer une tâche

```http
GET /icm-taches/:id
```

Exemple :

```http
GET /icm-taches/2
```

Réponse : un objet `IcmTache`.

## 5.4 Modifier une tâche

```http
PATCH /icm-taches/:id
```

Tous les champs sont optionnels.

```json
{
  "dateLimite": "2026-06-20",
  "instructionsSpecifiques": "Ajouter la signature du coordonnateur.",
  "ordre": 3
}
```

Les mêmes validations que lors de la création sont appliquées.

## 5.5 Activer ou désactiver une tâche

```http
PATCH /icm-taches/:id/toggle-status
```

Aucun body n'est nécessaire.

Le backend inverse automatiquement `isActive`.

## 5.6 Supprimer une tâche

```http
DELETE /icm-taches/:id
```

La suppression est logique : le champ `deletedAt` est renseigné.

```json
{
  "message": "Tâche ICM supprimée avec succès"
}
```

---

# 6. Options et listes du formulaire

## 6.1 Options complètes

```http
GET /icm-taches/form-options
```

### Réponse

```json
{
  "domaines": [
    "Administration",
    "Autres",
    "Finances",
    "Gouvernance",
    "Logistique",
    "Patrimoine",
    "Ressources Humaines",
    "Sécurité"
  ],
  "livrables": [
    "Rapport",
    "Compte rendu",
    "Procès-verbal",
    "Fiche de suivi",
    "Pièce justificative"
  ],
  "periodicites": [
    "Hebdomadaire",
    "Mensuel",
    "Trimestriel",
    "Semestriel",
    "Annuel",
    "Journalier"
  ],
  "porteesAssignation": [
    "ALL_PROVINCES",
    "SPECIFIC_PROVINCES"
  ],
  "provinces": [
    "Haut-Katanga",
    "Kinshasa",
    "Kongo Central"
  ]
}
```

Utiliser cet endpoint pour initialiser les listes déroulantes du formulaire de
création ou de modification.

## 6.2 Liste des provinces

```http
GET /icm-taches/provinces
```

La réponse fusionne :

- les provinces présentes dans la table des coordinations ;
- les provinces déjà enregistrées dans `provincesAssignees`.

Les doublons sont supprimés et la liste est triée.

```json
[
  "Haut-Katanga",
  "Kinshasa",
  "Kongo Central"
]
```

---

# 7. Recherche métier

## 7.1 Tâches actives par domaine

```http
GET /icm-taches/par-domaine/:domaine
```

Exemple avec encodage URL :

```ts
const domaine = encodeURIComponent('Ressources Humaines');

const taches = await apiFetch<IcmTache[]>(
  `/icm-taches/par-domaine/${domaine}`,
);
```

La réponse est un tableau de tâches actives triées par `ordre`, puis par
`tacheManageriale`.

## 7.2 Tâches et statistiques par province

```http
GET /icm-taches/par-province/:province
```

Exemple :

```ts
const province = encodeURIComponent('Haut-Katanga');

const result = await apiFetch<IcmProvinceResponse>(
  `/icm-taches/par-province/${province}`,
);
```

L'endpoint inclut :

- les tâches où la province est dans `provincesAssignees` ;
- les tâches configurées avec `ALL_PROVINCES` ;
- les coordinations appartenant à la province ;
- le statut et le livrable de chaque coordination ;
- les statistiques pour les cartes « Mes tâches ».

### Type frontend

```ts
export interface IcmProvinceTask extends IcmTache {
  status: IcmTacheLivrableStatus;
  statutsCoordination: IcmCoordinationStatus[];
}

export interface IcmProvinceResponse {
  province: string;
  coordinations: Array<{
    id: number;
    nom: string;
    province: string;
  }>;
  stats: {
    assignees: number;
    enAttente: number;
    soumis: number;
    valides: number;
    retournes: number;
  };
  data: IcmProvinceTask[];
}
```

### Exemple de réponse

```json
{
  "province": "Haut-Katanga",
  "coordinations": [
    {
      "id": 4,
      "nom": "Coordination Provinciale du Haut-Katanga",
      "province": "Haut-Katanga"
    }
  ],
  "stats": {
    "assignees": 3,
    "enAttente": 1,
    "soumis": 1,
    "valides": 1,
    "retournes": 0
  },
  "data": [
    {
      "id": 1,
      "domaine": "Ressources Humaines",
      "tacheManageriale": "Entretiens mensuels réalisés",
      "periodicite": "Mensuel",
      "status": "VALIDE",
      "statutsCoordination": [
        {
          "coordinationId": 4,
          "coordination": "Coordination Provinciale du Haut-Katanga",
          "province": "Haut-Katanga",
          "status": "VALIDE",
          "livrableId": 12,
          "nomFichier": "entretiens-mai.pdf",
          "urlFichier": "https://storage.example/entretiens-mai.pdf",
          "motifRetour": null,
          "soumisLe": "2026-06-10T08:00:00.000Z",
          "traiteLe": "2026-06-11T09:00:00.000Z"
        }
      ]
    }
  ]
}
```

### Calcul du statut d'une tâche dans une province

Lorsqu'une province possède plusieurs coordinations :

1. si toutes les coordinations sont `VALIDE`, la tâche est `VALIDE` ;
2. si au moins une coordination est `RETOURNE`, la tâche est `RETOURNE` ;
3. sinon, si au moins une coordination est `SOUMIS`, la tâche est `SOUMIS` ;
4. sinon, la tâche est `NON_SOUMIS`.

Pour les cartes :

- `assignees` : nombre de tâches assignées à la province ;
- `soumis` : nombre de tâches dont le statut calculé est `SOUMIS` ;
- `valides` : nombre de tâches dont le statut calculé est `VALIDE` ;
- `enAttente` : tâches `NON_SOUMIS` ou `RETOURNE` ;
- `retournes` : détail supplémentaire des tâches retournées.

---

# 8. Dashboard national et par coordination

## 8.1 Récupérer le dashboard

```http
GET /icm-taches/dashboard
```

### Query params

| Paramètre | Type | Description |
|---|---:|---|
| `coordinationId` | number | Limite le dashboard à une coordination |
| `domaine` | string | Filtre exact par domaine |
| `dateDebut` | date | Garde les tâches dont l'échéance atteint la période |
| `dateFin` | date | Garde les tâches ayant commencé avant la fin |
| `search` | string | Recherche dans la tâche, la description et le livrable |

### Exemple

```http
GET /icm-taches/dashboard?coordinationId=4&domaine=Finances&dateDebut=2026-06-01&dateFin=2026-06-30
```

### Type frontend simplifié

```ts
export interface IcmProgression {
  total: number;
  traites: number;
  soumis: number;
  valides: number;
  retournes: number;
  nonSoumis: number;
  pourcentageTraite: number;
}

export interface IcmDashboardObligation {
  id: number;
  domaine: string;
  periodicite: IcmPeriodicity;
  tacheManageriale: string;
  description: string | null;
  livrableAttendu: string;
  dateDebut: string;
  dateLimite: string;
  porteeAssignation: IcmAssignmentScope;
  provincesAssignees: string[] | null;
  instructionsSpecifiques: string | null;
  echeanceDepassee: boolean;
  progression: IcmProgression;
  statutsCoordination: IcmCoordinationStatus[];
}

export interface IcmDashboardResponse {
  synthese: {
    obligationsCreees: number;
    affectations: number;
    livrablesSoumis: number;
    valides: number;
    enAttente: number;
    retournes: number;
    nonSoumis: number;
  };
  filtres: {
    coordinationId: number | null;
    domaine: string | null;
    dateDebut: string | null;
    dateFin: string | null;
  };
  domaines: Array<{
    nom: string;
    total: number;
  }>;
  coordinations: Array<{
    id: number;
    nom: string;
    province: string;
  }>;
  obligations: IcmDashboardObligation[];
}
```

### Exemple de réponse abrégée

```json
{
  "synthese": {
    "obligationsCreees": 5,
    "affectations": 25,
    "livrablesSoumis": 10,
    "valides": 4,
    "enAttente": 4,
    "retournes": 2,
    "nonSoumis": 15
  },
  "filtres": {
    "coordinationId": null,
    "domaine": null,
    "dateDebut": null,
    "dateFin": null
  },
  "domaines": [
    { "nom": "Ressources Humaines", "total": 1 },
    { "nom": "Finances", "total": 1 }
  ],
  "coordinations": [
    {
      "id": 4,
      "nom": "Coordination Provinciale du Haut-Katanga",
      "province": "Haut-Katanga"
    }
  ],
  "obligations": []
}
```

### Mapping vers l'interface d'administration

- Cartes du haut : `response.synthese`.
- Onglets des domaines : `response.domaines`.
- Filtre coordination : `response.coordinations`.
- Cartes des obligations : `response.obligations`.
- Barre de progression : `obligation.progression`.
- Badges par coordination : `obligation.statutsCoordination`.
- Alerte rouge : `obligation.echeanceDepassee`.

---

# 9. Livrables d'une obligation

## 9.1 Voir les statuts et livrables

```http
GET /icm-taches/:id/livrables
```

Cet endpoint sert notamment au bouton « Livrables » d'une obligation.

### Réponse

```json
{
  "tache": {
    "id": 1,
    "domaine": "Ressources Humaines",
    "tacheManageriale": "Entretiens mensuels réalisés"
  },
  "progression": {
    "total": 5,
    "traites": 3,
    "soumis": 1,
    "valides": 1,
    "retournes": 1,
    "nonSoumis": 2,
    "pourcentageTraite": 60
  },
  "data": [
    {
      "coordination": {
        "id": 4,
        "nom": "Coordination Provinciale du Haut-Katanga",
        "province": "Haut-Katanga"
      },
      "status": "VALIDE",
      "livrable": {
        "id": 12,
        "tacheId": 1,
        "coordinationId": 4,
        "status": "VALIDE",
        "nomFichier": "entretiens-mai.pdf",
        "urlFichier": "https://storage.example/entretiens-mai.pdf"
      }
    },
    {
      "coordination": {
        "id": 5,
        "nom": "Coordination Provinciale de Kinshasa",
        "province": "Kinshasa"
      },
      "status": "NON_SOUMIS",
      "livrable": null
    }
  ]
}
```

Les coordinations sans enregistrement de livrable sont retournées avec
`NON_SOUMIS`.

## 9.2 Soumettre un livrable

```http
POST /icm-taches/:id/livrables
```

`:id` est l'identifiant de la tâche.

### Payload

```json
{
  "coordinationId": 4,
  "nomFichier": "entretiens-mai-2026.pdf",
  "urlFichier": "https://storage.example/entretiens-mai-2026.pdf",
  "commentaire": "Document signé par les parties."
}
```

### Comportement

- Une première soumission crée le livrable.
- Une tâche doit être assignée à la coordination concernée.
- Une soumission a automatiquement le statut `SOUMIS`.
- Un livrable `RETOURNE` peut être corrigé et renvoyé par le même endpoint.
- Le renvoi remplace les informations du fichier et remet le statut à `SOUMIS`.
- Un livrable `VALIDE` ne peut plus être remplacé.
- Le backend récupère `soumisPar` depuis l'utilisateur authentifié lorsqu'il
  est disponible.

### Important concernant l'upload

Cet endpoint ne reçoit pas directement un fichier multipart.

Le frontend doit :

1. envoyer le fichier vers le service d'upload utilisé par le projet ;
2. récupérer son URL ou son chemin ;
3. appeler cet endpoint avec `nomFichier` et `urlFichier`.

## 9.3 Valider un livrable

```http
PATCH /icm-taches/livrables/:livrableId/validate
```

Aucun body n'est requis.

Seul un livrable `SOUMIS` peut être validé.

Le backend renseigne :

- `status: "VALIDE"` ;
- `traitePar` depuis l'utilisateur authentifié ;
- `traiteLe` avec la date courante.

## 9.4 Retourner un livrable

```http
PATCH /icm-taches/livrables/:livrableId/return
```

### Payload

```json
{
  "motifRetour": "Le rapport doit être signé avant validation."
}
```

Seul un livrable `SOUMIS` peut être retourné.

Le backend renseigne :

- `status: "RETOURNE"` ;
- `motifRetour` ;
- `traitePar` ;
- `traiteLe`.

---

# 10. Cycle de vie frontend

```text
NON_SOUMIS
    |
    | POST /icm-taches/:id/livrables
    v
SOUMIS
    |------------------------------|
    |                              |
    | PATCH .../validate           | PATCH .../return
    v                              v
VALIDE                         RETOURNE
                                  |
                                  | POST /icm-taches/:id/livrables
                                  v
                               SOUMIS
```

## Actions UI recommandées

| Statut | Bouton coordination | Boutons validation |
|---|---|---|
| `NON_SOUMIS` | « Soumettre » | Aucun |
| `SOUMIS` | « Voir le livrable » | « Valider », « Retourner » |
| `VALIDE` | « Voir le livrable » | Aucun |
| `RETOURNE` | « Corriger et renvoyer » | Aucun |

---

# 11. Exemple de service frontend

```ts
import type {
  IcmDashboardResponse,
  IcmProvinceResponse,
  IcmTache,
  IcmTacheLivrable,
} from './icm-types';

export const icmApi = {
  getFormOptions() {
    return apiFetch<{
      domaines: string[];
      livrables: string[];
      periodicites: IcmPeriodicity[];
      porteesAssignation: IcmAssignmentScope[];
      provinces: string[];
    }>('/icm-taches/form-options');
  },

  getProvinces() {
    return apiFetch<string[]>('/icm-taches/provinces');
  },

  getByProvince(province: string) {
    return apiFetch<IcmProvinceResponse>(
      `/icm-taches/par-province/${encodeURIComponent(province)}`,
    );
  },

  getDashboard(params: URLSearchParams) {
    return apiFetch<IcmDashboardResponse>(
      `/icm-taches/dashboard?${params.toString()}`,
    );
  },

  create(payload: Omit<IcmTache, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>) {
    return apiFetch<IcmTache>('/icm-taches', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  update(id: number, payload: Partial<IcmTache>) {
    return apiFetch<IcmTache>(`/icm-taches/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  submitLivrable(
    tacheId: number,
    payload: {
      coordinationId: number;
      nomFichier: string;
      urlFichier: string;
      commentaire?: string;
    },
  ) {
    return apiFetch<IcmTacheLivrable>(
      `/icm-taches/${tacheId}/livrables`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
    );
  },

  validateLivrable(livrableId: number) {
    return apiFetch<IcmTacheLivrable>(
      `/icm-taches/livrables/${livrableId}/validate`,
      { method: 'PATCH' },
    );
  },

  returnLivrable(livrableId: number, motifRetour: string) {
    return apiFetch<IcmTacheLivrable>(
      `/icm-taches/livrables/${livrableId}/return`,
      {
        method: 'PATCH',
        body: JSON.stringify({ motifRetour }),
      },
    );
  },
};
```

---

# 12. Gestion des erreurs

NestJS retourne généralement une erreur sous cette forme :

```json
{
  "statusCode": 400,
  "message": "La date limite doit être postérieure ou égale à la date de début.",
  "error": "Bad Request"
}
```

Erreurs métier possibles :

- province absente ou inconnue ;
- coordination inexistante ;
- tâche inexistante ;
- livrable inexistant ;
- date limite antérieure à la date de début ;
- tâche non assignée à la coordination ;
- absence de province avec `SPECIFIC_PROVINCES` ;
- tentative de remplacement d'un livrable validé ;
- validation ou retour d'un livrable qui n'est pas `SOUMIS`.

Le frontend doit afficher `message`, qui peut être une chaîne ou une liste de
messages de validation.

```ts
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Une erreur inattendue est survenue.';
}
```

---

# 13. Correspondance avec les écrans

## Écran « Gestion des obligations managériales »

Appel principal :

```http
GET /icm-taches/dashboard
```

Appels secondaires :

```http
GET /icm-taches/form-options
GET /icm-taches/:id/livrables
PATCH /icm-taches/livrables/:livrableId/validate
PATCH /icm-taches/livrables/:livrableId/return
```

## Écran « ICM - Mes tâches »

Appel principal :

```http
GET /icm-taches/par-province/:province
```

Les cartes utilisent :

```ts
response.stats.assignees;
response.stats.enAttente;
response.stats.soumis;
response.stats.valides;
```

La liste utilise :

```ts
response.data;
```

La soumission utilise :

```http
POST /icm-taches/:id/livrables
```

## Écran de création d'une obligation

Charger d'abord :

```http
GET /icm-taches/form-options
```

Puis enregistrer avec :

```http
POST /icm-taches
```

---

# 14. Migrations requises

Les tables utilisées sont :

- `icm_tache` ;
- `icm_tache_livrable`.

Avant l'intégration, exécuter les migrations du backend :

```bash
npm run migration:run
```

Les fichiers concernés sont :

```text
db/migrations/1779520000000-ADD_ICM_TACHE.ts
db/migrations/1779521000000-ADD_ICM_TACHE_LIVRABLE.ts
```

Sans ces migrations, les endpoints retourneront des erreurs SQL indiquant que
les tables n'existent pas.

---

# 15. Checklist d'intégration Next.js

- Configurer `NEXT_PUBLIC_API_URL`.
- Ajouter le client `apiFetch`.
- Déclarer les types TypeScript de cette documentation.
- Charger `/icm-taches/form-options` dans le formulaire.
- Encoder les domaines et provinces avec `encodeURIComponent`.
- Utiliser `/icm-taches/par-province/:province` pour « Mes tâches ».
- Utiliser `/icm-taches/dashboard` pour l'administration nationale.
- Uploader le fichier avant d'appeler l'endpoint de soumission.
- Rafraîchir les données après soumission, validation ou retour.
- Afficher les erreurs métier retournées par le backend.
- Ne jamais permettre de remplacer un livrable `VALIDE`.
- Traiter `RETOURNE` comme une tâche à corriger et renvoyer.
