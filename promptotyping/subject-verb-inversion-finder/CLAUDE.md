# Subject-Verb Inversion Finder: Logic Documentation

This document provides a comprehensive overview of the logic implemented in the Python scripts for subject-verb inversion analysis, with particular focus on the enhanced methods for detecting complex inversions. It covers the entire analysis pipeline from corpus processing to visualization data preparation.

## 1. Analysis Pipeline Overview

The subject-verb inversion finder consists of three main processing components:

```
Input Corpus Files (.txt)
        ↓
1. Basic Corpus Analysis (corpus-analysis.py)
        ↓
2. Enhanced Inversion Detection (subject-verb-inversion-finder.py)
        ↓
3. Visualization Data Preparation (create-visualization-data.py)
        ↓
4. Web Visualization (index.html, styles.css, visualization.js)
```

Each component builds on the previous, with increasingly sophisticated analysis and presentation capabilities.

## 2. corpus-analysis.py

### Core Logic
- **File Loading**: Uses `glob.glob()` to find all corpus files matching "text_acad_*.txt" pattern
- **Text Processing**: 
  - Reads files with encoding fallback (utf-8 → latin-1)
  - Splits content on paragraph markers (`@@\d+`)
  - Uses regex `re.split(r'(?<=[.!?])\s+', para)` for basic sentence segmentation
- **Statistics Collection**:
  - Counts files, paragraphs, sentences
  - Calculates total corpus size
  - Extracts sample sentences for inspection
- **Inversion Pattern Matching**:
  - Uses simple regex patterns to find potential inversions:
    - Prepositional phrases followed by verbs
    - Adverbial phrases followed by verbs
    - Existential "there" constructions
    - Adjective phrases followed by verbs
    - Numeric expressions followed by verbs
  - Collects and displays potential candidates
- **Output Generation**:
  - Produces a JSON summary file (`corpus_analysis_results.json`)
  - Prints examples and statistics to console

### Limitations of Basic Analysis
- Limited sentence boundary detection
- No validation of detected patterns
- No extraction of subject component
- No classification of complex inversions
- No confidence assessment

## 3. subject-verb-inversion-finder.py

### Class Structure
- **EnhancedInversionFinder**: Main class that handles the entire analysis pipeline

### Initialization Logic
- Creates dictionaries and sets for:
  - Locative markers (prepositions and adverbs indicating location)
  - Common inversion verbs (expanded list)
  - Rare inversion triggers (new)
  - Subject markers (articles, pronouns, determiners)
- Compiles regex patterns for different inversion types:
  - Existential "there" constructions
  - PP-fronted inversions
  - AdvP-fronted inversions
  - AP-fronted inversions
  - VP-fronted inversions
  - Complex PP with embedded clauses (new)
  - Coordinated structures (new)
  - Numeric expressions (new)

### Text Processing Pipeline
1. **File Loading**: Iterates through corpus files in the specified directory
2. **Text Extraction**:
   - Reads file content with encoding fallback
   - Cleans text by normalizing whitespace and paragraph markers
   - Splits on paragraph markers to get individual paragraphs
   - Segments paragraphs into sentences with improved context awareness
   - Handles common abbreviations to prevent false sentence boundaries

3. **Inversion Detection**: Two-pass approach
   - **Pass 1 - Complex Patterns**:
     - Checks for coordinated structures
     - Checks for complex PPs with embedded clauses
     - Checks for numeric expressions
   - **Pass 2 - Standard Patterns** (if no complex match found):
     - Checks for existential "there" constructions
     - Checks for PP-fronted inversions
     - Checks for AdvP-fronted inversions
     - Checks for AP-fronted inversions
     - Checks for VP-fronted inversions
   - Once a match is found, extracts:
     - The fronted constituent
     - The verb
     - The subject (using enhanced `identify_subject()` function)

4. **Subject Identification**: Enhanced algorithm
   ```python
   def identify_subject(self, text_after_verb):
       # First check for determiners/articles followed by words
       for marker in self.subject_markers:
           # Pattern matches determiners followed by a noun phrase up to the next clause break
           pattern = re.compile(r'(' + re.escape(marker) + r'\s+[^.,;:!?()]+(?:\([^)]*\)[^.,;:!?]*)*)')
           match = pattern.search(text_after_verb)
           if match:
               return match.group(1).strip()
       
       # If no determiner found, look for a nominal group
       np_pattern = re.compile(r'([A-Z][a-z]*(?:\s+[a-z]+){0,5})')
       match = np_pattern.search(text_after_verb)
       if match:
           return match.group(1).strip()
       
       # If all else fails, take the first substantial chunk
       match = re.search(r'([^.,;:!?()\s]+(?:\s+[^.,;:!?()]+){0,7})', text_after_verb)
       if match:
           return match.group(1).strip()
       
       return "Unknown subject"
   ```

