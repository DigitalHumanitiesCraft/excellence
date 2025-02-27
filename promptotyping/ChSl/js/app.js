/**
 * Main application entry point for the Historical Document Viewer
 * This module initializes and coordinates all components of the application
 */

import { initViewer, loadDocument, fitToWidth } from './viewer.js';
import { parsePageXML, parseMetsXML, parseMetadataXML } from './parser.js';
import { setupNavigation } from './navigation.js';
import { initSearch } from './search.js';
import { initAnnotations, applyAnnotations } from './annotations.js';

// Global state
let currentDocument = null;
let collectionData = null;
let metsData = null;
let metadataXML = null;
let loadingQueue = [];
let isLoading = false;

/**
 * Initialize the application
 */
async function initApp() {
    try {
        showLoading(true);
        
        // Load the collection metadata
        collectionData = await loadCollectionData();
        
        // Load METS data if available
        try {
            metsData = await loadMetsData();
        } catch (metsError) {
            console.warn('METS data not available or could not be loaded:', metsError);
        }
        
        // Initialize all components
        initViewer();
        setupNavigation(collectionData, loadDocumentById);
        initSearch(collectionData);
        initAnnotations();
        
        // Set up global event listeners
        setupEventListeners();
        
        // Load the first document or show collection browser
        if (collectionData.documents && collectionData.documents.length > 0) {
            await loadDocumentById(collectionData.documents[0].id);
        } else {
            showCollectionBrowser();
        }
        
        showLoading(false);
    } catch (error) {
        console.error('Error initializing application:', error);
        showError('Failed to initialize the application. Please try refreshing the page.', error);
        showLoading(false);
    }
}

/**
 * Load collection metadata
 * @return {Promise<object>} Promise resolving to collection data
 */
