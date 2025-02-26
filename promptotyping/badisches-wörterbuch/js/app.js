/**
 * app.js - Main Application Entry Point for Badisches Wörterbuch
 * Initializes and coordinates the application components
 */

// Application state
let appState = {
    initialized: false,
    loadingError: null,
    startTime: Date.now()
  };
  
  /**
   * Initialize the application
   */
  async function initializeApp() {
    console.log('Badisches Wörterbuch application starting...');
    
    try {
      // Show loading indicator (already in HTML)
      updateLoadingStatus('Wörterbuchdaten werden geladen...');
      
      // Load articles from XML
      const articles = await loadArticles();
      
      if (articles.length === 0) {
        throw new Error('Keine Artikel in der XML-Datei gefunden.');
      }
      
      // Update loading status
      updateLoadingStatus(`${articles.length} Einträge geladen. Initialisiere Anwendung...`);
      
      // Initialize UI with loaded articles
      initializeUI(articles);
      
      // Update application state
      appState.initialized = true;
      
      // Log performance metrics
      const loadTime = (Date.now() - appState.startTime) / 1000;
      console.log(`Application initialized with ${articles.length} articles in ${loadTime.toFixed(2)} seconds.`);
      
    } catch (error) {
      console.error('Application initialization error:', error);
      appState.loadingError = error;
      
      // Show error message
      showErrorMessage(error);
    }
  }
  
  /**
   * Update loading status message
   * @param {string} message - Status message to display
   */
  function updateLoadingStatus(message) {
    const statusInfo = document.getElementById('statusInfo');
    if (statusInfo) {
      statusInfo.textContent = message;
    }
  }
  
  /**
   * Show error message to user
   * @param {Error} error - Error object
   */
  function showErrorMessage(error) {
    const statusInfo = document.getElementById('statusInfo');
    if (statusInfo) {
      statusInfo.className = 'alert alert-danger';
      statusInfo.textContent = `Ein Fehler ist aufgetreten: ${error.message}`;
    }
    
    const entriesContainer = document.getElementById('dictionaryEntries');
    if (entriesContainer) {
      entriesContainer.innerHTML = `
        <div class="alert alert-danger">
          <h4>Fehler beim Laden des Wörterbuchs</h4>
          <p>${error.message}</p>
          <p>Bitte stellen Sie sicher, dass die Datei "Artikel.xml" im Ordner "data" vorhanden ist und das korrekte Format hat.</p>
          <p>Tipp: Dieses Projekt muss mit einem lokalen Server ausgeführt werden, z.B. mit der "Live Server" Erweiterung in Visual Studio Code.</p>
          <button id="retryButton" class="btn btn-primary mt-3">Erneut versuchen</button>
        </div>
      `;
      
      // Add retry button functionality
      const retryButton = document.getElementById('retryButton');
      if (retryButton) {
        retryButton.addEventListener('click', () => {
          location.reload();
        });
      }
    }
  }
  
  /**
   * Handle errors during application runtime
   * @param {Error} error - The error object
   * @param {string} context - Context in which the error occurred
   */
  function handleError(error, context) {
    console.error(`Error in ${context}:`, error);
    
    // Show error message if not already shown
    if (!appState.loadingError) {
      appState.loadingError = error;
      showErrorMessage(error);
    }
  }
  
  /**
   * Check if running in a proper server environment
   * If loaded as a file://, suggest using a local server
   */
  function checkEnvironment() {
    if (window.location.protocol === 'file:') {
      console.warn('Application loaded from filesystem, not a server. XML loading might fail due to CORS restrictions.');
      
      const statusInfo = document.getElementById('statusInfo');
      if (statusInfo) {
        statusInfo.className = 'alert alert-warning';
        statusInfo.innerHTML = `
          <strong>Warnung:</strong> Diese Anwendung sollte über einen Webserver ausgeführt werden.
          <p>Bitte verwenden Sie die "Live Server" Erweiterung in Visual Studio Code oder einen anderen lokalen Webserver.</p>
        `;
      }
      
      return false;
    }
    
    return true;
  }
  
  /**
   * Initialize keyboard shortcuts
   */
  function initKeyboardShortcuts() {
    document.addEventListener('keydown', (event) => {
      // Focus search box with Ctrl+F or Command+F
      if ((event.ctrlKey || event.metaKey) && event.key === 'f') {
        event.preventDefault();
        document.querySelector('input[type="search"]').focus();
      }
      
      // Navigation with keyboard arrows when on alphabet bar
      if (document.activeElement && document.activeElement.parentNode && 
          document.activeElement.parentNode.id === 'alphabetNav') {
        const currentLetter = document.activeElement.textContent;
        let nextElement = null;
        
        if (event.key === 'ArrowRight') {
          nextElement = document.activeElement.nextElementSibling;
        } else if (event.key === 'ArrowLeft') {
          nextElement = document.activeElement.previousElementSibling;
        }
        
        if (nextElement) {
          event.preventDefault();
          nextElement.focus();
          nextElement.click();
        }
      }
    });
  }
  
  /**
   * Register service worker for offline capabilities if supported
   */
  function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(registration => {
          console.log('ServiceWorker registration successful with scope: ', registration.scope);
        }, error => {
          console.log('ServiceWorker registration failed: ', error);
        });
      });
    }
  }
  
  /**
   * Initialize the application when DOM is loaded
   */
  document.addEventListener('DOMContentLoaded', () => {
    // Check environment
    const envOK = checkEnvironment();
    
    // Initialize keyboard shortcuts
    initKeyboardShortcuts();
    
    // Only proceed with loading data if environment is OK
    if (envOK) {
      initializeApp().catch(error => {
        handleError(error, 'application initialization');
      });
    }
    
    // Register service worker for offline capabilities
    // registerServiceWorker(); // Uncomment if implementing offline functionality
  });
  
  // Add global error handler
  window.addEventListener('error', (event) => {
    handleError(event.error || new Error(event.message), 'runtime');
    return false;
  });