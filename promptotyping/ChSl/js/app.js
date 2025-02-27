// Main application entry point
import { initViewer, loadDocument } from './viewer.js';
import { parsePageXML } from './parser.js';
import { setupNavigation } from './navigation.js';
import { initSearch } from './search.js';
import { initAnnotations } from './annotations.js';

// Global variables
let currentDocument = null;
let collectionData = null;

// Initialize the application
async function initApp() {
    try {
        showLoading(true);
        
        // Load the collection metadata
        collectionData = await loadCollectionData();
        
        // Initialize all components
        initViewer();
        setupNavigation(collectionData, loadDocumentById);
        initSearch(collectionData);
        initAnnotations();
        
        // Load the first document or show collection browser
        if (collectionData.documents.length > 0) {
            await loadDocumentById(collectionData.documents[0].id);
        } else {
            showCollectionBrowser();
        }
        
        // Set up event listeners
        setupEventListeners();
        
        showLoading(false);
    } catch (error) {
        console.error('Error initializing application:', error);
        showError('Failed to initialize the application. Please refresh the page.');
        showLoading(false);
    }
}

// Load collection metadata
async function loadCollectionData() {
    try {
        const response = await fetch('data/metadata.json');
        if (!response.ok) {
            throw new Error(`Failed to load metadata: ${response.status}`);
        }
        return await response.json();
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

// Load a document by its ID
async function loadDocumentById(documentId) {
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
            const annotationUrl = `data/annotations/${documentMeta.annotationFileName}`;
            try {
                const annotResponse = await fetch(annotationUrl);
                if (annotResponse.ok) {
                    annotations = await annotResponse.json();
                }
            } catch (annotError) {
                console.warn('Failed to load annotations:', annotError);
            }
        }
        
        // Set the current document
        currentDocument = {
            id: documentId,
            metadata: documentMeta,
            parsed: parsedData,
            annotations: annotations
        };
        
        // Load the document into the viewer
        await loadDocument(imageUrl, parsedData, annotations);
        
        // Hide the collection browser if it's open
        document.getElementById('collection-browser').classList.add('hidden');
        
        showLoading(false);
    } catch (error) {
        console.error('Error loading document:', error);
        showError(`Failed to load document: ${error.message}`);
        showLoading(false);
    }
}

// Helper to format metadata for display
function formatMetadata(documentMeta) {
    const parts = [];
    if (documentMeta.date) parts.push(documentMeta.date);
    if (documentMeta.author) parts.push(`Author: ${documentMeta.author}`);
    if (documentMeta.source) parts.push(`Source: ${documentMeta.source}`);
    return parts.join(' • ') || 'No metadata available';
}

// Set up global event listeners
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
}

// Show the collection browser
function showCollectionBrowser() {
    const browserElement = document.getElementById('collection-browser');
    const collectionItemsContainer = document.getElementById('collection-items');
    
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
}

// Create a collection item element
function createCollectionItem(docData) {
    const item = document.createElement('div');
    item.className = 'collection-item';
    item.dataset.id = docData.id;
    
    // Create thumbnail
    const thumbnail = document.createElement('img');
    thumbnail.className = 'collection-thumbnail';
    thumbnail.src = `data/documents/${docData.imageFileName}`;
    thumbnail.alt = docData.title || 'Document thumbnail';
    
    // Create info section
    const info = document.createElement('div');
    info.className = 'collection-item-info';
    
    const title = document.createElement('div');
    title.className = 'collection-item-title';
    title.textContent = docData.title || 'Untitled Document';
    
    const meta = document.createElement('div');
    meta.className = 'collection-item-meta';
    meta.textContent = docData.date || '';
    
    // Assemble the item
    info.appendChild(title);
    info.appendChild(meta);
    
    item.appendChild(thumbnail);
    item.appendChild(info);
    
    // Add click event
    item.addEventListener('click', () => loadDocumentById(docData.id));
    
    return item;
}

// Toggle between different view modes
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
}

// Show or hide the loading indicator
function showLoading(show) {
    const loadingIndicator = document.getElementById('loading-indicator');
    if (show) {
        loadingIndicator.classList.remove('hidden');
    } else {
        loadingIndicator.classList.add('hidden');
    }
}

// Display an error message to the user
function showError(message) {
    // Could be implemented as a toast, modal, or other UI element
    alert(message);
}

// Initialize the application when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initApp);

// Export functions that need to be accessed by other modules
export {
    showLoading,
    showError,
    getCurrentDocument,
    loadDocumentById
};

// Helper to get the current document
function getCurrentDocument() {
    return currentDocument;
}