5. **Validation System**: Comprehensive approach
   ```python
   def validate_inversion(self, sentence, fronted, verb, subject):
       """
       Validate a potential inversion with heuristic rules.
       Returns a confidence score and reasons.
       """
       confidence = "medium"  # Default
       reasons = []
       
       # Check if the subject looks legitimate
       if any(subject.lower().startswith(marker) for marker in self.subject_markers):
           confidence = "high"
           reasons.append("Subject starts with determiner")
       
       # Check for question patterns
       if "?" in sentence:
           confidence = "low"
           reasons.append("Likely a question, not inversion")
       
       # Check for quotation patterns
       if fronted.count('"') % 2 != 0:
           confidence = "low"
           reasons.append("Quoted text spans elements")
       
       # Check verb is a common inversion verb
       if verb.lower() in self.common_inversion_verbs:
           if confidence != "high":
               confidence = "medium"
           reasons.append("Common inversion verb")
       
       # Word count and balance checks
       fronted_words = len(fronted.split())
       subject_words = len(subject.split())
       
       if fronted_words > 15:
           if confidence == "high":
               confidence = "medium"
           reasons.append("Very long fronted constituent")
       
       if fronted_words < subject_words / 2:
           if confidence == "high":
               confidence = "medium"
           reasons.append("Subject much longer than fronted element")
       
       return confidence, reasons
   ```

6. **Classification Logic**:
   - **Syntactic Classification**: Expanded to include new types:
     - Coordinated structures
     - Complex prepositional phrases
     - Numeric expressions
   - **Semantic Classification**: Identifies whether the inversion is locative based on specific markers
   - **Confidence Scoring**: Uses detailed validation with specific reasons
   - **Information Structure**: Provides basic classification of discourse function

7. **Testing Framework**: New feature for validation
   ```python
   def run_validation_tests(self, test_sentences=None):
       """
       Run validation tests on complex inversion examples to verify pattern matching accuracy.
       """
       if test_sentences is None:
           # Default test sentences covering complex inversions
           test_sentences = [
               "Under the new policy adopted by the administration last year is a provision for student loan forgiveness.",
               "Along the river that winds through the valley flows a current of unusual strength.",
               # More test cases...
           ]
       
       results = {
           "total_tests": len(test_sentences),
           "detected": 0,
           "undetected": 0,
           "by_confidence": Counter(),
           "by_type": Counter(),
           "details": []
       }
       
       # Run tests and collect statistics
       for sentence in test_sentences:
           inversions = self.find_inversions_in_sentence(sentence)
           # Process results...
           
       # Calculate success rate
       results["success_rate"] = results["detected"] / results["total_tests"]
       
       return results
   ```

### Output Generation - Enhanced
- **JSON Summary**: Statistical overview with new metrics:
  - Complex inversion counts
  - Expanded constituent types
  - Inversion pattern types
  - Confidence levels
- **CSV Export**: 
  - Standard CSV with all inversions
  - New specialized CSV for complex inversions with validation reasons
- **Text Report**: Human-readable format with:
  - Examples of all inversion types
  - Dedicated section for complex inversions
  - Validation reasons for confidence scores

### Key Algorithms

1. **Complex PP Detection**:
   ```python
   # Advanced pattern for PPs with embedded clauses
   self.complex_pp_pattern = re.compile(
       r"(?<!\w)(In|On|At|From|To|Into|Under|Over|Within|Behind|Above|Below|Among|Amongst|Between|Through|Across|Around|Along|Near|Beyond|Beside|Outside|Inside|Beneath)\s+([^.,;:!?]*?(?:which|that|who|whose|where|when)[^.,;:!?]*?)\s+(is|are|was|were|come[s]?|came|stand[s]?|stood|remain[s]?|remained|exist[s]?|existed|appear[s]?|appeared|rise[s]?|rose|emerge[s]?|emerged|follow[s]?|followed|grow[s]?|grew|live[s]?|lived|flow[s]?|flowed|run[s]?|ran|rest[s]?|rested|fall[s]?|fell)\s+"
   )
   ```

