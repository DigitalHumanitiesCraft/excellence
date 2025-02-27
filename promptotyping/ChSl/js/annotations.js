/**
 * Annotations module for handling document annotations
 * This module manages the integration of external annotations with document content
 */

// Module state
let annotationsEnabled = true;
let currentAnnotations = null;
let currentDocData = null;
let annotationLegendVisible = false;
let activeAnnotationTypes = {
    ner: true,
    pos: true,
    morph: true
};

/**
 * Initialize the annotations system
 */
function initAnnotations() {
    // Set up annotation toggle button
    document.getElementById('annotation-toggle').addEventListener('click', toggleAnnotations);
    
    // Create annotation filter controls if they don't exist
    createAnnotationFilters();
    
    // Initialize annotation tooltip
    initTooltip();
    
    // Create annotation legend
    createAnnotationLegend();
}

/**
 * Create annotation type filter controls
 */
function createAnnotationFilters() {
    // Check if filters already exist
    if (document.querySelector('.annotation-filters')) {
        return;
    }
    
    // Create filter container
    const filterContainer = document.createElement('div');
    filterContainer.className = 'annotation-filters';
    
    // Add filter title
    const filterTitle = document.createElement('div');
    filterTitle.className = 'filter-title';
    filterTitle.textContent = 'Annotation Types';
    filterContainer.appendChild(filterTitle);
    
    // Add filters for each annotation type
    const types = [
        { id: 'ner', label: 'Named Entities' },
        { id: 'pos', label: 'Parts of Speech' },
        { id: 'morph', label: 'Morphology' }
    ];
    
    types.forEach(type => {
        const filterItem = document.createElement('div');
        filterItem.className = 'filter-item';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `filter-${type.id}`;
        checkbox.checked = activeAnnotationTypes[type.id];
        checkbox.addEventListener('change', () => {
            activeAnnotationTypes[type.id] = checkbox.checked;
            if (currentAnnotations && currentDocData) {
                applyAnnotations(currentAnnotations, currentDocData);
            }
        });
        
        const label = document.createElement('label');
        label.htmlFor = `filter-${type.id}`;
        label.textContent = type.label;
        
        filterItem.appendChild(checkbox);
        filterItem.appendChild(label);
        filterContainer.appendChild(filterItem);
    });
    
    // Add to tool panel or another appropriate location
    const panel = document.querySelector('.tool-panel');
    if (panel) {
        panel.appendChild(filterContainer);
    }
}

/**
 * Apply annotations to the document
 * @param {object} annotations - Annotation data
 * @param {object} docData - Document data
 */
function applyAnnotations(annotations, docData) {
    // Store current annotations and document data
    currentAnnotations = annotations;
    currentDocData = docData;
    
    // Clear existing annotations
    clearAnnotations();
    
    if (!annotations || !annotations.annotations || annotations.annotations.length === 0) {
        console.log('No annotations to apply');
        return;
    }
    
    if (!annotationsEnabled) {
        console.log('Annotations are disabled');
        return;
    }
    
    try {
        // Build a character position map for the entire document
        const positionMap = buildCharacterPositionMap(docData);
        
        // Group annotations by type
        const groupedAnnotations = groupAnnotationsByType(annotations.annotations);
        
        // Process each annotation type if enabled
        Object.keys(groupedAnnotations).forEach(type => {
            if (activeAnnotationTypes[type]) {
                processAnnotationGroup(groupedAnnotations[type], positionMap);
            }
        });
        
        // Update the legend
        updateAnnotationLegend(groupedAnnotations);
    } catch (error) {
        console.error('Error applying annotations:', error);
    }
}

/**
 * Group annotations by their type
 * @param {Array} annotations - Array of annotation objects
 * @return {Object} Annotations grouped by type
 */
function groupAnnotationsByType(annotations) {
    const grouped = {};
    
    annotations.forEach(annotation => {
        const type = annotation.type || 'unknown';
        if (!grouped[type]) {
            grouped[type] = [];
        }
        grouped[type].push(annotation);
    });
    
    return grouped;
}

/**
 * Build a map of character positions in the document
 * @param {object} docData - Document data
 * @return {object} Character position map
 */
