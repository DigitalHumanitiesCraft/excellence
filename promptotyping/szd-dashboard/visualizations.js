// visualizations.js

/**
 * Collection to keep track of active Chart instances
 * Key: canvasId, Value: Chart instance
 */
const activeCharts = {};

/**
 * Destroys an existing chart instance if it exists.
 * @param {string} canvasId - The ID of the canvas element.
 */
function destroyChart(canvasId) {
    if (activeCharts[canvasId]) {
        activeCharts[canvasId].destroy();
        delete activeCharts[canvasId];
        // console.log(`Chart destroyed: ${canvasId}`); // Optional debug log
    }
}

/**
 * Generates an array of distinct colors for charts.
 * @param {number} count - Number of colors needed.
 * @returns {string[]} Array of color strings (hsl).
 */
function generateColors(count) {
    const colors = [];
    const saturation = 70; // Lower saturation for less intense colors
    const lightness = 65;  // Adjust lightness
    for (let i = 0; i < count; i++) {
        // Distribute hues, ensuring separation
        const hue = (i * (360 / (count > 1 ? count + 1 : 2))) % 360;
        colors.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
    }
    return colors;
}

/**
 * Creates or updates the overview bar chart showing counts per category.
 * @param {string} canvasId - The ID of the canvas element.
 * @param {Array<{key: string, resultData: { count: number }}>} categoriesData - Data for the chart.
 */
export function createOverviewChart(canvasId, categoriesData) {
    destroyChart(canvasId); // Ensure previous chart is removed

    const ctx = document.getElementById(canvasId)?.getContext('2d');
    if (!ctx) {
        console.error(`Canvas element with ID ${canvasId} not found.`);
        return;
    }

    const labels = categoriesData.map(item => item.key.charAt(0).toUpperCase() + item.key.slice(1));
    const dataCounts = categoriesData.map(item => item.resultData?.count || 0);
    const backgroundColors = generateColors(labels.length);
    const borderColors = backgroundColors.map(color => color.replace(/,\s*\d+%,\s*/, ', 55%, ')); // Darker border

    activeCharts[canvasId] = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Number of Entries',
                data: dataCounts,
                backgroundColor: backgroundColors,
                borderColor: borderColors,
                borderWidth: 1,
                borderRadius: 4, // Slightly rounded bars
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: { display: true, text: 'Number of Entries', font: { size: 14 } },
                    grid: { color: '#eee' } // Lighter grid lines
                },
                x: {
                    title: { display: true, text: 'Category', font: { size: 14 } },
                    grid: { display: false } // Hide vertical grid lines
                }
            },
            plugins: {
                legend: {
                    display: false // No need for legend with one dataset
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.7)', // Darker tooltip
                    titleFont: { size: 14 },
                    bodyFont: { size: 12 },
                    padding: 10,
                    cornerRadius: 4,
                    callbacks: {
                        label: function(context) {
                            return ` Entries: ${context.parsed.y}`;
                        }
                    }
                }
            },
            animation: {
                duration: 500 // Smooth animation
            }
        }
    });
}

/**
 * Creates or updates a horizontal bar chart for category details (Top N lists).
 * @param {string} canvasId - The ID of the canvas element.
 * @param {string} chartLabel - Label for the dataset.
 * @param {Array<{item: string, count: number}>} data - Array of items and their counts.
 */
