# CrossScope Project Page

Static academic project page for the anonymous CrossScope manuscript.

## Preview

```powershell
python -m http.server 4173 --directory .
```

Open `http://localhost:4173/`. The Paper button opens the included manuscript at `static/pdfs/CrossScope.pdf`.

## Sources and attribution

Technical claims, metrics, and figures are drawn from the supplied `CrossScope.pdf` manuscript. The page structure and styling strictly adapt the SurgSLOT `website` branch, which is released under CC BY-SA 4.0 and acknowledges Nerfies.

To regenerate the local paper figures:

```powershell
python scripts/extract_paper_assets.py --pdf "C:/path/to/CrossScope.pdf" --out static/images
```
