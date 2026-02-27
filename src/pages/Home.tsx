import { useState, useRef, useEffect, useCallback } from "react";
import "./Home.css";

const DEFAULT_SKILLS = [
  { name: "Drawing", color: "#FF6B6B", emoji: "🎨" },
  { name: "Dancing", color: "#FFD93D", emoji: "💃" },
  { name: "Cooking", color: "#6BCB77", emoji: "🍳" },
  { name: "Singing", color: "#4D96FF", emoji: "🎤" },
  { name: "Coding", color: "#C77DFF", emoji: "💻" },
  { name: "Writing", color: "#FF9F1C", emoji: "✍️" },
  { name: "Yoga", color: "#2EC4B6", emoji: "🧘" },
  { name: "Photography", color: "#E71D36", emoji: "📷" },
];

const TASKS: Record<string, string[]> = {
  Drawing: ["Draw your pet from memory", "Sketch your hand in 60 seconds", "Doodle a dream landscape"],
  Dancing: ["Do the robot for 30 seconds", "Choreograph a 10-second TikTok move", "Dance to a random song's first 15 sec"],
  Cooking: ["Make a dish using only 3 ingredients", "Recreate a childhood meal", "Invent a new sandwich"],
  Singing: ["Sing your favorite chorus in falsetto", "Hum a melody you made up", "Beatbox for 20 seconds"],
  Coding: ["Build a button that does something funny", "Write a function that surprises you", "Create a CSS animation from scratch"],
  Writing: ["Write a haiku about your day", "Describe your room in exactly 50 words", "Start a story with 'It was almost midnight'"],
  Yoga: ["Hold Warrior II for 1 minute", "Try a headstand against the wall", "Do 5 sun salutations"],
  Photography: ["Capture an emotion without faces", "Find beauty in something ugly", "Shoot 5 frames, tell a story"],
};

type Page = "home" | "progress";

interface SpinHistory {
  skill: string;
  emoji: string;
  task: string;
  timestamp: number;
}

// The pointer sits at the TOP of the canvas, which corresponds to angle = -π/2 (270°).
// Slices are drawn starting from `angle` (offset from 0 = right).
// To find which slice is under the top pointer:
//   pointerAngle = -π/2  (top)
//   relative = (pointerAngle - angle + 4π) % 2π   → where in the wheel the pointer falls
//   index = floor(relative / arc)
export function getSelectedIndex(angle: number, count: number): number {
  const arc = (2 * Math.PI) / count;
  const pointerAngle = -Math.PI / 2; // top of canvas
  const relative = ((pointerAngle - angle) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
  return Math.floor(relative / arc) % count;
}

function drawWheel(
  canvas: HTMLCanvasElement,
  skills: typeof DEFAULT_SKILLS,
  angle: number
) {
  const ctx = canvas.getContext("2d")!;
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  // Leave room at top for the pointer triangle drawn inside canvas
  const radius = cx - 20;
  const arc = (2 * Math.PI) / skills.length;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // ── Slices ────────────────────────────────────────────
  skills.forEach((skill, i) => {
    const startAngle = angle + i * arc;
    const endAngle = startAngle + arc;

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, startAngle, endAngle);
    ctx.closePath();
    ctx.fillStyle = skill.color;
    ctx.fill();

    ctx.strokeStyle = "rgba(0,0,0,0.2)";
    ctx.lineWidth = 2;
    ctx.stroke();
  });

  // ── Highlight the selected slice ──────────────────────
  const selectedIdx = getSelectedIndex(angle, skills.length);
  const hlStart = angle + selectedIdx * arc;
  const hlEnd = hlStart + arc;
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.arc(cx, cy, radius, hlStart, hlEnd);
  ctx.closePath();
  ctx.strokeStyle = "rgba(255,255,255,0.55)";
  ctx.lineWidth = 4;
  ctx.stroke();

  // ── Labels ────────────────────────────────────────────
  skills.forEach((skill, i) => {
    const midAngle = angle + i * arc + arc / 2;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(midAngle);
    ctx.textAlign = "right";

    ctx.font = "bold 18px 'Syne', sans-serif";
    ctx.fillStyle = "rgba(0,0,0,0.65)";
    ctx.fillText(skill.name, radius - 12, 6);
    ctx.restore();
  });

  // ── Outer ring ────────────────────────────────────────
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
  ctx.strokeStyle = "rgba(255,255,255,0.15)";
  ctx.lineWidth = 3;
  ctx.stroke();

  // ── Center hub ────────────────────────────────────────
  const hubGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 34);
  hubGrad.addColorStop(0, "#ffffff");
  hubGrad.addColorStop(1, "#cccccc");
  ctx.beginPath();
  ctx.arc(cx, cy, 34, 0, 2 * Math.PI);
  ctx.fillStyle = hubGrad;
  ctx.fill();
  ctx.strokeStyle = "rgba(0,0,0,0.15)";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.font = "18px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("🎯", cx, cy);

  // ── Pointer triangle (drawn ON canvas at top-center) ──
  const px = cx;          // tip X = center of canvas horizontally
  const py = cy - radius; // tip Y = exact rim of wheel at top
  const pw = 18;          // half-width of triangle base
  const ph = 28;          // height of triangle (points INTO the wheel)

  ctx.beginPath();
  ctx.moveTo(px, py + ph);        // tip (points into wheel)
  ctx.lineTo(px - pw, py - 4);    // top-left
  ctx.lineTo(px + pw, py - 4);    // top-right
  ctx.closePath();
  ctx.fillStyle = "#ff3333";
  ctx.fill();
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Pointer pin circle at tip
  ctx.beginPath();
  ctx.arc(px, py + ph, 5, 0, 2 * Math.PI);
  ctx.fillStyle = "#fff";
  ctx.fill();
}

