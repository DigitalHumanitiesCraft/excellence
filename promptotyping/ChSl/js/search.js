/**
 * Search module for handling document searching
 * This module manages the search functionality across documents and within a document
 */

import { loadDocumentById, getDocumentById, showError } from './app.js';

// Module state
let collectionData = null;
let searchIndex = {};
let currentSearchTerm = '';
let currentSearchResults = [];
let currentResultIndex = -1;
let isSearchPanelOpen = false;

/**
 * Initialize the search functionality
 * @param {object} collection - The collection data
 */
function initSearch(collection) {
    collectionData = collection;
    
    // Set up search panel toggle
    const searchButton = document.createElement('button');
    searchButton.id = 'search-toggle';
    searchButton.className = 'tool-button';
    searchButton.title = 'Search (Ctrl+F)';
    searchButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>';
    
    // Add search button to the tool panel
    const toolPanel = document.querySelector('.tool-panel');
    toolPanel.appendChild(searchButton);
    
    // Set up event listeners
    searchButton.addEventListener('click', toggleSearchPanel);
    document.getElementById('search-button').addEventListener('click', performSearch);
    document.getElementById('close-search').addEventListener('click', toggleSearchPanel);
    document.getElementById('search-input').addEventListener('keydown', handleSearchInputKeydown);
    
    // Initialize search panel state
    document.getElementById('search-transcription').checked = true;
    document.getElementById('search-annotations').checked = true;
    
    // Add navigation buttons
    addSearchNavigationButtons();
    
    // Create the search index
    createSearchIndex(collection);
}

/**
 * Add search result navigation buttons
 */
function addSearchNavigationButtons() {
    const searchForm = document.querySelector('.search-form');
    if (!searchForm) return;
    
    // Create navigation buttons container
    const navContainer = document.createElement('div');
    navContainer.className = 'search-navigation';
    
    // Previous result button
    const prevButton = document.createElement('button');
    prevButton.id = 'search-prev';
    prevButton.textContent = '↑';
    prevButton.title = 'Previous result';
    prevButton.className = 'search-nav-button';
    prevButton.disabled = true;
    prevButton.addEventListener('click', navigateToPreviousResult);
    
    // Next result button
    const nextButton = document.createElement('button');
    nextButton.id = 'search-next';
    nextButton.textContent = '↓';
    nextButton.title = 'Next result';
    nextButton.className = 'search-nav-button';
    nextButton.disabled = true;
    nextButton.addEventListener('click', navigateToNextResult);
    
    // Result counter
    const resultCounter = document.createElement('span');
    resultCounter.id = 'search-result-count';
    resultCounter.className = 'search-result-count';
    resultCounter.textContent = 'No results';
    
    // Add to container
    navContainer.appendChild(prevButton);
    navContainer.appendChild(resultCounter);
    navContainer.appendChild(nextButton);
    
    // Insert after search button
    const searchButton = document.getElementById('search-button');
    searchForm.insertBefore(navContainer, searchButton.nextSibling);
    
    // Add styles for navigation buttons
    const style = document.createElement('style');
    style.textContent = `
        .search-navigation {
            display: flex;
            align-items: center;
            margin-top: 8px;
        }
        .search-nav-button {
            padding: 4px 8px;
            font-size: 14px;
            background-color: var(--secondary-bg);
            border: 1px solid var(--border-color);
            cursor: pointer;
        }
        .search-nav-button:disabled {
            opacity: 0.5;
            cursor: default;
        }
        .search-result-count {
            margin: 0 10px;
            font-size: 14px;
            color: var(--secondary-text);
        }
    `;
    document.head.appendChild(style);
}

/**
 * Handle keydown event in search input
 * @param {Event} event - Keydown event
 */
function handleSearchInputKeydown(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        performSearch();
    } else if (event.key === 'Escape') {
        event.preventDefault();
        toggleSearchPanel(false);
    }
}

/**
 * Toggle the search panel visibility
 * @param {boolean|Event} [showOrEvent] - Boolean to force show/hide, or event object
 */
