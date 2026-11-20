// Platinum Compass, an offline guide and tracker for the 55 PS5 trophies of Grand Theft Auto VI (make.fun bounty
// gta6-trophy-guide-01). The guide is app/: plain ES modules and CSS with no build step and no library, loading only
// its own files. app/data/ holds trophies.json (the official names, descriptions and grades with our cited guides,
// counters and missable windows), sources.json (every page read, numbered as the guides cite it) and roadmap.json
// (chapter columns and the stages to the platinum).
//
// This program hands the guide in: it copies app/ and screenshots/ (the cover first by name; shots.json says what each
// one shows) to /output and writes /output/dossier.json with the vendored make.fun library, which must stay byte for
// byte as the kit shipped it.
//
// Serve it locally with `node serve.ts`, then open http://localhost:8080 (add ?demo=1 for a sample run).
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes the bytes; the others refuse an entry the
// scorer would refuse (more than 4 screenshots or one over 256 KiB; more than 993 files and directories in app/ or
// 48 MiB of app files: app/ counts beside /output's own 1000-entry cap, its screenshots/ and dossier.json).
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, { text_max_bytes: 163840, screenshots: { max: 4, max_bytes: 262144 }, app_max_files: 993, app_max_bytes: 50331648 }),
);
