// The One Snake - Level Generation (Fixed Grid Issue)

class LevelGenerator {
    constructor(game) {
        this.game = game;
    }
    
    generateLevel(levelConfig) {
        // If snake not initialized, skip level generation
        if (!this.game.snake) {
            console.error("Snake not initialized, skipping level generation");
            return;
        }

        // Clear existing level objects
        this.game.obstacles = [];
        this.game.collectibles = [];
        this.game.portals = [];
        
        // Calculate grid dimensions with safety checks
        let gridWidth = Math.floor(this.game.canvas.width / GRID_SIZE);
        let gridHeight = Math.floor(this.game.canvas.height / GRID_SIZE);
        
        // Debug log the actual values
        console.log(`Canvas size: ${this.game.canvas.width}x${this.game.canvas.height}, GRID_SIZE: ${GRID_SIZE}`);
        
        // Ensure minimum grid size
        if (gridWidth <= 0 || gridHeight <= 0) {
            console.error(`Invalid grid dimensions: ${gridWidth}x${gridHeight}. Using default 20x15.`);
            gridWidth = 20;
            gridHeight = 15;
        }
        
        console.log(`Generating level ${levelConfig.id} with grid size: ${gridWidth}x${gridHeight}`);
        
        // Create a grid representation to track occupied positions
        this.grid = Array(gridWidth).fill().map(() => Array(gridHeight).fill(false));
        
        // Mark snake positions as occupied
        this.markSnakePositions();
        
        // Generate level elements with difficulty based on level
        const difficultyMultiplier = levelConfig.difficulty || 1;
        
        // Generate objects in order of importance
        this.generateObstacles(levelConfig, Math.floor(5 * difficultyMultiplier));
        this.generateCollectibles(10);  // Always at least 10 collectibles
        this.generatePortals(levelConfig, Math.max(1, Math.floor(levelConfig.portalDensity * 3)));
        
        console.log(`Level generation complete. Created: ${this.game.obstacles.length} obstacles, ${this.game.collectibles.length} collectibles, ${this.game.portals.length} portals`);
    }
    
    // Mark snake positions as occupied in the grid
    markSnakePositions() {
        if (!this.game.snake || !this.game.snake.segments) return;
        
        // Mark each snake segment and a small area around the head as occupied
        for (const segment of this.game.snake.segments) {
            if (this.isValidPosition(segment.x, segment.y)) {
                this.grid[segment.x][segment.y] = true;
                
                // Extra clearance around the head (first segment)
                if (segment === this.game.snake.segments[0]) {
                    // Mark a 3x3 area around head as occupied for safety
                    for (let dx = -1; dx <= 1; dx++) {
                        for (let dy = -1; dy <= 1; dy++) {
                            const nx = segment.x + dx;
                            const ny = segment.y + dy;
                            if (this.isValidPosition(nx, ny)) {
                                this.grid[nx][ny] = true;
                            }
                        }
                    }
                }
            }
        }
    }
    
    // Check if a position is within grid boundaries
    isValidPosition(x, y) {
        return x >= 0 && x < this.grid.length && y >= 0 && y < this.grid[0].length;
    }
    
    // Check if a position is free (not occupied and within boundaries)
    isPositionFree(x, y) {
        return this.isValidPosition(x, y) && !this.grid[x][y];
    }
    
    // Mark a position as occupied
    markPosition(x, y) {
        if (this.isValidPosition(x, y)) {
            this.grid[x][y] = true;
            return true;
        }
        return false;
    }
    
    // Find a free position in the grid
    findFreePosition() {
        if (!this.grid || !this.grid.length || !this.grid[0].length) {
            console.error("Grid not properly initialized");
            return { x: 0, y: 0 }; // Return a fallback position
        }
        
        const gridWidth = this.grid.length;
        const gridHeight = this.grid[0].length;
        
        // First try: Random position (20 attempts)
        for (let i = 0; i < 20; i++) {
            const x = Math.floor(Math.random() * gridWidth);
            const y = Math.floor(Math.random() * gridHeight);
            
            if (this.isPositionFree(x, y)) {
                return { x, y };
            }
        }
        
        // Second try: Scan the grid systematically
        for (let x = 0; x < gridWidth; x += 2) { // Skip every other cell for efficiency
            for (let y = 0; y < gridHeight; y += 2) {
                if (this.isPositionFree(x, y)) {
                    return { x, y };
                }
            }
        }
        
        // Last try: Check every single cell
        for (let x = 0; x < gridWidth; x++) {
            for (let y = 0; y < gridHeight; y++) {
                if (this.isPositionFree(x, y)) {
                    return { x, y };
                }
            }
        }
        
        // No free positions found - return a position in the middle
        console.warn("No free positions found in grid, using center position");
        return { 
            x: Math.floor(gridWidth / 2), 
            y: Math.floor(gridHeight / 2) 
        };
    }
    
