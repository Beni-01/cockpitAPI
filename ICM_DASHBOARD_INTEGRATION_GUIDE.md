# Guide d'Intégration ICM Dashboard - Étape par Étape

## 🎯 Objectif

Intégrer le composant ICM Dashboard dans votre application Angular 14 et tester les endpoints NestJS.

---

## ✅ Étape 1: Vérifier le Backend

### 1.1 Démarrer le serveur NestJS
```bash
cd /Users/mamp-beni/Documents/fonarev-projets/BACKEND/cockpit
npm run start:dev
```

**Résultat attendu:**
```
[Nest] 12345  - 04/30/2026, 10:30:15 AM     LOG [NestFactory] Starting Nest application...
...
[Nest] 12345  - 04/30/2026, 10:30:20 AM     LOG [InstanceLoader] IcmModule dependencies initialized +100ms
[Nest] 12345  - 04/30/2026, 10:30:20 AM     LOG Nest application successfully started
```

### 1.2 Vérifier Swagger UI
- Ouvrir: `http://localhost:3000/api/docs`
- Chercher la section "ICM - Dashboard"
- Vous devriez voir 4 endpoints:
  - `GET /icm-dashboard/summary`
  - `GET /icm-dashboard/consolidated`
  - `GET /icm-dashboard/checklists`
  - `GET /icm-dashboard/periods`

### 1.3 Tester les endpoints

**Tester dans Swagger:**
1. Cliquer sur `GET /icm-dashboard/summary`
2. Cliquer sur "Try it out"
3. Entrer: `month=4` et `year=2026`
4. Cliquer "Execute"
5. Vous devriez voir une réponse 200 avec les données

**Ou via cURL:**
```bash
curl -X GET "http://localhost:3000/api/icm-dashboard/summary?month=4&year=2026" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Accept: application/json"
```

**Résultat attendu:**
```json
{
  "period": { "month": 4, "year": 2026, "label": "Avr 2026" },
  "nationalScore": 66,
  "nationalStatus": "Faible",
  ...
}
```

---

## ✅ Étape 2: Préparer l'Environnement Frontend

### 2.1 Vérifier l'URL d'API

Fichier: `src/environments/environment.ts`

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api'  // ✓ S'assurer que c'est correct
};
```

Et pour la production: `src/environments/environment.prod.ts`

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://votre-api.com/api'  // À adapter
};
```

### 2.2 Vérifier les imports du Dashboard Module

Fichier: `src/dashboard/dashboard.module.ts`

**Ajouter ces imports:**
```typescript
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,  // ✓ IMPORTANT pour les appels HTTP
    // ... autres imports
  ],
})
export class DashboardModule { }
```

---

## ✅ Étape 3: Ajouter le Composant

### 3.1 Déclarer le composant

Fichier: `src/dashboard/dashboard.module.ts`

```typescript
import { IcmDashboardComponent } from './components/icm-dashboard/icm-dashboard.component';

@NgModule({
  declarations: [
    // ... autres composants
    IcmDashboardComponent,  // ✓ AJOUTER ICI
  ],
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
  ],
  providers: [IcmDashboardService],  // ✓ S'assurer que le service est fourni
})
export class DashboardModule { }
```

### 3.2 Configurer les routes

Fichier: `src/dashboard/dashboard-routing.module.ts` (ou où vous définissez vos routes)

```typescript
import { IcmDashboardComponent } from './components/icm-dashboard/icm-dashboard.component';

const routes: Routes = [
  {
    path: 'icm',  // Route: /dashboard/icm
    component: IcmDashboardComponent,
    data: { title: 'Module ICM - Dashboard' }
  },
  // ... autres routes
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }
```

### 3.3 Importer le service

Fichier: `src/dashboard/dashboard.module.ts`

```typescript
import { IcmDashboardService } from './services/icm-dashboard.service';

@NgModule({
  // ...
  providers: [
    IcmDashboardService,  // ✓ AJOUTER ICI
  ],
})
export class DashboardModule { }
```

---

