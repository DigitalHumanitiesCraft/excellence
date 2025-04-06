// visualizations.js

/**
 * Collection to keep track of active Chart instances
 * Key: canvasId, Value: Chart instance
 */
const activeCharts = {};

// Make activeCharts accessible to the window scope for dark mode toggle
window.activeCharts = activeCharts;

/**
 * Destroys an existing chart instance if it exists.
 * @param {string} canvasId - The ID of the canvas element.
 */
function destroyChart(canvasId) {
    if (activeCharts[canvasId]) {
        activeCharts[canvasId].destroy();
        delete activeCharts[canvasId];
    }
}

/**
 * Generates an array of distinct colors for charts.
 * @param {number} count - Number of colors needed.
 * @param {boolean} isDarkMode - Whether dark mode is active.
 * @returns {string[]} Array of color strings.
 */
function generateColors(count, isDarkMode = false) {
    // Bootstrap 5 colors
    const baseColors = isDarkMode ? 
        [
            'rgba(13, 110, 253, 0.8)',   // primary
            'rgba(25, 135, 84, 0.8)',    // success
            'rgba(255, 193, 7, 0.8)',    // warning
            'rgba(220, 53, 69, 0.8)',    // danger
            'rgba(13, 202, 240, 0.8)',   // info
            'rgba(111, 66, 193, 0.8)',   // purple
            'rgba(253, 126, 20, 0.8)',   // orange
            'rgba(32, 201, 151, 0.8)'    // teal
        ] : 
        [
            'rgba(13, 110, 253, 0.7)',   // primary
            'rgba(25, 135, 84, 0.7)',    // success
            'rgba(255, 193, 7, 0.7)',    // warning
            'rgba(220, 53, 69, 0.7)',    // danger
            'rgba(13, 202, 240, 0.7)',   // info
            'rgba(111, 66, 193, 0.7)',   // purple
            'rgba(253, 126, 20, 0.7)',   // orange
            'rgba(32, 201, 151, 0.7)'    // teal
        ];
    
    // Create color array by cycling through the base colors
    const colors = [];
    for (let i = 0; i < count; i++) {
        colors.push(baseColors[i % baseColors.length]);
    }
    
    return colors;
}

/**
 * Generates border colors from background colors.
 * @param {string[]} backgroundColors - Array of background color strings.
 * @returns {string[]} Array of border color strings.
 */
function generateBorderColors(backgroundColors) {
    return backgroundColors.map(color => {
        // Create a darker border color by reducing the alpha channel
        return color.replace(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*[\d.]+\)/, 'rgba($1, $2, $3, 1.0)');
    });
}

/**
 * Changes the type of an existing chart
 * @param {string} canvasId - The ID of the canvas element.
 * @param {string} newType - New chart type (bar, pie, polarArea, etc.)
 */
export function changeChartType(canvasId, newType) {
    const chartInstance = activeCharts[canvasId];
    if (!chartInstance) {
        console.error(`No chart found with ID ${canvasId}`);
        return;
    }
    
    // Store current data and options
    const data = chartInstance.data;
    const options = chartInstance.options;
    
    // Create a new chart with the same data but different type
    destroyChart(canvasId);
    
    // If we were changing from a bar chart to a different type or vice versa,
    // we need to adjust some options
    if (newType !== 'bar') {
        // For non-bar charts, we want to show the legend
        options.plugins.legend.display = true;
        
        // Remove scales options that only apply to bar charts
        if (options.scales) {
            delete options.scales.x;
            delete options.scales.y;
        }
        
        // Add specific options for pie/doughnut charts
        if (newType === 'pie' || newType === 'doughnut') {
            options.cutout = newType === 'doughnut' ? '50%' : 0;
        }
    } else {
        // For bar charts, configure scales
        options.scales = {
            y: {
                beginAtZero: true,
                title: { 
                    display: true, 
                    text: 'Number of Entries',
                    font: { size: 14, weight: 'bold' } 
                },
                grid: { 
                    color: document.body.classList.contains('dark-mode') ? 
                        'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                    drawBorder: false
                }
            },
            x: {
                title: { 
                    display: true, 
                    text: 'Category',
                    font: { size: 14, weight: 'bold' } 
                },
                grid: { display: false }
            }
        };
        options.plugins.legend.display = false;
    }
    
    // Create the new chart
    const ctx = document.getElementById(canvasId).getContext('2d');
    activeCharts[canvasId] = new Chart(ctx, {
        type: newType,
        data: data,
        options: options
    });
}

