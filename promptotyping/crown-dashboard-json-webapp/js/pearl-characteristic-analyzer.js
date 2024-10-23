// pearl-characteristic-analyzer.js

document.addEventListener('DOMContentLoaded', function() {
    loadData();
});

let crownData = [];
let pearlData = [];
let filteredPearlData = [];

let forms = new Set();

function loadData() {
    d3.json('data/crown_data.json')
        .then(processData)
        .then(() => {
            populateFilters();
            displaySummaryStatistics();
            createFormChart();
            displayPearlGallery();
        })
        .catch(handleError);
}

function handleError(error) {
    console.error('Fehler beim Laden der Daten:', error);
    alert('Fehler beim Laden der Daten.');
}

function processData(data) {
    crownData = data;
    pearlData = crownData.filter(d => d.Medium && d.Medium.toLowerCase() === 'perle');

    // Initialize sets for filters
    forms = new Set();

    pearlData.forEach(pearl => {
        // Form
        let form = pearl.ConditionAttributes && pearl.ConditionAttributes.Form
            ? pearl.ConditionAttributes.Form[""] || 'Unbekannt'
            : 'Unbekannt';
        pearl.form = form.trim();
        forms.add(pearl.form);

        // Riss
        let hasRiss = pearl.ConditionAttributes && pearl.ConditionAttributes.Riss
            ? pearl.ConditionAttributes.Riss[""] === 1.0
            : false;
        pearl.hasRiss = hasRiss;

        // Kratzer
        let hasKratzer = pearl.ConditionAttributes && pearl.ConditionAttributes.Kratzer
            ? pearl.ConditionAttributes.Kratzer[""] === 1.0
            : false;
        pearl.hasKratzer = hasKratzer;

        // Fehlstelle
        let hasFehlstelle = pearl.ConditionAttributes && pearl.ConditionAttributes.Fehlstelle
            ? pearl.ConditionAttributes.Fehlstelle[""] === 1.0
            : false;
        pearl.hasFehlstelle = hasFehlstelle;

        // Bohrloch
        let hasBohrloch = pearl.ConditionAttributes && pearl.ConditionAttributes.Bohrloch
            ? pearl.ConditionAttributes.Bohrloch[""] === 1.0
            : false;
        pearl.hasBohrloch = hasBohrloch;
    });

    filteredPearlData = pearlData;
}

function populateFilters() {
    // Form Filter
    const formFilter = d3.select('#formFilter');
    forms.forEach(form => {
        formFilter.append('option')
            .attr('value', form)
            .text(form);
    });

    // Event Listeners
    d3.selectAll('.form-select').on('change', applyFilters);
    d3.select('#resetFilters').on('click', resetFilters);
}

function applyFilters() {
    const selectedForm = d3.select('#formFilter').property('value');
    const selectedRiss = d3.select('#rissFilter').property('value');
    const selectedKratzer = d3.select('#kratzerFilter').property('value');
    const selectedFehlstelle = d3.select('#fehlstelleFilter').property('value');
    const selectedBohrloch = d3.select('#bohrlochFilter').property('value');

    filteredPearlData = pearlData.filter(pearl => {
        let formMatch = (selectedForm === 'all') || (pearl.form === selectedForm);
        let rissMatch = (selectedRiss === 'all') || ((pearl.hasRiss ? 'Ja' : 'Nein') === selectedRiss);
        let kratzerMatch = (selectedKratzer === 'all') || ((pearl.hasKratzer ? 'Ja' : 'Nein') === selectedKratzer);
        let fehlstelleMatch = (selectedFehlstelle === 'all') || ((pearl.hasFehlstelle ? 'Ja' : 'Nein') === selectedFehlstelle);
        let bohrlochMatch = (selectedBohrloch === 'all') || ((pearl.hasBohrloch ? 'Ja' : 'Nein') === selectedBohrloch);

        return formMatch && rissMatch && kratzerMatch && fehlstelleMatch && bohrlochMatch;
    });

    displayPearlGallery();
}

function resetFilters() {
    d3.select('#formFilter').property('value', 'all');
    d3.select('#rissFilter').property('value', 'all');
    d3.select('#kratzerFilter').property('value', 'all');
    d3.select('#fehlstelleFilter').property('value', 'all');
    d3.select('#bohrlochFilter').property('value', 'all');

    applyFilters();
}

function displaySummaryStatistics() {
    // Total Pearls
    d3.select('#pearlCount').text(pearlData.length);

    // Pearls with Riss
    const rissCount = pearlData.filter(p => p.hasRiss).length;
    d3.select('#rissCount').text(rissCount);

    // Pearls with Kratzer
    const kratzerCount = pearlData.filter(p => p.hasKratzer).length;
    d3.select('#kratzerCount').text(kratzerCount);

    // Pearls with Fehlstelle
    const fehlstelleCount = pearlData.filter(p => p.hasFehlstelle).length;
    d3.select('#fehlstelleCount').text(fehlstelleCount);

    // Pearls with Bohrloch
    const bohrlochCount = pearlData.filter(p => p.hasBohrloch).length;
    d3.select('#bohrlochCount').text(bohrlochCount);
}

