import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np
from collections import Counter

# Set the style for all visualizations
plt.style.use('seaborn-v0_8-whitegrid')
sns.set(font_scale=1.2)
colors = sns.color_palette('viridis', 10)

def load_and_clean_data(file_path):
    """
    Load the CSV file and perform initial cleaning
    """
    # Load the data
    df = pd.read_csv(file_path)
    
    # Check for missing values and handle them
    print(f"Initial shape: {df.shape}")
    print(f"Missing values per column:\n{df.isnull().sum()}")
    
    # Fill missing values appropriately
    # For categorical columns, fill with 'Unknown'
    for col in ['Fronted Element Type', 'Locative', 'Discourse Function', 'Information Structure']:
        if col in df.columns:
            df[col] = df[col].fillna('Unknown')
    
    print(f"Shape after cleaning: {df.shape}")
    return df

def plot_fronted_element_types(df, output_file='fronted_element_types.png'):
    """
    Create a bar plot showing the distribution of different fronted element types
    """
    plt.figure(figsize=(12, 8))
    
    # Count the frequencies
    counts = df['Fronted Element Type'].value_counts()
    
    # Create a horizontal bar plot
    ax = sns.barplot(y=counts.index, x=counts.values, palette='viridis')
    
    # Add count labels to the bars
    for i, v in enumerate(counts.values):
        ax.text(v + 0.1, i, str(v), va='center')
    
    plt.title('Distribution of Fronted Element Types', fontsize=16)
    plt.xlabel('Count', fontsize=14)
    plt.ylabel('Fronted Element Type', fontsize=14)
    plt.tight_layout()
    plt.savefig(output_file, dpi=300)
    plt.close()
    
    print(f"Plot saved as {output_file}")
    return counts

def plot_locative_distribution(df, output_file='locative_distribution.png'):
    """
    Create a pie chart showing the distribution of locative vs. non-locative inversions
    """
    plt.figure(figsize=(10, 8))
    
    # Count locative vs. non-locative
    loc_counts = df['Locative'].value_counts()
    
    # Create a pie chart
    plt.pie(loc_counts.values, labels=loc_counts.index, autopct='%1.1f%%', 
            colors=sns.color_palette('Blues', len(loc_counts)),
            startangle=90, shadow=False)
    
    plt.title('Distribution of Locative vs. Non-locative Inversions', fontsize=16)
    plt.axis('equal')  # Equal aspect ratio ensures that pie is drawn as a circle
    plt.tight_layout()
    plt.savefig(output_file, dpi=300)
    plt.close()
    
    print(f"Plot saved as {output_file}")
    return loc_counts

def plot_discourse_functions(df, output_file='discourse_functions.png'):
    """
    Create a bar plot showing the distribution of discourse functions
    """
    plt.figure(figsize=(12, 8))
    
    # Count the frequencies
    counts = df['Discourse Function'].value_counts()
    
    # Create a horizontal bar plot
    ax = sns.barplot(y=counts.index, x=counts.values, palette='viridis')
    
    # Add count labels to the bars
    for i, v in enumerate(counts.values):
        ax.text(v + 0.1, i, str(v), va='center')
    
    plt.title('Distribution of Discourse Functions', fontsize=16)
    plt.xlabel('Count', fontsize=14)
    plt.ylabel('Discourse Function', fontsize=14)
    plt.tight_layout()
    plt.savefig(output_file, dpi=300)
    plt.close()
    
    print(f"Plot saved as {output_file}")
    return counts

def plot_information_structure(df, output_file='information_structure.png'):
    """
    Create a pie chart showing the distribution of information structure patterns
    """
    plt.figure(figsize=(10, 8))
    
    # Count information structure patterns
    info_counts = df['Information Structure'].value_counts()
    
    # Create a pie chart
    plt.pie(info_counts.values, labels=info_counts.index, autopct='%1.1f%%', 
            colors=sns.color_palette('Greens', len(info_counts)),
            startangle=90, shadow=False)
    
    plt.title('Distribution of Information Structure Patterns', fontsize=16)
    plt.axis('equal')  # Equal aspect ratio ensures that pie is drawn as a circle
    plt.tight_layout()
    plt.savefig(output_file, dpi=300)
    plt.close()
    
    print(f"Plot saved as {output_file}")
    return info_counts

def plot_fronted_element_by_discourse(df, output_file='fronted_by_discourse.png'):
    """
    Create a heatmap showing the relationship between fronted element types and discourse functions
    """
    plt.figure(figsize=(14, 10))
    
    # Create a cross-tabulation of fronted element types and discourse functions
    cross_tab = pd.crosstab(df['Fronted Element Type'], df['Discourse Function'])
    
    # Normalize by row (fronted element type)
    cross_tab_norm = cross_tab.div(cross_tab.sum(axis=1), axis=0)
    
    # Create a heatmap
    sns.heatmap(cross_tab_norm, annot=True, cmap='viridis', fmt='.2f', linewidths=.5)
    
    plt.title('Relationship Between Fronted Element Types and Discourse Functions', fontsize=16)
    plt.xlabel('Discourse Function', fontsize=14)
    plt.ylabel('Fronted Element Type', fontsize=14)
    plt.tight_layout()
    plt.savefig(output_file, dpi=300)
    plt.close()
    
    print(f"Plot saved as {output_file}")
    return cross_tab

