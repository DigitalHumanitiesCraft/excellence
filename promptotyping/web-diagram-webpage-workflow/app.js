// Main application code for Proto-AGI Development Timeline visualization
document.addEventListener('DOMContentLoaded', function() {
    // Ensure the container has width before initialization
    setTimeout(function() {
        // Main visualization setup
        const containerElement = document.getElementById('visualization');
        let width = containerElement.clientWidth || 1000; // Provide fallback width
        
        if (width <= 0) {
            width = 1000; // Set a reasonable default
            console.log("Container width was zero or invalid, using default width");
        }
        
        let height = 650;
        
        console.log("Container width:", width);
        console.log("Container height:", height);
        
        // Create SVG
        const svg = d3.select(containerElement)
            .append('svg')
            .attr('width', width)
            .attr('height', height)
            .attr('viewBox', `0 0 ${width} ${height}`)
            .attr('preserveAspectRatio', 'xMidYMid meet');
        
        // Add a cosmic background gradient
        const defs = svg.append("defs");
        
        // Create cosmic gradient
        const cosmicGradient = defs.append("linearGradient")
            .attr("id", "cosmic-background")
            .attr("x1", "0%")
            .attr("y1", "0%")
            .attr("x2", "100%")
            .attr("y2", "100%");
            
        cosmicGradient.append("stop")
            .attr("offset", "0%")
            .attr("stop-color", "#0A1128")
            .attr("stop-opacity", 0.03);
            
        cosmicGradient.append("stop")
            .attr("offset", "50%")
            .attr("stop-color", "#3E236E")
            .attr("stop-opacity", 0.05);
            
        cosmicGradient.append("stop")
            .attr("offset", "100%")
            .attr("stop-color", "#00B2FF")
            .attr("stop-opacity", 0.03);
        
        // Create arrowhead marker definition
        defs.append("marker")
            .attr("id", "arrowhead")
            .attr("viewBox", "0 -5 10 10")
            .attr("refX", 8)
            .attr("refY", 0)
            .attr("orient", "auto")
            .attr("markerWidth", 6)
            .attr("markerHeight", 6)
            .append("path")
            .attr("d", "M0,-5L10,0L0,5")
            .attr("fill", "#555");
        
        // Initialize the visualization with parameters
        createVisualization(svg, width, height);
        
        // Handle window resizing
        window.addEventListener('resize', function() {
            // Debounce the resize handler
            clearTimeout(window.resizeTimer);
            window.resizeTimer = setTimeout(function() {
                width = containerElement.clientWidth || 1000; // Provide fallback
                
                // Don't attempt to redraw if width is invalid
                if (width <= 0) {
                    console.error("Invalid container width during resize");
                    return;
                }
                
                svg.attr('width', width)
                   .attr('viewBox', `0 0 ${width} ${height}`);
                
                // Clear and redraw visualization
                svg.selectAll('*').remove();
                createVisualization(svg, width, height);
            }, 250); // Debounce to avoid too many recalculations
        });

        // Handle connection toggle
        document.getElementById('show-connections').addEventListener('change', function(e) {
            const showConnections = e.target.checked;
            d3.selectAll('.connection').style('visibility', showConnections ? 'visible' : 'hidden');
        });
        
        // Handle zoom controls if they exist
        const zoomInBtn = document.getElementById('zoom-in');
        const zoomOutBtn = document.getElementById('zoom-out');
        const resetBtn = document.getElementById('zoom-reset');
        
        if (zoomInBtn && zoomOutBtn && resetBtn) {
            let currentZoom = 1;
            const zoomStep = 0.1;
            const maxZoom = 2;
            const minZoom = 0.5;
            
            zoomInBtn.addEventListener('click', function() {
                if (currentZoom < maxZoom) {
                    currentZoom += zoomStep;
                    applyZoom();
                }
            });
            
            zoomOutBtn.addEventListener('click', function() {
                if (currentZoom > minZoom) {
                    currentZoom -= zoomStep;
                    applyZoom();
                }
            });
            
            resetBtn.addEventListener('click', function() {
                currentZoom = 1;
                applyZoom();
            });
            
            function applyZoom() {
                const vizContent = document.querySelector('#visualization svg g');
                if (vizContent) {
                    vizContent.style.transform = `scale(${currentZoom})`;
                    vizContent.style.transformOrigin = 'center';
                }
            }
        }
    }, 100); // Short delay to ensure container is rendered
});

