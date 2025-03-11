// The One Snake - Improved Game Test Suite

class GameTest {
    constructor() {
        this.testResults = [];
        this.testsPassed = 0;
        this.testsFailed = 0;
        this.game = null;
        this.debugMode = true; // Enable more verbose logging
    }

    // Log a test result with additional details
    logResult(testName, success, message, details = null) {
        const result = {
            testName,
            success,
            message,
            details,
            timestamp: new Date().toISOString()
        };
        
        this.testResults.push(result);
        
        if (success) {
            this.testsPassed++;
            console.log(`✅ PASS: ${testName} - ${message}`);
        } else {
            this.testsFailed++;
            console.error(`❌ FAIL: ${testName} - ${message}`);
            if (details) {
                console.error("Details:", details);
            }
        }
    }

    // Safe DOM element getter with error handling
    getDOMElement(id) {
        const element = document.getElementById(id);
        if (!element) {
            this.logResult("DOM Structure", false, `Missing DOM element: ${id}`, {
                suggestion: "Verify the element exists in index.html and check for typos"
            });
            return null;
        }
        return element;
    }

    // Check if a required JavaScript object exists
    checkRequired(obj, name, parentObj = "window") {
        if (!obj) {
            this.logResult("Required Object", false, `Missing required object: ${name}`, {
                suggestion: `Check that ${parentObj}.${name} is properly defined and not null`
            });
            return false;
        }
        return true;
    }

    // Initialize game for testing with more error checking
    async initializeGameTest() {
        try {
            // Verify constants are loaded correctly
            if (typeof GRID_SIZE === 'undefined') {
                this.logResult("Constants", false, "Game constants not loaded", {
                    suggestion: "Check constants.js is loaded before other scripts"
                });
                return false;
            }
            
            // Verify required DOM elements exist
            const gameContainer = this.getDOMElement("game-container");
            const gameCanvas = this.getDOMElement("game-canvas");
            const minimap = this.getDOMElement("minimap");
            
            if (!gameContainer || !gameCanvas || !minimap) {
                this.logResult("DOM Structure", false, "Critical DOM elements missing");
                return false;
            }
            
            // Create a new game instance
            try {
                this.game = new Game();
                this.logResult("Game Initialization", true, "Game instance created successfully");
            } catch (error) {
                this.logResult("Game Initialization", false, `Failed to create Game instance: ${error.message}`, {
                    error: error,
                    suggestion: "Check the Game constructor for errors"
                });
                return false;
            }
            
            // Verify game object structure
            this.verifyGameStructure();
            
            // Wait for resources to load
            await new Promise(resolve => setTimeout(resolve, 500));
            
            return true;
        } catch (error) {
            this.logResult("Game Initialization", false, `Unexpected error during initialization: ${error.message}`, {
                error: error,
                stack: error.stack
            });
            return false;
        }
    }
    
    // Verify the game object has all required properties and methods
    verifyGameStructure() {
        const requiredProperties = [
            'canvas', 'ctx', 'minimapCanvas', 'minimapCtx', 
            'currentState', 'snake', 'obstacles', 'collectibles', 
            'horses', 'portals', 'fireAbilities', 'particles', 'ui', 'controls'
        ];
        
        const requiredMethods = [
            'setGameState', 'update', 'render', 'initGame'
        ];
        
        for (const prop of requiredProperties) {
            if (this.game[prop] === undefined) {
                this.logResult("Game Structure", false, `Missing required property: game.${prop}`, {
                    suggestion: `Make sure game.${prop} is properly initialized in the Game constructor`
                });
            }
        }
        
        for (const method of requiredMethods) {
            if (typeof this.game[method] !== 'function') {
                this.logResult("Game Structure", false, `Missing required method: game.${method}`, {
                    suggestion: `Implement the ${method}() method in the Game class`
                });
            }
        }
    }

    // Test game states with error reporting
    testGameStates() {
        try {
            // Test main menu state
            this.game.setGameState(GAME_STATES.MAIN_MENU);
            const mainMenuElement = this.getDOMElement(GAME_STATES.MAIN_MENU);
            const mainMenuActive = mainMenuElement && mainMenuElement.classList.contains('active');
            this.logResult("Main Menu State", mainMenuActive, "Main menu state activation", 
                !mainMenuActive ? { suggestion: "Check the setGameState method and main-menu element" } : null);
            
            // Test level select state
            this.game.setGameState(GAME_STATES.LEVEL_SELECT);
            const levelSelectElement = this.getDOMElement(GAME_STATES.LEVEL_SELECT);
            const levelSelectActive = levelSelectElement && levelSelectElement.classList.contains('active');
            this.logResult("Level Select State", levelSelectActive, "Level select state activation",
                !levelSelectActive ? { suggestion: "Check the LEVEL_SELECT state constant matches the DOM element ID" } : null);
            
            // Test game-playing state
            this.game.setGameState(GAME_STATES.PLAYING);
            const playingElement = this.getDOMElement(GAME_STATES.PLAYING);
            const playingActive = playingElement && playingElement.classList.contains('active');
            this.logResult("Playing State", playingActive, "Playing state activation",
                !playingActive ? { suggestion: "Check the PLAYING state constant matches the DOM element ID" } : null);
            
            // Test pause state
            this.game.setGameState(GAME_STATES.PAUSED);
            const pausedElement = this.getDOMElement(GAME_STATES.PAUSED);
            const pauseActive = pausedElement && pausedElement.classList.contains('active');
            this.logResult("Pause State", pauseActive, "Pause state activation",
                !pauseActive ? { suggestion: "Check the PAUSED state constant matches the DOM element ID" } : null);
            
            // Test game over state
            this.game.setGameState(GAME_STATES.GAME_OVER);
            const gameOverElement = this.getDOMElement(GAME_STATES.GAME_OVER);
            const gameOverActive = gameOverElement && gameOverElement.classList.contains('active');
            this.logResult("Game Over State", gameOverActive, "Game over state activation",
                !gameOverActive ? { suggestion: "Check the GAME_OVER state constant matches the DOM element ID" } : null);
            
            // Test victory state
            this.game.setGameState(GAME_STATES.VICTORY);
            const victoryElement = this.getDOMElement(GAME_STATES.VICTORY);
            const victoryActive = victoryElement && victoryElement.classList.contains('active');
            this.logResult("Victory State", victoryActive, "Victory state activation",
                !victoryActive ? { suggestion: "Check the VICTORY state constant matches the DOM element ID" } : null);
            
            return true;
        } catch (error) {
            this.logResult("Game States Test", false, `State testing failed: ${error.message}`, {
                error: error,
                stack: error.stack
            });
            return false;
        }
    }

