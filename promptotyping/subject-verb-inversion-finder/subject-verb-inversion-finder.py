import os
import re
import glob
import csv
import json
from collections import Counter, defaultdict
from pathlib import Path

class EnhancedInversionFinder:
    """Enhanced class for finding subject-verb inversions in academic texts with improved complex inversion detection."""
    
    def __init__(self, corpus_dir="data", output_dir="inversion_results"):
        """Initialize with directory paths and enhanced patterns."""
        self.corpus_dir = corpus_dir
        self.output_dir = output_dir
        
        # Create output directory
        os.makedirs(output_dir, exist_ok=True)
        
        # Words and phrases indicating locative meaning
        self.locative_markers = {
            # Prepositions indicating location
            "in", "on", "at", "above", "below", "behind", "beneath", "beside", 
            "between", "by", "inside", "near", "outside", "under", "within",
            "throughout", "around", "across", "along", "amid", "among",
            "alongside", "opposite", "beyond", "through", "into", "from",
            # Adverbs indicating location
            "here", "there", "where", "everywhere", "somewhere", "nowhere", 
            "ahead", "back", "backward", "forwards", "sideways", "downward", "upward"
        }
        
        # Common verbs in inversions
        self.common_inversion_verbs = {
            # Be verbs
            "is", "are", "was", "were", "be", "been", "being",
            # Motion verbs
            "come", "comes", "came", "coming",
            "go", "goes", "went", "gone", "going",
            "stand", "stands", "stood", "standing",
            "sit", "sits", "sat", "sitting",
            "lie", "lies", "lay", "lain", "lying",
            "hang", "hangs", "hung", "hanging",
            # State verbs
            "remain", "remains", "remained", "remaining",
            "exist", "exists", "existed", "existing",
            "appear", "appears", "appeared", "appearing",
            # Movement verbs
            "rise", "rises", "rose", "risen", "rising",
            "emerge", "emerges", "emerged", "emerging",
            "follow", "follows", "followed", "following",
            # Additional verbs common in inversions
            "grow", "grows", "grew", "grown", "growing",
            "live", "lives", "lived", "living",
            "flow", "flows", "flowed", "flowing",
            "run", "runs", "ran", "running",
            "lurk", "lurks", "lurked", "lurking",
            "rest", "rests", "rested", "resting",
            "fall", "falls", "fell", "fallen", "falling"
        }
        
        # Rare or additional inversion triggers
        self.rare_inversion_triggers = {
            "central", "crucial", "essential", "paramount", "fundamental", 
            "significant", "important", "relevant", "critical", "notable",
            "primary", "first", "last", "foremost", "chief", "principal"
        }
        
        # Pronouns and articles that often begin subjects
        self.subject_markers = {
            "the", "a", "an", "this", "that", "these", "those", "some", "many", 
            "few", "several", "all", "any", "most", "each", "every", "another",
            "his", "her", "their", "its", "our", "my", "your", "one", "both", 
            "certain", "various", "numerous", "other", "such", "no", "more", "less"
        }
        
        # Clean paragraph markers for better text processing
        self.paragraph_marker_pattern = re.compile(r'@@\d+')
        
        # Improved pattern for detecting sentence boundaries
        self.sentence_boundary = re.compile(r'(?<=[.!?])\s+(?=[A-Z])')
        
        # Common verbs in inversions pattern
        inversion_verbs = r'(is|are|was|were|come[s]?|came|stand[s]?|stood|remain[s]?|remained|exist[s]?|existed|appear[s]?|appeared|rise[s]?|rose|emerge[s]?|emerged|follow[s]?|followed|grow[s]?|grew|live[s]?|lived|flow[s]?|flowed|run[s]?|ran|rest[s]?|rested|fall[s]?|fell)'
        
        # Define pattern templates with their configs
        self.pattern_configs = {
            # 1. Pattern for existential there constructions
            "existential": {
                "pattern": re.compile(
                    r"(?<!\w)There\s+(is|are|was|were|exists|existed|remains|remained|seems|seemed|appears|appeared|stands|stood|comes|came)\s+"
                ),
                "constituent_type": "AdvP (Existential)",
                "is_locative": True
            },
            
            # 2. Enhanced pattern for prepositional phrases
            "pp_inversion": {
                "pattern": re.compile(
                    r"(?<!\w)(In|On|At|From|To|Into|Under|Over|Within|Behind|Above|Below|Among|Amongst|Between|Through|Across|Around|Along|Near|Beyond|Beside|Outside|Inside|Beneath)\s+([^.,;:!?]+?)\s+" + inversion_verbs + r"\s+"
                ),
                "constituent_type": "PP (Prepositional Phrase)",
                "is_locative": True
            },
            
            # 3. Advanced pattern for PPs with embedded clauses - IMPROVED with case insensitivity
            "complex_pp_inversion": {
                "pattern": re.compile(
                    r"(?<!\w)(In|On|At|From|To|Into|Under|Over|Within|Behind|Above|Below|Among|Amongst|Between|Through|Across|Around|Along|Near|Beyond|Beside|Outside|Inside|Beneath)\s+([^.,;:!?]*?(?:which|that|who|whose|where|when)[^.,;:!?]*?)\s+(is|are|was|were|come[s]?|came|stand[s]?|stood|remain[s]?|remained|exist[s]?|existed|appear[s]?|appeared)\s+",
                    re.IGNORECASE  # Add case insensitivity to improve detection rate
                ),
                "constituent_type": "PP (Complex Prepositional Phrase)",
                "is_locative": True
            },
            
            # 4. Pattern for adverbial fronted inversions
            "adv_inversion": {
                "pattern": re.compile(
                    r"(?<!\w)(Here|There|Now|Then|Never|Seldom|Rarely|Only|Thus|So|Indeed|Perhaps|Maybe|Today|Yesterday|Tomorrow|Everywhere|Somewhere|Nowhere|Often|Always|Again)\s+([^.,;:!?]*?)\s+" + inversion_verbs + r"\s+"
                ),
                "constituent_type": "AdvP (Adverb Phrase)",
                "is_locative": False  # Will be checked individually
            },
            
            # 5. Pattern for adjective phrases at start
            "ap_inversion": {
                "pattern": re.compile(
                    r"(?<!\w)(Most|More|Less|Least|Especially|Particularly|Significantly|Notably|Central|Crucial|Essential|Paramount|Fundamental|Important|Relevant|Critical|Notable|Primary|First|Last|Foremost)\s+([^.,;:!?]*?)\s+" + inversion_verbs + r"\s+"
                ),
                "constituent_type": "AP (Adjective Phrase)",
                "is_locative": False
            },
            
            # 6. Pattern for participle phrases at start
            "vp_inversion": {
                "pattern": re.compile(
                    r"(?<!\w)(Included|Located|Situated|Standing|Lying|Sitting|Attached|Connected|Surrounding|Emerging|Following|Preceding|Dominating|Accompanying|Hanging|Floating|Reflected|Highlighted|Revealed)\s+([^.,;:!?]*?)\s+" + inversion_verbs + r"\s+"
                ),
                "constituent_type": "VP (Verb Phrase)",
                "is_locative": False  # Will be checked individually
            },
            
            # 7. Pattern for coordinated structures (detecting "and" or "or" in fronted elements)
            "coordinated_inversion": {
                "pattern": re.compile(
                    r"(?<!\w)(In|On|At|From|To|Into|Under|Over|Within|Behind|Above|Below|Among|Amongst|Between|Through|Across|Around|Along)\s+([^.,;:!?]*?\s+(?:and|or)\s+[^.,;:!?]*?)\s+" + inversion_verbs + r"\s+"
                ),
                "constituent_type": "Coordinated Structure",
                "is_locative": True
            },
            
            # 8. Pattern for numeric expressions
            "numeric_inversion": {
                "pattern": re.compile(
                    r"(?<!\w)(One|Two|Three|Four|Five|Six|Seven|Eight|Nine|Ten|First|Second|Third|Fourth|Fifth|Sixth|Seventh|Eighth|Ninth|Tenth)\s+([^.,;:!?]*?)\s+" + inversion_verbs + r"\s+"
                ),
                "constituent_type": "Numeric Expression",
                "is_locative": False
            }
        }
        
        # Order of pattern checking for standard patterns
        self.standard_patterns = ["existential", "pp_inversion", "adv_inversion", "ap_inversion", "vp_inversion"]
        
        # Order of pattern checking for complex patterns (checked first)
        self.complex_patterns = ["coordinated_inversion", "complex_pp_inversion", "numeric_inversion"]
    
    def load_corpus_files(self):
        """Load all corpus files matching the pattern."""
        pattern = os.path.join(self.corpus_dir, "text_acad_*.txt")
        files = sorted(glob.glob(pattern))
        print(f"Found {len(files)} corpus files")
        return files
    
    def read_file(self, file_path):
        """Read file content with improved error handling."""
        try:
            with open(file_path, 'r', encoding='utf-8') as file:
                return file.read()
        except UnicodeDecodeError:
            try:
                with open(file_path, 'r', encoding='latin-1') as file:
                    return file.read()
            except UnicodeDecodeError:
                # Try additional encodings
                try:
                    with open(file_path, 'r', encoding='cp1252') as file:
                        return file.read()
                except Exception as e:
                    print(f"Error reading {file_path}: {e}")
                    return ""
        except Exception as e:
            print(f"Error reading {file_path}: {e}")
            return ""
    
    def clean_text(self, text):
        """Clean text by replacing paragraph markers and normalizing whitespace."""
        # Replace paragraph markers with a standard marker
        cleaned = self.paragraph_marker_pattern.sub(' <p> ', text)
        # Normalize whitespace
        cleaned = re.sub(r'\s+', ' ', cleaned)
        return cleaned.strip()
    
    def extract_paragraphs(self, text):
        """Extract paragraphs from text based on corpus structure."""
        # Split on paragraph markers
        paragraphs = re.split(r'@@\d+', text)
        # Clean up and remove empty paragraphs
        return [p.strip() for p in paragraphs if p.strip()]
    
    def extract_sentences(self, paragraph):
        """Extract sentences more robustly with improved handling of edge cases."""
        # First, clean the paragraph
        cleaned_para = self.clean_text(paragraph)
        
        # Handle common abbreviations to avoid false sentence breaks
        common_abbr = ["Dr.", "Mr.", "Mrs.", "Ms.", "Prof.", "Ph.D.", "e.g.", "i.e.", "etc.", "vs.", "al.", "Fig.", "No."]
        for abbr in common_abbr:
            cleaned_para = cleaned_para.replace(abbr, abbr.replace(".", "<abbr>"))
        
        # Split on sentence boundaries, respecting abbreviations
        text = re.sub(r'([!?])(?=\s+[A-Z])', r'\1<SENT>', cleaned_para)  # Handle ! and ?
        text = re.sub(r'(\.)(?=\s+[A-Z])', r'\1<SENT>', text)  # Handle periods
        
        # Restore abbreviation periods
        text = text.replace("<abbr>", ".")
        
        sentences = text.split('<SENT>')
        return [s.strip() for s in sentences if s.strip()]
    
    def identify_subject(self, text_after_verb):
        """
        Improved method to identify the subject that follows the verb in an inversion.
        This handles more complex subject structures with enhanced pattern matching
        and provides more consistent results.
        """
        # Skip whitespace at the beginning
        text_after_verb = text_after_verb.lstrip()
        
        # Use a more greedy approach to extract larger chunks
        for marker in self.subject_markers:
            pattern = re.compile(r'(' + re.escape(marker) + r'\s+[^.,;:!?()]*(?:\([^)]*\)[^.,;:!?()]*)*)')
            match = pattern.search(text_after_verb)
            if match and len(match.group(1).split()) >= 2:  # Ensure we get a substantial subject
                return match.group(1).strip()
        
        # Check for proper nouns and capitalized noun phrases
        proper_np_pattern = re.compile(r'([A-Z][a-z]+(?:\s+(?:[A-Z][a-z]+|[a-z]+)){0,5}(?=\s*[.,;:!?()]|\s*$))')
        match = proper_np_pattern.search(text_after_verb)
        if match:
            return match.group(1).strip()
        
        # Fall back to simpler pattern if no match found
        first_chunk = re.search(r'([^.,;:!?()\s]+(?:\s+[^.,;:!?()]+){0,5})', text_after_verb)
        return first_chunk.group(1).strip() if first_chunk else "Unknown subject"
    
    def validate_inversion(self, sentence, fronted, verb, subject):
        """
        Enhanced validation with more deterministic rules to improve confidence assessment consistency.
        Returns a confidence score: "high", "medium", or "low" plus detailed reasons.
        """
        # Define absolute criteria for confidence levels
        confidence = "medium"  # Start with medium confidence
        reasons = []
        
        # Clear criteria for high confidence
        if (any(subject.lower().startswith(marker) for marker in self.subject_markers) and
            verb.lower() in self.common_inversion_verbs and
            len(subject.split()) <= 10):  # Limit subject length for high confidence
            confidence = "high"
            reasons.append("Clear subject with determiner and common verb")
        
        # Additional high confidence indicators
        if confidence != "high" and verb.lower() in ["is", "are", "was", "were"] and len(subject.split()) >= 2:
            confidence = "high"
            reasons.append("Be-verb with substantial subject")
        
        # Medium confidence indicators
        if confidence != "high":
            if verb.lower() in self.common_inversion_verbs:
                reasons.append("Common inversion verb")
            if len(fronted.split()) < 10:
                reasons.append("Reasonable fronted constituent length")
        
        # Clear low confidence criteria
        if "?" in sentence or sentence.strip().endswith('?'):
            confidence = "low"
            reasons.append("Likely a question, not inversion")
        
        if fronted.count('"') % 2 != 0 or ('"' in fronted and '"' in subject):
            confidence = "low"
            reasons.append("Quoted text spans elements")
        
        if subject == "Unknown subject" or not subject:
            confidence = "low"
            reasons.append("Subject could not be properly identified")
        
        if ('(' in fronted and ')' not in fronted) or (')' in fronted and '(' not in fronted):
            confidence = "low"
            reasons.append("Unbalanced parentheses")
        
        if re.search(r'[;:]\s*$', fronted):
            confidence = "low"
            reasons.append("Fronted constituent ends with semicolon or colon")
        
        # Length-based adjustments
        fronted_words = len(fronted.split())
        subject_words = len(subject.split())
        
        if fronted_words > 15 and confidence == "high":
            confidence = "medium"
            reasons.append("Very long fronted constituent")
        
        if fronted_words < subject_words / 2 and confidence == "high":
            confidence = "medium"
            reasons.append("Subject much longer than fronted element")
        
        return confidence, reasons
    
    def process_inversion_pattern(self, sentence, pattern_type):
        """
        Generic method to process a potential inversion pattern.
        This reduces code duplication across different inversion types.
        """
        # Skip if not a valid pattern type
        if pattern_type not in self.pattern_configs:
            return None
        
        config = self.pattern_configs[pattern_type]
        pattern = config["pattern"]
        constituent_type = config["constituent_type"]
        is_locative_default = config["is_locative"]
        
        match = pattern.search(sentence)
        if not match:
            return None
        
        # For existential pattern
        if pattern_type == "existential":
            verb = match.group(1)
            fronted = "There"
            # Get text after the verb to identify the subject
            after_verb = sentence[match.end():]
            
        # For other patterns
        else:
            # Extract components (match groups will differ slightly by pattern)
            if pattern_type in ["pp_inversion", "complex_pp_inversion", "adv_inversion", 
                               "ap_inversion", "vp_inversion", "coordinated_inversion", 
                               "numeric_inversion"]:
                trigger = match.group(1)
                content = match.group(2) if len(match.groups()) > 1 else ""
                verb = match.group(3) if len(match.groups()) > 2 else match.group(2)
                fronted = f"{trigger} {content}".strip()
                # Get text after the verb to identify the subject
                after_verb = sentence[match.start() + len(fronted) + len(verb) + 1:]
            else:
                # Fallback (shouldn't happen with current patterns)
                return None
        
        # Identify the subject consistently
        subject = self.identify_subject(after_verb)
        
        # Determine if locative based on pattern type and content
        is_locative = is_locative_default
        if pattern_type == "adv_inversion":
            # For adverbial inversions, check if trigger is locative
            is_locative = match.group(1).lower() in {"here", "there"}
        elif pattern_type == "vp_inversion":
            # For verb phrase inversions, certain participles indicate location
            is_locative = match.group(1).lower() in {"located", "situated"}
        
        # Validate this inversion
        confidence, reasons = self.validate_inversion(sentence, fronted, verb, subject)
        
        # Create the inversion object
        inversion = {
            "type": pattern_type,
            "sentence": sentence,
            "fronted_constituent": fronted,
            "verb": verb,
            "subject": subject,
            "constituent_type": constituent_type,
            "is_locative": is_locative,
            "confidence": confidence,
            "validation_reasons": reasons
        }
        
        return inversion
    
    def find_inversions_in_sentence(self, sentence):
        """
        Enhanced inversion finder with unified pattern processing to reduce code duplication.
        Uses a more streamlined approach to check different inversion types.
        """
        inversions = []
        
        # Skip very short sentences, questions, and sentences with metadata markers
        if len(sentence) < 10 or sentence.endswith('?') or '<<' in sentence:
            return inversions
        
        # First check complex patterns (may capture more specific cases)
        for pattern_type in self.complex_patterns:
            inversion = self.process_inversion_pattern(sentence, pattern_type)
            if inversion:
                inversions.append(inversion)
                return inversions  # Return as soon as we find a complex match
        
        # If no complex patterns matched, try standard patterns
        for pattern_type in self.standard_patterns:
            inversion = self.process_inversion_pattern(sentence, pattern_type)
            if inversion:
                inversions.append(inversion)
                return inversions  # Return as soon as we find a standard match
        
        return inversions
    
    def analyze_file(self, file_path):
        """Analyze a single file for subject-verb inversions with improved error handling."""
        file_name = os.path.basename(file_path)
        print(f"Processing {file_name}...")
        
        # Read file content
        content = self.read_file(file_path)
        if not content:
            print(f"Warning: Unable to read or empty file: {file_name}")
            return {"file": file_name, "inversions": [], "stats": {
                "total_paragraphs": 0,
                "total_sentences": 0,
                "total_inversions": 0,
                "constituent_types": Counter(),
                "locative_inversions": 0,
                "non_locative_inversions": 0,
                "confidence_levels": Counter(),
                "inversion_types": Counter()
            }}
        
        # Extract paragraphs
        paragraphs = self.extract_paragraphs(content)
        
        # Initialize results for this file
        inversions = []
        stats = {
            "total_paragraphs": len(paragraphs),
            "total_sentences": 0,
            "total_inversions": 0,
            "constituent_types": Counter(),
            "locative_inversions": 0,
            "non_locative_inversions": 0,
            "confidence_levels": Counter(),
            "inversion_types": Counter()
        }
        
        # Process each paragraph
        for para_idx, para in enumerate(paragraphs):
            # Skip very short paragraphs
            if len(para) < 20:
                continue
            
            # Extract sentences
            try:
                sentences = self.extract_sentences(para)
                stats["total_sentences"] += len(sentences)
            except Exception as e:
                print(f"Error extracting sentences from paragraph {para_idx} in {file_name}: {e}")
                continue
            
            # Process each sentence
            for sent_idx, sentence in enumerate(sentences):
                # Find inversions in this sentence
                try:
                    sentence_inversions = self.find_inversions_in_sentence(sentence)
                except Exception as e:
                    print(f"Error analyzing sentence {sent_idx} in paragraph {para_idx}: {e}")
                    continue
                
                # Update statistics and store inversions
                for inv in sentence_inversions:
                    stats["total_inversions"] += 1
                    stats["constituent_types"][inv["constituent_type"]] += 1
                    stats["confidence_levels"][inv["confidence"]] += 1
                    stats["inversion_types"][inv["type"]] += 1
                    
                    if inv["is_locative"]:
                        stats["locative_inversions"] += 1
                    else:
                        stats["non_locative_inversions"] += 1
                    
                    # Add paragraph and sentence references
                    inv["paragraph_index"] = para_idx
                    inv["sentence_index"] = sent_idx
                    inv["file"] = file_name
                    
                    inversions.append(inv)
        
        return {
            "file": file_name,
            "inversions": inversions,
            "stats": stats
        }
    
    def process_files(self, files=None, max_files=None):
        """Process multiple files with improved error handling."""
        if files is None:
            files = self.load_corpus_files()
        
        if max_files:
            files = files[:max_files]
        
        results = []
        
        for i, file_path in enumerate(files):
            print(f"Processing file {i+1}/{len(files)}")
            try:
                results.append(self.analyze_file(file_path))
            except Exception as e:
                print(f"Error processing file {file_path}: {e}")
                # Create an empty result to maintain file count
                results.append({
                    "file": os.path.basename(file_path),
                    "inversions": [],
                    "stats": {
                        "total_paragraphs": 0,
                        "total_sentences": 0,
                        "total_inversions": 0,
                        "constituent_types": Counter(),
                        "locative_inversions": 0,
                        "non_locative_inversions": 0,
                        "confidence_levels": Counter(),
                        "inversion_types": Counter()
                    }
                })
        
        return results
    
    def aggregate_results(self, results):
        """Aggregate results from multiple files."""
        aggregate = {
            "total_files": len(results),
            "total_paragraphs": sum(r["stats"]["total_paragraphs"] for r in results),
            "total_sentences": sum(r["stats"]["total_sentences"] for r in results),
            "total_inversions": sum(r["stats"]["total_inversions"] for r in results),
            "constituent_types": Counter(),
            "locative_inversions": sum(r["stats"]["locative_inversions"] for r in results),
            "non_locative_inversions": sum(r["stats"]["non_locative_inversions"] for r in results),
            "confidence_levels": Counter(),
            "inversion_types": Counter(),
            "inversions_by_file": {r["file"]: r["stats"]["total_inversions"] for r in results},
            "complex_inversions_count": 0,
            "all_inversions": []
        }
        
        # Combine counters from individual files
        for r in results:
            for const_type, count in r["stats"]["constituent_types"].items():
                aggregate["constituent_types"][const_type] += count
            
            # Combine confidence levels
            for level, count in r["stats"].get("confidence_levels", {}).items():
                aggregate["confidence_levels"][level] += count
                
            # Combine inversion types
            for inv_type, count in r["stats"].get("inversion_types", {}).items():
                aggregate["inversion_types"][inv_type] += count
                # Count complex inversions specifically
                if inv_type in ["complex_pp_inversion", "coordinated_inversion", "numeric_inversion"]:
                    aggregate["complex_inversions_count"] += count
        
        # Collect all inversions
        for r in results:
            aggregate["all_inversions"].extend(r["inversions"])
        
        return aggregate
    
    def filter_by_confidence(self, all_inversions, min_confidence="low"):
        """Filter inversions by confidence level."""
        confidence_levels = {"high": 3, "medium": 2, "low": 1}
        min_level = confidence_levels.get(min_confidence, 1)
        
        filtered = [inv for inv in all_inversions 
                if confidence_levels.get(inv.get("confidence", "low"), 0) >= min_level]
        
        # Log filtering information
        total = len(all_inversions)
        filtered_count = len(filtered)
        print(f"Filtering: including {filtered_count}/{total} inversions ({total-filtered_count} excluded)")
        
        return filtered
    
    def save_results(self, aggregate_results):
        """Save results to various output formats with enhanced details."""
        # Create output paths
        out_base = os.path.join(self.output_dir, "inversion_analysis")
        
        # Save summary as JSON
        with open(f"{out_base}_summary.json", 'w', encoding='utf-8') as f:
            # Create a version of the results that can be serialized to JSON
            summary = {
                key: value for key, value in aggregate_results.items() 
                if key != "all_inversions" and key != "constituent_types" and 
                key != "confidence_levels" and key != "inversion_types"
            }
            # Convert Counters to dict
            summary["constituent_types"] = dict(aggregate_results["constituent_types"])
            summary["confidence_levels"] = dict(aggregate_results["confidence_levels"])
            summary["inversion_types"] = dict(aggregate_results["inversion_types"])
            json.dump(summary, f, indent=2)
        
        # Filter to high/medium confidence inversions
        filtered_inversions = self.filter_by_confidence(aggregate_results["all_inversions"], "medium")
        
        # Ensure validation_reasons are properly serialized
        for inv in filtered_inversions:
            if isinstance(inv.get("validation_reasons"), list):
                inv["validation_reasons_str"] = "; ".join(inv["validation_reasons"])
        
        # Save filtered inversions as CSV
        with open(f"{out_base}_examples.csv", 'w', newline='', encoding='utf-8') as f:
            if not filtered_inversions:
                f.write("No inversions found\n")
                return
                
            # Get field names from the first inversion
            fieldnames = [field for field in filtered_inversions[0].keys() 
                         if field not in ["previous_sentence", "next_sentence", "validation_reasons"]]
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            for inversion in filtered_inversions:
                # Create a copy without context fields
                inv_copy = {k: v for k, v in inversion.items() if k in fieldnames}
                writer.writerow(inv_copy)
        
        # Save a separate CSV with only complex inversions for focused analysis
        complex_inversions = [inv for inv in filtered_inversions 
                             if inv.get("type") in ["complex_pp_inversion", "coordinated_inversion", "numeric_inversion"]]
        with open(f"{out_base}_complex_examples.csv", 'w', newline='', encoding='utf-8') as f:
            if not complex_inversions:
                f.write("No complex inversions found\n")
            else:
                # Use the same fieldnames, plus validation reasons
                fieldnames = [field for field in complex_inversions[0].keys() 
                             if field not in ["previous_sentence", "next_sentence"]]
                # Add validation_reasons_str if available
                if "validation_reasons_str" not in fieldnames and "validation_reasons_str" in complex_inversions[0]:
                    fieldnames.append("validation_reasons_str")
                
                writer = csv.DictWriter(f, fieldnames=fieldnames)
                writer.writeheader()
                for inversion in complex_inversions:
                    # Create a copy without context fields, but keep validation reasons
                    inv_copy = {k: v for k, v in inversion.items() if k in fieldnames}
                    writer.writerow(inv_copy)
        
        # Create a comprehensive human-readable report
        with open(f"{out_base}_report.txt", 'w', encoding='utf-8') as f:
            f.write("=== Subject-Verb Inversion Analysis Report ===\n\n")
            f.write(f"Files analyzed: {aggregate_results['total_files']}\n")
            f.write(f"Total paragraphs: {aggregate_results['total_paragraphs']}\n")
            f.write(f"Total sentences: {aggregate_results['total_sentences']}\n")
            
            total_inv = aggregate_results['total_inversions']
            total_sent = aggregate_results['total_sentences']
            
            f.write(f"Total inversions found: {total_inv} ")
            if total_sent > 0:
                f.write(f"({total_inv/total_sent*100:.2f}% of sentences)\n")
            else:
                f.write("(0% of sentences)\n")
                
            # Complex inversion stats
            complex_count = aggregate_results.get('complex_inversions_count', 0)
            f.write(f"Complex inversions: {complex_count} ")
            if total_inv > 0:
                f.write(f"({complex_count/total_inv*100:.2f}% of all inversions)\n")
            else:
                f.write("(0% of all inversions)\n")
            
            # Confidence levels
            f.write("\n=== Confidence Levels ===\n")
            for level, count in aggregate_results["confidence_levels"].most_common():
                f.write(f"{level.capitalize()}: {count} ")
                if total_inv > 0:
                    f.write(f"({count/total_inv*100:.1f}%)\n")
                else:
                    f.write("(0%)\n")
            
            # Inversion types
            f.write("\n=== Inversion Types ===\n")
            for inv_type, count in aggregate_results["inversion_types"].most_common():
                f.write(f"{inv_type}: {count} ")
                if total_inv > 0:
                    f.write(f"({count/total_inv*100:.1f}%)\n")
                else:
                    f.write("(0%)\n")
            
            # Constituent types
            f.write("\n=== Constituent Types ===\n")
            for const_type, count in aggregate_results["constituent_types"].most_common():
                f.write(f"{const_type}: {count} ")
                if total_inv > 0:
                    f.write(f"({count/total_inv*100:.1f}%)\n")
                else:
                    f.write("(0%)\n")
            
            # Locative stats
            f.write(f"\nLocative inversions: {aggregate_results['locative_inversions']} ")
            if total_inv > 0:
                f.write(f"({aggregate_results['locative_inversions']/total_inv*100:.1f}%)\n")
            else:
                f.write("(0%)\n")
                
            f.write(f"Non-locative inversions: {aggregate_results['non_locative_inversions']} ")
            if total_inv > 0:
                f.write(f"({aggregate_results['non_locative_inversions']/total_inv*100:.1f}%)\n\n")
            else:
                f.write("(0%)\n\n")
            
            # Examples section
            f.write("=== Example inversions (high/medium confidence only) ===\n")
            for i, inv in enumerate(filtered_inversions[:25]):  # First 25 examples
                f.write(f"\n{i+1}. {inv['sentence']}\n")
                f.write(f"   File: {inv['file']}\n")
                f.write(f"   Type: {inv['type']}\n")
                f.write(f"   Constituent type: {inv['constituent_type']}\n")
                f.write(f"   Fronted constituent: '{inv['fronted_constituent']}'\n")
                f.write(f"   Verb: '{inv['verb']}'\n")
                f.write(f"   Subject: '{inv['subject']}'\n")
                f.write(f"   Locative: {'Yes' if inv['is_locative'] else 'No'}\n")
                f.write(f"   Confidence: {inv['confidence'].capitalize()}\n")
                if "validation_reasons" in inv:
                    f.write(f"   Validation: {', '.join(inv['validation_reasons'])}\n")
            
            # Complex inversions examples section
            f.write("\n\n=== Complex Inversion Examples ===\n")
            for i, inv in enumerate(complex_inversions[:15]):  # First 15 complex examples
                f.write(f"\n{i+1}. {inv['sentence']}\n")
                f.write(f"   File: {inv['file']}\n")
                f.write(f"   Type: {inv['type']}\n")
                f.write(f"   Constituent type: {inv['constituent_type']}\n")
                f.write(f"   Fronted constituent: '{inv['fronted_constituent']}'\n")
                f.write(f"   Verb: '{inv['verb']}'\n")
                f.write(f"   Subject: '{inv['subject']}'\n")
                f.write(f"   Locative: {'Yes' if inv['is_locative'] else 'No'}\n")
                f.write(f"   Confidence: {inv['confidence'].capitalize()}\n")
                if "validation_reasons" in inv:
                    f.write(f"   Validation: {', '.join(inv['validation_reasons'])}\n")
        
        print(f"Results saved to {self.output_dir} directory")

    def run_validation_tests(self, test_sentences=None):
        """
        Run validation tests on complex inversion examples to verify pattern matching accuracy.
        
        Args:
            test_sentences: Optional list of test sentences. If None, will use built-in examples.
        
        Returns:
            dict: Test results statistics
        """
        if test_sentences is None:
            # Default test sentences covering complex inversions
            test_sentences = [
                "Under the new policy adopted by the administration last year is a provision for student loan forgiveness.",
                "In the middle of the vast and barren landscape, surrounded by mountains, stood a solitary tree.",
                "Along the river that winds through the valley below the ancient castle flows a current of unusual strength.",
                "Within the framework of postmodernist theory, which rejects grand narratives, exists a paradoxical reliance on metanarratives.",
                "Below the surface of what initially seems a straightforward argument lies a complex web of assumptions.",
                "Among the ruins that archaeologists uncovered last summer, carefully preserved, lay several ancient manuscripts.",
                "Within the data collected over decades and analyzed using modern techniques emerges a clear pattern.",
                "Around the castle and throughout the surrounding forest roamed many wild animals.",
                "Between the mountains and across the valleys flows a mighty river.",
                "Central to her argument stands the notion of embodied cognition.",
                # Additional test sentences to improve validation coverage
                "On the table where we had dinner last night sat a vase of flowers.",
                "Among the proposals that the committee considered was a plan for reducing costs.",
                "Beside the road that winds through the mountains stands a small chapel."
            ]
        
        results = {
            "total_tests": len(test_sentences),
            "detected": 0,
            "undetected": 0,
            "by_confidence": Counter(),
            "by_type": Counter(),
            "details": []
        }
        
        for sentence in test_sentences:
            inversions = self.find_inversions_in_sentence(sentence)
            
            if inversions:
                results["detected"] += 1
                inversion = inversions[0]  # Take the first inversion match
                results["by_confidence"][inversion["confidence"]] += 1
                results["by_type"][inversion["type"]] += 1
                
                results["details"].append({
                    "sentence": sentence,
                    "detected": True,
                    "type": inversion["type"],
                    "constituent_type": inversion["constituent_type"],
                    "confidence": inversion["confidence"],
                    "fronted": inversion["fronted_constituent"],
                    "verb": inversion["verb"],
                    "subject": inversion["subject"]
                })
            else:
                results["undetected"] += 1
                results["details"].append({
                    "sentence": sentence,
                    "detected": False
                })
        
        # Calculate success rate
        results["success_rate"] = results["detected"] / results["total_tests"] if results["total_tests"] > 0 else 0
        
        return results

