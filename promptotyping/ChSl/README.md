# Historical Document Viewer

A modern web-based viewer for historical manuscripts with dual-view display, annotation support, and advanced navigation features. This application is designed specifically for displaying medieval Slavic manuscript materials from Transkribus exports.

![Historical Document Viewer Screenshot](screenshot.jpg)

## Features

### Document Display
- **Dual-view Interface**: Display document images alongside their transcriptions
- **Synchronized Scrolling**: Automatic alignment between document and transcription views
- **Line-by-line Correspondence**: Interactive highlighting of corresponding elements
- **Zoom & Pan Controls**: Precision navigation in high-resolution document images

### Data Integration
- **PAGE XML Support**: Full parsing of Transkribus PAGE XML format
- **Annotation Integration**: Support for Named Entity Recognition (NER), part-of-speech tagging, and morphological analysis
- **METS Structure Handling**: Proper navigation for multi-page documents
- **Custom Annotation Format**: Easy integration of external annotations in JSON format

### Search Capabilities
- **Full-text Search**: Search across all documents in the collection
- **Within-document Search**: Find and highlight terms within the current document
- **Annotation-aware Searching**: Include named entities and other annotations in search
- **Result Navigation**: Easy movement between search results

### User Interface
- **Collection Browser**: Grid-based overview of all documents
- **Flexible Layout**: Toggle between document-only, transcription-only, and dual-view modes
- **Annotation Legend**: Visual explanation of annotation types
- **Breadcrumb Navigation**: Clear indication of current position within the collection

### Technical Features
- **No Dependencies**: Pure JavaScript implementation with no external libraries
- **GitHub Pages Compatible**: Easy deployment to GitHub Pages
- **Responsive Design**: Adapts to different screen sizes
- **Custom Error Handling**: User-friendly error messages

## Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Edge, Safari)
- Basic knowledge of HTML and JavaScript for any customization

### Installation

1. Clone this repository:
```bash
git clone https://github.com/yourusername/historical-document-viewer.git
cd historical-document-viewer
```

2. Create the required data directories:
```bash
mkdir -p data/documents data/transcriptions data/annotations
```

3. Add your documents:
   - Place document images in `data/documents/`
   - Place PAGE XML files in `data/transcriptions/`
   - Place annotation files in `data/annotations/` (optional)
   - Create a `data/metadata.json` file (see format below)

4. Open `index.html` in a web browser or deploy to a web server

### Deployment on GitHub Pages

1. Push your code to a GitHub repository
2. Go to Settings > Pages in your GitHub repository
3. Select your main branch as the source
4. Click Save

Your application will be published at `https://yourusername.github.io/historical-document-viewer/`

## Data Format

### Metadata JSON

The `data/metadata.json` file defines your document collection:

```json
{
  "title": "Collection Title",
  "description": "Collection description",
  "documents": [
    {
      "id": "doc1",
      "title": "Document Title",
      "date": "Document Date",
      "imageFileName": "image-file.jpg",
      "xmlFileName": "xml-file.xml",
      "annotationFileName": "annotation-file.json",
      "source": "Document Source"
    },
    // More documents...
  ]
}
```

### PAGE XML Format

The application expects PAGE XML files exported from Transkribus. The essential structure includes:

- `<Page>` elements with width and height attributes
- `<TextRegion>` elements containing document regions
- `<TextLine>` elements with coordinate data
- `<Coords>` elements with point data
- `<TextEquiv>` elements containing transcription text

### Annotation Format

Annotations should be stored in JSON files with the following structure:

```json
{
  "documentId": "doc1",
  "annotations": [
    {
      "type": "ner",
      "subtype": "person",
      "start": 10,
      "end": 15,
      "text": "Sample",
      "metadata": {
        "description": "Description of the entity"
      }
    },
    // More annotations...
  ]
}
```

Supported annotation types:
- `ner` (Named Entity Recognition): person, location, organization, date, misc
- `pos` (Part of Speech): noun, verb, adj, adv, other
- `morph` (Morphological Analysis): any subtypes

## Project Structure

```
historical-document-viewer/
├── index.html            # Main application
├── css/
│   ├── main.css          # Core styling
│   ├── viewer.css        # Document viewer styles
│   └── annotations.css   # Annotation styling
├── js/
│   ├── app.js            # Application initialization
│   ├── parser.js         # XML parsing
│   ├── viewer.js         # Document display
│   ├── annotations.js    # Annotation handling
│   ├── navigation.js     # Document navigation
│   └── search.js         # Search functionality
└── data/
    ├── documents/        # Document images
    ├── transcriptions/   # PAGE XML files
    ├── annotations/      # Annotation files
    └── metadata.json     # Collection metadata
```

## Usage Guide

### Basic Navigation

- **Collection View**: Grid of all documents in the collection
- **Document View**: Dual-panel display with image and transcription
- **Toggle View**: Switch between document-only, transcription-only, and dual-view modes
- **Zoom Controls**: + and - buttons in the toolbar
- **Pan**: Click and drag on the document image

### Keyboard Shortcuts

- **Left/Right Arrows**: Navigate to previous/next document
- **Ctrl+F**: Open search panel
- **Escape**: Close dialogs/panels
- **+/-**: Zoom in/out
- **Ctrl+Mouse Wheel**: Zoom in/out

### Working with Annotations

- **Toggle Annotations**: Click the "A" button in the toolbar
- **Annotation Legend**: Shows explanation of annotation types and colors
- **Annotation Tooltips**: Hover over highlighted text to see details

### Search

- **Collection Search**: Search across all documents
- **Document Search**: Find terms within the current document
- **Result Navigation**: Use up/down buttons to move between results

## Customization

### Styling

Modify the CSS files to change the appearance:

- `main.css`: Core application styling
- `viewer.css`: Document viewer specific styles
- `annotations.css`: Annotation styling and colors

### Adding Features

Extend functionality by modifying the JavaScript modules:

- Add new annotation types in `annotations.js`
- Add custom document processing in `parser.js`
- Enhance search capabilities in `search.js`

## Technical Documentation

### Core Components

#### Parser Module (`parser.js`)
Handles parsing of PAGE XML format with coordinate extraction for regions, lines, and words.

#### Viewer Module (`viewer.js`)
Manages document display with synchronized scrolling, highlighting, and zoom functionality.

#### Annotations Module (`annotations.js`)
Processes and displays annotations with color-coding and tooltips.

#### Search Module (`search.js`)
Implements search indexing and result highlighting across documents and within documents.

#### Navigation Module (`navigation.js`)
Handles document browsing, history tracking, and keyboard navigation.

#### App Module (`app.js`)
Main application controller coordinating all components.

### Performance Considerations

- **Large Documents**: For very large collections, consider pagination
- **High-resolution Images**: Implement progressive loading for better performance
- **Complex Annotations**: For documents with many annotations, selective loading may improve performance