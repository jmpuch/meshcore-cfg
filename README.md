# meshcore-cfg

Outil (Rust) pour configurer des devices [MeshCore](https://meshcore.io/) —
répéteur, room-server, sensor **et companion** (série ou Bluetooth) — avec
une interface graphique pour un usage simple, et un CLI complet pour
l'usage avancé/scriptable. Application de templates de configuration
complets, assistant région (44 pays), gestion de l'ACL (droits
admin/guest), configuration d'un companion à distance via un autre
companion sur le mesh LoRa, et flash de firmware ESP32 en natif.

> **Sources** : pas encore publiées — ce repo distribue uniquement les
> binaires précompilés (voir [Releases](https://github.com/jmpuch/meshcore-cfg/releases)
> pour le détail de chaque version). Si l'outil intéresse plus largement,
> les sources suivront.

## Installation

Télécharger l'archive correspondant à votre système depuis la page
[Releases](https://github.com/jmpuch/meshcore-cfg/releases) — chacune
contient déjà tout le nécessaire pour démarrer : le binaire, un dossier
[`templates/`](templates/) (voir « Comparer à un template » plus bas) et
un dossier [`region-packs/`](region-packs/) (voir « Packs de régions »
plus bas ; le programme cherche par défaut `region-packs/france.json` à
côté de lui) :

- **Linux** (x86_64) : `meshcore-cfg-linux-x86_64.zip`
- **Windows** (x86_64) : `meshcore-cfg-windows-x86_64.zip` — le binaire à
  l'intérieur est autonome, aucune DLL supplémentaire à installer
- **macOS** (Intel + Apple Silicon, binaire universel) :
  `meshcore-cfg-macos-universal.zip`

Extraire l'archive, puis rendre le binaire exécutable sur Linux/macOS :

```bash
unzip meshcore-cfg-linux-x86_64.zip -d meshcore-cfg   # ou -windows-x86_64 / -macos-universal
chmod +x meshcore-cfg/meshcore-cfg   # Linux/macOS uniquement
```

**Double-cliquer sur le binaire extrait (ou le lancer sans aucun argument)
ouvre l'interface graphique.** C'est le point d'entrée normal pour la
plupart des usages — le CLI (ligne de commande, avec des arguments) reste
disponible en parallèle pour l'usage avancé, voir plus bas. Le binaire
doit rester dans le même dossier que `templates/` et `region-packs/`
extraits à côté de lui pour que ces deux fonctions marchent — la
résolution de chemin accepte aussi bien un fichier à côté du binaire que
dans son sous-dossier, donc si vous déplacez le binaire seul plus tard,
lui recréer un sous-dossier `templates/`/`region-packs/` à côté suffit.

**Gatekeeper (macOS)** : le binaire n'étant pas signé/notarié par un
compte développeur Apple, macOS refuse de le lancer au premier essai
(« ne peut pas être ouvert car il provient d'un développeur non identifié »).
Deux façons de passer outre : **Réglages Système → Confidentialité et
sécurité**, faire défiler jusqu'au message concernant le fichier bloqué et
cliquer *Autoriser quand même* ; ou en ligne de commande, une fois pour
toutes :

```bash
xattr -d com.apple.quarantine ./meshcore-cfg
```

**Antivirus (Windows)** : un exécutable non signé et tout juste publié peut
se faire signaler par certains antivirus — c'est un faux positif habituel
pour ce genre d'outil (rien à voir avec le code), lié à l'absence de
signature et à la nouveauté du fichier plutôt qu'à un comportement
suspect réel. Si ça arrive, ajouter une exception suffit ; le signaler
comme faux positif à l'éditeur de votre antivirus aide à corriger ça pour
tout le monde.

## Premiers pas (interface graphique)

### 1. Brancher le device et choisir le port

Le device se branche en USB (ou, pour un companion, peut aussi se
retrouver en Bluetooth). Lancez `meshcore-cfg` sans argument : l'écran
qui s'ouvre propose un choix **USB**/**Bluetooth**, un sélecteur de port
(ou de nom Bluetooth), et un bouton **Connect**.

Pas besoin d'indiquer le type de device (répéteur, room-server, sensor ou
companion) — le programme le détecte tout seul à la connexion.

**Trouver son port** si le sélecteur ne le propose pas déjà :

- **Windows** — Gestionnaire de périphériques → « Ports (COM & LPT) » : le
  device apparaît typiquement comme `Silicon Labs CP210x USB to UART Bridge
  (COMx)` (ou `CH340` selon la board). Si rien n'apparaît alors que le
  câble est branché, c'est probablement le driver CP210x à installer
  manuellement (pas toujours présent par défaut sur Windows).
- **Linux/macOS** — le bouton ↻ à côté du sélecteur de port rafraîchit la
  liste ; le device apparaît comme `/dev/ttyUSB0` (Linux) ou
  `/dev/tty.usbmodemXXXX`/`/dev/tty.usbserial-XXXX` (macOS).

### 2. Se connecter

Une fois le port choisi, cliquez **Connect**. Le statut passe à
*Connecting…* puis, une fois le type de device détecté, à *Connected*
(en vert), avec le type de device entre parenthèses (Sensor, Repeater,
Room Server, ou Companion).

![Écran de lancement, avant connexion](docs/screenshots/01-lancement.png)

*(Cette capture montre aussi le rappel automatique du dernier template
utilisé — voir l'étape 4 — avant même toute connexion : c'est normal, la
comparaison se met à jour dès qu'un device est lu.)*

### 3. L'onglet Configuration se remplit tout seul

Dès la connexion établie, tous les attributs du device sont lus
automatiquement (pas besoin de cliquer sur « Rafraîchir » en premier) —
chaque ligne du tableau apparaît au fur et à mesure de sa lecture,
plutôt que d'attendre la fin de la lecture complète.

![Onglet Configuration, avec template chargé](docs/screenshots/02-connecte-companion.png)

*(Capturée sans connexion active — le tableau/ACL/Régions s'affichent
identiquement une fois connecté, avec en plus la colonne « Valeur lue »
remplie.)*

Chaque champ a sa propre ligne : la valeur actuellement lue sur le
device, un champ pour taper une nouvelle valeur, et un bouton **Set**
pour l'écrire. Les champs en orange sont des champs sensibles ou
documentés-mais-désactivés dans le template chargé (voir plus bas) — ils
restent visibles mais ne s'appliquent pas tant que le `#` n'est pas
retiré du fichier.

### 4. Comparer à un template

Le bouton **Choisir un template...** charge un fichier JSON de
configuration (voir « Format des templates » plus bas) et affiche, pour
chaque champ, la valeur actuellement lue **et** la valeur voulue par le
template, côte à côte :

- **Vert** : la valeur lue correspond déjà au template — rien à faire.
- **Rouge** : ça diffère — le bouton **Appliquer** de cette ligne écrit
  uniquement ce champ-là.
- **Orange** : champ sensible (clé privée, secret de canal...) ou
  volontairement désactivé dans le template (préfixé `#`) — jamais
  appliqué automatiquement, même par « Appliquer tout le template ».

Le bouton **Appliquer tout le template**, en haut, écrit d'un coup tous
les champs qui diffèrent (hors ceux désactivés/sensibles). Le dernier
template utilisé est mémorisé automatiquement et rechargé au prochain
lancement du programme.

## Les onglets de l'interface

- **Configuration** — décrit ci-dessus : tous les attributs, comparaison
  à un template, et (si le device en a) les sections **ACL** et
  **Régions** en dessous du tableau principal. La colonne
  **Valeur template** est directement éditable (modification live, y
  compris pour ajouter un champ absent du template) ; chaque champ a
  aussi sa case **Masquer (#)** pour désactiver/réactiver son
  application sans éditer le fichier à la main, et **Enregistrer
  sous...** sauvegarde ce template ajusté dans un nouveau fichier. Les
  colonnes du tableau se redimensionnent en faisant glisser leur
  bordure (largeur mémorisée d'un lancement à l'autre, comme dans
  l'Éditeur), et un bouton **Redémarrer le device** est disponible en
  haut — utile après un changement de paramètres radio, qui ne sont
  pris en compte qu'au redémarrage.

  **Ordre des lignes** : un template chargé s'affiche exactement dans
  l'ordre où ses champs sont écrits dans le fichier JSON — commentaires
  (`#_comment...`) compris, à leur vraie place. Deux boutons **^ / v**
  sur chaque ligne permettent de réordonner directement depuis l'IHM ;
  l'ordre choisi est celui utilisé par **Enregistrer sous...**. Sans
  template chargé, l'ordre par défaut reste : identité (nom, coordonnées,
  mots de passe) puis réglages radio/réseau puis le reste.

  **ACL** : même principe que le tableau des champs — rôle lu, rôle
  souhaité (menu déroulant guest/read-only/read-write/admin), case
  **Masquer (#)**, bouton **Appliquer** par ligne, plus une ligne
  **Nouvelle entrée ACL** pour ajouter une clé publique pas encore
  connue. Une entrée ACL non désactivée est aussi appliquée par
  **Appliquer tout le template**, comme n'importe quel autre champ.

  **Régions** : deux arbres indentés côte à côte, **Device (lu)** et
  **Template (souhaité)** — même présentation qu'un `region list` en
  CLI, avec home/default marqués (`^home`/`•default`) et une couleur par
  région (vert = déjà identique, rouge = diffère, orange = désactivée
  dans le template). Un "Supprimer" sur chaque région du template la
  retire **avec tous ses enfants**, et **Vider le template** repart de
  zéro d'un coup — rien de tout ça n'écrit sur le device, c'est
  **Appliquer tout le template** qui le fait, en une fois pour tout
  (régions absentes du template toujours supprimées du device, pour que
  celui-ci corresponde exactement au fichier). Un **assistant région**
  repliable propose de chercher une région/un secteur (nom ou code) et
  d'insérer d'un clic toute sa hiérarchie — pratique pour ne jamais fauter
  un code de région à la main. Les données viennent de fichiers JSON
  ("packs de régions") activables/désactivables directement dans l'IHM —
  voir la section dédiée plus bas pour le format et comment ajouter un
  pays.

  Le champ radio est présenté sur deux lignes liées : **Preset radio**
  (nom d'un préréglage régional officiel — Brazil, EU/UK (Narrow),
  USA/Canada..., 23 au total) juste au-dessus de **Radio** (le détail
  technique fréquence/bande passante/SF/CR). Choisir un preset remplit
  la ligne Radio ; modifier un paramètre radio à la main met à jour le
  preset affiché (nom correspondant, ou « --- » si la combinaison ne
  correspond plus à aucun préréglage connu). La ligne **Radio**
  elle-même n'accepte plus une valeur libre : bande passante, facteur
  d'étalement (SF) et taux de codage (CR) se choisissent dans une liste
  ne proposant que les valeurs réellement supportées par la puce radio,
  et la fréquence reste un champ numérique borné à la plage acceptée par
  le firmware — impossible d'entrer une combinaison incohérente.

  De la même façon, une ligne **Coller position** juste au-dessus de
  `lat` accepte de coller un couple `latitude, longitude` ou un lien
  OpenStreetMap/Google Maps copié depuis un navigateur — l'outil en
  extrait les deux coordonnées sans ambiguïté sur laquelle est laquelle ;
  un bouton **Carte** sur la ligne `lat` ouvre aussi OpenStreetMap dans
  le navigateur par défaut, centré sur les coordonnées actuelles, pour
  repérer visuellement un point avant de copier son lien.

  Le tableau se déplace aussi horizontalement (pas seulement
  verticalement) si la fenêtre est trop étroite pour afficher toutes les
  colonnes.
- **Dump** — capture complète de l'état du device en JSON, à sauvegarder
  dans un fichier.
- **Contacts** — l'annuaire du companion connecté (adverts/DMs qu'il a
  entendus) — utile pour retrouver la clé publique complète d'un device
  distant à piloter via LoRa (voir plus bas).

  ![Onglet Contacts](docs/screenshots/03-contacts.png)

- **Template / Clone** — charge un fichier et propose un aperçu
  (dry-run) puis une application réelle, indépendamment de l'onglet
  Configuration (utile pour tester un template sans toucher à l'état
  affiché ailleurs).
- **Éditeur** — crée ou modifie un fichier de template **sans être
  connecté à un device**. « Nouveau » présente d'emblée tous les champs
  connus, désactivés (`#`) avec une valeur neutre, pour un formulaire à
  remplir plutôt qu'une page blanche où il faudrait deviner les noms de
  champs ; « Charger un template... » relit un fichier existant pour le
  modifier. Chaque champ se coche/décoche (`#`), se modifie ou se
  supprime ligne par ligne, avec possibilité d'en ajouter de nouveaux.
  Les colonnes du tableau se redimensionnent en faisant glisser leur
  bordure, et la largeur choisie est mémorisée d'un lancement à l'autre.
  Comme dans l'onglet Configuration, le champ radio est présenté sur
  deux lignes liées, **Preset radio** (23 préréglages régionaux
  officiels) et **Radio** (détail technique), synchronisées dans les
  deux sens.
  Une section **ACL** permet d'ajouter/modifier/désactiver des entrées
  (clé publique + rôle) de la même façon, avec sa propre ligne
  **Nouvelle entrée ACL**. Une section **Régions** en dessous permet de
  créer/modifier la hiérarchie (parent, flood autorisé, home/default) sur
  le même principe, avec **Supprimer** par ligne et **Vider les
  régions** pour repartir de zéro — « Nouveau » y propose d'emblée un
  exemple EU → Europe → FR, désactivé. Le même **assistant région** que
  dans Configuration (chercher une région, insérer sa hiérarchie en un
  clic) y est aussi disponible. Même ordre de lignes que l'onglet
  Configuration (celui du fichier chargé, réordonnable avec **^ / v**), et
  même ligne **Coller position** au-dessus de `lat`.
- **Commandes** — colle un bloc de commandes CLI brutes (une par ligne,
  ex. une recette de configuration meshcore.fr) et les exécute d'un
  coup, dans l'ordre. Les lignes vides et celles commençant par `#` sont
  ignorées. Une ligne qui échoue (ex. `reboot`/`clock sync`, qui échouent
  normalement en connexion directe) n'interrompt pas les suivantes — le
  résultat de chaque ligne et le résumé final s'affichent dans le
  Journal. Le même **assistant région** que Configuration/Éditeur y est
  disponible : chercher une région insère directement la séquence
  `region put`/`allowf`/`save` correspondante dans le bloc de commandes, à
  relire avant d'exécuter.
- **ESP-Flash** — écrit un firmware `.bin` déjà mergé. **ESP32/ESP32-S3
  uniquement** — Heltec V2/V3/V4 et similaires ; les boards nRF52 (Heltec
  T114, RAK4631...) ne sont pas supportées par cet onglet.

## Packs de régions : ajouter d'autres pays à l'assistant

L'assistant région (Commandes/Éditeur/Configuration) ne connaît aucun pays
par défaut au niveau du code — il lit un ou plusieurs fichiers JSON
« packs de régions », activables/désactivables dans le panneau lui-même
(case à cocher par fichier, **+ Ajouter un fichier...**, **Recharger**
après une modification manuelle). Quarante-quatre packs sont fournis dans
`region-packs/` :

| Fichier | Contenu |
|---|---|
| `france.json` | 13 régions + 101 départements (actif par défaut) |
| `belgique.json` | 3 régions + 10 provinces |
| `allemagne.json` | 16 Länder |
| `italie.json` | 20 régions |
| `espagne.json` | 17 communautés autonomes + 2 villes autonomes |
| `suisse.json` | 26 cantons |
| `royaume-uni.json` | 4 nations + 217 comtés/autorités unitaires/districts (ISO 3166-2:GB complet) |
| `irlande.json` | 4 provinces + 26 comtés (République d'Irlande) |
| `pays-bas.json` | 12 provinces (hors territoires caribéens) |
| `luxembourg.json` | 12 cantons |
| `portugal.json` | 18 districts + 2 régions autonomes |
| `autriche.json` | 9 Länder |
| `suede.json` | 21 comtés (län) |
| `norvege.json` | 13 comtés (dont Svalbard, Jan Mayen) |
| `danemark.json` | 5 régions |
| `finlande.json` | 19 régions |
| `islande.json` | 8 régions |
| `emirats-arabes-unis.json` | 7 émirats — racine `ae` indépendante, pas rattachée à `eu` (hors Europe) |
| `pologne.json` | 16 voïvodies |
| `tchequie.json` | 13 régions + Prague |
| `slovaquie.json` | 8 régions |
| `hongrie.json` | 19 comitats + 23 villes à statut de comitat + Budapest |
| `roumanie.json` | 41 départements + Bucarest |
| `bulgarie.json` | 28 provinces |
| `grece.json` | 13 régions + Mont Athos |
| `croatie.json` | 20 comitats + Zagreb |
| `serbie.json` | 2 provinces autonomes + Belgrade + 29 districts |
| `lituanie.json` | 10 comtés |
| `lettonie.json` | 43 municipalités/villes d'État (seul niveau ISO officiel) |
| `estonie.json` | 15 comtés |
| `monaco.json` | 17 quartiers |
| `andorre.json` | 7 paroisses |
| `liechtenstein.json` | 11 communes |
| `saint-marin.json` | 9 communes (castelli) |
| `malte.json` | 68 localités (seul niveau ISO officiel) |
| `chypre.json` | 6 districts |
| `slovenie.json` | 212 communes (seul niveau ISO officiel) |
| `bosnie-herzegovine.json` | 3 entités + 10 cantons (sous la Fédération uniquement) |
| `montenegro.json` | 25 municipalités |
| `albanie.json` | 12 comtés |
| `moldavie.json` | 37 districts/villes/unités (dont Gagaouzie, Transnistrie) |
| `ukraine.json` | 27 oblasts/villes/Crimée (ISO 3166-2:UA complet) |
| `bielorussie.json` | 6 oblasts + Minsk (ville) |
| `macedoine-du-nord.json` | 80 municipalités (seul niveau ISO officiel) |

Codes et libellés issus des pages [ISO 3166-2](https://en.wikipedia.org/wiki/ISO_3166-2) de Wikipédia
pour chaque pays (vérifiés avant génération, pas retapés de mémoire) — les
libellés autres que le pays lui-même sont en anglais/nom natif plutôt que
traduits en français, pour éviter une erreur de traduction ; libre à vous
de les adapter dans le fichier, aucune recompilation nécessaire.

Format d'un pack :

```json
{
  "display_name": "Belgique",
  "entries": [
    { "code": "eu", "label": "Europe", "parent": null },
    { "code": "be", "label": "Belgique", "parent": "eu" },
    { "code": "be-bru", "label": "Bruxelles-Capitale", "parent": "be" },
    { "code": "be-vlg", "label": "Flandre", "parent": "be" },
    { "code": "be-wal", "label": "Wallonie", "parent": "be" }
  ]
}
```

`parent` référence le `code` d'une autre entrée du même pack (ou `null`
pour une racine) — aucune structure imposée : chaque pays définit sa
propre profondeur (un petit pays peut n'avoir qu'un ou deux niveaux, la
France en a quatre). Un `eu` (Europe) partagé en racine, comme ci-dessus,
n'est qu'une convention — les six packs fournis s'en servent tous, ce qui
permet à leurs régions de cohabiter sous le même nœud "Europe" quand
plusieurs sont actifs en même temps, mais rien ne l'impose. Chaque entrée,
pas seulement les « feuilles », est cherchable et insérable dans
l'assistant. Créer un fichier `.json` sur ce modèle, puis **+ Ajouter un
fichier...** dans n'importe lequel des trois panneaux suffit à l'activer
partout.

## Companion : configurer localement, ou piloter une cible distante via LoRa

Un companion (le device branché en local) peut être configuré
directement — nom, coordonnées, radio, TX power, variables custom — c'est
le mode **Local (ce companion)**, actif par défaut.

Si ce companion est physiquement à portée d'un **autre** device MeshCore
sur le mesh LoRa (un répéteur, room-server ou sensor), il peut aussi
servir de relais pour le configurer à distance — mode **Distante (via
LoRa)** :

![Sélecteur de cible, mode Distante déplié](docs/screenshots/04-cible-distante.png)

1. Choisir un contact dans la liste déroulante (déjà connus du companion
   — rafraîchie automatiquement à la connexion, ou via le bouton ↻), ou
   taper une clé publique manuellement.
2. Entrer le mot de passe admin du device cible.
3. **Se connecter à la cible** — cette étape est **lente** (un vrai
   aller-retour radio LoRa, potentiellement plusieurs dizaines de
   secondes) : un texte explicite l'indique pendant l'attente plutôt
   qu'un simple spinner silencieux.

Une fois la cible active, **tous** les onglets (Configuration, Dump,
Template/Clone) agissent sur elle plutôt que sur le companion local — un
bandeau orange « CIBLE ACTIVE: ... » reste affiché en permanence dans la
barre du haut, quel que soit l'onglet ouvert, pour ne jamais perdre de
vue quel device reçoit réellement les prochaines modifications.

**Important** : la cible doit déjà être un contact **connu** du
companion (il doit l'avoir entendue émettre un advert au moins une fois)
— sinon la connexion échoue avec un message explicite plutôt qu'un code
d'erreur brut.

## macOS — particularités

- **Gatekeeper** et **`xattr`** : voir la section Installation plus haut.
- **Bluetooth** : la toute première fois qu'un binaire non signé touche
  au Bluetooth sur macOS, le système bloque l'accès (crash immédiat,
  avant même qu'un message d'erreur clair n'ait le temps de s'afficher)
  tant que l'autorisation n'a pas été accordée — **pas au binaire
  lui-même**, mais à l'application qui l'a lancé (Terminal.app, iTerm,
  ou votre gestionnaire de fichiers si vous double-cliquez dessus).
  Si le mode Bluetooth reste inutilisable :
  **Réglages Système → Confidentialité et sécurité → Bluetooth**, et
  autorisez l'application depuis laquelle vous lancez `meshcore-cfg`
  (Terminal, iTerm2, Finder...). Un redémarrage de cette application
  après l'autorisation est parfois nécessaire.
- **Binaire universel** : un seul fichier fonctionne nativement sur Mac
  Intel et Apple Silicon, rien à choisir à l'installation.

## Usage avancé (ligne de commande)

Tout ce que fait l'interface graphique est aussi disponible en CLI, avec
en plus les scénarios scriptables (`region`, `acl`, `neighbors`, `raw`,
et le relais companion-vers-cible en ligne de commande) :

```bash
meshcore-cfg --port /dev/ttyUSB0 --version
```

### Deux familles de devices

- **Répéteur / room-server / sensor** — le CLI texte natif du firmware
  (`get`/`set <var>`), en USB direct ou relayé via un companion sur le
  mesh LoRa pour un device distant injoignable physiquement.
- **Companion** — le device branché en local sur `--port`, configuré
  directement (nom, coordonnées, radio, TX power, variables custom)
  plutôt que seulement utilisé comme relais vers une cible distante.
  Flag `--comp`, protocole binaire différent (jamais de CLI texte),
  toujours local (jamais de `--target`/`--password`).

Vérification optionnelle du type ciblé avant toute commande —
`--rep`/`--room`/`--sens`/`--comp` — utile pour éviter d'appliquer par
erreur un template au mauvais device :

```bash
meshcore-cfg --port /dev/ttyUSB0 --sens get name   # refuse si ce n'est pas un sensor
meshcore-cfg --port /dev/ttyUSB0 --comp dump       # configure le companion lui-même
```

Un fichier de template/dump peut aussi se taguer lui-même
(`"device_type": "sensor"`, ou `"repeater"`/`"room_server"`/`"companion"`)
— `dump` le fait automatiquement. Sans flag explicite, un tag présent
déclenche quand même une vérification live (filet de sécurité) ; avec un
flag, le tag doit correspondre ou l'application est refusée avant tout
envoi.

### Usage rapide

Une fois le port identifié, le premier réflexe utile : vérifier l'état
d'un répéteur par rapport au template fourni, **sans rien modifier** —
`--dry-run` calcule et affiche l'écart mais n'envoie jamais rien au
device :

```bash
meshcore-cfg --port /dev/ttyUSB0 apply-template templates/template-fr.json --dry-run
```

Sortie vide (`0 field(s) changed`) = conforme au template. Toute ligne
`Would change ...` montre exactement ce qui diffère, à valider avant
d'appliquer pour de vrai (même commande, sans `--dry-run`).

Le fichier template est cherché tel quel d'abord, puis avec le préfixe
`templates/` ajouté ou retiré selon le cas — `apply-template
template-fr.json` fonctionne donc que le fichier soit directement à côté
du binaire ou dans un sous-dossier `templates/`, quelle que soit la façon
dont vous avez tapé le chemin.

Chaque `reading <champ>...` affiche la valeur lue juste derrière, sur la
même ligne — pratique pour suivre ce qui se passe en direct, et pour
garder une trace : `2>&1 | Tee-Object -FilePath log.txt -Append` sous
PowerShell (ou `2>&1 | tee -a log.txt` sous Linux/macOS) capture tout ce
qui s'affiche dans un fichier, en accumulant l'historique entre plusieurs
exécutions.

Autres commandes utiles :

```bash
# Lire un champ
meshcore-cfg --port /dev/ttyUSB0 get name

# Écrire un champ
meshcore-cfg --port /dev/ttyUSB0 set tx 20

# Sauvegarder toute la config d'un device (vars + ACL + régions, un seul fichier)
meshcore-cfg --port /dev/ttyUSB0 dump mon-repeteur

# La restaurer (ou la reproduire sur un autre device)
meshcore-cfg --port /dev/ttyUSB0 clone mon-repeteur --dry-run
meshcore-cfg --port /dev/ttyUSB0 clone mon-repeteur

# Gestion des régions (arbre de scoping du flood, pas la fréquence radio)
meshcore-cfg --port /dev/ttyUSB0 region list

# Exécuter un bloc de commandes (ex. une recette meshcore.fr collée dans un fichier)
meshcore-cfg --port /dev/ttyUSB0 batch recette.txt
# ou directement depuis l'entrée standard :
cat recette.txt | meshcore-cfg --port /dev/ttyUSB0 batch

# Gestion de l'ACL (qui peut administrer/lire ce répéteur — série directe uniquement)
meshcore-cfg --port /dev/ttyUSB0 acl list
meshcore-cfg --port /dev/ttyUSB0 acl set-perm <clé-publique-hex-64> admin

# Voisins radio directs (ce que le device a réellement entendu en LoRa, pas un carnet de contacts)
meshcore-cfg --port /dev/ttyUSB0 neighbors
# 4C371AF9   39m ago    SNR 12.5 dB

# Annuaire du companion LOCAL — clé publique complète de chaque contact
# (neighbors ne renvoie que 4 octets, insuffisant pour --target)
meshcore-cfg --port /dev/ttyUSB0 --comp contacts
# repeater 4c371af941e6ed679ac35c4adda0540b0c5c0c9e21df50a9cc91d4cec3f0fadd FR48 RPT

# Configurer un device distant via un companion radio sur le mesh LoRa
meshcore-cfg --port /dev/ttyUSB0 --transport companion \
  --target <clé-publique-hex-64-du-device-cible> --password <mot-de-passe> get name
```

`--help` sur n'importe quelle commande (ou sous-commande) donne le détail
complet des options.

**Attention** : un fichier `*-dump.json` contient la **clé privée**
d'identité de votre device (`prv.key`) en clair — à conserver en lieu sûr,
ne jamais la partager ni la publier (dépôt Git, forum, etc.).

#### En cas de problème (`--debug`)

Le flag `--debug` (utile surtout avec `--transport companion`/`--comp`,
dont le protocole n'a pas d'identifiant de corrélation requête/réponse —
voir `--help`) trace chaque trame envoyée/reçue sur stderr. Combiné à une
redirection vers un fichier, ça donne une trace complète et partageable en
cas de souci :

```bash
meshcore-cfg --port /dev/ttyUSB0 --transport companion \
  --target <clé-publique-hex-64-du-device-cible> --password <mot-de-passe> \
  --debug get name > trace.log 2>&1
```

**Attention avant de partager ce fichier** : la trame de login
(`CMD_SEND_LOGIN`) contient votre `--password` en clair dans les octets
bruts — à retirer/masquer avant de publier ou d'envoyer une trace
`--debug` à qui que ce soit.

### Configurer un companion (`--comp`)

```bash
meshcore-cfg --port /dev/ttyUSB0 --comp get name
meshcore-cfg --port /dev/ttyUSB0 --comp set name "MonCompanion"
meshcore-cfg --port /dev/ttyUSB0 --comp set lat 44.85413
meshcore-cfg --port /dev/ttyUSB0 --comp set radio '{"freq":869.618,"bw":125,"sf":8,"cr":5}'
meshcore-cfg --port /dev/ttyUSB0 --comp set tx 20
meshcore-cfg --port /dev/ttyUSB0 --comp dump companion-backup
meshcore-cfg --port /dev/ttyUSB0 --comp clone companion-backup --dry-run
```

Champs connus : `name`, `lat`, `lon`, `radio` ({freq,bw,sf,cr}, mêmes
unités d'affichage que côté répéteur — MHz/kHz), `tx`, `multi.acks`,
`custom.<clé>`. Jamais de `--target`/`--password` avec `--comp` (toujours
local, jamais de relais). `region`/`acl`/`neighbors`/`raw` ne s'appliquent
pas à un companion (protocole binaire, pas de CLI texte) — refusés avec un
message explicite.

### Flasher un firmware (ESP32 uniquement pour l'instant)

```bash
# Nécessite un binaire déjà mergé (bootloader + table de partitions + app),
# le même artefact que PlatformIO produit via :
#   pio run -e <env> -t mergebin   # -> .pio/build/<env>/firmware-merged.bin
meshcore-cfg --port /dev/ttyUSB0 flash firmware-merged.bin

# --erase : efface la puce ENTIÈREMENT avant d'écrire, pas seulement les
# octets couverts par l'image. Un flash normal laisse intact tout ce qui
# est en dehors de bootloader+partitions+app — donc préserve l'identité
# existante du device (clé publique/privée). --erase force le firmware à
# regénérer une nouvelle identité au premier démarrage : pour un device
# vraiment neuf, ou pour faire tourner volontairement une identité —
# jamais en routine sur un device dont l'identité/les réglages comptent.
meshcore-cfg --port /dev/ttyUSB0 flash --erase firmware-merged.bin
```

Fonctionne sur les boards ESP32/ESP32-S3 (Heltec V2/V3/V4 et similaires)
— détection de puce automatique, aucune option à préciser. Pas encore
supporté : les boards nRF52 (Heltec T114, RAK4631/WisBlock, etc.), qui
utilisent un mécanisme de flash complètement différent (DFU série
Nordic) — à venir dans une prochaine version.

## Template `templates/template-fr.json`

Un exemple de template fourni avec ce repo — les champs de configuration
courants y sont listés, actifs ou documentés-désactivés (préfixe `#`
devant la clé : la valeur reste visible mais n'est pas appliquée).
Correspond champ par champ aux recommandations officielles de la
communauté MeshCore France, y compris `dutycycle` (respect du duty-cycle
LoRa européen) et la hiérarchie de régions `eu → europe → fr` avec
`home`/`default` sur `fr`. Générique à toute la France, pas à une ville en
particulier : `lat`/`lon` sont volontairement `#`-désactivés (valeurs
d'exemple) — à retirer le `#` et remplacer par vos propres coordonnées
avant d'appliquer. Volontairement sans mot de passe admin ni entrée ACL —
voir la section « Format des templates » ci-dessous si vous voulez les
ajouter vous-même.

Dupliquez-le et adaptez les valeurs actives à votre site avant de
l'appliquer (au minimum `lat`/`lon`) — regardez d'abord ce qui changerait
avec `--dry-run` (CLI) ou la comparaison de l'onglet Configuration (IHM).
Une fois appliqué (si le template touche aux régions), la recommandation
officielle demande aussi de synchroniser l'horloge et de redémarrer —
hors du périmètre de cet outil : `clock sync` ne fonctionne **pas** en
connexion série directe (elle refuse toujours avec `"ERR: clock cannot
go backwards"`, quel que soit l'état de l'horloge). Réglez l'horloge du
device par le mécanisme propre à votre installation (companion/app
MeshCore), puis redémarrez-le manuellement une fois le template appliqué.

Les changements de région ne survivent pas à un redémarrage sans un
`region save` explicite (contrairement aux autres champs, persistés
automatiquement à chaque écriture) — `apply-template`/`clone` (CLI) et le
bouton « Appliquer toutes les régions » (IHM) l'envoient automatiquement
dès qu'un changement de région a réellement été appliqué.

### Template companion `templates/template-companion-fr.json`

Équivalent pour un **companion** (série ou Bluetooth) — mêmes réglages
radio que `template-fr.json`, mais un jeu de champs complètement
différent : un companion n'a ni région, ni ACL, ni la plupart des
réglages `vars` d'un répéteur (opcodes binaires dédiés, pas de CLI-texte).
Champs actifs : `name`, `lat`/`lon`, `radio`, `tx`, `multi.acks` ; les 7
autres réglages companion existants sont listés `#`-désactivés pour
référence. Balise `"device_type": "companion"` en tête — appliquer ce
fichier à un répéteur/room-server/sensor est refusé immédiatement, sans
envoyer la moindre commande.

### Variante `templates/template-fr-idf.json`

Adaptation pour la communauté Île-de-France, d'après
[wiki.mesh-idf.fr](https://wiki.mesh-idf.fr/fr/meshcore/regions_et_canaux)
( !! à vérifier !! — source communautaire, pas la recommandation officielle
meshcore.fr). Hiérarchie de régions différente : `eu` et `fr` tous deux à
la racine (pas de niveau `europe` intermédiaire), avec `fr-idf` comme
enfant de `fr` et `default` sur `fr`. `flood.max.advert`/
`flood.max.unscoped` à `16` au lieu de `8`/`5`. Si vous passez du template
national à celui-ci sur un device déjà configuré, voir `--prune`
ci-dessous pour nettoyer les régions de l'ancien template.

## Format des templates

Un template est un fichier JSON avec, au choix ou en combinaison :

```json
{
  "vars": { "name": "Mon Répéteur", "tx": 20, "...": "..." },
  "acl": { "<clé-publique-hex-64>": "admin" },
  "regions": { "fr": { "parent": "europe", "flood_allowed": true } },
  "home": "fr",
  "default": null,
  "device_type": "repeater"
}
```

- Une clé préfixée par `#` (dans `vars`, `acl` ou `regions`) documente une
  valeur sans l'appliquer — pratique pour garder un template complet en
  référence tout en ne touchant qu'à un sous-ensemble de champs. C'est
  aussi ce préfixe qui colore une ligne en orange dans l'onglet
  Configuration de l'IHM.
- `device_type` (optionnel) déclare le type de device attendu
  (`repeater`/`room_server`/`sensor`/`companion`) — vérifié contre le
  device connecté avant toute application.
- `apply-template` (CLI) accepte plusieurs fichiers d'un coup et détecte
  automatiquement le contenu de chacun — pas besoin de préciser s'il
  s'agit d'un template de variables, de régions, ou des deux.
- **`apply-template`/l'IHM ne sont jamais destructeurs par défaut** : ils
  ne touchent que ce que le fichier mentionne, jamais ce qu'il ne
  mentionne pas. En changeant de template de régions (par exemple en
  passant du template national à une variante régionale avec une
  hiérarchie différente), les régions de l'ancien template qui ne sont
  plus mentionnées restent en place, orphelines. Le flag `--prune` (CLI
  uniquement pour l'instant) supprime ces résidus (et rien d'autre) :

  ```bash
  meshcore-cfg --port /dev/ttyUSB0 apply-template templates/template-fr.json --prune --dry-run
  meshcore-cfg --port /dev/ttyUSB0 apply-template templates/template-fr.json --prune
  ```

  `--prune` reste optionnel (off par défaut, seule opération destructive
  de l'outil sur les répéteurs/room-servers/sensors) — recommandé par
  réflexe à chaque changement de template de régions, sauf si vous savez
  vouloir garder des régions ajoutées manuellement en plus.

## Licence

Usage libre pour l'instant (partage entre amis, pas encore de licence
formelle — viendra avec la publication des sources).
