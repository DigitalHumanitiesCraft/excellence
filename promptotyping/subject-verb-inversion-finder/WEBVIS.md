# Web Visualization for Subject-Verb Inversion Analysis

This document provides an overview of the web-based visualization system for the subject-verb inversion analysis project. The visualization makes the linguistic analysis results accessible and interactive through charts, statistics, and an example explorer with enhanced interactive features.

## Overview

The web visualization is built as a responsive, single-page application using modern web technologies. It transforms the raw analysis data into interactive visualizations that allow users to explore patterns of subject-verb inversion in academic English. The system offers comprehensive exploration capabilities including contextual analysis, syntactic structure visualization, cross-type comparison, and academic discipline filtering.

## Architecture

### Components

The visualization consists of three main files:

1. **index.html**: Provides the page structure and layout
2. **styles.css**: Contains all styling rules
3. **visualization.js**: Handles data loading, interactivity, and chart creation

Additionally, there's a Python-based data converter script:

4. **data-converter.py**: Processes the analysis results into visualization-friendly JSON files

### Data Flow

The data flow follows this process:

1. Analysis scripts (`subject-verb-inversion-finder.py`) generate raw analysis results
2. Data converter transforms the raw results into JSON files
3. Web visualization loads these JSON files
4. Interactive UI components render the data visually

### Technology Stack

- **HTML5**: Page structure
- **CSS3**: Styling (with Bootstrap for responsive layout)
- **JavaScript**: Core functionality
- **Chart.js**: Data visualization library
- **Bootstrap 5**: UI framework for responsive design
- **Bootstrap Icons**: Icon library for UI components
- **GitHub Pages**: Hosting platform

## Data Structure

The visualization uses five JSON data files:

1. **summary.json**: Contains overall statistics
2. **examples.json**: Contains a curated set of inversion examples
3. **distributions.json**: Contains frequency distributions for charts
4. **config.json**: Visualization configuration (colors, labels, etc.)
5. **disciplines.json**: Maps corpus files to academic disciplines

### summary.json Structure

```json
{
  "total_files": 5,
  "total_paragraphs": 4450,
  "total_sentences": 712617,
  "total_inversions": 17973,
  "locative_inversions": 9270,
  "non_locative_inversions": 8703,
  "complex_inversions_count": 6073,
  "constituent_types": {
    "AdvP (Existential)": 5454,
    "Numeric Expression": 4503,
    "PP (Prepositional Phrase)": 2478,
    /* other types */
  },
  "confidence_levels": {
    "high": 6913,
    "medium": 10975,
    "low": 85
  },
  "inversion_types": {
    "existential": 5454,
    "numeric_inversion": 4503,
    /* other types */
  },
  "inversions_by_file": {
    "text_acad_2010.txt": 3969,
    /* other files */
  }
}
```

### examples.json Structure

An array of example objects:

```json
[
  {
    "type": "numeric_inversion",
    "sentence": "Two inquired about the artist and actual date of the flag...",
    "constituent_type": "Numeric Expression",
    "fronted_constituent": "Two inquired about the artist...",
    "verb": "was",
    "subject": "this information was simply out of reach",
    "is_locative": false,
    "confidence": "high",
    "previous_sentence": "The previous sentence provides context.",
    "next_sentence": "The next sentence provides additional context."
  },
  /* more examples */
]
```

### disciplines.json Structure

Maps corpus files to academic disciplines:

```json
{
  "categories": [
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
  ],
  "mappings": {
    "text_acad_2000.txt": "Linguistics",
    "text_acad_2001.txt": "Literature",
    "text_acad_2002.txt": "History",
    "text_acad_2003.txt": "Sociology",
    "text_acad_2004.txt": "Biology"
  }
}
```

## Features

### 1. Dashboard Overview

The visualization begins with a dashboard showing key statistics:

- Total inversions found
- Percentage of sentences containing inversions
- Locative inversion count
- Complex inversion count

### 2. Interactive Charts

Three main chart visualizations:

- **Constituent Types (Doughnut Chart)**: Distribution of syntactic categories
- **Confidence Levels (Pie Chart)**: Breakdown by confidence rating
- **Inversion Types (Bar Chart)**: Distribution of different inversion patterns

All charts feature interactive tooltips, displaying both counts and percentages on hover.

### 3. Example Explorer

A filterable, paginated explorer for inversion examples:

- Filter by inversion type
- Filter by constituent type
- Filter by confidence level
- Filter by locative/non-locative status
- Filter by academic discipline
- Toggle filter visibility for a cleaner interface

The example explorer highlights the fronted constituent and verb in each sentence.

### 4. Detail View

Clicking on any example opens a detailed modal view with comprehensive information:

- Complete sentence with highlighted components
- Tabbed interface with:
  - Basic Info: Type, constituent, confidence, discipline
  - Structure: Breakdown of fronted constituent, verb, and subject
  - Context: Previous and next sentences
- "Add to Comparison" button for comparative analysis

### 5. Sentence Context View