function buildCharacterPositionMap(docData) {
    const map = {
        regions: [],
        charOffsets: [],
        totalOffset: 0
    };
    
    // Process each text region
    docData.textRegions.forEach(region => {
        const regionInfo = {
            id: region.id,
            lines: []
        };
        
        // Process each line in the region
        region.lines.forEach(line => {
            const lineText = line.text || '';
            const lineLength = lineText.length;
            
            // Store line information
            const lineInfo = {
                id: line.id,
                text: lineText,
                startOffset: map.totalOffset,
                endOffset: map.totalOffset + lineLength,
                element: document.querySelector(`.transcription-line[data-line-id="${line.id}"]`)
            };
            
            regionInfo.lines.push(lineInfo);
            
            // Map each character position
            for (let i = 0; i < lineLength; i++) {
                map.charOffsets.push({
                    regionId: region.id,
                    lineId: line.id,
                    charIndex: i,
                    text: lineText[i],
                    globalOffset: map.totalOffset + i
                });
            }
            
            // Add a line break to the character map
            map.charOffsets.push({
                regionId: region.id,
                lineId: line.id,
                charIndex: lineLength,
                text: '\n',
                globalOffset: map.totalOffset + lineLength,
                isLineBreak: true
            });
            
            // Update total offset
            map.totalOffset += lineLength + 1; // +1 for the line break
        });
        
        map.regions.push(regionInfo);
    });
    
    return map;
}

/**
 * Process a group of annotations of the same type
 * @param {Array} annotations - Array of annotation objects
 * @param {object} positionMap - Character position map
 */
function processAnnotationGroup(annotations, positionMap) {
    // Sort annotations by start position to handle nesting
    const sortedAnnotations = [...annotations].sort((a, b) => a.start - b.start);
    
    // Process each annotation
    sortedAnnotations.forEach(annotation => {
        const startPos = annotation.start;
        const endPos = annotation.end;
        
        // Find start and end character positions
        const startChar = positionMap.charOffsets[startPos];
        // Adjust end position to handle line breaks
        let endChar = positionMap.charOffsets[Math.min(endPos, positionMap.charOffsets.length - 1)];
        
        if (!startChar || !endChar) {
            console.warn('Invalid character positions for annotation:', annotation);
            return;
        }
        
        // Get lines that contain this annotation
        const affectedLines = getAffectedLines(startChar, endChar, positionMap);
        
        // Apply annotation to each affected line
        affectedLines.forEach(line => {
            applyAnnotationToLine(line, annotation, startPos, endPos, positionMap);
        });
    });
}

/**
 * Get lines affected by an annotation
 * @param {object} startChar - Starting character info
 * @param {object} endChar - Ending character info
 * @param {object} positionMap - Character position map
 * @return {Array} Affected line elements
 */
function getAffectedLines(startChar, endChar, positionMap) {
    const lines = [];
    let foundStart = false;
    
    // Go through each region and find affected lines
    positionMap.regions.forEach(region => {
        region.lines.forEach(line => {
            // If this line contains the start character
            if (line.startOffset <= startChar.globalOffset && startChar.globalOffset <= line.endOffset) {
                foundStart = true;
                
                if (line.element) {
                    lines.push(line);
                }
            }
            // If this line is between start and end
            else if (foundStart && line.startOffset <= endChar.globalOffset) {
                if (line.element) {
                    lines.push(line);
                }
            }
            // If this line contains the end character, we're done
            else if (foundStart && endChar.globalOffset <= line.endOffset) {
                foundStart = false;
            }
        });
    });
    
    return lines;
}

/**
 * Apply an annotation to a specific line
 * @param {object} line - Line information
 * @param {object} annotation - The annotation to apply
 * @param {number} globalStartOffset - Global start offset
 * @param {number} globalEndOffset - Global end offset
 * @param {object} positionMap - Character position map
 */
