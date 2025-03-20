# Subject-Verb Inversion Finder

A Python-based tool for identifying and analyzing subject-verb inversion in academic English texts.

## Overview

This project provides tools for analyzing subject-verb inversion in academic writing, focusing on constructions where a main verb precedes its subject. The toolkit includes scripts for corpus statistics, pattern identification, detailed linguistic analysis, and interactive visualization.

The analysis focuses on "full subject-verb inversion" defined as constructions where a non-auxiliary verb precedes its subject:

```
Full inversion example:
"Into the room [came] [a studious-looking man]."
```

This differs from subject-auxiliary inversion ("Is he coming?" or "Never have I seen such a display!").

## Repository Structure

```
subject-verb-inversion-finder/
├── data/                               # Directory containing corpus text files
├── inversion_results/                  # Output directory with analysis results
├── visualization_data/                 # Data prepared for web visualization
├── corpus-analysis.py                  # Basic corpus statistics script
├── subject-verb-inversion-finder.py    # Main inversion analysis script
├── create-visualization-data.py        # Transforms analysis results for visualization
├── index.html                          # Web visualization interface
├── styles.css                          # Styling for web visualization
├── visualization.js                    # JavaScript for interactive visualization
├── CLAUDE.md                           # Technical documentation of logic implementation
├── WEBVIS.md                           # Documentation of web visualization component
└── README.md                           # This file
```

## Corpus Information

- **Content**: Academic texts from multiple disciplines
- **Files**: 5 text files (text_acad_2000.txt through text_acad_2004.txt)
- **Size**: ~245 MB total 
- **Structure**: Approximately 4,546 paragraphs, ~601,561 sentences
- **Format**: Plain text with paragraph markers (`@@`)

## Complete Analysis Pipeline

### 1. corpus-analysis.py (Quick Analysis)

This script provides preliminary corpus statistics and identifies potential inversions for initial exploration:

- **Features**:
  - Basic corpus information (file count, size, paragraphs, sentences)
  - Detection of potential inversion patterns
  - Classification by inversion type
  - Locative vs. non-locative distinction
  - Example extraction for further inspection

- **Usage**:
  ```
  python corpus-analysis.py
  ```

- **Output**:
  - Terminal display of basic statistics
  - Example inversions found in the corpus
  - JSON file with analysis results (`corpus_analysis_results.json`)

### 2. subject-verb-inversion-finder.py (Comprehensive Analysis)

This is the main analysis script with sophisticated detection and classification capabilities:

- **Features**:
  - Enhanced pattern matching for complex inversions
  - Specialized detection for coordinated structures and numeric expressions
  - Classification by syntactic types:
    - Prepositional Phrase (PP)
    - Adverb Phrase (AdvP)
    - Adjective Phrase (AP)
    - Verb Phrase (VP)
    - Numeric Expressions
    - Coordinated Structures
    - Complex PPs with embedded clauses
  - Distinction between existential "there" constructions and other inversions
  - Advanced subject identification with improved heuristics
  - Comprehensive validation system with confidence scoring (high, medium, low)
  - Locative vs. non-locative classification
  - Two-pass detection approach for complex cases
  - Validation testing framework for quality assessment

- **Usage**:
  ```
  python subject-verb-inversion-finder.py
  ```

- **Output**:
  ```
  Validating complex inversion detection...
  Complex inversion detection rate: 0.50
  Detected: 5/10
  
  Analyzing corpus for subject-verb inversion...
  Processing file 1/5
  ...
  
  === Subject-Verb Inversion Analysis ===
  Files analyzed: 5
  Total paragraphs: 4546
  Total sentences: 601561
  Total inversions found: 22673 (3.77% of sentences)
  Complex inversions: 7360 (32.46% of all inversions)
  ```
  - Detailed terminal report
  - JSON summary (`inversion_analysis_summary.json`)
  - CSV file with all inversions (`inversion_analysis_examples.csv`)
  - CSV file focusing on complex cases (`inversion_analysis_complex_examples.csv`)
  - Human-readable report (`inversion_analysis_report.txt`)

### 3. create-visualization-data.py (Data Transformation)

This script processes the analysis results into a format optimized for web visualization:

- **Features**:
  - Transforms raw analysis data into web-friendly JSON files
  - Creates statistical summaries for charts and visualizations
  - Samples representative examples for the example explorer
  - Generates configuration data for visualization styling