A dedicated section showing the context around each example:

- Previous sentence (if available)
- Current sentence (highlighted)
- Next sentence (if available)
- Collapsible interface for space efficiency

### 6. Syntax Tree Visualization

Interactive visualization of the syntactic structure of each example:

- Two visualization modes:
  - **Constituency Tree**: Shows hierarchical syntactic structure
  - **Dependency Tree**: Shows relationships between words
- Component highlighting options:
  - All components (fronted constituent, verb, subject)
  - Fronted constituent only
  - Verb only
  - Subject only
- Color-coded nodes for easy identification

### 7. Inversion Type Comparison

Side-by-side comparison of different inversion types:

- Select any two inversion types to compare
- View statistics for each type:
  - Total count and percentage
  - Locative percentage
  - Confidence level distribution
  - Constituent type breakdown
- See representative examples with highlighted components
- Examples can be added to comparison from the detail view

### 8. Academic Discipline Filtering

Filter examples by their academic field:

- Based on source corpus files
- Categorized by discipline (Linguistics, Literature, etc.)
- Dynamically generated if mapping file is unavailable
- View discipline distribution in the comparison view

### 9. About Section

An informative section explaining:

- What subject-verb inversion is
- Types of inversions analyzed
- Examples of each type with frequency statistics

## Implementation Details

### Data Loading

The visualization uses asynchronous fetch requests to load the JSON data files:

```javascript
async function loadData() {
    try {
        const summaryResponse = await fetch('visualization_data/summary.json');
        if (!summaryResponse.ok) throw new Error(`HTTP error ${summaryResponse.status}`);
        summary = await summaryResponse.json();
        
        // Load other data files similarly
        
        // Try to load disciplines data or generate it if not available
        try {
            const disciplinesResponse = await fetch('visualization_data/disciplines.json');
            if (!disciplinesResponse.ok) {
                disciplines = generateDisciplineData(examples);
            } else {
                disciplines = await disciplinesResponse.json();
            }
        } catch (error) {
            disciplines = generateDisciplineData(examples);
        }
        
        // Initialize visualization when data is loaded
        initializeVisualization();
    } catch (error) {
        // Error handling
    }
}
```

### Chart Creation

Charts are created using Chart.js. For example, the constituent types chart:

```javascript
function createConstituentChart() {
    const canvas = document.getElementById('constituent-chart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Extract data
    const labels = Object.keys(summaryData.constituent_types);
    const data = Object.values(summaryData.constituent_types);
    
    // Create chart
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
            // Chart options
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
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
}
```

### Example Filtering

The visualization provides dynamic filtering of examples:

```javascript
function filterExamples() {
    const typeFilter = document.getElementById('type-filter')?.value || '';
    const constituentFilter = document.getElementById('constituent-filter')?.value || '';
    const confidenceFilter = document.getElementById('confidence-filter')?.value || '';
    const locativeFilter = document.getElementById('locative-filter')?.value || '';
    const disciplineFilter = document.getElementById('discipline-filter')?.value || '';
    
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
        
        // Discipline filter
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
```

### Context View Implementation

The context view dynamically displays surrounding sentences:

```javascript
function updateContextView(example) {
    const contextContent = document.getElementById('context-content');
    const previousSentence = document.getElementById('previous-sentence');
    const currentSentence = document.getElementById('current-sentence');
    const nextSentence = document.getElementById('next-sentence');
    
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
```

### Syntax Tree Visualization

Two types of tree visualizations are implemented:

#### Constituency Tree

Displays hierarchical syntactic structure:

```javascript
function renderConstituencyTree(example, container, highlight) {
    // Extract key parts
    const frontedConstituent = example.fronted_constituent?.split(/\s+/) || [];
    const verb = example.verb;
    const subject = example.subject?.split(/\s+/) || [];
    
    // Build tree HTML
    const treeHtml = `
        <div class="syntax-tree text-center">
            <div class="tree-node tree-root">
                <div class="node-label">S (Sentence)</div>
                <div class="node-children">
                    <div class="tree-node ${highlight === 'fronted' || highlight === 'all' ? 'highlight-fronted' : ''}">
                        <div class="node-label">Fronted (${example.constituent_type})</div>
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
    `;
    
    container.innerHTML = treeHtml;
}
```

#### Dependency Tree

Displays relationships between words in the sentence:

