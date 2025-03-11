// The One Snake - Core Game Logic

class Game {
    constructor() {
        // Initialize game canvas
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.minimapCanvas = document.getElementById('minimap');
        this.minimapCtx = this.minimapCanvas.getContext('2d');
        
        // Set default canvas size initially
        this.canvas.width = 800;
        this.canvas.height = 600;
        console.log(`Initial canvas size set to: ${this.canvas.width}x${this.canvas.height}`);
        
        // Game state tracking
        this.currentState = GAME_STATES.MAIN_MENU;
        this.currentLevel = null;
        this.score = 0;
        this.fireMeter = 0;
        this.transformationProgress = 0;
        this.collectiblesObtained = 0;
        this.currentTransformationStage = 0;
        
        // Time tracking
        this.lastFrameTime = 0;
        this.deltaTime = 0;
        this.accumulatedTime = 0;
        this.timeStep = 1000 / 60; // Target 60 FPS
        this.gameStartTime = 0; // Track when the game starts
        
        // Game objects
        this.snake = null;
        this.obstacles = [];
        this.collectibles = [];
        this.horses = [];
        this.portals = [];
        
        // Game systems
        this.levelGenerator = new LevelGenerator(this);
        this.fireAbilities = new FireAbilityManager(this);
        this.particles = new ParticleSystem();
        this.ui = new UI(this);
        this.controls = new Controls(this);
        
        // Active effects
        this.activeEffects = {
            fireShield: { active: false, timeRemaining: 0 },
            burningTrail: { active: false, timeRemaining: 0 },
            speedBoost: { active: false, timeRemaining: 0, multiplier: 1 }
        };
        
        // Horse spawn timer
        this.horseSpawnTimer = 0;
        
        // Set up initial canvas size
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // Start the game loop
        this.gameLoop(0);
    }
    
    // Set the current game state
    setGameState(state) {
        // Validate state parameter
        if (!state) {
            console.error("Attempted to set null or undefined game state");
            return;
        }
        
        // Make sure the state is a valid game state
        if (!Object.values(GAME_STATES).includes(state)) {
            console.error(`Invalid game state: ${state}`);
            return;
        }
        
        try {
            // Hide all game state elements
            const gameStateElements = document.querySelectorAll('.game-state');
            gameStateElements.forEach(element => {
                if (element) element.classList.remove('active');
            });
            
            // Show the requested state with null check
            const stateElement = document.getElementById(state);
            if (stateElement) {
                stateElement.classList.add('active');
            } else {
                console.warn(`Game state element '${state}' not found in DOM`);
            }
            
            // Update state
            this.currentState = state;
            
            // Perform state-specific actions
            if (state === GAME_STATES.GAME_OVER) {
                this.ui.showGameOver();
            } else if (state === GAME_STATES.VICTORY) {
                this.ui.showVictory();
            }
        } catch (error) {
            console.error(`Error setting game state to ${state}:`, error);
        }
    }
    
    // Resize canvas to fit container
    resizeCanvas() {
        try {
            const container = document.getElementById('game-playing');
            
            if (container) {
                // Set canvas size based on container
                this.canvas.width = container.clientWidth;
                this.canvas.height = container.clientHeight;
                
                // Ensure minimum canvas size
                if (this.canvas.width <= 0) this.canvas.width = 800;
                if (this.canvas.height <= 0) this.canvas.height = 600;
                
                console.log(`Canvas resized to: ${this.canvas.width}x${this.canvas.height}`);
            } else {
                // Default size if container not found
                this.canvas.width = 800;
                this.canvas.height = 600;
                console.log("Game container not found, using default size: 800x600");
            }
        } catch (error) {
            console.error("Error resizing canvas:", error);
            // Set default size in case of error
            this.canvas.width = 800;
            this.canvas.height = 600;
        }
    }
    
