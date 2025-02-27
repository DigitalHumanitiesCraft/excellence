/**
 * Search module for handling document searching
 * This module manages the search functionality across documents and within a document
 */

import { loadDocumentById } from './app.js';

// Module variables
let collectionData = null;
let searchIndex = null;

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
    searchButton.title = 'Search';
    searchButton.textContent = 'S';
    
    // Add search button to the tool panel
    const toolPanel = document.querySelector('.tool-panel');
    toolPanel.appendChild(searchButton);
    
    // Set up event listeners
    searchButton.addEventListener('click', toggleSearchPanel);
    document.getElementById('search-button').addEventListener('click', performSearch);
    document.getElementById('close-search').addEventListener('click', toggleSearchPanel);
    
    // Initialize search panel state
    document.getElementById('search-transcription').checked = true;
    document.getElementById('search-annotations').checked = true;
    
    // Create the search index
    createSearchIndex(collection);
}

/**
 * Toggle the search panel visibility
 */
function toggleSearchPanel() {
    const searchPanel = document.getElementById('search-panel');
    searchPanel.classList.toggle('collapsed');
    
    // Focus the search input when opening
    if (!searchPanel.classList.contains('collapsed')) {
        document.getElementById('search-input').focus();
    }
}

/**
 * Create a search index from the collection data
 * @param {object} collection - The collection data
 */
function createSearchIndex(collection) {
    // This is a simple implementation - a production system might use a more sophisticated search library
    searchIndex = [];
    
    // We'll just store references to documents for now
    // A full implementation would index the content of each document once loaded
    if (collection && collection.documents) {
        collection.documents.forEach(doc => {
            searchIndex.push({
                id: doc.id,
                title: doc.title || '',
                description: doc.description || '',
                source: doc.source || '',
                date: doc.date || ''
            });
        });
    }
    
    console.log(`Search index created with ${searchIndex.length} documents`);
}

/**
 * Perform a search
 */
function performSearch() {
    const searchInput = document.getElementById('search-input');
    const searchTerm = searchInput.value.trim().toLowerCase();
    
    if (!searchTerm) {
        return;
    }
    
    const searchTranscription = document.getElementById('search-transcription').checked;
    const searchAnnotations = document.getElementById('search-annotations').checked;
    
    // Check if we're searching within the current document
    const currentDocument = document.querySelector('.transcription-container');
    if (currentDocument && searchTranscription) {
        searchInCurrentDocument(searchTerm);
    }
    
    // Search across the collection
    const results = searchCollection(searchTerm);
    displaySearchResults(results);
}

/**
 * Search within the current document
 * @param {string} searchTerm - The search term
 */
function searchInCurrentDocument(searchTerm) {
    // Clear existing highlights
    clearSearchHighlights();
    
    // Find matches in the transcription
    const transcriptionContainer = document.querySelector('.transcription-container');
    const textNodes = getAllTextNodes(transcriptionContainer);
    
    let matchCount = 0;
    
    // Process each text node
    textNodes.forEach(node => {
        const text = node.textContent;
        const lowerText = text.toLowerCase();
        let startPos = 0;
        let matchPos;
        
        // Find all matches in this text node
        while ((matchPos = lowerText.indexOf(searchTerm, startPos)) !== -1) {
            const matchText = text.substring(matchPos, matchPos + searchTerm.length);
            
            // Create highlight span
            const highlightSpan = document.createElement('span');
            highlightSpan.className = 'search-highlight';
            highlightSpan.textContent = matchText;
            
            // Split the text node at the match
            const beforeMatch = text.substring(startPos, matchPos);
            const beforeTextNode = document.createTextNode(beforeMatch);
            
            const afterTextNode = node.splitText(matchPos);
            afterTextNode.textContent = afterTextNode.textContent.substring(searchTerm.length);
            
            // Insert nodes
            node.parentNode.insertBefore(beforeTextNode, node);
            node.parentNode.insertBefore(highlightSpan, node);
            node.parentNode.removeChild(node);
            
            // Continue with the remainder of the text
            node = afterTextNode;
            startPos = 0;
            matchCount++;
        }
    });
    
    // Scroll to the first match if any
    if (matchCount > 0) {
        const firstMatch = document.querySelector('.search-highlight');
        if (firstMatch) {
            firstMatch.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }
    }
    
    return matchCount;
}

/**
 * Get all text nodes within an element
 * @param {Element} element - The element to search within
 * @return {Array} Array of text nodes
 */
function getAllTextNodes(element) {
    const textNodes = [];
    
    function getTextNodes(node) {
        if (node.nodeType === 3) {
            // This is a text node
            textNodes.push(node);
        } else if (node.nodeType === 1) {
            // This is an element node
            // Skip nodes that are highlights
            if (!node.classList || !node.classList.contains('search-highlight')) {
                for (let i = 0; i < node.childNodes.length; i++) {
                    getTextNodes(node.childNodes[i]);
                }
            }
        }
    }
    
    getTextNodes(element);
    return textNodes;
}

/**
 * Clear search highlights
 */
function clearSearchHighlights() {
    const highlights = document.querySelectorAll('.search-highlight');
    highlights.forEach(highlight => {
        const parent = highlight.parentNode;
        const textNode = document.createTextNode(highlight.textContent);
        parent.replaceChild(textNode, highlight);
        
        // Normalize to merge adjacent text nodes
        parent.normalize();
    });
}

/**
 * Search across the document collection
 * @param {string} searchTerm - The search term
 * @return {Array} Search results
 */
function searchCollection(searchTerm) {
    if (!searchIndex) {
        return [];
    }
    
    // Simple search implementation - matches on title, description, source, date
    return searchIndex.filter(doc => {
        return (
            doc.title.toLowerCase().includes(searchTerm) ||
            doc.description.toLowerCase().includes(searchTerm) ||
            doc.source.toLowerCase().includes(searchTerm) ||
            doc.date.toLowerCase().includes(searchTerm)
        );
    });
}

/**
 * Display search results
 * @param {Array} results - Search results
 */
function displaySearchResults(results) {
    const resultsContainer = document.getElementById('search-results');
    resultsContainer.innerHTML = '';
    
    if (results.length === 0) {
        resultsContainer.innerHTML = '<p>No documents found matching your search.</p>';
        return;
    }
    
    const resultsList = document.createElement('div');
    resultsList.className = 'search-results-list';
    
    results.forEach(doc => {
        const resultItem = document.createElement('div');
        resultItem.className = 'search-result-item';
        
        const title = document.createElement('div');
        title.className = 'result-title';
        title.textContent = doc.title;
        
        const meta = document.createElement('div');
        meta.className = 'result-meta';
        meta.textContent = `${doc.source} • ${doc.date}`;
        
        const description = document.createElement('div');
        description.className = 'result-description';
        description.textContent = doc.description;
        
        resultItem.appendChild(title);
        resultItem.appendChild(meta);
        resultItem.appendChild(description);
        
        // Add click event to load the document
        resultItem.addEventListener('click', () => {
            loadDocumentById(doc.id);
            toggleSearchPanel();
        });
        
        resultsList.appendChild(resultItem);
    });
    
    resultsContainer.appendChild(resultsList);
    resultsContainer.innerHTML += `<p class="search-results-count">${results.length} document${results.length === 1 ? '' : 's'} found</p>`;
}

// Export the functions that need to be accessed by other modules
export {
    initSearch,
    performSearch,
    clearSearchHighlights
};