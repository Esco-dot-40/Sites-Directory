import React, { useState, useRef, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import AdminDashboard from './Admin.jsx';
import TextType from './TextType';
import Loader from './Loader';
import { trackVisit } from './analytics';
import './App.css';

const domains = [
  {
    name: "velarixsolutions.nl",
    sites: [
      { label: "Main Site", url: "https://velarixsolutions.nl", description: "Official Velarix Solutions landing page." },
      { label: "Crypto", url: "https://crypto.velarixsolutions.nl", description: "WIP Crypto Exchange" },
      { label: "Farkle", url: "https://farkle.velarixsolutions.nl", description: "Multiplayer dice game with real-time stats. (Web version of discord app)" },
      { label: "Find", url: "https://find.velarixsolutions.nl", description: "Search and discovery toolkit." },
      { label: "Spell", url: "https://spell.velarixsolutions.nl", description: "Daily word game and spelling challenges. (Web version of discord app)" },
      { label: "SquareUp", url: "https://squareup.velarixsolutions.nl", description: "Clone Of Dots N Boxes Off Plato. (Web version of discord app" },
      { label: "Weak", url: "https://weak.velarixsolutions.nl", description: "Grown Men Being Weird Showcase" }
    ]
  },
  {
    name: "veroe.fun",
    sites: [
      { label: "Dirty", url: "https://dirty.veroe.fun", description: "My Personal Private 1-on-1 Joyhub, Lovense, Satisfyer Control Hub." },
      { label: "Esco", url: "https://esco.veroe.fun", description: "Portfolio Backup Domain" },
      { label: "Me", url: "https://me.veroe.fun", description: "My Portfolio Link" },
      { label: "Fight", url: "https://fight.veroe.fun", description: "Discord Link To Join/Apply For PopOut 21+" },
      { label: "More", url: "https://more.veroe.fun", description: "Archive, semi active." },
      { label: "MySign", url: "https://mysign.veroe.fun", description: "All Of That Astro Shit Everyone Talks About" },
      { label: "Pop", url: "https://pop.veroe.fun", description: "WIP Beta LDR Intimacy Game, Balloon Popping Themed" },
      { label: "Spoti", url: "https://spoti.veroe.fun", description: "Spotify data and music visualization." },
      { label: "TNT", url: "https://tnt.veroe.fun", description: "Lovense Control Type-n-Talk LDR App" }
    ]
  },
  {
    name: "veroe.space",
    sites: [
      { label: "Main Site", url: "https://veroe.space", description: "Esco's Pastebin" }
    ]
  }
];

const tracks = ["/bg-music.mp3", "/link-up.mp3"];

const MainHub = ({ audioControls }) => {
  const { isMuted, volume, toggleMute, handleVolumeChange, currentTrackIndex } = audioControls;
  const [open, setOpen] = useState(null);
  const [isIntroComplete, setIsIntroComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isVideoActive, setIsVideoActive] = useState(true);
  const videoRef = useRef(null);

  const toggle = (domainName) => {
    setOpen(open === domainName ? null : domainName);
  };

  const handleVideoEnd = () => {
    setIsVideoActive(false);
  };

  useEffect(() => {
    // Set official title immediately when component mounts
    document.title = "Rule, Find, Bind / veroe.fun";

    // Analytics Tracking Hit (Legacy Pixel)
    fetch('https://pixel-tracker-production-2f84.up.railway.app/t/domain-hub.png?setup=false', { mode: 'no-cors' })
      .catch(e => console.log('Analytics offline'));

    // New Detailed Geolocation Tracking
    trackVisit('Hub Visit');
  }, []);

  useEffect(() => {
    if (isIntroComplete) {
      // setIsLoading(false); // We'll handle this with the new Loader instead
    }
  }, [isIntroComplete]);

  // Initial Loader state timer
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2500); // Show loader for 2.5 seconds
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="domains-container">
      {/* Persistent Background */}
      <div className="ambient-background">
        <AnimatePresence>
          {isVideoActive && (
            <motion.div
              className="video-bg-container"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2 }}
            >
              <video
                ref={videoRef}
                className="bg-video"
                src="/bg-video.mp4"
                autoPlay
                muted
                playsInline
                onEnded={handleVideoEnd}
              />
            </motion.div>
          )}
        </AnimatePresence>
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>

      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="initial-loader"
            className="initial-loader-overlay"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1, filter: 'blur(20px)' }}
            transition={{ duration: 1.2, ease: [0.23, 1, 0.32, 1] }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'radial-gradient(circle at center, rgba(10, 15, 30, 0.8), #05070a)'
            }}
          >
            <Loader />
          </motion.div>
        ) : (
          <motion.div
            key="main-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >




            <motion.div
              className="audio-player-glass"
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <button className={`control-btn ${isMuted ? 'muted' : ''}`} onClick={toggleMute}>
                {isMuted ? (
                  <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" /></svg>
                ) : (
                  <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" /></svg>
                )}
              </button>
              <div className="volume-track">
                <input
                  type="range" min="0" max="1" step="0.01" value={volume}
                  onChange={handleVolumeChange} className="volume-slider"
                />
              </div>
            </motion.div>

            <header className="hero-section">
              <h1 className="hero-title-wrapper">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={isIntroComplete ? "title-main" : "title-intro"}
                    className="domains-title"
                    initial={isIntroComplete ? { opacity: 0, y: 20, filter: 'blur(15px)' } : { opacity: 1, y: 0, filter: 'blur(0px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, y: -20, filter: 'blur(15px)' }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  >
                    {isIntroComplete ? "Veroe.fun" : "Escos Outlet"}
                  </motion.span>
                </AnimatePresence>
              </h1>

              <AnimatePresence mode="wait">
                {!isIntroComplete && (
                  <motion.div
                    key="intro-typing"
                    className="hero-subtitle-container"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, filter: 'blur(10px)', scale: 0.95 }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                  >
                    <TextType
                      text={["Welcome To Esco's Domain Directory...", "veroe.space", "veroe.fun", "velarixsolutions.nl"]}
                      className="hero-subtitle"
                      typingSpeed={60}
                      deletingSpeed={30}
                      pauseDuration={1000}
                      loop={false}
                      showCursor={true}
                      cursorCharacter="|"
                      onFinished={() => setIsIntroComplete(true)}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </header>

            <motion.div
              className="domains"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
              }}
            >
              {domains.map(domain => (
                <motion.div
                  key={domain.name}
                  className="domain-column"
                  variants={{
                    hidden: { x: -20, opacity: 0 },
                    visible: { x: 0, opacity: 1 }
                  }}
                >
                  <button
                    className="domain-header"
                    onClick={() => toggle(domain.name)}
                    aria-expanded={open === domain.name}
                  >
                    <span className="domain-name">{domain.name}</span>
                    <motion.span
                      className="chevron"
                      animate={{ rotate: open === domain.name ? 180 : 0 }}
                    >
                      ▼
                    </motion.span>
                  </button>

                  <AnimatePresence>
                    {open === domain.name && (
                      <motion.div
                        className="sites open"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: "easeInOut" }}
                        style={{ overflow: 'hidden' }}
                      >
                        {domain.sites.map((site, i) => (
                          <a
                            key={site.url}
                            href={site.url}
                            className="site-card"
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => trackVisit(site.label)}
                          >
                            <motion.div
                              className="site-inner"
                              whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.08)' }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <div className="card-glare"></div>
                              <h3>{site.label}</h3>
                              <p>{site.description}</p>
                            </motion.div>
                          </a>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </motion.div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function App() {
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(() => Math.floor(Math.random() * tracks.length));
  const audioRef = useRef(null);

  const toggleMute = () => {
    const newState = !isMuted;
    setIsMuted(newState);
    if (audioRef.current) {
      audioRef.current.muted = newState;
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const handleTrackEnd = () => {
    setCurrentTrackIndex((prevIndex) => (prevIndex + 1) % tracks.length);
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.load();
      if (!isMuted) {
        audioRef.current.play().catch(e => console.log("Playback failed on track change:", e));
      }
    }
  }, [currentTrackIndex]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      const attemptPlay = () => {
        audioRef.current.play().catch(error => {
          console.log("Autoplay blocked. Waiting for user interaction.");
        });
      };
      attemptPlay();
      window.addEventListener('click', attemptPlay, { once: true });
      return () => {
        window.removeEventListener('click', attemptPlay);
      };
    }
  }, []);

  const audioControls = { isMuted, volume, toggleMute, handleVolumeChange, currentTrackIndex };

  return (
    <Router>
      <audio
        ref={audioRef}
        src={tracks[currentTrackIndex]}
        onEnded={handleTrackEnd}
        autoPlay={!isMuted}
      />
      <Routes>
        <Route path="/" element={<MainHub audioControls={audioControls} />} />
        <Route path="/management" element={<AdminDashboard audioControls={audioControls} />} />
      </Routes>
    </Router>
  );
}

export default App;

