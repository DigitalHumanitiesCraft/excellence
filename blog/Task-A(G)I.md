---
layout: post
title: "OpenAI's Deep Research und erste \"Task-A(G)I\" Systeme?"
author: "Christopher Pollin"
date: 2025-02-15
published: true

# Spezifische Metadaten für diesen Post
citation:
  type: "blog-post"
  container-title: "Digital Humanities Craft"
  URL: "https://dhcraft.org/excellence/blog/Task-A(G)I"
  language: "de"
  accessed: "2025-02-15"
  
dublin_core:
  creator: "Christopher Pollin"
  publisher: "Digital Humanities Craft"
  subject: ["Artificial General Intelligence", "AGI", "Task-AGI", "OpenAI", "Deep Research", "Reasoning Models", "o3", "AI Research", "Prompt Engineering", "Digital Humanities"]
  description: "Eine kritische Analyse der Entwicklung spezialisierter KI-Systeme am Beispiel von OpenAI's Deep Research und dem Konzept der Task-A(G)I - KI-Systeme, die bei hochspezialisierten Aufgaben menschliche Fähigkeiten erreichen oder übertreffen"
  type: "Blogpost"
  format: "text/html"
  rights: "CC BY 4.0"
  language: "de"



schema_type: "BlogPosting"
keywords: ["Task-AGI", "OpenAI Deep Research", "o3", "Reasoning Models", "AGI", "AI Research", "Test-Time Compute", "Reinforcement Learning", "Leopold Aschenbrenner", "Scientific Research AI", "Prompt Engineering", "AI Agents"]

# Zusätzliche Zotero-Metadaten
website_title: "Digital Humanities Craft"
website_type: "Blog"
short_title: "Task-A(G)I und Deep Research"
abstract: "Der Beitrag führt das Konzept der 'Task-A(G)I' ein - spezialisierte KI-Systeme, die bei hochspezialisierten Aufgaben menschliche Fähigkeiten erreichen oder übertreffen, während sie bei anderen Aufgaben deutliche Grenzen haben. Am Beispiel von OpenAI's Deep Research wird gezeigt, wie solche Systeme komplexe intellektuelle Herausforderungen wie wissenschaftliches Recherchieren übernehmen können. Der Autor diskutiert die Implikationen für Bildung, Wissenschaft und Gesellschaft und fordert umfassende Kompetenzentwicklung in Europa."
---

