// app.js

// --- CORRECTED IMPORT ---
import { createOverviewChart, displayCategoryDetails } from './visualizations.js';
// --- END CORRECTED IMPORT ---

// --- Configuration ---
const LIVE_HOSTNAME = 'stefanzweig.digital';
const IS_LIVE_ENVIRONMENT = window.location.hostname === LIVE_HOSTNAME;
const API_HOST = 'https://stefanzweig.digital';

const DATA_SOURCES_PATHS = {
    werke: '/o:szd.werke/TEI_SOURCE',
    lebensdokumente: '/o:szd.lebensdokumente/TEI_SOURCE',
    korrespondenzen: '/o:szd.korrespondenzen/TEI_SOURCE',
    autographen: '/o:szd.autographen/TEI_SOURCE',
    bibliothek: '/o:szd.bibliothek/TEI_SOURCE',
    lebenskalender: '/o:szd.lebenskalender/TEI_SOURCE',
    personen: '/o:szd.personen/TEI_SOURCE',
    standorte: '/o:szd.standorte/TEI_SOURCE',
    werkindex: '/o:szd.werkindex/TEI_SOURCE',
};

const DATA_SOURCES_CONFIG = {
    werke: { mainElement: 'biblFull', listElement: 'listBibl', idPrefix: 'SZDMSK', details: ['topTerms', 'topElements'] },
    lebensdokumente: { mainElement: 'biblFull', listElement: 'listBibl', idPrefix: 'SZDLEB', details: ['topTerms', 'topMaterials', 'topElements'] },
    korrespondenzen: { mainElement: 'biblFull', listElement: 'listBibl', idPrefix: 'SZDKOR', details: ['topPeople', 'topElements'] },
    autographen: { mainElement: 'biblFull', listElement: 'listBibl', idPrefix: 'SZDAUT', details: ['dateRange', 'topPlaces', 'topOrgs', 'topElements'] },
    bibliothek: { mainElement: 'biblFull', listElement: 'listBibl', idPrefix: 'SZDBIB', details: ['topTerms', 'topLangs', 'topElements'] },
    lebenskalender: { mainElement: 'event', listElement: 'listEvent', idPrefix: 'SZDBIO', details: ['dateRange', 'topElements'] },
    personen: { mainElement: 'person', listElement: 'listPerson', idPrefix: 'SZDPER', details: ['topElements'] },
    standorte: { mainElement: 'org', listElement: 'listOrg', idPrefix: 'SZDSTA', details: ['topElements'] }, // Assuming listOrg
    werkindex: { mainElement: 'bibl', listElement: 'listBibl', idPrefix: 'SZDWRK', details: ['topLangs', 'topElements'] }, // Removed topTerms
};

const TEI_NAMESPACE = 'http://www.tei-c.org/ns/1.0';
const XML_NAMESPACE = 'http://www.w3.org/XML/1998/namespace'; // Namespace URI for xml: prefix
const MAX_FREQ_ITEMS = 5; // Max items to show in frequency lists

// --- State Variable ---
let allProcessedData = []; // To store the fetched and processed data

// --- DOM References ---
const loadingIndicator = document.getElementById('loading-indicator');
const dashboardContent = document.getElementById('dashboard-content');
const filterControlsContainer = document.getElementById('filter-controls');
const categoryDetailsContainer = document.getElementById('category-details-container');
const overviewChartCanvasId = 'overview-chart';
const timeLocationElement = document.getElementById('current-time-location');

// --- Data Fetching & Processing Functions ---
/**
 * Fetches and parses TEI XML from a given full URL.
 */
async function fetchAndParseTEIXML(fullUrl) {
    // console.log("Fetching:", fullUrl); // Optional: Keep for debugging
    try {
        const response = await fetch(fullUrl);
        if (!response.ok) {
            // Log CORS hint specifically for development fetch issues
             if (!IS_LIVE_ENVIRONMENT && response.status === 0) {
                 console.error(`Workspace failed for ${fullUrl} with status 0. Possible CORS issue. Ensure CORS workaround is active.`);
             }
            throw new Error(`HTTP error ${response.status} (${response.statusText || 'Network error'}) fetching ${fullUrl}`);
        }
        const xmlText = await response.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, "application/xml");
        const parseError = xmlDoc.querySelector("parsererror");
        if (parseError) {
             console.error(`XML Parse Error in ${fullUrl}:`, parseError.textContent);
            throw new Error(`XML parsing error in ${fullUrl}`);
        }
        if (!xmlDoc.documentElement) {
            throw new Error(`No document element found after parsing ${fullUrl}`);
        }
        return xmlDoc;
    } catch (error) {
        console.error(`Workspace/Parse Error for ${fullUrl}:`, error);
        // Propagate the error to be handled by Promise.allSettled
        throw error;
    }
}

