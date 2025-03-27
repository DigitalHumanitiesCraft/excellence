# TEI-Compliant XML Model for Badisches Wörterbuch

## Enhanced TEI-Compliant XML Example for "Spinat"

```xml
<TEI xmlns="http://www.tei-c.org/ns/1.0">
  <teiHeader>
    <fileDesc>
      <titleStmt>
        <title>Badisches Wörterbuch: Spinat</title>
      </titleStmt>
      <publicationStmt>
        <publisher>Badisches Wörterbuch</publisher>
      </publicationStmt>
      <sourceDesc>
        <bibl>
          <title>Badisches Wörterbuch</title>
        </bibl>
      </sourceDesc>
    </fileDesc>
  </teiHeader>
  <text>
    <body>
      <entry xml:id="spinat">
        <form type="lemma">
          <orth>Spinat</orth>
        </form>
        
        <form type="pronunciation">
          <pron notation="phonetic">šbiną̄́d, ‑ǭ́‑</pron>
          <usg type="geo">
            <placeName type="settlement" key="Wertheim">Werthm</placeName>,
            <placeName type="settlement" key="Tauberbischofsheim">Tauberbisch.</placeName>,
            <placeName type="settlement" key="Oberschefflenz">O.scheffl.</placeName>,
            <placeName type="region">Kurpfalz</placeName>,
            <placeName type="settlement" key="Hockenheim" subtype="around">um Hockenhm</placeName>,
            <placeName type="region" subtype="partial">mancherorts Hanauerland und Breisgau</placeName>,
            <placeName type="settlement" key="Lörrach" subtype="sporadic">vereinz. um Lörrach</placeName>,
            <placeName type="settlement" key="Stockach">Stockach</placeName>
          </usg>
        </form>
        
        <form type="pronunciation">
          <pron notation="phonetic">šbįnā́d, ‑i‑, ‑t</pron>
          <usg type="geo">
            <placeName type="settlement" key="Freudenberg">Freudenbg</placeName>,
            <placeName type="settlement" key="Handschuhsheim">Handsch.</placeName>
            <note>(neben <pron notation="phonetic">šbinəd</pron>)</note>,
            <placeName type="settlement" key="Schwetzingen" subtype="sporadic">vereinz. um Schwetzgn</placeName>,
            <placeName type="settlement" key="Rappenau">Rapp.</placeName>,
            <placeName type="settlement" key="Zaisenhausen">Zaisenhsn</placeName>,
            <placeName type="region" subtype="common">verbr. nördl. u. mittlerer Schwarzw.</placeName>,
            <placeName type="region">Elztal und Simonswäldertal</placeName>,
            <placeName type="region">Breisgau</placeName>,
            <placeName type="region" subtype="sporadic">vereinz. Markgräflerland</placeName>,
            <placeName type="region">Hotzenwald</placeName>,
            <placeName type="region">Hegau</placeName>,
            <placeName type="region">Bodensee</placeName>
          </usg>
        </form>
        
        <form type="pronunciation">
          <pron notation="phonetic">šbenād</pron>
          <usg type="geo">
            <placeName type="settlement" key="Rohrbach bei Eppingen">Rohrb. (Epp.)</placeName>,
            <placeName type="settlement" key="Waldau">Waldau</placeName>,
            <placeName type="settlement" key="Möhringen, Steinen">Möhrgn, Steinen</placeName>
          </usg>
        </form>
        
        <form type="pronunciation">
          <pron notation="phonetic">sbẽnā̍t</pron>
          <usg type="geo">
            <placeName type="settlement" key="Pforzheim">Pforzhm</placeName>
          </usg>
        </form>
        
        <form type="pronunciation">
          <pron notation="phonetic">šbįną̄́d, ‑ǭ́‑</pron>
          <usg type="geo">
            <placeName type="region">verbr. entlang des Rheins in der Reinebene von <placeName type="settlement" key="Hügelsheim">Hügelshm</placeName> bis <placeName type="settlement" key="Kappel am Rhein">Kappel a. Rh.</placeName> und von <placeName type="settlement" key="Breisach">Breisach</placeName> bis <placeName type="settlement" key="Weil am Rhein">Weil a. Rh.</placeName></placeName>,
            <placeName type="region" subtype="sporadic">vereinz. Kaiserstuhl</placeName>
          </usg>
        </form>
        
        <form type="pronunciation">
          <pron notation="phonetic">šbenǭd</pron>
          <usg type="geo">
            <placeName type="settlement" key="Auenheim, Legelshurst">Auenhm, Legelshurst</placeName>,
            <placeName type="settlement" key="Altenheim">Altenhm</placeName>
            <note>neben <pron notation="phonetic">šbį̍nädš</pron></note>
          </usg>
        </form>
        
        <form type="pronunciation">
          <pron notation="phonetic">špįną̄́d, ‑i‑, ‑t</pron>
          <usg type="geo">
            <placeName type="region">Dinkelberg u. unteres Werratal</placeName>
          </usg>
        </form>
        
        <form type="pronunciation">
          <pron notation="phonetic">špįnā́d, ‑i‑, ‑t</pron>
          <usg type="geo">
            <placeName type="region" subtype="common">verbr. an Brigach u. Breg</placeName>,
            <placeName type="region">Baar</placeName>,
            <placeName type="region">Hochschwarzw.</placeName>,
            <placeName type="region">Hotzenwald</placeName>,
            <placeName type="region">Klettgau</placeName>,
            <placeName type="region">Hegau</placeName>,
            <placeName type="region">zw. Donau und Bodensee</placeName>,
            <placeName type="region">Linzgau</placeName>
          </usg>
        </form>
        
        <gramGrp>
          <gram type="gender">m.</gram>
        </gramGrp>
        
        <sense n="1">
          <usg type="domain">PflN.</usg>
          <sense n="a">
            <def>die Gartengemüsepflanze <term xml:lang="la">Spinacea oleracea</term> und das daraus zubereitete Gericht</def>
            <cit type="attestation">
              <bibl>
                <title>Platz</title>
                <biblScope unit="page">304</biblScope>
              </bibl>
            </cit>,
            <cit type="attestation">
              <bibl>
                <title>Heilig Gr.</title>
                <biblScope unit="page">35</biblScope>
              </bibl>
            </cit>,
            <cit type="attestation">
              <bibl>
                <title>Roedder Vspr.</title>
                <biblScope unit="page">531b</biblScope>
              </bibl>
            </cit>,
            <cit type="attestation">
              <bibl>
                <title>Meis. Wb.</title>
                <biblScope unit="page">177b</biblScope>
              </bibl>
            </cit>,
            <cit type="attestation">
              <bibl>
                <title>Lenz Wb.</title>
                <biblScope unit="page">67a</biblScope>
              </bibl>
            </cit>,
            <cit type="attestation">
              <bibl>
                <title>Frei Schbr.</title>
                <biblScope unit="page">154</biblScope>
              </bibl>
            </cit>,
            <cit type="attestation">
              <bibl>
                <title>Liébray</title>
                <biblScope unit="page">278</biblScope>
              </bibl>
            </cit>,
            <cit type="attestation">
              <bibl>
                <title>O. Sexauer</title>
                <biblScope unit="page">82</biblScope>
              </bibl>
            </cit>,
            <cit type="attestation">
              <bibl>
                <title>Heberling</title>
                <biblScope unit="page">30</biblScope>
              </bibl>
            </cit>,
            <cit type="attestation">
              <bibl>
                <title>Meng</title>
                <biblScope unit="page">265</biblScope>
              </bibl>
            </cit>,
            <cit type="attestation">
              <bibl>
                <title>Schwendemann Ort. 1</title>
                <biblScope unit="page">67</biblScope>
              </bibl>
            </cit>,
            <cit type="attestation">
              <bibl>
                <title>Schwer</title>
                <biblScope unit="page">39</biblScope>
              </bibl>
            </cit>,
            <cit type="attestation">
              <bibl>
                <title>Klausmann</title>
                <biblScope unit="page">106</biblScope>
              </bibl>
            </cit>,
            <cit type="attestation">
              <bibl>
                <title>Klausmann</title>
                <biblScope unit="page">Kt. 80</biblScope>
              </bibl>
            </cit>,
            <cit type="attestation">
              <bibl>
                <title>Twiste</title>
                <biblScope unit="page">49</biblScope>
              </bibl>
            </cit>,
            <cit type="attestation">
              <bibl>
                <title>Siefert</title>
                <biblScope unit="page">137</biblScope>
              </bibl>
            </cit>,
            <cit type="attestation">
              <bibl>
                <title>Beck</title>
                <biblScope unit="page">75</biblScope>
              </bibl>
            </cit>,
            <cit type="attestation">
              <bibl>
                <title>Beck</title>
                <biblScope unit="page">232</biblScope>
              </bibl>
            </cit>,
            <cit type="attestation">
              <bibl>
                <title>W. Schreiber</title>
                <biblScope unit="page">33</biblScope>
              </bibl>
            </cit>,
            <cit type="attestation">
              <bibl>
                <title>Kirner</title>
                <biblScope unit="page">295</biblScope>
              </bibl>
            </cit>,
            <cit type="attestation">
              <bibl>
                <title>E. Dreher</title>
                <biblScope unit="page">34</biblScope>
              </bibl>
            </cit>,
            <cit type="attestation">
              <bibl>
                <title>Zinsmeister</title>
                <biblScope unit="page">39</biblScope>
              </bibl>
            </cit>,
            <cit type="attestation">
              <bibl>
                <title>Fuchs</title>
                <biblScope unit="page">18</biblScope>
              </bibl>
            </cit>,
            <cit type="attestation">
              <bibl>
                <title>Joos</title>
                <biblScope unit="page">145</biblScope>
              </bibl>
            </cit>,
            <cit type="attestation">
              <bibl>
                <title>Zaisenhsn</title>/<title>ZfdMu.</title>
                <date>1907</date>,
                <biblScope unit="page">272</biblScope>
              </bibl>
            </cit>,
            <cit type="attestation">
              <bibl>
                <title>O.weier (Rast.)</title>/<abbr>eb.</abbr>
                <date>1916</date>,
                <biblScope unit="page">287</biblScope>
              </bibl>
            </cit>
            
            <cit type="idiom">
              <quote xml:lang="dialect">aim dər šbį̍nädš fərlǟsə</quote>
              <def>Vorwürfe machen</def>
              <usg type="geo">
                <placeName type="settlement" key="Altenheim">Altenhm</placeName>
              </usg>
              <xr type="see">
                <ref target="#verlesen.3a">verlesen 3a</ref>
              </xr>
            </cit>
          </sense>
          
          <sense n="b">
            <def>Neuseeländer Spinat, <term xml:lang="la">Tetragonia expansa</term></def>
            <cit type="example">
              <quote>ebige Spinat</quote>
              <bibl>
                <date>1915</date>
                <placeName type="settlement" key="Müllheim">Müllhm</placeName>
              </bibl>
            </cit>
            <xr type="see">
              <ref target="#ewig.2eγ">ewig 2eγ</ref>
            </xr>
          </sense>
          
          <sense n="c">
            <note type="definition">eine nicht näher beschriebene Pflanze</note>
            <cit type="example">
              <quote>Wilder Spinat</quote>
              <bibl>
                <placeName type="settlement" key="Freistett">Freistett</placeName>/<title>Mitteil.</title>
                <date>1933</date>,
                <biblScope unit="page">312</biblScope>
              </bibl>
            </cit>
          </sense>
        </sense>
        
        <sense n="2">
          <usg type="style">übertr.</usg>
          <def>Kuhfladen</def>
          <cit type="example">
            <quote>Wie kummd der Schbinaad uffs Dach, die Kuh kann doch nid fliege?</quote>
            <note type="explanation">fragt man in höchstem Erstaunen über Unerwartetes, aber auch als Erwiderung auf dumme Fragen</note>
            <bibl>
              <title>Bräutigam Mach</title>
              <biblScope unit="page">116</biblScope>
            </bibl>
          </cit>
        </sense>
        
        <etym>
          <lang>ital.</lang>
          <mentioned xml:lang="it">spinacio</mentioned>
          <gloss>Spinat</gloss>
        </etym>
        
        <xr type="related">
          <lbl>Weiteres</lbl>
          <ref target="#lauch.1">Lauch 1</ref>
        </xr>
        
        <xr type="syn">
          <lbl>Syn. (nicht nur Bed. 1a):</lbl>
          <ref>Pflätterlekraut</ref>,
          <ref>Binätsch</ref>,
          <ref>Burkhard 2</ref>,
          <ref>I Fimmel 2</ref>,
          <ref>Gartenmelde</ref>,
          <ref>Girgele‑</ref>,
          <ref>Grün‑</ref>,
          <ref>Häckerlekraut</ref>,
          <ref>Hasenköhl</ref>,
          <ref>Kraut 1c</ref>,
          <ref>Maschel 2</ref>,
          <ref>Melde 1</ref>,
          <ref>Neuseeländer</ref>,
          <ref>Schlappes‑</ref>,
          <ref>Schlappkraut</ref>,
          <ref>siebenerlei</ref>,
          <ref>Süßkraut</ref>
        </xr>
        
        <listBibl>
          <bibl>
            <title>DWb.</title>
            <biblScope unit="volume">10/1</biblScope>,
            <biblScope unit="page">2489</biblScope>
          </bibl>;
          <bibl>
            <title>Fischer</title>
            <biblScope unit="volume">5</biblScope>,
            <biblScope unit="page">1540</biblScope>
          </bibl>;
          <bibl>
            <title>Pfälz.</title>
            <biblScope unit="volume">6</biblScope>,
            <biblScope unit="page">282</biblScope>
          </bibl>;
          <bibl>
            <title>Schweiz.</title>
            <biblScope unit="volume">10</biblScope>,
            <biblScope unit="page">337</biblScope>
          </bibl>;
          <bibl>
            <title>SDS</title>
            <biblScope unit="volume">VI</biblScope>,
            <biblScope unit="page">186</biblScope>
          </bibl>;
          <bibl>
            <title>Südhess.</title>
            <biblScope unit="volume">5</biblScope>,
            <biblScope unit="page">1182</biblScope>
          </bibl>
        </listBibl>
      </entry>
    </body>
  </text>
</TEI>
```

