// The One Snake - Game Test Suite

// Test class to verify game functionality
class GameTest {
    constructor() {
        this.testResults = [];
        this.testsPassed = 0;
        this.testsFailed = 0;
        this.game = null;
    }

    // Log a test result
    logResult(testName, success, message) {
        const result = {
            testName,
            success,
            message,
            timestamp: new Date().toISOString()
        };
        
        this.testResults.push(result);
        
        if (success) {
            this.testsPassed++;
            console.log(`✅ PASS: ${testName} - ${message}`);
        } else {
            this.testsFailed++;
            console.error(`❌ FAIL: ${testName} - ${message}`);
        }
    }

    // Initialize game for testing
    async initializeGameTest() {
        try {
            // Create a new game instance
            this.game = new Game();
            this.logResult("Game Initialization", true, "Game instance created successfully");
            
            // Wait for resources to load
            await new Promise(resolve => setTimeout(resolve, 500));
            
            return true;
        } catch (error) {
            this.logResult("Game Initialization", false, `Failed to initialize game: ${error.message}`);
            return false;
        }
    }

    // Test game states
    testGameStates() {
        try {
            // Test main menu state
            this.game.setGameState(GAME_STATES.MAIN_MENU);
            const mainMenuActive = document.getElementById(GAME_STATES.MAIN_MENU).classList.contains('active');
            this.logResult("Main Menu State", mainMenuActive, "Main menu state activated");
            
            // Test level select state
            this.game.setGameState(GAME_STATES.LEVEL_SELECT);
            const levelSelectActive = document.getElementById(GAME_STATES.LEVEL_SELECT).classList.contains('active');
            this.logResult("Level Select State", levelSelectActive, "Level select state activated");
            
            // Test pause state
            this.game.setGameState(GAME_STATES.PAUSED);
            const pauseActive = document.getElementById(GAME_STATES.PAUSED).classList.contains('active');
            this.logResult("Pause State", pauseActive, "Pause state activated");
            
            // Test game over state
            this.game.setGameState(GAME_STATES.GAME_OVER);
            const gameOverActive = document.getElementById(GAME_STATES.GAME_OVER).classList.contains('active');
            this.logResult("Game Over State", gameOverActive, "Game over state activated");
            
            // Test victory state
            this.game.setGameState(GAME_STATES.VICTORY);
            const victoryActive = document.getElementById(GAME_STATES.VICTORY).classList.contains('active');
            this.logResult("Victory State", victoryActive, "Victory state activated");
            
            return true;
        } catch (error) {
            this.logResult("Game States Test", false, `State testing failed: ${error.message}`);
            return false;
        }
    }

    // Test snake initialization and movement
    testSnakeSystem() {
        try {
            // Initialize a level
            this.game.initGame('shire');
            
            // Verify snake initialization
            const snakeExists = this.game.snake !== null;
            this.logResult("Snake Initialization", snakeExists, "Snake initialized correctly");
            
            // Test initial snake length
            const correctLength = this.game.snake.segments.length === BASE_SNAKE_LENGTH;
            this.logResult("Snake Initial Length", correctLength, 
                `Snake has correct initial length: ${this.game.snake.segments.length}`);
            
            // Test snake direction change
            const initialDirection = {...this.game.snake.direction};
            
            // Try changing to a valid direction
            this.game.snake.changeDirection(DIRECTIONS.DOWN);
            const directionChanged = this.game.snake.nextDirection === DIRECTIONS.DOWN;
            this.logResult("Snake Direction Change", directionChanged, 
                "Snake direction changed successfully");
            
            // Try changing to an invalid direction (opposite)
            this.game.snake.direction = DIRECTIONS.UP;
            this.game.snake.changeDirection(DIRECTIONS.DOWN);
            const invalidDirectionHandled = this.game.snake.nextDirection !== DIRECTIONS.DOWN;
            this.logResult("Snake Invalid Direction", invalidDirectionHandled, 
                "Snake rejected invalid direction change");
            
            // Test snake growth
            const initialSegmentCount = this.game.snake.segments.length;
            this.game.snake.grow(2);
            const growthCorrect = this.game.snake.growing === 2;
            this.logResult("Snake Growth", growthCorrect, 
                `Snake growth value set correctly: ${this.game.snake.growing}`);
            
            return true;
        } catch (error) {
            this.logResult("Snake System Test", false, `Snake testing failed: ${error.message}`);
            return false;
        }
    }

