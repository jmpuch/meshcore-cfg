# meshcore-repeater-cfg

*[🇫🇷 Version française](README.md)*

A Rust CLI to configure [MeshCore](https://meshcore.io/) repeaters — on
top of the usual field-by-field config, it adds applying full
configuration templates, managing the region tree, managing the ACL
(admin/guest permissions), and configuring a **remote** repeater over a
companion radio on the LoRa mesh, without being physically connected to
it.

> **Source code**: not published yet — this repo only distributes
> precompiled binaries (see [Releases](https://github.com/jmpuch/meshcore-repeater-cfg/releases)
> for details on each version). If there's enough interest, the source
> will follow.

## Installation

Download the binary for your system from the
[Releases](https://github.com/jmpuch/meshcore-repeater-cfg/releases) page:

- **Linux** (x86_64): `meshcore-repeater-cfg-linux-x86_64`
- **Windows** (x86_64): `meshcore-repeater-cfg-windows-x86_64.exe` —
  self-contained, no extra DLL to install
- **macOS** (Intel + Apple Silicon, universal binary):
  `meshcore-repeater-cfg-macos-universal`

```bash
# Linux/macOS: make the binary executable
chmod +x meshcore-repeater-cfg-linux-x86_64   # or -macos-universal
./meshcore-repeater-cfg-linux-x86_64 --version
```

```powershell
# Windows
.\meshcore-repeater-cfg-windows-x86_64.exe --version
```

**Gatekeeper (macOS)**: since the binary isn't signed/notarized under an
Apple developer account, macOS refuses to run it the first time ("cannot
be opened because it is from an unidentified developer"). Two ways
around it: **System Settings → Privacy & Security**, scroll down to the
blocked-file notice and click *Open Anyway*; or from the command line,
once and for all:

```bash
xattr -d com.apple.quarantine ./meshcore-repeater-cfg-macos-universal
```

**Antivirus (Windows)**: an unsigned, freshly published executable can
get flagged by some antivirus software (seen with Avast) — this is a
common false positive for this kind of tool (nothing to do with the
code), caused by the lack of a signature and the file being new rather
than any actual suspicious behavior. If it happens, adding an exception
is enough; reporting it as a false positive to your antivirus vendor
helps get it fixed for everyone.

## Finding your port

The device connects over USB. On Linux the port looks like
`/dev/ttyUSB0`, on Windows like `COM3`.

**Windows** — Device Manager → "Ports (COM & LPT)": the device typically
shows up as `Silicon Labs CP210x USB to UART Bridge (COMx)` (or `CH340`
depending on the board) — the port number is in parentheses. From the
command line (PowerShell):

```powershell
Get-PnpDevice -Class Ports -PresentOnly | Format-Table Name, InstanceId -AutoSize
```

If no port shows up while the cable is plugged in, it's probably the
CP210x driver that needs installing manually (not always present by
default on Windows).

**Linux** — `ls /dev/ttyUSB*` (or `dmesg | tail` right after plugging in
the cable, to see the assigned port).

## Quick usage

Once you've identified the port, the first useful move: check a
repeater's state against the provided template, **without changing
anything** — `--dry-run` computes and prints the diff but never sends
anything to the device:

```bash
meshcore-repeater-cfg --port /dev/ttyUSB0 apply-template templates/template-fr.json --dry-run
```

Empty output (`0 field(s) changed`) means it already matches the
template. Any `Would change ...` line shows exactly what differs — check
it before applying for real (same command, without `--dry-run`).

The template file is looked up as given first, then with the
`templates/` prefix added or stripped depending on the case —
`apply-template template-fr.json` works whether the file sits right next
to the binary or in a `templates/` subfolder, however you typed the
path.

Each `reading <field>...` line shows the value read right after it, on
the same line — handy to follow along live, and to keep a record:
`2>&1 | Tee-Object -FilePath log.txt -Append` on PowerShell (or
`2>&1 | tee -a log.txt` on Linux/macOS) captures everything printed into
a file, accumulating history across runs.

Other useful commands:

```bash
# Read a field
meshcore-repeater-cfg --port /dev/ttyUSB0 get name

# Write a field
meshcore-repeater-cfg --port /dev/ttyUSB0 set tx 20

# Back up a device's entire config (vars + ACL + regions, one single file)
meshcore-repeater-cfg --port /dev/ttyUSB0 dump my-repeater

# Restore it (or reproduce it on another device)
meshcore-repeater-cfg --port /dev/ttyUSB0 clone my-repeater --dry-run
meshcore-repeater-cfg --port /dev/ttyUSB0 clone my-repeater

# Manage regions (flood-scoping tree, not the radio frequency)
meshcore-repeater-cfg --port /dev/ttyUSB0 region list

# Manage the ACL (who can administer/read this repeater — direct serial only)
meshcore-repeater-cfg --port /dev/ttyUSB0 acl list
meshcore-repeater-cfg --port /dev/ttyUSB0 acl set-perm <64-hex-char-public-key> admin

# Configure a remote device via a companion radio on the LoRa mesh
meshcore-repeater-cfg --port /dev/ttyUSB0 --transport companion \
  --target <64-hex-char-public-key-of-target-device> --password <password> get name
```

`--help` on any command (or subcommand) gives the full list of options.

**Warning**: a `*-dump.json` file contains your device's identity
**private key** (`prv.key`) in clear text — keep it somewhere safe, never
share or publish it (Git repo, forum, etc.).

### If something goes wrong (`--debug`)

The `--debug` flag (mostly useful with `--transport companion`, whose
protocol has no request/reply correlation ID — see `--help`) traces every
frame sent/received to stderr. Combined with redirecting to a file, this
gives a complete, shareable trace when something goes wrong:

```bash
meshcore-repeater-cfg --port /dev/ttyUSB0 --transport companion \
  --target <64-hex-char-public-key-of-target-device> --password <password> \
  --debug get name > trace.log 2>&1
```

Verified: `trace.log` then contains the version banner, every
`DEBUG send_frame:`/`DEBUG read_frame:` line (opcode + raw bytes) of the
handshake, the login, and the command exchange, followed by the final
result — everything needed to diagnose a stuck session or share it for
help.

**Before sharing this file**: the login frame (`CMD_SEND_LOGIN`) contains
your `--password` in clear text within the raw bytes (verified:
`changeme` shows up as-is, in ASCII, in the sent frame) — strip/redact it
before publishing or sending a `--debug` trace to anyone.

## Template `templates/template-fr.json`

An example template shipped with this repo — common configuration fields
are listed, either active or documented-but-disabled (`#` prefix on the
key: the value stays visible but isn't applied). Matches, field by field,
the official recommendations from the MeshCore France community
(verified 2026-08-17), including `dutycycle` (European LoRa duty-cycle
compliance) and the `eu → europe → fr` region hierarchy with `home`/
`default` set to `fr`. Generic to all of France, not to a specific city:
`lat`/`lon` are intentionally `#`-disabled (example values) — remove the
`#` and replace with your own coordinates before applying. Intentionally
ships without an admin password or ACL entry — see the "Template format"
section below if you want to add your own.

Duplicate it and adapt the active values to your site before applying it
(`lat`/`lon` at the very least) — check what would change with
`--dry-run` first. Once applied (if the template touches regions), the
official recommendation also asks you to sync the clock and reboot —
outside the scope of this tool: `clock sync` does **not** work over a
direct serial connection (it always fails with `"ERR: clock cannot go
backwards"`, regardless of the clock's actual state — confirmed on real
hardware). Set the device's clock through your own setup's own mechanism
(companion/MeshCore app), then reboot it manually once the template has
been applied.

Region changes don't survive a reboot without an explicit `region save`
(unlike other fields, persisted automatically on every write) —
`apply-template`/`clone` now send it automatically whenever a region
change was actually applied, confirmed by `region save: OK (persisted
across reboot)` in the output.

## Template format

A template is a JSON file with, alone or combined:

```json
{
  "vars": { "name": "My Repeater", "tx": 20, "...": "..." },
  "acl": { "<64-hex-char-public-key>": "admin" },
  "regions": { "fr": { "parent": "europe", "flood_allowed": true } },
  "home": "fr",
  "default": null
}
```

- A key prefixed with `#` (in `vars`, `acl`, or `regions`) documents a
  value without applying it — handy to keep a complete template as a
  reference while only touching a subset of fields.
- `apply-template` accepts several files at once and auto-detects the
  content of each one — no need to specify whether a file is a vars
  template, a region template, or both.

## License

Free to use for now (shared among friends, no formal license yet — will
come with the source code release).
