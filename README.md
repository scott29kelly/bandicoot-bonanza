# Bandicoot Bonanza

A complete 3D platformer in a single HTML file — a vibrant jungle adventure inspired by classic PS1-era mascot platformers, with every asset procedurally generated at runtime.

## What This Is

A real, playable game with zero external assets: geometry, textures, materials, character, physics, particles, audio, and UI are all generated in the browser. One `index.html`, open it and play.

## Features

- Full game loop: title screen, lives, checkpoints, game over, and victory sequence
- Third-person cartoon platformer controller (run, jump, double-jump, spin attack)
- Original procedurally-built mascot hero with squash-and-stretch animation
- Breakable crates with physics debris, collectible fruit, and TNT hazards
- Rolling-log obstacles and pit jumps with checkpoint respawns
- Procedural Web Audio sound effects and ambient jungle melody (mute toggle included)
- Toon/cel-shaded materials, saturated tropical palette, bloom and tone mapping
- Instanced rendering and particle pooling targeting 60 FPS

## How to Play

Open `index.html` in any modern browser. No build step, no install, no server required.

**Objective:** Reach the temple gate at the end of the path. Collect 80%+ of the fruit for a perfect-run bonus.

## Controls

| Input | Action |
|-------|--------|
| WASD | Move |
| Space | Jump / Double-jump |
| Click | Spin attack |
| Enter | Start / Retry |
| M | Mute audio |

## Tech

- Three.js (CDN)
- Procedural Canvas/WebGL textures — no external images or model files
- Web Audio API for all sound
- Optional lightweight physics (Cannon.js or custom Verlet)

## Repo

https://github.com/scott29kelly/bandicoot-bonanza
