const ALGOS = [
  {
    id: "PF_001",
    icon: "vertical_align_bottom",
    name: "Depth-First Search",
    abbr: "DFS",
    badge: "STACK · LIFO",
    color: "#7F77DD",
    pathColor: "#a89ef5",
    visitedColor: "#7F77DD",
    desc: "Dives as deep as possible along one branch before backtracking. Implemented iteratively with an explicit stack — the last cell pushed is the first explored (LIFO). Fast at finding a valid path, but gives no shortest-path guarantee.",
    structure: "Stack (LIFO)",
    time: "O(V + E)",
    space: "O(V)",
    shortest: false,
    pseudocode: [
      { type: "comment", text: "// iterative DFS — identical to BFS except .pop()" },
      { type: "keyword", text: "stack" },
      { type: "plain", text: " ← [start]" },
      { type: "newline" },
      { type: "keyword", text: "visited" },
      { type: "plain", text: " ← { start }" },
      { type: "newline" },
      { type: "keyword", text: "parentMap" },
      { type: "plain", text: " ← {}" },
      { type: "newline" },
      { type: "newline" },
      { type: "control", text: "while" },
      { type: "plain", text: " stack not empty:" },
      { type: "newline" },
      { type: "plain", text: "  cell ← stack." },
      { type: "highlight", text: "pop()" },
      { type: "plain", text: "          // ← LIFO" },
      { type: "newline" },
      { type: "control", text: "  if" },
      { type: "plain", text: " cell == end: " },
      { type: "control", text: "break" },
      { type: "newline" },
      { type: "newline" },
      { type: "control", text: "  for" },
      { type: "plain", text: " neighbor " },
      { type: "control", text: "of" },
      { type: "plain", text: " cell:" },
      { type: "newline" },
      { type: "control", text: "    if" },
      { type: "plain", text: " neighbor ∉ visited:" },
      { type: "newline" },
      { type: "plain", text: "      visited.add(neighbor)" },
      { type: "newline" },
      { type: "plain", text: "      parentMap[neighbor] = cell" },
      { type: "newline" },
      { type: "plain", text: "      stack.push(neighbor)" },
      { type: "newline" },
      { type: "newline" },
      { type: "control", text: "return" },
      { type: "plain", text: " reconstructPath(parentMap, start, end)" },
    ],
    pros: [
      "Low memory on narrow/deep mazes",
      "Quickly finds a valid path",
      "Simple iterative implementation",
    ],
    cons: [
      "No shortest-path guarantee",
      "May produce winding, inefficient paths",
      "Heavily maze-shape dependent",
    ],
    steps: [
      { n: "1", text: "Push start onto the stack" },
      { n: "2", text: "Pop the top cell (LIFO) — done if it's the end" },
      { n: "3", text: "Push each unvisited neighbor, record parent" },
      { n: "4", text: "Keep diving deep; backtrack only when stuck" },
      { n: "5", text: "Trace parentMap from end → start to build path" },
    ],
    visual: "dfs",
  },
  {
    id: "PF_002",
    icon: "waves",
    name: "Breadth-First Search",
    abbr: "BFS",
    badge: "QUEUE · FIFO",
    color: "#4edea3",
    pathColor: "#EF9F27",
    visitedColor: "#C0DD97",
    desc: "Explores every cell at distance d before exploring distance d+1. Implemented with a queue — the first cell enqueued is the first explored (FIFO). Guarantees the shortest path in any unweighted graph.",
    structure: "Queue (FIFO)",
    time: "O(V + E)",
    space: "O(V)",
    shortest: true,
    pseudocode: [
      { type: "comment", text: "// iterative BFS — identical to DFS except .shift()" },
      { type: "keyword", text: "queue" },
      { type: "plain", text: " ← [start]" },
      { type: "newline" },
      { type: "keyword", text: "visited" },
      { type: "plain", text: " ← { start }" },
      { type: "newline" },
      { type: "keyword", text: "parentMap" },
      { type: "plain", text: " ← {}" },
      { type: "newline" },
      { type: "newline" },
      { type: "control", text: "while" },
      { type: "plain", text: " queue not empty:" },
      { type: "newline" },
      { type: "plain", text: "  cell ← queue." },
      { type: "highlight", text: "shift()" },
      { type: "plain", text: "        // ← FIFO" },
      { type: "newline" },
      { type: "control", text: "  if" },
      { type: "plain", text: " cell == end: " },
      { type: "control", text: "break" },
      { type: "newline" },
      { type: "newline" },
      { type: "control", text: "  for" },
      { type: "plain", text: " neighbor " },
      { type: "control", text: "of" },
      { type: "plain", text: " cell:" },
      { type: "newline" },
      { type: "control", text: "    if" },
      { type: "plain", text: " neighbor ∉ visited:" },
      { type: "newline" },
      { type: "plain", text: "      visited.add(neighbor)" },
      { type: "newline" },
      { type: "plain", text: "      parentMap[neighbor] = cell" },
      { type: "newline" },
      { type: "plain", text: "      queue.push(neighbor)" },
      { type: "newline" },
      { type: "newline" },
      { type: "control", text: "return" },
      { type: "plain", text: " reconstructPath(parentMap, start, end)" },
    ],
    pros: [
      "Always finds the shortest path",
      "Predictable layer-by-layer expansion",
      "Optimal for unweighted mazes",
    ],
    cons: [
      "Higher peak memory (wide frontier)",
      "Visits more cells before reaching the goal",
      "Slower to find any path than DFS",
    ],
    steps: [
      { n: "1", text: "Enqueue start" },
      { n: "2", text: "Dequeue the front cell (FIFO) — done if it's the end" },
      { n: "3", text: "Enqueue each unvisited neighbor, record parent" },
      { n: "4", text: "All depth-d cells explored before any depth-(d+1)" },
      { n: "5", text: "Trace parentMap from end → start to build path" },
    ],
    visual: "bfs",
  },
];

