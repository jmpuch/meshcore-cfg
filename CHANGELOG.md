# Changelog

Une section par version, la plus récente en haut. Le texte d'une section
devient tel quel la description de la release GitHub correspondante
(`.github/workflows/release.yml`) — l'écrire **avant** de pousser le tag.

One section per version, newest first. A section's text becomes the
matching GitHub release description as is — write it **before** pushing
the tag.

## v3.19.0

**Nouveautés**

- **Flash des cartes nRF52** (RAK4631/WisBlock, Heltec T114, …) : l'onglet
  « ESP-Flash » devient **Flash** et accepte aussi le `.zip` DFU que
  MeshCore publie pour ces cartes. La carte passe toute seule en mode
  bootloader et son nouveau port est retrouvé automatiquement ; en cas
  d'échec, la case « Carte déjà en mode bootloader » permet de flasher
  après un double appui sur reset. Même chose en ligne de commande :
  `flash <fichier>.zip` (option `--bootloader`).
- Le paquet est vérifié avant envoi (CRC16 du manifeste).
- **Mise à jour du bootloader OTAFIX** (conseillée par le flasher
  officiel) : le `.zip` SoftDevice + bootloader de ta carte est accepté,
  derrière une confirmation explicite (case dans l'onglet Flash,
  `--update-bootloader` en ligne de commande). Un paquet fait pour une
  carte d'un autre fabricant est refusé avant tout envoi. Le firmware
  MeshCore est effacé : reflashe-le juste après.

**What's new**

- **Flashing nRF52 boards** (RAK4631/WisBlock, Heltec T114, …): the
  "ESP-Flash" tab becomes **Flash** and also takes the DFU `.zip` MeshCore
  publishes for these boards. The board switches to its bootloader on its
  own and its new port is found automatically; if that fails, the "Board
  already in bootloader mode" checkbox lets you flash after pressing reset
  twice. Same on the command line: `flash <file>.zip` (`--bootloader`).
- The package is checked before sending (manifest CRC16).
- **OTAFIX bootloader update** (recommended by the official flasher):
  your board's SoftDevice + bootloader `.zip` is accepted, behind an
  explicit confirmation (checkbox in the Flash tab, `--update-bootloader`
  on the command line). A package made for another vendor's board is
  refused before anything is sent. The MeshCore firmware gets erased:
  flash it again right after.

## v3.18.1

**Nouveautés**

- La mise à jour intégrée récupère aussi les **templates** et les **packs de
  régions** de la release : un fichier que tu n'as pas encore est ajouté, un
  fichier identique est laissé tel quel, et un fichier que tu as déjà dans
  une autre version n'est **jamais écrasé** — la version de la release est
  déposée à côté sous le nom `<fichier>.new`. Le Journal liste ce qui a été
  ajouté.
- Actif pour les mises à jour lancées **depuis** la v3.18.1 : si tu es en
  v3.18.0, cette mise à jour-ci ne remplace encore que l'exécutable.

**What's new**

- The built-in update now also brings the release's **templates** and
  **region packs**: a file you don't have yet is added, an identical one is
  left as is, and a file you already have in another version is **never
  overwritten** — the release's version is saved next to it as
  `<file>.new`. The Log lists what was added.
- Applies to updates started **from** v3.18.1 on: from v3.18.0, this update
  still only replaces the executable.

## v3.18.0

**Nouveautés**

- **Mise à jour intégrée** : quand une nouvelle version est publiée, le
  bandeau bleu propose **Mettre à jour** — téléchargement de l'archive de ta
  plateforme, vérification de son empreinte SHA-256, remplacement de
  l'exécutable, puis **Relancer** redémarre dans la nouvelle version,
  réglages conservés. Rien ne se fait sans ton clic.
- Première version capable de se mettre à jour elle-même : depuis une
  version antérieure, installe celle-ci à la main une dernière fois.

**What's new**

- **Built-in update**: when a new version is published, the blue banner
  offers **Update** — downloads your platform's archive, checks its SHA-256
  digest, replaces the executable, then **Restart** relaunches into the new
  version with your settings kept. Nothing happens without your click.
- First version able to update itself: from an older version, install this
  one by hand one last time.

## v3.17.0

**Nouveautés**

- **Interface bilingue français / anglais** : sélecteur **FR | EN** à côté de
  « Taille de l'interface », changement immédiat, choix mémorisé.
- Nouveau bouton **Device->Template** (onglet Device) : transforme la
  lecture d'un device en template réutilisable — par exemple comme base d'un
  déploiement en lot — **sans** clé privée/publique ni position.

**Corrections**

- Onglet Template : les sections (Régions, ACL, Radio & réseau, Avancé) ne
  se referment plus quand on ajoute ou supprime une entrée.
- Supprimer un champ d'un template ne mélange plus l'ordre des autres
  champs (y compris dans le fichier enregistré).
- Le bouton de retrait (pack de régions, contacts et canaux privés)
  s'affiche enfin (« × » au lieu d'une case vide).
- Textes d'aide mis à jour (boutons renommés depuis la refonte), captures
  d'écran refaites, série anglaise pour le README anglais.

**What's new**

- **Bilingual French / English interface**: **FR | EN** selector next to
  "Interface size", instant switch, choice remembered.
- New **Device->Template** button (Device tab): turns a device read into a
  reusable template — e.g. as the base of a batch deploy — **without** the
  private/public key or the position.

**Fixes**

- Template tab: sections (Regions, ACL, Radio & network, Advanced) no longer
  collapse when adding or removing an entry.
- Deleting a template field no longer shuffles the other fields' order
  (saved file included).
- The remove button (region packs, private contacts and channels) now
  shows ("×" instead of an empty box).
- Help texts updated (buttons renamed since the redesign), screenshots
  retaken, English set for the English README.
