import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.feature_extraction.text import CountVectorizer
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
import nltk
import re
from collections import Counter

# Download NLTK resources if needed
try:
    nltk.data.find('tokenizers/punkt')
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('punkt')
    nltk.download('stopwords')

def load_data(file_path):
    """
    Load and prepare the CSV data
    """
    df = pd.read_csv(file_path)
    print(f"Loaded {len(df)} rows from {file_path}")
    return df

def analyze_context_keywords(df, output_dir='.'):
    """
    Analyze keywords in the context around inversions
    """
    print("\nAnalyzing contextual keywords...")
    
    # Combine fronted elements for analysis
    all_fronted = df['Fronted Element'].dropna().astype(str).tolist()
    
    # Get English stopwords
    stop_words = set(stopwords.words('english'))
    
    # Additional words to exclude (common function words and prepositions)
    additional_exclude = {'in', 'on', 'at', 'by', 'to', 'from', 'with', 'for', 'of', 'the', 
                         'a', 'an', 'and', 'or', 'is', 'are', 'was', 'were', 'be', 'been',
                         'this', 'that', 'these', 'those', 'there', 'here', 'their', 'its'}
    stop_words.update(additional_exclude)
    
    # Process text to extract meaningful words
    def extract_keywords(text):
        # Lowercase and tokenize
        tokens = word_tokenize(text.lower())
        # Remove stopwords, short words, and non-alphabetic tokens
        keywords = [word for word in tokens if word not in stop_words 
                   and len(word) > 2 and word.isalpha()]
        return keywords
    
    # Extract keywords from all fronted elements
    all_keywords = []
    for text in all_fronted:
        all_keywords.extend(extract_keywords(text))
    
    # Count keyword frequencies
    keyword_counts = Counter(all_keywords)
    top_keywords = keyword_counts.most_common(20)
    
    print("Top 20 keywords in fronted elements:")
    for word, count in top_keywords:
        print(f"  {word}: {count}")
    
    # Visualize top keywords
    plt.figure(figsize=(12, 8))
    words, counts = zip(*top_keywords)
    sns.barplot(x=list(counts), y=list(words), palette='viridis')
    plt.title('Top 20 Keywords in Fronted Elements', fontsize=16)
    plt.xlabel('Frequency', fontsize=14)
    plt.ylabel('Keyword', fontsize=14)
    plt.tight_layout()
    plt.savefig(f'{output_dir}/top_keywords.png', dpi=300)
    plt.close()
    
    # Analyze keywords by locative status
    if 'Locative' in df.columns:
        locative_keywords = []
        non_locative_keywords = []
        
        for i, row in df.iterrows():
            if pd.isna(row['Fronted Element']) or pd.isna(row['Locative']):
                continue
                
            keywords = extract_keywords(str(row['Fronted Element']))
            
            if row['Locative'] == 'yes':
                locative_keywords.extend(keywords)
            elif row['Locative'] == 'no':
                non_locative_keywords.extend(keywords)
        
        # Count keyword frequencies
        locative_counts = Counter(locative_keywords).most_common(10)
        non_locative_counts = Counter(non_locative_keywords).most_common(10)
        
        print("\nTop 10 keywords in locative fronted elements:")
        for word, count in locative_counts:
            print(f"  {word}: {count}")
            
        print("\nTop 10 keywords in non-locative fronted elements:")
        for word, count in non_locative_counts:
            print(f"  {word}: {count}")
        
        # Combine for visualization
        loc_words, loc_counts = zip(*locative_counts) if locative_counts else ([], [])
        non_loc_words, non_loc_counts = zip(*non_locative_counts) if non_locative_counts else ([], [])
        
        # Create comparative visualization
        if loc_words and non_loc_words:
            fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(16, 8))
            
            # Locative keywords
            sns.barplot(x=list(loc_counts), y=list(loc_words), palette='Blues_r', ax=ax1)
            ax1.set_title('Top Keywords in Locative Fronted Elements', fontsize=14)
            ax1.set_xlabel('Frequency', fontsize=12)
            ax1.set_ylabel('Keyword', fontsize=12)
            
            # Non-locative keywords
            sns.barplot(x=list(non_loc_counts), y=list(non_loc_words), palette='Oranges_r', ax=ax2)
            ax2.set_title('Top Keywords in Non-locative Fronted Elements', fontsize=14)
            ax2.set_xlabel('Frequency', fontsize=12)
            ax2.set_ylabel('', fontsize=12)  # No label needed for second plot
            
            plt.tight_layout()
            plt.savefig(f'{output_dir}/locative_vs_nonlocative_keywords.png', dpi=300)
            plt.close()
    
    return {
        'top_keywords': dict(top_keywords),
        'locative_keywords': dict(locative_counts) if 'locative_counts' in locals() else {},
        'non_locative_keywords': dict(non_locative_counts) if 'non_locative_counts' in locals() else {}
    }

