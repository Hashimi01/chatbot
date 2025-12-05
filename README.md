# Tonton Roger - Le Bot Boomer 🤖

**Devise:** "Un peu plus rapide qu'un fax, et plus intelligent qu'une machine à écrire."

## Vue d'ensemble

Tonton Roger est un chatbot comique avec la personnalité d'un Français de 58 ans qui pense être un expert en informatique, mais ses connaissances se sont arrêtées en 1998. Le design est volontairement "moche" dans le style Windows 95/98 pour ajouter un aspect comique et nostalgique.

## Caractéristiques principales

### 1. Personnalité de Roger

- Écrit tout en MAJUSCULES (ALL CAPS)
- Fait des fautes d'orthographe aléatoires
- Utilise des emojis anciens :-) et des points excessifs ......
- Mélange les sujets et mentionne sa femme "Martine" sans raison
- Répond dans la même langue que l'utilisateur (français, arabe, anglais)
- Messages courts, drôles et absurdes (maximum 50-80 mots)

### 2. Interface Windows 95/98

- Design classique style Windows 95
- Polices Comic Sans MS et MS Sans Serif
- Couleurs vives (vert phosphorescent, bleu vif)
- Boutons en 3D avec effets d'ombre
- Scrollbar Windows 95 authentique
- Avatar avec effet webcam basse résolution

### 3. Effets sonores

- Son ICQ lors de la réception d'un message
- Son de clavier mécanique pendant la frappe
- Nécessite une activation par l'utilisateur (écran de bienvenue)
- Gestion audio avec Howler.js

### 4. Mode Chaos

- Le bouton "ENVOYER" fuit parfois la souris (10% de chance)
- Messages d'erreur factices (10% de chance)
- "Chargement d'Internet... Veuillez patienter 3 jours"

### 5. Appel vidéo raté

- Popup aléatoire en plein milieu de la conversation (5% de chance)
- Vidéo en boucle de Roger qui approche son œil de la caméra
- "Allô ???? Vous me voyez ???? L'écran est noir chez moi !!!"

### 6. Simulation de frappe lente

- Indicateur de frappe pendant 5 secondes
- Effet machine à écrire (lettre par lettre)
- Pas de défilement automatique pendant la frappe
- Fautes d'orthographe appliquées uniquement à la version finale

## Installation et configuration

### Prérequis

- Node.js >= 20.9.0
- npm ou yarn
- Clé API Google Gemini

### 1. Installation des dépendances

```bash
npm install
```

Dépendances principales :
- `next` - Framework React
- `react95` - Composants Windows 95
- `styled-components` - Requis pour react95
- `@google/generative-ai` - Connexion à l'API Gemini
- `howler` - Effets sonores

### 2. Configuration des variables d'environnement

Créez un fichier `.env.local` à la racine du projet :

```env
GEMINI_API_KEY=votre_cle_api_gemini_ici
```

Obtenez une clé API depuis : https://aistudio.google.com/app/apikey

Voir `GEMINI_SETUP.md` pour plus de détails.

### 3. Ajout des fichiers audio (optionnel)

Placez les fichiers suivants dans `public/sounds/` :
- `icq-notification.mp3` - Son ICQ
- `keyboard-click.mp3` - Son de clavier

**Note :** L'application fonctionnera sans ces fichiers (en utilisant des sons alternatifs), mais ils améliorent l'expérience !

### 4. Ajout du fichier vidéo (optionnel)

Placez le fichier vidéo dans `public/videos/` :
- `roger-video-call.mp4` - Vidéo en boucle de Roger

**Note :** Si le fichier n'existe pas, un texte alternatif s'affichera.

### 5. Image de profil

Placez l'image de profil dans `public/` :
- `photo.png` - Photo de profil de Roger

## Démarrage

### Mode développement

```bash
npm run dev
```

Puis ouvrez votre navigateur sur : **http://localhost:3000/roger**

### Mode production

```bash
npm run build
npm start
```

## Structure du projet

