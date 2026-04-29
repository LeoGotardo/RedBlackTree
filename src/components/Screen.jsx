import { useState, useRef, useCallback } from "react";

const WALL = 1;
const PATH = 0;

const COLORS = {
  wall: "#32353c",
  path: "#0b0e15",
  start: "#4edea3",
  end: "#ffb4ab",
  current: "#adc6ff",
  visitedDFS: "#7F77DD",
  visitedBFS: "#C0DD97",
  solutionDFS: "#a89ef5",
  solutionBFS: "#EF9F27",
};

function generateMazeGrid(rows, cols) {
  const grid = Array.from({ length: rows }, () => Array(cols).fill(WALL));
  const stack = [[1, 1]];
  grid[1][1] = PATH;
  while (stack.length) {
    const [r, c] = stack[stack.length - 1];
    const dirs = [[-2, 0], [2, 0], [0, -2], [0, 2]].slice().sort(() => Math.random() - 0.5);
    const candidates = dirs
      .map(([dr, dc]) => [r + dr, c + dc, r + dr / 2, c + dc / 2])
      .filter(([nr, nc]) => nr > 0 && nr < rows - 1 && nc > 0 && nc < cols - 1 && grid[nr][nc] === WALL);
    if (candidates.length) {
      const [nr, nc, wr, wc] = candidates[Math.floor(Math.random() * candidates.length)];
      grid[wr][wc] = PATH;
      grid[nr][nc] = PATH;
      stack.push([nr, nc]);
    } else {
      stack.pop();
    }
  }
  return grid;
}

function calcSmartEnd(rows, cols) {
  if (rows <= 15 && cols <= 25) return [rows - 2, cols - 2];
  let er = Math.floor(rows * 0.8);
  let ec = Math.floor(cols * 0.8);
  if (er % 2 === 0) er--;
  if (ec % 2 === 0) ec--;
  return [er, ec];
}

function getNeighbors(grid, r, c) {
  return [[-1, 0], [1, 0], [0, -1], [0, 1]]
    .map(([dr, dc]) => [r + dr, c + dc])
    .filter(([nr, nc]) =>
      nr >= 0 && nr < grid.length &&
      nc >= 0 && nc < grid[0].length &&
      grid[nr][nc] === PATH
    );
}

function isConnected(grid, start, end) {
  const visited = new Set([`${start[0]},${start[1]}`]);
  const queue = [[...start]];
  while (queue.length) {
    const [r, c] = queue.shift();
    if (r === end[0] && c === end[1]) return true;
    for (const [nr, nc] of getNeighbors(grid, r, c)) {
      const k = `${nr},${nc}`;
      if (!visited.has(k)) { visited.add(k); queue.push([nr, nc]); }
    }
  }
  return false;
}

function ensureConnectivity(grid, start, end) {
  if (isConnected(grid, start, end)) return;
  let [r, c] = [...start];
  const [er, ec] = end;
  while (c !== ec) { grid[r][c] = PATH; c += c < ec ? 1 : -1; }
  while (r !== er) { grid[r][c] = PATH; r += r < er ? 1 : -1; }
  grid[er][ec] = PATH;
}

function buildMaze(rows, cols) {
  const grid = generateMazeGrid(rows, cols);
  const start = [1, 1];
  const end = calcSmartEnd(rows, cols);
  grid[start[0]][start[1]] = PATH;
  grid[end[0]][end[1]] = PATH;
  ensureConnectivity(grid, start, end);
  return { grid, start, end };
}

function reconstructPath(parentMap, startKey, endKey) {
  const path = [];
  let cur = endKey;
  while (cur !== startKey && parentMap.has(cur)) {
    path.unshift(cur.split(",").map(Number));
    cur = parentMap.get(cur);
  }
  path.unshift(startKey.split(",").map(Number));
  return path;
}