/** Namespace resolver */
function nsResolver(prefix) {
    if (prefix === 'tei') return TEI_NAMESPACE;
    if (prefix === 'xml') return XML_NAMESPACE;
    return null;
}

/** Evaluate XPath */
function evaluateXPath(xmlDoc, xpathExpression, resultType) {
     if (!xmlDoc || !(xmlDoc instanceof Document) || typeof xmlDoc.evaluate !== 'function') {
        // console.warn(`Invalid xmlDoc for XPath: ${xpathExpression}`); // Reduce noise
        return null;
     }
     try {
        const result = xmlDoc.evaluate(xpathExpression, xmlDoc, nsResolver, resultType, null);
         // Optional: Add minimal validation if needed, e.g., for number type
         // if (resultType === XPathResult.NUMBER_TYPE && typeof result.numberValue !== 'number') { console.warn(...) }
        return result;
     } catch (xpathError) {
        // Log specific errors like namespace issues if they occur
        console.error(`XPath error evaluating '${xpathExpression}':`, xpathError.message);
        return null;
     }
}

/** Get Top Frequencies */
function getTopFrequencies(items, property = 'textContent', limit = MAX_FREQ_ITEMS) {
    const frequencies = {};
    if (!items || items.length === 0) return [];
    for (let i = 0; i < items.length; i++) {
        const item = items[i]; let value = '';
        if (!item) continue;
        // Determine value based on property and item type
        if (property === 'self') { value = (item.value || item.textContent || item).toString().trim(); }
        else if (item instanceof Element) {
            if (property === 'textContent') value = item.textContent?.trim();
            else if (property === 'localName') value = item.localName;
            else value = item.getAttribute(property)?.trim();
        } else if (property === 'localName' && item.nodeType === Node.ELEMENT_NODE) { value = item.localName; } // Fallback
        // Normalize and count
        if (value) { const norm = value.replace(/\s+/g, ' ').trim(); if (norm) frequencies[norm] = (frequencies[norm] || 0) + 1; }
    }
    return Object.entries(frequencies).map(([item, count]) => ({ item, count })).sort((a, b) => b.count - a.count).slice(0, limit);
}

/** Extract Date Range */
function extractDateRange(xmlDoc, basePath = "//tei:body") {
    const snap = evaluateXPath(xmlDoc, `${basePath}//tei:date[@when or @from or @to or @notBefore or @notAfter]`, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE);
    if (!snap || snap.snapshotLength === 0) return null;
    let min = Infinity, max = -Infinity, found = false;
    const getYear = s => s ? parseInt((s.match(/^\d{4}/) || [])[0], 10) : NaN; // Safer year extraction
    for (let i = 0; i < snap.snapshotLength; i++) {
        const n = snap.snapshotItem(i);
        [n.getAttribute('when'), n.getAttribute('from'), n.getAttribute('notBefore'), n.getAttribute('to'), n.getAttribute('notAfter')]
            .filter(Boolean).forEach(d => { const y = getYear(d); if (!isNaN(y)) { min = Math.min(min, y); max = Math.max(max, y); found = true; } });
    }
    return found ? (min === max ? `${min}` : `${min} – ${max}`) : null;
}

