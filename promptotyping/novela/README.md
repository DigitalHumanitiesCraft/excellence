# NOVELA Project

NOVELA (Novels in Latin) is a digital edition platform for the exploration of Latin novels from the 17th and 18th centuries. This project provides an interactive web-based environment for reading, analyzing, and visualizing these important literary works.

## Features

- Parallel display of Latin text and English translations
- Linguistic analysis with Alpheios integration
- Speech representation visualization and analysis
- Named entity recognition and highlighting
- Interactive data visualizations
- Mobile-responsive design

## Live Demo

View the live site: [https://your-username.github.io/novela-project/](https://your-username.github.io/novela-project/)

## Project Structure

```
novela-project/
├── index.html              # Landing page
├── css/                    # Stylesheets
├── js/                     # JavaScript files
├── texts/                  # Text pages
│   ├── prasch.html         # Johann Ludwig Prasch's text
│   └── holberg.html        # Ludvig Holberg's text
├── visualizations/         # Analysis visualizations
│   ├── speech-analysis.html
│   └── narrative-structure.html
├── about.html              # About page
└── data/                   # JSON data files
```

## Setup and Local Development

### Prerequisites

- No special requirements - this is a static site with HTML, CSS, and JavaScript

### Local Development

1. Clone the repository:
   ```
   git clone https://github.com/your-username/novela-project.git
   cd novela-project
   ```

2. Open the project in your preferred editor

3. To view the site locally, you can use any local server. For example with Python:
   ```
   # If you have Python 3 installed:
   python -m http.server
   
   # If you have Python 2 installed:
   python -m SimpleHTTPServer
   ```

4. Navigate to `http://localhost:8000` in your browser

## Deployment to GitHub Pages

1. Push your changes to GitHub:
   ```
   git add .
   git commit -m "Your commit message"
   git push origin main
   ```

2. In your GitHub repository settings, enable GitHub Pages:
   - Go to Settings > Pages
   - Select the `main` branch as the source
   - Choose the root folder
   - Click Save

3. Your site will be available at `https://your-username.github.io/novela-project/`

## Adding New Texts

To add a new Latin text to the collection:

1. Create a new HTML file in the `texts/` directory
2. Follow the structure of existing text pages (e.g., `prasch.html`)
3. Process your HTML source content using the functions in `novela-core.js`
4. Update navigation menus to include the new text

## Future Development

- Additional Latin novels from the collection
- Enhanced linguistic analysis tools
- Comparative features across multiple texts
- Improved narrative visualization tools
- Linked Open Data implementation

## Credits

- [Bootstrap 5](https://getbootstrap.com/) - Frontend framework
- [Alpheios Reading Tools](https://alpheios.net/) - Latin word analysis
- [Chart.js](https://www.chartjs.org/) - Interactive data visualizations

## License

This project is licensed under the MIT License - see the LICENSE file for details.