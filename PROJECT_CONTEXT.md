# Contexte du projet

## Résumé
Ce dépôt contient une application de gestion des incidents et des tickets avec une architecture `frontend` + `backend`.

- `backend` : API Spring Boot exposée sous `/api`
- `frontend` : interface React + TypeScript + Vite
- `uploads` : fichiers et pièces jointes côté projet
- `backend/UsersvectusDocumentsUploads` : répertoire de stockage configuré dans le backend pour les fichiers uploadés

## Objectif fonctionnel
L'application gère un flux de traitement d'incidents:

1. Un client crée un incident.
2. Un manager ou une équipe prend en charge le ticket.
3. L'incident évolue par statut jusqu'à la résolution et la clôture.
4. Un responsable de traitement (`rt`) peut consulter l'incident et rédiger un rapport RCA (`root cause analysis`).
5. Le système génère des notifications et gère les pièces jointes.

## Stack technique

### Backend
- Java 17
- Spring Boot 4.0.7
- Spring Web MVC
- Spring Data JDBC et JPA
- Spring Security / JWT
- Spring Validation
- Spring WebSocket
- Spring Kafka
- Spring Mail
- Base de données H2 en mémoire pour le développement
- PostgreSQL déclaré en dépendance runtime

### Frontend
- React 19
- TypeScript
- Vite
- React Router
- Tailwind CSS
- Framer Motion
- Lucide React
- Recharts
- Mermaid
- `@xyflow/react`

## Rôles applicatifs
Le frontend manipule ces rôles:

- `client`
- `manager`
- `admin`
- `rt`

Le routage est protégé selon le rôle connecté.

## Entités métier principales
- `User`
- `Team`
- `Application`
- `Incident`
- `Attachment`
- `RcaReport`
- `Notification`
- `Role`

## Statuts d'incident
Les statuts visibles dans le code sont:

- `NEW`
- `REJETE`
- `VALIDATED`
- `IN_PROGRESS`
- `RESOLVED`
- `CLOSED`

## Niveaux d'incident
- `CRITICAL`
- `HIGH`
- `MEDIUM`
- `LOW`

## Types de notification
- `NOUVEL_INCIDENT`
- `MESSAGE_RECU`
- `INCIDENT_REJETE`
- `INCIDENT_AFFECTE`
- `INCIDENT_RESOLU`
- `INCIDENT_CLOTURE`
- `SLA_PROCHE_DEPASSEMENT`
- `SLA_DEPASSE`

## Backend: structure
Le backend est organisé par couches classiques:

- `controller` : exposition HTTP
- `service` : logique métier
- `repository` : accès aux données
- `domain` : entités et enums
- `dto` : objets d'échange
- `mapper` : conversion domaine/DTO
- `security` : JWT, authentification, filtres
- `config` : CORS, fichiers, tâches planifiées, bootstrap
- `event` et `event/listener` : événements métier
- `exception` : gestion centralisée des erreurs

## API principales
Tous les endpoints backend sont préfixés par `/api` via `spring.mvc.servlet.path=/api`.

### Applications
- `GET /applications`
- `GET /applications/client/{clientUserId}`
- `GET /applications/{id}`
- `GET /applications/name/{name}`
- `POST /applications`
- `PUT /applications/{id}`
- `DELETE /applications/{id}`

### Incidents
- `GET /incidents`
- `GET /incidents/{id}`
- `GET /incidents/status/{status}`
- `GET /incidents/manager/{managerId}`
- `GET /incidents/team/{teamId}`
- `POST /incidents/{id}/claim/{userId}`
- `POST /incidents`
- `POST /incidents/client`
- `PUT /incidents/{id}`
- `DELETE /incidents/{id}`
- `GET /incidents/FindNewIncident/{referenceId}`

### RCA reports
- `GET /rca-reports`
- `GET /rca-reports/{id}`
- `GET /rca-reports/incident/{incidentId}`
- `POST /rca-reports`
- `PUT /rca-reports/{id}`
- `DELETE /rca-reports/{id}`

### Notifications
- `GET /notifications`
- `GET /notifications/{id}`
- `GET /notifications/recipient/{userId}`
- `POST /notifications`
- `PUT /notifications/{id}`
- `DELETE /notifications/{id}`

### Teams
- `GET /teams`
- `GET /teams/{id}`
- `GET /teams/name/{name}`
- `GET /teams/{id}/members`
- `POST /teams`
- `PUT /teams/{id}`
- `DELETE /teams/{id}`

### Users
- `GET /users`
- `GET /users/{id}`
- `GET /users/email/{email}`
- `POST /users`
- `PUT /users/{id}`
- `DELETE /users/{id}`

### Attachments
- `GET /attachments/{id}/file`

## Frontend: routes
Le frontend utilise React Router avec protection par rôle.

### Routes publiques
- `/login`

### Client
- `/client/home`
- `/client/create`
- `/client/tickets`
- `/client/kb`

### Manager
- `/manager/home`
- `/manager/workspace`

### Admin
- `/admin`
- `/admin/apps`
- `/admin/teams`
- `/admin/sla`
- `/admin/settings`

### Responsable de traitement
- `/rt/home`
- `/rt/incident/:id`
- `/rt/report`
- `/rt/report/:referenceId`

### Route accessible sans protection explicite
- `/incidents/:referenceId`

## Frontend: dépendances métier
Le fichier `frontend/src/lib/api.ts` montre les appels principaux:

- récupération des applications, équipes, utilisateurs et incidents
- récupération d'un incident par référence
- mise à jour d'un incident
- prise en charge d'un incident
- création d'un incident client via `multipart/form-data`
- récupération et création de rapports RCA
- construction des URLs de pièces jointes

## Configuration locale
Le backend est configuré avec:

- stockage des fichiers dans `C:\Users\vectus\Documents\Uploads`
- H2 console active sur `/h2-console`
- serveur frontend autorisé via `app-frontend=http://localhost:5173/`
- SMTP configuré pour l'envoi d'e-mails

Le frontend consomme l'API via:

- `VITE_API_BASE_URL`
- valeur par défaut: `http://localhost:8080/api`

## Points d'attention pour une IA
- Le projet semble être en phase de développement local, avec des valeurs codées en dur pour certains identifiants et chemins.
- Le backend contient des configurations sensibles dans `application.properties`; il faut éviter de réinjecter ces secrets dans du nouveau code.
- Plusieurs dossiers générés existent déjà: `backend/target`, `frontend/dist`, `frontend/node_modules`.
- Le backend expose des conventions métier en français et en anglais mélangés, donc il faut rester cohérent avec les noms existants.

## Fichiers d'entrée utiles
- `backend/src/main/java/com/entreprise/incidentmanagement/IncidentManagementApplication.java`
- `backend/src/main/java/com/entreprise/incidentmanagement/controller/ApplicationController.java`
- `backend/src/main/java/com/entreprise/incidentmanagement/controller/IncidentController.java`
- `backend/src/main/java/com/entreprise/incidentmanagement/controller/RcaReportController.java`
- `frontend/src/App.tsx`
- `frontend/src/lib/api.ts`
- `frontend/src/lib/auth.tsx`

## Recommandation d'usage
Si une IA doit modifier ce projet, il faut lui fournir ce fichier avec:

- la demande précise
- le ou les fichiers cibles
- le comportement attendu
- les contraintes de compatibilité avec les routes et DTO existants