    // Generate obstacles based on level config
    generateObstacles(levelConfig, minCount) {
        console.log(`Generating obstacles for level ${levelConfig.id}, minimum count: ${minCount}`);
        
        // Get the obstacle types for this level
        const obstacleTypes = levelConfig.obstacles || ['rocks'];
        
        // Place obstacles
        let count = 0;
        
        // Create obstacle clusters
        while (count < minCount) {
            // Select random position for cluster center
            const center = this.findFreePosition();
            if (!center) break; // No more free positions
            
            // Choose a random obstacle type
            const obstacleType = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
            
            // Determine cluster size (1-5 obstacles)
            const clusterSize = Math.floor(Math.random() * 5) + 1;
            
            // Create the first obstacle at center
            this.game.obstacles.push(new Obstacle(center.x, center.y, obstacleType));
            this.markPosition(center.x, center.y);
            count++;
            
            // Add additional obstacles in adjacent positions
            for (let i = 1; i < clusterSize && count < minCount; i++) {
                // Try adjacent positions in random order
                const directions = [
                    { dx: 1, dy: 0 }, { dx: -1, dy: 0 }, 
                    { dx: 0, dy: 1 }, { dx: 0, dy: -1 },
                    { dx: 1, dy: 1 }, { dx: -1, dy: -1 },
                    { dx: 1, dy: -1 }, { dx: -1, dy: 1 }
                ];
                
                // Shuffle directions
                for (let j = directions.length - 1; j > 0; j--) {
                    const k = Math.floor(Math.random() * (j + 1));
                    [directions[j], directions[k]] = [directions[k], directions[j]];
                }
                
                // Try each direction
                for (const dir of directions) {
                    const nx = center.x + dir.dx;
                    const ny = center.y + dir.dy;
                    
                    if (this.isPositionFree(nx, ny)) {
                        this.game.obstacles.push(new Obstacle(nx, ny, obstacleType));
                        this.markPosition(nx, ny);
                        count++;
                        break;
                    }
                }
            }
        }
        
        console.log(`Generated ${count} obstacles`);
    }
    
    // Generate collectibles throughout the level
    generateCollectibles(minCount) {
        console.log(`Generating collectibles, minimum count: ${minCount}`);
        
        // Place collectibles evenly across the grid
        let count = 0;
        
        while (count < minCount) {
            const position = this.findFreePosition();
            if (!position) break; // No more free positions
            
            this.game.collectibles.push(new Collectible(position.x, position.y));
            this.markPosition(position.x, position.y);
            count++;
        }
        
        console.log(`Generated ${count} collectibles`);
    }
    
    // Generate portal pairs
    generatePortals(levelConfig, minPairs) {
        console.log(`Generating portal pairs, minimum pairs: ${minPairs}`);
        
        // Get portal types based on level
        let portalTypes = ['PALANTIR']; // Default portal type
        
        // Add level-specific portal types
        switch (levelConfig.id) {
            case 'mirkwood':
            case 'rohan':
                portalTypes.push('GREY_HAVENS');
                break;
            case 'moria':
                portalTypes.push('MORIA');
                break;
            case 'mordor':
                portalTypes.push('BLACK_GATE');
                break;
        }
        
        // Create portal pairs
        let pairsCreated = 0;
        
        while (pairsCreated < minPairs) {
            // Find position for entrance portal
            const entrancePos = this.findFreePosition();
            if (!entrancePos) break; // No more free positions
            
            // Choose a position for exit portal that's far away
            const exitPos = this.findDistantPosition(entrancePos);
            if (!exitPos) break; // Couldn't find suitable exit position
            
            // Choose a portal type
            const portalType = portalTypes[Math.floor(Math.random() * portalTypes.length)];
            
            // Create the portal pair
            const exitPortal = new Portal(exitPos.x, exitPos.y, portalType);
            const entrancePortal = new Portal(entrancePos.x, entrancePos.y, portalType, exitPortal);
            
            this.game.portals.push(entrancePortal);
            this.game.portals.push(exitPortal);
            
            // Mark positions as occupied
            this.markPosition(entrancePos.x, entrancePos.y);
            this.markPosition(exitPos.x, exitPos.y);
            
            pairsCreated++;
        }
        
        console.log(`Generated ${pairsCreated} portal pairs`);
    }
    
    // Find a position that's far away from a given position
    findDistantPosition(sourcePos, minDistance = 8) {
        const gridWidth = this.grid.length;
        const gridHeight = this.grid[0].length;
        
        // First try: find a position on the opposite side of the grid
        const oppositeX = (sourcePos.x + Math.floor(gridWidth / 2)) % gridWidth;
        const oppositeY = (sourcePos.y + Math.floor(gridHeight / 2)) % gridHeight;
        
        // Check if this position is free
        if (this.isPositionFree(oppositeX, oppositeY)) {
            return { x: oppositeX, y: oppositeY };
        }
        
        // Second try: Check positions around the opposite side
        for (let radius = 1; radius < 5; radius++) {
            for (let dx = -radius; dx <= radius; dx++) {
                for (let dy = -radius; dy <= radius; dy++) {
                    // Skip if not on the perimeter
                    if (Math.abs(dx) !== radius && Math.abs(dy) !== radius) continue;
                    
                    const x = (oppositeX + dx + gridWidth) % gridWidth;
                    const y = (oppositeY + dy + gridHeight) % gridHeight;
                    
                    if (this.isPositionFree(x, y)) {
                        return { x, y };
                    }
                }
            }
        }
        
        // Third try: Find any free position that meets minimum distance
        for (let x = 0; x < gridWidth; x++) {
            for (let y = 0; y < gridHeight; y++) {
                if (this.isPositionFree(x, y)) {
                    const distance = Math.sqrt(
                        Math.pow(x - sourcePos.x, 2) + 
                        Math.pow(y - sourcePos.y, 2)
                    );
                    
                    if (distance >= minDistance) {
                        return { x, y };
                    }
                }
            }
        }
        
        // Last resort: Any free position
        return this.findFreePosition();
    }
    
