// Enhanced visualization.js with new interactive features

// Global state
let summaryData = null;
let examplesData = null;
let distributionsData = null;
let configData = null;
let disciplineMetadata = null;

// Current example page
let currentPage = 1;
const examplesPerPage = 10;
let filteredExamples = [];
let comparisonExamples = []; // New: storage for examples being compared

// Format a number with commas
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Helper function to escape special characters in RegExp
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Load all data files
async function loadData() {
    try {
        // Show loading indicator
        document.getElementById('loading').style.display = 'block';
        document.getElementById('content').style.display = 'none';
        
        console.log('Starting to load data files...');
        
        let summary, examples, distributions, config, disciplines;
        
        try {
            const summaryResponse = await fetch('visualization_data/summary.json');
            if (!summaryResponse.ok) throw new Error(`HTTP error ${summaryResponse.status} for summary.json`);
            summary = await summaryResponse.json();
            console.log('Summary data loaded successfully');
        } catch (error) {
            console.error('Error loading summary.json:', error);
            throw error;
        }
        
        try {
            const examplesResponse = await fetch('visualization_data/examples.json');
            if (!examplesResponse.ok) throw new Error(`HTTP error ${examplesResponse.status} for examples.json`);
            examples = await examplesResponse.json();
            console.log('Examples data loaded successfully');
        } catch (error) {
            console.error('Error loading examples.json:', error);
            throw error;
        }
        
        try {
            const distributionsResponse = await fetch('visualization_data/distributions.json');
            if (!distributionsResponse.ok) throw new Error(`HTTP error ${distributionsResponse.status} for distributions.json`);
            distributions = await distributionsResponse.json();
            console.log('Distributions data loaded successfully');
        } catch (error) {
            console.error('Error loading distributions.json:', error);
            throw error;
        }
        
        try {
            const configResponse = await fetch('visualization_data/config.json');
            if (!configResponse.ok) throw new Error(`HTTP error ${configResponse.status} for config.json`);
            config = await configResponse.json();
            console.log('Config data loaded successfully');
        } catch (error) {
            console.error('Error loading config.json:', error);
            // Config is optional, so we continue without it
            config = {};
        }

        // NEW: Load academic discipline metadata
        try {
            const disciplinesResponse = await fetch('visualization_data/disciplines.json');
            if (!disciplinesResponse.ok) {
                // If no disciplines file exists, we'll create a default one based on filenames
                console.log('No disciplines.json found, generating from file patterns');
                disciplines = generateDisciplineData(examples);
            } else {
                disciplines = await disciplinesResponse.json();
            }
            console.log('Discipline data loaded successfully');
        } catch (error) {
            console.error('Error loading disciplines.json:', error);
            // Generate a basic discipline mapping from filenames
            disciplines = generateDisciplineData(examples);
        }
        
        // Store data globally
        summaryData = summary;
        examplesData = examples;
        distributionsData = distributions;
        configData = config;
        disciplineMetadata = disciplines;
        
        // Initialize the visualization
        initializeVisualization();
        
        // Hide loading indicator, show content
        document.getElementById('loading').style.display = 'none';
        document.getElementById('content').style.display = 'block';
    } catch (error) {
        console.error('Error loading data:', error);
        document.getElementById('loading').innerHTML = `
            <div class="alert alert-danger" role="alert">
                <h4 class="alert-heading">Error Loading Data</h4>
                <p>There was a problem loading the visualization data. Please check that the data files exist in the correct location.</p>
                <hr>
                <p class="mb-0">Technical details: ${error.message}</p>
            </div>
        `;
    }
}

// NEW: Generate basic discipline metadata from filenames if not provided
function generateDisciplineData(examples) {
    const disciplines = {
        mappings: {},
        categories: [
            "Linguistics", 
            "Literature", 
            "Biology", 
            "Chemistry", 
            "Physics", 
            "Mathematics", 
            "History", 
            "Psychology", 
            "Sociology", 
            "Economics", 
            "Other"
        ]
    };

    // Extract unique filenames
    const files = [...new Set(examples.map(ex => {
        // Extract file if present, otherwise use placeholder
        return ex.file || "unknown";
    }))];

    // Assign disciplines based on patterns in filenames
    files.forEach(file => {
        let name = file.toLowerCase();
        
        // Simple pattern matching for discipline assignment
        if (name.includes('ling') || name.includes('lang')) {
            disciplines.mappings[file] = "Linguistics";
        } else if (name.includes('lit') || name.includes('novel') || name.includes('poet')) {
            disciplines.mappings[file] = "Literature";
        } else if (name.includes('bio') || name.includes('ecol')) {
            disciplines.mappings[file] = "Biology";
        } else if (name.includes('chem')) {
            disciplines.mappings[file] = "Chemistry";
        } else if (name.includes('phys')) {
            disciplines.mappings[file] = "Physics";
        } else if (name.includes('math') || name.includes('calc')) {
            disciplines.mappings[file] = "Mathematics";
        } else if (name.includes('hist')) {
            disciplines.mappings[file] = "History";
        } else if (name.includes('psych')) {
            disciplines.mappings[file] = "Psychology";
        } else if (name.includes('soc')) {
            disciplines.mappings[file] = "Sociology";
        } else if (name.includes('econ')) {
            disciplines.mappings[file] = "Economics";
        } else {
            disciplines.mappings[file] = "Other";
        }
    });

    return disciplines;
}

// Initialize the visualization components
function initializeVisualization() {
    updateDashboardStats();
    createCharts();
    createEnhancedUI(); // NEW: Create enhanced UI elements
    populateFilters();
    populateInversionTypes();
    filterExamples();
}

// NEW: Create enhanced UI elements for the new interactive features
function createEnhancedUI() {
    // 1. Create context view section
    createContextViewSection();
    
    // 2. Create syntax tree visualization section
    createSyntaxTreeSection();
    
    // 3. Create comparison view section
    createComparisonViewSection();
}

