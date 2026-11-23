# QuizBattle 🎯

**QuizBattle** ist eine desktopbasierte Quiz-Anwendung für zwei Teams, entwickelt mit **Java 21**, **JavaFX** und **Gradle**. Zwei Teams treten in mehreren Fragerunden gegeneinander an und sammeln Punkte, indem sie sich zuerst mit dem Buzzer melden und Fragen beantworten.

> Studienprojekt im Bereich Software Engineering mit eigener Quiz-Oberfläche, Spiellogik und automatisierten Tests.

## Funktionen

- **Zwei Teams:** Teamnamen festlegen, Punkte vergleichen und am Ende einen Sieger anzeigen.
- **Buzzer:** Über Schaltflächen oder die Tastatur melden sich die Teams für eine Antwort.
- **Fragenkategorien:** Geografie, Naturwissenschaften, Mathematik, Programmierung und Datenbanken.
- **Themenpakete:** Beispielsweise Hauptstädte, Physik, Algebra, Java, Python oder SQL.
- **Fragemodi:** Multiple Choice und freie Texteingabe.
- **Spielkonfiguration:** Anzahl der Fragen (1–20) und Zufallsmodus auswählen.
- **Zeitlimits:** Buzzer- und Antwortphasen mit Countdown.
- **Neustart:** Nach dem Spiel eine neue Runde starten.

Die Fragen sind aktuell **als Beispieldaten im Quellcode** hinterlegt und werden beim Start geladen. Eine externe Datenbank oder Internetverbindung ist nicht erforderlich.

## Technologien

| Bereich | Technologie |
|---|---|
| Sprache | Java 21 |
| Benutzeroberfläche | JavaFX 21, FXML, CSS |
| Build-Tool | Gradle (Wrapper enthalten) |
| Architektur | Modulare Aufteilung in API, Spiellogik und Benutzeroberfläche; Java-Module (JPMS) |
| Tests | JUnit 5 |
| Logging | SLF4J |

## Voraussetzungen

- **JDK 21**
- **IntelliJ IDEA** (empfohlen) oder eine andere Java-IDE
- Internetzugang für die **erste** Gradle-Synchronisierung (zum Laden von Abhängigkeiten)

JavaFX muss nicht manuell installiert werden; das Gradle-Plugin verwaltet die benötigten Bibliotheken.

## Projekt in IntelliJ IDEA starten

1. Repository herunterladen oder klonen und den Ordner **`QuizBattle`** in IntelliJ über **File → Open** öffnen.
2. Unter **File → Project Structure → Project** das **JDK 21** auswählen.
3. Unter **Settings → Build, Execution, Deployment → Build Tools → Gradle** bei **Gradle JVM** ebenfalls JDK 21 auswählen.
4. Das Gradle-Projekt synchronisieren (**Reload All Gradle Projects**).
5. Das integrierte Terminal öffnen und den passenden Startbefehl ausführen:

**Windows (PowerShell):**

```powershell
.\gradlew.bat :javafx:run
```

**Linux / macOS:**

```bash
./gradlew :javafx:run
```

Alternativ die Klasse `javafx/src/main/java/de/hhn/it/devtools/javafx/Main.java` über IntelliJ starten, wenn die Gradle-/JavaFX-Konfiguration übernommen wurde.

Der Startpunkt lädt **direkt QuizBattle** – ohne Auswahlmenü und ohne andere Beispielanwendungen.

## QuizBattle bedienen

1. Die Namen für **Team 1** und **Team 2** eingeben.
2. Kategorie und gegebenenfalls Themenpaket auswählen, oder den **Zufallsmodus** aktivieren.
3. Anzahl der Fragen einstellen und **Start game** anklicken.
4. Bei einer Frage meldet sich ein Team über den Buzzer:
   - **Q:** Team 1
   - **P:** Team 2
5. Bei Multiple-Choice-Fragen mit einer Schaltfläche oder mit **1–4** bzw. **A–D** antworten. Bei Textfragen die Antwort eintippen und absenden.
6. Nach Ende des Spiels den Punktestand ansehen und bei Bedarf **NEW GAME** wählen.

## Projektstruktur

```text
QuizBattle/
├── apis/            # Datenmodelle, Enums, Service-Schnittstellen und Exceptions
├── components/      # QuizGameService, Spielzustände, Antwortprüfung, Fragen
│   └── src/test/    # JUnit-Tests für die Spiellogik
├── javafx/          # JavaFX-Oberfläche (FXML, Controller, ViewModel, CSS, Bilder)
├── gradle/wrapper/  # Gradle Wrapper
├── gradlew           # Startskript für Linux/macOS
├── gradlew.bat       # Startskript für Windows
└── README.md
```

Die Fragen und Kategorien werden in `components/src/main/java/de/hhn/it/devtools/components/quizapp/service/generator/QuizDataGenerator.java` erstellt.

## Tests ausführen

**Windows:**

```powershell
.\gradlew.bat test
```

**Linux / macOS:**

```bash
./gradlew test
```

## Hinweise

- Die Anwendung ist ein **lokales Zwei-Team-Spiel**, kein Online-Mehrspielerspiel.


## SCreenshots 

- Home screen

![alt text](image.png)



- Gameplay screen

![alt text](image-1.png)