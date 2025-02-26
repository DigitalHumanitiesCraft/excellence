/**
 * ui.js - User Interface Module for Badisches Wörterbuch
 * Handles UI display, event handling, and user interaction
 */

// Global state
const state = {
    allArticles: [],
    currentDisplayedArticles: [],
    searchIndex: null,
    recentlyViewed: [],
    itemsPerPage: 10,
    currentPage: 1,
    currentLetter: null,
    currentQuery: '',
    isSearching: false
  };
  
  /**
   * Initialize the application UI
   * @param {Array} articles - Processed article objects
   */
  function initializeUI(articles) {
    state.allArticles = articles;
    state.searchIndex = new SearchIndex(articles);
    
    // Initialize search functionality
    initializeSearch();
    
    // Initialize alphabet navigation
    initializeAlphabetNav();
    
    // Initialize recently viewed list from localStorage if available
    loadRecentlyViewed();
    
    // Display initial articles - show 10 articles from 'S' to match screenshot
    const initialLetter = 'S';
    const articlesByLetter = state.searchIndex.getArticlesByLetter(initialLetter);
    state.currentDisplayedArticles = articlesByLetter;
    state.currentLetter = initialLetter;
    
    displayArticles(articlesByLetter.slice(0, state.itemsPerPage));
    highlightAlphabetLetter(initialLetter);
    updatePagination(articlesByLetter.length);
    
    // Update status information
    updateStatusInfo(`${articlesByLetter.length} Einträge mit "${initialLetter}"`);
    
    console.log('UI initialized');
  }
  
  /**
   * Initialize search functionality
   */
  function initializeSearch() {
    const searchForm = document.querySelector('form');
    const searchInput = document.querySelector('input[type="search"]');
    
    searchForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const query = searchInput.value.trim();
      if (query.length === 0) return;
      
      performSearch(query);
    });
    
    // Initialize advanced search
    const advancedSearchBtn = document.getElementById('advancedSearchBtn');
    advancedSearchBtn.addEventListener('click', () => {
      const criteria = {
        headword: document.getElementById('searchHeadword').value.trim(),
        definition: document.getElementById('searchDefinition').value.trim(),
        example: document.getElementById('searchExample').value.trim(),
        source: document.getElementById('searchSource').value.trim()
      };
      
      if (Object.values(criteria).every(val => val === '')) {
        alert('Bitte geben Sie mindestens ein Suchkriterium ein.');
        return;
      }
      
      performAdvancedSearch(criteria);
    });
  }
  
  /**
   * Perform a search with the given query
   * @param {string} query - Search query
   */
  function performSearch(query) {
    state.isSearching = true;
    state.currentQuery = query;
    state.currentLetter = null; // Reset current letter
    
    // Reset alphabet navigation highlighting
    resetAlphabetHighlighting();
    
    // Perform search
    const results = state.searchIndex.search(query, { 
      exactMatch: true,
      fuzzy: true
    });
    
    state.currentDisplayedArticles = results;
    state.currentPage = 1;
    
    displayArticles(results.slice(0, state.itemsPerPage), query);
    updatePagination(results.length);
    updateStatusInfo(`${results.length} Ergebnis${results.length !== 1 ? 'se' : ''} für "${query}"`);
  }
  
  /**
   * Perform an advanced search with the given criteria
   * @param {Object} criteria - Search criteria
   */
  function performAdvancedSearch(criteria) {
    state.isSearching = true;
    state.currentQuery = 'Advanced Search';
    state.currentLetter = null; // Reset current letter
    
    // Reset alphabet navigation highlighting
    resetAlphabetHighlighting();
    
    // Perform advanced search
    const results = state.searchIndex.advancedSearch(criteria);
    
    state.currentDisplayedArticles = results;
    state.currentPage = 1;
    
    displayArticles(results.slice(0, state.itemsPerPage));
    updatePagination(results.length);
    
    // Create criteria description for status message
    const criteriaDesc = Object.entries(criteria)
      .filter(([_, value]) => value !== '')
      .map(([key, value]) => {
        const fieldNames = {
          headword: 'Stichwort',
          definition: 'Definition',
          example: 'Beispiel',
          source: 'Quelle'
        };
        return `${fieldNames[key]}: "${value}"`;
      })
      .join(', ');
    
    updateStatusInfo(`${results.length} Ergebnis${results.length !== 1 ? 'se' : ''} für ${criteriaDesc}`);
  }
  
  /**
   * Update search results information
   * @param {string} message - Status message to display
   */
  function updateStatusInfo(message) {
    const statusInfo = document.getElementById('statusInfo');
    statusInfo.textContent = message;
    statusInfo.style.display = 'block';
  }
  
  /**
   * Display articles in the UI
   * @param {Array} articlesToDisplay - Articles to display
   * @param {string} [highlightQuery] - Optional query to highlight
   */
  function displayArticles(articlesToDisplay, highlightQuery = '') {
    const entriesContainer = document.getElementById('dictionaryEntries');
    
    // Clear previous content
    entriesContainer.innerHTML = '';
    
    if (articlesToDisplay.length === 0) {
      entriesContainer.innerHTML = '<div class="alert alert-warning">Keine Einträge gefunden.</div>';
      return;
    }
    
    // Display articles
    articlesToDisplay.forEach(article => {
      let html = article.rawHtml;
      
      // Highlight search terms if provided
      if (highlightQuery && state.isSearching) {
        html = state.searchIndex.highlightSearchTerms(html, highlightQuery);
      }
      
      const articleElement = document.createElement('div');
      articleElement.innerHTML = html;
      entriesContainer.appendChild(articleElement.firstChild);
      
      // Add click event for headwords to add to recently viewed
      const headword = articleElement.querySelector('.headword');
      if (headword) {
        headword.addEventListener('click', () => {
          addToRecentlyViewed(article);
        });
      }
    });
    
    // Add event listeners for cross-references
    document.querySelectorAll('.cross-reference').forEach(ref => {
      ref.addEventListener('click', handleCrossReferenceClick);
    });
  }
  
  /**
   * Add pagination controls to the container
   * @param {number} totalItems - Total number of items
   */
  function updatePagination(totalItems) {
    const totalPages = Math.ceil(totalItems / state.itemsPerPage);
    
    if (totalPages <= 1) {
      // Hide pagination if only one page
      const existingPagination = document.querySelector('.pagination-container');
      if (existingPagination) {
        existingPagination.innerHTML = '';
      }
      return;
    }
    
    let paginationContainer = document.querySelector('.pagination-container');
    
    if (!paginationContainer) {
      paginationContainer = document.createElement('div');
      paginationContainer.className = 'pagination-container mt-4';
      document.getElementById('dictionaryEntries').after(paginationContainer);
    }
    
    paginationContainer.innerHTML = `
      <nav aria-label="Page navigation">
        <ul class="pagination justify-content-center">
          <li class="page-item ${state.currentPage === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" data-page="prev">Vorherige</a>
          </li>
          ${generatePageNumbers(totalPages)}
          <li class="page-item ${state.currentPage === totalPages ? 'disabled' : ''}">
            <a class="page-link" href="#" data-page="next">Nächste</a>
          </li>
        </ul>
      </nav>
    `;
    
    // Add event listeners to pagination links
    paginationContainer.querySelectorAll('.page-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const pageAction = e.target.dataset.page;
        
        if (pageAction === 'prev' && state.currentPage > 1) {
          state.currentPage--;
        } else if (pageAction === 'next' && state.currentPage < totalPages) {
          state.currentPage++;
        } else if (!isNaN(pageAction)) {
          state.currentPage = parseInt(pageAction);
        }
        
        // Calculate start and end indices for current page
        const startIdx = (state.currentPage - 1) * state.itemsPerPage;
        const endIdx = startIdx + state.itemsPerPage;
        
        // Display current page articles
        displayArticles(
          state.currentDisplayedArticles.slice(startIdx, endIdx),
          state.isSearching ? state.currentQuery : ''
        );
        
        // Update pagination UI
        updatePagination(totalItems);
        
        // Scroll to top of results
        document.getElementById('dictionaryEntries').scrollIntoView({ behavior: 'smooth' });
      });
    });
  }
  
  /**
   * Generate HTML for page number buttons
   * @param {number} totalPages - Total number of pages
   * @returns {string} HTML string for page numbers
   */
  function generatePageNumbers(totalPages) {
    let html = '';
    const currentPage = state.currentPage;
    
    // Logic to show limited page numbers with ellipsis for many pages
    if (totalPages <= 7) {
      // Show all pages if 7 or fewer
      for (let i = 1; i <= totalPages; i++) {
        html += `<li class="page-item ${i === currentPage ? 'active' : ''}">
          <a class="page-link" href="#" data-page="${i}">${i}</a>
        </li>`;
      }
    } else {
      // Show first, last, current and some surrounding pages
      html += `<li class="page-item ${currentPage === 1 ? 'active' : ''}">
        <a class="page-link" href="#" data-page="1">1</a>
      </li>`;
      
      if (currentPage > 3) {
        html += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
      }
      
      // Pages around current
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        html += `<li class="page-item ${i === currentPage ? 'active' : ''}">
          <a class="page-link" href="#" data-page="${i}">${i}</a>
        </li>`;
      }
      
      if (currentPage < totalPages - 2) {
        html += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
      }
      
      html += `<li class="page-item ${currentPage === totalPages ? 'active' : ''}">
        <a class="page-link" href="#" data-page="${totalPages}">${totalPages}</a>
      </li>`;
    }
    
    return html;
  }
  
  /**
   * Handle click on cross-reference
   * @param {Event} event - Click event
   */
  function handleCrossReferenceClick(event) {
    const refText = event.target.textContent.trim();
    
    // Find article with this headword
    const matchingArticles = state.allArticles.filter(article => 
      article.headword.toLowerCase() === refText.toLowerCase()
    );
    
    if (matchingArticles.length > 0) {
      // Display the referenced article
      displayArticles([matchingArticles[0]]);
      updateStatusInfo(`Verweis zu "${refText}"`);
      
      // Add to recently viewed
      addToRecentlyViewed(matchingArticles[0]);
      
      // Reset search and pagination state
      state.currentPage = 1;
      state.currentDisplayedArticles = [matchingArticles[0]];
      state.isSearching = false;
      state.currentQuery = '';
      state.currentLetter = null;
      
      // Reset alphabet navigation highlighting
      resetAlphabetHighlighting();
      
      // Hide pagination
      updatePagination(1);
    } else {
      updateStatusInfo(`Kein Eintrag für "${refText}" gefunden.`);
    }
  }
  
  /**
   * Initialize alphabet navigation
   */
  function initializeAlphabetNav() {
    const alphabetNav = document.getElementById('alphabetNav');
    const buttons = alphabetNav.querySelectorAll('a');
    
    buttons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        const letter = button.textContent;
        
        // Get articles for this letter
        const filteredArticles = state.searchIndex.getArticlesByLetter(letter);
        
        // Update state
        state.currentDisplayedArticles = filteredArticles;
        state.currentPage = 1;
        state.currentLetter = letter;
        state.isSearching = false;
        state.currentQuery = '';
        
        // Display articles
        displayArticles(filteredArticles.slice(0, state.itemsPerPage));
        updatePagination(filteredArticles.length);
        updateStatusInfo(`${filteredArticles.length} Einträge mit "${letter}"`);
        
        // Highlight the active button
        highlightAlphabetLetter(letter);
      });
    });
  }
  
  /**
   * Highlight the selected letter in the alphabet navigation
   * @param {string} letter - Letter to highlight
   */
  function highlightAlphabetLetter(letter) {
    const alphabetNav = document.getElementById('alphabetNav');
    const buttons = alphabetNav.querySelectorAll('a');
    
    buttons.forEach(button => {
      button.classList.remove('active', 'btn-primary');
      button.classList.add('btn-outline-secondary');
      
      if (button.textContent === letter) {
        button.classList.add('active', 'btn-primary');
        button.classList.remove('btn-outline-secondary');
      }
    });
  }
  
  /**
   * Reset highlighting in alphabet navigation
   */
  function resetAlphabetHighlighting() {
    const alphabetNav = document.getElementById('alphabetNav');
    const buttons = alphabetNav.querySelectorAll('a');
    
    buttons.forEach(button => {
      button.classList.remove('active', 'btn-primary');
      button.classList.add('btn-outline-secondary');
    });
  }
  
  /**
   * Add an article to recently viewed list
   * @param {Object} article - Article to add to recently viewed
   */
  function addToRecentlyViewed(article) {
    // Check if already in list
    const index = state.recentlyViewed.findIndex(item => item.id === article.id);
    
    if (index !== -1) {
      // Remove from current position
      state.recentlyViewed.splice(index, 1);
    }
    
    // Add to beginning of list
    state.recentlyViewed.unshift({
      id: article.id,
      headword: article.headword
    });
    
    // Keep only the last 10 items
    if (state.recentlyViewed.length > 10) {
      state.recentlyViewed.pop();
    }
    
    // Update UI
    updateRecentlyViewedUI();
    
    // Save to localStorage
    saveRecentlyViewed();
  }
  
  /**
   * Update recently viewed UI list
   */
  function updateRecentlyViewedUI() {
    const container = document.getElementById('recentlyViewed');
    container.innerHTML = '';
    
    if (state.recentlyViewed.length === 0) {
      container.innerHTML = '<li class="list-group-item">Keine kürzlich angesehenen Einträge</li>';
      return;
    }
    
    state.recentlyViewed.forEach(item => {
      const listItem = document.createElement('li');
      listItem.className = 'list-group-item';
      listItem.textContent = item.headword;
      
      listItem.addEventListener('click', () => {
        // Find and display the article
        const article = state.allArticles.find(a => a.id === item.id);
        if (article) {
          displayArticles([article]);
          updateStatusInfo(`Eintrag "${item.headword}"`);
          
          // Reset state
          state.currentPage = 1;
          state.currentDisplayedArticles = [article];
          state.isSearching = false;
          state.currentQuery = '';
          state.currentLetter = null;
          
          // Reset alphabet navigation highlighting
          resetAlphabetHighlighting();
          
          // Hide pagination
          updatePagination(1);
        }
      });
      
      container.appendChild(listItem);
    });
  }
  
  /**
   * Save recently viewed list to localStorage
   */
  function saveRecentlyViewed() {
    try {
      localStorage.setItem('badischesWoerterbuch.recentlyViewed', 
        JSON.stringify(state.recentlyViewed));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }
  
  /**
   * Load recently viewed list from localStorage
   */
  function loadRecentlyViewed() {
    try {
      const stored = localStorage.getItem('badischesWoerterbuch.recentlyViewed');
      if (stored) {
        state.recentlyViewed = JSON.parse(stored);
        updateRecentlyViewedUI();
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
    }
  }