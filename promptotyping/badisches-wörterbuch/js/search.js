/**
 * search.js - Search functionality for Badisches Wörterbuch
 * Provides search indexing and query processing with advanced filtering capabilities
 */

/**
 * Search index for efficient article lookup
 */
class SearchIndex {
    /**
     * Create a new search index
     * @param {Array} articles - Array of article objects
     */
    constructor(articles) {
      this.articles = articles;
      this.index = {};
      this.wordIndex = {}; // For exact word matching
      this.letterIndex = {}; // For alphabetical navigation
      this.buildIndex();
    }
    
    /**
     * Build search index from articles
     */
    buildIndex() {
      console.log('Building search index...');
      
      // Index each article
      this.articles.forEach((article, idx) => {
        // Add to letter index
        const firstLetter = article.firstLetter;
        if (firstLetter) {
          if (!this.letterIndex[firstLetter]) {
            this.letterIndex[firstLetter] = [];
          }
          this.letterIndex[firstLetter].push(idx);
        }
        
        // Add headword to index (highest priority)
        this.addToIndex(article.headword.toLowerCase(), idx, 10);
        
        // Add exact headword to word index
        this.addToWordIndex(article.headword.toLowerCase(), idx);
        
        // Add hyphenated parts of headword if applicable
        const headwordParts = article.headword.split(/[-\s]/);
        if (headwordParts.length > 1) {
          headwordParts.forEach(part => {
            if (part.length > 2) { // Skip very short parts
              this.addToIndex(part.toLowerCase(), idx, 5);
            }
          });
        }
        
        // Add words from definitions to index
        article.definitions.forEach(definition => {
          const words = this.tokenize(definition);
          words.forEach(word => this.addToIndex(word, idx, 5));
        });
        
        // Add examples to index
        article.examples.forEach(example => {
          const words = this.tokenize(example);
          words.forEach(word => this.addToIndex(word, idx, 3));
        });
        
        // Add sources to index (lower priority)
        article.sources.forEach(source => {
          const words = this.tokenize(source);
          words.forEach(word => this.addToIndex(word, idx, 1));
        });
        
        // Add word class
        if (article.wordClass) {
          this.addToIndex(article.wordClass.toLowerCase(), idx, 2);
        }
      });
      
      console.log(`Search index built with ${Object.keys(this.index).length} terms`);
      console.log(`Letter index built with ${Object.keys(this.letterIndex).length} letters`);
    }
    
    /**
     * Add a term to the search index with weight
     * @param {string} term - Term to add to index
     * @param {number} articleIdx - Index of article containing the term
     * @param {number} weight - Weight for relevance scoring
     */
    addToIndex(term, articleIdx, weight = 1) {
      // Normalize term - remove special characters and convert to lowercase
      term = this.normalizeTerm(term);
      if (term.length < 2) return; // Skip very short terms
      
      if (!this.index[term]) {
        this.index[term] = {};
      }
      
      this.index[term][articleIdx] = (this.index[term][articleIdx] || 0) + weight;
    }
    
    /**
     * Add a word to the exact word index
     * @param {string} word - Word to add to index
     * @param {number} articleIdx - Index of article containing the word
     */
    addToWordIndex(word, articleIdx) {
      word = this.normalizeTerm(word);
      if (!this.wordIndex[word]) {
        this.wordIndex[word] = new Set();
      }
      this.wordIndex[word].add(articleIdx);
    }
    
    /**
     * Normalize a term for indexing
     * @param {string} term - Term to normalize
     * @returns {string} Normalized term
     */
    normalizeTerm(term) {
      return term.toLowerCase().trim();
    }
    
    /**
     * Split text into tokens/words
     * @param {string} text - Text to tokenize
     * @returns {Array<string>} Array of tokens
     */
    tokenize(text) {
      if (!text) return [];
      
      // Split on non-word characters and remove empty tokens
      // Handle German umlauts and special characters
      return text.toLowerCase()
        .replace(/[^\wäöüßÄÖÜ\-]/g, ' ')
        .split(/\s+/)
        .filter(token => token.length > 1); // Ignore single-character tokens
    }
    
    /**
     * Get articles by first letter
     * @param {string} letter - First letter to filter by
     * @returns {Array} Articles starting with the given letter
     */
    getArticlesByLetter(letter) {
      letter = letter.toUpperCase();
      
      if (!this.letterIndex[letter]) {
        return [];
      }
      
      return this.letterIndex[letter].map(idx => this.articles[idx]);
    }
    
