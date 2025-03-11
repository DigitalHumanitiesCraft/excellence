// The One Snake - Game Entities (Collectibles, Horses, Portals, Obstacles)

// Base Entity Class
class Entity {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.active = true;
    }
    
    update(deltaTime) {
        // Base update method, to be overridden
    }
    
    draw(ctx, gridSize) {
        // Base draw method, to be overridden
    }
}

// Collectible Class
class Collectible extends Entity {
    constructor(x, y, value = COLLECTIBLE_VALUE) {
        super(x, y, 'collectible');
        this.value = value;
        this.pulsePhase = Math.random() * Math.PI * 2; // Random starting phase for visual effect
    }
    
    update(deltaTime) {
        // Update pulse animation
        this.pulsePhase += deltaTime * 2;
        if (this.pulsePhase > Math.PI * 2) {
            this.pulsePhase -= Math.PI * 2;
        }
    }
    
    draw(ctx, gridSize) {
        // Draw collectible with pulsing effect
        const pulseFactor = 0.15 * Math.sin(this.pulsePhase) + 0.85;
        const size = gridSize * pulseFactor;
        const offset = (gridSize - size) / 2;
        
        ctx.fillStyle = '#FFD700'; // Gold color
        ctx.beginPath();
        ctx.arc(
            this.x * gridSize + gridSize / 2,
            this.y * gridSize + gridSize / 2,
            size / 2,
            0,
            Math.PI * 2
        );
        ctx.fill();
        
        // Add sparkle effect
        ctx.fillStyle = '#FFFFFF';
        const sparkSize = size / 5;
        ctx.fillRect(
            this.x * gridSize + gridSize / 2 - sparkSize / 2,
            this.y * gridSize + gridSize / 2 - sparkSize / 2,
            sparkSize,
            sparkSize
        );
    }
}

// Horse Class
class Horse extends Entity {
    constructor(x, y, type) {
        super(x, y, 'horse');
        this.horseType = type;
        this.properties = HORSE_TYPES[type];
        this.speed = this.properties.speed;
        this.effect = this.properties.effect;
        this.duration = this.properties.duration;
        this.direction = { x: 0, y: 0 }; // Movement direction
        this.moveTimer = 0;
        this.moveInterval = 0.5; // Time between movements
    }
    
    update(deltaTime, snakeHead) {
        // Update movement timer
        this.moveTimer += deltaTime;
        
        // Move horse based on its behavior
        if (this.moveTimer >= this.moveInterval) {
            this.moveTimer = 0;
            
            // Determine movement based on horse type
            switch (this.horseType) {
                case 'NAZGUL_STEED':
                    // Chase player
                    this.chaseTarget(snakeHead);
                    break;
                case 'ROHIRRIM':
                    // Move in formation (group behavior would be implemented here)
                    this.moveInDirection(this.getRandomDirection());
                    break;
                default:
                    // Random movement for other horses
                    if (Math.random() < 0.7) { // 70% chance to move
                        this.moveInDirection(this.getRandomDirection());
                    }
            }
        }
    }
    
    chaseTarget(target) {
        // Simple chase logic - move toward target
        const dx = target.x - this.x;
        const dy = target.y - this.y;
        
        // Determine primary direction to move
        if (Math.abs(dx) > Math.abs(dy)) {
            this.moveInDirection({
                x: dx > 0 ? 1 : -1,
                y: 0
            });
        } else {
            this.moveInDirection({
                x: 0,
                y: dy > 0 ? 1 : -1
            });
        }
    }
    
    moveInDirection(direction) {
        this.x += direction.x;
        this.y += direction.y;
        this.direction = direction;
    }
    
    getRandomDirection() {
        const directions = Object.values(DIRECTIONS);
        return directions[Math.floor(Math.random() * directions.length)];
    }
    
