import os
import re
import csv
import glob
import spacy
from tqdm import tqdm
from collections import defaultdict
import time
from datetime import datetime

# Load the spaCy model
print("Loading spaCy model...")
nlp = spacy.load("en_core_web_sm")
# Increase max length to avoid truncation issues
nlp.max_length = 2000000

def load_text_files(directory='.'):
    """Load all .txt files in the given directory."""
    txt_files = glob.glob(os.path.join(directory, '*.txt'))
    return txt_files

def load_single_file(file_path):
    """Load a single text file."""
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            return file.read()
    except UnicodeDecodeError:
        # Try with a different encoding if utf-8 fails
        try:
            with open(file_path, 'r', encoding='latin-1') as file:
                return file.read()
        except Exception as e:
            print(f"Error: Could not read file: {e}")
            return None

def clean_text(text):
    """Clean the text before processing."""
    # Remove paragraph markers
    text = re.sub(r'<p>', ' ', text)
    # Remove @ symbols
    text = re.sub(r'@+', '', text)
    # Replace multiple spaces with a single space
    text = re.sub(r'\s+', ' ', text)
    return text

def preprocess_text(text):
    """Preprocess text to identify potential sentence boundaries."""
    # Handle common issues in academic text
    # Replace abbreviated titles to avoid false sentence breaks
    text = re.sub(r'(Dr|Mr|Mrs|Ms|Prof|Fig|St|etc)\.\s+', r'\1PERIOD ', text)
    # Replace common abbreviations
    text = re.sub(r'(et al|e\.g|i\.e|vs)\.\s+', r'\1PERIOD ', text)
    # Restore periods after preprocessing
    text = text.replace('PERIOD', '.')
    return text

def extract_sentences(text, max_sentences=None):
    """Extract sentences using spaCy, with optional limit."""
    text = clean_text(text)
    text = preprocess_text(text)
    
    # Split into chunks for processing (to avoid memory issues)
    chunk_size = 100000  # characters
    chunks = [text[i:i+chunk_size] for i in range(0, len(text), chunk_size)]
    
    all_sentences = []
    for chunk in chunks:
        doc = nlp(chunk)
        sentences = list(doc.sents)
        all_sentences.extend(sentences)
        
        # Check if we've reached the maximum number of sentences
        if max_sentences and len(all_sentences) >= max_sentences:
            all_sentences = all_sentences[:max_sentences]
            break
    
    return all_sentences

def get_main_fronted_element(token, sent, verb_pos):
    """
    Extract the main fronted element starting from a token.
    
    This function identifies the highest-level fronted element 
    (avoiding nested phrases).
    """
    # Start with the token itself
    current = token
    
    # Try to find the highest-level head before the verb
    while current.head.i < verb_pos and current.head.i > 0 and current.head != current:
        # Only move up if the head is before the verb and not the root
        current = current.head
    
    # Get the entire phrase from this highest head
    phrase_tokens = list(current.subtree)
    
    # Filter to only include tokens that appear before the verb
    phrase_tokens = [t for t in phrase_tokens if t.i < verb_pos]
    
    # Sort by position in the sentence
    phrase_tokens.sort(key=lambda x: x.i)
    
    # Join the tokens to form the phrase text
    if phrase_tokens:
        phrase_text = " ".join([t.text for t in phrase_tokens])
        
        # Determine phrase type
        phrase_type = determine_phrase_type(current)
        
        # Determine if it's locative
        is_loc = is_locative(phrase_text, phrase_type)
        
        return {
            "text": phrase_text,
            "type": phrase_type,
            "locative": is_loc,
            "token_ids": [t.i for t in phrase_tokens]
        }
    
    return None

def determine_phrase_type(token):
    """Determine the phrase type based on the head token."""
    pos = token.pos_
    dep = token.dep_
    
    # Check for quotative inversions
    if pos == "VERB" and any(child.text.lower() in ["that", "if", "whether"] for child in token.children):
        return "Quotative"
    
    # Map POS and dependency to phrase type
    if pos == "ADP" or dep == "prep":
        return "PP"  # Prepositional Phrase
    elif pos == "ADV" or dep in ["advmod", "npadvmod"]:
        return "AdvP"  # Adverb Phrase
    elif pos == "ADJ" or dep in ["amod", "acomp"]:
        return "AdjP"  # Adjective Phrase
    elif pos == "VERB" and dep in ["ccomp", "advcl"]:
        return "VP"  # Verb Phrase
    else:
        # Try to infer from children
        if any(child.pos_ == "ADP" for child in token.children):
            return "PP"
        elif any(child.pos_ == "ADV" for child in token.children):
            return "AdvP"
        elif any(child.pos_ == "ADJ" for child in token.children):
            return "AdjP"
        
        # Default
        return "Other"

