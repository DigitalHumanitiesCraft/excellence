// The One Snake - Game Debugger
// Save this as debug.js and include it in your HTML after all other game scripts

class GameDebugger {
    constructor(game) {
        this.game = game;
        this.isEnabled = true;
        this.showGrid = true;
        this.showPositions = true;
        this.trackHistory = true;
        this.positionHistory = [];
        this.logFrequency = 2; // seconds between logs
        this.logTimer = 0;
        this.forceMoveTimer = 0;
        this.isForceMoving = false;
        this.highlightObjects = true;
        
        // Create debug UI
        this.createDebugUI();
        
        console.log("Game Debugger initialized");
    }
    
    createDebugUI() {
        // Create debug panel
        const debugPanel = document.createElement('div');
        debugPanel.id = 'debug-panel';
        debugPanel.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: rgba(0, 0, 0, 0.8);
            color: #00FF00;
            padding: 10px;
            border: 1px solid #00FF00;
            font-family: monospace;
            z-index: 9999;
            width: 300px;
            max-height: 80vh;
            overflow-y: auto;
        `;
        
        // Add controls
        debugPanel.innerHTML = `
            <h3 style="margin-top: 0; color: #00FF00;">Game Debugger</h3>
            <div>
                <button id="debug-toggle">Disable Debugger</button>
                <button id="force-playing">Force PLAYING State</button>
            </div>
            <div style="margin-top: 10px;">
                <label><input type="checkbox" id="debug-grid" checked> Show Grid</label>
                <label><input type="checkbox" id="debug-positions" checked> Show Positions</label>
                <label><input type="checkbox" id="debug-history" checked> Track History</label>
                <label><input type="checkbox" id="debug-highlight" checked> Highlight Objects</label>
            </div>
            <div style="margin-top: 10px;">
                <button id="force-move">Start Force Moving</button>
                <button id="log-game-state">Log Game State</button>
            </div>
            <div id="debug-info" style="margin-top: 10px; font-size: 12px;"></div>
        `;
        
        document.body.appendChild(debugPanel);
        
        // Set up event listeners
        document.getElementById('debug-toggle').addEventListener('click', () => {
            this.isEnabled = !this.isEnabled;
            document.getElementById('debug-toggle').textContent = this.isEnabled ? 'Disable Debugger' : 'Enable Debugger';
        });
        
        document.getElementById('force-playing').addEventListener('click', () => {
            this.game.setGameState(GAME_STATES.PLAYING);
            console.log("Forced game state to PLAYING");
        });
        
        document.getElementById('debug-grid').addEventListener('change', (e) => {
            this.showGrid = e.target.checked;
        });
        
        document.getElementById('debug-positions').addEventListener('change', (e) => {
            this.showPositions = e.target.checked;
        });
        
        document.getElementById('debug-history').addEventListener('change', (e) => {
            this.trackHistory = e.target.checked;
            if (!this.trackHistory) {
                this.positionHistory = [];
            }
        });
        
        document.getElementById('debug-highlight').addEventListener('change', (e) => {
            this.highlightObjects = e.target.checked;
        });
        
        document.getElementById('force-move').addEventListener('click', () => {
            this.isForceMoving = !this.isForceMoving;
            document.getElementById('force-move').textContent = this.isForceMoving ? 'Stop Force Moving' : 'Start Force Moving';
        });
        
        document.getElementById('log-game-state').addEventListener('click', () => {
            this.logGameState(true);
        });
    }
    
    update(deltaTime) {
        if (!this.isEnabled || !this.game) return;
        
        // Update info display periodically
        this.logTimer += deltaTime;
        if (this.logTimer >= this.logFrequency) {
            this.logTimer = 0;
            this.updateDebugInfo();
            this.logGameState();
        }
        
        // Track snake position history
        if (this.trackHistory && this.game.snake && this.game.snake.segments.length > 0) {
            const head = this.game.snake.segments[0];
            this.positionHistory.push({
                x: head.x,
                y: head.y,
                time: performance.now()
            });
            
            // Keep only last 100 positions
            if (this.positionHistory.length > 100) {
                this.positionHistory.shift();
            }
        }
        
        // Force snake movement for testing
        if (this.isForceMoving && this.game.snake) {
            this.forceMoveTimer += deltaTime;
            if (this.forceMoveTimer >= 0.5) { // Move every half second
                this.forceMoveTimer = 0;
                
                // Cycle through directions
                const directions = [DIRECTIONS.RIGHT, DIRECTIONS.DOWN, DIRECTIONS.LEFT, DIRECTIONS.UP];
                this.directionIndex = (this.directionIndex || 0) + 1;
                if (this.directionIndex >= directions.length) {
                    this.directionIndex = 0;
                }
                
                this.game.snake.changeDirection(directions[this.directionIndex]);
                console.log("Forced direction change:", directions[this.directionIndex]);
            }
        }
    }
    
    render(ctx) {
        if (!this.isEnabled || !ctx || !this.game) return;
        
        // Draw position history as a trail
        if (this.trackHistory) {
            const fadeDuration = 3000; // milliseconds
            const now = performance.now();
            
            for (const pos of this.positionHistory) {
                const age = now - pos.time;
                const alpha = Math.max(0, 1 - (age / fadeDuration));
                
                ctx.fillStyle = `rgba(255, 0, 255, ${alpha})`;
                ctx.fillRect(
                    pos.x * GRID_SIZE,
                    pos.y * GRID_SIZE,
                    GRID_SIZE/2,
                    GRID_SIZE/2
                );
            }
        }
        
        // Draw coordinate grid
        if (this.showGrid) {
            ctx.strokeStyle = '#444444';
            ctx.lineWidth = 1;
            
            const gridWidth = Math.floor(this.game.canvas.width / GRID_SIZE);
            const gridHeight = Math.floor(this.game.canvas.height / GRID_SIZE);
            
            // Draw grid lines
            for (let x = 0; x <= gridWidth; x++) {
                ctx.beginPath();
                ctx.moveTo(x * GRID_SIZE, 0);
                ctx.lineTo(x * GRID_SIZE, this.game.canvas.height);
                ctx.stroke();
                
                // Draw x-axis labels
                if (x % 5 === 0) {
                    ctx.fillStyle = '#AAAAAA';
                    ctx.font = '10px monospace';
                    ctx.fillText(x.toString(), x * GRID_SIZE + 2, 10);
                }
            }
            
            for (let y = 0; y <= gridHeight; y++) {
                ctx.beginPath();
                ctx.moveTo(0, y * GRID_SIZE);
                ctx.lineTo(this.game.canvas.width, y * GRID_SIZE);
                ctx.stroke();
                
                // Draw y-axis labels
                if (y % 5 === 0) {
                    ctx.fillStyle = '#AAAAAA';
                    ctx.font = '10px monospace';
                    ctx.fillText(y.toString(), 2, y * GRID_SIZE + 10);
                }
            }
        }
        
        // Highlight and label objects
        if (this.showPositions && this.highlightObjects) {
            // Highlight snake head
            if (this.game.snake && this.game.snake.segments.length > 0) {
                const head = this.game.snake.segments[0];
                
                // Draw highlight around head
                ctx.strokeStyle = '#FF00FF';
                ctx.lineWidth = 2;
                ctx.strokeRect(
                    head.x * GRID_SIZE - 2,
                    head.y * GRID_SIZE - 2,
                    GRID_SIZE + 4,
                    GRID_SIZE + 4
                );
                
                // Label snake head
                ctx.fillStyle = '#FFFFFF';
                ctx.font = '12px monospace';
                ctx.fillText(
                    `Snake (${head.x},${head.y})`,
                    head.x * GRID_SIZE,
                    head.y * GRID_SIZE - 5
                );
            }
            
            // Highlight obstacles
            ctx.strokeStyle = '#FF0000';
            ctx.lineWidth = 2;
            for (let i = 0; i < Math.min(this.game.obstacles.length, 10); i++) {
                const obstacle = this.game.obstacles[i];
                ctx.strokeRect(
                    obstacle.x * GRID_SIZE - 1,
                    obstacle.y * GRID_SIZE - 1,
                    GRID_SIZE + 2,
                    GRID_SIZE + 2
                );
                
                if (i < 3) { // Only label a few to avoid clutter
                    ctx.fillStyle = '#FF8888';
                    ctx.font = '10px monospace';
                    ctx.fillText(
                        `Obs(${obstacle.x},${obstacle.y})`,
                        obstacle.x * GRID_SIZE,
                        obstacle.y * GRID_SIZE - 2
                    );
                }
            }
            
            // Highlight collectibles
            ctx.strokeStyle = '#FFFF00';
            ctx.lineWidth = 2;
            for (let i = 0; i < Math.min(this.game.collectibles.length, 5); i++) {
                const collectible = this.game.collectibles[i];
                ctx.strokeRect(
                    collectible.x * GRID_SIZE - 1,
                    collectible.y * GRID_SIZE - 1,
                    GRID_SIZE + 2,
                    GRID_SIZE + 2
                );
                
                ctx.fillStyle = '#FFFF88';
                ctx.font = '10px monospace';
                ctx.fillText(
                    `Col(${collectible.x},${collectible.y})`,
                    collectible.x * GRID_SIZE,
                    collectible.y * GRID_SIZE - 2
                );
            }
        }
        
        // Draw a crosshair at the center for reference
        const centerX = Math.floor(this.game.canvas.width / 2);
        const centerY = Math.floor(this.game.canvas.height / 2);
        
        ctx.strokeStyle = '#00FFFF';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(centerX - 10, centerY);
        ctx.lineTo(centerX + 10, centerY);
        ctx.moveTo(centerX, centerY - 10);
        ctx.lineTo(centerX, centerY + 10);
        ctx.stroke();
        
        ctx.fillStyle = '#00FFFF';
        ctx.font = '12px monospace';
        ctx.fillText('CENTER', centerX + 15, centerY + 5);
    }
    
    updateDebugInfo() {
        const infoElement = document.getElementById('debug-info');
        if (!infoElement || !this.game) return;
        
        const snakeHead = this.game.snake && this.game.snake.segments.length > 0 
            ? this.game.snake.segments[0] 
            : {x: 'N/A', y: 'N/A'};
        
        infoElement.innerHTML = `
            <div>Game State: <span style="color: yellow;">${this.game.currentState}</span></div>
            <div>Canvas Size: ${this.game.canvas.width}x${this.game.canvas.height}</div>
            <div>Grid Size: ${GRID_SIZE}</div>
            <div>Snake Position: (${snakeHead.x}, ${snakeHead.y})</div>
            <div>Obstacles: ${this.game.obstacles.length}</div>
            <div>Collectibles: ${this.game.collectibles.length}</div>
            <div>Score: ${this.game.score}</div>
            <div>Frame Rate: ${Math.round(1 / (this.game.deltaTime || 0.016))} FPS</div>
        `;
    }
    
    logGameState(verbose = false) {
        console.group("Game State");
        console.log("Current State:", this.game.currentState);
        console.log("Canvas Size:", `${this.game.canvas.width}x${this.game.canvas.height}`);
        console.log("Grid Size:", GRID_SIZE);
        
        if (this.game.snake) {
            console.log("Snake Head:", this.game.snake.segments[0]);
            console.log("Snake Length:", this.game.snake.segments.length);
            console.log("Snake Direction:", this.game.snake.direction);
        } else {
            console.log("Snake: Not initialized");
        }
        
        console.log("Obstacles:", this.game.obstacles.length);
        console.log("Collectibles:", this.game.collectibles.length);
        console.log("Portals:", this.game.portals.length);
        console.log("Horses:", this.game.horses.length);
        
        if (verbose) {
            console.log("First few obstacles:", this.game.obstacles.slice(0, 3));
            console.log("First few collectibles:", this.game.collectibles.slice(0, 3));
            console.log("Game instance:", this.game);
        }
        
        console.groupEnd();
    }
    
    static init() {
        // Wait for game instance to be available
        const checkInterval = setInterval(() => {
            if (window.gameInstance) {
                clearInterval(checkInterval);
                
                // Create debugger instance
                window.gameDebugger = new GameDebugger(window.gameInstance);
                
                // Patch game methods to include debugger
                const originalUpdate = window.gameInstance.update;
                window.gameInstance.update = function(deltaTime) {
                    originalUpdate.call(this, deltaTime);
                    if (window.gameDebugger) {
                        window.gameDebugger.update(deltaTime);
                    }
                };
                
                const originalRender = window.gameInstance.render;
                window.gameInstance.render = function() {
                    originalRender.call(this);
                    if (window.gameDebugger && this.ctx) {
                        window.gameDebugger.render(this.ctx);
                    }
                };
                
                console.log("Game Debugger patched into game instance");
                
                // Apply CSS fix to ensure canvas is visible
                const canvas = document.getElementById('game-canvas');
                if (canvas) {
                    canvas.style.display = 'block';
                    canvas.style.background = '#333';
                    canvas.style.border = '2px solid #F00';
                }
                
                // Make sure game state container is visible
                const gamePlayingElement = document.getElementById('game-playing');
                if (gamePlayingElement) {
                    gamePlayingElement.style.display = 'block';
                    gamePlayingElement.style.width = '100%';
                    gamePlayingElement.style.height = '100%';
                }
            }
        }, 100);
    }
}

// Initialize debugger when window loads
window.addEventListener('load', GameDebugger.init);