async function loadCollectionData() {
    try {
        const response = await fetch('data/metadata.json');
        if (!response.ok) {
            throw new Error(`Failed to load metadata: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Collection data loaded:', data.title);
        
        // Process and validate the data
        if (!data.documents) {
            data.documents = [];
        }
        
        // Add IDs to documents if not present
        data.documents.forEach((doc, index) => {
            if (!doc.id) {
                doc.id = `doc_${index}`;
            }
        });
        
        return data;
    } catch (error) {
        console.error('Error loading collection data:', error);
        // Return minimal default data if we can't load the actual metadata
        return {
            title: 'Document Collection',
            description: 'Historical document collection',
            documents: []
        };
    }
}

/**
 * Load METS data if available
 * @return {Promise<object>} Promise resolving to METS data
 */
async function loadMetsData() {
    try {
        const response = await fetch('data/mets.xml');
        if (!response.ok) {
            throw new Error(`Failed to load METS data: ${response.status}`);
        }
        
        const xmlText = await response.text();
        return parseMetsXML(xmlText);
    } catch (error) {
        console.warn('METS data not available:', error);
        return null;
    }
}

/**
 * Load a document by its ID
 * @param {string} documentId - ID of the document to load
 * @return {Promise<void>}
 */
async function loadDocumentById(documentId) {
    // Add to loading queue and process
    loadingQueue.push(documentId);
    processLoadingQueue();
}

/**
 * Process the loading queue to avoid multiple simultaneous document loads
 */
async function processLoadingQueue() {
    if (isLoading || loadingQueue.length === 0) {
        return;
    }
    
    isLoading = true;
    const documentId = loadingQueue.shift();
    
    try {
        showLoading(true);
        
        // Find the document in our collection
        const documentMeta = collectionData.documents.find(doc => doc.id === documentId);
        if (!documentMeta) {
            throw new Error(`Document not found: ${documentId}`);
        }
        
        // Update document title and metadata in the UI
        document.getElementById('document-title').textContent = documentMeta.title || 'Untitled Document';
        document.getElementById('document-metadata').textContent = formatMetadata(documentMeta);
        
        // Load the document image
        const imageUrl = `data/documents/${documentMeta.imageFileName}`;
        
        // Load and parse the XML transcription
        const xmlUrl = `data/transcriptions/${documentMeta.xmlFileName}`;
        const xmlResponse = await fetch(xmlUrl);
        if (!xmlResponse.ok) {
            throw new Error(`Failed to load XML: ${xmlResponse.status}`);
        }
        
        const xmlText = await xmlResponse.text();
        const parsedData = parsePageXML(xmlText);
        
        // Load any annotations if they exist
        let annotations = null;
        if (documentMeta.annotationFileName) {
            try {
                const annotationUrl = `data/annotations/${documentMeta.annotationFileName}`;
                const annotResponse = await fetch(annotationUrl);
                if (annotResponse.ok) {
                    annotations = await annotResponse.json();
                    console.log('Annotations loaded:', annotations);
                }
            } catch (annotError) {
                console.warn('Failed to load annotations:', annotError);
            }
        }
        
        // Enhance parsed data with metadata from the collection
        enhanceDocumentData(parsedData, documentMeta);
        
        // Set the current document
        currentDocument = {
            id: documentId,
            metadata: documentMeta,
            parsed: parsedData,
            annotations: annotations
        };
        
        // Load the document into the viewer
        await loadDocument(imageUrl, parsedData, annotations);
        
        // Apply annotations after document is loaded
        if (annotations) {
            applyAnnotations(annotations, parsedData);
        }
        
        // Hide the collection browser if it's open
        document.getElementById('collection-browser').classList.add('hidden');
        
        // Update browser history
        updateBrowserHistory(documentId, documentMeta.title);
        
        showLoading(false);
    } catch (error) {
        console.error('Error loading document:', error);
        showError(`Failed to load document: ${error.message}`);
        showLoading(false);
    }
    
    isLoading = false;
    
    // Process next document in queue if any
    if (loadingQueue.length > 0) {
        processLoadingQueue();
    }
}

/**
 * Enhance the parsed document data with metadata from the collection
 * @param {object} parsedData - The parsed PAGE XML data
 * @param {object} documentMeta - The document metadata
 */
function enhanceDocumentData(parsedData, documentMeta) {
    // Add title, date, source to metadata if not already present
    if (documentMeta.title && !parsedData.metadata.title) {
        parsedData.metadata.title = documentMeta.title;
    }
    
    if (documentMeta.date && !parsedData.metadata.date) {
        parsedData.metadata.date = documentMeta.date;
    }
    
    if (documentMeta.source && !parsedData.metadata.source) {
        parsedData.metadata.source = documentMeta.source;
    }
    
    // Look up page information in METS data if available
    if (metsData && metsData.structureMap) {
        const pageItem = metsData.structureMap.find(item => {
            return item.fileIds && item.fileIds.some(fileId => {
                const fileInfo = metsData.files.xmlFiles.find(file => file.id === fileId);
                return fileInfo && fileInfo.path.includes(documentMeta.xmlFileName);
            });
        });
        
        if (pageItem) {
            parsedData.metadata.order = pageItem.order;
            parsedData.metadata.currentPage = pageItem.order || 1;
            parsedData.metadata.totalPages = metsData.structureMap.length;
        }
    }
}

/**
 * Format metadata for display
 * @param {object} documentMeta - Document metadata
 * @return {string} Formatted metadata string
 */
function formatMetadata(documentMeta) {
    const parts = [];
    
    if (documentMeta.date) parts.push(documentMeta.date);
    if (documentMeta.source) parts.push(`Source: ${documentMeta.source}`);
    
    return parts.join(' • ') || 'No metadata available';
}

/**
 * Set up global event listeners
 */
function setupEventListeners() {
    // Back button
    document.getElementById('back-button').addEventListener('click', showCollectionBrowser);
    
    // View toggle button
    document.getElementById('view-toggle').addEventListener('click', toggleView);
    
    // Close browser button
    document.getElementById('close-browser').addEventListener('click', () => {
        if (currentDocument) {
            document.getElementById('collection-browser').classList.add('hidden');
        }
    });
    
    // Handle browser navigation events
    window.addEventListener('popstate', handleBrowserNavigation);
    
    // Handle keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
}

/**
 * Handle browser navigation (back/forward)
 * @param {Event} event - The popstate event
 */
function handleBrowserNavigation(event) {
    const state = event.state;
    
    if (state && state.documentId) {
        // Load the document without pushing state again
        loadDocumentById(state.documentId);
    } else {
        // No state means we're at the initial page, show the collection
        showCollectionBrowser();
    }
}

/**
 * Update browser history when loading a document
 * @param {string} documentId - The document ID
 * @param {string} title - The document title
 */
function updateBrowserHistory(documentId, title) {
    const state = { documentId };
    const url = new URL(window.location.href);
    url.searchParams.set('doc', documentId);
    
    history.pushState(state, title, url.toString());
    document.title = title ? `${title} - Historical Document Viewer` : 'Historical Document Viewer';
}

/**
 * Handle keyboard shortcuts
 * @param {Event} event - The keyboard event
 */
function handleKeyboardShortcuts(event) {
    // Don't trigger shortcuts when typing in input fields
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
        return;
    }
    
    // Escape key
    if (event.key === 'Escape') {
        // Close any open panels or menus
        const collectionBrowser = document.getElementById('collection-browser');
        if (!collectionBrowser.classList.contains('hidden')) {
            collectionBrowser.classList.add('hidden');
            event.preventDefault();
        }
    }
    
    // Ctrl+F for search
    if (event.key === 'f' && (event.ctrlKey || event.metaKey)) {
        const searchButton = document.getElementById('search-toggle');
        if (searchButton) {
            searchButton.click();
            event.preventDefault();
        }
    }
}

/**
 * Show the collection browser
 */
function showCollectionBrowser() {
    const browserElement = document.getElementById('collection-browser');
    const collectionItemsContainer = document.getElementById('collection-items');
    
    // Set browser title
    const browserTitle = document.querySelector('.browser-header h2');
    if (browserTitle) {
        browserTitle.textContent = collectionData.title || 'Document Collection';
    }
    
    // Clear existing items
    collectionItemsContainer.innerHTML = '';
    
    // Populate with collection items
    if (collectionData && collectionData.documents) {
        collectionData.documents.forEach(doc => {
            const itemElement = createCollectionItem(doc);
            collectionItemsContainer.appendChild(itemElement);
        });
    }
    
    // Show the browser
    browserElement.classList.remove('hidden');
    
    // Update browser history
    history.pushState({ view: 'collection' }, 'Document Collection', window.location.pathname);
    document.title = 'Document Collection - Historical Document Viewer';
}

/**
 * Create a collection item element
 * @param {object} docData - Document data
 * @return {HTMLElement} The created element
 */
function createCollectionItem(docData) {
    const item = document.createElement('div');
    item.className = 'collection-item';
    item.dataset.id = docData.id;
    
    // Create thumbnail
    const thumbnail = document.createElement('img');
    thumbnail.className = 'collection-thumbnail';
    thumbnail.src = `data/documents/${docData.imageFileName}`;
    thumbnail.alt = docData.title || 'Document thumbnail';
    
    // Add loading error handling
    thumbnail.onerror = () => {
        thumbnail.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="150" viewBox="0 0 200 150"%3E%3Crect width="200" height="150" fill="%23f0f0f0"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="14" fill="%23999"%3ENo Image%3C/text%3E%3C/svg%3E';
    };
    
    // Create info section
    const info = document.createElement('div');
    info.className = 'collection-item-info';
    
    const title = document.createElement('div');
    title.className = 'collection-item-title';
    title.textContent = docData.title || 'Untitled Document';
    
    const meta = document.createElement('div');
    meta.className = 'collection-item-meta';
    
    // Combine date and source for metadata display
    const metaParts = [];
    if (docData.date) metaParts.push(docData.date);
    if (docData.source) metaParts.push(docData.source);
    meta.textContent = metaParts.join(' • ');
    
    // Assemble the item
    info.appendChild(title);
    info.appendChild(meta);
    
    item.appendChild(thumbnail);
    item.appendChild(info);
    
    // Add click event
    item.addEventListener('click', () => loadDocumentById(docData.id));
    
    return item;
}

/**
 * Toggle between different view modes
 */
function toggleView() {
    const contentContainer = document.querySelector('.content-container');
    
    if (contentContainer.classList.contains('transcription-only')) {
        // Switch to document only
        contentContainer.classList.remove('transcription-only');
        contentContainer.classList.add('document-only');
        document.getElementById('view-toggle').textContent = 'Show Transcription';
    } else if (contentContainer.classList.contains('document-only')) {
        // Switch to side-by-side view
        contentContainer.classList.remove('document-only');
        document.getElementById('view-toggle').textContent = 'Toggle View';
    } else {
        // Switch to transcription only
        contentContainer.classList.add('transcription-only');
        document.getElementById('view-toggle').textContent = 'Show Document';
    }
    
    // Adjust document view after layout changes
    setTimeout(fitToWidth, 100);
}

/**
 * Show or hide the loading indicator
 * @param {boolean} show - Whether to show the loading indicator
 */
function showLoading(show) {
    const loadingIndicator = document.getElementById('loading-indicator');
    if (show) {
        loadingIndicator.classList.remove('hidden');
    } else {
        loadingIndicator.classList.add('hidden');
    }
}

/**
 * Display an error message to the user
 * @param {string} message - The error message
 * @param {Error} [error] - Optional error object for logging
 */
function showError(message, error = null) {
    // Log detailed error to console if provided
    if (error) {
        console.error('Error details:', error);
    }
    
    // Check if error toast exists
    let errorToast = document.getElementById('error-toast');
    
    if (!errorToast) {
        // Create error toast if it doesn't exist
        errorToast = document.createElement('div');
        errorToast.id = 'error-toast';
        errorToast.className = 'error-toast hidden';
        
        const errorMessage = document.createElement('div');
        errorMessage.className = 'error-message';
        
        const closeButton = document.createElement('button');
        closeButton.className = 'error-close';
        closeButton.textContent = '×';
        closeButton.addEventListener('click', () => {
            errorToast.classList.add('hidden');
        });
        
        errorToast.appendChild(errorMessage);
        errorToast.appendChild(closeButton);
        document.body.appendChild(errorToast);
    }
    
    // Update error message
    errorToast.querySelector('.error-message').textContent = message;
    
    // Show the toast
    errorToast.classList.remove('hidden');
    
    // Automatically hide after 5 seconds
    setTimeout(() => {
        errorToast.classList.add('hidden');
    }, 5000);
}

/**
 * Get the current document
 * @return {object|null} Current document or null if none loaded
 */
function getCurrentDocument() {
    return currentDocument;
}

/**
 * Check if a document ID is in the collection
 * @param {string} documentId - Document ID to check
 * @return {boolean} True if document exists in collection
 */
function documentExists(documentId) {
    return collectionData && collectionData.documents && 
           collectionData.documents.some(doc => doc.id === documentId);
}

/**
 * Get document by ID from collection
 * @param {string} documentId - Document ID to get
 * @return {object|null} Document object or null if not found
 */
function getDocumentById(documentId) {
    if (!collectionData || !collectionData.documents) {
        return null;
    }
    
    return collectionData.documents.find(doc => doc.id === documentId) || null;
}

// Initialize the application when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Check if a document ID is specified in the URL
    const urlParams = new URLSearchParams(window.location.search);
    const docId = urlParams.get('doc');
    
    initApp().then(() => {
        // If a document ID is specified and valid, load it
        if (docId && documentExists(docId)) {
            loadDocumentById(docId);
        }
    });
});

// Add error toast styles to the document
const errorToastStyle = document.createElement('style');
errorToastStyle.textContent = `
.error-toast {
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background-color: #f44336;
    color: white;
    padding: 12px 24px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    z-index: 9999;
    transition: opacity 0.3s, transform 0.3s;
    max-width: 80%;
}
.error-toast.hidden {
    opacity: 0;
    transform: translateX(-50%) translateY(30px);
    pointer-events: none;
}
.error-message {
    flex: 1;
    margin-right: 12px;
}
.error-close {
    background: none;
    border: none;
    color: white;
    font-size: 20px;
    cursor: pointer;
    padding: 0 4px;
}
`;
document.head.appendChild(errorToastStyle);

// Export functions that need to be accessed by other modules
export {
    showLoading,
    showError,
    getCurrentDocument,
    loadDocumentById,
    getDocumentById
};