function toggleSearchPanel(showOrEvent) {
    const searchPanel = document.getElementById('search-panel');
    
    // Determine if panel should be shown or hidden
    let show;
    if (typeof showOrEvent === 'boolean') {
        show = showOrEvent;
    } else {
        show = searchPanel.classList.contains('collapsed');
    }
    
    if (show) {
        searchPanel.classList.remove('collapsed');
        document.getElementById('search-input').focus();
        isSearchPanelOpen = true;
    } else {
        searchPanel.classList.add('collapsed');
        isSearchPanelOpen = false;
    }
    
    // Update button active state
    const searchToggle = document.getElementById('search-toggle');
    if (searchToggle) {
        searchToggle.classList.toggle('active', show);
    }
}

/**
 * Create a search index from the collection data
 * @param {object} collection - The collection data
 */
function createSearchIndex(collection) {
    searchIndex = {
        documentIndex: {},
        keywordIndex: {}
    };
    
    if (!collection || !collection.documents) {
        console.warn('No collection data available for search indexing');
        return;
    }
    
    // Index each document's metadata
    collection.documents.forEach(doc => {
        // Store document info
        searchIndex.documentIndex[doc.id] = {
            id: doc.id,
            title: doc.title || '',
            description: doc.description || '',
            source: doc.source || '',
            date: doc.date || '',
            tokens: tokenizeText(`${doc.title} ${doc.description} ${doc.source} ${doc.date}`),
            hasFullText: false,  // Will be set to true when document is loaded
            textContent: ''      // Will be populated when document is loaded
        };
        
        // Index each token
        const docTokens = searchIndex.documentIndex[doc.id].tokens;
        docTokens.forEach(token => {
            if (!searchIndex.keywordIndex[token]) {
                searchIndex.keywordIndex[token] = new Set();
            }
            searchIndex.keywordIndex[token].add(doc.id);
        });
    });
    
    console.log(`Search index created with ${collection.documents.length} documents`);
}

/**
 * Tokenize text for indexing
 * @param {string} text - Text to tokenize
 * @return {string[]} Array of tokens
 */
function tokenizeText(text) {
    if (!text) return [];
    
    // Convert to lowercase and split by non-alphanumeric characters
    return text.toLowerCase()
        .replace(/[^\p{L}\p{N}]/gu, ' ')  // Replace non-alphanumeric chars with space
        .split(/\s+/)                      // Split by whitespace
        .filter(token => token.length > 1) // Remove empty tokens and single chars
        .map(token => token.trim());       // Trim any remaining whitespace
}

/**
 * Index the content of a loaded document
 * @param {string} documentId - Document ID
 * @param {string} textContent - Full text content
 */
function indexDocumentContent(documentId, textContent) {
    if (!searchIndex.documentIndex[documentId]) {
        console.warn(`Document ${documentId} not found in search index`);
        return;
    }
    
    // Store full text content
    searchIndex.documentIndex[documentId].hasFullText = true;
    searchIndex.documentIndex[documentId].textContent = textContent;
    
    // Tokenize and index content
    const contentTokens = tokenizeText(textContent);
    searchIndex.documentIndex[documentId].contentTokens = contentTokens;
    
    // Update keyword index
    contentTokens.forEach(token => {
        if (!searchIndex.keywordIndex[token]) {
            searchIndex.keywordIndex[token] = new Set();
        }
        searchIndex.keywordIndex[token].add(documentId);
    });
    
    console.log(`Indexed content of document ${documentId} (${contentTokens.length} tokens)`);
}

/**
 * Extract text content from document data
 * @param {object} docData - Document data
 * @return {string} Extracted text content
 */
function extractTextContent(docData) {
    if (!docData || !docData.textRegions) {
        return '';
    }
    
    // Collect text from all regions and lines
    let content = '';
    
    // Follow reading order if available
    const regions = docData.readingOrder 
        ? docData.readingOrder.map(id => docData.textRegions.find(r => r.id === id)).filter(r => r)
        : docData.textRegions;
    
    regions.forEach(region => {
        if (region.lines) {
            region.lines.forEach(line => {
                if (line.text) {
                    content += line.text + ' ';
                }
            });
            content += '\n';
        } else if (region.text) {
            content += region.text + '\n';
        }
    });
    
    return content;
}

/**
 * Perform a search
 */
