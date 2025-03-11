# CLAUDE.md - Implementation Guide

## Game Overview
"The One Snake" - A Lord of the Rings themed snake game where players control Smaug as a serpent, featuring portals, fire abilities, and horse interactions.

## Core Systems Implementation

### Snake System
```
INIT_SNAKE(length=3, position={x:center, y:center}, direction=RIGHT)
UPDATE_SNAKE_POSITION(currentDirection, inputDirection)
CHECK_COLLISION(snakeHead, [gameObjects])
GROW_SNAKE(segments=1)
APPLY_FIRE_EFFECT(effectType, duration)
DRAW_SNAKE(transformationStage)
```

### Movement System
```
DIRECTIONS = {UP: {x:0, y:-1}, RIGHT: {x:1, y:0}, DOWN: {x:0, y:1}, LEFT: {x:-1, y:0}}
MOVE_SNAKE()
  - position.x += direction.x * speed
  - position.y += direction.y * speed
  - updateBodySegments()
CHANGE_DIRECTION(newDirection)
  - if not opposite of current direction
  - enqueueDirection(newDirection)
```

### Fire Ability System
```
FIRE_ABILITIES = {
  FLAME_BREATH: {cost:20, cooldown:3s, range:5, damage:100},
  FIRE_SHIELD: {cost:30, cooldown:5s, duration:3s, protection:100},
  BURNING_TRAIL: {cost:15, cooldown:2s, duration:5s, damage:50},
  INFERNO_BURST: {cost:40, cooldown:8s, radius:3, damage:80}
}
ACTIVATE_FIRE_ABILITY(abilityType)
INCREASE_FIRE_METER(amount)
DECREASE_FIRE_METER(amount)
DRAW_FIRE_EFFECTS(type, position, direction)
```

### Portal System
```
CREATE_PORTAL_PAIR(entrance={x,y}, exit={x,y}, type=PALANTIR)
TELEPORT_SNAKE(entrancePortal, exitPortal)
PORTAL_TYPES = {
  PALANTIR: {cooldown:0s, visualEffect:"blue_swirl"},
  MORIA: {cooldown:2s, visualEffect:"stone_door", requiresUnlock:true},
  BLACK_GATE: {cooldown:5s, visualEffect:"dark_energy", oneWay:true},
  GREY_HAVENS: {cooldown:10s, visualEffect:"white_light", temporary:true}
}
DRAW_PORTAL(type, position, state)
DRAW_PORTAL_TRANSITION(entrancePortal, exitPortal)
```

### Horse System
```
HORSE_TYPES = {
  SHADOWFAX: {speed:5, effect:"speed_boost", duration:5s, rarity:0.1},
  MEARAS: {speed:4, effect:"transform_boost", duration:0, rarity:0.2},
  ROHIRRIM: {speed:3, effect:"none", movementPattern:"formation", rarity:0.3},
  NAZGUL_STEED: {speed:6, effect:"chase_player", duration:8s, rarity:0.15},
  BILL_PONY: {speed:2, effect:"drop_treasures", duration:10s, rarity:0.2},
  ASFALOTH: {speed:4, effect:"create_path", duration:5s, rarity:0.15},
  BREGO: {speed:3, effect:"danger_warning", duration:0, rarity:0.2}
}
SPAWN_HORSE(type, position)
UPDATE_HORSE_BEHAVIOR(horse, snakePosition)
HORSE_COLLISION_EFFECT(horse, snake)
DRAW_HORSE(type, position, state)
```

### Transformation System
```
TRANSFORMATION_STAGES = [
  {name:"Serpent", fireAbilities:[FLAME_BREATH], visualID:1, requiredItems:0},
  {name:"Horned Serpent", fireAbilities:[FLAME_BREATH, BURNING_TRAIL], visualID:2, requiredItems:5},
  {name:"Proto-Dragon", fireAbilities:[FLAME_BREATH, BURNING_TRAIL, FIRE_SHIELD], visualID:3, requiredItems:10},
  {name:"Wingless Dragon", fireAbilities:[FLAME_BREATH, BURNING_TRAIL, FIRE_SHIELD, INFERNO_BURST], visualID:4, requiredItems:15},
  {name:"True Dragon", fireAbilities:[ALL], visualID:5, requiredItems:20}
]
UPDATE_TRANSFORMATION(collectiblesObtained)
DRAW_TRANSFORMATION_EFFECTS(oldStage, newStage)
```