// NEW: Create context view section
function createContextViewSection() {
    // Find the examples explorer section to add our new section after it
    const examplesSection = document.querySelector('.card.mb-5');
    if (!examplesSection) return;
    
    // Create context view section
    const contextSection = document.createElement('div');
    contextSection.className = 'card mb-5';
    contextSection.id = 'context-view-section';
    contextSection.innerHTML = `
        <div class="card-header d-flex justify-content-between align-items-center">
            <h5>Sentence Context View</h5>
            <button class="btn btn-sm btn-outline-secondary" id="toggle-context-view">
                <i class="bi bi-arrows-expand"></i> Expand
            </button>
        </div>
        <div class="card-body">
            <p class="text-muted">Select an example from the table above to view its context.</p>
            <div id="context-content" class="p-3 border rounded" style="display: none;">
                <div class="previous-sentence text-muted mb-2">
                    <small class="text-secondary"><i class="bi bi-arrow-up"></i> Previous</small>
                    <p id="previous-sentence">No previous sentence available.</p>
                </div>
                <div class="current-sentence p-3 bg-light border rounded">
                    <small class="text-primary"><i class="bi bi-arrow-right"></i> Current</small>
                    <p id="current-sentence" class="fw-bold">No example selected.</p>
                </div>
                <div class="next-sentence text-muted mt-2">
                    <small class="text-secondary"><i class="bi bi-arrow-down"></i> Next</small>
                    <p id="next-sentence">No next sentence available.</p>
                </div>
            </div>
        </div>
    `;
    
    // Insert after examples section
    examplesSection.after(contextSection);
    
    // Add toggle functionality
    const toggleBtn = contextSection.querySelector('#toggle-context-view');
    const contextContent = contextSection.querySelector('#context-content');
    
    toggleBtn.addEventListener('click', () => {
        if (contextContent.style.display === 'none') {
            contextContent.style.display = 'block';
            toggleBtn.innerHTML = '<i class="bi bi-arrows-collapse"></i> Collapse';
        } else {
            contextContent.style.display = 'none';
            toggleBtn.innerHTML = '<i class="bi bi-arrows-expand"></i> Expand';
        }
    });
}

// NEW: Create syntax tree visualization section
function createSyntaxTreeSection() {
    // Find the context view section to add our new section after it
    const contextSection = document.getElementById('context-view-section');
    if (!contextSection) return;
    
    // Create syntax tree section
    const syntaxSection = document.createElement('div');
    syntaxSection.className = 'card mb-5';
    syntaxSection.id = 'syntax-tree-section';
    syntaxSection.innerHTML = `
        <div class="card-header d-flex justify-content-between align-items-center">
            <h5>Syntax Tree Visualization</h5>
            <button class="btn btn-sm btn-outline-secondary" id="toggle-syntax-view">
                <i class="bi bi-arrows-expand"></i> Expand
            </button>
        </div>
        <div class="card-body">
            <p class="text-muted">Select an example to visualize its syntactic structure.</p>
            <div id="syntax-content" class="p-3 border rounded" style="display: none;">
                <div class="row mb-3">
                    <div class="col-md-6">
                        <div class="form-group">
                            <label for="tree-view-type">Tree View Type</label>
                            <select class="form-select" id="tree-view-type">
                                <option value="constituency">Constituency Tree</option>
                                <option value="dependency">Dependency Tree</option>
                            </select>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="form-group">
                            <label for="tree-highlight">Highlight Components</label>
                            <select class="form-select" id="tree-highlight">
                                <option value="all">All Components</option>
                                <option value="fronted">Fronted Constituent</option>
                                <option value="verb">Verb</option>
                                <option value="subject">Subject</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div id="syntax-tree-container" class="p-3 border rounded bg-light" style="height: 350px; overflow: auto;">
                    <div class="text-center text-muted py-5">
                        <p><i class="bi bi-diagram-3 fs-1"></i></p>
                        <p>Select an example to visualize its syntax tree.</p>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Insert after context section
    contextSection.after(syntaxSection);
    
    // Add toggle functionality
    const toggleBtn = syntaxSection.querySelector('#toggle-syntax-view');
    const syntaxContent = syntaxSection.querySelector('#syntax-content');
    
    toggleBtn.addEventListener('click', () => {
        if (syntaxContent.style.display === 'none') {
            syntaxContent.style.display = 'block';
            toggleBtn.innerHTML = '<i class="bi bi-arrows-collapse"></i> Collapse';
        } else {
            syntaxContent.style.display = 'none';
            toggleBtn.innerHTML = '<i class="bi bi-arrows-expand"></i> Expand';
        }
    });
    
    // Add change listeners for controls
    const treeViewType = syntaxSection.querySelector('#tree-view-type');
    const treeHighlight = syntaxSection.querySelector('#tree-highlight');
    
    treeViewType.addEventListener('change', () => {
        if (currentSyntaxExample) {
            renderSyntaxTree(currentSyntaxExample);
        }
    });
    
    treeHighlight.addEventListener('change', () => {
        if (currentSyntaxExample) {
            renderSyntaxTree(currentSyntaxExample);
        }
    });
}

// NEW: Create comparison view section
function createComparisonViewSection() {
    // Find the syntax tree section to add our new section after it
    const syntaxSection = document.getElementById('syntax-tree-section');
    if (!syntaxSection) return;
    
    // Create comparison view section
    const comparisonSection = document.createElement('div');
    comparisonSection.className = 'card mb-5';
    comparisonSection.id = 'comparison-view-section';
    comparisonSection.innerHTML = `
        <div class="card-header d-flex justify-content-between align-items-center">
            <h5>Inversion Type Comparison</h5>
            <button class="btn btn-sm btn-outline-secondary" id="toggle-comparison-view">
                <i class="bi bi-arrows-expand"></i> Expand
            </button>
        </div>
        <div class="card-body">
            <p class="text-muted">Compare different types of inversions side by side.</p>
            <div id="comparison-content" class="p-3 border rounded" style="display: none;">
                <div class="row mb-3">
                    <div class="col-md-6">
                        <div class="form-group">
                            <label for="comparison-type-1">First Inversion Type</label>
                            <select class="form-select" id="comparison-type-1">
                                <option value="">Select a type...</option>
                            </select>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="form-group">
                            <label for="comparison-type-2">Second Inversion Type</label>
                            <select class="form-select" id="comparison-type-2">
                                <option value="">Select a type...</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div class="text-center mb-3">
                    <button class="btn btn-primary" id="run-comparison">Compare Types</button>
                </div>
                <div id="comparison-results" class="row">
                    <div class="col-md-6">
                        <div class="card h-100">
                            <div class="card-header" id="comparison-title-1">Type 1</div>
                            <div class="card-body">
                                <div id="comparison-stats-1" class="mb-3">
                                    <!-- Stats will be populated here -->
                                </div>
                                <div id="comparison-examples-1">
                                    <!-- Examples will be populated here -->
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="card h-100">
                            <div class="card-header" id="comparison-title-2">Type 2</div>
                            <div class="card-body">
                                <div id="comparison-stats-2" class="mb-3">
                                    <!-- Stats will be populated here -->
                                </div>
                                <div id="comparison-examples-2">
                                    <!-- Examples will be populated here -->
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Insert after syntax tree section
    syntaxSection.after(comparisonSection);
    
    // Add toggle functionality
    const toggleBtn = comparisonSection.querySelector('#toggle-comparison-view');
    const comparisonContent = comparisonSection.querySelector('#comparison-content');
    
    toggleBtn.addEventListener('click', () => {
        if (comparisonContent.style.display === 'none') {
            comparisonContent.style.display = 'block';
            toggleBtn.innerHTML = '<i class="bi bi-arrows-collapse"></i> Collapse';
        } else {
            comparisonContent.style.display = 'none';
            toggleBtn.innerHTML = '<i class="bi bi-arrows-expand"></i> Expand';
        }
    });
    
    // Add run comparison functionality
    const runComparisonBtn = comparisonSection.querySelector('#run-comparison');
    
    runComparisonBtn.addEventListener('click', () => {
        const type1 = document.getElementById('comparison-type-1').value;
        const type2 = document.getElementById('comparison-type-2').value;
        
        if (type1 && type2) {
            runComparisonAnalysis(type1, type2);
        } else {
            alert('Please select two inversion types to compare.');
        }
    });
}