    /**
     * Search for articles matching a query
     * @param {string} query - Search query
     * @param {Object} options - Search options
     * @returns {Array} Matching article objects with scores
     */
    search(query, options = {}) {
      // Default options
      const defaultOptions = {
        exactMatch: false,
        fuzzy: true,
        maxResults: 100
      };
      
      const searchOptions = { ...defaultOptions, ...options };
      const searchTerms = this.tokenize(query);
      
      if (searchTerms.length === 0) return [];
      
      const resultScores = {};
      
      // For exact headword matches (highest priority)
      if (searchOptions.exactMatch) {
        const exactMatches = this.findExactMatches(query.toLowerCase());
        exactMatches.forEach(idx => {
          resultScores[idx] = (resultScores[idx] || 0) + 200; // Higher weight for exact matches
        });
      }
      
      // Process each search term
      searchTerms.forEach(term => {
        // Normalize term
        term = this.normalizeTerm(term);
        
        // Find exact term matches
        if (this.index[term]) {
          Object.entries(this.index[term]).forEach(([idx, weight]) => {
            resultScores[idx] = (resultScores[idx] || 0) + weight * 2; // Double weight for exact matches
          });
        }
        
        // Find prefix matches
        if (searchOptions.fuzzy && term.length >= 3) {
          Object.keys(this.index)
            .filter(indexTerm => indexTerm.startsWith(term) && indexTerm !== term)
            .forEach(matchingTerm => {
              Object.entries(this.index[matchingTerm]).forEach(([idx, weight]) => {
                resultScores[idx] = (resultScores[idx] || 0) + weight;
              });
            });
        }
      });
      
      // Convert scores to array and sort by score
      const results = Object.entries(resultScores)
        .map(([idx, score]) => ({
          article: this.articles[idx],
          score: score
        }))
        .sort((a, b) => b.score - a.score) // Sort by score descending
        .slice(0, searchOptions.maxResults) // Limit results
        .map(item => item.article);
      
      return results;
    }
    
    /**
     * Find exact matches for a term
     * @param {string} term - Term to find exact matches for
     * @returns {Array} Article indices with exact matches
     */
    findExactMatches(term) {
      term = this.normalizeTerm(term);
      
      // Check the word index first
      if (this.wordIndex[term]) {
        return Array.from(this.wordIndex[term]);
      }
      
      // Fallback to manual search
      const matches = [];
      this.articles.forEach((article, idx) => {
        if (this.normalizeTerm(article.headword) === term) {
          matches.push(idx);
        }
      });
      
      return matches;
    }
    
    /**
     * Advanced search with multiple criteria
     * @param {Object} criteria - Search criteria
     * @returns {Array} Matching article objects
     */
    advancedSearch(criteria) {
      let results = [...this.articles];
      
      // Filter by headword
      if (criteria.headword) {
        const headwordTerm = this.normalizeTerm(criteria.headword);
        results = results.filter(article => 
          this.normalizeTerm(article.headword).includes(headwordTerm)
        );
      }
      
      // Filter by definition
      if (criteria.definition) {
        const definitionTerm = this.normalizeTerm(criteria.definition);
        results = results.filter(article => 
          article.definitions.some(def => 
            this.normalizeTerm(def).includes(definitionTerm)
          )
        );
      }
      
      // Filter by example
      if (criteria.example) {
        const exampleTerm = this.normalizeTerm(criteria.example);
        results = results.filter(article => 
          article.examples.some(example => 
            this.normalizeTerm(example).includes(exampleTerm)
          )
        );
      }
      
      // Filter by source
      if (criteria.source) {
        const sourceTerm = this.normalizeTerm(criteria.source);
        results = results.filter(article => 
          article.sources.some(source => 
            this.normalizeTerm(source).includes(sourceTerm)
          )
        );
      }
      
      return results;
    }
    
    /**
     * Highlight search terms in HTML content
     * @param {string} html - HTML content
     * @param {string} query - Search query
     * @returns {string} HTML with highlighted search terms
     */
    highlightSearchTerms(html, query) {
      if (!query || query.trim().length === 0) {
        return html;
      }
      
      const terms = this.tokenize(query)
        .filter(term => term.length > 2) // Only highlight terms with 3+ characters
        .map(term => this.escapeRegExp(term));
      
      if (terms.length === 0) {
        return html;
      }
      
      // Create a regular expression to match all terms
      const regex = new RegExp(`(${terms.join('|')})`, 'gi');
      
      // Replace direct text nodes without affecting HTML tags
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;
      
      this.highlightTextNodes(tempDiv, regex);
      
      return tempDiv.innerHTML;
    }
    
    /**
     * Recursively highlight text nodes
     * @param {Node} node - DOM node to process
     * @param {RegExp} regex - Regular expression to match
     */
    highlightTextNodes(node, regex) {
      if (node.nodeType === Node.TEXT_NODE) {
        if (node.textContent.trim() !== '') {
          const tempSpan = document.createElement('span');
          tempSpan.innerHTML = node.textContent.replace(regex, '<span class="highlight">$1</span>');
          
          const fragment = document.createDocumentFragment();
          while (tempSpan.firstChild) {
            fragment.appendChild(tempSpan.firstChild);
          }
          
          node.parentNode.replaceChild(fragment, node);
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        // Skip certain elements like .highlight that might already be highlighted
        if (!node.classList || !node.classList.contains('highlight')) {
          Array.from(node.childNodes).forEach(child => {
            this.highlightTextNodes(child, regex);
          });
        }
      }
    }
    
    /**
     * Escape special characters in string for use in RegExp
     * @param {string} string - String to escape
     * @returns {string} Escaped string
     */
    escapeRegExp(string) {
      return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
  }