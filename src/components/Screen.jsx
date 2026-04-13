import { useState, useRef, useCallback } from "react";

function TrophyIcon() {
    return (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" style={{ verticalAlign: "middle", marginLeft: 3, opacity: 0.85 }}>
            <path d="M19 5h-2V3H7v2H5C3.9 5 3 5.9 3 7v1c0 2.55 1.92 4.63 4.39 4.94A5.01 5.01 0 0 0 11 15.9V17H9v2h6v-2h-2v-1.1a5.01 5.01 0 0 0 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z" />
        </svg>
    );
}

const WALL = 1;
const PATH = 0;

const COLORS = {
    wall: "var(--color-text-primary)",
    path: "var(--color-background-primary)",
    start: "#1D9E75",
    end: "#D85A30",
    current: "#FAC775",
    visitedDFS: "#B5D4F4",
    visitedBFS: "#C0DD97",
    solutionDFS: "#7F77DD",
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

export default function MazeSolver() {
    const [mazeData, setMazeData] = useState(() => buildMaze(15, 21));
    const [pendingRows, setPendingRows] = useState(15);
    const [pendingCols, setPendingCols] = useState(21);
    const [cellState, setCellState] = useState({});
    const [currentCell, setCurrentCell] = useState(null);
    const [animated, setAnimated] = useState(true);
    const [mode, setMode] = useState(null);
    const [hoverCell, setHoverCell] = useState(null);
    const [stats, setStats] = useState({
        algorithm: "-", visited: 0, pathLength: 0, time: "0ms", status: "Aguardando...",
    });
    const [comparison, setComparison] = useState(null);
    const animTimers = useRef([]);

    const { grid, start, end } = mazeData;
    const rows = grid.length;
    const cols = grid[0].length;
    const cellSize = Math.max(10, Math.min(24, Math.floor(580 / cols)));

    const cancelAnim = useCallback(() => {
        animTimers.current.forEach(clearTimeout);
        animTimers.current = [];
        setCurrentCell(null);
    }, []);

    const resetCells = useCallback(() => {
        cancelAnim();
        setCellState({});
        setComparison(null);
        setStats({ algorithm: "-", visited: 0, pathLength: 0, time: "0ms", status: "Aguardando..." });
    }, [cancelAnim]);

    const newMaze = useCallback((r = rows, c = cols) => {
        cancelAnim();
        setMazeData(buildMaze(r, c));
        setCellState({});
        setComparison(null);
        setStats({ algorithm: "-", visited: 0, pathLength: 0, time: "0ms", status: "Labirinto gerado!" });
    }, [rows, cols, cancelAnim]);

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

        const visitedAccum = {};
        let i = 0;
        const stepVisit = () => {
            if (i >= visitOrder.length) { stepPath(0); return; }
            const [r, c] = visitOrder[i++];
            const k = key(r, c);
            if (isSpecial(k)) { animTimers.current.push(setTimeout(stepVisit, 0)); return; }
            setCurrentCell(k);
            setCellState({ ...visitedAccum });
            animTimers.current.push(setTimeout(() => {
                visitedAccum[k] = colorVisited;
                setCurrentCell(null);
                setCellState({ ...visitedAccum });
                animTimers.current.push(setTimeout(stepVisit, 6));
            }, 28));
        };
        const stepPath = (j) => {
            if (j >= path.length) { setStats(finalStats); return; }
            const [r, c] = path[j];
            const k = key(r, c);
            if (!isSpecial(k)) setCellState((prev) => ({ ...prev, [k]: colorSolution }));
            animTimers.current.push(setTimeout(() => stepPath(j + 1), 28));
        };
        stepVisit();
    }, [animated, start, end, cancelAnim]);

    const solveDFS = useCallback(() => {
        setComparison(null);
        const t0 = Date.now();
        const result = runDFS(grid, start, end);
        const t1 = Date.now();
        animateSolve(result.visitOrder, result.path, "DFS", `${t1 - t0}ms`, COLORS.visitedDFS, COLORS.solutionDFS);
    }, [grid, start, end, animateSolve]);

    const solveBFS = useCallback(() => {
        setComparison(null);
        const t0 = Date.now();
        const result = runBFS(grid, start, end);
        const t1 = Date.now();
        animateSolve(result.visitOrder, result.path, "BFS", `${t1 - t0}ms`, COLORS.visitedBFS, COLORS.solutionBFS);
    }, [grid, start, end, animateSolve]);

    const solveBoth = useCallback(() => {
        cancelAnim();
        const t0 = Date.now();
        const dfs = runDFS(grid, start, end);
        const t1 = Date.now();
        const bfs = runBFS(grid, start, end);
        const t2 = Date.now();
        const dfsStats = { visited: dfs.visitOrder.length, path: dfs.path.length, time: `${t1 - t0}ms` };
        const bfsStats = { visited: bfs.visitOrder.length, path: bfs.path.length, time: `${t2 - t1}ms` };
        const winner = dfs.visitOrder.length <= bfs.visitOrder.length ? "DFS" : "BFS";
        setComparison({ dfs: dfsStats, bfs: bfsStats, winner });
        const best = winner === "DFS" ? dfs : bfs;
        animateSolve(
            best.visitOrder, best.path, `${winner} (melhor)`,
            winner === "DFS" ? dfsStats.time : bfsStats.time,
            winner === "DFS" ? COLORS.visitedDFS : COLORS.visitedBFS,
            winner === "DFS" ? COLORS.solutionDFS : COLORS.solutionBFS
        );
    }, [grid, start, end, animateSolve, cancelAnim]);

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

    const card = {
        background: "var(--color-background-secondary)",
        borderRadius: "var(--border-radius-md)",
        padding: "12px 16px",
    };

    return (
        <div style={{ fontFamily: "var(--font-sans)", color: "var(--color-text-primary)", padding: "1rem 0" }}>
            <h2 style={{ fontSize: 18, fontWeight: 500, margin: "0 0 1rem" }}>Sistema de Labirinto</h2>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: "1rem" }}>
                <div style={{ ...card, flex: "1 1 220px" }}>
                    <p style={{ fontSize: 13, color: "var(--color-text-secondary)", fontWeight: 500, margin: "0 0 8px" }}>Tamanho</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {[["Linhas", pendingRows, setPendingRows, 9, 41], ["Colunas", pendingCols, setPendingCols, 9, 51]].map(([label, val, setter, min, max]) => (
                            <div key={label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <label style={{ fontSize: 13, minWidth: 90 }}>{label}: <strong>{val}</strong></label>
                                <input type="range" min={min} max={max} step={2} value={val} onChange={(e) => setter(+e.target.value)} style={{ flex: 1 }} />
                            </div>
                        ))}
                        <button onClick={applyNewSize} style={{ marginTop: 4 }}>Aplicar tamanho</button>
                    </div>
                </div>

                <div style={{ ...card, flex: "1 1 180px" }}>
                    <p style={{ fontSize: 13, color: "var(--color-text-secondary)", fontWeight: 500, margin: "0 0 8px" }}>Posicionamento</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {[["start", "Definir início (S)"], ["end", "Definir fim (E)"]].map(([m, label]) => (
                            <button key={m} onClick={() => setMode(mode === m ? null : m)}
                                style={{ background: mode === m ? (m === "start" ? COLORS.start : COLORS.end) : "", color: mode === m ? "#fff" : "", border: mode === m ? "none" : "" }}>
                                {mode === m ? "Clique no labirinto..." : label}
                            </button>
                        ))}
                        <button onClick={setRandomEnd}>Fim aleatório</button>
                    </div>
                </div>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: "1rem" }}>
                <button onClick={() => newMaze()}>Gerar labirinto</button>
                <button onClick={solveDFS}>Resolver DFS</button>
                <button onClick={solveBFS}>Resolver BFS</button>
                <button onClick={solveBoth}>Comparar ambos</button>
                <button onClick={resetCells}>Resetar</button>
                <button onClick={() => setAnimated((a) => !a)}>{animated ? "Desabilitar animação" : "Habilitar animação"}</button>
            </div>

            <div style={{ overflowX: "auto", marginBottom: "1rem" }}>
                <div style={{ display: "inline-grid", gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`, cursor: mode ? "crosshair" : "default", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 4, lineHeight: 0 }}>
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
                            return (
                                <div key={k} onClick={() => handleCellClick(r, c)}
                                    onMouseEnter={() => mode && setHoverCell(k)}
                                    onMouseLeave={() => setHoverCell(null)}
                                    style={{ width: cellSize, height: cellSize, background: bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: Math.max(8, cellSize * 0.52), fontWeight: 500, color: isStart || isEnd ? "#fff" : "transparent", transition: animated ? "background 0.06s" : "none", userSelect: "none" }}>
                                    {isStart ? "S" : isEnd ? "E" : ""}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: "1rem" }}>
                <div style={{ ...card, flex: "1 1 200px" }}>
                    <p style={{ fontSize: 13, fontWeight: 500, margin: "0 0 8px" }}>Estatísticas</p>
                    {[["Tamanho", `${rows}x${cols}`], ["Algoritmo", stats.algorithm], ["Células visitadas", stats.visited], ["Comprimento do caminho", stats.pathLength], ["Tempo de execução", stats.time], ["Status", stats.status]].map(([label, val]) => (
                        <div key={label} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "3px 0", borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
                            <span style={{ color: "var(--color-text-secondary)" }}>{label}</span>
                            <span style={{ fontWeight: 500 }}>{val}</span>
                        </div>
                    ))}
                </div>

                <div style={{ ...card, flex: "1 1 180px" }}>
                    <p style={{ fontSize: 13, fontWeight: 500, margin: "0 0 8px" }}>Legenda</p>
                    {[[COLORS.wall, "Parede"], [COLORS.path, "Caminho"], [COLORS.start, "Início (S)"], [COLORS.end, "Fim (E)"], [COLORS.current, "Atual"], [COLORS.visitedDFS, "Visitado DFS"], [COLORS.visitedBFS, "Visitado BFS"], [COLORS.solutionDFS, "Solução DFS"], [COLORS.solutionBFS, "Solução BFS"]].map(([color, label]) => (
                        <div key={label} style={{ display: "flex", alignItems: "center", gap: 8, padding: "3px 0" }}>
                            <div style={{ width: 14, height: 14, background: color, borderRadius: 3, border: "0.5px solid var(--color-border-secondary)", flexShrink: 0 }} />
                            <span style={{ fontSize: 13 }}>{label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {comparison && (
                <div style={card}>
                    <p style={{ fontSize: 13, fontWeight: 500, margin: "0 0 10px" }}>Comparação de algoritmos</p>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, fontSize: 13 }}>
                        <div />
                        <div style={{ fontWeight: 500, color: COLORS.solutionDFS }}>DFS {comparison.winner === "DFS" && <TrophyIcon />}</div>
                        <div style={{ fontWeight: 500, color: COLORS.solutionBFS }}>BFS {comparison.winner === "BFS" && <TrophyIcon />}</div>
                        {[["Células visitadas", comparison.dfs.visited, comparison.bfs.visited], ["Caminho", comparison.dfs.path, comparison.bfs.path], ["Tempo", comparison.dfs.time, comparison.bfs.time]].flatMap(([label, d, b]) => [
                            <div key={`l-${label}`} style={{ color: "var(--color-text-secondary)", padding: "3px 0" }}>{label}</div>,
                            <div key={`d-${label}`} style={{ padding: "3px 0" }}>{d}</div>,
                            <div key={`b-${label}`} style={{ padding: "3px 0" }}>{b}</div>,
                        ])}
                    </div>
                    <p style={{ fontSize: 12, color: "var(--color-text-secondary)", margin: "10px 0 0" }}>
                        {comparison.winner === "DFS" ? "DFS explorou menos células neste labirinto." : "BFS garantiu o caminho mais curto."}
                    </p>
                </div>
            )}
        </div>
    );
}