// Update the dashboard statistics
function updateDashboardStats() {
    document.getElementById('total-inversions').textContent = formatNumber(summaryData.total_inversions);
    document.getElementById('percent-sentences').textContent = 
        (summaryData.total_inversions / summaryData.total_sentences * 100).toFixed(2) + '%';
    document.getElementById('locative-count').textContent = formatNumber(summaryData.locative_inversions);
    document.getElementById('complex-count').textContent = formatNumber(summaryData.complex_inversions_count);
}

// Create the various charts
function createCharts() {
    createConstituentChart();
    createConfidenceChart();
    createInversionTypesChart();
}

// Create the constituent types chart
function createConstituentChart() {
    // Get the canvas element properly and check if it exists
    const canvas = document.getElementById('constituent-chart');
    if (!canvas) {
        console.error('Could not find canvas element with ID "constituent-chart"');
        return;
    }
    
    try {
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            console.error('Could not get 2D context for constituent-chart');
            return;
        }
        
        // Extract data
        const labels = Object.keys(summaryData.constituent_types);
        const data = Object.values(summaryData.constituent_types);
        
        // Get colors from config
        const colors = configData && configData.chartColors && configData.chartColors.constituentTypes ? 
            configData.chartColors.constituentTypes : 
            ['#3498db', '#2ecc71', '#f1c40f', '#e74c3c', '#9b59b6', '#1abc9c', '#d35400', '#34495e'];
        
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors,
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            boxWidth: 15,
                            padding: 15
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const value = context.raw;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = (value / total * 100).toFixed(1) + '%';
                                return `${context.label}: ${formatNumber(value)} (${percentage})`;
                            }
                        }
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error creating constituent chart:', error);
    }
}

// Create the confidence levels chart
function createConfidenceChart() {
    // Get the canvas element properly and check if it exists
    const canvas = document.getElementById('confidence-chart');
    if (!canvas) {
        console.error('Could not find canvas element with ID "confidence-chart"');
        return;
    }
    
    try {
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            console.error('Could not get 2D context for confidence-chart');
            return;
        }
        
        // Extract data
        const labels = Object.keys(summaryData.confidence_levels).map(label => 
            label.charAt(0).toUpperCase() + label.slice(1)
        );
        const data = Object.values(summaryData.confidence_levels);
        
        // Get colors from config
        const colors = configData && configData.chartColors && configData.chartColors.confidenceLevels ? 
            Object.values(configData.chartColors.confidenceLevels) : 
            ['#27ae60', '#f39c12', '#e74c3c'];
        
        new Chart(ctx, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors,
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const value = context.raw;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = (value / total * 100).toFixed(1) + '%';
                                return `${context.label}: ${formatNumber(value)} (${percentage})`;
                            }
                        }
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error creating confidence chart:', error);
    }
}

// Create the inversion types chart
function createInversionTypesChart() {
    // Get the canvas element properly and check if it exists
    const canvas = document.getElementById('inversion-types-chart');
    if (!canvas) {
        console.error('Could not find canvas element with ID "inversion-types-chart"');
        return;
    }
    
    try {
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            console.error('Could not get 2D context for inversion-types-chart');
            return;
        }
        
        // Format inversion type labels for better readability
        const formatLabel = label => {
            return label
                .replace(/_/g, ' ')
                .replace(/inversion/, '')
                .replace(/\b\w/g, l => l.toUpperCase())
                .trim();
        };
        
        // Extract data
        const labels = Object.keys(summaryData.inversion_types).map(formatLabel);
        const data = Object.values(summaryData.inversion_types);
        
        // Get colors from config
        const colors = configData && configData.chartColors && configData.chartColors.inversionTypes ? 
            configData.chartColors.inversionTypes : 
            ['#3498db', '#2ecc71', '#f1c40f', '#e74c3c', '#9b59b6', '#1abc9c', '#d35400', '#34495e'];
        
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Number of Inversions',
                    data: data,
                    backgroundColor: colors,
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return formatNumber(value);
                            }
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const value = context.raw;
                                const total = summaryData.total_inversions;
                                const percentage = (value / total * 100).toFixed(1) + '%';
                                return `Count: ${formatNumber(value)} (${percentage})`;
                            }
                        }
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error creating inversion types chart:', error);
    }
}

// Populate filter dropdowns
function populateFilters() {
    // Inversion types filter
    const typeFilter = document.getElementById('type-filter');
    if (typeFilter) {
        // Clear existing options except the first one
        while (typeFilter.options.length > 1) {
            typeFilter.options.remove(1);
        }
        
        // Add options
        Object.keys(summaryData.inversion_types).forEach(type => {
            const option = document.createElement('option');
            option.value = type;
            option.textContent = type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            typeFilter.appendChild(option);
        });
    }
    
    // Constituent types filter
    const constituentFilter = document.getElementById('constituent-filter');
    if (constituentFilter) {
        // Clear existing options except the first one
        while (constituentFilter.options.length > 1) {
            constituentFilter.options.remove(1);
        }
        
        // Add options
        Object.keys(summaryData.constituent_types).forEach(type => {
            const option = document.createElement('option');
            option.value = type;
            option.textContent = type;
            constituentFilter.appendChild(option);
        });
    }
    
    // NEW: Academic discipline filter
    const disciplineFilter = document.createElement('div');
    disciplineFilter.className = 'col-md-3';
    disciplineFilter.innerHTML = `
        <div class="form-group">
            <label for="discipline-filter">Academic Discipline</label>
            <select class="form-select" id="discipline-filter">
                <option value="">All Disciplines</option>
            </select>
        </div>
    `;
    
    // Add discipline filter to filters container
    const filtersContainer = document.getElementById('filters');
    if (filtersContainer) {
        filtersContainer.appendChild(disciplineFilter);
        
        // Populate discipline options
        const disciplineSelect = document.getElementById('discipline-filter');
        if (disciplineSelect && disciplineMetadata && disciplineMetadata.categories) {
            disciplineMetadata.categories.forEach(discipline => {
                const option = document.createElement('option');
                option.value = discipline;
                option.textContent = discipline;
                disciplineSelect.appendChild(option);
            });
        }
    }
    
    // Also populate comparison dropdowns
    populateComparisonDropdowns();
    
    // Add event listeners to all filters
    document.querySelectorAll('#filters select').forEach(filter => {
        filter.addEventListener('change', () => {
            filterExamples();
        });
    });
}