export function createDetailChart(canvasId, chartLabel, data) {
    destroyChart(canvasId); // Ensure previous chart is removed

    const ctx = document.getElementById(canvasId)?.getContext('2d');
     if (!ctx || !data || data.length === 0) {
        // If canvas exists but no data, maybe display a message?
        // For now, just don't draw anything if no data.
        return;
    }

    const labels = data.map(d => {
        // Shorten long labels for display in the chart axis
        const maxLen = 40;
        return d.item.length > maxLen ? d.item.substring(0, maxLen - 3) + '...' : d.item;
    });
    const fullLabels = data.map(d => d.item); // Keep full labels for tooltips
    const dataCounts = data.map(d => d.count);
    // Use a consistent color for detail charts, or generate different ones
    const backgroundColor = 'hsl(210, 70%, 65%)'; // Example blue
    const borderColor = 'hsl(210, 70%, 55%)';

    activeCharts[canvasId] = new Chart(ctx, {
        type: 'bar', // Horizontal bar chart
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
                    title: { display: true, text: 'Count' },
                    grid: { color: '#eee' }
                },
                y: {
                    grid: { display: false }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                 tooltip: {
                     backgroundColor: 'rgba(0, 0, 0, 0.7)',
                     titleFont: { size: 14 },
                     bodyFont: { size: 12 },
                     padding: 10,
                     cornerRadius: 4,
                    callbacks: {
                        // Show full label in tooltip
                        title: function(tooltipItems) {
                            // Handle potential empty tooltipItems array
                            const index = tooltipItems[0]?.dataIndex;
                            return (index !== undefined && index < fullLabels.length) ? fullLabels[index] : '';
                        },
                        label: function(context) {
                            // Ensure context.parsed.x exists
                            return context.parsed?.x !== undefined ? ` Count: ${context.parsed.x}` : 'Count: N/A';
                        }
                    }
                }
            },
             animation: {
                duration: 400
            }
        }
    });
}

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

    // Create card structure
    const card = document.createElement('div');
    card.className = 'category-detail-card';
    card.id = `detail-${key}`; // Assign ID for filtering visibility

    const title = document.createElement('h3');
    title.textContent = key.charAt(0).toUpperCase() + key.slice(1);
    card.appendChild(title);

    // Handle potential errors during data fetching/processing for this category
    if (resultData.error) {
        const errorMsg = document.createElement('p');
        errorMsg.className = 'error'; // Add error class for styling
        errorMsg.textContent = `Could not load details: ${resultData.error}`;
        card.appendChild(errorMsg);
        containerElement.appendChild(card); // Append the card even if it only shows an error
        return; // Stop processing this card further
    }

    // Display basic info (Count, Date Range)
    // Use nullish coalescing (??) for default values
    card.innerHTML += `<p><strong>Total Entries:</strong> ${resultData.count ?? 'N/A'}</p>`;
    if (resultData.details?.dateRange) {
        card.innerHTML += `<p><strong>Date Range:</strong> ${resultData.details.dateRange}</p>`;
    }

    // Add containers and canvases for charts dynamically
    const details = resultData.details || {}; // Ensure details object exists
    const chartConfigs = [
        { key: 'topTerms', label: 'Top Terms' },
        { key: 'topPeople', label: 'Top People' },
        { key: 'topPlaces', label: 'Top Places' },
        { key: 'topOrgs', label: 'Top Organizations' },
        { key: 'topMaterials', label: 'Top Materials' },
        { key: 'topLangs', label: 'Top Languages' },
        { key: 'topElements', label: 'Top Elements (within entries)' }
    ];

    let chartsToCreate = []; // Store chart creation tasks

    chartConfigs.forEach(config => {
        const detailData = details[config.key];
        // Check if data exists and is a non-empty array
        if (Array.isArray(detailData) && detailData.length > 0) {
            const chartContainer = document.createElement('div');
            chartContainer.className = 'chart-container';
            const canvas = document.createElement('canvas');
            const canvasId = `${key}-${config.key}-chart`;
            canvas.id = canvasId;
            chartContainer.appendChild(canvas);
            card.appendChild(chartContainer);

            // Add chart creation task to the list
            chartsToCreate.push({ canvasId, label: config.label, data: detailData });
        }
    });

    // Append the card to the DOM *before* trying to create charts
    containerElement.appendChild(card);

    // Create charts after the card (and canvases) are in the DOM
    // Use requestAnimationFrame to ensure the browser has rendered the elements
    if (chartsToCreate.length > 0) {
        requestAnimationFrame(() => {
            chartsToCreate.forEach(task => {
                createDetailChart(task.canvasId, task.label, task.data);
            });
        });
    }
}