    // Used by Game to spawn a new collectible when one is collected
    spawnCollectible() {
        // Recreate grid to reflect current game state
        const gridWidth = Math.floor(this.game.canvas.width / GRID_SIZE);
        const gridHeight = Math.floor(this.game.canvas.height / GRID_SIZE);
        
        // Ensure minimum grid size
        const safeGridWidth = Math.max(gridWidth, 20);
        const safeGridHeight = Math.max(gridHeight, 15);
        
        this.grid = Array(safeGridWidth).fill().map(() => Array(safeGridHeight).fill(false));
        this.markCurrentObjects();
        
        // Find a free position
        const position = this.findFreePosition();
        if (!position) {
            console.warn("Failed to spawn a new collectible - no free positions");
            return false;
        }
        
        // Create new collectible
        this.game.collectibles.push(new Collectible(position.x, position.y));
        console.log(`Spawned new collectible at (${position.x}, ${position.y})`);
        return true;
    }
    
    // Used by Game to spawn a new horse
    spawnHorse() {
        // Recreate grid to reflect current game state
        const gridWidth = Math.floor(this.game.canvas.width / GRID_SIZE);
        const gridHeight = Math.floor(this.game.canvas.height / GRID_SIZE);
        
        // Ensure minimum grid size
        const safeGridWidth = Math.max(gridWidth, 20);
        const safeGridHeight = Math.max(gridHeight, 15);
        
        this.grid = Array(safeGridWidth).fill().map(() => Array(safeGridHeight).fill(false));
        this.markCurrentObjects();
        
        // Try to place horse at the edge of the grid
        const edges = [
            // Top edge
            ...Array(safeGridWidth).fill().map((_, x) => ({ x, y: 0 })),
            // Right edge
            ...Array(safeGridHeight).fill().map((_, y) => ({ x: safeGridWidth - 1, y })),
            // Bottom edge
            ...Array(safeGridWidth).fill().map((_, x) => ({ x, y: safeGridHeight - 1 })),
            // Left edge
            ...Array(safeGridHeight).fill().map((_, y) => ({ x: 0, y }))
        ];
        
        // Shuffle the edges array
        for (let i = edges.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [edges[i], edges[j]] = [edges[j], edges[i]];
        }
        
        // Find first free edge position
        let position = null;
        for (const pos of edges) {
            if (this.isPositionFree(pos.x, pos.y)) {
                position = pos;
                break;
            }
        }
        
        // If no edge position is free, find any free position
        if (!position) {
            position = this.findFreePosition();
            if (!position) {
                console.warn("Failed to spawn a new horse - no free positions");
                return false;
            }
        }
        
        // Select horse type based on rarity
        const horseType = this.selectRandomHorseType();
        
        // Create new horse
        this.game.horses.push(new Horse(position.x, position.y, horseType));
        console.log(`Spawned ${horseType} horse at (${position.x}, ${position.y})`);
        return true;
    }
    
    // Mark all current game objects in the grid
    markCurrentObjects() {
        // Mark snake positions
        this.markSnakePositions();
        
        // Mark obstacles
        for (const obstacle of this.game.obstacles) {
            if (this.isValidPosition(obstacle.x, obstacle.y)) {
                this.grid[obstacle.x][obstacle.y] = true;
            }
        }
        
        // Mark collectibles
        for (const collectible of this.game.collectibles) {
            if (this.isValidPosition(collectible.x, collectible.y)) {
                this.grid[collectible.x][collectible.y] = true;
            }
        }
        
        // Mark portals
        for (const portal of this.game.portals) {
            if (this.isValidPosition(portal.x, portal.y)) {
                this.grid[portal.x][portal.y] = true;
            }
        }
        
        // Mark horses
        for (const horse of this.game.horses) {
            if (this.isValidPosition(horse.x, horse.y)) {
                this.grid[horse.x][horse.y] = true;
            }
        }
    }
    
    // Select a random horse type based on rarity
    selectRandomHorseType() {
        // Create a weighted selection based on rarity
        const types = Object.keys(HORSE_TYPES);
        const weights = types.map(type => HORSE_TYPES[type].rarity);
        
        // Calculate total weight
        const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
        
        // Generate random value
        const random = Math.random() * totalWeight;
        
        // Find selected type
        let cumulativeWeight = 0;
        for (let i = 0; i < types.length; i++) {
            cumulativeWeight += weights[i];
            if (random <= cumulativeWeight) {
                return types[i];
            }
        }
        
        // Fallback
        return types[0];
    }
}