export default function App() {
  const [page, setPage] = useState<Page>("home");
  const [skills, setSkills] = useState(DEFAULT_SKILLS);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<{ skill: string; emoji: string; task: string } | null>(null);
  const [history, setHistory] = useState<SpinHistory[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillEmoji, setNewSkillEmoji] = useState("⭐");
  const [wheelAngle, setWheelAngle] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  const draw = useCallback(
    (angle: number) => {
      if (canvasRef.current) drawWheel(canvasRef.current, skills, angle);
    },
    [skills]
  );

  useEffect(() => {
    if (page === "home") {
      // Use rAF to ensure the canvas has fully mounted in the DOM before drawing
      const id = requestAnimationFrame(() => draw(wheelAngle));
      return () => cancelAnimationFrame(id);
    }
  }, [skills, draw, wheelAngle, page]);

  const spin = () => {
    if (spinning) return;
    setResult(null);
    setSpinning(true);

    const totalRotation = (Math.PI * 2 * (8 + Math.random() * 8));
    const duration = 4000;
    const start = performance.now();
    const startAngle = wheelAngle;

    const easeOut = (t: number) => 1 - Math.pow(1 - t, 4);

    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOut(progress);
      const currentAngle = startAngle + totalRotation * eased;
      setWheelAngle(currentAngle);
      draw(currentAngle);

      if (progress < 1) {
        animRef.current = requestAnimationFrame(animate);
      } else {
        setSpinning(false);
        const index = getSelectedIndex(currentAngle, skills.length);
        const picked = skills[index];
        const tasksForSkill = TASKS[picked.name] || ["Practice this skill for 10 minutes!"];
        const task = tasksForSkill[Math.floor(Math.random() * tasksForSkill.length)];

        const entry: SpinHistory = { skill: picked.name, emoji: picked.emoji, task, timestamp: Date.now() };
        setResult({ skill: picked.name, emoji: picked.emoji, task });
        setHistory((h) => [entry, ...h]);

        if ("speechSynthesis" in window) {
          const utt = new SpeechSynthesisUtterance(`${picked.name}! Your task is: ${task}`);
          utt.rate = 0.95;
          window.speechSynthesis.speak(utt);
        }
      }
    };

    animRef.current = requestAnimationFrame(animate);
  };

  const addSkill = () => {
    if (!newSkillName.trim()) return;
    const colors = ["#FF6B6B","#FFD93D","#6BCB77","#4D96FF","#C77DFF","#FF9F1C","#2EC4B6","#E71D36"];
    const color = colors[skills.length % colors.length];
    setSkills([...skills, { name: newSkillName.trim(), color, emoji: newSkillEmoji }]);
    setNewSkillName("");
    setNewSkillEmoji("⭐");
    setShowAddModal(false);
  };

  const reset = () => {
    setHistory([]);
    setResult(null);
  };

  // Skill frequency for progress
  const freq: Record<string, number> = {};
  history.forEach((h) => { freq[h.skill] = (freq[h.skill] || 0) + 1; });
  const maxFreq = Math.max(...Object.values(freq), 1);

  return (
    <div className="app">
      <header className="header">
        <div className="header-left">
          {page === "progress" && (
            <button className="back-btn" onClick={() => setPage("home")}>
              ← Back
            </button>
          )}
        </div>
        <div className="logo">
          <span className="logo-icon">🎯</span>
          <span className="logo-text">Skill<span className="logo-accent">Roulette</span></span>
        </div>
        <nav className="nav">
          <button className={`nav-btn ${page === "home" ? "active" : ""}`} onClick={() => setPage("home")}>Spin</button>
          <button className={`nav-btn ${page === "progress" ? "active" : ""}`} onClick={() => setPage("progress")}>
            Progress {history.length > 0 && <span className="badge">{history.length}</span>}
          </button>
        </nav>
      </header>

      {page === "home" && (
        <main className="home">
          <div className="wheel-section">
            <div className="wheel-wrapper">
              <canvas ref={canvasRef} width={480} height={480} className="wheel-canvas" />
            </div>
            <div className="controls">
              <button className={`spin-btn ${spinning ? "spinning" : ""}`} onClick={spin} disabled={spinning}>
                {spinning ? "Spinning..." : "SPIN"}
              </button>
              <button className="add-btn" onClick={() => setShowAddModal(true)}>＋ Add Skill</button>
              <button className="reset-btn" onClick={reset}>↺ Reset</button>
            </div>
          </div>

          <div className="result-section">
            {result ? (
              <div className="result-card animate-in">
                <div className="result-emoji">{result.emoji}</div>
                <h2 className="result-skill">{result.skill}</h2>
                <p className="result-label">Your challenge</p>
                <p className="result-task">"{result.task}"</p>
                {history.length > 0 && (
                  <div className="last-spun">
                    <span>Last spin:</span> {history[0]?.skill}
                  </div>
                )}
              </div>
            ) : (
              <div className="result-placeholder">
                <div className="placeholder-icon">✨</div>
                <p>Spin the wheel to get your challenge!</p>
                <p className="placeholder-sub">A random skill and task await you.</p>
              </div>
            )}
          </div>
        </main>
      )}

      {page === "progress" && (
        <main className="progress-page">
          <div className="progress-header">
            <h2>Your Journey</h2>
            <p>{history.length} spin{history.length !== 1 ? "s" : ""} total</p>
          </div>

          {history.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📊</div>
              <p>No spins yet. Head back and spin!</p>
            </div>
          ) : (
            <>
              <div className="bars-section">
                <h3>Skill Frequency</h3>
                <div className="bars">
                  {Object.entries(freq).sort((a, b) => b[1] - a[1]).map(([name, count]) => {
                    const skill = skills.find((s) => s.name === name);
                    return (
                      <div key={name} className="bar-row">
                        <span className="bar-label">{skill?.emoji} {name}</span>
                        <div className="bar-track">
                          <div
                            className="bar-fill"
                            style={{ width: `${(count / maxFreq) * 100}%`, background: skill?.color || "#ccc" }}
                          />
                        </div>
                        <span className="bar-count">{count}×</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="history-section">
                <h3>Spin History</h3>
                <div className="history-list">
                  {history.map((h, i) => (
                    <div key={i} className="history-item">
                      <span className="history-emoji">{h.emoji}</span>
                      <div className="history-text">
                        <strong>{h.skill}</strong>
                        <span>{h.task}</span>
                      </div>
                      <span className="history-time">{new Date(h.timestamp).toLocaleTimeString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </main>
      )}

      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Add a New Skill</h3>
            <div className="modal-field">
              <label>Emoji</label>
              <input value={newSkillEmoji} onChange={(e) => setNewSkillEmoji(e.target.value)} maxLength={2} className="emoji-input" />
            </div>
            <div className="modal-field">
              <label>Skill Name</label>
              <input
                value={newSkillName}
                onChange={(e) => setNewSkillName(e.target.value)}
                placeholder="e.g. Juggling"
                onKeyDown={(e) => e.key === "Enter" && addSkill()}
                autoFocus
              />
            </div>
            <div className="modal-actions">
              <button className="modal-cancel" onClick={() => setShowAddModal(false)}>Cancel</button>
              <button className="modal-confirm" onClick={addSkill}>Add</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
