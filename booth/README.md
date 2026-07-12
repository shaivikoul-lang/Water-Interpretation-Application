# Booth kit — Highlands Ranch Water

Materials for showcasing the app at an HRW event.

## Site link

Live site (landing page): **https://shaivikoul-lang.github.io/Water-Interpretation-Application/**

## QR code

[`qr-code.png`](qr-code.png) points to the live site landing page. Print it large for the booth (it uses high error correction, so it stays scannable even at small sizes or with minor smudging).

Regenerate it if the site URL changes:

```bash
python3 -m pip install --target=.qrtmp "qrcode[pil]"   # one-time, into a local temp dir
PYTHONPATH=.qrtmp python3 - <<'PY'
import qrcode
from qrcode.constants import ERROR_CORRECT_H
url = "https://shaivikoul-lang.github.io/Water-Interpretation-Application/"
qr = qrcode.QRCode(error_correction=ERROR_CORRECT_H, box_size=20, border=4)
qr.add_data(url); qr.make(fit=True)
qr.make_image(fill_color="#102a4c", back_color="white").save("booth/qr-code.png")
PY
```

## Feedback form (Google Forms)

1. Create a new Google Form ("Highlands Ranch Water — App Feedback").
2. Add the questions below.
3. Click **Send → link (forms.gle/...)** and copy the short URL.
4. Paste that URL into the `href` of the "Share your feedback" button in the root
   [`index.html`](../index.html) (replace `https://forms.gle/REPLACE_WITH_YOUR_FORM`).
5. Responses collect automatically under the form's **Responses** tab (export to Sheets if desired).

### Suggested questions

Short title / linear-scale / multiple-choice mix so it takes under a minute at a booth.

1. **Which view did you try?** (Checkboxes) — Dashboard View / Classic View / Both
2. **How easy was it to understand your water information?** (Linear scale 1-5: Very confusing → Very clear)
3. **After using this, how do you feel about your drinking water?** (Multiple choice) — More informed and reassured / About the same / I have new questions / Concerned
4. **Was anything confusing or unclear?** (Short answer)
5. **What would you most like to see added?** (Checkboxes) — Explanation of what each contaminant means / What to do if a level is high / Comparison to other towns / How my water is treated / A way to test my own tap / Other
6. **Did the charts/tables make the trends over time clear?** (Linear scale 1-5)
7. **Would you share this with a neighbor or recommend it?** (Multiple choice) — Yes / Maybe / No
8. **How did you hear about this tool?** (Multiple choice) — HRW event/booth / Friend or neighbor / Online / Other
9. **Anything else you'd like the team to know?** (Long answer, optional)
10. **(Optional) Email if you'd like a follow-up.** (Short answer)