    // Test level generation
    testLevelGeneration() {
        try {
            // Initialize game with each level and check objects are created
            for (const level of LEVELS) {
                this.game.initGame(level.id);
                
                // Check level ID
                const correctLevel = this.game.currentLevel.id === level.id;
                this.logResult(`Level ${level.id} Initialization`, correctLevel, 
                    `Level ${level.id} initialized correctly`);
                
                // Check obstacles generated
                const obstaclesGenerated = this.game.obstacles.length > 0;
                this.logResult(`Level ${level.id} Obstacles`, obstaclesGenerated, 
                    `${this.game.obstacles.length} obstacles generated in ${level.id}`);
                
                // Check collectibles generated
                const collectiblesGenerated = this.game.collectibles.length > 0;
                this.logResult(`Level ${level.id} Collectibles`, collectiblesGenerated, 
                    `${this.game.collectibles.length} collectibles generated in ${level.id}`);
                
                // Check portals generated
                const portalsGenerated = this.game.portals.length > 0;
                this.logResult(`Level ${level.id} Portals`, portalsGenerated, 
                    `${this.game.portals.length} portals generated in ${level.id}`);
            }
            
            return true;
        } catch (error) {
            this.logResult("Level Generation Test", false, `Level testing failed: ${error.message}`);
            return false;
        }
    }

    // Test collision detection
    testCollisionSystem() {
        try {
            this.game.initGame('shire');
            
            // Create test objects at specific positions
            const testObstacle = new Obstacle(10, 10, 'rocks');
            this.game.obstacles = [testObstacle];
            
            const testCollectible = new Collectible(12, 12);
            this.game.collectibles = [testCollectible];
            
            const exitPortal = new Portal(16, 16, 'PALANTIR');
            const entrancePortal = new Portal(14, 14, 'PALANTIR', exitPortal);
            this.game.portals = [entrancePortal, exitPortal];
            
            const testHorse = new Horse(18, 18, 'SHADOWFAX');
            this.game.horses = [testHorse];
            
            // Position snake head
            this.game.snake.segments[0] = { x: 10, y: 10 };
            
            // Test obstacle collision
            const obstacleCollision = this.game.snake.checkCollision(testObstacle);
            this.logResult("Obstacle Collision", obstacleCollision, 
                "Obstacle collision detected correctly");
            
            // Reposition snake head to test collectible
            this.game.snake.segments[0] = { x: 12, y: 12 };
            
            // Test collectible collision
            const collectibleCollision = this.game.snake.checkCollision(testCollectible);
            this.logResult("Collectible Collision", collectibleCollision, 
                "Collectible collision detected correctly");
            
            // Reposition snake head to test portal
            this.game.snake.segments[0] = { x: 14, y: 14 };
            
            // Test portal collision
            const portalCollision = this.game.snake.checkCollision(entrancePortal);
            this.logResult("Portal Collision", portalCollision, 
                "Portal collision detected correctly");
            
            // Reposition snake head to test horse
            this.game.snake.segments[0] = { x: 18, y: 18 };
            
            // Test horse collision
            const horseCollision = this.game.snake.checkCollision(testHorse);
            this.logResult("Horse Collision", horseCollision, 
                "Horse collision detected correctly");
            
            return true;
        } catch (error) {
            this.logResult("Collision System Test", false, `Collision testing failed: ${error.message}`);
            return false;
        }
    }

    // Test fire abilities
    testFireAbilities() {
        try {
            this.game.initGame('shire');
            
            // Set fire meter to max
            this.game.fireMeter = FIRE_METER_MAX;
            
            // Test each ability
            const abilities = ['FLAME_BREATH', 'FIRE_SHIELD', 'BURNING_TRAIL', 'INFERNO_BURST'];
            
            // Give snake access to all abilities
            this.game.currentTransformationStage = TRANSFORMATION_STAGES.length - 1;
            this.game.snake.applyTransformation(TRANSFORMATION_STAGES[this.game.currentTransformationStage]);
            
            for (const ability of abilities) {
                // Reset cooldowns
                this.game.fireAbilities.cooldowns[ability] = 0;
                
                // Activate ability
                const activated = this.game.fireAbilities.activateAbility(
                    ability, 
                    this.game.snake.segments[0], 
                    this.game.snake.direction
                );
                
                // Check if cooldown was applied
                const cooldownApplied = this.game.fireAbilities.cooldowns[ability] > 0;
                
                // Check if fire meter was reduced
                const fireReduced = this.game.fireMeter < FIRE_METER_MAX;
                
                this.logResult(`${ability} Activation`, activated && cooldownApplied && fireReduced, 
                    `${ability} activated: ${activated}, cooldown applied: ${cooldownApplied}, ` +
                    `fire meter reduced: ${fireReduced}`);
            }
            
            return true;
        } catch (error) {
            this.logResult("Fire Abilities Test", false, `Fire abilities testing failed: ${error.message}`);
            return false;
        }
    }

