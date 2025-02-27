/**
 * Parser module for handling PAGE XML transcriptions
 * This module provides comprehensive parsing of PAGE XML format exported from Transkribus
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
        
        // Extract document metadata from custom tags if available
        const documentMetadata = extractDocumentMetadata(xmlDoc);
        
        // Return the structured data
        return {
            metadata: {
                ...metadata,
                ...documentMetadata,
                pageWidth,
                pageHeight,
                totalPages: 1,  // Default to 1, update if METS info is available
                currentPage: 1
            },
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
        status: '',
        software: 'Transkribus',
        softwareVersion: '',
        processingStep: ''
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

        // Extract software information
        const processingSoftwareElems = metadataElem.querySelectorAll('MetadataItem[type="processingStep"] MetadataItem[name="software"] MetadataItem[value]');
        if (processingSoftwareElems.length > 0) {
            metadata.software = processingSoftwareElems[0].getAttribute('value') || 'Transkribus';
        }
        
        // Extract software version
        const processingSoftwareVersionElems = metadataElem.querySelectorAll('MetadataItem[type="processingStep"] MetadataItem[name="softwareVersion"] MetadataItem[value]');
        if (processingSoftwareVersionElems.length > 0) {
            metadata.softwareVersion = processingSoftwareVersionElems[0].getAttribute('value') || '';
        }
        
        // Extract processing step
        const processingStepElems = metadataElem.querySelectorAll('MetadataItem[type="processingStep"] MetadataItem[name="processingStepDescription"] MetadataItem[value]');
        if (processingStepElems.length > 0) {
            metadata.processingStep = processingStepElems[0].getAttribute('value') || '';
        }
    }
    
    // Extract status from Page element
    const page = xmlDoc.querySelector('Page');
    if (page) {
        metadata.status = page.getAttribute('status') || '';
    }
    
    return metadata;
}

/**
 * Extract document metadata from custom tags
 * @param {Document} xmlDoc - The parsed XML document
 * @return {object} Document metadata
 */
function extractDocumentMetadata(xmlDoc) {
    const documentMetadata = {};
    
    // Try to extract document title, date, author from custom metadata
    const customMetadataItems = xmlDoc.querySelectorAll('MetadataItem');
    customMetadataItems.forEach(item => {
        const name = item.getAttribute('name');
        const value = item.getAttribute('value');
        
        if (name && value) {
            // Map common metadata fields
            switch(name.toLowerCase()) {
                case 'title':
                case 'documenttitle':
                    documentMetadata.title = value;
                    break;
                case 'author':
                    documentMetadata.author = value;
                    break;
                case 'date':
                case 'documentdate':
                    documentMetadata.date = value;
                    break;
                case 'source':
                case 'repository':
                    documentMetadata.source = value;
                    break;
                default:
                    // Store other custom metadata
                    documentMetadata[name] = value;
            }
        }
    });
    
    return documentMetadata;
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
        
        // Extract region text if available
        const regionText = extractRegionText(region);
        
        // Add the region to our array
        textRegions.push({
            id: regionId,
            type: regionType,
            coordinates: regionCoords,
            text: regionText,
            lines: lines
        });
    });
    
    return textRegions;
}

/**
 * Extract text from a region element
 * @param {Element} regionElem - The region element
 * @return {string} The extracted text
 */
function extractRegionText(regionElem) {
    const textEquivElem = regionElem.querySelector('TextEquiv');
    if (!textEquivElem) return '';
    
    const unicodeElem = textEquivElem.querySelector('Unicode');
    return unicodeElem ? unicodeElem.textContent : '';
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
        
        // Extract text style information if available
        const textStyle = extractTextStyle(line);
        
        // Extract word-level information if available
        const words = extractWords(line);
        
        // Add the line to our array
        lines.push({
            id: lineId,
            coordinates: lineCoords,
            baseline: baseline,
            text: text,
            style: textStyle,
            words: words
        });
    });
    
    return lines;
}

/**
 * Extract text style information
 * @param {Element} element - The element to extract style from
 * @return {object} Style object
 */
function extractTextStyle(element) {
    const styleElem = element.querySelector('TextStyle');
    if (!styleElem) return null;
    
    return {
        fontSize: styleElem.getAttribute('fontSize'),
        fontFamily: styleElem.getAttribute('fontFamily'),
        bold: styleElem.getAttribute('bold') === 'true',
        italic: styleElem.getAttribute('italic') === 'true',
        underlined: styleElem.getAttribute('underlined') === 'true',
        textColour: styleElem.getAttribute('textColour')
    };
}

