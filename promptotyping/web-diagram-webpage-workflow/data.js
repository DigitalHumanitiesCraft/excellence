// Timeline data model
const timelineData = {
    startYear: 2020,
    endYear: 2026,
    milestones: [
        { 
            id: 1, 
            name: "Scaling Laws", 
            date: "2020-10", 
            track: "Methodological Approaches", 
            significance: 4, 
            organization: "OpenAI", 
            description: "Discovery of power laws relating model performance to compute, data, and model size",
            related: [3, 5, 10]
        },
        { 
            id: 2, 
            name: "Constitutional AI", 
            date: "2022-12", 
            track: "Methodological Approaches", 
            significance: 3, 
            organization: "Anthropic", 
            description: "Framework using explicit value principles instead of implicit feedback",
            related: [6, 8]
        },
        { 
            id: 3, 
            name: "ASL Framework", 
            date: "2023-04", 
            track: "Methodological Approaches", 
            significance: 3, 
            organization: "Anthropic", 
            description: "AI Safety Levels defining requirements for different capability stages",
            related: [2, 4, 14]
        },
        { 
            id: 4, 
            name: "GPT-4o", 
            date: "2023-11", 
            track: "Technical Foundations", 
            significance: 4, 
            organization: "OpenAI", 
            description: "Omni-modal model with enhanced multi-modal processing",
            related: [5, 7, 9]
        },
        { 
            id: 5, 
            name: "Claude 3.5", 
            date: "2024-01", 
            track: "Technical Foundations", 
            significance: 3, 
            organization: "Anthropic", 
            description: "Advanced LLM with improved reasoning capabilities",
            related: [8, 10, 11]
        },
        { 
            id: 6, 
            name: "Vibe Coding", 
            date: "2024-03", 
            track: "Practical Applications", 
            significance: 3, 
            organization: "Academia", 
            description: "Intuitive, conversational interaction with AI for code generation",
            related: [11, 12]
        },
        { 
            id: 7, 
            name: "Test Time Compute", 
            date: "2024-07", 
            track: "Technical Foundations", 
            significance: 5, 
            organization: "Google", 
            description: "Additional computation during inference for improved reasoning",
            related: [9, 10, 13]
        },
        { 
            id: 8, 
            name: "Claude 3.7", 
            date: "2024-08", 
            track: "Technical Foundations", 
            significance: 4, 
            organization: "Anthropic", 
            description: "Advanced reasoning model with extended thinking capabilities",
            related: [12, 14]
        },
        { 
            id: 9, 
            name: "o3 Model", 
            date: "2024-09", 
            track: "Technical Foundations", 
            significance: 5, 
            organization: "OpenAI", 
            description: "Reinforcement learning on Chains of Thought with multiple verification paths",
            related: [10, 13]
        },
        { 
            id: 10, 
            name: "Manus AI", 
            date: "2024-10", 
            track: "Multi-Agent Systems", 
            significance: 4, 
            organization: "Manus", 
            description: "Multi-agent system combining Claude with specialized tools",
            related: [12, 14]
        },
        { 
            id: 11, 
            name: "Promptseption", 
            date: "2024-11", 
            track: "Practical Applications", 
            significance: 4, 
            organization: "Academia", 
            description: "Meta-level prompting where AI develops strategies for other AIs",
            related: [12, 13]
        },
        { 
            id: 12, 
            name: "Agent Architecture", 
            date: "2024-12", 
            track: "Multi-Agent Systems", 
            significance: 5, 
            organization: "Anthropic", 
            description: "Taxonomy differentiating true LLM agents from orchestrated workflows",
            related: [14]
        },
        { 
            id: 13, 
            name: "DeepResearch", 
            date: "2025-01", 
            track: "Practical Applications", 
            significance: 5, 
            organization: "OpenAI", 
            description: "First widely accessible Task-A(G)I system for research",
            related: [14]
        },
        { 
            id: 14, 
            name: "ARC-AGI-2", 
            date: "2025-03", 
            track: "Methodological Approaches", 
            significance: 4, 
            organization: "Google", 
            description: "Improved benchmark measuring adaptability to new problems",
            related: []
        }
    ]
};

// Track definitions with clear colors and descriptions
const tracks = [
    { id: "Technical Foundations", color: "#4361EE", description: "Core technical innovations enabling advanced capabilities" },
    { id: "Methodological Approaches", color: "#4CC9F0", description: "Frameworks and methods for developing and evaluating AGI systems" },
    { id: "Multi-Agent Systems", color: "#7209B7", description: "Systems enabling coordination between specialized AI agents" },
    { id: "Practical Applications", color: "#F72585", description: "Real-world implementations demonstrating Proto-AGI capabilities" }
];

