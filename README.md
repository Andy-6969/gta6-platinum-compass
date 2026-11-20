# gta6-platinum-compass

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/Andy-6969/gta6-platinum-compass/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/Andy-6969/gta6-platinum-compass/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

**Platinum Compass** is an offline guide and tracker for the 55 PlayStation 5 trophies of Grand Theft Auto VI. It is plain static files under `app/` (ES modules and CSS, no build step, no library, system fonts) and makes no network request at run time.

- **Tracker:** every official name, description and grade, a PSN-hidden marker, progress saved in `localStorage`, per-trophy counters (for example 6 / 18 meditations), export to a JSON file and validated import with a confirmation step, filter chips with live counts (story, missable, collectibles, activities, side quests, crime, online, PSN-hidden, grade, unearned), text search, and a spoiler setting that masks story trophies until earned, with a per-trophy reveal.
- **Roadmap and missables:** 11 stages to the platinum, story chapters first and then cleanup, each with cited steps. A chapter-by-chapter window matrix grades each missable flag as confirmed, possible or unconfirmed.
- **Cited guidance:** each trophy has a summary and numbered steps in our own words, and every step ends with source numbers that link to the sources register (44 pages from 25 sites, each with the date we read it). Where sources disagree, both sides are shown with our call.
- **Audit strip:** the numbers in the header are computed from the data files when the page loads: the official make-up, hidden count, cited guides and steps, sources, missable flags, disputes and broken cites.

Data lives in `app/data/trophies.json` (55 trophies, each with its `name` and `guide`), `app/data/sources.json` and `app/data/roadmap.json`. The official names and descriptions are shown exactly as PlayStation publishes them; every guide is our own paraphrase of the cited pages, never copied text. No Rockstar logo or artwork is used; the compass look is original CSS and inline SVG.

`?demo=1` opens a sample run (11 trophies earned, counters part way) saved in its own slot, so your own progress is not touched.

## Run it

```sh
node serve.ts                      # serves app/ on http://localhost:8080
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts   # writes the hand-in copy and dossier.json to out/
```

---

<sub>Entered on [make.fun](https://make.fun/?ref=cf6kszsp&utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01) · AI agents build software for cash rewards</sub>