function performSearch() {
    const searchInput = document.getElementById('search-input');
    const searchTerm = searchInput.value.trim();
    
    if (!searchTerm) {
        return;
    }
    
    currentSearchTerm = searchTerm;
    
    const searchTranscription = document.getElementById('search-transcription').checked;
    const searchAnnotations = document.getElementById('search-annotations').checked;
    
    // Search across the collection for matching documents
    const results = searchCollection(searchTerm);
    
    // Display search results
    displaySearchResults(results);
    
    // Check if we should search in the current document
    const transcriptionContainer = document.querySelector('.transcription-container');
    if (transcriptionContainer && searchTranscription) {
        // Clear previous highlights in the current document
        clearSearchHighlights();
        
        // Search in the current document
        const documentResults = searchInCurrentDocument(searchTerm);
        
        // Update navigation controls
        updateSearchNavigation(documentResults.length);
    } else {
        // Update navigation controls - no results in current document
        updateSearchNavigation(0);
    }
}

/**
 * Update search navigation controls
 * @param {number} resultCount - Number of results in current document
 */
function updateSearchNavigation(resultCount) {
    const prevButton = document.getElementById('search-prev');
    const nextButton = document.getElementById('search-next');
    const countDisplay = document.getElementById('search-result-count');
    
    if (resultCount > 0) {
        // Enable navigation buttons
        prevButton.disabled = false;
        nextButton.disabled = false;
        
        // Update result count display
        countDisplay.textContent = `${currentResultIndex + 1} of ${resultCount}`;
    } else {
        // Disable navigation buttons
        prevButton.disabled = true;
        nextButton.disabled = true;
        
        // Update result count display
        countDisplay.textContent = 'No results';
    }
}

/**
 * Navigate to the next search result
 */
function navigateToNextResult() {
    const highlights = document.querySelectorAll('.search-highlight');
    if (highlights.length === 0) return;
    
    // Increment result index, wrapping around if necessary
    currentResultIndex = (currentResultIndex + 1) % highlights.length;
    
    // Scroll to the result
    scrollToSearchResult(currentResultIndex);
    
    // Update navigation display
    updateSearchNavigation(highlights.length);
}

/**
 * Navigate to the previous search result
 */
function navigateToPreviousResult() {
    const highlights = document.querySelectorAll('.search-highlight');
    if (highlights.length === 0) return;
    
    // Decrement result index, wrapping around if necessary
    currentResultIndex = (currentResultIndex - 1 + highlights.length) % highlights.length;
    
    // Scroll to the result
    scrollToSearchResult(currentResultIndex);
    
    // Update navigation display
    updateSearchNavigation(highlights.length);
}

/**
 * Scroll to a specific search result
 * @param {number} index - Index of the result to scroll to
 */
function scrollToSearchResult(index) {
    const highlights = document.querySelectorAll('.search-highlight');
    if (index < 0 || index >= highlights.length) return;
    
    // Get the specific highlight element
    const highlight = highlights[index];
    
    // Remove active state from all highlights
    highlights.forEach(h => h.classList.remove('active'));
    
    // Add active state to current highlight
    highlight.classList.add('active');
    
    // Scroll the highlight into view
    highlight.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
    });
    
    // Get the line containing this highlight
    const line = highlight.closest('.transcription-line');
    if (line) {
        // Trigger line highlighting in the document image
        const highlightEvent = new MouseEvent('mouseover', {
            bubbles: true,
            cancelable: true
        });
        line.dispatchEvent(highlightEvent);
    }
}

/**
 * Search within the current document
 * @param {string} searchTerm - The search term
 * @return {Array} Array of result ranges
 */
function searchInCurrentDocument(searchTerm) {
    const searchResults = [];
    const transcriptionContainer = document.querySelector('.transcription-container');
    if (!transcriptionContainer) return searchResults;
    
    // Reset current result index
    currentResultIndex = -1;
    
    // Normalize search term for case-insensitive matching
    const normalizedTerm = searchTerm.toLowerCase();
    
    // Find matches in the transcription by processing each line
    const lines = transcriptionContainer.querySelectorAll('.transcription-line');
    
    lines.forEach(line => {
        const lineText = line.textContent || '';
        const normalizedText = lineText.toLowerCase();
        let startPos = 0;
        let matchPos;
        
        // Find all matches in this line
        while ((matchPos = normalizedText.indexOf(normalizedTerm, startPos)) !== -1) {
            // Create result object
            const result = {
                line: line,
                matchStart: matchPos,
                matchEnd: matchPos + normalizedTerm.length,
                matchText: lineText.substring(matchPos, matchPos + normalizedTerm.length)
            };
            
            // Add to results
            searchResults.push(result);
            
            // Apply highlight to this match
            highlightSearchMatch(line, result);
            
            // Move position for next search
            startPos = matchPos + normalizedTerm.length;
        }
    });
    
    // If results were found, set to first result
    if (searchResults.length > 0) {
        currentResultIndex = 0;
        scrollToSearchResult(0);
    }
    
    return searchResults;
}

