# Design QA: guest song request

## Evidence

- Source visual truth: `/workspace/scratch/b086853e77e0/generated_images/call_JgpUeERdbkDkhhOdh5soUmYQ.png`
- Source dimensions: 853 × 1844 px.
- Implementation: `http://terminal.local:4173/`, mobile runtime content under `[data-phone-screen]`.
- Browser-rendered evidence: Cloud Browser tab `8`, current Work Mode thread, initial guest-flow capture.
- Intended CSS viewport: 393 × 852 px at device scale factor 1.
- Captured runtime size: 360.52 × 781.59 CSS px because the Work Mode canvas uniformly scaled the protected phone frame to 91.73%. Comparison was normalized by the uniform runtime scale.
- State compared: “Sarà perché ti amo” selected, dedication enabled, Martina as recipient, Antonio as sender.

## Full-view comparison

The implementation preserves the source hierarchy: compact party/date header, large brick-red title, search field, three-track approved list, yellow selected state, bordered dedication form, and full-width brick-red DJ action. The generated edge artwork and paper texture remain visible without competing with the interactive controls.

## Focused comparison

- Typography: Bebas Neue closely matches the condensed printed headings; Patrick Hand reproduces the informal handwritten form and list copy.
- Spacing: the three-song list keeps the dedication controls and primary action visible in the initial viewport, matching the selected concept more closely than the earlier four-row build.
- Colors: ivory, brick red, olive, mustard, and blue are mapped consistently to background, headings, selection, controls, and accents.
- Images: all album artwork and the decorative paper background are raster assets created in the same Italian-summer art direction. No placeholder art, CSS drawings, inline SVG art, or emoji are used.
- Copy: event date, song names, dedication labels, names, and “MANDA AL DJ” match the approved Italian flow.

## Interaction verification

- Song selection tested with “Vivere”.
- Search tested and filtered from three tracks to one.
- Dedication switch tested in both states.
- Request submission tested and produced “Richiesta inviata al DJ!”.
- Runtime integrity check passed.
- Build and Sites packaging tests passed.
- Application-origin console errors: none. Browser-extension metadata errors were excluded as unrelated to the app.

## Comparison history

- P2, first pass: four visible songs pushed the primary action below the initial viewport. Fixed by matching the selected three-song reference list.
- P2, first pass: top decorative branch competed with device status chrome. Fixed by shifting the background artwork below the protected status area.
- Post-fix evidence: the second browser capture shows the full request flow and primary action within the device viewport.

## Findings

No actionable P0, P1, or P2 issues remain.

## Follow-up polish

- P3: a later production build could preload cover thumbnails before opening the QR link on slow venue Wi-Fi.

## Final result

final result: passed
