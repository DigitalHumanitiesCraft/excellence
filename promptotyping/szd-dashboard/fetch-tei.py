import requests
from bs4 import BeautifulSoup
import xml.etree.ElementTree as ET
from collections import Counter, defaultdict
import re
import json
import networkx as nx
from itertools import combinations

# URLs der TEI XML-Dateien
urls = [
    "https://stefanzweig.digital/o:szd.werke/TEI_SOURCE",
    "https://stefanzweig.digital/o:szd.lebensdokumente/TEI_SOURCE",
    "https://stefanzweig.digital/o:szd.korrespondenzen/TEI_SOURCE",
    "https://stefanzweig.digital/o:szd.autographen/TEI_SOURCE",
    "https://stefanzweig.digital/o:szd.bibliothek/TEI_SOURCE",
    "https://stefanzweig.digital/o:szd.lebenskalender/TEI_SOURCE",
    "https://stefanzweig.digital/o:szd.personen/TEI_SOURCE",
    "https://stefanzweig.digital/o:szd.standorte/TEI_SOURCE"
]

# Namespace-Dict für TEI
namespaces = {
    'tei': 'http://www.tei-c.org/ns/1.0',
    'xml': 'http://www.w3.org/XML/1998/namespace'
}

# Globale Variablen für sammlungsübergreifende Analyse
all_references = {}
reference_network = defaultdict(set)
id_prefix_map = {}
attribute_usage = defaultdict(lambda: defaultdict(set))
element_relationships = defaultdict(lambda: defaultdict(int))
category_data = {}

def analyze_xml_structure(xml_content, category_name):
    """Analysiert die Struktur eines TEI XML-Dokuments und gibt einen Überblick aus."""
    try:
        # XML parsen
        root = ET.fromstring(xml_content)
        
        print(f"\n{'=' * 80}")
        print(f"ANALYSE: {category_name}")
        print(f"{'=' * 80}")
        
        # Body-Element finden
        body = root.find('.//tei:body', namespaces)
        if body is None:
            print(f"Kein body-Element gefunden in {category_name}")
            return
        
        # Struktur analysieren
        print(f"\n1. HIERARCHIE DES BODY-ELEMENTS:")
        analyze_element_hierarchy(body, 0, max_depth=3)
        
        # Elemente zählen
        print(f"\n2. ELEMENT-HÄUFIGKEIT:")
        element_counts = count_elements(body)
        for elem, count in sorted(element_counts.items(), key=lambda x: x[1], reverse=True)[:20]:
            print(f"  {elem}: {count}")
        
        # Attribute analysieren
        print(f"\n3. VERWENDETE ATTRIBUTE:")
        attribute_analysis = analyze_attributes(body)
        for elem, attrs in list(attribute_analysis.items())[:10]:
            print(f"  {elem}: {', '.join(attrs)}")
            
        # IDs und Verweise sammeln
        print(f"\n4. VERWEISSTRUKTUR:")
        refs = analyze_references(body)
        print(f"  Anzahl eindeutiger IDs: {len(refs['ids'])}")
        print(f"  Anzahl Referenzen: {len(refs['refs'])}")
        
        # Neue Analysen
        
        # ID-Muster erkennen
        id_patterns = analyze_id_patterns(refs['ids'])
        print(f"\n5. ID-MUSTER:")
        for pattern, count in id_patterns.items():
            print(f"  {pattern}: {count}")
            id_prefix_map[pattern] = category_name
        
        # Attributwerte-Statistik
        attr_values = analyze_attribute_values(body, ['type', 'ana', 'when', 'ref', 'corresp'])
        print(f"\n6. ATTRIBUTWERTE (Top 3 pro Attribut):")
        for attr, values in attr_values.items():
            print(f"  {attr}:")
            for value, count in sorted(values.items(), key=lambda x: x[1], reverse=True)[:3]:
                print(f"    {value}: {count}")
        
        # Referenzen zwischen Dokumenten analysieren
        external_refs = analyze_external_references(body)
        print(f"\n7. EXTERNE REFERENZEN (Top 5):")
        for reftype, refs_count in external_refs.items():
            print(f"  {reftype}:")
            for target, count in sorted(refs_count.items(), key=lambda x: x[1], reverse=True)[:5]:
                print(f"    {target}: {count}")
        
        # Elementbeziehungen analysieren
        parent_child = analyze_element_relationships(body)
        print(f"\n8. ELEMENT-BEZIEHUNGEN (Top 5):")
        for parent, children in sorted(parent_child.items(), key=lambda x: sum(x[1].values()), reverse=True)[:5]:
            print(f"  {parent} enthält:")
            for child, count in sorted(children.items(), key=lambda x: x[1], reverse=True)[:3]:
                print(f"    {child}: {count}")
                # Zur globalen Analyse hinzufügen
                element_relationships[parent][child] += count
        
        # Textanalyse (Beispiel)
        if body.findall('.//tei:p', namespaces) or body.findall('.//tei:ab', namespaces):
            print(f"\n9. TEXTANALYSE (STICHPROBE):")
            text_elements = body.findall('.//tei:p', namespaces) or body.findall('.//tei:ab', namespaces)
            for i, p in enumerate(text_elements[:2]):
                text = ''.join(p.itertext())
                if text.strip():
                    print(f"  Element {i+1}: {text[:100]}..." if len(text) > 100 else text)
        
        # Daten für die kategorieübergreifende Analyse speichern
        category_data[category_name] = {
            'element_counts': element_counts,
            'attribute_analysis': attribute_analysis,
            'references': refs,
            'id_patterns': id_patterns,
            'attribute_values': attr_values,
            'external_refs': external_refs,
            'parent_child': parent_child
        }
        
        # Zu globalen Referenzen hinzufügen
        all_references[category_name] = refs
        
        # Referenznetzwerk aufbauen
        for id_val in refs['ids']:
            reference_network[id_val].add(category_name)
        
        for ref_val in refs['refs']:
            if ref_val in reference_network:
                reference_network[ref_val].add(category_name + "_ref")
        
        # Attributverwendung aufzeichnen
        for elem, attrs in attribute_analysis.items():
            for attr in attrs:
                attribute_usage[attr][category_name].add(elem)
        
    except Exception as e:
        print(f"Fehler bei der Analyse von {category_name}: {str(e)}")

