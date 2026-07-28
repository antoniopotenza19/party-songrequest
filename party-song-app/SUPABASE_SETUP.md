# Attivazione richieste tra invitati e DJ

Le due app comunicano attraverso la stessa tabella Supabase. Il telefono e il
tablet possono quindi trovarsi su reti diverse.

## 1. Crea il database

1. Crea un progetto su Supabase.
2. Apri **SQL Editor**.
3. Incolla ed esegui tutto il contenuto di `supabase/schema.sql`.

La tabella parte vuota. Nessun dato dimostrativo viene inserito.

## 2. Recupera URL e chiave server

Nel progetto Supabase apri **Connect** oppure **Settings > API Keys** e copia:

- il **Project URL**;
- una **Secret key** che inizia con `sb_secret_`.

La Secret key deve restare soltanto nelle variabili server di Vercel. Non va
inserita nel repository, nel codice React o in un QR code.

## 3. Configura entrambi i progetti Vercel

In ciascun progetto Vercel, sia `fede30th` sia `djfede30th`, apri
**Settings > Environment Variables** e aggiungi per **Production**:

```text
SUPABASE_URL=https://ID-PROGETTO.supabase.co
SUPABASE_SECRET_KEY=sb_secret_...
```

Poi esegui un nuovo deploy di entrambi i progetti. Le variabili aggiunte non
vengono applicate ai deploy già esistenti.

## 4. Prova il flusso

1. Apri `https://fede30th.vercel.app` dal telefono.
2. Seleziona una canzone, compila eventualmente la dedica e invia.
3. Apri `https://djfede30th.vercel.app` sul tablet.
4. Entro circa 2 secondi la richiesta apparirà in coda.
5. Premendo **Metti ora**, il brano passa direttamente in **Già messe**.

## QR diversi per tavolo

Il tavolo è facoltativo e si passa nell'indirizzo:

```text
https://fede30th.vercel.app/?tavolo=7
```

La console DJ mostrerà `Tavolo 7`. Cambia soltanto il numero per generare i QR
degli altri tavoli.