### Level System
```
LEVELS = [
  {id:"shire", difficulty:1, horseDensity:0.1, portalDensity:0.05, obstacles:["hills", "trees"]},
  {id:"rivendell", difficulty:2, horseDensity:0.1, portalDensity:0.1, obstacles:["water", "bridges"]},
  {id:"mirkwood", difficulty:3, horseDensity:0.2, portalDensity:0.1, obstacles:["trees", "spiders"]},
  {id:"rohan", difficulty:3, horseDensity:0.4, portalDensity:0.1, obstacles:["rocks", "enemies"]},
  {id:"moria", difficulty:4, horseDensity:0.1, portalDensity:0.3, obstacles:["walls", "chasms"]},
  {id:"mordor", difficulty:5, horseDensity:0.2, portalDensity:0.2, obstacles:["lava", "enemies"]}
]
GENERATE_LEVEL(levelID)
PLACE_OBSTACLES(level, density)
GENERATE_CIRCULAR_PATHS(level, complexity)
PLACE_PORTALS(level, density, types)
SPAWN_HORSES(level, density, types)
```

## Collision System
```
COLLISION_LAYERS = [
  SNAKE_LAYER,
  OBSTACLE_LAYER,
  COLLECTIBLE_LAYER,
  HORSE_LAYER,
  PORTAL_LAYER,
  FIRE_EFFECT_LAYER
]
CHECK_COLLISION(object1, object2)
HANDLE_COLLISION(object1, object2)
```

## Visual Effects System
```
PARTICLE_TYPES = {
  FIRE: {colors:["#FF4500", "#FFA500", "#FFD700"], size:2-5, lifetime:0.5-1.5s, emission:10-30/s},
  SMOKE: {colors:["#A9A9A9", "#808080"], size:3-8, lifetime:1-3s, emission:5-15/s},
  PORTAL: {colors:["#4B0082", "#8A2BE2", "#9400D3"], size:2-6, lifetime:1-2s, emission:15-25/s},
  TRANSFORMATION: {colors:["#FFD700", "#FF8C00", "#FF4500"], size:4-10, lifetime:1-2s, emission:30-50/s}
}
CREATE_PARTICLE_EFFECT(type, position, direction, duration)
DRAW_LIGHTING_EFFECT(position, radius, intensity, color)
APPLY_POST_PROCESSING(effects)
```

## Input Handling
```
DESKTOP_CONTROLS = {
  UP: [W, ARROW_UP],
  RIGHT: [D, ARROW_RIGHT],
  DOWN: [S, ARROW_DOWN],
  LEFT: [A, ARROW_LEFT],
  FIRE_ABILITY_1: [SPACE],
  FIRE_ABILITY_2: [E],
  FIRE_ABILITY_3: [Q],
  FIRE_ABILITY_4: [R]
}
MOBILE_CONTROLS = {
  MOVEMENT: SWIPE_DIRECTION,
  FIRE_ABILITY_1: TAP_BUTTON_1,
  FIRE_ABILITY_2: TAP_BUTTON_2,
  FIRE_ABILITY_3: TAP_BUTTON_3,
  FIRE_ABILITY_4: TAP_BUTTON_4
}
HANDLE_INPUT(inputType, inputValue)
```

## UI System
```
UI_ELEMENTS = {
  SCORE: {position:{x:10, y:10}, size:{w:100, h:30}, type:"text"},
  FIRE_METER: {position:{x:10, y:50}, size:{w:200, h:20}, type:"bar"},
  TRANSFORMATION_METER: {position:{x:10, y:80}, size:{w:200, h:20}, type:"segmented_bar"},
  ABILITY_ICONS: {position:{x:220, y:10}, size:{w:40, h:40}, type:"icon", count:4},
  MINIMAP: {position:{x:screen.width-110, y:10}, size:{w:100, h:100}, type:"map"}
}
DRAW_UI_ELEMENT(element, value)
UPDATE_UI(gameState)
```

## Audio System
```
SOUND_CATEGORIES = {
  MUSIC: {volume:0.7, channels:1},
  SFX: {volume:0.8, channels:8},
  AMBIENT: {volume:0.5, channels:2},
  UI: {volume:0.6, channels:2}
}
AUDIO_ASSETS = {
  MUSIC_SHIRE: {file:"shire_theme.mp3", category:MUSIC, loop:true},
  MUSIC_BATTLE: {file:"battle_theme.mp3", category:MUSIC, loop:true},
  SFX_FIRE_BREATH: {file:"fire_breath.wav", category:SFX, loop:false},
  SFX_PORTAL: {file:"portal_activate.wav", category:SFX, loop:false},
  SFX_HORSE_NEIGH: {file:"horse_neigh.wav", category:SFX, loop:false, variations:3},
  AMBIENT_MORDOR: {file:"mordor_ambient.mp3", category:AMBIENT, loop:true}
}
PLAY_SOUND(soundID, position, volume)
STOP_SOUND(soundID)
FADE_SOUND(soundID, targetVolume, duration)
```

