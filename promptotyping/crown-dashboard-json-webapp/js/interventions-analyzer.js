document.addEventListener('DOMContentLoaded', () => {
    const componentSelector = document.getElementById('componentSelector');
    const searchInput = document.getElementById('searchInput');
    const interventionsList = document.getElementById('interventionsList');
    const loadingIndicator = document.getElementById('loadingIndicator');

    // Chart.js variables
    let interventionChart = null;

    let data = [];
    let selectedComponent = null;
    let filteredInterventions = [];

    // Fetch and display data
    fetchData();

    // Event Listeners
    componentSelector.addEventListener('change', () => {
        selectedComponent = componentSelector.value;
        renderInterventions();
    });

    searchInput.addEventListener('input', applyFilters);

    // Fetch Data Function
    function fetchData() {
        fetch('data/crown_data.json')
            .then(response => response.json())
            .then(jsonData => {
                data = jsonData;
                populateComponentSelector();
                renderInterventionChart(); // Updated: Group by components & interventions
                loadingIndicator.style.display = 'none';
            })
            .catch(error => {
                console.error('Error fetching data:', error);
                loadingIndicator.innerHTML = '<p class="text-danger">Failed to load data.</p>';
            });
    }

    // Populate Component Selector
    function populateComponentSelector() {
        const components = new Set();

        data.forEach(item => {
            if (item.Bestandteil) {
                components.add(item.Bestandteil);
            }
        });

        components.forEach(component => {
            const option = document.createElement('option');
            option.value = component;
            option.textContent = component;
            componentSelector.appendChild(option);
        });

        // Set default selected component
        if (componentSelector.options.length > 0) {
            selectedComponent = componentSelector.options[0].value;
            componentSelector.value = selectedComponent;
            renderInterventions();
        }
    }

    // Render Interventions
    function renderInterventions() {
        interventionsList.innerHTML = '';

        if (!selectedComponent) {
            interventionsList.innerHTML = '<p class="text-center">Please select a component to view interventions.</p>';
            return;
        }

        // Find all records that match the selected component
        const componentData = data.filter(item => item.Bestandteil === selectedComponent);

        if (componentData.length === 0) {
            interventionsList.innerHTML = '<p class="text-center">No interventions found for the selected component.</p>';
            return;
        }

        // Collect all interventions from matching components
        filteredInterventions = componentData.reduce((acc, component) => {
            return acc.concat(component.Interventions || []);
        }, []);

        applyFilters();
    }

    // Apply Filters
    function applyFilters() {
        const searchTerm = searchInput.value.toLowerCase();

        const filtered = filteredInterventions.filter(intervention => {
            const typeMatch = intervention.SurveyType?.toLowerCase().includes(searchTerm) || false;
            const causeMatch = intervention.Details[0]?.BriefDescription?.toLowerCase().includes(searchTerm) || false;
            const examinerMatch = intervention.Examiner?.Name?.toLowerCase().includes(searchTerm) || false;

            return typeMatch || causeMatch || examinerMatch;
        });

        displayInterventions(filtered);
    }

    // Display Interventions
    function displayInterventions(interventions) {
        interventionsList.innerHTML = '';

        if (interventions.length === 0) {
            interventionsList.innerHTML = '<p class="text-center">No interventions match your search criteria.</p>';
            return;
        }

        interventions.forEach((intervention, index) => {
            const card = document.createElement('div');
            card.className = 'card mb-3';

            const cardHeader = document.createElement('div');
            cardHeader.className = 'card-header';
            cardHeader.innerHTML = `
                <h5 class="mb-0">
                    <button class="btn btn-link text-decoration-none" data-bs-toggle="collapse" data-bs-target="#intervention${index}" aria-expanded="true" aria-controls="intervention${index}">
                        ${intervention.SurveyType || 'Intervention'} - ${intervention.SurveyISODate || 'Unknown Date'}
                    </button>
                </h5>
            `;

            const collapse = document.createElement('div');
            collapse.id = `intervention${index}`;
            collapse.className = 'collapse';
            collapse.setAttribute('aria-labelledby', `heading${index}`);
            collapse.setAttribute('data-bs-parent', '#interventionsList');

            const cardBody = document.createElement('div');
            cardBody.className = 'card-body';

            cardBody.innerHTML = `
                <p>
                    <strong>Type:</strong> ${intervention.SurveyType || 'N/A'}<br>
                    <strong>Date:</strong> ${intervention.SurveyISODate || 'N/A'}<br>
                    <strong>Examiner:</strong> ${intervention.Examiner?.Name || 'N/A'}<br>
                    <strong>Description:</strong> ${intervention.Details[0]?.BriefDescription || 'N/A'}
                </p>
                ${renderInterventionDetails(intervention)}
            `;

            collapse.appendChild(cardBody);
            card.appendChild(cardHeader);
            card.appendChild(collapse);
            interventionsList.appendChild(card);
        });
    }

    // Render Intervention Details
    function renderInterventionDetails(intervention) {
        let html = '';

        // Causes and Methods
        html += '<h6>Causes and Methods</h6><ul>';
        const details = intervention.Details[0] || {};
        if (details.Cause) {
            html += `<li><strong>Cause:</strong> ${sanitizeHTML(details.Cause)}</li>`;
        }
        if (details.Methods) {
            html += `<li><strong>Methods Used:</strong> ${sanitizeHTML(details.Methods)}</li>`;
        }
        if (details.Materials) {
            html += `<li><strong>Materials:</strong> ${sanitizeHTML(details.Materials)}</li>`;
        }
        html += '</ul>';

        // Analytical Results
        if (intervention.Details[0]?.AnalyticalResults) {
            html += '<h6>Analytical Results</h6>';
            html += renderAnalyticalResults(intervention.Details[0].AnalyticalResults);
        }

        // Associated Media
        if (intervention.Media && intervention.Media.length > 0) {
            html += '<h6>Associated Media</h6>';
            html += renderMediaThumbnails(intervention.Media);
        }

        return html;
    }

    // Render Analytical Results
    function renderAnalyticalResults(results) {
        if (!results || Object.keys(results).length === 0) {
            return '<p>No analytical results available.</p>';
        }

        let html = '<table class="table table-striped"><thead><tr>';

        // Table Headers
        Object.keys(results).forEach(key => {
            html += `<th>${sanitizeHTML(key)}</th>`;
        });
        html += '</tr></thead><tbody><tr>';

        // Table Data
        Object.values(results).forEach(value => {
            html += `<td>${sanitizeHTML(value)}</td>`;
        });
        html += '</tr></tbody></table>';

        return html;
    }

    // Render Media Thumbnails
    function renderMediaThumbnails(mediaArray) {
        let html = '<div class="row">';

        mediaArray.forEach((media, index) => {
            const mediaURL = constructMediaURL(media.Path, media.FileName);
            html += `
                <div class="col-md-3 mb-3">
                    <img src="${mediaURL}" class="img-fluid img-thumbnail" alt="${sanitizeHTML(media.RenditionNumber || 'Media')}" data-bs-toggle="modal" data-bs-target="#mediaModal" data-media-index="${index}">
                </div>
            `;
        });

        html += '</div>';

        // Event delegation for media thumbnails
        interventionsList.addEventListener('click', event => {
            if (event.target.tagName === 'IMG' && event.target.dataset.mediaIndex !== undefined) {
                const index = event.target.dataset.mediaIndex;
                openMediaModal(mediaArray, index);
            }
        });

        return html;
    }

    // Construct Media URL
    function constructMediaURL(path, fileName) {
        const encodedPath = encodeURIComponent(path).replace(/%2F/g, '/');
        const encodedFileName = encodeURIComponent(fileName);
        return `https://storage.googleapis.com/crown-dashboard/assets/${encodedPath}/${encodedFileName}`;
    }

    // Open Media Modal
    function openMediaModal(mediaArray, startIndex) {
        const mediaContent = document.getElementById('mediaContent');
        mediaContent.innerHTML = '';

        mediaArray.forEach(media => {
            const mediaURL = constructMediaURL(media.Path, media.FileName);
            const col = document.createElement('div');
            col.className = 'col-md-4 mb-3';

            const img = document.createElement('img');
            img.src = mediaURL;
            img.className = 'img-fluid img-thumbnail';
            img.alt = media.RenditionNumber || 'Media';
            img.onerror = () => {
                img.src = 'assets/placeholder.png';
            };

            col.appendChild(img);
            mediaContent.appendChild(col);
        });

        // Show Modal
        const mediaModal = new bootstrap.Modal(document.getElementById('mediaModal'));
        mediaModal.show();
    }

    // Sanitize HTML to prevent XSS
    function sanitizeHTML(str) {
        const temp = document.createElement('div');
        temp.textContent = str;
        return temp.innerHTML;
    }

    // Render Intervention Chart Grouped by Components
    function renderInterventionChart() {
        // Prepare data grouped by components and intervention types
        const interventionCountsByComponent = {};

        data.forEach(component => {
            const interventions = component.Interventions || [];
            if (!interventionCountsByComponent[component.Bestandteil]) {
                interventionCountsByComponent[component.Bestandteil] = {};
            }
            interventions.forEach(intervention => {
                const type = intervention.SurveyType || 'Unknown';
                interventionCountsByComponent[component.Bestandteil][type] = 
                    (interventionCountsByComponent[component.Bestandteil][type] || 0) + 1;
            });
        });

        // Extract the components and intervention types
        const components = Object.keys(interventionCountsByComponent);
        const interventionTypes = [...new Set(
            components.flatMap(component => Object.keys(interventionCountsByComponent[component]))
        )];

        // Build dataset for each intervention type
        const datasets = interventionTypes.map(type => ({
            label: type,
            data: components.map(component => interventionCountsByComponent[component][type] || 0),
            backgroundColor: `hsl(${(Math.random() * 360)}, 70%, 60%)`
        }));

        // Get chart context
        const ctx = document.getElementById('interventionChart').getContext('2d');

        // Destroy existing chart if it exists
        if (interventionChart) {
            interventionChart.destroy();
        }

        // Create new chart (grouped or stacked)
        interventionChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: components,
                datasets: datasets
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Overview of Interventions by Component and Type'
                    },
                    legend: {
                        display: true
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Components'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Count'
                        },
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                },
                onClick: (event, elements) => {
                    if (elements.length > 0) {
                        const index = elements[0].index;
                        selectedComponent = interventionChart.data.labels[index];
                        componentSelector.value = selectedComponent;
                        renderInterventions();
                    }
                }
            }
        });
    }
});