# Requirements Document for Badisches Wörterbuch XML Conversion to TEI

## 1. Project Overview

This document outlines the requirements for enhancing the XML markup of the Badisches Wörterbuch dictionary entries to comply with TEI (Text Encoding Initiative) standards. The goal is to transform the current basic markup into a semantically rich, TEI-compliant XML structure that properly represents the logical relationships and implicit knowledge in the text while preserving all information from the print edition.

## 2. TEI Compliance Requirements

The converted XML must comply with the TEI P5 Guidelines, specifically the "Dictionaries" module, which provides specialized elements for lexicographic resources.

## 3. Structure Conversion Rules

### 3.1 Article Structure

**Original Structure**:
```xml
<artikel><fett>Spinat</fett> ... </artikel>
```

**TEI Structure**:
```xml
<TEI xmlns="http://www.tei-c.org/ns/1.0">
  <teiHeader>...</teiHeader>
  <text>
    <body>
      <entry xml:id="spinat">...</entry>
    </body>
  </text>
</TEI>
```

**Rule**: Each `<artikel>` element becomes a TEI `<entry>` element with a unique `xml:id` attribute derived from the lemma.

### 3.2 Lemma

**Original Structure**:
```xml
<fett>Spinat</fett>
```

**TEI Structure**:
```xml
<form type="lemma"><orth>Spinat</orth></form>
```