// General defensive function for working with dimension calculations
function safeDimension(value, fallback = 0) {
    return (value !== undefined && !isNaN(value) && value > 0) ? value : fallback;
}

// Helper function to parse date strings or year values
function parseDate(dateStr) {
    // Handle string date formats
    if (typeof dateStr === 'string') {
        // Check if it's just a year
        if (/^\d{4}$/.test(dateStr)) {
            return new Date(`${dateStr}-01-01`);
        }
        // Check if it's year-month format
        else if (/^\d{4}-\d{1,2}$/.test(dateStr)) {
            // Ensure month is padded with leading zero if needed
            const parts = dateStr.split('-');
            const month = parts[1].padStart(2, '0');
            return new Date(`${parts[0]}-${month}-01`);
        }
        // Assume it's a full date
        return new Date(dateStr);
    }
    // Handle numeric years
    else if (typeof dateStr === 'number') {
        if (Number.isInteger(dateStr)) {
            return new Date(`${dateStr}-01-01`);
        } else {
            // Convert fractional year to date
            const year = Math.floor(dateStr);
            const monthDecimal = (dateStr - year) * 12;
            const month = Math.floor(monthDecimal) + 1;
            return new Date(`${year}-${month.toString().padStart(2, '0')}-01`);
        }
    }
    // Fallback for any other type
    return new Date(dateStr);
}

