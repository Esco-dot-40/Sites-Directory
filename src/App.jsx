import React, { useState, useRef, useEffect } from 'react';
import './App.css';

const domains = [
  {
    name: "velarixsolutions.nl",
    sites: [
      { label: "Crypto", url: "https://crypto.velarixsolutions.nl", description: "Cryptocurrency tracking and analysis dashboard." },
      { label: "Farkle", url: "https://farkle.velarixsolutions.nl", description: "Multiplayer dice game with real-time stats." },
      { label: "Find", url: "https://find.velarixsolutions.nl", description: "Search and discovery toolkit." },
      { label: "Spell", url: "https://spell.velarixsolutions.nl", description: "Daily word game and spelling challenges." },
      { label: "SquareUp", url: "https://squareup.velarixsolutions.nl", description: "Business management and payment portal." },
      { label: "Weak", url: "https://weak.velarixsolutions.nl", description: "Security analysis and vulnerability testing." }
    ]
  },
  {
    name: "veroe.fun",
    sites: [
      { label: "Dirty", url: "https://dirty.veroe.fun", description: "Experimental 3D playground." },
      { label: "Esco", url: "https://esco.veroe.fun", description: "Project Esco management console." },
      { label: "Me", url: "https://me.veroe.fun", description: "Personal portal and social links." },
      { label: "Fight", url: "https://fight.veroe.fun", description: "Online arena-style browser game." },
      { label: "More", url: "https://more.veroe.fun", description: "A collection of secondary projects." },
      { label: "MySign", url: "https://mysign.veroe.fun", description: "Digital identity and signature platform." },
      { label: "Pop", url: "https://pop.veroe.fun", description: "Casual arcade gaming experience." },
      { label: "Spoti", url: "https://spoti.veroe.fun", description: "Spotify data and music visualization." },
      { label: "TNT", url: "https://tnt.veroe.fun", description: "Dynamic particle and physics tests." }
    ]
  },
  {
    name: "veroe.space",
    sites: [
      { label: "Main Site", url: "https://veroe.space", description: "The central hub for the Veroe Space ecosystem." }
    ]
  }
];

function App() {
  const [open, setOpen] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const audioRef = useRef(null);

  const toggle = (domainName) => {
    setOpen(open === domainName ? null : domainName);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      // Auto-play attempt
      const attemptPlay = () => {
        audioRef.current.play().catch(error => {
          console.log("Autoplay blocked. Waiting for user interaction.");
        });
      };

      attemptPlay();
      window.addEventListener('click', attemptPlay, { once: true });
      return () => window.removeEventListener('click', attemptPlay);
    }
  }, []);

  return (
    <div className="domains-container">
      <audio ref={audioRef} src="/bg-music.mp3" loop />

      {/* Audio UI */}
      <div className="audio-player-glass">
        <button className={`control-btn ${isMuted ? 'muted' : ''}`} onClick={toggleMute}>
          {isMuted ? (
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" /></svg>
          ) : (
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" /></svg>
          )}
        </button>
        <div className="volume-track">
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleVolumeChange}
            className="volume-slider"
          />
        </div>
      </div>

      <header className="hero-section">
        <h1 className="domains-title">Escos Outlet</h1>
        <p className="hero-subtitle">Interactive Showcase</p>
      </header>

      <div className="domains">
        {domains.map(domain => (
          <div key={domain.name} className="domain-column">
            <button
              className="domain-header"
              onClick={() => toggle(domain.name)}
              aria-expanded={open === domain.name}
            >
              <span className="domain-name">{domain.name}</span>
              <span className={`chevron ${open === domain.name ? "open" : ""}`}>▼</span>
            </button>

            <div className={`sites ${open === domain.name ? "open" : ""}`}>
              {domain.sites.map((site, i) => (
                <a
                  key={site.url}
                  href={site.url}
                  className="site-card"
                  style={{ "--i": i }}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <div className="site-inner">
                    <div className="card-glare"></div>
                    <h3>{site.label}</h3>
                    <p>{site.description}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Background Decor */}
      <div className="ambient-background">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>
    </div>
  );
}

export default App;
