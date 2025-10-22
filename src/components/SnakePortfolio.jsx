import React, { useEffect, useRef, useState } from "react";

export default function SnakePortfolio() {
  // -- Config
  const CELL = 32;
  const BOARD_COLS = 20;
  const BOARD_ROWS = 14;
  const TICK_MS = 120;

  // -- Refs & state
  const canvasRef = useRef(null);
  const [running, setRunning] = useState(true);
  const [score, setScore] = useState(0);
  const [projects, setProjects] = useState(null);
  const [modal, setModal] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [projectNodes, setProjectNodes] = useState([]);

  // fallback sample projects
  const SAMPLE = [
    {
      id: 1,
      title: "COVID-19 Detection Using CNN",
      short:
        "Implementation of the paper “An Efficient CNN Model for COVID-19 Disease Detection Based on X-Ray Image Classification.”",
      url: "https://github.com/amirtaslimi/COVID19-Detection-CNN",
    },
    {
      id: 2,
      title: "Steel Defect Detection and Segmentation",
      short:
        "Industrial defect detection and segmentation on steel sheets using deep learning",
      url: "https://github.com/amirtaslimi/severstal-steel-defect-detection",
    },
    {
      id: 3,
      title: "AI Conversation Language Coach",
      short:
        "An AI-powered web app that listens to two-person English conversations, gives personalized coaching feedback using large language models.",
      url: "https://github.com/amirtaslimi/ai-speaking-feedback",
    },
  ];

  // -- Game state refs
  const snakeRef = useRef([{ x: 5, y: 7 }]);
  const dirRef = useRef({ x: 1, y: 0 });
  const projectNodesRef = useRef([]);
  const redNodesRef = useRef([]);
  const tickTimerRef = useRef(null);

  // -- Swipe state
  const touchStartRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    fetch("/projects.json")
      .then((r) => (r.ok ? r.json() : Promise.reject("no file")))
      .then((data) =>
        setProjects(Array.isArray(data) && data.length ? data : SAMPLE)
      )
      .catch(() => setProjects(SAMPLE));
  }, []);

  useEffect(() => {
    if (!projects) return;
    placeProjectsOnBoard(projects);
    startGameLoop();
    window.addEventListener("keydown", handleKey);
    return () => {
      stopGameLoop();
      window.removeEventListener("keydown", handleKey);
    };
  }, [projects]);

  function placeProjectsOnBoard(list) {
    const nodes = [];
    const reserved = new Set(snakeRef.current.map((s) => `${s.x},${s.y}`));

    for (let i = 0; i < list.length; i++) {
      let x, y;
      do {
        x = Math.floor(Math.random() * BOARD_COLS);
        y = Math.floor(Math.random() * BOARD_ROWS);
      } while (reserved.has(`${x},${y}`));
      reserved.add(`${x},${y}`);
      nodes.push({ x, y, project: list[i] });
    }
    projectNodesRef.current = nodes;
    setProjectNodes(nodes);

    const redCount = Math.max(6, Math.floor(list.length / 2));
    const reds = [];
    for (let i = 0; i < redCount; i++) {
      let x, y;
      do {
        x = Math.floor(Math.random() * BOARD_COLS);
        y = Math.floor(Math.random() * BOARD_ROWS);
      } while (reserved.has(`${x},${y}`));
      reserved.add(`${x},${y}`);
      reds.push({ x, y });
    }
    redNodesRef.current = reds;
  }

  function startGameLoop() {
    if (tickTimerRef.current) return;
    tickTimerRef.current = setInterval(() => tick(), TICK_MS);
  }

  function stopGameLoop() {
    if (tickTimerRef.current) clearInterval(tickTimerRef.current);
    tickTimerRef.current = null;
  }

  function resetGame() {
    snakeRef.current = [{ x: 5, y: 7 }];
    dirRef.current = { x: 1, y: 0 };
    setScore(0);
    setGameOver(false);
    placeProjectsOnBoard(projects || SAMPLE);
  }

  function handleKey(e) {
    const k = e.key;
    const d = dirRef.current;
    if ((k === "ArrowUp" || k === "w") && d.y === 0)
      dirRef.current = { x: 0, y: -1 };
    if ((k === "ArrowDown" || k === "s") && d.y === 0)
      dirRef.current = { x: 0, y: 1 };
    if ((k === "ArrowLeft" || k === "a") && d.x === 0)
      dirRef.current = { x: -1, y: 0 };
    if ((k === "ArrowRight" || k === "d") && d.x === 0)
      dirRef.current = { x: 1, y: 0 };
    if (k === " ") {
      setRunning((r) => {
        const next = !r;
        if (next) startGameLoop();
        else stopGameLoop();
        return next;
      });
    }
    if (k === "r") resetGame();
  }

  // --- Touch handlers
  function handleTouchStart(e) {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  }

  function handleTouchEnd(e) {
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;
    const d = dirRef.current;

    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx > 0 && d.x === 0) dirRef.current = { x: 1, y: 0 };
      else if (dx < 0 && d.x === 0) dirRef.current = { x: -1, y: 0 };
    } else {
      if (dy > 0 && d.y === 0) dirRef.current = { x: 0, y: 1 };
      else if (dy < 0 && d.y === 0) dirRef.current = { x: 0, y: -1 };
    }
  }

  function tick() {
    const snake = snakeRef.current;
    const dir = dirRef.current;
    const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

    if (head.x < 0) head.x = BOARD_COLS - 1;
    if (head.x >= BOARD_COLS) head.x = 0;
    if (head.y < 0) head.y = BOARD_ROWS - 1;
    if (head.y >= BOARD_ROWS) head.y = 0;

    if (snake.some((s) => s.x === head.x && s.y === head.y)) {
      setGameOver(true);
      stopGameLoop();
      return;
    }

    snake.unshift(head);

    const nodes = projectNodesRef.current;
    const reds = redNodesRef.current;

    const eatenIndex = nodes.findIndex((n) => n.x === head.x && n.y === head.y);
    if (eatenIndex !== -1) {
      const node = nodes[eatenIndex];
      nodes.splice(eatenIndex, 1);
      setScore((s) => s + 1);
      setModal({ project: node.project, x: node.x, y: node.y });
      stopGameLoop();
      setRunning(false);
      if (nodes.length === 0) {
        setGameOver(true);
        stopGameLoop();
      }
    } else {
      const redIndex = reds.findIndex((r) => r.x === head.x && r.y === head.y);
      if (redIndex !== -1) {
        reds.splice(redIndex, 1);
        setScore((s) => {
          const next = s - 1;
          if (next <= 0) {
            resetGame();
            return 0;
          }
          return next;
        });
        let x, y;
        do {
          x = Math.floor(Math.random() * BOARD_COLS);
          y = Math.floor(Math.random() * BOARD_ROWS);
        } while (
          snake.some((s) => s.x === x && s.y === y) ||
          nodes.some((n) => n.x === x && n.y === y)
        );
        reds.push({ x, y });
      } else {
        snake.pop();
      }
    }

    renderBoard();
  }

  function renderBoard() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    canvas.width = BOARD_COLS * CELL * dpr;
    canvas.height = BOARD_ROWS * CELL * dpr;
    canvas.style.width = `${BOARD_COLS * CELL}px`;
    canvas.style.height = `${BOARD_ROWS * CELL}px`;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, BOARD_COLS * CELL, BOARD_ROWS * CELL);

    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, BOARD_COLS * CELL, BOARD_ROWS * CELL);

    ctx.strokeStyle = "rgba(255,255,255,0.03)";
    for (let i = 0; i <= BOARD_COLS; i++) {
      ctx.beginPath();
      ctx.moveTo(i * CELL + 0.5, 0);
      ctx.lineTo(i * CELL + 0.5, BOARD_ROWS * CELL);
      ctx.stroke();
    }
    for (let j = 0; j <= BOARD_ROWS; j++) {
      ctx.beginPath();
      ctx.moveTo(0, j * CELL + 0.5);
      ctx.lineTo(BOARD_COLS * CELL, j * CELL + 0.5);
      ctx.stroke();
    }

    projectNodesRef.current.forEach((n) => {
      const px = n.x * CELL,
        py = n.y * CELL;
      ctx.fillStyle = "#0ea5a4";
      ctx.fillRect(px + 2, py + 2, CELL - 4, CELL - 4);
      ctx.fillStyle = "#001219";
      ctx.font = "10px sans-serif";
      ctx.fillText(n.project.title.slice(0, 10), px + 4, py + CELL / 2 + 3);
    });

    redNodesRef.current.forEach((r) => {
      const px = r.x * CELL,
        py = r.y * CELL;
      ctx.fillStyle = "#ef4444";
      ctx.fillRect(px + 2, py + 2, CELL - 4, CELL - 4);
    });

    const snake = snakeRef.current;
    for (let i = 0; i < snake.length; i++) {
      const s = snake[i];
      const x = s.x * CELL,
        y = s.y * CELL;
      ctx.fillStyle = i === 0 ? "#60a5fa" : "#2563eb";
      ctx.fillRect(x + 3, y + 3, CELL - 6, CELL - 6);
      if (i === 0) {
        ctx.fillStyle = "#001219";
        ctx.fillRect(x + (dirRef.current.x === -1 ? 5 : CELL - 9), y + 7, 3, 3);
      }
    }
  }

  useEffect(() => {
    renderBoard();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-4">
      <header className="flex items-center justify-between mb-3">
        <h2 className="text-2xl font-semibold">Snake Portfolio</h2>
        <div className="text-sm text-slate-400">
          Score: {score} •{" "}
          {gameOver ? "Game over" : running ? "Running" : "Paused"}
        </div>
      </header>

      <div className="flex gap-6 relative">
        <div className="bg-slate-900 p-3 rounded-lg shadow-lg">
          <canvas
            ref={canvasRef}
            className="block touch-none"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          />
          <div className="mt-2 text-xs text-slate-300">
            Swipe to move (mobile) • Use arrows/WASD (desktop) • Space to pause
            • R to reset
          </div>
        </div>

        <aside className="w-80 md:w-96 lg:w-[420px]">
          <div className="bg-white/5 p-3 rounded-lg">
            <h3 className="font-medium">Projects on board</h3>
            <ul className="mt-2 text-sm space-y-2">
              {projectNodes.map((n) => (
                <li
                  key={`${n.x}-${n.y}`}
                  className="flex items-center justify-between"
                >
                  <div>
                    <div className="text-sm font-medium">{n.project.title}</div>
                    <div className="text-xs text-slate-400">
                      {n.project.short}
                    </div>
                  </div>
                  <button
                    className="text-xs px-2 py-1 bg-slate-700 rounded"
                    onClick={() =>
                      setModal({ project: n.project, x: n.x, y: n.y })
                    }
                  >
                    Open
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>

      {modal && (
        <div className="fixed inset-0 flex items-center justify-center z-40">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setModal(null)}
          />
          <div className="relative bg-white rounded-lg p-4 w-96 shadow-2xl">
            <h4 className="text-lg font-semibold">{modal.project.title}</h4>
            <p className="mt-2 text-sm text-slate-600">{modal.project.short}</p>
            <div className="mt-4 flex gap-2 justify-end">
              <a
                href={modal.project.url || "#"}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1 bg-sky-600 text-white rounded"
              >
                Visit
              </a>
              <button
                onClick={() => {
                  setModal(null);
                  setRunning(true);
                  startGameLoop();
                }}
                className="px-3 py-1 bg-slate-200 rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 flex gap-2">
        <button
          onClick={() => {
            setRunning(true);
            startGameLoop();
          }}
          className="px-3 py-1 bg-emerald-600 text-white rounded"
        >
          Start
        </button>
        <button
          onClick={() => {
            setRunning(false);
            stopGameLoop();
          }}
          className="px-3 py-1 bg-yellow-500 text-white rounded"
        >
          Pause
        </button>
        <button
          onClick={() => {
            resetGame();
            setRunning(true);
            startGameLoop();
          }}
          className="px-3 py-1 bg-sky-600 text-white rounded"
        >
          Reset
        </button>
      </div>

      <div className="mt-4 text-xs text-slate-400">
        Made with ❤️ • Swipe on mobile or use keyboard arrows. You can style
        tiles, add sounds, and store high scores in localStorage.
      </div>
    </div>
  );
}