function runDFS(grid, start, end) {
  const key = (r, c) => `${r},${c}`;
  const sKey = key(...start), eKey = key(...end);
  const visited = new Set([sKey]);
  const parentMap = new Map();
  const visitOrder = [];
  const stack = [[...start]];
  let found = false;
  while (stack.length) {
    const [r, c] = stack.pop();
    visitOrder.push([r, c]);
    if (key(r, c) === eKey) { found = true; break; }
    for (const [nr, nc] of getNeighbors(grid, r, c)) {
      const nk = key(nr, nc);
      if (!visited.has(nk)) { visited.add(nk); parentMap.set(nk, key(r, c)); stack.push([nr, nc]); }
    }
  }
  return { visitOrder, path: found ? reconstructPath(parentMap, sKey, eKey) : [] };
}

function runBFS(grid, start, end) {
  const key = (r, c) => `${r},${c}`;
  const sKey = key(...start), eKey = key(...end);
  const visited = new Set([sKey]);
  const parentMap = new Map();
  const visitOrder = [];
  const queue = [[...start]];
  let found = false;
  while (queue.length) {
    const [r, c] = queue.shift();
    visitOrder.push([r, c]);
    if (key(r, c) === eKey) { found = true; break; }
    const neighbors = getNeighbors(grid, r, c).reverse();
    for (const [nr, nc] of neighbors) {
      const nk = key(nr, nc);
      if (!visited.has(nk)) { visited.add(nk); parentMap.set(nk, key(r, c)); queue.push([nr, nc]); }
    }
  }
  return { visitOrder, path: found ? reconstructPath(parentMap, sKey, eKey) : [] };
}

const EMPTY_STATS = { algorithm: "-", visited: 0, pathLength: 0, time: "0ms", status: "Aguardando..." };

