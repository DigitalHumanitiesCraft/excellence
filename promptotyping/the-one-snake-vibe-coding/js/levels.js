// The One Snake - Level Generation

class LevelGenerator {
    constructor(game) {
        this.game = game;
    }
    
    generateLevel(levelConfig) {
        // Clear existing level
        this.game.obstacles = [];
        this.game.collectibles = [];
        this.game.portals = [];
        
        const gridWidth = Math.floor(this.game.canvas.width / GRID_SIZE);
        const gridHeight = Math.floor(this.game.canvas.height / GRID_SIZE);
        
        // Generate circular paths
        this.generateCircularPaths(levelConfig, gridWidth, gridHeight);
        
        // Place obstacles
        this.placeObstacles(levelConfig, gridWidth, gridHeight);
        
        // Place collectibles
        this.placeCollectibles(20, gridWidth, gridHeight); // 20 collectibles initially
        
        // Place portals
        this.placePortals(levelConfig, gridWidth, gridHeight);
        
        // Ensure at least some objects are created (for test purposes)
        this.ensureMinimumObjects(gridWidth, gridHeight, levelConfig);
    }
    
    ensureMinimumObjects(gridWidth, gridHeight, levelConfig) {
        // Ensure at least some obstacles exist
        if (this.game.obstacles.length === 0) {
            // Add a few obstacles based on level difficulty
            const minObstacles = 5 * levelConfig.difficulty;
            for (let i = 0; i < minObstacles; i++) {
                const x = Math.floor(Math.random() * gridWidth);
                const y = Math.floor(Math.random() * gridHeight);
                
                // Skip if too close to snake start
                const snakeStartX = Math.floor(gridWidth / 2);
                const snakeStartY = Math.floor(gridHeight / 2);
                const distanceToSnake = Math.sqrt(
                    Math.pow(x - snakeStartX, 2) + 
                    Math.pow(y - snakeStartY, 2)
                );
                
                if (distanceToSnake < 5) continue;
                
                // Add obstacle with a type from the level
                const obstacleType = levelConfig.obstacles[
                    Math.floor(Math.random() * levelConfig.obstacles.length)
                ];
                this.game.obstacles.push(new Obstacle(x, y, obstacleType));
            }
        }
        
        // Ensure at least some collectibles exist
        if (this.game.collectibles.length === 0) {
            const minCollectibles = 10;
            for (let i = 0; i < minCollectibles; i++) {
                const x = Math.floor(Math.random() * gridWidth);
                const y = Math.floor(Math.random() * gridHeight);
                
                // Skip if position is occupied
                if (this.isPositionOccupied(x, y)) continue;
                
                this.game.collectibles.push(new Collectible(x, y));
            }
        }
        
        // Ensure at least some portals exist
        if (this.game.portals.length === 0) {
            const minPortalPairs = Math.max(1, Math.floor(levelConfig.portalDensity * 3));
            
            for (let i = 0; i < minPortalPairs; i++) {
                let entranceX = Math.floor(Math.random() * gridWidth);
                let entranceY = Math.floor(Math.random() * gridHeight);
                
                // Skip if position is occupied
                if (this.isPositionOccupied(entranceX, entranceY)) continue;
                
                // Find a position for exit at least 10 units away
                let exitX, exitY;
                let validExit = false;
                let attempts = 0;
                
                while (!validExit && attempts < 20) {
                    attempts++;
                    exitX = Math.floor(Math.random() * gridWidth);
                    exitY = Math.floor(Math.random() * gridHeight);
                    
                    const distance = Math.sqrt(
                        Math.pow(entranceX - exitX, 2) + 
                        Math.pow(entranceY - exitY, 2)
                    );
                    
                    if (distance >= 10 && !this.isPositionOccupied(exitX, exitY)) {
                        validExit = true;
                    }
                }
                
                if (validExit) {
                    // Choose a portal type from available types
                    const portalType = 'PALANTIR'; // Default to palantir for reliability
                    
                    const exitPortal = new Portal(exitX, exitY, portalType);
                    const entrancePortal = new Portal(entranceX, entranceY, portalType, exitPortal);
                    
                    this.game.portals.push(entrancePortal);
                    this.game.portals.push(exitPortal);
                }
            }
        }
    }
    
    generateCircularPaths(levelConfig, gridWidth, gridHeight) {
        // Select pattern based on level
        let patternType;
        switch (levelConfig.id) {
            case 'shire':
                patternType = 'BASIC_LOOP';
                break;
            case 'rivendell':
                patternType = 'CONCENTRIC';
                break;
            case 'mirkwood':
                patternType = 'SPIRAL';
                break;
            case 'rohan':
                patternType = 'FIGURE_EIGHT';
                break;
            case 'moria':
                patternType = 'SPIRAL';
                break;
            case 'mordor':
                patternType = 'CONCENTRIC';
                break;
            default:
                patternType = 'BASIC_LOOP';
        }
        
        // Store pattern for later use in obstacle/collectible placement
        this.currentPattern = CIRCLE_PATTERNS[patternType];
    }
    
