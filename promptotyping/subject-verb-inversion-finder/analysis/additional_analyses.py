import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from scipy import stats
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.decomposition import PCA
from wordcloud import WordCloud

def perform_statistical_analysis(file_path):
    """
    Perform a more in-depth statistical analysis of the inversion patterns
    """
    # Load the data
    df = pd.read_csv(file_path)
    print(f"Loaded {len(df)} rows of data")
    
    # Fill missing values for analysis
    for col in ['Fronted Element Type', 'Locative', 'Discourse Function', 'Information Structure']:
        if col in df.columns:
            df[col] = df[col].fillna('Unknown')
    
    # 1. Chi-square test for independence between locative status and discourse function
    print("\n1. Chi-square Test: Locative Status vs. Discourse Function")
    contingency_table = pd.crosstab(df['Locative'], df['Discourse Function'])
    chi2, p, dof, expected = stats.chi2_contingency(contingency_table)
    print(f"Chi-square value: {chi2:.2f}")
    print(f"p-value: {p:.4f}")
    print(f"Degrees of freedom: {dof}")
    print("Interpretation: " + ("Significant association" if p < 0.05 else "No significant association"))
    
    # 2. Relationship between fronted element type and information structure
    print("\n2. Fronted Element Type vs. Information Structure")
    type_info_table = pd.crosstab(df['Fronted Element Type'], df['Information Structure'], 
                                 normalize='index') * 100
    print(type_info_table)
    
    # Create a heatmap visualization
    plt.figure(figsize=(12, 8))
    sns.heatmap(type_info_table, annot=True, cmap='YlGnBu', fmt='.1f')
    plt.title('Relationship: Fronted Element Types and Information Structure (%)')
    plt.xlabel('Information Structure')
    plt.ylabel('Fronted Element Type')
    plt.tight_layout()
    plt.savefig('element_type_vs_info_structure.png', dpi=300)
    plt.close()
    
    # 3. Word clouds for fronted elements by discourse function
    print("\n3. Generating word clouds for fronted elements by discourse function")
    discourse_functions = df['Discourse Function'].unique()
    
    for func in discourse_functions:
        if pd.isna(func) or func == 'Unknown':
            continue
            
        # Get all fronted elements for this discourse function
        texts = df[df['Discourse Function'] == func]['Fronted Element'].dropna().astype(str)
        if len(texts) < 5:  # Skip if too few examples
            continue
            
        # Join all texts
        text = ' '.join(texts)
        
        # Generate word cloud
        wordcloud = WordCloud(width=800, height=400, background_color='white', 
                             max_words=100, contour_width=3, contour_color='steelblue')
        wordcloud.generate(text)
        
        # Save the word cloud
        plt.figure(figsize=(10, 6))
        plt.imshow(wordcloud, interpolation='bilinear')
        plt.axis('off')
        plt.title(f'Common Words in Fronted Elements: {func}')
        plt.tight_layout()
        plt.savefig(f'wordcloud_{func.replace(" ", "_")}.png', dpi=300)
        plt.close()
        
        print(f"  - Generated word cloud for {func}")
    
    # 4. Analyze verb patterns by discourse function
    print("\n4. Analyzing verb patterns by discourse function")
    verb_by_function = df.groupby('Discourse Function')['Verb'].apply(lambda x: x.value_counts().head(5))
    print(verb_by_function)
    
    # Visualize the top 3 verbs for each discourse function
    top_verbs = {}
    for func in discourse_functions:
        if pd.isna(func) or func == 'Unknown':
            continue
            
        verb_counts = df[df['Discourse Function'] == func]['Verb'].value_counts()
        if len(verb_counts) >= 3:
            top_verbs[func] = verb_counts.head(3)
    
    if top_verbs:
        # Create a figure with subplots
        fig, axes = plt.subplots(len(top_verbs), 1, figsize=(10, 3*len(top_verbs)))
        if len(top_verbs) == 1:
            axes = [axes]
            
        for i, (func, verbs) in enumerate(top_verbs.items()):
            verbs.plot(kind='barh', ax=axes[i], color=sns.color_palette('viridis', 3))
            axes[i].set_title(f'Top 3 Verbs: {func}')
            axes[i].set_xlabel('Count')
            
        plt.tight_layout()
        plt.savefig('top_verbs_by_function.png', dpi=300)
        plt.close()
        print("  - Generated visualization of top verbs by discourse function")
    
    # 5. Information complexity analysis
    print("\n5. Information complexity analysis")
    
    # Function to count words
    def count_words(text):
        if pd.isna(text):
            return 0
        return len(str(text).split())
    
    # Create columns for word counts
    df['Fronted_Word_Count'] = df['Fronted Element'].apply(count_words)
    df['Subject_Word_Count'] = df['Subject'].apply(count_words)
    
    # Analyze by discourse function
    word_counts = df.groupby('Discourse Function')[['Fronted_Word_Count', 'Subject_Word_Count']].agg(['mean', 'median'])
    print(word_counts)
    
    # Visualize the complexity ratio (Subject words / Fronted words) by discourse function
    df['Complexity_Ratio'] = df['Subject_Word_Count'] / df['Fronted_Word_Count'].replace(0, 1)
    ratio_by_function = df.groupby('Discourse Function')['Complexity_Ratio'].median().sort_values(ascending=False)
    
    plt.figure(figsize=(12, 6))
    sns.barplot(x=ratio_by_function.index, y=ratio_by_function.values, palette='viridis')
    plt.title('Median Ratio of Subject Words to Fronted Element Words by Discourse Function')
    plt.xlabel('Discourse Function')
    plt.ylabel('Median Ratio (Subject Words / Fronted Words)')
    plt.xticks(rotation=45, ha='right')
    plt.tight_layout()
    plt.savefig('complexity_ratio_by_function.png', dpi=300)
    plt.close()
    print("  - Generated complexity ratio analysis")
    
    return {
        'chi_square_result': {'chi2': chi2, 'p_value': p, 'dof': dof},
        'word_counts': word_counts.to_dict(),
        'ratio_by_function': ratio_by_function.to_dict()
    }

