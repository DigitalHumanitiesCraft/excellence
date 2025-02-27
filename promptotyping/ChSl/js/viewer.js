/**
 * Viewer module for handling document display and interaction
 * This module manages the document image and transcription display
 */

import { calculateBoundingBox } from './parser.js';
import { applyAnnotations } from './annotations.js';

// State variables
let currentImage = null;
let currentData = null;
let currentAnnotations = null;
let currentScale = 1.0;
let isDragging = false;
let lastMouseX = 0;
let lastMouseY = 0;
let highlightedLine = null;

/**
 * Initialize the document viewer
 */
function initViewer() {
    // Set up zoom controls
    document.getElementById('zoom-in').addEventListener('click', () => zoom(0.1));
    document.getElementById('zoom-out').addEventListener('click', () => zoom(-0.1));
    document.getElementById('fit-width').addEventListener('click', fitToWidth);
    document.getElementById('fit-page').addEventListener('click', fitToPage);
    
    // Set up panning on the document image
    const docContainer = document.getElementById('document-container');
    const docImage = document.getElementById('document-image');
    
    docContainer.addEventListener('mousedown', startDrag);
    docContainer.addEventListener('mousemove', drag);
    docContainer.addEventListener('mouseup', endDrag);
    docContainer.addEventListener('mouseleave', endDrag);
    
    // Set up line highlighting on hover
    const transcriptionContainer = document.getElementById('transcription-container');
    transcriptionContainer.addEventListener('mouseover', (event) => {
        if (event.target.classList.contains('transcription-line')) {
            highlightLine(event.target.dataset.lineId);
        }
    });
    
    transcriptionContainer.addEventListener('mouseout', (event) => {
        if (event.target.classList.contains('transcription-line')) {
            unhighlightLine();
        }
    });
    
    // Handle clicks on transcription lines to scroll to corresponding image area
    transcriptionContainer.addEventListener('click', (event) => {
        if (event.target.classList.contains('transcription-line')) {
            scrollToLine(event.target.dataset.lineId);
        }
    });
}

/**
 * Load a document into the viewer
 * @param {string} imageUrl - URL of the document image
 * @param {object} docData - Parsed document data
 * @param {object} annotations - Optional annotations data
 * @return {Promise} Promise that resolves when the document is loaded
 */
async function loadDocument(imageUrl, docData, annotations = null) {
    // Store the current document data
    currentData = docData;
    currentAnnotations = annotations;
    
    // Load the document image
    return new Promise((resolve, reject) => {
        const docImage = document.getElementById('document-image');
        
        docImage.onload = () => {
            currentImage = docImage;
            
            // Reset view
            currentScale = 1.0;
            docImage.style.transform = `scale(${currentScale})`;
            
            // Render the document components
            renderTranscription(docData);
            createHighlightOverlay(docData);
            
            // Apply annotations if available
            if (annotations) {
                applyAnnotations(annotations, docData);
            }
            
            // Reset page navigation
            updatePageNavigation(1, 1); // For now assuming single page
            
            resolve();
        };
        
        docImage.onerror = () => {
            reject(new Error('Failed to load document image'));
        };
        
        docImage.src = imageUrl;
    });
}

/**
 * Render the transcription text
 * @param {object} docData - Parsed document data
 */
function renderTranscription(docData) {
    const transcriptionContainer = document.getElementById('transcription-container');
    transcriptionContainer.innerHTML = '';
    
    // Follow the reading order to render regions in the correct sequence
    docData.readingOrder.forEach(regionId => {
        const region = docData.textRegions.find(r => r.id === regionId);
        if (!region) return;
        
        // Create a region container
        const regionElem = document.createElement('div');
        regionElem.className = 'transcription-region';
        regionElem.dataset.regionId = region.id;
        
        // Add each line in this region
        region.lines.forEach(line => {
            const lineElem = document.createElement('div');
            lineElem.className = 'transcription-line';
            lineElem.dataset.lineId = line.id;
            lineElem.textContent = line.text;
            
            regionElem.appendChild(lineElem);
        });
        
        transcriptionContainer.appendChild(regionElem);
    });
}

/**
 * Create the highlight overlay for the document image
 * @param {object} docData - Parsed document data
 */
function createHighlightOverlay(docData) {
    const overlayContainer = document.getElementById('highlight-overlay');
    overlayContainer.innerHTML = '';
    
    // Create highlight elements for each text region
    docData.textRegions.forEach(region => {
        // Create the region highlight element
        const regionHighlight = document.createElement('div');
        regionHighlight.className = 'text-region-highlight';
        regionHighlight.dataset.regionId = region.id;
        regionHighlight.style.display = 'none'; // Hide by default
        
        // Position the highlight based on coordinates
        const bbox = calculateBoundingBox(region.coordinates);
        regionHighlight.style.left = `${bbox.x}px`;
        regionHighlight.style.top = `${bbox.y}px`;
        regionHighlight.style.width = `${bbox.width}px`;
        regionHighlight.style.height = `${bbox.height}px`;
        
        overlayContainer.appendChild(regionHighlight);
        
        // Create highlight elements for each line
        region.lines.forEach(line => {
            // Create the line highlight element
            const lineHighlight = document.createElement('div');
            lineHighlight.className = 'text-region-highlight';
            lineHighlight.dataset.lineId = line.id;
            lineHighlight.style.display = 'none'; // Hide by default
            
            // Position the highlight based on coordinates
            const lineBbox = calculateBoundingBox(line.coordinates);
            lineHighlight.style.left = `${lineBbox.x}px`;
            lineHighlight.style.top = `${lineBbox.y}px`;
            lineHighlight.style.width = `${lineBbox.width}px`;
            lineHighlight.style.height = `${lineBbox.height}px`;
            
            overlayContainer.appendChild(lineHighlight);
        });
    });
}