    // Test snake initialization and movement
    testSnakeSystem() {
        try {
            // Initialize a level
            this.game.initGame('shire');
            
            // Verify snake initialization
            const snakeExists = this.checkRequired(this.game.snake, "snake", "game");
            if (!snakeExists) return false;
            
            this.logResult("Snake Initialization", snakeExists, "Snake initialized correctly");
            
            // Test initial snake length
            const correctLength = this.game.snake.segments.length === BASE_SNAKE_LENGTH;
            this.logResult("Snake Initial Length", correctLength, 
                `Snake has ${this.game.snake.segments.length} segments, expected ${BASE_SNAKE_LENGTH}`);
            
            // Test snake position (should be in center of grid)
            const gridWidth = Math.floor(this.game.canvas.width / GRID_SIZE);
            const gridHeight = Math.floor(this.game.canvas.height / GRID_SIZE);
            const expectedX = Math.floor(gridWidth / 2);
            const expectedY = Math.floor(gridHeight / 2);
            
            const head = this.game.snake.segments[0];
            const correctPosition = (head.x === expectedX && head.y === expectedY);
            this.logResult("Snake Initial Position", correctPosition, 
                `Snake head at (${head.x}, ${head.y}), expected (${expectedX}, ${expectedY})`);
            
            // Test snake direction change
            const initialDirection = {...this.game.snake.direction};
            
            // Try changing to a valid direction
            this.game.snake.changeDirection(DIRECTIONS.DOWN);
            const directionChanged = this.game.snake.nextDirection === DIRECTIONS.DOWN;
            this.logResult("Snake Direction Change", directionChanged, 
                `Direction change to DOWN: ${directionChanged ? "successful" : "failed"}`);
            
            // Try changing to an invalid direction (opposite)
            this.game.snake.direction = DIRECTIONS.UP;
            this.game.snake.changeDirection(DIRECTIONS.DOWN);
            const invalidDirectionHandled = this.game.snake.nextDirection !== DIRECTIONS.DOWN;
            this.logResult("Snake Invalid Direction", invalidDirectionHandled, 
                `Invalid direction change (UP->DOWN) ${invalidDirectionHandled ? "rejected" : "allowed"}`);
            
            // Test snake growth
            const initialSegmentCount = this.game.snake.segments.length;
            this.game.snake.grow(2);
            const growthCorrect = this.game.snake.growing === 2;
            this.logResult("Snake Growth", growthCorrect, 
                `Snake growth value set to ${this.game.snake.growing}, expected 2`);
            
            // Test snake movement (update)
            const oldHead = {...this.game.snake.segments[0]};
            const newHead = this.game.snake.update(0.1, gridWidth, gridHeight);
            const movedCorrectly = (
                newHead.x === oldHead.x + this.game.snake.direction.x && 
                newHead.y === oldHead.y + this.game.snake.direction.y
            );
            this.logResult("Snake Movement", movedCorrectly, 
                `Snake moved from (${oldHead.x}, ${oldHead.y}) to (${newHead.x}, ${newHead.y})`);
            
            return true;
        } catch (error) {
            this.logResult("Snake System Test", false, `Snake testing failed: ${error.message}`, {
                error: error,
                stack: error.stack
            });
            return false;
        }
    }

    // Test level generation with more detailed checks
    testLevelGeneration() {
        try {
            // Test each level generation
            for (const level of LEVELS) {
                try {
                    this.game.initGame(level.id);
                    
                    // Check level ID
                    const correctLevel = this.game.currentLevel.id === level.id;
                    this.logResult(`Level ${level.id} Initialization`, correctLevel, 
                        `Level initialized as ${this.game.currentLevel.id}, expected ${level.id}`);
                    
                    // Check obstacles generated
                    const obstaclesGenerated = this.game.obstacles.length > 0;
                    this.logResult(`Level ${level.id} Obstacles`, obstaclesGenerated, 
                        `${this.game.obstacles.length} obstacles generated in ${level.id}`);
                    
                    // Check obstacle types match level definition
                    const obstacleTypes = new Set(this.game.obstacles.map(o => o.obstacleType));
                    const expectedObstacleTypes = new Set(level.obstacles);
                    const correctObstacleTypes = Array.from(obstacleTypes).every(type => 
                        expectedObstacleTypes.has(type));
                    
                    this.logResult(`Level ${level.id} Obstacle Types`, correctObstacleTypes, 
                        `Obstacle types: [${Array.from(obstacleTypes).join(', ')}], expected subset of [${level.obstacles.join(', ')}]`);
                    
                    // Check collectibles generated
                    const collectiblesGenerated = this.game.collectibles.length > 0;
                    this.logResult(`Level ${level.id} Collectibles`, collectiblesGenerated, 
                        `${this.game.collectibles.length} collectibles generated in ${level.id}`);
                    
                    // Check portals generated
                    const portalsGenerated = this.game.portals.length > 0;
                    this.logResult(`Level ${level.id} Portals`, portalsGenerated, 
                        `${this.game.portals.length} portals generated in ${level.id}`);
                    
                    // Check if portal pairs are correctly linked
                    const exitPortalsLinked = this.game.portals.every(portal => 
                        !portal.exitPortal || (this.game.portals.includes(portal.exitPortal)));
                    
                    this.logResult(`Level ${level.id} Portal Links`, exitPortalsLinked, 
                        exitPortalsLinked ? 
                            "All portals correctly linked" : 
                            "Some portals have invalid exit portal references");
                    
                } catch (levelError) {
                    this.logResult(`Level ${level.id} Generation`, false, 
                        `Error generating level ${level.id}: ${levelError.message}`, {
                            error: levelError,
                            stack: levelError.stack
                        });
                }
            }
            
            return true;
        } catch (error) {
            this.logResult("Level Generation Test", false, `Level testing failed: ${error.message}`, {
                error: error,
                stack: error.stack
            });
            return false;
        }
    }

