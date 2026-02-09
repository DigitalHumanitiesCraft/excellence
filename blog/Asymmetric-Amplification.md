---
layout: post
title: "Asymmetric Amplification. Why AI Does Not Automate Research — But Disruptively Amplifies Computer-Based Research Work"
author: "Christopher Pollin"
date: 2026-02-09
published: true

# Spezifische Metadaten für diesen Post
citation:
  type: "blog-post"
  container-title: "Digital Humanities Craft"
  URL: "https://dhcraft.org/excellence/blog/Asymmetric-Amplification"
  language: "en"
  abstract: "The leading AI labs are developing their frontier large language models with the explicit goal of automating research. This text argues that what these systems actually do is qualitatively different, but no less disruptive. They do not automate research. They massively amplify computer-based research work, and this amplification is deeply asymmetric. Those who can judge quality, who understand their data and their domain, and who have access to frontier models and the infrastructure behind them, gain disproportionate leverage. Those who cannot are left behind. The text is structured as a workshop for researchers who want to work productively and critically with frontier LLMs."

dublin_core:
  creator: "Christopher Pollin"
  publisher: "Digital Humanities Craft"
  subject: ["Applied Generative AI", "LLM", "Digital Humanities", "Promptotyping", "Context Engineering", "AI Literacy", "Research Methodology"]
  description: "The leading AI labs are developing their frontier large language models with the explicit goal of automating research. This text argues that what these systems actually do is qualitatively different, but no less disruptive. They do not automate research. They massively amplify computer-based research work, and this amplification is deeply asymmetric. Those who can judge quality, who understand their data and their domain, and who have access to frontier models and the infrastructure behind them, gain disproportionate leverage. Those who cannot are left behind. The text is structured as a workshop for researchers who want to work productively and critically with frontier LLMs."
  type: "Blogpost"
  format: "text/html"
  rights: "CC BY 4.0"
  language: "en"

coins_data:
  rft_type: "blogPost"  # Standard COinS Format

website_title: "Digital Humanities Craft"
website_type: "Blog"
short_title: "Asymmetric Amplification"
abstract: "The leading AI labs are developing their frontier large language models with the explicit goal of automating research. This text argues that what these systems actually do is qualitatively different, but no less disruptive. They do not automate research. They massively amplify computer-based research work, and this amplification is deeply asymmetric. Those who can judge quality, who understand their data and their domain, and who have access to frontier models and the infrastructure behind them, gain disproportionate leverage. Those who cannot are left behind. The text is structured as a workshop for researchers who want to work productively and critically with frontier LLMs."

schema_type: "BlogPosting"
keywords: ["Applied Generative AI", "LLM", "Asymmetric Amplification", "Promptotyping", "Context Engineering", "AI Literacy", "Critical Expert in the Loop", "Research Methodology", "Frontier Models"]
---

![][image1]

