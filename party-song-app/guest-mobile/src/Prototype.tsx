import { useEffect, useMemo, useState } from "react";
import {
  ArrowBendDownRight,
  CheckCircle,
  MagnifyingGlass,
  MusicNotes,
  SpinnerGap,
  SpotifyLogo,
} from "@phosphor-icons/react";

type Song = {
  id: string;
  title: string;
  artist: string;
  cover: string;
  spotifyUrl?: string;
  durationMs?: number;
};

const featuredSongs: Song[] = [
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
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState("sara");
  const [searchResults, setSearchResults] = useState<Song[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [isDedication, setIsDedication] = useState(true);
  const [recipient, setRecipient] = useState("Martina");
  const [sender, setSender] = useState("Antonio");
  const [sent, setSent] = useState(false);

  const normalizedQuery = query.trim();
  const visibleSongs = useMemo(
    () => (normalizedQuery.length >= 2 ? searchResults : featuredSongs),
    [normalizedQuery, searchResults],
  );

  useEffect(() => {
    if (normalizedQuery.length < 2) {
      setSearchResults([]);
      setSearchError("");
      setIsSearching(false);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setIsSearching(true);
      setSearchError("");

      try {
        const response = await fetch(
          `/api/spotify/search?q=${encodeURIComponent(normalizedQuery)}`,
          { signal: controller.signal },
        );

        if (!response.ok) {
          throw new Error("Spotify non disponibile");
        }

        const payload = (await response.json()) as { tracks?: Song[] };
        const tracks = Array.isArray(payload.tracks) ? payload.tracks : [];
        setSearchResults(tracks);

        if (tracks.length > 0) {
          setSelectedId((current) =>
            tracks.some((track) => track.id === current) ? current : tracks[0].id,
          );
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setSearchResults([]);
        setSearchError(
          "La ricerca Spotify non è disponibile. Riprova tra qualche secondo.",
        );
      } finally {
        if (!controller.signal.aborted) setIsSearching(false);
      }
    }, 400);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [normalizedQuery]);

  const allKnownSongs = [...featuredSongs, ...searchResults];
  const selectedSong =
    allKnownSongs.find((song) => song.id === selectedId) ?? featuredSongs[0];
  const canSend =
    Boolean(selectedSong) && (!isDedication || recipient.trim().length > 0);

  const sendRequest = () => {
    if (!canSend) return;
    setSent(true);
    window.setTimeout(() => setSent(false), 3200);
  };

  return (
    <div className="app-screen">
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
          <input
            id="song-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Cerca su Spotify"
            aria-label="Cerca una canzone su Spotify"
            autoComplete="off"
          />
          {isSearching ? (
            <SpinnerGap className="search-spinner" size={23} aria-hidden="true" />
          ) : null}
        </label>

        <section className="song-list" aria-label="Canzoni disponibili">
          {visibleSongs.length > 0 ? (
            visibleSongs.map((song) => {
              const selected = song.id === selectedId;
              return (
                <div
                  className="song-row"
                  data-selected={selected ? "true" : "false"}
                  key={song.id}
                >
                  <button
                    className="song-select"
                    type="button"
                    onClick={() => setSelectedId(song.id)}
                    aria-pressed={selected}
                  >
                    <img
                      src={song.cover || "/assets/party/paper-background.png"}
                      alt={`Copertina di ${song.title}`}
                      draggable={false}
                      onError={(event) => {
                        event.currentTarget.src =
                          "/assets/party/paper-background.png";
                      }}
                    />
                    <span className="song-copy">
                      <strong>{song.title}</strong>
                      <small>{song.artist}</small>
                    </span>
                    <span className="song-radio" aria-hidden="true">
                      {selected ? <CheckCircle size={29} weight="fill" /> : null}
                    </span>
                  </button>
                  {song.spotifyUrl ? (
                    <a
                      className="spotify-link"
                      href={song.spotifyUrl}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`Apri ${song.title} su Spotify`}
                    >
                      <SpotifyLogo size={14} weight="fill" aria-hidden="true" />
                      Spotify
                    </a>
                  ) : null}
                </div>
              );
            })
          ) : (
            <p className="empty-state">
              {isSearching
                ? "Sto cercando…"
                : searchError || "Nessuna canzone trovata."}
            </p>
          )}
        </section>

        {normalizedQuery.length < 2 ? (
          <p className="spotify-note">
            Scrivi almeno 2 caratteri per cercare nel catalogo Spotify.
          </p>
        ) : null}

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
                <input
                  id="recipient"
                  value={recipient}
                  onChange={(event) => setRecipient(event.target.value)}
                  placeholder="Nome della persona"
                  autoComplete="off"
                />
              </label>
              <label htmlFor="sender">
                <span>DA PARTE DI <small>(facoltativo)</small></span>
                <input
                  id="sender"
                  value={sender}
                  onChange={(event) => setSender(event.target.value)}
                  placeholder="Il tuo nome"
                  autoComplete="off"
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
    </div>
  );
}