```
hatbot/
├── public/
│   ├── photo.png              # Photo de profil de Roger
│   ├── sounds/                # Fichiers audio (optionnel)
│   └── videos/                # Fichiers vidéo (optionnel)
├── src/
│   ├── pages/
│   │   ├── index.tsx          # Page d'accueil
│   │   ├── roger.tsx           # Page principale de Roger
│   │   └── api/
│   │       └── roger/
│   │           └── chat.ts     # Endpoint API pour le chat
│   ├── components/
│   │   └── roger/
│   │       ├── RogerChat.tsx           # Composant de chat principal
│   │       ├── RogerAvatar.tsx         # Avatar avec photo de profil
│   │       ├── VideoCallPopup.tsx      # Fenêtre d'appel vidéo
│   │       ├── WelcomeScreen.tsx       # Écran de bienvenue
│   │       ├── ChaosMode.tsx           # Fonctionnalité chaos
│   │       └── *.module.css            # Styles CSS modules
│   ├── lib/
│   │   └── audio/
│   │       └── RogerAudioManager.ts    # Gestionnaire audio
│   └── styles/
│       ├── globals.css                 # Styles globaux
│       ├── Roger.module.css            # Styles généraux Roger
│       └── Home.module.css             # Styles page d'accueil
├── .env.local                 # Variables d'environnement (à créer)
├── package.json
├── LICENSE                    # Licence MIT
└── README.md                  # Ce fichier
```

## System Prompt

Roger utilise un System Prompt spécifique pour garantir sa personnalité :

```
You are Roger, a 58-year-old French boomer who thinks he is a tech guru.
CONTEXT:
- Current year for you: 1998.
- You use Windows 95.
- You hate "Le Cloud" (you think it's actual clouds).
- You confuse the user with your nephew "Kevin" or your wife "Martine".

CRITICAL RULE - MESSAGE LENGTH:
- KEEP RESPONSES SHORT AND FUNNY! Maximum 50-80 words.
- Be EXTREMELY CONCISE. One-liners are preferred when possible.
- Prioritize humor and brevity over explanations.

CRITICAL RULE - LANGUAGE:
- ALWAYS respond in the SAME LANGUAGE as the user's question.
- If user writes in Arabic, respond in Arabic (but with your boomer persona).
- If user writes in French, respond in French.
- If user writes in English, respond in English.

STYLE GUIDELINES:
1. WRITE IN FULL CAPS LOCK ONLY.
2. Use excessive punctuation (!!!!!!, ......) and old emojis :-).
3. Make typos (e.g., "Gogle" instead of "Google", "Internet" -> "L'internette").
4. End sentences with random boomer signatures like "Bises, Roger" or "Amitiés".

BEHAVIOR:
- If asked for help: Blame the "modem 56k" or say "Have you tried blowing into the cartridge?".
- If asked about AI: "Is that a new virus from the Russians?? Norton Antivirus will catch it!".
- Never give a straight answer. Always pivot to: your lumbago, the weather in Maubeuge, or onion soup recipes.
```

Le System Prompt complet se trouve dans `src/pages/api/roger/chat.ts`.

## Caractéristiques techniques

### API Gemini

- **Modèle :** `gemini-1.5-flash` (peut être modifié dans `src/pages/api/roger/chat.ts`)
- **System Instruction :** System prompt spécifique pour la personnalité de Roger
- **Sécurité :** Tous les filtres de sécurité désactivés pour permettre la personnalité comique
- **Timeout :** 15 secondes pour éviter les requêtes qui pendent

### Effets sonores

- Utilisation de Howler.js pour les effets sonores
- L'activation du son nécessite une interaction utilisateur (politique des navigateurs)
- L'écran de bienvenue active le son au clic sur "COMMENCER"
- Sons personnalisés pour ICQ et clavier mécanique

### Mode Chaos

- 10% de chance que le bouton fuie la souris
- 10% de chance qu'un message d'erreur factice apparaisse
- Les probabilités peuvent être personnalisées dans `ChaosMode.tsx`

### Appel vidéo

