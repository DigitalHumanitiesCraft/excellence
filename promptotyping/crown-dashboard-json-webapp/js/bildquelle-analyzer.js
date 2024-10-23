// bildquelle-analyzer.js

/**
 * BildquelleAnalyzer module for analyzing and displaying Bildquelle data.
 * @module BildquelleAnalyzer
 */
const BildquelleAnalyzer = (function() {
    // Private variables
    let crownData = [];
    let bildquelleData = [];
    let filteredBildquelleData = [];

    const filters = {
        ansichten: new Set(),
        farben: new Set(),
        medien: new Set()
    };

    const config = {
        dataUrl: 'data/crown_data.json',
        galleryItemsPerPage: 20
    };

    /**
     * Initializes the BildquelleAnalyzer.
     */
    async function init() {
        try {
            await loadData();
            setupEventListeners();
            updateUI();
        } catch (error) {
            handleError(error);
        }
    }

    /**
     * Loads and processes the data.
     */
    async function loadData() {
        const response = await fetch(config.dataUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        processData(data);
    }

    /**
     * Processes the raw data into usable format.
     * @param {Object[]} data - The raw crown data.
     */
    function processData(data) {
        crownData = data;
        bildquelleData = crownData.filter(d => d.Bestandteil?.toLowerCase() === 'bildquelle');

        bildquelleData.forEach(bild => {
            bild.ansicht = extractAnsicht(bild);
            bild.farbe = extractFarbe(bild);
            bild.media = extractMedia(bild);
            bild.internet = extractInternetStatus(bild);
            bild.relevanz = extractRelevanz(bild);

            updateFilters(bild);
        });

        filteredBildquelleData = [...bildquelleData];
    }

    /**
     * Extracts the 'Ansicht' property from a Bildquelle item.
     * @param {Object} bild - A Bildquelle item.
     * @returns {string} The extracted 'Ansicht' value.
     */
    function extractAnsicht(bild) {
        const ansichtObj = bild.ConditionAttributes?.Ansicht;
        if (ansichtObj) {
            for (let key in ansichtObj) {
                if (ansichtObj[key] === 1.0) return key;
            }
        }
        return 'Unbekannt';
    }

    /**
     * Extracts the 'Farbe' property from a Bildquelle item.
     * @param {Object} bild - A Bildquelle item.
     * @returns {string} The extracted 'Farbe' value.
     */
    function extractFarbe(bild) {
        return bild.ConditionAttributes?.Farbe?.[""]?.trim() || 'Unbekannt';
    }

    /**
     * Extracts and splits the 'Medium' property from a Bildquelle item.
     * @param {Object} bild - A Bildquelle item.
     * @returns {string[]} An array of media types.
     */
    function extractMedia(bild) {
        const medium = bild.Medium || 'Unbekannt';
        return medium.split(';').map(m => m.trim());
    }

    /**
     * Extracts the internet availability status from a Bildquelle item.
     * @param {Object} bild - A Bildquelle item.
     * @returns {boolean} The internet availability status.
     */
    function extractInternetStatus(bild) {
        return bild.ConditionAttributes?.Internet?.[""] === 1.0;
    }

    /**
     * Extracts the relevance status from a Bildquelle item.
     * @param {Object} bild - A Bildquelle item.
     * @returns {boolean} The relevance status.
     */
    function extractRelevanz(bild) {
        return bild.ConditionAttributes?.["relevant für Restaurierungsgeschichte"] === 1.0;
    }

    /**
     * Updates the filter sets with values from a Bildquelle item.
     * @param {Object} bild - A Bildquelle item.
     */
    function updateFilters(bild) {
        filters.ansichten.add(bild.ansicht);
        filters.farben.add(bild.farbe);
        bild.media.forEach(medium => filters.medien.add(medium));
    }

    /**
     * Sets up event listeners for user interactions.
     */
    function setupEventListeners() {
        document.querySelectorAll('.form-select').forEach(select => {
            select.addEventListener('change', applyFilters);
        });
        document.getElementById('resetFilters').addEventListener('click', resetFilters);
    }

    /**
     * Applies the selected filters to the data.
     */
    function applyFilters() {
        const selectedFilters = {
            ansicht: document.getElementById('ansichtFilter').value,
            farbe: document.getElementById('farbeFilter').value,
            medium: document.getElementById('mediumFilter').value,
            internet: document.getElementById('internetFilter').value,
            relevanz: document.getElementById('relevanzFilter').value
        };

        filteredBildquelleData = bildquelleData.filter(bild => 
            (selectedFilters.ansicht === 'all' || bild.ansicht === selectedFilters.ansicht) &&
            (selectedFilters.farbe === 'all' || bild.farbe === selectedFilters.farbe) &&
            (selectedFilters.medium === 'all' || bild.media.includes(selectedFilters.medium)) &&
            (selectedFilters.internet === 'all' || bild.internet.toString() === selectedFilters.internet) &&
            (selectedFilters.relevanz === 'all' || bild.relevanz.toString() === selectedFilters.relevanz)
        );

        updateUI();
    }

    /**
     * Resets all filters to their default state.
     */
    function resetFilters() {
        document.querySelectorAll('.form-select').forEach(select => {
            select.value = 'all';
        });
        filteredBildquelleData = [...bildquelleData];
        updateUI();
    }

    /**
     * Updates all UI components.
     */
    function updateUI() {
        populateFilters();
        displaySummaryStatistics();
        createMediumTreemap();
        displayBildquelleGallery();
    }

    /**
     * Populates the filter dropdowns with options.
     */
    function populateFilters() {
        populateFilterOptions('ansichtFilter', filters.ansichten);
        populateFilterOptions('farbeFilter', filters.farben);
        populateFilterOptions('mediumFilter', filters.medien);
    }

    /**
     * Populates a specific filter dropdown with options.
     * @param {string} filterId - The ID of the filter element.
     * @param {Set} options - The set of options to populate the filter with.
     */
    function populateFilterOptions(filterId, options) {
        const select = document.getElementById(filterId);
        select.innerHTML = '<option value="all">Alle</option>';
        options.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option;
            optionElement.textContent = option;
            select.appendChild(optionElement);
        });
    }

    /**
     * Displays summary statistics.
     */
    function displaySummaryStatistics() {
        document.getElementById('bildquelleCount').textContent = filteredBildquelleData.length;
    }

    /**
     * Creates the medium distribution treemap.
     */
// ... (previous code remains the same) ...

/**
 * Creates the medium distribution treemap.
 */
function createMediumTreemap() {
    const container = document.getElementById('mediumTreemap');
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Clear previous treemap
    d3.select("#mediumTreemap").html("");

    // Prepare data for the treemap
    const mediumCounts = new Map();
    filteredBildquelleData.forEach(bild => {
        bild.media.forEach(medium => {
            mediumCounts.set(medium, (mediumCounts.get(medium) || 0) + 1);
        });
    });

    const data = {
        name: "Media",
        children: Array.from(mediumCounts, ([name, value]) => ({ name, value }))
    };

    // Create the treemap layout
    const treemap = d3.treemap()
        .size([width, height])
        .padding(1)
        .round(true);

    const root = d3.hierarchy(data)
        .sum(d => d.value)
        .sort((a, b) => b.value - a.value);

    treemap(root);

    // Create the SVG container
    const svg = d3.select("#mediumTreemap")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    // Create color scale
    const color = d3.scaleOrdinal(d3.schemeCategory10);

    // Create the treemap cells
    const cell = svg.selectAll("g")
        .data(root.leaves())
        .enter().append("g")
        .attr("transform", d => `translate(${d.x0},${d.y0})`);

    cell.append("rect")
        .attr("width", d => d.x1 - d.x0)
        .attr("height", d => d.y1 - d.y0)
        .attr("fill", d => color(d.data.name));

    cell.append("text")
        .attr("x", 3)
        .attr("y", 13)
        .text(d => d.data.name)
        .append("tspan")
        .attr("x", 3)
        .attr("y", 25)
        .text(d => d.value);

    cell.append("title")
        .text(d => `${d.data.name}\n${d.value} Objekte`);
}
    /**
     * Displays the Bildquelle gallery.
     */
    function displayBildquelleGallery() {
        const gallery = document.getElementById('bildquelleGallery');
        gallery.innerHTML = '';

        if (filteredBildquelleData.length === 0) {
            gallery.innerHTML = '<p>Keine Bildquellen entsprechen den ausgewählten Filtern.</p>';
            return;
        }

        filteredBildquelleData.slice(0, config.galleryItemsPerPage).forEach(bild => {
            const card = createBildquelleCard(bild);
            gallery.appendChild(card);
        });

        if (filteredBildquelleData.length > config.galleryItemsPerPage) {
            const loadMoreButton = createLoadMoreButton();
            gallery.appendChild(loadMoreButton);
        }
    }

    /**
     * Creates a card element for a Bildquelle item.
     * @param {Object} bild - A Bildquelle item.
     * @returns {HTMLElement} The created card element.
     */
    function createBildquelleCard(bild) {
        const card = document.createElement('div');
        card.className = 'bildquelle-card';
        card.innerHTML = `
            <img src="${getImagePath(bild)}" alt="${bild.ObjectName || 'Bildquelle'}" loading="lazy">
            <div class="bildquelle-info">
                <h5>${bild.ObjectName || 'Unbekanntes Objekt'}</h5>
                <p><strong>Titel:</strong> ${bild.Description || 'Keine Beschreibung'}</p>
                <p><strong>Medium:</strong> ${bild.media.join(', ')}</p>
                <p><strong>Ansicht:</strong> ${bild.ansicht}</p>
                <p><strong>Farbe:</strong> ${bild.farbe}</p>
                <p><strong>Datierung:</strong> ${bild.Dated || 'Unbekannt'}</p>
                <p><strong>Internet Verfügbarkeit:</strong> ${formatStatus(bild.internet)}</p>
                <p><strong>Relevanz für Restaurierungsgeschichte:</strong> ${formatStatus(bild.relevanz)}</p>
            </div>
        `;
        return card;
    }

    /**
     * Creates a "Load More" button for the gallery.
     * @returns {HTMLElement} The created button element.
     */
    function createLoadMoreButton() {
        const button = document.createElement('button');
        button.textContent = 'Mehr laden';
        button.className = 'btn btn-primary mt-3';
        button.addEventListener('click', loadMoreGalleryItems);
        return button;
    }

    /**
     * Loads more items into the gallery.
     */
    function loadMoreGalleryItems() {
        const gallery = document.getElementById('bildquelleGallery');
        const currentCount = gallery.querySelectorAll('.bildquelle-card').length;
        const nextBatch = filteredBildquelleData.slice(currentCount, currentCount + config.galleryItemsPerPage);

        nextBatch.forEach(bild => {
            const card = createBildquelleCard(bild);
            gallery.insertBefore(card, gallery.lastElementChild);
        });

        if (currentCount + nextBatch.length >= filteredBildquelleData.length) {
            gallery.removeChild(gallery.lastElementChild);
        }
    }

    /**
     * Gets the image path for a Bildquelle item.
     * @param {Object} bild - A Bildquelle item.
     * @returns {string} The image path.
     */
    // https://storage.googleapis.com/crown-dashboard/assets/CR_1_QB_Gr/Gr_1797-1919/CR_1_QB_Gr_1797-1919_005_heinrichiv.jpg
    function getImagePath(bild) {
        if (bild.Media && bild.Media.length > 0 && bild.Media[0].FileName) {
            const cleanedPath = bild.Media[0].FileName.replace('Projekte\\CROWN\\', '').replace(/\\/g, '/');
            return `https://storage.googleapis.com/crown-dashboard/assets/${cleanedPath}`;
        }
        return "images/placeholder.png";
    }

    /**
     * Formats a boolean status for display.
     * @param {boolean} status - The status to format.
     * @returns {string} The formatted status HTML.
     */
    function formatStatus(status) {
        return status
            ? '<span class="status-ja">Ja</span>'
            : '<span class="status-nein">Nein</span>';
    }

    /**
     * Handles and displays errors.
     * @param {Error} error - The error to handle.
     */
    function handleError(error) {
        console.error('Fehler:', error);
        alert(`Ein Fehler ist aufgetreten: ${error.message}`);
    }

    // Public API
    return {
        init: init
    };
})();

// Initialize the application when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', BildquelleAnalyzer.init);