def analyze_element_hierarchy(element, level, max_depth=3):
    """Gibt die Hierarchie der Elemente bis zu einer bestimmten Tiefe aus."""
    if level > max_depth:
        print(f"{'  ' * level}... (weitere Ebenen nicht angezeigt)")
        return
    
    tag = element.tag.split('}')[-1]  # Namespace entfernen
    attrs = []
    for attr, value in element.attrib.items():
        if "}" in attr:
            attr = attr.split('}')[-1]
        attrs.append(f"{attr}=\"{value}\"")
    
    attr_str = " " + " ".join(attrs) if attrs else ""
    children = list(element)
    
    if children:
        print(f"{'  ' * level}<{tag}{attr_str}> ({len(children)} Kindelemente)")
        
        # Zeige nur die ersten 3 Kinder jedes Elements
        for i, child in enumerate(children[:3]):
            analyze_element_hierarchy(child, level + 1, max_depth)
        
        if len(children) > 3:
            print(f"{'  ' * (level+1)}... ({len(children)-3} weitere Elemente)")
    else:
        text = element.text.strip() if element.text else ""
        if text:
            text_preview = (text[:20] + "...") if len(text) > 20 else text
            print(f"{'  ' * level}<{tag}{attr_str}> Text: \"{text_preview}\"")
        else:
            print(f"{'  ' * level}<{tag}{attr_str}> (leer)")

def count_elements(element):
    """Zählt die Häufigkeit aller Element-Typen."""
    counter = Counter()
    
    for el in element.iter():
        tag = el.tag.split('}')[-1]
        counter[tag] += 1
        
    return counter

def analyze_attributes(element):
    """Analysiert die verwendeten Attribute pro Element-Typ."""
    attributes = {}
    
    for el in element.iter():
        tag = el.tag.split('}')[-1]
        
        if tag not in attributes:
            attributes[tag] = set()
            
        for attr in el.attrib:
            clean_attr = attr.split('}')[-1]
            attributes[tag].add(clean_attr)
            
    return attributes

def analyze_references(element):
    """Analysiert die Verweisstruktur (IDs und Referenzen)."""
    ids = set()
    refs = set()
    
    for el in element.iter():
        # IDs sammeln
        for attr, value in el.attrib.items():
            if attr.endswith('id'):
                ids.add(value)
            
            # Referenzen in Attributen finden
            if any(x in attr for x in ['ref', 'target', 'corresp']):
                if value.startswith('#'):
                    refs.add(value[1:])  # # entfernen
                    
    return {'ids': ids, 'refs': refs}