    draw(ctx, gridSize) {
        // Draw horse based on type
        let color;
        
        switch (this.horseType) {
            case 'SHADOWFAX':
                color = '#FFFFFF'; // White
                break;
            case 'MEARAS':
                color = '#F5F5DC'; // Beige
                break;
            case 'ROHIRRIM':
                color = '#8B4513'; // Brown
                break;
            case 'NAZGUL_STEED':
                color = '#000000'; // Black
                break;
            case 'BILL_PONY':
                color = '#DEB887'; // Light brown
                break;
            case 'ASFALOTH':
                color = '#DCDCDC'; // Light grey
                break;
            case 'BREGO':
                color = '#A52A2A'; // Dark brown
                break;
            default:
                color = '#8B4513'; // Default brown
        }
        
        // Draw horse body
        ctx.fillStyle = color;
        ctx.fillRect(
            this.x * gridSize,
            this.y * gridSize,
            gridSize,
            gridSize
        );
        
        // Draw horse details (eyes, direction indicators)
        ctx.fillStyle = '#000000';
        const eyeSize = gridSize / 8;
        const eyeOffset = gridSize / 4;
        
        // Eyes based on direction
        if (this.direction.x > 0) { // Facing right
            ctx.fillRect(this.x * gridSize + gridSize - eyeOffset, this.y * gridSize + eyeOffset, eyeSize, eyeSize);
        } else if (this.direction.x < 0) { // Facing left
            ctx.fillRect(this.x * gridSize + eyeOffset, this.y * gridSize + eyeOffset, eyeSize, eyeSize);
        } else if (this.direction.y < 0) { // Facing up
            ctx.fillRect(this.x * gridSize + eyeOffset, this.y * gridSize + eyeOffset, eyeSize, eyeSize);
            ctx.fillRect(this.x * gridSize + gridSize - eyeOffset - eyeSize, this.y * gridSize + eyeOffset, eyeSize, eyeSize);
        } else { // Facing down or default
            ctx.fillRect(this.x * gridSize + eyeOffset, this.y * gridSize + eyeOffset, eyeSize, eyeSize);
            ctx.fillRect(this.x * gridSize + gridSize - eyeOffset - eyeSize, this.y * gridSize + eyeOffset, eyeSize, eyeSize);
        }
    }
}

// Portal Class
class Portal extends Entity {
    constructor(x, y, type, exitPortal = null) {
        super(x, y, 'portal');
        this.portalType = type;
        this.properties = PORTAL_TYPES[type];
        this.exitPortal = exitPortal;
        this.cooldownTimer = 0;
        this.isActive = true;
        this.animationPhase = 0;
    }
    
    update(deltaTime) {
        // Update cooldown timer
        if (this.cooldownTimer > 0) {
            this.cooldownTimer -= deltaTime;
            if (this.cooldownTimer <= 0) {
                this.isActive = true;
            }
        }
        
        // Update animation
        this.animationPhase += deltaTime * 2;
        if (this.animationPhase > Math.PI * 2) {
            this.animationPhase -= Math.PI * 2;
        }
    }
    
    teleport() {
        // Check if portal is active
        if (!this.isActive) return null;
        
        // Check if exit portal exists
        if (!this.exitPortal) return null;
        
        // Trigger cooldown
        this.isActive = false;
        this.cooldownTimer = this.properties.cooldown;
        
        // Apply cooldown to exit portal if not one-way
        if (!this.properties.oneWay) {
            this.exitPortal.isActive = false;
            this.exitPortal.cooldownTimer = this.exitPortal.properties.cooldown;
        }
        
        // Return exit portal position
        return { x: this.exitPortal.x, y: this.exitPortal.y };
    }
    
    draw(ctx, gridSize) {
        // Draw portal based on type
        let color;
        
        switch (this.portalType) {
            case 'PALANTIR':
                color = '#0000FF'; // Blue
                break;
            case 'MORIA':
                color = '#808080'; // Grey
                break;
            case 'BLACK_GATE':
                color = '#000000'; // Black
                break;
            case 'GREY_HAVENS':
                color = '#FFFFFF'; // White
                break;
            default:
                color = '#0000FF'; // Default blue
        }
        
        // Portal base
        ctx.fillStyle = color;
        const pulseFactor = this.isActive ? (0.1 * Math.sin(this.animationPhase) + 0.9) : 0.7;
        const size = gridSize * pulseFactor;
        const offset = (gridSize - size) / 2;
        
        ctx.beginPath();
        ctx.arc(
            this.x * gridSize + gridSize / 2,
            this.y * gridSize + gridSize / 2,
            size / 2,
            0,
            Math.PI * 2
        );
        ctx.fill();
        
        // Portal swirl effect
        const swirlColor = this.isActive ? '#FFFFFF' : '#888888';
        ctx.strokeStyle = swirlColor;
        ctx.lineWidth = 2;
        
        ctx.beginPath();
        for (let i = 0; i < Math.PI * 2; i += Math.PI / 8) {
            const radius = size / 4 * (0.5 + 0.5 * Math.sin(i * 3 + this.animationPhase));
            const x = this.x * gridSize + gridSize / 2 + radius * Math.cos(i);
            const y = this.y * gridSize + gridSize / 2 + radius * Math.sin(i);
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.closePath();
        ctx.stroke();
    }
}

// Obstacle Class
class Obstacle extends Entity {
    constructor(x, y, obstacleType) {
        super(x, y, 'obstacle');
        this.obstacleType = obstacleType;
    }
    
