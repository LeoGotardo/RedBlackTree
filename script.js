// Classe principal do Labirinto
class Maze {
    constructor(rows = 15, cols = 21) {
        this.rows = rows;
        this.cols = cols;
        this.maze = [];
        this.start = null;
        this.end = null;
        this.visited = new Set();
        this.path = [];
        this.animationEnabled = true;
        this.animationDelay = 50;
        this.editMode = null; // 'start' ou 'end' quando em modo de edição
        
        this.generateMaze();
        this.setupClickListeners();
    }

    // Configura listeners para cliques nas células
    setupClickListeners() {
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('cell') && this.editMode) {
                const row = parseInt(e.target.dataset.row);
                const col = parseInt(e.target.dataset.col);
                
                // Só permite colocar início/fim em caminhos livres
                if (this.maze[row][col] === 0) {
                    if (this.editMode === 'start') {
                        this.start = [row, col];
                    } else if (this.editMode === 'end') {
                        this.end = [row, col];
                    }
                    
                    this.render();
                    this.exitEditMode();
                }
            }
        });
    }

    // Entra no modo de edição
    enterEditMode(mode) {
        this.editMode = mode;
        const cells = document.querySelectorAll('.cell');
        cells.forEach(cell => {
            if (cell.classList.contains('path')) {
                cell.style.cursor = 'pointer';
                cell.style.boxShadow = '0 0 5px rgba(255, 255, 0, 0.6)';
            }
        });
        
        const modeText = mode === 'start' ? 'INÍCIO (S)' : 'FIM (E)';
        this.updateStatus(`Clique em uma célula livre para posicionar o ${modeText}`);
    }

    // Sai do modo de edição
    exitEditMode() {
        this.editMode = null;
        const cells = document.querySelectorAll('.cell');
        cells.forEach(cell => {
            cell.style.cursor = 'default';
            cell.style.boxShadow = '';
        });
        this.updateStatus('Posição atualizada!');
        setTimeout(() => {
            this.updateStatus('Aguardando...');
        }, 2000);
    }

    // Gera um labirinto aleatório com posicionamento inteligente
    generateMaze() {
        // Inicializa com paredes
        this.maze = Array(this.rows).fill().map(() => Array(this.cols).fill(1));
        
        // Algoritmo de geração usando DFS recursivo
        const stack = [];
        const startRow = 1;
        const startCol = 1;
        
        this.maze[startRow][startCol] = 0;
        stack.push([startRow, startCol]);
        
        const directions = [[-2, 0], [2, 0], [0, -2], [0, 2]];
        
        while (stack.length > 0) {
            const [row, col] = stack[stack.length - 1];
            const neighbors = [];
            
            for (const [dr, dc] of directions) {
                const newRow = row + dr;
                const newCol = col + dc;
                
                if (newRow > 0 && newRow < this.rows - 1 && 
                    newCol > 0 && newCol < this.cols - 1 && 
                    this.maze[newRow][newCol] === 1) {
                    neighbors.push([newRow, newCol, row + dr/2, col + dc/2]);
                }
            }
            
            if (neighbors.length > 0) {
                const [newRow, newCol, wallRow, wallCol] = neighbors[Math.floor(Math.random() * neighbors.length)];
                this.maze[newRow][newCol] = 0;
                this.maze[wallRow][wallCol] = 0;
                stack.push([newRow, newCol]);
            } else {
                stack.pop();
            }
        }
        
        // Posicionamento inteligente do início e fim
        this.setSmartStartEnd();
    }

    // Posiciona início e fim de forma inteligente baseado no tamanho
    setSmartStartEnd() {
        // Início sempre no canto superior esquerdo acessível
        this.start = [1, 1];
        this.maze[1][1] = 0;
        
        // Fim posicionado baseado no tamanho do labirinto
        let endRow, endCol;
        
        if (this.rows <= 15 && this.cols <= 25) {
            // Labirinto pequeno/médio: fim no canto oposto
            endRow = this.rows - 2;
            endCol = this.cols - 2;
        } else {
            // Labirinto grande: fim em posição estratégica
            endRow = Math.floor(this.rows * 0.8);
            endCol = Math.floor(this.cols * 0.8);
            
            // Garantir que é ímpar (para alinhamento com o algoritmo)
            if (endRow % 2 === 0) endRow--;
            if (endCol % 2 === 0) endCol--;
        }
        
        this.end = [endRow, endCol];
        this.maze[endRow][endCol] = 0;
        
        // Garantir conectividade entre início e fim
        this.ensureConnectivity();
    }

    // Garante que existe um caminho entre início e fim
    ensureConnectivity() {
        // Cria caminhos garantidos se necessário
        const pathToEnd = this.findPath(this.start, this.end);
        if (!pathToEnd) {
            // Se não há caminho, cria um caminho direto simplificado
            this.createFallbackPath();
        }
    }

    // Cria um caminho de emergência se necessário
    createFallbackPath() {
        let [currentRow, currentCol] = this.start;
        const [endRow, endCol] = this.end;
        
        // Caminho horizontal primeiro
        while (currentCol !== endCol) {
            this.maze[currentRow][currentCol] = 0;
            currentCol += currentCol < endCol ? 1 : -1;
        }
        
        // Depois caminho vertical
        while (currentRow !== endRow) {
            this.maze[currentRow][currentCol] = 0;
            currentRow += currentRow < endRow ? 1 : -1;
        }
        
        // Garantir que o fim está acessível
        this.maze[endRow][endCol] = 0;
    }

    // Busca simples para verificar conectividade
    findPath(start, end) {
        const queue = [[start[0], start[1]]];
        const visited = new Set();
        visited.add(`${start[0]},${start[1]}`);
        
        while (queue.length > 0) {
            const [row, col] = queue.shift();
            
            if (row === end[0] && col === end[1]) {
                return true;
            }
            
            const neighbors = this.getNeighbors(row, col);
            for (const [newRow, newCol] of neighbors) {
                const key = `${newRow},${newCol}`;
                if (!visited.has(key)) {
                    visited.add(key);
                    queue.push([newRow, newCol]);
                }
            }
        }
        
        return false;
    }

    // Ajusta tamanho do labirinto
    resize(newRows, newCols) {
        this.rows = newRows;
        this.cols = newCols;
        this.generateMaze();
    }

    // Renderiza o labirinto com tamanho adaptativo
    render() {
        const mazeElement = document.getElementById('maze');
        mazeElement.style.gridTemplateColumns = `repeat(${this.cols}, 1fr)`;
        mazeElement.innerHTML = '';
        
        // Ajusta tamanho das células baseado no tamanho do labirinto
        const cellSize = this.calculateCellSize();
        document.documentElement.style.setProperty('--cell-size', cellSize + 'px');
        
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                cell.style.width = cellSize + 'px';
                cell.style.height = cellSize + 'px';
                cell.style.fontSize = Math.max(8, cellSize * 0.5) + 'px';
                
                if (this.maze[row][col] === 1) {
                    cell.classList.add('wall');
                } else {
                    cell.classList.add('path');
                }
                
                if (row === this.start[0] && col === this.start[1]) {
                    cell.classList.add('start');
                    cell.textContent = 'S';
                } else if (row === this.end[0] && col === this.end[1]) {
                    cell.classList.add('end');
                    cell.textContent = 'E';
                }
                
                // Adiciona efeito hover para modo de edição
                if (this.editMode && this.maze[row][col] === 0) {
                    cell.style.cursor = 'pointer';
                    cell.addEventListener('mouseenter', () => {
                        if (!cell.classList.contains('start') && !cell.classList.contains('end')) {
                            cell.style.backgroundColor = this.editMode === 'start' ? '#27ae60' : '#e74c3c';
                            cell.style.opacity = '0.7';
                        }
                    });
                    cell.addEventListener('mouseleave', () => {
                        if (!cell.classList.contains('start') && !cell.classList.contains('end')) {
                            cell.style.backgroundColor = '';
                            cell.style.opacity = '';
                        }
                    });
                }
                
                mazeElement.appendChild(cell);
            }
        }
    }

    // Calcula tamanho ideal das células
    calculateCellSize() {
        const containerWidth = Math.min(window.innerWidth * 0.8, 1000);
        const containerHeight = Math.min(window.innerHeight * 0.5, 600);
        
        const cellWidth = Math.floor(containerWidth / this.cols);
        const cellHeight = Math.floor(containerHeight / this.rows);
        
        return Math.max(8, Math.min(25, Math.min(cellWidth, cellHeight)));
    }

    // Busca em Profundidade (DFS)
    async solveDFS() {
        this.reset();
        const startTime = Date.now();
        
        const stack = [[...this.start, []]];
        const visited = new Set();
        visited.add(`${this.start[0]},${this.start[1]}`);
        
        while (stack.length > 0) {
            const [row, col, path] = stack.pop();
            const currentPath = [...path, [row, col]];
            
            if (this.animationEnabled) {
                await this.animateStep(row, col, 'current');
                await this.delay(this.animationDelay);
            }
            
            if (row === this.end[0] && col === this.end[1]) {
                await this.showSolution(currentPath, Date.now() - startTime, 'DFS');
                return true;
            }
            
            if (this.animationEnabled) {
                await this.animateStep(row, col, 'visited');
            }
            
            this.visited.add(`${row},${col}`);
            
            const neighbors = this.getNeighbors(row, col);
            for (const [newRow, newCol] of neighbors) {
                const key = `${newRow},${newCol}`;
                if (!visited.has(key)) {
                    visited.add(key);
                    stack.push([newRow, newCol, currentPath]);
                }
            }
            
            this.updateStats('DFS', visited.size, 0, Date.now() - startTime);
        }
        
        this.updateStatus('Sem solução encontrada!');
        return false;
    }

    // Busca em Largura (BFS)
    async solveBFS() {
        this.reset();
        const startTime = Date.now();
        
        const queue = [[...this.start, []]];
        const visited = new Set();
        visited.add(`${this.start[0]},${this.start[1]}`);
        
        while (queue.length > 0) {
            const [row, col, path] = queue.shift();
            const currentPath = [...path, [row, col]];
            
            if (this.animationEnabled) {
                await this.animateStep(row, col, 'current');
                await this.delay(this.animationDelay);
            }
            
            if (row === this.end[0] && col === this.end[1]) {
                await this.showSolution(currentPath, Date.now() - startTime, 'BFS');
                return true;
            }
            
            if (this.animationEnabled) {
                await this.animateStep(row, col, 'visited');
            }
            
            this.visited.add(`${row},${col}`);
            
            const neighbors = this.getNeighbors(row, col);
            neighbors.reverse(); // Para BFS, queremos explorar em ordem
            
            for (const [newRow, newCol] of neighbors) {
                const key = `${newRow},${newCol}`;
                if (!visited.has(key)) {
                    visited.add(key);
                    queue.push([newRow, newCol, currentPath]);
                }
            }
            
            this.updateStats('BFS', visited.size, 0, Date.now() - startTime);
        }
        
        this.updateStatus('Sem solução encontrada!');
        return false;
    }

    // Obtém vizinhos válidos
    getNeighbors(row, col) {
        const neighbors = [];
        const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
        
        for (const [dr, dc] of directions) {
            const newRow = row + dr;
            const newCol = col + dc;
            
            if (newRow >= 0 && newRow < this.rows && 
                newCol >= 0 && newCol < this.cols && 
                this.maze[newRow][newCol] === 0) {
                neighbors.push([newRow, newCol]);
            }
        }
        
        return neighbors;
    }

    // Anima um passo da busca
    async animateStep(row, col, className) {
        const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        if (cell && !cell.classList.contains('start') && !cell.classList.contains('end')) {
            cell.className = `cell ${className}`;
        }
    }

    // Mostra a solução encontrada
    async showSolution(path, executionTime, algorithm) {
        this.path = path;
        
        if (this.animationEnabled) {
            for (let i = 0; i < path.length; i++) {
                const [row, col] = path[i];
                const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
                if (cell && !cell.classList.contains('start') && !cell.classList.contains('end')) {
                    cell.className = 'cell solution';
                    await this.delay(30);
                }
            }
        }
        
        this.updateStats(algorithm, this.visited.size, path.length, executionTime);
        this.updateStatus('Solução encontrada!');
    }

    // Atualiza as estatísticas
    updateStats(algorithm, visitedCount, pathLength, time) {
        document.getElementById('mazeSize').textContent = `${this.rows}x${this.cols}`;
        document.getElementById('algorithm').textContent = algorithm;
        document.getElementById('visited').textContent = visitedCount;
        document.getElementById('pathLength').textContent = pathLength;
        document.getElementById('executionTime').textContent = time + 'ms';
    }

    // Atualiza o status
    updateStatus(status) {
        document.getElementById('status').textContent = status;
    }

    // Reseta o estado da busca
    reset() {
        this.visited.clear();
        this.path = [];
        this.render();
        this.updateStats('-', 0, 0, 0);
        this.updateStatus('Aguardando...');
    }

    // Função de delay para animação
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Posiciona o fim em local aleatório
    setRandomEnd() {
        const paths = [];
        for (let row = 1; row < this.rows - 1; row++) {
            for (let col = 1; col < this.cols - 1; col++) {
                if (this.maze[row][col] === 0 && (row !== this.start[0] || col !== this.start[1])) {
                    paths.push([row, col]);
                }
            }
        }
        
        if (paths.length > 0) {
            this.end = paths[Math.floor(Math.random() * paths.length)];
            this.render();
            this.reset();
        }
    }

    // Compara ambos os algoritmos
    async solveBoth() {
        this.reset();
        document.getElementById('comparison').style.display = 'block';
        
        // Executa DFS
        const dfsResult = await this.solveSilent('DFS');
        await this.delay(500);
        
        // Executa BFS
        this.reset();
        const bfsResult = await this.solveSilent('BFS');
        
        // Mostra comparação
        this.showComparison(dfsResult, bfsResult);
        
        // Renderiza a melhor solução
        const bestResult = dfsResult.visitedCount <= bfsResult.visitedCount ? dfsResult : bfsResult;
        await this.showSolution(bestResult.path, bestResult.time, bestResult.algorithm + ' (Melhor)');
    }

    // Executa algoritmo sem animação para comparação
    async solveSilent(algorithm) {
        const startTime = Date.now();
        const originalAnimation = this.animationEnabled;
        this.animationEnabled = false;
        
        let result;
        if (algorithm === 'DFS') {
            result = await this.solveDFS();
        } else {
            result = await this.solveBFS();
        }
        
        const endTime = Date.now() - startTime;
        const visitedCount = this.visited.size;
        const path = [...this.path];
        
        this.animationEnabled = originalAnimation;
        
        return {
            algorithm,
            success: result,
            visitedCount,
            pathLength: path.length,
            time: endTime,
            path
        };
    }

    // Mostra comparação entre algoritmos
    showComparison(dfsResult, bfsResult) {
        const comparisonDiv = document.getElementById('comparisonData');
        
        const dfsEfficiency = dfsResult.visitedCount;
        const bfsEfficiency = bfsResult.visitedCount;
        const winner = dfsEfficiency <= bfsEfficiency ? 'DFS' : 'BFS';
        
        comparisonDiv.innerHTML = `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 10px;">
                <div>
                    <strong>🔍 DFS:</strong><br>
                    Visitou: ${dfsResult.visitedCount} células<br>
                    Caminho: ${dfsResult.pathLength} passos<br>
                    Tempo: ${dfsResult.time}ms
                </div>
                <div>
                    <strong>🌊 BFS:</strong><br>
                    Visitou: ${bfsResult.visitedCount} células<br>
                    Caminho: ${bfsResult.pathLength} passos<br>
                    Tempo: ${bfsResult.time}ms
                </div>
            </div>
            <div style="text-align: center; padding: 10px; background: rgba(255,255,255,0.1); border-radius: 8px;">
                <strong>🏆 Mais Eficiente: ${winner}</strong><br>
                <small>${winner === 'DFS' ? 
                    'DFS encontrou a solução explorando menos células!' : 
                    'BFS garantiu o caminho mais curto!'}</small>
            </div>
        `;
    }

    toggleAnimation() {
        this.animationEnabled = !this.animationEnabled;
        const toggle = document.getElementById('animToggle');
        toggle.textContent = this.animationEnabled ? 'Desabilitar Animação' : 'Habilitar Animação';
    }
}