// NEW: Populate comparison dropdowns
function populateComparisonDropdowns() {
    const comparison1 = document.getElementById('comparison-type-1');
    const comparison2 = document.getElementById('comparison-type-2');
    
    if (comparison1 && comparison2) {
        // Clear existing options except the first one
        while (comparison1.options.length > 1) comparison1.options.remove(1);
        while (comparison2.options.length > 1) comparison2.options.remove(1);
        
        // Add inversion type options
        Object.keys(summaryData.inversion_types).forEach(type => {
            const option1 = document.createElement('option');
            option1.value = type;
            option1.textContent = type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            comparison1.appendChild(option1);
            
            const option2 = document.createElement('option');
            option2.value = type;
            option2.textContent = type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            comparison2.appendChild(option2);
        });
    }
}

// Populate inversion types list in the About section
function populateInversionTypes() {
    const listElement = document.getElementById('inversion-types-list');
    if (!listElement) return;
    
    // Clear existing list items
    listElement.innerHTML = '';
    
    // Add list items for each inversion type
    const typeDescriptions = {
        "existential": "Constructions with 'there' (e.g., 'There is a book on the table')",
        "pp_inversion": "Starting with prepositions like 'in,' 'on,' 'at' (e.g., 'On the right is a statue')",
        "adv_inversion": "Starting with adverbs like 'here,' 'never,' 'only' (e.g., 'Only then did I realize')",
        "ap_inversion": "Starting with adjectives or comparatives (e.g., 'Most important is the final chapter')",
        "numeric_inversion": "Starting with numbers or ordinals (e.g., 'Two traditional sayings are depicted')",
        "complex_pp_inversion": "Complex prepositional phrases with embedded clauses (e.g., 'In the garden that lies beyond the house stands a statue')",
        "coordinated_inversion": "Structures with coordinated elements (e.g., 'In less than a week a piece of cloth can be made to look and feel as if it were fifty years old')",
        "vp_inversion": "Starting with verb phrases, typically participles (e.g., 'Standing in the corner was an old grandfather clock')"
    };
    
    // Create list items for each type
    Object.keys(summaryData.inversion_types).forEach(type => {
        if (summaryData.inversion_types[type] > 0) {
            const li = document.createElement('li');
            const typeCount = summaryData.inversion_types[type];
            const percentage = (typeCount / summaryData.total_inversions * 100).toFixed(1);
            
            li.innerHTML = `<strong>${type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</strong> 
                            (${formatNumber(typeCount)}, ${percentage}%): ${typeDescriptions[type] || 'No description available'}`;
            listElement.appendChild(li);
        }
    });
}

// Filter examples based on selected criteria
function filterExamples() {
    const typeFilter = document.getElementById('type-filter')?.value || '';
    const constituentFilter = document.getElementById('constituent-filter')?.value || '';
    const confidenceFilter = document.getElementById('confidence-filter')?.value || '';
    const locativeFilter = document.getElementById('locative-filter')?.value || '';
    const disciplineFilter = document.getElementById('discipline-filter')?.value || ''; // NEW
    
    // Apply filters
    filteredExamples = examplesData.filter(example => {
        // Type filter
        if (typeFilter && example.type !== typeFilter) return false;
        
        // Constituent filter
        if (constituentFilter && example.constituent_type !== constituentFilter) return false;
        
        // Confidence filter
        if (confidenceFilter && example.confidence !== confidenceFilter) return false;
        
        // Locative filter
        if (locativeFilter === 'true' && !example.is_locative) return false;
        if (locativeFilter === 'false' && example.is_locative) return false;
        
        // NEW: Discipline filter
        if (disciplineFilter && example.file) {
            const discipline = getDisciplineForFile(example.file);
            if (discipline !== disciplineFilter) return false;
        }
        
        return true;
    });
    
    // Reset to first page
    currentPage = 1;
    
    // Display filtered examples
    displayExamples();
}

// NEW: Helper function to get discipline for a file
function getDisciplineForFile(file) {
    if (!disciplineMetadata || !disciplineMetadata.mappings) return "Other";
    
    return disciplineMetadata.mappings[file] || "Other";
}

// Global variable to track current example for syntax tree
let currentSyntaxExample = null;

// Display examples with pagination
function displayExamples() {
    const tableBody = document.getElementById('examples-body');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    // Calculate pagination
    const totalPages = Math.ceil(filteredExamples.length / examplesPerPage);
    const startIndex = (currentPage - 1) * examplesPerPage;
    const endIndex = Math.min(startIndex + examplesPerPage, filteredExamples.length);
    
    // No results message
    if (filteredExamples.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `<td colspan="4" class="text-center">No examples match your filter criteria.</td>`;
        tableBody.appendChild(row);
    } else {
        // Add rows for current page
        for (let i = startIndex; i < endIndex; i++) {
            const example = filteredExamples[i];
            const row = document.createElement('tr');
            row.className = 'example-row';
            
            // Highlight fronted constituent and verb in sentence
            let highlightedSentence = example.sentence;
            if (example.fronted_constituent && example.verb) {
                // Simple way to highlight - might need improvement for exact matches
                try {
                    highlightedSentence = example.sentence
                        .replace(new RegExp(escapeRegExp(example.fronted_constituent), 'i'), 
                               `<span class="highlight">$&</span>`)
                        .replace(new RegExp(`\\b${escapeRegExp(example.verb)}\\b(?![^<]*>)`, 'i'), 
                               `<span class="highlight">$&</span>`);
                } catch (e) {
                    console.error('Error highlighting sentence:', e);
                    // Fallback to original sentence
                    highlightedSentence = example.sentence;
                }
            }
            
            // Create confidence badge
            const confidenceBadge = `<span class="badge badge-${example.confidence} bg-${
                example.confidence === 'high' ? 'success' : 
                example.confidence === 'medium' ? 'warning' : 'danger'
            }">${example.confidence}</span>`;
            
            row.innerHTML = `
                <td>${example.type.replace(/_/g, ' ')}</td>
                <td>${highlightedSentence}</td>
                <td>${example.constituent_type}</td>
                <td>${confidenceBadge}</td>
            `;
            
            // Add click handler for enhanced interactivity
            row.addEventListener('click', () => {
                // Show the example details modal
                showExampleDetails(example);
                
                // Update the context view with surrounding sentences
                updateContextView(example);
                
                // Render the syntax tree for this example
                currentSyntaxExample = example;
                renderSyntaxTree(example);
                
                // Highlight the selected row
                document.querySelectorAll('.example-row').forEach(r => r.classList.remove('table-primary'));
                row.classList.add('table-primary');
            });
            
            tableBody.appendChild(row);
        }
    }
    
    // Update pagination
    updatePagination(totalPages);
}