    // Initialize a new game
    initGame(levelId) {
        try {
            // Store the game start time for grace period
            this.gameStartTime = performance.now() / 1000;
            console.log("Starting new game at time:", this.gameStartTime);
            
            // Find level config or default to first level
            this.currentLevel = LEVELS.find(level => level.id === levelId) || LEVELS[0];
            
            // Reset game state
            this.score = 0;
            this.fireMeter = FIRE_METER_MAX / 2;
            this.transformationProgress = 0;
            this.collectiblesObtained = 0;
            this.currentTransformationStage = 0;
            
            // Reset game objects
            this.obstacles = [];
            this.collectibles = [];
            this.horses = [];
            this.portals = [];
            
            // Reset active effects
            this.activeEffects = {
                fireShield: { active: false, timeRemaining: 0 },
                burningTrail: { active: false, timeRemaining: 0 },
                speedBoost: { active: false, timeRemaining: 0, multiplier: 1 }
            };
            
            // Reset horse spawn timer
            this.horseSpawnTimer = 0;
            
            // Clear particles
            this.particles.clear();
            
            // Initialize snake
            this.initSnake();
            
            // Generate level
            this.levelGenerator.generateLevel(this.currentLevel);
            
            // Update UI
            this.ui.update();
            
            // Set game state to playing
            this.setGameState(GAME_STATES.PLAYING);
        } catch (error) {
            console.error("Error initializing game:", error);
        }
    }
    
    // Initialize snake
    initSnake() {
        const gridWidth = Math.floor(this.canvas.width / GRID_SIZE);
        const gridHeight = Math.floor(this.canvas.height / GRID_SIZE);
        
        // Make sure Snake is available
        if (typeof Snake === 'undefined' && typeof window.Snake === 'function') {
            // If Snake is defined on window but not globally, use it
            Snake = window.Snake;
        }
        
        if (typeof Snake !== 'function') {
            console.error("Snake class is not defined. Check that snake.js is properly loaded.");
            return;
        }
        
        this.snake = new Snake(gridWidth, gridHeight);
    }
    
    // Main game loop
    gameLoop(timestamp) {
        // Calculate time delta
        this.deltaTime = (timestamp - this.lastFrameTime) / 1000; // Convert to seconds
        this.lastFrameTime = timestamp;
        
        // Limit delta time to avoid large jumps
        if (this.deltaTime > 0.1) this.deltaTime = 0.1;
        
        // Accumulate time and update at fixed intervals
        this.accumulatedTime += this.deltaTime * 1000; // Convert to ms
        
        // Only update if in playing state
        if (this.currentState === GAME_STATES.PLAYING) {
            // Update game logic at fixed intervals
            while (this.accumulatedTime >= this.timeStep) {
                this.update(this.timeStep / 1000); // Convert back to seconds
                this.accumulatedTime -= this.timeStep;
            }
        }
        
        // Always render
        this.render();
        
        // Request next frame
        requestAnimationFrame((time) => this.gameLoop(time));
    }
    
    // Update game logic
    update(deltaTime) {
        try {
            // Skip update if not in playing state
            if (this.currentState !== GAME_STATES.PLAYING) return;
            
            // Skip update if snake is not initialized
            if (!this.snake) return;
            
            // Check transformation stage
            this.checkTransformation();
            
            // Update snake
            this.updateSnake(deltaTime);
            
            // Update horses
            this.updateHorses(deltaTime);
            
            // Update portals
            this.updatePortals(deltaTime);
            
            // Update active effects
            this.updateEffects(deltaTime);
            
            // Update fire abilities
            this.fireAbilities.update(deltaTime);
            
            // Update particles
            this.particles.update(deltaTime);
            
            // Regenerate fire meter
            this.fireMeter += FIRE_METER_REGEN_RATE * deltaTime;
            if (this.fireMeter > FIRE_METER_MAX) {
                this.fireMeter = FIRE_METER_MAX;
            }
            
            // Check horse spawn timer
            this.horseSpawnTimer += deltaTime;
            if (this.horseSpawnTimer >= HORSE_SPAWN_INTERVAL) {
                this.horseSpawnTimer = 0;
                this.levelGenerator.spawnHorse();
            }
            
            // Update UI
            this.ui.update();
        } catch (error) {
            console.error("Error in game update:", error);
        }
    }
    
