import os
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import time
from datetime import datetime

# Import our analysis modules
# Assuming the previous code is saved in separate Python files
from python_visualizations import generate_all_visualizations
from additional_analyses import run_all_analyses
from contextual_analysis import run_contextual_analyses

def create_output_directory():
    """
    Create an output directory for results
    """
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    output_dir = f"inversion_analysis_{timestamp}"
    
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
        print(f"Created output directory: {output_dir}")
    
    return output_dir

def generate_summary_report(file_path, output_dir):
    """
    Generate a simple summary report about the data
    """
    # Load the data
    df = pd.read_csv(file_path)
    
    # Basic statistics
    report = {
        'total_inversions': len(df),
        'fronted_element_types': df['Fronted Element Type'].value_counts().to_dict() if 'Fronted Element Type' in df.columns else {},
        'locative_counts': df['Locative'].value_counts().to_dict() if 'Locative' in df.columns else {},
        'discourse_functions': df['Discourse Function'].value_counts().to_dict() if 'Discourse Function' in df.columns else {},
        'information_structure': df['Information Structure'].value_counts().to_dict() if 'Information Structure' in df.columns else {},
    }
    
    # Write report to file
    with open(f"{output_dir}/summary_report.txt", "w") as f:
        f.write("SUBJECT-VERB INVERSION CORPUS ANALYSIS\n")
        f.write("=====================================\n\n")
        f.write(f"Analysis Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        f.write(f"Data Source: {file_path}\n\n")
        
        f.write(f"Total inversions analyzed: {report['total_inversions']}\n\n")
        
        if report['fronted_element_types']:
            f.write("FRONTED ELEMENT TYPES\n")
            f.write("--------------------\n")
            for type_name, count in sorted(report['fronted_element_types'].items(), key=lambda x: x[1], reverse=True):
                f.write(f"{type_name}: {count} ({count/report['total_inversions']*100:.1f}%)\n")
            f.write("\n")
        
        if report['locative_counts']:
            f.write("LOCATIVE VS. NON-LOCATIVE\n")
            f.write("------------------------\n")
            for loc_type, count in sorted(report['locative_counts'].items(), key=lambda x: x[1], reverse=True):
                f.write(f"{loc_type}: {count} ({count/report['total_inversions']*100:.1f}%)\n")
            f.write("\n")
        
        if report['discourse_functions']:
            f.write("DISCOURSE FUNCTIONS\n")
            f.write("------------------\n")
            for func, count in sorted(report['discourse_functions'].items(), key=lambda x: x[1], reverse=True):
                f.write(f"{func}: {count} ({count/report['total_inversions']*100:.1f}%)\n")
            f.write("\n")
        
        if report['information_structure']:
            f.write("INFORMATION STRUCTURE\n")
            f.write("--------------------\n")
            for structure, count in sorted(report['information_structure'].items(), key=lambda x: x[1], reverse=True):
                f.write(f"{structure}: {count} ({count/report['total_inversions']*100:.1f}%)\n")
            f.write("\n")
    
    print(f"Summary report generated: {output_dir}/summary_report.txt")
    return report

def main():
    """
    Run the full subject-verb inversion analysis pipeline
    """
    # Start timing
    start_time = time.time()
    
    # Set the file path
    file_path = "../data/corpus_inversions_20250324_133147.csv"
    
    # Create output directory
    output_dir = create_output_directory()
    
    print(f"Starting analysis of {file_path}")
    print(f"Results will be saved to {output_dir}\n")
    
    try:
        # Generate summary report
        print("\n=== GENERATING SUMMARY REPORT ===")
        summary = generate_summary_report(file_path, output_dir)
        
        # Run basic visualizations
        print("\n=== GENERATING BASIC VISUALIZATIONS ===")
        generate_all_visualizations(file_path)
        
        # Run advanced statistical analyses
        print("\n=== RUNNING ADVANCED STATISTICAL ANALYSES ===")
        advanced_results = run_all_analyses(file_path)
        
        # Run contextual analyses
        print("\n=== RUNNING CONTEXTUAL ANALYSES ===")
        contextual_results = run_contextual_analyses(file_path, output_dir)
        
        # End timing
        end_time = time.time()
        elapsed_time = end_time - start_time
        
        print("\n=== ANALYSIS COMPLETE ===")
        print(f"Total time: {elapsed_time:.2f} seconds")
        print(f"All results saved to {output_dir}")
        
    except Exception as e:
        print(f"\nERROR: Analysis failed with error: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()