![lurchy_httpss mj run2hlwcORSqyk_white_background_fading_out_--a_ad7eea4a-c59c-4476-aa13-1e0cf3436556](https://github.com/user-attachments/assets/807a54a8-24ad-46a6-acfe-72854ade9f50)

AGI (Artificial General Intelligence) ist ein unbrauchbarer Begriff – überbewertet und ohne präzise Definition. OpenAI definiert AGI als “hochgradig autonome Systeme, die Menschen bei den meisten wirtschaftlich wertvollen Tätigkeiten übertreffen”. Diese Definition bleibt jedoch vage: Was genau konstituiert eine Tätigkeit? Nach welchen Kriterien bemisst sich wirtschaftlicher Wert? Und woran lässt sich ein Übertreffen konkret festmachen? Eine interne Vereinbarung zwischen OpenAI und Microsoft aus dem Jahr 2023 definiert AGI über einen konkreten finanziellen Aspekt: Ein System gilt demnach als AGI, wenn es einen Gewinn von 100 Milliarden US-Dollar erwirtschaften kann. Diese Kennzahl erscheint jedoch willkürlich, da sich auch mit bestehenden Technologien vergleichbare Gewinne erzielen lassen. In einem aktuellen Blogbeitrag beschreibt Sam Altman AGI als ein System, das auf menschlichem Niveau zunehmend komplexe Probleme in verschiedenen Bereichen lösen kann.[^1] Trotz der weniger technischen Wortwahl erweist sich diese Definition für mich als die “brauchbarste” der drei Varianten.

Am Horizont zeichnet sich eine neue Entwicklung ab: spezialisierte KI-Systeme, die ich als “Task-A(G)I” bezeichne. Diese Systeme erreichen oder übertreffen menschliche Fähigkeiten bei hochspezialisierten Aufgaben, während sie bei anderen (auch ähnlichen) Aufgaben deutliche Grenzen haben. Darin liegt ihr zentrales Paradoxon: Sie zeigen eine beeindruckende “Intelligenz”, aber nur innerhalb ihrer spezifischen Domäne – und dort übertreffen sie bisherige Lösungen deutlich. Sie sind also nicht allgemein, sondern task-spezifisch, tragen aber einen Funken AGI in sich, da sie akademisch und wirtschaftlich verwertbare Ergebnisse liefern. Die bewusste Verwendung des Begriffes “AGI” spiegelt dabei die AGI-fokussierte Denkweise der (rein männlichen\!) Tech-Oligarchen wider.[^2] Dabei ist es wichtig zu verstehen: Dieser Horizont liegt nicht in ferner Zukunft – wir sind bereits mittendrin\!

Leopold Aschenbrenner[^3], ehemaliger Mitarbeiter bei OpenAI, hat im Juni 2024 einen, für mich damals, obskuren Essay verfasst: “SITUATIONAL AWARENESS: The Decade Ahead”.[^4] Seine These: Bis 2025/26 werden KI-Systeme viele Hochschulabsolventen in ihren Fähigkeiten übertreffen, und bis 2027 werden sie menschliche Arbeitskräfte in vielen Bereichen ersetzen können. Sein Zitat “You can see the future first in San Francisco” steht dabei in Kontrast zu meinen eigenen Erfahrungen dort – ich habe in keiner anderen Stadt so viele obdachlose Menschen gesehen. Ist das die Zukunft, die uns die Tech-Oligarchen versprechen? Und doch frage ich mich von Tag zu Tag mehr: Was ist, wenn Aschenbrenner Recht hat und es tatsächlich zu der von ihm postulierten Wissensexplosion kommt?

Ein Treiber dieser Entwicklung sind die Reasoning-Modelle, wie beispielsweise o3, über die ich bereits geschrieben habe.[^5] Die Skalierung mit Test-Time Compute und das Post-Training der LLMs mittels Prompting-Strategien wie “*Let's think step by step*”, “*Self-Reflection*”[^6] oder “*Verification*”[^7] führt zu besseren Ergebnissen – nicht nur bei Benchmarks, sondern auch im individuellen Arbeiten mit LLMs. Alles was “verifizierbar” ist, kann mit *Reinforcement Learning* gelöst werden. Das betrifft alle Mathematik-, Coding- und Logikaufgaben, also überall dort, wo im Training eine eindeutig richtige Lösung berücksichtigt werden kann. Dabei zielt *Reinforcement Learning* nicht auf die Lösungen selbst ab, sondern auf die Lösungswege\! Prompting-Techniken wurden sozusagen im Post-Training eines LLMs “hinein trainiert”.[^8]

Im Schatten des Medienechos zu R1 von Deep Seek wurde eine andere, aus meiner Sicht bedeutendere Anwendung, veröffentlicht: OpenAI’s Deep Research.[^9] Ethan Mollick beschreibt es treffend als “The End of Search, The Beginning of Research”.[^10] Deep Research ist eine Task-A(G)I für wissenschaftliches Recherchieren.

Aus dieser Entwicklung lassen sich mehrere Schlüsse ziehen:

1. Die technologischen Innovationen kommen immer noch deutlich schneller als allgemein angenommen.  
2. Alle Wissensjobs, die durch das “*Reinforcement Learning* eines Reasoning-Modells” abgedeckt werden können, stehen vor tiefgreifenden Transformationen.  
3. KI übernimmt nicht primär Routineaufgaben, sondern zunehmend komplexe intellektuelle Herausforderungen: Sie wird (zunächst) nicht unsere Formulare ausfüllen (denn wer will schon fehlerhafte Formulare nachkontrollieren?), sondern uns bei anspruchsvollen Aufgaben wie der Forschung oder Programmierung unterstützen – dort, wo wir die Ergebnisse ohnehin kritisch prüfen und einordnen müssen. LLMs sind nie zu 100% verlässlich, aber genau das macht sie für komplexe, iterative Prozesse interessanter als für simple Routineaufgaben.  
4. Europa muss jetzt handeln\! Nach über 70 Prompt Engineering-Workshops seit 2023 wird mir klar: Unsere Gesellschaft ist nicht ausreichend vorbereitet. Wir sollten dringend umfassende Kompetenzen aufbauen: Technologieverständnis, Prompting-Kenntnisse, Programmierfähigkeiten, Workflow-Management und Datenkompetenz, kombiniert mit kritischem, sozialem und ethischem Denken sowie fundiertem Fachwissen in spezifischen Domänen. Diese Transformation erfordert eine systematische Integration in unser Bildungssystem: von praxisorientierten KI-Modulen in der Berufsausbildung über verpflichtende Informatik\-[^11] und KI-Grundkurse an Hochschulen bis hin zu staatlich geförderten Weiterbildungsprogrammen für alle, insbesondere für Lehrer:innen und Pädagog:innen.

Warum ist “Deep Research” ein so prägnantes Beispiel für “Task-A(G)I”? Das System demonstriert, wie eine komplexe menschliche Aufgabe – das wissenschaftliche und professionelle Recherchieren und Zusammenfassen von Wissen, Information und Methoden – innerhalb von 5-30 Minuten von einem o3-basierten Agentensystem übernommen werden kann. Als jemand, der 8 Jahre an einer Universität gearbeitet hat, bin ich von der Qualität der Outputs ehrlich beeindruckt (Halluzinationen können trotzdem immer passieren)\! Hier sind einige Beispiele und Beobachtungen aus meinen Tests. Mit Claude 3.5 Sonnet habe ich den erhaltenen Inhalt (Exposé, Anfrage, Textbausteine) aufbereitet und in eine für ein Reasoning-Modell bzw. für Deep Research (nach meinem Verständnis[^12]) geeignete Prompt umgewandelt und mindestens 2 Iterationen durchgeführt. Der Output war jeweils ein ausführlicher, mit Quellenangaben versehener Output-Text von 10-25 Seiten.

* Eine Deep Research-Ausarbeitung eines Exposés für eine gut strukturierte Masterarbeit aus einer ingenieurwissenschaftlichen Disziplin: Mein Bekannter, der genau gewusst hat was er braucht, aber keine Lust und Zeit zumSchreiben und Recherchieren hatte, war von dem Output und seiner Qualität beeindruckt. Als Laie empfand ich die gefundenen Titel der Publikationen und Studien als sehr gut passend, konnte es aber letztlich nicht beurteilen. Ich war nicht der “*Expert-in-the-Loop*”.  
* Masterarbeit im Bereich Ethik: Sehr fundierte Ausarbeitung eines Teilbereichs – von der Recherche empirischer Daten bis zur darauf aufbauenden Argumentation. Die betreffende Person war von der Qualität des Ergebnisses hellauf begeistert. Und ja, Deep Research spuckt halbfertige Arbeiten mit Referenzen aus.  
* Erstellung eines Reflexionspapiers im pädagogischen Bereich: Das Ergebnis hätte ohne Änderungen \[als Seminararbeit\] eingereicht werden können und hätte eine gute Note verdient. Wird dann aber die Qualität des Textes oder der Reflexion bewertet? Aus meiner Sicht als ehemaliger Lehramtsstudent war das Fazit überzeugend, obwohl es natürlich keine echte persönliche Reflexion darstellt. Ein solches Werkzeug hat einen starken Einfluss auf unsere Meinungsbildung\! Die KI-gestützte Erstellung von Texten und Lösungen macht klassische Prüfungsformate wie Hausarbeiten als Bewertungsinstrumente wirkungslos. Wir brauchen stattdessen Prüfungsszenarien, in denen Lernende ihr Wissen aktiv anwenden müssen \- sei es durch die Entwicklung eigener Projektkonzepte, die Verteidigung ihrer Methodik in Fachgesprächen oder die Lösung komplexer Praxisfälle unter Aufsicht. Heißt: Wir brauchen mehr Zeit (und Geld, sowie Ausbildung) für Lehrpersonal\!  
* Ein [wissenschaftliches Review zu einer digitalen Edition](https://docs.google.com/document/d/1H1cKTqupQ2uK60bkEaMW1mEiPwaa7OanueNPxTS5ItY), konkret zu einer Edition, bei der ich als Entwickler mitgearbeitet habe.[^13] Dabei wurde in der Ausarbeitung zum Aspekt der Nachnutzung von Forschungsdaten sogar ein völlig korrektes und mir bis dahin unbekanntes Beispiel gefunden. Das hat mich sehr beeindruckt\! Hier zeigt sich deutlich die Stärke und gleichzeitig die Grenze des Systems: Es kann zwar Kriterienkataloge abarbeiten und durchaus intelligente Textbausteine verfassen, scheitert aber an der für wissenschaftliches Arbeiten essentiellen Aufgabe, präzise und feingranulare Referenzen zu Kriterien, Literatur und Edition zu setzen. Damit ist es letztlich kein wissenschaftliches Vorgehen im strengen Sinne; aber kann für eine Expertin extrem hilfreich sein\!  
* In einem Experiment erstellte Andrew Maynard¹ mit Deep Research eine 400-seitige Dissertation zum Thema globale Polykrisen. Trotz Schwächen bei Zitationen, Primärquellen und kritischer Quellenauswahl erreichte das System eine Syntheseleistung. Die tatsächliche KI-Verarbeitungszeit betrug dabei nur etwa drei Stunden. Maynard schlussfolgert, dass sich die Zukunft in Richtung KI-augmentierter statt rein autonomer KI-Forschung entwickeln wird.[^14] Dem stimme ich zu\! Ist das dann aber eine “echte wissenschaftliceh Arbeit”? Nein\! Aber es ist ein solider Textbaustein-Generator mit Quellenangaben.
* Eine interessante Limitation: Eine Suche nach [Urkunden mit Abbildungen von Bienenkörben aus ottonischer Zeit](https://docs.google.com/document/d/1NTp93dBhIdfMtq-cfuOozhtn5KF84eDjecbjDA0hUX8) in vorgegebenen Archivinformationsportalen (Dank an Pia Geißel und Patrick Sahle für das spannende Beispiel\!). Diese Aufgabe hätte eigentlich im Bereich des Möglichen liegen können, weil sie eine einfache Recherche in Fach-Webportalen und einfache Bilderkennungsfähigkeiten erfordert. Trotzdem ist OpenAI Deep Research hier grundsätzlich gescheitert, weil “Web-Actionability” nicht verlässlich ist und in Bildern nicht nach speziellen Mustern gesucht werden kann (sondern immer noch eine Bild-zu-Text-Logik vorherrscht). Vermutlich wurde das o3-Modell von OpenAI primär für die wissenschaftliche Literaturrecherche optimiert und beinhaltet nicht die Nutzung von lokalen (oft unterschiedlichen) Suchinterfaces. Deshalb liefert das System zwar wertvolle alternative Quellen, wie z.B. eine thematisch passende Dissertation, kann aber die Aufgabe selbst noch lange nicht so “operationalisieren”, wie ein Mensch das sofort tun würde.

Ist das alles also nur ein Hype? Zweifellos. Ist es gleichzeitig eine fundamentale Realität und ein Indiz für einen laufenden technologischen Wandel ins Ungewisse? Auf jeden Fall\!

Deep Research erreicht bei spezifischen Aufgaben eine deutlich bessere Performance als andere verfügbare Systeme. Perplexity ist zwar beeindruckend (und wird ebenfalls immer besser), kommt aber (noch) nicht an die Leistung im konkreten Task “professionelle akademische Recherche” an Deep Research heran. Diese Entwicklung deutet darauf hin, dass Task-A(G)I-Systeme bis 2026, so der Reigen der Ankündigungen der Tech-Konzerne, aber auch der Beobachter:innen, weitere Bereiche transformieren werden. Es spricht nichts dagegen, dass ähnliche – noch nicht existierende – Systeme für “Deep Coding” oder “Deep Math” entwickelt werden. Diese o3-basierten Agents[^15] könnten dann über längere Zeit arbeiten und fertig getestete Software produzieren, sowie komplexe Probleme durchrechnen. Der eigentliche Wert der Ergebnisse entsteht aber erst durch die Verifizierung durch Expert:innen – genauso wie durch präzises Prompting des Reasoning-Modells. Aber das ist ein Thema für einen anderen Blogpost...

*Christopher Pollin \- Digital Humanities Craft*

[^1]:  Three Observations. [https://blog.samaltman.com](https://blog.samaltman.com)

[^2]:  Philip von AI Explained hat dazu auf seinem Patreon eine aufschlussreiche Dokumentation über die (rein männlichen\!) Tech-CEOs und die Entwicklung ihrer AI Labs veröffentlicht. The One Machine to Rule Them All \- Origin Stories. Mini-Documentary on How the Founding Vision of Each AGI Lab Went Awry. [https://www.patreon.com/posts/121940490](https://www.patreon.com/posts/121940490). Paid Content.

[^3]:  [https://www.forourposterity.com](https://www.forourposterity.com)

[^4]:  Leopold Aschenbrenner. SITUATIONAL AWARENESS: The Decade Ahead. Juni 2024\. [https://situational-awareness.ai](https://situational-awareness.ai)

[^5]:  [https://dhcraft.org/excellence/blog/New-Year-New-AI-IdeaLab-25](https://dhcraft.org/excellence/blog/New-Year-New-AI-IdeaLab-25) 

[^6]:  Selbst-Reflexion (Self-Reflection): Damit ist gemeint, dass das Modell seine eigene Antwort oder seinen Gedankengang kritisch hinterfragt. Praktisch kann dies so aussehen, dass das LLM nach einer ersten Lösungsausgabe nochmals dazu aufgefordert wird, über die Lösung nachzudenken, mögliche Fehler zu identifizieren und Korrekturen vorzunehmen. Diese Technik wird auch als iterative Selbstverbesserung beschrieben​. [https://dev.to/rogiia/the-rise-of-reasoner-models-scaling-test-time-compute-33e3](https://dev.to/rogiia/the-rise-of-reasoner-models-scaling-test-time-compute-33e3)  

[^7]:  Hierbei wird nicht nur das Endergebnis geprüft, sondern jeder einzelne Schritt der Gedankenkette auf Korrektheit validiert. Diese Verifikation kann durch das Modell selbst oder durch ein zweites, spezialisiertes Modell (einen sogenannten Verifier) erfolgen. Der Schlüssel ist, dass Fehler lokalisiert werden können, anstatt die ganze Lösung als falsch zu verwerfen. [https://dev.to/rogiia/the-rise-of-reasoner-models-scaling-test-time-compute-33e3](https://dev.to/rogiia/the-rise-of-reasoner-models-scaling-test-time-compute-33e3) 

[^8]:  AI Explained. AGI: (gets close), Humans: 'Who Gets to Own it?'. [https://youtu.be/oUtbRMatq7s?si=afotrzgSisbw6Uuy](https://youtu.be/oUtbRMatq7s?si=afotrzgSisbw6Uuy). Interessanter X-Post von Andrej Karpathy. [https://x.com/karpathy/status/1883941452738355376](https://x.com/karpathy/status/1883941452738355376) 

[^9]:  [https://openai.com/index/introducing-deep-research](https://openai.com/index/introducing-deep-research/)

[^10]:  Ethan Mollick. The End of Search, The Beginning of Research. [https://www.oneusefulthing.org/p/the-end-of-search-the-beginning-of](https://www.oneusefulthing.org/p/the-end-of-search-the-beginning-of)

[^11]:  Die klassischen "Informatik"-Kurse vermitteln häufig 30 Jahre alte Konzepte und Sichtweisen, die an heutigen Herausforderungen vorbeigehen \- hier wären spezifischere Kursformate unter einer treffenderen Bezeichnung sinnvoller.

[^12]:  Es gibt noch nicht genug Informationen, um zu sagen, was die besten Prompting-Techniken für Reasoning Modelle sind. Auf jeden Fall sollte man nicht Few-Shot und Chain of Thought verwenden. Mir scheint, dass “Kriterien und Spezifikationen” ein gutes Gerüst für Reasoning-Modelle sind, um sich der Lösung zu nähern und Struktur in das Backtracking zu bringen.

[^13]:  Urfehdebücher der Stadt Basel – digitale Edition, hg. Von Susanna Burghartz, Basel/Graz 2017,  [https://gams.uni-graz.at/ufbas](https://gams.uni-graz.at/ufbas)

[^14]:  Maynard, A. (2025). Can AI write your PhD dissertation for you? The Future of Being Human. [https://futureofbeinghuman.com/p/can-ai-write-your-phd-dissertation](https://futureofbeinghuman.com/p/can-ai-write-your-phd-dissertation)

[^15]:  Und bald Agenten, die auf o4, o5 usw. basieren. Test Time Compute scheint derzeit sehr gut skalierbar zu sein.