# Neue Analysefunktionen

def analyze_id_patterns(ids):
    """Analysiert Muster in IDs, um Präfixe zu identifizieren."""
    patterns = Counter()
    
    for id_val in ids:
        # Versuche ein Muster zu extrahieren (z.B. "SZDMSK")
        match = re.match(r'^([A-Z]+[^0-9.]*)', id_val)
        if match:
            prefix = match.group(1)
            patterns[prefix] += 1
    
    return patterns

def analyze_attribute_values(element, important_attrs):
    """Analysiert die Werte wichtiger Attribute."""
    attr_values = defaultdict(Counter)
    
    for el in element.iter():
        for attr, value in el.attrib.items():
            clean_attr = attr.split('}')[-1]
            
            if clean_attr in important_attrs:
                # Werte verkürzen für bessere Übersicht
                if len(value) > 50:
                    short_value = value[:47] + "..."
                else:
                    short_value = value
                    
                attr_values[clean_attr][short_value] += 1
    
    return attr_values

def analyze_external_references(element):
    """Analysiert externe Referenzen wie URLs und GND-IDs."""
    ref_types = {
        "URL": Counter(),
        "GND": Counter(),
        "Andere": Counter()
    }
    
    for el in element.iter():
        for attr, value in el.attrib.items():
            if any(x in attr for x in ['ref', 'corresp', 'target']):
                if value.startswith('http'):
                    if 'd-nb.info/gnd' in value:
                        ref_types["GND"][value] += 1
                    else:
                        ref_types["URL"][value] += 1
                elif not value.startswith('#'):
                    ref_types["Andere"][value] += 1
    
    return ref_types

def analyze_element_relationships(element):
    """Analysiert die Beziehungen zwischen Elementen (Parent-Child)."""
    relationships = defaultdict(Counter)
    
    def process_element(el, parent_tag=None):
        if parent_tag:
            tag = el.tag.split('}')[-1]
            relationships[parent_tag][tag] += 1
            
        parent_tag = el.tag.split('}')[-1]
        for child in el:
            process_element(child, parent_tag)
    
    process_element(element)
    return relationships

def generate_cross_references_analysis():
    """Generiert eine Analyse der sammlungsübergreifenden Verweise."""
    print("\n\n" + "=" * 80)
    print("SAMMLUNGSÜBERGREIFENDE ANALYSE")
    print("=" * 80)
    
    # 1. Gesamtübersicht der Sammlungen
    print("\n1. SAMMLUNGEN ÜBERSICHT:")
    for category, data in category_data.items():
        print(f"  {category}: {sum(data['element_counts'].values())} Elemente, {len(data['references']['ids'])} IDs")
    
    # 2. ID-Präfix-Analyse
    print("\n2. ID-PRÄFIXE NACH SAMMLUNG:")
    for prefix, category in id_prefix_map.items():
        print(f"  {prefix}: {category}")
    
    # 3. Attributverwendung
    print("\n3. ATTRIBUTVERWENDUNG ÜBER SAMMLUNGEN HINWEG:")
    for attr, categories in sorted(attribute_usage.items(), key=lambda x: len(x[1]), reverse=True)[:10]:
        categories_str = ", ".join(categories)
        print(f"  {attr}: {len(categories)} Sammlungen ({categories_str})")
    
    # 4. Element-Beziehungen
    print("\n4. HÄUFIGSTE ELEMENT-BEZIEHUNGEN:")
    for parent, children in sorted(element_relationships.items(), key=lambda x: sum(x[1].values()), reverse=True)[:5]:
        print(f"  {parent} enthält:")
        for child, count in sorted(children.items(), key=lambda x: x[1], reverse=True)[:3]:
            print(f"    {child}: {count}")
    
    # 5. Sammlung von IDs, die in mehreren Sammlungen referenziert werden
    cross_refs = defaultdict(set)
    for id_val, categories in reference_network.items():
        if len(categories) > 1:
            cross_refs[tuple(sorted(categories))].add(id_val)
    
    print("\n5. SAMMLUNGSÜBERGREIFENDE REFERENZEN:")
    for categories, ids in sorted(cross_refs.items(), key=lambda x: len(x[1]), reverse=True)[:5]:
        categories_str = ", ".join(cat for cat in categories)
        print(f"  {categories_str}: {len(ids)} gemeinsame IDs/Referenzen")