```javascript
function renderDependencyTree(example, container, highlight) {
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
    
    // Add tokens with POS tags
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
    
    // Add arcs between related words
    const verbIndex = words.findIndex(w => w === verb);
    const subjectIndex = words.findIndex(w => subject.includes(w));
    
    if (verbIndex >= 0 && subjectIndex >= 0) {
        treeHtml += createArc(verbIndex, subjectIndex, 'nsubj', highlight === 'all' || highlight === 'subject');
    }
    
    // Add legend
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
    `;
    
    container.innerHTML = treeHtml;
}
```

### Comparison View Implementation

The comparison view allows side-by-side analysis of inversion types:

```javascript
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
    
    // Calculate statistics for type 2 (similar to above)
    
    // Show representative examples for each type
    displayComparisonExamples(examples1, 'comparison-examples-1');
    displayComparisonExamples(examples2, 'comparison-examples-2');
}
```

### Academic Discipline Processing

Discipline metadata is either loaded from JSON or dynamically generated:

```javascript
function generateDisciplineData(examples) {
    const disciplines = {
        mappings: {},
        categories: [
            "Linguistics", "Literature", "Biology", "Chemistry", 
            "Physics", "Mathematics", "History", "Psychology", 
            "Sociology", "Economics", "Other"
        ]
    };

    // Extract unique filenames
    const files = [...new Set(examples.map(ex => ex.file || "unknown"))];

    // Assign disciplines based on patterns in filenames
    files.forEach(file => {
        let name = file.toLowerCase();
        
        // Simple pattern matching for discipline assignment
        if (name.includes('ling') || name.includes('lang')) {
            disciplines.mappings[file] = "Linguistics";
        } else if (name.includes('lit') || name.includes('novel')) {
            disciplines.mappings[file] = "Literature";
        }
        // Other discipline mappings...
    });

    return disciplines;
}
```

### Enhanced Modal with Tabs

The modal implementation includes a tabbed interface for better information organization:

```javascript
function showExampleDetails(example) {
    // Modal HTML content with tabs
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
            <!-- Tab content for Basic Info -->
            <div class="tab-pane fade show active" id="basic-info" role="tabpanel" aria-labelledby="basic-tab">
                <!-- Basic info content -->
            </div>
            
            <!-- Tab content for Structure -->
            <div class="tab-pane fade" id="structure-info" role="tabpanel" aria-labelledby="structure-tab">
                <!-- Structure content -->
            </div>
            
            <!-- Tab content for Context -->
            <div class="tab-pane fade" id="context-info" role="tabpanel" aria-labelledby="context-tab">
                <!-- Context content -->
            </div>
        </div>
    `;
    
    // Add event listener for "Add to Comparison" button
    const addToComparisonBtn = modal.querySelector('#add-to-comparison');
    addToComparisonBtn.addEventListener('click', () => {
        addExampleToComparison(example);
    });
}
```

### Responsive Design

The visualization is fully responsive, adapting to different screen sizes:

- **Desktop (>1200px)**: Full layout with all features visible
- **Laptop (992px-1199px)**: Slightly reduced chart sizes and font sizes
- **Tablet (768px-991px)**: Two-column layout for charts
- **Mobile (<768px)**: 
  - Stacked single-column layout
  - Collapsible filter section
  - Scrollable tables and trees
  - Simplified pattern visualization
  - Vertical stacking for comparison view

```css
/* Responsive adjustments */
@media (max-width: 1199px) {
    .stats-number {
        font-size: 2.2rem;
    }
    
    .chart-container {
        height: 350px;
    }
}

@media (max-width: 991px) {
    .stats-number {
        font-size: 1.8rem;
    }
    
    .chart-container {
        height: 300px;
    }
    
    .card-header h5 {
        font-size: 1.1rem;
    }
}

@media (max-width: 768px) {
    .stats-number {
        font-size: 1.5rem;
    }
    
    .syntax-tree {
        overflow-x: scroll;
    }
    
    .pattern-visualization {
        flex-direction: column;
    }
    
    .pattern-part {
        margin-bottom: 10px;
    }
}
```

## Data Converter

The `data-converter.py` script processes raw analysis results into visualization-friendly JSON:

1. Loads the analysis summary from `inversion_analysis_summary.json`
2. Samples representative examples from `inversion_analysis_examples.csv`
3. Creates optimized data structures for visualization
4. Saves JSON files (summary, examples, distributions, config)
5. Optionally creates discipline mappings based on file patterns

## Setup Instructions

To set up the visualization:

1. Run analysis with `subject-verb-inversion-finder.py`
2. Convert results with `data-converter.py`
3. Ensure the correct file structure:
   ```
   your-repo-root/
   ├── index.html
   ├── styles.css
   ├── visualization.js
   └── visualization_data/
       ├── summary.json
       ├── examples.json
       ├── distributions.json
       ├── config.json
       └── disciplines.json (optional)
   ```
4. Open `index.html` in a browser or enable GitHub Pages in repository settings

## Browser Compatibility

The visualization is compatible with modern browsers:

- Chrome 80+
- Firefox 75+
- Safari 13.1+
- Edge 80+

Older browsers may have limited functionality for some interactive features.

## Troubleshooting

Common issues and solutions:

- **Charts not rendering**: Ensure Canvas elements exist and Chart.js is properly loaded
- **Data not loading**: Check JSON file paths and format
- **Mobile display issues**: Verify responsive CSS is working correctly
- **Syntax trees not displaying**: Check browser console for JavaScript errors
- **Discipline filtering not working**: Verify disciplines.json format or automatic generation
- **Context sentences missing**: These are optional in the examples.json file