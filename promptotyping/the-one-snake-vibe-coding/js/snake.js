// The One Snake - Snake Entity Implementation

// Make sure Snake is defined in the global scope
window.Snake = class Snake {
    constructor(gridWidth, gridHeight) {
        // Initialize snake with default values
        this.segments = [];
        this.direction = DIRECTIONS.RIGHT;
        this.nextDirection = DIRECTIONS.RIGHT;
        this.speed = BASE_MOVEMENT_SPEED;
        this.length = BASE_SNAKE_LENGTH;
        this.growing = BASE_SNAKE_LENGTH - 1; // Start with base length - 1 growth pending
        this.visualStage = 1;
        this.moveTimer = 0; // Timer to control movement speed
        
        // Ensure gridWidth and gridHeight are valid numbers
        gridWidth = (typeof gridWidth === 'number' && gridWidth > 0) ? gridWidth : 20;
        gridHeight = (typeof gridHeight === 'number' && gridHeight > 0) ? gridHeight : 15;
        
        // Set snake's initial position in middle of grid
        const startX = Math.floor(gridWidth / 2);
        const startY = Math.floor(gridHeight / 2);
        
        console.log(`Initializing snake at position (${startX}, ${startY})`);
        
        // Create initial head segment
        this.segments.push({ x: startX, y: startY });
        
        // Create initial body segments based on direction (to the left of the head)
        for (let i = 1; i < BASE_SNAKE_LENGTH; i++) {
            this.segments.push({
                x: startX - i,
                y: startY
            });
        }
    }
    
    // Update snake position based on current direction and speed
    update(deltaTime, gridWidth, gridHeight) {
        // Update direction from the queue
        this.direction = this.nextDirection;
        
        // Increment move timer
        this.moveTimer += deltaTime;
        
        // Move snake when timer exceeds movement threshold (inverse of speed)
        // Lower threshold = faster movement
        const moveThreshold = 0.5 / this.speed;
        
        if (this.moveTimer >= moveThreshold) {
            this.moveTimer = 0; // Reset timer
            
            // Calculate movement based on direction
            const head = { ...this.segments[0] };
            head.x += this.direction.x;
            head.y += this.direction.y;
            
            // Handle edge wrapping
            if (head.x < 0) head.x = gridWidth - 1;
            if (head.x >= gridWidth) head.x = 0;
            if (head.y < 0) head.y = gridHeight - 1;
            if (head.y >= gridHeight) head.y = 0;
            
            // Add new head
            this.segments.unshift(head);
            
            // Remove tail or grow
            if (this.growing > 0) {
                this.growing--;
            } else {
                this.segments.pop();
            }
            
            console.log(`Snake moved to: (${head.x}, ${head.y}), Direction: (${this.direction.x}, ${this.direction.y})`);
        }
        
        return this.segments[0]; // Return head position for collision checks
    }
    
    // Change snake direction if valid
    changeDirection(newDirection) {
        // Prevent 180-degree turns by checking if new direction is opposite of current
        const isOpposite = (
            (this.direction.x === 0 && this.direction.y === -1 && newDirection.x === 0 && newDirection.y === 1) ||
            (this.direction.x === 0 && this.direction.y === 1 && newDirection.x === 0 && newDirection.y === -1) ||
            (this.direction.x === -1 && this.direction.y === 0 && newDirection.x === 1 && newDirection.y === 0) ||
            (this.direction.x === 1 && this.direction.y === 0 && newDirection.x === -1 && newDirection.y === 0)
        );
        
        if (isOpposite) {
            console.log("Attempted 180-degree turn prevented");
            return false;
        }
        
        this.nextDirection = newDirection;
        console.log(`Direction changed to: (${newDirection.x}, ${newDirection.y})`);
        return true;
    }
    
    // Grow snake by specified number of segments
    grow(segments = 1) {
        this.growing += segments;
        this.length += segments;
        console.log(`Snake growing by ${segments} segments. Total length: ${this.length}`);
        
        // Enforce maximum snake length
        if (this.length > MAX_SNAKE_LENGTH) {
            // Adjust growing count if we hit max length
            this.growing -= (this.length - MAX_SNAKE_LENGTH);
            this.length = MAX_SNAKE_LENGTH;
            console.log(`Snake reached maximum length of ${MAX_SNAKE_LENGTH}`);
        }
    }
    
    // Check if snake is colliding with itself
    checkSelfCollision() {
        const head = this.segments[0];
        // Start from index 4 to allow snake to turn without self-collision
        for (let i = 4; i < this.segments.length; i++) {
            const segment = this.segments[i];
            if (head.x === segment.x && head.y === segment.y) {
                console.log(`Self collision detected at segment ${i}`);
                return true;
            }
        }
        return false;
    }
    
    // Check if snake head is colliding with an object
    checkCollision(object) {
        const head = this.segments[0];
        return head.x === object.x && head.y === object.y;
    }
    
    // Apply a transformation stage to the snake
    applyTransformation(stage) {
        this.visualStage = stage.visualID;
        console.log(`Snake transformed to stage ${stage.visualID}: ${stage.name}`);
        // Any other transformation effects would be applied here
    }
    
    // Draw snake on canvas
    draw(ctx, gridSize) {
        // Draw each segment with increased contrast
        for (let i = 0; i < this.segments.length; i++) {
            const segment = this.segments[i];
            
            // Different visual style based on transformation stage and segment type
            const isHead = i === 0;
            let color;
            
            // Color based on transformation stage - FIXED: Brighter colors
            switch (this.visualStage) {
                case 1: // Serpent
                    color = isHead ? '#00FF00' : '#00DD00'; // Bright green
                    break;
                case 2: // Horned Serpent
                    color = isHead ? '#00FFFF' : '#00DDDD'; // Bright cyan
                    break;
                case 3: // Proto-Dragon
                    color = isHead ? '#FF00FF' : '#DD00DD'; // Bright magenta
                    break;
                case 4: // Wingless Dragon
                    color = isHead ? '#FFFF00' : '#DDDD00'; // Bright yellow
                    break;
                case 5: // True Dragon
                    color = isHead ? '#FF0000' : '#DD0000'; // Bright red
                    break;
                default:
                    color = isHead ? '#00FF00' : '#00DD00'; // Bright green
            }
            
            // Draw segment with border for visibility
            ctx.fillStyle = color;
            ctx.fillRect(
                segment.x * gridSize,
                segment.y * gridSize,
                gridSize,
                gridSize
            );
            
            // Add border for better visibility
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 1;
            ctx.strokeRect(
                segment.x * gridSize,
                segment.y * gridSize,
                gridSize,
                gridSize
            );
            
            // Add eye details for head
            if (isHead) {
                // Draw eyes based on direction
                ctx.fillStyle = '#000000'; // Black eyes
                const eyeSize = gridSize / 5;
                const eyeOffset = gridSize / 3;
                
                // Position eyes based on direction
                switch (this.direction) {
                    case DIRECTIONS.UP:
                        ctx.fillRect(segment.x * gridSize + eyeOffset, segment.y * gridSize + eyeOffset, eyeSize, eyeSize);
                        ctx.fillRect(segment.x * gridSize + gridSize - eyeOffset - eyeSize, segment.y * gridSize + eyeOffset, eyeSize, eyeSize);
                        break;
                    case DIRECTIONS.DOWN:
                        ctx.fillRect(segment.x * gridSize + eyeOffset, segment.y * gridSize + gridSize - eyeOffset - eyeSize, eyeSize, eyeSize);
                        ctx.fillRect(segment.x * gridSize + gridSize - eyeOffset - eyeSize, segment.y * gridSize + gridSize - eyeOffset - eyeSize, eyeSize, eyeSize);
                        break;
                    case DIRECTIONS.LEFT:
                        ctx.fillRect(segment.x * gridSize + eyeOffset, segment.y * gridSize + eyeOffset, eyeSize, eyeSize);
                        ctx.fillRect(segment.x * gridSize + eyeOffset, segment.y * gridSize + gridSize - eyeOffset - eyeSize, eyeSize, eyeSize);
                        break;
                    case DIRECTIONS.RIGHT:
                        ctx.fillRect(segment.x * gridSize + gridSize - eyeOffset - eyeSize, segment.y * gridSize + eyeOffset, eyeSize, eyeSize);
                        ctx.fillRect(segment.x * gridSize + gridSize - eyeOffset - eyeSize, segment.y * gridSize + gridSize - eyeOffset - eyeSize, eyeSize, eyeSize);
                        break;
                }
            }
        }
    }
}