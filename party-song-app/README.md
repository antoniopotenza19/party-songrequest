# 30 in piena estate: song requests

This package contains two coordinated applications:

- `guest-mobile`: mobile request experience opened from table QR codes.
- `dj-tablet`: tablet dashboard for selecting, playing, archiving, and deleting requests.

## Guest flow

Guests open the mobile app from a table QR code, search Spotify, select a track, optionally add a dedication with recipient, sender, and message, then submit the request.

## DJ flow

The DJ console polls the shared Supabase queue, shows incoming requests automatically, can play any request immediately with `Metti ora`, and keeps completed songs in `Gia messe`.

Both apps use server-side API routes for Spotify and Supabase credentials. Secrets must stay in Vercel Environment Variables, never in client code or committed files.