    // Update snake position and check collisions
    updateSnake(deltaTime) {
        // Skip if snake is not initialized
        if (!this.snake) return;
        
        // Calculate grid dimensions
        const gridWidth = Math.floor(this.canvas.width / GRID_SIZE);
        const gridHeight = Math.floor(this.canvas.height / GRID_SIZE);
        
        // Update snake position
        const newHead = this.snake.update(deltaTime, gridWidth, gridHeight);
        
        // Add a 1-second grace period after game start before checking collisions
        const gracePeriod = 1.0; // 1 second
        const gameTime = performance.now() / 1000 - this.gameStartTime;
        if (gameTime < gracePeriod) {
            return;
        }
        
        // Check for self-collision
        if (this.snake.checkSelfCollision()) {
            // Check if fire shield is active
            if (this.activeEffects.fireShield.active) {
                // Fire shield protects against self-collision
                this.particles.createParticleEffect('FIRE', newHead.x, newHead.y, { x: 0, y: 0 }, 0.3);
            } else {
                console.log("Game over: Self collision detected");
                this.gameOver();
                return;
            }
        }
        
        // Check for collisions with obstacles
        for (const obstacle of this.obstacles) {
            if (this.snake.checkCollision(obstacle)) {
                // Check if fire shield is active
                if (this.activeEffects.fireShield.active) {
                    // Fire shield protects against obstacles
                    this.particles.createParticleEffect('FIRE', obstacle.x, obstacle.y, { x: 0, y: 0 }, 0.3);
                } else {
                    console.log(`Game over: Obstacle collision at (${obstacle.x},${obstacle.y})`);
                    this.gameOver();
                    return;
                }
            }
        }
        
        // Check for collisions with collectibles
        this.collectibles = this.collectibles.filter(collectible => {
            if (this.snake.checkCollision(collectible)) {
                // Collect the item
                this.collectItem(collectible);
                this.particles.createParticleEffect('TRANSFORMATION', collectible.x, collectible.y, { x: 0, y: 0 }, 0.3);
                
                // Spawn a new collectible
                this.levelGenerator.spawnCollectible();
                
                return false;
            }
            return true;
        });
        
        // Check for collisions with horses
        this.horses = this.horses.filter(horse => {
            if (this.snake.checkCollision(horse)) {
                // Handle horse collision
                this.handleHorseCollision(horse);
                return false;
            }
            return true;
        });
        
        // Check for collisions with portals
        for (const portal of this.portals) {
            if (this.snake.checkCollision(portal)) {
                // Attempt teleportation
                const exitPosition = portal.teleport();
                if (exitPosition) {
                    // Teleport snake to exit position
                    this.teleportSnake(exitPosition);
                    this.particles.createParticleEffect('PORTAL', portal.x, portal.y, { x: 0, y: 0 }, 0.5);
                    this.particles.createParticleEffect('PORTAL', exitPosition.x, exitPosition.y, { x: 0, y: 0 }, 0.5);
                    break;
                }
            }
        }
        
        // Check level completion
        if (this.collectiblesObtained >= 30) { // Example completion condition
            this.levelComplete();
        }
    }
    
    // Update horses
    updateHorses(deltaTime) {
        if (!this.snake) return;
        
        for (const horse of this.horses) {
            horse.update(deltaTime, this.snake.segments[0]);
        }
    }
    
    // Update portals
    updatePortals(deltaTime) {
        for (const portal of this.portals) {
            portal.update(deltaTime);
        }
    }
    