def analyze_fronted_element_patterns(df, output_dir='.'):
    """
    Analyze syntactic patterns in fronted elements
    """
    print("\nAnalyzing fronted element patterns...")
    
    # Function to classify the start of fronted elements
    def classify_start(text):
        if pd.isna(text):
            return 'Unknown'
            
        text = str(text).strip().lower()
        
        # Check for prepositions at the beginning
        prepositions = ['in', 'on', 'at', 'by', 'with', 'from', 'to', 'into', 'onto', 'under', 
                        'over', 'through', 'behind', 'below', 'above', 'beside', 'beneath', 
                        'between', 'beyond', 'among', 'across', 'around', 'along', 'against']
        
        for prep in prepositions:
            if text.startswith(f"{prep} "):
                return 'Preposition'
        
        # Check for adverbs at the beginning
        adverbs = ['here', 'there', 'now', 'then', 'thus', 'hence', 'perhaps', 'maybe', 
                  'clearly', 'obviously', 'certainly', 'surely', 'indeed', 'especially',
                  'particularly', 'specifically', 'notably', 'importantly', 'significantly']
        
        for adv in adverbs:
            if text.startswith(f"{adv} ") or text == adv:
                return 'Adverb'
        
        # Check for adjectives at the beginning
        adjectives = ['more', 'less', 'most', 'least', 'better', 'worse', 'best', 'worst',
                     'important', 'significant', 'crucial', 'critical', 'essential', 'necessary',
                     'interesting', 'surprising', 'striking', 'remarkable', 'notable', 'notable']
        
        for adj in adjectives:
            if text.startswith(f"{adj} ") or text == adj:
                return 'Adjective'
                
        # Default case
        return 'Other'
    
    # Classify fronted elements
    df['Fronted_Start'] = df['Fronted Element'].apply(classify_start)
    
    # Count the frequencies of each start type
    start_counts = df['Fronted_Start'].value_counts()
    
    print("Distribution of fronted element start types:")
    for start, count in start_counts.items():
        print(f"  {start}: {count} ({count/len(df)*100:.1f}%)")
    
    # Visualize
    plt.figure(figsize=(10, 6))
    sns.barplot(x=start_counts.index, y=start_counts.values, palette='viridis')
    plt.title('Distribution of Fronted Element Start Types', fontsize=16)
    plt.xlabel('Start Type', fontsize=14)
    plt.ylabel('Count', fontsize=14)
    plt.xticks(rotation=0)
    plt.tight_layout()
    plt.savefig(f'{output_dir}/fronted_start_types.png', dpi=300)
    plt.close()
    
    # Analyze relationship between start type and discourse function
    if 'Discourse Function' in df.columns:
        # Create a cross-tabulation
        cross_tab = pd.crosstab(df['Fronted_Start'], df['Discourse Function'], normalize='index') * 100
        
        print("\nRelationship between fronted element start type and discourse function (%):")
        print(cross_tab)
        
        # Visualize
        plt.figure(figsize=(14, 10))
        sns.heatmap(cross_tab, annot=True, cmap='YlGnBu', fmt='.1f')
        plt.title('Relationship Between Fronted Element Start Types and Discourse Functions (%)', fontsize=16)
        plt.xlabel('Discourse Function', fontsize=14)
        plt.ylabel('Fronted Element Start Type', fontsize=14)
        plt.tight_layout()
        plt.savefig(f'{output_dir}/start_type_vs_discourse.png', dpi=300)
        plt.close()
    
    # Function to get the length of fronted elements in words
    def count_words(text):
        if pd.isna(text):
            return 0
        return len(str(text).split())
    
    # Add length information
    df['Fronted_Length'] = df['Fronted Element'].apply(count_words)
    
    # Analyze length distribution
    length_stats = df['Fronted_Length'].describe()
    
    print("\nFronted element length statistics (in words):")
    print(f"  Mean: {length_stats['mean']:.2f}")
    print(f"  Median: {length_stats['50%']:.2f}")
    print(f"  Min: {length_stats['min']:.0f}")
    print(f"  Max: {length_stats['max']:.0f}")
    
    # Visualize length distribution
    plt.figure(figsize=(10, 6))
    sns.histplot(df['Fronted_Length'], bins=15, kde=True)
    plt.title('Distribution of Fronted Element Lengths (in words)', fontsize=16)
    plt.xlabel('Number of Words', fontsize=14)
    plt.ylabel('Frequency', fontsize=14)
    plt.axvline(length_stats['mean'], color='red', linestyle='--', label=f"Mean: {length_stats['mean']:.2f}")
    plt.axvline(length_stats['50%'], color='green', linestyle='--', label=f"Median: {length_stats['50%']:.2f}")
    plt.legend()
    plt.tight_layout()
    plt.savefig(f'{output_dir}/fronted_length_distribution.png', dpi=300)
    plt.close()
    
    # Analyze length by start type
    length_by_start = df.groupby('Fronted_Start')['Fronted_Length'].mean().sort_values(ascending=False)
    
    print("\nAverage fronted element length by start type:")
    for start, avg_len in length_by_start.items():
        print(f"  {start}: {avg_len:.2f} words")
    
    # Visualize
    plt.figure(figsize=(10, 6))
    sns.barplot(x=length_by_start.index, y=length_by_start.values, palette='viridis')
    plt.title('Average Fronted Element Length by Start Type', fontsize=16)
    plt.xlabel('Start Type', fontsize=14)
    plt.ylabel('Average Length (words)', fontsize=14)
    plt.xticks(rotation=0)
    plt.tight_layout()
    plt.savefig(f'{output_dir}/length_by_start_type.png', dpi=300)
    plt.close()
    
    return {
        'start_type_distribution': start_counts.to_dict(),
        'length_statistics': length_stats.to_dict(),
        'avg_length_by_start': length_by_start.to_dict()
    }