// Make changeChartType accessible to window for UI controls
window.changeChartType = changeChartType;

/**
 * Creates or updates the overview chart showing counts per category.
 * @param {string} canvasId - The ID of the canvas element.
 * @param {Array} categoriesData - Data for the chart.
 * @param {string} chartType - Type of chart to create (bar, pie, polarArea).
 */
export function createOverviewChart(canvasId, categoriesData, chartType = 'bar') {
    destroyChart(canvasId); // Ensure previous chart is removed

    const ctx = document.getElementById(canvasId)?.getContext('2d');
    if (!ctx) {
        console.error(`Canvas element with ID ${canvasId} not found.`);
        return;
    }

    // Make function accessible to window for dark mode toggle
    window.createOverviewChart = createOverviewChart;
    window.allProcessedData = categoriesData;
    
    const isDarkMode = document.body.classList.contains('dark-mode');
    
    // Prepare data
    const labels = categoriesData.map(item => item.key.charAt(0).toUpperCase() + item.key.slice(1));
    const dataCounts = categoriesData.map(item => item.resultData?.count || 0);
    const backgroundColors = generateColors(labels.length, isDarkMode);
    const borderColors = generateBorderColors(backgroundColors);
    
    // Common configuration options
    const fontColor = isDarkMode ? '#f8f9fa' : '#495057';
    const gridColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    
    // Chart type specific options
    let options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: chartType !== 'bar',
                position: 'right',
                labels: {
                    color: fontColor,
                    padding: 20,
                    usePointStyle: true,
                    pointStyle: 'circle'
                }
            },
            tooltip: {
                backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.8)' : 'rgba(0, 0, 0, 0.7)',
                titleFont: { size: 16, weight: 'bold' },
                bodyFont: { size: 14 },
                padding: 12,
                cornerRadius: 6,
                callbacks: {
                    label: function(context) {
                        const value = context.raw || context.parsed.y || 0;
                        return ` Entries: ${value.toLocaleString()}`;
                    }
                }
            },
            title: {
                display: false,
                text: 'Number of Entries per Category',
                color: fontColor,
                font: { size: 18, weight: 'bold' }
            }
        },
        animation: {
            duration: 1000,
            easing: 'easeOutQuart'
        }
    };
    
    // Add chart type specific options
    if (chartType === 'bar') {
        options.scales = {
            y: {
                beginAtZero: true,
                title: { 
                    display: true, 
                    text: 'Number of Entries',
                    color: fontColor,
                    font: { size: 14, weight: 'bold' } 
                },
                grid: { 
                    color: gridColor,
                    drawBorder: false
                },
                ticks: {
                    color: fontColor
                }
            },
            x: {
                title: { 
                    display: true, 
                    text: 'Category',
                    color: fontColor,
                    font: { size: 14, weight: 'bold' } 
                },
                grid: { display: false },
                ticks: {
                    color: fontColor
                }
            }
        };
        options.plugins.legend.display = false;
        
        // Add click handler for bar charts
        options.onClick = function(e, elements) {
            if (elements.length > 0) {
                const index = elements[0].index;
                const categoryKey = categoriesData[index].key;
                
                // Scroll to the category detail card
                const detailCard = document.getElementById(`detail-${categoryKey}`);
                if (detailCard) {
                    detailCard.scrollIntoView({ behavior: 'smooth' });
                    
                    // Add a highlight effect to the card
                    detailCard.classList.add('highlight-card');
                    setTimeout(() => {
                        detailCard.classList.remove('highlight-card');
                    }, 2000);
                }
            }
        };
        
        // Change cursor on hover
        options.onHover = (event, elements) => {
            event.native.target.style.cursor = elements.length ? 'pointer' : 'default';
        };
    } else if (chartType === 'pie' || chartType === 'doughnut') {
        options.cutout = chartType === 'doughnut' ? '50%' : 0;
    } else if (chartType === 'polarArea') {
        // PolarArea specific options
        options.scales = {
            r: {
                ticks: {
                    color: fontColor,
                    backdropColor: isDarkMode ? 'rgba(0, 0, 0, 0)' : 'rgba(255, 255, 255, 0)'
                },
                grid: {
                    color: gridColor
                },
                angleLines: {
                    color: gridColor
                }
            }
        };
    }
    
    // Create the chart
    activeCharts[canvasId] = new Chart(ctx, {
        type: chartType,
        data: {
            labels: labels,
            datasets: [{
                label: 'Number of Entries',
                data: dataCounts,
                backgroundColor: backgroundColors,
                borderColor: borderColors,
                borderWidth: 1,
                borderRadius: chartType === 'bar' ? 6 : 0,
                hoverOffset: 4
            }]
        },
        options: options
    });
}

