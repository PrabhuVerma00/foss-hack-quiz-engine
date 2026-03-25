import React from "react";
import { motion } from "framer-motion";
import { Terminal, Download, Code2, Sparkles } from "lucide-react";

export default function Hero() {
  const [buttonLight, setButtonLight] = React.useState({ primary: { x: 0, y: 0 }, secondary: { x: 0, y: 0 } });
  const [terminalLight, setTerminalLight] = React.useState({ x: 0, y: 0 });

  const handleButtonMove = (e, buttonType) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setButtonLight(prev => ({
      ...prev,
      [buttonType]: { x: e.clientX - rect.left, y: e.clientY - rect.top }
    }));
  };

  const handleTerminalMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTerminalLight({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <style>{`
        @keyframes blink {
          0%, 50%, 100% { opacity: 1; }
          25%, 75% { opacity: 0; }
        }

        .cursor {
          display: inline-block;
          width: 6px;
          height: 14px;
          background: #10B981;
          animation: blink 1s infinite;
        }

        .btn-primary {
          position: relative;
          background: linear-gradient(135deg, #10B981, #06B6D4);
          box-shadow: 0 6px 18px rgba(16, 185, 129, 0.25);
          transition: all 0.25s ease;
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow:
            0 10px 30px rgba(16, 185, 129, 0.35),
            0 0 20px rgba(16, 185, 129, 0.2);
        }

        .btn-primary::before {
          content: "";
          position: absolute;
          inset: -1px;
          border-radius: inherit;
          background: linear-gradient(
            120deg,
            transparent,
            rgba(16, 185, 129, 0.6),
            transparent
          );
          opacity: 0;
          transition: opacity 0.3s;
        }

        .btn-primary:hover::before {
          opacity: 1;
        }

        .btn-secondary {
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.03);
          transition: all 0.25s ease;
          position: relative;
        }

        .btn-secondary:hover {
          border-color: rgba(255, 255, 255, 0.2);
          background: rgba(255, 255, 255, 0.06);
        }

        .interactive-border {
          position: relative;
          border-radius: 16px;
          overflow: hidden;
        }

        .interactive-border::after {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: inherit;
          pointer-events: none;
          background: radial-gradient(
            200px circle at var(--x, 50%) var(--y, 50%),
            rgba(16, 185, 129, 0.18),
            transparent 60%
          );
          opacity: 0;
          transition: opacity 0.25s ease;
        }

        .interactive-border:hover::after {
          opacity: 1;
        }

        .terminal-card {
          background: rgba(8, 12, 24, 0.85);
          backdrop-filter: blur(16px);
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
          transition: all 0.3s ease;
          overflow: hidden;
        }

        .terminal-card:hover {
          border-color: rgba(16, 185, 129, 0.3);
        }

        .terminal-header {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 14px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }

        .red { background: #ff5f56; }
        .yellow { background: #ffbd2e; }
        .green { background: #27c93f; }

        .terminal-title {
          margin-left: auto;
          font-size: 12px;
          color: rgba(255, 255, 255, 0.4);
          font-family: 'JetBrains Mono', monospace;
        }

        .terminal-body {
          padding: 18px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 13px;
        }

        .terminal-body p {
          margin: 0;
          line-height: 1.6;
        }

        .cmd { color: #10B981; font-weight: 500; }
        .dim { color: #64748b; }
        .success { color: #22c55e; }
        .link { color: #38bdf8; }
      `}</style>
      
      <div className="relative z-10 container mx-auto px-6 py-32 md:py-40">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="max-w-6xl mx-auto text-center"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full mb-8 border border-white/10 bg-white/[0.03] backdrop-blur-sm hover:border-white/20 transition-colors"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="w-4 h-4 text-emerald-400" />
            </motion.div>
            <span className="text-sm bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent font-medium">
              100% Open Source • Zero Cloud Dependency
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="text-5xl md:text-7xl font-bold text-white leading-tight"
          >
            The Game Engine for the{" "}
            <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
              Offline World
            </span>
          </motion.h1>

          {/* Subtext */}
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="mt-6 text-lg text-gray-300 max-w-2xl mx-auto"
          >
            Host real-time interactive quizzes on your local network with ultra-low latency.
            No cloud. No lag. No limits.
          </motion.p>

          {/* Buttons */}
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            {/* Primary Button */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.96 }}
              onMouseMove={(e) => handleButtonMove(e, 'primary')}
              onMouseLeave={() => setButtonLight(prev => ({ ...prev, primary: { x: 0, y: 0 } }))}
              style={{
                '--x': `${buttonLight.primary.x}px`,
                '--y': `${buttonLight.primary.y}px`
              }}
              className="btn-primary interactive-border px-6 py-3 rounded-full text-black font-semibold flex items-center gap-2 overflow-hidden relative"
            >
              <Download className="w-5 h-5" />
              <span>Download Core Engine</span>
            </motion.button>

            {/* Secondary Button */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.96 }}
              onMouseMove={(e) => handleButtonMove(e, 'secondary')}
              onMouseLeave={() => setButtonLight(prev => ({ ...prev, secondary: { x: 0, y: 0 } }))}
              style={{
                '--x': `${buttonLight.secondary.x}px`,
                '--y': `${buttonLight.secondary.y}px`
              }}
              className="btn-secondary interactive-border px-6 py-3 rounded-full text-white font-semibold flex items-center gap-2 relative"
            >
              <Code2 className="w-5 h-5" />
              <span>Run via CLI</span>
            </motion.button>
          </div>

          {/* Terminal */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            onMouseMove={handleTerminalMove}
            onMouseLeave={() => setTerminalLight({ x: 0, y: 0 })}
            style={{
              '--x': `${terminalLight.x}px`,
              '--y': `${terminalLight.y}px`
            }}
            className="mt-12 max-w-2xl mx-auto"
          >
            <div className="terminal-card interactive-border relative overflow-hidden">
              {/* Terminal Header */}
              <div className="terminal-header">
                <span className="dot red"></span>
                <span className="dot yellow"></span>
                <span className="dot green"></span>
                <span className="terminal-title">zsh — localflux</span>
              </div>

              {/* Terminal Body */}
              <div className="terminal-body">
                <p className="cmd">$ npx localflux start</p>
                <p className="dim">Initializing LocalFlux engine...</p>
                <p className="success">✔ Server running on LAN</p>
                <p className="link">http://192.168.1.100:3000</p>
                <p className="success">Ready to accept connections<span className="cursor" /></p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