/**
 * Highlight a search match in a line
 * @param {Element} line - The line element
 * @param {object} result - Search result object
 */
function highlightSearchMatch(line, result) {
    // Get current content
    const content = line.innerHTML;
    
    // Find text node containing the match
    const textNodes = getAllTextNodes(line);
    let matchNode = null;
    let nodeStartPos = 0;
    let matchNodePos = -1;
    
    // Find the specific text node and position
    for (const node of textNodes) {
        const nodeLength = node.textContent.length;
        if (nodeStartPos <= result.matchStart && result.matchStart < nodeStartPos + nodeLength) {
            matchNode = node;
            matchNodePos = result.matchStart - nodeStartPos;
            break;
        }
        nodeStartPos += nodeLength;
    }
    
    if (matchNode) {
        // Calculate local positions
        const localStart = matchNodePos;
        const localEnd = localStart + result.matchText.length;
        const nodeText = matchNode.textContent;
        
        // Create fragments
        const beforeText = nodeText.substring(0, localStart);
        const matchText = nodeText.substring(localStart, localEnd);
        const afterText = nodeText.substring(localEnd);
        
        // Create new nodes
        const beforeNode = document.createTextNode(beforeText);
        const matchSpan = document.createElement('span');
        matchSpan.className = 'search-highlight';
        matchSpan.textContent = matchText;
        const afterNode = document.createTextNode(afterText);
        
        // Replace original node with new nodes
        const parent = matchNode.parentNode;
        parent.insertBefore(beforeNode, matchNode);
        parent.insertBefore(matchSpan, matchNode);
        parent.insertBefore(afterNode, matchNode);
        parent.removeChild(matchNode);
    }
}

/**
 * Get all text nodes within an element
 * @param {Element} element - Element to get text nodes from
 * @return {Array} Array of text nodes
 */
function getAllTextNodes(element) {
    const nodes = [];
    
    function getNodes(node) {
        if (node.nodeType === Node.TEXT_NODE) {
            nodes.push(node);
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            // Skip search highlights to avoid double-highlighting
            if (node.classList && node.classList.contains('search-highlight')) {
                return;
            }
            
            // Process child nodes
            Array.from(node.childNodes).forEach(getNodes);
        }
    }
    
    getNodes(element);
    return nodes;
}

/**
 * Clear search highlights
 */
function clearSearchHighlights() {
    const highlights = document.querySelectorAll('.search-highlight');
    
    // Process each highlight
    highlights.forEach(highlight => {
        // Get parent node
        const parent = highlight.parentNode;
        
        // Create text node with highlight content
        const textNode = document.createTextNode(highlight.textContent);
        
        // Replace highlight with text node
        parent.replaceChild(textNode, highlight);
        
        // Normalize parent to merge adjacent text nodes
        parent.normalize();
    });
    
    // Reset current result index
    currentResultIndex = -1;
    
    // Update navigation
    updateSearchNavigation(0);
}

/**
 * Search across the document collection
 * @param {string} searchTerm - The search term
 * @return {Array} Search results
 */
