// Global Variables
let data = [];
let filteredData = [];
let chartType = "treemap"; // Can be 'treemap' or 'sunburst'

// Load Data
fetch("data.json")
  .then((response) => response.json())
  .then((jsonData) => {
    data = prepareData(jsonData);
    initializeControls();
    updateVisualization();
  })
  .catch((error) => {
    console.error("Error loading data:", error);
    document.getElementById("chart").innerText = "Failed to load data.";
  });

// Prepare Data Function
function prepareData(rawData) {
  const treemapData = [];

  rawData.forEach((entry) => {
    const roomProps = entry.e.properties;
    const objProps = entry.o.properties;

    const building = roomProps.gebaeude?.[0] || "Unknown Building";
    const roomName = roomProps.name?.[0] || "Unnamed Room";

    const objName = objProps.bezeichnung?.[0] || "Unnamed Object";
    let objQuantity = objProps.anzahl?.[0] || 1;
    let objValue = objProps.wert?.[0] || 0;

    objQuantity = parseInt(objQuantity) || 1;
    objValue = parseFloat(objValue) || 0.0;

    treemapData.push({
      Building: building,
      Room: roomName,
      Object: objName,
      Quantity: objQuantity,
      Value: objValue,
    });
  });

  // Group rare objects under 'Others'
  const objectCounts = {};
  treemapData.forEach((item) => {
    objectCounts[item.Object] = (objectCounts[item.Object] || 0) + 1;
  });

  const threshold = 3;
  treemapData.forEach((item) => {
    if (objectCounts[item.Object] < threshold) {
      item.Object = "Others";
    }
  });

  return treemapData;
}

// Initialize Controls
function initializeControls() {
  const objectTypeDropdown = document.getElementById("object-type-dropdown");
  const objectTypes = [...new Set(data.map((item) => item.Object))].sort();

  objectTypes.forEach((type) => {
    const option = document.createElement("option");
    option.value = type;
    option.text = type;
    objectTypeDropdown.add(option);
  });

  // Event Listeners
  document
    .getElementById("object-type-dropdown")
    .addEventListener("change", updateVisualization);
  document
    .getElementById("search-input")
    .addEventListener("input", updateVisualization);
  document
    .getElementById("switch-button")
    .addEventListener("click", switchChartType);
}

// Update Visualization
function updateVisualization() {
  const selectedObjects = Array.from(
    document.getElementById("object-type-dropdown").selectedOptions
  ).map((opt) => opt.value);
  const searchQuery = document
    .getElementById("search-input")
    .value.toLowerCase();

  // Filter Data
  filteredData = data.filter((item) => {
    const matchesObject =
      selectedObjects.length === 0 || selectedObjects.includes(item.Object);
    const matchesSearch =
      item.Room.toLowerCase().includes(searchQuery) ||
      item.Object.toLowerCase().includes(searchQuery);
    return matchesObject && matchesSearch;
  });

  // Update Summary Stats
  updateSummaryStats();

  if (filteredData.length === 0) {
    document.getElementById("chart").innerText = "No data matches the filters.";
    return;
  } else {
    document.getElementById("chart").innerText = ""; // Clear any previous messages
  }

  // Build hierarchy using unique IDs
  const labels = [];
  const ids = [];
  const parents = [];
  const values = [];

  const idMap = {};

  // Calculate total quantities for Rooms and Buildings
  const roomTotals = {};
  const buildingTotals = {};

  // First, calculate totals for Objects under each Room
  filteredData.forEach((item) => {
    const building = item.Building;
    const room = item.Room;
    const object = item.Object;
    const quantity = item.Quantity;

    const roomKey = `${building}|${room}`;
    roomTotals[roomKey] = (roomTotals[roomKey] || 0) + quantity;
    buildingTotals[building] = (buildingTotals[building] || 0) + quantity;
  });

  // Collect unique Buildings
  const buildings = Object.keys(buildingTotals);
  buildings.forEach((building) => {
    const id = `building_${building}`;
    idMap[building] = id;
    labels.push(building);
    ids.push(id);
    parents.push("");
    values.push(buildingTotals[building]);
  });

  // Collect unique Rooms
  const rooms = Object.keys(roomTotals);
  rooms.forEach((roomKey) => {
    const [building, room] = roomKey.split("|");
    const id = `room_${building}_${room}`;
    idMap[roomKey] = id;
    labels.push(room);
    ids.push(id);
    parents.push(idMap[building]);
    values.push(roomTotals[roomKey]);
  });

  // Add Objects
  filteredData.forEach((item) => {
    const building = item.Building;
    const room = item.Room;
    const object = item.Object;
    const quantity = item.Quantity;

    const roomKey = `${building}|${room}`;
    const id = `object_${building}_${room}_${object}`;
    const parentId = idMap[roomKey];

    labels.push(object);
    ids.push(id);
    parents.push(parentId);
    values.push(quantity);
  });

  // Prepare Plotly Data
  const plotData = [
    {
      type: chartType,
      labels: labels,
      ids: ids,
      parents: parents,
      values: values,
      textinfo: "label+value",
      hovertemplate: "<b>%{label}</b><br>Quantity: %{value}<extra></extra>",
      branchvalues: "total",
    },
  ];

  const layout = {
    margin: { t: 50, l: 25, r: 25, b: 25 },
  };

  // Render Chart
  Plotly.newPlot("chart", plotData, layout);
}

// Update Summary Stats
function updateSummaryStats() {
  const totalRooms = new Set(filteredData.map((item) => item.Room)).size;
  const totalObjects = new Set(filteredData.map((item) => item.Object)).size;
  const totalQuantity = filteredData.reduce(
    (sum, item) => sum + item.Quantity,
    0
  );

  const summaryDiv = document.getElementById("summary-stats");
  summaryDiv.innerHTML = `
    <p>Total Rooms: ${totalRooms}</p>
    <p>Total Objects: ${totalObjects}</p>
    <p>Total Quantity: ${totalQuantity}</p>
  `;
}

// Switch Chart Type
function switchChartType() {
  chartType = chartType === "treemap" ? "sunburst" : "treemap";
  document.getElementById("switch-button").innerText =
    chartType === "treemap" ? "Switch to Sunburst" : "Switch to Treemap";
  updateVisualization();
}