// Organization definitions with clear visual encodings
const organizations = [
    { id: "OpenAI", shape: "circle", color: "#FF5700" },
    { id: "Anthropic", shape: "rect", color: "#3A86FF" },
    { id: "Google", shape: "diamond", color: "#8338EC" },
    { id: "Academia", shape: "triangle", color: "#FB5607" },
    { id: "Manus", shape: "cross", color: "#FF006E" }
];

// Phase definitions for the emergence narrative - FIXED with proper dates instead of fractional years
const phases = [
    { name: "Isolated Capabilities", startYear: 2020, endYear: 2023, color: "#FFB55A30" },
    { name: "Capability Integration", startYear: 2023, endYear: "2024-09", color: "#FFB55A50" }, // Changed 2024.75 to "2024-09"
    { name: "Proto-AGI Emergence", startYear: "2024-09", endYear: 2026, color: "#FFB55A70" }    // Changed 2024.75 to "2024-09"
];

// Acceleration data for the "Fast Take-Off" curve with smoother progression - FIXED with proper dates instead of fractional years
const accelerationData = [
    { year: "2020", intensity: 0.1 },
    { year: "2021", intensity: 0.12 },
    { year: "2022", intensity: 0.15 },
    { year: "2023", intensity: 0.25 },
    { year: "2023-06", intensity: 0.35 },  // Changed 2023.5 to "2023-06"
    { year: "2024", intensity: 0.5 },
    { year: "2024-03", intensity: 0.6 },   // Changed 2024.25 to "2024-03"
    { year: "2024-06", intensity: 0.7 },   // Changed 2024.5 to "2024-06"
    { year: "2024-09", intensity: 0.8 },   // Changed 2024.75 to "2024-09"
    { year: "2025", intensity: 0.9 },
    { year: "2026", intensity: 1.0 }
];

// Enhanced description data for additional context
const contextData = {
    overview: "This visualization depicts the emergence of Proto-AGI through interconnected technological and methodological developments between 2020-2026.",
    methodology: "Data is derived from the article 'Proto-AGI kommt schneller als erwartet' by Christopher Pollin, analyzing evidence for accelerated AGI development.",
    interpretation: "The 'Fast Take-Off' curve represents the accelerating pace of development, while connections between milestones show direct influence relationships."
};

// Helper functions for data processing
function getTrackColor(trackId) {
    const track = tracks.find(t => t.id === trackId);
    return track ? track.color : "#999";
}

function getOrganizationShape(orgId) {
    const org = organizations.find(o => o.id === orgId);
    return org ? org.shape : "circle";
}

function getOrganizationColor(orgId) {
    const org = organizations.find(o => o.id === orgId);
    return org ? org.color : "#999";
}

function getMilestoneById(id) {
    return timelineData.milestones.find(m => m.id === id);
}

function getRelatedMilestones(milestoneId) {
    const milestone = getMilestoneById(milestoneId);
    if (!milestone || !milestone.related) return [];
    
    return milestone.related.map(id => getMilestoneById(id)).filter(Boolean);
}

// Get all connections between milestones for visualization
function getAllConnections() {
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
                        targetTrack: targetMilestone.track,
                        sourceName: milestone.name,
                        targetName: targetMilestone.name
                    });
                }
            });
        }
    });
    
    return connections;
}

// Get milestone counts by organization for statistics
function getMilestoneCounts() {
    const counts = {};
    
    organizations.forEach(org => {
        counts[org.id] = timelineData.milestones.filter(m => m.organization === org.id).length;
    });
    
    return counts;
}

// Helper function to convert string year or fractional year to proper date
function yearToDate(year) {
    // If year is already a date string (e.g., "2024-09"), return it
    if (typeof year === 'string' && year.includes('-')) {
        // Ensure the date has a day component
        if (year.split('-').length === 2) {
            return `${year}-01`;
        }
        return year;
    }
    
    // If year is a number
    if (typeof year === 'number') {
        if (Number.isInteger(year)) {
            return `${year}-01-01`;
        } else {
            // Convert fractional year to a date
            // e.g., 2024.75 -> 2024 + 0.75*12 months -> approx 2024-09-01
            const wholeYear = Math.floor(year);
            const monthFraction = (year - wholeYear) * 12;
            const month = Math.floor(monthFraction) + 1; // +1 because months are 1-based in date strings
            return `${wholeYear}-${month.toString().padStart(2, '0')}-01`;
        }
    }
    
    // Default fallback
    return year;
}

// Export data and helpers if using modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        timelineData,
        tracks,
        organizations,
        phases,
        accelerationData,
        contextData,
        getTrackColor,
        getOrganizationShape,
        getOrganizationColor,
        getMilestoneById,
        getRelatedMilestones,
        getAllConnections,
        getMilestoneCounts,
        yearToDate
    };
}