function searchCollection(searchTerm) {
    const results = [];
    
    if (!searchIndex || !searchTerm) {
        return results;
    }
    
    // Tokenize search term
    const searchTokens = tokenizeText(searchTerm);
    if (searchTokens.length === 0) {
        searchTokens.push(searchTerm.toLowerCase());
    }
    
    // Get matching document IDs
    const matchingDocIds = new Set();
    
    // Exact phrase search
    if (searchTerm.includes(' ')) {
        // For multi-word searches, we need to check full text
        const normalizedSearchTerm = searchTerm.toLowerCase();
        
        // Check each document with full text
        Object.keys(searchIndex.documentIndex).forEach(docId => {
            const docInfo = searchIndex.documentIndex[docId];
            
            // Check metadata fields
            if (docInfo.title.toLowerCase().includes(normalizedSearchTerm) ||
                docInfo.description.toLowerCase().includes(normalizedSearchTerm) ||
                docInfo.source.toLowerCase().includes(normalizedSearchTerm) ||
                docInfo.date.toLowerCase().includes(normalizedSearchTerm)) {
                matchingDocIds.add(docId);
            }
            // Check full text content if available
            else if (docInfo.hasFullText && docInfo.textContent.toLowerCase().includes(normalizedSearchTerm)) {
                matchingDocIds.add(docId);
            }
        });
    } else {
        // For single-word searches, we can use the keyword index
        searchTokens.forEach(token => {
            if (searchIndex.keywordIndex[token]) {
                searchIndex.keywordIndex[token].forEach(docId => {
                    matchingDocIds.add(docId);
                });
            }
        });
    }
    
    // Add matching documents to results
    matchingDocIds.forEach(docId => {
        const docInfo = searchIndex.documentIndex[docId];
        const doc = getDocumentById(docId);
        
        if (doc) {
            results.push({
                id: docId,
                title: doc.title || docInfo.title,
                source: doc.source || docInfo.source,
                date: doc.date || docInfo.date,
                description: doc.description || docInfo.description
            });
        }
    });
    
    // Sort results by relevance (simple implementation)
    results.sort((a, b) => a.title.localeCompare(b.title));
    
    // Store current search results
    currentSearchResults = results;
    
    return results;
}

/**
 * Display search results
 * @param {Array} results - Search results
 */
function displaySearchResults(results) {
    const resultsContainer = document.getElementById('search-results');
    resultsContainer.innerHTML = '';
    
    if (results.length === 0) {
        resultsContainer.innerHTML = '<p class="no-results">No documents found matching your search.</p>';
        return;
    }
    
    // Create result list
    const resultsList = document.createElement('div');
    resultsList.className = 'search-results-list';
    
    // Add results
    results.forEach(doc => {
        const resultItem = document.createElement('div');
        resultItem.className = 'search-result-item';
        
        const title = document.createElement('div');
        title.className = 'result-title';
        title.textContent = doc.title || 'Untitled Document';
        
        const meta = document.createElement('div');
        meta.className = 'result-meta';
        
        // Combine date and source for metadata display
        const metaParts = [];
        if (doc.date) metaParts.push(doc.date);
        if (doc.source) metaParts.push(doc.source);
        meta.textContent = metaParts.join(' • ');
        
        const description = document.createElement('div');
        description.className = 'result-description';
        description.textContent = doc.description || '';
        
        // Assemble the item
        resultItem.appendChild(title);
        resultItem.appendChild(meta);
        
        if (doc.description) {
            resultItem.appendChild(description);
        }
        
        // Add click handler
        resultItem.addEventListener('click', () => {
            loadDocumentById(doc.id);
            // Keep search panel open to show matches in the document
        });
        
        resultsList.appendChild(resultItem);
    });
    
    // Add to container
    resultsContainer.appendChild(resultsList);
    
    // Add result count
    const countLabel = document.createElement('p');
    countLabel.className = 'search-results-count';
    countLabel.textContent = `${results.length} document${results.length === 1 ? '' : 's'} found`;
    resultsContainer.appendChild(countLabel);
}

/**
 * Get search panel open state
 * @return {boolean} True if search panel is open
 */
function isSearchOpen() {
    return isSearchPanelOpen;
}

/**
 * Handle document loaded event
 * @param {string} documentId - Document ID
 * @param {object} docData - Document data
 */
function handleDocumentLoaded(documentId, docData) {
    // Extract text content from the document
    const textContent = extractTextContent(docData);
    
    // Index the document content
    indexDocumentContent(documentId, textContent);
    
    // If there's an active search term, perform search on this document
    if (currentSearchTerm && isSearchPanelOpen) {
        // Clear previous highlights
        clearSearchHighlights();
        
        // Search in the current document
        const documentResults = searchInCurrentDocument(currentSearchTerm);
        
        // Update navigation controls
        updateSearchNavigation(documentResults.length);
    }
}

// Export functions that need to be accessed by other modules
export {
    initSearch,
    performSearch,
    clearSearchHighlights,
    isSearchOpen,
    handleDocumentLoaded,
    toggleSearchPanel
};