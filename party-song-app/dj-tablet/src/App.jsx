import { useMemo, useState } from "react";
import {
  CheckCircle,
  ClockCounterClockwise,
  Heart,
  ListNumbers,
  MusicNotes,
  Play,
  Trash,
  UsersThree,
} from "@phosphor-icons/react";

const initialQueue = [
  {
    id: "sara",
    title: "Sarà perché ti amo",
    artist: "Ricchi e Poveri",
    cover: "/assets/party/sara-perche-ti-amo.png",
    table: "Tavolo 7",
    requestedBy: 6,
    dedicationTo: "Martina",
    dedicationFrom: "Antonio",
    message: "Per i nostri dieci anni insieme",
    receivedAt: "21:48",
  },
  {
    id: "vivere",
    title: "Vivere",
    artist: "Vasco Rossi",
    cover: "/assets/party/vivere.png",
    table: "Tavoli 2, 5",
    requestedBy: 3,
    dedicationTo: "",
    dedicationFrom: "",
    message: "",
    receivedAt: "21:51",
  },
  {
    id: "lambrusco",
    title: "Lambrusco e popcorn",
    artist: "Ligabue",
    cover: "/assets/party/lambrusco-popcorn.png",
    table: "Tavolo 4",
    requestedBy: 1,
    dedicationTo: "Stefano",
    dedicationFrom: "Gli amici",
    message: "Questa è tutta tua",
    receivedAt: "21:53",
  },
  {
    id: "estate",
    title: "L'estate sta finendo",
    artist: "Righeira",
    cover: "/assets/party/estate-finendo.png",
    table: "Tavoli 1, 8",
    requestedBy: 4,
    dedicationTo: "",
    dedicationFrom: "",
    message: "",
    receivedAt: "21:55",
  },
  {
    id: "sara-bis",
    title: "Mamma Maria",
    artist: "Ricchi e Poveri",
    cover: "/assets/party/sara-perche-ti-amo.png",
    table: "Tavolo 9",
    requestedBy: 2,
    dedicationTo: "La nonna",
    dedicationFrom: "Tutti i nipoti",
    message: "",
    receivedAt: "21:58",
  },
];

const initialPlayed = [
  {
    id: "played-1",
    title: "Maracaibo",
    artist: "Lu Colombo",
    cover: "/assets/party/estate-finendo.png",
    table: "Tavolo 3",
    requestedBy: 2,
    playedAt: "21:42",
  },
  {
    id: "played-2",
    title: "Sinceramente",
    artist: "Annalisa",
    cover: "/assets/party/vivere.png",
    table: "Tavolo 6",
    requestedBy: 1,
    playedAt: "21:35",
  },
];