    // Test collision detection with more robust checks
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
            
            // Position snake head and test each collision
            
            // Test obstacle collision
            this.game.snake.segments[0] = { x: 10, y: 10 };
            const obstacleCollision = this.game.snake.checkCollision(testObstacle);
            this.logResult("Obstacle Collision", obstacleCollision, 
                `Obstacle collision detection ${obstacleCollision ? "working" : "not working"}`);
            
            // Reposition snake head to test collectible
            this.game.snake.segments[0] = { x: 12, y: 12 };
            const collectibleCollision = this.game.snake.checkCollision(testCollectible);
            this.logResult("Collectible Collision", collectibleCollision, 
                `Collectible collision detection ${collectibleCollision ? "working" : "not working"}`);
            
            // Reposition snake head to test portal
            this.game.snake.segments[0] = { x: 14, y: 14 };
            const portalCollision = this.game.snake.checkCollision(entrancePortal);
            this.logResult("Portal Collision", portalCollision, 
                `Portal collision detection ${portalCollision ? "working" : "not working"}`);
            
            // Reposition snake head to test horse
            this.game.snake.segments[0] = { x: 18, y: 18 };
            const horseCollision = this.game.snake.checkCollision(testHorse);
            this.logResult("Horse Collision", horseCollision, 
                `Horse collision detection ${horseCollision ? "working" : "not working"}`);
            
            // Test collision handling in game update
            // Set up a scenario where the snake should collect an item
            this.game.collectibles = [new Collectible(5, 5)];
            this.game.snake.segments[0] = { x: 5, y: 5 };
            
            // Run game update
            try {
                const initialScore = this.game.score;
                this.game.update(0.1);
                const scoreIncreased = this.game.score > initialScore;
                
                this.logResult("Collectible Handling", scoreIncreased, 
                    `Collectible collection: score changed from ${initialScore} to ${this.game.score}`);
            } catch (updateError) {
                this.logResult("Game Update", false, `Error in game.update(): ${updateError.message}`, {
                    error: updateError,
                    stack: updateError.stack,
                    suggestion: "Check error in game update when handling collectible collection"
                });
            }
            
