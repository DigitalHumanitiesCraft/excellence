// --- Configuration ---
const DATA_SOURCES = {
    werke: { url: 'https://stefanzweig.digital/o:szd.werke/TEI_SOURCE', mainElement: 'biblFull', idPrefix: 'SZDMSK' },
    lebensdokumente: { url: 'https://stefanzweig.digital/o:szd.lebensdokumente/TEI_SOURCE', mainElement: 'biblFull', idPrefix: 'SZDLEB' },
    korrespondenzen: { url: 'https://stefanzweig.digital/o:szd.korrespondenzen/TEI_SOURCE', mainElement: 'biblFull', idPrefix: 'SZDKOR' },
    autographen: { url: 'https://stefanzweig.digital/o:szd.autographen/TEI_SOURCE', mainElement: 'biblFull', idPrefix: 'SZDAUT' },
    bibliothek: { url: 'https://stefanzweig.digital/o:szd.bibliothek/TEI_SOURCE', mainElement: 'biblFull', idPrefix: 'SZDBIB' },
    lebenskalender: { url: 'https://stefanzweig.digital/o:szd.lebenskalender/TEI_SOURCE', mainElement: 'event', idPrefix: 'SZDBIO' },
    personen: { url: 'https://stefanzweig.digital/o:szd.personen/TEI_SOURCE', mainElement: 'person', idPrefix: 'SZDPER' },
    standorte: { url: 'https://stefanzweig.digital/o:szd.standorte/TEI_SOURCE', mainElement: 'org', idPrefix: 'SZDSTA' },
};
const TEI_NAMESPACE = 'http://www.tei-c.org/ns/1.0';

// --- UI Rendering ---
const dashboardContainer = document.getElementById('dashboard-container');
const loadingIndicator = document.getElementById('loading-indicator');

function displayError(message) {
    if (dashboardContainer) {
        dashboardContainer.innerHTML = `<p class="error">Error: ${message}</p>`;
    }
    console.error(message);
}

function clearLoading() {
    if (loadingIndicator) {
        loadingIndicator.remove();
    }
    if (dashboardContainer) {
         // Clear any previous content (like errors) before adding new summaries
         dashboardContainer.innerHTML = '';
    }
}

/**
 * Renders a simple summary for a loaded data category.
 * @param {string} categoryKey - The key for the category (e.g., 'werke').
 * @param {object} data - Processed data for the category (e.g., { count: 352 }).
 */
function renderCategorySummary(categoryKey, data) {
    if (!dashboardContainer) return;

    const summaryDiv = document.createElement('div');
    summaryDiv.className = 'category-summary';

    const title = document.createElement('h2');
    title.textContent = categoryKey.charAt(0).toUpperCase() + categoryKey.slice(1); // Capitalize category name
    summaryDiv.appendChild(title);

    if (data.error) {
        const errorMsg = document.createElement('p');
        errorMsg.className = 'error';
        errorMsg.textContent = `Could not load data: ${data.error}`;
        summaryDiv.appendChild(errorMsg);
    } else {
        const countPara = document.createElement('p');
        countPara.textContent = `Number of entries (${DATA_SOURCES[categoryKey]?.mainElement || 'items'}): ${data.count ?? 'N/A'}`;
        summaryDiv.appendChild(countPara);

        // Add more details here later as needed
        // Example: Most frequent terms, date ranges, etc.
    }

    dashboardContainer.appendChild(summaryDiv);
}

// --- Data Fetching & Processing ---

/**
 * Fetches and parses TEI XML from a given URL.
 * Handles the TEI namespace.
 * @param {string} url - The URL to fetch XML from.
 * @returns {Promise<Document>} - A Promise resolving to the parsed XML Document.
 * @throws {Error} If fetching or parsing fails.
 */
async function fetchAndParseTEIXML(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error ${response.status} fetching ${url}`);
        }
        const xmlText = await response.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, "application/xml");

        // Standard check for parser errors
        const parseError = xmlDoc.querySelector("parsererror");
        if (parseError) {
            console.error("XML Parse Error:", parseError.textContent);
            throw new Error(`XML parsing error in file from ${url}`);
        }
        return xmlDoc;
    } catch (error) {
        console.error(`Failed to fetch or parse ${url}:`, error);
        throw error; // Re-throw to be caught by the caller
    }
}

/**
 * Extracts a simple count of main elements for a category.
 * Uses XPath and handles the TEI namespace.
 * @param {Document} xmlDoc - The parsed XML document.
 * @param {string} mainElement - The tag name of the main elements to count (e.g., 'biblFull').
 * @returns {number} - The count of elements found.
 */
function extractEntryCount(xmlDoc, mainElement) {
    if (!xmlDoc || !mainElement) return 0;

    // Namespace resolver function for XPath
    const nsResolver = (prefix) => (prefix === 'tei' ? TEI_NAMESPACE : null);

    try {
        const countResult = xmlDoc.evaluate(
            `count(//tei:${mainElement})`, // XPath expression to count elements
            xmlDoc,                       // Context node
            nsResolver,                   // Namespace resolver
            XPathResult.NUMBER_TYPE,      // Expected result type
            null                          // Existing result object (not needed)
        );
        return countResult.numberValue;
    } catch (xpathError) {
        console.error(`XPath error counting tei:${mainElement}:`, xpathError);
        return 0; // Return 0 if XPath fails
    }
}


// --- Application Initialization ---

/**
 * Main function to initialize the dashboard.
 * Fetches data for all categories and renders summaries.
 */
async function initializeDashboard() {
    console.log("Initializing dashboard...");
    if (!dashboardContainer) {
        console.error("Dashboard container element not found in HTML.");
        return;
    }

    const categoryPromises = Object.entries(DATA_SOURCES).map(async ([key, config]) => {
        console.log(`Workspaceing data for: ${key}`);
        try {
            const xmlDoc = await fetchAndParseTEIXML(config.url);
            const count = extractEntryCount(xmlDoc, config.mainElement);
            console.log(` -> ${key}: Found ${count} entries.`);
            // For now, just return the count. Later, extract more complex data here.
            return { key, data: { count } };
        } catch (error) {
            console.warn(`Failed to load category '${key}':`, error.message);
            // Return an error state for this category
            return { key, data: { error: error.message } };
        }
    });

    // Wait for all fetches to complete (or fail)
    const results = await Promise.all(categoryPromises);

    // Clear the loading indicator
    clearLoading();

    // Render summaries for each category
    results.forEach(result => {
        renderCategorySummary(result.key, result.data);
    });

    console.log("Dashboard initialized.");
}

// --- Start the application ---
// Use DOMContentLoaded to ensure the HTML is fully loaded before running the script
document.addEventListener('DOMContentLoaded', initializeDashboard);