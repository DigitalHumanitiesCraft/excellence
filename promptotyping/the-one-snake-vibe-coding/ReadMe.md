# The One Snake - Lord of the Rings Themed Snake Game

![Game Banner](assets/banner.png)

> *"Not all those who wander are lost, but this snake definitely has a destination."*

A Lord of the Rings themed snake game where players control a serpent evolving into a dragon through various realms of Middle Earth. Unleash fire abilities, discover magical portals, and transform from a serpent to a majestic dragon.

[Play Now](https://digitalhumanitiescraft.github.io/excellence/promptotyping/the-one-snake-vibe-coding/) | [View Source](https://github.com/DigitalHumanitiesCraft/excellence/tree/main/promptotyping/the-one-snake-vibe-coding)

## 📊 Project Status

**Current Status**: Beta Release
- Core game mechanics fully implemented
- Visual effects and theming complete
- Performance optimizations in progress
- Audio system implemented

![Gameplay Screenshot](assets/gameplay.png)

## ✨ Implemented Features

- **Snake Movement** - Grid-based movement with edge wrapping
- **Collectible Items** - Gather items to grow and transform
- **Obstacle Avoidance** - Navigate around themed obstacles
- **Dragon Transformation** - Evolve through 5 stages, unlocking new abilities
- **Fire Abilities** - Use Flame Breath, Fire Shield, Burning Trail, and Inferno Burst
- **Magical Portals** - Teleport across the map
- **Horse Encounters** - Interact with different horse types
- **Middle Earth Realms** - Journey through 6 themed levels
- **Visual Effects** - Particle effects for abilities and transformations
- **Responsive Design** - Play on desktop or mobile devices
- **Audio System** - Background music and sound effects with mute controls
- **How to Play** - Comprehensive in-game instructions

## 🎮 How to Play

### Controls

**Desktop:**
- **Movement**: Arrow keys or WASD
- **Fire Abilities**:
  - **Space**: Flame Breath
  - **E**: Fire Shield
  - **Q**: Burning Trail
  - **R**: Inferno Burst
- **Pause**: Escape or P

**Mobile:**
- **Movement**: Swipe in desired direction
- **Abilities**: Tap the ability buttons on screen

### Gameplay

1. **Core Goal**: Collect items to grow your snake and transform into a dragon
2. **Transformation**: Evolve through 5 stages, unlocking new abilities as you progress
3. **Portals**: Use portals to navigate quickly around the map
4. **Horses**: Encounter different horses with unique effects
5. **Level Progression**: Beat each realm to unlock the next challenge

## 🚀 Installation

### Browser Compatibility

Tested and working on:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

Note: Audio playback requires user interaction on first load due to browser autoplay policies.

### System Requirements

- Modern browser with HTML5 Canvas support
- 1GB RAM minimum
- Any modern CPU (2012+)
- Touchscreen for mobile play

### Run Locally

```bash
# Clone the repository
git clone https://github.com/DigitalHumanitiesCraft/excellence.git

# Navigate to the project directory
cd excellence/promptotyping/the-one-snake-vibe-coding

# Open the game in your browser
# You can use any local server, for example with Python:
python -m http.server

# Then open http://localhost:8000 in your browser
```

### Required Folder Structure

For the game to work correctly, ensure these folders exist:
```
/assets/
  /audio/        # Contains all game sounds
  /flame.png     # Flame graphic
  /ember.png     # Ember particles
  /dragon-silhouette.png # Dragon silhouette for loading
  /music-icon.png # Music control icon
  /sound-icon.png # Sound control icon
  /favicon.png   # Browser favicon
```

### Troubleshooting

- **Game not visible**: Try disabling browser extensions or using incognito mode
- **Performance issues**: Open console (F12) and check for errors, reduce quality settings
- **Controls not responsive**: Check if game state is correctly set to "PLAYING"
- **No sound**: Click anywhere on the screen to enable audio (browser requirement)
- **Assets not loading**: Check browser console for 404 errors and verify file paths

## 🎵 Audio System

The game features a complete audio experience:

- **Background Music**: Medieval fantasy theme
- **Sound Effects**: 
  - Menu interaction sounds
  - Gameplay effects (collecting items, teleporting, transforming)
  - Ability activation sounds
  - Game state changes (victory, game over)
- **Audio Controls**: Toggle music and sound effects independently
- **Settings Persistence**: Audio preferences are saved between sessions

## 🧰 Technical Implementation

### Architecture

The game uses a component-based architecture with these key systems:
- **Game Controller**: Central manager for game state and loop
- **Entity System**: Base class with specialized game objects
- **Grid System**: Position tracking and collision detection
- **Particle System**: Visual effects manager
- **State Machine**: Controls game flow and transitions
- **Audio Manager**: Handles sound effects and music
- **Asset Loader**: Manages resource preloading

### Key Technical Features

- **Fixed Timestep Loop**: Consistent updates regardless of frame rate
- **Grid-Based Collisions**: Efficient collision detection
- **Object Pooling**: Optimized particle system for performance
- **Canvas Rendering**: Hardware-accelerated graphics
- **Responsive Design**: Adapts to different screen sizes
- **Debug Mode**: Built-in tools for development
- **Local Storage**: Saves audio preferences

## 📚 Code Structure

The game is organized into multiple modules for better maintainability:

```
/
├── index.html          # Main HTML file
├── css/
│   └── style.css       # Main CSS styles
├── js/
│   ├── main.js         # Entry point, initializes game
│   ├── constants.js    # Game constants and configurations
│   ├── game.js         # Core game logic and loop
│   ├── snake.js        # Snake implementation
│   ├── levels.js       # Level generation and management
│   ├── entities.js     # Game entities (horses, collectibles, portals)
│   ├── abilities.js    # Fire abilities implementation
│   ├── audio.js        # Audio system management
│   ├── ui.js           # UI updates and rendering
│   ├── controls.js     # Input handling for keyboard and touch
│   └── particles.js    # Particle effects system
├── assets/
│   ├── audio/          # Sound effects and music
│   └── [images]        # Game graphics
```

## 🌍 Middle Earth Realms

1. **The Shire**: Beginner-friendly hills and trees, few obstacles
2. **Rivendell**: Water features with bridges to navigate
3. **Mirkwood**: Dense forest with spiders and complex paths
4. **Rohan**: Wide open plains with many horses and rocky obstacles
5. **Moria**: Maze-like caves with many portals and chasms
6. **Mordor**: Most challenging level with lava and enemies

## 🐎 Horse Types

| Horse | Speed | Effect | Rarity |
|-------|-------|--------|--------|
| Shadowfax | ★★★★★ | Speed boost | Very Rare |
| Mearas | ★★★★☆ | Transformation boost | Rare |
| Rohirrim | ★★★☆☆ | Formation movement | Common |
| Nazgul Steed | ★★★★★★ | Chases player | Rare |
| Bill Pony | ★★☆☆☆ | Drops treasures | Uncommon |
| Asfaloth | ★★★★☆ | Creates paths | Rare |
| Brego | ★★★☆☆ | Warns of danger | Uncommon |

## 🔥 Dragon Transformations

| Stage | Form | Required Items | Abilities |
|-------|------|----------------|-----------|
| 1 | Serpent | 0 | Flame Breath |
| 2 | Horned Serpent | 5 | + Burning Trail |
| 3 | Proto-Dragon | 10 | + Fire Shield |
| 4 | Wingless Dragon | 15 | + Inferno Burst |
| 5 | True Dragon | 20 | All abilities enhanced |

## 🔧 Debugging

The game includes built-in debugging tools:

1. **Enable Debug Mode**:
   - Open browser console (F12)
   - Type `window.gameInstance.toggleDebugMode()`
   - Or add `?debug=true` to the URL

2. **Debug Features**:
   - Grid overlay with coordinates
   - Object highlighting
   - Position tracking for snake
   - FPS counter
   - Object counts and state information

3. **Reporting Bugs**:
   - Include console logs
   - Note browser and OS version
   - Describe steps to reproduce
   - Submit via GitHub issues

## 🚀 Deploying to GitHub Pages

To deploy the game to GitHub Pages:

1. Fork this repository
2. Navigate to repository settings
3. Go to Pages section
4. Select your branch (usually main)
5. Set the folder to root (/) or docs if you've moved files there
6. Save and wait for deployment to complete
7. Access your game at https://[username].github.io/[repository]

## 🖼️ Asset Creation

The game's visual assets were created using AI image generation:

- **Flame & Ember Graphics**: Created with Midjourney using prompts designed to produce fantasy-themed particle effects
- **Dragon Silhouette**: Generated with a focus on creating a recognizable dragon shape for the loading screen
- **Audio**: Created using ElevenLabs voice generation with SFX features
- **UI Icons**: Custom-designed to match the Lord of the Rings fantasy theme

## 🙏 Acknowledgments

- Inspired by the works of J.R.R. Tolkien
- Built with vanilla JavaScript, HTML5 Canvas, and CSS
- Graphics created using AI image generation
- Thanks to the DigitalHumanitiesCraft team for supporting this project
- Special thanks to Claude AI for assistance with code optimization

---

*"Even the smallest person can change the course of the future... especially when they're a growing snake!"*