function createFormChart() {
    // Prepare data for the chart
    const formCounts = {};
    pearlData.forEach(pearl => {
        let form = pearl.form || 'Unbekannt';
        formCounts[form] = (formCounts[form] || 0) + 1;
    });

    const chartData = {
        labels: Object.keys(formCounts),
        datasets: [{
            data: Object.values(formCounts),
            backgroundColor: Object.keys(formCounts).map(() => getRandomColor()),
        }]
    };

    const ctx = document.getElementById('formChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: chartData,
        options: {
            indexAxis: 'y',
            responsive: true,
            plugins: {
                legend: { display: false },
                title: { display: false }
            },
            scales: {
                x: { beginAtZero: true }
            }
        },
    });
}

function displayPearlGallery() {
    const gallery = d3.select('#pearlGallery');
    gallery.html('');

    if (filteredPearlData.length === 0) {
        gallery.append('div')
            .attr('class', 'col-12')
            .append('p')
            .attr('class', 'alert alert-info')
            .text('Keine Perlen entsprechen den ausgewählten Filtern.');
        return;
    }

    filteredPearlData.forEach(pearl => {
        const card = gallery.append('div')
            .attr('class', 'col-md-6 col-lg-4 mb-4')
            .append('div')
            .attr('class', 'card h-100');

        // Pearl Image
        card.append('img')
            .attr('src', getImagePath(pearl))
            .attr('class', 'card-img-top')
            .attr('alt', pearl.ObjectName || 'Perle');

        // Pearl Information
        const cardBody = card.append('div').attr('class', 'card-body');

        cardBody.append('h5')
            .attr('class', 'card-title')
            .text(pearl.ObjectName || 'Unbekannte Perle');

        const infoList = cardBody.append('ul').attr('class', 'list-group list-group-flush');

        infoList.append('li')
            .attr('class', 'list-group-item')
            .html(`<strong>Form:</strong> ${pearl.form}`);

        // Represent Ja/Nein visually
        infoList.append('li')
            .attr('class', 'list-group-item')
            .html(`<strong>Riss:</strong> ${formatStatus(pearl.hasRiss)}`);
        if (pearl.hasRiss && pearl.ConditionAttributes.Riss.Beschreibung) {
            infoList.append('li')
                .attr('class', 'list-group-item')
                .html(`<strong>Riss Beschreibung:</strong> ${pearl.ConditionAttributes.Riss.Beschreibung}`);
        }

        infoList.append('li')
            .attr('class', 'list-group-item')
            .html(`<strong>Kratzer:</strong> ${formatStatus(pearl.hasKratzer)}`);
        if (pearl.hasKratzer && pearl.ConditionAttributes.Kratzer.Beschreibung) {
            infoList.append('li')
                .attr('class', 'list-group-item')
                .html(`<strong>Kratzer Beschreibung:</strong> ${pearl.ConditionAttributes.Kratzer.Beschreibung}`);
        }

        infoList.append('li')
            .attr('class', 'list-group-item')
            .html(`<strong>Fehlstelle:</strong> ${formatStatus(pearl.hasFehlstelle)}`);
        if (pearl.hasFehlstelle && pearl.ConditionAttributes.Fehlstelle.Beschreibung) {
            infoList.append('li')
                .attr('class', 'list-group-item')
                .html(`<strong>Fehlstelle Beschreibung:</strong> ${pearl.ConditionAttributes.Fehlstelle.Beschreibung}`);
        }

        infoList.append('li')
            .attr('class', 'list-group-item')
            .html(`<strong>Bohrloch:</strong> ${formatStatus(pearl.hasBohrloch)}`);
        if (pearl.hasBohrloch && pearl.ConditionAttributes.Bohrloch.Bearbeitungsspuren) {
            infoList.append('li')
                .attr('class', 'list-group-item')
                .html(`<strong>Bohrloch Beschreibung:</strong> ${pearl.ConditionAttributes.Bohrloch.Bearbeitungsspuren}`);
        }
    });
}

function getImagePath(pearl) {
    // Check if 'Media' and its fields exist
    if (pearl.Media && pearl.Media.length > 0 && pearl.Media[0].FileName) {
        const cleanedPath = pearl.Media[0].FileName.replace('Projekte\\CROWN\\', '').replace(/\\/g, '/');
        // Construct the final path
        return `https://storage.googleapis.com/crown-dashboard/assets/${cleanedPath}`;
    } else {
        return "images/placeholder.png";
    }
}

function getRandomColor() {
    // Generates a random color for the chart
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function formatStatus(status) {
    return status
        ? '<span class="status-ja">Ja</span>'
        : '<span class="status-nein">Nein</span>';
}
