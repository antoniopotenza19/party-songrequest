import { useMemo, useState } from "react";
import {
  ArrowBendDownRight,
  CheckCircle,
  MagnifyingGlass,
  MusicNotes,
} from "@phosphor-icons/react";
import { KeyboardInput, MobileScroll, useKeyboard } from "./mobile";

type Song = {
  id: string;
  title: string;
  artist: string;
  cover: string;
};

const songs: Song[] = [
  {
    id: "vivere",
    title: "Vivere",
    artist: "Vasco Rossi",
    cover: "/assets/party/vivere.png",
  },
  {
    id: "lambrusco",
    title: "Lambrusco e popcorn",
    artist: "Ligabue",
    cover: "/assets/party/lambrusco-popcorn.png",
  },
  {
    id: "sara",
    title: "Sarà perché ti amo",
    artist: "Ricchi e Poveri",
    cover: "/assets/party/sara-perche-ti-amo.png",
  },
];

export default function Prototype() {
  const keyboard = useKeyboard();
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState("sara");
  const [isDedication, setIsDedication] = useState(true);
  const [recipient, setRecipient] = useState("Martina");
  const [sender, setSender] = useState("Antonio");
  const [sent, setSent] = useState(false);

  const filteredSongs = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return songs;
    return songs.filter(
      (song) =>
        song.title.toLowerCase().includes(normalized) ||
        song.artist.toLowerCase().includes(normalized),
    );
  }, [query]);

  const selectedSong = songs.find((song) => song.id === selectedId) ?? songs[0];
  const canSend = !isDedication || recipient.trim().length > 0;

  const sendRequest = () => {
    if (!canSend) return;
    keyboard.hide();
    setSent(true);
    window.setTimeout(() => setSent(false), 3200);
  };

  return (
    <MobileScroll className="app-screen">
      <main className="party-request" aria-label="Richiedi una canzone al DJ">
        <header className="event-header">
          <p className="event-kicker">30 IN PIENA ESTATE</p>
          <p className="event-date">01 AGOSTO 2026</p>
        </header>

        <section className="intro-block">
          <MusicNotes size={27} weight="fill" aria-hidden="true" />
          <h1>SCEGLI LA TUA<br />CANZONE</h1>
        </section>

        <label className="search-box" htmlFor="song-search">
          <MagnifyingGlass size={27} weight="bold" aria-hidden="true" />
          <KeyboardInput
            id="song-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Cerca tra le canzoni"
            aria-label="Cerca tra le canzoni approvate"
          />
        </label>

        <section className="song-list" aria-label="Canzoni disponibili">
          {filteredSongs.length > 0 ? (
            filteredSongs.map((song) => {
              const selected = song.id === selectedId;
              return (
                <button
                  className="song-row"
                  data-selected={selected ? "true" : "false"}
                  type="button"
                  key={song.id}
                  onClick={() => setSelectedId(song.id)}
                  aria-pressed={selected}
                >
                  <img src={song.cover} alt="" draggable={false} />
                  <span className="song-copy">
                    <strong>{song.title}</strong>
                    <small>{song.artist}</small>
                  </span>
                  <span className="song-radio" aria-hidden="true">
                    {selected ? <CheckCircle size={29} weight="fill" /> : null}
                  </span>
                </button>
              );
            })
          ) : (
            <p className="empty-state">Nessuna canzone trovata.</p>
          )}
        </section>

        <section className="dedication-panel" aria-label="Dedica">
          <div className="dedication-heading">
            <div>
              <ArrowBendDownRight className="hand-arrow" size={27} weight="bold" aria-hidden="true" />
              <h2>È UNA DEDICA</h2>
            </div>
            <button
              className="switch"
              data-on={isDedication ? "true" : "false"}
              type="button"
              role="switch"
              aria-checked={isDedication}
              aria-label="Attiva dedica"
              onClick={() => setIsDedication((value) => !value)}
            >
              <span />
            </button>
          </div>

          {isDedication ? (
            <div className="dedication-fields">
              <label htmlFor="recipient">
                <span>A CHI?</span>
                <KeyboardInput
                  id="recipient"
                  value={recipient}
                  onChange={(event) => setRecipient(event.target.value)}
                  placeholder="Nome della persona"
                />
              </label>
              <label htmlFor="sender">
                <span>DA PARTE DI <small>(facoltativo)</small></span>
                <KeyboardInput
                  id="sender"
                  value={sender}
                  onChange={(event) => setSender(event.target.value)}
                  placeholder="Il tuo nome"
                />
              </label>
            </div>
          ) : (
            <p className="dedication-off">
              La richiesta arriverà al DJ senza dedica.
            </p>
          )}
        </section>

        <button
          type="button"
          className="send-button"
          disabled={!canSend}
          onClick={sendRequest}
        >
          MANDA AL DJ
        </button>

        <p className="request-note">
          Hai scelto <strong>{selectedSong.title}</strong>
        </p>

        <div className="success-toast" data-visible={sent ? "true" : "false"} role="status">
          <CheckCircle size={24} weight="fill" aria-hidden="true" />
          <span>Richiesta inviata al DJ!</span>
        </div>
      </main>
    </MobileScroll>
  );
}
