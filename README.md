# meshcore-repeater-cfg

CLI (Rust) pour configurer des répéteurs [MeshCore](https://meshcore.io/)
— avec en plus l'application de templates de configuration complets, la
gestion de l'arbre de régions, la gestion de l'ACL (droits admin/guest), et
la possibilité de configurer un répéteur **distant** via un compagnon radio
sur le mesh LoRa, sans y être physiquement connecté.

> **Sources** : pas encore publiées — ce repo distribue uniquement les
> binaires précompilés (voir [Releases](https://github.com/jmpuch/meshcore-repeater-cfg/releases)
> pour le détail de chaque version). Si l'outil intéresse plus largement,
> les sources suivront.

## Installation

Télécharger le binaire correspondant à votre système depuis la page
[Releases](https://github.com/jmpuch/meshcore-repeater-cfg/releases) :

- **Linux** (x86_64) : `meshcore-repeater-cfg`
- **Windows** (x86_64) : `meshcore-repeater-cfg.exe` — autonome, aucune
  DLL supplémentaire à installer

```bash
# Linux : rendre le binaire exécutable
chmod +x meshcore-repeater-cfg
./meshcore-repeater-cfg --version
```

```powershell
# Windows
.\meshcore-repeater-cfg.exe --version
```

**Antivirus (Windows)** : un exécutable non signé et tout juste publié peut
se faire signaler par certains antivirus (rencontré avec Avast) — c'est un
faux positif habituel pour ce genre d'outil (rien à voir avec le code), lié
à l'absence de signature et à la nouveauté du fichier plutôt qu'à un
comportement suspect réel. Si ça arrive, ajouter une exception suffit ; le
signaler comme faux positif à l'éditeur de votre antivirus aide à corriger
ça pour tout le monde.

## Trouver son port

Le device se branche en USB. Sous Linux le port ressemble à
`/dev/ttyUSB0`, sous Windows à `COM3`.

**Windows** — Gestionnaire de périphériques → « Ports (COM & LPT) » : le
device apparaît typiquement comme `Silicon Labs CP210x USB to UART Bridge
(COMx)` (ou `CH340` selon la board) — le numéro de port est entre
parenthèses. En ligne de commande (PowerShell) :

```powershell
Get-PnpDevice -Class Ports -PresentOnly | Format-Table Name, InstanceId -AutoSize
```

Si aucun port n'apparaît alors que le câble est branché, c'est
probablement le driver CP210x à installer manuellement (pas toujours
présent par défaut sur Windows).

**Linux** — `ls /dev/ttyUSB*` (ou `dmesg | tail` juste après avoir
branché le câble pour voir le port assigné).

## Usage rapide

Une fois le port identifié, le premier réflexe utile : vérifier l'état
d'un répéteur par rapport au template fourni, **sans rien modifier** —
`--dry-run` calcule et affiche l'écart mais n'envoie jamais rien au
device :

```bash
meshcore-repeater-cfg --port /dev/ttyUSB0 apply-template templates/template-fr.json --dry-run
```

Sortie vide (`0 field(s) changed`) = conforme au template. Toute ligne
`Would change ...` montre exactement ce qui diffère, à valider avant
d'appliquer pour de vrai (même commande, sans `--dry-run`).

Le fichier template est cherché tel quel d'abord, puis avec le préfixe
`templates/` ajouté ou retiré selon le cas — `apply-template
template-fr.json` fonctionne donc que le fichier soit directement à
côté du binaire ou dans un sous-dossier `templates/`, quelle que soit la
façon dont vous avez tapé le chemin.

Chaque `reading <champ>...` affiche la valeur lue juste derrière, sur la
même ligne — pratique pour suivre ce qui se passe en direct, et pour
garder une trace : `2>&1 | Tee-Object -FilePath log.txt -Append` sous
PowerShell (ou `2>&1 | tee -a log.txt` sous Linux/macOS) capture tout ce
qui s'affiche dans un fichier, en accumulant l'historique entre plusieurs
exécutions.

Autres commandes utiles :

```bash
# Lire un champ
meshcore-repeater-cfg --port /dev/ttyUSB0 get name

# Écrire un champ
meshcore-repeater-cfg --port /dev/ttyUSB0 set tx 20

# Sauvegarder toute la config d'un device (vars + ACL + régions, un seul fichier)
meshcore-repeater-cfg --port /dev/ttyUSB0 dump mon-repeteur

# La restaurer (ou la reproduire sur un autre device)
meshcore-repeater-cfg --port /dev/ttyUSB0 clone mon-repeteur --dry-run
meshcore-repeater-cfg --port /dev/ttyUSB0 clone mon-repeteur

# Gestion des régions (arbre de scoping du flood, pas la fréquence radio)
meshcore-repeater-cfg --port /dev/ttyUSB0 region list

# Gestion de l'ACL (qui peut administrer/lire ce répéteur — série directe uniquement)
meshcore-repeater-cfg --port /dev/ttyUSB0 acl list
meshcore-repeater-cfg --port /dev/ttyUSB0 acl set-perm <clé-publique-hex-64> admin

# Configurer un device distant via un companion radio sur le mesh LoRa
meshcore-repeater-cfg --port /dev/ttyUSB0 --transport companion \
  --target <clé-publique-hex-64-du-device-cible> --password <mot-de-passe> get name
```

`--help` sur n'importe quelle commande (ou sous-commande) donne le détail
complet des options.

## Template `templates/template-fr.json`

Un exemple de template fourni avec ce repo — les champs de configuration
courants y sont listés, actifs ou documentés-désactivés (préfixe `#` devant
la clé : la valeur reste visible mais n'est pas appliquée). Correspond
champ par champ aux recommandations officielles de la communauté MeshCore
France (vérifié 2026-08-17), y compris `dutycycle` (respect du duty-cycle
LoRa européen) et la hiérarchie de régions `eu → europe → fr` avec
`home`/`default` sur `fr`. Générique à toute la France, pas à une ville en
particulier : `lat`/`lon` sont volontairement `#`-désactivés (valeurs
d'exemple) — à retirer le `#` et remplacer par vos propres coordonnées
avant d'appliquer. Volontairement sans mot de passe admin ni entrée ACL —
voir la section « Format des templates » ci-dessous si vous voulez les
ajouter vous-même.

Dupliquez-le et adaptez les valeurs actives à votre site avant de
l'appliquer (au minimum `lat`/`lon`) — regardez d'abord ce qui changerait
avec `--dry-run`. Une
fois appliqué (si le template touche aux régions), la recommandation
officielle demande aussi de synchroniser l'horloge et de redémarrer :

```bash
meshcore-repeater-cfg --port /dev/ttyUSB0 raw "clock sync"
meshcore-repeater-cfg --port /dev/ttyUSB0 raw "reboot"
```

Les changements de région ne survivent pas à un redémarrage sans un
`region save` explicite (contrairement aux autres champs, persistés
automatiquement à chaque écriture) — `apply-template`/`clone` l'envoient
désormais automatiquement dès qu'un changement de région a réellement été
appliqué, confirmé par `region save: OK (persisted across reboot)` dans la
sortie.

## Format des templates

Un template est un fichier JSON avec, au choix ou en combinaison :

```json
{
  "vars": { "name": "Mon Répéteur", "tx": 20, "...": "..." },
  "acl": { "<clé-publique-hex-64>": "admin" },
  "regions": { "fr": { "parent": "europe", "flood_allowed": true } },
  "home": "fr",
  "default": null
}
```

- Une clé préfixée par `#` (dans `vars`, `acl` ou `regions`) documente une
  valeur sans l'appliquer — pratique pour garder un template complet en
  référence tout en ne touchant qu'à un sous-ensemble de champs.
- `apply-template` accepte plusieurs fichiers d'un coup et détecte
  automatiquement le contenu de chacun — pas besoin de préciser s'il s'agit
  d'un template de variables, de régions, ou des deux.

## Licence

Usage libre pour l'instant (partage entre amis, pas encore de licence
formelle — viendra avec la publication des sources).
