/**
 * test-infovis.js
 * 
 * Comprehensive testing for all information visualizations in the Stefan Zweig Digital Dashboard
 * This file tests each visualization component individually and then checks integration.
 */

// ===== VISUALIZATION TESTING FRAMEWORK =====

/**
 * Visualization testing utilities
 */
const VisTest = {
    results: {},
    testCount: 0,
    passCount: 0,
    
    /**
     * Run a visualization test
     * @param {string} name - Test name
     * @param {Function} testFn - Test function
     */
    test(name, testFn) {
      console.log(`Running visualization test: ${name}`);
      this.testCount++;
      
      try {
        testFn();
        console.log(`✓ ${name} passed`);
        this.passCount++;
        this.results[name] = { passed: true };
      } catch (error) {
        console.error(`✗ ${name} failed: ${error.message}`);
        this.results[name] = { passed: false, error: error.message };
      }
    },
    
    /**
     * Assert that a canvas contains a rendered visualization
     * @param {string} canvasId - Canvas element ID
     */
    assertCanvasRendered(canvasId) {
      const canvas = document.getElementById(canvasId);
      if (!canvas) {
        throw new Error(`Canvas with ID "${canvasId}" not found`);
      }
      
      // Check if canvas has content by reading pixel data
      const ctx = canvas.getContext('2d');
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      // Check if any pixels are non-transparent
      let hasContent = false;
      for (let i = 3; i < data.length; i += 4) {
        if (data[i] > 0) { // Alpha channel > 0
          hasContent = true;
          break;
        }
      }
      
      if (!hasContent) {
        throw new Error(`Canvas "${canvasId}" appears to be empty`);
      }
    },
    
    /**
     * Assert that a Chart.js instance exists for a canvas
     * @param {string} canvasId - Canvas element ID
     */
    assertChartExists(canvasId) {
      if (!window.activeCharts || !window.activeCharts[canvasId]) {
        throw new Error(`No Chart.js instance found for canvas "${canvasId}"`);
      }
    },
    
    /**
     * Assert that a chart has the expected type
     * @param {string} canvasId - Canvas element ID
     * @param {string} expectedType - Expected chart type
     */
    assertChartType(canvasId, expectedType) {
      this.assertChartExists(canvasId);
      
      const chart = window.activeCharts[canvasId];
      if (chart.config.type !== expectedType) {
        throw new Error(`Chart "${canvasId}" has type "${chart.config.type}" but expected "${expectedType}"`);
      }
    },
    
    /**
     * Assert that a chart has data
     * @param {string} canvasId - Canvas element ID
     * @param {number} minDataPoints - Minimum number of data points expected
     */
    assertChartHasData(canvasId, minDataPoints = 1) {
      this.assertChartExists(canvasId);
      
      const chart = window.activeCharts[canvasId];
      let dataLength = 0;
      
      if (chart.data && chart.data.datasets && chart.data.datasets.length > 0) {
        dataLength = chart.data.datasets[0].data ? chart.data.datasets[0].data.length : 0;
      }
      
      if (dataLength < minDataPoints) {
        throw new Error(`Chart "${canvasId}" has ${dataLength} data points, but at least ${minDataPoints} were expected`);
      }
    },
    
    /**
     * Assert that a container has content
     * @param {string} containerId - Container element ID
     */
    assertContainerHasContent(containerId) {
      const container = document.getElementById(containerId);
      if (!container) {
        throw new Error(`Container with ID "${containerId}" not found`);
      }
      
      if (!container.children || container.children.length === 0) {
        throw new Error(`Container "${containerId}" has no child elements`);
      }
    },
    
    /**
     * Create test data for visualizations
     * @returns {Array} Test data for categories
     */
    createTestData() {
      return [
        {
          key: 'werke',
          resultData: {
            count: 123,
            details: {
              dateRange: '1908 – 1942',
              topTerms: [
                { item: 'Novelle', count: 15 },
                { item: 'Roman', count: 12 },
                { item: 'Erzählung', count: 10 },
                { item: 'Biographie', count: 8 },
                { item: 'Drama', count: 5 }
              ],
              topPeople: [
                { item: 'Friderike Zweig', count: 8 },
                { item: 'Romain Rolland', count: 6 },
                { item: 'Joseph Roth', count: 5 }
              ]
            }
          }
        },
        {
          key: 'korrespondenzen',
          resultData: {
            count: 245,
            details: {
              dateRange: '1913 – 1942',
              topPeople: [
                { item: 'Friderike Zweig', count: 45 },
                { item: 'Romain Rolland', count: 32 },
                { item: 'Hermann Hesse', count: 18 }
              ],
              topPlaces: [
                { item: 'Wien', count: 65 },
                { item: 'Salzburg', count: 42 },
                { item: 'Paris', count: 25 }
              ]
            }
          }
        },
        {
          key: 'bibliothek',
          resultData: {
            count: 185,
            details: {
              dateRange: '1886 – 1941',
              topTerms: [
                { item: 'Weltliteratur', count: 25 },
                { item: 'Moderne', count: 18 },
                { item: 'Lyrik', count: 15 }
              ],
              topLangs: [
                { item: 'ger', count: 95 },
                { item: 'fre', count: 45 },
                { item: 'eng', count: 35 }
              ]
            }
          }
        }
      ];
    },
    
    /**
     * Create test timeline data
     * @returns {Array} Test timeline data
     */
    createTimelineData() {
      return [
        { year: 1905, date: '1905-02-19', title: 'Publication of Early Work', category: 'werke' },
        { year: 1912, date: '1912-06-12', title: 'First Major Success', category: 'werke' },
        { year: 1919, date: '1919-05-12', title: 'Letter to Hermann Hesse', category: 'korrespondenzen' },
        { year: 1925, date: '1925-11-30', title: 'Moved to Salzburg', category: 'lebensdokumente' },
        { year: 1933, date: '1933-02-27', title: 'Exile from Austria', category: 'lebensdokumente' },
        { year: 1941, date: '1941-08-15', title: 'Arrival in Brazil', category: 'lebensdokumente' },
        { year: 1942, date: '1942-02-22', title: 'Final Letter', category: 'korrespondenzen' }
      ];
    },
    
    /**
     * Create test network data
     * @returns {Object} Test network data
     */
    createNetworkData() {
      return {
        nodes: [
          { id: 'p1', type: 'person', label: 'Stefan Zweig', x: 0, y: 0 },
          { id: 'p2', type: 'person', label: 'Friderike Zweig', x: 0, y: 0 },
          { id: 'p3', type: 'person', label: 'Romain Rolland', x: 0, y: 0 },
          { id: 'p4', type: 'person', label: 'Hermann Hesse', x: 0, y: 0 },
          { id: 'w1', type: 'work', label: 'Die Welt von Gestern', x: 0, y: 0 },
          { id: 'w2', type: 'work', label: 'Schachnovelle', x: 0, y: 0 },
          { id: 'o1', type: 'organization', label: 'Insel Verlag', x: 0, y: 0 },
          { id: 'pl1', type: 'place', label: 'Wien', x: 0, y: 0 },
          { id: 'pl2', type: 'place', label: 'Salzburg', x: 0, y: 0 }
        ],
        links: [
          { source: 'p1', target: 'w1', type: 'author' },
          { source: 'p1', target: 'w2', type: 'author' },
          { source: 'p1', target: 'p2', type: 'spouse' },
          { source: 'p1', target: 'p3', type: 'friend' },
          { source: 'p1', target: 'p4', type: 'correspondent' },
          { source: 'p1', target: 'o1', type: 'publisher' },
          { source: 'p1', target: 'pl1', type: 'lived' },
          { source: 'p1', target: 'pl2', type: 'lived' }
        ]
      };
    },
    
    /**
     * Create test place data
     * @returns {Array} Test place data
     */
    createPlaceData() {
      return [
        { name: 'Wien', count: 65, coords: [48.2082, 16.3738] },
        { name: 'Salzburg', count: 42, coords: [47.8095, 13.0550] },
        { name: 'Paris', count: 25, coords: [48.8566, 2.3522] },
        { name: 'Berlin', count: 18, coords: [52.5200, 13.4050] },
        { name: 'London', count: 15, coords: [51.5074, -0.1278] },
        { name: 'New York', count: 12, coords: [40.7128, -74.0060] },
        { name: 'Petrópolis', count: 10, coords: [-22.5112, -43.1779] }
      ];
    },
    
    /**
     * Create test terms data
     * @returns {Array} Test terms data
     */
    createTermsData() {
      return [
        { item: 'Literatur', count: 85 },
        { item: 'Exil', count: 65 },
        { item: 'Europa', count: 60 },
        { item: 'Weltkrieg', count: 55 },
        { item: 'Freiheit', count: 50 },
        { item: 'Humanismus', count: 45 },
        { item: 'Frieden', count: 42 },
        { item: 'Kunst', count: 38 },
        { item: 'Freundschaft', count: 35 },
        { item: 'Heimat', count: 32 },
        { item: 'Moderne', count: 30 },
        { item: 'Seele', count: 28 },
        { item: 'Kultur', count: 25 },
        { item: 'Wien', count: 22 },
        { item: 'Sprache', count: 20 },
        { item: 'Identität', count: 18 },
        { item: 'Bildung', count: 15 },
        { item: 'Vergangenheit', count: 12 },
        { item: 'Judentum', count: 10 },
        { item: 'Biographie', count: 8 }
      ];
    },
    
    /**
     * Get test report
     * @returns {Object} Test report
     */
    getReport() {
      return {
        totalTests: this.testCount,
        passedTests: this.passCount,
        failedTests: this.testCount - this.passCount,
        passRate: (this.passCount / this.testCount) * 100,
        results: this.results
      };
    }
  };
  
  // ===== TESTS FOR INDIVIDUAL VISUALIZATION COMPONENTS =====
  
  /**
   * Test the overview chart
   */
  function testOverviewChart() {
    VisTest.test('Overview Chart - Bar Chart Creation', () => {
      // Create a canvas for testing
      const canvasId = 'test-overview-chart';
      createTestCanvas(canvasId);
      
      // Create a bar chart
      window.createOverviewChart(canvasId, VisTest.createTestData(), 'bar');
      
      // Verify chart creation
      VisTest.assertChartExists(canvasId);
      VisTest.assertChartType(canvasId, 'bar');
      VisTest.assertChartHasData(canvasId, 3); // Should have at least 3 categories
      VisTest.assertCanvasRendered(canvasId);
    });
    
    VisTest.test('Overview Chart - Chart Type Switching', () => {
      // Create a canvas for testing
      const canvasId = 'test-chart-type-switch';
      createTestCanvas(canvasId);
      
      // Create initial bar chart
      window.createOverviewChart(canvasId, VisTest.createTestData(), 'bar');
      VisTest.assertChartType(canvasId, 'bar');
      
      // Switch to pie chart
      window.changeChartType(canvasId, 'pie');
      VisTest.assertChartType(canvasId, 'pie');
      
      // Switch to doughnut chart
      window.changeChartType(canvasId, 'doughnut');
      VisTest.assertChartType(canvasId, 'doughnut');
      
      // Switch to polarArea chart
      window.changeChartType(canvasId, 'polarArea');
      VisTest.assertChartType(canvasId, 'polarArea');
      
      // Switch back to bar chart
      window.changeChartType(canvasId, 'bar');
      VisTest.assertChartType(canvasId, 'bar');
    });
  }
  
  /**
   * Test detail charts
   */
  function testDetailCharts() {
    VisTest.test('Detail Chart - Horizontal Bar Chart Creation', () => {
      // Create a canvas for testing
      const canvasId = 'test-detail-chart';
      createTestCanvas(canvasId);
      
      // Create a detail chart using top terms data
      const testData = VisTest.createTestData()[0].resultData.details.topTerms;
      window.createDetailChart(canvasId, 'Top Terms', testData);
      
      // Verify chart creation
      VisTest.assertChartExists(canvasId);
      VisTest.assertChartType(canvasId, 'bar');
      VisTest.assertChartHasData(canvasId, 1); // Should have at least 1 data point
      VisTest.assertCanvasRendered(canvasId);
      
      // Check for horizontal configuration (indexAxis: 'y')
      const chart = window.activeCharts[canvasId];
      if (!chart.config.options.indexAxis || chart.config.options.indexAxis !== 'y') {
        throw new Error('Detail chart is not configured as a horizontal bar chart');
      }
    });
  }
  
  /**
   * Test timeline visualization
   */
  function testTimelineVisualization() {
    VisTest.test('Timeline Visualization', () => {
      // Create a container for testing
      const containerId = 'test-timeline-container';
      createTestContainer(containerId);
      
      // Create timeline visualization
      window.createTimelineVisualization(containerId, VisTest.createTimelineData());
      
      // Verify timeline creation
      VisTest.assertContainerHasContent(containerId);
      
      // Check for timeline markers
      const timelineDots = document.querySelectorAll(`#${containerId} .timeline-dot`);
      if (timelineDots.length === 0) {
        throw new Error('Timeline visualization has no timeline markers');
      }
    });
  }
  
  /**
   * Test network visualization
   */
  function testNetworkVisualization() {
    VisTest.test('Network Visualization', () => {
      // Create a canvas for testing
      const canvasId = 'test-network-canvas';
      createTestCanvas(canvasId);
      
      // Create network visualization
      const networkData = VisTest.createNetworkData();
      window.createNetworkVisualization(canvasId, networkData.nodes, networkData.links);
      
      // Verify canvas rendering
      VisTest.assertCanvasRendered(canvasId);
    });
  }
  
  /**
   * Test word cloud visualization
   */
  function testWordCloudVisualization() {
    VisTest.test('Word Cloud Visualization', () => {
      // Create a canvas for testing
      const canvasId = 'test-wordcloud-canvas';
      createTestCanvas(canvasId);
      
      // Create word cloud visualization
      window.createWordCloud(canvasId, VisTest.createTermsData());
      
      // Verify canvas rendering
      VisTest.assertCanvasRendered(canvasId);
    });
  }
  
  /**
   * Test map visualization
   */
  function testMapVisualization() {
    VisTest.test('Map Visualization', () => {
      // Create a container for testing
      const containerId = 'test-map-container';
      createTestContainer(containerId);
      
      // Create map visualization
      window.createMapVisualization(containerId, VisTest.createPlaceData());
      
      // Verify container has content
      VisTest.assertContainerHasContent(containerId);
    });
  }
  
  /**
   * Test category detail display
   */
  function testCategoryDetails() {
    VisTest.test('Category Details Display', () => {
      // Create a container for testing
      const containerId = 'test-category-details';
      createTestContainer(containerId);
      
      // Create category detail display
      const categoryData = VisTest.createTestData()[0];
      window.displayCategoryDetails(categoryData, document.getElementById(containerId));
      
      // Verify container has content
      VisTest.assertContainerHasContent(containerId);
      
      // Check for basic elements
      const card = document.querySelector(`#detail-${categoryData.key}`);
      if (!card) {
        throw new Error(`Category detail card for "${categoryData.key}" not found`);
      }
      
      // Check for charts
      if (categoryData.resultData.details.topTerms) {
        const chartId = `${categoryData.key}-topTerms-chart`;
        const canvas = document.getElementById(chartId);
        if (!canvas) {
          throw new Error(`Chart for top terms not found in category details`);
        }
      }
    });
  }
  
  // ===== INTEGRATION TESTS =====
  
  /**
   * Test filter application
   */
  function testFilterApplication() {
    VisTest.test('Filter Application', () => {
      // Create necessary elements
      const overviewChartId = 'test-filtered-overview-chart';
      const detailsContainerId = 'test-filtered-details';
      createTestCanvas(overviewChartId);
      createTestContainer(detailsContainerId);
      
      // Setup test data
      window.allProcessedData = VisTest.createTestData();
      
      // Create and configure filter checkboxes
      const filterControlsId = 'test-filter-controls';
      createTestContainer(filterControlsId);
      
      const filterControls = document.getElementById(filterControlsId);
      window.allProcessedData.forEach(item => {
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = item.key;
        checkbox.id = `filter-${item.key}`;
        checkbox.className = 'category-filter';
        checkbox.checked = true;
        filterControls.appendChild(checkbox);
      });
      
      // Create overview chart
      window.createOverviewChart(overviewChartId, window.allProcessedData);
      
      // Create category details
      window.allProcessedData.forEach(item => {
        window.displayCategoryDetails(item, document.getElementById(detailsContainerId));
      });
      
      // Store original chart dataset length
      const originalChartDataLength = window.activeCharts[overviewChartId].data.datasets[0].data.length;
      
      // Simulate filtering - uncheck first checkbox
      const firstCheckbox = document.querySelector('.category-filter');
      firstCheckbox.checked = false;
      
      // If we have a filter function, call it
      if (typeof window.handleFilterChange === 'function') {
        // Mock necessary DOM elements if they don't exist
        if (!document.getElementById('filter-all')) {
          const allCheckbox = document.createElement('input');
          allCheckbox.type = 'checkbox';
          allCheckbox.id = 'filter-all';
          allCheckbox.checked = false;
          filterControls.appendChild(allCheckbox);
        }
        
        // Call the filter function
        window.handleFilterChange();
        
        // Verify filtering effect on chart
        const newChartDataLength = window.activeCharts[overviewChartId].data.datasets[0].data.length;
        
        // If filtering is working correctly, either:
        // 1. The chart data length has changed, or
        // 2. At least one element is now hidden
        
        const hiddenCard = document.querySelector(`#detail-${firstCheckbox.value}`);
        if (hiddenCard && hiddenCard.style.display !== 'none' && newChartDataLength === originalChartDataLength) {
          throw new Error('Filtering did not hide the unchecked category');
        }
      } else {
        console.warn('handleFilterChange function not found, skipping filter effect verification');
      }
    });
  }
  
  /**
   * Test dark mode switching
   */
  function testDarkMode() {
    VisTest.test('Dark Mode Switching', () => {
      // Check if body exists
      const body = document.body;
      if (!body) {
        throw new Error('Document body not found');
      }
      
      // Create a chart that will be affected by dark mode
      const canvasId = 'test-dark-mode-chart';
      createTestCanvas(canvasId);
      window.createOverviewChart(canvasId, VisTest.createTestData());
      
      // Store original chart options
      const originalOptions = JSON.stringify(window.activeCharts[canvasId].options);
      
      // Toggle dark mode on
      body.classList.add('dark-mode');
      
      // Recreate chart with dark mode
      window.createOverviewChart(canvasId, VisTest.createTestData());
      
      // Store dark mode chart options
      const darkModeOptions = JSON.stringify(window.activeCharts[canvasId].options);
      
      // Toggle dark mode off
      body.classList.remove('dark-mode');
      
      // Recreate chart without dark mode
      window.createOverviewChart(canvasId, VisTest.createTestData());
      
      // Store light mode chart options
      const lightModeOptions = JSON.stringify(window.activeCharts[canvasId].options);
      
      // Verify dark mode had an effect on chart options
      if (darkModeOptions === lightModeOptions) {
        throw new Error('Dark mode switching had no effect on chart options');
      }
      
      // Reset to original state
      if (originalOptions !== lightModeOptions) {
        window.createOverviewChart(canvasId, VisTest.createTestData());
      }
    });
  }
  
  // ===== HELPER FUNCTIONS =====
  
  /**
   * Create a test canvas
   * @param {string} id - Canvas ID
   * @returns {HTMLCanvasElement} Created canvas
   */
  function createTestCanvas(id) {
    // Remove existing canvas if it exists
    const existingCanvas = document.getElementById(id);
    if (existingCanvas) {
      existingCanvas.remove();
    }
    
    // Create new canvas
    const canvas = document.createElement('canvas');
    canvas.id = id;
    canvas.width = 400;
    canvas.height = 300;
    canvas.style.display = 'none'; // Hide during testing
    
    document.body.appendChild(canvas);
    return canvas;
  }
  
  /**
   * Create a test container
   * @param {string} id - Container ID
   * @returns {HTMLDivElement} Created container
   */
  function createTestContainer(id) {
    // Remove existing container if it exists
    const existingContainer = document.getElementById(id);
    if (existingContainer) {
      existingContainer.remove();
    }
    
    // Create new container
    const container = document.createElement('div');
    container.id = id;
    container.style.width = '400px';
    container.style.height = '300px';
    container.style.display = 'none'; // Hide during testing
    
    document.body.appendChild(container);
    return container;
  }
  
  /**
   * Clean up test elements
   */
  function cleanupTestElements() {
    // Remove all test canvases and containers
    const testElements = document.querySelectorAll('[id^="test-"]');
    testElements.forEach(element => element.remove());
    
    // Clean up chart instances
    if (window.activeCharts) {
      Object.keys(window.activeCharts).forEach(key => {
        if (key.startsWith('test-')) {
          if (window.activeCharts[key]) {
            window.activeCharts[key].destroy();
            delete window.activeCharts[key];
          }
        }
      });
    }
  }
  
  // ===== TEST RUNNER =====
  
  /**
   * Run all visualization tests
   */
  function runAllVisualizationTests() {
    console.log('=== Starting Visualization Tests ===');
    
    // Test individual visualization components
    testOverviewChart();
    testDetailCharts();
    testTimelineVisualization();
    testNetworkVisualization();
    testWordCloudVisualization();
    testMapVisualization();
    testCategoryDetails();
    
    // Test integration
    testFilterApplication();
    testDarkMode();
    
    // Generate report
    const report = VisTest.getReport();
    console.log('=== Visualization Tests Completed ===');
    console.log(`Passed: ${report.passedTests}/${report.totalTests} (${report.passRate.toFixed(2)}%)`);
    
    // Clean up
    cleanupTestElements();
    
    return report;
  }
  
  // Make test runner available globally
  window.runVisualizationTests = runAllVisualizationTests;
  
  // Automatically run tests when the dashboard is fully loaded
  document.addEventListener('DOMContentLoaded', () => {
    // Wait a bit to ensure all visualizations are initialized
    setTimeout(() => {
      if (document.getElementById('dashboard-content') && 
          window.getComputedStyle(document.getElementById('dashboard-content')).display !== 'none') {
        console.log('Dashboard loaded, running visualization tests...');
        runAllVisualizationTests();
      } else {
        console.log('Dashboard not fully loaded yet, waiting for dashboard initialization...');
        
        // Create a mutation observer to watch for dashboard content becoming visible
        const observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            if (mutation.target.id === 'dashboard-content' && 
                window.getComputedStyle(mutation.target).display !== 'none') {
              console.log('Dashboard initialized, running visualization tests...');
              runAllVisualizationTests();
              observer.disconnect();
            }
          });
        });
        
        // Start observing dashboard content for display changes
        const dashboardContent = document.getElementById('dashboard-content');
        if (dashboardContent) {
          observer.observe(dashboardContent, { attributes: true, attributeFilter: ['style'] });
        }
      }
    }, 1000);
  });
  
  // Export for module usage
  export { VisTest, runAllVisualizationTests };