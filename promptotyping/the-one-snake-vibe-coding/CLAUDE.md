# CLAUDE.md - Concise Implementation Documentation

## Overview
"The One Snake" is a Lord of the Rings themed snake game where a serpent evolves into a dragon through five transformation stages across Middle Earth locations. Built with HTML5 Canvas and JavaScript, it features obstacle avoidance, collectible items, teleportation portals, and special fire abilities.

## Code Structure

```
├── index.html        # Game container, UI elements, canvas
├── style.css         # Fantasy-themed styling, responsive design
├── constants.js      # Game parameters and configuration 
├── main.js           # Entry point for initialization
├── game.js           # Core game controller and loop
├── snake.js          # Snake entity and movement logic
├── entities.js       # Game objects (Collectible, Horse, Portal, Obstacle)
├── levels.js         # Level generation and object placement
├── abilities.js      # Fire abilities implementation
├── particles.js      # Visual effects system
├── ui.js             # HUD and menu management
└── controls.js       # Keyboard and touch input handling
```

## Key Constants

```javascript
GRID_SIZE = 20                // Pixels per grid unit
BASE_MOVEMENT_SPEED = 5       // Grid units per second
BASE_SNAKE_LENGTH = 3         // Initial snake length
MAX_SNAKE_LENGTH = 100        // Maximum possible length
FIRE_METER_MAX = 100          // Maximum fire resource
COLLECTIBLE_VALUE = 10        // Base score for collectibles

DIRECTIONS = {UP:{x:0,y:-1}, RIGHT:{x:1,y:0}, DOWN:{x:0,y:1}, LEFT:{x:-1,y:0}}

GAME_STATES = {
  LOADING: 'game-loading',    // Initial loading screen
  MAIN_MENU: 'main-menu',     // Title screen
  LEVEL_SELECT: 'level-select-menu', // Level selection
  PLAYING: 'game-playing',    // Active gameplay
  PAUSED: 'game-paused',      // Game paused
  GAME_OVER: 'game-over',     // Failure state
  VICTORY: 'victory'          // Level completed
}
```

## Game Class (game.js)

Central controller managing:
- Canvas setup and resizing (grid-aligned dimensions)
- Game loop with fixed timestep updates (60 FPS target)
- State transitions and level initialization
- Game object creation and updates
- Collision detection with grace period
- Score tracking and UI updates
- Debug mode for development

```javascript
// Core game loop
gameLoop(timestamp) {
  // Calculate time delta in seconds
  this.deltaTime = (timestamp - this.lastFrameTime) / 1000;
  this.lastFrameTime = timestamp;
  
  // Limit delta time to avoid large jumps
  if (this.deltaTime > 0.1) this.deltaTime = 0.1;
  
  // Accumulate time for fixed-step updates
  this.accumulatedTime += this.deltaTime * 1000;
  
  // Only update if in playing state
  if (this.currentState === GAME_STATES.PLAYING) {
    while (this.accumulatedTime >= this.timeStep) {
      this.update(this.timeStep / 1000);
      this.accumulatedTime -= this.timeStep;
    }
  }
  
  // Always render
  this.render();
  
  // Request next frame
  requestAnimationFrame((time) => this.gameLoop(time));
}
```

## Snake Class (snake.js)

Player-controlled entity with:
- Grid-based movement with smooth timing
- Direction change management (prevents 180° turns)
- Segment management for growing after collecting items
- Screen edge wrapping for continuous movement
- Self-collision detection with 4-segment grace distance
- Visual transformation across 5 stages

```javascript
update(deltaTime, gridWidth, gridHeight) {
  // Update direction
  this.direction = this.nextDirection;
  
  // Increment move timer
  this.moveTimer += deltaTime;
  
  // Move when timer exceeds threshold (controlled by speed)
  if (this.moveTimer >= 0.5 / this.speed) {
    this.moveTimer = 0;
    
    // Calculate new head position
    const head = {...this.segments[0]};
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
    if (this.growing > 0) this.growing--;
    else this.segments.pop();
  }
  
  return this.segments[0]; // Return head position
}
```

## Entity System (entities.js)

Inheritance-based system with base `Entity` class and specialized types:
- **Collectible**: Items that increase score/transformation with pulsing animation
- **Horse**: Special units with different behaviors (chase, random movement, formations)
- **Portal**: Teleportation points with cooldowns and visual effects
- **Obstacle**: Barriers themed to each level location

```javascript
class Entity {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.active = true;
  }
  
  update(deltaTime) { /* Base method */ }
  draw(ctx, gridSize) { /* Base method */ }
}
```

## Fire Abilities (abilities.js)

Special powers unlocked through transformation:
- **Flame Breath**: Projects fire in the snake's direction (cost: 20, cooldown: 3s)
- **Fire Shield**: Temporary collision protection (cost: 30, cooldown: 5s, duration: 3s)
- **Burning Trail**: Leaves fire behind the snake (cost: 15, cooldown: 2s, duration: 5s)
- **Inferno Burst**: Creates a circular explosion (cost: 40, cooldown: 8s, radius: 3)