/**
 * Creates or updates a detail chart (horizontal bar chart) for category details.
 * @param {string} canvasId - The ID of the canvas element.
 * @param {string} chartLabel - Label for the dataset.
 * @param {Array<{item: string, count: number}>} data - Array of items and their counts.
 */
export function createDetailChart(canvasId, chartLabel, data) {
    destroyChart(canvasId); // Ensure previous chart is removed

    const ctx = document.getElementById(canvasId)?.getContext('2d');
    if (!ctx || !data || data.length === 0) {
        return;
    }

    const isDarkMode = document.body.classList.contains('dark-mode');
    const fontColor = isDarkMode ? '#f8f9fa' : '#495057';
    const gridColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    
    // Prepare data
    const labels = data.map(d => {
        // Shorten long labels for display in the chart axis
        const maxLen = 40;
        return d.item.length > maxLen ? d.item.substring(0, maxLen - 3) + '...' : d.item;
    });
    const fullLabels = data.map(d => d.item); // Keep full labels for tooltips
    const dataCounts = data.map(d => d.count);
    
    // Get a color based on chartLabel to ensure consistent coloring per category
    const colorIndex = chartLabel.charCodeAt(0) % 8; // Simple hash to get consistent color
    const backgroundColors = generateColors(1, isDarkMode);
    const backgroundColor = backgroundColors[colorIndex % backgroundColors.length];
    const borderColor = backgroundColor.replace(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*[\d.]+\)/, 'rgba($1, $2, $3, 1.0)');

    activeCharts[canvasId] = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: chartLabel,
                data: dataCounts,
                backgroundColor: backgroundColor,
                borderColor: borderColor,
                borderWidth: 1,
                borderRadius: 4,
            }]
        },
        options: {
            indexAxis: 'y', // Make it horizontal
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    beginAtZero: true,
                    title: { 
                        display: true, 
                        text: 'Count',
                        color: fontColor
                    },
                    grid: { 
                        color: gridColor 
                    },
                    ticks: {
                        color: fontColor
                    }
                },
                y: {
                    grid: { display: false },
                    ticks: {
                        color: fontColor
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.8)' : 'rgba(0, 0, 0, 0.7)',
                    titleFont: { size: 14 },
                    bodyFont: { size: 12 },
                    padding: 10,
                    cornerRadius: 4,
                    callbacks: {
                        // Show full label in tooltip
                        title: function(tooltipItems) {
                            const index = tooltipItems[0]?.dataIndex;
                            return (index !== undefined && index < fullLabels.length) ? fullLabels[index] : '';
                        },
                        label: function(context) {
                            return context.parsed?.x !== undefined ? ` Count: ${context.parsed.x}` : 'Count: N/A';
                        }
                    }
                }
            },
            animation: {
                duration: 800
            }
        }
    });
}

/**
 * Creates a timeline visualization for dated items
 * @param {string} containerId - The ID of the container element.
 * @param {Array} timelineData - Array of data objects with date information.
 */
