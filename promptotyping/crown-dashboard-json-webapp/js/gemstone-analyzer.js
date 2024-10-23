document.addEventListener('DOMContentLoaded', () => {
    let gemstones = [];
    let filteredGemstones = [];

    // Define getImagePath to load from Google Cloud Storage
    function getImagePath(bild) {
        if (bild.Media && bild.Media.length > 0 && bild.Media[0].FileName) {
            const cleanedPath = bild.Media[0].FileName.replace('Projekte\\CROWN\\', '').replace(/\\/g, '/');
            return `https://storage.googleapis.com/crown-dashboard/assets/${cleanedPath}`;
        }
        return "images/placeholder.png";
    }

    // Chart instances
    let materialChart = null;
    let colorChart = null;
    let shapeChart = null;

    // DOM Elements
    const gemstoneListSection = document.getElementById('gemstone-list');
    const gemstoneDetailSection = document.getElementById('gemstone-detail');
    const gemstoneTableBody = document.getElementById('gemstone-table-body');
    const backButton = document.getElementById('back-button');
    const basicInfoDiv = document.getElementById('basic-info');
    const conditionAttributesDiv = document.getElementById('condition-attributes');
    const scientificDataDiv = document.getElementById('scientific-data');
    const interventionHistoryDiv = document.getElementById('intervention-history');
    const mediaGalleryDiv = document.getElementById('media-gallery');
    const searchInput = document.getElementById('search');
    const filterColor = document.getElementById('filter-color');
    const filterMaterial = document.getElementById('filter-material');
    const filterShape = document.getElementById('filter-shape');
    const exportCSVButton = document.getElementById('export-csv');
    const exportJSONButton = document.getElementById('export-json');

    // Initialize
    fetch('data/crown_data.json')
        .then(response => response.json())
        .then(data => {
            // Filter data to only include gemstones
            gemstones = data.filter(gem => isGemstone(gem));
            filteredGemstones = [...gemstones];
            populateFilters();
            renderGemstoneList(filteredGemstones);
            renderStatistics(filteredGemstones);
        })
        .catch(error => console.error('Error loading data:', error));

    // Event Listeners
    searchInput.addEventListener('input', applyFilters);
    filterColor.addEventListener('change', applyFilters);
    filterMaterial.addEventListener('change', applyFilters);
    filterShape.addEventListener('change', applyFilters);
    backButton.addEventListener('click', () => {
        gemstoneDetailSection.classList.add('d-none');
        gemstoneListSection.classList.remove('d-none');
        exportCSVButton.classList.remove('d-none');
        exportJSONButton.classList.remove('d-none');
    });
    exportCSVButton.addEventListener('click', exportToCSV);
    exportJSONButton.addEventListener('click', exportToJSON);

    // Functions

    function isGemstone(gem) {
        // Check if the gem object represents a gemstone
        // Criteria:
        // - ObjectName is exactly 'Stein' or 'Edelstein'
        const objectName = gem.ObjectName || '';
        const normalizedObjectName = objectName.trim().toLowerCase();
        return normalizedObjectName === 'stein' || normalizedObjectName === 'edelstein';
    }

    function populateFilters() {
        const colors = new Set();
        const materials = new Set();
        const shapes = new Set();

        gemstones.forEach(gem => {
            // For Materials
            const medium = gem.Medium || 'Unknown';
            const materialsArray = medium.split(';').map(m => m.trim());
            materialsArray.forEach(material => materials.add(material));

            // For Colors
            const colorValue = gem.ConditionAttributes?.Farbe?.[""] || 'Unknown';
            const colorsArray = colorValue.split(';').map(c => c.trim());
            colorsArray.forEach(color => colors.add(color));

            // For Shapes
            const shape = gem.ConditionAttributes?.Form?.[""] || 'Unknown';
            shapes.add(shape);
        });

        populateSelect(filterColor, colors);
        populateSelect(filterMaterial, materials);
        populateSelect(filterShape, shapes);
    }

    function populateSelect(selectElement, items) {
        selectElement.innerHTML = '<option value="">All</option>'; // Reset options
        items.forEach(item => {
            const option = document.createElement('option');
            option.value = item;
            option.textContent = item;
            selectElement.appendChild(option);
        });
    }

    function renderGemstoneList(gemstones) {
        gemstoneTableBody.innerHTML = '';
        gemstones.forEach(gem => {
            // For Materials
            const medium = gem.Medium || 'Unknown';
            const materialsArray = medium.split(';').map(m => m.trim());
            const materialsStr = materialsArray.join(', ');

            // For Colors
            const colorValue = gem.ConditionAttributes?.Farbe?.[""] || 'Unknown';
            const colorsArray = colorValue.split(';').map(c => c.trim());
            const colorsStr = colorsArray.join(', ');

            const shape = gem.ConditionAttributes?.Form?.[""] || 'N/A';

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${gem.ObjectNumber}</td>
                <td>${gem.ObjectName}</td>
                <td>${materialsStr}</td>
                <td>${colorsStr}</td>
                <td>${shape}</td>
            `;
            row.addEventListener('click', () => showGemstoneDetail(gem));
            gemstoneTableBody.appendChild(row);
        });
    }

    function renderStatistics(gemstones) {
        // Prepare data
        const materialCounts = {};
        const colorCounts = {};
        const shapeCounts = {};

        gemstones.forEach(gem => {
            // Materials
            const medium = gem.Medium || 'Unknown';
            const materialsArray = medium.split(';').map(m => m.trim());
            materialsArray.forEach(material => {
                materialCounts[material] = (materialCounts[material] || 0) + 1;
            });

            // Colors
            const colorValue = gem.ConditionAttributes?.Farbe?.[""] || 'Unknown';
            const colorsArray = colorValue.split(';').map(c => c.trim());
            colorsArray.forEach(color => {
                colorCounts[color] = (colorCounts[color] || 0) + 1;
            });

            // Shapes
            const shape = gem.ConditionAttributes?.Form?.[""] || 'Unknown';
            shapeCounts[shape] = (shapeCounts[shape] || 0) + 1;
        });

        // Destroy existing charts if they exist
        if (materialChart) materialChart.destroy();
        if (colorChart) colorChart.destroy();
        if (shapeChart) shapeChart.destroy();

        // Material Chart
        const materialCtx = document.getElementById('materialChart').getContext('2d');
        materialChart = new Chart(materialCtx, {
            type: 'pie',
            data: {
                labels: Object.keys(materialCounts),
                datasets: [{
                    data: Object.values(materialCounts),
                    backgroundColor: generateColors(Object.keys(materialCounts).length)
                }]
            },
            options: {
                plugins: {
                    title: {
                        display: true,
                        text: 'Distribution by Material'
                    }
                },
                onClick: (event, elements) => {
                    if (elements.length > 0) {
                        const index = elements[0].index;
                        const selectedMaterial = materialChart.data.labels[index];
                        filterMaterial.value = selectedMaterial;
                        applyFilters();
                    }
                }
            }
        });

        // Color Chart
        const colorCtx = document.getElementById('colorChart').getContext('2d');
        colorChart = new Chart(colorCtx, {
            type: 'pie',
            data: {
                labels: Object.keys(colorCounts),
                datasets: [{
                    data: Object.values(colorCounts),
                    backgroundColor: generateColors(Object.keys(colorCounts).length)
                }]
            },
            options: {
                plugins: {
                    title: {
                        display: true,
                        text: 'Distribution by Color'
                    }
                },
                onClick: (event, elements) => {
                    if (elements.length > 0) {
                        const index = elements[0].index;
                        const selectedColor = colorChart.data.labels[index];
                        filterColor.value = selectedColor;
                        applyFilters();
                    }
                }
            }
        });

        // Shape Chart
        const shapeCtx = document.getElementById('shapeChart').getContext('2d');
        shapeChart = new Chart(shapeCtx, {
            type: 'pie',
            data: {
                labels: Object.keys(shapeCounts),
                datasets: [{
                    data: Object.values(shapeCounts),
                    backgroundColor: generateColors(Object.keys(shapeCounts).length)
                }]
            },
            options: {
                plugins: {
                    title: {
                        display: true,
                        text: 'Distribution by Shape'
                    }
                },
                onClick: (event, elements) => {
                    if (elements.length > 0) {
                        const index = elements[0].index;
                        const selectedShape = shapeChart.data.labels[index];
                        filterShape.value = selectedShape;
                        applyFilters();
                    }
                }
            }
        });
    }

    function generateColors(count) {
        const colors = [];
        for (let i = 0; i < count; i++) {
            colors.push(`hsl(${(i * 360) / count}, 70%, 60%)`);
        }
        return colors;
    }

    function applyFilters() {
        const searchTerm = searchInput.value.toLowerCase();
        const selectedColor = filterColor.value;
        const selectedMaterial = filterMaterial.value;
        const selectedShape = filterShape.value;

        filteredGemstones = gemstones.filter(gem => {
            const nameMatch = gem.ObjectName.toLowerCase().includes(searchTerm);
            const numberMatch = gem.ObjectNumber.toLowerCase().includes(searchTerm);

            // For Materials
            const medium = gem.Medium || 'Unknown';
            const materialsArray = medium.split(';').map(m => m.trim());

            // For Colors
            const colorValue = gem.ConditionAttributes?.Farbe?.[""] || 'Unknown';
            const colorsArray = colorValue.split(';').map(c => c.trim());

            const shape = gem.ConditionAttributes?.Form?.[""] || 'Unknown';

            const colorMatch = !selectedColor || colorsArray.includes(selectedColor);
            const materialMatch = !selectedMaterial || materialsArray.includes(selectedMaterial);
            const shapeMatch = !selectedShape || shape === selectedShape;

            return (nameMatch || numberMatch) && colorMatch && materialMatch && shapeMatch;
        });

        renderGemstoneList(filteredGemstones);
        renderStatistics(filteredGemstones);
    }

    function showGemstoneDetail(gem) {
        gemstoneListSection.classList.add('d-none');
        gemstoneDetailSection.classList.remove('d-none');
        exportCSVButton.classList.add('d-none');
        exportJSONButton.classList.add('d-none');

        // Basic Info
        basicInfoDiv.innerHTML = `
            <h2>${gem.ObjectName} (${gem.ObjectNumber})</h2>
            <p><strong>Material:</strong> ${gem.Medium || 'N/A'}</p>
            <p><strong>Description:</strong> ${gem.Description || 'N/A'}</p>
            <p><strong>Bestandteil:</strong> ${gem.Bestandteil || 'N/A'}</p>
        `;

        // Media Gallery
        mediaGalleryDiv.innerHTML = '<h3>Media Gallery</h3>';
        if (gem.Media && gem.Media.length > 0) {
            const gallery = document.createElement('div');
            gallery.className = 'row';
            gem.Media.forEach(media => {
                const col = document.createElement('div');
                col.className = 'col-md-3';
                const link = document.createElement('a');
                const imageUrl = getImagePath(gem);  // Use the getImagePath function
                link.href = imageUrl;
                link.setAttribute('data-lightbox', 'gemstone-gallery');
                link.setAttribute('data-title', media.RenditionNumber || '');
                const img = document.createElement('img');
                img.src = imageUrl;
                img.alt = media.RenditionNumber || '';
                img.className = 'img-thumbnail';
                link.appendChild(img);
                col.appendChild(link);
                gallery.appendChild(col);
            });
            mediaGalleryDiv.appendChild(gallery);
        } else {
            mediaGalleryDiv.innerHTML += '<p>No media available.</p>';
        }
    }

    function formatConditionValue(value) {
        if (typeof value === 'object') {
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

    function renderScientificData(gem) {
        // Clear previous content
        scientificDataDiv.innerHTML = '<h3>Scientific Data</h3>';

        // Raman Data
        if (gem.ConditionAttributes?.Raman) {
            const ramanData = gem.ConditionAttributes.Raman;
            const labels = [];
            const dataPoints = [];
            for (const [key, value] of Object.entries(ramanData)) {
                if (key.startsWith('Bande')) {
                    labels.push(key);
                    dataPoints.push(value);
                }
            }

            const canvas = document.createElement('canvas');
            scientificDataDiv.appendChild(canvas);

            new Chart(canvas.getContext('2d'), {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Raman Shift (cm⁻¹)',
                        data: dataPoints,
                        backgroundColor: generateColors(dataPoints.length)
                    }]
                },
                options: {
                    plugins: {
                        title: {
                            display: true,
                            text: 'Raman Spectroscopy Data'
                        }
                    }
                }
            });
        }

        // Photoluminescence Data
        if (gem.ConditionAttributes?.PL) {
            const plData = gem.ConditionAttributes.PL;
            const labels = [];
            const dataPoints = [];
            for (const [key, value] of Object.entries(plData)) {
                if (key.startsWith('Bande')) {
                    labels.push(key);
                    dataPoints.push(value);
                }
            }

            const canvas = document.createElement('canvas');
            scientificDataDiv.appendChild(canvas);

            new Chart(canvas.getContext('2d'), {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'PL Wavelength (nm)',
                        data: dataPoints,
                        backgroundColor: generateColors(dataPoints.length)
                    }]
                },
                options: {
                    plugins: {
                        title: {
                            display: true,
                            text: 'Photoluminescence Data'
                        }
                    }
                }
            });
        }

        // If no scientific data available
        if (!gem.ConditionAttributes?.Raman && !gem.ConditionAttributes?.PL) {
            scientificDataDiv.innerHTML += '<p>No scientific data available.</p>';
        }
    }

    function exportToCSV() {
        let csvContent = 'data:text/csv;charset=utf-8,';
        csvContent += 'ObjectNumber,ObjectName,Material,Color,Shape\n';
        filteredGemstones.forEach(gem => {
            const materialsArray = (gem.Medium || 'Unknown').split(';').map(m => m.trim());
            const materialsStr = '"' + materialsArray.join(', ') + '"';

            const colorsArray = (gem.ConditionAttributes?.Farbe?.[""] || 'Unknown').split(';').map(c => c.trim());
            const colorsStr = '"' + colorsArray.join(', ') + '"';

            const shape = gem.ConditionAttributes?.Form?.[""] || 'N/A';

            const row = [
                gem.ObjectNumber,
                gem.ObjectName,
                materialsStr,
                colorsStr,
                shape
            ].join(',');
            csvContent += row + '\n';
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', 'gemstones.csv');
        document.body.appendChild(link); // Required for FF

        link.click();
        document.body.removeChild(link);
    }

    function exportToJSON() {
        const dataStr = JSON.stringify(filteredGemstones, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

        const link = document.createElement('a');
        link.setAttribute('href', dataUri);
        link.setAttribute('download', 'gemstones.json');
        document.body.appendChild(link); // Required for FF

        link.click();
        document.body.removeChild(link);
    }
});
