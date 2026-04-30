# Module ICM Dashboard - Documentation Complète

## 📋 Vue d'ensemble

Le module ICM Dashboard est un système complet de synthèse et de suivi de l'Index de Conformité Managériale. Il permet aux coordonnateurs de visualiser:
- Le score national agrégé
- Les scores détaillés par coordination
- Les statistiques par statut de conformité
- Le consolidé détaillé des réponses
- La liste des checklists saisies

## 🏗️ Architecture

### Backend (NestJS)

```
src/icm/
├── controllers/
│   └── icm-dashboard.controller.ts      # 4 endpoints GET
├── services/
│   └── icm-dashboard.service.ts         # Logique métier + calculs
├── dto/
│   └── icm-dashboard-summary.dto.ts     # 8 DTOs de réponse
├── entities/
│   ├── icm-checklist.entity.ts
│   ├── icm-checklist-response.entity.ts
│   └── icm-question.entity.ts
├── enums/
│   ├── conformity-level.enum.ts
│   ├── checklist-status.enum.ts
│   └── ...
└── icm.module.ts                        # Configuration du module
```

### Frontend (Angular 14)

```
src/dashboard/
├── services/
│   └── icm-dashboard.service.ts         # Appels API REST
├── components/
│   └── icm-dashboard/
│       ├── icm-dashboard.component.ts   # Logique du composant
│       ├── icm-dashboard.component.html # Template
│       └── icm-dashboard.component.scss # Styles
```

## 🔌 Intégration Backend

### 1. Module Configuration

Le module `IcmModule` est déjà importé dans `AppModule`:

```typescript
import { IcmModule } from './icm/icm.module';

@Module({
  imports: [
    // ...
    IcmModule,
    // ...
  ],
})
export class AppModule {}
```

### 2. Endpoints Disponibles

#### GET /icm-dashboard/summary?month=4&year=2026

Retourne le résumé avec les cartes statistiques et le tableau de synthèse.

**Paramètres:**
- `month` (number, requis): Mois (1-12)
- `year` (number, requis): Année (ex: 2026)

**Réponse:** `IcmDashboardSummaryResponseDto`

#### GET /icm-dashboard/consolidated?month=4&year=2026

Retourne le consolidé détaillé de toutes les réponses.

**Réponse:** `IcmDashboardConsolidatedResponseDto`

#### GET /icm-dashboard/checklists?month=4&year=2026

Retourne la liste des checklists de la période.

**Réponse:** `IcmDashboardChecklistsResponseDto`

#### GET /icm-dashboard/periods

Retourne les périodes disponibles avec des données.

**Réponse:** `PeriodDto[]`

### 3. Logique Métier

#### Calcul du Score ICM

```typescript
Score ICM (%) = ((conformes + partielles × 0.5) / totalTâches) × 100
```

#### Statuts par Score

- **Management Solide**: score >= 85%
- **Acceptable**: 70% <= score < 85%
- **Faible**: score < 70%

#### Données Agrégées

- Les checklists considérées: statut "Validé" seulement
- Les réponses comptabilisées: toutes les réponses de checklists validées
- Agrégation nationale: somme de tous les compteurs

### 4. Gestion des Erreurs

**BadRequestException** (400):
- Paramètres month/year manquants
- Paramètres invalides

**InternalServerErrorException** (500):
- Erreurs de base de données
- Erreurs TypeORM QueryBuilder

## 🎨 Intégration Frontend

### 1. Module Configuration

Ajouter le service `IcmDashboardService` au dashboard module:

```typescript
import { IcmDashboardService } from './services/icm-dashboard.service';

@NgModule({
  declarations: [IcmDashboardComponent],
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    // ...
  ],
  providers: [IcmDashboardService],
})
export class DashboardModule {}
```

### 2. Déclaration du Composant

```typescript
import { IcmDashboardComponent } from './components/icm-dashboard/icm-dashboard.component';

@NgModule({
  declarations: [
    // ...
    IcmDashboardComponent,
  ],
})
export class DashboardModule {}
```

### 3. Routing

```typescript
const routes: Routes = [
  {
    path: 'icm',
    component: IcmDashboardComponent,
    data: { title: 'Module ICM - Dashboard' }
  },
];
```

### 4. Environnement

