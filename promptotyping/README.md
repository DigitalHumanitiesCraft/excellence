# Historical Document Viewer

A lightweight viewer for historical documents with PAGE XML transcriptions, designed for displaying medieval Slavic manuscript materials from Transkribus exports.

## Features

- Dual-view interface showing document images alongside their transcriptions
- Line-by-line correspondence between original document and transcription
- Support for PAGE XML format from Transkribus exports
- Integration of external annotations (NER, POS, morphological analysis)
- Document collection browsing and navigation
- Search functionality across documents and within document content
- Zoom and pan controls for document viewing
- Responsive design for different screen sizes

## Demo

You can see a live demo of this project at: https://yourusername.github.io/historical-document-viewer/

## Getting Started

### Prerequisites

This is a static web application with no build process required. You only need:

- A modern web browser (Chrome, Firefox, Edge, Safari)
- Text editor for code modifications
- Basic knowledge of HTML, CSS, and JavaScript if you want to customize

### Installation

1. Clone this repository:
```bash
git clone https://github.com/yourusername/historical-document-viewer.git
cd historical-document-viewer
```

2. Place your document images in the `data/documents/` directory
3. Place your PAGE XML transcription files in the `data/transcriptions/` directory
4. Update the `data/metadata.json` file with your collection information
5. (Optional) Add annotation files in the `data/annotations/` directory

### Directory Structure

```
historical-document-viewer/
├── index.html            # Main application entry point
├── css/
│   ├── main.css          # Core styling
│   ├── viewer.css        # Document viewer styles
│   └── annotations.css   # Annotation styling
├── js/
│   ├── app.js            # Application initialization
│   ├── parser.js         # XML parsing utilities
│   ├── viewer.js         # Document/transcription display logic
│   ├── annotations.js    # Annotation processing
│   ├── navigation.js     # Document navigation controls
│   └── search.js         # Search functionality
└── data/
    ├── documents/        # Document images (.jpg, .png)
    ├── transcriptions/   # PAGE XML files
    ├── annotations/      # External annotation files
    └── metadata.json     # Collection metadata
```

## Deploying to GitHub Pages

1. Push your code to a GitHub repository
2. Go to Settings > Pages in your GitHub repository
3. Select your main branch as the source
4. Click Save

Your site will be published at `https://yourusername.github.io/historical-document-viewer/`

## Working with Data

### Metadata Format

The `metadata.json` file should follow this structure:

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
    }
  ]
}
```

### Annotation Format

Annotation files should follow this structure:

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
        "description": "Description of the annotation"
      }
    }
  ]
}
```

## Customization

### Styling

Customize the appearance by modifying the CSS files in the `css/` directory:

- `main.css` - Core application styling
- `viewer.css` - Document viewer specific styles
- `annotations.css` - Annotation styling and colors

### Adding Features

You can extend the viewer by modifying the JavaScript files in the `js/` directory:

- Add support for additional annotation types in `annotations.js`
- Enhance search capabilities in `search.js`
- Modify document display logic in `viewer.js`

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Transkribus platform for PAGE XML export format
- All contributors to the historical document collection