export function createTimelineVisualization(containerId, timelineData) {
    const container = document.getElementById(containerId);
    if (!container || !timelineData || timelineData.length === 0) {
        return;
    }
    
    // Clear existing content
    container.innerHTML = '';
    
    // Group data by decades or periods
    const groupedData = groupDataByPeriod(timelineData);
    
    // Create timeline structure
    const timelineWrapper = document.createElement('div');
    timelineWrapper.className = 'timeline-wrapper position-relative my-4';
    
    // Add vertical line
    const line = document.createElement('div');
    line.className = 'timeline-line';
    timelineWrapper.appendChild(line);
    
    // Add timeline items
    let index = 0;
    Object.entries(groupedData).sort().forEach(([period, items]) => {
        const isLeft = index % 2 === 0;
        const timelineItem = document.createElement('div');
        timelineItem.className = 'row position-relative mb-5';
        
        // Create dot marker
        const dot = document.createElement('div');
        dot.className = 'position-absolute start-50 translate-middle rounded-circle';
        dot.style.cssText = 'width: 16px; height: 16px; background-color: var(--bs-primary); z-index: 2; top: 32px;';
        timelineItem.appendChild(dot);
        
        // Create content container
        const contentCol = document.createElement('div');
        contentCol.className = isLeft ? 'col-md-5 text-md-end me-md-auto' : 'col-md-5 ms-md-auto';
        
        // Create card
        const card = document.createElement('div');
        card.className = 'card shadow-sm';
        
        // Card header
        const cardHeader = document.createElement('div');
        cardHeader.className = 'card-header bg-primary text-white';
        const headerTitle = document.createElement('h5');
        headerTitle.className = 'card-title mb-0';
        headerTitle.textContent = period;
        cardHeader.appendChild(headerTitle);
        card.appendChild(cardHeader);
        
        // Card body
        const cardBody = document.createElement('div');
        cardBody.className = 'card-body';
        
        // Count info
        const countInfo = document.createElement('p');
        countInfo.className = 'fw-bold mb-2';
        countInfo.textContent = `${items.length} items`;
        cardBody.appendChild(countInfo);
        
        // Item list
        if (items.length > 0) {
            const listGroup = document.createElement('ul');
            listGroup.className = 'list-group list-group-flush';
            
            // Add top items (limit to 5)
            const displayItems = items.slice(0, 5);
            displayItems.forEach(item => {
                const listItem = document.createElement('li');
                listItem.className = 'list-group-item px-0';
                listItem.textContent = item.title || (item.textContent ? item.textContent.substring(0, 40) : 'Untitled');
                listGroup.appendChild(listItem);
            });
            
            // Add "more items" indicator if needed
            if (items.length > 5) {
                const moreItem = document.createElement('li');
                moreItem.className = 'list-group-item px-0 text-muted';
                moreItem.textContent = `+ ${items.length - 5} more items`;
                listGroup.appendChild(moreItem);
            }
            
            cardBody.appendChild(listGroup);
        }
        
        card.appendChild(cardBody);
        contentCol.appendChild(card);
        timelineItem.appendChild(contentCol);
        
        timelineWrapper.appendChild(timelineItem);
        index++;
    });
    
    container.appendChild(timelineWrapper);
}

/**
 * Helper function to group timeline data by time periods
 * @param {Array} data - Array of data objects with date/year information.
 * @returns {Object} Object with period keys and arrays of items.
 */
function groupDataByPeriod(data) {
    const groups = {};
    
    data.forEach(item => {
        let year = null;
        
        // Try to extract year from different possible data formats
        if (item.year) {
            year = parseInt(item.year, 10);
        } else if (item.date) {
            // Try to extract year from date string (assuming YYYY-MM-DD or similar format)
            const yearMatch = item.date.match(/(\d{4})/);
            if (yearMatch) {
                year = parseInt(yearMatch[1], 10);
            }
        } else if (item.dateRange) {
            // Try to extract start year from date range
            const yearMatch = item.dateRange.match(/(\d{4})/);
            if (yearMatch) {
                year = parseInt(yearMatch[1], 10);
            }
        }
        
        if (year && !isNaN(year)) {
            // Group by decade
            const decade = Math.floor(year / 10) * 10;
            const periodKey = `${decade}s`;
            
            if (!groups[periodKey]) {
                groups[periodKey] = [];
            }
            
            groups[periodKey].push(item);
        }
    });
    
    return groups;
}

/**
 * Creates a network visualization showing relationships between items
 * @param {string} canvasId - The ID of the canvas element.
 * @param {Array} nodes - Array of node objects.
 * @param {Array} links - Array of link objects connecting nodes.
 */
