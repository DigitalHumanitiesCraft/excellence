// The One Snake - Audio System (Simplified Version)

class AudioManager {
    constructor(game) {
        this.game = game;
        this.musicMuted = false;
        this.soundMuted = false;
        
        // Get background music element
        this.backgroundMusic = document.getElementById('music-background');
        
        // Sound paths
        this.soundPaths = {
            'menu-hover': '/excellence/promptotyping/the-one-snake-vibe-coding/assets/audio/menu-hover.mp3',
            'menu-click': '/excellence/promptotyping/the-one-snake-vibe-coding/assets/audio/menu-click.mp3',
            'collect': '/excellence/promptotyping/the-one-snake-vibe-coding/assets/audio/collect.mp3',
            'transform': '/excellence/promptotyping/the-one-snake-vibe-coding/assets/audio/transform.mp3',
            'game-over': '/excellence/promptotyping/the-one-snake-vibe-coding/assets/audio/game-over.mp3',
            'victory': '/excellence/promptotyping/the-one-snake-vibe-coding/assets/audio/victory.mp3',
            'ability-fire': '/excellence/promptotyping/the-one-snake-vibe-coding/assets/audio/ability-fire.mp3',
            'ability-shield': '/excellence/promptotyping/the-one-snake-vibe-coding/assets/audio/ability-shield.mp3',
            'portal': '/excellence/promptotyping/the-one-snake-vibe-coding/assets/audio/portal.mp3'
        };
        
        // Audio elements cache
        this.audioElements = {};
        
        // Set background music volume
        if (this.backgroundMusic) {
            this.backgroundMusic.volume = 0.3;
        }
        
        // Initialize audio buttons
        this.updateAudioButtons();
        
        // Try to load audio settings from localStorage
        this.loadSettings();
    }
    
    // Create or get audio element for a sound
    getAudioElement(soundId) {
        // Return from cache if exists
        if (this.audioElements[soundId]) {
            return this.audioElements[soundId];
        }
        
        // Create new audio element
        const audio = new Audio();
        audio.src = this.soundPaths[soundId];
        
        // Set appropriate volume based on sound type
        if (soundId === 'menu-hover' || soundId === 'menu-click') {
            audio.volume = 0.2; // UI sounds
        } else if (soundId === 'transform' || soundId === 'game-over' || soundId === 'victory') {
            audio.volume = 0.4; // Important events
        } else {
            audio.volume = 0.25; // Standard gameplay sounds
        }
        
        // Add to cache
        this.audioElements[soundId] = audio;
        return audio;
    }
    
    // Save current audio settings to localStorage
    saveSettings() {
        try {
            localStorage.setItem('theOneSnake_musicMuted', this.musicMuted);
            localStorage.setItem('theOneSnake_soundMuted', this.soundMuted);
        } catch (e) {
            console.warn("Could not save audio settings to localStorage:", e);
        }
    }
    
    // Load audio settings from localStorage
    loadSettings() {
        try {
            const musicMuted = localStorage.getItem('theOneSnake_musicMuted');
            const soundMuted = localStorage.getItem('theOneSnake_soundMuted');
            
            if (musicMuted !== null) {
                this.musicMuted = musicMuted === 'true';
            }
            
            if (soundMuted !== null) {
                this.soundMuted = soundMuted === 'true';
            }
            
            this.updateAudioButtons();
        } catch (e) {
            console.warn("Could not load audio settings from localStorage:", e);
        }
    }
    
    // Update audio button visuals
    updateAudioButtons() {
        const musicButton = document.getElementById('toggle-music');
        const soundButton = document.getElementById('toggle-sound');
        
        if (musicButton) {
            if (this.musicMuted) {
                musicButton.classList.add('music-off');
            } else {
                musicButton.classList.remove('music-off');
            }
        }
        
        if (soundButton) {
            if (this.soundMuted) {
                soundButton.classList.add('sound-off');
            } else {
                soundButton.classList.remove('sound-off');
            }
        }
    }
    
    // Play a specific sound
    play(soundId) {
        // Skip if sound is muted
        if (this.soundMuted) return;
        
        // Get or create audio element
        const audio = this.getAudioElement(soundId);
        
        // Reset playback position
        audio.currentTime = 0;
        
        // Play the sound with error handling
        audio.play().catch(e => {
            console.warn(`Could not play sound "${soundId}":`, e);
        });
    }
    
    // Start background music
    startBackgroundMusic() {
        if (!this.backgroundMusic) {
            console.warn("Background music element not found");
            return;
        }
        
        if (this.musicMuted) return;
        
        // Play with autoplay restrictions handling
        const playPromise = this.backgroundMusic.play();
        
        if (playPromise !== undefined) {
            playPromise.catch(e => {
                console.warn("Could not autoplay background music:", e);
                
                // Create a one-time click handler to start music
                const startAudio = () => {
                    if (!this.musicMuted) {
                        this.backgroundMusic.play().catch(e => 
                            console.warn("Still could not play music:", e)
                        );
                    }
                    document.removeEventListener('click', startAudio);
                };
                
                document.addEventListener('click', startAudio);
            });
        }
    }
    
    // Stop background music
    stopBackgroundMusic() {
        if (this.backgroundMusic) {
            this.backgroundMusic.pause();
            this.backgroundMusic.currentTime = 0;
        }
    }
    
    // Toggle music mute state
    toggleMusic() {
        this.musicMuted = !this.musicMuted;
        
        if (this.backgroundMusic) {
            if (this.musicMuted) {
                this.backgroundMusic.pause();
            } else {
                this.backgroundMusic.play().catch(e => {
                    console.warn("Could not play background music:", e);
                });
            }
        }
        
        this.updateAudioButtons();
        this.saveSettings();
    }
    
    // Toggle sound effects mute state
    toggleSound() {
        this.soundMuted = !this.soundMuted;
        this.updateAudioButtons();
        this.saveSettings();
    }
    
    // Clean up method for when game ends
    cleanup() {
        this.stopBackgroundMusic();
        
        // Stop all currently playing sounds
        for (const soundId in this.audioElements) {
            const audio = this.audioElements[soundId];
            if (audio) {
                audio.pause();
                audio.currentTime = 0;
            }
        }
    }
}