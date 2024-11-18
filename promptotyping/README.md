# Promptotyping \- the FrontEND?

## Transforming Digital Humanities Research Through AI-Assisted Interface Generation

The Digital Humanities face a persistent challenge: the gap between data collection/curation and meaningful interface-based exploration. Traditionally, implementing research interfaces required substantial development time and technical expertise, often creating a bottleneck in the research process. This paper introduces *Promptotyping[^1]*, a proposed methodology that leverages AI-assisted development to fundamentally transform how researchers interact with their data.

### The Current Paradigm Shift

*Promptotyping* combines advanced prompt engineering techniques with rapid prototyping to accelerate the development of data-driven frontend applications. However, its implications extend beyond mere efficiency gains. We argue that we are approaching a paradigm shift where the traditional boundary between conceptualizing research interfaces and implementing them is dissolving. This transformation enables researchers to focus primarily on their data and research questions, while implementation becomes an almost instantaneous, AI-assisted process.

### Requirements Engineering Foundation

Central to our approach (at the time of writing this proposal; we are aware that this may change) is PRISM (Parameterized Recursive Insight Synthesis Matrix)[^2], a methodology[^3] for prompt engineering developed by Christopher Pollin. PRISM functions as an advanced prompt engineering technique, enhancing the quality of LLM outputs by enforcing structured thinking patterns. While models like o1[^4] inherently incorporate reasoning, PRISM helps systematize this process for other LLMs like Claude. It integrates parameterized thinking and matrix-based analysis within a tree of thought framework, enabling systematic examination of nested sub-problems. The framework can be applied to various complex problem-solving scenarios, including *Promptotyping* as we propose in this paper:

1. **Analysis Phase**  
     
   - Systematic identification of research objectives  
   - Constraint mapping and resource evaluation  
   - Sub-problem decomposition for recursive analysis  
   - Requirements specification validation

   

2. **Parameterization Phase**  
     
   - Configuration of thinking modalities  
   - Focus area definition  
   - Depth calibration  
   - Temporal scope alignment

   

3. **Matrix Development**

| Component | Parameters | Analysis | Outcomes | Rating |
| :---- | :---- | :---- | :---- | :---- |
| Research Questions | Scope, Complexity | Feasibility | Solutions | 1-5 |
| Data Structure | Format, Volume | Processing needs | Architecture | 1-5 |
| Interface Requirements | Complexity, Users | Technical approach | Implementation | 1-5 |

4. **Synthesis Loop**  
     
   - Integration of multi-level insights  
   - Priority-based implementation planning  
   - Uncertainty identification  
   - Iterative refinement protocols

### Technical Implementation Process

The implementation workflow currently operates through a strategic dual-LLM approach. OpenAI's o1 serves as the strategic planner, developing comprehensive implementation strategies and architectural decisions. Anthropic's Claude 3.5 Sonnet then takes these plans and provides detailed implementation guidance, generating specific code solutions and step-by-step deployment instructions. While this workflow may evolve with the emergence of agentic LLMs[^5] in 2025, two core phases remain essential:

1. **Initial Analysis Phase**  
     
   - Requirements decomposition  
   - Architecture planning  
   - Technical stack selection  
   - Implementation strategy development

   

2. **Implementation Phase**  
     
   - Iterative code generation  
   - Step-by-step implementation guidance  
   - Documentation generation  
   - Deployment support

This process eliminates the traditional technical barriers between researchers and their data by positioning LLMs as senior development advisors. The LLMs function as experienced technical architects, making informed decisions across the entire development stack. They evaluate and select appropriate frontend frameworks and libraries, design efficient database architectures, develop scalable API structures, and devise suitable deployment strategies. This comprehensive technical decision-making process, traditionally requiring input from multiple specialized developers, is streamlined through the LLMs' ability to understand and integrate various technical domains while remaining aligned with research objectives.

### Data Processing Pipeline

Our methodology employs Python-based transformation pipelines for data processing, chosen specifically for its robust representation in LLM training data, which ensures more reliable code generation. This approach has proven effective for complex humanities data formats, as demonstrated in our Hamlet \- Digital Edition *Promptotype[^6]*, where TEI/XML data is transformed into a SQL database hosted on Heroku and consequently to JSON for frontend consumption.

### Quality Assurance and Documentation

Our quality assurance process places the human researcher at the center of validation and refinement. The validation process prioritizes data integrity verification, with researchers specifically checking for any alterations to core data during the transformation process. While LLM hallucinations become less prevalent with each model generation, this validation step remains crucial for maintaining research accuracy.

Documentation, implemented exclusively in Markdown format as it provides excellent parsing capabilities for current LLMs, enables accurate interpretation of requirements and enhances communication between researchers and the AI development pipeline.

### Case Studies

Our methodology has been validated through three Digital Humanities projects, each completed within a few hours:

1. **Hamlet \- Digital Edition[^7]**  
   A Flask-based *promptotype* that analyzes and compares textual data (including word frequencies, character interactions, and textual variants) across different editions of Shakespeare's Hamlet.  
     