def is_locative(phrase, phrase_type):
    """Determine if a phrase is locative."""
    # List of locative prepositions
    locative_preps = ["in", "on", "at", "above", "below", "under", "over", "behind", 
                      "beneath", "beside", "between", "beyond", "by", "inside", "outside",
                      "underneath", "upon", "within", "here", "there", "where"]
    
    # Temporal prepositions that shouldn't be considered locative
    temporal_preps = ["after", "before", "during", "since", "until", "when", "while"]
    
    phrase_lower = phrase.lower()
    
    # Check for locative words at the beginning of the phrase
    words = phrase_lower.split()
    if words:
        if words[0] in locative_preps:
            # Make sure it's not a temporal use
            if words[0] in ["in", "on", "at"]:
                # Check if followed by time expressions
                temporal_words = ["time", "day", "hour", "month", "year", "decade", 
                                  "century", "period", "moment", "january", "february", 
                                  "march", "april", "may", "june", "july", "august", 
                                  "september", "october", "november", "december"]
                return not any(temp_word in words[1:3] for temp_word in temporal_words)
            return True
        elif words[0] in temporal_preps:
            return False
    
    # Check for phrases describing location
    loc_patterns = ["left", "right", "top", "bottom", "side", "front", "back", 
                   "north", "south", "east", "west", "center", "middle", "place", 
                   "location", "position", "area", "region", "room", "building", "house"]
    
    return any(pattern in phrase_lower for pattern in loc_patterns)

def is_quotative_inversion(verb, subject):
    """Check if this is a quotative inversion (e.g., 'says John')."""
    quotative_verbs = ["say", "says", "said", "claim", "claims", "claimed", 
                      "state", "states", "stated", "explain", "explains", "explained",
                      "reply", "replies", "replied", "respond", "responds", "responded",
                      "suggest", "suggests", "suggested", "mention", "mentions", "mentioned"]
    
    return (verb.text.lower() in quotative_verbs and 
            subject.text.lower() not in ["i", "we", "you", "they", "he", "she", "it"])

def identify_inversions(doc):
    """
    Identify subject-verb inversions in a spaCy parsed document.
    
    A subject-verb inversion is identified when:
    1. A verb has a subject
    2. The subject appears after the verb in the text
    3. There is a fronted element before the verb (advp, pp, adjp, vp)
    """
    inversions = []
    
    for sent in doc.sents:
        # Skip very short sentences
        if len(sent) < 4:
            continue
        
        # Find all verbs in the sentence
        verbs = [token for token in sent if token.pos_ == "VERB" or 
                (token.pos_ == "AUX" and token.dep_ in ["ROOT", "ccomp", "xcomp"])]
        
        for verb in verbs:
            # Find the subject of this verb (if any)
            subjects = [child for child in verb.children if child.dep_ in ["nsubj", "nsubjpass", "csubj"]]
            
            for subject in subjects:
                # Check if subject appears after the verb (potential inversion)
                if subject.i > verb.i:
                    # Check if this is a quotative inversion
                    quotative = is_quotative_inversion(verb, subject)
                    
                    # Find fronted elements before the verb
                    # We'll look at tokens from the beginning of the sentence to just before the verb
                    fronted_tokens = [t for t in sent if t.i < verb.i]
                    
                    # Process each potential fronted element
                    fronted_elements = []
                    processed_token_ids = set()
                    
                    for token in fronted_tokens:
                        # Skip tokens we've already included in a phrase
                        if token.i in processed_token_ids:
                            continue
                        
                        # Only consider tokens with certain POS/dependencies as phrase heads
                        if token.pos_ in ["ADP", "ADV", "ADJ", "VERB"] or token.dep_ in ["prep", "advmod", "amod", "advcl"]:
                            fronted_element = get_main_fronted_element(token, sent, verb.i)
                            
                            if fronted_element and len(fronted_element["text"].split()) > 1:  # Skip single words
                                # Add all tokens in this phrase to processed set
                                processed_token_ids.update(fronted_element["token_ids"])
                                
                                # Add to fronted elements
                                fronted_elements.append(fronted_element)
                    
                    # Deduplicate fronted elements (in case we have overlaps)
                    unique_elements = {}
                    for fe in fronted_elements:
                        if fe["text"] not in unique_elements:
                            unique_elements[fe["text"]] = fe
                    
                    fronted_elements = list(unique_elements.values())
                    
                    # If we found fronted elements, record this as an inversion
                    if fronted_elements:
                        # Get the subject phrase
                        subject_tokens = list(subject.subtree)
                        subject_tokens.sort(key=lambda x: x.i)
                        subject_text = " ".join([t.text for t in subject_tokens])
                        
                        inversions.append({
                            "sentence": sent.text,
                            "verb": verb.text,
                            "verb_position": verb.i,
                            "subject": subject_text,
                            "subject_position": subject.i,
                            "fronted_elements": fronted_elements,
                            "quotative": quotative
                        })
    
    return inversions

