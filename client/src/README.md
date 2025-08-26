# Architecture front

## Correspondance MVC
Model -> reducers
View -> components
Controller -> containers, actions, middleware

## Quoi mettre dans les dossiers ?
### client/actions
Toutes les actions Redux

#### Exemples :
- playerActions -> rejoindre une partie, quitter
- gameActions -> démarrer, recevoir une pièce
- boardActions -> déplacer une pièce, ligne complétée

### client/reducers
Les fonctions qui gèrent l'état Redux, en réponse aux actions

#### Exemples: 
- playerReducer -> gère le nom, l'ID socket, si c'est l'hôte
- gameReducer -> état global de la partie (en cours, terminée, etc.)
- boardReducer -> gère l'état du plateau

### client/components
Composants visuel simples, souvent sans logique

#### Exemples:
- Board -> Rendu du plateau
- Piece -> Rendu d'une pièce
- SpectrumView -> Rendu du spectrum
- Button, Header, etc. -> Composants UI génériques

### client/containers
Composant liés à Redux qui orchestrent la logique (via `connect` ou `useSelector /  useDispatch`) \
Les containers branchent Redux avec les composants.

#### Exemples:
- GameContainer -> lie les actions du jeu à l'UI
- BoardContainer -> gère l'état du plateau + envoie les inputs

### client/middleware
Fonctions intermédiaires personnalisées entre action -> reducer, pour gérer des effets de bord (ex. socket.io, async, logs...)

#### Exemples:
- socketMiddleware -> intercepte certaines actions Redux et envoie des messages socket.io
- logger -> loggue les actions en dev
- thunk -> permet d'écrire des actions asynchrones (si besoin)