2. **Crown Dashboard[^8]**  
   A client-only (data transformed from The Museum System \- TMS’ CSV outputs into JSON) *promptotype* that offers a suite of interactive tools for in-depth analysis of the Vienna Imperial Crown's materiality, technology, and preservation.  
     
3. **Room \- Object[^9]**  
   This *promptotype* visualizes hierarchical data of objects located in rooms within historical buildings, such as castles and fortresses, using interactive treemap and sunburst charts for rapid exploration and analysis.

### Implications and Future Directions

The transformative potential of *Promptotyping* extends beyond efficiency gains in interface development. We envision a future where researchers can instantaneously materialize their conceptual "thought interfaces" – where research questions are immediately translated into interactive exploration tools. This democratization of interface creation enables scholars, regardless of technical expertise, to engage deeply with complex datasets.

As LLM capabilities evolve, we anticipate the *Promptotyping* process becoming increasingly accessible. Future developments in agentic workflows will likely automate the handling of different implementation stages, potentially reducing the need for structured frameworks like PRISM. This evolution will further democratize research data exploration, though careful validation of data integrity remains essential to prevent potential hallucinations or misrepresentations in the generated interfaces.

### Limitations and Prerequisites

The effectiveness of Promptotyping heavily depends on data quality and structure. While the methodology significantly accelerates interface development, reducing implementation time from weeks to hours, it requires well-curated and properly formatted input data. This prerequisite ensures that the resulting interfaces accurately represent and interact with the underlying research data.

### Conclusion

*Promptotyping* represents not just a methodology but a gateway to a new era in research. As we demonstrate through our case studies, the technology to support this transformation is already emerging. The question is no longer whether AI will transform research interface development, but how we can best harness this capability to advance research.

### References

1. Alvarez, G., & Plummer, D. (2024). Agentic AI is the top strategic technology trend for 2025\. Gartner IT Symposium/Xpo 2024  
     
2. Lightman, H., Kosaraju, V., Burda, Y., Edwards, H., Baker, B., Lee, T., ... & Cobbe, K. (2023). Let's verify step by step. *arXiv e-print arXiv:2305.20050*.  
     
3. Sahoo, P., Singh, A. K., Saha, S., Jain, V., Mondal, S., & Chadha, A. (2024). A systematic survey of prompt engineering in large language models: Techniques and applications. *arXiv  e-print arXiv:2402.07927*.  
     
4. Schulhoff, S., Ilie, M., Balepur, N., Kahadze, K., Liu, A., Si, C., ... & Resnik, P. (2024). The Prompt Report: A Systematic Survey of Prompting Techniques. *arXiv  e-print arXiv:2406.06608*.  
     
5. Valmeekam, K., Stechly, K., & Kambhampati, S. (2024). LLMs Still Can't Plan; Can LRMs? A Preliminary Evaluation of OpenAI's o1 on PlanBench. arXiv preprint arXiv:2409.13373.  
     
6. Wang, X., Wei, J., Schuurmans, D., Le, Q., Chi, E., Narang, S., ... & Zhou, D. (2022). Self-consistency improves chain of thought reasoning in language models. *arXiv  e-print arXiv:2203.11171*.  
     
7. Yao, S., Yu, D., Zhao, J., Shafran, I., Griffiths, T., Cao, Y., & Narasimhan, K. (2024). Tree of thoughts: Deliberate problem solving with large language models. *Advances in Neural Information Processing Systems*, *36*.

[^1]:  The concept is published and citable under [https://doi.org/10.5281/zenodo.14160876](https://doi.org/10.5281/zenodo.14160876) 

[^2]:  System prompt for the PRISM framework [https://github.com/DigitalHumanitiesCraft/excellence/blob/main/system\_prompts/PRISM.md](https://github.com/DigitalHumanitiesCraft/excellence/blob/main/system_prompts/PRISM.md) 

[^3]:  The methodology is inspired by references 2-4 and 6-7 and a concept called smartGPT as proposed in [https://www.youtube.com/watch?v=wVzuvf9D9BU](https://www.youtube.com/watch?v=wVzuvf9D9BU) 

[^4]:  o1 is considered a native reasoning model, cf. Valmeekam, K., Stechly, K., & Kambhampati, S. (2024)

[^5]:  cf. Alvarez, G. & Plummer, D. (2024)

[^6]:  [https://github.com/DigitalHumanitiesCraft/excellence/tree/main/promptotyping/hamlet-digital-edition-tei-to-frontend-webapp](https://github.com/DigitalHumanitiesCraft/excellence/tree/main/promptotyping/hamlet-digital-edition-tei-to-frontend-webapp) 

[^7]:  cf. footnote 6

[^8]:  [https://github.com/DigitalHumanitiesCraft/excellence/tree/main/promptotyping/crown-dashboard-json-webapp](https://github.com/DigitalHumanitiesCraft/excellence/tree/main/promptotyping/crown-dashboard-json-webapp) 

[^9]:  [https://github.com/DigitalHumanitiesCraft/excellence/tree/main/promptotyping/imareal-room-object-webapp](https://github.com/DigitalHumanitiesCraft/excellence/tree/main/promptotyping/imareal-room-object-webapp) 
