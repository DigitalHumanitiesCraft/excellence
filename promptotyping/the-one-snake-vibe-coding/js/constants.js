// The One Snake - Game Constants

// Core Game Constants
const GRID_SIZE = 20; // pixels per grid unit
const BASE_MOVEMENT_SPEED = 5; // grid units per second
const BASE_SNAKE_LENGTH = 3;
const MAX_SNAKE_LENGTH = 100;
const FIRE_METER_MAX = 100;
const FIRE_METER_REGEN_RATE = 1; // per second
const COLLECTIBLE_VALUE = 10;
const HORSE_SPAWN_INTERVAL = 5; // seconds
const PORTAL_COOLDOWN = 1; // seconds
const DIFFICULTY_MULTIPLIER = 1.2; // per level

// Score Multipliers
const SCORE_MULTIPLIER = {
    collectible: 1,
    horse: 5,
    level_completion: 100
};

// Direction Constants
const DIRECTIONS = {
    UP: { x: 0, y: -1 },
    RIGHT: { x: 1, y: 0 },
    DOWN: { x: 0, y: 1 },
    LEFT: { x: -1, y: 0 }
};

// Game States
const GAME_STATES = {
    LOADING: 'game-loading',
    MAIN_MENU: 'main-menu',
    LEVEL_SELECT: 'level-select-menu',
    PLAYING: 'game-playing',
    PAUSED: 'game-paused',
    GAME_OVER: 'game-over',
    VICTORY: 'victory'
};

// Fire Abilities
const FIRE_ABILITIES = {
    FLAME_BREATH: { cost: 20, cooldown: 3, range: 5, damage: 100 },
    FIRE_SHIELD: { cost: 30, cooldown: 5, duration: 3, protection: 100 },
    BURNING_TRAIL: { cost: 15, cooldown: 2, duration: 5, damage: 50 },
    INFERNO_BURST: { cost: 40, cooldown: 8, radius: 3, damage: 80 }
};

// Portal Types
const PORTAL_TYPES = {
    PALANTIR: { cooldown: 0, visualEffect: "blue_swirl" },
    MORIA: { cooldown: 2, visualEffect: "stone_door", requiresUnlock: true },
    BLACK_GATE: { cooldown: 5, visualEffect: "dark_energy", oneWay: true },
    GREY_HAVENS: { cooldown: 10, visualEffect: "white_light", temporary: true }
};

// Horse Types
const HORSE_TYPES = {
    SHADOWFAX: { speed: 5, effect: "speed_boost", duration: 5, rarity: 0.1 },
    MEARAS: { speed: 4, effect: "transform_boost", duration: 0, rarity: 0.2 },
    ROHIRRIM: { speed: 3, effect: "none", movementPattern: "formation", rarity: 0.3 },
    NAZGUL_STEED: { speed: 6, effect: "chase_player", duration: 8, rarity: 0.15 },
    BILL_PONY: { speed: 2, effect: "drop_treasures", duration: 10, rarity: 0.2 },
    ASFALOTH: { speed: 4, effect: "create_path", duration: 5, rarity: 0.15 },
    BREGO: { speed: 3, effect: "danger_warning", duration: 0, rarity: 0.2 }
};

// Transformation Stages
const TRANSFORMATION_STAGES = [
    { name: "Serpent", fireAbilities: ["FLAME_BREATH"], visualID: 1, requiredItems: 0 },
    { name: "Horned Serpent", fireAbilities: ["FLAME_BREATH", "BURNING_TRAIL"], visualID: 2, requiredItems: 5 },
    { name: "Proto-Dragon", fireAbilities: ["FLAME_BREATH", "BURNING_TRAIL", "FIRE_SHIELD"], visualID: 3, requiredItems: 10 },
    { name: "Wingless Dragon", fireAbilities: ["FLAME_BREATH", "BURNING_TRAIL", "FIRE_SHIELD", "INFERNO_BURST"], visualID: 4, requiredItems: 15 },
    { name: "True Dragon", fireAbilities: ["ALL"], visualID: 5, requiredItems: 20 }
];

// Level Configuration
const LEVELS = [
    { id: "shire", difficulty: 1, horseDensity: 0.1, portalDensity: 0.05, obstacles: ["hills", "trees"] },
    { id: "rivendell", difficulty: 2, horseDensity: 0.1, portalDensity: 0.1, obstacles: ["water", "bridges"] },
    { id: "mirkwood", difficulty: 3, horseDensity: 0.2, portalDensity: 0.1, obstacles: ["trees", "spiders"] },
    { id: "rohan", difficulty: 3, horseDensity: 0.4, portalDensity: 0.1, obstacles: ["rocks", "enemies"] },
    { id: "moria", difficulty: 4, horseDensity: 0.1, portalDensity: 0.3, obstacles: ["walls", "chasms"] },
    { id: "mordor", difficulty: 5, horseDensity: 0.2, portalDensity: 0.2, obstacles: ["lava", "enemies"] }
];

// Circle Patterns for Level Design
const CIRCLE_PATTERNS = {
    BASIC_LOOP: [{ radius: 10, obstacles: 5, collectibles: 3 }],
    FIGURE_EIGHT: [{ radius: 8, center: { x: 5, y: 0 } }, { radius: 8, center: { x: -5, y: 0 } }],
    SPIRAL: [{ type: "spiral", loops: 3, tightness: 0.8 }],
    CONCENTRIC: [{ radius: 5 }, { radius: 10 }, { radius: 15 }]
};

// Obstacle Clustering
const OBSTACLE_CLUSTERS = {
    SMALL: { radius: 2, count: [2, 3] },
    MEDIUM: { radius: 4, count: [4, 6] },
    LARGE: { radius: 6, count: [7, 10] }
};

// Particle Types
const PARTICLE_TYPES = {
    FIRE: { colors: ["#FF4500", "#FFA500", "#FFD700"], size: [2, 5], lifetime: [0.5, 1.5], emission: [10, 30] },
    SMOKE: { colors: ["#A9A9A9", "#808080"], size: [3, 8], lifetime: [1, 3], emission: [5, 15] },
    PORTAL: { colors: ["#4B0082", "#8A2BE2", "#9400D3"], size: [2, 6], lifetime: [1, 2], emission: [15, 25] },
    TRANSFORMATION: { colors: ["#FFD700", "#FF8C00", "#FF4500"], size: [4, 10], lifetime: [1, 2], emission: [30, 50] }
};

// Controls Configuration
const DESKTOP_CONTROLS = {
    UP: ['KeyW', 'ArrowUp'],
    RIGHT: ['KeyD', 'ArrowRight'],
    DOWN: ['KeyS', 'ArrowDown'],
    LEFT: ['KeyA', 'ArrowLeft'],
    FIRE_ABILITY_1: ['Space'],
    FIRE_ABILITY_2: ['KeyE'],
    FIRE_ABILITY_3: ['KeyQ'],
    FIRE_ABILITY_4: ['KeyR'],
    PAUSE: ['Escape', 'KeyP']
};

// Collision Layers
const COLLISION_LAYERS = {
    SNAKE: 0,
    OBSTACLE: 1,
    COLLECTIBLE: 2,
    HORSE: 3,
    PORTAL: 4,
    FIRE_EFFECT: 5
};