def generate_network_visualization():
    """Generiert Daten für eine Netzwerkvisualisierung der Verweisstrukturen."""
    G = nx.Graph()
    
    # Kategorien als Knoten hinzufügen
    for category in category_data.keys():
        G.add_node(category, type="category")
    
    # Verbindungen zwischen Kategorien basierend auf gemeinsamen Referenzen
    for cat1, cat2 in combinations(category_data.keys(), 2):
        refs1 = set(all_references[cat1]['ids']) | set(all_references[cat1]['refs'])
        refs2 = set(all_references[cat2]['ids']) | set(all_references[cat2]['refs'])
        
        common_refs = refs1.intersection(refs2)
        if common_refs:
            G.add_edge(cat1, cat2, weight=len(common_refs), refs=list(common_refs)[:5])
    
    # Graph-Daten für spätere Visualisierung exportieren
    graph_data = {
        "nodes": [{"id": n, "type": G.nodes[n]["type"]} for n in G.nodes()],
        "links": [{"source": u, "target": v, "weight": G[u][v]["weight"]} for u, v in G.edges()]
    }
    
    print("\n6. NETZWERKDATEN FÜR VISUALISIERUNG GENERIERT")
    print(f"  {len(G.nodes())} Knoten, {len(G.edges())} Verbindungen")
    
    # Schreibe Netzwerkdaten in eine JSON-Datei
    with open("szd_network.json", "w", encoding="utf-8") as f:
        json.dump(graph_data, f, indent=2, ensure_ascii=False)
    
    print("  Daten gespeichert in 'szd_network.json'")