- **Usage**:
  ```
  python create-visualization-data.py
  ```

- **Output**:
  - `visualization_data/summary.json`: Overall statistics
  - `visualization_data/examples.json`: Curated set of inversion examples
  - `visualization_data/distributions.json`: Frequency distributions for charts
  - `visualization_data/config.json`: Visualization configuration

### 4. Web Visualization

The project includes an interactive web interface for exploring the analysis results:

- **Features**:
  - Dashboard overview with key statistics
  - Interactive charts (constituent types, confidence levels, inversion types)
  - Filterable example explorer
  - Detailed view of individual inversions
  - Responsive design for different screen sizes

- **Usage**:
  1. Generate visualization data as described above
  2. Open `index.html` in a web browser, or
  3. Host the files on a web server (recommended for larger datasets)

## Inversion Types Detected

1. **Existential 'there' Constructions**:
   - "There is an aerial photograph..."
   - "There are no trees on the street."

2. **Prepositional Phrase (PP) Inversions**:
   - "On the right is a winged lion based on the British griffon."
   - "At home a vicious circle starts as finances are drained."

3. **Adverb Phrase (AdvP) Inversions**:
   - "Often the vertical welt appears down the center of the forehead."
   - "Only one questioned whether or not their flag was made for export."

4. **Adjective Phrase (AP) Inversions**:
   - "Most people in southern Africa are aware of the natural ways of becoming infected with HIV."
   - "Most people use temporary materials because they believe that new houses are being built."

5. **Numeric Expression Inversions**:
   - "One of the most striking figures in this collection of seventeen sculptures is that of a man squatting on the ground."
   - "Two traditional sayings are depicted."

6. **Complex PP with Embedded Clauses**:
   - "In extremis I have seen two apparently well-used flags with the Union Jack that still had the visible remains of a manufacturer's imprint."
   - "In the company where he worked was a culture of innovation."

7. **Coordinated Structure Inversions**:
   - "In less than a week a piece of cloth can be made to look and feel as if it were fifty years old."
   - "Among the practical reasons for a decrease of street-side sales of artworks and other goods in Dakar is the transformation of the city's complex traffic patterns."

8. **Verb Phrase (VP) Inversions**:
   - "Included in the price is a one-year warranty."
   - "Standing at the entrance was a security guard."

## Key Findings

Analysis of the corpus revealed:

- **Frequency**: 22,673 inversions (3.77% of sentences)
- **Complex Inversions**: 7,360 cases (32.46% of all inversions)
- **Most Common Types**:
  - AdvP (Existential): 6,106 instances (26.9%)
  - Numeric Expression: 5,158 instances (22.7%)
  - PP (Prepositional Phrase): 3,829 instances (16.9%)
  - AdvP (Adverb Phrase): 3,407 instances (15.0%)
  - AP (Adjective Phrase): 1,811 instances (8.0%)
  - PP (Complex Prepositional Phrase): 1,331 instances (5.9%)
  - Coordinated Structure: 871 instances (3.8%)
  - VP (Verb Phrase): 160 instances (0.7%)
- **Semantic Function**:
  - Locative inversions: 11,850 instances (52.3%)
  - Non-locative inversions: 10,823 instances (47.7%)

## Validation System

The analysis employs a confidence-based validation system:

- **High Confidence**: 9,388 instances (41.4%)
- **Medium Confidence**: 13,191 instances (58.2%)
- **Low Confidence**: 94 instances (0.4%)

Confidence assessment is based on multiple factors including:
- Subject legitimacy (presence of determiners)
- Verb type (common inversion verbs)
- Balance between fronted constituent and subject length
- Absence of question patterns
- Proper handling of quotations and parenthetical elements

## Output Files and Interpretation

The analysis generates several output files for different purposes:

### Analysis Result Files

- **inversion_analysis_summary.json**: Overall statistics in JSON format
  - Use for quantitative analysis of inversion patterns
  - Contains counts by type, confidence level, and locative status

- **inversion_analysis_examples.csv**: All detected inversions
  - Contains sentence, fronted constituent, verb, subject, and classification
  - Useful for corpus linguists examining specific patterns

- **inversion_analysis_complex_examples.csv**: Focus on complex inversions
  - Includes validation reasons for confidence assessments
  - Valuable for studying more sophisticated inversion structures

- **inversion_analysis_report.txt**: Human-readable summary
  - Contains statistics and examples in an easily readable format
  - Good starting point for understanding the results

