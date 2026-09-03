# meshcore-cfg

*[🇫🇷 Version française](README.md)*

A tool (Rust) to configure [MeshCore](https://meshcore.io/) devices —
repeater, room-server, sensor, **and companion** (serial or Bluetooth) —
with a graphical interface for everyday use, and a full CLI for
advanced/scriptable usage. Applies complete configuration templates,
region assistant (44 countries), manages the ACL (admin/guest
permissions), configures a remote companion over another companion on
the LoRa mesh, and flashes ESP32 firmware natively.

> **Source code**: not published yet — this repo only distributes
> precompiled binaries (see [Releases](https://github.com/jmpuch/meshcore-cfg/releases)
> for details on each version). If there's enough interest, the source
> will follow.

## Installation

Download the archive for your system from the
[Releases](https://github.com/jmpuch/meshcore-cfg/releases) page — each
one already bundles everything needed to get started: the binary, a
[`templates/`](templates/) folder (see "Compare to a template" below),
and a [`region-packs/`](region-packs/) folder (see "Region packs" below;
the program looks for `region-packs/france.json` next to itself by
default):

- **Linux** (x86_64): `meshcore-cfg-linux-x86_64.zip`
- **Windows** (x86_64): `meshcore-cfg-windows-x86_64.zip` — the binary
  inside is self-contained, no extra DLL to install
- **macOS** (Intel + Apple Silicon, universal binary):
  `meshcore-cfg-macos-universal.zip`

Extract the archive, then make the binary executable on Linux/macOS:

```bash
unzip meshcore-cfg-linux-x86_64.zip -d meshcore-cfg   # or -windows-x86_64 / -macos-universal
chmod +x meshcore-cfg/meshcore-cfg   # Linux/macOS only
```

**Double-click the extracted binary (or run it with no arguments) to open
the graphical interface.** That's the normal entry point for most use
cases — the CLI (command line, with arguments) is still available
alongside it for advanced usage, see below. The binary needs to stay in
the same folder as the `templates/`/`region-packs/` folders extracted
next to it for those two features to work — path resolution accepts a
file either next to the binary or in its subfolder, so if you move the
binary alone later, recreating a `templates/`/`region-packs/` subfolder
next to it is enough.

**Gatekeeper (macOS)**: since the binary isn't signed/notarized with an
Apple developer account, macOS refuses to launch it on the first try
("can't be opened because it is from an unidentified developer"). Two
ways around it: **System Settings → Privacy & Security**, scroll down
to the blocked-file message and click *Open Anyway*; or from the
command line, once and for all:

```bash
xattr -d com.apple.quarantine ./meshcore-cfg
```

**Antivirus (Windows)**: an unsigned, freshly-published executable can
get flagged by some antivirus software — a common false positive for
this kind of tool (nothing to do with the code), tied to the lack of a
signature and the file's newness rather than actual suspicious
behavior. If it happens, adding an exception is enough; reporting it as
a false positive to your antivirus vendor helps get it fixed for
everyone.

## Getting started (graphical interface)

### 1. Plug in the device and pick a port

The device connects over USB (or, for a companion, can also be reached
over Bluetooth). Launch `meshcore-cfg` with no arguments: the screen
that opens offers a **USB**/**Bluetooth** choice, a port (or Bluetooth
name) picker, and a **Connect** button.

No need to say what kind of device it is (repeater, room-server, sensor,
or companion) — the program detects it automatically on connect.

**Finding your port** if the picker doesn't already show it:

- **Windows** — Device Manager → "Ports (COM & LPT)": the device
  typically shows up as `Silicon Labs CP210x USB to UART Bridge
  (COMx)` (or `CH340` depending on the board). If nothing shows up
  while the cable is plugged in, the CP210x driver is probably missing
  and needs installing manually (not always bundled with Windows by
  default).
- **Linux/macOS** — the ↻ button next to the port picker refreshes the
  list; the device shows up as `/dev/ttyUSB0` (Linux) or
  `/dev/tty.usbmodemXXXX`/`/dev/tty.usbserial-XXXX` (macOS).

### 2. Connect

Once the port is selected, click **Connect**. The status switches to
*Connecting…* then, once the device type is detected, to *Connected*
(in green), with the device type shown in parentheses (Sensor,
Repeater, Room Server, or Companion).

![Startup screen, before connecting](docs/screenshots/01-lancement.png)

*(This screenshot also shows the automatic recall of the last template
used — see step 4 — even before any connection: that's expected, the
comparison updates as soon as a device is read.)*

### 3. The Configuration tab fills in by itself

As soon as the connection is established, every attribute of the device
is read automatically (no need to click "Refresh" first) — each row of
the table appears as it's read, rather than waiting for the whole
read to finish.

![Configuration tab, with a template loaded](docs/screenshots/02-connecte-companion.png)

*(Captured without an active connection — the table/ACL/Regions look the
same once connected, with the "Valeur lue" column filled in too.)*

Each field gets its own row: the value currently read from the device,
a box to type a new value, and a **Set** button to write it. Fields
shown in orange are sensitive fields, or fields the loaded template
documents but leaves disabled (see below) — they stay visible but
never get applied until the `#` is removed from the file.

### 4. Compare against a template

The **Choose a template...** button loads a JSON configuration file
(see "Template format" below) and shows, for every field, the value
currently read **and** the value the template wants, side by side:

- **Green**: the value already matches the template — nothing to do.
- **Red**: it differs — that row's **Apply** button writes just that
  one field.
- **Orange**: a sensitive field (private key, channel secret...) or one
  deliberately disabled in the template (prefixed `#`) — never applied
  automatically, even by "Apply the whole template".

The **Apply the whole template** button, at the top, writes every
differing field at once (excluding disabled/sensitive ones). The last
template used is remembered automatically and reloaded the next time
the program starts.

## The tabs

- **Configuration** — described above: every attribute, comparison
  against a template, and (if the device has them) **ACL** and
  **Regions** sections below the main table. The **Valeur
  template** (template value) column is directly editable — live, and
  it can add a field that isn't in the template yet. Each field also
  has its own **Mask (#)** checkbox to enable/disable it without hand-
  editing the file, and **Save as...** writes this adjusted template
  to a new file. Table columns can be resized by dragging their border
  (width remembered across launches, same as the Editor), and a
  **Restart device** button sits at the top — useful after changing
  radio parameters, which only take effect after a restart.

  **Row order**: a loaded template displays in exactly the order its
  fields are written in the JSON file — comments (`#_comment...`)
  included, in their real position. Two **^ / v** buttons on each row
  let you reorder directly from the GUI; that order is what **Save
  as...** writes back out. With no template loaded, the default order
  is: identity (name, coordinates, passwords), then radio/network
  settings, then everything else.

  **ACL**: same shape as the fields table — role read, desired role (a
  guest/read-only/read-write/admin dropdown), a **Mask (#)** checkbox, a
  per-row **Apply** button, plus a **New ACL entry** row to add a public
  key that isn't there yet. An enabled ACL entry is also applied by
  **Apply whole template**, just like any other field.

  **Regions**: two indented trees side by side, **Device (read)** and
  **Template (desired)** — same layout as a CLI `region list`, with
  home/default marked (`^home`/`•default`) and one color per region
  (green = already matches, red = differs, orange = disabled in the
  template). A **Delete** button on any template region removes it
  **and all its children**, and **Clear the template** starts it over
  from scratch — none of this writes to the device, that's still
  **Apply whole template**'s job, all at once (regions absent from the
  template are always removed from the device so it ends up an exact
  mirror of the file). A collapsible **region assistant** lets you search
  a region/area (name or code) and insert its whole hierarchy in one
  click — handy for never mistyping a region code by hand. Data comes
  from JSON "region pack" files you can enable/disable right in the
  panel — see the dedicated section below for the format and how to add
  a country.

  The radio field is shown as two linked rows: **Preset radio** (an
  official regional preset name — Brazil, EU/UK (Narrow), USA/Canada...,
  23 in total) directly above **Radio** (the technical detail:
  frequency/bandwidth/SF/CR). Picking a preset fills in the Radio row;
  hand-editing a radio parameter updates the preset shown (the matching
  name, or "---" if the combination no longer matches any known preset).
  The **Radio** row itself no longer takes free-text input: bandwidth,
  spreading factor (SF), and coding rate (CR) are picked from a list of
  only the values the radio chip actually supports, and frequency stays
  a numeric field clamped to the range the firmware accepts — an
  inconsistent combination can no longer be typed in.

  The same way, a **Paste position** row directly above `lat` accepts a
  pasted `latitude, longitude` pair or an OpenStreetMap/Google Maps link
  copied from a browser — the tool extracts both coordinates with no
  ambiguity over which is which; a **Map** button on the `lat` row also
  opens OpenStreetMap in the default browser, centered on the current
  coordinates, to visually find a spot before copying its link.

  The table also scrolls horizontally, not just vertically, if the
  window is too narrow to show every column.
- **Dump** — a complete snapshot of the device's state as JSON, to save
  to a file.
- **Contacts** — the connected companion's own address book (adverts/
  DMs it has heard) — useful for finding the full public key of a
  remote device to control over LoRa (see below).

  ![Contacts tab](docs/screenshots/03-contacts.png)

- **Template / Clone** — loads a file and offers a preview (dry-run)
  then a real application, independently of the Configuration tab
  (useful for testing a template without touching what's shown
  elsewhere).
- **Editor** — creates or edits a template file **without being
  connected to a device**. "New" starts with every known field already
  present, disabled (`#`) with a neutral placeholder value — a form to
  fill in rather than a blank page where you'd have to guess field
  names; "Load a template..." reopens an existing file to edit it. Each
  field can be toggled (`#`), edited, or deleted row by row, and new
  ones can be added. Table columns can be resized by dragging their
  border, and the chosen widths are remembered across launches. Like
  the Configuration tab, the radio field is shown as two linked rows,
  **Preset radio** (23 official regional presets) and **Radio**
  (technical detail), synced both ways.
  An **ACL** section lets you add/edit/disable entries (public key +
  role) the same way, with its own **New ACL entry** row. A **Regions**
  section below lets you build the hierarchy the same way (parent, flood
  allowed, home/default), with a per-row **Delete** and a **Clear
  regions** button to start over — "New" starts it off with a disabled
  EU → Europe → FR example. The same **region assistant** as
  Configuration (search a region, insert its hierarchy in one click) is
  available here too. Same row order as the Configuration tab (the loaded
  file's own, reorderable with **^ / v**), and the same **Paste position**
  row above `lat`.
- **Commands** — paste a block of raw CLI commands (one per line, e.g. a
  meshcore.fr-style setup recipe) and run them all at once, in order.
  Blank lines and lines starting with `#` are skipped. A failing line
  (e.g. `reboot`/`clock sync`, which normally fail over a direct
  connection) doesn't stop the rest — each line's result and the final
  tally show up in the Journal. The same **region assistant** as
  Configuration/Editor is available here too: searching a region inserts
  the matching `region put`/`allowf`/`save` sequence straight into the
  command block, to review before running it.
- **ESP-Flash** — writes an already-merged `.bin` firmware. **ESP32/
  ESP32-S3 only** — Heltec V2/V3/V4 and similar; nRF52 boards (Heltec
  T114, RAK4631, ...) are not supported by this tab.

## Region packs: adding more countries to the assistant

The region assistant (Commands/Editor/Configuration) has no country
hardcoded — it reads one or more JSON "region pack" files, enabled/
disabled right in the panel itself (a checkbox per file, **+ Add a
file...**, **Reload** after a manual edit). Forty-four packs ship in
`region-packs/`:

| File | Content |
|---|---|
| `france.json` | 13 regions + 101 departments (active by default) |
| `belgique.json` | 3 regions + 10 provinces |
| `allemagne.json` | 16 Länder |
| `italie.json` | 20 regions |
| `espagne.json` | 17 autonomous communities + 2 autonomous cities |
| `suisse.json` | 26 cantons |
| `royaume-uni.json` | 4 nations + 217 counties/unitary authorities/districts (full ISO 3166-2:GB) |
| `irlande.json` | 4 provinces + 26 counties (Republic of Ireland) |
| `pays-bas.json` | 12 provinces (Caribbean territories excluded) |
| `luxembourg.json` | 12 cantons |
| `portugal.json` | 18 districts + 2 autonomous regions |
| `autriche.json` | 9 Länder |
| `suede.json` | 21 counties (län) |
| `norvege.json` | 13 counties (incl. Svalbard, Jan Mayen) |
| `danemark.json` | 5 regions |
| `finlande.json` | 19 regions |
| `islande.json` | 8 regions |
| `emirats-arabes-unis.json` | 7 emirates — its own `ae` root, not under `eu` (not in Europe) |
| `pologne.json` | 16 voivodeships |
| `tchequie.json` | 13 regions + Prague |
| `slovaquie.json` | 8 regions |
| `hongrie.json` | 19 counties + 23 cities with county rights + Budapest |
| `roumanie.json` | 41 counties + Bucharest |
| `bulgarie.json` | 28 provinces |
| `grece.json` | 13 regions + Mount Athos |
| `croatie.json` | 20 counties + Zagreb |
| `serbie.json` | 2 autonomous provinces + Belgrade + 29 districts |
| `lituanie.json` | 10 counties |
| `lettonie.json` | 43 municipalities/state cities (only official ISO level) |
| `estonie.json` | 15 counties |
| `monaco.json` | 17 wards |
| `andorre.json` | 7 parishes |
| `liechtenstein.json` | 11 municipalities |
| `saint-marin.json` | 9 municipalities (castelli) |
| `malte.json` | 68 localities (only official ISO level) |
| `chypre.json` | 6 districts |
| `slovenie.json` | 212 municipalities (only official ISO level) |
| `bosnie-herzegovine.json` | 3 entities + 10 cantons (Federation-only) |
| `montenegro.json` | 25 municipalities |
| `albanie.json` | 12 counties |
| `moldavie.json` | 37 districts/cities/units (incl. Găgăuzia, Transnistria) |
| `ukraine.json` | 27 oblasts/cities/Crimea (full ISO 3166-2:UA) |
| `bielorussie.json` | 6 oblasts + Minsk City |
| `macedoine-du-nord.json` | 80 municipalities (only official ISO level) |

Codes and labels come from Wikipedia's [ISO 3166-2](https://en.wikipedia.org/wiki/ISO_3166-2)
pages for each country (verified before generating these files, not
typed from memory) — labels other than the country itself are in
English/native spelling rather than translated, to avoid a translation
mistake; feel free to edit them in the file, no recompile needed.

Pack format:

```json
{
  "display_name": "Belgium",
  "entries": [
    { "code": "eu", "label": "Europe", "parent": null },
    { "code": "be", "label": "Belgium", "parent": "eu" },
    { "code": "be-bru", "label": "Brussels-Capital", "parent": "be" },
    { "code": "be-vlg", "label": "Flanders", "parent": "be" },
    { "code": "be-wal", "label": "Wallonia", "parent": "be" }
  ]
}
```

`parent` references another entry's `code` in the same pack (or `null`
for a root) — no imposed structure, each country defines its own depth
(a small country might only need one or two levels, France has four). A
shared `eu` (Europe) root, as above, is just a convention — all six
bundled packs use it, so their regions end up under the same "Europe"
node when several are active at once, but nothing enforces it. Every
entry, not just "leaf" ones, is searchable and insertable in the
assistant.
Write a `.json` file on this model, then **+ Add a file...** in any of
the three panels activates it everywhere.

## Companion: configure it locally, or drive a remote target over LoRa

A companion (the device plugged in locally) can be configured
directly — name, coordinates, radio, TX power, custom variables —
that's **Local (this companion)** mode, active by default.

If this companion is physically in range of **another** MeshCore
device on the LoRa mesh (a repeater, room-server, or sensor), it can
also act as a relay to configure it remotely — **Remote (via LoRa)**
mode:

![Target selector, Remote mode expanded](docs/screenshots/04-cible-distante.png)

1. Pick a contact from the dropdown (already known to the companion —
   auto-refreshed on connect, or via the ↻ button), or type a public
   key manually.
2. Enter the target device's admin password.
3. **Connect to target** — this step is **slow** (a real LoRa radio
   round-trip, potentially tens of seconds): explicit text says so
   while waiting, rather than a silent spinner.

Once a target is active, **every** tab (Configuration, Dump, Template/
Clone) acts on it instead of the local companion — an orange "ACTIVE
TARGET: ..." banner stays visible at all times in the top bar,
whichever tab is open, so it's never unclear which device the next
change actually reaches.

**Important**: the target must already be a **known** contact of the
companion (it must have heard it advertise at least once) — otherwise
the connection fails with an explicit message rather than a raw error
code.

## macOS — specifics

- **Gatekeeper** and **`xattr`**: see the Installation section above.
- **Bluetooth**: the very first time an unsigned binary touches
  Bluetooth on macOS, the system blocks access (an immediate crash,
  before any clear error message has time to show) until permission is
  granted — **not to the binary itself**, but to the app that launched
  it (Terminal.app, iTerm, or your file manager if you double-click
  it). If Bluetooth mode stays unusable: **System Settings → Privacy &
  Security → Bluetooth**, and allow the app you're launching
  `meshcore-cfg` from (Terminal, iTerm2, Finder...). Restarting that
  app after granting permission is sometimes needed too.
- **Universal binary**: a single file runs natively on both Intel and
  Apple Silicon Macs, nothing to choose at install time.

## Advanced usage (command line)

Everything the graphical interface does is also available from the
CLI, plus scriptable scenarios (`region`, `acl`, `neighbors`, `raw`,
and the companion relay-to-target mode from the command line):

```bash
meshcore-cfg --port /dev/ttyUSB0 --version
```

### Two device families

- **Repeater / room-server / sensor** — the firmware's native text CLI
  (`get`/`set <var>`), over direct USB or relayed through a companion
  on the LoRa mesh for a remote device that isn't physically reachable.
- **Companion** — the device plugged in locally on `--port`, configured
  directly (name, coordinates, radio, TX power, custom variables)
  rather than only used as a relay to a remote target. `--comp` flag,
  a different binary protocol (never plain-text CLI), always local
  (never `--target`/`--password`).

Optional device-type check before any command —
`--rep`/`--room`/`--sens`/`--comp` — useful to avoid accidentally
applying a template to the wrong device:

```bash
meshcore-cfg --port /dev/ttyUSB0 --sens get name   # refuses if it isn't a sensor
meshcore-cfg --port /dev/ttyUSB0 --comp dump       # configures the companion itself
```

A template/dump file can also tag itself
(`"device_type": "sensor"`, or `"repeater"`/`"room_server"`/`"companion"`)
— `dump` does this automatically. Without an explicit flag, a tag still
triggers a live check (safety net); with a flag, the tag must match or
the application is refused before anything is sent.

### Quick usage

Once the port is identified, the first useful move: check a repeater
against the provided template **without changing anything** —
`--dry-run` computes and shows the difference but never sends anything
to the device:

```bash
meshcore-cfg --port /dev/ttyUSB0 apply-template templates/template-fr.json --dry-run
```

Empty output (`0 field(s) changed`) means it already matches the
template. Any `Would change ...` line shows exactly what differs, to
review before applying for real (same command, without `--dry-run`).

The template file is looked up as given first, then with the
`templates/` prefix added or stripped depending on the case —
`apply-template template-fr.json` works whether the file is right next
to the binary or in a `templates/` subfolder, no matter how you typed
the path.

Every `reading <field>...` line shows the value read right after it,
on the same line — handy to follow what's happening live, and to keep a
record: `2>&1 | Tee-Object -FilePath log.txt -Append` on PowerShell (or
`2>&1 | tee -a log.txt` on Linux/macOS) captures everything printed to
a file, accumulating history across multiple runs.

Other useful commands:

```bash
# Read a field
meshcore-cfg --port /dev/ttyUSB0 get name

# Write a field
meshcore-cfg --port /dev/ttyUSB0 set tx 20

# Back up a device's whole config (vars + ACL + regions, one file)
meshcore-cfg --port /dev/ttyUSB0 dump my-repeater

# Restore it (or reproduce it on another device)
meshcore-cfg --port /dev/ttyUSB0 clone my-repeater --dry-run
meshcore-cfg --port /dev/ttyUSB0 clone my-repeater

# Region management (flood-scoping tree, not the radio frequency plan)
meshcore-cfg --port /dev/ttyUSB0 region list

# Run a block of commands (e.g. a meshcore.fr-style recipe saved to a file)
meshcore-cfg --port /dev/ttyUSB0 batch recipe.txt
# or straight from stdin:
cat recipe.txt | meshcore-cfg --port /dev/ttyUSB0 batch

# ACL management (who can administer/read this repeater — direct serial only)
meshcore-cfg --port /dev/ttyUSB0 acl list
meshcore-cfg --port /dev/ttyUSB0 acl set-perm <64-hex-char-pubkey> admin

# Direct radio neighbors (what the device has actually heard over LoRa, not a contact book)
meshcore-cfg --port /dev/ttyUSB0 neighbors
# 4C371AF9   39m ago    SNR 12.5 dB

# The LOCAL companion's own address book — full public key of each contact
# (neighbors only returns 4 bytes, not enough for --target)
meshcore-cfg --port /dev/ttyUSB0 --comp contacts
# repeater 4c371af941e6ed679ac35c4adda0540b0c5c0c9e21df50a9cc91d4cec3f0fadd FR48 RPT

# Configure a remote device via a companion radio on the LoRa mesh
meshcore-cfg --port /dev/ttyUSB0 --transport companion \
  --target <64-hex-char-target-pubkey> --password <password> get name
```

`--help` on any command (or subcommand) gives the full option details.

**Warning**: a `*-dump.json` file contains your device's **private**
identity key (`prv.key`) in the clear — keep it somewhere safe, never
share or publish it (Git repo, forum, etc.).

#### Troubleshooting (`--debug`)

The `--debug` flag (mostly useful with `--transport companion`/`--comp`,
whose protocol has no request/response correlation ID — see `--help`)
traces every frame sent/received to stderr. Combined with redirecting
to a file, that gives a full, shareable trace when something's wrong:

```bash
meshcore-cfg --port /dev/ttyUSB0 --transport companion \
  --target <64-hex-char-target-pubkey> --password <password> \
  --debug get name > trace.log 2>&1
```

**Before sharing this file**: the login frame (`CMD_SEND_LOGIN`)
contains your `--password` in the clear, in the raw bytes — strip/mask
it before publishing or sending a `--debug` trace to anyone.

### Configuring a companion (`--comp`)

```bash
meshcore-cfg --port /dev/ttyUSB0 --comp get name
meshcore-cfg --port /dev/ttyUSB0 --comp set name "MyCompanion"
meshcore-cfg --port /dev/ttyUSB0 --comp set lat 44.85413
meshcore-cfg --port /dev/ttyUSB0 --comp set radio '{"freq":869.618,"bw":125,"sf":8,"cr":5}'
meshcore-cfg --port /dev/ttyUSB0 --comp set tx 20
meshcore-cfg --port /dev/ttyUSB0 --comp dump companion-backup
meshcore-cfg --port /dev/ttyUSB0 --comp clone companion-backup --dry-run
```

Known fields: `name`, `lat`, `lon`, `radio` ({freq,bw,sf,cr}, same
display units as on a repeater — MHz/kHz), `tx`, `multi.acks`,
`custom.<key>`. Never `--target`/`--password` with `--comp` (always
local, never relayed). `region`/`acl`/`neighbors`/`raw` don't apply to
a companion (binary protocol, no text CLI) — refused with an explicit
message.

### Flashing firmware (ESP32 only for now)

```bash
# Needs an already-merged binary (bootloader + partition table + app),
# the same artifact PlatformIO produces via:
#   pio run -e <env> -t mergebin   # -> .pio/build/<env>/firmware-merged.bin
meshcore-cfg --port /dev/ttyUSB0 flash firmware-merged.bin

# --erase: wipes the ENTIRE chip before writing, not just the bytes the
# image covers. A normal flash leaves everything outside bootloader+
# partitions+app untouched — so it preserves the device's existing
# identity (public/private key). --erase forces the firmware to
# regenerate a new identity on first boot: for a genuinely new device,
# or to deliberately rotate an identity — never routinely on a device
# whose identity/settings matter.
meshcore-cfg --port /dev/ttyUSB0 flash --erase firmware-merged.bin
```

Works on ESP32/ESP32-S3 boards (Heltec V2/V3/V4 and similar) —
automatic chip detection, nothing to specify. Not yet supported: nRF52
boards (Heltec T114, RAK4631/WisBlock, etc.), which use a completely
different flashing mechanism (Nordic serial DFU) — coming in a future
version.

## Template `templates/template-fr.json`

An example template included with this repo — common configuration
fields are listed, either active or documented-disabled (a `#` prefix
on the key: the value stays visible but isn't applied). Matches the
official MeshCore France community recommendations field by field,
including `dutycycle` (European LoRa duty-cycle compliance) and the
`eu → europe → fr` region hierarchy with `home`/`default` on `fr`.
Generic to all of France, not any one city: `lat`/`lon` are
deliberately `#`-disabled (example values) — remove the `#` and
replace them with your own coordinates before applying. Deliberately
ships without an admin password or ACL entry — see "Template format"
below if you want to add your own.

Duplicate it and adapt the active values to your site before applying
(at minimum `lat`/`lon`) — check what would change first with
`--dry-run` (CLI) or the Configuration tab's comparison (GUI). Once
applied (if the template touches regions), the official recommendation
also asks you to sync the clock and reboot — outside the scope of this
tool: `clock sync` does **not** work over a direct serial connection
(it always refuses with `"ERR: clock cannot go backwards"`, regardless
of the clock's actual state). Set the device's clock through your own
installation's usual mechanism (companion/MeshCore app), then reboot it
manually once the template has been applied.

Region changes don't survive a reboot without an explicit `region
save` (unlike every other field, persisted automatically on every
write) — `apply-template`/`clone` (CLI) and the "Apply all regions"
button (GUI) send it automatically whenever a region change was
actually applied.

### Companion template `templates/template-companion-fr.json`

The equivalent for a **companion** (serial or Bluetooth) — same radio
settings as `template-fr.json`, but a completely different field set: a
companion has no regions, no ACL, and none of a repeater's `vars` fields
(dedicated binary opcodes instead, no CLI-text protocol at all). Active
fields: `name`, `lat`/`lon`, `radio`, `tx`, `multi.acks`; the other 7
companion fields that exist are listed `#`-disabled for reference. Tagged
`"device_type": "companion"` at the top — applying this file to a
repeater/room-server/sensor is refused immediately, before sending a
single command.

### `templates/template-fr-idf.json` variant

Adapted for the Île-de-France community, based on
[wiki.mesh-idf.fr](https://wiki.mesh-idf.fr/fr/meshcore/regions_et_canaux)
( !! to verify !! — community source, not the official meshcore.fr
recommendation). Different region hierarchy: `eu` and `fr` both at the
root (no intermediate `europe` level), with `fr-idf` as a child of `fr`
and `default` on `fr`. `flood.max.advert`/`flood.max.unscoped` at `16`
instead of `8`/`5`. If you're switching from the national template to
this one on an already-configured device, see `--prune` below to clean
up the previous template's regions.

## Template format

A template is a JSON file with, either alone or combined:

```json
{
  "vars": { "name": "My Repeater", "tx": 20, "...": "..." },
  "acl": { "<64-hex-char-pubkey>": "admin" },
  "regions": { "fr": { "parent": "europe", "flood_allowed": true } },
  "home": "fr",
  "default": null,
  "device_type": "repeater"
}
```

- A key prefixed with `#` (in `vars`, `acl`, or `regions`) documents a
  value without applying it — handy for keeping a complete template as
  a reference while only touching a subset of fields. This same prefix
  is also what colors a row orange in the GUI's Configuration tab.
- `device_type` (optional) declares the expected device type
  (`repeater`/`room_server`/`sensor`/`companion`) — checked against the
  connected device before anything is applied.
- `apply-template` (CLI) accepts several files at once and
  auto-detects the content of each — no need to say whether it's a
  vars template, a region template, or both.
- **`apply-template`/the GUI are never destructive by default**: they
  only touch what the file mentions, never what it doesn't. When
  switching region templates (e.g. going from the national template to
  a regional variant with a different hierarchy), the previous
  template's regions that are no longer mentioned stay in place,
  orphaned. The `--prune` flag (CLI only for now) removes those
  leftovers (and nothing else):

  ```bash
  meshcore-cfg --port /dev/ttyUSB0 apply-template templates/template-fr.json --prune --dry-run
  meshcore-cfg --port /dev/ttyUSB0 apply-template templates/template-fr.json --prune
  ```

  `--prune` stays optional (off by default — the only destructive
  operation this tool has on repeaters/room-servers/sensors) —
  recommended as a reflex on every region template change, unless you
  know you want to keep manually-added regions on top.

## License

Free to use for now (shared among friends, no formal license yet — will
come with the source code publication).
