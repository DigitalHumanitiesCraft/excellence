# Promptotyping Examples

This directory contains a collection of **promptotypes** - functional web applications developed using the **Promptotyping methodology**. Each application was created within a few hours using AI-assisted development (primarily Claude/ChatGPT) combined with systematic prompt engineering.

## What is Promptotyping?

**Promptotyping** is a methodology that combines **Prompt Engineering** with **Rapid Prototyping** to create functional software applications quickly and efficiently. It leverages Large Language Models (LLMs) for code generation while maintaining quality through structured documentation and critical expert review.

### Core Principle: Context Compression

The key to effective promptotyping is **context compression** - providing better information, not more information:
- Reduce complex requirements to their relevant essence
- Use precise technical terminology
- Structure information clearly in markdown
- Focus on what matters for the LLM to generate quality code

### The Promptotyping Process

**Phase 1: Document Setup**
- `README.md` - WHY? Context, motivation, domain knowledge
- `REQUIREMENTS.md` - WHAT? Functional and non-functional requirements
- `DATA.md` (optional) - USING WHAT? Data structures, APIs, examples
- `DESIGN.md` (optional) - HOW TO LOOK? UI/UX requirements
- `CLAUDE.md`/`LLM.md` (optional) - Working memory for the AI assistant

**Phase 2: Iterative Development Cycle**
1. **Prompt Engineering** - Clear, structured prompts referencing documentation
2. **Prototyping** - Step-by-step implementation (data → UI → features)
3. **Critical Expert Review** - Validate, question, and improve AI-generated code
4. **Documentation** - Update working documents with learnings

**Phase 3: Expert-in-the-Loop**
- Domain experts continuously validate both code and documentation
- Iterative refinement of requirements and implementation
- Version control of significant changes

**Typical Timeline:** 15-60 minutes for setup, then rapid iterative cycles - most applications in this directory were created in 2-4 hours.

## Example Promptotypes

This directory contains various promptotypes demonstrating different application types:

### Digital Humanities Tools

- **ChSl** - Historical Document Viewer for medieval Slavic manuscripts with PAGE XML transcriptions from Transkribus
- **crown-dashboard-json-webapp** - Crown Dashboard data visualization
- **hamlet-digital-edition-tei-to-frontend-webapp** - TEI XML to web interface converter
- **imareal-room-object-webapp** - IMAREAL room object viewer
- **szd-dashboard** - SZD project dashboard
- **szd-annotation-timeline** - Annotation timeline visualization

### Linguistic Analysis Tools

- **subject-verb-inversion-finder** - Linguistic analysis tool for subject-verb inversion patterns
- **disco-invert** - Discourse analysis tool with Fisher corpus integration
- **badisches-wörterbuch** - Baden dialect dictionary interface

### Other Applications

- **the-one-snake-vibe-coding** - Lord of the Rings themed snake game (demonstrates "vibe coding" methodology)
- **web-diagram-webpage-workflow** - Diagram-to-webpage workflow tool
- **novela** - Novel/narrative visualization tool

## Technical Characteristics

Most promptotypes in this directory are:
- **Pure JavaScript/HTML/CSS** - No build process required
- **Single Page Applications** - Self-contained and portable
- **Static Web Apps** - Can be served directly or via GitHub Pages
- **No Backend Required** - Client-side data processing
- **Modern Browser Compatible** - ES6+ JavaScript

## Running a Promptotype

Most projects can be run immediately:

```bash
# Navigate to a project directory
cd subject-verb-inversion-finder

# Start a simple HTTP server
python -m http.server 8000

# Open in browser
# http://localhost:8000
```

Or simply open the `index.html` file directly in a modern web browser.

## Learning from These Examples

Each project demonstrates:
1. **Structured Documentation** - How to set up promptotyping documents
2. **Rapid Development** - Achieving functional applications in hours
3. **Domain-Specific Solutions** - Tailored to Digital Humanities research needs
4. **Expert Validation** - Code that has been critically reviewed
5. **Practical AI Usage** - Real-world examples of LLM-assisted development

## Further Reading

- See `/system_prompts/promptotyping-guide.md` for the complete methodology
- Read blog posts at `/blog/` for articles on:
  - Promptotyping methodology
  - "Vibe Coding" and critical expert review
  - Understanding LLM capabilities and limitations
  - System-1.42 mental model for LLMs

## Citation

If you use or reference this collection, please cite:

Pollin, Christopher, & Steiner, Christian. (2024). DH Craft Excellence Repository. Zenodo. https://doi.org/10.5281/zenodo.14160876

## License

Individual projects may have their own licenses - see each project directory for details.

---

**Digital Humanities Craft** - excellence.dhcraft.org
