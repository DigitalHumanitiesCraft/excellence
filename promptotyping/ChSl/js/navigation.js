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
    
    // Set up pagination controls if they exist
    setupPaginationControls();
}

/**
 * Set up pagination controls if they exist in the DOM
 */
function setupPaginationControls() {
    const pageInput = document.getElementById('page-input');
    const goToPageButton = document.getElementById('go-to-page');
    
    if (pageInput && goToPageButton) {
        goToPageButton.addEventListener('click', () => {
            const pageNumber = parseInt(pageInput.value, 10);
            if (!isNaN(pageNumber) && pageNumber > 0) {
                navigateToPage(pageNumber);
            }
        });
        
        pageInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                const pageNumber = parseInt(pageInput.value, 10);
                if (!isNaN(pageNumber) && pageNumber > 0) {
                    navigateToPage(pageNumber);
                }
            }
        });
    }
}

/**
 * Navigate to a specific page number
 * @param {number} pageNumber - The page number to navigate to
 */
function navigateToPage(pageNumber) {
    // Get current document metadata
    const currentDoc = getCurrentDocument();
    if (!currentDoc) return;
    
    // Check if this is a multi-page document
    if (currentDoc.metadata && currentDoc.metadata.metsData) {
        // Find the page in METS data
        const pageItem = currentDoc.metadata.metsData.structureMap.find(item => 
            item.order === pageNumber
        );
        
        if (pageItem && pageItem.fileIds) {
            // Get the image and XML files for this page
            const imageFile = currentDoc.metadata.metsData.files.images.find(file => 
                pageItem.fileIds.includes(file.id)
            );
            
            const xmlFile = currentDoc.metadata.metsData.files.xmlFiles.find(file => 
                pageItem.fileIds.includes(file.id)
            );
            
            if (imageFile && xmlFile) {
                // Load the new page of the current document
                loadDocumentPage(currentDoc.id, imageFile.path, xmlFile.path, pageNumber);
                return;
            }
        }
    }
    
    // If not a multi-page document or page not found, try to navigate by document order
    if (collectionData && collectionData.documents && collectionData.documents.length > 0) {
        if (pageNumber <= collectionData.documents.length) {
            loadDocumentCallback(collectionData.documents[pageNumber - 1].id);
        }
    }
}

/**
 * Load a specific page of a document
 * @param {string} documentId - Document ID
 * @param {string} imagePath - Path to the image file
 * @param {string} xmlPath - Path to the XML file
 * @param {number} pageNumber - Page number
 */
function loadDocumentPage(documentId, imagePath, xmlPath, pageNumber) {
    // This would need to be implemented in app.js
    if (typeof window.loadDocumentPage === 'function') {
        window.loadDocumentPage(documentId, imagePath, xmlPath, pageNumber);
    } else {
        console.warn('loadDocumentPage function not available in global scope');
        // Fall back to loading whole document
        loadDocumentCallback(documentId);
    }
}

/**
 * Get the current document object
 * @return {object|null} Current document or null
 */
function getCurrentDocument() {
    if (typeof window.getCurrentDocument === 'function') {
        return window.getCurrentDocument();
    }
    return null;
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
    // Get the current document
    const currentDoc = getCurrentDocument();
    
    if (currentDoc && currentDoc.id) {
        // Find the document in the collection by ID
        for (let i = 0; i < collectionData.documents.length; i++) {
            if (collectionData.documents[i].id === currentDoc.id) {
                return i;
            }
        }
    }
    
    // Fallback: check by title if ID matching fails
    const currentTitle = document.getElementById('document-title').textContent;
    
    for (let i = 0; i < collectionData.documents.length; i++) {
        if (collectionData.documents[i].title === currentTitle) {
            return i;
        }
    }
    
    return 0;
}

/**
 * Navigate to the next page within the current document
 */
function navigateToNextPage() {
    const currentDoc = getCurrentDocument();
    
    if (currentDoc && currentDoc.metadata) {
        const currentPage = currentDoc.metadata.currentPage || 1;
        const totalPages = currentDoc.metadata.totalPages || 1;
        
        if (currentPage < totalPages) {
            // Navigate to next page in multi-page document
            navigateToPage(currentPage + 1);
        } else {
            // At last page, navigate to next document
            navigateToNextDocument();
        }
    } else {
        // Fallback to next document
        navigateToNextDocument();
    }
}