## ✅ Étape 4: Utiliser le Composant dans une Page

### 4.1 Option A: Utiliser via routing

Naviguer vers `http://localhost:4200/dashboard/icm`

```typescript
// Dans un composant
import { Router } from '@angular/router';

constructor(private router: Router) { }

goToIcmDashboard() {
  this.router.navigate(['/dashboard/icm']);
}
```

### 4.2 Option B: Inclure directement dans un template

Fichier: `src/app/pages/dashboard/dashboard.component.html`

```html
<div class="dashboard-page">
  <app-icm-dashboard></app-icm-dashboard>
</div>
```

---

## ✅ Étape 5: Tester le Frontend

### 5.1 Démarrer l'application Angular

```bash
cd /Users/mamp-beni/Documents/fonarev-projets/FRONTEND  # Adapter le chemin
npm run start
# ou
ng serve --open
```

**Résultat attendu:**
- Application s'ouvre à `http://localhost:4200`
- Pas d'erreurs de compilation

### 5.2 Naviguer vers le dashboard ICM

1. Ouvrir DevTools (F12)
2. Onglet "Network"
3. Naviguer vers `/dashboard/icm`
4. Vérifier les requêtes HTTP:
   - `GET /api/icm-dashboard/periods` (Devrait voir du 200)
   - `GET /api/icm-dashboard/summary?month=X&year=Y` (Devrait voir du 200)

### 5.3 Vérifier la console Angular

DevTools → Console → Vérifier qu'il n'y a pas d'erreurs

**Erreurs courantes et solutions:**

| Erreur | Cause | Solution |
|--------|-------|----------|
| `Cannot find module 'IcmDashboardService'` | Import manquant | Vérifier l'import dans module |
| `Cannot find name 'environment'` | Import manquant | `import { environment } from 'src/environments/environment';` |
| `HTTP 401` | Token invalide | Vérifier l'authentification |
| `HTTP 400` | Paramètres invalides | Vérifier month/year dans DevTools Network |
| `HTTP 500` | Erreur serveur | Vérifier les logs backend |

---

## ✅ Étape 6: Valider le Rendu HTML

### 6.1 Vérifier les éléments du DOM

DevTools → Elements:
- [ ] Trouver `<app-icm-dashboard>`
- [ ] Vérifier qu'il contient les cartes statistiques
- [ ] Vérifier qu'il contient les onglets
- [ ] Vérifier qu'il contient les tableaux

### 6.2 Inspecter les styles

DevTools → Elements → Sélectionner une carte:
- [ ] Vérifier les couleurs
- [ ] Vérifier les shadows
- [ ] Vérifier le responsive layout

### 6.3 Vérifier les données

DevTools → Console:
```javascript
// Trouver le composant
ng.probe(document.querySelector('app-icm-dashboard')).componentInstance
// Affiche l'état du composant: { summary, consolidated, checklists, etc. }
```

---

## ✅ Étape 7: Tester les Interactions

### 7.1 Tester le changement de période

1. Ouvrir le select "Période"
2. Sélectionner une autre période
3. Vérifier que les données se rechargent
4. Vérifier dans DevTools Network la requête GET

### 7.2 Tester le changement d'onglet

1. Cliquer sur l'onglet "Consolidé détaillé"
2. Vérifier que les données se chargent
3. Vérifier dans DevTools Network que `GET .../consolidated` est appelé
4. Vérifier que le tableau change

### 7.3 Tester le bouton Rafraîchir

1. Cliquer sur le bouton ⟳
2. Vérifier que les données se rechargent
3. Vérifier qu'aucune erreur dans la console

### 7.4 Tester le bouton "Nouvelle saisie"

1. Cliquer sur "+ Nouvelle saisie"
2. Devrait naviguer vers le formulaire ICM (à implémenter si besoin)

---

## ✅ Étape 8: Tester le Design Responsive

### 8.1 Desktop (>1200px)

DevTools → F12 → Ctrl+Shift+M (ou icône mobile)
- Largeur: 1400px
- Vérifier: 4 cartes stats côte à côte
- Vérifier: Tableau complet visible

