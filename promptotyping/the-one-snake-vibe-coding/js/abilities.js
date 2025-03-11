// The One Snake - Fixed Fire Abilities Implementation

// Fixed the INFERNO_BURST method and related functionality

class FireEffect extends Entity {
    constructor(x, y, type, direction = { x: 0, y: 0 }, sourceAbility) {
        super(x, y, 'fire_effect');
        this.effectType = type;
        this.direction = direction;
        this.sourceAbility = sourceAbility;
        this.lifetime = 0;
        this.maxLifetime = this.getMaxLifetime();
        this.damage = this.getDamage();
        this.range = this.getRange();
        this.affectedCells = this.calculateAffectedCells();
    }
    
    getMaxLifetime() {
        switch (this.effectType) {
            case 'FLAME_BREATH':
                return 0.4;
            case 'FIRE_SHIELD':
                return FIRE_ABILITIES.FIRE_SHIELD.duration;
            case 'BURNING_TRAIL':
                return FIRE_ABILITIES.BURNING_TRAIL.duration;
            case 'INFERNO_BURST':
                return 0.6;
            default:
                return 0.5;
        }
    }
    
    getDamage() {
        switch (this.effectType) {
            case 'FLAME_BREATH':
                return FIRE_ABILITIES.FLAME_BREATH.damage;
            case 'FIRE_SHIELD':
                return 0;
            case 'BURNING_TRAIL':
                return FIRE_ABILITIES.BURNING_TRAIL.damage;
            case 'INFERNO_BURST':
                return FIRE_ABILITIES.INFERNO_BURST.damage;
            default:
                return 50;
        }
    }
    
    getRange() {
        switch (this.effectType) {
            case 'FLAME_BREATH':
                return FIRE_ABILITIES.FLAME_BREATH.range;
            case 'FIRE_SHIELD':
                return 1;
            case 'BURNING_TRAIL':
                return 0;
            case 'INFERNO_BURST':
                return FIRE_ABILITIES.INFERNO_BURST.radius;
            default:
                return 1;
        }
    }
    
    calculateAffectedCells() {
        const cells = [];
        
        switch (this.effectType) {
            case 'FLAME_BREATH':
                // Flame breath affects cells in a line
                for (let i = 1; i <= this.range; i++) {
                    cells.push({
                        x: this.x + this.direction.x * i,
                        y: this.y + this.direction.y * i
                    });
                }
                break;
                
            case 'FIRE_SHIELD':
                // Fire shield affects cells around the snake
                for (let dx = -1; dx <= 1; dx++) {
                    for (let dy = -1; dy <= 1; dy++) {
                        if (dx !== 0 || dy !== 0) {
                            cells.push({
                                x: this.x + dx,
                                y: this.y + dy
                            });
                        }
                    }
                }
                break;
                
            case 'BURNING_TRAIL':
                // Burning trail affects only the current cell
                cells.push({
                    x: this.x,
                    y: this.y
                });
                break;
                
            case 'INFERNO_BURST':
                // Inferno burst affects cells in a radius
                for (let dx = -this.range; dx <= this.range; dx++) {
                    for (let dy = -this.range; dy <= this.range; dy++) {
                        // Skip the center cell
                        if (dx === 0 && dy === 0) continue;
                        
                        // Check if point is within the circular radius
                        if (dx * dx + dy * dy <= this.range * this.range) {
                            cells.push({
                                x: this.x + dx,
                                y: this.y + dy
                            });
                        }
                    }
                }
                break;
        }
        
        return cells;
    }
    
    update(deltaTime) {
        this.lifetime += deltaTime;
        return this.lifetime < this.maxLifetime;
    }
    
    draw(ctx, gridSize) {
        switch (this.effectType) {
            case 'FLAME_BREATH':
                this.drawFlameBreath(ctx, gridSize);
                break;
            case 'FIRE_SHIELD':
                this.drawFireShield(ctx, gridSize);
                break;
            case 'BURNING_TRAIL':
                this.drawBurningTrail(ctx, gridSize);
                break;
            case 'INFERNO_BURST':
                this.drawInfernoBurst(ctx, gridSize);
                break;
        }
    }
    