// NEW: Update context view with surrounding sentences
function updateContextView(example) {
    const contextContent = document.getElementById('context-content');
    const previousSentence = document.getElementById('previous-sentence');
    const currentSentence = document.getElementById('current-sentence');
    const nextSentence = document.getElementById('next-sentence');
    
    if (!contextContent || !previousSentence || !currentSentence || !nextSentence) return;
    
    // Show the context content
    contextContent.style.display = 'block';
    
    // Update the current sentence
    currentSentence.innerHTML = example.sentence;
    
    // Update previous and next sentences if available
    if (example.previous_sentence) {
        previousSentence.innerHTML = example.previous_sentence;
        previousSentence.parentElement.style.display = 'block';
    } else {
        previousSentence.innerHTML = 'No previous sentence available.';
        previousSentence.parentElement.style.display = 'block';
    }
    
    if (example.next_sentence) {
        nextSentence.innerHTML = example.next_sentence;
        nextSentence.parentElement.style.display = 'block';
    } else {
        nextSentence.innerHTML = 'No next sentence available.';
        nextSentence.parentElement.style.display = 'block';
    }
}

// NEW: Render syntax tree for an example
function renderSyntaxTree(example) {
    const container = document.getElementById('syntax-tree-container');
    const treeType = document.getElementById('tree-view-type')?.value || 'constituency';
    const highlight = document.getElementById('tree-highlight')?.value || 'all';
    
    if (!container) return;
    
    // Show content
    document.getElementById('syntax-content').style.display = 'block';
    
    // Update container
    container.innerHTML = '<div class="text-center py-4"><div class="spinner-border text-primary" role="status"></div><p class="mt-2">Generating syntax tree...</p></div>';
    
    // Simulate a brief delay for tree generation
    setTimeout(() => {
        if (treeType === 'constituency') {
            renderConstituencyTree(example, container, highlight);
        } else {
            renderDependencyTree(example, container, highlight);
        }
    }, 500);
}

// NEW: Render constituency tree
function renderConstituencyTree(example, container, highlight) {
    // Parse the sentence into a simple constituency tree
    const sentence = example.sentence;
    const words = sentence.split(/\s+/).filter(w => w.length > 0);
    
    // Extract key parts
    const frontedConstituent = example.fronted_constituent?.split(/\s+/) || [];
    const verb = example.verb;
    const subject = example.subject?.split(/\s+/) || [];
    
    // Build a simple tree structure
    const treeHtml = `
        <div class="syntax-tree text-center">
            <div class="tree-node tree-root">
                <div class="node-label">S (Sentence)</div>
                <div class="node-children">
                    <div class="tree-node ${highlight === 'fronted' || highlight === 'all' ? 'highlight-fronted' : ''}">
                        <div class="node-label">Fronted Constituent (${example.constituent_type})</div>
                        <div class="node-children">
                            ${frontedConstituent.map(word => 
                                `<div class="tree-node tree-leaf"><div class="node-label">${word}</div></div>`
                            ).join('')}
                        </div>
                    </div>
                    <div class="tree-node ${highlight === 'verb' || highlight === 'all' ? 'highlight-verb' : ''}">
                        <div class="node-label">V (Verb)</div>
                        <div class="node-children">
                            <div class="tree-node tree-leaf"><div class="node-label">${verb}</div></div>
                        </div>
                    </div>
                    <div class="tree-node ${highlight === 'subject' || highlight === 'all' ? 'highlight-subject' : ''}">
                        <div class="node-label">NP (Subject)</div>
                        <div class="node-children">
                            ${subject.map(word => 
                                `<div class="tree-node tree-leaf"><div class="node-label">${word}</div></div>`
                            ).join('')}
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <style>
            .syntax-tree {
                font-family: 'Arial', sans-serif;
                padding: 20px;
            }
            .tree-node {
                display: inline-block;
                vertical-align: top;
                text-align: center;
                margin: 0 10px;
            }
            .node-label {
                border: 1px solid #ccc;
                border-radius: 4px;
                padding: 5px 10px;
                margin-bottom: 10px;
                background-color: #f8f9fa;
            }
            .node-children {
                position: relative;
                display: flex;
                justify-content: center;
            }
            .node-children:before {
                content: '';
                position: absolute;
                top: -10px;
                left: 0;
                right: 0;
                height: 10px;
                border-left: 1px solid #ccc;
                border-right: 1px solid #ccc;
                border-top: 1px solid #ccc;
            }
            .tree-leaf {
                margin: 0 5px;
            }
            .tree-root > .node-label {
                background-color: #e3f2fd;
                font-weight: bold;
            }
            .highlight-fronted > .node-label {
                background-color: #d1ecf1;
                border-color: #bee5eb;
            }
            .highlight-verb > .node-label {
                background-color: #f8d7da;
                border-color: #f5c6cb;
            }
            .highlight-subject > .node-label {
                background-color: #d4edda;
                border-color: #c3e6cb;
            }
        </style>
    `;
    
    container.innerHTML = treeHtml;
}

