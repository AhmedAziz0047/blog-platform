DEMO: https://drive.google.com/file/d/1fR5BFcPIIOI18shTg5_ovGUSMzed4neR/view?usp=sharing

# Plateforme de Blog MEAN Stack

Une plateforme de blog collaborative construite avec MongoDB, Express.js, Angular (v16+) et Node.js.

## Fonctionnalités
- **Gestion des utilisateurs**: Contrôle d'accès basé sur les rôles (Admin, Éditeur, Rédacteur, Lecteur).
- **Authentification**: Authentification basée sur JWT avec hachage sécurisé des mots de passe.
- **Gestion des articles**: Créer, lire, mettre à jour, supprimer des articles avec du texte enrichi et des images.
- **Commentaires en temps réel**: Système de commentaires en direct utilisant Socket.io.
- **Design réactif**: Interface utilisateur moderne et premium avec des variables CSS et une mise en page réactive.

## Pile technologique
- **Frontend**: Angular 16+, CSS3 (Variables, Flexbox/Grid)
- **Backend**: Node.js, Express.js
- **Base de données**: MongoDB
- **Temps réel**: Socket.io
- **Sécurité**: Helmet, CORS, Rate Limiting, Bcrypt, JWT

## Installation

### Prérequis
- Node.js (v14+)
- MongoDB (Local ou Atlas)
- Angular CLI (`npm install -g @angular/cli`)

### Configuration du Backend
1. Naviguez vers le dossier `backend`:
   ```bash
   cd backend
   ```
2. Installez les dépendances:
   ```bash
   npm install
   ```
3. Créez le fichier `.env` (ou utilisez les valeurs par défaut):
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/mean-blog
   JWT_SECRET=votre_cle_secrete
   ```
4. Démarrez le serveur:
   ```bash
   npm run dev
   ```

### Configuration du Frontend
1. Naviguez vers le dossier `frontend`:
   ```bash
   cd frontend
   ```
2. Installez les dépendances:
   ```bash
   npm install
   ```
3. Démarrez le serveur de développement:
   ```bash
   npm start
   ```
4. Ouvrez le navigateur à `http://localhost:4200`

## Rôles et Permissions
- **Lecteur**: Peut consulter les articles et les commentaires.
- **Rédacteur**: Peut créer des articles et modifier les siens.
- **Éditeur**: Peut modifier n'importe quel article.
- **Admin**: Peut supprimer des articles et des commentaires, gérer les utilisateurs.

## Points d'API
- `POST /api/auth/register` - Enregistrer un nouvel utilisateur
- `POST /api/auth/login` - Connexion
- `GET /api/articles` - Obtenir tous les articles
- `POST /api/articles` - Créer un article
- `GET /api/comments/:articleId` - Obtenir les commentaires