def analyze_subject_complexity(df, output_dir='.'):
    """
    Analyze the complexity and characteristics of subjects in inversions
    """
    print("\nAnalyzing subject complexity...")
    
    # Function to determine if a subject has a modifier
    def has_modifier(text):
        if pd.isna(text):
            return False
            
        text = str(text).lower()
        # Check for adjectives, possessives, and relative clauses
        modifiers = ['the', 'a', 'an', 'this', 'that', 'these', 'those', 'my', 'your', 'his', 'her', 
                    'its', 'our', 'their', 'which', 'who', 'whose', 'where']
        
        # Check if any modifier is present
        for mod in modifiers:
            if f" {mod} " in f" {text} ":
                return True
                
        # Check for adjectives
        adj_patterns = [r'\b(new|old|big|small|large|little|good|bad|great|high|low)\b',
                      r'\b(red|blue|green|black|white|yellow|brown|purple|pink)\b',
                      r'\b(important|significant|relevant|critical|crucial|essential)\b',
                      r'\b(interesting|fascinating|exciting|boring|surprising)\b']
        
        for pattern in adj_patterns:
            if re.search(pattern, text):
                return True
                
        return False
    
    # Function to count words in subject
    def count_words(text):
        if pd.isna(text):
            return 0
        return len(str(text).split())
    
    # Analyze subjects
    df['Subject_Has_Modifier'] = df['Subject'].apply(has_modifier)
    df['Subject_Word_Count'] = df['Subject'].apply(count_words)
    
    # Calculate the percentage of subjects with modifiers
    modifier_pct = df['Subject_Has_Modifier'].mean() * 100
    
    print(f"Subjects with modifiers: {modifier_pct:.1f}%")
    
    # Get subject length statistics
    subject_length_stats = df['Subject_Word_Count'].describe()
    
    print("\nSubject length statistics (in words):")
    print(f"  Mean: {subject_length_stats['mean']:.2f}")
    print(f"  Median: {subject_length_stats['50%']:.2f}")
    print(f"  Min: {subject_length_stats['min']:.0f}")
    print(f"  Max: {subject_length_stats['max']:.0f}")
    
    # Visualize subject length distribution
    plt.figure(figsize=(10, 6))
    sns.histplot(df['Subject_Word_Count'], bins=15, kde=True)
    plt.title('Distribution of Subject Lengths (in words)', fontsize=16)
    plt.xlabel('Number of Words', fontsize=14)
    plt.ylabel('Frequency', fontsize=14)
    plt.axvline(subject_length_stats['mean'], color='red', linestyle='--', 
               label=f"Mean: {subject_length_stats['mean']:.2f}")
    plt.axvline(subject_length_stats['50%'], color='green', linestyle='--', 
               label=f"Median: {subject_length_stats['50%']:.2f}")
    plt.legend()
    plt.tight_layout()
    plt.savefig(f'{output_dir}/subject_length_distribution.png', dpi=300)
    plt.close()
    
    # Compare subject complexity across discourse functions
    if 'Discourse Function' in df.columns:
        # Calculate average subject length by discourse function
        length_by_function = df.groupby('Discourse Function')['Subject_Word_Count'].mean().sort_values(ascending=False)
        
        print("\nAverage subject length by discourse function:")
        for func, avg_len in length_by_function.items():
            print(f"  {func}: {avg_len:.2f} words")
        
        # Visualize
        plt.figure(figsize=(12, 6))
        sns.barplot(x=length_by_function.index, y=length_by_function.values, palette='viridis')
        plt.title('Average Subject Length by Discourse Function', fontsize=16)
        plt.xlabel('Discourse Function', fontsize=14)
        plt.ylabel('Average Length (words)', fontsize=14)
        plt.xticks(rotation=45, ha='right')
        plt.tight_layout()
        plt.savefig(f'{output_dir}/subject_length_by_function.png', dpi=300)
        plt.close()
        
        # Calculate percentage of subjects with modifiers by discourse function
        modifier_by_function = df.groupby('Discourse Function')['Subject_Has_Modifier'].mean() * 100
        
        print("\nPercentage of subjects with modifiers by discourse function:")
        for func, pct in modifier_by_function.items():
            print(f"  {func}: {pct:.1f}%")
        
        # Visualize
        plt.figure(figsize=(12, 6))
        sns.barplot(x=modifier_by_function.index, y=modifier_by_function.values, palette='viridis')
        plt.title('Percentage of Subjects with Modifiers by Discourse Function', fontsize=16)
        plt.xlabel('Discourse Function', fontsize=14)
        plt.ylabel('Percentage with Modifiers', fontsize=14)
        plt.xticks(rotation=45, ha='right')
        plt.tight_layout()
        plt.savefig(f'{output_dir}/subject_modifiers_by_function.png', dpi=300)
        plt.close()
    
    return {
        'modifier_percentage': modifier_pct,
        'subject_length_stats': subject_length_stats.to_dict(),
        'length_by_function': length_by_function.to_dict() if 'length_by_function' in locals() else {},
        'modifier_by_function': modifier_by_function.to_dict() if 'modifier_by_function' in locals() else {}
    }

def run_contextual_analyses(file_path, output_dir='.'):
    """
    Run all contextual analyses
    """
    print("Beginning contextual analyses...")
    
    try:
        # Load the data
        df = load_data(file_path)
        
        # Run the keyword analysis
        keyword_results = analyze_context_keywords(df, output_dir)
        
        # Analyze fronted element patterns
        pattern_results = analyze_fronted_element_patterns(df, output_dir)
        
        # Analyze subject complexity
        subject_results = analyze_subject_complexity(df, output_dir)
        
        print("\nAll contextual analyses completed successfully!")
        
        return {
            'keyword_results': keyword_results,
            'pattern_results': pattern_results,
            'subject_results': subject_results
        }
        
    except Exception as e:
        print(f"Error during contextual analysis: {str(e)}")
        return None

if __name__ == "__main__":
    # Replace with the actual file path
    file_path = "../data/corpus_inversions_20250324_133147.csv"
    run_contextual_analyses(file_path)