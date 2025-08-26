# RedTetris

## General Instructions
Projet en JS, version LTS
Code front écrit sans le 'this', pour encourager l'utilisation de constructions fonctionnelles à la place de la POO -> On doit choisir une librairie fonctionnelle comme lodash ou ramda, ou rien du tout
La logique de jeu (board comme les pièces) doit etre implemente en utilisant des fonctions pures, la seule exception est : `this` peut etre utilisé pour définir des sous-classes d'Error
Code serveur doit suivre une logique POO, utilisant des prototypes. Au minumum, on doit définir les classes Player, Piece et Game.
L'application client doit utiliser un framework JS récent. HTML ne doit pas utiliser `<TABLE />`. Layouts doivent être grid ou flexbox.

INTERDICTION D'UTILISER :
- DOM manipulation lib (jQuery, ...)
- Canvas
- SVG

Pas besoin de manipuler directement le DOM

Test unitaires doivent couvrir au minimum 70% des statements, functions and lines, et minimum 50% des branches

## MANDATORY

### Le Jeu
Le jeu se termine quand une pièce ne peut plus rentrer dans le tableau
Terminer une ligne la fait disparaitre

Même séquence de pièces pour tous les joueurs d'une même room

Quand un joueur termine une ligne, les autres joueurs recoivent n-1 lignes INDESTRUCTIBLE en bas du tableau

Tableau de 10 colonnes par 20 lignes

Les joueurs peuvent voir les noms des opposants et une "spectrum view" de leurs tableaux. Le spectre affiche la hauteur du bloc le plus haut de chaque colonne. Cette vue est mise à jour en temps réel.

On doit utiliser les pièces originales

### Mouvements des pièces
Chute à vitesse constante. Dès qu'une pièce touche la pile, elle devient immobile sur la prochaine frame, autorisant les ajustements de dernière minute

Inputs :
- Flèche Gauche/Droite : Déplacement de la pièce
- Flèche haut : Rotation
- Flèche bas : Chute douce (plus rapide que la normale quand même)
- Espace : Hard drop (Instant en bas)

## Détails techniques
Modèle client/server

Client tourne sur les navigateurs récents
Serveur sur Node.js
Communication par HTTP et socket pour les events bidirectionnels

Le serveur gere :
- Management du jeu et joueur
- Distribution des pieces
- Update du spectrum

Pas de persistance de data

Encouragé d'utiliser les components fonctionnel (React Hooks)

Client en SPA

### Game Management
URL : http://<server_name_or_ip>:<port>/<room>/<player_name>

room: nom de la partie à rejoindre
player_name: nom du joueur

Le 1er joueur à rejoindre sera le host et aura les controles (démarrer ou redémarrer une partie).
Si l'host part, l'un des joueurs restants prend le poste
Si partie commencé, pas de nouveaux joueurs avant le prochain round

Plusieurs games simultanées doivent être gérés

### Client setup
We recommend using:
• A JS framework likeReact or Vue for the view layer (MVC)
• Redux to manage application state.
You can enhance your app using packages from npm:
• Functional: lodash, ramda (optional)
• Immutability: Immutable.js, or use ES features (e.g., object spread)
• Asynchronous: Redux is synchronous by default; use redux-thunk or redux-promise
for async workflows

### Testing
Testing helps:
• Improve release reliability.
• Accelerate delivery via automation.
• Ensure product quality and long-term maintainability.
JavaScript is now enterprise-ready. Like .NET or Java in the past, it’s the foundation of "Enterprise JavaScript". Testing pipelines are a core part of that, ensuring faulty versions are caught automatically.
Unit tests must cover at least 70% of statements, functions, and lines, and 50% of branches.
More precisely, when running the tests, you will get 4 metrics:
• Statements: statement coverage rate
• Functions: functions coverage rate
• Lines: coverage rate of lines of code
• Branches: coverage rate of code execution paths