This text is based on a workshop ([slides](https://docs.google.com/presentation/d/1b-zJ8hyv7FhHXzR5HjMcp2kEtU2WhqCd_cugsMrPdjg/edit?usp=sharing)) held at the Vienna Institute for International Economic Studies (wiiw), an economic research institute focused on Central, East, and Southeast Europe, in February 2026\. It preserves the workshop's alternating structure of theoretical introductions, hands-on exercises, live demonstrations, and discussion blocks. It reads accordingly — more like a guided session than a linear argument.

### Abstract

The leading AI labs are developing their frontier large language models with the explicit goal of automating research. This text argues that what these systems actually do is qualitatively different, but no less disruptive. They do not automate research. They massively amplify computer-based research work, and this amplification is deeply asymmetric. Those who can judge quality, who understand their data and their domain, and who have access to frontier models and the infrastructure behind them, gain disproportionate leverage. Those who cannot are left behind.

The text is structured as a workshop for researchers who want to work productively and critically with frontier LLMs. It opens with a political and institutional framing of the current AI landscape, including the concentration of infrastructure, the European position, and the arms race dynamic between the US and China. A technical foundation covers transformer architecture, embeddings, context windows, and the limitations that make LLMs “jagged, alien intelligences” rather than reliable reasoning systems. A hands-on exercise applies these concepts to a research dataset on international patent cooperation, introducing three competence layers that build on each other: *Computer Literacy*, *Computational Thinking*, and a newly introduced *Informed Vibe Coding*. The text then presents *Promptotyping*, a methodology for the systematic, researcher-centred creation of research tools and workflows using frontier LLMs and *Context Engineering*. Two use cases demonstrate the methodology, one with a domain expert evaluating outputs, one without, using *Deep Research* to approximate missing expertise. The central claim is that the *Critical-Expert-in-the-Loop* is not a safeguard added after the fact but a structural necessity without which these systems produce plausible but unverifiable outputs.

## **“*The big goal that we are working towards is automating research*” (Jakub Pachocki \- OpenAI’s chief scientist)**

I want to start with a provocation. Since at least December 2025, we can observe that the major tech companies, OpenAI, Google, and Anthropic, are actively working toward automating research. And I do not mean this as a vague aspiration. It is their primary strategic goal. Research is one form of knowledge work, arguably among the most demanding. But the business model, as I read it, only works if the automation of knowledge work succeeds broadly, not just in research. The investments being made, *Stargate*[^1], Manhattan-sized data centers[^2], the massive infrastructure buildout in the United States, these are billions that can only be recouped if these systems actually replace significant parts of human knowledge work.

What does automating research mean concretely? These companies are building autonomous research systems that develop the next architecture, optimize themselves, generate and evaluate their own training data. The models are meant to improve themselves. To get there, they need to be extraordinarily good at programming, at mathematics, and at operating as autonomous agents in digital environments. These are exactly the capabilities that, as a side effect, massively transform computer-based research work across disciplines. Coding, data analysis, literature synthesis, formal reasoning — the path to ML self-optimization runs directly through the core tasks of contemporary research. This does not mean these systems have achieved full automation. But the progress toward that goal is already producing capabilities that fundamentally change how computer-based research is done.[^3]

This sounds like science fiction, and many in the scientific community and in the media dismiss it as hype. I want to be explicit about my position. As someone who has worked on this topic essentially full-time for two to three years, who reads the research, uses the tools daily, and builds workflows with them, I see far more evidence and indicators pointing toward this trajectory than against it. Since January 2026, my own work has changed structurally. I use Claude Code and Obsidian*[^4]* to orchestrate multiple research projects in parallel. Software tools that would have taken weeks to build now take days. I have shifted from executing to orchestrating. I notice this so acutely because my daily work sits exactly where these models are being optimised, at the intersection of programming, research, and workflow development. These are precisely the tasks that frontier LLMs amplify most. This is the asymmetry in practice.

Here is a partial list of what has happened in recent weeks alone. On February 5th[^5] Anthropic released **Claude Opus 4\.6**[^6] with a one million token context window (in the API only) and *agent teams*, coordinated multi-agent systems that split complex tasks across parallel workers. OpenAI released **GPT-5.3-Codex**[^7], which according to the company debugged its own training runs and managed its own deployment. Claude Opus 4.6, during testing, independently identified over 500 previously unknown zero-day vulnerabilities in open-source libraries without task-specific tooling, custom scaffolding, or specialized prompting. GPT-5.3-Codex is the first OpenAI model classified as “high capability risk” for cybersecurity.[^8] This is not hypothetical. Anthropic has documented the first reported case of a large-scale cyberattack executed largely without human intervention, using Claude Code as the operational tool.[^9] These are not research previews but shipping products.

OpenAI has built a specialised **in-house data agent for data analysis**. Scaled, multi-agent systems with sufficient compute are working systems. **PRISM**[^10] is a free LaTeX workspace for scientists, and it is not a gift. It is a strategy, as I interpret it, to collect data on how researchers work, to train models that can simulate research workflows. The same logic applies to **Claude Code**: it is built to better understand how software developers work, generating training data to improve Anthropic's agentic coding tools that are already transforming how software gets built. And Claude Code is, in my opinion, insanely good at amplifying my work, not only as a software developer but as a researcher. It is a general-purpose agentic tool that happens to work through code.

Now, the statements from the CEOs. And here we need to talk about grey zones. There is Elon Musk, who is using Grok to rewrite history through *Grokipedia*[^11], who is exerting political influence in the Trump administration, and who represents a concrete example of what happens when LLM infrastructure is controlled by someone with an authoritarian agenda. This must be named and it must be opposed.

And then there are people like Dario Amodei[^12] and Demis Hassabis[^13], whose engagement with the risks I take seriously. Their public communication is notably more differentiated. **Amodei's essay “The Adolescence of Technology”**[^14] is a serious attempt to think through the risks. In the Davos[^15] discussion, both Amodei and Hassabis were explicit about this dynamic. They would be happy if the pace of development slowed down, but they cannot slow down, because if they do, the others move ahead. And by “the others” they mean competing companies, but ultimately China. We are in an AI arms race between two countries, and everyone else is caught in between.[^16] All of them, including the leading companies themselves, are caught in a self-accelerating dynamic that no single actor controls anymore. This is, functionally, a form of singularity. Not in the science fiction sense, but in the sense that the process has escaped individual control.

But what is actually happening is more nuanced than “automating research”. These systems do not automate the research process. They **massively amplify computer-based research work**, everything that happens on a screen, with data, with code, with text, with literature. And this amplification is deeply asymmetric. Those who can judge quality, who have access, who have the resources and the competence to work with these systems, gain an enormous advantage. Those who do not are left behind. This is not primarily a democratizing technology. It is an amplifier of existing asymmetries. And as of early 2026, this infrastructure, the models, the compute, the tooling, is controlled by an oligopoly of US and Chinese Big Tech companies. The political dimension of this concentration is real and growing.[^17]

This is the framing for everything that follows today. We are not here to celebrate these tools. We are here to understand them, to use them critically and productively, and to build the competencies that allow us to remain agents in this process rather than consumers of it. We are forced to engage with these systems, because the *Tech Bros*[^18] are building something like “AGI”.[^19]

## **The European Position**

So where does Europe stand in all of this? European alternatives exist. Mistral[^20] from France is a serious company delivering solid mid-tier models. And what Mistral represents is actually what we (and I want to emphasise this European “we”\!) should want: a sovereign infrastructure where we control the full stack, the hardware, the data, the models, the tooling, and where we can ensure transparency, ethical standards, ecological responsibility, and regulation.

But the honest assessment is that Mistral is only a mid-tier and no frontier model producer. Europe has nothing that is capable of competing at the frontier, and not the AI infrastructure to do so in the coming years. The common counterargument, that Europe is strong in specialised and domain-specific models, does not address the central point. There are attempts like *Aleph Alpha*[^21] from Germany or *Apertus[^22]* from Swiss AI, which may work for specialised, narrow domains. There may well be other European models I am not tracking. And yes, these should be explored and applied where they fit. But there is a critical distinction here, and it comes from Andrej Karpathy. The difference between LLMs as natural language processing tools and LLMs as something like an operating system.[^23] European models can function as NLP tools, for translation, text analysis, domain-specific tasks. But frontier models have become something qualitatively different. They are the foundation for AI Agents[^24], for coding assistants, for multi-agent workflows. In that category, Europe has some mid-tier products, and it is an open question whether they can keep competing or whether the gap is widening.

The EU AI Act[^25] exists, and regulation matters in principle. Since February 2025, it requires organisations to ensure adequate AI literacy for staff working with AI systems. This is the right impulse. But as someone who has engaged with it extensively, I have not yet seen concrete added value from it for researchers working with LLMs. It regulates risk categories at such an abstract level that it provides essentially no practical guidance for someone who wants to work with an LLM tomorrow. Even the research exemptions rely on distinctions that do not capture the realities of contemporary AI research.[^26] It does not help you decide which model to use, how to handle your data, or what to disclose. In the roughly 150 workshops I have held in recent years, not a single person has told me that the AI Act concretely helped them do anything. Regulation without operational guidance is not yet governance. And regulation without infrastructure is not sovereignty.

Then there are the open-weights models that can be self-hosted, and in principle, we should all be doing this. DeepSeek[^27], Qwen[^28] or Kimi[^29] from China, these are capable models. But self-hosting comes with real costs. Running a frontier-class open-weights model like DeepSeek-R1 with 671 billion parameters requires eight to ten H100 GPUs, around $250,000 in hardware alone, excluding server infrastructure, networking, and cooling.[^30] These estimates assume a realistic production scenario where a team of researchers needs fast inference with concurrent access, not a single user running occasional queries. Smaller setups are possible, but they come with slower inference and limited concurrent usage. Cloud rental for equivalent capacity runs between $10,000 and $25,000 per month depending on provider and utilisation. DeepSeek's newer models, V3.1 and V3.2, use the same architecture and parameter count. V4, expected in mid-February 2026, may reduce hardware requirements through architectural innovations, but the fundamental cost structure remains. Open-weights models will be significantly more capable and cheaper to run within the next year. But frontier proprietary models will likely still be ahead by a meaningful margin, because the leading labs are investing at a scale that open-weights development cannot match.

So what is the most effective response? I do not know. To be honest, I feel quite lost. Building sovereign infrastructure requires the full stack. Compute, data, models, tooling. Europe is behind on all four. This is expensive, it is slow. I believe part of the answer is building competencies, AI literacies, on two levels simultaneously. First, the ability to work with local infrastructure and open-weights models, understanding what self-hosting means, what it costs, and what it enables. Second, the ability to work critically and productively with frontier models, because they are in a different category. And notably, frontier models can help you build your local infrastructure.

## **“Understanding” LLMs & Tooling Overview.**  **AI ≠ ChatGPT ≠ Frontier-LLM ≠ LLM ≠ Open Source ≠ Open Weights**

A core part of AI literacy is understanding what large language models actually are. And the first step is clearing up what they are not. They are not fancy autocomplete. They are not stochastic parrots[^31] anymore, although GPT-3 in 2020 arguably still was one. But they are also not "AI" in the magical, general sense that the term suggests in public discourse. There is no single "the AI". There are many different systems, architectures, and implementations, and we need to be much more precise in how we talk about them.

This is what the inequality chain expresses. AI is not the same as ChatGPT. ChatGPT is not the same as a frontier LLM. A frontier LLM is not the same as any LLM. An LLM is not the same as open source. And open source is not the same as open weights.[^32] Each of these distinctions matters. When someone says “I tried AI and it did not work”, the first question is: which system, which model, which version, which subscription tier, which context, which prompting strategy? These are not interchangeable.

What we are dealing with is something that Ethan Mollick has described through the concept of the “jagged frontier”[^33] and that Christopher Summerfield calls “strange new minds”.[^34] These systems are extraordinarily capable at some tasks and surprisingly fragile at others, and the boundary between capability and failure is unpredictable and often counterintuitive. Not intelligent in the way we are. Not unintelligent either. Something fundamentally different. I refer to them as  **“jagged, *alien* intelligences”**.

And this is exactly why understanding the foundations matters. If you work with these systems through prompting, through conversation, through data analysis, then knowing how they function internally changes how you interact with them. You learn to construct better contexts for these models. You learn to recognize how and where these systems fail. You develop an intuition for why structured input produces more reliable output than isolated instructions. You stop anthropomorphizing and start engineering. But engineering is not entirely the right word either. As the philosopher Markus Gabriel[^35] points out, these systems function as something like “magic mirrors”, extraordinarily good at simulating human communication. They are not tools in the traditional sense, and they are not agents. The familiar oppositions — intelligent versus unintelligent, tool versus agent, reliable versus unreliable — do not capture what is happening. 

## **Next Token Prediction, Transformer, Token / Tokenization**

Large Language Models are fundamentally based on **next token prediction**. The model computes a probability distribution over possible next tokens given a specific context. This is illustrated by the neural network diagram: given “cat sat on a”, the model predicts "mat" with 97% probability.

{{folie einfügen}}

But context changes the prediction. If the context is “*Christopher is sitting at his desk, programming, the cat sat on the*”, the next token might be “*keyboard*” rather than “*mat*”. The **Transformer architecture**[^36] enables this by processing the relationships between all tokens in the input simultaneously. This produces something that functions like “understanding” of context. The quotation marks around “understanding” are deliberate. Whether this constitutes understanding in any meaningful sense is a deep question we cannot resolve here.[^37] For our purposes, the functional description is sufficient: the model relates all tokens to each other and uses these relationships for prediction. The attention mechanism will become relevant again when we discuss the context window.

The key insight is that this simple mechanism does not stay simple when scaled. The path from GPT-2 (1.5B parameters) to GPT-3 (175B) to GPT-4 shows this. The architecture remained the same, but adding more data and compute produced what the philosopher David Chalmers has called “weakly emergent” capabilities, distinguishing them deliberately from strong emergence. Whether these are genuinely emergent or an artifact of how we measure performance is still debated (Schaeffer et al., 2023). The **scaling laws** (Kaplan et al., 2020\) formalized the relationship between compute, data, parameters, and performance. This connects directly to why we called LLMs “jagged, alien intelligences” earlier: the gap between the simplicity of the mechanism and the complexity of the behavior is what makes these systems difficult to reason about.

**Tokens** are the atomic units of this process. They are not words, not characters, but subword segments determined by the tokenizer. “*Hello World*” becomes three tokens across twelve characters and “*hello*” is a single token. Ask Claude to spell “hello”. It will succeed. But the point is not whether it can, but how. When the model spells correctly, it does so through learned internal representations, not through the character-level procedure a human performs. Anthropic's research on the internal mechanisms of Claude 3.5 Haiku has shown that even simple tasks involve surprisingly complex internal circuits — chains of features that interact in ways their developers did not design and do not fully understand.[^38] The right output, produced through a fundamentally different process. And when the process fails, the model has a second path available. It can write code that spells correctly, solving through tool use what its native architecture handles differently than we do.

## **Pre-Training, Post-Training, Embeddings**

Where does the model's contextual “understanding” come from? From pre-training. Andrej Karpathy describes pre-training as something like “**zipping the internet”**.[^39] You take vast amounts of text data and compress the information into a model. This is lossy compression. The model does not store texts word for word, sentence for sentence. It stores what Karpathy calls the **“Gestalt”** of these texts and can reproduce variations when specific areas in the model are activated.

This compression is not uniform. Frequent patterns are represented more stably than rare ones. Ask the model for the first sentence of Harry Potter and it works, because that sentence is quoted thousands of times in the training data. Ask it to spell an invented word and it may still succeed, but less reliably, because it has to fall back on generalized procedures rather than memorized solutions. Ask it for the 16th sentence on page 42 of a specific book and it will almost certainly fail, because that information is not stored as an addressable fact. Page numbers are not stable across editions, and the model has no index. The model's reliability maps directly onto the density of its training data, but learned procedures can partially compensate where memorized patterns are absent.

However, and this is important, the model can **use tools** to compensate not just for procedural limitations but also for gaps in its training data. It can search the web, retrieve documents, extract text from specific sources, and bring that information into its context window. This is what Retrieval Augmented Generation (RAG), tool use, and agentic workflows are about. The boundary of the model is not the boundary of the system.

{{folie einfügen}}

**Pre-training[^40]** is the phase that requires enormous energy, data, and compute. As a rough approximation, pre-training is where the model acquires its general capabilities. What exactly is stored in the process — whether it deserves the label "knowledge" — is debatable.

**Post-training** transforms a raw model into a specialized one. A chatbot, a coding model, a reasoning model. This is the phase where the model's behavior is shaped, including its tone, its safety boundaries, its ability to follow instructions. RLHF (Reinforcement Learning from Human Feedback), introduced prominently with InstructGPT and ChatGPT, is one key technique. As a rough approximation, post-training is where the model acquires specific skills. And it is becoming increasingly important. The performance differences between models of similar size often come down to post-training quality, not architecture.  
A concrete example of what post-training can look like is Anthropic's approach to Claude’s “character”.[^41] Rather than simply training the model to avoid harmful outputs, Anthropic publishes a detailed constitution that describes intended values and behavior. These values are trained into the model using a variant of **Constitutional AI**, where Claude generates, evaluates, and ranks its own responses against defined character traits. The result is not a set of fixed rules the model follows but a disposition that shapes how it responds across contexts. This is worth understanding because it illustrates a general point about post-training. It does not just add capabilities. It shapes what kind of system the model becomes.

Now, the areas in the model that get activated, these are the **embeddings**. For every token, “*dog*”, “*cat”*, “*stone”*, a vector is created in a multivector space with tens of thousands of dimensions. No single embedding describes the semantics of a token in isolation. What defines meaning is the distance to all other embeddings. “*Dog*” and “*cat*” cluster together because they share characteristics derived from the training data: they appear in similar contexts such as biology, children’s books, veterinary texts. They have four legs, have fur, are living beings. “*Stone*” is clustered elsewhere because it does not live for example.

{{folie/bild  einfügen}}

Consider the classic example. “*King*” minus “*Man*” plus “*Woman*” approximately equals “*Queen*”. This suggests that dimensions in the embedding space encode something like thematic directions, where the distance between “*King*” and “*Queen*” mirrors the distance between “*Man*” and “*Woman*”. But this is a simplification. Embeddings are polysemous. The token “*Queen*” is pulled simultaneously toward monarchy, toward the band Queen, toward drag culture, and the surrounding context determines which associations dominate. Anthropic’s research on internal model mechanisms provides evidence that such contextual associations correspond to identifiable feature circuits, distributed across the network’s layers. This has a direct practical consequence. “*The King doth wake tonight and takes his rouse…*” activates feature circuits associated with Shakespearean language and early modern political contexts. The same content in normalized modern English would activate different circuits, producing different outputs. Small changes in formulation shift which internal pathways the model follows. This is **prompt brittleness[^42]**, and it will be directly relevant in the hands-on exercise.

François Chollet, who is notably skeptical of LLM capabilities, describes what happens in the latent space as **“vector programs”**[^43] being activated and applied to data. He designed the **ARC-AGI** benchmark specifically to test what LLMs supposedly cannot do, namely abstraction and generalization to novel patterns. It is worth noting that current frontier models are performing increasingly well on exactly this benchmark.[^44] This does not necessarily mean they are truly abstracting. There may be other explanations. The researcher who constructed one of the hardest tests against LLM capabilities is seeing his benchmark increasingly solved. What this means remains open. It may be genuine abstraction, it may be sophisticated benchmark optimization, or, if the optimization succeeds across all relevant benchmarks simultaneously, the distinction may lose its meaning.

## **Context Window and Context Rot**

The context window is the “short-term memory” of the model. Everything the model “knows” during a conversation exists in this fixed amount of tokens that can be processed. You cannot teach the model anything outside of it. Fine-tuning changes model weights but is a separate process that happens before deployment. RAG, tool use, and memory features are all Context Engineering methods whose function is to bring information into the context window. Even memory features, as of today, are injections into the context window, not persistent changes to the model. In a chat, there is only the context window. However, active research on continual learning and persistent memory mechanisms may change this in the coming years.[^45]

Models can have different context window sizes. You need to know which model you are using and what your specific subscription provides. Claude Opus 4.6 has a one million token context window in beta, available through the API and Claude Code. In the chat interface on claude.ai, the standard 200K window applies. So you also need to know the differences in subscriptions and access methods. Claude Opus 4.5 had 200,000 tokens.[^46] One million tokens is roughly 1,500 pages of text, depending on text density and language.

{{folie einfügen}}

The diagram shows a simplified example with an 8K token window. If we input 6,000 tokens and the model generates 1,500 tokens of output, everything fits. But if we have already accumulated 10,000 tokens in our conversation, the older tokens at the top are no longer in the window. The model may still behave as if it knows about them, because it can extrapolate plausible continuations from the remaining context. But this is not knowledge, it is prediction. This connects directly to hallucination. The model generates coherent-sounding output about information it no longer has access to. This is why long conversations become unreliable and why critical verification matters most precisely when the conversation feels fluent.

Anthropic has introduced **Context Compaction[^47]** for Claude models and Claude Code. When a conversation approaches the window limit, the system automatically summarizes older parts of the context rather than simply truncating them. This enables effectively longer conversations without hard cutoffs. But the fundamental principle remains. The context window is finite, summarization is lossy, and managing what goes into the window is the single most important practical skill when working with these systems.

**Context Rot[^48]** adds another dimension to this problem. As the context window fills up, overall model performance degrades, regardless of where the information sits. It is not just that information gets lost. The model gets worse at processing all of its input as the total volume increases. The practical implication is straightforward. Always aim for maximum information with minimum tokens. And use one conversation for a single complex task.

What does this mean in practice? Uploading an Excel spreadsheet is expensive in tokens because XLSX is internally a complex XML document. The same tabular data as CSV uses a fraction of the tokens and is parsed more reliably. Always convert to CSV before uploading. Uploading a 200-page PDF is even more problematic. The model does not process the PDF as we see it. PDF is a layout format, not a text format. There is no guaranteed reading order, tables have no structural markup, and scanned pages are images without text. Even with vision capabilities, structural information is lost. For research data, structured plain text formats (CSV, Markdown, JSON) are always preferable. This is one aspect of Context Engineering.

## **Limitations of LLMs**

Let us summarize what we have learned about these systems by looking at their limitations. And the first thing to understand is that hallucination, or more precisely confabulation, is not a bug. It is the fundamental operating principle of the Transformer architecture. The model generates plausible continuations, always. It cannot not hallucinate. This often produces correct results, but there is no internal mechanism for genuine verification. It operates more like Kahneman's System 1, fast, intuitive, pattern-based, than like System 2, slow, deliberate, logical. Or perhaps it is something in between, maybe some kind of System 1.42[^49], which is part of what makes it so difficult to categorize.

**Sycophancy**[^50] is a limitation that is particularly relevant for research. If you ask a model “*give me feedback on my paper*”, you will get constructive, encouraging feedback, because the model tends to reinforce the direction you are on. If you ask “*give me critical feedback*”, you may get better feedback. But if your paper was already good, the model might fabricate criticism that does not exist. This is not sycophancy in the strict sense but a related problem. The model follows the instruction to be critical and generates plausible criticism, even where none is warranted. In both cases, prompt formulation shapes the output, and a single interaction is never sufficient for evaluation. Sycophancy is one instance of a broader problem. These models carry **biases** from their training data, from post-training, and from reinforcement learning from human feedback. For researchers working with cross-country data, this means that dominant perspectives in the training corpus, primarily English-language and Western, may shape analytical framings in ways that are not immediately visible.

The systems are **non-deterministic** by design. The same prompt produces different outputs because of temperature settings and sampling strategies. Different areas in the latent space get activated. This is useful for creative tasks but problematic for reproducibility. However, deterministic components can be introduced through tool use, where code execution always returns the same result for the same input.

**Spatial and temporal “reasoning”** remains a fundamental limitation. Yann LeCun's recurring argument that current AI systems lack the physical-world understanding of a cat[^51] highlights a qualitative gap between processing text or images and reasoning about space, gravity, and temporal dynamics. The development toward world models is an active research frontier, though approaches diverge sharply between generative video prediction (e.g. Google’s Genie 3[^52]) and abstract representation learning (e.g. LeCun's JEPA architecture[^53]).

**“Reasoning” and “thinking”** in these models exists, but it is not what it looks like. Through “thinking” tokens and **test-time compute[^54]**, models can extend their processing before producing a final answer, assembling something like programs from their latent space. But whether this constitutes genuine reasoning or is a sophisticated form of pattern retrieval is an open question.

The **knowledge cutoff** means that model weights are frozen after training. The model has no access to new information and does not reliably “know” what it does not know. Web search and RAG compensate partially, but they introduce new quality issues: the model cannot verify whether it found the best sources.

And finally: there is **never an internal mechanism that verifies outputs**. Models have **self-consistency**, they can “look back” at the tokens they have generated and evaluate whether something seems coherent. This improves results in practice, and prompting for self-reflection is good practice. But self-consistency is not verification. The model hallucinates its evaluation of its own hallucination. Ultimately, and this is a didactic simplification, all outputs are something like Schrödinger's cat. They are hallucinated, but they can be correct. Their value only emerges when someone looks, when an expert evaluates them. This is why an expert-in-the-loop is not a nice-to-have, it is a structural necessity.

## **LLMs as Retrieval-ish Systems**

What are LLMs actually doing? Three researchers, all serious voices in the field, offer answers that converge in a similar direction but with different levels of radicality.

François Chollet describes LLMs as "stores of knowledge and programs" that have stored patterns from the internet as vector programs. When you query an LLM, you retrieve a program from latent space and run it on your data. The model can interpolate between these stored programs, which is why it often produces surprisingly good results. But it cannot deviate from memorized patterns, and generalization is patchy: it fails at genuinely unfamiliar scenarios. In Chollet's framing, prompt engineering is essentially searching for the best "program coordinate" in latent space. Chollet is notably skeptical of LLM capabilities, and yet his ARC-AGI benchmark, designed to test exactly what LLMs supposedly cannot do, abstraction and generalization, is being increasingly solved by frontier models. This does not settle the debate, but it shifts the burden of proof.

Sepp Hochreiter takes a more reductive position. For him, a large language model is a database technology, not artificial intelligence. It grabs all human knowledge in text and code and stores it. Current reasoning is just "repeating reasoning things which have been already seen". The model cannot create genuinely new concepts or reasoning approaches. Hochreiter is developing xLSTM as an alternative architecture, which means his critique is also a research program.

Subbarao Kambhampati describes LLMs as "n-gram models on steroids doing approximate retrieval, not reasoning". The reasoning we observe is pattern matching that breaks when inputs are obfuscated and needs external verifiers. This connects directly to our previous point about verification and the expert-in-the-loop.

\[\[Abbildung einfügen\]\]

Now look at the diagram on the right. It shows humanity's knowledge as a closure, with procedural and propositional knowledge, common sense, and at the boundary, new discoveries. The critical question for this workshop and for the automation of research that we discussed on slide 2 is: can these systems reach beyond the boundary? Can they produce genuinely new knowledge, or can they only recombine what is already inside the closure?

The honest answer as of early 2026 is: we do not know. The evidence points toward powerful interpolation within known patterns, with occasional results that look like they cross the boundary but may not. For your work as researchers, the practical implication is clear: these systems are extraordinarily powerful for exploring, recombining, and operationalizing existing knowledge. Whether they can extend it is an open question. We will come back to this in the final discussion.

## **Data and LLMs: Getting 138.000 Rows of Binary Data into a Context Window**

Now we move from theory to practice. And we start with a problem that connects directly to what we just discussed about the context window and context rot. I have a dataset on international patent cooperation. It contains roughly 138.000 rows, around 60 countries, time range 2000 to 2018\. It is a weighted edge list with firms cooperating across national borders, with a cooperation frequency per year. A classic research dataset for network analysis.

But there are two problems. First, the data is stored as an RDS file, which is R's native binary serialisation format. No LLM can read this. Not Claude, not ChatGPT, not Gemini. Not even if the file were tiny. It is not a text format. You cannot paste it into a chat. This is a practical limitation that many researchers encounter immediately. Your data exists in a format that the model cannot process.

Second, even if I converted the data to CSV, 138.000 rows would consume a massive portion of the context window. Remember what we said about context rot. As the context fills up, overall performance degrades. If I upload the entire dataset, the model is already degraded before the analysis even begins. The data would dominate the context, leaving little room for the actual analytical conversation.

So what is the strategy? Do not upload the data. Upload the question. Describe the dataset to the model. The column names, the data types, the number of rows, a sample of 15 to 20 rows. This gives the model everything it needs to write code, without filling the context window with data the model cannot meaningfully process row by row anyway. Then let the model write R code or Python code that you run locally on the full dataset. This is Context Engineering in practice: maximum information with minimum tokens.

And here is a detail that illustrates the jagged intelligence we discussed earlier. When I uploaded the RDS file to Claude Opus 4.6, the model could not install pyreadr because it had no network access in the sandbox environment and no access to R. So what did it do? It wrote its own RDS parser in Python from scratch, reverse-engineering the binary format to extract the data. The right output, produced through a fundamentally alien process. This is not how a human would solve this problem. A human would install the package or open the file in R. The model found a different path, and it worked.

## **“I Did an R Course 10 Years Ago”. How Frontier-LLMs Change What "Knowing How to Code" Means**

I took an R course roughly ten years ago. I learned the basics of RStudio, enough to know what the environment looks like and how R scripts work. Then I did not touch R again for a decade. My daily tools are Python and command line environments. I had never heard of tidyverse or ggplot2 before preparing this workshop. When I sat down to build this exercise, I was not working from fluency, not even from rusty fluency. I was working from a basic orientation in the environment and nothing more.

And yet, within minutes, I had a working analysis environment. The first attempt failed because tidyverse was not installed. The second attempt failed because the file path was wrong. Classic problems, nothing exotic. But I knew what to do with these errors. Not because I remembered the exact R syntax, but because I have enough foundational understanding of how software environments work. I know that packages need to be installed before you can use them. I know that file paths can be relative or absolute. I know what an error message is telling me, even if I do not immediately know the solution. So I copied the error message back into the chat, Claude gave me the fix, I applied it, and we moved on to the next problem.

There are three layers here. The first is Computer Literacy, the basic operational understanding of how computers, files, software, and environments work. The second is Computational Thinking, the ability to decompose a problem, to recognise patterns, to evaluate whether a proposed solution makes structural sense. And the third, the new layer, is what I call Informed Vibe Coding. The practice of working iteratively with a frontier LLM, staying critical, not trusting outputs blindly, but systematically collaborating with the model to solve problems that neither you nor the model could solve as efficiently alone.

The critical point is that the third layer does not replace the first two. It builds on them. Without Computer Literacy, the first error message is a dead end. You do not even know what it is telling you. Without Computational Thinking, you cannot evaluate whether the model's proposed solution makes sense. With both, every error message becomes the next step in an iterative process. The model does not replace your skill, it amplifies whatever skill you already have. If you have a solid foundation, even a rusty one, the amplification is enormous. If you have none, there is nothing to amplify.

## **Hands-On: Explore the Patent Cooperation Network**

You have the dataset, you have the research question, and you have access to a frontier LLM. What can it do for you?

Here is what I want you to do, and I want to be explicit about the workflow, because the workflow itself is the lesson. Do not just use the tool. Observe yourself using the tool. Notice where it works, where it fails, and where you need to intervene.

Step one. Open RStudio and load the dataset. readRDS, glimpse, head. Three lines of code. If tidyverse is not installed, install it. If the file path is wrong, fix it. If you get an error, you now know what to do with it.

Step two. Copy the output of glimpse and head into Claude, or into ChatGPT, whichever you are using. Add the research question. How do international patent cooperation patterns evolve over time, and which countries occupy central positions in the cooperation network? Ask the model to write R code for an exploratory analysis using tidyverse and ggplot2. Notice what you are doing here. You are not uploading the data. You are uploading a compressed description of the data. This is the Context Engineering strategy we discussed.

Step three. Take the generated code and run it in RStudio. If it produces an error, copy the error back into the chat. Error, paste, fix, run, repeat. This is the iterative loop.

Step four. Once the basic analysis runs, start asking follow-up questions. Which country pairs cooperate most frequently? How has this changed over time? Can you visualise the top countries as a network? Each follow-up prompt generates new code, and each result opens new questions.

Step five, the most important one. Pick one result, one number, one visualisation, one claim that the model makes about the data, and verify it manually. Look at the actual data in RStudio. Does the number match? Are the axis labels correct? Did the model make an assumption you did not ask for? This is where you are the Critical Expert in the Loop.

The following prompt was used in the workshop to initiate the hands-on exercise. It illustrates the Context Engineering strategy discussed above. Instead of uploading the full dataset, the prompt provides a compressed description, column names, data types, a sample of rows, and the research question.

I have a dataset on international patent cooperation as a weighted edge list.

**Here is the structure:**

\`\`\`  
glimpse(df)  
Rows: 137,990  
Columns: 6  
$ year\_application \<dbl\> 2013, 2011, 2017, 2018, 2011, 2010, 2016, 2012…  
$ owner1           \<chr\> "QA3470001011260", "AT1341110434146", "SG00084…  
$ country\_1        \<chr\> "QA", "AT", "SG", "SA", "DK", "DE", "SK", "FI"…  
$ owner2           \<chr\> "IN6180001080984", "MC5012401013038", "JP14821…  
$ country\_2        \<chr\> "IN", "MC", "JP", "LI", "BY", "GR", "CN", "EG"…  
$ weight           \<dbl\> 5, 4, 4, 5, 2, 3, 2, 3, 3, 2, 8, 2, 4, 3, 3, 5…  
\`\`\`

**Here are 15 sample rows:**

\`\`\`  
\> head(df, 15\)

    year\_application          owner1 country\_1          owner2 country\_2

               \<num\>          \<char\>    \<char\>          \<char\>    \<char\>

 1:             2013 QA3470001011260        QA IN6180001080984        IN

 2:             2011 AT1341110434146        AT MC5012401013038        MC

 3:             2017     SG000849327        SG    JP148214588L        JP

 4:             2018    SA132902414L        SA       LIKR75683        LI

 5:             2011    DK6070518285        DK    BY164180403L        BY

 6:             2010    DE169362426L        DE      GR91004103        GR

 7:             2016    SK\*863000131        SK CN2001110378525        CN

 8:             2012    FI8330385155        FI      EG91902435        EG

 9:             2016     NOB73805731        NO      ZA28950255        ZA

10:             2012    CZ126368579L        CZ EG1101113676660        EG

11:             2010      LT17108431        LT KY8250005001432        KY

12:             2012 TH1101113479494        TH    HK277888337L        HK

13:             2013 MD5011201005245        MD FR6010905002126        FR

14:             2013     NZ384449773        NZ    FR135642846L        FR

15:             2016    SE3190220743        SE CW1101114952093        CW

    weight

     \<num\>  
 1:      5  
 2:      4  
 3:      4  
 4:      5  
 5:      2  
 6:      3  
 7:      2  
 8:      3  
 9:      3  
10:      2  
11:      8  
12:      2  
13:      4  
14:      3  
15:      3  
\`\`\`

\~138.000 rows, \~60 countries, time range 2000–2018.

Research question: How do international patent cooperation patterns evolve over time, and which countries occupy central positions in the cooperation network?

Write R code using tidyverse and ggplot2 for an exploratory analysis.

## **Let the Model Check Its Own Work. But Know What It Can and Cannot See.**

Let me show you what happened when I ran this exercise myself. I generated the analysis, I got the plots, everything looked clean. Then I did something that I want you to start doing as a habit. I asked the model to evaluate its own results. I simply asked, does this make sense?

Claude, in a separate conversation where it had no information that the dataset was synthetic, immediately identified the data as likely synthetic or heavily noised. It pointed out that the Top 10 countries (Taiwan, Poland, Ukraine, Hong Kong, Qatar, Sweden) do not match real patent cooperation patterns, where you would expect the United States, Germany, Japan, China, and South Korea to dominate. It flagged that the distributions were too uniform, that real cooperation networks show power-law structures with a few dominant hubs and many peripheral nodes. It noticed that the partner diversity across top countries was nearly identical, which contradicts how real networks behave.

The model has never worked with a patent database. It has no experience of the global innovation system. But it has absorbed, through its training data, the statistical signature of thousands of papers, datasets, and analyses about patent cooperation. It "knows" what these networks typically look like, not from experience but from compressed patterns. And it applied that knowledge to flag anomalies in our data. Alien knowledge.

But here is the Schrödinger's cat dimension. The model was correct in this case. The data is synthetic. But the same mechanism, the same pattern matching, the same confident analytical voice, could produce an equally confident wrong assessment on different data. Imagine you had a real dataset with an unusual distribution, a genuine empirical anomaly. The model might flag it as "probably synthetic" or "likely an error" precisely because it deviates from the patterns the model has absorbed. The model's strength in recognising typical patterns is also its weakness. It normalises toward what it has seen before. You would not know whether the assessment is correct or incorrect without domain expertise.

Two lessons. First, feeding results back to the model for self-evaluation is a valuable practice. It surfaces potential issues you might not have noticed. Make it a habit. Ask "does this make sense?" and give the model a role or perspective. "Evaluate from a network analysis perspective." "Be a critical expert in patent economics." This activates different areas in the latent space and often produces more differentiated evaluations.

Second, never treat the model's self-evaluation as verification. The model evaluates its own output with the same mechanism that produced the output. Self-consistency is not verification. The workflow is not delegation, it is co-creation. You remain the Critical Expert in the Loop.

## **Promptotyping — Mapping of research data and domain expertise to research artefacts through frontier LLMs**

*\[Figure. Promptotyping. Mapping of research data and domain expertise to research artefacts through frontier LLMs and Context Engineering.\]*

The figure maps the four components that interact in Promptotyping. On the input side, Research Data and Research Domain & Expert in the Loop. As the processing mechanism, a Frontier-LLM with Context Engineering. On the output side, Research Artefacts. The patent cooperation exercise is shown as a concrete instance of this mapping. The same data could be mapped onto different artefacts, a statistical report, an interactive dashboard, a network model. The research question determines the artefact, and the researcher's domain expertise determines whether the artefact is meaningful. This is what Mollick means by Co-Intelligence. Neither the researcher alone nor the model alone produces the result. The collaboration does, and Promptotyping provides the structure for that collaboration.

Promptotyping is the methodology that formalises this mapping process. The term combines "prompt" and "prototyping" and denotes the extremely fast, researcher-centred, and research-data-driven creation of prototypes for research tools, workflows, and models using frontier LLMs and Context Engineering techniques. The methodology grew out of my dissertation work on digital editions and has been refined through approximately five dedicated workshops since 2025\.

## **Promptotyping-Phases: Preparation, Exploration & Mapping, Distillation, Implementation.**

Four phases. Preparation is where data and sources are collected and the project scope is defined. Exploration and Mapping is where the researcher and the model jointly survey the material, identify relevant structures, and formulate research questions. Distillation is the critical phase. Knowledge is deliberately compressed into Markdown documents. DATA.md describes the dataset, its columns, types, structure, and limitations. REQUIREMENT.md defines the research questions, the expected outputs, and the evaluation criteria. RESEARCH.md captures domain knowledge, methodological decisions, and references. These documents serve a dual purpose. They are context for the model, optimised for the context window. And they are project documentation for the researcher, capturing what has been decided and why.

Implementation is where the model builds the artefacts based on these documents. But the process does not end here. The arrow on the slide shows the Promptotyping Iterations loop between Distillation and Implementation. Each implementation cycle produces results that reveal gaps, new questions, or errors in the knowledge documents. The researcher updates the documents, the model works with the updated context, and the next iteration is more precise. This is not a linear pipeline. It is a feedback loop where the quality of the knowledge documents and the quality of the artefacts improve together.

This addresses a problem that becomes acute in complex projects. A single prompt works for a bounded task. But a project with multiple files, evolving requirements, and development over days or weeks needs a methodology that keeps both the AI agent and the researcher oriented. Without the Markdown documents, the researcher loses track of what has been tried and decided. Without them, the agent starts each session without the accumulated knowledge of previous sessions. The documents are the shared memory of the collaboration.

Both use cases were built using Promptotyping. The methodology is described in detail in a publication on the LISA Wissenschaftsportal of the Gerda Henkel Stiftung (Pollin 2026, [https://lisa.gerda-henkel-stiftung.de/digitale\_geschichte\_pollin](https://lisa.gerda-henkel-stiftung.de/digitale_geschichte_pollin)). 

## **Use Case 2 “FIGARO-NAM Agentic Workflow”**

The second use case takes a different approach. Instead of a chat-based analysis iterated into a web application, this is a structured agentic workflow with Claude Code from the start. The dataset is Eurostat's FIGARO National Accounts Matrix, used in input-output analysis. Six phases, specified in advance as a Markdown document following the Promptotyping methodology. Inspect the data, explore it, select research questions, plan the analysis, execute, summarise.

“Expert” in phase three is in quotation marks on purpose. I am not an economist. I built this use case to demonstrate the workflow, not to produce publishable economic research. The research questions I selected were informed guesses, not expert judgements.

The time series shows Germany's key aggregates from 2010 to 2023, household consumption, government consumption, and gross investment, with COVID-19 and the energy crisis clearly visible as disruptions. The cross-country comparison shows how household versus government consumption responded to COVID-19 across eight European countries. Spain and Greece show the sharpest household consumption drops, while government consumption increased across all countries. These are plausible patterns. But "plausible" is not "verified". Whether the aggregation is methodologically correct, whether the right transaction codes were used, whether the normalisation makes sense, that requires someone who knows this field.

## **Deep Research and Knowledge Distillation**

If I am not a domain expert, how did I build the research context? How did I know which transaction codes to use, what FIGARO methodology requires, how ESA 2010 classifications work?

I used Claude Deep Research, a multi-agent system with web search that can read and process large numbers of sources. I gave it the project context and specific questions. Which transaction codes from ESA 2010 do I need? How does FIGARO differ from other input-output databases like WIOD and EXIOBASE? What are the standard indicators for import dependency at sector level? What normalisation methods are used for cross-country comparisons? Deep Research read and processed 219 sources and produced a synthesis covering these areas.

That synthesis was the raw material. I then distilled it into a structured knowledge document, the "ESA 2010 und FIGARO Referenzdokumentation". This is the Distillation phase from Promptotyping applied to a concrete case. Deep Research produces a broad synthesis. The researcher reads it, evaluates what seems relevant and coherent, compresses it, and structures it into a Markdown document that serves as context for Claude Code in the implementation phase.

All 219 sources are real. They can be checked. But I cannot judge whether they are the best sources, the most current sources, or whether the synthesis correctly represents the state of the field. Hallucinations in the synthesis are possible. It is a way how a domain expert can evaluate, correct, and build on.

## **Conclusion**

There are two imperatives that do not resolve into one. The first is building sovereign infrastructure, open-weights models, local compute, transparent tooling, institutional control over the full stack. This is necessary, slow, expensive, and years behind. The second is understanding and working with frontier models as they exist today, because these systems are developing faster than any infrastructure initiative can follow.

This workshop exists because of the gap between the two. After years of sustained engagement with these systems, I produce research artefacts at a speed and scale that would have been impossible without them. The amplification compounds. Those who start early and have access pull ahead faster than those who start later can catch up. The technology does not close gaps. It widens them.

Building local infrastructure without understanding frontier models means building for a world that has already moved on. Working with frontier models without building alternatives means deepening a dependency on systems controlled by a small number of companies in two countries. Researchers, institutions, and policymakers need to pursue both simultaneously, knowing that neither path alone leads to sovereignty or competence.

This text does not resolve the asymmetry it describes. It names it, because naming it is the precondition for any response that does not simply reproduce it

## **References**

- Bennett, Michael Timothy. 'What the F\*ck Is Artificial General Intelligence?' In Artificial General Intelligence. AGI 2025\. Lecture Notes in Computer Science, vol 16057\. Springer, 2025\. [https://doi.org/10.1007/978-3-032-00686-8\_4](https://doi.org/10.1007/978-3-032-00686-8_4)  
- Chollet, François. 'François Chollet on OpenAI o-models and ARC'. YouTube, 2024\. [https://youtu.be/w9WE1aOPjHc](https://youtu.be/w9WE1aOPjHc)  
- Chollet, François. 'Pattern Recognition vs True Intelligence'. YouTube, 2024\. [https://youtu.be/JTU8Ha4Jyfc](https://youtu.be/JTU8Ha4Jyfc)  
- Hao, Karen. Empire of AI: Dreams and Nightmares in Sam Altman's OpenAI. Penguin Press, 2025\. [https://www.penguinrandomhouse.com/books/743569/empire-of-ai-by-karen-hao/](https://www.penguinrandomhouse.com/books/743569/empire-of-ai-by-karen-hao/)  
- Hochreiter, Sepp. 'KI Entwicklung, LSTM, OpenAI'. Eduard Heindl Energiegespräch \#100. YouTube. [https://youtu.be/LG1If4ccEDc](https://youtu.be/LG1If4ccEDc)  
- Hochreiter, Sepp. 'LSTM: The Comeback Story?'. YouTube. [https://youtu.be/8u2pW2zZLCs](https://youtu.be/8u2pW2zZLCs)  
- Hochreiter, Sepp. 'Prof. Sepp Hochreiter: A Pioneer in Deep Learning'. YouTube. [https://youtu.be/IwdwCmv\_TNY](https://youtu.be/IwdwCmv_TNY)  
- Hong, K., Troynikov, A., and Huber, J. 'Context Rot: How Increasing Input Tokens Impacts LLM Performance'. Chroma, 2025\. [https://research.trychroma.com/context-rot](https://research.trychroma.com/context-rot)  
- Kambhampati, Subbarao. '(How) Do LLMs Reason?' Talk given at MILA/ChandarLab. YouTube. [https://youtu.be/VfCoUl1g2PI](https://youtu.be/VfCoUl1g2PI)  
- Kambhampati, Subbarao. 'AI for Scientific Discovery'. Briefing and Panel Remarks at National Academies Workshop. YouTube. [https://youtu.be/TOIKa\_gKycE](https://youtu.be/TOIKa_gKycE)  
- Kambhampati, Subbarao. 'Do Reasoning Models Actually Search?'. YouTube. [https://youtu.be/2xFTNXK6AzQ](https://youtu.be/2xFTNXK6AzQ)  
- Kaplan, Jared, Sam McCandlish, Tom Henighan, et al. 'Scaling Laws for Neural Language Models'. arXiv:2001.08361, 2020\. [https://doi.org/10.48550/arXiv.2001.08361](https://doi.org/10.48550/arXiv.2001.08361)  
- Lindsey, Jack, et al. 'On the Biology of a Large Language Model'. Anthropic / Transformer Circuits, 2025\. [https://transformer-circuits.pub/2025/attribution-graphs/biology.html](https://transformer-circuits.pub/2025/attribution-graphs/biology.html)  
- Malmqvist, L. 'Sycophancy in Large Language Models: Causes and Mitigations'. 2024\. [https://arxiv.org/abs/2411.15287v1](https://arxiv.org/abs/2411.15287v1)  
- Mei, Lingrui, Jiayu Yao, Yuyao Ge, et al. 'A Survey of Context Engineering for Large Language Models'. arXiv:2507.13334, 2025\. [https://doi.org/10.48550/arXiv.2507.13334](https://doi.org/10.48550/arXiv.2507.13334)  
- Mollick, Ethan. Co-Intelligence: Living and Working with AI. Portfolio/Penguin, 2024\. [https://www.penguinrandomhouse.com/books/741805/co-intelligence-by-ethan-mollick/](https://www.penguinrandomhouse.com/books/741805/co-intelligence-by-ethan-mollick/)  
- Mollick, Ethan. 'Three Years from GPT-3 to Gemini 3: From Chatbots to Agents'. One Useful Thing, 18 November 2025\. [https://www.oneusefulthing.org/p/three-years-from-gpt-3-to-gemini](https://www.oneusefulthing.org/p/three-years-from-gpt-3-to-gemini)   
- Munzner, Tamara. Visualization Analysis and Design. CRC Press, 2014\. [https://doi.org/10.1201/b17511](https://doi.org/10.1201/b17511)  
- Pollin, Christopher. 'Generative KI: Sommer bis Herbst 2025\. Der Versuch eines Überblicks'. AGKI-DH Webinar, 17 Oktober 2025\. [https://agki-dh.github.io/pages/webinar/page-16.html](https://agki-dh.github.io/pages/webinar/page-16.html)  
- Pollin, Christopher. 'Promptotyping: Zwischen Vibe Coding, Vibe Research und Context Engineering'. L.I.S.A. Wissenschaftsportal Gerda Henkel Stiftung, 17 January 2026\. [https://lisa.gerda-henkel-stiftung.de/digitale\_geschichte\_pollin](https://lisa.gerda-henkel-stiftung.de/digitale_geschichte_pollin)  
- Pollin, Christopher. 'System 1.42: Wie (Frontier-)LLMs "tatsächlich" funktionieren'. Digital Humanities Craft, 1 July 2025\. [https://dhcraft.org/excellence/blog/System1-42](https://dhcraft.org/excellence/blog/System1-42)  
- Pollin, Christopher. 'Workshopreihe "Angewandte Generative KI in den (digitalen) Geisteswissenschaften"' (v1.1.0). Zenodo, 2025\. [https://doi.org/10.5281/zenodo.10647754](https://doi.org/10.5281/zenodo.10647754)  
- Sapkota, Ranjan, Konstantinos I. Roumeliotis, and Manoj Karkee. 'AI Agents vs. Agentic AI: A Conceptual Taxonomy, Applications and Challenges'. Information Fusion 126 (2025): 103599\. [https://doi.org/10.1016/j.inffus.2025.103599](https://doi.org/10.1016/j.inffus.2025.103599)  
- Schaeffer, Rylan, Brando Miranda, and Sanmi Koyejo. 'Are Emergent Abilities of Large Language Models a Mirage?' NeurIPS 2023\. [https://arxiv.org/abs/2304.15004](https://arxiv.org/abs/2304.15004)  
- Schulhoff, Sander, Michael Ilie, Nishant Balepur, et al. 'The Prompt Report: A Systematic Survey of Prompt Engineering Techniques'. arXiv:2406.06608, 2025\. [https://doi.org/10.48550/arXiv.2406.06608](https://doi.org/10.48550/arXiv.2406.06608)  
- Summerfield, Christopher. These Strange New Minds: How AI Learned to Talk and What It Means. Viking, 2025\. [https://www.penguinrandomhouse.com/books/750406/these-strange-new-minds-by-christopher-summerfield/9780593831717/](https://www.penguinrandomhouse.com/books/750406/these-strange-new-minds-by-christopher-summerfield/9780593831717/)  
- Vaswani, Ashish, Noam Shazeer, Niki Parmar, et al. 'Attention Is All You Need'. NeurIPS 2017\. [https://arxiv.org/abs/1706.03762](https://arxiv.org/abs/1706.03762)

[^1]:  Inside OpenAI's Stargate Megafactory with Sam Altman | The Circuit. [https://youtu.be/GhIJs4zbH0o](https://youtu.be/GhIJs4zbH0o)

[^2]:  Meta Builds Manhattan-Sized AI Data Centers in Multi-Billion Dollar Tech Race. [https://www.ctol.digital/news/meta-builds-manhattan-sized-ai-data-centers-tech-race](https://www.ctol.digital/news/meta-builds-manhattan-sized-ai-data-centers-tech-race).

[^3]:  Anthropic: Our AI just created a tool that can ‘automate all white collar work. [https://youtu.be/wYs6HWZ2FdM](https://youtu.be/wYs6HWZ2FdM) 

[^4]:  [https://obsidian.md](https://obsidian.md)

[^5]:  Claude Opus 4.6 and GPT 5.3 Codex: 250 page breakdown. [https://youtu.be/1PxEziv5XIU](https://youtu.be/1PxEziv5XIU)

[^6]:  Anthropic. 'Introducing Claude Opus 4.6'. Februar 2026\. https://www.anthropic.com/news/claude-opus-4-6

[^7]:  OpenAI. 'Introducing GPT-5.3-Codex'. 5 February 2026\. [https://openai.com/index/introducing-gpt-5-3-codex](https://openai.com/index/introducing-gpt-5-3-codex) 

[^8]:  OpenAI. 'GPT-5.3-Codex System Card'. 5 February 2026\. [https://openai.com/index/gpt-5-3-codex-system-card/](https://openai.com/index/gpt-5-3-codex-system-card/)

[^9]:  Anthropic. Disrupting the first reported AI-orchestrated cyber espionage campaign. [https://www.anthropic.com/news/disrupting-AI-espionage](https://www.anthropic.com/news/disrupting-AI-espionage) 

[^10]:  OpenAI. 'Introducing Prism'. 27 January 2026\. [https://openai.com/index/introducing-prism/](https://openai.com/index/introducing-prism/)

[^11]:  [https://grokipedia.com](https://grokipedia.com/)

[^12]:  Claude AI Co-founder Publishes 4 Big Claims about Near Future: Breakdown. [https://youtu.be/Iar4yweKGoI?si=bzuNrBNSNd2DLfHL](https://youtu.be/Iar4yweKGoI?si=bzuNrBNSNd2DLfHL)

[^13]:  Hassabis on an AI Shift Bigger Than Industrial Age. [https://youtu.be/BbIaYFHxW3Y](https://youtu.be/BbIaYFHxW3Y)

[^14]:  The Adolescence of Technology. Confronting and Overcoming the Risks of Powerful AI. [https://darioamodei.com/essay/the-adolescence-of-technology](https://darioamodei.com/essay/the-adolescence-of-technology)

[^15]:  FULL DISCUSSION: Google's Demis Hassabis, Anthropic's Dario Amodei Debate the World After AGI | AI1G. [https://youtu.be/02YLwsCKUww](https://youtu.be/02YLwsCKUww?si=6F9AxaIUjxff0fCX)

[^16]:  Thomas Friedman. The One Danger That Should Unite the U.S. and China.  [https://www.nytimes.com/2025/09/02/opinion/ai-us-china.html](https://www.nytimes.com/2025/09/02/opinion/ai-us-china.html)

[^17]:  Pollin, C. (2025, January 23). New Year, New AI. Das große Monopoly um die "Intelligence". Digital Humanities Craft. [https://dhcraft.org/excellence/blog/New-Year-New-AI-IdeaLab-25](https://dhcraft.org/excellence/blog/New-Year-New-AI-IdeaLab-25);   
Pollin, Christopher. 'Generative KI: Sommer bis Herbst 2025\. Der Versuch eines Überblicks'. Aufspringen auf den “Tech-Bro-AGI-Hypetrain”\!?. AGKI-DH Webinar, 17 Oktober 2025\. 

[^18]:  This Is What a Digital Coup Looks Like | Carole Cadwalladr | TED. [https://youtu.be/TZOoT8AbkNE](https://youtu.be/TZOoT8AbkNE)

[^19]:  Bennett, Michael Timothy. 'What the F\*ck Is Artificial General Intelligence?' In Artificial General Intelligence. AGI 2025\. Lecture Notes in Computer Science, vol 16057\. Springer, 2025\. [https://doi.org/10.1007/978-3-032-00686-8\_4](https://doi.org/10.1007/978-3-032-00686-8_4)

[^20]:  [https://mistral.ai](https://mistral.ai)

[^21]:  [https://aleph-alpha.com](https://aleph-alpha.com)

[^22]:  [https://www.swiss-ai.org/apertus](https://www.swiss-ai.org/apertus)

[^23]:  Andrej Karpathy. [https://x.com/karpathy/status/1723140519554105733](https://x.com/karpathy/status/1723140519554105733)

[^24]:  Michèle Finck. In Search of the Lost Research Exemption: Reflections on the AI Act. [https://doi.org/10.1016/j.inffus.2025.103599](https://doi.org/10.1016/j.inffus.2025.103599)

[^25]:  [https://eur-lex.europa.eu/eli/reg/2024/1689](https://eur-lex.europa.eu/eli/reg/2024/1689)

[^26]:  [https://doi.org/10.1093/grurint/ikaf100](https://doi.org/10.1093/grurint/ikaf100)

[^27]:  [https://www.deepseek.com](https://www.deepseek.com/)

[^28]:  [https://qwen.ai/home](https://qwen.ai/home)

[^29]:  [https://www.kimi.com](https://www.kimi.com/)

[^30]:  Saran, C. 'DeepSeek-R1: Budgeting challenges for on-premise deployments'. Computer Weekly, 18 February 2025\. [https://www.computerweekly.com/news/366619398/DeepSeek-R1-Budgeting-challenges-for-on-premise-deployments](https://www.computerweekly.com/news/366619398/DeepSeek-R1-Budgeting-challenges-for-on-premise-deployments)

[^31]:  Bender, Emily M., Timnit Gebru, Angelina McMillan-Major, and Shmargaret Shmitchell. ‘On the Dangers of Stochastic Parrots: Can Language Models Be Too Big? 🦜’. Proceedings of the 2021 ACM Conference on Fairness, Accountability, and Transparency (New York, NY, USA), FAccT ’21, 1 March 2021, 610–23. [https://doi.org/10.1145/3442188.3445922](https://doi.org/10.1145/3442188.3445922). 

[^32]:  Liesenfeld, A., & Dingemanse, M. (2024). Rethinking open source generative AI: Open-washing and the EU AI Act. Proceedings of the 2024 ACM Conference on Fairness, Accountability, and Transparency, 1774–1787. [https://doi.org/10.1145/3630106.3659005](https://doi.org/10.1145/3630106.3659005).

[^33]:  Dell'Acqua, Fabrizio, Edward McFowland III, Ethan Mollick, et al. 'Navigating the Jagged Technological Frontier: Field Experimental Evidence of the Effects of AI on Knowledge Worker Productivity and Quality'. Harvard Business School Working Paper 24-013, September 2023\. [https://www.hbs.edu/ris/Publication%20Files/24-013\_d9b45b68-9e74-42d6-a1c6-c72fb70c7571.pdf](https://www.hbs.edu/ris/Publication%20Files/24-013_d9b45b68-9e74-42d6-a1c6-c72fb70c7571.pdf)

[^34]:  Summerfield, Christopher. These Strange New Minds: How AI Learned to Talk and What It Means. Viking, 2025\.

[^35]:  “Emotionale KI: Was bedeutet sie für unser Menschsein?” Vortrag vom Philosophen Prof. Markus Gabriel. [https://youtu.be/x3xaNApgNWA](https://youtu.be/x3xaNApgNWA?si=HjrNEDZ2oVqE5Qkp)

[^36]:  Vaswani, Ashish, Noam Shazeer, Niki Parmar, et al. 'Attention Is All You Need'. NeurIPS 2017\. [https://arxiv.org/abs/1706.03762](https://arxiv.org/abs/1706.03762)

[^37]:  LLM Understanding: 23\. David CHALMERS. [https://youtu.be/yyRzTL201zI](https://youtu.be/yyRzTL201zI?si=o8lKMWRyEPx4EzNo)

[^38]:  Lindsey, Jack, Wes Gurnee, Emmanuel Ameisen, et al. "On the Biology of a Large Language Model." Transformer Circuits Thread, Anthropic, March 2025\. [https://transformer-circuits.pub/2025/attribution-graphs/biology.html](https://transformer-circuits.pub/2025/attribution-graphs/biology.html)

[^39]:  Andrej Karpathy. Deep Dive into LLMs like ChatGPT: [https://youtu.be/7xTGNNLPyMI](https://youtu.be/7xTGNNLPyMI?si=tVt2WPo3O8qQj5I8)

[^40]:  State of AI in 2026: LLMs, Coding, Scaling Laws, China, Agents, GPUs, AGI | Lex Fridman Podcast \#490. [https://youtu.be/EV7WhVT270Q](https://youtu.be/EV7WhVT270Q?si=WC2tFmc4bS_E2hOx)

[^41]:  Anthropic. "Claude's Character." June 2024\. [https://www.anthropic.com/news/claude-character](https://www.anthropic.com/news/claude-character) — For the full constitution, see [https://www.anthropic.com/constitution](https://www.anthropic.com/constitution)

[^42]:  For a systematic survey of prompting techniques and their sensitivity effects, see Schulhoff et al. 2025\. Ceron et al. 2024 demonstrate empirically how small prompt variations shift LLM outputs in the domain of political stance detection. Ceron, Tanise, Neele Falk, Ana Barić, Dmitry Nikolaev, and Sebastian Padó. ‘Beyond Prompt Brittleness: Evaluating the Reliability and Consistency of Political Worldviews in LLMs’. Transactions of the Association for Computational Linguistics 12 (November 2024): 1378–400. [https://doi.org/10.1162/tacl\_a\_00710](https://doi.org/10.1162/tacl_a_00710)

[^43]:  François Chollet \- Creating Keras 3\. [https://youtu.be/JDaMpwCiiJU](https://youtu.be/JDaMpwCiiJU?si=sNuGk6CAEfaWVJYS)

[^44]:  https://arcprize.org/leaderboard

[^45]:  AI's Research Frontier: Memory, World Models, & Planning — With Joelle Pineau. [https://youtu.be/nlSK8NA8ClU](https://youtu.be/nlSK8NA8ClU?si=IA74PC9f24EbmEel)

[^46]:  [https://platform.claude.com/docs/en/build-with-claude/context-windows](https://platform.claude.com/docs/en/build-with-claude/context-windows) 

[^47]:  Server-side context compaction for managing long conversations that approach context window limits. https://platform.claude.com/docs/en/build-with-claude/compaction 

[^48]:  Hong, K., Troynikov, A., and Huber, J. 'Context Rot: How Increasing Input Tokens Impacts LLM Performance'. Chroma, 2025\. [https://research.trychroma.com/context-rot](https://research.trychroma.com/context-rot)

[^49]:  Pollin, Christopher. ‘System 1.42: Wie (Frontier-)LLMs “tatsächlich” funktionieren’. Digital Humanities Craft \- Research Blogs, 1 July 2025\. [https://dhcraft.org/excellence/blog/System1-42](https://dhcraft.org/excellence/blog/System1-42/)

[^50]:  Malmqvist, Lars. ‘Sycophancy in Large Language Models: Causes and Mitigations’. Preprint, 22 November 2024\. [https://arxiv.org/abs/2411.15287v1](https://arxiv.org/abs/2411.15287v1)

[^51]:  World Modeling Workshop \- Day 1\. [https://www.youtube.com/live/7Gyuar7nMz0?si=WhdxoTc0Gtia4RB6\&t=20566](https://www.youtube.com/live/7Gyuar7nMz0?si=WhdxoTc0Gtia4RB6&t=20566) 

[^52]:  [https://deepmind.google/blog/genie-3-a-new-frontier-for-world-models](https://deepmind.google/blog/genie-3-a-new-frontier-for-world-models/)

[^53]:  [https://ai.meta.com/blog/v-jepa-2-world-model-benchmarks](https://ai.meta.com/blog/v-jepa-2-world-model-benchmarks/)

[^54]:  Snell, Charlie, Jaehoon Lee, Kelvin Xu, and Aviral Kumar. 'Scaling LLM Test-Time Compute Optimally can be More Effective than Scaling Model Parameters'. arXiv:2408.03314, 2024\. [https://arxiv.org/abs/2408.03314](https://arxiv.org/abs/2408.03314)

[image1]: img/asymmetric-claude.png