The `FireAbilityManager` handles:
- Cooldown tracking
- Fire meter consumption
- Effect creation and application
- Damage calculations (for future enemy implementation)

## Level Generation (levels.js)

`LevelGenerator` creates procedural levels with:
- Grid-based position tracking for collision avoidance
- Safe object placement algorithms with multiple fallbacks
- Obstacle clustering based on level themes
- Portal pair creation with minimum distance requirements
- Dynamic collectible and horse spawning during gameplay

```javascript
// Find a free position on the grid
findFreePosition() {
  // Random attempts first (20 tries)
  for (let i = 0; i < 20; i++) {
    const x = Math.floor(Math.random() * this.grid.length);
    const y = Math.floor(Math.random() * this.grid[0].length);
    if (this.isPositionFree(x, y)) return {x, y};
  }
  
  // Systematic scan if random fails (every other cell)
  for (let x = 0; x < this.grid.length; x += 2) {
    for (let y = 0; y < this.grid[0].length; y += 2) {
      if (this.isPositionFree(x, y)) return {x, y};
    }
  }
  
  // Complete scan as last resort
  for (let x = 0; x < this.grid.length; x++) {
    for (let y = 0; y < this.grid[0].length; y++) {
      if (this.isPositionFree(x, y)) return {x, y};
    }
  }
  
  // Fallback to center if grid is full
  return { 
    x: Math.floor(this.grid.length / 2), 
    y: Math.floor(this.grid[0].length / 2) 
  };
}
```

## Particle System (particles.js)

Creates visual effects with:
- Particle creation with randomized properties (size, color, velocity)
- Physics-based movement with drag and gravity
- Four particle types:
  - **FIRE**: Rising particles with shrinking size
  - **SMOKE**: Growing particles with upward drift
  - **PORTAL**: Star-shaped particles with rotation
  - **TRANSFORMATION**: Diamond-shaped particles with pulsing
- Particle pooling with maximum count for performance

## Controls (controls.js)

Handles user input with:
- Keyboard mapping for directions (WASD/Arrows) and abilities
- Touch and swipe detection for mobile devices
- Menu navigation and button interaction
- Direction change validation to prevent impossible moves
- Responsive controls based on device type

## UI System (ui.js)

Manages game interface with:
- Score display and fire meter visualization
- Transformation progress tracking with stages
- Ability cooldown visualization (4 abilities)
- Menu screens for game states (main, level select, paused, game over, victory)
- Minimap showing level layout and object positions

## Transformation System

Progression through 5 stages based on collectibles obtained:
1. **Serpent** (0 items): Basic form with Flame Breath only
2. **Horned Serpent** (5 items): Adds Burning Trail ability
3. **Proto-Dragon** (10 items): Adds Fire Shield ability
4. **Wingless Dragon** (15 items): Adds Inferno Burst ability
5. **True Dragon** (20 items): Enhanced abilities and final form

Each stage has unique visual appearance and unlocks additional abilities.

## Levels (Middle Earth Locations)

Six themed levels with increasing difficulty:
1. **The Shire**: Gentle hills and trees (Difficulty: 1)
2. **Rivendell**: Water and bridges (Difficulty: 2)
3. **Mirkwood**: Dense trees and spiders (Difficulty: 3)
4. **Rohan**: Open plains with many horses (Difficulty: 3)
5. **Moria**: Tight passages and chasms with many portals (Difficulty: 4)
6. **Mordor**: Dangerous terrain with lava and enemies (Difficulty: 5)

Each level has:
- Unique obstacle types and density
- Themed background colors
- Varying portal and horse spawn rates
- Difficulty-scaled object counts

## Game Flow

1. Initial loading screen with progress bar
2. Player selects level from main menu
3. Game initializes snake and level objects
4. Snake moves continuously, player changes direction
5. Collecting items increases score and transformation progress
6. The snake transforms as thresholds are reached
7. Fire meter allows activation of special abilities
8. Portals teleport the snake across the level
9. Horses provide temporary buffs when collected
10. Obstacles and self-collision must be avoided (unless Fire Shield is active)
11. Collecting 30 items completes the level
12. Progression continues through all Middle Earth locations

## Debugging Features

Built-in tools for development:
- Debug mode toggle with extended information display
- Position history tracking with visual trail
- Object highlighting and coordinate display
- FPS counter and object counts
- State logging and transition controls

## Key Implementation Details

- Fixed timestep game loop for consistent updates
- Grid-based collision for efficient detection
- Canvas rendering with high-contrast colors
- Responsive design for various screen sizes
- Error handling throughout critical functions
- Automatic game initialization when entering PLAYING state
- Grace period after game start before collision checks