def plot_locative_by_discourse(df, output_file='locative_by_discourse.png'):
    """
    Create a grouped bar plot showing the relationship between locative status and discourse functions
    """
    plt.figure(figsize=(12, 8))
    
    # Create a cross-tabulation of locative status and discourse functions
    cross_tab = pd.crosstab(df['Locative'], df['Discourse Function'])
    
    # Convert to percentage for easier comparison
    cross_tab_pct = cross_tab.div(cross_tab.sum(axis=1), axis=0) * 100
    
    # Create a grouped bar plot
    cross_tab_pct.plot(kind='bar', figsize=(12, 8), width=0.8)
    
    plt.title('Discourse Functions by Locative Status', fontsize=16)
    plt.xlabel('Locative Status', fontsize=14)
    plt.ylabel('Percentage', fontsize=14)
    plt.xticks(rotation=0)
    plt.legend(title='Discourse Function')
    plt.tight_layout()
    plt.savefig(output_file, dpi=300)
    plt.close()
    
    print(f"Plot saved as {output_file}")
    return cross_tab

def plot_verb_frequency(df, output_file='verb_frequency.png', top_n=20):
    """
    Create a bar plot showing the most common verbs used in inversions
    """
    plt.figure(figsize=(14, 10))
    
    # Count the frequencies of verbs
    verb_counts = df['Verb'].value_counts().head(top_n)
    
    # Create a horizontal bar plot
    ax = sns.barplot(y=verb_counts.index, x=verb_counts.values, palette='viridis')
    
    # Add count labels to the bars
    for i, v in enumerate(verb_counts.values):
        ax.text(v + 0.1, i, str(v), va='center')
    
    plt.title(f'Top {top_n} Most Frequent Verbs in Inversions', fontsize=16)
    plt.xlabel('Count', fontsize=14)
    plt.ylabel('Verb', fontsize=14)
    plt.tight_layout()
    plt.savefig(output_file, dpi=300)
    plt.close()
    
    print(f"Plot saved as {output_file}")
    return verb_counts

def plot_source_distribution(df, output_file='source_distribution.png', top_n=10):
    """
    Create a bar plot showing the distribution of inversions across different source files
    """
    plt.figure(figsize=(14, 8))
    
    # Count the frequencies of source files
    source_counts = df['File'].value_counts().head(top_n)
    
    # Create a horizontal bar plot
    ax = sns.barplot(y=source_counts.index, x=source_counts.values, palette='viridis')
    
    # Add count labels to the bars
    for i, v in enumerate(source_counts.values):
        ax.text(v + 0.1, i, str(v), va='center')
    
    plt.title(f'Top {top_n} Sources of Inversions', fontsize=16)
    plt.xlabel('Count', fontsize=14)
    plt.ylabel('Source File', fontsize=14)
    plt.tight_layout()
    plt.savefig(output_file, dpi=300)
    plt.close()
    
    print(f"Plot saved as {output_file}")
    return source_counts

def analyze_word_length_complexity(df, output_file='complexity_analysis.png'):
    """
    Analyze and visualize the complexity of inversions by comparing word counts
    in fronted elements, verbs, and subjects
    """
    plt.figure(figsize=(12, 8))
    
    # Function to count words
    def count_words(text):
        if pd.isna(text):
            return 0
        return len(str(text).split())
    
    # Create new columns with word counts
    df['Fronted_Word_Count'] = df['Fronted Element'].apply(count_words)
    df['Subject_Word_Count'] = df['Subject'].apply(count_words)
    
    # Create box plots
    data = [df['Fronted_Word_Count'], df['Subject_Word_Count']]
    labels = ['Fronted Element', 'Subject']
    
    # Create a box plot
    ax = plt.boxplot(data, patch_artist=True, labels=labels)
    
    # Fill boxes with colors
    colors = ['#66c2a5', '#fc8d62']
    for box, color in zip(ax['boxes'], colors):
        box.set(facecolor=color)
    
    plt.title('Word Count Comparison: Fronted Elements vs. Subjects', fontsize=16)
    plt.ylabel('Word Count', fontsize=14)
    plt.grid(axis='y', linestyle='--', alpha=0.7)
    plt.tight_layout()
    plt.savefig(output_file, dpi=300)
    plt.close()
    
    # Calculate and return statistics
    stats = {
        'Fronted_Element_Mean': df['Fronted_Word_Count'].mean(),
        'Subject_Mean': df['Subject_Word_Count'].mean(),
        'Fronted_Element_Median': df['Fronted_Word_Count'].median(),
        'Subject_Median': df['Subject_Word_Count'].median()
    }
    
    print(f"Plot saved as {output_file}")
    print(f"Complexity statistics: {stats}")
    return stats

def generate_all_visualizations(file_path):
    """
    Generate all visualizations for the inversion analysis
    """
    print("Loading data...")
    df = load_and_clean_data(file_path)
    
    print("\nGenerating visualizations...")
    # Generate all plots
    plot_fronted_element_types(df)
    plot_locative_distribution(df)
    plot_discourse_functions(df)
    plot_information_structure(df)
    plot_fronted_element_by_discourse(df)
    plot_locative_by_discourse(df)
    plot_verb_frequency(df)
    plot_source_distribution(df)
    analyze_word_length_complexity(df)
    
    print("\nAll visualizations generated successfully!")

if __name__ == "__main__":
    # Replace with the actual file path
    file_path = "../data/corpus_inversions_20250324_133147.csv"
    generate_all_visualizations(file_path)