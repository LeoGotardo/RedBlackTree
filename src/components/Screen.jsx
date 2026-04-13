export function Screen() {
    return (
        <div class="screen">
            <div class="container">
                <h1>🧩 Sistema de Labirinto</h1>
                
                <div class="size-controls">
                    <h3>📏 Configurar Tamanho</h3>
                    <div class="size-sliders">
                        <div class="slider-group">
                            <label for="rows">Linhas: <span id="rowsValue">15</span></label>
                            <input type="range" id="rows" min="9" max="41" value="15" step="2" oninput="updateSizeDisplay()"/>
                        </div>
                        <div class="slider-group">
                            <label for="cols">Colunas: <span id="colsValue">21</span></label>
                            <input type="range" id="cols" min="9" max="51" value="21" step="2" oninput="updateSizeDisplay()"/>
                        </div>
                        <button onclick="applyNewSize()">Aplicar Novo Tamanho</button>
                    </div>
                </div>

                <div class="controls">
                    <button onclick="generateMaze()">🔄 Gerar Novo Labirinto</button>
                    <button onclick="solveDFS()">🔍 Resolver com DFS</button>
                    <button onclick="solveBFS()">🌊 Resolver com BFS</button>
                    <button onclick="solveBoth()">⚡ Comparar Ambos</button>
                    <button onclick="reset()">🧹 Resetar</button>
                    <button onclick="toggleAnimation()">
                        <span id="animToggle">🎬 Desabilitar Animação</span>
                    </button>
                </div>

                <div class="position-controls">
                    <h3>📍 Posicionamento</h3>
                    <div class="position-buttons">
                        <button onclick="setCustomStart()">📌 Definir Início (S)</button>
                        <button onclick="setCustomEnd()">🎯 Definir Fim (E)</button>
                        <button onclick="setRandomEnd()">🎲 Fim Aleatório</button>
                    </div>
                </div>

                <div class="maze-container">
                    <div id="maze" class="maze"></div>
                </div>

                <div class="info">
                    <div class="info-panel">
                        <h3>📊 Estatísticas</h3>
                        <div id="stats">
                            <p><strong>Tamanho do Labirinto:</strong> <span id="mazeSize">15x21</span></p>
                            <p><strong>Algoritmo:</strong> <span id="algorithm">-</span></p>
                            <p><strong>Células visitadas:</strong> <span id="visited">0</span></p>
                            <p><strong>Comprimento do caminho:</strong> <span id="pathLength">0</span></p>
                            <p><strong>Tempo de execução:</strong> <span id="executionTime">0ms</span></p>
                            <p><strong>Status:</strong> <span id="status">Aguardando...</span></p>
                        </div>
                    </div>
                    
                    <div class="info-panel">
                        <h3>🎨 Legenda</h3>
                        <div class="legend">
                            <div class="legend-item">
                                <div class="legend-color wall"></div>
                                <span>Parede</span>
                            </div>
                            <div class="legend-item">
                                <div class="legend-color path"></div>
                                <span>Caminho</span>
                            </div>
                            <div class="legend-item">
                                <div class="legend-color start"></div>
                                <span>Início (S)</span>
                            </div>
                            <div class="legend-item">
                                <div class="legend-color end"></div>
                                <span>Fim (E)</span>
                            </div>
                            <div class="legend-item">
                                <div class="legend-color visited"></div>
                                <span>Visitado</span>
                            </div>
                            <div class="legend-item">
                                <div class="legend-color current"></div>
                                <span>Atual</span>
                            </div>
                            <div class="legend-item">
                                <div class="legend-color solution"></div>
                                <span>Solução</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div id="comparison" class="comparison-panel" style="display: none;">
                    <h3>⚖️ Comparação de Algoritmos</h3>
                    <div id="comparisonData"></div>
                </div>
            </div>
        </div>
    )
}