export default function MazeSolver({ setPage }) {
  const [mazeData, setMazeData] = useState(() => buildMaze(15, 21));
  const [pendingRows, setPendingRows] = useState(15);
  const [pendingCols, setPendingCols] = useState(21);
  const [cellState, setCellState] = useState({});
  const [currentCell, setCurrentCell] = useState(null);
  const [mode, setMode] = useState(null);
  const [hoverCell, setHoverCell] = useState(null);
  const [stats, setStats] = useState(EMPTY_STATS);
  const [comparison, setComparison] = useState(null);
  const [activeAlgo, setActiveAlgo] = useState(null);

  // Settings state
  const [showSettings, setShowSettings] = useState(false);
  const [animated, setAnimated] = useState(true);
  const [animSpeed, setAnimSpeedState] = useState(28);
  const [showLabels, setShowLabels] = useState(true);
  const [glowEffects, setGlowEffects] = useState(true);

  // Use ref so animation closures always read latest speed
  const animSpeedRef = useRef(28);
  const setAnimSpeed = (v) => { animSpeedRef.current = v; setAnimSpeedState(v); };

  const animTimers = useRef([]);

  const { grid, start, end } = mazeData;
  const rows = grid.length;
  const cols = grid[0].length;

  const cancelAnim = useCallback(() => {
    animTimers.current.forEach(clearTimeout);
    animTimers.current = [];
    setCurrentCell(null);
  }, []);

  const resetCells = useCallback(() => {
    cancelAnim();
    setCellState({});
    setComparison(null);
    setActiveAlgo(null);
    setStats(EMPTY_STATS);
  }, [cancelAnim]);

  const newMaze = useCallback((r = rows, c = cols) => {
    cancelAnim();
    setMazeData(buildMaze(r, c));
    setCellState({});
    setComparison(null);
    setActiveAlgo(null);
    setStats({ ...EMPTY_STATS, status: "Labirinto gerado!" });
  }, [rows, cols, cancelAnim]);

  // Single-algorithm animation. accum is an optional pre-filled cell state to start from.
  const animatePhase = useCallback((visitOrder, path, colorVisited, colorSolution, accum, onDone) => {
    const key = (r, c) => `${r},${c}`;
    const startKey = key(...start), endKey = key(...end);
    const isSpecial = (k) => k === startKey || k === endKey;
    const speed = () => animSpeedRef.current;

    let i = 0;
    const stepVisit = () => {
      if (i >= visitOrder.length) { stepPath(0); return; }
      const [r, c] = visitOrder[i++];
      const k = key(r, c);
      if (isSpecial(k)) { animTimers.current.push(setTimeout(stepVisit, 0)); return; }
      setCurrentCell(k);
      setCellState({ ...accum });
      animTimers.current.push(setTimeout(() => {
        accum[k] = colorVisited;
        setCurrentCell(null);
        setCellState({ ...accum });
        animTimers.current.push(setTimeout(stepVisit, Math.max(1, speed() / 5)));
      }, speed()));
    };
    const stepPath = (j) => {
      if (j >= path.length) { onDone(); return; }
      const [r, c] = path[j];
      const k = key(r, c);
      if (!isSpecial(k)) { accum[k] = colorSolution; setCellState({ ...accum }); }
      animTimers.current.push(setTimeout(() => stepPath(j + 1), speed()));
    };
    stepVisit();
  }, [start, end]);

  const animateSolve = useCallback((visitOrder, path, algo, time, colorVisited, colorSolution) => {
    cancelAnim();
    setCellState({});
    const key = (r, c) => `${r},${c}`;
    const startKey = key(...start), endKey = key(...end);
    const isSpecial = (k) => k === startKey || k === endKey;
    const finalStats = {
      algorithm: algo, visited: visitOrder.length, pathLength: path.length,
      time, status: path.length > 1 ? "Solução encontrada!" : "Sem caminho!",
    };

    if (!animated) {
      const cs = {};
      visitOrder.forEach(([r, c]) => { const k = key(r, c); if (!isSpecial(k)) cs[k] = colorVisited; });
      path.forEach(([r, c]) => { const k = key(r, c); if (!isSpecial(k)) cs[k] = colorSolution; });
      setCellState(cs);
      setStats(finalStats);
      return;
    }

    const accum = {};
    animatePhase(visitOrder, path, colorVisited, colorSolution, accum, () => setStats(finalStats));
  }, [animated, start, end, cancelAnim, animatePhase]);

  const solveDFS = useCallback(() => {
    setComparison(null);
    setActiveAlgo("dfs");
    const t0 = Date.now();
    const result = runDFS(grid, start, end);
    const t1 = Date.now();
    animateSolve(result.visitOrder, result.path, "DFS", `${t1 - t0}ms`, COLORS.visitedDFS, COLORS.solutionDFS);
  }, [grid, start, end, animateSolve]);

  const solveBFS = useCallback(() => {
    setComparison(null);
    setActiveAlgo("bfs");
    const t0 = Date.now();
    const result = runBFS(grid, start, end);
    const t1 = Date.now();
    animateSolve(result.visitOrder, result.path, "BFS", `${t1 - t0}ms`, COLORS.visitedBFS, COLORS.solutionBFS);
  }, [grid, start, end, animateSolve]);

  // Animate DFS fully then BFS on the same grid (sequential, both visible at the end)
  const solveBoth = useCallback(() => {
    cancelAnim();
    setCellState({});
    setComparison(null);
    setActiveAlgo("both");

    const t0 = Date.now();
    const dfs = runDFS(grid, start, end);
    const t1 = Date.now();
    const bfs = runBFS(grid, start, end);
    const t2 = Date.now();

    const dfsStats = { visited: dfs.visitOrder.length, path: dfs.path.length, time: `${t1 - t0}ms` };
    const bfsStats = { visited: bfs.visitOrder.length, path: bfs.path.length, time: `${t2 - t1}ms` };
    const winner = dfs.visitOrder.length <= bfs.visitOrder.length ? "DFS" : "BFS";
    const finalStats = {
      algorithm: "DFS + BFS",
      visited: dfs.visitOrder.length + bfs.visitOrder.length,
      pathLength: winner === "DFS" ? dfs.path.length : bfs.path.length,
      time: `${t2 - t0}ms`,
      status: "Comparação concluída!",
    };

    const key = (r, c) => `${r},${c}`;
    const startKey = key(...start), endKey = key(...end);
    const isSpecial = (k) => k === startKey || k === endKey;

    if (!animated) {
      const accum = {};
      dfs.visitOrder.forEach(([r, c]) => { const k = key(r, c); if (!isSpecial(k)) accum[k] = COLORS.visitedDFS; });
      dfs.path.forEach(([r, c]) => { const k = key(r, c); if (!isSpecial(k)) accum[k] = COLORS.solutionDFS; });
      bfs.visitOrder.forEach(([r, c]) => { const k = key(r, c); if (!isSpecial(k)) accum[k] = COLORS.visitedBFS; });
      bfs.path.forEach(([r, c]) => { const k = key(r, c); if (!isSpecial(k)) accum[k] = COLORS.solutionBFS; });
      setCellState(accum);
      setComparison({ dfs: dfsStats, bfs: bfsStats, winner });
      setStats(finalStats);
      return;
    }

    // Shared mutable accum so both phases paint on top of each other
    const accum = {};
    setStats((s) => ({ ...s, status: "Rodando DFS..." }));
    animatePhase(dfs.visitOrder, dfs.path, COLORS.visitedDFS, COLORS.solutionDFS, accum, () => {
      setStats((s) => ({ ...s, status: "Rodando BFS..." }));
      animTimers.current.push(setTimeout(() => {
        animatePhase(bfs.visitOrder, bfs.path, COLORS.visitedBFS, COLORS.solutionBFS, accum, () => {
          setComparison({ dfs: dfsStats, bfs: bfsStats, winner });
          setStats(finalStats);
        });
      }, 400));
    });
  }, [grid, start, end, animated, cancelAnim, animatePhase]);

  const applyNewSize = () => newMaze(pendingRows, pendingCols);

  const handleCellClick = (r, c) => {
    if (grid[r][c] !== PATH) return;
    if (mode === "start") { setMazeData((prev) => ({ ...prev, start: [r, c] })); setMode(null); }
    else if (mode === "end") { setMazeData((prev) => ({ ...prev, end: [r, c] })); setMode(null); }
  };

  const setRandomEnd = () => {
    const cells = [];
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++)
        if (grid[r][c] === PATH && !(r === start[0] && c === start[1]))
          cells.push([r, c]);
    if (cells.length) {
      const picked = cells[Math.floor(Math.random() * cells.length)];
      setMazeData((prev) => ({ ...prev, end: picked }));
      resetCells();
    }
  };

  const statsCards = [
    { label: "NODES EXPLORED", value: stats.visited || "—", color: "text-blue-400" },
    { label: "EXECUTION TIME", value: stats.time, color: "text-secondary" },
    { label: "PATH LENGTH", value: stats.pathLength || "—", color: "text-tertiary" },
    { label: "ALGORITHM", value: stats.algorithm, color: "text-primary" },
  ];

  const comparisonRows = comparison ? [
    ["Visited", comparison.dfs.visited, comparison.bfs.visited],
    ["Path", comparison.dfs.path, comparison.bfs.path],
    ["Time", comparison.dfs.time, comparison.bfs.time],
  ] : [];

  const algoButtons = [
    { id: "dfs", label: "Depth-First Search (DFS)", action: solveDFS, activeColor: "#7F77DD" },
    { id: "bfs", label: "Breadth-First Search (BFS)", action: solveBFS, activeColor: "#4edea3" },
    { id: "both", label: "Compare Both", action: solveBoth, activeColor: "#EF9F27" },
  ];

  const speedLabel = animSpeed <= 15 ? "Very Fast" : animSpeed <= 35 ? "Normal" : animSpeed <= 70 ? "Slow" : "Very Slow";

  return (
    <div className="flex h-screen overflow-hidden geometric-bg bg-surface">

      {/* Ambient glow orbs */}
      <div className="fixed top-0 right-0 -z-10 w-1/2 h-full opacity-20 pointer-events-none">
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-blue-500 blur-[120px] rounded-full" />
        <div className="absolute bottom-1/4 right-20 w-64 h-64 bg-secondary blur-[100px] rounded-full" />
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-16 z-50 bg-slate-950/80 backdrop-blur-xl flex items-center justify-between px-6 border-b border-white/10">
        <div
          className="text-lg font-black text-blue-500 tracking-wider uppercase"
          style={{ textShadow: "0 0 8px rgba(59,130,246,0.5)" }}
        >
          SISTEMA DE LABIRINTO
        </div>
        <div className="flex items-center gap-4">
          <span className={`text-xs font-mono uppercase tracking-widest transition-colors ${stats.status.includes("encontrada") || stats.status.includes("concluída") ? "text-secondary" : "text-slate-400"}`}>
            {stats.status}
          </span>
          <button
            onClick={() => setShowSettings((s) => !s)}
            className={`p-2 rounded-lg transition-all ${showSettings ? "bg-blue-500/20 text-blue-400" : "text-slate-400 hover:bg-white/5 hover:text-slate-200"}`}
          >
            <span className="material-symbols-outlined text-xl">settings</span>
          </button>
        </div>
      </header>

      {/* Settings drawer */}
      <div
        className={`fixed right-0 top-16 h-[calc(100vh-64px)] w-80 z-40 bg-slate-900/95 backdrop-blur-xl border-l border-white/10 shadow-2xl transition-transform duration-300 overflow-y-auto ${showSettings ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="p-6 space-y-6">
          <div>
            <h2 className="text-sm font-black text-slate-100 tracking-widest uppercase mb-1">Settings</h2>
            <p className="text-[10px] text-slate-500 tracking-widest">Configure the solver behaviour</p>
          </div>

          {/* Animation section */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-semibold tracking-widest uppercase text-blue-400">ANIMATION</h3>

            {/* Enable/disable toggle */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-200 font-medium">Enable Animation</p>
                <p className="text-[10px] text-slate-500">Animate the traversal step-by-step</p>
              </div>
              <button
                onClick={() => setAnimated((a) => !a)}
                className={`relative w-11 h-6 rounded-full transition-colors ${animated ? "bg-blue-500" : "bg-slate-700"}`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${animated ? "translate-x-5" : "translate-x-0"}`}
                />
              </button>
            </div>

            {/* Speed slider */}
            <div className={animated ? "" : "opacity-40 pointer-events-none"}>
              <div className="flex justify-between mb-2">
                <p className="text-sm text-slate-200 font-medium">Step Speed</p>
                <span className="text-[10px] text-blue-400 font-mono">{animSpeed}ms — {speedLabel}</span>
              </div>
              <input
                type="range"
                min={5}
                max={120}
                step={1}
                value={animSpeed}
                onChange={(e) => setAnimSpeed(+e.target.value)}
                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <div className="flex justify-between mt-1">
                <span className="text-[10px] text-slate-500">Fast</span>
                <span className="text-[10px] text-slate-500">Slow</span>
              </div>
            </div>
          </div>

          <div className="border-t border-white/5" />

          {/* Display section */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-semibold tracking-widest uppercase text-secondary">DISPLAY</h3>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-200 font-medium">Cell Labels</p>
                <p className="text-[10px] text-slate-500">Show S/E markers on start and end</p>
              </div>
              <button
                onClick={() => setShowLabels((l) => !l)}
                className={`relative w-11 h-6 rounded-full transition-colors ${showLabels ? "bg-blue-500" : "bg-slate-700"}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${showLabels ? "translate-x-5" : "translate-x-0"}`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-200 font-medium">Glow Effects</p>
                <p className="text-[10px] text-slate-500">Neon glow on start, end and active cell</p>
              </div>
              <button
                onClick={() => setGlowEffects((g) => !g)}
                className={`relative w-11 h-6 rounded-full transition-colors ${glowEffects ? "bg-blue-500" : "bg-slate-700"}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${glowEffects ? "translate-x-5" : "translate-x-0"}`} />
              </button>
            </div>
          </div>

          <div className="border-t border-white/5" />

          {/* Maze section */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-semibold tracking-widest uppercase text-tertiary">MAZE</h3>

            {[
              ["ROWS", pendingRows, setPendingRows, 9, 41],
              ["COLS", pendingCols, setPendingCols, 9, 51],
            ].map(([label, val, setter, min, max]) => (
              <div key={label}>
                <div className="flex justify-between mb-2">
                  <p className="text-sm text-slate-200 font-medium">{label === "ROWS" ? "Rows" : "Columns"}</p>
                  <span className="text-[10px] text-blue-400 font-mono">{val}</span>
                </div>
                <input
                  type="range"
                  min={min}
                  max={max}
                  step={2}
                  value={val}
                  onChange={(e) => setter(+e.target.value)}
                  className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
            ))}

            <button
              onClick={() => { applyNewSize(); setShowSettings(false); }}
              className="w-full py-2 bg-blue-500/20 border border-blue-500/30 text-blue-400 rounded-lg text-xs font-semibold uppercase tracking-wider hover:bg-blue-500/30 transition-all"
            >
              Apply & Generate New Maze
            </button>
          </div>

          <div className="border-t border-white/5" />

          {/* Color legend */}
          <div className="space-y-3">
            <h3 className="text-[10px] font-semibold tracking-widest uppercase text-slate-400">COLOR REFERENCE</h3>
            {[
              [COLORS.visitedDFS, "DFS Visited"],
              [COLORS.solutionDFS, "DFS Path"],
              [COLORS.visitedBFS, "BFS Visited"],
              [COLORS.solutionBFS, "BFS Path"],
              [COLORS.current, "Active Cell"],
            ].map(([color, label]) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: color }} />
                <span className="text-xs text-slate-400">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-72 z-40 pt-16 flex flex-col bg-slate-900/60 backdrop-blur-md border-r border-white/5 shadow-2xl">
        <div className="px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center border border-blue-500/30 text-blue-400 text-sm">
              ⬡
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100 tracking-wide">CONTROL CENTER</h2>
              <p className="text-[10px] text-blue-400/70 tracking-widest font-mono">V.2.0.0-STABLE</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-2 space-y-1 text-sm overflow-y-auto font-mono uppercase tracking-wider">
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-blue-500/20 text-blue-400 border-r-4 border-blue-500 shadow-[inset_-10px_0_15px_-10px_rgba(59,130,246,0.5)] text-left">
            <span className="material-symbols-outlined text-base">grid_view</span>
            Generator
          </button>
          <button
            onClick={() => setPage("algorithms")}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-white/5 hover:text-blue-300 transition-all duration-200 text-left"
          >
            <span className="material-symbols-outlined text-base">account_tree</span>
            Algorithms
          </button>
        </nav>

        <div className="p-6 space-y-3">
          <button
            onClick={solveBFS}
            className="w-full py-3 bg-secondary text-on-secondary font-black rounded-lg uppercase tracking-wider text-sm transition-all active:scale-95"
            style={{ boxShadow: "0 0 20px rgba(78,222,163,0.3)" }}
          >
            START SOLVER
          </button>
          <button
            onClick={() => newMaze()}
            className="w-full py-2 border border-white/10 text-slate-400 rounded-lg text-sm hover:bg-white/5 transition-all"
          >
            New Maze
          </button>
          <div className="border-t border-white/5 pt-3 space-y-2">
            <button
              onClick={resetCells}
              className="flex items-center gap-2 text-slate-400 hover:text-slate-100 text-sm transition-all w-full py-1"
            >
              <span className="material-symbols-outlined text-base">restart_alt</span>
              Reset Cells
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="ml-72 pt-16 h-screen overflow-y-auto flex flex-col gap-6 p-8">

        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statsCards.map(({ label, value, color }) => (
            <div key={label} className="bg-surface-container-low border border-white/5 p-5 rounded-xl glass-panel">
              <p className="text-[10px] font-semibold tracking-widest uppercase text-slate-400 mb-1">{label}</p>
              <p className={`text-2xl font-mono font-semibold ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* Maze + Config grid */}
        <div className="grid grid-cols-12 gap-6 flex-1 pb-4">

          {/* Maze canvas */}
          <div className="col-span-12 lg:col-span-8 bg-slate-950 rounded-2xl border border-white/10 p-6 flex flex-col items-center justify-center relative overflow-hidden shadow-2xl">
            <div
              className="absolute inset-0 opacity-20 pointer-events-none"
              style={{ backgroundImage: "radial-gradient(circle at center, #4d8eff22 0%, transparent 70%)" }}
            />

            <div className="w-full relative" style={{ cursor: mode ? "crosshair" : "default" }}>
              <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: "2px" }}>
                {grid.flatMap((row, r) =>
                  row.map((cell, c) => {
                    const k = `${r},${c}`;
                    const isStart = r === start[0] && c === start[1];
                    const isEnd = r === end[0] && c === end[1];
                    const isHoverable = mode && hoverCell === k && cell === PATH && !isStart && !isEnd;
                    let bg = cell === WALL ? COLORS.wall : COLORS.path;
                    if (isStart) bg = COLORS.start;
                    else if (isEnd) bg = COLORS.end;
                    else if (currentCell === k) bg = COLORS.current;
                    else if (cellState[k]) bg = cellState[k];
                    if (isHoverable) bg = mode === "start" ? "#27ae60" : "#c0392b";

                    let boxShadow = "";
                    if (glowEffects) {
                      if (isStart) boxShadow = "0 0 12px rgba(78,222,163,0.8)";
                      else if (isEnd) boxShadow = "0 0 15px rgba(255,180,171,0.8)";
                      else if (currentCell === k) boxShadow = "0 0 10px rgba(173,198,255,0.6)";
                    }

                    return (
                      <div
                        key={k}
                        onClick={() => handleCellClick(r, c)}
                        onMouseEnter={() => mode && setHoverCell(k)}
                        onMouseLeave={() => setHoverCell(null)}
                        style={{
                          aspectRatio: "1/1",
                          borderRadius: "1px",
                          backgroundColor: bg,
                          boxShadow,
                          transition: animated ? "background-color 0.06s" : "none",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "8px",
                          fontWeight: 700,
                          color: (isStart || isEnd) && showLabels ? "#fff" : "transparent",
                          userSelect: "none",
                        }}
                      >
                        {showLabels ? (isStart ? "S" : isEnd ? "E" : "") : ""}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Legend */}
            <div className="mt-6 flex flex-wrap gap-4 px-5 py-2 bg-slate-900/80 border border-white/10 rounded-full glass-panel">
              {[
                [COLORS.start, "START"],
                [COLORS.end, "END"],
                [COLORS.wall, "WALL"],
                [COLORS.visitedDFS, "DFS VISITED"],
                [COLORS.solutionDFS, "DFS PATH"],
                [COLORS.visitedBFS, "BFS VISITED"],
                [COLORS.solutionBFS, "BFS PATH"],
              ].map(([color, label]) => (
                <div key={label} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                  <span className="text-[10px] font-semibold tracking-widest text-slate-300">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Config panels */}
          <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">

            {/* Grid Configuration */}
            <div className="bg-surface-container-low border border-white/5 p-6 rounded-xl glass-panel">
              <h3 className="text-[10px] font-semibold tracking-widest uppercase text-blue-400 mb-5">
                GRID CONFIGURATION
              </h3>
              <div className="space-y-5">
                {[
                  ["ROWS", pendingRows, setPendingRows, 9, 41],
                  ["COLS", pendingCols, setPendingCols, 9, 51],
                ].map(([label, val, setter, min, max]) => (
                  <div key={label}>
                    <div className="flex justify-between mb-2">
                      <span className="text-[10px] text-slate-500 font-semibold tracking-widest uppercase">{label}</span>
                      <span className="text-[10px] text-blue-400 font-mono">{val}</span>
                    </div>
                    <input
                      type="range"
                      min={min}
                      max={max}
                      step={2}
                      value={val}
                      onChange={(e) => setter(+e.target.value)}
                      className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                  </div>
                ))}
                <button
                  onClick={applyNewSize}
                  className="w-full py-2 bg-blue-500/20 border border-blue-500/30 text-blue-400 rounded-lg text-xs font-semibold uppercase tracking-wider hover:bg-blue-500/30 transition-all"
                >
                  Apply Size
                </button>
              </div>

              <div className="mt-5 pt-5 border-t border-white/5 space-y-2">
                <h4 className="text-[10px] font-semibold tracking-widest uppercase text-slate-400 mb-3">PLACEMENT</h4>
                {[
                  ["start", "Set Start Point", COLORS.start],
                  ["end", "Set End Point", COLORS.end],
                ].map(([m, label, color]) => (
                  <button
                    key={m}
                    onClick={() => setMode(mode === m ? null : m)}
                    className="w-full py-2 text-xs font-semibold uppercase tracking-wider rounded-lg border transition-all"
                    style={
                      mode === m
                        ? { backgroundColor: color + "33", borderColor: color + "88", color }
                        : { borderColor: "rgba(255,255,255,0.05)", color: "#94a3b8" }
                    }
                  >
                    {mode === m ? "Click on maze..." : label}
                  </button>
                ))}
                <button
                  onClick={setRandomEnd}
                  className="w-full py-2 border border-white/5 text-slate-400 rounded-lg text-xs font-semibold uppercase tracking-wider hover:bg-white/5 transition-all"
                >
                  Random End
                </button>
              </div>
            </div>

            {/* Algorithm Engine */}
            <div className="bg-surface-container-low border border-white/5 p-6 rounded-xl glass-panel">
              <h3 className="text-[10px] font-semibold tracking-widest uppercase text-secondary mb-5">
                ALGORITHM ENGINE
              </h3>
              <div className="space-y-2">
                {algoButtons.map(({ id, label, action, activeColor }) => {
                  const isActive = activeAlgo === id;
                  return (
                    <button
                      key={id}
                      onClick={action}
                      className="w-full text-left px-4 py-3 rounded-lg border text-sm font-medium transition-all"
                      style={
                        isActive
                          ? {
                              backgroundColor: activeColor + "1a",
                              borderColor: activeColor + "55",
                              color: activeColor,
                              boxShadow: `0 0 12px ${activeColor}22`,
                            }
                          : { borderColor: "rgba(255,255,255,0.05)", color: "#94a3b8" }
                      }
                    >
                      <span className="flex items-center justify-between">
                        {label}
                        {isActive && (
                          <span
                            className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded-full"
                            style={{ backgroundColor: activeColor + "22", color: activeColor }}
                          >
                            active
                          </span>
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Live Logs + Comparison */}
            <div className="bg-surface-container-low border border-white/5 p-6 rounded-xl glass-panel flex-1">
              <h3 className="text-[10px] font-semibold tracking-widest uppercase text-slate-400 mb-4">
                LIVE SYSTEM LOGS
              </h3>
              <div className="font-mono text-[11px] space-y-2 opacity-80">
                <p className="text-secondary">[INFO] Maze: {rows}×{cols} ({rows * cols} cells)</p>
                <p className="text-blue-400">[INFO] Algorithm: {stats.algorithm}</p>
                <p className="text-blue-400">[INFO] Speed: {animSpeed}ms/step — {speedLabel}</p>
                <p className={stats.status.includes("encontrada") || stats.status.includes("concluída") ? "text-secondary" : "text-slate-400"}>
                  [STATUS] {stats.status}
                </p>
                {stats.visited > 0 && (
                  <p className="text-primary">[DATA] Visited: {stats.visited} | Path: {stats.pathLength}</p>
                )}
              </div>

              {comparison && (
                <div className="mt-5 pt-5 border-t border-white/5">
                  <p className="text-[10px] font-semibold tracking-widest uppercase text-slate-400 mb-3">
                    COMPARISON
                  </p>
                  <div className="grid grid-cols-3 gap-x-2 gap-y-1 text-[11px] font-mono">
                    <div />
                    <div className="text-[#7F77DD] font-bold">DFS {comparison.winner === "DFS" && "🏆"}</div>
                    <div className="text-[#EF9F27] font-bold">BFS {comparison.winner === "BFS" && "🏆"}</div>
                    {comparisonRows.map(([label, d, b]) => (
                      <div key={label} className="contents">
                        <div className="text-slate-500 py-1">{label}</div>
                        <div className="text-slate-300 py-1">{d}</div>
                        <div className="text-slate-300 py-1">{b}</div>
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-500 mt-3">
                    {comparison.winner === "DFS"
                      ? "DFS explored fewer cells on this maze."
                      : "BFS guaranteed the shortest path."}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
