/**
 * Viewer module for handling document display and interaction
 * This module manages the document image and transcription display
 */

import { calculateBoundingBox } from './parser.js';
import { applyAnnotations } from './annotations.js';
import { clearSearchHighlights } from './search.js';

// State variables
let currentImage = null;
let currentData = null;
let currentAnnotations = null;
let currentScale = 1.0;
let isDragging = false;
let lastMouseX = 0;
let lastMouseY = 0;
let highlightedLine = null;
let isScrollingSynced = true;
let isScrollingTriggeredBySync = false;
let linePositionMap = new Map();
let zoomLevel = 1.0;
let panOffset = { x: 0, y: 0 };

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
    
    // Add mouse wheel zoom support
    docContainer.addEventListener('wheel', handleWheel, { passive: false });
    
    // Set up synchronization between views
    setupViewSynchronization();
    
    // Add toggle button for synchronization
    createSyncToggleButton();
}

/**
 * Load a document into the viewer
 * @param {string} imageUrl - URL of the document image
 * @param {object} docData - Parsed document data
 * @param {object} annotations - Optional annotations data
 * @return {Promise} Promise that resolves when the document is loaded
 */
async function loadDocument(imageUrl, docData, annotations = null) {
    // Reset view state
    currentScale = 1.0;
    panOffset = { x: 0, y: 0 };
    highlightedLine = null;
    linePositionMap.clear();
    
    // Store the current document data
    currentData = docData;
    currentAnnotations = annotations;
    
    // Clear any existing content
    document.getElementById('highlight-overlay').innerHTML = '';
    document.getElementById('transcription-container').innerHTML = '';
    
    // Clear any search highlights
    clearSearchHighlights();
    
    // Load the document image
    return new Promise((resolve, reject) => {
        const docImage = document.getElementById('document-image');
        
        docImage.onload = () => {
            currentImage = docImage;
            
            // Reset view
            docImage.style.transform = `scale(${currentScale})`;
            
            // Render the document components
            renderTranscription(docData);
            createHighlightOverlay(docData);
            
            // Apply annotations if available
            if (annotations) {
                applyAnnotations(annotations, docData);
            }
            
            // Reset page navigation
            const totalPages = docData.metadata.totalPages || 1;
            const currentPage = docData.metadata.currentPage || 1;
            updatePageNavigation(currentPage, totalPages);
            
            // Build the position map for synchronized scrolling
            buildLinePositionMap(docData);
            
            // Initial fit to width for better viewing
            setTimeout(fitToWidth, 100);
            
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
            lineElem.textContent = line.text || '';
            
            // Add line coordinates as data attributes for better integration
            if (line.coordinates && line.coordinates.length > 0) {
                const bbox = calculateBoundingBox(line.coordinates);
                lineElem.dataset.x = bbox.x;
                lineElem.dataset.y = bbox.y;
                lineElem.dataset.width = bbox.width;
                lineElem.dataset.height = bbox.height;
            }
            
            // Add event listeners for interaction
            lineElem.addEventListener('mouseover', () => highlightLine(line.id));
            lineElem.addEventListener('mouseout', unhighlightLine);
            lineElem.addEventListener('click', () => scrollToLine(line.id));
            
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
        regionHighlight.className = 'text-region-highlight region';
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
            lineHighlight.className = 'text-region-highlight line';
            lineHighlight.dataset.lineId = line.id;
            lineHighlight.style.display = 'none'; // Hide by default
            
            // Add event listeners for interaction
            lineHighlight.addEventListener('mouseover', () => highlightLine(line.id));
            lineHighlight.addEventListener('mouseout', unhighlightLine);
            lineHighlight.addEventListener('click', () => scrollToTranscriptionLine(line.id));
            
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
 * Build a map of line positions for synchronization
 * @param {object} docData - Parsed document data
 */
function buildLinePositionMap(docData) {
    linePositionMap.clear();
    
    // Process all text regions
    docData.textRegions.forEach(region => {
        region.lines.forEach(line => {
            const lineBbox = calculateBoundingBox(line.coordinates);
            
            // Store the position of this line in the image
            linePositionMap.set(line.id, {
                imagePos: {
                    x: lineBbox.x,
                    y: lineBbox.y,
                    width: lineBbox.width,
                    height: lineBbox.height
                },
                // We'll add transcription position later
                transcriptionPos: null
            });
        });
    });
    
    // Now map transcription positions
    document.querySelectorAll('.transcription-line').forEach(lineElem => {
        const lineId = lineElem.dataset.lineId;
        if (linePositionMap.has(lineId)) {
            const rect = lineElem.getBoundingClientRect();
            const containerRect = document.getElementById('transcription-container').getBoundingClientRect();
            
            linePositionMap.get(lineId).transcriptionPos = {
                top: lineElem.offsetTop,
                height: lineElem.offsetHeight,
                element: lineElem
            };
        }
    });
}

/**
 * Set up synchronization between document view and transcription
 */
function setupViewSynchronization() {
    const docContainer = document.getElementById('document-container');
    const transcriptionContainer = document.getElementById('transcription-container');
    
    // Sync scrolling from document to transcription
    docContainer.addEventListener('scroll', () => {
        if (!isScrollingSynced || isScrollingTriggeredBySync) return;
        
        isScrollingTriggeredBySync = true;
        
        // Find the line closest to the center of the viewport
        const centerX = docContainer.scrollLeft + docContainer.clientWidth / 2;
        const centerY = docContainer.scrollTop + docContainer.clientHeight / 2;
        
        let closestLine = null;
        let closestDistance = Infinity;
        
        // Iterate through all line positions
        for (const [lineId, positions] of linePositionMap.entries()) {
            const imgPos = positions.imagePos;
            if (!imgPos) continue;
            
            // Calculate the center of this line
            const lineCenter = {
                x: imgPos.x + imgPos.width / 2,
                y: imgPos.y + imgPos.height / 2
            };
            
            // Calculate distance to viewport center
            const distance = Math.sqrt(
                Math.pow(lineCenter.x - centerX, 2) + 
                Math.pow(lineCenter.y - centerY, 2)
            );
            
            if (distance < closestDistance) {
                closestDistance = distance;
                closestLine = lineId;
            }
        }
        
        // Scroll to the closest line in the transcription
        if (closestLine && linePositionMap.has(closestLine)) {
            const transcPos = linePositionMap.get(closestLine).transcriptionPos;
            if (transcPos) {
                transcriptionContainer.scrollTop = transcPos.top - transcriptionContainer.clientHeight / 2 + transcPos.height / 2;
            }
        }
        
        setTimeout(() => {
            isScrollingTriggeredBySync = false;
        }, 100);
    });
    
    // Sync scrolling from transcription to document
    transcriptionContainer.addEventListener('scroll', () => {
        if (!isScrollingSynced || isScrollingTriggeredBySync) return;
        
        isScrollingTriggeredBySync = true;
        
        // Find the line closest to the center of the viewport
        const centerY = transcriptionContainer.scrollTop + transcriptionContainer.clientHeight / 2;
        
        let closestLine = null;
        let closestDistance = Infinity;
        
        // Iterate through all line positions
        for (const [lineId, positions] of linePositionMap.entries()) {
            const transcPos = positions.transcriptionPos;
            if (!transcPos) continue;
            
            // Calculate the center of this line
            const lineCenter = transcPos.top + transcPos.height / 2;
            
            // Calculate distance to viewport center
            const distance = Math.abs(lineCenter - centerY);
            
            if (distance < closestDistance) {
                closestDistance = distance;
                closestLine = lineId;
            }
        }
        
        // Scroll to the closest line in the document
        if (closestLine && linePositionMap.has(closestLine)) {
            const imgPos = linePositionMap.get(closestLine).imagePos;
            if (imgPos) {
                const lineCenter = {
                    x: imgPos.x + imgPos.width / 2,
                    y: imgPos.y + imgPos.height / 2
                };
                
                docContainer.scrollLeft = lineCenter.x - docContainer.clientWidth / 2;
                docContainer.scrollTop = lineCenter.y - docContainer.clientHeight / 2;
            }
        }
        
        setTimeout(() => {
            isScrollingTriggeredBySync = false;
        }, 100);
    });
}

/**
 * Create a toggle button for synchronization
 */
function createSyncToggleButton() {
    // Check if the button already exists
    if (document.getElementById('sync-toggle')) {
        return;
    }
    
    // Create the sync toggle button
    const syncButton = document.createElement('button');
    syncButton.id = 'sync-toggle';
    syncButton.className = 'tool-button active';
    syncButton.title = 'Toggle Synchronization';
    syncButton.innerHTML = '↔';
    syncButton.addEventListener('click', toggleSynchronization);
    
    // Add it to the tool panel
    const toolPanel = document.querySelector('.tool-panel');
    toolPanel.appendChild(syncButton);
}

/**
 * Toggle synchronized scrolling
 */
function toggleSynchronization() {
    isScrollingSynced = !isScrollingSynced;
    const syncButton = document.getElementById('sync-toggle');
    
    if (isScrollingSynced) {
        syncButton.classList.add('active');
        syncButton.title = 'Disable Synchronization';
    } else {
        syncButton.classList.remove('active');
        syncButton.title = 'Enable Synchronization';
    }
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
        
        // Add pulsating animation for better visibility
        lineHighlight.classList.add('pulsate');
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
        highlight.classList.remove('pulsate');
    });
    
    highlightedLine = null;
}

/**
 * Scroll to a specific line in the document image
 * @param {string} lineId - ID of the line to scroll to
 */
function scrollToLine(lineId) {
    if (!linePositionMap.has(lineId)) return;
    
    const imgPos = linePositionMap.get(lineId).imagePos;
    if (!imgPos) return;
    
    const docContainer = document.getElementById('document-container');
    
    // Calculate scroll position to center on the line
    const scrollLeft = imgPos.x + imgPos.width / 2 - docContainer.clientWidth / 2;
    const scrollTop = imgPos.y + imgPos.height / 2 - docContainer.clientHeight / 2;
    
    // Smooth scroll to the position
    docContainer.scrollTo({
        left: scrollLeft,
        top: scrollTop,
        behavior: 'smooth'
    });
    
    // Highlight the line
    highlightLine(lineId);
}

/**
 * Scroll to a specific line in the transcription
 * @param {string} lineId - ID of the line to scroll to
 */
function scrollToTranscriptionLine(lineId) {
    if (!linePositionMap.has(lineId)) return;
    
    const transcPos = linePositionMap.get(lineId).transcriptionPos;
    if (!transcPos) return;
    
    const transcriptionContainer = document.getElementById('transcription-container');
    
    // Calculate scroll position to center on the line
    const scrollTop = transcPos.top - transcriptionContainer.clientHeight / 2 + transcPos.height / 2;
    
    // Smooth scroll to the position
    transcriptionContainer.scrollTo({
        top: scrollTop,
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
    // Store current view center
    const docContainer = document.getElementById('document-container');
    const viewportCenterX = docContainer.scrollLeft + docContainer.clientWidth / 2;
    const viewportCenterY = docContainer.scrollTop + docContainer.clientHeight / 2;
    
    // Calculate new scale, with limits
    const oldScale = currentScale;
    currentScale = Math.max(0.2, Math.min(5.0, currentScale + delta));
    
    if (currentScale === oldScale) return;
    
    const scaleFactor = currentScale / oldScale;
    
    // Apply the new scale
    document.getElementById('document-image').style.transform = `scale(${currentScale})`;
    document.getElementById('highlight-overlay').style.transform = `scale(${currentScale})`;
    
    // Adjust scroll to maintain center point
    const newScrollLeft = viewportCenterX * scaleFactor - docContainer.clientWidth / 2;
    const newScrollTop = viewportCenterY * scaleFactor - docContainer.clientHeight / 2;
    
    docContainer.scrollLeft = newScrollLeft;
    docContainer.scrollTop = newScrollTop;
    
    // Update zoom level indicator if it exists
    const zoomLevelElem = document.querySelector('.zoom-level');
    if (zoomLevelElem) {
        zoomLevelElem.textContent = `${Math.round(currentScale * 100)}%`;
    } else {
        // Create zoom indicator if it doesn't exist
        const newZoomLevel = document.createElement('div');
        newZoomLevel.className = 'zoom-level';
        newZoomLevel.textContent = `${Math.round(currentScale * 100)}%`;
        document.getElementById('document-panel').appendChild(newZoomLevel);
    }
}

/**
 * Handle mouse wheel zoom
 * @param {Event} event - Wheel event
 */
function handleWheel(event) {
    // Only zoom if Ctrl key is pressed
    if (event.ctrlKey) {
        event.preventDefault();
        const delta = event.deltaY < 0 ? 0.1 : -0.1;
        zoom(delta);
    }
}

/**
 * Fit the document image to the width of the container
 */
function fitToWidth() {
    if (!currentImage) return;
    
    const containerWidth = document.getElementById('document-panel').clientWidth;
    const imageWidth = currentImage.naturalWidth;
    
    // Calculate scale to fit width with a small margin
    currentScale = (containerWidth - 20) / imageWidth;
    
    document.getElementById('document-image').style.transform = `scale(${currentScale})`;
    document.getElementById('highlight-overlay').style.transform = `scale(${currentScale})`;
    
    // Update zoom level indicator
    const zoomLevelElem = document.querySelector('.zoom-level');
    if (zoomLevelElem) {
        zoomLevelElem.textContent = `${Math.round(currentScale * 100)}%`;
    }
    
    // Center the image vertically
    const docContainer = document.getElementById('document-container');
    docContainer.scrollLeft = 0;
    docContainer.scrollTop = 0;
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
    
    const scaleX = (containerWidth - 20) / imageWidth;
    const scaleY = (containerHeight - 20) / imageHeight;
    
    // Use the smaller scale to ensure the entire image fits
    currentScale = Math.min(scaleX, scaleY);
    
    document.getElementById('document-image').style.transform = `scale(${currentScale})`;
    document.getElementById('highlight-overlay').style.transform = `scale(${currentScale})`;
    
    // Update zoom level indicator
    const zoomLevelElem = document.querySelector('.zoom-level');
    if (zoomLevelElem) {
        zoomLevelElem.textContent = `${Math.round(currentScale * 100)}%`;
    }
    
    // Center the image
    const docContainer = document.getElementById('document-container');
    docContainer.scrollLeft = (imageWidth * currentScale - containerWidth) / 2;
    docContainer.scrollTop = 0;
}

/**
 * Start dragging the document image
 * @param {Event} event - Mouse event
 */
function startDrag(event) {
    if (event.target.id === 'document-image' || event.target.id === 'highlight-overlay') {
        isDragging = true;
        lastMouseX = event.clientX;
        lastMouseY = event.clientY;
        
        // Change cursor style
        document.body.style.cursor = 'grabbing';
        
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
 */
function endDrag() {
    if (isDragging) {
        isDragging = false;
        document.body.style.cursor = 'default';
    }
}

// Export the functions that need to be accessed by other modules
export {
    initViewer,
    loadDocument,
    highlightLine,
    unhighlightLine,
    scrollToLine,
    scrollToTranscriptionLine,
    fitToWidth,
    fitToPage,
    zoom
};