### Visualization Data Files

- **summary.json**: Simplified statistics for visualization
- **examples.json**: Curated set of representative examples
- **distributions.json**: Pre-calculated distributions for charts
- **config.json**: Visualization configuration and styling

## Requirements

- Python 3.6+
- Web browser supporting modern JavaScript (for visualization)
- No external Python libraries needed (uses only Python standard library)

## Getting Started

1. **Clone the repository**:
   ```
   git clone https://github.com/yourusername/subject-verb-inversion-finder.git
   cd subject-verb-inversion-finder
   ```

2. **Prepare corpus files**:
   - Place your academic text files in the `data` directory
   - Files should be named with the pattern `text_acad_*.txt`

3. **Run initial analysis**:
   ```
   python corpus-analysis.py
   ```

4. **Run comprehensive analysis**:
   ```
   python subject-verb-inversion-finder.py
   ```

5. **Generate visualization data**:
   ```
   python create-visualization-data.py
   ```

6. **Explore the visualization**:
   - Open `index.html` in a web browser
   - Use the filters to explore different inversion types
   - Click on examples to see detailed breakdowns

## Analyzing Results

When interpreting the analysis results, consider these aspects:

1. **Distribution across syntactic types**:
   - The prevalence of existential constructions (26.9%) reflects their importance in academic discourse for introducing new information
   - The high frequency of numeric expressions (22.7%) shows their role in organizing academic content

2. **Locative vs. non-locative inversions**:
   - The slight predominance of locative inversions (52.3%) aligns with theoretical accounts of inversion as primarily a locative phenomenon
   - Non-locative inversions (47.7%) represent extensions of the basic pattern to other semantic domains

3. **Confidence levels**:
   - The high proportion of medium confidence (58.2%) indicates the inherent complexity of inversion structures
   - High confidence inversions (41.4%) provide the most reliable data for linguistic analysis

4. **Discourse functions**:
   - Subject-verb inversions typically serve to present new information (the subject) in end position
   - They also create cohesion by placing locative or temporal information in initial position

## Troubleshooting

### Common Issues

1. **Encoding errors when reading corpus files**:
   - The scripts attempt to handle different encodings, but if you encounter errors:
   - Try converting your corpus files to UTF-8 encoding
   - Check for and remove any non-standard characters

2. **False positives in inversion detection**:
   - Examine the "low confidence" examples to identify potential pattern issues
   - Adjust the patterns in the script if necessary for your specific corpus

3. **Visualization not loading**:
   - Check browser console for JavaScript errors
   - Ensure all visualization data files are in the correct location
   - Try a different browser if problems persist

4. **Performance issues with large corpora**:
   - Consider splitting analysis into batches
   - Use the `max_files` parameter in `process_files()` to limit processing

### Extending the Tool

To adapt the tool for your specific needs:

1. **Adding new patterns**:
   - Define new regex patterns in the `__init__` method of `EnhancedInversionFinder`
   - Add corresponding checks in the `find_inversions_in_sentence` method

2. **Customizing output**:
   - Modify the `save_results` method to generate alternative formats
   - Update the data transformation in `create-visualization-data.py`

3. **Analyzing other languages**:
   - Substantial modifications would be needed for non-SVO languages
   - Consider adapting the pattern matching logic for the target language's syntax

## Research Applications

This tool supports linguistic research on:
- Information packaging in academic writing
- Syntactic variation in English
- The relationship between structural choice and discourse function
- Locative vs. non-locative inversion distribution
- Complex syntactic patterns in academic registers

### Specific Research Questions

1. **Frequency variations across disciplines**:
   - Do certain academic fields use inversions more frequently?
   - Are specific inversion types associated with particular disciplines?

2. **Functional analysis**:
   - What discourse functions do different inversion types serve?
   - How do inversions contribute to information flow in academic texts?

3. **Theoretical implications**:
   - Do the distribution patterns support existing theories of inversion?
   - What can complex inversions tell us about the flexibility of English syntax?

4. **Pedagogical applications**:
   - How might this data inform the teaching of academic writing?
   - Could explicit instruction on inversion improve non-native writers' academic prose?

## Additional Resources

- The `CLAUDE.md` file provides detailed technical documentation on the logic implementation
- The `WEBVIS.md` file contains comprehensive information about the web visualization component
- See `inversion_analysis_report.txt` for examples of detected inversions