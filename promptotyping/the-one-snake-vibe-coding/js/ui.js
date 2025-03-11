// The One Snake - UI System

class UI {
    constructor(game) {
        this.game = game;
        
        // UI Elements
        this.scoreDisplay = document.getElementById('score');
        this.fireMeter = document.getElementById('fire-meter');
        this.transformationStage = document.getElementById('transformation-stage');
        this.transformationMeter = document.getElementById('transformation-meter');
        this.finalScoreDisplay = document.getElementById('final-score');
        this.victoryScoreDisplay = document.getElementById('victory-score');
        this.levelNameDisplay = document.getElementById('level-name');
        this.victoryLevelNameDisplay = document.getElementById('victory-level-name');
        
        // Ability UI elements
        this.abilityElements = {
            FLAME_BREATH: {
                icon: document.getElementById('ability-1'),
                cooldown: document.querySelector('#ability-1 .ability-cooldown')
            },
            FIRE_SHIELD: {
                icon: document.getElementById('ability-2'),
                cooldown: document.querySelector('#ability-2 .ability-cooldown')
            },
            BURNING_TRAIL: {
                icon: document.getElementById('ability-3'),
                cooldown: document.querySelector('#ability-3 .ability-cooldown')
            },
            INFERNO_BURST: {
                icon: document.getElementById('ability-4'),
                cooldown: document.querySelector('#ability-4 .ability-cooldown')
            }
        };
    }
    
    update() {
        // Update score display
        if (this.scoreDisplay) {
            this.scoreDisplay.textContent = this.game.score;
        }
        
        // Update fire meter
        if (this.fireMeter) {
            this.fireMeter.style.width = `${(this.game.fireMeter / FIRE_METER_MAX) * 100}%`;
        }
        
        // Update transformation display
        if (this.transformationStage && this.game.currentTransformationStage !== undefined) {
            const currentStage = TRANSFORMATION_STAGES[this.game.currentTransformationStage];
            if (currentStage) {
                this.transformationStage.textContent = currentStage.name;
            }
        }
        
        // Calculate progress to next stage
        if (this.transformationMeter && this.game.currentTransformationStage !== undefined) {
            if (this.game.currentTransformationStage < TRANSFORMATION_STAGES.length - 1) {
                const currentStage = TRANSFORMATION_STAGES[this.game.currentTransformationStage];
                const nextStage = TRANSFORMATION_STAGES[this.game.currentTransformationStage + 1];
                if (currentStage && nextStage) {
                    const currentProgress = this.game.collectiblesObtained - currentStage.requiredItems;
                    const totalNeeded = nextStage.requiredItems - currentStage.requiredItems;
                    const progressPercent = (currentProgress / totalNeeded) * 100;
                    
                    this.transformationMeter.style.width = `${Math.max(0, Math.min(100, progressPercent))}%`;
                }
            } else {
                // Max stage reached
                this.transformationMeter.style.width = '100%';
            }
        }
        
        // Update ability cooldowns
        this.updateAbilityCooldowns();
        
        // Update minimap
        this.updateMinimap();
    }
    
    updateAbilityCooldowns() {
        // For each ability, update cooldown display
        for (const abilityName in this.abilityElements) {
            if (!this.abilityElements[abilityName].cooldown) continue;
            
            const cooldownPercent = this.game.fireAbilities.getCooldownPercent(abilityName);
            this.abilityElements[abilityName].cooldown.style.height = `${cooldownPercent * 100}%`;
            
            // Disable icon if ability not available at current transformation stage
            if (this.abilityElements[abilityName].icon && this.game.currentTransformationStage !== undefined) {
                const currentStage = TRANSFORMATION_STAGES[this.game.currentTransformationStage];
                if (currentStage) {
                    const isAvailable = currentStage.fireAbilities.includes(abilityName) || 
                                      currentStage.fireAbilities.includes('ALL');
                    
                    this.abilityElements[abilityName].icon.style.opacity = isAvailable ? '1' : '0.3';
                }
            }
        }
    }
    
    updateMinimap() {
        // Clear minimap
        const minimapCtx = this.game.minimapCtx;
        const minimapCanvas = this.game.minimapCanvas;
        if (!minimapCtx || !minimapCanvas) return;
        
        minimapCtx.clearRect(0, 0, minimapCanvas.width, minimapCanvas.height);
        
        // Check if snake exists
        if (!this.game.snake || !this.game.snake.segments) return;
        
        // Calculate minimap scale
        const gridWidth = Math.floor(this.game.canvas.width / GRID_SIZE);
        const gridHeight = Math.floor(this.game.canvas.height / GRID_SIZE);
        const scaleX = minimapCanvas.width / gridWidth;
        const scaleY = minimapCanvas.height / gridHeight;
        
        // Draw obstacles (small dots)
        minimapCtx.fillStyle = '#888888';
        for (const obstacle of this.game.obstacles) {
            minimapCtx.fillRect(
                obstacle.x * scaleX,
                obstacle.y * scaleY,
                scaleX,
                scaleY
            );
        }
        
        // Draw collectibles (yellow dots)
        minimapCtx.fillStyle = '#FFFF00';
        for (const collectible of this.game.collectibles) {
            minimapCtx.fillRect(
                collectible.x * scaleX,
                collectible.y * scaleY,
                scaleX,
                scaleY
            );
        }
        
        // Draw portals (purple dots)
        minimapCtx.fillStyle = '#8A2BE2';
        for (const portal of this.game.portals) {
            minimapCtx.fillRect(
                portal.x * scaleX,
                portal.y * scaleY,
                scaleX,
                scaleY
            );
        }
        
        // Draw horses (brown dots)
        minimapCtx.fillStyle = '#8B4513';
        for (const horse of this.game.horses) {
            minimapCtx.fillRect(
                horse.x * scaleX,
                horse.y * scaleY,
                scaleX,
                scaleY
            );
        }
        
        // Draw snake (green dots)
        minimapCtx.fillStyle = '#00FF00';
        for (const segment of this.game.snake.segments) {
            minimapCtx.fillRect(
                segment.x * scaleX,
                segment.y * scaleY,
                scaleX,
                scaleY
            );
        }
    }
    
    showGameOver() {
        // Update game over screen with level name and score
        if (this.levelNameDisplay) {
            const levelId = this.game.currentLevel && this.game.currentLevel.id ? 
                this.game.currentLevel.id : 'unknown';
            this.levelNameDisplay.textContent = this.getLevelDisplayName(levelId);
        }
        
        if (this.finalScoreDisplay) {
            this.finalScoreDisplay.textContent = this.game.score;
        }
    }
    
    showVictory() {
        // Update victory screen with level name and score
        if (this.victoryLevelNameDisplay) {
            const levelId = this.game.currentLevel && this.game.currentLevel.id ? 
                this.game.currentLevel.id : 'unknown';
            this.victoryLevelNameDisplay.textContent = this.getLevelDisplayName(levelId);
        }
        
        if (this.victoryScoreDisplay) {
            this.victoryScoreDisplay.textContent = this.game.score;
        }
    }
    
    getLevelDisplayName(levelId) {
        // Convert level ID to display name
        switch (levelId) {
            case 'shire':
                return 'The Shire';
            case 'rivendell':
                return 'Rivendell';
            case 'mirkwood':
                return 'Mirkwood';
            case 'rohan':
                return 'Rohan';
            case 'moria':
                return 'Moria';
            case 'mordor':
                return 'Mordor';
            default:
                return levelId;
        }
    }
}