Configurer l'URL API dans `environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api'
};
```

## 📊 Exemples de Payloads

### GET /icm-dashboard/summary?month=4&year=2026

**Réponse (200 OK):**

```json
{
  "period": {
    "month": 4,
    "year": 2026,
    "label": "Avr 2026"
  },
  "nationalScore": 66,
  "nationalStatus": "Faible",
  "stats": {
    "managementSolide": 1,
    "acceptable": 1,
    "faible": 2
  },
  "rows": [
    {
      "coordinationId": 1,
      "coordinationName": "Nord-Kivu",
      "totalTasks": 7,
      "conformes": 7,
      "partielles": 0,
      "nonConformes": 0,
      "score": 100,
      "status": "Management Solide"
    },
    {
      "coordinationId": 2,
      "coordinationName": "Kinshasa",
      "totalTasks": 7,
      "conformes": 5,
      "partielles": 0,
      "nonConformes": 2,
      "score": 71,
      "status": "Acceptable"
    },
    {
      "coordinationId": 3,
      "coordinationName": "Haut-Katanga",
      "totalTasks": 7,
      "conformes": 4,
      "partielles": 1,
      "nonConformes": 2,
      "score": 64,
      "status": "Faible"
    },
    {
      "coordinationId": 4,
      "coordinationName": "Sud-Kivu",
      "totalTasks": 7,
      "conformes": 1,
      "partielles": 2,
      "nonConformes": 4,
      "score": 29,
      "status": "Faible"
    }
  ],
  "nationalRow": {
    "label": "Score national",
    "totalTasks": 28,
    "conformes": 17,
    "partielles": 3,
    "nonConformes": 8,
    "score": 66,
    "status": "Faible"
  }
}
```

### GET /icm-dashboard/consolidated?month=4&year=2026

**Réponse (200 OK):**

```json
{
  "period": {
    "month": 4,
    "year": 2026,
    "label": "Avr 2026"
  },
  "data": [
    {
      "coordinationName": "Nord-Kivu",
      "category": "RH",
      "question": "Entretiens mensuels individuels réalisés",
      "conformityLevel": "Conforme",
      "scoreItem": 1,
      "proofProvided": "https://bucket.s3.com/entretien-avril-2026.pdf",
      "comment": "Tous les entretiens ont été réalisés sans problème"
    },
    {
      "coordinationName": "Nord-Kivu",
      "category": "FINANCE",
      "question": "Rapprochement de caisse effectué",
      "conformityLevel": "Partiellement conforme",
      "scoreItem": 0.5,
      "proofProvided": "https://bucket.s3.com/rapprochement-avril-2026.pdf",
      "comment": "Quelques retards dans le rapprochement"
    },
    {
      "coordinationName": "Kinshasa",
      "category": "RH",
      "question": "Entretiens mensuels individuels réalisés",
      "conformityLevel": "Non conforme",
      "scoreItem": 0,
      "proofProvided": "-",
      "comment": "Entretiens non réalisés faute de disponibilité"
    }
  ],
  "total": 112
}
```

### GET /icm-dashboard/checklists?month=4&year=2026

**Réponse (200 OK):**

```json
{
  "period": {
    "month": 4,
    "year": 2026,
    "label": "Avr 2026"
  },
  "checklists": [
    {
      "checklistId": 1,
      "coordinationName": "Nord-Kivu",
      "month": 4,
      "year": 2026,
      "status": "Validé",
      "scoreICM": 100,
      "createdBy": "Jean Dupont",
      "createdAt": "2026-04-15T10:30:00Z",
      "validationStatus": "Validé par Admin User"
    },
    {
      "checklistId": 2,
      "coordinationName": "Kinshasa",
      "month": 4,
      "year": 2026,
      "status": "Validé",
      "scoreICM": 71,
      "createdBy": "Marie Yamata",
      "createdAt": "2026-04-16T14:45:00Z",
      "validationStatus": "Validé par Admin User"
    },
    {
      "checklistId": 3,
      "coordinationName": "Haut-Katanga",
      "month": 4,
      "year": 2026,
      "status": "Rejeté",
      "scoreICM": 0,
      "createdBy": "Pierre Kabuika",
      "createdAt": "2026-04-14T09:15:00Z",
      "validationStatus": "Rejeté: Preuves insuffisantes"
    },
    {
      "checklistId": 4,
      "coordinationName": "Sud-Kivu",
      "month": 4,
      "year": 2026,
      "status": "Brouillon",
      "scoreICM": 0,
      "createdBy": "Sophie Mwamba",
      "createdAt": "2026-04-17T11:20:00Z",
      "validationStatus": "Brouillon"
    }
  ],
  "total": 4
}
```

### GET /icm-dashboard/periods

**Réponse (200 OK):**

```json
[
  {
    "month": 4,
    "year": 2026,
    "label": "Avr 2026"
  },
  {
    "month": 3,
    "year": 2026,
    "label": "Mar 2026"
  },
  {
    "month": 2,
    "year": 2026,
    "label": "Fév 2026"
  }
]
```

### Erreur - BadRequestException (400)

```json
{
  "statusCode": 400,
  "message": "Les paramètres month et year sont requis",
  "error": "Bad Request"
}
```

### Erreur - InternalServerErrorException (500)

```json
{
  "statusCode": 500,
  "message": "Erreur lors de la récupération du résumé du dashboard ICM",
  "error": "Internal Server Error"
}
```

## 🎯 Features Frontend

### État du Composant

- **activeTab**: Onglet actuellement affiché (synthese|consolide|checklists)
- **selectedMonth/selectedYear**: Période sélectionnée
- **loading**: État de chargement par section
- **errors**: Gestion des erreurs par section
- **summary/consolidated/checklists**: Données du dashboard

### Interaction Utilisateur

- **Changement de période**: Sélection mois/année → Rechargement des données
- **Changement d'onglet**: Clic sur onglet → Chargement lazy des données
- **Rafraîchir**: Bouton recharge → Reset cache et rechargement
- **Nouvelle saisie**: Redirection vers formulaire de création

### Styles Conditionnels

- Cartes statistiques: Couleurs selon le statut
- Barres de progression: Codage couleur (vert/orange/rouge)
- Badges: Statuts avec couleurs distinctes
- Classes adaptatives: Design responsive

## 🔄 Flux de Données

```
Frontend (Angular)
    ↓