/**
 * Highlight a specific line in both the transcription and document image
 * @param {string} lineId - ID of the line to highlight
 */
function highlightLine(lineId) {
    // Clear any previous highlight
    unhighlightLine();
    
    // Highlight the line in the transcription
    const transcriptionLine = document.querySelector(`.transcription-line[data-line-id="${lineId}"]`);
    if (transcriptionLine) {
        transcriptionLine.classList.add('active');
    }
    
    // Highlight the line in the document image
    const lineHighlight = document.querySelector(`.text-region-highlight[data-line-id="${lineId}"]`);
    if (lineHighlight) {
        lineHighlight.style.display = 'block';
    }
    
    // Store the highlighted line
    highlightedLine = lineId;
}

/**
 * Remove highlighting from the current line
 */
function unhighlightLine() {
    if (!highlightedLine) return;
    
    // Remove highlight from transcription
    const transcriptionLine = document.querySelector('.transcription-line.active');
    if (transcriptionLine) {
        transcriptionLine.classList.remove('active');
    }
    
    // Remove highlight from document image
    const lineHighlights = document.querySelectorAll('.text-region-highlight');
    lineHighlights.forEach(highlight => {
        highlight.style.display = 'none';
    });
    
    highlightedLine = null;
}

/**
 * Scroll to a specific line in the document image
 * @param {string} lineId - ID of the line to scroll to
 */
function scrollToLine(lineId) {
    const lineHighlight = document.querySelector(`.text-region-highlight[data-line-id="${lineId}"]`);
    if (!lineHighlight) return;
    
    // Get the line position
    const lineRect = lineHighlight.getBoundingClientRect();
    const containerRect = document.getElementById('document-container').getBoundingClientRect();
    
    // Calculate the scroll position to center the line
    const scrollX = lineRect.left + lineRect.width / 2 - containerRect.width / 2;
    const scrollY = lineRect.top + lineRect.height / 2 - containerRect.height / 2;
    
    // Scroll to the line
    document.getElementById('document-container').scrollTo({
        left: scrollX,
        top: scrollY,
        behavior: 'smooth'
    });
    
    // Highlight the line
    highlightLine(lineId);
}

/**
 * Update the page navigation indicators
 * @param {number} currentPage - Current page number
 * @param {number} totalPages - Total number of pages
 */
function updatePageNavigation(currentPage, totalPages) {
    document.getElementById('page-indicator').textContent = `Page ${currentPage} of ${totalPages}`;
    
    // Enable/disable navigation buttons based on current page
    document.getElementById('prev-page').disabled = currentPage <= 1;
    document.getElementById('next-page').disabled = currentPage >= totalPages;
}

/**
 * Zoom the document image
 * @param {number} delta - Amount to zoom (positive for zoom in, negative for zoom out)
 */
function zoom(delta) {
    // Calculate new scale, with limits
    const newScale = Math.max(0.2, Math.min(5.0, currentScale + delta));
    if (newScale === currentScale) return;
    
    // Apply the new scale
    currentScale = newScale;
    document.getElementById('document-image').style.transform = `scale(${currentScale})`;
    
    // Adjust the highlight overlay scale
    document.getElementById('highlight-overlay').style.transform = `scale(${currentScale})`;
}

/**
 * Fit the document image to the width of the container
 */
function fitToWidth() {
    if (!currentImage) return;
    
    const containerWidth = document.getElementById('document-panel').clientWidth;
    const imageWidth = currentImage.naturalWidth;
    
    currentScale = containerWidth / imageWidth;
    document.getElementById('document-image').style.transform = `scale(${currentScale})`;
    document.getElementById('highlight-overlay').style.transform = `scale(${currentScale})`;
}

/**
 * Fit the document image to the page (visible area)
 */
function fitToPage() {
    if (!currentImage) return;
    
    const containerWidth = document.getElementById('document-panel').clientWidth;
    const containerHeight = document.getElementById('document-panel').clientHeight;
    const imageWidth = currentImage.naturalWidth;
    const imageHeight = currentImage.naturalHeight;
    
    const scaleX = containerWidth / imageWidth;
    const scaleY = containerHeight / imageHeight;
    
    // Use the smaller scale to ensure the entire image fits
    currentScale = Math.min(scaleX, scaleY);
    document.getElementById('document-image').style.transform = `scale(${currentScale})`;
    document.getElementById('highlight-overlay').style.transform = `scale(${currentScale})`;
}

/**
 * Start dragging the document image
 * @param {Event} event - Mouse event
 */
function startDrag(event) {
    if (event.target.id === 'document-image') {
        isDragging = true;
        lastMouseX = event.clientX;
        lastMouseY = event.clientY;
        event.preventDefault();
    }
}

/**
 * Drag the document image
 * @param {Event} event - Mouse event
 */
function drag(event) {
    if (!isDragging) return;
    
    const deltaX = event.clientX - lastMouseX;
    const deltaY = event.clientY - lastMouseY;
    
    const container = document.getElementById('document-container');
    container.scrollLeft -= deltaX;
    container.scrollTop -= deltaY;
    
    lastMouseX = event.clientX;
    lastMouseY = event.clientY;
    event.preventDefault();
}

/**
 * End dragging the document image
 * @param {Event} event - Mouse event
 */
function endDrag() {
    isDragging = false;
}

// Export the functions that need to be accessed by other modules
export {
    initViewer,
    loadDocument,
    highlightLine,
    unhighlightLine,
    scrollToLine
};