    // Update active effects
    updateEffects(deltaTime) {
        // Update fire shield
        if (this.activeEffects.fireShield.active) {
            this.activeEffects.fireShield.timeRemaining -= deltaTime;
            if (this.activeEffects.fireShield.timeRemaining <= 0) {
                this.activeEffects.fireShield.active = false;
            }
        }
        
        // Update burning trail
        if (this.activeEffects.burningTrail.active) {
            this.activeEffects.burningTrail.timeRemaining -= deltaTime;
            if (this.activeEffects.burningTrail.timeRemaining <= 0) {
                this.activeEffects.burningTrail.active = false;
            }
        }
        
        // Update speed boost
        if (this.activeEffects.speedBoost.active) {
            this.activeEffects.speedBoost.timeRemaining -= deltaTime;
            if (this.activeEffects.speedBoost.timeRemaining <= 0) {
                this.activeEffects.speedBoost.active = false;
                if (this.snake) {
                    this.snake.speed = BASE_MOVEMENT_SPEED;
                }
            }
        }
    }
    
    // Check and update transformation stage
    checkTransformation() {
        // Skip if snake not initialized
        if (!this.snake) return;
        
        // Check if enough collectibles for next stage
        for (let i = TRANSFORMATION_STAGES.length - 1; i >= 0; i--) {
            const stage = TRANSFORMATION_STAGES[i];
            if (this.collectiblesObtained >= stage.requiredItems) {
                if (i > this.currentTransformationStage) {
                    // Transform to higher stage
                    this.transformSnake(i);
                }
                break;
            }
        }
    }
    
    // Transform snake to new stage
    transformSnake(stageIndex) {
        // Skip if snake not initialized
        if (!this.snake) return;
        
        // Update transformation stage
        this.currentTransformationStage = stageIndex;
        
        // Apply transformation to snake
        this.snake.applyTransformation(TRANSFORMATION_STAGES[stageIndex]);
        
        // Create transformation effect
        this.particles.createParticleEffect(
            'TRANSFORMATION',
            this.snake.segments[0].x,
            this.snake.segments[0].y,
            { x: 0, y: 0 },
            1.5
        );
    }
    
    // Handle collecting an item
    collectItem(collectible) {
        // Skip if snake not initialized
        if (!this.snake) return;
        
        // Increase score
        this.score += collectible.value * SCORE_MULTIPLIER.collectible;
        console.log(`Collected item! Score: ${this.score}, Value: ${collectible.value}`);
        
        // Increase collectibles count
        this.collectiblesObtained++;
        
        // Grow snake
        this.snake.grow(1);
        
        // Increase fire meter
        this.fireMeter += 5;
        if (this.fireMeter > FIRE_METER_MAX) {
            this.fireMeter = FIRE_METER_MAX;
        }
    }
    
    // Handle collision with a horse
    handleHorseCollision(horse) {
        // Skip if snake not initialized
        if (!this.snake) return;
        
        // Increase score
        this.score += SCORE_MULTIPLIER.horse * horse.properties.speed;
        console.log(`Horse collision! Score: ${this.score}`);
        
        // Apply horse effect
        switch (horse.effect) {
            case 'speed_boost':
                // Apply speed boost
                this.activeEffects.speedBoost = {
                    active: true,
                    timeRemaining: horse.duration,
                    multiplier: 1.5
                };
                this.snake.speed = BASE_MOVEMENT_SPEED * this.activeEffects.speedBoost.multiplier;
                break;
                
            case 'transform_boost':
                // Add collectibles to help transformation
                this.collectiblesObtained += 3;
                break;
                
            case 'drop_treasures':
                // Spawn extra collectibles
                for (let i = 0; i < 3; i++) {
                    this.levelGenerator.spawnCollectible();
                }
                break;
                
            case 'danger_warning':
                // Highlight dangers (not implemented in this version)
                break;
        }
        
        // Create effect
        this.particles.createParticleEffect('SMOKE', horse.x, horse.y, { x: 0, y: 0 }, 0.5);
    }
    
