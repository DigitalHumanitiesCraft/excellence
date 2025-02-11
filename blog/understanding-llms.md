# Understanding Large Language Models (LLMs): A Technical Overview
*Based on Andrej Karpathy's "Deep Dive into LLMs like ChatGPT"*

## Key Stages in LLM Development

### 1. Pre-training Stage
- **Duration**: ~3 months on thousands of computers
- **Data Source**: Internet text (e.g., Common Crawl)
- **Process**:
  - Download and filter internet content
  - Remove inappropriate content, spam, and low-quality text
  - Convert text into tokens using techniques like BPE
  - Create vocabulary of ~100K tokens
- **Training**:
  - Model learns to predict next token in sequence
  - Uses transformer architecture
  - Requires massive computational resources
- **Output**: Base model that can simulate internet text

### 2. Supervised Fine-tuning (SFT)
- **Dataset Creation Phase**:
  - Takes weeks/months
  - Professional labelers write conversations following detailed guidelines
  - Modern approach uses existing LLMs to help generate content
  - Requires careful curation and quality control
  - Results in millions of high-quality conversation examples

- **Training Phase**:
  - Duration: ~3 hours
  - Uses prepared conversation dataset
  - Fine-tunes pre-trained model into an assistant
  - Much shorter than pre-training due to smaller dataset

### 3. Reinforcement Learning (RL)
#### Verifiable Domains (e.g., math, coding):
- Model practices solving problems with clear right/wrong answers
- Can discover novel solution strategies
- Similar to AlphaGo's learning process
- No human feedback needed
- Can run indefinitely to improve performance

#### Unverifiable Domains (e.g., writing, creativity):
- Uses RLHF (Reinforcement Learning from Human Feedback)
- Creates reward model based on human preferences
- Limited by potential for gaming the reward model
- Cannot run indefinitely due to adversarial examples
- Provides incremental improvements rather than breakthrough capabilities

## Model Capabilities and Limitations

### Strengths
- Strong pattern recognition
- Can leverage external tools (calculators, web search)
- Effective at tasks with clear evaluation criteria
- Can handle complex reasoning when given sufficient context
- Excellent at drafting and ideation

### Limitations
- Can hallucinate (make up false information)
- Struggles with simple counting/arithmetic
- Token-by-token computation limits
- Fixed knowledge from training data
- No true understanding or consciousness

## Working Memory vs. Knowledge
- **Context Window**: Working memory (active information)
- **Model Parameters**: Long-term knowledge (like memories)
- Best results when relevant information is in context window

## Practical Usage Tips
1. Always verify important information
2. Use as a tool, not an oracle
3. Provide clear, specific instructions
4. Break complex tasks into smaller steps
5. Leverage tools when available (code interpreter, web search)

## Future Developments
- Multimodal capabilities (text, audio, images, video)
- Longer-running agents
- Better tool use and planning
- Improved reasoning capabilities
- More integrated into everyday tools

## Available Models
- **Commercial**: ChatGPT (OpenAI), Gemini (Google), Claude (Anthropic)
- **Open Source**: DeepSeek, Llama (Meta)
- **Platforms**: Together.ai, HuggingFace, local installations

---
*Note: This field is rapidly evolving. Information current as of early 2025.*
