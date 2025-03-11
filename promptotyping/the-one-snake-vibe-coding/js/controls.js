// The One Snake - Input Controls

class Controls {
    constructor(game) {
        this.game = game;
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.keysPressed = {};
        this.setupEventListeners();
    }

    showInputIndicator(direction) {
        // Create or reuse indicator element
        let indicator = document.getElementById('input-indicator');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.id = 'input-indicator';
            document.body.appendChild(indicator);
            
            // Add style directly for simplicity
            indicator.style.cssText = `
                position: fixed;
                bottom: 20px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(255, 255, 255, 0.7);
                color: black;
                padding: 5px 10px;
                border-radius: 5px;
                font-family: monospace;
                z-index: 1000;
                pointer-events: none;
            `;
        }
        
        // Show direction
        indicator.textContent = `Input: ${direction.toUpperCase()}`;
        indicator.style.display = 'block';
        
        // Hide after short delay
        clearTimeout(this.indicatorTimeout);
        this.indicatorTimeout = setTimeout(() => {
            indicator.style.display = 'none';
        }, 300);
    }
    
    setupEventListeners() {
        // Keyboard events
        document.addEventListener('keydown', (event) => this.handleKeyDown(event));
        document.addEventListener('keyup', (event) => this.handleKeyUp(event));
        
        // Touch events for mobile
        const swipeArea = document.getElementById('swipe-area');
        if (swipeArea) {
            swipeArea.addEventListener('touchstart', (event) => this.handleTouchStart(event));
            swipeArea.addEventListener('touchmove', (event) => this.handleTouchMove(event));
            swipeArea.addEventListener('touchend', (event) => this.handleTouchEnd(event));
        }
        
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
        
        // How to Play
        document.getElementById('how-to-play').addEventListener('click', () => {
            this.game.setGameState(GAME_STATES.HOW_TO_PLAY);
        });
        
        document.getElementById('back-from-instructions').addEventListener('click', () => {
            this.game.setGameState(GAME_STATES.MAIN_MENU);
        });
        
        // Audio controls
        const toggleMusic = document.getElementById('toggle-music');
        if (toggleMusic) {
            toggleMusic.addEventListener('click', () => {
                this.toggleMusic();
            });
        }
        
        const toggleSound = document.getElementById('toggle-sound');
        if (toggleSound) {
            toggleSound.addEventListener('click', () => {
                this.toggleSound();
            });
        }
        
        // Level select buttons
        const levelButtons = document.querySelectorAll('.level-button');
        levelButtons.forEach(button => {
            button.addEventListener('click', (event) => {
                const levelId = event.currentTarget.getAttribute('data-level');
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
        
        // Add sound effects to buttons
        const menuButtons = document.querySelectorAll('.menu-button, .level-button, .mobile-ability');
        menuButtons.forEach(button => {
            button.addEventListener('mouseenter', () => {
                this.playSound('menu-hover');
            });
            
            button.addEventListener('click', () => {
                this.playSound('menu-click');
            });
        });
    }
    
    // Play sound effect
    playSound(soundId) {
        if (this.game && this.game.audio && !this.game.audio.soundMuted) {
            const sound = document.getElementById(`sound-${soundId}`);
            if (sound) {
                sound.currentTime = 0;
                sound.play().catch(e => console.log("Error playing sound:", e));
            }
        }
    }
    
    // Toggle background music
    toggleMusic() {
        if (this.game && this.game.audio) {
            this.game.audio.toggleMusic();
        }
    }
    
    // Toggle sound effects
    toggleSound() {
        if (this.game && this.game.audio) {
            this.game.audio.toggleSound();
        }
    }
    
    handleKeyDown(event) {
        this.keysPressed[event.code] = true;
        
        // Handle direction changes
        if (this.game.currentState === GAME_STATES.PLAYING) {
            // Check each direction
            if (DESKTOP_CONTROLS.UP.includes(event.code)) {
                this.showInputIndicator('up');
                this.changeDirection(DIRECTIONS.UP);
            } else if (DESKTOP_CONTROLS.RIGHT.includes(event.code)) {
                this.showInputIndicator('right');
                this.changeDirection(DIRECTIONS.RIGHT);
            } else if (DESKTOP_CONTROLS.DOWN.includes(event.code)) {
                this.showInputIndicator('down');
                this.changeDirection(DIRECTIONS.DOWN);
            } else if (DESKTOP_CONTROLS.LEFT.includes(event.code)) {
                this.showInputIndicator('left');
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
                this.showInputIndicator('right');
                this.changeDirection(DIRECTIONS.RIGHT);
            } else {
                this.showInputIndicator('left');
                this.changeDirection(DIRECTIONS.LEFT);
            }
        } else {
            // Vertical swipe
            if (dy > 0) {
                this.showInputIndicator('down');
                this.changeDirection(DIRECTIONS.DOWN);
            } else {
                this.showInputIndicator('up');
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
            
            // Play ability sound
            if (abilityName === 'FIRE_SHIELD') {
                this.playSound('ability-shield');
            } else {
                this.playSound('ability-fire');
            }
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