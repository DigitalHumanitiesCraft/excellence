/**
 * parser.js - XML Parsing Module for Badisches Wörterbuch
 * Handles loading and parsing the Artikel.xml file, transforming XML entries into structured objects
 */

/**
 * Loads and parses the Artikel.xml file
 * @returns {Promise<Array>} Array of parsed article objects
 */
async function loadArticles() {
    try {
      const response = await fetch('data/Artikel.xml');
      if (!response.ok) {
        throw new Error(`Failed to load XML file: ${response.status} ${response.statusText}`);
      }
      
      const xmlText = await response.text();
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
      
      // Check for parsing errors
      const parserError = xmlDoc.querySelector('parsererror');
      if (parserError) {
        throw new Error('XML parsing error: ' + parserError.textContent);
      }
      
      const artikelElements = xmlDoc.getElementsByTagName('artikel');
      console.log(`Found ${artikelElements.length} articles in XML file`);
      
      const articles = [];
      
      for (let i = 0; i < artikelElements.length; i++) {
        const artikelElement = artikelElements[i];
        const article = processArticle(artikelElement, i);
        articles.push(article);
      }
      
      // Sort articles alphabetically by headword
      articles.sort((a, b) => a.headword.localeCompare(b.headword, 'de'));
      
      return articles;
    } catch (error) {
      console.error('Error loading articles:', error);
      throw error;
    }
  }
  
  /**
   * Process a single article element and convert to structured object
   * @param {Element} artikelElement - XML element containing article
   * @param {number} index - Index of the article
   * @returns {Object} Structured article object
   */
  function processArticle(artikelElement, index) {
    // Initialize article object with default properties
    const article = {
      id: `artikel-${index}`,
      headword: '',
      wordClass: '',
      definitions: [],
      examples: [],
      sources: [],
      references: [],
      crossReferences: [],
      rawHtml: '',
      rawText: artikelElement.textContent.trim(),
      firstLetter: ''
    };
    
    // Extract headword - prioritize <fett> tags
    const fettElements = artikelElement.getElementsByTagName('fett');
    if (fettElements.length > 0) {
      article.headword = fettElements[0].textContent.trim();
      // Set the first letter for alphabetical navigation
      article.firstLetter = getFirstLetter(article.headword);
    }
    
    // Extract word class (usually appears after the headword)
    const headwordText = artikelElement.textContent;
    const matchWordClass = headwordText.match(/^[^:]*?(\w+\.)/);
    if (matchWordClass) {
      article.wordClass = matchWordClass[1].trim();
    }
    
    // Extract definitions from <bedeutung> tags
    const bedeutungElements = artikelElement.getElementsByTagName('bedeutung');
    for (let i = 0; i < bedeutungElements.length; i++) {
      article.definitions.push(bedeutungElements[i].textContent.trim());
    }
    
    // Process all <kursiv> elements (examples and cross-references)
    const kursivElements = artikelElement.getElementsByTagName('kursiv');
    for (let i = 0; i < kursivElements.length; i++) {
      const kursivElement = kursivElements[i];
      const text = kursivElement.textContent.trim();
      
      // Check if it's a cross-reference (contains →)
      if (text.includes('→')) {
        // Extract cross-references, handling multiple in one element
        const crossRefs = text.split('→')
          .slice(1) // Skip the part before the first →
          .map(ref => ref.trim())
          .filter(ref => ref.length > 0)
          .map(ref => {
            // Clean up punctuation and spaces
            return ref.replace(/[,;.)].*$/, '').trim();
          });
        
        article.crossReferences.push(...crossRefs);
      } else {
        // It's an example, not a cross-reference
        article.examples.push(text);
      }
    }
    
    // Extract sources from <gesperrt> tags
    const gesperrtElements = artikelElement.getElementsByTagName('gesperrt');
    for (let i = 0; i < gesperrtElements.length; i++) {
      article.sources.push(gesperrtElements[i].textContent.trim());
    }
    
    // Extract references from <klein> tags
    const kleinElements = artikelElement.getElementsByTagName('klein');
    for (let i = 0; i < kleinElements.length; i++) {
      article.references.push(kleinElements[i].textContent.trim());
    }
    
    // Generate HTML representation
    article.rawHtml = generateArticleHtml(artikelElement, article);
    
    return article;
  }
  
  /**
   * Generate HTML representation of an article
   * @param {Element} artikelElement - XML element containing article
   * @param {Object} articleObj - Processed article object
   * @returns {string} HTML representation of the article
   */
  function generateArticleHtml(artikelElement, articleObj) {
    let html = `<div class="dictionary-entry" id="${articleObj.id}">`;
    
    // Create a deep clone of the XML element to manipulate
    const clonedElement = artikelElement.cloneNode(true);
    
    // Process cross-references to make them interactive
    processElementsInClone(clonedElement, 'kursiv', (elem) => {
      const text = elem.textContent;
      if (text.includes('→')) {
        // Replace → references with interactive spans
        elem.innerHTML = elem.innerHTML.replace(/→\s*([^,;.()\s]+)([^,;.()]*)/g, 
          '→ <span class="cross-reference">$1$2</span>');
      }
    });
    
    // Get the XML content as string
    const xmlString = new XMLSerializer().serializeToString(clonedElement);
    
    // Replace XML tags with HTML equivalents
    const htmlString = xmlString
      .replace(/<artikel>/g, '')
      .replace(/<\/artikel>/g, '')
      .replace(/<fett>/g, '<span class="headword">')
      .replace(/<\/fett>/g, '</span>')
      .replace(/<bedeutung>/g, '<span class="definition">')
      .replace(/<\/bedeutung>/g, '</span>')
      .replace(/<gesperrt>/g, '<span class="source">')
      .replace(/<\/gesperrt>/g, '</span>')
      .replace(/<klein>/g, '<span class="reference">')
      .replace(/<\/klein>/g, '</span>')
      .replace(/<kursiv>/g, '<span class="example">')
      .replace(/<\/kursiv>/g, '</span>')
      .replace(/<grotesk>/g, '<span class="grotesk">')
      .replace(/<\/grotesk>/g, '</span>');
    
    html += htmlString;
    html += '</div>';
    
    return html;
  }
  
  /**
   * Helper function to process specific elements in a clone
   * @param {Element} clone - Cloned XML element
   * @param {string} tagName - Tag name to process
   * @param {Function} processor - Processing function
   */
  function processElementsInClone(clone, tagName, processor) {
    const elements = clone.getElementsByTagName(tagName);
    for (let i = 0; i < elements.length; i++) {
      processor(elements[i]);
    }
  }
  
  /**
   * Extracts the first letter of the headword for alphabetical navigation
   * @param {string} headword - The headword to process
   * @returns {string} The first letter, uppercase
   */
  function getFirstLetter(headword) {
    if (!headword || headword.length === 0) return '';
    
    // Handle special cases like umlauts
    const firstChar = headword.charAt(0).toUpperCase();
    
    // Map special characters to their base letter for navigation
    const charMap = {
      'Ä': 'A',
      'Ö': 'O',
      'Ü': 'U',
      'ß': 'S'
    };
    
    return charMap[firstChar] || firstChar;
  }