// Instância global do labirinto
let maze = new Maze();

// Funções para controle de tamanho
function updateSizeDisplay() {
    const rows = document.getElementById('rows').value;
    const cols = document.getElementById('cols').value;
    document.getElementById('rowsValue').textContent = rows;
    document.getElementById('colsValue').textContent = cols;
}

function applyNewSize() {
    const rows = parseInt(document.getElementById('rows').value);
    const cols = parseInt(document.getElementById('cols').value);
    
    // Validação de valores ímpares (necessário para o algoritmo)
    const validRows = rows % 2 === 0 ? rows + 1 : rows;
    const validCols = cols % 2 === 0 ? cols + 1 : cols;
    
    // Atualiza os sliders se necessário
    if (validRows !== rows) {
        document.getElementById('rows').value = validRows;
        document.getElementById('rowsValue').textContent = validRows;
    }
    if (validCols !== cols) {
        document.getElementById('cols').value = validCols;
        document.getElementById('colsValue').textContent = validCols;
    }
    
    maze.resize(validRows, validCols);
    maze.render();
    document.getElementById('comparison').style.display = 'none';
}

// Funções globais para os botões
function generateMaze() {
    maze.generateMaze();
    maze.render();
    document.getElementById('comparison').style.display = 'none';
}

function setRandomEnd() {
    maze.setRandomEnd();
}

// Novas funções para posicionamento manual
function setCustomStart() {
    maze.enterEditMode('start');
}

function setCustomEnd() {
    maze.enterEditMode('end');
}

function solveDFS() {
    document.getElementById('comparison').style.display = 'none';
    maze.solveDFS();
}

function solveBFS() {
    document.getElementById('comparison').style.display = 'none';
    maze.solveBFS();
}

function solveBoth() {
    maze.solveBoth();
}

function reset() {
    maze.reset();
    document.getElementById('comparison').style.display = 'none';
}

function toggleAnimation() {
    maze.toggleAnimation();
}

// Inicialização
maze.render();
updateSizeDisplay();