/** Process Category Data */
function processCategoryData(xmlDoc, categoryKey, config) {
    const result = { count: 0, details: {} };
    const mainElement = config.mainElement;
    const listElement = config.listElement || 'body'; // Use body if listElement not defined
    const entryBasePath = `//tei:${listElement}/tei:${mainElement}`;
    const countResult = evaluateXPath(xmlDoc, `count(${entryBasePath})`, XPathResult.NUMBER_TYPE);

    // Ensure count is a valid number before proceeding
    if (countResult && typeof countResult.numberValue === 'number' && countResult.numberValue > 0) {
         result.count = countResult.numberValue;
    } else {
         // console.log(`-> ${categoryKey}: Count = 0 or failed. Skipping detail extraction.`); // Optional log
         return result; // Exit if count is 0 or failed
    }

    const detailsToExtract = config.details || [];
    let snap, arr; // Use shorter names for snapshots/arrays

    // console.log(`--- Processing details for: ${categoryKey} (Count: ${result.count}) ---`); // Optional detail log

    try {
        // Detail Extraction Logic (using safer checks for snapshot results)
        if (detailsToExtract.includes('dateRange')) {
             result.details.dateRange = extractDateRange(xmlDoc, "//tei:body");
             // if(result.details.dateRange) console.log(`   Date Range: ${result.details.dateRange}`); // Optional
        }
        if (detailsToExtract.includes('topTerms')) {
            snap = evaluateXPath(xmlDoc, `${entryBasePath}//tei:term`, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE);
            if (snap?.snapshotLength > 0) { arr = Array.from({ length: snap.snapshotLength }, (_, i) => snap.snapshotItem(i)); result.details.topTerms = getTopFrequencies(arr, 'textContent'); /*if(result.details.topTerms?.length) console.log(`   Top Terms:`, result.details.topTerms);*/ }
        }
        if (detailsToExtract.includes('topMaterials')) {
             snap = evaluateXPath(xmlDoc, `${entryBasePath}//tei:material`, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE);
             if (snap?.snapshotLength > 0) { arr = Array.from({ length: snap.snapshotLength }, (_, i) => snap.snapshotItem(i)); result.details.topMaterials = getTopFrequencies(arr, 'textContent'); /*if(result.details.topMaterials?.length) console.log(`   Top Materials:`, result.details.topMaterials);*/ }
        }
         if (detailsToExtract.includes('topPeople')) {
             // More robust XPath for people, trying to avoid double counting if possible
             snap = evaluateXPath(xmlDoc, `${entryBasePath}//tei:author/tei:persName | ${entryBasePath}//tei:correspAction//tei:persName`, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE);
              if (snap?.snapshotLength > 0) { arr = Array.from({ length: snap.snapshotLength }, (_, i) => snap.snapshotItem(i)); result.details.topPeople = getTopFrequencies(arr, 'textContent'); /*if(result.details.topPeople?.length) console.log(`   Top People:`, result.details.topPeople);*/ }
         }
          if (detailsToExtract.includes('topPlaces')) {
              // Combine different place elements
              snap = evaluateXPath(xmlDoc, `${entryBasePath}//tei:placeName | ${entryBasePath}//tei:settlement | ${entryBasePath}//tei:country | ${entryBasePath}//tei:origPlace`, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE);
              if (snap?.snapshotLength > 0) { arr = Array.from({ length: snap.snapshotLength }, (_, i) => snap.snapshotItem(i)); result.details.topPlaces = getTopFrequencies(arr, 'textContent'); /*if(result.details.topPlaces?.length) console.log(`   Top Places:`, result.details.topPlaces);*/ }
          }
          if (detailsToExtract.includes('topOrgs')) {
              // Combine different organization elements
              snap = evaluateXPath(xmlDoc, `${entryBasePath}//tei:orgName | ${entryBasePath}//tei:repository | ${entryBasePath}//tei:publisher`, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE);
              if (snap?.snapshotLength > 0) { arr = Array.from({ length: snap.snapshotLength }, (_, i) => snap.snapshotItem(i)); result.details.topOrgs = getTopFrequencies(arr, 'textContent'); /*if(result.details.topOrgs?.length) console.log(`   Top Orgs:`, result.details.topOrgs);*/ }
          }
         if (detailsToExtract.includes('topLangs')) {
            let allLangs = []; let attrSnap, txtSnap, attrArr, txtArr;
            // Check multiple patterns for language specification
            const xpathsAttrs = [ `//tei:textLang/@mainLang`, `//tei:lang/@ident`, `//tei:textLang/tei:lang/@xml:lang` ];
            xpathsAttrs.forEach(xp => { attrSnap = evaluateXPath(xmlDoc, xp, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE); if(attrSnap) { attrArr = Array.from({ length: attrSnap.snapshotLength }, (_, i) => attrSnap.snapshotItem(i)); allLangs = allLangs.concat(attrArr.map(a => a?.value)); } });
            // Check for simple <lang>ger</lang> style within entries
            txtSnap = evaluateXPath(xmlDoc, `${entryBasePath}/tei:lang[not(@*)] | ${entryBasePath}//tei:textLang[not(@*)]`, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE);
             if (txtSnap) { txtArr = Array.from({ length: txtSnap.snapshotLength }, (_, i) => txtSnap.snapshotItem(i)); allLangs = allLangs.concat(txtArr.map(n => n?.textContent?.trim()).filter(Boolean)); }
             // Process collected language codes
             const filteredLangs = allLangs.filter(l => l && l.trim() !== ''); if(filteredLangs.length > 0) { result.details.topLangs = getTopFrequencies(filteredLangs, 'self'); /*if(result.details.topLangs?.length) console.log(`   Top Langs:`, result.details.topLangs);*/ }
         }
         if (detailsToExtract.includes('topElements')) {
             // Get all descendant elements within the main entry elements
             snap = evaluateXPath(xmlDoc, `${entryBasePath}//*`, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE);
              if (snap?.snapshotLength > 0) { arr = Array.from({ length: snap.snapshotLength }, (_, i) => snap.snapshotItem(i)); result.details.topElements = getTopFrequencies(arr, 'localName'); /*if(result.details.topElements?.length) console.log(`   Top Elements:`, result.details.topElements);*/ }
         }
    } catch (detailError) {
         // Log specific errors during detail extraction, but don't stop processing other categories
         console.error(`Detail extraction error for ${categoryKey}:`, detailError);
         // Optionally add the error to the result object: result.details.error = detailError.message;
    } finally {
        // console.log(`--- Finished details for: ${categoryKey} ---`); // Optional
    }
    return result;
}


