/*
SnakePortfolio.jsx
A single-file React component (default export) implementing a Snake game that "eats" project tiles.

How to use
1. Create a React app (Vite or CRA). Ensure Tailwind is configured (or remove Tailwind classes and use plain CSS).
2. Place this file in src/components/SnakePortfolio.jsx and import it in your App.jsx.
3. Optional: create a `public/projects.json` file containing an array of projects. If missing the component falls back to a sample list.
4. Build and host to GitHub Pages (see short instructions below).

GitHub Pages quick host
- For a static build (create-react-app):
  1. Add `homepage` in package.json: "homepage": "https://<your-username>.github.io/<repo-name>"
  2. Install `gh-pages` and add deploy script: "predeploy": "npm run build", "deploy": "gh-pages -d build"
  3. Run `npm run deploy`.
- Or use `gh-pages` branch and push build artifacts to it or configure repository Settings -> Pages -> Branch: gh-pages/main.

This component uses Tailwind utility classes. If you don't have Tailwind, either style manually or adapt the classes.
*/

import React, { useEffect, useRef, useState } from "react";

export default function SnakePortfolio() {
  // -- Config
  const CELL = 32; // pixels per cell
  const BOARD_COLS = 20;
  const BOARD_ROWS = 14;
  const TICK_MS = 120; // game tick in ms (speed)

  // -- Refs and state
  const canvasRef = useRef(null);
  const [running, setRunning] = useState(true);
  const [score, setScore] = useState(0);
  const [projects, setProjects] = useState(null); // loaded from /projects.json or fallback
  const [modal, setModal] = useState(null); // {project, x, y}
  const [gameOver, setGameOver] = useState(false);

  // fallback sample projects
  const SAMPLE = [
    {
      id: 1,
      title: "Cataract Phase Recognition",
      short: "Lightweight domain-adaptive model.",
      url: "#",
    },
    {
      id: 2,
      title: "VLM Food App",
      short: "Small VLM that suggests recipes.",
      url: "#",
    },
    {
      id: 3,
      title: "Snake Portfolio",
      short: "This interactive portfolio demo.",
      url: "#",
    },
    {
      id: 4,
      title: "Video Segmentation",
      short: "Temporal segmentation ideas.",
      url: "#",
    },
    {
      id: 5,
      title: "MLOps Notes",
      short: "Deployment pipelines & tips.",
      url: "#",
    },
  ];

  // game state in refs to avoid constant re-renders
  const snakeRef = useRef([{ x: 5, y: 7 }]);
  const dirRef = useRef({ x: 1, y: 0 });
  const projectNodesRef = useRef([]); // {x,y,project}
  const redNodesRef = useRef([]); // {x,y}
  const lastTickRef = useRef(0);
  const tickTimerRef = useRef(null);

  useEffect(() => {
    // try to fetch projects.json
    fetch("public/projects.json")
      .then((r) => (r.ok ? r.json() : Promise.reject("no file")))
      .then((data) => {
        if (Array.isArray(data) && data.length) setProjects(data);
        else setProjects(SAMPLE);
      })
      .catch(() => setProjects(SAMPLE));
  }, []);

  useEffect(() => {
    // initialize board and place project nodes once projects loaded
    if (!projects) return;
    placeProjectsOnBoard(projects);
    startGameLoop();
    window.addEventListener("keydown", handleKey);
    return () => {
      stopGameLoop();
      window.removeEventListener("keydown", handleKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projects]);

  function placeProjectsOnBoard(list) {
    const nodes = [];
    const reserved = new Set(snakeRef.current.map((s) => `${s.x},${s.y}`));

    // --- Place green squares (projects)
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

    // --- Place red penalty squares (same count as projects, or you can tweak)
    const redCount = Math.max(6, Math.floor(list.length / 2)); // e.g., half as many
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
    if (k === "ArrowUp" || k === "w")
      if (d.y === 0) dirRef.current = { x: 0, y: -1 };
    if (k === "ArrowDown" || k === "s")
      if (d.y === 0) dirRef.current = { x: 0, y: 1 };
    if (k === "ArrowLeft" || k === "a")
      if (d.x === 0) dirRef.current = { x: -1, y: 0 };
    if (k === "ArrowRight" || k === "d")
      if (d.x === 0) dirRef.current = { x: 1, y: 0 };
    if (k === " ") {
      // pause
      setRunning((r) => {
        const next = !r;
        if (next) startGameLoop();
        else stopGameLoop();
        return next;
      });
    }
    if (k === "r") resetGame();
  }

  function tick() {
    const snake = snakeRef.current;
    const dir = dirRef.current;
    const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

    // boundaries -> wrap-around
    if (head.x < 0) head.x = BOARD_COLS - 1;
    if (head.x >= BOARD_COLS) head.x = 0;
    if (head.y < 0) head.y = BOARD_ROWS - 1;
    if (head.y >= BOARD_ROWS) head.y = 0;

    // check self-collision
    if (snake.some((s) => s.x === head.x && s.y === head.y)) {
      setGameOver(true);
      stopGameLoop();
      return;
    }

    // move snake
    snake.unshift(head);

    // check project nodes (eat)
    const nodes = projectNodesRef.current;
    const reds = redNodesRef.current;

    // --- Check for green project eaten
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
      // --- Check for red square hit
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
        // respawn a new red square randomly
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
        // normal move
        snake.pop();
      }
    }

    // render
    renderBoard();
  }

  function renderBoard() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    // high DPI
    const dpr = window.devicePixelRatio || 1;
    canvas.width = BOARD_COLS * CELL * dpr;
    canvas.height = BOARD_ROWS * CELL * dpr;
    canvas.style.width = `${BOARD_COLS * CELL}px`;
    canvas.style.height = `${BOARD_ROWS * CELL}px`;
    ctx.scale(dpr, dpr);

    // clear
    ctx.clearRect(0, 0, BOARD_COLS * CELL, BOARD_ROWS * CELL);

    // background grid
    ctx.fillStyle = "#0f172a"; // background dark
    ctx.fillRect(0, 0, BOARD_COLS * CELL, BOARD_ROWS * CELL);

    // subtle grid lines
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

    // draw projects
    const nodes = projectNodesRef.current;
    nodes.forEach((n) => {
      const px = n.x * CELL,
        py = n.y * CELL;
      // tile
      ctx.fillStyle = "#0ea5a4";
      ctx.fillRect(px + 2, py + 2, CELL - 4, CELL - 4);
      // short text (initial)
      ctx.fillStyle = "#001219";
      ctx.font = "10px sans-serif";
      const label = n.project.title.slice(0, 10);
      ctx.fillText(label, px + 4, py + CELL / 2 + 3);
    });

    // draw red squares
    const reds = redNodesRef.current;
    reds.forEach((r) => {
      const px = r.x * CELL,
        py = r.y * CELL;
      ctx.fillStyle = "#ef4444"; // Tailwind red-500
      ctx.fillRect(px + 2, py + 2, CELL - 4, CELL - 4);
    });

    // draw snake
    const snake = snakeRef.current;
    for (let i = 0; i < snake.length; i++) {
      const s = snake[i];
      const x = s.x * CELL,
        y = s.y * CELL;
      // gradient color and body/tail
      ctx.fillStyle = i === 0 ? "#60a5fa" : "#2563eb";
      ctx.fillRect(x + 3, y + 3, CELL - 6, CELL - 6);
      // eye for head
      if (i === 0) {
        ctx.fillStyle = "#001219";
        ctx.fillRect(x + (dirRef.current.x === -1 ? 5 : CELL - 9), y + 7, 3, 3);
      }
    }
  }

  // initial render when component mounts
  useEffect(() => {
    renderBoard();
  }, []); // eslint-disable-line

  return (
    <div className="max-w-6xl mx-auto p-4">
      <header className="flex items-center justify-between mb-3">
        <h2 className="text-2xl font-semibold">Snake Portfolio</h2>
        <div className="text-sm text-slate-400">
          Score: {score} •{" "}
          {gameOver ? "Game over" : running ? "Running" : "Paused"}
        </div>
      </header>

      <div className="flex gap-6">
        <div className="bg-slate-900 p-3 rounded-lg shadow-lg">
          <canvas ref={canvasRef} className="block" />
          <div className="mt-2 text-xs text-slate-300">
            Use arrows or WASD to move • Space to pause • R to reset
          </div>
        </div>

        <aside className="w-80 md:w-96 lg:w-[420px]">
          <div className="bg-white/5 p-3 rounded-lg">
            <h3 className="font-medium">Projects on board</h3>
            <ul className="mt-2 text-sm space-y-2">
              {(projectNodesRef.current.length
                ? projectNodesRef.current
                : []
              ).map((n) => (
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

      {/* modal */}
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

      {/* footer controls */}
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

      {/* small legend */}
      <div className="mt-4 text-xs text-slate-400">
        Made with ❤️ • You can style tiles, add sounds, and store high scores in
        localStorage.
      </div>
    </div>
  );
}