// NEW: Render dependency tree
function renderDependencyTree(example, container, highlight) {
    // For dependency tree, we'll use a different visualization approach
    const sentence = example.sentence;
    const words = sentence.split(/\s+/).filter(w => w.length > 0);
    
    // Extract key parts
    const frontedConstituent = example.fronted_constituent?.split(/\s+/) || [];
    const verb = example.verb;
    const subject = example.subject?.split(/\s+/) || [];
    
    // Create a simplified dependency visualization
    let treeHtml = `
        <div class="dependency-tree">
            <div class="sentence-tokens">
    `;
    
    // Add tokens with arcs
    words.forEach((word, index) => {
        const isFronted = frontedConstituent.includes(word);
        const isVerb = word === verb;
        const isSubject = subject.includes(word);
        
        let highlightClass = '';
        if ((highlight === 'fronted' || highlight === 'all') && isFronted) highlightClass = 'highlight-fronted';
        else if ((highlight === 'verb' || highlight === 'all') && isVerb) highlightClass = 'highlight-verb';
        else if ((highlight === 'subject' || highlight === 'all') && isSubject) highlightClass = 'highlight-subject';
        
        treeHtml += `
            <div class="token ${highlightClass}">
                <div class="word">${word}</div>
                <div class="pos">${getSimplePOS(word, isFronted, isVerb, isSubject)}</div>
            </div>
        `;
    });
    
    treeHtml += `
            </div>
            <div class="dependency-arcs">
    `;
    
    // Add simplified arcs (just for visualization purposes)
    // In a real implementation, these would be based on actual dependency parsing
    
    // Verb to subject arc
    const verbIndex = words.findIndex(w => w === verb);
    const subjectIndex = words.findIndex(w => subject.includes(w));
    
    if (verbIndex >= 0 && subjectIndex >= 0) {
        treeHtml += createArc(verbIndex, subjectIndex, 'nsubj', highlight === 'all' || highlight === 'subject');
    }
    
    // Verb to some fronted constituent parts
    if (verbIndex >= 0) {
        const frontedIndices = words.map((w, i) => frontedConstituent.includes(w) ? i : -1).filter(i => i >= 0);
        if (frontedIndices.length > 0) {
            const mainFrontedIndex = frontedIndices[0]; // Simplification: just use the first one
            treeHtml += createArc(verbIndex, mainFrontedIndex, 'advmod', highlight === 'all' || highlight === 'fronted');
        }
    }
    
    treeHtml += `
            </div>
        </div>
        <div class="legend mt-4">
            <div class="d-flex justify-content-center">
                <div class="me-3"><span class="legend-item highlight-fronted"></span> Fronted Constituent</div>
                <div class="me-3"><span class="legend-item highlight-verb"></span> Verb</div>
                <div><span class="legend-item highlight-subject"></span> Subject</div>
            </div>
        </div>
        <style>
            .dependency-tree {
                margin-top: 30px;
                position: relative;
            }
            .sentence-tokens {
                display: flex;
                justify-content: space-around;
                margin-bottom: 80px;
            }
            .token {
                display: flex;
                flex-direction: column;
                align-items: center;
                padding: 0 5px;
            }
            .word {
                font-weight: bold;
                margin-bottom: 5px;
            }
            .pos {
                font-size: 0.8rem;
                color: #6c757d;
            }
            .dependency-arcs {
                position: absolute;
                top: 30px;
                left: 0;
                right: 0;
                height: 80px;
            }
            .arc {
                position: absolute;
                border: 1px solid #6c757d;
                border-top-left-radius: 50%;
                border-top-right-radius: 50%;
                border-bottom: none;
            }
            .arc-label {
                position: absolute;
                top: -15px;
                left: 50%;
                transform: translateX(-50%);
                background: white;
                padding: 2px 5px;
                border-radius: 3px;
                font-size: 0.8rem;
            }
            .highlight-fronted {
                color: #0c5460;
                background-color: #d1ecf1;
            }
            .highlight-verb {
                color: #721c24;
                background-color: #f8d7da;
            }
            .highlight-subject {
                color: #155724;
                background-color: #d4edda;
            }
            .legend {
                text-align: center;
                font-size: 0.9rem;
            }
            .legend-item {
                display: inline-block;
                width: 15px;
                height: 15px;
                margin-right: 5px;
                vertical-align: middle;
            }
        </style>
    `;
    
    container.innerHTML = treeHtml;
}

// Helper function to create an arc between two tokens
function createArc(fromIndex, toIndex, label, highlight) {
    // Ensure indices are in the right order
    const start = Math.min(fromIndex, toIndex);
    const end = Math.max(fromIndex, toIndex);
    
    // Calculate arc width and height
    const width = (end - start) * 50; // Adjust based on token spacing
    const height = 30 + (end - start) * 5; // Higher arc for longer distances
    
    // Calculate arc position (centered over the tokens)
    const left = start * 50 + 25; // Adjust based on token spacing
    
    return `
        <div class="arc ${highlight ? 'arc-highlight' : ''}" 
             style="left: ${left}px; width: ${width}px; height: ${height}px; top: ${10 + (end - start) * 2}px;">
            <div class="arc-label">${label}</div>
        </div>
    `;
}

// Helper function to get a simplified part of speech tag
function getSimplePOS(word, isFronted, isVerb, isSubject) {
    if (isVerb) return 'VERB';
    if (isSubject) return 'SUBJ';
    if (isFronted) return 'FRONT';
    
    // Very simplified POS guessing (just for demonstration)
    if (/^(in|on|at|by|from|through|with|to|for)$/i.test(word)) return 'PREP';
    if (/^(a|an|the|this|that|these|those|my|your|his|her|its|our|their)$/i.test(word)) return 'DET';
    if (/^(and|or|but|yet|so|nor)$/i.test(word)) return 'CONJ';
    if (/^(one|two|three|first|second|third)$/i.test(word)) return 'NUM';
    if (/^(there|here|now|then)$/i.test(word)) return 'ADV';
    
    return 'NOUN'; // Default
}

// NEW: Run comparison analysis for two inversion types
function runComparisonAnalysis(type1, type2) {
    // Get examples for each type
    const examples1 = examplesData.filter(ex => ex.type === type1);
    const examples2 = examplesData.filter(ex => ex.type === type2);
    
    // Update comparison titles
    document.getElementById('comparison-title-1').textContent = type1.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    document.getElementById('comparison-title-2').textContent = type2.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    
    // Calculate statistics for type 1
    const stats1 = calculateTypeStatistics(type1, examples1);
    document.getElementById('comparison-stats-1').innerHTML = `
        <div class="mb-2"><strong>Total:</strong> ${formatNumber(stats1.count)} (${stats1.percentage}% of all inversions)</div>
        <div class="mb-2"><strong>Locative:</strong> ${stats1.locativePercentage}%</div>
        <div class="mb-2"><strong>Confidence:</strong> High ${stats1.confidenceHigh}%, Medium ${stats1.confidenceMedium}%, Low ${stats1.confidenceLow}%</div>
        <div><strong>Constituent Types:</strong> ${Object.entries(stats1.constituentTypes)
            .map(([type, percent]) => `${type} (${percent}%)`)
            .join(', ')}</div>
    `;
    
    // Calculate statistics for type 2
    const stats2 = calculateTypeStatistics(type2, examples2);
    document.getElementById('comparison-stats-2').innerHTML = `
        <div class="mb-2"><strong>Total:</strong> ${formatNumber(stats2.count)} (${stats2.percentage}% of all inversions)</div>
        <div class="mb-2"><strong>Locative:</strong> ${stats2.locativePercentage}%</div>
        <div class="mb-2"><strong>Confidence:</strong> High ${stats2.confidenceHigh}%, Medium ${stats2.confidenceMedium}%, Low ${stats2.confidenceLow}%</div>
        <div><strong>Constituent Types:</strong> ${Object.entries(stats2.constituentTypes)
            .map(([type, percent]) => `${type} (${percent}%)`)
            .join(', ')}</div>
    `;
    
    // Show representative examples for each type
    displayComparisonExamples(examples1, 'comparison-examples-1');
    displayComparisonExamples(examples2, 'comparison-examples-2');
}