// --- UI Update Functions ---

/** Populates filter checkboxes */
function setupFilters(categories) {
    // Ensure container is valid before proceeding
     if (!filterControlsContainer) {
         console.error("Filter controls container not found.");
         return;
     }
    filterControlsContainer.innerHTML = ''; // Clear previous controls

     // "Select All" Checkbox
    const allLabel = document.createElement('label');
    const allInput = document.createElement('input');
    allInput.type = 'checkbox';
    allInput.id = 'filter-all';
    allInput.checked = true; // Start with all selected
    allInput.addEventListener('change', handleFilterChange);
    allLabel.appendChild(allInput);
    allLabel.appendChild(document.createTextNode(' Select/Deselect All'));
    filterControlsContainer.appendChild(allLabel);
    filterControlsContainer.appendChild(document.createElement('hr'));

    // Create checkboxes for each category
    categories.forEach(cat => {
        const label = document.createElement('label');
        const input = document.createElement('input');
        input.type = 'checkbox';
        input.value = cat.key;
        input.id = `filter-${cat.key}`;
        input.checked = true;
        input.classList.add('category-filter');
        input.addEventListener('change', handleFilterChange);
        label.appendChild(input);
        label.appendChild(document.createTextNode(` ${cat.key.charAt(0).toUpperCase() + cat.key.slice(1)}`)); // Capitalize label
        filterControlsContainer.appendChild(label);
    });
}

/** Handles filter changes and updates the dashboard */
function handleFilterChange(event) {
     // Ensure the container is available
     if (!filterControlsContainer) return;

    const allCheckbox = document.getElementById('filter-all');
    const categoryCheckboxes = filterControlsContainer.querySelectorAll('.category-filter');

    // Check if 'Select All' checkbox triggered the event
    const isSelectAllEvent = event?.target?.id === 'filter-all';

    // Handle "Select All" interaction
    if (isSelectAllEvent && allCheckbox) {
        // If 'Select All' was clicked, set all others to match its state
        categoryCheckboxes.forEach(cb => cb.checked = allCheckbox.checked);
    } else if (allCheckbox) {
        // Otherwise (an individual checkbox changed), update 'Select All' state
        const allChecked = Array.from(categoryCheckboxes).every(cb => cb.checked);
        allCheckbox.checked = allChecked;
    }

    // Get selected categories
    const selectedKeys = Array.from(categoryCheckboxes)
                             .filter(cb => cb.checked)
                             .map(cb => cb.value);

    // Filter the stored data
    const filteredData = allProcessedData.filter(item => selectedKeys.includes(item.key));

    // Update Overview Chart
     if (document.getElementById(overviewChartCanvasId)) {
        createOverviewChart(overviewChartCanvasId, filteredData);
     }

    // Update Detail Views (Show/Hide using style.display)
    allProcessedData.forEach(item => {
        const detailCard = document.getElementById(`detail-${item.key}`);
        if (detailCard) {
            detailCard.style.display = selectedKeys.includes(item.key) ? '' : 'none';
        }
    });
}

/** Updates the time and location in the footer using provided context */
function updateTimeLocation() {
     if (timeLocationElement) {
        // Use the specific time and location provided in the context
         const providedTime = "Sunday, April 6, 2025 at 7:25:38 PM CEST"; // Updated time
         const providedLocation = "Graz, Styria, Austria";
         timeLocationElement.textContent = `Context: ${providedTime}. Location: ${providedLocation}.`;
     }
}

// --- Application Initialization Function ---

