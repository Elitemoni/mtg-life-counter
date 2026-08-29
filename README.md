# MTG Life Counter

A focused two-player life counter built with React Native, Expo SDK 54, and TypeScript. The SDK is intentionally pinned for Expo Go client 54 compatibility. The upper player view is rotated 180° so both players can read and control their own side of a phone across the table.

## What is included

- Two mirrored player panels with bounded left-side `−1` and right-side `+1` controls
- A cumulative change badge that batches rapid taps, then writes one clear history entry
- Gain badges sit above the number's right edge; loss badges sit above its left edge
- Inline shared life tables numbered from row 0, with both players' totals on every change
- An inline paintbrush palette with eight presets plus a rainbow precision-color grid
- A compact center rail that expands to reveal evenly spaced icon-only match controls
- Multi-game match tracking with condensed final scores and change counts
- Starting-life presets for 20, 30, and 40, plus one-point fine adjustment
- Optional haptic feedback and screen wake lock
- Local preference persistence via AsyncStorage
- Android cutout and navigation-bar safe areas

Match history is intentionally session-based: finishing a game archives its final totals inside the current match. Resetting the entire match clears the archive, while preferences remain saved on the device.

## Run it

Prerequisites: Node.js, the Expo Go app or an Android emulator, and npm.

```bash
npm install
npm run start
```

Then scan the QR code with Expo Go, or press `a` in the Expo terminal to open Android. If an Android emulator is already running, use:

```bash
npm run android
```

Useful checks:

```bash
npm run typecheck
npm run export:android
```

## Interaction notes

- Each tap changes life immediately.
- Taps within 1.3 seconds are grouped. Five quick `+1` taps show `+5`, then add one `20 → 25` transcript entry when the badge fades.
- Tap the ledger icon inside either panel to animate its current life into the upper-left and reveal both players' numbered transcript in place. Tap the heart to return to the counter.
- Use the bottom-right paintbrush for preset colors or the inline precision-color grid.
- Tap the gold center button to reveal evenly spaced next-game and match-history icons on the left, with settings on the right. The life totals and ± controls remain stationary while the rail expands.
- Press and hold the circular next-game arrow to archive the current game and start another. The match-history icon opens an inline match screen where the entire match can be reset.
- The life total and its ring animate together into history and return together to the center.
- Player colors, starting-life fine adjustment, haptics, and screen behavior are kept in the only popup: **Settings**.

## Android publishing later

The project already has an Android application ID (`com.moni.lifeledger`) and version code. Before a Play Store release, replace the placeholder Expo icon assets, confirm that the application ID is the permanent unique ID you want, add store metadata, and configure an EAS production build.