export function createNetworkVisualization(canvasId, nodes, links) {
    const canvas = document.getElementById(canvasId);
    if (!canvas || !nodes || nodes.length === 0) {
        return;
    }
    
    // Set canvas dimensions
    const width = canvas.offsetWidth;
    const height = 500;
    canvas.width = width;
    canvas.height = height;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Define node properties
    const nodeRadius = 8;
    const isDarkMode = document.body.classList.contains('dark-mode');
    
    // Node type colors
    const colors = {
        'person': '#0d6efd',  // primary
        'work': '#198754',    // success
        'document': '#fd7e14', // orange
        'place': '#20c997',   // teal
        'organization': '#6f42c1' // purple
    };
    
    // Default to a simple circle layout
    // In a real implementation, this would use physics-based force simulation
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2.5;
    
    // Position nodes in a circle
    nodes.forEach((node, i) => {
        const angle = (i / nodes.length) * 2 * Math.PI;
        node.x = centerX + radius * Math.cos(angle);
        node.y = centerY + radius * Math.sin(angle);
    });
    
    // Draw the network
    function draw() {
        // Clear canvas
        ctx.clearRect(0, 0, width, height);
        
        // Draw connections between nodes
        ctx.strokeStyle = isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)';
        ctx.lineWidth = 1;
        
        links.forEach(link => {
            const source = nodes.find(n => n.id === link.source);
            const target = nodes.find(n => n.id === link.target);
            
            if (source && target) {
                ctx.beginPath();
                ctx.moveTo(source.x, source.y);
                ctx.lineTo(target.x, target.y);
                ctx.stroke();
            }
        });
        
        // Draw nodes
        nodes.forEach(node => {
            // Draw node circle
            ctx.beginPath();
            ctx.arc(node.x, node.y, nodeRadius, 0, 2 * Math.PI);
            ctx.fillStyle = colors[node.type] || '#6c757d';
            ctx.fill();
            ctx.strokeStyle = isDarkMode ? '#212529' : '#ffffff';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // Draw node label if showLabels is true
            const showLabels = document.getElementById('showLabelsToggle')?.checked ?? true;
            if (showLabels) {
                ctx.fillStyle = isDarkMode ? '#f8f9fa' : '#212529';
                ctx.font = '12px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(node.label || node.id, node.x, node.y + nodeRadius + 15);
            }
        });
    }
    
    // Initial draw
    draw();
    
    // Add event listeners for interaction
    const zoomInBtn = document.getElementById('networkZoomIn');
    const zoomOutBtn = document.getElementById('networkZoomOut');
    const resetBtn = document.getElementById('networkReset');
    const showLabelsToggle = document.getElementById('showLabelsToggle');
    
    if (zoomInBtn) {
        zoomInBtn.addEventListener('click', () => {
            radius *= 1.2;
            nodes.forEach((node, i) => {
                const angle = (i / nodes.length) * 2 * Math.PI;
                node.x = centerX + radius * Math.cos(angle);
                node.y = centerY + radius * Math.sin(angle);
            });
            draw();
        });
    }
    
    if (zoomOutBtn) {
        zoomOutBtn.addEventListener('click', () => {
            radius *= 0.8;
            nodes.forEach((node, i) => {
                const angle = (i / nodes.length) * 2 * Math.PI;
                node.x = centerX + radius * Math.cos(angle);
                node.y = centerY + radius * Math.sin(angle);
            });
            draw();
        });
    }
    
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            radius = Math.min(width, height) / 2.5;
            nodes.forEach((node, i) => {
                const angle = (i / nodes.length) * 2 * Math.PI;
                node.x = centerX + radius * Math.cos(angle);
                node.y = centerY + radius * Math.sin(angle);
            });
            draw();
        });
    }
    
    if (showLabelsToggle) {
        showLabelsToggle.addEventListener('change', draw);
    }
    
    // Redraw on dark mode change
    document.getElementById('darkModeToggle')?.addEventListener('change', draw);
}

/**
 * Creates a word cloud visualization for terms
 * @param {string} canvasId - The ID of the canvas element.
 * @param {Array} terms - Array of term objects with item and count properties.
 */