async function initializeDashboard() {
    console.log("Initializing visual dashboard...");
    // Ensure essential elements exist before proceeding
     if (!loadingIndicator || !dashboardContent || !categoryDetailsContainer || !filterControlsContainer) {
         console.error("One or more essential dashboard elements are missing in the HTML.");
         if(loadingIndicator) loadingIndicator.textContent = 'Error: Dashboard HTML structure incomplete.';
         return; // Stop initialization
     }

    loadingIndicator.style.display = 'block';
    dashboardContent.style.display = 'none';
    categoryDetailsContainer.innerHTML = ''; // Clear details container

    updateTimeLocation(); // Set time/location initially

    const categoryFetchPromises = Object.entries(DATA_SOURCES_PATHS).map(async ([key, path]) => {
        const fullUrl = `${API_HOST}${path}`;
        const config = DATA_SOURCES_CONFIG[key];
        if (!config) {
             console.warn(`Configuration missing for category: ${key}`);
             // Provide a structured error result
             return { key, resultData: { error: `Configuration missing`, count: 0, details: {} } };
         }

        try {
            const xmlDoc = await fetchAndParseTEIXML(fullUrl);
            const resultData = processCategoryData(xmlDoc, key, config);
             // Log summary AFTER processing details
             // console.log(`-> Summary for ${key}: Count = ${resultData.count}, Details Extracted Keys:`, Object.keys(resultData.details || {}).join(', ') || 'None');
            return { key, resultData };
        } catch (error) {
            // Catch errors from fetch/parse or initial processing steps
            console.error(`Failed to load or process category '${key}': ${error.message}`);
            // Return a structured error result
            return { key, resultData: { error: `Failed to load/process: ${error.message}`, count: 0, details: {} } };
        }
    });

    // Wait for all promises to settle (either fulfill or reject)
    const results = await Promise.allSettled(categoryFetchPromises);

    // Process the results, filtering out failures but keeping track of them
    allProcessedData = []; // Reset global data
    const failedSourcesInfo = [];
    results.forEach(result => {
        if (result.status === 'fulfilled' && result.value) {
            allProcessedData.push(result.value);
        } else if (result.status === 'rejected') {
             // Try to get the key from the error or context if possible, otherwise log generically
             console.error("A data source promise was rejected:", result.reason);
             failedSourcesInfo.push(`Unknown source failed: ${result.reason?.message || 'Unknown reason'}`);
        } else if (result.status === 'fulfilled' && result.value && result.value.resultData.error) {
            // Handle errors reported within the resultData structure
             console.warn(`Processed category ${result.value.key} reported an error: ${result.value.resultData.error}`);
             // Include it in the processed data so an error card can be shown
             allProcessedData.push(result.value);
             failedSourcesInfo.push(`${result.value.key}: ${result.value.resultData.error}`);
        }
    });

    // Sort the successfully processed data alphabetically by key
    allProcessedData.sort((a, b) => a.key.localeCompare(b.key));

    // Inform user if some data failed
    if (failedSourcesInfo.length > 0) {
        console.error("Some data sources failed to load or process fully:", failedSourcesInfo);
        // Optionally, display a persistent warning to the user in the UI
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error';
        errorDiv.innerHTML = `<strong>Warning:</strong> Some data could not be loaded or processed. Results may be incomplete.<br>Details: ${failedSourcesInfo.join('; ')}`;
        dashboardContent.parentNode.insertBefore(errorDiv, dashboardContent); // Insert before main content
    }

    // Check if any data was successfully processed before setting up UI
    if (allProcessedData.length === 0) {
         loadingIndicator.textContent = 'Error: No data could be successfully processed.';
         // Hide the main content area if nothing loaded
         dashboardContent.style.display = 'none';
         return; // Stop if no data processed
    }

    // --- Setup UI with processed data ---
    setupFilters(allProcessedData); // Populate filters based on successfully processed keys

    // Create the overview chart with initially available data
    createOverviewChart(overviewChartCanvasId, allProcessedData);

    // Create detail cards for each category (including those with errors)
    categoryDetailsContainer.innerHTML = ''; // Clear again just in case
    allProcessedData.forEach(item => {
        displayCategoryDetails(item, categoryDetailsContainer); // Pass the container element
    });

    // Initial filter application (show all initially)
    handleFilterChange(); // Call once to set initial visibility based on checked filters

    // Hide loading, show content
    loadingIndicator.style.display = 'none';
    dashboardContent.style.display = 'block';

    console.log("Visual dashboard initialized.");
}

// --- Start the application ---
document.addEventListener('DOMContentLoaded', initializeDashboard);