def generate_data_md():
    """Generiert eine DATA.md-Datei mit der Analyse."""
    md_content = ["# Stefan Zweig Digital (SZD) - Datenstrukturanalyse\n",
                 "Diese Dokumentation beschreibt die Struktur der TEI XML-Dateien aus dem virtuellen Nachlass von Stefan Zweig und zeigt Verbindungen zwischen den verschiedenen Sammlungen auf.\n"]
    
    # Überblick der Datenquellen
    md_content.append("## Überblick der Datenquellen\n")
    md_content.append("Der Nachlass von Stefan Zweig wurde in acht Hauptkategorien digitalisiert, jede repräsentiert durch eine TEI XML-Datei:\n")
    
    md_content.append("| Kategorie | Datei | Anzahl Einträge | Hauptelement | ID-Präfix |")
    md_content.append("|-----------|-------|-----------------|--------------|-----------|")
    
    for category, data in category_data.items():
        main_elements = sorted(data['element_counts'].items(), key=lambda x: x[1], reverse=True)
        root_element = next((tag for tag, count in main_elements if tag not in ['body', 'ab', 'title', 'span', 'p']), "unbekannt")
        
        entry_count = 0
        for pattern, count in data['id_patterns'].items():
            entry_count = count
            id_prefix = pattern
            break
        
        md_content.append(f"| {category} | szd.{category} | {entry_count} | {root_element} | {id_prefix} |")
    
    # Detaillierte Strukturanalyse für jede Kategorie
    md_content.append("\n## Detaillierte Strukturanalyse\n")
    
    for category, data in category_data.items():
        md_content.append(f"### {category}\n")
        
        # Grundstruktur
        md_content.append("**Grundstruktur:**")
        main_elements = sorted(data['element_counts'].items(), key=lambda x: x[1], reverse=True)
        root_element = next((tag for tag, count in main_elements if tag not in ['body', 'ab', 'title', 'span', 'p']), "unbekannt")
        
        id_prefix = next(iter(data['id_patterns']), "unbekannt")
        md_content.append(f"- `<body>` enthält Sammlung von `<{root_element}>` Elementen")
        md_content.append(f"- ID-Format: `{id_prefix}.n`\n")
        
        # Häufigste Elemente
        md_content.append("**Häufigste Elemente:**")
        for tag, count in sorted(data['element_counts'].items(), key=lambda x: x[1], reverse=True)[:10]:
            md_content.append(f"- `<{tag}>`: {count}")
        md_content.append("")
        
        # Verweisstruktur
        md_content.append("**Verweisstruktur:**")
        md_content.append(f"- {len(data['references']['ids'])} eindeutige IDs")
        md_content.append(f"- {len(data['references']['refs'])} interne Referenzen\n")
        
        # Besonderheiten basierend auf Attributen
        md_content.append("**Besonderheiten:**")
        
        # Wichtige Attribute finden
        special_attrs = []
        for elem, attrs in data['attribute_analysis'].items():
            for attr in attrs:
                if attr in ['type', 'ana', 'when', 'ref', 'corresp'] and attr in data['attribute_values']:
                    top_values = sorted(data['attribute_values'][attr].items(), key=lambda x: x[1], reverse=True)[:3]
                    if top_values:
                        special_attrs.append((attr, elem, top_values))
        
        # Bis zu 5 Besonderheiten auflisten
        for attr, elem, values in special_attrs[:5]:
            value_str = ", ".join(f"`{val}`" for val, _ in values)
            md_content.append(f"- Verwendet `{attr}` in `<{elem}>` mit Werten wie {value_str}")
        
        # Externe Referenzen
        if "URL" in data['external_refs'] and data['external_refs']["URL"]:
            md_content.append(f"- Verweise auf externe Webseiten")
        
        if "GND" in data['external_refs'] and data['external_refs']["GND"]:
            md_content.append(f"- Verknüpfung mit GND-Normdaten")
        
        md_content.append("")
    
    # Verknüpfungen zwischen den Datensätzen
    md_content.append("## Verknüpfungen zwischen den Datensätzen\n")
    md_content.append("Die verschiedenen Teile des Nachlasses sind durch Referenzen miteinander verbunden:\n")
    
    # Cross-References analysieren
    cross_refs = defaultdict(set)
    for id_val, categories in reference_network.items():
        if len(categories) > 1:
            cross_refs[tuple(sorted(categories))].add(id_val)
    
    md_content.append("### Hauptverknüpfungen zwischen Sammlungen:\n")
    for categories, ids in sorted(cross_refs.items(), key=lambda x: len(x[1]), reverse=True)[:8]:
        categories_str = " ↔ ".join(cat.replace("_ref", "") for cat in categories if not cat.endswith("_ref"))
        md_content.append(f"- **{categories_str}**: {len(ids)} gemeinsame Referenzen")
    
    # Schéma der Verknüpfungen
    md_content.append("\n### Referenzdiagramm\n")
    md_content.append("```")
    md_content.append("                       ┌───────────────┐")
    md_content.append("                       │   Personen    │")
    md_content.append("                       │  (SZDPER.n)   │")
    md_content.append("                       └───────┬───────┘")
    md_content.append("                               │")
    md_content.append("                               ▼")
    md_content.append("┌───────────────┐      ┌───────────────┐      ┌───────────────┐")
    md_content.append("│    Werke      │◄─────┤Korrespondenzen│─────►│  Autographen  │")
    md_content.append("│  (SZDMSK.n)   │      │  (SZDKOR.n)   │      │  (SZDAUT.n)   │")
    md_content.append("└───────┬───────┘      └───────┬───────┘      └──────┬────────┘")
    md_content.append("        │                      │                      │")
    md_content.append("        │                      │                      │")
    md_content.append("        ▼                      ▼                      ▼")
    md_content.append("┌───────────────┐      ┌───────────────┐      ┌───────────────┐")
    md_content.append("│ Lebenskalender│      │   Bibliothek  │      │   Standorte   │")
    md_content.append("│  (SZDBIO.n)   │      │  (SZDBIB.n)   │      │  (SZDSTA.n)   │")
    md_content.append("└───────┬───────┘      └───────────────┘      └───────────────┘")
    md_content.append("        │")
    md_content.append("        ▼")
    md_content.append("┌───────────────┐")
    md_content.append("│Lebensdokumente│")
    md_content.append("│  (SZDLEB.n)   │")
    md_content.append("└───────────────┘")
    md_content.append("```\n")
    
    # Semantische Verbindungen
    md_content.append("### Semantische Verbindungen\n")
    md_content.append("1. **Personen als zentraler Knotenpunkt**:")
    md_content.append("   - Verbinden Werke, Korrespondenzen, Autographen und Lebenskalender")
    md_content.append("   - Bieten biographischen Kontext mit Geburts- und Sterbedaten")
    md_content.append("   - Enthalten GND-Verknüpfungen und Varianten von Namen\n")
    
    md_content.append("2. **Zeitliche Dimension**:")
    md_content.append("   - Lebenskalender strukturiert chronologisch wichtige Ereignisse")
    md_content.append("   - Korrespondenzen enthalten Datierungen")
    md_content.append("   - Werke haben Entstehungs- und Veröffentlichungsdaten\n")
    
    md_content.append("3. **Orte und Institutionen**:")
    md_content.append("   - Standorte verknüpfen physische Aufbewahrungsorte")
    md_content.append("   - Geografische Informationen in mehreren Sammlungen (Länder, Städte)\n")
    
    # Datenmodell-Analyse
    md_content.append("## Datenmodell-Eigenschaften\n")
    
    # Gemeinsame Elemente identifizieren
    common_elements = Counter()
    for category, data in category_data.items():
        for elem, count in data['element_counts'].items():
            if count > 0:
                common_elements[elem] += 1
    
    md_content.append("### Gemeinsame Strukturelemente\n")
    md_content.append("Folgende Elemente kommen in mehreren Sammlungen vor:\n")
    for elem, count in sorted(common_elements.items(), key=lambda x: x[1], reverse=True):
        if count > 1 and elem not in ['body']:
            md_content.append(f"- `<{elem}>`: in {count} Sammlungen")
            if count == len(category_data):
                md_content[-1] += " (universell)"
    
    # Empfehlungen für die Dashboard-Entwicklung
    md_content.append("\n## Empfehlungen für das Dashboard\n")
    
    md_content.append("### 1. Datenmodell und Indexierung\n")
    md_content.append("- Unified Data Model entwickeln, das die verschiedenen XML-Strukturen zusammenführt")
    md_content.append("- Sammlung von einheitlichen Metadatenfeldern über alle Kategorien")
    md_content.append("- Indexierung für schnelle Suche und Filterung\n")
    
    md_content.append("### 2. Visualisierungen\n")
    md_content.append("- **Chronologische Ansicht**: Zeitleiste mit Werken, Korrespondenzen und Lebensereignissen")
    md_content.append("- **Netzwerkansicht**: Korrespondenznetzwerk und Personenbeziehungen")
    md_content.append("- **Geographische Ansicht**: Karte mit Lebensstationen und Standorten")
    md_content.append("- **Thematische Ansicht**: Clustering von Werken und Korrespondenzen nach Themen\n")
    
    md_content.append("### 3. Benutzeroberfläche\n")
    md_content.append("- Mehrsprachige Unterstützung (mindestens Deutsch und Englisch)")
    md_content.append("- Facettensuche für komplexe Filterung")
    md_content.append("- Detail- und Übersichtsansichten")
    md_content.append("- Verlinkung zu externen Ressourcen (Wikipedia, GND)\n")
    
    md_content.append("### 4. Technische Umsetzung\n")
    md_content.append("- TEI XML über API abrufen und cachen")
    md_content.append("- Auflösung von Referenzen zwischen Dateien")
    md_content.append("- Robuste Fehlerbehandlung für fehlende Daten")
    md_content.append("- Responsives Design für verschiedene Endgeräte")
    
    # Schreibe die DATA.md
    with open("DATA.md", "w", encoding="utf-8") as f:
        f.write("\n".join(md_content))
    
    print("\n7. DATA.md GENERIERT")
    print("  Datei gespeichert als 'DATA.md'")

# Hauptfunktion
def main():
    print("Starte vertiefte Analyse der TEI XML-Dateien...")
    
    for url in urls:
        try:
            # Kategorie-Name aus URL extrahieren
            category = url.split('/')[-2].split('.')[-1]
            
            print(f"\nLade {category} von {url}...")
            response = requests.get(url, timeout=30)
            
            if response.status_code == 200:
                # Analysiere die XML-Struktur
                analyze_xml_structure(response.content, category)
            else:
                print(f"Fehler beim Laden von {url}: HTTP Status {response.status_code}")
                
        except Exception as e:
            print(f"Fehler bei der Verarbeitung von {url}: {str(e)}")
    
    # Sammklungsübergreifende Analyse durchführen
    generate_cross_references_analysis()
    
    # Netzwerkdaten für