# Bundled third-party libraries (unmodified, so the app works fully offline)

| File | Library | Version | License |
|---|---|---|---|
| pdf-lib.min.js | pdf-lib | 1.17.1 | MIT |
| fontkit.umd.min.js | @pdf-lib/fontkit | 1.1.1 | MIT |
| pdfjs/pdf.module.js, pdfjs/pdf.worker.module.js | PDF.js (pdfjs-dist, "legacy" ES-module build; renamed from pdf.min.mjs / pdf.worker.min.mjs) | 4.10.38 | Apache-2.0 |
| jszip.min.js | JSZip | 3.10.1 | MIT or GPL-3.0-or-later |
| runtime.js | regenerator-runtime | 0.13.11 | MIT |
| tesseract/tesseract.min.js, worker.min.js | Tesseract.js | 5.1.1 | Apache-2.0 |
| tesseract/tesseract-core-*.wasm.js | tesseract.js-core | 5.1.1 | Apache-2.0 |
| tesseract/lang/*.traineddata.gz | Tesseract language data (best_int) | 4.0.0 | Apache-2.0 |
| fonts/NotoSans*.ttf, NotoSansDevanagari*.ttf, NotoSansMath-Regular.ttf, NotoSansSymbols2-Regular.ttf | Noto fonts (Google) | — | SIL Open Font License 1.1 (see fonts/NOTO-COPYRIGHT-and-OFL-1.1.txt) |

Everything except the fonts is byte-identical to the file published on npm for that version
(checked with `npm pack` + `cmp`). The fonts are the unmodified Noto files from the `fonts-noto-core` package.