    // Teleport snake to new position
    teleportSnake(position) {
        // Skip if snake not initialized
        if (!this.snake) return;
        
        // Move head to exit position
        this.snake.segments[0].x = position.x;
        this.snake.segments[0].y = position.y;
        
        console.log(`Snake teleported to (${position.x}, ${position.y})`);
    }
    
    // Game over state
    gameOver() {
        this.setGameState(GAME_STATES.GAME_OVER);
    }
    
    // Level complete state
    levelComplete() {
        // Add level completion bonus
        if (this.currentLevel && this.currentLevel.difficulty) {
            this.score += SCORE_MULTIPLIER.level_completion * this.currentLevel.difficulty;
        } else {
            // Default bonus if level has no difficulty
            this.score += SCORE_MULTIPLIER.level_completion;
        }
        this.setGameState(GAME_STATES.VICTORY);
    }
    
    // Render game
    render() {
        try {
            // Clear canvas with a more visible color
            this.ctx.fillStyle = '#333333'; // Dark gray background
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            // Add debug message to canvas
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.font = '20px Arial';
            this.ctx.fillText('Game Running - Score: ' + this.score, 10, 30);
            
            // Force all objects to be drawn with high contrast colors
            
            // Draw obstacles (bright silver)
            this.ctx.fillStyle = '#DDDDDD';
            for (const obstacle of this.obstacles) {
                this.ctx.fillRect(
                    obstacle.x * GRID_SIZE,
                    obstacle.y * GRID_SIZE,
                    GRID_SIZE,
                    GRID_SIZE
                );
            }
            
            // Draw collectibles (bright gold)
            this.ctx.fillStyle = '#FFDD00';
            for (const collectible of this.collectibles) {
                this.ctx.fillRect(
                    collectible.x * GRID_SIZE,
                    collectible.y * GRID_SIZE,
                    GRID_SIZE,
                    GRID_SIZE
                );
            }
            
            // Draw the snake (bright green)
            if (this.snake) {
                // Always draw the snake
                this.ctx.fillStyle = '#00FF00';
                for (const segment of this.snake.segments) {
                    this.ctx.fillRect(
                        segment.x * GRID_SIZE,
                        segment.y * GRID_SIZE,
                        GRID_SIZE,
                        GRID_SIZE
                    );
                }
            }
            
            // Add a visible grid
            this.ctx.strokeStyle = '#444444';
            this.ctx.lineWidth = 1;
            for (let x = 0; x < this.canvas.width; x += GRID_SIZE) {
                this.ctx.beginPath();
                this.ctx.moveTo(x, 0);
                this.ctx.lineTo(x, this.canvas.height);
                this.ctx.stroke();
            }
            for (let y = 0; y < this.canvas.height; y += GRID_SIZE) {
                this.ctx.beginPath();
                this.ctx.moveTo(0, y);
                this.ctx.lineTo(this.canvas.width, y);
                this.ctx.stroke();
            }
        } catch (error) {
            console.error("Error in game render:", error);
        }
    }
    
    // Draw background
    drawBackground() {
        // Draw different background based on level
        let bgColor = '#222222';
        
        if (this.currentLevel) {
            switch (this.currentLevel.id) {
                case 'shire':
                    bgColor = '#7CFC00'; // Bright green
                    break;
                case 'rivendell':
                    bgColor = '#4682B4'; // Steel blue
                    break;
                case 'mirkwood':
                    bgColor = '#006400'; // Dark green
                    break;
                case 'rohan':
                    bgColor = '#DAA520'; // Golden rod
                    break;
                case 'moria':
                    bgColor = '#2F4F4F'; // Dark slate
                    break;
                case 'mordor':
                    bgColor = '#8B0000'; // Dark red
                    break;
            }
        }
        
        this.ctx.fillStyle = bgColor;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw grid
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.lineWidth = 1;
        
        // Vertical lines
        for (let x = 0; x < this.canvas.width; x += GRID_SIZE) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
        
        // Horizontal lines
        for (let y = 0; y < this.canvas.height; y += GRID_SIZE) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
    }
}