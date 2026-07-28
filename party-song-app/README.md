# 30 in piena estate: song request prototypes

This package contains two coordinated interactive prototypes:

- `guest-mobile`: mobile request experience opened from table QR codes.
- `dj-tablet`: tablet dashboard for selecting, playing, archiving, and deleting requests.

## Guest flow

Guests search an approved song list, select a track, optionally enable a dedication, enter the recipient and sender, and submit the request.

## DJ flow

The DJ can select any item in the queue regardless of order, start it immediately, mark it as played, switch to the played-history view, and delete completed requests.

Both prototypes use the same sample songs and generated album artwork. They are frontend-only and use local React state, so no backend, authentication, or real-time synchronization is included yet.
