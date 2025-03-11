// The One Snake - Input Controls

class Controls {
    constructor(game) {
        this.game = game;
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.keysPressed = {};
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Keyboard events
        document.addEventListener('keydown', (event) => this.handleKeyDown(event));
        document.addEventListener('keyup', (event) => this.handleKeyUp(event));
        
        // Touch events for mobile
        const swipeArea = document.getElementById('swipe-area');
        swipeArea.addEventListener('touchstart', (event) => this.handleTouchStart(event));
        swipeArea.addEventListener('touchmove', (event) => this.handleTouchMove(event));
        swipeArea.addEventListener('touchend', (event) => this.handleTouchEnd(event));
        
        // Mobile ability buttons
        const abilityButtons = document.querySelectorAll('.mobile-ability');
        abilityButtons.forEach(button => {
            button.addEventListener('click', (event) => {
                const abilityIndex = parseInt(event.target.getAttribute('data-ability'));
                this.activateAbility(abilityIndex);
            });
        });
        
        // Menu button handlers
        document.getElementById('start-game').addEventListener('click', () => {
            this.game.initGame('shire');
        });
        
        document.getElementById('level-select').addEventListener('click', () => {
            this.game.setGameState(GAME_STATES.LEVEL_SELECT);
        });
        
        document.getElementById('back-to-main').addEventListener('click', () => {
            this.game.setGameState(GAME_STATES.MAIN_MENU);
        });
        
        // Level select buttons
        const levelButtons = document.querySelectorAll('.level-button');
        levelButtons.forEach(button => {
            button.addEventListener('click', (event) => {
                const levelId = event.target.getAttribute('data-level');
                this.game.initGame(levelId);
            });
        });
        
        // Pause menu buttons
        document.getElementById('resume-game').addEventListener('click', () => {
            this.game.setGameState(GAME_STATES.PLAYING);
        });
        
        document.getElementById('restart-level').addEventListener('click', () => {
            this.game.initGame(this.game.currentLevel.id);
        });
        
        document.getElementById('exit-to-menu').addEventListener('click', () => {
            this.game.setGameState(GAME_STATES.MAIN_MENU);
        });
        
        // Game over menu buttons
        document.getElementById('retry-level').addEventListener('click', () => {
            this.game.initGame(this.game.currentLevel.id);
        });
        
        document.getElementById('game-over-to-menu').addEventListener('click', () => {
            this.game.setGameState(GAME_STATES.MAIN_MENU);
        });
        
        // Victory menu buttons
        document.getElementById('next-level').addEventListener('click', () => {
            this.goToNextLevel();
        });
        
        document.getElementById('victory-to-menu').addEventListener('click', () => {
            this.game.setGameState(GAME_STATES.MAIN_MENU);
        });
    }
    
    handleKeyDown(event) {
        this.keysPressed[event.code] = true;
        
        // Handle direction changes
        if (this.game.currentState === GAME_STATES.PLAYING) {
            // Check each direction
            if (DESKTOP_CONTROLS.UP.includes(event.code)) {
                this.changeDirection(DIRECTIONS.UP);
            } else if (DESKTOP_CONTROLS.RIGHT.includes(event.code)) {
                this.changeDirection(DIRECTIONS.RIGHT);
            } else if (DESKTOP_CONTROLS.DOWN.includes(event.code)) {
                this.changeDirection(DIRECTIONS.DOWN);
            } else if (DESKTOP_CONTROLS.LEFT.includes(event.code)) {
                this.changeDirection(DIRECTIONS.LEFT);
            }
            
            // Check fire abilities
            if (DESKTOP_CONTROLS.FIRE_ABILITY_1.includes(event.code)) {
                this.activateAbility(1);
            } else if (DESKTOP_CONTROLS.FIRE_ABILITY_2.includes(event.code)) {
                this.activateAbility(2);
            } else if (DESKTOP_CONTROLS.FIRE_ABILITY_3.includes(event.code)) {
                this.activateAbility(3);
            } else if (DESKTOP_CONTROLS.FIRE_ABILITY_4.includes(event.code)) {
                this.activateAbility(4);
            }
            
            // Check pause toggle
            if (DESKTOP_CONTROLS.PAUSE.includes(event.code)) {
                this.togglePause();
            }
        }
    }
    
    handleKeyUp(event) {
        this.keysPressed[event.code] = false;
    }
    
    handleTouchStart(event) {
        const touch = event.touches[0];
        this.touchStartX = touch.clientX;
        this.touchStartY = touch.clientY;
    }
    
    handleTouchMove(event) {
        // Prevent default to stop scrolling
        event.preventDefault();
    }
    
    handleTouchEnd(event) {
        if (this.game.currentState !== GAME_STATES.PLAYING) return;
        
        const touch = event.changedTouches[0];
        const touchEndX = touch.clientX;
        const touchEndY = touch.clientY;
        
        // Calculate swipe direction
        const dx = touchEndX - this.touchStartX;
        const dy = touchEndY - this.touchStartY;
        
        // Require a minimum swipe distance
        const minSwipeDistance = 30;
        const totalDistance = Math.sqrt(dx * dx + dy * dy);
        
        if (totalDistance < minSwipeDistance) return;
        
        // Determine primary direction of swipe
        if (Math.abs(dx) > Math.abs(dy)) {
            // Horizontal swipe
            if (dx > 0) {
                this.changeDirection(DIRECTIONS.RIGHT);
            } else {
                this.changeDirection(DIRECTIONS.LEFT);
            }
        } else {
            // Vertical swipe
            if (dy > 0) {
                this.changeDirection(DIRECTIONS.DOWN);
            } else {
                this.changeDirection(DIRECTIONS.UP);
            }
        }
    }
    
    changeDirection(direction) {
        if (this.game.snake) {
            this.game.snake.changeDirection(direction);
        }
    }
    
    activateAbility(abilityNumber) {
        if (this.game.currentState !== GAME_STATES.PLAYING) return;
        
        // Map ability number to ability name
        let abilityName;
        switch (abilityNumber) {
            case 1:
                abilityName = 'FLAME_BREATH';
                break;
            case 2:
                abilityName = 'FIRE_SHIELD';
                break;
            case 3:
                abilityName = 'BURNING_TRAIL';
                break;
            case 4:
                abilityName = 'INFERNO_BURST';
                break;
            default:
                return;
        }
        
        // Check if ability is available for current transformation stage
        const currentStage = TRANSFORMATION_STAGES[this.game.currentTransformationStage];
        
        if (currentStage.fireAbilities.includes(abilityName) || 
            currentStage.fireAbilities.includes('ALL')) {
            
            // Activate the ability
            this.game.fireAbilities.activateAbility(
                abilityName, 
                this.game.snake.segments[0], 
                this.game.snake.direction
            );
        }
    }
    
    togglePause() {
        if (this.game.currentState === GAME_STATES.PLAYING) {
            this.game.setGameState(GAME_STATES.PAUSED);
        } else if (this.game.currentState === GAME_STATES.PAUSED) {
            this.game.setGameState(GAME_STATES.PLAYING);
        }
    }
    
    goToNextLevel() {
        // Find the index of the current level
        const currentIndex = LEVELS.findIndex(level => level.id === this.game.currentLevel.id);
        
        // Check if there's a next level
        if (currentIndex < LEVELS.length - 1) {
            const nextLevel = LEVELS[currentIndex + 1];
            this.game.initGame(nextLevel.id);
        } else {
            // No next level, return to main menu
            this.game.setGameState(GAME_STATES.MAIN_MENU);
        }
    }
}