export function App() {
  const [queue, setQueue] = useState(initialQueue);
  const [played, setPlayed] = useState(initialPlayed);
  const [selectedId, setSelectedId] = useState(initialQueue[0].id);
  const [view, setView] = useState("queue");
  const [nowPlayingId, setNowPlayingId] = useState(null);

  const selectedSong = useMemo(
    () => queue.find((song) => song.id === selectedId) ?? queue[0] ?? null,
    [queue, selectedId],
  );

  const markAsPlayed = (song) => {
    const now = new Date();
    const playedAt = `${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes(),
    ).padStart(2, "0")}`;
    setQueue((current) => current.filter((item) => item.id !== song.id));
    setPlayed((current) => [{ ...song, playedAt }, ...current]);
    setNowPlayingId(null);
    const remaining = queue.filter((item) => item.id !== song.id);
    setSelectedId(remaining[0]?.id ?? "");
  };

  const playNow = (song) => {
    setSelectedId(song.id);
    setNowPlayingId(song.id);
  };

  const deletePlayed = (id) => {
    setPlayed((current) => current.filter((song) => song.id !== id));
  };

  return (
    <main className="dj-app">
      <header className="topbar">
        <div className="brand">
          <span className="brand-icon"><MusicNotes size={25} weight="fill" /></span>
          <div>
            <strong>30 IN PIENA ESTATE</strong>
            <small>Console richieste DJ</small>
          </div>
        </div>
        <div className="live-status">
          <span />
          LIVE
        </div>
      </header>

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
              {queue.length ? (
                queue.map((song, index) => {
                  const selected = song.id === selectedId;
                  const playing = song.id === nowPlayingId;
                  return (
                    <article
                      className="track-row"
                      data-selected={selected ? "true" : "false"}
                      data-playing={playing ? "true" : "false"}
                      key={song.id}
                    >
                      <button
                        type="button"
                        className="track-main"
                        onClick={() => setSelectedId(song.id)}
                        aria-pressed={selected}
                      >
                        <span className="track-index">{playing ? <Play size={17} weight="fill" /> : index + 1}</span>
                        <img src={song.cover} alt="" draggable={false} />
                        <span className="track-copy">
                          <strong>{song.title}</strong>
                          <small>{song.artist}</small>
                          <span className="track-meta">
                            <span><UsersThree size={15} weight="fill" /> {song.requestedBy}</span>
                            <span>{song.table}</span>
                            {song.dedicationTo ? <span className="dedication-tag"><Heart size={14} weight="fill" /> Dedica</span> : null}
                          </span>
                        </span>
                      </button>
                      <div className="row-actions">
                        <button type="button" className="play-now" onClick={() => playNow(song)}>
                          <Play size={19} weight="fill" />
                          Metti ora
                        </button>
                        <button
                          type="button"
                          className="mark-played"
                          aria-label={`Segna ${song.title} come già messa`}
                          onClick={() => markAsPlayed(song)}
                        >
                          <CheckCircle size={25} weight="bold" />
                        </button>
                      </div>
                    </article>
                  );
                })
              ) : (
                <div className="empty-queue">
                  <CheckCircle size={48} weight="light" />
                  <h2>Coda vuota</h2>
                  <p>Le nuove richieste appariranno qui.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="track-list played-list" aria-label="Canzoni già riprodotte">
              {played.length ? (
                played.map((song) => (
                  <article className="track-row played-row" key={song.id}>
                    <img src={song.cover} alt="" draggable={false} />
                    <div className="track-copy">
                      <strong>{song.title}</strong>
                      <small>{song.artist}</small>
                      <span className="played-time">Riprodotta alle {song.playedAt}</span>
                    </div>
                    <button
                      className="delete-button"
                      type="button"
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
              <p className="eyebrow">{nowPlayingId === selectedSong.id ? "IN RIPRODUZIONE" : "BRANO SELEZIONATO"}</p>
              <div className="selected-cover-wrap">
                <img className="selected-cover" src={selectedSong.cover} alt="" draggable={false} />
                {nowPlayingId === selectedSong.id ? (
                  <span className="playing-badge"><Play size={16} weight="fill" /> Adesso</span>
                ) : null}
              </div>
              <h2>{selectedSong.title}</h2>
              <p className="selected-artist">{selectedSong.artist}</p>

              <div className="request-facts">
                <div>
                  <span>Richiesta da</span>
                  <strong>{selectedSong.table}</strong>
                </div>
                <div>
                  <span>Persone</span>
                  <strong>{selectedSong.requestedBy}</strong>
                </div>
                <div>
                  <span>Arrivata</span>
                  <strong>{selectedSong.receivedAt}</strong>
                </div>
              </div>

              {selectedSong.dedicationTo ? (
                <div className="dedication-card">
                  <div className="dedication-title"><Heart size={20} weight="fill" /> DEDICA</div>
                  <p>A <strong>{selectedSong.dedicationTo}</strong></p>
                  {selectedSong.dedicationFrom ? <p>Da {selectedSong.dedicationFrom}</p> : null}
                  {selectedSong.message ? <blockquote>“{selectedSong.message}”</blockquote> : null}
                </div>
              ) : (
                <div className="no-dedication">Nessuna dedica per questo brano.</div>
              )}

              <div className="detail-actions">
                <button type="button" className="primary-action" onClick={() => playNow(selectedSong)}>
                  <Play size={22} weight="fill" />
                  Metti adesso
                </button>
                <button type="button" className="secondary-action" onClick={() => markAsPlayed(selectedSong)}>
                  <CheckCircle size={22} weight="bold" />
                  Già messa
                </button>
              </div>
            </>
          ) : (
            <div className="empty-detail">
              <MusicNotes size={54} weight="light" />
              <h2>Seleziona un brano</h2>
            </div>
          )}
        </aside>
      </section>
    </main>
  );
}