2. **Coordinated Structure Detection**:
   ```python
   # Pattern for coordinated structures (detecting "and" or "or" in fronted elements)
   self.coordinated_pattern = re.compile(
       r"(?<!\w)(In|On|At|From|To|Into|Under|Over|Within|Behind|Above|Below|Among|Amongst|Between|Through|Across|Around|Along)\s+([^.,;:!?]*?\s+(?:and|or)\s+[^.,;:!?]*?)\s+(is|are|was|were|come[s]?|came|stand[s]?|stood|remain[s]?|remained|exist[s]?|existed|appear[s]?|appeared|rise[s]?|rose|emerge[s]?|emerged|follow[s]?|followed|grow[s]?|grew|live[s]?|lived|flow[s]?|flowed|run[s]?|ran|rest[s]?|rested|fall[s]?|fell)\s+"
   )
   ```

3. **Numeric Expression Detection**:
   ```python
   # Pattern for numeric expressions
   self.numeric_pattern = re.compile(
       r"(?<!\w)(One|Two|Three|Four|Five|Six|Seven|Eight|Nine|Ten|First|Second|Third|Fourth|Fifth|Sixth|Seventh|Eighth|Ninth|Tenth)\s+([^.,;:!?]*?)\s+(is|are|was|were|come[s]?|came|stand[s]?|stood|remain[s]?|remained|exist[s]?|existed|appear[s]?|appeared|rise[s]?|rose|emerge[s]?|emerged|follow[s]?|followed|grow[s]?|grew|live[s]?|lived|flow[s]?|flowed|run[s]?|ran|rest[s]?|rested|fall[s]?|fell)\s+"
   )
   ```

4. **Two-Pass Approach**:
   ```python
   def find_inversions_in_sentence(self, sentence):
       """
       Enhanced inversion finder that combines standard pattern matching
       with specialized detection for complex cases.
       """
       inversions = []
       
       # Skip very short sentences and questions
       if len(sentence) < 10 or sentence.endswith('?'):
           return inversions
       
       # First try complex pattern recognition for specialized cases
       complex_inversions = self.find_complex_inversions(sentence)
       if complex_inversions:
           return complex_inversions
       
       # Then try standard patterns
       # Check for existential 'there' constructions
       # Check for prepositional phrase inversions
       # Check for adverbial inversions
       # etc.
   ```

## 4. create-visualization-data.py

### Transformation Logic
This script serves as a bridge between the analysis results and the web visualization:

1. **Data Loading**:
   - Reads the analysis results from `inversion_results` directory
   - Loads the summary JSON and example CSVs

2. **Data Transformation**:
   - Restructures the summary data for visualization efficiency
   - Samples a representative set of examples (limiting to 200 for performance)
   - Ensures balanced representation across inversion types
   - Adds highlighting information to examples
   - Creates distribution data for charts

3. **Output Files**:
   - `summary.json`: Simplified statistics for visualization
   - `examples.json`: Curated set of examples
   - `distributions.json`: Pre-calculated distributions for charts
   - `config.json`: Visualization configuration with color schemes

### Example Selection Logic
```python
# If we have too many examples, sample them
if len(unique_examples) > 200:
    # Ensure a good distribution across types
    by_type = {}
    for ex in unique_examples:
        by_type.setdefault(ex['type'], []).append(ex)
    
    # Create a representative sample
    sampled_examples = []
    for type_name, type_examples in by_type.items():
        # Calculate how many to take based on proportion in overall data
        proportion = summary_data["inversion_types"].get(type_name, 0) / summary_data["total_inversions"]
        count = max(3, int(proportion * 200))  # Ensure at least 3 examples per type
        # Randomly sample from this type
        sampled = random.sample(type_examples, min(count, len(type_examples)))
        sampled_examples.extend(sampled)
```

## 5. Web Visualization Integration

The analysis results are transformed into a format optimized for visualization in a web browser:

1. **Visualization Architecture**:
   - HTML/CSS for structure and styling
   - JavaScript for interactive behavior
   - Chart.js for data visualization

2. **Data Flow**:
   - Asynchronous loading of JSON data files
   - Data processing and transformation
   - Dynamic chart creation
   - Interactive filtering of examples

3. **Visualization Components**:
   - Dashboard statistics
   - Constituent types (doughnut chart)
   - Confidence levels (pie chart)
   - Inversion types (bar chart)
   - Example explorer with filters
   - Detailed example view with highlighting

