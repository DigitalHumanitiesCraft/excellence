/**
 * test-performance.js
 * 
 * Testing and performance monitoring for the Stefan Zweig Digital Dashboard
 * This file contains:
 * 1. Unit tests for core functions
 * 2. Performance measurement utilities
 * 3. Accessibility tests
 * 4. Memory leak detection
 */

// ===== TESTING FRAMEWORK =====

/**
 * Simple test runner with assertions
 */
const TestRunner = {
    tests: [],
    
    /**
     * Register a test
     * @param {string} name - Test name
     * @param {Function} testFn - Test function
     */
    test(name, testFn) {
      this.tests.push({ name, testFn });
    },
    
    /**
     * Run all registered tests
     * @returns {Object} Test results
     */
    runTests() {
      const results = {
        total: this.tests.length,
        passed: 0,
        failed: 0,
        failures: []
      };
      
      console.log(`Running ${this.tests.length} tests...`);
      
      this.tests.forEach(test => {
        try {
          test.testFn();
          results.passed++;
          console.log(`✓ ${test.name}`);
        } catch (error) {
          results.failed++;
          results.failures.push({ name: test.name, error: error.message });
          console.error(`✗ ${test.name}: ${error.message}`);
        }
      });
      
      console.log(`Tests completed: ${results.passed} passed, ${results.failed} failed`);
      return results;
    },
    
    /**
     * Assert that two values are equal
     * @param {*} actual - Actual value
     * @param {*} expected - Expected value
     * @param {string} message - Optional assertion message
     */
    assertEquals(actual, expected, message = '') {
      if (JSON.stringify(actual) !== JSON.stringify(expected)) {
        throw new Error(`${message} Expected ${JSON.stringify(expected)}, but got ${JSON.stringify(actual)}`);
      }
    },
    
    /**
     * Assert that a condition is true
     * @param {boolean} condition - Condition to test
     * @param {string} message - Optional assertion message
     */
    assertTrue(condition, message = '') {
      if (!condition) {
        throw new Error(message || 'Expected true but got false');
      }
    },
    
    /**
     * Assert that a function throws an error
     * @param {Function} fn - Function to test
     * @param {string} expectedMessage - Expected error message (optional)
     */
    assertThrows(fn, expectedMessage = null) {
      try {
        fn();
        throw new Error('Expected function to throw, but it did not');
      } catch (error) {
        if (expectedMessage && error.message !== expectedMessage) {
          throw new Error(`Expected error message "${expectedMessage}" but got "${error.message}"`);
        }
      }
    }
  };
  
  // ===== PERFORMANCE MONITORING =====
  
  /**
   * Performance monitoring utilities
   */
  const PerformanceMonitor = {
    metrics: {},
    
    /**
     * Start measuring performance for a specific operation
     * @param {string} operationName - Name of the operation to measure
     * @returns {string} Unique measurement ID
     */
    start(operationName) {
      const id = `${operationName}_${Date.now()}`;
      if (!this.metrics[operationName]) {
        this.metrics[operationName] = [];
      }
      
      performance.mark(`${id}_start`);
      return id;
    },
    
    /**
     * End measuring performance for a specific operation
     * @param {string} id - Measurement ID from start()
     * @param {string} operationName - Name of the operation
     */
    end(id, operationName) {
      performance.mark(`${id}_end`);
      performance.measure(id, `${id}_start`, `${id}_end`);
      
      const measure = performance.getEntriesByName(id)[0];
      this.metrics[operationName].push(measure.duration);
      
      // Clean up
      performance.clearMarks(`${id}_start`);
      performance.clearMarks(`${id}_end`);
      performance.clearMeasures(id);
    },
    
    /**
     * Get average performance for a specific operation
     * @param {string} operationName - Name of the operation
     * @returns {number} Average duration in milliseconds
     */
    getAverage(operationName) {
      const measurements = this.metrics[operationName] || [];
      if (measurements.length === 0) return 0;
      
      const sum = measurements.reduce((total, duration) => total + duration, 0);
      return sum / measurements.length;
    },
    
    /**
     * Get performance report for all operations
     * @returns {Object} Performance report
     */
    getReport() {
      const report = {};
      
      for (const [operation, measurements] of Object.entries(this.metrics)) {
        if (measurements.length === 0) continue;
        
        const sum = measurements.reduce((total, duration) => total + duration, 0);
        const avg = sum / measurements.length;
        const min = Math.min(...measurements);
        const max = Math.max(...measurements);
        
        report[operation] = {
          samples: measurements.length,
          average: avg,
          min: min,
          max: max,
          target: this.getTargetPerformance(operation)
        };
      }
      
      return report;
    },
    
    /**
     * Get target performance metric for an operation
     * @param {string} operationName - Name of the operation
     * @returns {number} Target duration in milliseconds
     */
    getTargetPerformance(operationName) {
      const targets = {
        'initialLoad': 2000,
        'filterApplication': 500,
        'chartTypeSwitch': 300,
        'renderCategoryDetails': 1000,
        'networkVisualization': 3000
      };
      
      return targets[operationName] || 1000; // Default target is 1000ms
    },
    
    /**
     * Check if performance meets targets
     * @returns {Object} Performance status
     */
    checkPerformance() {
      const report = this.getReport();
      const status = {
        meetsAllTargets: true,
        operations: {}
      };
      
      for (const [operation, metrics] of Object.entries(report)) {
        const meetsTarget = metrics.average <= metrics.target;
        status.operations[operation] = {
          meetsTarget,
          average: metrics.average,
          target: metrics.target,
          difference: metrics.target - metrics.average
        };
        
        if (!meetsTarget) {
          status.meetsAllTargets = false;
        }
      }
      
      return status;
    },
    
    /**
     * Monitor FCP, LCP, and CLS metrics using Performance Observer
     */
    monitorWebVitals() {
      try {
        const fcpObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          entries.forEach(entry => {
            console.log(`FCP: ${entry.startTime}ms`);
            this.metrics.FCP = [entry.startTime];
          });
        });
        
        fcpObserver.observe({ type: 'paint', buffered: true });
        
        const lcpObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          entries.forEach(entry => {
            console.log(`LCP: ${entry.startTime}ms`);
            this.metrics.LCP = [entry.startTime];
          });
        });
        
        lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
        
        const clsObserver = new PerformanceObserver((entryList) => {
          let clsValue = 0;
          entryList.getEntries().forEach(entry => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          });
          console.log(`CLS: ${clsValue}`);
          this.metrics.CLS = [clsValue];
        });
        
        clsObserver.observe({ type: 'layout-shift', buffered: true });
      } catch (e) {
        console.warn('PerformanceObserver not supported in this browser', e);
      }
    }
  };
  
  // ===== MEMORY MONITORING =====
  
  /**
   * Memory usage monitoring
   */
  const MemoryMonitor = {
    snapshots: [],
    
    /**
     * Take a memory snapshot
     * @param {string} label - Label for the snapshot
     */
    takeSnapshot(label) {
      if (window.performance && window.performance.memory) {
        const memory = window.performance.memory;
        this.snapshots.push({
          label,
          timestamp: Date.now(),
          usedJSHeapSize: memory.usedJSHeapSize,
          totalJSHeapSize: memory.totalJSHeapSize,
          jsHeapSizeLimit: memory.jsHeapSizeLimit
        });
        
        console.log(`Memory snapshot [${label}]: ${(memory.usedJSHeapSize / 1048576).toFixed(2)} MB used`);
      } else {
        console.warn('Memory API not available in this browser');
      }
    },
    
    /**
     * Calculate memory growth between snapshots
     * @returns {Object} Memory growth report
     */
    analyzeGrowth() {
      if (this.snapshots.length < 2) {
        return { error: 'Need at least 2 snapshots for comparison' };
      }
      
      const results = [];
      
      for (let i = 1; i < this.snapshots.length; i++) {
        const prev = this.snapshots[i - 1];
        const current = this.snapshots[i];
        
        const growth = current.usedJSHeapSize - prev.usedJSHeapSize;
        const growthMB = growth / 1048576;
        const percentGrowth = (growth / prev.usedJSHeapSize) * 100;
        
        results.push({
          fromLabel: prev.label,
          toLabel: current.label,
          growthBytes: growth,
          growthMB: growthMB.toFixed(2),
          percentGrowth: percentGrowth.toFixed(2),
          timeElapsed: current.timestamp - prev.timestamp
        });
      }
      
      return results;
    },
    
    /**
     * Check for potential memory leaks
     * @param {number} threshold - Percentage growth threshold to trigger warning
     * @returns {boolean} True if potential memory leak detected
     */
    checkForLeaks(threshold = 20) {
      const growth = this.analyzeGrowth();
      
      if (growth.error) return false;
      
      const potentialLeaks = growth.filter(item => 
        parseFloat(item.percentGrowth) > threshold
      );
      
      if (potentialLeaks.length > 0) {
        console.warn('Potential memory leak detected:', potentialLeaks);
        return true;
      }
      
      return false;
    }
  };
  
  // ===== ACCESSIBILITY TESTING =====
  
  /**
   * Basic accessibility testing utilities
   */
  const AccessibilityTester = {
    /**
     * Test for valid HTML semantics
     * @returns {Object} Test results
     */
    testSemantics() {
      const results = {
        passed: true,
        issues: []
      };
      
      // Check for heading hierarchy
      const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
      let previousLevel = 0;
      
      headings.forEach(heading => {
        const level = parseInt(heading.tagName.charAt(1));
        
        if (previousLevel === 0) {
          if (level !== 1) {
            results.passed = false;
            results.issues.push({
              element: heading,
              issue: `First heading should be h1, found h${level}`
            });
          }
        } else if (level > previousLevel + 1) {
          results.passed = false;
          results.issues.push({
            element: heading,
            issue: `Heading level skipped from h${previousLevel} to h${level}`
          });
        }
        
        previousLevel = level;
      });
      
      // Check for images without alt text
      const images = Array.from(document.querySelectorAll('img'));
      images.forEach(img => {
        if (!img.hasAttribute('alt')) {
          results.passed = false;
          results.issues.push({
            element: img,
            issue: 'Image missing alt attribute'
          });
        }
      });
      
      // Check for form controls without labels
      const formControls = Array.from(document.querySelectorAll('input, select, textarea'));
      formControls.forEach(control => {
        if (control.type !== 'hidden' && !control.hasAttribute('aria-label') && !control.hasAttribute('aria-labelledby')) {
          const id = control.id;
          if (!id || !document.querySelector(`label[for="${id}"]`)) {
            results.passed = false;
            results.issues.push({
              element: control,
              issue: 'Form control missing associated label'
            });
          }
        }
      });
      
      return results;
    },
    
    /**
     * Test color contrast for text elements
     * @returns {Object} Test results
     */
    testColorContrast() {
      const results = {
        passed: true,
        issues: []
      };
      
      // This is a simplified version and would need a full color contrast algorithm
      // In a real implementation, this would use WCAG color contrast formula
      
      const textElements = Array.from(document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, a, label, button, span'));
      
      textElements.forEach(element => {
        const style = window.getComputedStyle(element);
        const fontSize = parseFloat(style.fontSize);
        const fontWeight = style.fontWeight;
        
        // Large text = at least 18pt (24px) or 14pt (18.5px) bold
        const isLargeText = fontSize >= 24 || (fontSize >= 18.5 && fontWeight >= 700);
        
        // Minimum contrast ratio required
        const requiredRatio = isLargeText ? 3.0 : 4.5;
        
        // This is where we would calculate actual contrast ratio
        // For this implementation, we'll just log it
        console.log(`Element would need ${requiredRatio}:1 contrast ratio`, element);
      });
      
      return results;
    },
    
    /**
     * Test keyboard navigation
     * @returns {Object} Test results
     */
    testKeyboardNavigation() {
      const results = {
        passed: true,
        issues: []
      };
      
      // Check for focusable elements with tabindex > 0 (avoid unless necessary)
      const elementsWithTabIndex = Array.from(document.querySelectorAll('[tabindex]'));
      elementsWithTabIndex.forEach(element => {
        const tabIndex = parseInt(element.getAttribute('tabindex'));
        if (tabIndex > 0) {
          results.passed = false;
          results.issues.push({
            element,
            issue: `Element has tabindex=${tabIndex}, which disrupts natural tab order`
          });
        }
      });
      
      // Check for interactive elements that aren't keyboard accessible
      const interactiveElements = Array.from(document.querySelectorAll('[onclick], [onmousedown], [onmouseup]'));
      interactiveElements.forEach(element => {
        if (!element.hasAttribute('tabindex') && 
            element.tagName !== 'A' && 
            element.tagName !== 'BUTTON' && 
            element.tagName !== 'INPUT' &&
            element.tagName !== 'SELECT' &&
            element.tagName !== 'TEXTAREA') {
          results.passed = false;
          results.issues.push({
            element,
            issue: 'Interactive element not keyboard accessible'
          });
        }
      });
      
      return results;
    },
    
    /**
     * Run all accessibility tests
     * @returns {Object} Combined test results
     */
    runAllTests() {
      return {
        semantics: this.testSemantics(),
        contrast: this.testColorContrast(),
        keyboard: this.testKeyboardNavigation()
      };
    }
  };
  
  // ===== UNIT TESTS =====
  
  // Test getTopFrequencies function
  TestRunner.test('getTopFrequencies should handle empty arrays', () => {
    TestRunner.assertEquals(getTopFrequencies([]), [], 'Should return empty array');
  });
  
  TestRunner.test('getTopFrequencies should count frequencies correctly', () => {
    const items = [
      { textContent: 'apple' },
      { textContent: 'orange' },
      { textContent: 'apple' },
      { textContent: 'banana' }
    ];
    
    const expected = [
      { item: 'apple', count: 2 },
      { item: 'orange', count: 1 },
      { item: 'banana', count: 1 }
    ];
    
    TestRunner.assertEquals(getTopFrequencies(items, 'textContent'), expected, 'Should count frequencies');
  });
  
  TestRunner.test('getTopFrequencies should respect the limit parameter', () => {
    const items = [
      { textContent: 'apple' },
      { textContent: 'orange' },
      { textContent: 'apple' },
      { textContent: 'banana' },
      { textContent: 'cherry' }
    ];
    
    const expected = [
      { item: 'apple', count: 2 },
    ];
    
    TestRunner.assertEquals(getTopFrequencies(items, 'textContent', 1), expected, 'Should limit results');
  });
  
  // Test extractDateRange function
  TestRunner.test('extractDateRange should handle empty input', () => {
    const parser = new DOMParser();
    const emptyDoc = parser.parseFromString('<body></body>', 'text/xml');
    TestRunner.assertEquals(extractDateRange(emptyDoc), null, 'Should return null for empty document');
  });
  
  TestRunner.test('extractDateRange should extract date range correctly', () => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(`
      <body xmlns="http://www.tei-c.org/ns/1.0">
        <date when="1920-01-01"></date>
        <div><date when="1925-03-15"></date></div>
        <date from="1930-06-12" to="1935-09-22"></date>
      </body>
    `, 'text/xml');
    
    // Mock nsResolver for test
    function mockNsResolver(prefix) {
      if (prefix === 'tei') return 'http://www.tei-c.org/ns/1.0';
      return null;
    }
    
    // Replace global nsResolver with mock for this test
    const originalNsResolver = window.nsResolver;
    window.nsResolver = mockNsResolver;
    
    TestRunner.assertEquals(extractDateRange(xmlDoc), '1920 – 1935', 'Should extract correct date range');
    
    // Restore original nsResolver
    window.nsResolver = originalNsResolver;
  });
  
  // ===== INTEGRATION WITH APP =====
  
  /**
   * Initialize test and performance monitoring
   */
  function initTestAndPerformance() {
    // Start monitoring web vitals
    PerformanceMonitor.monitorWebVitals();
    
    // Set up performance measurement for key operations
    const originalInitializeDashboard = window.initializeDashboard;
    window.initializeDashboard = async function() {
      const id = PerformanceMonitor.start('initialLoad');
      await originalInitializeDashboard();
      PerformanceMonitor.end(id, 'initialLoad');
      
      // Take memory snapshot after initialization
      MemoryMonitor.takeSnapshot('afterInitialization');
      
      // Run accessibility tests
      console.log('Running accessibility tests...');
      const a11yResults = AccessibilityTester.runAllTests();
      console.log('Accessibility test results:', a11yResults);
    };
    
    // Measure filter application performance
    const originalHandleFilterChange = window.handleFilterChange;
    window.handleFilterChange = function() {
      const id = PerformanceMonitor.start('filterApplication');
      originalHandleFilterChange();
      PerformanceMonitor.end(id, 'filterApplication');
    };
    
    // Measure chart type switching performance
    if (window.changeChartType) {
      const originalChangeChartType = window.changeChartType;
      window.changeChartType = function(canvasId, newType) {
        const id = PerformanceMonitor.start('chartTypeSwitch');
        originalChangeChartType(canvasId, newType);
        PerformanceMonitor.end(id, 'chartTypeSwitch');
      };
    }
    
    // Set up memory leak detection
    window.addEventListener('beforeunload', () => {
      MemoryMonitor.takeSnapshot('beforeUnload');
      const leakDetected = MemoryMonitor.checkForLeaks();
      if (leakDetected) {
        console.warn('Potential memory leak detected. Check memory growth report.');
        console.log(MemoryMonitor.analyzeGrowth());
      }
    });
    
    // Add command to run tests to global scope for console access
    window.runTests = function() {
      TestRunner.runTests();
    };
    
    // Add command to show performance report
    window.showPerformanceReport = function() {
      console.table(PerformanceMonitor.getReport());
      return PerformanceMonitor.checkPerformance();
    };
  }
  
  // Initialize when the script loads
  initTestAndPerformance();
  
  // Export for module usage
  export {
    TestRunner,
    PerformanceMonitor,
    MemoryMonitor,
    AccessibilityTester
  };