    placeObstacles(levelConfig, gridWidth, gridHeight) {
        // Calculate number of obstacles based on difficulty
        const baseObstacleCount = 5 * levelConfig.difficulty;
        const obstacleTypes = levelConfig.obstacles;
        
        // Determine cluster types based on level
        const clusterTypes = [
            { type: OBSTACLE_CLUSTERS.SMALL, weight: 0.5 },
            { type: OBSTACLE_CLUSTERS.MEDIUM, weight: 0.3 },
            { type: OBSTACLE_CLUSTERS.LARGE, weight: 0.2 }
        ];
        
        // Place obstacle clusters
        let placedObstacles = 0;
        let attemptCount = 0;
        const maxAttempts = 100;
        
        while (placedObstacles < baseObstacleCount && attemptCount < maxAttempts) {
            attemptCount++;
            
            // Choose a random obstacle type from available types
            const obstacleType = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
            
            // Choose cluster type
            const random = Math.random();
            let cumulativeWeight = 0;
            let selectedCluster;
            
            for (const clusterType of clusterTypes) {
                cumulativeWeight += clusterType.weight;
                if (random <= cumulativeWeight) {
                    selectedCluster = clusterType.type;
                    break;
                }
            }
            
            // Get random position for cluster center
            const centerX = Math.floor(Math.random() * gridWidth);
            const centerY = Math.floor(Math.random() * gridHeight);
            
            // Check if too close to snake starting position
            const snakeStartX = Math.floor(gridWidth / 2);
            const snakeStartY = Math.floor(gridHeight / 2);
            const distanceToSnake = Math.sqrt(
                Math.pow(centerX - snakeStartX, 2) + 
                Math.pow(centerY - snakeStartY, 2)
            );
            
            if (distanceToSnake < 5) {
                continue; // Too close to snake, try again
            }
            
            // Get random count within range
            const count = Math.floor(
                selectedCluster.count[0] + 
                Math.random() * (selectedCluster.count[1] - selectedCluster.count[0] + 1)
            );
            
            // Place obstacles in cluster
            let clusterPlacedCount = 0;
            for (let i = 0; i < count; i++) {
                // Get random position within cluster radius
                const angle = Math.random() * Math.PI * 2;
                const distance = Math.random() * selectedCluster.radius;
                const offsetX = Math.round(Math.cos(angle) * distance);
                const offsetY = Math.round(Math.sin(angle) * distance);
                
                const obstacleX = centerX + offsetX;
                const obstacleY = centerY + offsetY;
                
                // Check if position is valid
                if (
                    obstacleX >= 0 && 
                    obstacleX < gridWidth && 
                    obstacleY >= 0 && 
                    obstacleY < gridHeight &&
                    !this.isPositionOccupied(obstacleX, obstacleY)
                ) {
                    this.game.obstacles.push(new Obstacle(obstacleX, obstacleY, obstacleType));
                    placedObstacles++;
                    clusterPlacedCount++;
                }
            }
            
            // If we couldn't place any in this cluster, it's blocked
            if (clusterPlacedCount === 0) {
                attemptCount += 5; // Penalty to avoid too many retries in blocked areas
            }
        }
    }
    
    placeCollectibles(count, gridWidth, gridHeight) {
        let placedCollectibles = 0;
        let attemptCount = 0;
        const maxAttempts = 200; // More attempts for collectibles
        
        while (placedCollectibles < count && attemptCount < maxAttempts) {
            attemptCount++;
            
            // Get random position
            const x = Math.floor(Math.random() * gridWidth);
            const y = Math.floor(Math.random() * gridHeight);
            
            // Check if position is valid
            if (!this.isPositionOccupied(x, y)) {
                this.game.collectibles.push(new Collectible(x, y));
                placedCollectibles++;
            }
        }
    }
    