### 8.2 Tablet (768-1200px)

DevTools Responsive Mode:
- Largeur: 1024px
- Vérifier: Grille 2 colonnes
- Vérifier: Tableaux scrollables

### 8.3 Mobile (<768px)

DevTools Responsive Mode:
- Largeur: 375px
- Vérifier: Grille 1 colonne
- Vérifier: Bouton pleine largeur
- Vérifier: Tableaux minimifiés

---

## ✅ Étape 9: Tester la Gestion d'Erreurs

### 9.1 Simuler une erreur API

**Modifier temporairement le service:**
```typescript
getSummary(month: number, year: number) {
  // Forcer une erreur
  return this.http.get<IcmDashboardSummary>(
    `${this.apiUrl}/invalid-endpoint`
  );
}
```

**Résultat attendu:**
- Message d'erreur s'affiche
- Bouton "Réessayer" visible
- Pas de crash du composant

### 9.2 Tester avec des paramètres invalides

Backend (temporairement):
```typescript
getSummary(month: number, year: number) {
  // Pas de vérification, laisser le backend faire
  return this.icmDashboardService.getSummary(month, year);
}
```

Frontend, via console:
```javascript
// Forcer des valeurs invalides
ng.probe(document.querySelector('app-icm-dashboard')).componentInstance.loadSummary()
```

**Résultat attendu:**
- Erreur 400 gérée proprement
- Message utilisateur affiché

---

## ✅ Étape 10: Performance & Optimisation

### 10.1 Vérifier les performances

DevTools → Network:
1. Ouvrir le dashboard
2. Vérifier les temps de réponse:
   - `/periods` < 200ms
   - `/summary` < 500ms (selon volume de données)
   - `/consolidated` < 1000ms (plus de données)

### 10.2 Vérifier les appels non nécessaires

