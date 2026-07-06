# Sistema de Labirinto

An interactive maze generator and pathfinding visualizer built with React. Generate random mazes, watch DFS and BFS solve them cell by cell, and compare how the two algorithms behave on the same grid.

## Features

- **Maze generation** — randomized depth-first backtracking carves a solvable maze on a configurable grid (9–41 rows, 9–51 columns), with automatic start/end placement and connectivity checks.
- **Pathfinding visualizer** — step-by-step animation of DFS and BFS as they explore the grid and trace the final path, with adjustable animation speed.
- **Compare mode** — run DFS and BFS back to back on the same maze and see nodes explored, path length, and execution time side by side, with a winner called out.
- **Interactive controls** — drag the start/end points, randomize the end cell, tweak grid size, toggle animation/labels/glow effects.
- **Algorithms page** — a reference view explaining DFS and BFS with pseudocode, complexity, pros/cons, and a side-by-side comparison table.

## Tech stack

- [React 19](https://react.dev/)
- [Vite](https://vite.dev/) for dev server and bundling
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [ESLint](https://eslint.org/) for linting

## Getting started

```bash
npm install
npm run dev
```

The app will be available at the URL printed by Vite (typically `http://localhost:5173`).

## Scripts

| Command           | Description                          |
| ----------------- | ------------------------------------ |
| `npm run dev`     | Start the Vite dev server with HMR   |
| `npm run build`   | Build a production bundle            |
| `npm run preview` | Preview the production build locally |
| `npm run lint`    | Run ESLint over the project          |

## Project structure

```
src/
├── App.jsx                     # Page router (generator ↔ algorithms)
├── components/
│   ├── Screen.jsx               # Maze generator + DFS/BFS solver UI
│   └── AlgorithmsPage.jsx       # DFS/BFS reference and comparison page
├── index.css
└── main.jsx
```
