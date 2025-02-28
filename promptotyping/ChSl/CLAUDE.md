# Historical Document Viewer Development Guidelines

## Project Structure
- Pure JavaScript/HTML/CSS application for viewing historical documents
- No build tools or bundlers required - direct browser execution

## Running the Application
- Open `index.html` in a browser or serve with any HTTP server
- For live development: `python -m http.server` then visit http://localhost:8000

## Code Style
- ES6 module imports (`import/export`) for code organization
- Function and variable names in camelCase, classes in PascalCase
- Maintain 4-space indentation for all JavaScript, HTML, and CSS
- Include JSDoc comments for all functions with `@param` and `@return` tags
- Use template literals for string interpolation

## Error Handling
- Use try/catch blocks for functions that could fail (especially file operations)
- Display user-friendly error messages via the `showError()` function
- Log detailed errors to console for debugging

## DOM Manipulations
- Favor `document.querySelector` over direct ID references
- Create elements programmatically rather than inserting HTML strings
- Use data attributes for storing element metadata