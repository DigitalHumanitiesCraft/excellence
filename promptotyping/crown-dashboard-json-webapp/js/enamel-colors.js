document.addEventListener('DOMContentLoaded', function () {
    loadData();
});

let crownData = [];
let enamelColors = [];
let originalEnamelColors = [];
let colorScale;
let totalEnamelObjects = 0;
let currentColorData = null;
let currentPage = 1;
let rowsPerPage = 5;
let searchQuery = '';  // Track the search query

function loadData() {
    const cachedData = localStorage.getItem('crownData');
    if (cachedData) {
        processEnamelData(JSON.parse(cachedData));
    } else {
        d3.json('data/crown_data.json')
            .then(data => {
                localStorage.setItem('crownData', JSON.stringify(data));
                processEnamelData(data);
            })
            .catch(handleError);
    }
}

function handleError(error) {
    console.error('Error loading data:', error);
    alert('Failed to load data.');
}

function processEnamelData(data) {
    crownData = data;
    const enamelData = crownData.filter(
        (d) => d.Medium && d.Medium.toLowerCase() === 'email'
    );

    totalEnamelObjects = enamelData.length;

    const colorCounts = {};
    enamelData.forEach((d) => {
        let color = d.ObjectName ? d.ObjectName.trim().toLowerCase() : 'unknown';
        color = standardizeColorName(color);

        if (!d.ObjectID || !d.Bestandteil) {
            return;
        }

        if (colorCounts[color]) {
            colorCounts[color].count += 1;
            colorCounts[color].objects.push(d);
        } else {
            colorCounts[color] = {
                colorName: color,
                count: 1,
                objects: [d],
            };
        }
    });

    enamelColors = Object.values(colorCounts);
    enamelColors.sort((a, b) => d3.descending(a.count, b.count)); // Sort by count

    originalEnamelColors = enamelColors.slice(); // Preserve original data
    document.getElementById('totalColors').textContent = enamelColors.length;

    // Create color scale with semi-transparent colors for "transparent" types
    colorScale = d3.scaleOrdinal()
        .domain([
            'opak gelb', 'opak hellblau', 'opak inkarnat', 'opak rot', 'opak türkis', 'opak weiß',
            'transparent blau', 'transparent hellgrün', 'transparent braun', 'transparent schwarz',
            'transparent dunkelblau', 'transparent grün', 'emailergänzung', 'transparent (?) dunkelblau', 'ergänzung'
        ])
        .range([
            '#FFD700',  // Opak Gelb
            '#ADD8E6',  // Opak Hellblau
            '#FFC0CB',  // Opak Inkarnat
            '#FF0000',  // Opak Rot
            '#40E0D0',  // Opak Türkis
            '#FFFFFF',  // Opak Weiß
            'rgba(0, 0, 255, 0.6)',  // Transparent Blau
            'rgba(144, 238, 144, 0.6)',  // Transparent Hellgrün
            'rgba(165, 42, 42, 0.6)',  // Transparent Braun
            'rgba(0, 0, 0, 0.6)',  // Transparent Schwarz
            'rgba(0, 0, 139, 0.6)',  // Transparent Dunkelblau
            'rgba(0, 128, 0, 0.6)',  // Transparent Grün
            '#C0C0C0',  // Emailergänzung (Silver or Gray)
            'rgba(70, 130, 180, 0.6)',  // Transparent (?) Dunkelblau
            '#808080'   // Ergänzung (Gray)
        ]);

    createVisualization();
}

function standardizeColorName(color) {
    const colorNameMapping = {
        'obla': 'opak blau',
        'tbla': 'transparent blau',
        'opak blue': 'opak blau',
        'transp. blue': 'transparent blau',
        'opak rot': 'opak rot',
        'transp. rot': 'transparent rot',
    };
    return colorNameMapping[color] || color;
}