Ouvrir plusieurs fois le même onglet:
- Les données devraient être cachées (pas d'appel supplémentaire)
- Seul le premier appel à un onglet déclenche le chargement

### 10.3 Vérifier la mémoire

DevTools → Memory:
1. Ouvrir le dashboard
2. Prendre un snapshot (Heap Snapshot)
3. Naviguer vers un autre onglet, revenir
4. Prendre un autre snapshot
5. Comparer: pas de fuite mémoire (le composant unsubscribe correctement)

---

## ✅ Étape 11: Documentation & Code Review

### 11.1 Vérifier le code

- [ ] Pas de `console.log()` en production (sauf les erreurs)
- [ ] Pas de `any` types (utiliser les interfaces)
- [ ] RxJS properly unsubscribed (`takeUntil`)
- [ ] Erreurs gérées correctement
- [ ] Commentaires clairs et en français

### 11.2 Vérifier les conventions

- [ ] Noms de fichiers en kebab-case
- [ ] Noms de classes en PascalCase
- [ ] Noms de variables en camelCase
- [ ] Constantes en UPPER_SNAKE_CASE
- [ ] Structure de dossiers cohérente

---

## ✅ Étape 12: Déploiement

### 12.1 Build Production Backend

```bash
npm run build
# Vérifier que le build est sans erreur
ls dist/  # Vérifier la structure
```

### 12.2 Build Production Frontend

```bash
ng build --configuration production
# ou
npm run build:prod
```

### 12.3 Tester en Production

```bash
# Servir localement en prod
npm run build:prod
# Utiliser un serveur HTTP
python -m http.server 8000 --directory dist
# Ouvrir http://localhost:8000
```

---

## 🧪 Checklist de Tests

### Backend

- [ ] Module IcmDashboardService charge sans erreur
- [ ] Controller enregistré dans Swagger
- [ ] Endpoint `/icm-dashboard/summary` répond 200
- [ ] Endpoint `/icm-dashboard/consolidated` répond 200
- [ ] Endpoint `/icm-dashboard/checklists` répond 200
- [ ] Endpoint `/icm-dashboard/periods` répond 200
- [ ] Paramètres invalides (month=13) retournent 400
- [ ] Données complètes retournées avec tous les champs
- [ ] Calculs du score corrects
- [ ] Période formatée correctement (ex: "Avr 2026")

### Frontend

- [ ] Composant déclare sans erreur TypeScript
- [ ] Routes configurées et accessibles
- [ ] Service injecté correctement
- [ ] Composant charge au démarrage
- [ ] Cartes statistiques affichées
- [ ] Tableaux affichés correctement
- [ ] Changement de période recharge les données
- [ ] Changement d'onglet charge les nouvelles données
- [ ] Errors gérées et affichées
- [ ] Loading states affichés
- [ ] Design responsive fonctionne
- [ ] Barres de progression animées
- [ ] Couleurs statuts correctes

### Intégration

- [ ] Backend et Frontend communiquent
- [ ] Pas d'erreurs CORS
- [ ] Authentification fonctionne
- [ ] Données affichées correspondent aux données backend
- [ ] Performance acceptable
- [ ] Pas de fuite mémoire

---

## 📞 Troubleshooting

### Problème: HTTP 404 /api/icm-dashboard/summary

**Cause:** Module ICM non importé ou endpoint non enregistré

**Solution:**
```bash
# 1. Vérifier l'import dans app.module.ts
grep "IcmModule" src/app.module.ts

# 2. Vérifier les logs du backend au démarrage
npm run start:dev | grep -i "icm"

# 3. Vérifier Swagger
curl http://localhost:3000/api/docs
```

### Problème: HTTP 401 Unauthorized

**Cause:** Token JWT manquant ou invalide

**Solution:**
```typescript
// Frontend: S'assurer que le token est ajouté aux requêtes
// Ajouter un interceptor HTTP si manquant

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = localStorage.getItem('auth_token');
    if (token) {
      req = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` }
      });
    }
    return next.handle(req);
  }
}
```

### Problème: Tableau vide

**Cause:** Pas de données validées pour la période

**Solution:**
1. Vérifier dans la base de données qu'il existe des checklists validées
2. Vérifier que statut = "Validé"
3. Vérifier les logs backend pour les requêtes SQL

```sql
-- SQL de debug
SELECT COUNT(*) as total,
       checklist.status,
       checklist.month,
       checklist.year
FROM icm_checklist as checklist
GROUP BY checklist.status, checklist.month, checklist.year;
```

### Problème: Scores incorrects

**Cause:** Calcul du score incorrect

**Solution:**
1. Vérifier la formule: `(conformes + partielles*0.5) / total * 100`
2. Vérifier les valeurs dans la base de données
3. Ajouter un console.log dans le service pour déboguer

```typescript
private calculateScore(totalTasks: number, conformes: number, partielles: number): number {
  if (totalTasks === 0) return 0;
  const score = ((conformes + partielles * 0.5) / totalTasks) * 100;
  console.log(`Score calc: (${conformes} + ${partielles}*0.5) / ${totalTasks} * 100 = ${score}`);
  return Math.round(score);
}
```

---

## 🎉 Succès!

Si vous êtes arrivé jusqu'ici sans erreur, le dashboard ICM est correctement intégré et fonctionnel!

### Prochaines étapes optionnelles:

1. Ajouter le formulaire de création de checklist
2. Ajouter l'export en PDF/Excel
3. Ajouter les filtres avancés (par province, par catégorie)
4. Ajouter les notifications en temps réel
5. Ajouter les graphiques et visualisations
6. Ajouter l'audit trail des modifications
7. Ajouter le contrôle d'accès basé sur les rôles

---

## 📚 Ressources

- [Documentation ICM Dashboard complète](./ICM_DASHBOARD_DOCUMENTATION.md)
- [Récapitulatif des fichiers](./ICM_DASHBOARD_RECAP.md)
- [Angular 14 Docs](https://angular.io/docs)
- [NestJS Docs](https://docs.nestjs.com)
- [TypeORM Docs](https://typeorm.io)