4. **Example Explorer Logic**:
   ```javascript
   function filterExamples() {
       const typeFilter = document.getElementById('type-filter')?.value || '';
       const constituentFilter = document.getElementById('constituent-filter')?.value || '';
       const confidenceFilter = document.getElementById('confidence-filter')?.value || '';
       const locativeFilter = document.getElementById('locative-filter')?.value || '';
       
       // Apply filters
       filteredExamples = examplesData.filter(example => {
           // Type filter
           if (typeFilter && example.type !== typeFilter) return false;
           
           // Constituent filter
           if (constituentFilter && example.constituent_type !== constituentFilter) return false;
           
           // Confidence filter
           if (confidenceFilter && example.confidence !== confidenceFilter) return false;
           
           // Locative filter
           if (locativeFilter === 'true' && !example.is_locative) return false;
           if (locativeFilter === 'false' && example.is_locative) return false;
           
           return true;
       });
   }
   ```

## 6. Overall Data Flow

```
Input Corpus Files (.txt)
        ↓
File Loading & Reading
        ↓
Paragraph Extraction
        ↓
Sentence Segmentation
        ↓
Two-Pass Pattern Matching
  ┣━━ Complex Pattern Matching (coordinated, embedded clauses, numeric)
  ┗━━ Standard Pattern Matching (PP, AdvP, AP, VP, existential)
        ↓
Extraction of Components (Fronted Constituent, Verb, Subject)
        ↓
Validation with Confidence Scoring and Reasons
        ↓
Classification (Syntactic, Semantic, Confidence)
        ↓
Aggregation of Results
        ↓
Enhanced Output Generation (JSON, CSV, Complex CSV, TXT)
        ↓
Visualization Data Transformation
        ↓
Web-based Interactive Visualization
```

## 7. Output File Structure and Usage

### Analysis Results

1. **inversion_analysis_summary.json**:
   ```json
   {
     "total_files": 5,
     "total_paragraphs": 4546,
     "total_sentences": 601561,
     "total_inversions": 22673,
     "locative_inversions": 11850,
     "non_locative_inversions": 10823,
     "complex_inversions_count": 7360,
     "constituent_types": {
       "PP (Prepositional Phrase)": 3829,
       "AdvP (Adverb Phrase)": 3407,
       "AdvP (Existential)": 6106,
       "Numeric Expression": 5158,
       "...": "..."
     },
     "confidence_levels": {"high": 9388, "medium": 13191, "low": 94},
     "inversion_types": {"pp_inversion": 3829, "...": "..."}
   }
   ```

2. **inversion_analysis_examples.csv**:
   - Contains all detected inversions
   - Fields: type, sentence, fronted_constituent, verb, subject, constituent_type, is_locative, confidence, paragraph_index, sentence_index, file

3. **inversion_analysis_complex_examples.csv**:
   - Contains complex inversions with additional validation information
   - Additional field: validation_reasons (semicolon-separated list)

### Visualization Data

1. **summary.json**:
   - Simplified statistics for visualization
   - Same structure as analysis summary but optimized for web display

2. **examples.json**:
   ```json
   [
     {
       "type": "pp_inversion",
       "sentence": "At the time what it looked like to my eyes was a remarkable loss of authority.",
       "constituent_type": "PP (Prepositional Phrase)",
       "fronted_constituent": "At the time what it looked like to my eyes",
       "verb": "was",
       "subject": "a remarkable loss of authority",
       "is_locative": true,
       "confidence": "high"
     },
     "..."
   ]
   ```

3. **distributions.json**:
   - Pre-calculated distributions for charts
   - Contains data series for different aspects (by file, by constituent, etc.)

4. **config.json**:
   - Configuration for visualization
   - Color schemes, titles, metadata

## 8. Linguistic Foundation and Theoretical Framework

The analysis is based on established linguistic theory about inversion, particularly:

1. **Information Structure Theory**:
   - Inversion places new information (typically the subject) in end position
   - Fronted elements typically represent given or background information
   - This placement serves discourse cohesion functions

2. **Locative Hypothesis**:
   - The majority of inversions have spatial/temporal location as the fronted element
   - Non-locative extensions develop from this core function

3. **Constituent Structure**:
   - Inversion affects the canonical SVO word order of English
   - Different constituent types (PP, AdvP, AP) can trigger inversion

4. **Semantic-Pragmatic Interface**:
   - Inversion serves as a boundary marker between discourse segments
   - It signals a shift in perspective or focus