function applyAnnotationToLine(line, annotation, globalStartOffset, globalEndOffset, positionMap) {
    if (!line.element) return;
    
    // Calculate start and end offsets within this line
    const lineStartOffset = Math.max(0, globalStartOffset - line.startOffset);
    const lineEndOffset = Math.min(line.text.length, globalEndOffset - line.startOffset);
    
    // If annotation doesn't affect this line, skip
    if (lineEndOffset <= 0 || lineStartOffset >= line.text.length) {
        return;
    }
    
    // Get the line text content
    const lineText = line.text;
    
    // Create document fragment to replace content
    const fragment = document.createDocumentFragment();
    
    // Add text before annotation if any
    if (lineStartOffset > 0) {
        const beforeText = document.createTextNode(lineText.substring(0, lineStartOffset));
        fragment.appendChild(beforeText);
    }
    
    // Create the annotation span
    const annotationSpan = document.createElement('span');
    annotationSpan.className = `annotation ${annotation.type}-${annotation.subtype}`;
    annotationSpan.textContent = lineText.substring(lineStartOffset, lineEndOffset);
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
    
    fragment.appendChild(annotationSpan);
    
    // Add text after annotation if any
    if (lineEndOffset < lineText.length) {
        const afterText = document.createTextNode(lineText.substring(lineEndOffset));
        fragment.appendChild(afterText);
    }
    
    // Replace line content
    line.element.innerHTML = '';
    line.element.appendChild(fragment);
    
    // Re-add data attributes
    line.element.dataset.lineId = line.id;
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
            content += '<div class="annotation-tooltip-category">Named Entity Recognition</div>';
            break;
        case 'pos':
            content += '<div class="annotation-tooltip-category">Part of Speech</div>';
            break;
        case 'morph':
            content += '<div class="annotation-tooltip-category">Morphological Analysis</div>';
            break;
    }
    
    content += '</div>';
    
    tooltip.innerHTML = content;
    
    // Position the tooltip
    const rect = annotation.getBoundingClientRect();
    
    // Ensure tooltip stays in viewport
    const viewportWidth = window.innerWidth;
    const tooltipWidth = 250; // Approximate width
    
    // Calculate left position to keep tooltip in view
    let leftPos = rect.left;
    if (leftPos + tooltipWidth > viewportWidth - 20) {
        leftPos = viewportWidth - tooltipWidth - 20;
    }
    
    tooltip.style.left = leftPos + 'px';
    tooltip.style.top = (rect.bottom + 10) + 'px';
    
    // Show the tooltip with a fade-in effect
    tooltip.style.opacity = '0';
    tooltip.style.display = 'block';
    
    // Trigger reflow
    tooltip.offsetHeight;
    
    // Fade in
    tooltip.style.transition = 'opacity 0.2s ease-in-out';
    tooltip.style.opacity = '1';
}

/**
 * Hide the annotation tooltip
 */
function hideTooltip() {
    const tooltip = document.querySelector('.annotation-tooltip');
    if (tooltip) {
        // Fade out
        tooltip.style.opacity = '0';
        
        // Hide after fade completes
        setTimeout(() => {
            tooltip.style.display = 'none';
        }, 200);
    }
}

/**
 * Toggle annotation visibility
 */
function toggleAnnotations() {
    annotationsEnabled = !annotationsEnabled;
    
    // Toggle container class
    const container = document.querySelector('.content-container');
    container.classList.toggle('annotations-hidden', !annotationsEnabled);
    
    // Toggle button active state
    document.getElementById('annotation-toggle').classList.toggle('active', annotationsEnabled);
    
    // Toggle annotation legend
    toggleAnnotationLegend(annotationsEnabled);
    
    // Reapply annotations if needed
    if (annotationsEnabled && currentAnnotations && currentDocData) {
        applyAnnotations(currentAnnotations, currentDocData);
    } else if (!annotationsEnabled) {
        clearAnnotations();
    }
}

/**
 * Clear all annotations from the document
 */
