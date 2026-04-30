# Commandes & Tests Utiles - ICM Dashboard

## 🚀 Commandes de Démarrage

### Backend
```bash
# Démarrage en mode développement
cd /Users/mamp-beni/Documents/fonarev-projets/BACKEND/cockpit
npm run start:dev

# Build production
npm run build
npm run start:prod

# Voir les logs détaillés
npm run start:dev 2>&1 | tee backend.log
```

### Frontend
```bash
# Démarrage en mode développement
ng serve --open
# ou
npm run start

# Build production
ng build --configuration production
# ou
npm run build:prod

# Lint et format
npm run lint
npm run format
```

---

## 🧪 Tests via cURL

### Test 1: Récupérer les périodes disponibles
```bash
curl -X GET "http://localhost:3000/api/icm-dashboard/periods" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Accept: application/json" \
  -v
```

**Réponse attendue: 200 OK**
```json
[
  { "month": 4, "year": 2026, "label": "Avr 2026" },
  { "month": 3, "year": 2026, "label": "Mar 2026" }
]
```

---

### Test 2: Récupérer la synthèse
```bash
curl -X GET "http://localhost:3000/api/icm-dashboard/summary?month=4&year=2026" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Accept: application/json" \
  -v
```

**Réponse attendue: 200 OK** avec les cartes stats et tableau

---

### Test 3: Récupérer le consolidé
```bash
curl -X GET "http://localhost:3000/api/icm-dashboard/consolidated?month=4&year=2026" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Accept: application/json" \
  -v
```

**Réponse attendue: 200 OK** avec tous les détails

---

### Test 4: Récupérer les checklists
```bash
curl -X GET "http://localhost:3000/api/icm-dashboard/checklists?month=4&year=2026" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Accept: application/json" \
  -v
```

**Réponse attendue: 200 OK** avec la liste des checklists

---

### Test 5: Erreur - Paramètres invalides
```bash
curl -X GET "http://localhost:3000/api/icm-dashboard/summary" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Accept: application/json" \
  -v
```

**Réponse attendue: 400 Bad Request**
```json
{
  "statusCode": 400,
  "message": "Les paramètres month et year sont requis",
  "error": "Bad Request"
}
```

---

### Test 6: Enregistrer la réponse dans un fichier
```bash
curl -X GET "http://localhost:3000/api/icm-dashboard/summary?month=4&year=2026" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -o response.json

# Afficher le fichier
cat response.json | jq .
```

---

## 📊 Tests via Postman

### Créer une Collection Postman

1. Ouvrir Postman
2. Créer une nouvelle collection: "ICM Dashboard"
3. Ajouter les requêtes suivantes:

#### Request 1: Get Periods
```
Method: GET
URL: {{base_url}}/icm-dashboard/periods
Headers:
  - Authorization: Bearer {{token}}
  - Accept: application/json
```

#### Request 2: Get Summary
```
Method: GET
URL: {{base_url}}/icm-dashboard/summary?month=4&year=2026
Headers:
  - Authorization: Bearer {{token}}
  - Accept: application/json
```

#### Request 3: Get Consolidated
```
Method: GET
URL: {{base_url}}/icm-dashboard/consolidated?month=4&year=2026
Headers:
  - Authorization: Bearer {{token}}
  - Accept: application/json
```

#### Request 4: Get Checklists
```
Method: GET
URL: {{base_url}}/icm-dashboard/checklists?month=4&year=2026
Headers:
  - Authorization: Bearer {{token}}
  - Accept: application/json
```

### Configurer les Variables Postman

1. Aller à "Environments"
2. Créer un nouvel environnement "ICM Dashboard Development"
3. Ajouter les variables:
   ```
   base_url: http://localhost:3000/api
   token: YOUR_JWT_TOKEN_HERE
   month: 4
   year: 2026
   ```

4. Utiliser dans les URLs: `{{base_url}}/icm-dashboard/summary?month={{month}}&year={{year}}`

---

## 🔍 Tests dans Swagger UI

