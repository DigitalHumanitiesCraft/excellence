import os
import re
import glob
from collections import Counter, defaultdict
import json

def load_corpus_files(corpus_path="./data"):
    """Load all text_acad_*.txt files from the specified path."""
    files = glob.glob(os.path.join(corpus_path, "text_acad_*.txt"))
    print(f"Found {len(files)} corpus files")
    return files

def read_file(file_path):
    """Read contents of a file with encoding fallback."""
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            return file.read()
    except UnicodeDecodeError:
        # Try different encoding if utf-8 fails
        with open(file_path, 'r', encoding='latin-1') as file:
            return file.read()

def extract_paragraphs(text):
    """Extract paragraphs based on corpus markers."""
    paragraphs = re.split(r'@@\d+', text)
    return [p.strip() for p in paragraphs if p.strip()]

def extract_sentences(paragraph):
    """Extract sentences from a paragraph with improved boundary detection."""
    # Handle common abbreviations
    for abbr in ["Dr.", "Mr.", "Mrs.", "Ms.", "Prof.", "e.g.", "i.e.", "etc."]:
        paragraph = paragraph.replace(abbr, abbr.replace(".", "<abbr>"))
    
    # Split on sentence boundaries
    text = re.sub(r'([.!?])(?=\s+[A-Z])', r'\1<SENT>', paragraph)
    
    # Restore abbreviation periods
    text = text.replace("<abbr>", ".")
    
    # Get sentences
    sentences = text.split('<SENT>')
    return [s.strip() for s in sentences if s.strip()]

def find_inversion_candidates(sentence):
    """
    Find potential subject-verb inversions in a sentence.
    Returns a list of detected inversions.
    """
    # Skip short sentences and questions
    if len(sentence) < 10 or sentence.endswith('?'):
        return []
    
    inversions = []
    
    # Patterns for different inversion types (matching the existing format)
    patterns = {
        # Existential there constructions
        "existential": {
            "pattern": re.compile(r"(?<!\w)There\s+(is|are|was|were|exists|existed|remains|remained|seems|seemed|appears|appeared)\s+"),
            "constituent_type": "AdvP (Existential)",
            "is_locative": True
        },
        # Prepositional phrase inversions
        "pp_inversion": {
            "pattern": re.compile(r"(?<!\w)(In|On|At|From|Into|Under|Over|Within|Behind|Above|Below|Among|Between|Through|Across|Around|Along)\s+([^.,;:!?]+?)\s+(is|are|was|were|come[s]?|came|stand[s]?|stood|remain[s]?|remained|exist[s]?|existed|appear[s]?|appeared)\s+"),
            "constituent_type": "PP (Prepositional Phrase)",
            "is_locative": True
        },
        # Adverbial inversions
        "adv_inversion": {
            "pattern": re.compile(r"(?<!\w)(Here|There|Now|Then|Never|Seldom|Rarely|Only|Often|Thus|So|Indeed|Perhaps)\s+([^.,;:!?]*?)\s+(is|are|was|were|come[s]?|came|stand[s]?|stood|remain[s]?|remained|exist[s]?|existed|appear[s]?|appeared)\s+"),
            "constituent_type": "AdvP (Adverb Phrase)",
            "is_locative": False
        },
        # Adjective phrase inversions
        "ap_inversion": {
            "pattern": re.compile(r"(?<!\w)(Most|More|Less|Least|Especially|Particularly|Significantly|Notable|Central|Crucial|Essential|Important)\s+([^.,;:!?]*?)\s+(is|are|was|were|come[s]?|came|stand[s]?|stood|remain[s]?|remained|exist[s]?|existed|appear[s]?|appeared)\s+"),
            "constituent_type": "AP (Adjective Phrase)",
            "is_locative": False
        },
        # Numeric expression inversions
        "numeric_inversion": {
            "pattern": re.compile(r"(?<!\w)(One|Two|Three|Four|Five|Six|Seven|Eight|Nine|Ten|First|Second|Third)\s+([^.,;:!?]*?)\s+(is|are|was|were|come[s]?|came|stand[s]?|stood|remain[s]?|remained|exist[s]?|existed|appear[s]?|appeared)\s+"),
            "constituent_type": "Numeric Expression",
            "is_locative": False
        }
    }
    
    # Check each pattern type
    for inv_type, config in patterns.items():
        match = config["pattern"].search(sentence)
        if match:
            # For existential pattern
            if inv_type == "existential":
                inversions.append({
                    "type": inv_type,
                    "sentence": sentence,
                    "fronted_constituent": "There",
                    "verb": match.group(1),
                    "constituent_type": config["constituent_type"],
                    "is_locative": config["is_locative"]
                })
            # For other patterns
            else:
                trigger = match.group(1)
                content = match.group(2)
                verb = match.group(3)
                fronted = f"{trigger} {content}".strip()
                
                # Update locative flag for specific adverbial triggers
                is_locative = config["is_locative"]
                if inv_type == "adv_inversion" and trigger.lower() in ["here", "there"]:
                    is_locative = True
                
                inversions.append({
                    "type": inv_type,
                    "sentence": sentence,
                    "fronted_constituent": fronted,
                    "verb": verb,
                    "constituent_type": config["constituent_type"],
                    "is_locative": is_locative
                })
            
            # Only count one inversion per sentence for basic analysis
            break
    
    return inversions

