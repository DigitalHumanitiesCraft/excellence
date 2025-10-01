# Promptotyping Methode -  Guide

## **Kernprinzip: Context Compression**
- **Nicht** mehr Informationen → **bessere** Informationen
- Komplexe Anforderungen auf relevante Essenz reduzieren
- Fokussierte Token = bessere LLM-Performance

---

# Promptotyping Step-by-Step Guide

## **Phase 1: Dokument-Setup **

### **Die 3 Kernfragen beantworten:**

**WHAT? (Pflicht)**
```
README.md → WARUM? Kontext, Motivation, Domäne
REQUIREMENTS.md → WAS? Funktionale + nicht-funktionale Anforderungen
```

**USING WHAT? (Optional)**
```
DATA.md → WOMIT? Datenstrukturen, APIs, Beispiele
```

**HOW? (Je nach Bedarf)**
```
INSTRUCTIONS.md → WIE UMSETZEN? Konkrete Schritte
DESIGN.md → WIE AUSSEHEN? UI/UX Anforderungen  
LLM.md → Arbeitsgedächtnis, Code-Dokumentation
```

### **Flexibel anpassen:** Nur erstellen, was wirklich gebraucht wird!

## **Phase 2: Requirements Engineering **

### **REQUIREMENTS.md strukturieren:**
```
# Muss-Kriterien (F1, F2, F3...)
- [Grundfunktionen, ohne die es nicht geht]

# Kann-Kriterien (P1, P2, P3...)  
- [Nice-to-have Features]

# Nicht-Ziele
- [Was explizit NICHT gemacht wird]
```

### **Context Compression anwenden:**
- **Präzise Fachbegriffe** nutzen ("Single Page App" vs "Website")
- **Überflüssiges weglassen** - nur relevanter Kontext
- **Strukturiert formulieren** - Markdown hilft dem LLM

## **Phase 3: Iterative Entwicklung**

### **4-Phasen-Zyklus:**

**1. Prompt Engineering**
```
Kontext: [Verweis auf README.md]
Anforderungen: [Verweis auf REQUIREMENTS.md]  
Daten: [Verweis auf DATA.md wenn vorhanden]
Nächster Schritt: [NUR eine Sache implementieren]
```

**2. Prototyping**
- **Schrittweise:** Erst Daten → dann UI → dann Features
- **Testen nach jedem Schritt**

**3. Critical Expert Review**
```
"Analysiere kritisch: Welche Probleme hat dieser Code?"
"Erkläre wie einem 5-Jährigen: Wie funktioniert das?"
"Was sind 3 Risiken bei diesem Ansatz?"
```

**4. Evaluation & Dokumentation**
- **LLM.md aktualisieren:** Code-Änderungen dokumentieren
- **Lessons Learned:** Was funktioniert? Was nicht?

## **Phase 4: Expert-in-the-Loop Integration**

### **Kontinuierliche Validierung:**
- **Domänenexperte** prüft sowohl Code als auch Dokumente
- **Iterative Verbesserung** der Promptotyping Documents
- **Versionierung** wichtiger Änderungen

---

## **Praktische Tipps:**

✅ **Beginne minimal:** README.md + REQUIREMENTS.md reichen oft  
✅ **Erweitere bei Bedarf:** Weitere Dokumente nur wenn nötig  
✅ **Komprimiere Kontext:** Weniger, aber präzisere Informationen  
✅ **Expert einbinden:** Regelmäßige Validierung durch Fachleute  
✅ **Dokumentiere Prozess:** Was funktioniert gut beim Prompting?

**Zeitaufwand:** 15-60 Min für Setup, dann iterative Zyklen

## **Ziel:** Systematisches, nachvollziehbares Vibe Coding mit Expert-Validation
