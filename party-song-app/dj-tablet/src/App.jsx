import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ClockCounterClockwise,
  Heart,
  ListNumbers,
  MusicNotes,
  Play,
  SpinnerGap,
  Trash,
  User,
} from "@phosphor-icons/react";

const POLL_INTERVAL_MS = 2_000;
const fallbackCover = "/assets/party/paper-background.png";

function formatTime(value) {
  if (!value) return "";
  return new Intl.DateTimeFormat("it-IT", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Rome",
  }).format(new Date(value));
}

function mapRequest(row) {
  return {
    id: row.id,
    title: row.title,
    artist: row.artist,
    cover: row.cover_url || fallbackCover,
    table: row.table_label || "Invitato",
    dedicationTo: row.dedication_recipient || "",
    dedicationFrom: row.dedication_sender || "",
    message: row.dedication_message || "",
    receivedAt: formatTime(row.created_at),
    playedAt: formatTime(row.played_at || row.updated_at),
    status: row.status,
  };
}

async function readJson(response) {
  return response.json().catch(() => ({}));
}

export function App() {
  const [queue, setQueue] = useState([]);
  const [played, setPlayed] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [view, setView] = useState("queue");
  const [isLoading, setIsLoading] = useState(true);
  const [syncError, setSyncError] = useState("");
  const [pendingId, setPendingId] = useState("");

  const syncRequests = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setIsLoading(true);

    try {
      const response = await fetch("/api/requests", { cache: "no-store" });
      const payload = await readJson(response);
      if (!response.ok) {
        throw new Error(payload.error || "Impossibile caricare le richieste.");
      }

      const rows = Array.isArray(payload.requests)
        ? payload.requests.map(mapRequest)
        : [];
      const nextQueue = rows.filter((song) => song.status !== "played");
      const nextPlayed = rows
        .filter((song) => song.status === "played")
        .reverse();

      setQueue(nextQueue);
      setPlayed(nextPlayed);
      setSelectedId((current) =>
        nextQueue.some((song) => song.id === current)
          ? current
          : nextQueue[0]?.id ?? "",
      );
      setSyncError("");
    } catch (error) {
      setSyncError(
        error instanceof Error
          ? error.message
          : "Collegamento alle richieste non disponibile.",
      );
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    syncRequests();
    const intervalId = window.setInterval(
      () => syncRequests({ silent: true }),
      POLL_INTERVAL_MS,
    );
    return () => window.clearInterval(intervalId);
  }, [syncRequests]);

  const selectedSong = useMemo(
    () => queue.find((song) => song.id === selectedId) ?? queue[0] ?? null,
    [queue, selectedId],
  );
  const updateStatus = async (song, status) => {
    setPendingId(song.id);
    setSyncError("");

    try {
      const response = await fetch("/api/requests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: song.id, status }),
      });
      const payload = await readJson(response);
      if (!response.ok) {
        throw new Error(payload.error || "Aggiornamento non riuscito.");
      }
      await syncRequests({ silent: true });
      if (status === "played") setView("queue");
    } catch (error) {
      setSyncError(
        error instanceof Error ? error.message : "Aggiornamento non riuscito.",
      );
    } finally {
      setPendingId("");
    }
  };

  const deletePlayed = async (id) => {
    setPendingId(id);
    setSyncError("");

    try {
      const response = await fetch(
        `/api/requests?id=${encodeURIComponent(id)}`,
        { method: "DELETE" },
      );
      const payload = await readJson(response);
      if (!response.ok) {
        throw new Error(payload.error || "Eliminazione non riuscita.");
      }
      await syncRequests({ silent: true });
    } catch (error) {
      setSyncError(
        error instanceof Error ? error.message : "Eliminazione non riuscita.",
      );
    } finally {
      setPendingId("");
    }
  };

  return (
    <main className="dj-app">
      <header className="topbar">
        <div className="brand">
          <span className="brand-icon">
            <MusicNotes size={25} weight="fill" />
          </span>
          <div>
            <strong>30 IN PIENA ESTATE</strong>
            <small>Console richieste DJ</small>
          </div>
        </div>
        <div
          className="live-status"
          data-connected={!syncError && !isLoading ? "true" : "false"}
        >
          <span />
          {isLoading ? "CONNESSIONE" : syncError ? "OFFLINE" : "LIVE"}
        </div>
      </header>

      {syncError ? (
        <div className="sync-error" role="alert">
          <span>{syncError}</span>
          <button type="button" onClick={() => syncRequests()}>
            Riprova
          </button>
        </div>
      ) : null}

      <section className="dashboard">
        <div className="queue-column">
          <div className="queue-header">
            <div>
              <p className="eyebrow">RICHIESTE DELLA FESTA</p>
              <h1>La tua coda</h1>
            </div>
            <div className="queue-total">
              <ListNumbers size={23} weight="bold" />
              <span>{queue.length}</span>
            </div>
          </div>

          <nav className="view-tabs" aria-label="Viste richieste">
            <button
              type="button"
              data-active={view === "queue" ? "true" : "false"}
              onClick={() => setView("queue")}
            >
              <ListNumbers size={20} weight="bold" />
              In coda
              <span>{queue.length}</span>
            </button>
            <button
              type="button"
              data-active={view === "played" ? "true" : "false"}
              onClick={() => setView("played")}
            >
              <ClockCounterClockwise size={20} weight="bold" />
              Già messe
              <span>{played.length}</span>
            </button>
          </nav>

          {view === "queue" ? (
            <div className="track-list" aria-label="Canzoni in coda">
              {isLoading ? (
                <div className="empty-queue">
                  <SpinnerGap className="loading-spinner" size={48} />
                  <h2>Collegamento alla coda…</h2>
                </div>
              ) : queue.length ? (
                queue.map((song, index) => {
                  const selected = song.id === selectedId;
                  const pending = song.id === pendingId;
                  return (
                    <article
                      className="track-row"
                      data-selected={selected ? "true" : "false"}
                      key={song.id}
                    >
                      <button
                        type="button"
                        className="track-main"
                        onClick={() => setSelectedId(song.id)}
                        aria-pressed={selected}
                      >
                        <span className="track-index">{index + 1}</span>
                        <img
                          src={song.cover}
                          alt=""
                          draggable={false}
                          onError={(event) => {
                            event.currentTarget.src = fallbackCover;
                          }}
                        />
                        <span className="track-copy">
                          <strong>{song.title}</strong>
                          <small>{song.artist}</small>
                          <span className="track-meta">
                            <span>
                              <User size={15} weight="fill" /> {song.table}
                            </span>
                            {song.dedicationTo ? (
                              <span className="dedication-tag">
                                <Heart size={14} weight="fill" /> Dedica
                              </span>
                            ) : null}
                          </span>
                        </span>
                      </button>
                      <div className="row-actions">
                        <button
                          type="button"
                          className="play-now"
                          disabled={pending}
                          onClick={() => updateStatus(song, "played")}
                        >
                          <Play size={19} weight="fill" />
                          Metti ora
                        </button>
                      </div>
                    </article>
                  );
                })
              ) : (
                <div className="empty-queue">
                  <MusicNotes size={48} weight="light" />
                  <h2>Nessuna richiesta ancora</h2>
                  <p>
                    Le richieste degli invitati appariranno qui automaticamente.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div
              className="track-list played-list"
              aria-label="Canzoni già riprodotte"
            >
              {played.length ? (
                played.map((song) => (
                  <article className="track-row played-row" key={song.id}>
                    <img
                      src={song.cover}
                      alt=""
                      draggable={false}
                      onError={(event) => {
                        event.currentTarget.src = fallbackCover;
                      }}
                    />
                    <div className="track-copy">
                      <strong>{song.title}</strong>
                      <small>{song.artist}</small>
                      <span className="played-time">
                        Riprodotta alle {song.playedAt}
                      </span>
                    </div>
                    <button
                      className="delete-button"
                      type="button"
                      disabled={pendingId === song.id}
                      onClick={() => deletePlayed(song.id)}
                      aria-label={`Elimina ${song.title} dallo storico`}
                    >
                      <Trash size={24} weight="bold" />
                      <span>Elimina</span>
                    </button>
                  </article>
                ))
              ) : (
                <div className="empty-queue">
                  <ClockCounterClockwise size={48} weight="light" />
                  <h2>Nessun brano riprodotto</h2>
                </div>
              )}
            </div>
          )}
        </div>

        <aside className="details-panel" aria-live="polite">
          {selectedSong ? (
            <>
              <p className="eyebrow">
                BRANO SELEZIONATO
              </p>
              <div className="selected-cover-wrap">
                <img
                  className="selected-cover"
                  src={selectedSong.cover}
                  alt=""
                  draggable={false}
                  onError={(event) => {
                    event.currentTarget.src = fallbackCover;
                  }}
                />
              </div>
              <h2>{selectedSong.title}</h2>
              <p className="selected-artist">{selectedSong.artist}</p>

              <div className="request-facts">
                <div>
                  <span>Richiesta da</span>
                  <strong>{selectedSong.table}</strong>
                </div>
                <div>
                  <span>Arrivata</span>
                  <strong>{selectedSong.receivedAt}</strong>
                </div>
              </div>

              {selectedSong.dedicationTo ? (
                <div className="dedication-card">
                  <div className="dedication-title">
                    <Heart size={20} weight="fill" /> DEDICA
                  </div>
                  <p>
                    A <strong>{selectedSong.dedicationTo}</strong>
                  </p>
                  {selectedSong.dedicationFrom ? (
                    <p>Da {selectedSong.dedicationFrom}</p>
                  ) : null}
                  {selectedSong.message ? (
                    <blockquote>“{selectedSong.message}”</blockquote>
                  ) : null}
                </div>
              ) : (
                <div className="no-dedication">
                  Nessuna dedica per questo brano.
                </div>
              )}

              <div className="detail-actions single-action">
                <button
                  type="button"
                  className="primary-action"
                  disabled={pendingId === selectedSong.id}
                  onClick={() => updateStatus(selectedSong, "played")}
                >
                  <Play size={22} weight="fill" />
                  Metti adesso
                </button>
              </div>
            </>
          ) : (
            <div className="empty-detail">
              <MusicNotes size={54} weight="light" />
              <h2>La coda è pronta</h2>
              <p>Seleziona una richiesta quando arriva.</p>
            </div>
          )}
        </aside>
      </section>
    </main>
  );
}