def analyze_corpus(corpus_path="./data", max_files=None):
    """Analyze corpus files for subject-verb inversions."""
    files = load_corpus_files(corpus_path)
    
    if max_files:
        files = files[:max_files]
    
    stats = {
        "total_files": len(files),
        "total_paragraphs": 0,
        "total_sentences": 0,
        "total_inversions": 0,
        "locative_inversions": 0,
        "non_locative_inversions": 0,
        "inversions_by_file": defaultdict(int),
        "constituent_types": Counter(),
        "inversion_types": Counter(),
        "examples": []  # Store examples for output
    }
    
    total_words = 0
    sentence_count = 0
    
    for file_path in files:
        file_name = os.path.basename(file_path)
        print(f"Processing {file_name}...")
        
        # Read file content
        content = read_file(file_path)
        
        # Extract paragraphs
        paragraphs = extract_paragraphs(content)
        stats["total_paragraphs"] += len(paragraphs)
        
        # Process each paragraph
        for para in paragraphs:
            # Extract sentences
            sentences = extract_sentences(para)
            stats["total_sentences"] += len(sentences)
            
            # Calculate word counts for average sentence length
            for sentence in sentences:
                words = re.findall(r'\b\w+\b', sentence)
                total_words += len(words)
                sentence_count += 1
            
            # Process each sentence for inversions
            for sentence in sentences:
                inversions = find_inversion_candidates(sentence)
                
                for inversion in inversions:
                    stats["total_inversions"] += 1
                    stats["constituent_types"][inversion["constituent_type"]] += 1
                    stats["inversion_types"][inversion["type"]] += 1
                    
                    if inversion["is_locative"]:
                        stats["locative_inversions"] += 1
                    else:
                        stats["non_locative_inversions"] += 1
                    
                    stats["inversions_by_file"][file_name] += 1
                    
                    # Keep the first 100 examples for output
                    if len(stats["examples"]) < 100:
                        stats["examples"].append(inversion)
    
    # Calculate average sentence length
    if sentence_count > 0:
        stats["avg_sentence_length"] = total_words / sentence_count
    
    return stats

def print_results(stats):
    """Print analysis results in the required format."""
    print("\n=== Basic Corpus Statistics ===")
    print(f"Total files: {stats['total_files']}")
    print(f"Total size: {sum(os.path.getsize(f) for f in glob.glob(os.path.join('./data', 'text_acad_*.txt')))/(1024*1024):.2f} MB")
    print(f"Total paragraphs: {stats['total_paragraphs']}")
    print(f"Total sentences: {stats['total_sentences']}")
    print(f"Average sentence length: {stats.get('avg_sentence_length', 0):.2f} words")
    
    print("\n=== Potential Subject-Verb Inversion Examples ===")
    for i, example in enumerate(stats["examples"][:10]):
        print(f"{i+1}. {example['sentence']}")
        print(f"   Type: {example['type']}")
        print(f"   Fronted: '{example['fronted_constituent']}'")
        print(f"   Verb: '{example['verb']}'")
        print()

def save_results(stats, output_file="corpus_analysis_results.json"):
    """Save analysis results to a JSON file."""
    # Create a serializable version of stats
    json_stats = {
        "total_files": stats["total_files"],
        "total_paragraphs": stats["total_paragraphs"],
        "total_sentences": stats["total_sentences"],
        "total_inversions": stats["total_inversions"],
        "locative_inversions": stats["locative_inversions"],
        "non_locative_inversions": stats["non_locative_inversions"],
        "inversions_by_file": dict(stats["inversions_by_file"]),
        "constituent_types": dict(stats["constituent_types"]),
        "inversion_types": dict(stats["inversion_types"])
    }
    
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(json_stats, f, indent=2)
        
    print(f"Results saved to {output_file}")

def main():
    # Analyze corpus (limit to 5 files to match existing output)
    stats = analyze_corpus(max_files=5)
    
    # Print basic statistics and examples
    print_results(stats)
    
    # Save results
    save_results(stats)

if __name__ == "__main__":
    main()