- 5% de chance après chaque message de Roger
- Popup avec boutons "ACCEPTER" et "REFUSER"
- Bouton "FERMER" rouge et visible
- Vidéo en boucle avec texte overlay

### Gestion du scroll

- Pas de défilement automatique pendant la frappe
- L'utilisateur contrôle le défilement manuellement
- Défilement automatique uniquement lors de l'envoi d'un message utilisateur

### Polices

- **MS Sans Serif** → `'Share Tech Mono', 'Courier New', monospace` (fallback)
- **Comic Sans MS** → `'Comic Neue', 'Comic Sans MS', cursive` (fallback)
- **Courier New** → `'Courier New', 'Share Tech Mono', monospace` (fallback)
- Les polices sont chargées depuis Google Fonts pour garantir la cohérence sur tous les appareils

## Personnalisation

### Changer la personnalité de Roger

Modifiez le System Instruction dans `src/pages/api/roger/chat.ts`

### Changer le modèle Gemini

Modifiez `model: 'gemini-1.5-flash'` dans `src/pages/api/roger/chat.ts`

Vous pouvez utiliser :
- `gemini-1.5-flash` - Plus rapide et moins cher (recommandé)
- `gemini-1.5-pro` - Plus précis mais plus lent
- `gemini-pro` - Version précédente

### Changer les probabilités

- Appel vidéo : `src/components/roger/RogerChat.tsx` (ligne 36)
- Mode Chaos : `src/components/roger/ChaosMode.tsx`

### Changer les couleurs et styles

- `src/components/roger/RogerChat.module.css`
- `src/components/roger/WelcomeScreen.module.css`
- `src/components/roger/VideoCallPopup.module.css`
- `src/styles/Roger.module.css`
- `src/styles/Home.module.css`

### Changer l'image de profil

Remplacez `public/photo.png` par votre propre image.

## Problèmes courants

### Le son ne fonctionne pas

- Assurez-vous de cliquer sur le bouton "COMMENCER" dans l'écran de bienvenue
- Certains navigateurs bloquent le son automatique - c'est un comportement normal
- Vérifiez que les fichiers audio sont dans `public/sounds/` (optionnel)

### L'API Gemini ne fonctionne pas

- Vérifiez que `GEMINI_API_KEY` est ajouté dans `.env.local`
- Vérifiez que la clé est correcte et a un quota suffisant
- Vérifiez que Gemini API est activé dans Google AI Studio
- Redémarrez le serveur après avoir ajouté la clé

### react95 ne fonctionne pas

- Assurez-vous d'installer `styled-components`
- Vérifiez que `StyleSheetManager` est ajouté dans `_app.tsx`

### Les polices ne s'affichent pas correctement

- Les polices sont chargées depuis Google Fonts
- Vérifiez votre connexion Internet
- Les fallback fonts garantissent l'affichage même sans connexion

### Le scroll ne fonctionne pas

- Le défilement automatique est désactivé pendant la frappe
- Utilisez la molette de la souris ou la barre de défilement manuellement
- Le défilement automatique se fait uniquement lors de l'envoi d'un message

## Scripts disponibles

```bash
# Développement
npm run dev

# Build de production
npm run build

# Démarrage en production
npm start

# Linting
npm run lint
```

## Technologies utilisées

- **Next.js 15** - Framework React avec SSR
- **React 18** - Bibliothèque UI
- **TypeScript** - Typage statique
- **react95** - Composants Windows 95
- **styled-components** - CSS-in-JS
- **Google Gemini AI** - Intelligence artificielle
- **Howler.js** - Gestion audio
- **Tailwind CSS** - Framework CSS utilitaire

## Contribution

Ce projet est comique ! N'hésitez pas à ajouter des fonctionnalités drôles ou des améliorations.

Pour contribuer :
1. Fork le projet
2. Créez une branche pour votre fonctionnalité (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## Remerciements

- Google pour l'API Gemini
- L'équipe react95 pour les composants Windows 95
- Tous les contributeurs

---

**Bises, Roger** :-) !!!!!!

*"Un peu plus rapide qu'un fax, et plus intelligent qu'une machine à écrire."*

