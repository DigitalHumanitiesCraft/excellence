# Stefan Zweig Digital - Annotation Tool

A web-based annotation tool for Digital Humanities researchers working with the Stefan Zweig correspondence collection.

## Features

- **Timeline Visualization**: Chronological display of documents from GAMS repository
- **Research Annotations**: Add notes, tags, and research status to documents
- **Filtering & Search**: Filter by date availability, annotation status, and search in content
- **Data Management**: Export/import annotations as JSON
- **Responsive Design**: Works on desktop and mobile devices

## Usage

1. Open `index.html` in a web browser
2. Documents load automatically from GAMS API
3. Click any document card to add annotations
4. Use filters to organize your research workflow
5. Export annotations for further analysis

## Annotation Types

- **Research Status**: Unprocessed, In Progress, Completed
- **Tags**: Thematic categorization (Literature, Politics, Exile, etc.)
- **Notes**: Free-form research comments and observations

## Data Storage

- Annotations stored locally in browser
- Export/import functionality for data portability
- No external dependencies for annotation data

## Requirements

- Modern web browser with JavaScript enabled
- Internet connection for loading document data from GAMS

## API

Fetches data from: `https://gams.uni-graz.at/archive/objects/context:szd.facsimiles.korrespondenzen/methods/sdef:Object/getMetadata`

## Files

- `index.html` - Main application
- `style.css` - Styles and responsive design