def analyze_subject_characteristics(file_path):
    """
    Analyze the characteristics of subjects in inversions
    """
    # Load the data
    df = pd.read_csv(file_path)
    
    # Function to determine if a subject is definite (starts with 'the', 'this', etc.)
    def is_definite(text):
        if pd.isna(text):
            return np.nan
        text = str(text).lower().strip()
        definite_markers = ['the ', 'this ', 'that ', 'these ', 'those ', 'my ', 'your ', 'our ', 'their ']
        return any(text.startswith(marker) for marker in definite_markers)
    
    # Function to check if subject contains a number
    def contains_number(text):
        if pd.isna(text):
            return np.nan
        text = str(text)
        return any(char.isdigit() for char in text)
    
    # Add columns for subject characteristics
    df['Subject_Definite'] = df['Subject'].apply(is_definite)
    df['Subject_Contains_Number'] = df['Subject'].apply(contains_number)
    
    # Calculate percentages
    definite_pct = df['Subject_Definite'].mean() * 100
    number_pct = df['Subject_Contains_Number'].mean() * 100
    
    print("\nSubject Characteristics Analysis:")
    print(f"Percentage of subjects with definite determiners: {definite_pct:.1f}%")
    print(f"Percentage of subjects containing numbers: {number_pct:.1f}%")
    
    # Analyze by discourse function
    subject_char_by_function = df.groupby('Discourse Function')[['Subject_Definite', 'Subject_Contains_Number']].mean() * 100
    print("\nSubject characteristics by discourse function (%):")
    print(subject_char_by_function)
    
    # Visualize
    plt.figure(figsize=(12, 6))
    subject_char_by_function['Subject_Definite'].sort_values(ascending=False).plot(kind='bar', color='skyblue')
    plt.title('Percentage of Subjects with Definite Determiners by Discourse Function')
    plt.xlabel('Discourse Function')
    plt.ylabel('Percentage')
    plt.xticks(rotation=45, ha='right')
    plt.tight_layout()
    plt.savefig('definite_subjects_by_function.png', dpi=300)
    plt.close()
    
    return {
        'overall_definite_pct': definite_pct,
        'overall_number_pct': number_pct,
        'by_function': subject_char_by_function.to_dict()
    }

def conduct_corpus_comparison(file_path):
    """
    Compare inversion characteristics across different source files/corpus sections
    """
    # Load the data
    df = pd.read_csv(file_path)
    
    # Get the top source files (by frequency)
    top_sources = df['File'].value_counts().head(5).index.tolist()
    
    # Filter the dataframe to include only the top sources
    df_top = df[df['File'].isin(top_sources)]
    
    print("\nCorpus Comparison Analysis:")
    print(f"Analyzing top {len(top_sources)} sources")
    
    # Compare fronted element types across sources
    element_type_by_source = pd.crosstab(df_top['File'], df_top['Fronted Element Type'], normalize='index') * 100
    print("\nFronted element types by source (%):")
    print(element_type_by_source)
    
    # Compare discourse functions across sources
    discourse_by_source = pd.crosstab(df_top['File'], df_top['Discourse Function'], normalize='index') * 100
    print("\nDiscourse functions by source (%):")
    print(discourse_by_source)
    
    # Visualize the differences
    plt.figure(figsize=(14, 8))
    sns.heatmap(discourse_by_source, annot=True, cmap='YlGnBu', fmt='.1f')
    plt.title('Discourse Functions by Source (%)')
    plt.ylabel('Source')
    plt.xlabel('Discourse Function')
    plt.xticks(rotation=45, ha='right')
    plt.tight_layout()
    plt.savefig('discourse_by_source.png', dpi=300)
    plt.close()
    
    # Compare locative vs. non-locative across sources
    locative_by_source = pd.crosstab(df_top['File'], df_top['Locative'], normalize='index') * 100
    print("\nLocative vs. non-locative by source (%):")
    print(locative_by_source)
    
    # Visualize
    plt.figure(figsize=(10, 6))
    locative_by_source.plot(kind='bar', stacked=True, colormap='viridis')
    plt.title('Proportion of Locative vs. Non-locative Inversions by Source')
    plt.xlabel('Source')
    plt.ylabel('Percentage')
    plt.xticks(rotation=45, ha='right')
    plt.legend(title='Locative')
    plt.tight_layout()
    plt.savefig('locative_by_source.png', dpi=300)
    plt.close()
    
    return {
        'element_type_by_source': element_type_by_source.to_dict(),
        'discourse_by_source': discourse_by_source.to_dict(),
        'locative_by_source': locative_by_source.to_dict()
    }

def run_all_analyses(file_path):
    """
    Run all advanced analyses
    """
    print("Beginning advanced statistical analyses...")
    
    try:
        # Run the statistical analysis
        stats_results = perform_statistical_analysis(file_path)
        
        # Analyze subject characteristics
        subject_results = analyze_subject_characteristics(file_path)
        
        # Conduct corpus comparison
        corpus_results = conduct_corpus_comparison(file_path)
        
        print("\nAll analyses completed successfully!")
        
        return {
            'stats_results': stats_results,
            'subject_results': subject_results,
            'corpus_results': corpus_results
        }
        
    except Exception as e:
        print(f"Error during analysis: {str(e)}")
        return None

if __name__ == "__main__":
    # Replace with the actual file path
    file_path = "../data/corpus_inversions_20250324_133147.csv"
    run_all_analyses(file_path)