function Pseudocode({ tokens }) {
  const colorMap = {
    comment: "#6B7280",
    keyword: "#adc6ff",
    control: "#ffb2b7",
    highlight: "#4edea3",
    plain: "#c2c6d6",
  };
  const lines = [[]];
  for (const t of tokens) {
    if (t.type === "newline") { lines.push([]); continue; }
    lines[lines.length - 1].push(t);
  }
  return (
    <pre className="text-[11px] leading-5 font-mono overflow-x-auto p-4 bg-[#080b11] rounded-lg border border-white/5">
      {lines.map((line, li) => (
        <div key={li}>
          {line.length === 0 ? " " : line.map((t, ti) => (
            <span key={ti} style={{ color: colorMap[t.type] ?? colorMap.plain }}>{t.text}</span>
          ))}
        </div>
      ))}
    </pre>
  );
}

function DFSVisual() {
  // Snake-like deep path pattern
  const cells = Array(32).fill(null).map((_, i) => {
    if ([0, 1, 2, 3, 11, 10, 9, 8, 16, 17, 18, 19, 27, 26, 25, 24].includes(i)) return "path";
    if ([4, 12, 20, 28].includes(i)) return "wall";
    return "bg";
  });
  return (
    <div className="w-full h-full grid gap-0.5" style={{ gridTemplateColumns: "repeat(8, 1fr)", gridTemplateRows: "repeat(4, 1fr)" }}>
      {cells.map((type, i) => (
        <div
          key={i}
          className="rounded-sm"
          style={{
            backgroundColor:
              type === "path" ? "#7F77DD" :
              type === "wall" ? "#32353c" :
              "#0b0e15",
            opacity: type === "path" ? (0.4 + (i % 8) * 0.08) : 1,
          }}
        />
      ))}
    </div>
  );
}

function BFSVisual() {
  // Concentric waves from top-left
  const dist = [
    [0, 1, 2, 3, 4, 5, 6, 7],
    [1, 2, 3, 4, 5, 6, 7, 8],
    [2, 3, 4, 5, 6, 7, 8, 9],
    [3, 4, 5, 6, 7, 8, 9, 10],
  ].flat();
  const max = 10;
  return (
    <div className="w-full h-full grid gap-0.5" style={{ gridTemplateColumns: "repeat(8, 1fr)", gridTemplateRows: "repeat(4, 1fr)" }}>
      {dist.map((d, i) => (
        <div
          key={i}
          className="rounded-sm"
          style={{
            backgroundColor: "#C0DD97",
            opacity: Math.max(0.08, 1 - d / max),
          }}
        />
      ))}
    </div>
  );
}