function clearAnnotations() {
    // Reset all transcription lines to their original text
    const lines = document.querySelectorAll('.transcription-line');
    
    lines.forEach(line => {
        const lineId = line.dataset.lineId;
        if (!currentDocData) return;
        
        // Find the line in document data
        for (const region of currentDocData.textRegions) {
            const docLine = region.lines.find(l => l.id === lineId);
            if (docLine) {
                // Preserve data attributes
                const dataAttrs = {};
                for (const attr of line.attributes) {
                    if (attr.name.startsWith('data-')) {
                        dataAttrs[attr.name] = attr.value;
                    }
                }
                
                // Reset content
                line.innerHTML = docLine.text || '';
                
                // Restore data attributes
                for (const [name, value] of Object.entries(dataAttrs)) {
                    line.setAttribute(name, value);
                }
                
                break;
            }
        }
    });
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
    legend.style.display = 'none'; // Hidden by default
    
    let content = '<div class="legend-title">Annotation Types</div>';
    
    // NER items
    content += '<div class="legend-section ner-section">';
    content += '<div class="legend-subtitle">Named Entities</div>';
    content += '<div class="legend-item"><div class="legend-color ner-person"></div>Person</div>';
    content += '<div class="legend-item"><div class="legend-color ner-location"></div>Location</div>';
    content += '<div class="legend-item"><div class="legend-color ner-organization"></div>Organization</div>';
    content += '<div class="legend-item"><div class="legend-color ner-date"></div>Date</div>';
    content += '<div class="legend-item"><div class="legend-color ner-misc"></div>Miscellaneous</div>';
    content += '</div>';
    
    // POS items
    content += '<div class="legend-section pos-section">';
    content += '<div class="legend-subtitle">Parts of Speech</div>';
    content += '<div class="legend-item"><div class="legend-color pos-noun"></div>Noun</div>';
    content += '<div class="legend-item"><div class="legend-color pos-verb"></div>Verb</div>';
    content += '<div class="legend-item"><div class="legend-color pos-adj"></div>Adjective</div>';
    content += '<div class="legend-item"><div class="legend-color pos-adv"></div>Adverb</div>';
    content += '<div class="legend-item"><div class="legend-color pos-other"></div>Other</div>';
    content += '</div>';
    
    // Morphology items
    content += '<div class="legend-section morph-section">';
    content += '<div class="legend-subtitle">Morphological Analysis</div>';
    content += '<div class="legend-item"><div class="legend-color morph"></div>Morphological Form</div>';
    content += '</div>';
    
    // Add close button
    content += '<button class="legend-close">×</button>';
    
    legend.innerHTML = content;
    
    // Add the legend to the document panel
    document.querySelector('.document-panel').appendChild(legend);
    
    // Add event listener to close button
    legend.querySelector('.legend-close').addEventListener('click', () => {
        toggleAnnotationLegend(false);
    });
    
    return legend;
}

/**
 * Update annotation legend based on available annotation types
 * @param {object} groupedAnnotations - Annotations grouped by type
 */
function updateAnnotationLegend(groupedAnnotations) {
    const legend = document.querySelector('.annotation-legend');
    if (!legend) return;
    
    // Show/hide sections based on available annotations
    const nerSection = legend.querySelector('.ner-section');
    const posSection = legend.querySelector('.pos-section');
    const morphSection = legend.querySelector('.morph-section');
    
    if (nerSection) nerSection.style.display = groupedAnnotations.ner ? 'block' : 'none';
    if (posSection) posSection.style.display = groupedAnnotations.pos ? 'block' : 'none';
    if (morphSection) morphSection.style.display = groupedAnnotations.morph ? 'block' : 'none';
    
    // Update items in each section based on available subtypes
    if (groupedAnnotations.ner) {
        updateLegendItems(legend, 'ner', groupedAnnotations.ner);
    }
    
    if (groupedAnnotations.pos) {
        updateLegendItems(legend, 'pos', groupedAnnotations.pos);
    }
}

/**
 * Update legend items for a specific annotation type
 * @param {Element} legend - The legend element
 * @param {string} type - Annotation type
 * @param {Array} annotations - Annotations of this type
 */
function updateLegendItems(legend, type, annotations) {
    // Get all subtypes used in these annotations
    const subtypes = new Set();
    annotations.forEach(ann => subtypes.add(ann.subtype));
    
    // Get the section for this type
    const section = legend.querySelector(`.${type}-section`);
    if (!section) return;
    
    // Get all items in this section
    const items = section.querySelectorAll('.legend-item');
    
    // Show/hide items based on available subtypes
    items.forEach(item => {
        const colorDiv = item.querySelector('.legend-color');
        const className = colorDiv.className;
        const subtypeMatch = className.match(new RegExp(`${type}-(\\w+)`));
        
        if (subtypeMatch) {
            const subtype = subtypeMatch[1];
            item.style.display = subtypes.has(subtype) || subtype === 'other' ? 'flex' : 'none';
        }
    });
}

/**
 * Toggle annotation legend visibility
 * @param {boolean} show - Whether to show the legend
 */
function toggleAnnotationLegend(show) {
    const legend = document.querySelector('.annotation-legend');
    if (!legend) return;
    
    if (show === undefined) {
        // Toggle if no parameter provided
        annotationLegendVisible = !annotationLegendVisible;
    } else {
        annotationLegendVisible = show;
    }
    
    legend.style.display = annotationLegendVisible ? 'block' : 'none';
}

// Export the functions that need to be accessed by other modules
export {
    initAnnotations,
    applyAnnotations,
    toggleAnnotations,
    clearAnnotations,
    createAnnotationLegend,
    toggleAnnotationLegend
};