export function createWordCloud(canvasId, terms) {
    const canvas = document.getElementById(canvasId);
    if (!canvas || !terms || terms.length === 0) {
        return;
    }
    
    // Set canvas dimensions
    const width = canvas.offsetWidth;
    const height = 300;
    canvas.width = width;
    canvas.height = height;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const isDarkMode = document.body.classList.contains('dark-mode');
    
    // Clear canvas
    ctx.fillStyle = isDarkMode ? '#343a40' : '#ffffff';
    ctx.fillRect(0, 0, width, height);
    
    // Sort terms by count (descending)
    const sortedTerms = [...terms].sort((a, b) => b.count - a.count);
    
    // Calculate font sizes based on term frequency
    const maxCount = sortedTerms[0]?.count || 1;
    const minFontSize = 14;
    const maxFontSize = 48;
    
    // Place terms (simplified algorithm)
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Define spiral parameters for layout
    const a = width / 25;
    const b = height / 25;
    
    for (let i = 0; i < Math.min(sortedTerms.length, 50); i++) {
        const term = sortedTerms[i];
        const fontSize = minFontSize + ((term.count / maxCount) * (maxFontSize - minFontSize));
        
        // Set font weight and size
        ctx.font = `${fontSize > 30 ? 'bold' : 'normal'} ${fontSize}px Arial, sans-serif`;
        
        // Set color based on position in list (darker = more frequent)
        const colorValue = isDarkMode ? 
            Math.floor(155 + (100 * (i / Math.min(sortedTerms.length, 50)))) : 
            Math.floor(50 + (175 * (i / Math.min(sortedTerms.length, 50))));
        
        ctx.fillStyle = isDarkMode ? 
            `rgb(${colorValue}, ${colorValue}, ${colorValue})` : 
            `rgb(${colorValue}, ${colorValue}, ${colorValue})`;
        
        // Calculate position using a simple spiral
        const angle = 0.1 * i;
        const radius = a + b * angle;
        const x = width/2 + radius * Math.cos(angle);
        const y = height/2 + radius * Math.sin(angle);
        
        // Draw text
        ctx.fillText(term.item, x, y);
    }
}

/**
 * Creates a map visualization for geographic data
 * @param {string} containerId - The ID of the container element.
 * @param {Array} places - Array of place objects.
 */
export function createMapVisualization(containerId, places) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    // For a real implementation, this would use a mapping library like Leaflet
    // Since we're just creating a placeholder, we'll add a simple message
    
