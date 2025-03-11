// The One Snake - Snake Entity Implementation

class Snake {
    constructor(gridWidth, gridHeight) {
        // Initialize snake with default values
        this.segments = [];
        this.direction = DIRECTIONS.RIGHT;
        this.nextDirection = DIRECTIONS.RIGHT;
        this.speed = BASE_MOVEMENT_SPEED;
        this.length = BASE_SNAKE_LENGTH;
        this.growing = BASE_SNAKE_LENGTH - 1; // Start with base length - 1 growth pending
        this.visualStage = 1;
        
        // Set snake's initial position in middle of grid
        const startX = Math.floor(gridWidth / 2);
        const startY = Math.floor(gridHeight / 2);
        
        // Create initial head segment
        this.segments.push({ x: startX, y: startY });
        
        // Create initial body segments based on direction
        for (let i = 1; i < BASE_SNAKE_LENGTH; i++) {
            const prevSegment = this.segments[i - 1];
            this.segments.push({
                x: prevSegment.x - this.direction.x,
                y: prevSegment.y - this.direction.y
            });
        }
    }
    
    // Update snake position based on current direction and speed
    update(deltaTime, gridWidth, gridHeight) {
        // Update direction from the queue
        this.direction = this.nextDirection;
        
        // Calculate movement based on speed and time
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
        
        return head; // Return new head position for collision checks
    }
    
    // Change snake direction if valid
    changeDirection(newDirection) {
        // Prevent 180-degree turns by checking if new direction is opposite of current
        const isOpposite = (
            (this.direction === DIRECTIONS.UP && newDirection === DIRECTIONS.DOWN) ||
            (this.direction === DIRECTIONS.DOWN && newDirection === DIRECTIONS.UP) ||
            (this.direction === DIRECTIONS.LEFT && newDirection === DIRECTIONS.RIGHT) ||
            (this.direction === DIRECTIONS.RIGHT && newDirection === DIRECTIONS.LEFT)
        );
        
        if (isOpposite) {
            return false;
        }
        
        this.nextDirection = newDirection;
        return true;
    }
    
    // Grow snake by specified number of segments
    grow(segments = 1) {
        this.growing += segments;
        this.length += segments;
        
        // Enforce maximum snake length
        if (this.length > MAX_SNAKE_LENGTH) {
            // Adjust growing count if we hit max length
            this.growing -= (this.length - MAX_SNAKE_LENGTH);
            this.length = MAX_SNAKE_LENGTH;
        }
    }
    
    // Check if snake is colliding with itself
    checkSelfCollision() {
        const head = this.segments[0];
        // Start from index 4 to allow snake to turn without self-collision
        for (let i = 4; i < this.segments.length; i++) {
            const segment = this.segments[i];
            if (head.x === segment.x && head.y === segment.y) {
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
        // Any other transformation effects would be applied here
    }
    
    // Draw snake on canvas
    draw(ctx, gridSize) {
        // Draw each segment
        for (let i = 0; i < this.segments.length; i++) {
            const segment = this.segments[i];
            
            // Different visual style based on transformation stage and segment type
            const isHead = i === 0;
            let color;
            
            // Color based on transformation stage
            switch (this.visualStage) {
                case 1: // Serpent
                    color = isHead ? '#00AA00' : '#008800';
                    break;
                case 2: // Horned Serpent
                    color = isHead ? '#00AAAA' : '#008888';
                    break;
                case 3: // Proto-Dragon
                    color = isHead ? '#AA00AA' : '#880088';
                    break;
                case 4: // Wingless Dragon
                    color = isHead ? '#AAAA00' : '#888800';
                    break;
                case 5: // True Dragon
                    color = isHead ? '#AA0000' : '#880000';
                    break;
                default:
                    color = isHead ? '#00AA00' : '#008800';
            }
            
            // Draw segment
            ctx.fillStyle = color;
            ctx.fillRect(
                segment.x * gridSize,
                segment.y * gridSize,
                gridSize,
                gridSize
            );
            
            // Add eye details for head
            if (isHead) {
                // Draw eyes based on direction
                ctx.fillStyle = '#FFFFFF';
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