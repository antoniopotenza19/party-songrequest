# Design QA: DJ tablet queue

## Evidence

- Source direction: user brief plus Spotify queue patterns reviewed through Mobbin.
- Implementation: `http://terminal.local:4173/` at 1363 × 936 px, responsive tablet-landscape state.
- Browser-rendered evidence: Cloud Browser tab `8`, current Work Mode thread, queue and played-history captures.
- State compared: five pending requests, “Sarà perché ti amo” selected, dedication details visible.

## Full-view comparison

The dashboard presents the queue as the dominant surface and keeps the selected track visible in a dedicated right column. Track rows are substantially larger than Spotify mobile rows, suitable for a tablet at the DJ station. Every row exposes “Metti ora” and a played control, so the DJ can choose any request rather than following list order.

## Focused comparison

- Typography: Inter provides a neutral, readable music-product hierarchy at tablet distance.
- Spacing: 70 px artwork and 92 px minimum rows make selection fast while retaining five visible requests.
- Colors: restrained near-black surfaces, white type, Spotify-like green actions, and red dedication/history actions have clear semantic roles.
- Images: generated album artwork is crisp, consistently cropped, and used in both queue and detail views.
- Copy: “In coda”, “Già messe”, “Metti ora”, dedication details, requester tables, counts, and received times support the requested live workflow.

## Interaction verification

- Selected “Vivere” out of order.
- Activated “Metti adesso”.
- Moved the selected song to “Già messe”.
- Opened the played-history tab.
- Deleted the played song from history and verified it disappeared.
- Build and Sites packaging tests passed.
- Application-origin console errors: none.

## Comparison history

The first browser pass found no P0, P1, or P2 visual or interaction defects. The second state capture verified the destructive history action remains explicit and readable.

## Findings

No actionable P0, P1, or P2 issues remain.

## Follow-up polish

- P3: production could add a short undo toast after deleting a played item.

## Final result

final result: passed
# Verifica coda reale

- Coda iniziale verificata vuota nel browser.
- Stato vuoto e dettaglio leggibili a 1365 x 936.
- Rimane un solo comando operativo: **Metti ora**.
- **Metti ora** porta direttamente la richiesta nello storico **Già messe**.
- Build, test API richieste e test packaging completati.
