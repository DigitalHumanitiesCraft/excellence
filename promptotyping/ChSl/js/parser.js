/**
 * Parser module for handling PAGE XML transcriptions
 * This module handles the parsing of PAGE XML format exported from Transkribus
 */

/**
 * Parse PAGE XML format into a structured JavaScript object
 * @param {string} xmlString - The XML string to parse
 * @return {object} Parsed document data
 */
function parsePageXML(xmlString) {
    // Use the browser's built-in DOMParser
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, "text/xml");
    
    // Check for parsing errors
    const parserError = xmlDoc.querySelector('parsererror');
    if (parserError) {
        throw new Error('XML parsing error: ' + parserError.textContent);
    }
    
    try {
        // Extract basic metadata
        const metadata = extractMetadata(xmlDoc);
        
        // Extract page dimensions
        const page = xmlDoc.querySelector('Page');
        const pageWidth = page ? parseInt(page.getAttribute('imageWidth'), 10) : 0;
        const pageHeight = page ? parseInt(page.getAttribute('imageHeight'), 10) : 0;
        
        // Extract text regions
        const textRegions = extractTextRegions(xmlDoc);
        
        // Extract reading order
        const readingOrder = extractReadingOrder(xmlDoc, textRegions);
        
        // Return the structured data
        return {
            metadata,
            page: {
                width: pageWidth,
                height: pageHeight
            },
            textRegions,
            readingOrder
        };
    } catch (error) {
        console.error('Error parsing PAGE XML:', error);
        throw new Error('Failed to parse document structure: ' + error.message);
    }
}

/**
 * Extract metadata from the PAGE XML
 * @param {Document} xmlDoc - The parsed XML document
 * @return {object} Metadata object
 */
function extractMetadata(xmlDoc) {
    // Initialize with default values
    const metadata = {
        creator: '',
        created: '',
        lastModified: '',
        status: ''
    };
    
    // Extract metadata from Metadata element
    const metadataElem = xmlDoc.querySelector('Metadata');
    if (metadataElem) {
        const creatorElem = metadataElem.querySelector('Creator');
        metadata.creator = creatorElem ? creatorElem.textContent : '';
        
        const createdElem = metadataElem.querySelector('Created');
        metadata.created = createdElem ? createdElem.textContent : '';
        
        const lastModifiedElem = metadataElem.querySelector('LastChange');
        metadata.lastModified = lastModifiedElem ? lastModifiedElem.textContent : '';
    }
    
    // Extract status from Page element
    const page = xmlDoc.querySelector('Page');
    if (page) {
        metadata.status = page.getAttribute('status') || '';
    }
    
    return metadata;
}

/**
 * Extract text regions from the PAGE XML
 * @param {Document} xmlDoc - The parsed XML document
 * @return {Array} Array of text region objects
 */
function extractTextRegions(xmlDoc) {
    const textRegions = [];
    const regions = xmlDoc.querySelectorAll('TextRegion');
    
    regions.forEach((region, regionIndex) => {
        const regionId = region.getAttribute('id') || `region_${regionIndex}`;
        const regionType = region.getAttribute('type') || 'paragraph';
        
        // Extract region coordinates
        const regionCoords = extractCoordinates(region.querySelector('Coords'));
        
        // Extract text lines within this region
        const lines = extractTextLines(region);
        
        // Add the region to our array
        textRegions.push({
            id: regionId,
            type: regionType,
            coordinates: regionCoords,
            lines: lines
        });
    });
    
    return textRegions;
}

/**
 * Extract text lines from a text region
 * @param {Element} regionElem - The text region element
 * @return {Array} Array of text line objects
 */
function extractTextLines(regionElem) {
    const lines = [];
    const lineElems = regionElem.querySelectorAll('TextLine');
    
    lineElems.forEach((line, lineIndex) => {
        const lineId = line.getAttribute('id') || `line_${lineIndex}`;
        
        // Extract line coordinates
        const lineCoords = extractCoordinates(line.querySelector('Coords'));
        
        // Extract baseline coordinates if present
        const baselineElem = line.querySelector('Baseline');
        const baseline = baselineElem ? extractPoints(baselineElem.getAttribute('points')) : [];
        
        // Extract text content
        const textEquivElem = line.querySelector('TextEquiv');
        const unicodeElem = textEquivElem ? textEquivElem.querySelector('Unicode') : null;
        const text = unicodeElem ? unicodeElem.textContent : '';
        
        // Add the line to our array
        lines.push({
            id: lineId,
            coordinates: lineCoords,
            baseline: baseline,
            text: text
        });
    });
    
    return lines;
}

/**
 * Extract reading order from the PAGE XML
 * @param {Document} xmlDoc - The parsed XML document
 * @param {Array} textRegions - The parsed text regions
 * @return {Array} Array of region IDs in reading order
 */
function extractReadingOrder(xmlDoc, textRegions) {
    // Look for a reading order element
    const readingOrderElem = xmlDoc.querySelector('ReadingOrder');
    
    if (readingOrderElem) {
        // Extract structured reading order
        const orderList = [];
        const orderGroups = readingOrderElem.querySelectorAll('OrderedGroup, UnorderedGroup');
        
        if (orderGroups.length > 0) {
            // Process reading order from the XML
            orderGroups.forEach(group => {
                const regionRefs = group.querySelectorAll('RegionRefIndexed');
                regionRefs.forEach(ref => {
                    orderList.push(ref.getAttribute('regionRef'));
                });
            });
            
            return orderList;
        }
    }
    
    // If no structured reading order, return the regions in document order
    return textRegions.map(region => region.id);
}

/**
 * Extract coordinate points from a Coords element
 * @param {Element} coordsElem - The coordinates element
 * @return {Array} Array of point objects with x and y properties
 */
function extractCoordinates(coordsElem) {
    if (!coordsElem) return [];
    
    const pointsString = coordsElem.getAttribute('points');
    return extractPoints(pointsString);
}

/**
 * Convert a points string to an array of point objects
 * @param {string} pointsString - The points attribute string (e.g., "100,100 200,200")
 * @return {Array} Array of point objects with x and y properties
 */
function extractPoints(pointsString) {
    if (!pointsString) return [];
    
    return pointsString.trim().split(' ').map(pointPair => {
        const [x, y] = pointPair.split(',').map(n => parseInt(n, 10));
        return { x, y };
    });
}

/**
 * Calculate the bounding box for a set of coordinates
 * @param {Array} coordinates - Array of point objects
 * @return {Object} Bounding box with x, y, width, height
 */
function calculateBoundingBox(coordinates) {
    if (!coordinates || coordinates.length === 0) {
        return { x: 0, y: 0, width: 0, height: 0 };
    }
    
    // Find the minimum and maximum x and y values
    const xValues = coordinates.map(point => point.x);
    const yValues = coordinates.map(point => point.y);
    
    const minX = Math.min(...xValues);
    const maxX = Math.max(...xValues);
    const minY = Math.min(...yValues);
    const maxY = Math.max(...yValues);
    
    return {
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY
    };
}

// Export the functions that need to be accessed by other modules
export {
    parsePageXML,
    calculateBoundingBox
};