    // Test transformation system
    testTransformationSystem() {
        try {
            this.game.initGame('shire');
            
            // Test each transformation stage
            for (let i = 0; i < TRANSFORMATION_STAGES.length; i++) {
                // Set collectibles to trigger transformation
                this.game.collectiblesObtained = TRANSFORMATION_STAGES[i].requiredItems;
                
                // Check transformation
                this.game.checkTransformation();
                
                // Verify transformation stage
                const stageCorrect = this.game.currentTransformationStage === i;
                this.logResult(`Transformation Stage ${i}`, stageCorrect, 
                    `Transformation to stage ${i} (${TRANSFORMATION_STAGES[i].name}) ` + 
                    `${stageCorrect ? 'succeeded' : 'failed'}`);
            }
            
            return true;
        } catch (error) {
            this.logResult("Transformation System Test", false, `Transformation testing failed: ${error.message}`);
            return false;
        }
    }

    // Test portal system
    testPortalSystem() {
        try {
            this.game.initGame('shire');
            
            // Create test portal pair
            const exitPos = { x: 15, y: 15 };
            const exitPortal = new Portal(exitPos.x, exitPos.y, 'PALANTIR');
            const entrancePortal = new Portal(5, 5, 'PALANTIR', exitPortal);
            
            this.game.portals = [entrancePortal, exitPortal];
            
            // Position snake at entrance portal
            this.game.snake.segments[0] = { x: 5, y: 5 };
            
            // Simulate teleportation
            const teleportPos = entrancePortal.teleport();
            
            // Verify teleport position
            const positionCorrect = teleportPos.x === exitPos.x && teleportPos.y === exitPos.y;
            this.logResult("Portal Teleportation", positionCorrect, 
                `Portal teleported to correct position: (${teleportPos.x}, ${teleportPos.y})`);
            
            // Verify portal cooldown
            const cooldownApplied = !entrancePortal.isActive && !exitPortal.isActive;
            this.logResult("Portal Cooldown", cooldownApplied, 
                "Portal cooldown correctly applied to both portals");
            
            return true;
        } catch (error) {
            this.logResult("Portal System Test", false, `Portal testing failed: ${error.message}`);
            return false;
        }
    }

    // Test horse system
    testHorseSystem() {
        try {
            this.game.initGame('shire');
            
            // Test each horse type
            for (const horseType of Object.keys(HORSE_TYPES)) {
                // Create test horse
                const testHorse = new Horse(10, 10, horseType);
                this.game.horses = [testHorse];
                
                // Position snake at horse
                this.game.snake.segments[0] = { x: 10, y: 10 };
                
                // Simulate collision
                this.game.handleHorseCollision(testHorse);
                
                // Check effect based on horse type
                let effectApplied = false;
                
                switch (testHorse.effect) {
                    case 'speed_boost':
                        effectApplied = this.game.activeEffects.speedBoost.active;
                        break;
                    case 'transform_boost':
                        effectApplied = this.game.collectiblesObtained > 0;
                        break;
                    case 'drop_treasures':
                        effectApplied = this.game.collectibles.length > 0;
                        break;
                    default:
                        effectApplied = true; // For horses without measurable effects
                }
                
                // Verify effect
                this.logResult(`${horseType} Effect`, effectApplied, 
                    `${horseType} effect (${testHorse.effect}) applied correctly`);
            }
            
            return true;
        } catch (error) {
            this.logResult("Horse System Test", false, `Horse testing failed: ${error.message}`);
            return false;
        }
    }

    // Test particle system
    testParticleSystem() {
        try {
            this.game.initGame('shire');
            
            // Test each particle type
            const particleTypes = Object.keys(PARTICLE_TYPES);
            
            for (const type of particleTypes) {
                // Clear existing particles
                this.game.particles.clear();
                
                // Create particle effect
                this.game.particles.createParticleEffect(
                    type, 
                    10, 
                    10, 
                    { x: 0, y: 0 }, 
                    0.5
                );
                
                // Check if particles were created
                const particlesCreated = this.game.particles.particles.length > 0;
                this.logResult(`${type} Particles`, particlesCreated, 
                    `${particlesCreated ? this.game.particles.particles.length : 0} ${type} particles created`);
                
                // Test particle update
                const initialCount = this.game.particles.particles.length;
                this.game.particles.update(2.0); // Update with large delta to expire particles
                const particlesUpdated = this.game.particles.particles.length <= initialCount;
                
                this.logResult(`${type} Particle Updates`, particlesUpdated, 
                    `${type} particles correctly updated/expired`);
            }
            
            return true;
        } catch (error) {
            this.logResult("Particle System Test", false, `Particle testing failed: ${error.message}`);
            return false;
        }
    }

