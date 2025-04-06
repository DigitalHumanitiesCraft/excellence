# Stefan Zweig Digital - Visual Dashboard

**Version:** 1.0 (as of April 6, 2025)
**Context:** Developed based on requirements and iterations provided up to Sunday, April 6, 2025 at 7:27:58 PM CEST (Location: Graz, Styria, Austria).

## 1. Project Overview

This project is a client-side web application that fetches, processes, and visualizes summarized data from the [Stefan Zweig Digital](https://stefanzweig.digital/) project archive. It provides users with:

1.  An **overview** of the number of entries across different archival collections (Werke, Lebensdokumente, Korrespondenzen, etc.).
2.  **Detailed views** for each collection, showing extracted metadata like date ranges, top terms, top people, top locations, top organizations, top languages, top materials, and the most frequent XML elements used within the entries.
3.  **Interactive filtering** to select which categories are displayed in the overview and detail sections.
4.  **Information visualizations** (bar charts) generated using Chart.js to represent the summarized data, instead of plain text lists.

The application performs all data fetching and processing directly in the user's web browser.

## 2. Technology Stack

* **Frontend:**
    * HTML5
    * CSS3 (Basic styling embedded in HTML, can be moved to `style.css`)
    * JavaScript (ES Modules)
* **Libraries:**
    * [Chart.js](https://www.chartjs.org/) (v4.x - Loaded via CDN): Used for creating bar charts.
* **Browser APIs:**
    * Fetch API: For retrieving data from the SZD endpoints.
    * DOMParser API: For parsing the fetched TEI XML strings.
    * XPath API (`document.evaluate`): For querying data within the parsed XML documents.
    * Intl API (`Intl.DateTimeFormat`): Used for formatting the context date/time display.
* **Data Format:**
    * TEI XML (P5): The source data format provided by the Stefan Zweig Digital project.

## 3. Project Structure

The project consists of the following files:

* **`index.html`**: The main HTML file providing the structure for the dashboard, including containers for charts and controls. It includes the Chart.js library via CDN and the project's JavaScript modules. Contains basic CSS via `<style>` tags.
* **`app.js`**: The main application logic file (ES Module). It handles:
    * Initialization (`initializeDashboard`).
    * Data fetching and parsing (`WorkspaceAndParseTEIXML`).
    * Coordinating data processing (`processCategoryData`).
    * Managing application state (storing fetched data).
    * Setting up UI elements (filters - `setupFilters`).
    * Handling user interactions (filtering - `handleFilterChange`).
    * Calling visualization functions from `visualizations.js`.
    * Updating context time/location display (`updateTimeLocation`).
* **`visualizations.js`**: A dedicated ES Module for creating and managing visualizations using Chart.js. It includes:
    * `createOverviewChart`: Creates the main category count bar chart.
    * `createDetailChart`: Creates horizontal bar charts for Top N lists within category details.
    * `displayCategoryDetails`: Generates the HTML structure for each category's detail card and populates it with text info and detail charts.
    * Internal helper functions (`destroyChart`, `generateColors`).
* **`style.css` (Optional)**: Can be created to externalize and expand upon the CSS styling.

## 4. Data Source

The dashboard fetches data directly from the TEI XML source endpoints provided by the Stefan Zweig Digital project hosted on GAMS (Geisteswissenschaftliches Asset Management System) at the University of Graz.

* **Base API Host:** `https://stefanzweig.digital` (Configured in `app.js: API_HOST`)
* **Endpoints Used:** (Configured in `app.js: DATA_SOURCES_PATHS`)
    * `/o:szd.werke/TEI_SOURCE`
    * `/o:szd.lebensdokumente/TEI_SOURCE`
    * `/o:szd.korrespondenzen/TEI_SOURCE`
    * `/o:szd.autographen/TEI_SOURCE`
    * `/o:szd.bibliothek/TEI_SOURCE`
    * `/o:szd.lebenskalender/TEI_SOURCE`
    * `/o:szd.personen/TEI_SOURCE`
    * `/o:szd.standorte/TEI_SOURCE`
    * `/o:szd.werkindex/TEI_SOURCE`
* **XML Namespace:** All TEI files use the namespace `http://www.tei-c.org/ns/1.0`. The `nsResolver` function in `app.js` handles this (and the `xml:` namespace) for XPath queries.

## 5. Setup and Running

1.  **Prerequisites:**
    * A modern web browser that supports ES Modules, Fetch API, DOMParser, and XPath evaluation.
    * **For Local Development:** A CORS (Cross-Origin Resource Sharing) browser extension (like "Allow CORS" for Chrome/Firefox) OR serving the files from a local web server. This is necessary because the web page (served locally, e.g., from `file:///` or `http://localhost`) tries to fetch data from a different domain (`https://stefanzweig.digital`), which browsers block by default due to the Same-Origin Policy. The code includes a check (`IS_LIVE_ENVIRONMENT`) and warns about this in the console during development.
2.  **Installation:**
    * Save the three provided files (`index.html`, `app.js`, `visualizations.js`) into the same directory on your computer.
3.  **Running:**
    * **Method A (Simple, requires CORS extension):** Open the `index.html` file directly in your web browser. Make sure your CORS browser extension is enabled and configured to allow requests to `https://stefanzweig.digital`.
    * **Method B (Recommended, might avoid *some* CORS issues):** Serve the files using a simple local web server. Open your terminal/command prompt, navigate to the directory containing the files, and run a command like `python -m http.server` (for Python 3) or `npx serve`. Then access the provided URL (usually `http://localhost:8000` or similar) in your browser. You might *still* need a CORS extension depending on the server and browser configuration.

## 6. Core Logic / Functionality

1.  **Initialization:** When the DOM is loaded, `app.js` calls `initializeDashboard`.
2.  **Data Fetching:** `initializeDashboard` iterates through `DATA_SOURCES_PATHS`, asynchronously calling `WorkspaceAndParseTEIXML` for each. `Promise.allSettled` waits for all fetches to complete or fail.
3.  **Parsing:** `WorkspaceAndParseTEIXML` uses the `Workspace` API to get the XML text and `DOMParser().parseFromString()` to create an XML Document object.
4.  **Data Processing:** For each successfully fetched XML document, `processCategoryData` is called.
    * It determines the base XPath for the category's main entries using `listElement` and `mainElement` from `DATA_SOURCES_CONFIG`.
    * It counts the main entries using `evaluateXPath`.
    * If the count > 0, it extracts configured details (`details` array in `DATA_SOURCES_CONFIG`):
        * `dateRange`: Calls `extractDateRange`.
        * `topXxx` lists: Uses specific XPath queries (often relative to `entryBasePath`) via `evaluateXPath`, then processes the results with `getTopFrequencies` to get the top N items and their counts.
        * `nsResolver` provides namespace resolution for `tei:` and `xml:` prefixes in XPath queries.
    * It returns a `resultData` object containing `{ count, details: { ... }, error }`.
5.  **State Management:** The successfully processed results are stored in the `allProcessedData` array in `app.js`.
6.  **UI Setup:**
    * `setupFilters` creates category filter checkboxes based on `allProcessedData`.
    * The main overview chart is created using `createOverviewChart` (`visualizations.js`).
    * Detail cards for each category are created and populated using `displayCategoryDetails` (`visualizations.js`), which also calls `createDetailChart` (`visualizations.js`) to render the horizontal bar charts for Top N lists.
    * The loading indicator is hidden, and the main dashboard content is displayed.
7.  **Filtering:**
    * Checkboxes in the "Filter Categories" section have event listeners attached (`handleFilterChange`).
    * `handleFilterChange` determines the selected categories.
    * It filters `allProcessedData`.
    * It calls `createOverviewChart` to update the overview chart with the filtered data.
    * It toggles the `display` style of the corresponding detail cards (`#detail-KEY`) based on the selection.

## 7. Configuration

Several aspects of the dashboard's behavior are controlled by constants in `app.js`:

* `API_HOST`: The base URL for the data source.
* `DATA_SOURCES_PATHS`: Defines the specific endpoints for each data category. Adding/removing entries here will change the fetched data.
* `DATA_SOURCES_CONFIG`: Crucial configuration object mapping category keys to:
    * `mainElement`: The primary XML element tag name to count for this category.
    * `listElement`: The parent element containing the list of `mainElement`s (used for scoping XPath queries).
    * `idPrefix`: (Currently unused in visualization, but kept from original processing) A prefix associated with entry IDs.
    * `details`: An array of strings specifying which details to extract (e.g., `'topTerms'`, `'dateRange'`, `'topElements'`). The `processCategoryData` function uses this array to decide which extraction logic to run.
* `MAX_FREQ_ITEMS`: The maximum number of items to show in "Top N" lists and charts.
* `TEI_NAMESPACE`, `XML_NAMESPACE`: Namespace URIs used by the XPath resolver.

## 8. Known Issues & Limitations

* **Client-Side Performance:** Fetching and parsing multiple large XML files entirely on the client-side can be slow and memory-intensive, especially on less powerful devices or slower networks.
* **Data Structure Dependency:** The data extraction relies heavily on specific XPath queries tailored to the observed TEI structure of the SZD files. If the source XML structure changes significantly, the XPath queries in `processCategoryData` may fail or return incorrect results, breaking the detail extraction.
* **Summary Data Only:** The dashboard visualizes *summaries* (counts, top N lists, overall ranges) derived from the source data. It does not allow interaction with or display of individual entry details.
* **Limited Filtering:** Filtering is currently limited to selecting/deselecting entire categories. More granular filtering (e.g., by date range *within* the data, by specific terms, by people) is not implemented and would require access to more detailed data or significant reprocessing.
* **Development Environment:** Requires a CORS workaround (browser extension or local server) for local development, which can be inconvenient.
* **Error Handling:** While `Promise.allSettled` is used, error reporting to the user is basic. Specific XPath or processing errors within a category might not be clearly communicated beyond console warnings/errors.
* **CDN Dependency:** Relies on the Chart.js CDN being available.

## 9. Potential Future Extensions

* **Backend Pre-processing:** Implement a backend service (e.g., using Python, Node.js) to fetch, parse, process, and aggregate the TEI data periodically. The frontend would then fetch lightweight JSON data from this backend, drastically improving performance and removing the client-side parsing burden and CORS issues.
* **More Detail Extraction:** Extract and display additional relevant metadata fields present in the TEI (e.g., specific ID numbers, physical dimensions, linked event details).
* **Advanced Visualizations:**
    * **Timeline:** Integrate a timeline view, especially linking `Lebenskalender` events with dated documents (Korrespondenzen, Autographen) or `Personen` life dates.
    * **Map:** If place names (`topPlaces`, repository locations) can be reliably geocoded (requires an external service or pre-compiled coordinates), display them on an interactive map.
    * **Network Graph:** (Originally excluded, but a potential future feature) Reintroduce a network graph visualization to show explicit connections (`@ref`, `@target`) between people, works, documents, and organizations. This would likely require significant backend pre-processing to build the graph data.
* **Enhanced Filtering:** Implement more sophisticated filtering options (e.g., date range sliders, text search within details, selecting specific people/places/terms to filter by).
* **Interaction:** Add interactions, such as clicking on a bar in a chart to filter the dashboard or highlight related information. Clicking a category in the overview chart could scroll to its detail card.
* **Improved UI/UX:** Enhance styling (`style.css`), add better loading indicators for individual charts, improve responsiveness, potentially use a frontend framework (React, Vue, Svelte) for more complex state management if the application grows significantly.
* **Testing:** Add unit tests for data processing functions and potentially integration/end-to-end tests for the UI interactions.