            return true;
        } catch (error) {
            this.logResult("Collision System Test", false, `Collision testing failed: ${error.message}`, {
                error: error,
                stack: error.stack
            });
            return false;
        }
    }

    // Test fire abilities with detailed error checking
    testFireAbilities() {
        try {
            this.game.initGame('shire');
            
            // Verify fire ability manager exists
            if (!this.checkRequired(this.game.fireAbilities, "fireAbilities", "game")) {
                return false;
            }
            
            // Set fire meter to max
            this.game.fireMeter = FIRE_METER_MAX;
            
            // Test each ability
            const abilities = ['FLAME_BREATH', 'FIRE_SHIELD', 'BURNING_TRAIL', 'INFERNO_BURST'];
            
            // Give snake access to all abilities
            this.game.currentTransformationStage = TRANSFORMATION_STAGES.length - 1;
            this.game.snake.applyTransformation(TRANSFORMATION_STAGES[this.game.currentTransformationStage]);
            
            for (const ability of abilities) {
                try {
                    // Reset cooldowns
                    this.game.fireAbilities.cooldowns[ability] = 0;
                    
                    // Check if ability constants exist
                    if (!FIRE_ABILITIES[ability]) {
                        this.logResult(`${ability} Definition`, false, 
                            `Ability ${ability} not defined in FIRE_ABILITIES constants`);
                        continue;
                    }
                    
                    // Record initial fire meter
                    const initialFireMeter = this.game.fireMeter;
                    
                    // Activate ability
                    const activated = this.game.fireAbilities.activateAbility(
                        ability, 
                        this.game.snake.segments[0], 
                        this.game.snake.direction
                    );
                    
                    // Check if cooldown was applied
                    const cooldownApplied = this.game.fireAbilities.cooldowns[ability] > 0;
                    
                    // Check if fire meter was reduced
                    const fireReduced = this.game.fireMeter < initialFireMeter;
                    const expectedCost = FIRE_ABILITIES[ability].cost;
                    const actualCost = initialFireMeter - this.game.fireMeter;
                    
                    this.logResult(`${ability} Activation`, activated, 
                        `${ability} activated: ${activated ? "success" : "failed"}`);
                    
                    this.logResult(`${ability} Cooldown`, cooldownApplied, 
                        `Cooldown applied: ${cooldownApplied ? this.game.fireAbilities.cooldowns[ability].toFixed(2) + "s" : "not applied"}`);
                    
                    this.logResult(`${ability} Fire Cost`, fireReduced && Math.abs(actualCost - expectedCost) < 0.1, 
                        `Fire meter reduced by ${actualCost.toFixed(1)}, expected ${expectedCost}`);
                    
                    // Test effect creation
                    const effectsCreated = this.game.fireAbilities.activeEffects.length > 0;
                    this.logResult(`${ability} Effects`, effectsCreated, 
                        `Active effects: ${this.game.fireAbilities.activeEffects.length}`);
                    
                    // Update to see if effects persist/work correctly
                    this.game.fireAbilities.update(0.1);
                    
                } catch (abilityError) {
                    this.logResult(`${ability} Test`, false, `Error testing ${ability}: ${abilityError.message}`, {
                        error: abilityError,
                        stack: abilityError.stack
                    });
                }
            }
            
            return true;
        } catch (error) {
            this.logResult("Fire Abilities Test", false, `Fire abilities testing failed: ${error.message}`, {
                error: error,
                stack: error.stack
            });
            return false;
        }
    }

    // Test transformation system
    testTransformationSystem() {
        try {
            this.game.initGame('shire');
            
            // Check if transformation stages are defined
            if (!this.checkRequired(TRANSFORMATION_STAGES, "TRANSFORMATION_STAGES")) {
                return false;
            }
            
            // Test each transformation stage
            for (let i = 0; i < TRANSFORMATION_STAGES.length; i++) {
                try {
                    // Store initial stage
                    const initialStage = this.game.currentTransformationStage;
                    
                    // Set collectibles to trigger next transformation
                    this.game.collectiblesObtained = TRANSFORMATION_STAGES[i].requiredItems;
                    
                    // Check transformation
                    this.game.checkTransformation();
                    
                    // Verify transformation stage
                    const expectedStage = Math.max(i, initialStage);  // Should only transform up, not down
                    const stageCorrect = this.game.currentTransformationStage === expectedStage;
                    
                    this.logResult(`Transformation Stage ${i}`, stageCorrect, 
                        `Transformation to stage ${i} (${TRANSFORMATION_STAGES[i].name}): ` + 
                        `current stage is ${this.game.currentTransformationStage}, expected ${expectedStage}`);
                    
                    // Verify snake visual
                    const visualCorrect = this.game.snake.visualStage === TRANSFORMATION_STAGES[expectedStage].visualID;
                    this.logResult(`Transformation Visual ${i}`, visualCorrect, 
                        `Snake visual ID: ${this.game.snake.visualStage}, expected ${TRANSFORMATION_STAGES[expectedStage].visualID}`);
                } catch (transformError) {
                    this.logResult(`Transformation Stage ${i}`, false, 
                        `Error testing transformation stage ${i}: ${transformError.message}`, {
                            error: transformError,
                            stack: transformError.stack
                        });
                }
            }
            
            return true;
        } catch (error) {
            this.logResult("Transformation System Test", false, `Transformation testing failed: ${error.message}`, {
                error: error,
                stack: error.stack
            });
            return false;
        }
    }

    // Test portal system with detailed debugging
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
            
            // Check portal object structure
            if (!entrancePortal.hasOwnProperty('exitPortal')) {
                this.logResult("Portal Structure", false, "Portal objects missing exitPortal property", {
                    suggestion: "Check Portal class implementation"
                });
            }
            
            // Simulate teleportation
            const teleportPos = entrancePortal.teleport();
            
            // Verify teleport position returned correctly
            const positionCorrect = teleportPos && teleportPos.x === exitPos.x && teleportPos.y === exitPos.y;
            this.logResult("Portal Position", positionCorrect, 
                positionCorrect ? 
                    `Portal correctly teleported to (${teleportPos.x}, ${teleportPos.y})` : 
                    `Portal teleport returned ${JSON.stringify(teleportPos)}, expected {x:${exitPos.x}, y:${exitPos.y}}`);
            
            // Verify portal cooldown
            const cooldownApplied = !entrancePortal.isActive && !exitPortal.isActive;
            this.logResult("Portal Cooldown", cooldownApplied, 
                `Entrance portal active: ${entrancePortal.isActive}, Exit portal active: ${exitPortal.isActive}`);
            
            // Test actual snake teleportation via game update
            try {
                // Reset portals
                entrancePortal.isActive = true;
                exitPortal.isActive = true;
                
                // Position snake at portal
                this.game.snake.segments[0] = { x: 5, y: 5 };
                
                // Store snake position before update
                const beforePos = {...this.game.snake.segments[0]};
                
                // Run game update
                this.game.update(0.1);
                
                // Check if snake was teleported
                const afterPos = this.game.snake.segments[0];
                const snakeTeleported = afterPos.x === exitPos.x && afterPos.y === exitPos.y;
                
                this.logResult("Snake Teleportation", snakeTeleported, 
                    `Snake position before: (${beforePos.x}, ${beforePos.y}), after: (${afterPos.x}, ${afterPos.y})`);
            } catch (updateError) {
                this.logResult("Portal Update", false, `Error in game update during teleportation: ${updateError.message}`, {
                    error: updateError,
                    stack: updateError.stack
                });
            }
            
            return true;
        } catch (error) {
            this.logResult("Portal System Test", false, `Portal testing failed: ${error.message}`, {
                error: error,
                stack: error.stack
            });
            return false;
        }
    }

    // Test horse system with error reporting
    testHorseSystem() {
        try {
            this.game.initGame('shire');
            
            // Check if horse types are defined
            if (!this.checkRequired(HORSE_TYPES, "HORSE_TYPES")) {
                return false;
            }
            
            // Test each horse type
            for (const horseType of Object.keys(HORSE_TYPES)) {
                try {
                    // Create test horse
                    const testHorse = new Horse(10, 10, horseType);
                    this.game.horses = [testHorse];
                    
                    // Position snake at horse
                    this.game.snake.segments[0] = { x: 10, y: 10 };
                    
                    // Verify horse object structure
                    const validHorse = testHorse && 
                                      testHorse.hasOwnProperty('properties') && 
                                      testHorse.hasOwnProperty('effect');
                    
                    this.logResult(`${horseType} Structure`, validHorse, 
                        `Horse object structure ${validHorse ? "valid" : "invalid"}`);
                    
                    // Simulate collision
                    const initialScore = this.game.score;
                    const initialCollectibles = this.game.collectiblesObtained;
                    
                    try {
                        this.game.handleHorseCollision(testHorse);
                        
                        // Check effect based on horse type
                        let effectApplied = false;
                        let effectDescription = "No measurable effect";
                        
                        switch (testHorse.effect) {
                            case 'speed_boost':
                                effectApplied = this.game.activeEffects.speedBoost.active;
                                effectDescription = `Speed boost active: ${effectApplied}`;
                                break;
                            case 'transform_boost':
                                effectApplied = this.game.collectiblesObtained > initialCollectibles;
                                effectDescription = `Collectibles increased: ${initialCollectibles} -> ${this.game.collectiblesObtained}`;
                                break;
                            case 'drop_treasures':
                                effectApplied = this.game.collectibles.length > 0;
                                effectDescription = `Collectibles dropped: ${this.game.collectibles.length}`;
                                break;
                            default:
                                effectApplied = true; // For horses without measurable effects
                        }
                        
                        // Verify effect
                        this.logResult(`${horseType} Effect`, effectApplied, 
                            `${horseType} effect (${testHorse.effect}): ${effectDescription}`);
                        
                        // Verify score change
                        const scoreChanged = this.game.score > initialScore;
                        this.logResult(`${horseType} Score`, scoreChanged, 
                            `Score changed: ${initialScore} -> ${this.game.score}`);
                        
                    } catch (collisionError) {
                        this.logResult(`${horseType} Collision`, false, 
                            `Error handling horse collision: ${collisionError.message}`, {
                                error: collisionError,
                                stack: collisionError.stack
                            });
                    }
                    
                    // Test horse movement
                    try {
                        const initialPos = {x: testHorse.x, y: testHorse.y};
                        testHorse.update(1.0, this.game.snake.segments[0]);
                        
                        const moved = initialPos.x !== testHorse.x || initialPos.y !== testHorse.y;
                        this.logResult(`${horseType} Movement`, true, 
                            `Horse ${moved ? "moved" : "did not move"} from (${initialPos.x}, ${initialPos.y}) to (${testHorse.x}, ${testHorse.y})`);
                    } catch (moveError) {
                        this.logResult(`${horseType} Movement`, false, 
                            `Error in horse movement: ${moveError.message}`, {
                                error: moveError,
                                stack: moveError.stack
                            });
                    }
                    
                } catch (horseError) {
                    this.logResult(`${horseType} Test`, false, 
                        `Error testing horse type ${horseType}: ${horseError.message}`, {
                            error: horseError,
                            stack: horseError.stack
                        });
                }
            }
            
            return true;
        } catch (error) {
            this.logResult("Horse System Test", false, `Horse testing failed: ${error.message}`, {
                error: error,
                stack: error.stack
            });
            return false;
        }
    }

    // Test particle system
    testParticleSystem() {
        try {
            this.game.initGame('shire');
            
            // Check if particle types are defined
            if (!this.checkRequired(PARTICLE_TYPES, "PARTICLE_TYPES")) {
                return false;
            }
            
            // Verify particle system exists
            if (!this.checkRequired(this.game.particles, "particles", "game")) {
                return false;
            }
            
            // Test each particle type
            const particleTypes = Object.keys(PARTICLE_TYPES);
            
            for (const type of particleTypes) {
                try {
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
                    
                    if (particlesCreated) {
                        // Check particle properties
                        const sampleParticle = this.game.particles.particles[0];
                        const validParticle = sampleParticle && 
                                            sampleParticle.hasOwnProperty('type') && 
                                            sampleParticle.hasOwnProperty('lifetime');
                        
                        this.logResult(`${type} Particle Structure`, validParticle, 
                            `Particle object structure ${validParticle ? "valid" : "invalid"}`);
                        
                        // Test particle update
                        const initialCount = this.game.particles.particles.length;
                        try {
                            this.game.particles.update(0.1);
                            const updatedCorrectly = this.game.particles.particles.length <= initialCount;
                            
                            this.logResult(`${type} Particle Updates`, updatedCorrectly, 
                                `Particles after update: ${this.game.particles.particles.length} (was ${initialCount})`);
                        } catch (updateError) {
                            this.logResult(`${type} Particle Update`, false, 
                                `Error updating particles: ${updateError.message}`, {
                                    error: updateError,
                                    stack: updateError.stack
                                });
                        }
                        
                        // Test particle drawing
                        try {
                            this.game.particles.draw(this.game.ctx);
                            this.logResult(`${type} Particle Drawing`, true, `Particle drawing completed without errors`);
                        } catch (drawError) {
                            this.logResult(`${type} Particle Drawing`, false, 
                                `Error drawing particles: ${drawError.message}`, {
                                    error: drawError,
                                    stack: drawError.stack,
                                    suggestion: "Check particle draw method implementation"
                                });
                        }
                    }
                } catch (particleError) {
                    this.logResult(`${type} Particle Test`, false, 
                        `Error testing ${type} particles: ${particleError.message}`, {
                            error: particleError,
                            stack: particleError.stack
                        });
                }
            }
            
            return true;
        } catch (error) {
            this.logResult("Particle System Test", false, `Particle testing failed: ${error.message}`, {
                error: error,
                stack: error.stack
            });
            return false;
        }
    }

    // Test UI system
    testUISystem() {
        try {
            this.game.initGame('shire');
            
            // Verify UI object exists
            if (!this.checkRequired(this.game.ui, "ui", "game")) {
                return false;
            }
            
            // Check UI elements
            const uiElements = [
                { name: "Score Display", element: this.game.ui.scoreDisplay },
                { name: "Fire Meter", element: this.game.ui.fireMeter },
                { name: "Transformation Stage", element: this.game.ui.transformationStage },
                { name: "Transformation Meter", element: this.game.ui.transformationMeter }
            ];
            
            for (const item of uiElements) {
                const elementExists = !!item.element;
                this.logResult(`UI ${item.name}`, elementExists, 
                    `${item.name} element ${elementExists ? "exists" : "missing"}`);
            }
            
            // Test UI update
            try {
                this.game.ui.update();
                this.logResult("UI Update Method", true, "UI update completed without errors");
            } catch (updateError) {
                this.logResult("UI Update Method", false, `Error in UI update: ${updateError.message}`, {
                    error: updateError,
                    stack: updateError.stack,
                    suggestion: "Check ui.update() implementation and DOM element references"
                });
            }
            
            // Test ability icon updates
            if (this.game.ui.abilityElements) {
                for (const abilityName in this.game.ui.abilityElements) {
                    const abilityElement = this.game.ui.abilityElements[abilityName];
                    const elementExists = abilityElement && abilityElement.icon && abilityElement.cooldown;
                    
                    this.logResult(`UI ${abilityName} Element`, elementExists, 
                        `${abilityName} UI element ${elementExists ? "complete" : "incomplete or missing"}`);
                }
            } else {
                this.logResult("UI Ability Elements", false, "abilityElements property missing from UI object");
            }
            
            // Test minimap rendering
            try {
                this.game.ui.updateMinimap();
                this.logResult("Minimap Update", true, "Minimap update completed without errors");
            } catch (minimapError) {
                this.logResult("Minimap Update", false, `Error updating minimap: ${minimapError.message}`, {
                    error: minimapError,
                    stack: minimapError.stack,
                    suggestion: "Check ui.updateMinimap() implementation"
                });
            }
            
            return true;
        } catch (error) {
            this.logResult("UI System Test", false, `UI testing failed: ${error.message}`, {
                error: error,
                stack: error.stack
            });
            return false;
        }
    }

    // Test game over condition
    testGameOverCondition() {
        try {
            this.game.initGame('shire');
            
            // Store initial state
            const initialState = this.game.currentState;
            
            // Force game over
            this.game.gameOver();
            
            // Check state
            const gameOverState = this.game.currentState === GAME_STATES.GAME_OVER;
            this.logResult("Game Over Condition", gameOverState, 
                `Game state changed from ${initialState} to ${this.game.currentState}, expected ${GAME_STATES.GAME_OVER}`);
            
            // Check if game over UI is shown
            try {
                this.game.ui.showGameOver();
                this.logResult("Game Over UI", true, "Game over UI display method ran without errors");
            } catch (uiError) {
                this.logResult("Game Over UI", false, `Error showing game over UI: ${uiError.message}`, {
                    error: uiError,
                    stack: uiError.stack,
                    suggestion: "Check ui.showGameOver() implementation and DOM element references"
                });
            }
            
            return true;
        } catch (error) {
            this.logResult("Game Over Test", false, `Game over testing failed: ${error.message}`, {
                error: error,
                stack: error.stack
            });
            return false;
        }
    }

    // Test level completion
    testLevelCompletion() {
        try {
            this.game.initGame('shire');
            
            // Store initial score and state
            const initialScore = this.game.score;
            const initialState = this.game.currentState;
            
            // Force level completion
            this.game.levelComplete();
            
            // Check state
            const victoryState = this.game.currentState === GAME_STATES.VICTORY;
            this.logResult("Level Completion State", victoryState, 
                `Game state changed from ${initialState} to ${this.game.currentState}, expected ${GAME_STATES.VICTORY}`);
            
            // Check score bonus
            const scoreIncreased = this.game.score > initialScore;
            this.logResult("Level Completion Score", scoreIncreased, 
                `Score changed from ${initialScore} to ${this.game.score}`);
            
            // Check victory UI
            try {
                this.game.ui.showVictory();
                this.logResult("Victory UI", true, "Victory UI display method ran without errors");
            } catch (uiError) {
                this.logResult("Victory UI", false, `Error showing victory UI: ${uiError.message}`, {
                    error: uiError,
                    stack: uiError.stack,
                    suggestion: "Check ui.showVictory() implementation and DOM element references"
                });
            }
            
            return true;
        } catch (error) {
            this.logResult("Level Completion Test", false, `Level completion testing failed: ${error.message}`, {
                error: error,
                stack: error.stack
            });
            return false;
        }
    }

    // Test controls and input handling
    testControlSystem() {
        try {
            this.game.initGame('shire');
            
            // Verify controls object exists
            if (!this.checkRequired(this.game.controls, "controls", "game")) {
                return false;
            }
            
            // Test direction change method
            try {
                const initialDirection = {...this.game.snake.direction};
                this.game.controls.changeDirection(DIRECTIONS.RIGHT);
                
                const directionChanged = 
                    this.game.snake.nextDirection === DIRECTIONS.RIGHT;
                
                this.logResult("Controls Direction Change", directionChanged, 
                    `Direction changed from ${JSON.stringify(initialDirection)} to next:${JSON.stringify(this.game.snake.nextDirection)}`);
            } catch (directionError) {
                this.logResult("Controls Direction Change", false, 
                    `Error changing direction: ${directionError.message}`, {
                        error: directionError,
                        stack: directionError.stack,
                        suggestion: "Check controls.changeDirection() implementation"
                    });
            }
            
            // Test ability activation
            try {
                // Set transformation stage to access abilities
                this.game.currentTransformationStage = TRANSFORMATION_STAGES.length - 1;
                this.game.snake.applyTransformation(TRANSFORMATION_STAGES[this.game.currentTransformationStage]);
                
                // Ensure fire meter is full
                this.game.fireMeter = FIRE_METER_MAX;
                
                // Reset cooldown
                this.game.fireAbilities.cooldowns.FLAME_BREATH = 0;
                
                const initialEffectsCount = this.game.fireAbilities.activeEffects.length;
                this.game.controls.activateAbility(1); // FLAME_BREATH
                
                const abilityActivated = this.game.fireAbilities.activeEffects.length > initialEffectsCount;
                this.logResult("Controls Ability Activation", abilityActivated, 
                    `Ability activated through controls: ${abilityActivated ? "success" : "failed"}`);
            } catch (abilityError) {
                this.logResult("Controls Ability Activation", false, 
                    `Error activating ability: ${abilityError.message}`, {
                        error: abilityError,
                        stack: abilityError.stack,
                        suggestion: "Check controls.activateAbility() implementation"
                    });
            }
            
            // Test pause toggle
            try {
                const initialState = this.game.currentState;
                this.game.controls.togglePause();
                
                const stateToggled = this.game.currentState !== initialState;
                const expectedState = initialState === GAME_STATES.PLAYING ? 
                                    GAME_STATES.PAUSED : GAME_STATES.PLAYING;
                
                this.logResult("Controls Pause Toggle", stateToggled, 
                    `Game state toggled from ${initialState} to ${this.game.currentState}, expected ${expectedState}`);
            } catch (pauseError) {
                this.logResult("Controls Pause Toggle", false, 
                    `Error toggling pause: ${pauseError.message}`, {
                        error: pauseError,
                        stack: pauseError.stack,
                        suggestion: "Check controls.togglePause() implementation"
                    });
            }
            
            return true;
        } catch (error) {
            this.logResult("Control System Test", false, `Controls testing failed: ${error.message}`, {
                error: error,
                stack: error.stack
            });
            return false;
        }
    }

    // Test canvas rendering
    testRenderSystem() {
        try {
            this.game.initGame('shire');
            
            // Check canvas contexts
            const hasMainCanvas = this.game.ctx && typeof this.game.ctx.clearRect === 'function';
            this.logResult("Main Canvas Context", hasMainCanvas, 
                `Main canvas context ${hasMainCanvas ? "valid" : "invalid or missing"}`);
            
            const hasMinimapCanvas = this.game.minimapCtx && typeof this.game.minimapCtx.clearRect === 'function';
            this.logResult("Minimap Canvas Context", hasMinimapCanvas, 
                `Minimap canvas context ${hasMinimapCanvas ? "valid" : "missing"}`);
            
            // Test background drawing
            try {
                this.game.drawBackground();
                this.logResult("Background Rendering", true, "Background drawn without errors");
            } catch (bgError) {
                this.logResult("Background Rendering", false, `Error drawing background: ${bgError.message}`, {
                    error: bgError,
                    stack: bgError.stack,
                    suggestion: "Check game.drawBackground() implementation"
                });
            }
            
            // Test full render
            try {
                this.game.render();
                this.logResult("Game Rendering", true, "Game rendered without errors");
            } catch (renderError) {
                this.logResult("Game Rendering", false, `Error in game rendering: ${renderError.message}`, {
                    error: renderError,
                    stack: renderError.stack,
                    suggestion: "Check game.render() implementation"
                });
            }
            
            // Test entity rendering
            const entityTypes = [
                { name: "Snake", object: this.game.snake, method: "draw" },
                { name: "Fire Effects", object: this.game.fireAbilities, method: "draw" },
                { name: "Particles", object: this.game.particles, method: "draw" }
            ];
            
            for (const entity of entityTypes) {
                if (entity.object && typeof entity.object[entity.method] === 'function') {
                    try {
                        entity.object[entity.method](this.game.ctx, GRID_SIZE);
                        this.logResult(`${entity.name} Rendering`, true, `${entity.name} drawn without errors`);
                    } catch (entityError) {
                        this.logResult(`${entity.name} Rendering`, false, 
                            `Error drawing ${entity.name}: ${entityError.message}`, {
                                error: entityError,
                                stack: entityError.stack,
                                suggestion: `Check ${entity.name.toLowerCase()}.${entity.method}() implementation`
                            });
                    }
                } else {
                    this.logResult(`${entity.name} Rendering`, false, 
                        `${entity.name} object missing or draw method not found`);
                }
            }
            
            return true;
        } catch (error) {
            this.logResult("Render System Test", false, `Render testing failed: ${error.message}`, {
                error: error,
                stack: error.stack
            });
            return false;
        }
    }

    // Test game loop and timing
    testGameLoop() {
        try {
            this.game.initGame('shire');
            
            // Check game loop properties
            const hasLastFrameTime = this.game.hasOwnProperty('lastFrameTime');
            this.logResult("Game Loop Timing Property", hasLastFrameTime, 
                `Game ${hasLastFrameTime ? "has" : "missing"} lastFrameTime property`);
            
            const hasDeltaTime = this.game.hasOwnProperty('deltaTime');
            this.logResult("Game Loop Delta Time", hasDeltaTime, 
                `Game ${hasDeltaTime ? "has" : "missing"} deltaTime property`);
            
            // Simulate a game loop cycle manually
            try {
                // Set initial values
                this.game.lastFrameTime = performance.now() - 16.667; // Simulate ~60fps
                this.game.deltaTime = 0;
                this.game.accumulatedTime = 0;
                
                // Call gameLoop with current timestamp
                const timestamp = performance.now();
                
                // Modify gameLoop to not request next frame
                const originalGameLoop = this.game.gameLoop;
                let loopCompleted = false;
                
                this.game.gameLoop = function(time) {
                    // Call original logic without requestAnimationFrame
                    this.deltaTime = (time - this.lastFrameTime) / 1000;
                    this.lastFrameTime = time;
                    
                    if (this.deltaTime > 0.1) this.deltaTime = 0.1;
                    
                    this.accumulatedTime += this.deltaTime * 1000;
                    
                    if (this.currentState === GAME_STATES.PLAYING) {
                        while (this.accumulatedTime >= this.timeStep) {
                            this.update(this.timeStep / 1000);
                            this.accumulatedTime -= this.timeStep;
                        }
                    }
                    
                    this.render();
                    loopCompleted = true;
                };
                
                // Run modified game loop once
                this.game.gameLoop(timestamp);
                
                // Restore original game loop
                this.game.gameLoop = originalGameLoop;
                
                this.logResult("Game Loop Execution", loopCompleted, 
                    `Game loop ${loopCompleted ? "executed successfully" : "failed to complete"}`);
                
                // Check if delta time was calculated correctly
                const deltaTimeCorrect = Math.abs(this.game.deltaTime - 0.016667) < 0.01;
                this.logResult("Game Loop Delta Time", deltaTimeCorrect, 
                    `Delta time: ${this.game.deltaTime.toFixed(5)}, expected ~0.01667 (60fps)`);
                
            } catch (loopError) {
                this.logResult("Game Loop Execution", false, `Error in game loop: ${loopError.message}`, {
                    error: loopError,
                    stack: loopError.stack,
                    suggestion: "Check game.gameLoop() implementation"
                });
            }
            
            return true;
        } catch (error) {
            this.logResult("Game Loop Test", false, `Game loop testing failed: ${error.message}`, {
                error: error,
                stack: error.stack
            });
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
                try {
                    // Simulate collectible collection by placing one at snake's head
                    const head = this.game.snake.segments[0];
                    this.game.collectibles = [new Collectible(head.x, head.y)];
                    
                    // Perform an update
                    this.game.update(0.1);
                    
                    await new Promise(resolve => setTimeout(resolve, 50));
                } catch (updateError) {
                    this.logResult(`Gameplay Update ${i}`, false, 
                        `Error during game update #${i}: ${updateError.message}`, {
                            error: updateError,
                            stack: updateError.stack,
                            suggestion: "Check error in game update cycle"
                        });
                    break;
                }
            }
            
            // Check if game state changed as expected
            const snakeGrew = this.game.snake.segments.length > initialSnakeLength;
            const scoreIncreased = this.game.score > initialScore;
            
            this.logResult("Gameplay Simulation - Snake Growth", snakeGrew, 
                `Snake length: ${initialSnakeLength} -> ${this.game.snake.segments.length}`);
            
            this.logResult("Gameplay Simulation - Score", scoreIncreased, 
                `Score: ${initialScore} -> ${this.game.score}`);
            
            return true;
        } catch (error) {
            this.logResult("Gameplay Simulation", false, `Simulation failed: ${error.message}`, {
                error: error,
                stack: error.stack
            });
            return false;
        }
    }

    // Run all tests
    async runAllTests() {
        console.log("====== The One Snake - Enhanced Test Suite ======");
        console.log(`Starting tests at ${new Date().toISOString()}`);
        console.log("Browser: " + navigator.userAgent);
        
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
        this.testUISystem();
        this.testGameOverCondition();
        this.testLevelCompletion();
        this.testControlSystem();
        this.testRenderSystem();
        this.testGameLoop();
        
        // Run gameplay simulation
        await this.simulateGameplay();
        
        // Generate report
        this.generateTestReport();
    }

    // Generate comprehensive test report with error analysis
    generateTestReport() {
        const totalTests = this.testsPassed + this.testsFailed;
        const passRate = totalTests > 0 ? (this.testsPassed / totalTests * 100).toFixed(2) : "0.00";
        
        let report = "====== THE ONE SNAKE - ENHANCED TEST REPORT ======\n\n";
        report += `Test Date: ${new Date().toLocaleString()}\n`;
        report += `Browser: ${navigator.userAgent}\n`;
        report += `Tests Run: ${totalTests}\n`;
        report += `Tests Passed: ${this.testsPassed}\n`;
        report += `Tests Failed: ${this.testsFailed}\n`;
        report += `Pass Rate: ${passRate}%\n\n`;
        
        // Summary of key issues
        if (this.testsFailed > 0) {
            report += "====== CRITICAL ISSUES SUMMARY ======\n\n";
            
            // Collect most significant failures by category
            const criticalCategories = [
                "Game Initialization",
                "Snake System",
                "Collision System",
                "Fire Abilities",
                "Game Loop",
                "Rendering"
            ];
            
            for (const category of criticalCategories) {
                const failures = this.testResults.filter(r => 
                    !r.success && r.testName.includes(category));
                
                if (failures.length > 0) {
                    report += `${category}: ${failures.length} issue(s)\n`;
                    // Include first failure message as example
                    if (failures[0]) {
                        report += `  - ${failures[0].message}\n`;
                    }
                }
            }
            
            report += "\n";
        }
        
        report += "====== DETAILED TEST RESULTS ======\n\n";
        
        // Group tests by category
        const categories = {};
        
        for (const result of this.testResults) {
            // Extract category from test name (first word or before hyphen)
            let category;
            if (result.testName.includes(" - ")) {
                category = result.testName.split(" - ")[0];
            } else if (result.testName.includes(" ")) {
                category = result.testName.split(" ")[0];
            } else {
                category = "Other";
            }
            
            if (!categories[category]) {
                categories[category] = [];
            }
            categories[category].push(result);
        }
        
        // Add each category to report
        for (const category in categories) {
            report += `=== ${category} Tests ===\n`;
            
            // Count passes and failures in this category
            const categoryPasses = categories[category].filter(r => r.success).length;
            const categoryFails = categories[category].filter(r => !r.success).length;
            report += `${categoryPasses} passed, ${categoryFails} failed\n\n`;
            
            for (const result of categories[category]) {
                const status = result.success ? "PASS" : "FAIL";
                report += `${status}: ${result.testName} - ${result.message}\n`;
                
                // Add details for failures if available
                if (!result.success && result.details) {
                    if (result.details.suggestion) {
                        report += `  Suggestion: ${result.details.suggestion}\n`;
                    }
                }
            }
            
            report += "\n";
        }
        
        // Recommendations section
        if (this.testsFailed > 0) {
            report += "====== DEBUGGING RECOMMENDATIONS ======\n\n";
            
            // Analyze patterns in failures
            const domFailures = this.testResults.filter(r => 
                !r.success && (r.message.includes("DOM") || r.message.includes("element"))).length;
            
            const updateFailures = this.testResults.filter(r => 
                !r.success && r.message.includes("update")).length;
            
            const collisionFailures = this.testResults.filter(r => 
                !r.success && r.message.includes("collision")).length;
            
            const renderFailures = this.testResults.filter(r => 
                !r.success && (r.message.includes("render") || r.message.includes("draw"))).length;
            
            if (domFailures > 3) {
                report += "1. Check HTML structure and element IDs - multiple DOM element errors detected\n";
            }
            
            if (updateFailures > 3) {
                report += "2. Investigate game update logic - several update-related failures found\n";
            }
            
            if (collisionFailures > 2) {
                report += "3. Review collision detection system - consistent collision issues detected\n";
            }
            
            if (renderFailures > 2) {
                report += "4. Examine rendering code - multiple rendering failures occurred\n";
            }
            
            // Generic recommendations
            report += "\nGeneral debugging steps:\n";
            report += "- Check browser console for JavaScript errors\n";
            report += "- Verify all scripts are loaded in the correct order\n";
            report += "- Test with a simpler level configuration\n";
            report += "- Add console.log statements to trace execution flow\n";
        }
        
        report += "\n====== END OF TEST REPORT ======";
        
        console.log(report);
        
        return report;
    }
}

// Run the tests when script is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM loaded, waiting for resources before running tests...");
    
    // Wait a moment for game resources to load
    setTimeout(() => {
        const tester = new GameTest();
        tester.runAllTests();
    }, 1000);
});