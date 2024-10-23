// Overview JavaScript

document.addEventListener('DOMContentLoaded', () => {
    const objectListContainer = document.getElementById('objectList');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const searchInput = document.getElementById('searchInput');
    const filterBestandteil = document.getElementById('filterBestandteil');
    const filterMedium = document.getElementById('filterMedium');
    const paginationContainer = document.getElementById('pagination');

    let objects = [];
    let filteredObjects = [];
    let currentPage = 1;
    const itemsPerPage = 12;

    // Fetch and display data
    fetchData();

    // Event Listeners
    searchInput.addEventListener('input', applyFilters);
    filterBestandteil.addEventListener('change', applyFilters);
    filterMedium.addEventListener('change', applyFilters);

    // Fetch Data Function
    function fetchData() {
        fetch('data/crown_data.json')
            .then(response => response.json())
            .then(data => {
                objects = data;
                filteredObjects = [...objects];
                populateFilters();
                renderObjectList();
            })
            .catch(error => {
                console.error('Error fetching data:', error);
                loadingIndicator.innerHTML = '<p class="text-danger">Failed to load data.</p>';
            })
            .finally(() => {
                loadingIndicator.style.display = 'none';
            });
    }

    // Populate Filters
    function populateFilters() {
        const bestandteilSet = new Set();
        const mediumSet = new Set();

        objects.forEach(obj => {
            if (obj.Bestandteil) bestandteilSet.add(obj.Bestandteil);
            if (obj.Medium) mediumSet.add(obj.Medium);
        });

        populateSelect(filterBestandteil, bestandteilSet);
        populateSelect(filterMedium, mediumSet);
    }

    function populateSelect(selectElement, items) {
        items.forEach(item => {
            const option = document.createElement('option');
            option.value = item;
            option.textContent = item;
            selectElement.appendChild(option);
        });
    }

    // Render Object List
    function renderObjectList() {
        objectListContainer.innerHTML = '';
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedObjects = filteredObjects.slice(startIndex, endIndex);

        if (paginatedObjects.length === 0) {
            objectListContainer.innerHTML = '<p class="text-center">No objects found.</p>';
            paginationContainer.innerHTML = '';
            return;
        }

        paginatedObjects.forEach(obj => {
            const col = document.createElement('div');
            col.className = 'col-md-4 mb-4';

            const card = document.createElement('div');
            card.className = 'card h-100';

            // Media Thumbnail
            const imagePath = getImagePath(obj);

            if (imagePath && imagePath !== "images/placeholder.png") {
                const img = document.createElement('img');
                img.src = imagePath;
                img.className = 'card-img-top';
                img.alt = obj.ObjectName || 'Object Image';
                card.appendChild(img);
            }

            const cardBody = document.createElement('div');
            cardBody.className = 'card-body d-flex flex-column';

            const cardTitle = document.createElement('h5');
            cardTitle.className = 'card-title';
            cardTitle.textContent = obj.ObjectName || 'Unnamed Object';
            cardBody.appendChild(cardTitle);

            const cardText = document.createElement('p');
            cardText.className = 'card-text';
            cardText.innerHTML = `
                <strong>Bestandteil:</strong> ${obj.Bestandteil || 'N/A'}<br>
                <strong>Medium:</strong> ${obj.Medium || 'N/A'}
            `;
            cardBody.appendChild(cardText);

            const viewDetailsButton = document.createElement('button');
            viewDetailsButton.className = 'btn btn-primary mt-auto';
            viewDetailsButton.textContent = 'View Details';
            viewDetailsButton.addEventListener('click', () => showObjectDetails(obj));
            cardBody.appendChild(viewDetailsButton);

            card.appendChild(cardBody);
            col.appendChild(card);
            objectListContainer.appendChild(col);
        });

        renderPagination();
    }

    // Render Pagination
    function renderPagination() {
        const totalPages = Math.ceil(filteredObjects.length / itemsPerPage);
        let html = '<ul class="pagination justify-content-center">';

        // First page
        html += `<li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
                    <a class="page-link" href="#" data-page="1">First</a>
                 </li>`;

        // Previous button
        html += `<li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
                    <a class="page-link" href="#" data-page="${currentPage - 1}">Previous</a>
                 </li>`;

        // Page numbers
        const startPage = Math.max(1, currentPage - 2);
        const endPage = Math.min(totalPages, startPage + 4);

        if (startPage > 1) {
            html += '<li class="page-item disabled"><span class="page-link">...</span></li>';
        }

        for (let i = startPage; i <= endPage; i++) {
            html += `<li class="page-item ${currentPage === i ? 'active' : ''}">
                        <a class="page-link" href="#" data-page="${i}">${i}</a>
                     </li>`;
        }

        if (endPage < totalPages) {
            html += '<li class="page-item disabled"><span class="page-link">...</span></li>';
        }

        // Next button
        html += `<li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
                    <a class="page-link" href="#" data-page="${currentPage + 1}">Next</a>
                 </li>`;

        // Last page
        html += `<li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
                    <a class="page-link" href="#" data-page="${totalPages}">Last</a>
                 </li>`;

        html += '</ul>';
        html += `<p class="text-center mt-2">Page ${currentPage} of ${totalPages}</p>`;

        paginationContainer.innerHTML = html;

        // Add event listeners
        paginationContainer.querySelectorAll('.page-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = parseInt(e.target.dataset.page);
                if (!isNaN(page) && page !== currentPage && page > 0 && page <= totalPages) {
                    currentPage = page;
                    renderObjectList();
                }
            });
        });
    }

    // Get Image Path
    function getImagePath(obj) {
        // Check if 'Media' and its fields exist
        if (obj.Media && obj.Media.length > 0 && obj.Media[0].FileName) {
            const cleanedPath = obj.Media[0].FileName.replace('Projekte\\CROWN\\', '').replace(/\\/g, '/');
            // Construct the final path
            return `https://storage.googleapis.com/crown-dashboard/assets/${cleanedPath}`;
        } else {
            return null;
        }
    }

    // Show Object Details
    function showObjectDetails(obj) {
        const modalLabel = document.getElementById('objectDetailModalLabel');
        const modalContent = document.getElementById('modalContent');

        modalLabel.textContent = `${obj.ObjectName || 'Object Details'} (${obj.ObjectNumber || 'No Number'})`;

        modalContent.innerHTML = `
            <h5>Basic Information</h5>
            <p>
                <strong>Object Name:</strong> ${obj.ObjectName || 'N/A'}<br>
                <strong>Object Number:</strong> ${obj.ObjectNumber || 'N/A'}<br>
                <strong>Bestandteil:</strong> ${obj.Bestandteil || 'N/A'}<br>
                <strong>Medium:</strong> ${obj.Medium || 'N/A'}<br>
                <strong>Description:</strong> ${obj.Description || 'N/A'}
            </p>
            <h5>Condition Attributes</h5>
            ${renderConditionAttributes(obj.ConditionAttributes)}
            <h5>Interventions</h5>
            ${renderInterventions(obj.Interventions)}
            <h5>Media Gallery</h5>
            ${renderMediaGallery(obj)}
        `;

        // Show Modal
        const objectDetailModal = new bootstrap.Modal(document.getElementById('objectDetailModal'));
        objectDetailModal.show();
    }

    // Render Condition Attributes
    function renderConditionAttributes(attributes) {
        if (!attributes || Object.keys(attributes).length === 0) {
            return '<p>No condition attributes available.</p>';
        }
        let html = '<ul>';
        for (const [key, value] of Object.entries(attributes)) {
            html += `<li><strong>${key}:</strong> ${formatAttributeValue(value)}</li>`;
        }
        html += '</ul>';
        return html;
    }

    function formatAttributeValue(value) {
        if (typeof value === 'object' && value !== null) {
            let formatted = '<ul>';
            for (const [subKey, subValue] of Object.entries(value)) {
                formatted += `<li><strong>${subKey}:</strong> ${subValue}</li>`;
            }
            formatted += '</ul>';
            return formatted;
        } else {
            return value;
        }
    }

    // Render Interventions
    function renderInterventions(interventions) {
        if (!interventions || interventions.length === 0) {
            return '<p>No interventions available.</p>';
        }
        let html = '';
        interventions.forEach(intervention => {
            html += `
                <div class="card mb-3">
                    <div class="card-body">
                        <p>
                            <strong>Type:</strong> ${intervention.SurveyType || 'N/A'}<br>
                            <strong>Date:</strong> ${intervention.SurveyISODate || 'N/A'}<br>
                            <strong>Examiner:</strong> ${intervention.Examiner?.Name || 'N/A'}<br>
                            <strong>Description:</strong> ${intervention.Details[0]?.BriefDescription || 'N/A'}<br>
                            <strong>Statement:</strong> ${intervention.Details[0]?.Statement || 'N/A'}
                        </p>
                        ${renderInterventionMedia(intervention)}
                    </div>
                </div>
            `;
        });
        return html;
    }

    // Render Intervention Media
    function renderInterventionMedia(intervention) {
        if (!intervention.Media || intervention.Media.length === 0) {
            return '';
        }
        let html = '<h6>Intervention Media:</h6><div class="row">';
        intervention.Media.forEach(media => {
            const imagePath = getImagePath({ Media: [media] });
            if (imagePath) {
                html += `
                    <div class="col-md-3 mb-3">
                        <img src="${imagePath}" class="img-fluid img-thumbnail" alt="${media.RenditionNumber || 'Media'}">
                    </div>
                `;
            }
        });
        html += '</div>';
        return html;
    }

    // Render Media Gallery
    function renderMediaGallery(obj) {
        const mediaArray = obj.Media || [];
        if (mediaArray.length === 0) {
            return '<p>No media available.</p>';
        }
        let html = '<div class="row">';
        mediaArray.forEach(media => {
            const imagePath = getImagePath({ Media: [media] });
            if (imagePath) {
                html += `
                    <div class="col-md-3 mb-3">
                        <img src="${imagePath}" class="img-fluid img-thumbnail" alt="${media.RenditionNumber || 'Media'}">
                    </div>
                `;
            }
        });
        html += '</div>';
        return html;
    }

    // Apply Filters
    function applyFilters() {
        const searchTerm = searchInput.value.toLowerCase();
        const selectedBestandteil = filterBestandteil.value;
        const selectedMedium = filterMedium.value;

        filteredObjects = objects.filter(obj => {
            const nameMatch = obj.ObjectName?.toLowerCase().includes(searchTerm) || false;
            const numberMatch = obj.ObjectNumber?.toLowerCase().includes(searchTerm) || false;
            const bestandteilMatch = !selectedBestandteil || obj.Bestandteil === selectedBestandteil;
            const mediumMatch = !selectedMedium || obj.Medium === selectedMedium;

            return (nameMatch || numberMatch) && bestandteilMatch && mediumMatch;
        });

        currentPage = 1; // Reset to first page when filters change
        renderObjectList();
    }
});