def classify_inversion_function(inversion):
    """
    Classify the function of the inversion in discourse.
    
    Functions include:
    1. Scene-setting: Establishing spatial or temporal context
    2. Discourse structuring: Organizing or highlighting information
    3. Evaluative: Expressing an assessment or judgment
    4. Comparative: Comparing or contrasting elements
    5. Quotative: Reporting speech or thought
    """
    # Check if this is a quotative inversion
    if inversion["quotative"]:
        return "Quotative"
    
    # Check for locative inversions (likely scene-setting)
    if any(fe["locative"] for fe in inversion["fronted_elements"]):
        return "Scene-setting"
    
    # Check for evaluative and comparative markers
    eval_markers = ["important", "significant", "crucial", "critical", "central", 
                   "interesting", "surprising", "remarkable", "notable", "noteworthy"]
    
    comp_markers = ["more", "less", "most", "least", "better", "worse", "different", 
                   "similar", "comparable", "like", "unlike"]
    
    fe_texts = [fe["text"].lower() for fe in inversion["fronted_elements"]]
    all_text = " ".join(fe_texts)
    
    if any(marker in all_text for marker in eval_markers):
        return "Evaluative"
    
    if any(marker in all_text for marker in comp_markers):
        return "Comparative"
    
    # Default to discourse structuring if no other function applies
    return "Discourse structuring"

def analyze_information_structure(inversion):
    """
    Analyze if the fronted element typically represents "given" information and 
    the subject represents "new" information.
    """
    fronted_texts = [fe["text"].lower() for fe in inversion["fronted_elements"]]
    subject_text = inversion["subject"].lower()
    
    # Markers of given information
    given_markers = ["the", "this", "that", "these", "those", "its", "his", "her", "their", "our", "my", "your"]
    
    # Markers of new information
    new_markers = ["a", "an", "some", "many", "several", "few", "one", "two", "three", "four", "five"]
    
    # Check if fronted elements contain given markers
    fronted_given = any(any(fe.startswith(marker + " ") or fe == marker for marker in given_markers) for fe in fronted_texts)
    
    # Check if subject contains new markers
    subject_new = any(subject_text.startswith(marker + " ") for marker in new_markers)
    
    return {
        "fronted_given": fronted_given,
        "subject_new": subject_new,
        "canonical_structure": fronted_given and subject_new
    }