container.innerHTML = `
        <div class="d-flex flex-column justify-content-center align-items-center h-100 p-4 text-center">
            <div class="mb-3">
                <i class="bi bi-geo-alt-fill text-primary" style="font-size: 3rem;"></i>
            </div>
            <h4 class="mb-3">Geographic Visualization</h4>
            <p class="mb-4">This would display ${places?.length || 0} locations on an interactive map.</p>
            <p class="text-muted small">For implementation, this would use a mapping library like Leaflet or Mapbox.</p>
            <button class="btn btn-outline-primary">
                <i class="bi bi-geo-alt me-2"></i>View on Map
            </button>
        </div>
    `;}

    /**
     * Populates a category detail card with info and charts.
     * @param {object} categoryData - The result object for one category { key, resultData }.
     * @param {HTMLElement} containerElement - The parent container for all category cards.
     */
    export function displayCategoryDetails(categoryData, containerElement) {
        const { key, resultData } = categoryData;
        // Ensure resultData exists and containerElement is valid before proceeding
        if (!resultData || !containerElement) {
            console.warn(`Skipping details for ${key}: Missing resultData or container element.`);
            return;
        }
    
        // Create column for the card
        const column = document.createElement('div');
        column.className = 'col';
    
        // Create card structure
        const card = document.createElement('div');
        card.className = 'card shadow-sm h-100 category-detail-card';
        card.id = `detail-${key}`; // Assign ID for filtering visibility
    
        // Add category badge if configured
        const isDarkMode = document.body.classList.contains('dark-mode');
        const badgeColorClass = getBadgeColorForCategory(key);
        card.innerHTML = `<span class="position-absolute top-0 end-0 translate-middle-y badge ${badgeColorClass}">
                            ${key.charAt(0).toUpperCase() + key.slice(1)}
                          </span>`;
    
        // Create card header
        const cardHeader = document.createElement('div');
        cardHeader.className = `card-header bg-${badgeColorClass.split('-')[1]}${isDarkMode ? ' text-white' : ''}`;
        
        const title = document.createElement('h5');
        title.className = 'card-title mb-0';
        title.textContent = key.charAt(0).toUpperCase() + key.slice(1);
        cardHeader.appendChild(title);
        card.appendChild(cardHeader);
    
        // Create card body
        const cardBody = document.createElement('div');
        cardBody.className = 'card-body';
    
        // Handle potential errors during data fetching/processing for this category
        if (resultData.error) {
            const errorAlert = document.createElement('div');
            errorAlert.className = 'alert alert-danger'; 
            errorAlert.innerHTML = `<i class="bi bi-exclamation-triangle-fill me-2"></i> 
                                    Could not load details: ${resultData.error}`;
            cardBody.appendChild(errorAlert);
            card.appendChild(cardBody);
            column.appendChild(card);
            containerElement.appendChild(column);
            
            // Also add to table view if it exists
            addToTableView(key, { error: resultData.error });
            return;
        }
    
        // Display basic info (Count, Date Range)
        const totalEntries = document.createElement('p');
        totalEntries.className = 'card-text'; 
        totalEntries.innerHTML = `<strong>Total Entries:</strong> 
                                <span class="badge bg-primary rounded-pill ms-2">${resultData.count.toLocaleString()}</span>`;
        cardBody.appendChild(totalEntries);
    
        if (resultData.details?.dateRange) {
            const dateRange = document.createElement('p');
            dateRange.className = 'card-text';
            dateRange.innerHTML = `<strong>Date Range:</strong> ${resultData.details.dateRange}`;
            cardBody.appendChild(dateRange);
        }
    
        // Prepare chart data
        const details = resultData.details || {};
        const chartConfigs = [
            { key: 'topTerms', label: 'Top Terms' },
            { key: 'topPeople', label: 'Top People' },
            { key: 'topPlaces', label: 'Top Places' },
            { key: 'topOrgs', label: 'Top Organizations' },
            { key: 'topMaterials', label: 'Top Materials' },
            { key: 'topLangs', label: 'Top Languages' },
            { key: 'topElements', label: 'Top Elements' }
        ];
    
        let chartsToCreate = [];
        let hasDetailCharts = false;
    
        chartConfigs.forEach(config => {
            const detailData = details[config.key];
            // Check if data exists and is a non-empty array
            if (Array.isArray(detailData) && detailData.length > 0) {
                hasDetailCharts = true;
                
                // Create section title
                const sectionTitle = document.createElement('h6');
                sectionTitle.className = 'mt-4 mb-2 border-bottom pb-2';
                sectionTitle.textContent = config.label;
                cardBody.appendChild(sectionTitle);
                
                // Create chart container
                const chartContainer = document.createElement('div');
                chartContainer.className = 'chart-container';
                const canvas = document.createElement('canvas');
                const canvasId = `${key}-${config.key}-chart`;
                canvas.id = canvasId;
                chartContainer.appendChild(canvas);
                cardBody.appendChild(chartContainer);
    
                // Add chart creation task to the list
                chartsToCreate.push({ canvasId, label: config.label, data: detailData });
            }
        });
    
        // If no detail charts were added, show a message
        if (!hasDetailCharts) {
            const noDetailsMsg = document.createElement('div');
            noDetailsMsg.className = 'alert alert-light mt-3';
            noDetailsMsg.innerHTML = '<i class="bi bi-info-circle me-2"></i> No additional details available for this category.';
            cardBody.appendChild(noDetailsMsg);
        }
    
        // Add a collapse button to show/hide details if there are many charts
        if (chartsToCreate.length > 2) {
            const collapseButton = document.createElement('button');
            collapseButton.className = 'btn btn-sm btn-outline-secondary mt-3 w-100';
            collapseButton.setAttribute('type', 'button');
            collapseButton.setAttribute('data-bs-toggle', 'collapse');
            collapseButton.setAttribute('data-bs-target', `#collapse-${key}`);
            collapseButton.innerHTML = '<i class="bi bi-chevron-down me-1"></i> Show/Hide Details';
            
            // Wrap all but the first chart in a collapsible div
            const collapseDiv = document.createElement('div');
            collapseDiv.className = 'collapse';
            collapseDiv.id = `collapse-${key}`;
            
            // Move charts after the first one into the collapsible div
            const chartDivs = cardBody.querySelectorAll('.chart-container');
            for (let i = 1; i < chartDivs.length; i++) {
                collapseDiv.appendChild(chartDivs[i]);
            }
            
            cardBody.appendChild(collapseButton);
            cardBody.appendChild(collapseDiv);
        }
    
        // Add to table view if it exists
        addToTableView(key, {
            count: resultData.count,
            dateRange: resultData.details?.dateRange || 'N/A',
            topTerms: details.topTerms ? details.topTerms.map(t => t.item).join(', ') : 'None'
        });
    
        // Finish assembling the card
        card.appendChild(cardBody);
        column.appendChild(card);
        containerElement.appendChild(column);
    
        // Create charts after the card (and canvases) are in the DOM
        if (chartsToCreate.length > 0) {
            requestAnimationFrame(() => {
                chartsToCreate.forEach(task => {
                    createDetailChart(task.canvasId, task.label, task.data);
                });
            });
        }
    }
    
    /**
     * Helper function to add category data to the table view
     * @param {string} key - Category key
     * @param {object} data - Category data
     */
    function addToTableView(key, data) {
        const tableBody = document.getElementById('category-table-body');
        if (!tableBody) return;
        
        const row = document.createElement('tr');
        row.id = `table-row-${key}`;
        
        // Category column
        const categoryCell = document.createElement('td');
        categoryCell.textContent = key.charAt(0).toUpperCase() + key.slice(1);
        row.appendChild(categoryCell);
        
        if (data.error) {
            // Error row
            const errorCell = document.createElement('td');
            errorCell.colSpan = 4;
            errorCell.className = 'text-danger';
            errorCell.textContent = data.error;
            row.appendChild(errorCell);
        } else {
            // Regular data row
            const countCell = document.createElement('td');
            countCell.textContent = data.count.toLocaleString();
            row.appendChild(countCell);
            
            const dateCell = document.createElement('td');
            dateCell.textContent = data.dateRange;
            row.appendChild(dateCell);
            
            const termsCell = document.createElement('td');
            termsCell.textContent = data.topTerms || 'None';
            row.appendChild(termsCell);
            
            const detailsCell = document.createElement('td');
            const detailsBtn = document.createElement('a');
            detailsBtn.href = `#detail-${key}`;
            detailsBtn.className = 'btn btn-sm btn-outline-primary';
            detailsBtn.innerHTML = '<i class="bi bi-eye"></i>';
            detailsBtn.addEventListener('click', (e) => {
                const detailCard = document.getElementById(`detail-${key}`);
                if (detailCard) {
                    detailCard.scrollIntoView({ behavior: 'smooth' });
                    detailCard.classList.add('highlight-card');
                    setTimeout(() => {
                        detailCard.classList.remove('highlight-card');
                    }, 2000);
                }
            });
            detailsCell.appendChild(detailsBtn);
            row.appendChild(detailsCell);
        }
        
        tableBody.appendChild(row);
    }
    
    /**
     * Helper function to get badge color for category
     * @param {string} category - Category name
     * @returns {string} Bootstrap badge color class
     */
    function getBadgeColorForCategory(category) {
        const colorMap = {
            'werke': 'bg-primary',
            'lebensdokumente': 'bg-success',
            'korrespondenzen': 'bg-info',
            'autographen': 'bg-warning',
            'bibliothek': 'bg-danger',
            'lebenskalender': 'bg-secondary',
            'personen': 'bg-dark',
            'standorte': 'bg-primary',
            'werkindex': 'bg-success'
        };
        
        return colorMap[category] || 'bg-secondary';
    }
    
    /**
     * Export data to CSV format
     * @param {Array} categoriesData - Data to export
     * @returns {string} CSV content
     */
    export function exportToCSV(categoriesData) {
        if (!categoriesData || categoriesData.length === 0) return '';
        
        // Headers
        let csv = 'Category,Count,Date Range\n';
        
        // Data rows
        categoriesData.forEach(({ key, resultData }) => {
            if (!resultData) return;
            
            const category = key.charAt(0).toUpperCase() + key.slice(1);
            const count = resultData.count || 0;
            const dateRange = resultData.details?.dateRange || 'N/A';
            
            // Escape fields if they contain commas
            const escapedCategory = category.includes(',') ? `"${category}"` : category;
            const escapedDateRange = dateRange.includes(',') ? `"${dateRange}"` : dateRange;
            
            csv += `${escapedCategory},${count},${escapedDateRange}\n`;
        });
        
        return csv;
    }
    
    // Initialize event listeners for export button
    document.addEventListener('DOMContentLoaded', () => {
        const exportButton = document.getElementById('exportCSV');
        if (exportButton) {
            exportButton.addEventListener('click', () => {
                if (window.allProcessedData) {
                    const csv = exportToCSV(window.allProcessedData);
                    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                    const url = URL.createObjectURL(blob);
                    
                    const link = document.createElement('a');
                    link.setAttribute('href', url);
                    link.setAttribute('download', 'stefan_zweig_digital_data.csv');
                    link.style.visibility = 'hidden';
                    
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                }
            });
        }
    });