def main():
    # Configure the analyzer with explicit data directory
    finder = EnhancedInversionFinder(
        corpus_dir="data",  # Use data directory for corpus files
        output_dir="inversion_results"
    )
    
    # Optional: Run validation tests on complex inversions before full analysis
    print("\nValidating complex inversion detection...")
    validation_results = finder.run_validation_tests()
    print(f"Complex inversion detection rate: {validation_results['success_rate']:.2f}")
    print(f"Detected: {validation_results['detected']}/{validation_results['total_tests']}")
    
    # Load corpus files
    files = finder.load_corpus_files()
    
    # Process files (limit to 5 for testing, remove max_files for full analysis)
    print("\nAnalyzing corpus for subject-verb inversion...")
    results = finder.process_files(files, max_files=5)
    
    # Aggregate results
    print("\nAggregating results...")
    aggregate = finder.aggregate_results(results)
    
    # Filter to high/medium confidence
    filtered_inversions = finder.filter_by_confidence(aggregate["all_inversions"], "medium")
    
    # Print summary statistics
    print("\n=== Subject-Verb Inversion Analysis ===")
    print(f"Files analyzed: {aggregate['total_files']}")
    print(f"Total paragraphs: {aggregate['total_paragraphs']}")
    print(f"Total sentences: {aggregate['total_sentences']}")
    
    total_inv = aggregate['total_inversions']
    total_sent = aggregate['total_sentences']
    
    if total_sent > 0:
        print(f"Total inversions found: {total_inv} ({total_inv/total_sent*100:.2f}% of sentences)")
    else:
        print(f"Total inversions found: {total_inv} (0% of sentences)")
        
    # Print complex inversion stats
    complex_count = aggregate.get('complex_inversions_count', 0)
    if total_inv > 0:
        print(f"Complex inversions: {complex_count} ({complex_count/total_inv*100:.2f}% of all inversions)")
    else:
        print(f"Complex inversions: {complex_count} (0% of all inversions)")
    
    # Print confidence levels
    print("\nConfidence Levels:")
    for level, count in aggregate["confidence_levels"].most_common():
        if total_inv > 0:
            print(f"  {level.capitalize()}: {count} ({count/total_inv*100:.1f}%)")
        else:
            print(f"  {level.capitalize()}: {count} (0%)")
    
    # Print inversion types
    print("\nInversion Types:")
    for inv_type, count in aggregate["inversion_types"].most_common():
        if total_inv > 0:
            print(f"  {inv_type}: {count} ({count/total_inv*100:.1f}%)")
        else:
            print(f"  {inv_type}: {count} (0%)")
    
    # Print constituent types
    print("\nConstituent Types:")
    for const_type, count in aggregate["constituent_types"].most_common():
        if total_inv > 0:
            print(f"  {const_type}: {count} ({count/total_inv*100:.1f}%)")
        else:
            print(f"  {const_type}: {count} (0%)")
    
    if total_inv > 0:
        print(f"\nLocative inversions: {aggregate['locative_inversions']} ({aggregate['locative_inversions']/total_inv*100:.1f}%)")
        print(f"Non-locative inversions: {aggregate['non_locative_inversions']} ({aggregate['non_locative_inversions']/total_inv*100:.1f}%)")
    else:
        print(f"\nLocative inversions: {aggregate['locative_inversions']} (0%)")
        print(f"Non-locative inversions: {aggregate['non_locative_inversions']} (0%)")
    
    # Display examples (limit to first 10 high/medium confidence)
    if filtered_inversions:
        print("\nExample inversions (high/medium confidence only):")
        for i, inv in enumerate(filtered_inversions[:10]):
            print(f"\n{i+1}. {inv['sentence']}")
            print(f"   Type: {inv['type']}")
            print(f"   Constituent type: {inv['constituent_type']}")
            print(f"   Fronted constituent: '{inv['fronted_constituent']}'")
            print(f"   Verb: '{inv['verb']}'")
            print(f"   Subject: '{inv['subject']}'")
            print(f"   Locative: {'Yes' if inv['is_locative'] else 'No'}")
            print(f"   Confidence: {inv['confidence'].capitalize()}")
    else:
        print("\nNo high/medium confidence inversions found in the analyzed files.")
    
    # Display complex inversion examples specifically
    complex_examples = [inv for inv in filtered_inversions 
                      if inv.get("type") in ["complex_pp_inversion", "coordinated_inversion", "numeric_inversion"]]
    if complex_examples:
        print("\nComplex inversion examples:")
        for i, inv in enumerate(complex_examples[:5]):
            print(f"\n{i+1}. {inv['sentence']}")
            print(f"   Type: {inv['type']}")
            print(f"   Constituent type: {inv['constituent_type']}")
            print(f"   Fronted constituent: '{inv['fronted_constituent']}'")
            print(f"   Verb: '{inv['verb']}'")
            print(f"   Subject: '{inv['subject']}'")
    
    # Save detailed results to files
    finder.save_results(aggregate)
    print("\nAnalysis complete! Detailed results saved to the 'inversion_results' directory.")

if __name__ == "__main__":
    main()