## Game State Management
```
GAME_STATES = {
  MAIN_MENU,
  LEVEL_SELECT,
  PLAYING,
  PAUSED,
  GAME_OVER,
  VICTORY
}
INIT_GAME()
UPDATE_GAME_STATE(deltaTime)
SAVE_GAME(slotID)
LOAD_GAME(slotID)
RESET_LEVEL()
```

## Assets Required

### Sprites
```
- Smaug segments (5 transformation stages, 4 directions each)
- Horse types (7 variants, 4 directions each)
- Portal types (4 variants, various states)
- Collectibles and power-ups (10+ types)
- Environment tiles for each region (6 regions, 20+ tiles each)
- UI elements (buttons, bars, icons)
- Fire effect sprites (4 abilities, multiple frames)
```

### Sounds
```
- Background music for each region (6 tracks)
- Snake movement sounds
- Fire ability sounds (4 variants)
- Portal activation/teleportation
- Horse sounds (variations for each type)
- Collectible pickup sounds
- Transformation event sounds
- UI sound effects
```

## Level Design Guidelines

### Circular Pattern Templates
```
CIRCLE_PATTERNS = {
  BASIC_LOOP: [{radius:10, obstacles:5, collectibles:3}],
  FIGURE_EIGHT: [{radius:8, center:{x:5,y:0}}, {radius:8, center:{x:-5,y:0}}],
  SPIRAL: [{type:"spiral", loops:3, tightness:0.8}],
  CONCENTRIC: [{radius:5}, {radius:10}, {radius:15}]
}
```

### Obstacle Placement
```
OBSTACLES_PER_DIFFICULTY = {1:5, 2:10, 3:15, 4:20, 5:25}
OBSTACLE_CLUSTERS = {
  SMALL: {radius:2, count:2-3},
  MEDIUM: {radius:4, count:4-6},
  LARGE: {radius:6, count:7-10}
}
```

### Portal Placement Rules
```
- Entrances and exits should be at least 10 grid units apart
- Similar portal types should be visually distinguishable
- Portals should support circular movement patterns
- Advanced levels can have portal chains (exit near another entrance)
```

## Performance Targets
```
TARGET_FPS = 60
MINIMUM_FPS = 30
MAX_PARTICLE_COUNT = {
  HIGH: 2000,
  MEDIUM: 1000,
  LOW: 500
}
MAX_ACTIVE_HORSES = {
  HIGH: 15,
  MEDIUM: 10,
  LOW: 5
}
QUALITY_SETTINGS = {
  HIGH: {lightingEffects:true, particleMultiplier:1.0, postProcessing:true},
  MEDIUM: {lightingEffects:true, particleMultiplier:0.6, postProcessing:false},
  LOW: {lightingEffects:false, particleMultiplier:0.3, postProcessing:false}
}
```

## Implementation Phases

### Phase 1: Core Mechanics
```
- Snake movement system
- Basic collision detection
- Simple level generation
- Placeholder graphics
```

### Phase 2: Game Systems
```
- Portal teleportation mechanics
- Basic fire abilities
- Horse AI (basic)
- Collectibles and power-ups
- User interface elements
```

### Phase 3: Content Development
```
- Full level designs
- Finalized graphics
- Complete sound implementation
- Transformation system
```

### Phase 4: Polish
```
- Visual effects
- Performance optimization
- Control refinement
- Difficulty balancing
```

### Phase 5: Platform Specific
```
- Mobile touch controls
- Platform-specific optimizations
- Store integrations
- Analytics implementation
```

## Testing Requirements
```
TEST_CRITERIA = {
  CORE_MECHANICS: {
    movement: "Snake moves in expected direction",
    collision: "Collisions are detected accurately",
    growth: "Snake grows by correct amount when eating"
  },
  GAME_SYSTEMS: {
    portals: "Snake teleports correctly between portals",
    fire: "Fire abilities affect targets as expected",
    horses: "Horse behaviors match specifications"
  },
  PERFORMANCE: {
    fps: "Maintains target FPS on reference devices",
    memory: "Memory usage remains below threshold",
    battery: "Battery usage is optimized for mobile"
  }
}
```

## Important Constants
```
GRID_SIZE = 20 // pixels per grid unit
BASE_MOVEMENT_SPEED = 5 // grid units per second
BASE_SNAKE_LENGTH = 3
MAX_SNAKE_LENGTH = 100
FIRE_METER_MAX = 100
FIRE_METER_REGEN_RATE = 1 // per second
COLLECTIBLE_VALUE = 10
HORSE_SPAWN_INTERVAL = 5 // seconds
PORTAL_COOLDOWN = 1 // seconds
DIFFICULTY_MULTIPLIER = 1.2 // per level
SCORE_MULTIPLIER = {
  collectible: 1,
  horse: 5,
  level_completion: 100
}
```