function createVisualization() {
    const containerWidth = document.getElementById('colorChart').clientWidth;
    const svgWidth = containerWidth;
    const svgHeight = 400;
    const margin = { top: 50, right: 30, bottom: 100, left: 60 };
    const width = svgWidth - margin.left - margin.right;
    const height = svgHeight - margin.top - margin.bottom;

    const svg = d3
        .select('#colorChart')
        .append('svg')
        .attr('width', svgWidth)
        .attr('height', svgHeight);

    const chartGroup = svg
        .append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`);

    const xScale = d3
        .scaleBand()
        .domain(enamelColors.map((d) => d.colorName))
        .range([0, width])
        .padding(0.2);

    const yScale = d3
        .scaleLinear()
        .domain([0, d3.max(enamelColors, (d) => d.count)])
        .nice()
        .range([height, 0]);

    const bars = chartGroup
        .selectAll('.bar')
        .data(enamelColors)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('x', (d) => xScale(d.colorName))
        .attr('y', yScale(0))
        .attr('width', xScale.bandwidth())
        .attr('height', 0)
        .attr('fill', (d) => colorScale(d.colorName))
        .on('click', (event, d) => {
            currentColorData = d;
            currentPage = 1;  // Reset to the first page after search
            displayColorObjects(d);
            d3.selectAll('.bar').attr('stroke', 'none');  // Remove highlight from other bars
            d3.select(event.currentTarget).attr('stroke', 'black').attr('stroke-width', 2);  // Highlight clicked bar
        })
        .transition()
        .duration(500)
        .attr('y', (d) => yScale(d.count))
        .attr('height', (d) => height - yScale(d.count));

    chartGroup
        .append('g')
        .attr('transform', `translate(0, ${height})`)
        .call(d3.axisBottom(xScale))
        .selectAll('text')
        .attr('transform', 'rotate(45)')
        .style('text-anchor', 'start');

    chartGroup.append('g').call(d3.axisLeft(yScale));

    chartGroup
        .append('text')
        .attr('transform', `translate(${width / 2}, ${height + margin.bottom - 40})`)
        .style('text-anchor', 'middle')
        .text('Enamel Colors');

    // Listen for search input changes
    document.getElementById('searchInput').addEventListener('input', function () {
        searchQuery = this.value.toLowerCase();  // Store the search query
        displayColorObjects(currentColorData);  // Update the table based on the new search
    });
}

function displayColorObjects(colorData) {
    const tbody = d3.select('#colorObjectsTable tbody');
    tbody.html(''); // Clear the table first

    // Apply search filter
    let filteredObjects = colorData.objects.filter(obj => {
        return (
            obj.ObjectID.toString().includes(searchQuery) ||
            obj.ObjectName.toLowerCase().includes(searchQuery) ||
            obj.Bestandteil.toLowerCase().includes(searchQuery)
        );
    });

    const paginatedData = paginate(filteredObjects, currentPage, rowsPerPage);

    paginatedData.data.forEach((obj) => {
        tbody.append('tr').html(`
            <td><a href="#" onclick="showObjectDetails(${obj.ObjectID})">${obj.ObjectID}</a></td>
            <td>${obj.ObjectName}</td>
            <td>${obj.Bestandteil}</td>
            <td>${formatConditionAttributes(obj.ConditionAttributes)}</td>
            <td>${formatInterventions(obj.Interventions)}</td>
            <td>${formatMedia(obj.Media)}</td>
        `);
    });

    createPaginationControls(paginatedData.totalPages);
}

function formatConditionAttributes(attributes) {
    if (!attributes) return 'N/A';
    return `Blasen: ${attributes.Blasen[""]}, Fehlstellen: ${attributes.Fehlstellen[""]}`;
}

function formatInterventions(interventions) {
    if (!interventions || interventions.length === 0) return 'N/A';
    return interventions.map(intervention => `
        <strong>${intervention.SurveyISODate}</strong>: ${intervention.Details[0].BriefDescription}
    `).join('<br>');
}

function formatMedia(media) {
    if (!media || media.length === 0) return 'N/A';
    return media.map(item => `<a href="${getImagePath(item)}" target="_blank">${item.RenditionNumber}</a>`).join('<br>');
}

function getImagePath(item) {
    if (item && item.FileName) {
        const cleanedPath = item.FileName.replace('Projekte\\', '').replace('CROWN\\CR_1_B\\', '').replace(/\\/g, '/');
        return `https://storage.googleapis.com/crown-dashboard/assets/${cleanedPath}`;
    } else {
        return "images/placeholder.png";
    }
}

// Pagination
function paginate(items, page, perPage) {
    const offset = (page - 1) * perPage;
    const paginatedItems = items.slice(offset, offset + perPage);
    const totalPages = Math.ceil(items.length / perPage);
    return {
        data: paginatedItems,
        totalPages: totalPages
    };
}

function createPaginationControls(totalPages) {
    const paginationContainer = d3.select("#paginationControls");
    paginationContainer.html('');

    for (let i = 1; i <= totalPages; i++) {
        paginationContainer.append('button')
            .text(i)
            .attr('class', `page-btn ${i === currentPage ? 'active' : ''}`)
            .on('click', () => {
                currentPage = i;
                displayColorObjects(currentColorData);
            });
    }
}

// Drill down to object details
function showObjectDetails(objectId) {
    alert(`Displaying details for Object ID: ${objectId}`);
}
