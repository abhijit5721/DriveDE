# DriveDE Demo Video Pipeline (DRI-17)

Isolated sub-project — the app build never touches this folder (excluded from root
eslint + vitest; has its own package.json, deliberately NOT an npm workspace).

## Pipeline

1. `npm run dump-state` — dump hand-played app state from IndexedDB → `fixtures/seed-state.json`
2. `npm run record` — Playwright + CDP virtual-time frame stepping → `frames/<scene>-<lang>/`
   (requires the app dev server on 127.0.0.1:5173; localhost auto-grants Pro)
3. `npm run assemble` — system ffmpeg → near-lossless clips in `public/` (Remotion staticFile root)
4. `npm run studio` — iterate on composition
5. `npm run render:de && npm run render:en && npm run posters` — final MP4s + posters → ../public/
6. `npm run qa` — ffprobe assertions + scene-midpoint stills for visual review

## Licensing

Remotion's license is free for individuals and companies of up to 3 people
(https://remotion.dev/license). DriveDE qualifies. Re-check if the team grows.
