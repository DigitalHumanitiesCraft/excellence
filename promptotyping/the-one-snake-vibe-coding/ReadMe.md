# The One Snake - Lord of the Rings Themed Snake Game

![Game Banner](https://via.placeholder.com/1200x300.png?text=The+One+Snake)

A Lord of the Rings themed snake game where players control Smaug the dragon through various realms of Middle Earth. Unleash fire abilities, discover magical portals, and transform from a serpent to a majestic dragon.

## 🎮 Play Now

- [Live Demo](https://example.com/the-one-snake) - Play in your browser
- [Mobile App](https://example.com/download) - Download for iOS/Android

## ✨ Features

- **Dragon Transformation** - Evolve from a serpent to a mighty dragon through 5 distinct stages
- **Fire Abilities** - Master 4 powerful abilities: Flame Breath, Fire Shield, Burning Trail, and Inferno Burst
- **Magical Portals** - Teleport across the map through different types of magical gateways
- **Horse Encounters** - Interact with 7 different horse types from the LOTR universe
- **Middle Earth Realms** - Journey through 6 themed levels from The Shire to Mordor
- **Rich Visual Effects** - Experience dynamic particle effects and lighting
- **Responsive Controls** - Play with keyboard or touch controls on mobile

## 🎯 How to Play

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

### Play Online

Simply visit [The One Snake](https://example.com/the-one-snake) to play in your browser.

### Run Locally

```bash
# Clone the repository
git clone https://github.com/yourusername/the-one-snake.git

# Navigate to the project directory
cd the-one-snake

# Open the game in your browser
# You can use any local server, for example with Python:
python -m http.server

# Then open http://localhost:8000 in your browser
```

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
│   ├── ui.js           # UI updates and rendering
│   ├── controls.js     # Input handling for keyboard and touch
│   └── particles.js    # Particle effects system
└── assets/             # Game assets (future addition)
```

## 🔧 Development

### Prerequisites

- Modern web browser (Chrome, Firefox, Safari, Edge)
- Basic understanding of HTML, CSS, and JavaScript

### Building & Testing

```bash
# Run the test suite
open test.html

# Build for production (future implementation)
npm run build
```

### Performance Considerations

The game includes quality settings that can be adjusted for different devices:

- **High Quality**: Full particle effects, lighting, and post-processing
- **Medium Quality**: Reduced particles, lighting enabled, no post-processing
- **Low Quality**: Minimal particles, no lighting effects, optimized for lower-end devices

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

## 🚪 Portal Types

| Portal | Cooldown | Description |
|--------|----------|-------------|
| Palantir | None | Basic teleportation |
| Moria Door | 2s | Requires unlocking |
| Black Gate | 5s | One-way travel only |
| Grey Havens | 10s | Temporary portals |

## 🛠️ Future Enhancements

- Full sprite-based graphics
- Sound effects and music
- Local high score system
- Additional levels
- Boss battles
- Multiplayer mode

## 📋 Testing

Run the comprehensive test suite by opening `test.html` in your browser. The tests verify:

- Core snake mechanics
- Collision detection
- Level generation
- Portal teleportation
- Fire abilities
- Horse interactions
- Transformation system
- Particle effects

## 📄 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## 🙏 Acknowledgments

- Inspired by the works of J.R.R. Tolkien
- Built with vanilla JavaScript, HTML5 Canvas, and CSS
- Special thanks to the open-source community for inspiration and resources

---

*"Not all those who wander are lost, but this snake definitely has a destination."*