function AlgoCard({ algo }) {
  return (
    <div className="glass-card rounded-xl overflow-hidden">
      {/* Card header strip */}
      <div className="h-1 w-full" style={{ backgroundColor: algo.color }} />

      <div className="p-8 space-y-6">
        {/* Title row */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className="p-3 rounded-xl"
              style={{ backgroundColor: algo.color + "1a", border: `1px solid ${algo.color}44` }}
            >
              <span className="material-symbols-outlined text-3xl" style={{ color: algo.color }}>
                {algo.icon}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full tracking-widest"
                  style={{ backgroundColor: algo.color + "22", color: algo.color }}
                >
                  {algo.badge}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">{algo.id}</span>
              </div>
              <h2 className="text-2xl font-black text-on-surface tracking-tight">{algo.name}</h2>
            </div>
          </div>
          <div
            className="text-4xl font-black opacity-20 select-none font-mono"
            style={{ color: algo.color }}
          >
            {algo.abbr}
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-on-surface-variant leading-relaxed">{algo.desc}</p>

        {/* Properties chips */}
        <div className="grid grid-cols-2 gap-3">
          {[
            ["Data Structure", algo.structure, algo.color],
            ["Time Complexity", algo.time, "#adc6ff"],
            ["Space Complexity", algo.space, "#adc6ff"],
            ["Shortest Path", algo.shortest ? "✓ Guaranteed" : "✗ Not guaranteed",
              algo.shortest ? "#4edea3" : "#ffb4ab"],
          ].map(([label, value, color]) => (
            <div key={label} className="bg-[#0d1117] p-3 rounded-lg border border-white/5">
              <p className="text-[10px] text-slate-500 uppercase font-semibold tracking-widest mb-1">{label}</p>
              <p className="text-xs font-mono font-semibold" style={{ color }}>{value}</p>
            </div>
          ))}
        </div>

        {/* Pseudocode */}
        <div>
          <p className="text-[10px] font-semibold tracking-widest uppercase text-slate-400 mb-2">Pseudocode</p>
          <Pseudocode tokens={algo.pseudocode} />
        </div>

        {/* Visual pattern */}
        <div>
          <p className="text-[10px] font-semibold tracking-widest uppercase text-slate-400 mb-2">Traversal Pattern</p>
          <div className="h-24 bg-[#080b11] rounded-lg overflow-hidden relative p-3 border border-white/5">
            {algo.visual === "dfs" ? <DFSVisual /> : <BFSVisual />}
            <div className="absolute inset-0 bg-gradient-to-t from-[#080b11] to-transparent pointer-events-none" />
            <span className="absolute bottom-2 right-3 text-[10px] text-slate-500 font-semibold tracking-widest uppercase">
              {algo.visual === "dfs" ? "DEEP DIVE · BACKTRACK" : "LAYER BY LAYER"}
            </span>
          </div>
        </div>

        {/* Pros / Cons */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-[10px] font-semibold tracking-widest uppercase text-secondary mb-2">Strengths</p>
            <ul className="space-y-1.5">
              {algo.pros.map((p) => (
                <li key={p} className="flex items-start gap-2 text-xs text-slate-300">
                  <span style={{ color: "#4edea3" }} className="mt-0.5 flex-shrink-0">✓</span>
                  {p}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-[10px] font-semibold tracking-widest uppercase text-error mb-2">Weaknesses</p>
            <ul className="space-y-1.5">
              {algo.cons.map((c) => (
                <li key={c} className="flex items-start gap-2 text-xs text-slate-300">
                  <span style={{ color: "#ffb4ab" }} className="mt-0.5 flex-shrink-0">✗</span>
                  {c}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Steps */}
        <div>
          <p className="text-[10px] font-semibold tracking-widest uppercase text-slate-400 mb-3">How It Runs</p>
          <ol className="space-y-2">
            {algo.steps.map(({ n, text }) => (
              <li key={n} className="flex items-start gap-3">
                <span
                  className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-black mt-0.5"
                  style={{ backgroundColor: algo.color + "22", color: algo.color }}
                >
                  {n}
                </span>
                <span className="text-xs text-slate-400 leading-5">{text}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}

export default function AlgorithmsPage({ setPage }) {
  return (
    <div className="flex h-screen overflow-hidden grid-line-bg bg-surface">

      {/* Ambient glow */}
      <div className="fixed top-0 right-0 -z-10 w-1/2 h-full opacity-10 pointer-events-none">
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-500 blur-[150px] rounded-full" />
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-16 z-50 flex justify-between items-center px-6 bg-slate-950/80 backdrop-blur-xl border-b border-white/10">
        <span
          className="text-xl font-black text-blue-500 tracking-widest uppercase"
          style={{ textShadow: "0 0 8px rgba(59,130,246,0.5)" }}
        >
          SISTEMA DE LABIRINTO
        </span>
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">2 algorithms implemented</span>
        </div>
      </header>

      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-72 z-40 pt-16 flex flex-col bg-slate-900/90 backdrop-blur-2xl border-r border-white/10 shadow-[4px_0_24px_rgba(0,0,0,0.5)] font-mono text-sm uppercase tracking-wider">
        <div className="px-6 py-6 mb-2">
          <h2 className="text-blue-500 font-black">CONTROL CENTER</h2>
          <p className="text-[10px] text-slate-500 tracking-[0.2em] mt-0.5">ALGORITHMIC_CORE</p>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto">
          <button
            onClick={() => setPage("generator")}
            className="w-full flex items-center px-6 py-3 text-slate-500 hover:bg-white/5 hover:text-blue-300 transition-all duration-200 text-left"
          >
            <span className="material-symbols-outlined mr-3 text-base">grid_view</span>
            Generator
          </button>
          <button
            className="w-full flex items-center px-6 py-3 bg-blue-500/10 text-blue-400 border-r-4 border-blue-500 shadow-[inset_-10px_0_15px_-10px_rgba(59,130,246,0.5)] text-left"
          >
            <span className="material-symbols-outlined mr-3 text-base">account_tree</span>
            Algorithms
          </button>
        </nav>

        <div className="px-6 py-6 mt-auto space-y-4">
          <button
            onClick={() => setPage("generator")}
            className="w-full py-3 bg-secondary text-on-secondary font-black rounded-lg active:scale-95 transition-transform uppercase tracking-wider text-sm"
            style={{ boxShadow: "0 0 20px rgba(78,222,163,0.3)" }}
          >
            START SOLVER
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="ml-72 pt-16 h-screen overflow-y-auto">
        <div className="max-w-7xl mx-auto p-8 space-y-8">

          {/* Hero */}
          <section className="relative overflow-hidden glass-card rounded-xl p-10">
            <div className="relative z-10 max-w-2xl">
              <div className="flex items-center gap-2 mb-4">
                <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-xs font-semibold rounded-full border border-blue-500/30 uppercase tracking-widest">
                  IMPLEMENTED
                </span>
                <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
              </div>
              <h1 className="text-5xl font-black text-on-surface mb-4 leading-tight tracking-tight">
                PATHFINDING <span className="text-blue-500">ALGORITHMS</span>
              </h1>
              <p className="text-base text-on-surface-variant mb-6 max-w-lg leading-relaxed">
                Two algorithms power this visualiser. They share identical logic — the only difference
                is one line: <code className="text-secondary font-mono text-sm">.pop()</code> vs <code className="text-[#EF9F27] font-mono text-sm">.shift()</code>.
                That single change turns depth-first into breadth-first.
              </p>
              <button
                onClick={() => setPage("generator")}
                className="px-6 py-2.5 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-400 transition-colors text-sm"
              >
                Try them on the Maze
              </button>
            </div>
            {/* Key insight callout */}
            <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden lg:block">
              <div className="glass-card rounded-xl p-5 w-64 border border-white/10">
                <p className="text-[10px] font-semibold tracking-widest uppercase text-slate-400 mb-3">The Core Difference</p>
                <div className="space-y-2 font-mono text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-8 text-[10px] font-black" style={{ color: "#7F77DD" }}>DFS</span>
                    <code className="flex-1 px-2 py-1 rounded text-xs" style={{ backgroundColor: "#7F77DD22", color: "#7F77DD" }}>
                      stack<span className="text-white">.pop()</span>
                    </code>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-8 text-[10px] font-black" style={{ color: "#4edea3" }}>BFS</span>
                    <code className="flex-1 px-2 py-1 rounded text-xs" style={{ backgroundColor: "#4edea322", color: "#4edea3" }}>
                      queue<span className="text-white">.shift()</span>
                    </code>
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 mt-3 leading-4">
                  Same loop, same visited set, same parentMap. Just different ends of the array.
                </p>
              </div>
            </div>
          </section>

          {/* Algorithm cards — 2 columns */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {ALGOS.map((algo) => (
              <AlgoCard key={algo.id} algo={algo} />
            ))}
          </div>

          {/* Comparison table */}
          <section className="glass-card rounded-xl overflow-hidden">
            <div className="px-8 py-5 border-b border-white/5">
              <h2 className="text-sm font-black tracking-widest uppercase text-on-surface">Side-by-Side Comparison</h2>
              <p className="text-xs text-slate-500 mt-0.5">On the same unweighted maze grid</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left px-8 py-4 text-[10px] font-semibold tracking-widest uppercase text-slate-400">Property</th>
                    <th className="text-left px-6 py-4 text-[10px] font-semibold tracking-widest uppercase" style={{ color: "#7F77DD" }}>DFS</th>
                    <th className="text-left px-6 py-4 text-[10px] font-semibold tracking-widest uppercase" style={{ color: "#4edea3" }}>BFS</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Internal structure", "Stack (array + .pop())", "Queue (array + .shift())"],
                    ["Access order", "Last-In First-Out (LIFO)", "First-In First-Out (FIFO)"],
                    ["Time complexity", "O(V + E)", "O(V + E)"],
                    ["Space complexity", "O(V) — proportional to depth", "O(V) — proportional to width"],
                    ["Shortest path?", "✗  Not guaranteed", "✓  Always shortest"],
                    ["Cells visited (typical)", "Fewer — stops at first found path", "More — exhausts each depth level"],
                    ["Best maze type", "Long corridors, few branches", "Open grids with many branches"],
                    ["Path quality", "Valid but potentially winding", "Optimal length"],
                  ].map(([prop, dfsVal, bfsVal], i) => (
                    <tr key={prop} className={`border-b border-white/5 ${i % 2 === 0 ? "" : "bg-white/[0.02]"}`}>
                      <td className="px-8 py-3 text-xs text-slate-400 font-medium">{prop}</td>
                      <td className="px-6 py-3 text-xs font-mono" style={{ color: "#a89ef5" }}>{dfsVal}</td>
                      <td className="px-6 py-3 text-xs font-mono" style={{ color: "#C0DD97" }}>{bfsVal}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Shared logic — reconstructPath */}
          <section className="glass-card rounded-xl p-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <span className="material-symbols-outlined text-blue-400">fork_right</span>
              </div>
              <div>
                <h2 className="text-sm font-black tracking-widest uppercase text-on-surface">Shared: Path Reconstruction</h2>
                <p className="text-xs text-slate-500 mt-0.5">Both algorithms use the same reconstructPath function</p>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              <div>
                <p className="text-sm text-on-surface-variant leading-relaxed mb-4">
                  Both DFS and BFS record a <code className="text-secondary font-mono text-xs">parentMap</code> — a mapping from each visited cell to
                  the cell it was reached from. Once the end is found, <code className="text-secondary font-mono text-xs">reconstructPath</code> walks
                  backwards through this map to build the solution path.
                </p>
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  BFS's parentMap records the <em className="text-on-surface">shortest</em> route to each cell (because BFS always
                  reaches a cell for the first time via the shortest route). DFS's parentMap records
                  whichever route happened to be explored first — which may not be optimal.
                </p>
              </div>
              <pre className="text-[11px] leading-5 font-mono p-4 bg-[#080b11] rounded-lg border border-white/5">
                <div><span style={{ color: "#6B7280" }}>// same for both DFS and BFS</span></div>
                <div><span style={{ color: "#ffb2b7" }}>function</span><span style={{ color: "#c2c6d6" }}> reconstructPath(parentMap, start, end):</span></div>
                <div><span style={{ color: "#c2c6d6" }}>  path ← []</span></div>
                <div><span style={{ color: "#c2c6d6" }}>  cur ← end</span></div>
                <div>&nbsp;</div>
                <div><span style={{ color: "#ffb2b7" }}>  while</span><span style={{ color: "#c2c6d6" }}> cur ≠ start:</span></div>
                <div><span style={{ color: "#c2c6d6" }}>    path.unshift(cur)     </span><span style={{ color: "#6B7280" }}>// prepend</span></div>
                <div><span style={{ color: "#c2c6d6" }}>    cur ← parentMap[cur]</span></div>
                <div>&nbsp;</div>
                <div><span style={{ color: "#c2c6d6" }}>  path.unshift(start)</span></div>
                <div><span style={{ color: "#ffb2b7" }}>  return</span><span style={{ color: "#c2c6d6" }}> path</span></div>
              </pre>
            </div>
          </section>

          {/* Colour reference */}
          <section className="glass-card rounded-xl p-6 border-l-4 border-secondary mb-4">
            <p className="text-[10px] font-semibold tracking-widest uppercase text-slate-400 mb-4">Visualiser Colour Reference</p>
            <div className="flex flex-wrap gap-6">
              {[
                ["#7F77DD", "DFS — Visited cells"],
                ["#a89ef5", "DFS — Solution path"],
                ["#C0DD97", "BFS — Visited cells"],
                ["#EF9F27", "BFS — Solution path"],
                ["#4edea3", "Start cell"],
                ["#ffb4ab", "End cell"],
                ["#adc6ff", "Currently active cell"],
              ].map(([color, label]) => (
                <div key={label} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: color }} />
                  <span className="text-xs text-slate-400">{label}</span>
                </div>
              ))}
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}