    draw(ctx, gridSize) {
        // Draw obstacle based on type
        let color;
        
        switch (this.obstacleType) {
            case 'hills':
                color = '#8F9779'; // Olive green
                break;
            case 'trees':
                color = '#228B22'; // Forest green
                break;
            case 'water':
                color = '#1E90FF'; // Blue
                break;
            case 'bridges':
                color = '#8B4513'; // Brown
                break;
            case 'rocks':
                color = '#696969'; // Dark grey
                break;
            case 'spiders':
                color = '#800080'; // Purple
                break;
            case 'enemies':
                color = '#8B0000'; // Dark red
                break;
            case 'walls':
                color = '#2F4F4F'; // Dark slate
                break;
            case 'chasms':
                color = '#000000'; // Black
                break;
            case 'lava':
                color = '#FF4500'; // Red-orange
                break;
            default:
                color = '#808080'; // Default grey
        }
        
        // Draw obstacle
        ctx.fillStyle = color;
        ctx.fillRect(
            this.x * gridSize,
            this.y * gridSize,
            gridSize,
            gridSize
        );
        
        // Add texture details based on obstacle type
        ctx.fillStyle = this.getLighterColor(color);
        
        switch (this.obstacleType) {
            case 'hills':
                // Draw hill curve
                ctx.beginPath();
                ctx.arc(
                    this.x * gridSize + gridSize / 2,
                    this.y * gridSize + gridSize * 1.5,
                    gridSize,
                    Math.PI, 
                    Math.PI * 2
                );
                ctx.fill();
                break;
                
            case 'trees':
                // Draw tree trunk
                ctx.fillStyle = '#8B4513'; // Brown
                ctx.fillRect(
                    this.x * gridSize + gridSize * 0.4,
                    this.y * gridSize + gridSize * 0.5,
                    gridSize * 0.2,
                    gridSize * 0.5
                );
                
                // Draw tree top
                ctx.fillStyle = '#006400'; // Dark green
                ctx.beginPath();
                ctx.moveTo(this.x * gridSize + gridSize * 0.2, this.y * gridSize + gridSize * 0.5);
                ctx.lineTo(this.x * gridSize + gridSize * 0.8, this.y * gridSize + gridSize * 0.5);
                ctx.lineTo(this.x * gridSize + gridSize * 0.5, this.y * gridSize);
                ctx.fill();
                break;
                
            case 'lava':
                // Draw lava bubbles
                for (let i = 0; i < 3; i++) {
                    const bubbleX = this.x * gridSize + Math.random() * gridSize;
                    const bubbleY = this.y * gridSize + Math.random() * gridSize;
                    const bubbleSize = gridSize * 0.15;
                    
                    ctx.fillStyle = '#FFFF00'; // Yellow
                    ctx.beginPath();
                    ctx.arc(bubbleX, bubbleY, bubbleSize, 0, Math.PI * 2);
                    ctx.fill();
                }
                break;
                
            // Additional texture patterns could be added for other obstacle types
        }
    }
    
    getLighterColor(color) {
        // Simple function to get a lighter version of a color
        if (color.startsWith('#')) {
            // Convert hex to RGB
            const r = parseInt(color.substr(1, 2), 16);
            const g = parseInt(color.substr(3, 2), 16);
            const b = parseInt(color.substr(5, 2), 16);
            
            // Lighten
            const lighterR = Math.min(255, r + 40);
            const lighterG = Math.min(255, g + 40);
            const lighterB = Math.min(255, b + 40);
            
            // Convert back to hex
            return `#${lighterR.toString(16).padStart(2, '0')}${lighterG.toString(16).padStart(2, '0')}${lighterB.toString(16).padStart(2, '0')}`;
        }
        
        return '#FFFFFF'; // Default white if not hex
    }
}