    // Test game over condition
    testGameOverCondition() {
        try {
            this.game.initGame('shire');
            
            // Force game over
            this.game.gameOver();
            
            // Check state
            const gameOverState = this.game.currentState === GAME_STATES.GAME_OVER;
            this.logResult("Game Over Condition", gameOverState, 
                "Game over state activated correctly");
            
            return true;
        } catch (error) {
            this.logResult("Game Over Test", false, `Game over testing failed: ${error.message}`);
            return false;
        }
    }

    // Test level completion
    testLevelCompletion() {
        try {
            this.game.initGame('shire');
            
            // Force level completion
            this.game.levelComplete();
            
            // Check state
            const victoryState = this.game.currentState === GAME_STATES.VICTORY;
            this.logResult("Level Completion", victoryState, 
                "Victory state activated correctly");
            
            return true;
        } catch (error) {
            this.logResult("Level Completion Test", false, `Level completion testing failed: ${error.message}`);
            return false;
        }
    }

    // Run a simulated game for a few updates
    async simulateGameplay() {
        try {
            this.game.initGame('shire');
            
            // Store initial state for comparison
            const initialSnakeLength = this.game.snake.segments.length;
            const initialScore = this.game.score;
            
            // Run several update cycles
            for (let i = 0; i < 10; i++) {
                // Simulate collectible collection by placing one at snake's head
                const head = this.game.snake.segments[0];
                this.game.collectibles = [new Collectible(head.x, head.y)];
                
                // Perform an update
                this.game.update(0.1);
                
                await new Promise(resolve => setTimeout(resolve, 50));
            }
            
            // Check if game state changed as expected
            const snakeGrew = this.game.snake.segments.length > initialSnakeLength;
            const scoreIncreased = this.game.score > initialScore;
            
            this.logResult("Gameplay Simulation", snakeGrew && scoreIncreased, 
                `Snake grew: ${snakeGrew}, Score increased: ${scoreIncreased}`);
            
            return true;
        } catch (error) {
            this.logResult("Gameplay Simulation", false, `Simulation failed: ${error.message}`);
            return false;
        }
    }

    // Run all tests
    async runAllTests() {
        console.log("====== The One Snake - Test Suite ======");
        console.log(`Starting tests at ${new Date().toISOString()}`);
        
        const initialized = await this.initializeGameTest();
        if (!initialized) {
            this.generateTestReport();
            return;
        }
        
        // Run tests
        this.testGameStates();
        this.testSnakeSystem();
        this.testLevelGeneration();
        this.testCollisionSystem();
        this.testFireAbilities();
        this.testTransformationSystem();
        this.testPortalSystem();
        this.testHorseSystem();
        this.testParticleSystem();
        this.testGameOverCondition();
        this.testLevelCompletion();
        
        // Run gameplay simulation
        await this.simulateGameplay();
        
        // Generate report
        this.generateTestReport();
    }

    // Generate plaintext test report
    generateTestReport() {
        const totalTests = this.testsPassed + this.testsFailed;
        const passRate = (this.testsPassed / totalTests * 100).toFixed(2);
        
        let report = "====== THE ONE SNAKE - TEST REPORT ======\n\n";
        report += `Test Date: ${new Date().toLocaleString()}\n`;
        report += `Tests Run: ${totalTests}\n`;
        report += `Tests Passed: ${this.testsPassed}\n`;
        report += `Tests Failed: ${this.testsFailed}\n`;
        report += `Pass Rate: ${passRate}%\n\n`;
        
        report += "====== DETAILED TEST RESULTS ======\n\n";
        
        // Group tests by category
        const categories = {};
        
        for (const result of this.testResults) {
            const category = result.testName.split(' ')[0];
            if (!categories[category]) {
                categories[category] = [];
            }
            categories[category].push(result);
        }
        
        // Add each category to report
        for (const category in categories) {
            report += `=== ${category} Tests ===\n`;
            
            for (const result of categories[category]) {
                const status = result.success ? "PASS" : "FAIL";
                report += `${status}: ${result.testName} - ${result.message}\n`;
            }
            
            report += "\n";
        }
        
        report += "====== END OF TEST REPORT ======";
        
        console.log(report);
        
        // In a real environment, you might want to save this report to a file
        return report;
    }
}

// Run the tests when script is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Wait a moment for game resources to load
    setTimeout(() => {
        const tester = new GameTest();
        tester.runAllTests();
    }, 1000);
});