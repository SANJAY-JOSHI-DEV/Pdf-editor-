# PDF Desk — private, in-browser PDF editor

Everything runs in your browser. No server, no upload, no login.

**Live app:** https://sanjay-joshi-dev.github.io/Pdf-editor-/ (after GitHub Pages is switched on, see below)

## Features
- **Home screen** with one-tap jobs: Edit PDF, Remove watermark, Add watermark, PDF → Text/Word, Text → PDF, Photos → PDF, Merge, Compress, Sign.
- **Remove watermark automatically:** scans every page, shows pictures of what repeats, is tilted or faded (watermark images, logos, diagonal text, Acrobat watermarks), and deletes the ticked items for real. Also: remove by typed text, by drawing a box, or paint over (scanned pages).
- **Add your own watermark:** text or logo, tilt, position, tiled pattern, chosen pages; movable/rotatable afterwards; copy to or delete from all pages.
- **Edit text:** tap a line, type the new text — the original is deleted from the file.
- **Convert:** PDF → Text (copy all, keeps symbols like α ≥ μm² → H₂O), PDF → Word (.docx), **OCR** for scans and broken Hindi (fixes only the broken lines), PDF → JPG, Text → PDF (Hindi with a Devanagari font), Photos → PDF, Compress, Merge.
- Drawing, highlight, shapes, eraser, images, signature, forms, find & highlight, page numbers, pages (rotate, delete, reorder, extract, split), undo/redo, metadata removal.

## Security
- Files are processed only in the browser; the only network requests go to this site and cdn.jsdelivr.net (libraries).
- Libraries are version-pinned with Subresource Integrity hashes.
- Strict Content-Security-Policy: no eval (only WebAssembly for OCR), no inline event handlers, scripts only from this page (hash-pinned) and jsDelivr.
- pdf.js runs with `isEvalSupported: false` (mitigates malicious-font exploits such as CVE-2024-4367).
- All file names, form field names, search text and stored settings are escaped/validated before being shown.
- Tested: XSS via file name, form fields, search, annotations and tampered localStorage; 9 corrupted/fuzzed PDFs (no crash).

Files: `index.html` (the whole app), `manifest.json`, `sw.js`, `icon-192.png`, `icon-512.png`.

## Deploy on GitHub Pages (10 steps)

1. Create a new GitHub repository (public, or private on a paid plan).
2. Click **Add file → Upload files**.
3. Upload `index.html`, `manifest.json`, `sw.js`, `icon-192.png`, `icon-512.png` to the repository root.
4. Commit to the `main` branch.
5. Open **Settings → Pages**.
6. Under **Build and deployment**, choose **Deploy from a branch**.
7. Pick branch `main`, folder `/ (root)`, then **Save**.
8. Wait 1–2 minutes and open `https://<your-user>.github.io/<repo>/`.
9. On Android Chrome: menu ⋮ → **Add to Home screen** / **Install app**.
10. After an update, reload the page twice (the service worker fetches the new version on the first load).

The first visit needs internet to download the PDF libraries from cdn.jsdelivr.net; after that they are cached for offline use.

## 15-minute test checklist

1. **Watermark (auto):** Open a 3-page text PDF with a text watermark → Watermark → Auto → type the text (e.g. `confidential`) → Remove. Download, open `*_edited.pdf` in another viewer (Chrome's viewer, Adobe, Drive): the watermark is gone and body text is still selectable.
2. **Hindi text:** Text tool → tap a page → type Hindi → Font → *Upload TTF/OTF font…* → choose e.g. `NotoSansDevanagari-Regular.ttf` → OK. Download and check that conjuncts (क्ष, स्त) and the ि matra look right in another viewer.
3. **Highlight + signature:** Highlight a line; Sign → draw → Place, then drag it into position. Download and confirm both appear.
4. **Pages:** Select page 2 → Delete. Select page 1 → Rotate right. Pages → Merge another PDF → insert after page 2. Download and check the order: old p1 (rotated), old p3, merged pages.
5. **Undo/redo:** Press Undo 5 times, Redo 2 times. The Undo/Redo button tooltips name each step; the document should match that point in history.
6. **Android Chrome:** Open a file, pinch to zoom, pick Pen and draw with a finger, then Download and open the file from the notification.

## Known limitations (plain language)

- **Image watermarks:** If the watermark is a separate picture, Region mode can delete it. If it is part of the same picture as the page (scans, flattened exports), it cannot be separated — only covered.
- **Scanned PDFs:** Pages are photos. Auto watermark removal and Replace text don't work; use Cover or Whiteout + Text.
- **Cover** paints over the area; the original stays underneath. Use Auto/Region for real deletion.
- **Editing existing text:** PDFs store positioned glyphs, not paragraphs. "Replace" covers a text run and puts new text on top; surrounding text doesn't reflow and the old text may still be found by search/copy.
- **Auto mode needs real text with Unicode mapping.** Watermarks drawn as vector outlines, or with fonts that have no Unicode map, won't match by text; use Region mode.
- **Operator granularity:** If the watermark shares a single text instruction with real text, that whole instruction is removed. Check the result; Undo is there.
- **Encrypted PDFs** can be viewed, but to edit them you convert them to an image-based copy (text is no longer selectable).
- **Forms:** Existing fields stay fillable only if you keep the original page set and order. After merging or reordering, filled values stay visible but may no longer be editable elsewhere.
- **Autosave** keeps annotations and page edits for the same file name and size. It doesn't keep the PDF, images, signatures, merges or watermark removals, so download to keep those.
- **Fonts:** Bold and italic apply to the built-in fonts. For custom fonts, upload the bold or italic file.
