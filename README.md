# meshcore-repeater-cfg

CLI (Rust) pour configurer des répéteurs [MeshCore](https://meshcore.co.uk/)
— port du configurateur web officiel
[`config.meshcore.io`](https://github.com/meshcore-dev/config.meshcore.io),
avec en plus l'application de templates de configuration complets, la
gestion de l'arbre de régions, la gestion de l'ACL (droits admin/guest), et
la possibilité de configurer un répéteur **distant** via un companion radio
sur le mesh LoRa, sans y être physiquement connecté.

> **Sources** : pas encore publiées — cette v1.0.0 distribue uniquement les
> binaires précompilés. Si l'outil intéresse plus largement, les sources
> suivront.

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

## Usage rapide

Le device se branche en USB. Sous Linux le port ressemble à
`/dev/ttyUSB0`, sous Windows à `COM3`.

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

# Appliquer un template — auto-détecte vars/régions/les deux, un ou plusieurs fichiers
meshcore-repeater-cfg --port /dev/ttyUSB0 apply-template templates/paris-repeater.json --dry-run
meshcore-repeater-cfg --port /dev/ttyUSB0 apply-template templates/paris-repeater.json

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

## Template `templates/paris-repeater.json`

Un exemple de template complet fourni avec ce repo — tous les champs
supportés par l'outil y sont listés, actifs ou documentés-désactivés
(préfixe `#` devant la clé : la valeur reste visible mais n'est pas
appliquée). Basé sur les recommandations officielles de la communauté
MeshCore France, avec les coordonnées de Paris et une hiérarchie de
régions `eu → europe → fr → paris` en exemple.

Dupliquez-le et adaptez les valeurs actives à votre site avant de
l'appliquer — regardez d'abord ce qui changerait avec `--dry-run`.

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
