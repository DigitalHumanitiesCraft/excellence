import os
import json
import csv
import random
from pathlib import Path

def create_visualization_data(results_dir="inversion_results", output_dir="visualization_data"):
    """
    Process inversion analysis results into JSON files optimized for web visualization.
    
    Args:
        results_dir: Directory containing the analysis results
        output_dir: Directory where the visualization data will be saved
    """
    # Create output directory if it doesn't exist
    os.makedirs(output_dir, exist_ok=True)
    
    # Step 1: Load the summary data
    summary_file = os.path.join(results_dir, "inversion_analysis_summary.json")
    with open(summary_file, "r", encoding="utf-8") as f:
        summary_data = json.load(f)
    
    # Step 2: Transform the summary data for visualization
    viz_summary = {
        "total_files": summary_data["total_files"],
        "total_paragraphs": summary_data["total_paragraphs"],
        "total_sentences": summary_data["total_sentences"],
        "total_inversions": summary_data["total_inversions"],
        "locative_inversions": summary_data["locative_inversions"],
        "non_locative_inversions": summary_data["non_locative_inversions"],
        "complex_inversions_count": summary_data["complex_inversions_count"],
        "constituent_types": summary_data["constituent_types"],
        "confidence_levels": summary_data["confidence_levels"],
        "inversion_types": summary_data["inversion_types"]
    }
    
    # Save the transformed summary data
    with open(os.path.join(output_dir, "summary.json"), "w", encoding="utf-8") as f:
        json.dump(viz_summary, f, indent=2)
    
    print(f"Created summary.json with statistics for {viz_summary['total_inversions']} inversions")
    
    # Step 3: Process examples for the visualization
    # Load from the CSV files (samples from both regular and complex examples)
    examples = []
    
    # Load from regular examples file
    examples_file = os.path.join(results_dir, "inversion_analysis_examples.csv")
    if os.path.exists(examples_file):
        with open(examples_file, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            # Take a sample of regular examples (up to 100)
            examples.extend(list(reader)[:100])
    
    # Load from complex examples file for additional samples
    complex_file = os.path.join(results_dir, "inversion_analysis_complex_examples.csv")
    if os.path.exists(complex_file):
        with open(complex_file, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            complex_examples = list(reader)
            # Get examples by type to ensure good distribution
            by_type = {}
            for ex in complex_examples:
                by_type.setdefault(ex['type'], []).append(ex)
            
            # Take up to 20 examples of each type
            selected = []
            for type_examples in by_type.values():
                selected.extend(type_examples[:20])
            
            # Add these to our examples list
            examples.extend(selected)
    
    # Deduplicate examples (in case of overlap between files)
    unique_examples = []
    seen = set()
    for ex in examples:
        # Create a key from the sentence (which should be unique)
        key = ex['sentence']
        if key not in seen:
            seen.add(key)
            unique_examples.append(ex)
    
    # If we have too many examples, sample them
    if len(unique_examples) > 200:
        # Ensure a good distribution across types
        by_type = {}
        for ex in unique_examples:
            by_type.setdefault(ex['type'], []).append(ex)
        
        # Create a representative sample
        sampled_examples = []
        for type_name, type_examples in by_type.items():
            # Calculate how many to take based on proportion in overall data
            proportion = summary_data["inversion_types"].get(type_name, 0) / summary_data["total_inversions"]
            count = max(3, int(proportion * 200))  # Ensure at least 3 examples per type
            # Randomly sample from this type
            sampled = random.sample(type_examples, min(count, len(type_examples)))
            sampled_examples.extend(sampled)
        
        # If we still have room, add more examples randomly
        if len(sampled_examples) < 200:
            remaining = set(unique_examples) - set(sampled_examples)
            sampled_examples.extend(random.sample(list(remaining), 
                                                min(200 - len(sampled_examples), len(remaining))))
        
        unique_examples = sampled_examples
    
    # Process examples to add highlighting information
    processed_examples = []
    for ex in unique_examples:
        processed = {
            "type": ex.get("type", "unknown"),
            "sentence": ex.get("sentence", ""),
            "constituent_type": ex.get("constituent_type", "Unknown"),
            "fronted_constituent": ex.get("fronted_constituent", ""),
            "verb": ex.get("verb", ""),
            "subject": ex.get("subject", "Unknown subject"),
            "is_locative": ex.get("is_locative", "false").lower() == "true",
            "confidence": ex.get("confidence", "medium").lower()
        }
        processed_examples.append(processed)
    
    # Save examples data
    with open(os.path.join(output_dir, "examples.json"), "w", encoding="utf-8") as f:
        json.dump(processed_examples, f, indent=2)
    
    print(f"Created examples.json with {len(processed_examples)} representative examples")
    
    # Step 4: Create distribution data for additional charts
    distribution_data = {
        # By file
        "by_file": {f: c for f, c in summary_data.get("inversions_by_file", {}).items()},
        
        # By confidence
        "by_confidence": {
            "labels": list(summary_data.get("confidence_levels", {}).keys()),
            "values": list(summary_data.get("confidence_levels", {}).values())
        },
        
        # By constituent type
        "by_constituent": {
            "labels": list(summary_data.get("constituent_types", {}).keys()),
            "values": list(summary_data.get("constituent_types", {}).values())
        },
        
        # By inversion type
        "by_type": {
            "labels": list(summary_data.get("inversion_types", {}).keys()),
            "values": list(summary_data.get("inversion_types", {}).values())
        },
        
        # Locative vs non-locative
        "by_locative": {
            "labels": ["Locative", "Non-locative"],
            "values": [
                summary_data.get("locative_inversions", 0),
                summary_data.get("non_locative_inversions", 0)
            ]
        }
    }
    
    # Save distribution data
    with open(os.path.join(output_dir, "distributions.json"), "w", encoding="utf-8") as f:
        json.dump(distribution_data, f, indent=2)
    
    print("Created distributions.json with chart data")
    
    # Step 5: Create a configuration file with metadata
    config_data = {
        "title": "Subject-Verb Inversion in Academic Writing",
        "description": "Interactive visualization of subject-verb inversion patterns in academic English texts.",
        "version": "1.0.0",
        "lastUpdated": "2025-03-20",
        "dataSource": {
            "files": summary_data["total_files"],
            "sentences": summary_data["total_sentences"],
            "inversions": summary_data["total_inversions"]
        },
        "chartColors": {
            # Default color schemes for charts
            "constituentTypes": [
                "#3498db", "#2ecc71", "#f1c40f", "#e74c3c", 
                "#9b59b6", "#1abc9c", "#d35400", "#34495e"
            ],
            "confidenceLevels": {
                "high": "#27ae60",
                "medium": "#f39c12",
                "low": "#e74c3c"
            },
            "inversionTypes": [
                "#3498db", "#2ecc71", "#f1c40f", "#e74c3c", 
                "#9b59b6", "#1abc9c", "#d35400", "#34495e"
            ],
            "locativeTypes": ["#3498db", "#e74c3c"]
        }
    }
    
    # Save configuration data
    with open(os.path.join(output_dir, "config.json"), "w", encoding="utf-8") as f:
        json.dump(config_data, f, indent=2)
    
    print("Created config.json with visualization configuration")
    
    print(f"\nAll visualization data files created in '{output_dir}' directory.")
    print("You can now use these files with the web visualization interface.")

if __name__ == "__main__":
    # Check if results directory exists
    if not os.path.exists("inversion_results"):
        print("Error: 'inversion_results' directory not found.")
        print("Please run subject-verb-inversion-finder.py first to generate analysis results.")
        exit(1)
    
    # Create visualization data
    create_visualization_data()