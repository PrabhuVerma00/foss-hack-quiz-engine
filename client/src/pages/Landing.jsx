import React from 'react';

const Landing = () => {
  const animationStyles = `
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes float {
      0%, 100% {
        transform: translateY(0px);
      }
      50% {
        transform: translateY(-2px);
      }
    }

    @keyframes cardSlide {
      from {
        opacity: 0;
        transform: translateY(25px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes float-orb-1 {
      0%, 100% { transform: translate(0, 0); }
      20% { transform: translate(40px, -50px); }
      40% { transform: translate(-30px, -100px); }
      60% { transform: translate(50px, -60px); }
      80% { transform: translate(-20px, -80px); }
    }

    @keyframes float-orb-2 {
      0%, 100% { transform: translate(0, 0); }
      20% { transform: translate(-50px, -60px); }
      40% { transform: translate(35px, -110px); }
      60% { transform: translate(-40px, -70px); }
      80% { transform: translate(45px, -90px); }
    }

    @keyframes float-orb-3 {
      0%, 100% { transform: translate(0, 0); }
      20% { transform: translate(55px, -40px); }
      40% { transform: translate(-35px, -95px); }
      60% { transform: translate(30px, -75px); }
      80% { transform: translate(-25px, -55px); }
    }

    @keyframes float-particle {
      0% {
        opacity: 0;
        transform: translateY(100vh) translateX(0px);
      }
      10% {
        opacity: 0.4;
      }
      90% {
        opacity: 0.4;
      }
      100% {
        opacity: 0;
        transform: translateY(-100vh) translateX(100px);
      }
    }

    .hero-fade {
      animation: fadeInUp 0.8s ease-out;
    }

    .hero-float {
      animation: float 8s ease-in-out infinite;
      will-change: transform;
    }

    .card-slide {
      animation: cardSlide 0.7s ease-out forwards;
    }

    .card-slide:nth-child(1) { animation-delay: 0.15s; }
    .card-slide:nth-child(2) { animation-delay: 0.3s; }
    .card-slide:nth-child(3) { animation-delay: 0.45s; }

    .orb-1 { animation: float-orb-1 26s ease-in-out infinite; }
    .orb-2 { animation: float-orb-2 30s ease-in-out infinite; }
    .orb-3 { animation: float-orb-3 28s ease-in-out infinite; }

    .particle {
      animation: float-particle var(--duration) linear infinite;
      will-change: transform, opacity;
    }

    /* Smooth transitions */
    button, a {
      transition: all 0.25s ease;
    }
  `;

  const [hoveredButton, setHoveredButton] = React.useState(null);
  const [hoveredCards, setHoveredCards] = React.useState({});

  const features = [
    {
      icon: '⚡',
      title: 'Real-Time Quiz',
      description: 'Experience instant, live quiz gameplay with smooth synchronization across all participants.',
    },
    {
      icon: '🔓',
      title: 'Open Source',
      description: 'Fully open-source project built by the community, for the community. Contribute and customize freely.',
    },
    {
      icon: '🚀',
      title: 'Easy Setup',
      description: 'Get started in minutes with our simple deployment process and intuitive configuration.',
    },
  ];

  const handleDownloadClick = () => {
    window.location.href = 'https://github.com/foss-hack-quiz-engine';
  };

  const handleStartHosting = () => {
    window.location.href = '/host';
  };

  const handleJoinGame = () => {
    window.location.href = '/player';
  };

  const particles = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 20,
    duration: 15 + Math.random() * 10,
  }));

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #020617 0%, #030712 40%, #020617 100%)',
      color: '#e5e5e5',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
      overflow: 'hidden',
      position: 'relative',
    },

    animatedBg: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      zIndex: 0,
      overflow: 'hidden',
    },

    bgDotGrid: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundImage: 'radial-gradient(circle, rgba(20,184,166,0.18) 1px, transparent 1px)',
      backgroundSize: '40px 40px',
      pointerEvents: 'none',
    },

    orb: {
      position: 'absolute',
      borderRadius: '50%',
      filter: 'blur(60px)',
      pointerEvents: 'none',
    },

    orb1: {
      width: '320px',
      height: '320px',
      top: '15%',
      left: '8%',
      background: 'radial-gradient(circle at 35% 35%, rgba(20,184,166,0.35), transparent 70%)',
      opacity: 0.3,
      boxShadow: '0 0 80px rgba(20,184,166,0.25)',
    },

    orb2: {
      width: '380px',
      height: '380px',
      top: '45%',
      right: '8%',
      background: 'radial-gradient(circle at 35% 35%, rgba(6,182,212,0.35), transparent 70%)',
      opacity: 0.3,
      boxShadow: '0 0 80px rgba(6,182,212,0.25)',
    },

    orb3: {
      width: '300px',
      height: '300px',
      bottom: '5%',
      left: '55%',
      background: 'radial-gradient(circle at 35% 35%, rgba(34,197,94,0.35), transparent 70%)',
      opacity: 0.3,
      boxShadow: '0 0 80px rgba(34,197,94,0.25)',
    },

    particleContainer: {
      position: 'absolute',
      width: '2px',
      height: '2px',
      borderRadius: '50%',
      background: 'rgba(20,184,166,0.8)',
      pointerEvents: 'none',
      boxShadow: '0 0 6px rgba(20,184,166,0.6)',
    },

    vignette: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'radial-gradient(ellipse at center, transparent 20%, rgba(2,6,23,0.25) 100%)',
      pointerEvents: 'none',
    },

    starsBackground: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      className: 'stars',
      zIndex: 0,
      pointerEvents: 'none',
    },

    radialGlow: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'radial-gradient(circle at 50% 30%, rgba(20,184,166,0.08), transparent 50%)',
      zIndex: 0,
      pointerEvents: 'none',
    },

    radialGlowSecondary: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'radial-gradient(circle at 80% 70%, rgba(6,182,212,0.05), transparent 60%)',
      zIndex: 0,
      pointerEvents: 'none',
    },

    contentWrapper: {
      position: 'relative',
      zIndex: 1,
    },

    extraGlowLayer: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'radial-gradient(circle at 30% 20%, rgba(20,184,166,0.08), transparent 40%), radial-gradient(circle at 80% 70%, rgba(6,182,212,0.06), transparent 50%)',
      zIndex: 0,
      pointerEvents: 'none',
    },

    // Hero Section
    hero: {
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      textAlign: 'center',
      padding: '60px 40px',
      position: 'relative',
    },

    heroContent: {
      maxWidth: '850px',
      position: 'relative',
      zIndex: 2,
    },

    title: {
      fontSize: 'clamp(2.2rem, 5.5vw, 56px)',
      fontWeight: '800',
      marginBottom: '16px',
      color: '#ffffff',
      lineHeight: '1.15',
      letterSpacing: '-0.8px',
      textShadow: '0 0 12px rgba(20,184,166,0.12)',
      willChange: 'transform',
    },

    subtitle: {
      fontSize: 'clamp(1rem, 2.2vw, 18px)',
      color: '#8b949e',
      marginBottom: '56px',
      fontWeight: '300',
      lineHeight: '1.7',
      letterSpacing: '0.3px',
    },

    buttonRow: {
      display: 'flex',
      gap: '20px',
      justifyContent: 'center',
      flexWrap: 'wrap',
      marginBottom: '32px',
    },

    buttonPrimary: {
      padding: '12px 32px',
      fontSize: '14px',
      fontWeight: '600',
      border: '1px solid rgba(255,255,255,0.15)',
      borderRadius: '10px',
      cursor: 'pointer',
      background: 'rgba(255,255,255,0.03)',
      color: '#e5e5e5',
      transition: 'all 0.25s ease',
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
      transform: hoveredButton === 'hosting' ? 'translateY(-2px)' : 'translateY(0)',
      willChange: 'transform, border-color, box-shadow, background-color',
      backdropFilter: 'blur(4px)',
    },

    buttonPrimaryHover: {
      border: '1px solid rgba(20,184,166,0.6)',
      boxShadow: '0 0 14px rgba(20,184,166,0.25), inset 0 1px 0 rgba(255,255,255,0.08)',
      color: '#e5e5e5',
      background: 'rgba(255,255,255,0.05)',
    },

    buttonSecondary: {
      padding: '12px 32px',
      fontSize: '14px',
      fontWeight: '600',
      border: '1px solid rgba(255,255,255,0.15)',
      borderRadius: '10px',
      cursor: 'pointer',
      background: 'rgba(255,255,255,0.03)',
      color: '#e5e5e5',
      transition: 'all 0.25s ease',
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
      transform: hoveredButton === 'join' ? 'translateY(-2px)' : 'translateY(0)',
      willChange: 'transform, border-color, box-shadow, background-color',
      backdropFilter: 'blur(4px)',
    },

    buttonSecondaryHover: {
      border: '1px solid rgba(20,184,166,0.6)',
      boxShadow: '0 0 14px rgba(20,184,166,0.25), inset 0 1px 0 rgba(255,255,255,0.08)',
      color: '#e5e5e5',
      background: 'rgba(255,255,255,0.05)',
    },

    downloadButtonWrapper: {
      display: 'flex',
      justifyContent: 'center',
      marginTop: '20px',
    },

    buttonDownload: {
      padding: '12px 40px',
      fontSize: '15px',
      fontWeight: '700',
      border: '1px solid rgba(20,184,166,0.4)',
      borderRadius: '10px',
      cursor: 'pointer',
      background: 'rgba(20,184,166,0.08)',
      color: '#14b8a6',
      transition: 'all 0.25s ease',
      boxShadow: '0 0 12px rgba(20,184,166,0.2), inset 0 1px 0 rgba(255,255,255,0.06)',
      transform: hoveredButton === 'download' ? 'translateY(-2px) scale(1.01)' : 'translateY(0) scale(1)',
      willChange: 'transform, border-color, box-shadow, background-color',
      backdropFilter: 'blur(4px)',
    },

    buttonDownloadHover: {
      boxShadow: '0 0 18px rgba(20,184,166,0.35), inset 0 1px 0 rgba(20,184,166,0.15)',
      border: '1px solid rgba(20,184,166,0.7)',
      background: 'rgba(20,184,166,0.12)',
      color: '#14b8a6',
    },

    // Documentation Section
    docSection: {
      padding: '80px 40px',
      textAlign: 'center',
      position: 'relative',
      zIndex: 1,
    },

    docContainer: {
      maxWidth: '920px',
      margin: '0 auto',
    },

    sectionTitle: {
      fontSize: '36px',
      fontWeight: '800',
      marginBottom: '16px',
      color: '#ffffff',
      letterSpacing: '-0.5px',
    },

    docCard: {
      padding: '40px',
      background: 'rgba(255,255,255,0.02)',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: '12px',
      backdropFilter: 'blur(12px)',
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
      transition: 'all 0.25s ease',
      marginTop: '24px',
      willChange: 'border-color, box-shadow, transform',
    },

    docCardHover: {
      border: '1px solid rgba(20,184,166,0.15)',
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08), 0 0 20px rgba(20,184,166,0.15)',
    },

    docText: {
      fontSize: '15px',
      lineHeight: '1.8',
      color: '#b0b0b0',
      marginBottom: '24px',
    },

    docLinksContainer: {
      display: 'flex',
      gap: '12px',
      justifyContent: 'center',
      flexWrap: 'wrap',
    },

    docLink: {
      padding: '10px 20px',
      fontSize: '14px',
      background: 'rgba(255,255,255,0.02)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '8px',
      color: '#14b8a6',
      textDecoration: 'none',
      cursor: 'pointer',
      transition: 'all 0.25s ease',
      fontWeight: '500',
      willChange: 'border-color, background-color, box-shadow',
      backdropFilter: 'blur(4px)',
    },

    docLinkHover: {
      border: '1px solid rgba(20,184,166,0.5)',
      background: 'rgba(20,184,166,0.08)',
      boxShadow: '0 0 12px rgba(20,184,166,0.18)',
    },

    // Features Section
    featuresSection: {
      padding: '80px 40px',
      position: 'relative',
      zIndex: 1,
    },

    featuresContainer: {
      maxWidth: '1300px',
      margin: '0 auto',
    },

    featuresGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
      gap: '28px',
      marginTop: '48px',
    },

    featureCard: {
      background: 'rgba(255,255,255,0.02)',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: '12px',
      padding: '36px 28px',
      backdropFilter: 'blur(12px)',
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
      transition: 'all 0.25s ease',
      cursor: 'pointer',
      willChange: 'transform, border-color, box-shadow',
    },

    featureCardHover: {
      transform: 'translateY(-4px)',
      border: '1px solid rgba(20,184,166,0.15)',
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08), 0 0 20px rgba(20,184,166,0.15)',
    },

    featureIcon: {
      fontSize: '42px',
      marginBottom: '18px',
      display: 'block',
    },

    featureTitle: {
      fontSize: '20px',
      fontWeight: '700',
      marginBottom: '12px',
      color: '#ffffff',
      letterSpacing: '-0.3px',
    },

    featureDesc: {
      fontSize: '14px',
      color: '#909090',
      lineHeight: '1.7',
    },

    // Footer
    footer: {
      padding: '40px',
      textAlign: 'center',
      color: '#808080',
      fontSize: '13px',
      borderTop: '1px solid rgba(255,255,255,0.05)',
      position: 'relative',
      zIndex: 1,
    },

    footerLink: {
      color: '#14b8a6',
      textDecoration: 'none',
      transition: 'color 0.25s ease',
      cursor: 'pointer',
    },
  };

  return (
    <>
      <style>{animationStyles}</style>
      <div style={styles.container}>
        {/* Animated background layer */}
        <div style={styles.animatedBg}>
          {/* Dot grid texture */}
          <div style={styles.bgDotGrid}></div>

          {/* Floating orbs */}
          <div style={{ ...styles.orb, ...styles.orb1 }} className="orb-1"></div>
          <div style={{ ...styles.orb, ...styles.orb2 }} className="orb-2"></div>
          <div style={{ ...styles.orb, ...styles.orb3 }} className="orb-3"></div>

          {/* Floating particles */}
          {particles.map((particle) => (
            <div
              key={particle.id}
              style={{
                ...styles.particleContainer,
                left: `${particle.left}%`,
                top: '100%',
                '--duration': `${particle.duration}s`,
              }}
              className="particle"
            ></div>
          ))}

          {/* Vignette */}
          <div style={styles.vignette}></div>
        </div>

        {/* Radial glow overlays (subtle) */}
        <div style={styles.radialGlow}></div>
        <div style={styles.radialGlowSecondary}></div>

        <div style={styles.extraGlowLayer}></div>

        <div style={styles.contentWrapper}>
          {/* Hero Section */}
          <section style={styles.hero} className="hero-fade">
            <div style={styles.heroContent} className="hero-float">
              <h1 style={styles.title}>FOSS Hack Quiz Engine</h1>
              <p style={styles.subtitle}>
                The open-source real-time quiz platform for engaging learning experiences
              </p>

              {/* Button Row 1 */}
              <div style={styles.buttonRow}>
                <button
                  style={{
                    ...styles.buttonPrimary,
                    ...(hoveredButton === 'hosting' ? styles.buttonPrimaryHover : {}),
                  }}
                  onMouseEnter={() => setHoveredButton('hosting')}
                  onMouseLeave={() => setHoveredButton(null)}
                  onClick={handleStartHosting}
                >
                  Start Hosting
                </button>
                <button
                  style={{
                    ...styles.buttonSecondary,
                    ...(hoveredButton === 'join' ? styles.buttonSecondaryHover : {}),
                  }}
                  onMouseEnter={() => setHoveredButton('join')}
                  onMouseLeave={() => setHoveredButton(null)}
                  onClick={handleJoinGame}
                >
                  Join Game
                </button>
              </div>

              {/* Button Row 2 */}
              <div style={styles.downloadButtonWrapper}>
                <button
                  style={{
                    ...styles.buttonDownload,
                    ...(hoveredButton === 'download' ? styles.buttonDownloadHover : {}),
                  }}
                  onMouseEnter={() => setHoveredButton('download')}
                  onMouseLeave={() => setHoveredButton(null)}
                  onClick={handleDownloadClick}
                >
                  ↓ Download from GitHub
                </button>
              </div>
            </div>
          </section>

          {/* Documentation Section */}
          <section style={styles.docSection}>
            <div style={styles.docContainer}>
              <h2 style={styles.sectionTitle}>Documentation</h2>
              <div style={styles.docCard}>
                <p style={styles.docText}>
                  Explore comprehensive guides for setup, configuration, and deployment. Learn from our active community and get started in minutes.
                </p>
                <div style={styles.docLinksContainer}>
                  <a
                    style={styles.docLink}
                    href="https://github.com/foss-hack-quiz-engine#readme"
                  >
                    Guides
                  </a>
                  <a
                    style={styles.docLink}
                    href="https://github.com/foss-hack-quiz-engine"
                  >
                    GitHub
                  </a>
                  <a
                    style={styles.docLink}
                    href="https://github.com/foss-hack-quiz-engine/issues"
                  >
                    Issues
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section style={styles.featuresSection}>
            <div style={styles.featuresContainer}>
              <h2 style={styles.sectionTitle}>Features</h2>
              <div style={styles.featuresGrid}>
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className="card-slide"
                    style={{
                      ...styles.featureCard,
                      ...(hoveredCards[index] ? styles.featureCardHover : {}),
                    }}
                    onMouseEnter={() => setHoveredCards({ ...hoveredCards, [index]: true })}
                    onMouseLeave={() => setHoveredCards({ ...hoveredCards, [index]: false })}
                  >
                    <div style={styles.featureIcon}>{feature.icon}</div>
                    <h3 style={styles.featureTitle}>{feature.title}</h3>
                    <p style={styles.featureDesc}>{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer style={styles.footer}>
            <p>
              Built with ❤️ by the FOSS community
              <br />
              © 2026 FOSS Hack Quiz Engine.{' '}
              <a
                style={styles.footerLink}
                href="https://github.com/foss-hack-quiz-engine"
              >
                GitHub
              </a>
            </p>
          </footer>
        </div>
      </div>
    </>
  );
};

export default Landing;