1. Ouvrir `http://localhost:3000/api/docs`
2. Chercher la section "ICM - Dashboard"
3. Chaque endpoint a un bouton "Try it out"
4. Entrer les paramètres et cliquer "Execute"
5. Voir la réponse 200 (ou l'erreur)

---

## 🧬 Tests de Debug

### Afficher les logs du service
```typescript
// Dans icm-dashboard.service.ts
async getSummary(month: number, year: number) {
  console.log('getSummary called with:', { month, year });
  
  try {
    const checklists = await this.checklistRepository...;
    console.log('Checklists found:', checklists.length);
    
    // ... calculs ...
    
    console.log('Result:', result);
    return result;
  } catch (error) {
    console.error('Error in getSummary:', error);
    throw error;
  }
}
```

### Afficher les requêtes HTTP (Frontend)
```typescript
// Ajouter un interceptor debug
@Injectable()
export class DebugHttpInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler) {
    console.log('HTTP Request:', req.method, req.url);
    return next.handle(req).pipe(
      tap(event => {
        if (event instanceof HttpResponse) {
          console.log('HTTP Response:', event.status, event.url);
        }
      }),
      catchError(error => {
        console.error('HTTP Error:', error);
        return throwError(() => error);
      })
    );
  }
}
```

---

## 📈 Tests de Performance

### Backend - Mesurer le temps de requête
```bash
# Utiliser time avec curl
time curl -X GET "http://localhost:3000/api/icm-dashboard/summary?month=4&year=2026" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -o /dev/null -s
```

**Résultat attendu:**
```
real    0m0.350s
user    0m0.020s
sys     0m0.010s
```

### Frontend - Utiliser Chrome DevTools Performance

1. Ouvrir DevTools (F12)
2. Aller à onglet "Performance"
3. Cliquer le bouton "Record"
4. Naviguer vers le dashboard ICM
5. Cliquer "Stop"
6. Analyser le timeline

**À chercher:**
- Temps de réponse API < 500ms
- Rendering < 16ms (60fps)
- Pas de "jank" ou retards

---

## 🔐 Tests de Sécurité

### Test 1: Sans token (401)
```bash
curl -X GET "http://localhost:3000/api/icm-dashboard/summary?month=4&year=2026" \
  -H "Accept: application/json"
```

**Réponse attendue: 401 Unauthorized**

---

### Test 2: Avec token invalide (401)
```bash
curl -X GET "http://localhost:3000/api/icm-dashboard/summary?month=4&year=2026" \
  -H "Authorization: Bearer invalid_token" \
  -H "Accept: application/json"
```

**Réponse attendue: 401 Unauthorized**

---

### Test 3: SQL Injection (devrait être safe)
```bash
curl -X GET "http://localhost:3000/api/icm-dashboard/summary?month=4' OR '1'='1&year=2026" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Réponse attendue:** Soit 400 (paramètre invalide) ou aucune injection (TypeORM parameterized queries)

---

## 🐛 Tests de Bugs Courants

### Test 1: Données null/undefined
```typescript
// Vérifier dans la console Angular que les données ne sont pas null
ng.probe(document.querySelector('app-icm-dashboard')).componentInstance.summary
// Résultat: Object (pas null)
```

### Test 2: Memory leak
```javascript
// Ouvrir plusieurs fois les onglets
// Prendre snapshot de la mémoire
// S'assurer qu'elle baisse après unsubscribe
```

### Test 3: Reload sans refresh requête
```
1. Ouvrir l'onglet "Synthèse"
2. Cliquer sur "Consolidé détaillé"
3. Revenir à "Synthèse"
4. Vérifier dans Network que GET /summary n'est appelé qu'une fois
```

---

## 📝 Logs à Chercher

### Backend OK
```
[Nest] xxxxx  - 04/30/2026, 10:30:20 AM     LOG [InstanceLoader] IcmModule dependencies initialized
[Nest] xxxxx  - 04/30/2026, 10:30:20 AM     LOG [RoutesResolver] AppController {/}: true
```

### Backend Erreur
```
Error: Cannot find entity IcmChecklist
Error: Connection to database failed
Error in getSummary: QueryFailedError
```

### Frontend OK (Network Tab)
```
GET /api/icm-dashboard/periods 200 OK
GET /api/icm-dashboard/summary?month=4&year=2026 200 OK
```

### Frontend Erreur (Network Tab)
```
GET /api/icm-dashboard/summary 400 Bad Request
GET /api/icm-dashboard/summary 401 Unauthorized
GET /api/icm-dashboard/summary 500 Internal Server Error
```

---

## 📋 Checklist de Validation

- [ ] Backend démarre sans erreur
- [ ] GET /periods retourne des données
- [ ] GET /summary retourne les 4 cartes
- [ ] GET /consolidated retourne les détails
- [ ] GET /checklists retourne la liste
- [ ] Erreur 400 sans paramètres
- [ ] Frontend charge sans erreur console
- [ ] Composant IcmDashboard affiche les cartes
- [ ] Changement de période recharge les données
- [ ] Changement d'onglet fonctionne
- [ ] Tableau affiche les données correctes
- [ ] Design responsive fonctionne
- [ ] Pas d'erreur CORS
- [ ] Performance acceptable

---

## 🎯 Points de Vérification Critiques

1. **Base de données**: Des checklists avec statut "Validé"
2. **Backend**: Module IcmModule importé dans AppModule
3. **Frontend**: HttpClientModule importé dans DashboardModule
4. **Routes**: /dashboard/icm configurée
5. **Environment**: apiUrl pointant vers le bon backend
6. **Token**: JWT valide dans les requêtes

---

## 💡 Tips

### Voir toutes les tables ICM
```sql
SELECT TABLE_NAME FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = 'your_database' AND TABLE_NAME LIKE 'icm%';
```

### Voir le nombre de checklists validées
```sql
SELECT COUNT(*) as total, status 
FROM icm_checklist 
GROUP BY status;
```

### Voir les scores calculés
```sql
SELECT coordination_id, month, year, scoreICM, status
FROM icm_checklist
WHERE status = 'Validé'
ORDER BY year DESC, month DESC;
```

### Activer les logs TypeORM
```typescript
// Dans database.config.ts
export const DatabaseConfig = () => ({
  // ...
  logging: ['query', 'error'],  // Voir toutes les requêtes SQL
  // ...
});
```

### Formater les logs JSON
```bash
curl ... | jq '.' > formatted.json
cat formatted.json
```

---

## 🚨 Erreurs Fréquentes et Solutions

| Erreur | Solution |
|--------|----------|
| Cannot GET /icm-dashboard/summary | Module non importé dans AppModule |
| Cannot find module 'IcmDashboardService' | Path du service incorrect ou fichier manquant |
| HTTP 401 | Token JWT invalide ou expiré |
| Empty response | Pas de données validées ou requête SQL incorrecte |
| CORS error | Backend CORS non configuré ou frontend URL incorrecte |
| TypeError: Cannot read property 'summary' of null | Composant utilise les données avant la réponse API |

---

## 🎓 Apprentissage

Ce projet démontre:

1. **Backend NestJS**:
   - Service avec logique métier
   - Controller avec endpoints
   - TypeORM QueryBuilder
   - Gestion des erreurs
   - Documentation Swagger

2. **Frontend Angular 14**:
   - Component avec state management
   - Service HTTP avec RxJS
   - Template avec *ngIf/*ngFor
   - Styles responsive avec SCSS
   - Lazy loading des données

3. **Best Practices**:
   - Clean code
   - Separation of concerns
   - Error handling
   - Type safety (TypeScript)
   - Responsive design
   - Documentation

---

## 📞 Support

Pour toute question:
1. Consulter la documentation: `ICM_DASHBOARD_DOCUMENTATION.md`
2. Vérifier l'intégration: `ICM_DASHBOARD_INTEGRATION_GUIDE.md`
3. Lire le récapitulatif: `ICM_DASHBOARD_RECAP.md`
4. Vérifier les tests: ce fichier
