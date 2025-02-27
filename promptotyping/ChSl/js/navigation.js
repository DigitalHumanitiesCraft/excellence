/**
 * Navigation module for handling document navigation and browsing
 * This module manages navigation between documents and within documents
 */

// Function references
let loadDocumentCallback = null;
let collectionData = null;
let currentDocumentIndex = 0;

/**
 * Set up the navigation components
 * @param {object} collection - Collection metadata
 * @param {function} loadDocFn - Callback function to load a document
 */
function setupNavigation(collection, loadDocFn) {
    collectionData = collection;
    loadDocumentCallback = loadDocFn;
    
    // Set up event listeners for page navigation
    document.getElementById('prev-page').addEventListener('click', navigateToPreviousPage);
    document.getElementById('next-page').addEventListener('click', navigateToNextPage);
    
    // Set up keyboard shortcuts
    setupKeyboardNavigation();
}

/**
 * Navigate to the next document in the collection
 */
function navigateToNextDocument() {
    if (!collectionData || !collectionData.documents) {
        return;
    }
    
    // Find the current document index
    const currentIndex = findCurrentDocumentIndex();
    
    // Check if we can navigate forward
    if (currentIndex < collectionData.documents.length - 1) {
        const nextDocument = collectionData.documents[currentIndex + 1];
        loadDocumentCallback(nextDocument.id);
    }
}

/**
 * Navigate to the previous document in the collection
 */
function navigateToPreviousDocument() {
    if (!collectionData || !collectionData.documents) {
        return;
    }
    
    // Find the current document index
    const currentIndex = findCurrentDocumentIndex();
    
    // Check if we can navigate backward
    if (currentIndex > 0) {
        const prevDocument = collectionData.documents[currentIndex - 1];
        loadDocumentCallback(prevDocument.id);
    }
}

/**
 * Find the index of the current document in the collection
 * @return {number} Index of the current document
 */
function findCurrentDocumentIndex() {
    // Get the current document title
    const currentTitle = document.getElementById('document-title').textContent;
    
    // Find the document in the collection
    for (let i = 0; i < collectionData.documents.length; i++) {
        if (collectionData.documents[i].title === currentTitle) {
            return i;
        }
    }
    
    return 0;
}

/**
 * Navigate to the next page within the current document
 * (In this simple version, we're treating all documents as single page)
 */
function navigateToNextPage() {
    // In a multi-page document, this would navigate to the next page
    // For now, we'll navigate to the next document
    navigateToNextDocument();
}

/**
 * Navigate to the previous page within the current document
 * (In this simple version, we're treating all documents as single page)
 */
function navigateToPreviousPage() {
    // In a multi-page document, this would navigate to the previous page
    // For now, we'll navigate to the previous document
    navigateToPreviousDocument();
}

/**
 * Set up keyboard navigation shortcuts
 */
function setupKeyboardNavigation() {
    document.addEventListener('keydown', (event) => {
        // Don't trigger if the user is typing in an input field
        if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
            return;
        }
        
        switch (event.key) {
            case 'ArrowRight':
                // Navigate to next page/document
                navigateToNextPage();
                event.preventDefault();
                break;
                
            case 'ArrowLeft':
                // Navigate to previous page/document
                navigateToPreviousPage();
                event.preventDefault();
                break;
                
            case 'Home':
                // Navigate to first document
                if (collectionData && collectionData.documents.length > 0) {
                    loadDocumentCallback(collectionData.documents[0].id);
                }
                event.preventDefault();
                break;
                
            case 'End':
                // Navigate to last document
                if (collectionData && collectionData.documents.length > 0) {
                    const lastIndex = collectionData.documents.length - 1;
                    loadDocumentCallback(collectionData.documents[lastIndex].id);
                }
                event.preventDefault();
                break;
                
            case 'f':
            case 'F':
                // Toggle fullscreen
                toggleFullscreen();
                event.preventDefault();
                break;
        }
    });
}

/**
 * Toggle fullscreen mode
 */
function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            console.error(`Error attempting to enable full-screen mode: ${err.message}`);
        });
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
}

/**
 * Navigate to a specific document by ID
 * @param {string} documentId - ID of the document to navigate to
 */
function navigateToDocument(documentId) {
    loadDocumentCallback(documentId);
}

// Export the functions that need to be accessed by other modules
export {
    setupNavigation,
    navigateToNextDocument,
    navigateToPreviousDocument,
    navigateToDocument
};