**Rule**: The first `<fett>` element in the article becomes the lemma form and is wrapped in TEI `<form type="lemma">` and `<orth>` elements.

### 3.3 Pronunciation Section

**Original Structure**:
```xml
<kursiv>šbiną̄́d, ‑ǭ́‑</kursiv> <gesperrt>Werthm</gesperrt>, ...
```

**TEI Structure**:
```xml
<form type="pronunciation">
  <pron notation="phonetic">šbiną̄́d, ‑ǭ́‑</pron>
  <usg type="geo">
    <placeName type="settlement" key="Wertheim">Werthm</placeName>
    ...
  </usg>
</form>
```

**Rules**:
1. Each pronunciation variant (separated by semicolons) becomes a separate `<form type="pronunciation">` element
2. The phonetic transcription in `<kursiv>` becomes a `<pron notation="phonetic">` element
3. Location names in `<gesperrt>` become `<placeName>` elements inside a `<usg type="geo">` element
4. Place names receive attributes:
   - `type="settlement"` for specific locations
   - `type="region"` for broader areas
   - `key="..."` for the expanded form from the mapping table
   - `subtype="..."` for distributional markers (e.g., "verbr.", "vereinz.", etc.)

### 3.4 Grammar Section

**Original Structure**:
```xml
‒ m.:
```