    drawFlameBreath(ctx, gridSize) {
        // Draw flame breath as a line of fire particles
        const lifetimeRatio = this.lifetime / this.maxLifetime;
        const fadeOut = 1 - lifetimeRatio;
        
        for (const cell of this.affectedCells) {
            // Calculate cell position in pixels
            const x = cell.x * gridSize;
            const y = cell.y * gridSize;
            
            // Draw flame base
            ctx.fillStyle = `rgba(255, 69, 0, ${fadeOut})`;
            ctx.fillRect(x, y, gridSize, gridSize);
            
            // Draw flame particles
            for (let i = 0; i < 5; i++) {
                const particleX = x + Math.random() * gridSize;
                const particleY = y + Math.random() * gridSize;
                const particleSize = (Math.random() * 0.3 + 0.2) * gridSize * fadeOut;
                
                ctx.fillStyle = `rgba(255, ${Math.floor(Math.random() * 100) + 155}, 0, ${fadeOut})`;
                ctx.beginPath();
                ctx.arc(particleX, particleY, particleSize, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }
    
    drawFireShield(ctx, gridSize) {
        // Draw fire shield as a ring around the source
        const lifetimeRatio = this.lifetime / this.maxLifetime;
        const pulseEffect = 0.2 * Math.sin(lifetimeRatio * Math.PI * 10) + 0.8;
        
        ctx.strokeStyle = `rgba(255, 140, 0, ${1 - lifetimeRatio * 0.5})`;
        ctx.lineWidth = 4 * pulseEffect;
        
        ctx.beginPath();
        ctx.arc(
            this.x * gridSize + gridSize / 2,
            this.y * gridSize + gridSize / 2,
            gridSize * 1.5 * pulseEffect,
            0,
            Math.PI * 2
        );
        ctx.stroke();
        
        // Add flame particles around the shield
        for (let i = 0; i < 12; i++) {
            const angle = i * Math.PI / 6 + lifetimeRatio * Math.PI;
            const radius = gridSize * 1.5 * pulseEffect;
            const particleX = this.x * gridSize + gridSize / 2 + Math.cos(angle) * radius;
            const particleY = this.y * gridSize + gridSize / 2 + Math.sin(angle) * radius;
            const particleSize = gridSize * 0.25 * pulseEffect;
            
            ctx.fillStyle = `rgba(255, 215, 0, ${0.7 * (1 - lifetimeRatio * 0.5)})`;
            ctx.beginPath();
            ctx.arc(particleX, particleY, particleSize, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    drawBurningTrail(ctx, gridSize) {
        // Draw burning trail as flames on the ground
        const lifetimeRatio = this.lifetime / this.maxLifetime;
        const intensity = 1 - lifetimeRatio;
        
        // Draw base flame
        ctx.fillStyle = `rgba(255, 69, 0, ${intensity * 0.7})`;
        ctx.fillRect(
            this.x * gridSize,
            this.y * gridSize,
            gridSize,
            gridSize
        );
        
        // Draw flame particles
        for (let i = 0; i < 3; i++) {
            const particleX = this.x * gridSize + Math.random() * gridSize;
            const particleY = this.y * gridSize + Math.random() * gridSize * (0.8 - lifetimeRatio * 0.5);
            const particleWidth = gridSize * 0.2;
            const particleHeight = gridSize * (0.3 + Math.random() * 0.3) * intensity;
            
            ctx.fillStyle = `rgba(255, ${Math.floor(Math.random() * 100) + 155}, 0, ${intensity})`;
            
            // Drawn as a flame shape
            ctx.beginPath();
            ctx.moveTo(particleX, particleY + particleHeight);
            ctx.quadraticCurveTo(
                particleX + particleWidth / 2, 
                particleY,
                particleX + particleWidth,
                particleY + particleHeight
            );
            ctx.fill();
        }
    }
    
    drawInfernoBurst(ctx, gridSize) {
        // Draw inferno burst as an expanding circle of fire
        const lifetimeRatio = this.lifetime / this.maxLifetime;
        const expansionRatio = lifetimeRatio < 0.5 ? lifetimeRatio * 2 : 1;
        const fadeRatio = lifetimeRatio < 0.5 ? 1 : 1 - ((lifetimeRatio - 0.5) * 2);
        
        // Draw explosion circle
        const radius = this.range * gridSize * expansionRatio;
        const gradient = ctx.createRadialGradient(
            this.x * gridSize + gridSize / 2,
            this.y * gridSize + gridSize / 2,
            0,
            this.x * gridSize + gridSize / 2,
            this.y * gridSize + gridSize / 2,
            radius
        );
        
        gradient.addColorStop(0, `rgba(255, 255, 0, ${fadeRatio})`);
        gradient.addColorStop(0.5, `rgba(255, 69, 0, ${fadeRatio * 0.8})`);
        gradient.addColorStop(1, `rgba(139, 0, 0, 0)`);
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(
            this.x * gridSize + gridSize / 2,
            this.y * gridSize + gridSize / 2,
            radius,
            0,
            Math.PI * 2
        );
        ctx.fill();
        
        // Draw flames at edge of explosion
        if (lifetimeRatio < 0.7) {
            for (let i = 0; i < 16; i++) {
                const angle = i * Math.PI / 8 + lifetimeRatio * Math.PI;
                const flameX = this.x * gridSize + gridSize / 2 + Math.cos(angle) * radius * 0.9;
                const flameY = this.y * gridSize + gridSize / 2 + Math.sin(angle) * radius * 0.9;
                const flameSize = gridSize * 0.5 * fadeRatio;
                
                ctx.fillStyle = `rgba(255, 140, 0, ${fadeRatio})`;
                ctx.beginPath();
                ctx.arc(flameX, flameY, flameSize, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }
}

// Fire Ability Manager
class FireAbilityManager {
    constructor(game) {
        this.game = game;
        this.activeEffects = [];
        this.cooldowns = {
            FLAME_BREATH: 0,
            FIRE_SHIELD: 0,
            BURNING_TRAIL: 0,
            INFERNO_BURST: 0
        };
    }
    
    update(deltaTime) {
        // Update cooldowns
        for (const ability in this.cooldowns) {
            if (this.cooldowns[ability] > 0) {
                this.cooldowns[ability] -= deltaTime;
                if (this.cooldowns[ability] < 0) {
                    this.cooldowns[ability] = 0;
                }
            }
        }
        
        // Update active effects and remove expired ones
        this.activeEffects = this.activeEffects.filter(effect => effect.update(deltaTime));
    }
    
    activateAbility(abilityName, snakeHead, direction) {
        // Verify ability name is valid
        if (!FIRE_ABILITIES[abilityName]) {
            console.error(`Unknown ability: ${abilityName}`);
            return false;
        }
        
        // Check if ability is on cooldown
        if (this.cooldowns[abilityName] > 0) {
            console.log(`${abilityName} is on cooldown: ${this.cooldowns[abilityName]}s remaining`);
            return false;
        }
        
        // Check if snake has enough fire meter
        const abilityCost = FIRE_ABILITIES[abilityName].cost;
        if (this.game.fireMeter < abilityCost) {
            console.log(`Not enough fire meter for ${abilityName}. Need ${abilityCost}, have ${this.game.fireMeter}`);
            return false;
        }
        
        // Reduce fire meter
        this.game.fireMeter -= abilityCost;
        
        // Set cooldown
        this.cooldowns[abilityName] = FIRE_ABILITIES[abilityName].cooldown;
        
        // Create fire effect based on ability
        let success = false;
        switch (abilityName) {
            case 'FLAME_BREATH':
                success = this.createFlameBreath(snakeHead, direction);
                break;
            case 'FIRE_SHIELD':
                success = this.createFireShield(snakeHead);
                break;
            case 'BURNING_TRAIL':
                success = this.activateBurningTrail();
                break;
            case 'INFERNO_BURST':
                success = this.createInfernoBurst(snakeHead);
                break;
        }
        
        return success;
    }
    
    createFlameBreath(snakeHead, direction) {
        const effect = new FireEffect(
            snakeHead.x,
            snakeHead.y,
            'FLAME_BREATH',
            direction,
            'FLAME_BREATH'
        );
        
        this.activeEffects.push(effect);
        
        // Add particles for visual effect
        this.game.particles.createParticleEffect(
            'FIRE',
            snakeHead.x,
            snakeHead.y,
            direction,
            0.5
        );
        
        return true;
    }
    
    createFireShield(snakeHead) {
        const effect = new FireEffect(
            snakeHead.x,
            snakeHead.y,
            'FIRE_SHIELD',
            { x: 0, y: 0 },
            'FIRE_SHIELD'
        );
        
        this.activeEffects.push(effect);
        this.game.activeEffects.fireShield = {
            active: true,
            timeRemaining: FIRE_ABILITIES.FIRE_SHIELD.duration
        };
        
        // Add particles for visual effect
        this.game.particles.createParticleEffect(
            'TRANSFORMATION',
            snakeHead.x,
            snakeHead.y,
            { x: 0, y: 0 },
            0.5
        );
        
        return true;
    }
    
    activateBurningTrail() {
        this.game.activeEffects.burningTrail = {
            active: true,
            timeRemaining: FIRE_ABILITIES.BURNING_TRAIL.duration
        };
        
        return true;
    }
    
    // Fixed INFERNO_BURST method
    createInfernoBurst(snakeHead) {
        // Create effect without try/catch block since we're handling errors better
        const effect = new FireEffect(
            snakeHead.x,
            snakeHead.y,
            'INFERNO_BURST',
            { x: 0, y: 0 },
            'INFERNO_BURST'
        );
        
        // Add to active effects
        this.activeEffects.push(effect);
        
        // Add particles for visual effect
        this.game.particles.createParticleEffect(
            'FIRE',
            snakeHead.x,
            snakeHead.y,
            { x: 0, y: 0 },
            0.8
        );
        
        return true;
    }
    
    createBurningTrailEffect(x, y) {
        const effect = new FireEffect(
            x,
            y,
            'BURNING_TRAIL',
            { x: 0, y: 0 },
            'BURNING_TRAIL'
        );
        
        this.activeEffects.push(effect);
    }
    
    draw(ctx, gridSize) {
        // Draw all active fire effects
        for (const effect of this.activeEffects) {
            effect.draw(ctx, gridSize);
        }
    }
    
    getCooldownPercent(abilityName) {
        // Calculate cooldown percentage for UI
        if (!this.cooldowns[abilityName] || !FIRE_ABILITIES[abilityName]) {
            return 0;
        }
        
        return this.cooldowns[abilityName] / FIRE_ABILITIES[abilityName].cooldown;
    }
}