    placePortals(levelConfig, gridWidth, gridHeight) {
        // Calculate number of portal pairs based on density
        const portalPairCount = Math.max(1, Math.floor(levelConfig.portalDensity * 5));
        
        // Portal types available for this level
        let portalTypes = ['PALANTIR']; // All levels have palantir portals
        
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
        
        // Place portal pairs
        let placedPairs = 0;
        let attemptCount = 0;
        const maxAttempts = 100;
        
        while (placedPairs < portalPairCount && attemptCount < maxAttempts) {
            attemptCount++;
            
            // Choose a random portal type for this pair
            const portalType = portalTypes[Math.floor(Math.random() * portalTypes.length)];
            
            // Find valid positions for entrance and exit
            let entranceX, entranceY, exitX, exitY;
            let validPositions = false;
            let positionAttempts = 0;
            const maxPositionAttempts = 20;
            
            while (!validPositions && positionAttempts < maxPositionAttempts) {
                positionAttempts++;
                
                // Get random positions
                entranceX = Math.floor(Math.random() * gridWidth);
                entranceY = Math.floor(Math.random() * gridHeight);
                
                // Make sure exit is at least 10 units away
                let validExit = false;
                let exitAttempts = 0;
                const maxExitAttempts = 10;
                
                while (!validExit && exitAttempts < maxExitAttempts) {
                    exitAttempts++;
                    
                    exitX = Math.floor(Math.random() * gridWidth);
                    exitY = Math.floor(Math.random() * gridHeight);
                    
                    const distance = Math.sqrt(
                        Math.pow(entranceX - exitX, 2) + 
                        Math.pow(entranceY - exitY, 2)
                    );
                    
                    if (distance >= 10) {
                        validExit = true;
                    }
                }
                
                // Check if both positions are valid
                if (
                    validExit &&
                    !this.isPositionOccupied(entranceX, entranceY) && 
                    !this.isPositionOccupied(exitX, exitY)
                ) {
                    validPositions = true;
                }
            }
            
            // If valid positions found, create portal pair
            if (validPositions) {
                const exitPortal = new Portal(exitX, exitY, portalType);
                const entrancePortal = new Portal(entranceX, entranceY, portalType, exitPortal);
                
                this.game.portals.push(entrancePortal);
                this.game.portals.push(exitPortal);
                placedPairs++;
            }
        }
    }
    
    isPositionOccupied(x, y) {
        // Check if position is occupied by snake
        if (this.game.snake) {
            for (const segment of this.game.snake.segments) {
                if (segment.x === x && segment.y === y) {
                    return true;
                }
            }
        }
        
        // Check if position is occupied by obstacle
        for (const obstacle of this.game.obstacles) {
            if (obstacle.x === x && obstacle.y === y) {
                return true;
            }
        }
        
        // Check if position is occupied by collectible
        for (const collectible of this.game.collectibles) {
            if (collectible.x === x && collectible.y === y) {
                return true;
            }
        }
        
        // Check if position is occupied by portal
        for (const portal of this.game.portals) {
            if (portal.x === x && portal.y === y) {
                return true;
            }
        }
        
        return false;
    }
    
    spawnCollectible() {
        const gridWidth = Math.floor(this.game.canvas.width / GRID_SIZE);
        const gridHeight = Math.floor(this.game.canvas.height / GRID_SIZE);
        
        // Try to find a valid position
        let attempts = 0;
        const maxAttempts = 50;
        
        while (attempts < maxAttempts) {
            attempts++;
            
            // Get random position
            const x = Math.floor(Math.random() * gridWidth);
            const y = Math.floor(Math.random() * gridHeight);
            
            // Check if position is valid
            if (!this.isPositionOccupied(x, y)) {
                this.game.collectibles.push(new Collectible(x, y));
                return true;
            }
        }
        
        // If all attempts failed, try a more deterministic approach
        for (let x = 0; x < gridWidth; x += 2) {
            for (let y = 0; y < gridHeight; y += 2) {
                if (!this.isPositionOccupied(x, y)) {
                    this.game.collectibles.push(new Collectible(x, y));
                    return true;
                }
            }
        }
        
        return false;
    }
    
    spawnHorse() {
        const gridWidth = Math.floor(this.game.canvas.width / GRID_SIZE);
        const gridHeight = Math.floor(this.game.canvas.height / GRID_SIZE);
        
        // Pick horse type based on rarity
        const horseType = this.selectRandomHorseType();
        
        // Try to find a valid position
        let attempts = 0;
        const maxAttempts = 50;
        
        while (attempts < maxAttempts) {
            attempts++;
            
            // Get random position on edge of screen
            let x, y;
            const side = Math.floor(Math.random() * 4);
            
            switch (side) {
                case 0: // Top
                    x = Math.floor(Math.random() * gridWidth);
                    y = 0;
                    break;
                case 1: // Right
                    x = gridWidth - 1;
                    y = Math.floor(Math.random() * gridHeight);
                    break;
                case 2: // Bottom
                    x = Math.floor(Math.random() * gridWidth);
                    y = gridHeight - 1;
                    break;
                case 3: // Left
                    x = 0;
                    y = Math.floor(Math.random() * gridHeight);
                    break;
            }
            
            // Check if position is valid
            if (!this.isPositionOccupied(x, y)) {
                this.game.horses.push(new Horse(x, y, horseType));
                return true;
            }
        }
        
        // If all attempts failed, try to place anywhere
        for (let i = 0; i < 10; i++) {
            const x = Math.floor(Math.random() * gridWidth);
            const y = Math.floor(Math.random() * gridHeight);
            
            if (!this.isPositionOccupied(x, y)) {
                this.game.horses.push(new Horse(x, y, horseType));
                return true;
            }
        }
        
        return false;
    }
    
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