/**
 * Extract word information from a line
 * @param {Element} lineElem - The line element
 * @return {Array} Array of word objects
 */
function extractWords(lineElem) {
    const words = [];
    const wordElems = lineElem.querySelectorAll('Word');
    
    wordElems.forEach((word, wordIndex) => {
        const wordId = word.getAttribute('id') || `word_${wordIndex}`;
        
        // Extract word coordinates
        const wordCoords = extractCoordinates(word.querySelector('Coords'));
        
        // Extract text content
        const textEquivElem = word.querySelector('TextEquiv');
        const unicodeElem = textEquivElem ? textEquivElem.querySelector('Unicode') : null;
        const text = unicodeElem ? unicodeElem.textContent : '';
        
        // Extract confidence if available
        let confidence = null;
        if (textEquivElem && textEquivElem.getAttribute('conf')) {
            confidence = parseFloat(textEquivElem.getAttribute('conf'));
        }
        
        // Add the word to our array
        words.push({
            id: wordId,
            coordinates: wordCoords,
            text: text,
            confidence: confidence
        });
    });
    
    return words;
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
                const regionRefsArray = Array.from(regionRefs);
                
                // Sort by index if OrderedGroup
                if (group.tagName === 'OrderedGroup') {
                    regionRefsArray.sort((a, b) => {
                        const indexA = parseInt(a.getAttribute('index'), 10) || 0;
                        const indexB = parseInt(b.getAttribute('index'), 10) || 0;
                        return indexA - indexB;
                    });
                }
                
                regionRefsArray.forEach(ref => {
                    orderList.push(ref.getAttribute('regionRef'));
                });
            });
            
            return orderList;
        }
    }
    
    // If no structured reading order, try to determine a logical order
    // This algorithm attempts to sort by top-to-bottom, left-to-right reading
    return textRegions
        .map(region => ({ id: region.id, coordinates: region.coordinates }))
        .sort((a, b) => {
            if (!a.coordinates || !b.coordinates) return 0;
            
            const bboxA = calculateBoundingBox(a.coordinates);
            const bboxB = calculateBoundingBox(b.coordinates);
            
            // Use top coordinates with a threshold for same line
            const yDiff = bboxA.y - bboxB.y;
            if (Math.abs(yDiff) > 50) { // Threshold for "same line"
                return yDiff;
            }
            
            // If on same line, sort left to right
            return bboxA.x - bboxB.x;
        })
        .map(region => region.id);
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

/**
 * Parse METS XML to extract document structure information
 * @param {string} xmlString - The METS XML string
 * @return {object} Parsed document structure
 */
function parseMetsXML(xmlString) {
    // Use the browser's built-in DOMParser
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, "text/xml");
    
    // Check for parsing errors
    const parserError = xmlDoc.querySelector('parsererror');
    if (parserError) {
        throw new Error('XML parsing error: ' + parserError.textContent);
    }
    
    try {
        // Extract basic collection information
        const collection = extractCollectionInfo(xmlDoc);
        
        // Extract file information
        const files = extractFileInfo(xmlDoc);
        
        // Extract structure map
        const structureMap = extractStructureMap(xmlDoc);
        
        return {
            collection,
            files,
            structureMap
        };
    } catch (error) {
        console.error('Error parsing METS XML:', error);
        throw new Error('Failed to parse document structure: ' + error.message);
    }
}

/**
 * Extract collection information from METS XML
 * @param {Document} xmlDoc - The parsed XML document
 * @return {object} Collection information
 */
function extractCollectionInfo(xmlDoc) {
    const collection = {
        title: '',
        id: '',
        description: ''
    };
    
    // Extract from dmdSec if available
    const dmdSec = xmlDoc.querySelector('dmdSec');
    if (dmdSec) {
        const titleElem = dmdSec.querySelector('title');
        if (titleElem) {
            collection.title = titleElem.textContent;
        }
        
        const idElem = dmdSec.querySelector('identifier');
        if (idElem) {
            collection.id = idElem.textContent;
        }
        
        const descElem = dmdSec.querySelector('description');
        if (descElem) {
            collection.description = descElem.textContent;
        }
    }
    
    // Try extracting from metsHdr if dmdSec is not available
    if (!collection.title) {
        const metsHdr = xmlDoc.querySelector('metsHdr');
        if (metsHdr) {
            const agentElem = metsHdr.querySelector('agent[ROLE="CREATOR"] name');
            if (agentElem) {
                collection.creator = agentElem.textContent;
            }
        }
    }
    
    return collection;
}

