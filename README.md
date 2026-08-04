# Bandicoot Bonanza

A single-file 3D platformer stress test — a vibrant jungle platforming scene inspired by classic PS1-era mascot platformers, built entirely with procedurally generated assets in one self-contained HTML file.

## What This Is

An AI code-generation stress test: the entire game — geometry, textures, materials, character, physics, particles, and post-processing — is generated at runtime with zero external assets. One `.html` file, open it in a browser, play.

## Features

- Third-person cartoon platformer controller (run, jump, double-jump, spin attack)
- Original procedurally-built mascot character with squash-and-stretch animation
- Breakable crates with physics debris and collectible fruit
- TNT hazard crates with delayed explosions and screen shake
- Toon/cel-shaded materials, saturated tropical palette, bloom and tone mapping
- Ambient particle systems (fireflies, leaf flutter, landing dust)
- Instanced rendering and particle pooling targeting 60 FPS

## Running It

Open `index.html` in any modern browser. No build step, no install, no server required.

## Tech

- Three.js (CDN)
- Procedural Canvas/WebGL textures — no external images or model files
- Optional lightweight physics (Cannon.js or custom Verlet)

## Controls

| Input | Action |
|-------|--------|
| WASD | Move |
| Space | Jump / Double-jump |
| Click | Spin attack |

## Repo

https://github.com/scott29kelly/bandicoot-bonanza
