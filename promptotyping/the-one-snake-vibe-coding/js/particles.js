// The One Snake - Particle System

class Particle {
    constructor(x, y, type, direction, lifetime) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.typeConfig = PARTICLE_TYPES[type];
        
        // Set random velocity based on direction
        this.velocity = {
            x: direction.x * (Math.random() * 30 + 10) + (Math.random() * 20 - 10),
            y: direction.y * (Math.random() * 30 + 10) + (Math.random() * 20 - 10)
        };
        
        // Set random size within range
        this.size = this.getRandomInRange(this.typeConfig.size);
        
        // Set random color from palette
        this.color = this.typeConfig.colors[Math.floor(Math.random() * this.typeConfig.colors.length)];
        
        // Set random lifetime within range
        this.maxLifetime = lifetime || this.getRandomInRange(this.typeConfig.lifetime);
        this.lifetime = 0;
        
        // Set random rotation
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() * 2 - 1) * Math.PI;
    }
    
    getRandomInRange(range) {
        return range[0] + Math.random() * (range[1] - range[0]);
    }
    
    update(deltaTime) {
        // Update position
        this.x += this.velocity.x * deltaTime;
        this.y += this.velocity.y * deltaTime;
        
        // Apply gravity for some particle types
        if (this.type === 'FIRE' || this.type === 'SMOKE') {
            this.velocity.y -= 20 * deltaTime; // Particles rise upward
        }
        
        // Apply drag
        this.velocity.x *= 0.95;
        this.velocity.y *= 0.95;
        
        // Update rotation
        this.rotation += this.rotationSpeed * deltaTime;
        
        // Update lifetime
        this.lifetime += deltaTime;
        
        // Return true if particle is still alive
        return this.lifetime < this.maxLifetime;
    }
    
    draw(ctx, gridSize) {
        // Calculate alpha based on lifetime
        const lifeProgress = this.lifetime / this.maxLifetime;
        const alpha = lifeProgress < 0.2 ? lifeProgress * 5 : 1 - ((lifeProgress - 0.2) / 0.8);
        
        // Calculate size based on lifetime (some particles grow/shrink)
        let sizeFactor;
        if (this.type === 'FIRE') {
            sizeFactor = 1 - lifeProgress * 0.5; // Fire particles shrink
        } else if (this.type === 'SMOKE') {
            sizeFactor = 0.5 + lifeProgress * 0.5; // Smoke particles grow
        } else {
            sizeFactor = 1 - Math.abs(lifeProgress - 0.5) * 0.5; // Others pulse
        }
        
        const drawSize = this.size * sizeFactor;
        
        // Save context for rotation
        ctx.save();
        
        // Translate to particle position
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        // Set fill style with alpha
        ctx.globalAlpha = alpha;
        ctx.fillStyle = this.color;
        
        // Draw particle shape based on type
        switch (this.type) {
            case 'FIRE':
                // Draw fire as a circle
                ctx.beginPath();
                ctx.arc(0, 0, drawSize, 0, Math.PI * 2);
                ctx.fill();
                break;
                
            case 'SMOKE':
                // Draw smoke as a circle
                ctx.beginPath();
                ctx.arc(0, 0, drawSize, 0, Math.PI * 2);
                ctx.fill();
                break;
                
            case 'PORTAL':
                // Draw portal particles as stars
                ctx.beginPath();
                for (let i = 0; i < 5; i++) {
                    const angle = i * Math.PI * 2 / 5 - Math.PI / 2;
                    const x = Math.cos(angle) * drawSize;
                    const y = Math.sin(angle) * drawSize;
                    
                    if (i === 0) {
                        ctx.moveTo(x, y);
                    } else {
                        ctx.lineTo(x, y);
                    }
                }
                ctx.closePath();
                ctx.fill();
                break;
                
            case 'TRANSFORMATION':
                // Draw transformation particles as diamonds
                ctx.beginPath();
                ctx.moveTo(0, -drawSize);
                ctx.lineTo(drawSize, 0);
                ctx.lineTo(0, drawSize);
                ctx.lineTo(-drawSize, 0);
                ctx.closePath();
                ctx.fill();
                break;
                
            default:
                // Default to circle
                ctx.beginPath();
                ctx.arc(0, 0, drawSize, 0, Math.PI * 2);
                ctx.fill();
        }
        
        // Restore context
        ctx.globalAlpha = 1;
        ctx.restore();
    }
}

class ParticleSystem {
    constructor() {
        this.particles = [];
        this.maxParticles = 500; // Limit to prevent performance issues
    }
    
    update(deltaTime) {
        // Update all particles and remove dead ones
        this.particles = this.particles.filter(particle => particle.update(deltaTime));
    }
    
    draw(ctx) {
        // Draw all particles
        for (const particle of this.particles) {
            particle.draw(ctx);
        }
    }
    
    createParticleEffect(type, gridX, gridY, direction = { x: 0, y: 0 }, duration = 0.5) {
        // Convert grid position to pixel position
        const x = gridX * GRID_SIZE + GRID_SIZE / 2;
        const y = gridY * GRID_SIZE + GRID_SIZE / 2;
        
        // Calculate number of particles to emit
        const emissionRange = PARTICLE_TYPES[type].emission;
        const particleCount = Math.floor(this.getRandomInRange(emissionRange) * duration);
        
        // Add particles
        for (let i = 0; i < particleCount; i++) {
            // Only add if below max limit
            if (this.particles.length < this.maxParticles) {
                this.particles.push(new Particle(x, y, type, direction));
            }
        }
    }
    
    createParticle(x, y, type, direction = { x: 0, y: 0 }, lifetime = null) {
        // Only add if below max limit
        if (this.particles.length < this.maxParticles) {
            this.particles.push(new Particle(x, y, type, direction, lifetime));
        }
    }
    
    getRandomInRange(range) {
        return range[0] + Math.random() * (range[1] - range[0]);
    }
    
    clear() {
        // Clear all particles
        this.particles = [];
    }
}