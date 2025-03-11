// The One Snake - Main Entry Point

// Initialize game when the window is loaded
window.addEventListener('load', () => {
    // Create game instance
    const game = new Game();
    
    // For debugging (remove in production)
    window.gameInstance = game;
    
    console.log('The One Snake game initialized');
});