**TEI Structure**:
```xml
<gramGrp>
  <gram type="gender">m.</gram>
</gramGrp>
```

**Rule**: Grammatical information after the first dash (‒) is tagged using appropriate TEI elements: `<gramGrp>`, `<gram type="...">`, etc.

### 3.5 Meaning Section

**Original Structure**:
```xml
<fett>1)</fett> PflN. <fett>a)</fett> <bedeutung>‚die Gartengemüsepflanze...'</bedeutung>
```

**TEI Structure**:
```xml
<sense n="1">
  <usg type="domain">PflN.</usg>
  <sense n="a">
    <def>die Gartengemüsepflanze...</def>
    ...
  </sense>
</sense>
```

**Rules**:
1. Each numbered meaning becomes a `<sense>` element with an `n` attribute
2. Semantic field markers (e.g., "PflN.") become `<usg type="domain">` elements
3. Sub-meanings (a, b, c, etc.) become nested `<sense>` elements
4. Definition text in `<bedeutung>` becomes a `<def>` element
5. Technical/scientific terms become `<term xml:lang="la">` elements
6. Bibliographic references become `<cit type="attestation">` with nested `<bibl>` elements

### 3.6 Example Sentences and Idioms

**Original Structure**:
```xml
Ra.: <kursiv>aim dər šbį̍nädš fərlǟsə</kursiv> <bedeutung>‚Vorwürfe machen'</bedeutung> <gesperrt>Altenhm</gesperrt>
```