IcmDashboardService.getSummary(month, year)
    ↓
HTTP GET /icm-dashboard/summary?month=4&year=2026
    ↓
Backend (NestJS)
    ↓
IcmDashboardController.getSummary()
    ↓
IcmDashboardService.getSummary()
    ↓
TypeORM QueryBuilder
    ↓
MySQL Database
    ↓
Aggregation & Calculations
    ↓
IcmDashboardSummaryResponseDto
    ↓
HTTP Response 200 OK
    ↓
Frontend updates State
    ↓
Template renders Data
```

## 📱 Design Responsive

- **Desktop (> 1200px)**: 4 cartes stats côte à côte, tableau complet
- **Tablet (768-1200px)**: 2 cartes par ligne, tableau scrollable
- **Mobile (< 768px)**: 1 carte par ligne, tableaux minimifiés
- **Print**: Optimisé pour impression

## ✅ Checklist d'Intégration

### Backend
- [x] DTOs créés dans `src/icm/dto/icm-dashboard-summary.dto.ts`
- [x] Service implémenté dans `src/icm/services/icm-dashboard.service.ts`
- [x] Controller créé dans `src/icm/controllers/icm-dashboard.controller.ts`
- [x] Module mis à jour pour inclure le service et controller
- [x] Imports des entités TypeORM (Coordination)

### Frontend
- [x] Service Angular créé
- [x] Component TypeScript créé
- [x] Template HTML créé
- [x] Styles SCSS créés
- [ ] Module dashboard configure (à faire)
- [ ] Routes configurées (à faire)
- [ ] Environment.apiUrl configuré (à faire)
- [ ] FormsModule importé (à faire)

## 🚀 Démarrage Rapide

### Backend

```bash
# Vérifier que le module est chargé
npm run start:dev

# Les endpoints sont disponibles à:
# - GET http://localhost:3000/api/icm-dashboard/summary?month=4&year=2026
# - GET http://localhost:3000/api/icm-dashboard/consolidated?month=4&year=2026
# - GET http://localhost:3000/api/icm-dashboard/checklists?month=4&year=2026
# - GET http://localhost:3000/api/icm-dashboard/periods
```

### Frontend

```typescript
// Dans le composant qui utilise le dashboard
import { IcmDashboardComponent } from './components/icm-dashboard/icm-dashboard.component';

// Le composant charge automatiquement les données au ngOnInit
<app-icm-dashboard></app-icm-dashboard>
```

## 🔍 Tests

### Backend - cURL

```bash
# Synthèse
curl -X GET "http://localhost:3000/api/icm-dashboard/summary?month=4&year=2026" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Consolidé
curl -X GET "http://localhost:3000/api/icm-dashboard/consolidated?month=4&year=2026" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Checklists
curl -X GET "http://localhost:3000/api/icm-dashboard/checklists?month=4&year=2026" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Périodes
curl -X GET "http://localhost:3000/api/icm-dashboard/periods" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Postman

Importer dans Postman:
```json
{
  "info": { "name": "ICM Dashboard API" },
  "item": [
    {
      "name": "GET Summary",
      "request": {
        "method": "GET",
        "url": "{{baseUrl}}/icm-dashboard/summary?month=4&year=2026"
      }
    }
  ]
}
```

## 📝 Notes Importantes

1. **Données validées uniquement**: Le dashboard n'affiche que les checklists avec le statut "Validé"
2. **Calcul automatique**: Les scores sont calculés automatiquement basés sur les réponses
3. **Performance**: Les requêtes utilisent TypeORM QueryBuilder pour optimiser les performances
4. **Periods cachées**: Les périodes sans données validées n'apparaissent pas
5. **Design copie-coller**: Code prêt à intégrer sans modifications majeure requises

## 🎯 Prochaines Étapes

1. Intégrer le composant dans le module Dashboard
2. Configurer les routes
3. Mettre à jour l'environment.apiUrl
4. Importer FormsModule
5. Tester les endpoints dans Swagger UI
6. Valider le rendu HTML/CSS
7. Tester les changements de période
8. Vérifier la gestion d'erreurs

## 📞 Support

- Voir les logs console Angular (F12)
- Voir les logs backend (npm run start:dev)
- Swagger UI: `http://localhost:3000/api/docs#/ICM%20-%20Dashboard`