/**
 * Extract file information from METS XML
 * @param {Document} xmlDoc - The parsed XML document
 * @return {object} File information
 */
function extractFileInfo(xmlDoc) {
    const files = {
        images: [],
        xmlFiles: []
    };
    
    // Get all file elements
    const fileElems = xmlDoc.querySelectorAll('file');
    
    fileElems.forEach(file => {
        const fileId = file.getAttribute('ID');
        const mimeType = file.getAttribute('MIMETYPE');
        
        // Get FLocat element
        const flocat = file.querySelector('FLocat');
        if (!flocat) return;
        
        const fileHref = flocat.getAttribute('xlink:href') || flocat.getAttribute('href');
        if (!fileHref) return;
        
        // Determine file type based on mimetype or extension
        if (mimeType && mimeType.includes('image')) {
            files.images.push({
                id: fileId,
                path: fileHref,
                mimeType: mimeType
            });
        } else if (fileHref.toLowerCase().endsWith('.xml')) {
            files.xmlFiles.push({
                id: fileId,
                path: fileHref,
                mimeType: mimeType
            });
        }
    });
    
    return files;
}

/**
 * Extract structure map from METS XML
 * @param {Document} xmlDoc - The parsed XML document
 * @return {Array} Structure map
 */
function extractStructureMap(xmlDoc) {
    const structMap = [];
    
    // Get all div elements in the structMap
    const divElems = xmlDoc.querySelectorAll('structMap div');
    
    divElems.forEach(div => {
        const order = div.getAttribute('ORDER');
        const label = div.getAttribute('LABEL');
        const type = div.getAttribute('TYPE');
        
        // Get file pointers
        const fptrs = div.querySelectorAll('fptr');
        const fileIds = Array.from(fptrs).map(fptr => fptr.getAttribute('FILEID'));
        
        structMap.push({
            order: order ? parseInt(order, 10) : null,
            label,
            type,
            fileIds
        });
    });
    
    // Sort by order if available
    return structMap.sort((a, b) => {
        if (a.order !== null && b.order !== null) {
            return a.order - b.order;
        }
        return 0;
    });
}

/**
 * Parse metadata.xml to extract collection information
 * @param {string} xmlString - The metadata XML string
 * @return {object} Parsed collection metadata
 */
function parseMetadataXML(xmlString) {
    // Use the browser's built-in DOMParser
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, "text/xml");
    
    // Check for parsing errors
    const parserError = xmlDoc.querySelector('parsererror');
    if (parserError) {
        throw new Error('XML parsing error: ' + parserError.textContent);
    }
    
    // Initialize empty metadata object
    const metadata = {
        title: '',
        id: '',
        uploader: '',
        uploadTime: '',
        pageCount: 0,
        collectionId: '',
        collectionName: ''
    };
    
    // Extract data from metadata elements
    try {
        const titleElem = xmlDoc.querySelector('title');
        if (titleElem) {
            metadata.title = titleElem.textContent;
        }
        
        const docIdElem = xmlDoc.querySelector('docId');
        if (docIdElem) {
            metadata.id = docIdElem.textContent;
        }
        
        const uploaderElem = xmlDoc.querySelector('uploader');
        if (uploaderElem) {
            metadata.uploader = uploaderElem.textContent;
        }
        
        const uploadTimeElem = xmlDoc.querySelector('uploadTimestamp');
        if (uploadTimeElem) {
            metadata.uploadTime = uploadTimeElem.textContent;
        }
        
        const pageCountElem = xmlDoc.querySelector('nrOfPages');
        if (pageCountElem) {
            metadata.pageCount = parseInt(pageCountElem.textContent, 10);
        }
        
        const colIdElem = xmlDoc.querySelector('colId');
        if (colIdElem) {
            metadata.collectionId = colIdElem.textContent;
        }
        
        const colNameElem = xmlDoc.querySelector('colName');
        if (colNameElem) {
            metadata.collectionName = colNameElem.textContent;
        }
    } catch (error) {
        console.error('Error parsing metadata XML:', error);
    }
    
    return metadata;
}

// Export the functions that need to be accessed by other modules
export {
    parsePageXML,
    parseMetsXML,
    parseMetadataXML,
    calculateBoundingBox,
    extractPoints
};