**TEI Structure**:
```xml
<cit type="idiom">
  <quote xml:lang="dialect">aim dər šbį̍nädš fərlǟsə</quote>
  <def>Vorwürfe machen</def>
  <usg type="geo">
    <placeName type="settlement" key="Altenheim">Altenhm</placeName>
  </usg>
</cit>
```

**Rules**:
1. Examples marked with "Ra.:" (Redensart) become `<cit type="idiom">` elements
2. Other examples become `<cit type="example">` elements
3. The example text in `<kursiv>` becomes a `<quote>` element
4. Definitions in `<bedeutung>` become `<def>` elements
5. Location information becomes `<usg type="geo">` with nested `<placeName>` elements

### 3.7 Etymology Section

**Original Structure**:
```xml
‒ Aus ital. <kursiv>spinacio</kursiv> <bedeutung>‚Spinat'</bedeutung>.
```

**TEI Structure**:
```xml
<etym>
  <lang>ital.</lang>
  <mentioned xml:lang="it">spinacio</mentioned>
  <gloss>Spinat</gloss>
</etym>
```

**Rules**:
1. Etymology section starts with a dash and "Aus"
2. Source language becomes a `<lang>` element
3. Foreign term in `<kursiv>` becomes a `<mentioned>` element with appropriate `xml:lang` attribute
4. Definition in `<bedeutung>` becomes a `<gloss>` element

### 3.8 Reference Section

**Original Structure**:
```xml
‒ Weiteres → <kursiv>Lauch 1</kursiv>; Syn. (nicht nur Bed. 1a): <kursiv>Pflätterlekraut</kursiv>, ...
```

**TEI Structure**:
```xml
<xr type="related">
  <lbl>Weiteres</lbl>
  <ref target="#lauch.1">Lauch 1</ref>
</xr>

<xr type="syn">
  <lbl>Syn. (nicht nur Bed. 1a):</lbl>
  <ref>Pflätterlekraut</ref>,
  ...
</xr>
```

**Rules**:
1. References beginning with "Weiteres" become `<xr type="related">` elements
2. Synonym lists become `<xr type="syn">` elements
3. Each reference in `<kursiv>` becomes a `<ref>` element
4. Cross-references to other entries get a `target` attribute with the format "#lemma.sense"
5. Introductory text becomes a `<lbl>` (label) element

### 3.9 Bibliography Section

**Original Structure**:
```xml
<klein>DWb. 10/1, 2489; Fischer 5, 1540; ...</klein>
```

**TEI Structure**:
```xml
<listBibl>
  <bibl>
    <title>DWb.</title>
    <biblScope unit="volume">10/1</biblScope>,
    <biblScope unit="page">2489</biblScope>
  </bibl>;
  ...
</listBibl>
```