// NEW: Calculate statistics for a specific inversion type
function calculateTypeStatistics(type, examples) {
    const count = summaryData.inversion_types[type] || 0;
    const percentage = (count / summaryData.total_inversions * 100).toFixed(1);
    
    const locativeCount = examples.filter(ex => ex.is_locative).length;
    const locativePercentage = (locativeCount / examples.length * 100).toFixed(1);
    
    const highConfidence = examples.filter(ex => ex.confidence === 'high').length;
    const mediumConfidence = examples.filter(ex => ex.confidence === 'medium').length;
    const lowConfidence = examples.filter(ex => ex.confidence === 'low').length;
    
    const confidenceHigh = (highConfidence / examples.length * 100).toFixed(1);
    const confidenceMedium = (mediumConfidence / examples.length * 100).toFixed(1);
    const confidenceLow = (lowConfidence / examples.length * 100).toFixed(1);
    
    // Calculate constituent type distribution
    const constituentTypes = {};
    examples.forEach(ex => {
        const type = ex.constituent_type;
        constituentTypes[type] = (constituentTypes[type] || 0) + 1;
    });
    
    Object.keys(constituentTypes).forEach(type => {
        constituentTypes[type] = (constituentTypes[type] / examples.length * 100).toFixed(1);
    });
    
    return {
        count,
        percentage,
        locativePercentage,
        confidenceHigh,
        confidenceMedium,
        confidenceLow,
        constituentTypes
    };
}

// NEW: Display comparison examples
function displayComparisonExamples(examples, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    // Select 3 representative examples (try to get a mix of locative/non-locative and confidence levels)
    let representative = [];
    
    // Try to get a high confidence example
    const high = examples.find(ex => ex.confidence === 'high');
    if (high) representative.push(high);
    
    // Try to get a locative example if not already included
    const locative = examples.find(ex => ex.is_locative && !representative.includes(ex));
    if (locative) representative.push(locative);
    
    // Try to get a non-locative example if not already included
    const nonLocative = examples.find(ex => !ex.is_locative && !representative.includes(ex));
    if (nonLocative) representative.push(nonLocative);
    
    // Fill up to 3 examples if needed
    while (representative.length < 3 && examples.length > representative.length) {
        const remaining = examples.filter(ex => !representative.includes(ex));
        if (remaining.length > 0) {
            representative.push(remaining[0]);
        } else {
            break;
        }
    }
    
    // Display the examples
    container.innerHTML = '';
    
    representative.forEach((example, index) => {
        // Highlight fronted constituent and verb
        let highlightedSentence = example.sentence;
        if (example.fronted_constituent && example.verb) {
            try {
                highlightedSentence = example.sentence
                    .replace(new RegExp(escapeRegExp(example.fronted_constituent), 'i'), 
                           `<span class="highlight">$&</span>`)
                    .replace(new RegExp(`\\b${escapeRegExp(example.verb)}\\b(?![^<]*>)`, 'i'), 
                           `<span class="highlight">$&</span>`);
            } catch (e) {
                highlightedSentence = example.sentence;
            }
        }
        
        const exampleDiv = document.createElement('div');
        exampleDiv.className = 'example-item border-bottom pb-2 mb-2';
        exampleDiv.innerHTML = `
            <div class="small text-muted">Example ${index + 1} (${example.confidence} confidence, ${example.is_locative ? 'locative' : 'non-locative'})</div>
            <p>${highlightedSentence}</p>
            <div class="small">
                <div><strong>Fronted:</strong> "${example.fronted_constituent}"</div>
                <div><strong>Verb:</strong> "${example.verb}"</div>
                <div><strong>Subject:</strong> "${example.subject}"</div>
            </div>
        `;
        
        container.appendChild(exampleDiv);
    });
}

// Update pagination controls
function updatePagination(totalPages) {
    const pagination = document.getElementById('pagination');
    if (!pagination) return;
    
    pagination.innerHTML = '';
    
    // Only show pagination if we have multiple pages
    if (totalPages <= 1) return;
    
    // Previous button
    const prevLi = document.createElement('li');
    prevLi.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
    prevLi.innerHTML = `<a class="page-link" href="#" aria-label="Previous">
                            <span aria-hidden="true">&laquo;</span>
                        </a>`;
    if (currentPage > 1) {
        prevLi.addEventListener('click', (e) => {
            e.preventDefault();
            currentPage--;
            displayExamples();
        });
    }
    pagination.appendChild(prevLi);
    
    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        // Skip some pages if we have too many
        if (totalPages > 7) {
            // Always show first page, last page, current page and 1 page before/after current
            if (i !== 1 && i !== totalPages && 
                (i < currentPage - 1 || i > currentPage + 1) &&
                // For first/last pages, also show 2nd/2nd last pages
                ((currentPage > 4 && i === 2) || 
                 (currentPage < totalPages - 3 && i === totalPages - 1))) {
                
                // Add ellipsis if needed (only once per gap)
                if (i === 2 || i === totalPages - 1) {
                    const ellipsisLi = document.createElement('li');
                    ellipsisLi.className = 'page-item disabled';
                    ellipsisLi.innerHTML = '<span class="page-link">...</span>';
                    pagination.appendChild(ellipsisLi);
                }
                continue;
            }
        }
        
        const pageLi = document.createElement('li');
        pageLi.className = `page-item ${i === currentPage ? 'active' : ''}`;
        pageLi.innerHTML = `<a class="page-link" href="#">${i}</a>`;
        
        if (i !== currentPage) {
            pageLi.addEventListener('click', (e) => {
                e.preventDefault();
                currentPage = i;
                displayExamples();
            });
        }
        
        pagination.appendChild(pageLi);
    }
    
    // Next button
    const nextLi = document.createElement('li');
    nextLi.className = `page-item ${currentPage === totalPages ? 'disabled' : ''}`;
    nextLi.innerHTML = `<a class="page-link" href="#" aria-label="Next">
                            <span aria-hidden="true">&raquo;</span>
                        </a>`;
    if (currentPage < totalPages) {
        nextLi.addEventListener('click', (e) => {
            e.preventDefault();
            currentPage++;
            displayExamples();
        });
    }
    pagination.appendChild(nextLi);
}