def analyze_corpus(max_sentences_per_file=None):
    """Analyze all text files in the corpus for subject-verb inversions."""
    # Create timestamp for output files
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    
    # Get all text files
    file_paths = load_text_files()
    print(f"Found {len(file_paths)} text files.")
    
    # Prepare main CSV output file
    main_csv = f"corpus_inversions_{timestamp}.csv"
    with open(main_csv, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow([
            "File", 
            "Sentence", 
            "Fronted Element", 
            "Fronted Element Type", 
            "Locative", 
            "Verb", 
            "Subject", 
            "Quotative",
            "Discourse Function",
            "Information Structure"
        ])
    
    # Prepare summary statistics file
    summary_csv = f"corpus_summary_{timestamp}.csv"
    with open(summary_csv, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow([
            "File",
            "Total Sentences",
            "Total Inversions",
            "Inversion Rate",
            "Quotative Count",
            "Non-Quotative Count",
            "Scene-setting Count",
            "Discourse structuring Count",
            "Evaluative Count",
            "Comparative Count",
            "Given->New Count",
            "Other Info Structure Count",
            "PP (Locative) Count",
            "PP (Non-locative) Count",
            "AdvP (Locative) Count",
            "AdvP (Non-locative) Count",
            "AdjP (Locative) Count",
            "AdjP (Non-locative) Count",
            "VP (Locative) Count",
            "VP (Non-locative) Count",
            "Other (Locative) Count",
            "Other (Non-locative) Count"
        ])
    
    # Corpus-wide statistics
    total_corpus_sentences = 0
    total_corpus_inversions = 0
    corpus_inversion_types = defaultdict(int)
    corpus_quotative_count = 0
    corpus_function_types = defaultdict(int)
    corpus_info_structure = {"Given->New": 0, "Other": 0}
    
    # Process each file
    for file_path in file_paths:
        file_name = os.path.basename(file_path)
        print(f"\nAnalyzing {file_name}...")
        
        # Load the file
        text = load_single_file(file_path)
        if text is None:
            continue
        
        # Extract and parse sentences
        print("  Extracting sentences...")
        start_time = time.time()
        sentences = extract_sentences(text, max_sentences_per_file)
        print(f"  Found {len(sentences)} sentences. Extraction took {time.time() - start_time:.2f} seconds.")
        
        # Track this file's statistics
        total_sentences = len(sentences)
        total_corpus_sentences += total_sentences
        
        # Process sentences in small batches to avoid memory issues
        print("  Processing sentences with spaCy...")
        batch_size = 50
        file_inversions = []
        
        # Use tqdm for a progress bar
        num_batches = (len(sentences) + batch_size - 1) // batch_size
        for i in tqdm(range(0, len(sentences), batch_size), total=num_batches):
            batch = sentences[i:i+batch_size]
            
            # Process each sentence separately to avoid context issues
            for sent in batch:
                # Skip sentences that are too long (to avoid memory issues)
                if len(sent.text) > nlp.max_length:
                    continue
                    
                try:
                    doc = nlp(sent.text)
                    inversions = identify_inversions(doc)
                    file_inversions.extend(inversions)
                except Exception as e:
                    # Skip problematic sentences
                    continue
        
        print(f"  Found {len(file_inversions)} subject-verb inversions.")
        total_corpus_inversions += len(file_inversions)
        
        # Analyze each inversion
        file_inversion_types = defaultdict(int)
        file_quotative_count = 0
        file_function_types = defaultdict(int)
        file_info_structure = {"Given->New": 0, "Other": 0}
        
        # Add to CSV
        with open(main_csv, 'a', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            
            for inversion in file_inversions:
                # Analyze discourse function
                discourse_function = classify_inversion_function(inversion)
                file_function_types[discourse_function] += 1
                corpus_function_types[discourse_function] += 1
                
                # Count quotative inversions
                if inversion["quotative"]:
                    file_quotative_count += 1
                    corpus_quotative_count += 1
                
                # Analyze information structure
                info_structure = analyze_information_structure(inversion)
                info_structure_text = "Given->New" if info_structure["canonical_structure"] else "Other"
                
                if info_structure["canonical_structure"]:
                    file_info_structure["Given->New"] += 1
                    corpus_info_structure["Given->New"] += 1
                else:
                    file_info_structure["Other"] += 1
                    corpus_info_structure["Other"] += 1
                
                # Count primary fronted element type for each inversion
                if inversion["fronted_elements"]:
                    main_fe = max(inversion["fronted_elements"], key=lambda x: len(x["text"]))
                    inv_type = f"{main_fe['type']} ({'Locative' if main_fe['locative'] else 'Non-locative'})"
                    file_inversion_types[inv_type] += 1
                    corpus_inversion_types[inv_type] += 1
                
                # For each fronted element in the inversion (for detailed CSV)
                for fe in inversion["fronted_elements"]:
                    # Write to CSV
                    writer.writerow([
                        file_name,
                        inversion["sentence"],
                        fe["text"],
                        fe["type"],
                        "Locative" if fe["locative"] else "Non-locative",
                        inversion["verb"],
                        inversion["subject"],
                        "Yes" if inversion["quotative"] else "No",
                        discourse_function,
                        info_structure_text
                    ])
        
        # Calculate file inversion rate
        inversion_rate = (len(file_inversions) / total_sentences * 100) if total_sentences > 0 else 0
        
        # Print file summary
        print(f"  Inversion rate: {inversion_rate:.2f}%")
        print("  Inversion types:")
        for inv_type, count in sorted(file_inversion_types.items(), key=lambda x: x[1], reverse=True):
            print(f"    {inv_type}: {count} ({count/len(file_inversions)*100:.1f}%)")
        
        # Write to summary CSV
        with open(summary_csv, 'a', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            
            # Count each type
            pp_loc = file_inversion_types.get("PP (Locative)", 0)
            pp_non_loc = file_inversion_types.get("PP (Non-locative)", 0)
            advp_loc = file_inversion_types.get("AdvP (Locative)", 0)
            advp_non_loc = file_inversion_types.get("AdvP (Non-locative)", 0)
            adjp_loc = file_inversion_types.get("AdjP (Locative)", 0)
            adjp_non_loc = file_inversion_types.get("AdjP (Non-locative)", 0)
            vp_loc = file_inversion_types.get("VP (Locative)", 0)
            vp_non_loc = file_inversion_types.get("VP (Non-locative)", 0)
            other_loc = file_inversion_types.get("Other (Locative)", 0)
            other_non_loc = file_inversion_types.get("Other (Non-locative)", 0)
            
            writer.writerow([
                file_name,
                total_sentences,
                len(file_inversions),
                f"{inversion_rate:.2f}%",
                file_quotative_count,
                len(file_inversions) - file_quotative_count,
                file_function_types.get("Scene-setting", 0),
                file_function_types.get("Discourse structuring", 0),
                file_function_types.get("Evaluative", 0),
                file_function_types.get("Comparative", 0),
                file_info_structure["Given->New"],
                file_info_structure["Other"],
                pp_loc,
                pp_non_loc,
                advp_loc,
                advp_non_loc,
                adjp_loc,
                adjp_non_loc,
                vp_loc,
                vp_non_loc,
                other_loc,
                other_non_loc
            ])
    
    # Calculate overall corpus inversion rate
    corpus_inversion_rate = (total_corpus_inversions / total_corpus_sentences * 100) if total_corpus_sentences > 0 else 0
    
    # Print corpus summary
    print("\n===== CORPUS SUMMARY =====")
    print(f"Total files analyzed: {len(file_paths)}")
    print(f"Total sentences: {total_corpus_sentences}")
    print(f"Total inversions: {total_corpus_inversions}")
    print(f"Overall inversion rate: {corpus_inversion_rate:.2f}%")
    
    print("\nInversion Types Distribution:")
    for inv_type, count in sorted(corpus_inversion_types.items(), key=lambda x: x[1], reverse=True):
        print(f"  {inv_type}: {count} ({count/total_corpus_inversions*100:.1f}%)")
    
    print("\nQuotative vs. Non-Quotative:")
    print(f"  Quotative: {corpus_quotative_count} ({corpus_quotative_count/total_corpus_inversions*100:.1f}%)")
    print(f"  Non-Quotative: {total_corpus_inversions - corpus_quotative_count} ({(total_corpus_inversions - corpus_quotative_count)/total_corpus_inversions*100:.1f}%)")
    
    print("\nDiscourse Function Distribution:")
    for func, count in sorted(corpus_function_types.items(), key=lambda x: x[1], reverse=True):
        print(f"  {func}: {count} ({count/total_corpus_inversions*100:.1f}%)")
    
    print("\nInformation Structure Distribution:")
    for structure, count in corpus_info_structure.items():
        print(f"  {structure}: {count} ({count/total_corpus_inversions*100:.1f}%)")
    
    print(f"\nDetailed results have been saved to {main_csv}")
    print(f"Summary statistics have been saved to {summary_csv}")

if __name__ == "__main__":
    max_sentences_input = input("Enter maximum number of sentences to analyze per file (leave blank for all): ")
    
    max_sentences = None
    if max_sentences_input.strip():
        try:
            max_sentences = int(max_sentences_input)
        except ValueError:
            print("Invalid number. Will analyze all sentences.")
    
    start_time = time.time()
    analyze_corpus(max_sentences)
    print(f"\nTotal analysis time: {(time.time() - start_time) / 60:.2f} minutes")