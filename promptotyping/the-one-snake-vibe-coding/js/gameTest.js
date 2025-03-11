class GameTest {
    constructor() {
        this.testResults = [];
        this.testsPassed = 0;
        this.testsFailed = 0;
        this.game = null;
        this.fixtures = {};
    }
    
    // Core testing utilities
    assert(condition, testName, message, details = null) {
        const success = !!condition;
        
        this.testResults.push({
            testName,
            success,
            message,
            details,
            timestamp: new Date().toISOString()
        });
        
        if (success) {
            this.testsPassed++;
            console.log(`✅ PASS: ${testName} - ${message}`);
        } else {
            this.testsFailed++;
            console.error(`❌ FAIL: ${testName} - ${message}`);
            details && console.error("Details:", details);
        }
        
        return success;
    }
    
    // Run test with automatic error handling
    runTest(testName, testFn) {
        try {
            return testFn();
        } catch (error) {
            this.assert(false, testName, `Unexpected error: ${error.message}`, {
                error,
                stack: error.stack
            });
            return false;
        }
    }
    
    // Initialize fixtures for reuse across tests
    setupFixtures() {
        // Common test objects
        this.fixtures.testObstacle = new Obstacle(10, 10, 'rocks');
        this.fixtures.testCollectible = new Collectible(12, 12);
        this.fixtures.testHorse = new Horse(14, 14, 'SHADOWFAX');
        this.fixtures.exitPortal = new Portal(16, 16, 'PALANTIR');
        this.fixtures.entrancePortal = new Portal(18, 18, 'PALANTIR', this.fixtures.exitPortal);
    }
    
    // Initialize game for testing
    async initializeGameTest() {
        return this.runTest("Game Initialization", () => {
            // Check constants
            this.assert(typeof GRID_SIZE !== 'undefined', "Constants", "Game constants loaded");
            
            // Check DOM elements
            const hasRequiredElements = [
                "game-container", 
                "game-canvas", 
                "minimap"
            ].every(id => !!document.getElementById(id));
            
            this.assert(hasRequiredElements, "DOM Structure", "Required DOM elements present");
            
            // Create game instance
            this.game = new Game();
            
            // Setup reusable test fixtures
            this.setupFixtures();
            
            return !!this.game;
        });
    }
    
    // Test game state transitions
    testGameStates() {
        return this.runTest("Game States", () => {
            let allStatesValid = true;
            
            // Test each game state
            Object.values(GAME_STATES).forEach(state => {
                this.game.setGameState(state);
                const stateElement = document.getElementById(state);
                const stateActive = stateElement && stateElement.classList.contains('active');
                
                if (!this.assert(stateActive, `State - ${state}`, 
                    `${state} state correctly activated`, 
                    !stateActive ? { suggestion: `Check the ${state} element in HTML` } : null)) {
                    allStatesValid = false;
                }
            });
            
            return allStatesValid;
        });
    }
    
    // Combined snake system tests
    testSnakeSystem() {
        return this.runTest("Snake System", () => {
            this.game.initGame('shire');
            
            // Test initialization
            const hasSnake = !!this.game.snake;
            this.assert(hasSnake, "Snake Existence", "Snake object initialized");
            if (!hasSnake) return false;
            
            // Test properties
            const correctLength = this.game.snake.segments.length === BASE_SNAKE_LENGTH;
            this.assert(correctLength, "Snake Length", 
                `Initial length is ${this.game.snake.segments.length}, expected ${BASE_SNAKE_LENGTH}`);
            
            // Test direction change
            const initialDirection = {...this.game.snake.direction};
            this.game.snake.changeDirection(DIRECTIONS.DOWN);
            const directionChanged = this.game.snake.nextDirection === DIRECTIONS.DOWN;
            this.assert(directionChanged, "Direction Change", "Direction change accepted");
            
            // Test opposite direction rejection
            this.game.snake.direction = DIRECTIONS.UP;
            this.game.snake.changeDirection(DIRECTIONS.DOWN);
            const invalidRejected = this.game.snake.nextDirection !== DIRECTIONS.DOWN;
            this.assert(invalidRejected, "Invalid Direction", "Opposite direction rejected");
            
            // Test growth
            const initialSegments = this.game.snake.segments.length;
            this.game.snake.grow(2);
            this.assert(this.game.snake.growing === 2, "Snake Growth", "Growth value correctly set");
            
            return true;
        });
    }
    
    // Test collision system with predefined test objects
    testCollisionSystem() {
        return this.runTest("Collision System", () => {
            this.game.initGame('shire');
            
            // Add test objects to game
            this.game.obstacles = [this.fixtures.testObstacle];
            this.game.collectibles = [this.fixtures.testCollectible];
            this.game.horses = [this.fixtures.testHorse];
            this.game.portals = [this.fixtures.entrancePortal, this.fixtures.exitPortal];
            
            // Test each collision type
            const collisionTests = [
                {
                    name: "Obstacle",
                    object: this.fixtures.testObstacle,
                    position: { x: 10, y: 10 }
                },
                {
                    name: "Collectible",
                    object: this.fixtures.testCollectible,
                    position: { x: 12, y: 12 }
                },
                {
                    name: "Horse",
                    object: this.fixtures.testHorse,
                    position: { x: 14, y: 14 }
                },
                {
                    name: "Portal",
                    object: this.fixtures.entrancePortal,
                    position: { x: 18, y: 18 }
                }
            ];
            
            let allCollisionsValid = true;
            
            // Test each collision
            collisionTests.forEach(test => {
                this.game.snake.segments[0] = {...test.position};
                const collision = this.game.snake.checkCollision(test.object);
                
                if (!this.assert(collision, `${test.name} Collision`, 
                    `${test.name} collision detected correctly`)) {
                    allCollisionsValid = false;
                }
            });
            
            return allCollisionsValid;
        });
    }
    
    // Combined ability, portal, horse, and particle system tests
    testGameSystems() {
        return this.runTest("Game Systems", () => {
            this.game.initGame('shire');
            
            // Test fire abilities
            const abilityTest = this.runTest("Fire Abilities", () => {
                // Set prerequisites
                this.game.currentTransformationStage = TRANSFORMATION_STAGES.length - 1;
                this.game.fireMeter = FIRE_METER_MAX;
                this.game.fireAbilities.cooldowns.FLAME_BREATH = 0;
                
                // Test activation
                const initialActiveEffects = this.game.fireAbilities.activeEffects.length;
                this.game.fireAbilities.activateAbility(
                    'FLAME_BREATH',
                    this.game.snake.segments[0],
                    this.game.snake.direction
                );
                
                return this.assert(
                    this.game.fireAbilities.activeEffects.length > initialActiveEffects,
                    "Ability Activation",
                    "Fire ability correctly activated"
                );
            });
            
            // Test portals
            const portalTest = this.runTest("Portal System", () => {
                // Set up portal pair
                const exitPortal = new Portal(25, 25, 'PALANTIR');
                const entrancePortal = new Portal(20, 20, 'PALANTIR', exitPortal);
                this.game.portals = [entrancePortal, exitPortal];
                
                // Test teleportation
                const teleportPos = entrancePortal.teleport();
                return this.assert(
                    teleportPos && teleportPos.x === 25 && teleportPos.y === 25,
                    "Portal Teleportation",
                    "Portal correctly returns exit position"
                );
            });
            
            // Test particle system
            const particleTest = this.runTest("Particle System", () => {
                // Clear existing particles
                this.game.particles.clear();
                
                // Create test effect
                this.game.particles.createParticleEffect('FIRE', 30, 30, {x:0, y:0}, 0.5);
                
                return this.assert(
                    this.game.particles.particles.length > 0,
                    "Particle Creation",
                    `${this.game.particles.particles.length} particles created`
                );
            });
            
            return abilityTest && portalTest && particleTest;
        });
    }
    
    // Test level generation across all levels
    testLevelGeneration() {
        return this.runTest("Level Generation", () => {
            let allLevelsValid = true;
            
            // Test each level
            for (const level of LEVELS) {
                if (!this.runTest(`Level - ${level.id}`, () => {
                    this.game.initGame(level.id);
                    
                    // Check level objects were created
                    const hasObstacles = this.game.obstacles.length > 0;
                    const hasCollectibles = this.game.collectibles.length > 0;
                    const hasPortals = this.game.portals.length > 0;
                    
                    return this.assert(
                        hasObstacles && hasCollectibles && hasPortals,
                        `Level ${level.id} Objects`,
                        `Level has ${this.game.obstacles.length} obstacles, ${this.game.collectibles.length} collectibles, ${this.game.portals.length} portals`
                    );
                })) {
                    allLevelsValid = false;
                }
            }
            
            return allLevelsValid;
        });
    }
    
    // Test game lifecycle (complete game, game over)
    testGameLifecycle() {
        return this.runTest("Game Lifecycle", () => {
            // Test game over
            this.game.initGame('shire');
            const initialState = this.game.currentState;
            this.game.gameOver();
            
            const gameOverValid = this.assert(
                this.game.currentState === GAME_STATES.GAME_OVER,
                "Game Over",
                `State changed from ${initialState} to ${this.game.currentState}`
            );
            
            // Test level completion
            this.game.initGame('shire');
            const initialScore = this.game.score;
            this.game.levelComplete();
            
            const victoryValid = this.assert(
                this.game.currentState === GAME_STATES.VICTORY && this.game.score > initialScore,
                "Level Completion",
                `State changed to ${this.game.currentState} and score increased to ${this.game.score}`
            );
            
            return gameOverValid && victoryValid;
        });
    }
    
    // Simulate brief gameplay
    async simulateGameplay() {
        return this.runTest("Gameplay Simulation", async () => {
            this.game.initGame('shire');
            
            const initialLength = this.game.snake.segments.length;
            const initialScore = this.game.score;
            
            // Simulate 5 updates with collectible at snake head
            for (let i = 0; i < 5; i++) {
                const head = this.game.snake.segments[0];
                this.game.collectibles = [new Collectible(head.x, head.y)];
                this.game.update(0.1);
                await new Promise(resolve => setTimeout(resolve, 10));
            }
            
            return this.assert(
                this.game.snake.segments.length > initialLength && this.game.score > initialScore,
                "Game Progress",
                `Snake grew from ${initialLength} to ${this.game.snake.segments.length} segments and score increased from ${initialScore} to ${this.game.score}`
            );
        });
    }
    
    // Run all tests
    async runAllTests() {
        console.log("====== The One Snake - Test Suite ======");
        
        const initialized = await this.initializeGameTest();
        if (!initialized) {
            this.generateTestReport();
            return;
        }
        
        // Core tests
        this.testGameStates();
        this.testSnakeSystem();
        this.testCollisionSystem();
        this.testGameSystems();
        this.testLevelGeneration();
        this.testGameLifecycle();
        
        // Gameplay simulation
        await this.simulateGameplay();
        
        // Generate report
        this.generateTestReport();
    }
    
    // Generate test report
    generateTestReport() {
        const totalTests = this.testsPassed + this.testsFailed;
        const passRate = totalTests > 0 ? (this.testsPassed / totalTests * 100).toFixed(2) : "0.00";
        
        console.log("\n====== TEST REPORT ======");
        console.log(`Tests Run: ${totalTests} | Passed: ${this.testsPassed} | Failed: ${this.testsFailed} | Pass Rate: ${passRate}%`);
        
        // Show failed tests for quick reference
        if (this.testsFailed > 0) {
            console.log("\n====== FAILED TESTS ======");
            this.testResults.filter(r => !r.success).forEach(r => {
                console.log(`❌ ${r.testName}: ${r.message}`);
            });
        }
        
        console.log("\n====== END OF TEST REPORT ======");
    }
}

// Run tests after page load
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => new GameTest().runAllTests(), 1000);
});