function createVisualization(svg, width, height) {
    // Set margins with increased left margin for track labels
    const margin = { top: 80, right: 70, bottom: 100, left: 180 };
    const vizWidth = Math.max(width - margin.left - margin.right, 100); // Ensure minimum width
    const vizHeight = Math.max(height - margin.top - margin.bottom, 100); // Ensure minimum height
    
    console.log("Visualization dimensions:", { vizWidth, vizHeight });
    
    // Add main group
    const g = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Add background for the main visualization area with cosmic gradient
    g.append("rect")
        .attr("width", vizWidth)
        .attr("height", vizHeight)
        .attr("fill", "url(#cosmic-background)")
        .attr("rx", 10);

    // Create groups for different layers
    const phasesGroup = g.append("g").attr("class", "phases");
    const gridGroup = g.append("g").attr("class", "grid");
    const tracksGroup = g.append("g").attr("class", "tracks");
    const connectionsGroup = g.append("g").attr("class", "connections");
    const nodesGroup = g.append("g").attr("class", "nodes");
    const labelsGroup = g.append("g").attr("class", "labels");
    const accelerationGroup = g.append("g").attr("class", "acceleration");

    // Create time scale for x-axis
    const startDate = new Date(`${timelineData.startYear}-01-01`);
    const endDate = new Date(`${timelineData.endYear}-12-31`);
    
    console.log("Time scale domain:", [startDate, endDate]);
    
    const timeScale = d3.scaleTime()
        .domain([startDate, endDate])
        .range([0, vizWidth]);
    
    console.log("Time scale range:", [0, vizWidth]);
    
    // Create tracks y-scale
    const trackIds = tracks.map(t => t.id);
    const yScale = d3.scaleBand()
        .domain(trackIds)
        .range([0, vizHeight])
        .padding(0.2);

    // Draw phase backgrounds with improved styling
    phases.forEach(phase => {
        try {
            const phaseStartDate = parseDate(phase.startYear);
            const phaseEndDate = parseDate(phase.endYear);
            
            const phaseStartX = timeScale(phaseStartDate);
            const phaseEndX = timeScale(phaseEndDate);
            const phaseWidth = phaseEndX - phaseStartX;
            
            if (isNaN(phaseStartX) || isNaN(phaseEndX) || isNaN(phaseWidth)) {
                console.error("Invalid phase position:", phase, { phaseStartX, phaseEndX, phaseWidth });
                return; // Skip this phase
            }
            
            phasesGroup.append("rect")
                .attr("x", phaseStartX)
                .attr("y", 0)
                .attr("width", safeDimension(phaseWidth))
                .attr("height", vizHeight)
                .attr("fill", phase.color)
                .attr("rx", 5);
            
            // Add phase label at the top with improved styling
            phasesGroup.append("text")
                .attr("x", safeDimension((phaseStartX + phaseEndX) / 2))
                .attr("y", -25)
                .attr("text-anchor", "middle")
                .attr("dominant-baseline", "middle")
                .attr("class", "phase-label")
                .text(phase.name)
                .style("font-size", "12px")
                .style("font-weight", "bold")
                .style("font-family", "'Montserrat', sans-serif")
                .style("fill", "#555");
        } catch (error) {
            console.error("Error drawing phase:", phase, error);
        }
    });

    // Draw timeline axis with years - styled according to design
    const xAxis = d3.axisBottom(timeScale)
        .ticks(d3.timeYear.every(1))
        .tickFormat(d3.timeFormat("%Y"))
        .tickSize(-vizHeight); // Grid lines

    const xAxisGroup = gridGroup.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0,${vizHeight})`)
        .call(xAxis);
    
    // Style the axis according to design
    xAxisGroup.selectAll("text")
        .style("font-size", "14px")
        .style("font-weight", "bold")
        .style("font-family", "'Inter', sans-serif");
    
    xAxisGroup.selectAll("line")
        .style("stroke", "#ccc")
        .style("stroke-dasharray", "2,2");
    
    xAxisGroup.select("path")
        .style("stroke", "#888");

    // Draw track lanes with enhanced styling from design
    tracksGroup.selectAll(".track-lane")
        .data(tracks)
        .enter()
        .append("rect")
        .attr("class", "track-lane")
        .attr("data-track", d => d.id) // Add data attribute for CSS targeting
        .attr("x", 0)
        .attr("y", d => {
            const y = yScale(d.id);
            return isNaN(y) ? 0 : y;
        })
        .attr("width", vizWidth)
        .attr("height", d => {
            const h = yScale.bandwidth();
            return isNaN(h) ? 0 : h;
        })
        .attr("fill", d => `${d.color}15`)
        .attr("stroke", d => `${d.color}30`)
        .attr("stroke-width", 1)
        .attr("rx", 8);

    // Add track labels with enhanced styling from design
    tracksGroup.selectAll(".track-label")
        .data(tracks)
        .enter()
        .append("g")
        .attr("class", "track-label")
        .attr("transform", d => {
            const y = yScale(d.id);
            const bandHeight = yScale.bandwidth();
            return `translate(-15,${isNaN(y) ? 0 : y + (isNaN(bandHeight) ? 0 : bandHeight / 2)})`;
        })
        .each(function(d) {
            // Add background pill for the label
            d3.select(this).append("rect")
                .attr("x", -150)
                .attr("y", -15)
                .attr("width", 150)
                .attr("height", 30)
                .attr("fill", `${d.color}20`)
                .attr("stroke", d.color)
                .attr("stroke-width", 1)
                .attr("rx", 15);
            
            // Add text with updated font
            d3.select(this).append("text")
                .attr("x", -75)
                .attr("y", 0)
                .attr("text-anchor", "middle")
                .attr("dominant-baseline", "middle")
                .text(d.id)
                .style("font-weight", "bold")
                .style("font-size", "14px")
                .style("font-family", "'Montserrat', sans-serif")
                .style("fill", d.color);
        });

    // Add acceleration curve ("Fast Take-Off") with updated styling
    const accelerationLine = d3.line()
        .x(d => {
            try {
                const date = parseDate(d.year);
                const xPos = timeScale(date);
                if (isNaN(xPos)) {
                    console.error("Invalid x position for year:", d.year, date);
                    return 0; // Default position to avoid breaking
                }
                return xPos;
            } catch (error) {
                console.error("Error calculating x position for acceleration data:", d, error);
                return 0;
            }
        })
        .y(d => {
            try {
                const yPos = vizHeight * (1 - d.intensity) * 0.8;
                if (isNaN(yPos)) {
                    console.error("Invalid y position for intensity:", d.intensity);
                    return 0; // Default position to avoid breaking
                }
                return yPos;
            } catch (error) {
                console.error("Error calculating y position for acceleration data:", d, error);
                return 0;
            }
        })
        .defined(d => {
            try {
                const date = parseDate(d.year);
                return !isNaN(timeScale(date)) && !isNaN(d.intensity);
            } catch (error) {
                return false;
            }
        })
        .curve(d3.curveCardinal);

    // Filter valid acceleration data points before using them
    const validAccelerationData = accelerationData.filter(d => {
        try {
            const date = parseDate(d.year);
            return !isNaN(timeScale(date)) && !isNaN(d.intensity);
        } catch (error) {
            console.error("Invalid acceleration data point:", d);
            return false;
        }
    });

    accelerationGroup.append("path")
        .datum(validAccelerationData)
        .attr("class", "acceleration-curve")
        .attr("d", accelerationLine)
        .attr("fill", "none")
        .attr("stroke", "#FF5700") // OpenAI color for Fast Take-Off from design
        .attr("stroke-width", 3)
        .attr("stroke-dasharray", "5,3")
        .attr("opacity", 0.8);

    // Add "Fast Take-Off" label with updated styling
    try {
        const takeoffLabelX = timeScale(parseDate("2024-03"));
        
        if (!isNaN(takeoffLabelX)) {
            const takeoffLabel = accelerationGroup.append("g")
                .attr("transform", `translate(${takeoffLabelX}, ${vizHeight * 0.3})`);
            
            takeoffLabel.append("rect")
                .attr("x", -55)
                .attr("y", -15)
                .attr("width", 110)
                .attr("height", 25)
                .attr("fill", "white")
                .attr("stroke", "#FF5700") // OpenAI color for Fast Take-Off from design
                .attr("stroke-width", 1)
                .attr("rx", 12)
                .attr("opacity", 0.9);
            
            takeoffLabel.append("text")
                .attr("text-anchor", "middle")
                .attr("dominant-baseline", "middle")
                .text("Fast Take-Off")
                .style("font-weight", "bold")
                .style("font-size", "14px")
                .style("font-family", "'Montserrat', sans-serif")
                .style("fill", "#FF5700"); // OpenAI color for Fast Take-Off from design
        }
    } catch (error) {
        console.error("Error adding Fast Take-Off label:", error);
    }

    // Helper function to draw different shapes with improved styling
    function drawShape(selection, shape, size, color) {
        switch(shape) {
            case "rect":
                return selection.append("rect")
                    .attr("x", -size/2)
                    .attr("y", -size/2)
                    .attr("width", size)
                    .attr("height", size)
                    .attr("rx", 2)
                    .attr("fill", color);
            case "diamond":
                return selection.append("path")
                    .attr("d", d3.symbol().type(d3.symbolDiamond).size(size * size * 1.5))
                    .attr("fill", color);
            case "triangle":
                return selection.append("path")
                    .attr("d", d3.symbol().type(d3.symbolTriangle).size(size * size * 1.5))
                    .attr("fill", color);
            case "cross":
                return selection.append("path")
                    .attr("d", d3.symbol().type(d3.symbolCross).size(size * size * 1.5))
                    .attr("fill", color);
            case "circle":
            default:
                return selection.append("circle")
                    .attr("r", size / 2)
                    .attr("fill", color);
        }
    }

    // Create dictionary to store node positions for connection drawing
    const nodePositions = {};

    // Ensure all milestone dates are properly formatted
    timelineData.milestones.forEach(milestone => {
        try {
            // Parse milestone date and set it directly on the milestone object for future use
            milestone.parsedDate = parseDate(milestone.date);
        } catch (error) {
            console.error("Error parsing milestone date:", milestone, error);
        }
    });

    // Draw milestone nodes with improved styling from design
    timelineData.milestones.forEach(milestone => {
        try {
            const date = milestone.parsedDate || parseDate(milestone.date);
            const x = timeScale(date);
            const y = yScale(milestone.track) + yScale.bandwidth() / 2;
            
            // Log milestone positions for debugging
            console.log(`Milestone ${milestone.id} (${milestone.name}) position:`, { x, y, date: milestone.date });
            
            // Skip milestones with invalid positions
            if (isNaN(x) || isNaN(y)) {
                console.error("Invalid position for milestone:", milestone);
                return;
            }
            
            // Store position for connection drawing
            nodePositions[milestone.id] = { x, y };
            
            // Add node group with data attributes for styling
            const nodeGroup = nodesGroup.append("g")
                .attr("class", "milestone")
                .attr("data-id", milestone.id)
                .attr("data-organization", milestone.organization) // Add data attribute for CSS targeting
                .attr("transform", `translate(${x}, ${y})`);

            // Size based on significance (1-5) - scale according to design (10-30px)
            const size = 10 + milestone.significance * 4;

            // Draw the shape with organization color from design
            drawShape(
                nodeGroup, 
                getOrganizationShape(milestone.organization), 
                size, 
                getOrganizationColor(milestone.organization)
            )
                .attr("stroke", "#fff")
                .attr("stroke-width", 2);

            // Add label with background for better readability - styled according to design
            // Use intelligent label placement to avoid overlaps
            const labelOffset = milestone.track === "Technical Foundations" || milestone.track === "Practical Applications" 
                ? size + 5 : -(size + 5);
            
            const labelGroup = labelsGroup.append("g")
                .attr("class", "milestone-label")
                .attr("transform", `translate(${x}, ${y + labelOffset})`);
            
            // Add label background with styling from design
            labelGroup.append("rect")
                .attr("x", -50)
                .attr("y", -12)
                .attr("width", 100)
                .attr("height", 24)
                .attr("fill", "white")
                .attr("stroke", getTrackColor(milestone.track))
                .attr("stroke-width", 1)
                .attr("rx", 5)
                .attr("opacity", 0.9);
            
            // Add label text with updated font from design
            labelGroup.append("text")
                .attr("text-anchor", "middle")
                .attr("dominant-baseline", "middle")
                .text(milestone.name)
                .style("font-size", "11px")
                .style("font-weight", "500")
                .style("font-family", "'Inter', sans-serif");

            // Add enhanced tooltip functionality
            nodeGroup.on("mouseover", function(event) {
                // Highlight node
                d3.select(this).select("circle, rect, path")
                    .attr("stroke", "#333")
                    .attr("stroke-width", 3)
                    .attr("filter", "drop-shadow(0 0 3px rgba(0,0,0,0.3))");
                
                // Highlight connections
                connectionsGroup.selectAll(".connection")
                    .filter(d => d.source === milestone.id || d.target === milestone.id)
                    .attr("stroke-width", 2.5)
                    .attr("stroke-opacity", 1);
                
                // Create a detailed tooltip with improved styling
                const tooltip = g.append("g")
                    .attr("class", "tooltip")
                    .attr("transform", `translate(${x}, ${y - size - 15})`);
                
                // Tooltip background
                tooltip.append("rect")
                    .attr("x", -120)
                    .attr("y", -80)
                    .attr("width", 240)
                    .attr("height", 80)
                    .attr("fill", "white")
                    .attr("stroke", getTrackColor(milestone.track))
                    .attr("stroke-width", 2)
                    .attr("rx", 8)
                    .attr("filter", "drop-shadow(0 2px 5px rgba(0,0,0,0.2))");
                
                // Tooltip content with updated fonts
                tooltip.append("text")
                    .attr("text-anchor", "middle")
                    .attr("y", -55)
                    .text(milestone.name)
                    .style("font-weight", "bold")
                    .style("font-size", "14px")
                    .style("font-family", "'Montserrat', sans-serif");
                    
                tooltip.append("text")
                    .attr("text-anchor", "middle")
                    .attr("y", -35)
                    .text(`${milestone.organization} (${milestone.date})`)
                    .style("font-size", "12px")
                    .style("font-family", "'Inter', sans-serif");
                    
                // Description text with wrapping and improved styling
                const descText = tooltip.append("text")
                    .attr("text-anchor", "middle")
                    .attr("y", -15)
                    .style("font-size", "11px")
                    .style("font-style", "italic")
                    .style("font-family", "'Inter', sans-serif");
                    
                // Wrap description text
                const words = milestone.description.split(/\s+/);
                let line = "";
                let lineNumber = 0;
                const lineHeight = 1.2;
                const maxWidth = 230;
                
                words.forEach(word => {
                    const testLine = line + (line ? " " : "") + word;
                    // Simple width estimation
                    if (testLine.length * 5.5 > maxWidth) {
                        // Start a new line
                        descText.append("tspan")
                            .attr("x", 0)
                            .attr("dy", lineNumber ? lineHeight + "em" : 0)
                            .text(line);
                        line = word;
                        lineNumber++;
                    } else {
                        line = testLine;
                    }
                });
                
                // Add remaining text
                descText.append("tspan")
                    .attr("x", 0)
                    .attr("dy", lineNumber ? lineHeight + "em" : 0)
                    .text(line);
            })
            .on("mouseout", function() {
                // Restore node appearance
                d3.select(this).select("circle, rect, path")
                    .attr("stroke", "#fff")
                    .attr("stroke-width", 2)
                    .attr("filter", null);
                
                // Restore connection appearance
                connectionsGroup.selectAll(".connection")
                    .attr("stroke-width", 1.5)
                    .attr("stroke-opacity", 0.6);
                
                // Remove tooltip
                g.select(".tooltip").remove();
            });
        } catch (error) {
            console.error("Error drawing milestone:", milestone, error);
        }
    });

    // Draw connections between related milestones
    // Create connection data from milestone relationships
    const connections = [];
    timelineData.milestones.forEach(milestone => {
        if (milestone.related && milestone.related.length > 0) {
            milestone.related.forEach(targetId => {
                const targetMilestone = getMilestoneById(targetId);
                if (targetMilestone) {
                    connections.push({
                        source: milestone.id,
                        target: targetId,
                        sourceTrack: milestone.track,
                        targetTrack: targetMilestone.track
                    });
                }
            });
        }
    });

    // Draw connections with appropriate curve based on track relationship - styled according to design
    connections.forEach(connection => {
        try {
            const source = nodePositions[connection.source];
            const target = nodePositions[connection.target];
            
            if (!source || !target) {
                console.error("Missing node position for connection:", connection);
                return; // Skip this connection
            }
            
            if (isNaN(source.x) || isNaN(source.y) || isNaN(target.x) || isNaN(target.y)) {
                console.error("Invalid node position for connection:", { connection, source, target });
                return; // Skip this connection
            }
            
            // Determine if connection is between tracks or within track
            const isCrossTrack = connection.sourceTrack !== connection.targetTrack;
            
            // Create path generator
            let pathString;
            
            if (isCrossTrack) {
                // Use a curved line for cross-track connections
                const controlPointY = (source.y + target.y) / 2;
                const controlPointX1 = source.x + (target.x - source.x) * 0.2;
                const controlPointX2 = source.x + (target.x - source.x) * 0.8;
                
                pathString = `M${source.x},${source.y} C${controlPointX1},${controlPointY} ${controlPointX2},${controlPointY} ${target.x},${target.y}`;
            } else {
                // Use a simple curved line for same-track connections
                const controlPointY = source.y - 20;
                const controlPointX = (source.x + target.x) / 2;
                
                pathString = `M${source.x},${source.y} Q${controlPointX},${controlPointY} ${target.x},${target.y}`;
            }
            
            // Get style based on whether it's cross-track or not
            const connectionColor = isCrossTrack ? "#555" : getTrackColor(connection.sourceTrack);
            
            // Draw the connection with improved styling
            connectionsGroup.append("path")
                .attr("class", "connection")
                .attr("d", pathString)
                .attr("fill", "none")
                .attr("stroke", connectionColor)
                .attr("stroke-width", 1.5)
                .attr("stroke-opacity", 0.6)
                .attr("stroke-dasharray", isCrossTrack ? "5,5" : "none")
                .attr("marker-end", "url(#arrowhead)");
        } catch (error) {
            console.error("Error creating connection:", connection, error);
        }
    });

    // Add legend for organizations with improved styling from design
    const legendGroup = svg.append("g")
        .attr("transform", `translate(${width - margin.right - 350}, ${margin.top - 50})`);
    
// Background for the legend
legendGroup.append("rect")
.attr("x", -10)
.attr("y", -20)
.attr("width", 360)
.attr("height", 40)
.attr("fill", "white")
.attr("stroke", "#ccc")
.attr("rx", 5);

// Organization icons and labels with improved styling
organizations.forEach((org, i) => {
const legendItem = legendGroup.append("g")
    .attr("transform", `translate(${i * 70}, 0)`);

// Draw shape using the organization's color
drawShape(legendItem, org.shape, 14, org.color);

legendItem.append("text")
    .attr("x", 10)
    .attr("y", 4)
    .text(org.id)
    .style("font-size", "12px")
    .style("font-family", "'Inter', sans-serif")
    .style("fill", "#333");
});

// Add version indicator with updated font
svg.append("text")
.attr("x", width - margin.right - 10)
.attr("y", margin.top - 20)
.attr("text-anchor", "end")
.style("font-size", "12px")
.style("font-weight", "bold")
.style("font-family", "'Inter', sans-serif")
.text("V1.0");

// Add attribution for Creative Commons licensing
svg.append("text")
.attr("class", "attribution")
.attr("x", width - margin.right - 10)
.attr("y", height - 20)
.attr("text-anchor", "end")
.style("font-size", "11px")
.style("font-family", "'Inter', sans-serif")
.style("fill", "#666")
.text("© 2025 Digital Humanities Craft OG. CC BY 4.0");
}