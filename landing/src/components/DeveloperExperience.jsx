import React from "react";
import { motion } from "framer-motion";
import { Terminal } from "lucide-react";

export function DeveloperExperience() {
  const logs = [
    { type: "command", text: "$ npx localflux start" },
    { type: "success", text: "✓ LocalFlux Engine v2.1.0" },
    { type: "info", text: "⚡ Initializing game server..." },
    { type: "success", text: "✓ Server running on LAN" },
    { type: "highlight", text: "🌐 http://192.168.1.100:3000" },
    { type: "info", text: "📱 Players can join via QR code" },
    { type: "success", text: "✓ WebSocket active on port 3000" },
    { type: "metric", text: "⏱️  Average latency: 0.8ms" },
    { type: "success", text: "✓ Ready to host quiz games" },
  ];

  return (
    <section className="relative py-24 md:py-32">
      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-5xl mx-auto"
        >
          {/* Heading */}
          <motion.div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 drop-shadow-[0_0_20px_rgba(16,185,129,0.2)]">
              <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                Developer-First
              </span>{" "}
              Experience
            </h2>

            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto">
              Get started in seconds. No configuration, no cloud setup, no hassle.
            </p>
          </motion.div>

          {/* Terminal - Premium */}
          <div className="relative group">
            {/* Subtle background glow - reduced intensity */}
            <motion.div
              className="absolute -inset-6 rounded-[2rem] opacity-20"
              style={{
                background: "linear-gradient(135deg, rgba(16,185,129,0.3), rgba(6,182,212,0.3))",
                filter: "blur(80px)",
              }}
              animate={{ opacity: [0.1, 0.3, 0.1], scale: [1, 1.05, 1] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            />

            <div className="absolute -inset-1 rounded-3xl opacity-0 group-hover:opacity-80 transition-opacity duration-300 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 blur-lg" />

            <div className="relative rounded-3xl overflow-hidden bg-[#0a0f1e]/95 backdrop-blur-xl border border-white/10 group-hover:border-white/20 transition-colors duration-300\">
              {/* Terminal header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/50 bg-gradient-to-r from-slate-900/30 to-transparent">
                <div className="flex items-center gap-3">
                  <div className="flex gap-2">
                    <motion.div className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-400" whileHover={{ scale: 1.2 }} />
                    <motion.div className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-400" whileHover={{ scale: 1.2 }} />
                    <motion.div className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-400" whileHover={{ scale: 1.2 }} />
                  </div>
                  <span className="text-xs text-gray-400 ml-2 font-mono">localflux-terminal</span>
                </div>

                <motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }}>
                  <Terminal className="w-5 h-5 text-emerald-400" />
                </motion.div>
              </div>

              {/* Terminal content */}
              <div className="p-8 font-mono text-sm md:text-base space-y-1">
                {logs.map((log, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08, duration: 0.4 }}
                    className={`${
                      log.type === "success"
                        ? "text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                        : log.type === "highlight"
                        ? "text-cyan-400 font-semibold drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]"
                        : log.type === "metric"
                        ? "text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.4)]"
                        : "text-gray-400"
                    }`}
                  >
                    {log.text}
                  </motion.div>
                ))}

                <div className="flex items-center mt-6 pt-4 border-t border-slate-700/30">
                  <span className="text-emerald-400">$</span>
                  <motion.div 
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="w-2 h-5 bg-emerald-400 ml-2 rounded-sm" 
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Stat Cards - Premium */}
          <motion.div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: "Install Time", value: "< 30s", icon: "⚡" },
              { label: "Configuration", value: "Zero", icon: "✨" },
              { label: "Dependencies", value: "Minimal", icon: "📦" },
            ].map((stat, i) => {
              const [light, setLight] = React.useState({ x: 0, y: 0 });
              
              const handleMouseMove = (e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setLight({ x: e.clientX - rect.left, y: e.clientY - rect.top });
              };
              
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                  whileHover={{ y: -6 }}
                  onMouseMove={handleMouseMove}
                  onMouseLeave={() => setLight({ x: 0, y: 0 })}
                  className="group relative"
                >
                  {/* Card */}
                  <div className="relative bg-white/[0.03] border border-white/10 rounded-2xl p-6 text-center backdrop-blur-xl transition-all duration-300" style={{
                    boxShadow: '0 10px 30px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05)'
                  }}>
                    {/* Cursor-following light */}
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none rounded-2xl transition-opacity duration-300"
                      style={{
                        background: `radial-gradient(300px circle at ${light.x}px ${light.y}px, rgba(16,185,129,0.12), transparent 60%)`
                      }}
                    />

                    {/* Content */}
                    <motion.div 
                      animate={{ y: [0, -3, 0] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                      className="relative text-4xl mb-3 z-10"
                    >
                      {stat.icon}
                    </motion.div>

                    <div className="relative text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-2 z-10">
                      {stat.value}
                    </div>
                    <div className="relative text-gray-400 group-hover:text-gray-300/80 transition-colors duration-300 z-10">{stat.label}</div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