// Show example details in a modal with enhanced information
function showExampleDetails(example) {
    // Create modal if it doesn't exist
    let modal = document.getElementById('example-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.id = 'example-modal';
        modal.setAttribute('tabindex', '-1');
        modal.setAttribute('aria-labelledby', 'example-modal-label');
        modal.setAttribute('aria-hidden', 'true');
        
        modal.innerHTML = `
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="example-modal-label">Inversion Example Details</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body" id="example-modal-body">
                        <!-- Content will be dynamically inserted -->
                    </div>
                    <div class="modal-footer d-flex justify-content-between">
                        <div>
                            <button type="button" class="btn btn-outline-primary" id="add-to-comparison">
                                <i class="bi bi-plus-circle"></i> Add to Comparison
                            </button>
                        </div>
                        <div>
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add event listener for "Add to Comparison" button
        const addToComparisonBtn = modal.querySelector('#add-to-comparison');
        addToComparisonBtn.addEventListener('click', () => {
            // Add the current example to comparison list
            addExampleToComparison(example);
            
            // Show feedback
            const feedbackDiv = document.createElement('div');
            feedbackDiv.className = 'alert alert-success mt-3';
            feedbackDiv.innerHTML = `<i class="bi bi-check-circle"></i> Added to comparison view.`;
            
            document.getElementById('example-modal-body').appendChild(feedbackDiv);
            
            // Hide feedback after 2 seconds
            setTimeout(() => {
                feedbackDiv.remove();
            }, 2000);
        });
    }
    
    // Update modal content
    const modalBody = document.getElementById('example-modal-body');
    
    // Get discipline for file
    const discipline = example.file ? getDisciplineForFile(example.file) : "Unknown";
    
    // Create confidence badge
    const confidenceBadge = `<span class="badge badge-${example.confidence} bg-${
        example.confidence === 'high' ? 'success' : 
        example.confidence === 'medium' ? 'warning' : 'danger'
    }">${example.confidence}</span>`;
    
    modalBody.innerHTML = `
        <ul class="nav nav-tabs" id="exampleDetailTabs" role="tablist">
            <li class="nav-item" role="presentation">
                <button class="nav-link active" id="basic-tab" data-bs-toggle="tab" data-bs-target="#basic-info" 
                    type="button" role="tab" aria-controls="basic-info" aria-selected="true">
                    Basic Info
                </button>
            </li>
            <li class="nav-item" role="presentation">
                <button class="nav-link" id="structure-tab" data-bs-toggle="tab" data-bs-target="#structure-info" 
                    type="button" role="tab" aria-controls="structure-info" aria-selected="false">
                    Structure
                </button>
            </li>
            <li class="nav-item" role="presentation">
                <button class="nav-link" id="context-tab" data-bs-toggle="tab" data-bs-target="#context-info" 
                    type="button" role="tab" aria-controls="context-info" aria-selected="false">
                    Context
                </button>
            </li>
        </ul>
        
        <div class="tab-content p-3 border border-top-0 rounded-bottom" id="exampleDetailTabsContent">
            <!-- Basic Info Tab -->
            <div class="tab-pane fade show active" id="basic-info" role="tabpanel" aria-labelledby="basic-tab">
                <div class="mb-4">
                    <h6>Sentence:</h6>
                    <p class="border-bottom pb-2">${example.sentence}</p>
                </div>
                
                <div class="row mb-3">
                    <div class="col-md-6">
                        <h6>Type:</h6>
                        <p>${example.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
                    </div>
                    <div class="col-md-6">
                        <h6>Constituent Type:</h6>
                        <p>${example.constituent_type}</p>
                    </div>
                </div>
                
                <div class="row mb-3">
                    <div class="col-md-6">
                        <h6>Confidence:</h6>
                        <p>${confidenceBadge}</p>
                    </div>
                    <div class="col-md-6">
                        <h6>Discipline:</h6>
                        <p>${discipline}</p>
                    </div>
                </div>
                
                <div class="row">
                    <div class="col-md-6">
                        <h6>Locative:</h6>
                        <p>${example.is_locative ? 'Yes' : 'No'}</p>
                    </div>
                    <div class="col-md-6">
                        <h6>File:</h6>
                        <p>${example.file || 'Unknown'}</p>
                    </div>
                </div>
            </div>
            
            <!-- Structure Tab -->
            <div class="tab-pane fade" id="structure-info" role="tabpanel" aria-labelledby="structure-tab">
                <div class="alert alert-info">
                    This tab shows the structural breakdown of the inversion pattern.
                </div>
                
                <div class="row mb-3">
                    <div class="col-md-4">
                        <div class="card h-100">
                            <div class="card-header bg-primary text-white">Fronted Constituent</div>
                            <div class="card-body">
                                <p class="text-primary">${example.fronted_constituent}</p>
                                <small class="text-muted">Type: ${example.constituent_type}</small>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="card h-100">
                            <div class="card-header bg-danger text-white">Verb</div>
                            <div class="card-body">
                                <p class="text-danger">${example.verb}</p>
                                <small class="text-muted">Position: After fronted constituent</small>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="card h-100">
                            <div class="card-header bg-success text-white">Subject</div>
                            <div class="card-body">
                                <p class="text-success">${example.subject || 'Unknown subject'}</p>
                                <small class="text-muted">Position: After verb</small>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="row">
                    <div class="col-12">
                        <div class="card">
                            <div class="card-header">Inversion Pattern</div>
                            <div class="card-body">
                                <div class="pattern-visualization">
                                    <div class="d-flex justify-content-center align-items-center">
                                        <div class="pattern-part fronted p-2 border rounded me-2">
                                            Fronted Constituent
                                        </div>
                                        <i class="bi bi-arrow-right mx-2"></i>
                                        <div class="pattern-part verb p-2 border rounded me-2">
                                            Verb
                                        </div>
                                        <i class="bi bi-arrow-right mx-2"></i>
                                        <div class="pattern-part subject p-2 border rounded">
                                            Subject
                                        </div>
                                    </div>
                                    <div class="text-center mt-3">
                                        <small class="text-muted">Unlike standard English SVO order: Subject → Verb → Object</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Context Tab -->
            <div class="tab-pane fade" id="context-info" role="tabpanel" aria-labelledby="context-tab">
                <div class="previous-sentence mb-3">
                    <h6>Previous Sentence:</h6>
                    <p class="text-muted border-bottom pb-2">${example.previous_sentence || 'No previous sentence available.'}</p>
                </div>
                
                <div class="current-sentence mb-3">
                    <h6>Current Sentence:</h6>
                    <p class="fw-bold border-bottom pb-2">${example.sentence}</p>
                </div>
                
                <div class="next-sentence">
                    <h6>Next Sentence:</h6>
                    <p class="text-muted">${example.next_sentence || 'No next sentence available.'}</p>
                </div>
            </div>
        </div>
    `;
    
    // Show the modal
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();
}

// NEW: Add example to comparison section
function addExampleToComparison(example) {
    if (!comparisonExamples.some(ex => ex.sentence === example.sentence)) {
        comparisonExamples.push(example);
        
        // Update comparison type dropdowns if needed
        const compType1 = document.getElementById('comparison-type-1');
        const compType2 = document.getElementById('comparison-type-2');
        
        if (compType1 && compType2) {
            // If first dropdown is empty, set it to this example's type
            if (!compType1.value) {
                compType1.value = example.type;
            }
            // Otherwise if second dropdown is empty and different from first, set it
            else if (!compType2.value && compType1.value !== example.type) {
                compType2.value = example.type;
            }
        }
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', loadData);