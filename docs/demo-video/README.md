# HRW dashboard walkthrough video

~36-second silent demo of how the prototype dashboard works (branch `feature/homepage-intro-mock`).

## Watch

Open **`hrw-water-dashboard-walkthrough.mp4`** in this folder.

## What it shows

1. Homepage intro (what / who / how)
2. Common topics
3. Click **PFAS** → jump to PFOA chart
4. **Key measures** grid (all contaminants)
5. Click **Taste & odor** → topic guide panel
6. Trust footer

## Regenerate

```bash
# Terminal 1 — dashboard dev server
cd pws/CO0118015_hrw/dashboard && npm run dev

# Terminal 2 — capture + encode
cd docs/demo-video
npm install
npx playwright install chromium
bash build-video.sh
```

Requires `ffmpeg` (`brew install ffmpeg`).
