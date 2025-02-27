/**
 * Annotations module for handling document annotations
 * This module manages the integration of external annotations with document content
 */

/**
 * Initialize the annotations system
 */
function initAnnotations() {
    // Set up annotation toggle button
    document.getElementById('annotation-toggle').addEventListener('click', toggleAnnotations);
    
    // Initialize annotation tooltip
    initTooltip();
}

/**
 * Apply annotations to the document
 * @param {object} annotations - Annotation data
 * @param {object} docData - Document data
 */
function applyAnnotations(annotations, docData) {
    if (!annotations || !annotations.annotations || annotations.annotations.length === 0) {
        console.log('No annotations to apply');
        return;
    }
    
    try {
        // Get all transcription lines
        const lines = document.querySelectorAll('.transcription-line');
        
        // Process each annotation
        annotations.annotations.forEach(annotation => {
            // Find the line where this annotation starts
            // This is simplified - in a real implementation, you'd need to track
            // character positions across multiple lines
            for (const line of lines) {
                const lineText = line.textContent;
                
                // Check if the annotation text is in this line
                if (lineText.includes(annotation.text)) {
                    // Find the start position in this line
                    const startPos = lineText.indexOf(annotation.text);
                    if (startPos >= 0) {
                        // Apply the annotation
                        applyAnnotationToLine(line, startPos, annotation);
                        break;
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error applying annotations:', error);
    }
}

/**
 * Apply an annotation to a specific line
 * @param {Element} lineElement - The line DOM element
 * @param {number} startPos - Starting position in the line text
 * @param {object} annotation - The annotation to apply
 */
function applyAnnotationToLine(lineElement, startPos, annotation) {
    const lineText = lineElement.textContent;
    const annotationLength = annotation.text.length;
    
    // Clear existing content
    lineElement.innerHTML = '';
    
    // Add text before annotation
    if (startPos > 0) {
        const beforeText = document.createTextNode(lineText.substring(0, startPos));
        lineElement.appendChild(beforeText);
    }
    
    // Create the annotation span
    const annotationSpan = document.createElement('span');
    annotationSpan.className = `annotation ${annotation.type}-${annotation.subtype}`;
    annotationSpan.textContent = annotation.text;
    annotationSpan.dataset.type = annotation.type;
    annotationSpan.dataset.subtype = annotation.subtype;
    
    // Add metadata if available
    if (annotation.metadata) {
        for (const [key, value] of Object.entries(annotation.metadata)) {
            annotationSpan.dataset[key] = value;
        }
    }
    
    // Add event listeners for tooltip
    annotationSpan.addEventListener('mouseover', showTooltip);
    annotationSpan.addEventListener('mouseout', hideTooltip);
    
    lineElement.appendChild(annotationSpan);
    
    // Add text after annotation
    if (startPos + annotationLength < lineText.length) {
        const afterText = document.createTextNode(lineText.substring(startPos + annotationLength));
        lineElement.appendChild(afterText);
    }
}

/**
 * Initialize the annotation tooltip
 */
function initTooltip() {
    // Create tooltip element if it doesn't exist
    if (!document.querySelector('.annotation-tooltip')) {
        const tooltip = document.createElement('div');
        tooltip.className = 'annotation-tooltip';
        tooltip.style.display = 'none';
        document.body.appendChild(tooltip);
    }
}

/**
 * Show the annotation tooltip
 * @param {Event} event - Mouse event
 */
function showTooltip(event) {
    const annotation = event.target;
    const type = annotation.dataset.type;
    const subtype = annotation.dataset.subtype;
    const tooltip = document.querySelector('.annotation-tooltip');
    
    // Set tooltip content
    let content = '';
    content += '<div class="annotation-tooltip-header">' + 
               type.toUpperCase() + ': ' + subtype +
               '</div>';
    
    content += '<div class="annotation-tooltip-content">';
    
    // Add description if available
    if (annotation.dataset.description) {
        content += '<div class="annotation-tooltip-definition">' + 
                  annotation.dataset.description + 
                  '</div>';
    }
    
    // Add category info based on type
    switch(type) {
        case 'ner':
            content += '<div class="annotation-tooltip-category">Named Entity: ' + subtype + '</div>';
            break;
        case 'pos':
            content += '<div class="annotation-tooltip-category">Part of Speech: ' + subtype + '</div>';
            break;
        case 'morph':
            content += '<div class="annotation-tooltip-category">Morphological Analysis</div>';
            break;
    }
    
    content += '</div>';
    
    tooltip.innerHTML = content;
    
    // Position the tooltip
    const rect = annotation.getBoundingClientRect();
    tooltip.style.left = rect.left + 'px';
    tooltip.style.top = (rect.bottom + 10) + 'px';
    
    // Show the tooltip
    tooltip.style.display = 'block';
}

/**
 * Hide the annotation tooltip
 */
function hideTooltip() {
    const tooltip = document.querySelector('.annotation-tooltip');
    if (tooltip) {
        tooltip.style.display = 'none';
    }
}

/**
 * Toggle annotation visibility
 */
function toggleAnnotations() {
    const container = document.querySelector('.content-container');
    container.classList.toggle('annotations-hidden');
    
    // Toggle button active state
    document.getElementById('annotation-toggle').classList.toggle('active');
    
    // Toggle annotation legend
    const legend = document.querySelector('.annotation-legend');
    if (legend) {
        legend.classList.toggle('visible');
    }
}

/**
 * Create the annotation legend
 */
function createAnnotationLegend() {
    // Remove existing legend if any
    const existingLegend = document.querySelector('.annotation-legend');
    if (existingLegend) {
        existingLegend.remove();
    }
    
    // Create new legend
    const legend = document.createElement('div');
    legend.className = 'annotation-legend';
    
    let content = '<div class="legend-title">Annotation Types</div>';
    
    // NER items
    content += '<div class="legend-item"><div class="legend-color" style="background-color: rgba(255, 170, 170, 0.3);"></div>Person</div>';
    content += '<div class="legend-item"><div class="legend-color" style="background-color: rgba(170, 255, 170, 0.3);"></div>Location</div>';
    content += '<div class="legend-item"><div class="legend-color" style="background-color: rgba(170, 170, 255, 0.3);"></div>Organization</div>';
    content += '<div class="legend-item"><div class="legend-color" style="background-color: rgba(255, 255, 170, 0.3);"></div>Date</div>';
    
    // POS items
    content += '<div class="legend-title" style="margin-top: 10px;">Parts of Speech</div>';
    content += '<div class="legend-item"><div class="legend-color" style="background-color: rgba(230, 190, 255, 0.3);"></div>Noun</div>';
    content += '<div class="legend-item"><div class="legend-color" style="background-color: rgba(255, 200, 170, 0.3);"></div>Verb</div>';
    content += '<div class="legend-item"><div class="legend-color" style="background-color: rgba(190, 230, 255, 0.3);"></div>Adjective</div>';
    
    legend.innerHTML = content;
    
    // Add the legend to the document panel
    document.querySelector('.document-panel').appendChild(legend);
    
    return legend;
}

// Export the functions that need to be accessed by other modules
export {
    initAnnotations,
    applyAnnotations,
    toggleAnnotations,
    createAnnotationLegend
};