**Rules**:
1. Bibliography section in `<klein>` becomes a `<listBibl>` element
2. Each bibliographic entry (separated by semicolons) becomes a `<bibl>` element
3. Source title becomes a `<title>` element
4. Volume numbers become `<biblScope unit="volume">` elements
5. Page numbers become `<biblScope unit="page">` elements

## 4. Punctuation and Separator Conversion Rules

### 4.1 Semicolon (;)

**Rules**:
1. In the pronunciation section: Separates different pronunciation variants → Create new `<form type="pronunciation">` elements
2. In the bibliography section: Separates different bibliographic references → Create new `<bibl>` elements
3. In lists of synonyms: Preserved as text content

### 4.2 Comma (,)

**Rules**:
1. Between locations in pronunciation section: Preserved as text content
2. Between bibliographic elements: Preserved as text content
3. Between synonyms: Preserved as text content

### 4.3 Dash (‒)

**Rules**:
1. First dash: Marks the start of the grammar section → Begin `<gramGrp>`
2. Dash before numbered meanings: Marks section transitions → Begin new `<sense>`
3. Dash before "Aus": Marks the start of etymology → Begin `<etym>`
4. Dash before "Weiteres": Marks the start of references → Begin `<xr type="related">`

### 4.4 Slash (/)

**Rules**:
1. Between location and source: Create separate `<placeName>` and `<title>` elements within a `<bibl>` element

## 5. Handling Implicit Information

### 5.1 Geographic Distribution

**Rules**:
1. Distribution markers (verbr., vereinz., mancherorts, etc.) become attributes of `<placeName>` elements:
   - `verbr.` → `subtype="common"`
   - `vereinz.` → `subtype="sporadic"`
   - Other distribution markers are preserved as `subtype` values

### 5.2 Location Mapping

**Rules**:
1. Abbreviated place names receive both the abbreviated and expanded forms:
   - Original abbreviation as text content
   - Full name in the `key` attribute

### 5.3 References

**Rules**:
1. References to other entries receive a `target` attribute with the format "#lemma.sense"
2. Meaning numbers and letters in references are preserved in the target reference

### 5.4 Latin Terms

**Rules**:
1. Scientific names in `<grotesk>` become `<term xml:lang="la">` elements

## 6. Mapping Requirements

The conversion requires several mapping tables:

1. **Place Name Mappings**: Abbreviated to full place names
   - Format: `abbr,expan,type`
   - Example: `Werthm,Wertheim,settlement`

2. **Source Mappings**: Abbreviated sources to full bibliographic information
   - Format: `abbr,expan,type`
   - Example: `Platz,Platz Hermann,author`

3. **Language Mappings**: Language abbreviations to ISO language codes
   - Format: `abbr,code`
   - Example: `ital.,it`

4. **Distribution Term Mappings**: Distribution abbreviations to standardized terms
   - Format: `abbr,term`
   - Example: `verbr.,common`

## 7. Validation Requirements

1. The output XML must be valid according to the TEI P5 schema
2. All required TEI elements must be present and properly nested
3. All attributes must have valid values according to TEI guidelines
4. All cross-references must reference valid targets

## 8. Edge Cases and Special Handling

1. **Variant Pronunciations**: Handle cases where there are multiple pronunciation variants for a single location
2. **Nested Regions**: Handle hierarchical geographic descriptions
3. **Scientific Names**: Ensure proper encoding of all scientific/Latin terms
4. **Missing Information**: Handle cases where expected elements are missing
5. **Unclear Section Boundaries**: Develop heuristics for ambiguous section transitions

## 9. Quality Criteria

1. **Completeness**: All information from the source must be preserved
2. **Accuracy**: The semantic structure must correctly represent the implicit relationships
3. **Compliance**: The output must conform to TEI P5 guidelines
4. **Consistency**: Similar structures must be encoded in the same way
5. **Usability**: The structure must support advanced query and display requirements

## 10. Conversion:

**Initial structure analysis**: Use an LLM to analyze a representative sample of entries to identify all patterns and edge cases  
**Rules development**: Based on this analysis, develop a comprehensive set of transformation rules  
**Automated processing**: Implement these rules in XSLT or a custom parser for the bulk of the transformation  
**LLM for edge cases**: Use an LLM specifically for the entries that don't fit the standard patterns  
**Validation pipeline**: Create a robust validation process to ensure TEI compliance and structural consistency