/**
 * Navigate to the previous page within the current document
 */
function navigateToPreviousPage() {
    const currentDoc = getCurrentDocument();
    
    if (currentDoc && currentDoc.metadata) {
        const currentPage = currentDoc.metadata.currentPage || 1;
        
        if (currentPage > 1) {
            // Navigate to previous page in multi-page document
            navigateToPage(currentPage - 1);
        } else {
            // At first page, navigate to previous document
            navigateToPreviousDocument();
        }
    } else {
        // Fallback to previous document
        navigateToPreviousDocument();
    }
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
                if (event.ctrlKey || event.metaKey) {
                    // With modifier key, navigate to next document
                    navigateToNextDocument();
                } else {
                    // Without modifier, navigate to next page
                    navigateToNextPage();
                }
                event.preventDefault();
                break;
                
            case 'ArrowLeft':
                // Navigate to previous page/document
                if (event.ctrlKey || event.metaKey) {
                    // With modifier key, navigate to previous document
                    navigateToPreviousDocument();
                } else {
                    // Without modifier, navigate to previous page
                    navigateToPreviousPage();
                }
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
                if (!event.ctrlKey && !event.metaKey) {
                    toggleFullscreen();
                    event.preventDefault();
                }
                break;
                
            case 'g':
            case 'G':
                // Go to page dialog
                if (event.ctrlKey || event.metaKey) {
                    openGoToPageDialog();
                    event.preventDefault();
                }
                break;
                
            case 'PageUp':
                // Previous page
                navigateToPreviousPage();
                event.preventDefault();
                break;
                
            case 'PageDown':
                // Next page
                navigateToNextPage();
                event.preventDefault();
                break;
        }
    });
}

/**
 * Open a dialog to go to a specific page
 */
function openGoToPageDialog() {
    const currentDoc = getCurrentDocument();
    if (!currentDoc) return;
    
    const currentPage = currentDoc.metadata.currentPage || 1;
    const totalPages = currentDoc.metadata.totalPages || 1;
    
    // Check if we have a pagination input field
    const pageInput = document.getElementById('page-input');
    if (pageInput) {
        pageInput.value = currentPage;
        pageInput.focus();
        pageInput.select();
        return;
    }
    
    // Otherwise, use a prompt
    const pageNumber = prompt(`Go to page (1-${totalPages})`, currentPage);
    if (pageNumber !== null) {
        const page = parseInt(pageNumber, 10);
        if (!isNaN(page) && page > 0 && page <= totalPages) {
            navigateToPage(page);
        }
    }
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

/**
 * Create a Table of Contents for the collection
 * @param {Element} container - Container element for the ToC
 */
function createTableOfContents(container) {
    if (!container || !collectionData || !collectionData.documents) return;
    
    // Clear existing content
    container.innerHTML = '';
    
    // Create heading
    const heading = document.createElement('h3');
    heading.textContent = 'Table of Contents';
    container.appendChild(heading);
    
    // Create list
    const list = document.createElement('ul');
    list.className = 'toc-list';
    
    // Add each document
    collectionData.documents.forEach((doc, index) => {
        const item = document.createElement('li');
        item.className = 'toc-item';
        
        const link = document.createElement('a');
        link.textContent = doc.title || `Document ${index + 1}`;
        link.href = '#';
        link.addEventListener('click', (e) => {
            e.preventDefault();
            navigateToDocument(doc.id);
        });
        
        // Add metadata if available
        if (doc.date || doc.source) {
            const meta = document.createElement('span');
            meta.className = 'toc-meta';
            const metaParts = [];
            if (doc.date) metaParts.push(doc.date);
            if (doc.source) metaParts.push(doc.source);
            meta.textContent = ` (${metaParts.join(', ')})`;
            link.appendChild(meta);
        }
        
        item.appendChild(link);
        list.appendChild(item);
    });
    
    container.appendChild(list);
}

// Export the functions that need to be accessed by other modules
export {
    setupNavigation,
    navigateToNextDocument,
    navigateToPreviousDocument,
    navigateToNextPage,
    navigateToPreviousPage,
    navigateToDocument,
    navigateToPage,
    createTableOfContents,
    toggleFullscreen,
    openGoToPageDialog
};