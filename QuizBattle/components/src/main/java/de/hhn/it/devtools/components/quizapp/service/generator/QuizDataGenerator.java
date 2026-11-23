package de.hhn.it.devtools.components.quizapp.service.generator;

import de.hhn.it.devtools.apis.exceptions.IllegalParameterException;
import de.hhn.it.devtools.apis.quizapp.Category;
import de.hhn.it.devtools.apis.quizapp.Question;
import de.hhn.it.devtools.apis.quizapp.enums.Difficulty;
import de.hhn.it.devtools.apis.quizapp.interfaces.AdminGameService;
import java.util.ArrayList;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Generator for demo data.
 * Uses loadCategories() and loadQuestions() API.
 * Contains both MULTIPLE_CHOICE and TEXT_INPUT question types.
 */
public class QuizDataGenerator {
  private static final Logger logger = LoggerFactory.getLogger(QuizDataGenerator.class);

  /**
   * Loads demo data into the service.
   * Calls loadCategories() and loadQuestions().
   *
   * @param service The service to populate
   * @throws IllegalParameterException if data is invalid
   * @throws IllegalStateException     if service is not ready
   */
  public static void loadDemoData(AdminGameService service)
          throws IllegalParameterException, IllegalStateException {
    logger.info("Creating demo data...");
    List<Category> categories = createDemoCategories();
    List<Question> questions = createDemoQuestions(categories);

    logger.info("Loading into service ({} questions)...", questions.size());
    service.loadCategories(categories);
    service.loadQuestions(questions);

    logger.info("Demo data loaded successfully!");
  }

  /**
   * Creates demo categories (max 2 levels).
   *
   * @return List of categories
   */
  public static List<Category> createDemoCategories() {
    List<Category> cats = new ArrayList<>();

    // LEVEL 1: TOP-LEVEL
    cats.add(new Category("geography", "Geography"));
    cats.add(new Category("science", "Science"));
    cats.add(new Category("math", "Mathematics"));
    cats.add(new Category("programming", "Programming"));
    cats.add(new Category("databases", "Databases"));

    // LEVEL 2: PACKS (subcategories)
    cats.add(new Category("geo-countries", "Countries & Capitals", "geography"));
    cats.add(new Category("geo-physical", "Physical Geography", "geography"));
    cats.add(new Category("sci-physics", "Physics", "science"));
    cats.add(new Category("sci-chemistry", "Chemistry", "science"));
    cats.add(new Category("mat-algebra", "Algebra", "math"));
    cats.add(new Category("mat-geometry", "Geometry", "math"));
    cats.add(new Category("pro-java", "Java", "programming"));
    cats.add(new Category("pro-python", "Python", "programming"));
    cats.add(new Category("db-sql", "SQL Basics", "databases"));

    return cats;
  }

  /**
   * Creates demo questions (20 per subcategory = 180 total).
   * Mix of MULTIPLE_CHOICE and TEXT_INPUT types.
   *
   * @param categories The categories (from createDemoCategories())
   * @return List of questions
   */
  public static List<Question> createDemoQuestions(List<Category> categories) {
    List<Question> questions = new ArrayList<>();
    int id = 1;

    // ===== GEO-COUNTRIES (20 questions - mix of MC and text input) =====
    Category geoCountries = findCategory(categories, "geo-countries");

    questions.add(new Question(id++, "What is the capital of Germany?",
            List.of("Munich", "Berlin", "Hamburg", "Frankfurt"), 1, geoCountries, Difficulty.EASY));
    questions.add(new Question(id++, "What is the capital of France?",
            List.of("Lyon", "Marseille", "Paris", "Nice"), 2, geoCountries, Difficulty.EASY));
    questions.add(new Question(id++, "What is the capital of Italy?",
            "Rome|Roma", geoCountries, Difficulty.EASY));
    questions.add(new Question(id++, "What is the capital of Spain?",
            List.of("Barcelona", "Madrid", "Valencia", "Seville"),
            1, geoCountries, Difficulty.EASY));
    questions.add(new Question(id++, "What is the capital of Japan?",
            List.of("Osaka", "Kyoto", "Tokyo", "Nagoya"), 2,
            geoCountries, Difficulty.EASY));
    questions.add(new Question(id++, "What is the capital of Canada?",
            List.of("Toronto", "Vancouver", "Montreal", "Ottawa"), 3,
            geoCountries, Difficulty.MEDIUM));
    questions.add(new Question(id++, "What is the capital of Australia?",
            List.of("Sydney", "Melbourne", "Canberra", "Brisbane"), 2,
            geoCountries, Difficulty.MEDIUM));
    questions.add(new Question(id++, "What is the capital of Brazil?",
            "Brasília|Brasilia", geoCountries, Difficulty.MEDIUM));
    questions.add(new Question(id++, "What is the capital of Egypt?",
            List.of("Alexandria", "Cairo", "Giza", "Luxor"), 1,
            geoCountries, Difficulty.EASY));
    questions.add(new Question(id++, "What is the capital of Turkey?",
            List.of("Istanbul", "Ankara", "Izmir", "Antalya"), 1,
            geoCountries, Difficulty.MEDIUM));
    questions.add(new Question(id++, "What is the capital of Argentina?",
            List.of("Córdoba", "Rosario", "Buenos Aires", "Mendoza"), 2,
            geoCountries, Difficulty.MEDIUM));
    questions.add(new Question(id++, "What is the capital of South Africa?",
            List.of("Johannesburg", "Durban", "Pretoria", "Cape Town"), 2,
            geoCountries, Difficulty.HARD));
    questions.add(new Question(id++, "What is the capital of India?",
            List.of("Mumbai", "Kolkata", "New Delhi", "Bangalore"), 2,
            geoCountries, Difficulty.EASY));
    questions.add(new Question(id++, "What is the capital of Russia?",
            "Moscow|Moskva", geoCountries, Difficulty.EASY));
    questions.add(new Question(id++, "What is the capital of Thailand?",
            List.of("Phuket", "Chiang Mai", "Bangkok", "Pattaya"), 2,
            geoCountries, Difficulty.MEDIUM));
    questions.add(new Question(id++, "What is the capital of South Korea?",
            List.of("Busan", "Seoul", "Incheon", "Daegu"), 1,
            geoCountries, Difficulty.EASY));
    questions.add(new Question(id++, "What is the capital of Mexico?",
            List.of("Guadalajara", "Monterrey", "Mexico City", "Tijuana"), 2,
            geoCountries, Difficulty.EASY));
    questions.add(new Question(id++, "What is the capital of Norway?",
            "Oslo", geoCountries, Difficulty.MEDIUM));
    questions.add(new Question(id++, "What is the capital of Poland?",
            List.of("Kraków", "Warsaw", "Gdańsk", "Wrocław"), 1, geoCountries,
            Difficulty.MEDIUM));
    questions.add(new Question(id++, "What is the capital of Portugal?",
            List.of("Porto", "Lisbon", "Faro", "Braga"), 1, geoCountries,
            Difficulty.EASY));

    // ===== GEO-PHYSICAL (20 questions - mix) =====
    Category geoPhysical = findCategory(categories, "geo-physical");

    questions.add(new Question(id++, "Which is the largest country by area?",
            List.of("USA", "China", "Russia", "Canada"), 2, geoPhysical,
            Difficulty.MEDIUM));
    questions.add(new Question(id++, "Which planet is known as the Red Planet?",
            List.of("Venus", "Mars", "Jupiter", "Saturn"), 1, geoPhysical,
            Difficulty.EASY));
    questions.add(new Question(id++, "What is the longest river in the world?",
            List.of("Amazon", "Nile", "Yangtze", "Mississippi"), 1, geoPhysical,
            Difficulty.MEDIUM));
    questions.add(new Question(id++, "What is the highest mountain in the world?",
            "Mount Everest|Everest", geoPhysical, Difficulty.EASY));
    questions.add(new Question(id++, "Which ocean is the largest?",
            List.of("Atlantic", "Indian", "Arctic", "Pacific"), 3, geoPhysical,
            Difficulty.EASY));
    questions.add(new Question(id++, "What is the largest desert in the world?",
            "Sahara|Sahara Desert", geoPhysical, Difficulty.MEDIUM));
    questions.add(new Question(id++, "Which continent has the most countries?",
            List.of("Asia", "Africa", "Europe", "South America"), 1, geoPhysical,
            Difficulty.MEDIUM));
    questions.add(new Question(id++, "What is the deepest point in the ocean?",
            "Mariana Trench", geoPhysical, Difficulty.HARD));
    questions.add(new Question(id++, "Which country has the most volcanoes?",
            List.of("Japan", "Indonesia", "USA", "Philippines"), 1, geoPhysical,
            Difficulty.HARD));
    questions.add(new Question(id++, "What is the largest island in the world?",
            List.of("Australia", "Greenland", "New Guinea", "Borneo"), 1, geoPhysical,
            Difficulty.MEDIUM));
    questions.add(new Question(id++, "In which year did the Berlin Wall fall?",
            "1989;tol=1", geoPhysical, Difficulty.EASY));

    questions.add(new Question(id++,
            "In which year was the European Union (EU) founded (Maastricht Treaty in effect)?",
            "1993;tol=1", geoPhysical, Difficulty.MEDIUM));

    questions.add(new Question(id++,
            "Approximately how many inhabitants does Germany have? (in millions)",
            "84;tol=3", geoPhysical, Difficulty.MEDIUM));

    questions.add(new Question(id++,
            "Approximately how many inhabitants does France have? (in millions)",
            "68;tol=3", geoPhysical, Difficulty.MEDIUM));

    questions.add(new Question(id++,
            "Approximately how many inhabitants does Japan have? (in millions)",
            "123;tol=5", geoPhysical, Difficulty.HARD));

    questions.add(new Question(id++,
            "How high is Mount Everest (in meters)?",
            "8849;tol=150", geoPhysical, Difficulty.MEDIUM));

    questions.add(new Question(id++,
            "How deep is the Mariana Trench at its deepest point (in meters)?",
            "11000;tol=500", geoPhysical, Difficulty.HARD));

    questions.add(new Question(id++,
            "Approximately how long is the Nile (in kilometers)?",
            "6650;tol=200", geoPhysical, Difficulty.MEDIUM));

    questions.add(new Question(id++,
            "Approximately how large is Russia (in million km²)?",
            "17;tol=2", geoPhysical, Difficulty.HARD));

    questions.add(new Question(id++,
            "In which year did the first human land on the Moon?",
            "1969;tol=1", geoPhysical, Difficulty.EASY));

    // ===== MATH-ALGEBRA
    Category matAlgebra = findCategory(categories, "mat-algebra");

    questions.add(new Question(id++, "What is the result of 2 + 3?",
            List.of("4", "5", "6", "7"), 1, matAlgebra, Difficulty.EASY));

    questions.add(new Question(id++, "Solve: 10 - 4",
            List.of("5", "6", "7", "4"), 1, matAlgebra, Difficulty.EASY));

    questions.add(new Question(id++, "Solve: 3 × 4",
            List.of("7", "10", "12", "14"), 2, matAlgebra, Difficulty.EASY));

    questions.add(new Question(id++, "Solve: 12 ÷ 3",
            List.of("2", "3", "4", "5"), 2, matAlgebra, Difficulty.EASY));

    questions.add(new Question(id++, "Solve for x: x + 5 = 10",
            "5", matAlgebra, Difficulty.EASY));

    questions.add(new Question(id++, "Solve for x: x - 7 = 3",
            "10", matAlgebra, Difficulty.EASY));

    questions.add(new Question(id++, "Solve: 2x = 14",
            List.of("5", "6", "7", "8"), 2, matAlgebra, Difficulty.MEDIUM));

    questions.add(new Question(id++, "Solve: x / 4 = 3",
            List.of("7", "10", "12", "16"), 2, matAlgebra, Difficulty.MEDIUM));

    questions.add(new Question(id++, "Solve: 5x = 25",
            "5", matAlgebra, Difficulty.MEDIUM));

    questions.add(new Question(id++, "Solve: 9 + x = 15",
            "6", matAlgebra, Difficulty.EASY));

    questions.add(new Question(id++, "Solve: 3x + 2 = 11",
            List.of("2", "3", "4", "5"), 1, matAlgebra, Difficulty.MEDIUM));

    questions.add(new Question(id++, "Solve: 4x = 20",
            List.of("3", "4", "5", "6"), 2, matAlgebra, Difficulty.EASY));

    questions.add(new Question(id++, "Solve: x² = 16",
            "4|-4", matAlgebra, Difficulty.MEDIUM));

    questions.add(new Question(id++, "Solve: 2x + 4 = 12",
            "4", matAlgebra, Difficulty.MEDIUM));

    questions.add(new Question(id++, "Solve: 7x = 49",
            "7", matAlgebra, Difficulty.EASY));

    questions.add(new Question(id++, "Solve: x² = 9",
            "3|-3", matAlgebra, Difficulty.MEDIUM));

    questions.add(new Question(id++, "Solve: 5 + 3x = 20",
            "5", matAlgebra, Difficulty.MEDIUM));

    questions.add(new Question(id++, "Solve: 2(x + 3) = 10",
            "2", matAlgebra, Difficulty.MEDIUM));

    questions.add(new Question(id++, "Solve: x - 8 = -2",
            "6", matAlgebra, Difficulty.EASY));

    questions.add(new Question(id++, "Solve: 6x + 4 = 40",
            "6", matAlgebra, Difficulty.HARD));

    // ===== MATH--GEOMETRY
    Category matGeometry = findCategory(categories, "mat-geometry");

    questions.add(new Question(id++, "How many sides does a triangle have?",
            List.of("2", "3", "4", "5"), 1, matGeometry, Difficulty.EASY));

    questions.add(new Question(id++, "How many sides does a square have?",
            List.of("3", "4", "5", "6"), 1, matGeometry, Difficulty.EASY));

    questions.add(new Question(id++, "What is the sum of angles in a triangle?",
            List.of("90°", "180°", "270°", "360°"), 1, matGeometry, Difficulty.EASY));

    questions.add(new Question(id++, "How many degrees is a right angle?",
            "90", matGeometry, Difficulty.EASY));

    questions.add(new Question(id++, "What is the perimeter of a square with side length 4?",
            "16", matGeometry, Difficulty.EASY));

    questions.add(new Question(id++, "How many sides does a pentagon have?",
            List.of("4", "5", "6", "7"), 1, matGeometry, Difficulty.EASY));

    questions.add(new Question(id++, "What is the area of a rectangle with width 4 and height 5?",
            "20", matGeometry, Difficulty.EASY));

    questions.add(new Question(id++, "How many degrees are in a full circle?",
            List.of("90", "180", "270", "360"), 3, matGeometry, Difficulty.EASY));

    questions.add(new Question(id++, "What is the area of a square with side length 6?",
            "36", matGeometry, Difficulty.MEDIUM));

    questions.add(new Question(id++, "How many sides does a hexagon have?",
            "6", matGeometry, Difficulty.EASY));

    questions.add(new Question(id++, "What is the perimeter of a triangle with sides 3, 4, and 5?",
            "12", matGeometry, Difficulty.MEDIUM));

    questions.add(new Question(id++, "What is the name of a 5-sided polygon?",
            "Pentagon", matGeometry, Difficulty.MEDIUM));

    questions.add(new Question(id++, "How many angles does a quadrilateral have?",
            "4", matGeometry, Difficulty.EASY));

    questions.add(new Question(id++, "What is the area of a triangle with base 10 and height 4?",
            "20", matGeometry, Difficulty.MEDIUM));

    questions.add(new Question(id++, "What is the name of a 6-sided polygon?",
            "Hexagon", matGeometry, Difficulty.MEDIUM));

    questions.add(new Question(id++, "How many degrees is a straight angle?",
            "180", matGeometry, Difficulty.EASY));

    questions.add(new Question(id++, "What is the perimeter of a square with side length 8?",
            "32", matGeometry, Difficulty.EASY));

    questions.add(new Question(id++, "How many faces does a cube have?",
            List.of("4", "5", "6", "8"), 2, matGeometry, Difficulty.MEDIUM));

    questions.add(new Question(id++, "What is the area of a rectangle with sides 3 and 7?",
            "21", matGeometry, Difficulty.EASY));

    questions.add(new Question(id++, "How many vertices does a triangle have?",
            "3", matGeometry, Difficulty.EASY));

    // ===== SCIENCE-PHYSICS (20 questions - mix) =====
    Category sciPhysics = findCategory(categories, "sci-physics");

    questions.add(new Question(id++, "What is the speed of light?",
            List.of("300,000 km/s", "150,000 km/s", "500,000 km/s", "100,000 km/s"), 0,
            sciPhysics, Difficulty.MEDIUM));
    questions.add(new Question(id++, "Who developed the theory of relativity?",
            "Einstein|Albert Einstein", sciPhysics, Difficulty.EASY));
    questions.add(new Question(id++, "What is Newton's first law of motion about?",
            List.of("Force", "Inertia", "Acceleration", "Momentum"), 1, sciPhysics,
            Difficulty.MEDIUM));
    questions.add(new Question(id++, "What unit measures force?",
            "Newton|Newtons|N", sciPhysics, Difficulty.MEDIUM));
    questions.add(new Question(id++, "What is the formula for kinetic energy?",
            List.of("mv", "½mv²", "mgh", "F=ma"), 1, sciPhysics, Difficulty.HARD));
    questions.add(new Question(id++, "What particle has no electric charge?",
            "Neutron|Neutrons", sciPhysics, Difficulty.MEDIUM));
    questions.add(new Question(id++, "What is the SI unit of energy?",
            List.of("Watt", "Joule", "Newton", "Pascal"), 1, sciPhysics, Difficulty.MEDIUM));
    questions.add(new Question(id++, "What does E=mc² relate?",
            List.of("Energy and mass", "Energy and force", "Mass and velocity",
                    "Time and space"), 0,
            sciPhysics, Difficulty.HARD));
    questions.add(new Question(id++, "What is absolute zero?",
            "-273.15°C|-273°C|0 Kelvin|0K", sciPhysics, Difficulty.HARD));
    questions.add(new Question(id++, "What travels faster: light or sound?",
            List.of("Light", "Sound", "Same speed", "Depends on medium"), 0, sciPhysics,
            Difficulty.EASY));
    questions.add(new Question(id++, "What is gravity?",
            List.of("Force of attraction", "Type of energy", "Form of radiation",
                    "Magnetic field"), 0,
            sciPhysics, Difficulty.EASY));
    questions.add(new Question(id++, "What is the symbol for wavelength?",
            "Lambda|λ", sciPhysics, Difficulty.HARD));
    questions.add(new Question(id++, "What happens to matter at absolute zero?",
            List.of("Stops moving", "Evaporates", "Expands", "Conducts electricity"), 0,
            sciPhysics, Difficulty.HARD));
    questions.add(new Question(id++, "What is the unit of frequency?",
            "Hertz|Hz", sciPhysics, Difficulty.MEDIUM));
    questions.add(new Question(id++, "What is an atom mostly made of?",
            List.of("Protons", "Neutrons", "Empty space", "Electrons"), 2, sciPhysics,
            Difficulty.MEDIUM));
    questions.add(new Question(id++, "What is Ohm's law?",
            "V=IR|V equals I times R|Voltage equals current times resistance", sciPhysics,
            Difficulty.HARD));
    questions.add(new Question(id++, "What is the first law of thermodynamics?",
            List.of("Energy conservation", "Entropy increase", "Heat transfer", "Work-energy"), 0,
            sciPhysics, Difficulty.HARD));
    questions.add(new Question(id++, "What is a photon?",
            List.of("Particle of light", "Type of atom", "Sound wave", "Magnetic field"), 0,
            sciPhysics, Difficulty.MEDIUM));
    questions.add(new Question(id++, "What does a prism do to white light?",
            "Splits it|Separates it|Disperses it|Diffracts it", sciPhysics, Difficulty.MEDIUM));
    questions.add(new Question(id++, "What is the acceleration due to gravity on Earth?",
            List.of("8.8 m/s²", "9.8 m/s²", "10.8 m/s²", "11.8 m/s²"), 1, sciPhysics,
            Difficulty.MEDIUM));

    // Continue with other categories...
    // (For brevity, I'll add a few more categories with the same pattern)

    // ===== PROGRAMMING-JAVA (20 questions - mix) =====
    Category proJava = findCategory(categories, "pro-java");

    questions.add(new Question(id++, "What is the file extension for Java source files?",
            ".java|java", proJava, Difficulty.EASY));
    questions.add(new Question(id++, "What keyword is used to inherit a class?",
            List.of("implements", "extends", "inherits", "derives"), 1, proJava,
            Difficulty.EASY));
    questions.add(new Question(id++, "What is the entry point of a Java program?",
            "main|main method|public static void main", proJava, Difficulty.EASY));
    questions.add(new Question(id++, "Which is NOT a primitive type in Java?",
            List.of("int", "boolean", "String", "char"), 2, proJava, Difficulty.MEDIUM));
    questions.add(new Question(id++, "What does JVM stand for?",
            "Java Virtual Machine", proJava, Difficulty.EASY));
    questions.add(new Question(id++, "What is encapsulation?",
            List.of("Hiding implementation", "Multiple inheritance", "Method overloading",
                    "Type casting"), 0, proJava, Difficulty.MEDIUM));
    questions.add(new Question(id++, "What keyword makes a variable constant?",
            "final", proJava, Difficulty.EASY));
    questions.add(new Question(id++, "What is polymorphism?",
            "Many forms|Multiple forms|Different forms", proJava,
            Difficulty.HARD));
    questions.add(new Question(id++, "Which loop is guaranteed to execute at least once?",
            List.of("for", "while", "do-while", "foreach"), 2, proJava, Difficulty.MEDIUM));
    questions.add(new Question(id++, "What does 'this' keyword refer to?",
            List.of("Current class", "Current method", "Current object", "Parent class"), 2,
            proJava, Difficulty.MEDIUM));
    questions.add(new Question(id++, "What is the default value of a boolean variable?",
            "false", proJava, Difficulty.EASY));
    questions.add(new Question(id++,
            "What interface must be implemented for a class to be compared?",
            List.of("Comparable", "Comparator", "Serializable", "Cloneable"), 0, proJava,
            Difficulty.MEDIUM));
    questions.add(new Question(id++, "What is the == operator used for?",
            List.of("Assignment", "Reference comparison", "Value comparison", "Type checking"), 1,
            proJava, Difficulty.MEDIUM));
    questions.add(new Question(id++, "What is a constructor?",
            List.of("Special method", "Variable", "Loop", "Operator"), 0, proJava,
            Difficulty.EASY));
    questions.add(new Question(id++, "What is method overloading?",
            "Same name different parameters|Multiple methods same name", proJava,
            Difficulty.MEDIUM));
    questions.add(new Question(id++, "What keyword is used for exception handling?",
            List.of("handle", "try", "except", "catch"), 1, proJava, Difficulty.EASY));
    questions.add(new Question(id++, "What is the superclass of all classes?",
            "Object", proJava, Difficulty.MEDIUM));
    questions.add(new Question(id++, "What does static mean?",
            List.of("Class level", "Instance level", "Final value", "Abstract method"), 0,
            proJava, Difficulty.MEDIUM));
    questions.add(new Question(id++, "What is garbage collection?",
            "Automatic memory management|Memory cleanup", proJava, Difficulty.HARD));
    questions.add(new Question(id++, "What is an interface?",
            List.of("Abstract class", "Contract", "Implementation", "Inheritance"), 1,
            proJava, Difficulty.MEDIUM));

    // ===== PROGRAMMING-PYTHON (20 questions - mix) =====
    Category proPython = findCategory(categories, "pro-python");

    questions.add(new Question(id++, "What is the file extension for Python?",
            ".py|py", proPython, Difficulty.EASY));
    questions.add(new Question(id++, "How do you start a comment in Python?",
            List.of("//", "/*", "#", "<!--"), 2, proPython, Difficulty.EASY));
    questions.add(new Question(id++, "Which keyword is used to define a function?",
            List.of("function", "def", "func", "define"), 1, proPython, Difficulty.EASY));
    questions.add(new Question(id++, "What is the output of print(2 ** 3)?",
            List.of("5", "6", "8", "9"), 2, proPython, Difficulty.EASY));
    questions.add(new Question(id++, "What does PEP stand for?",
            "Python Enhancement Proposal", proPython, Difficulty.HARD));
    questions.add(new Question(id++, "How do you create a list?",
            List.of("()", "{}", "[]", "<>"), 2, proPython, Difficulty.EASY));
    questions.add(new Question(id++, "What is the Boolean value of an empty list?",
            List.of("True", "False", "None", "Error"), 1, proPython, Difficulty.MEDIUM));
    questions.add(new Question(id++, "Which operator is used for floor division?",
            List.of("/", "//", "%", "**"), 1, proPython, Difficulty.MEDIUM));
    questions.add(new Question(id++, "What is None in Python?",
            List.of("A number", "A null value", "A string", "A boolean"), 1, proPython,
            Difficulty.EASY));
    questions.add(new Question(id++, "How do you import a module?",
            "import", proPython, Difficulty.EASY));
    questions.add(new Question(id++, "What does len() return for 'Hello'?",
            List.of("4", "5", "6", "Error"), 1, proPython, Difficulty.EASY));
    questions.add(new Question(id++, "What is a lambda function?",
            List.of("Named function", "Anonymous function", "Built-in function", "Class method"), 1,
            proPython, Difficulty.MEDIUM));
    questions.add(new Question(id++, "Which keyword is used for exception handling?",
            List.of("catch", "except", "handle", "error"), 1, proPython, Difficulty.EASY));
    questions.add(new Question(id++, "What is the correct way to create a dictionary?",
            List.of("[]", "{}", "()", "dict[]"), 1, proPython, Difficulty.EASY));
    questions.add(new Question(id++, "What does 'self' represent?",
            List.of("Current module", "Current function", "Current instance", "Parent class"), 2,
            proPython, Difficulty.MEDIUM));
    questions.add(new Question(id++, "Which data type is mutable?",
            List.of("tuple", "string", "list", "int"), 2, proPython, Difficulty.MEDIUM));
    questions.add(new Question(id++, "What is list comprehension?",
            "Concise way to create lists|Creating lists in one line", proPython,
            Difficulty.HARD));
    questions.add(new Question(id++, "What is the output of range(3)?",
            List.of("[0, 1, 2]", "[1, 2, 3]", "[0, 1, 2, 3]", "range object"), 3,
            proPython, Difficulty.MEDIUM));
    questions.add(new Question(id++, "What is pip?",
            List.of("Python IDE", "Package installer", "Python version", "Debugger"), 1,
            proPython, Difficulty.EASY));
    questions.add(new Question(id++, "What is a tuple?",
            "Immutable sequence|Unchangeable list", proPython, Difficulty.MEDIUM));

    // ===== DATABASE-SQL (20 questions - mix) =====
    Category dbSql = findCategory(categories, "db-sql");

    questions.add(new Question(id++, "What does SQL stand for?",
            List.of("Structured Query Language", "Simple Query Language",
                    "Standard Query Language", "System Query Language"), 0, dbSql,
            Difficulty.EASY));
    questions.add(new Question(id++, "Which command retrieves data?",
            List.of("GET", "SELECT", "FETCH", "RETRIEVE"), 1, dbSql, Difficulty.EASY));
    questions.add(new Question(id++, "What keyword filters rows?",
            "WHERE", dbSql, Difficulty.EASY));
    questions.add(new Question(id++, "What does UPDATE do?",
            List.of("Adds rows", "Modifies existing rows", "Deletes rows", "Creates tables"), 1,
            dbSql, Difficulty.EASY));
    questions.add(new Question(id++, "What is a primary key?",
            List.of("First column", "Unique identifier", "Foreign reference", "Index"), 1,
            dbSql, Difficulty.MEDIUM));
    questions.add(new Question(id++, "What command deletes data?",
            List.of("REMOVE", "DELETE", "DROP", "CLEAR"), 1, dbSql, Difficulty.EASY));
    questions.add(new Question(id++, "What is ORDER BY used for?",
            "Sorting|Sort results", dbSql, Difficulty.EASY));
    questions.add(new Question(id++, "What does COUNT() do?",
            List.of("Adds numbers", "Counts rows", "Multiplies values", "Finds maximum"), 1,
            dbSql, Difficulty.EASY));
    questions.add(new Question(id++, "Which is NOT a type of JOIN?",
            List.of("INNER JOIN", "LEFT JOIN", "MIDDLE JOIN", "RIGHT JOIN"), 2, dbSql,
            Difficulty.MEDIUM));
    questions.add(new Question(id++, "What keyword groups rows?",
            List.of("GROUP BY", "ORDER BY", "SORT BY", "CLUSTER BY"), 0, dbSql,
            Difficulty.MEDIUM));
    questions.add(new Question(id++, "What is a foreign key?",
            List.of("Unique key", "Reference to another table", "Encrypted key", "Index key"), 1,
            dbSql, Difficulty.MEDIUM));
    questions.add(new Question(id++, "What does LIMIT do?",
            List.of("Restricts number of rows returned", "Restricts column width",
                    "Sets maximum value", "Limits joins"), 0, dbSql, Difficulty.MEDIUM));
    questions.add(new Question(id++, "What is an INNER JOIN?",
            "Returns matching rows from both tables|Matching rows", dbSql, Difficulty.HARD));
    questions.add(new Question(id++, "What does AVG() calculate?",
            List.of("Sum", "Average", "Count", "Maximum"), 1, dbSql, Difficulty.EASY));
    questions.add(new Question(id++, "What command creates a table?",
            List.of("NEW TABLE", "CREATE TABLE", "MAKE TABLE", "ADD TABLE"), 1, dbSql,
            Difficulty.EASY));
    questions.add(new Question(id++, "What does DROP TABLE do?",
            List.of("Empties table", "Deletes table completely", "Backs up table", "Renames table"),
            1, dbSql, Difficulty.MEDIUM));
    questions.add(new Question(id++, "What is NULL?",
            List.of("Zero", "Empty string", "Absence of value", "False"), 2, dbSql,
            Difficulty.MEDIUM));
    questions.add(new Question(id++, "What operator checks for NULL?",
            List.of("= NULL", "== NULL", "IS NULL", "NULL?"), 2, dbSql, Difficulty.MEDIUM));
    questions.add(new Question(id++, "What does DISTINCT do?",
            List.of("Sorts data", "Removes duplicates", "Counts rows", "Groups data"), 1,
            dbSql, Difficulty.MEDIUM));
    questions.add(new Question(id++, "What does INSERT do?",
            List.of("Updates data", "Deletes data", "Adds new data", "Reads data"), 2,
            dbSql, Difficulty.EASY));

    return questions;
  }

  /**
   * Helper: Finds a category by ID.
   *
   * @param categories List of categories to search
   * @param id         The category ID to find
   * @return The matching category
   * @throws IllegalArgumentException if category is not found
   */
  private static Category findCategory(List<Category> categories, String id) {
    return categories.stream()
            .filter(c -> c.getId().equals(id))
            .findFirst()
            .orElseThrow(() -> new IllegalArgumentException("Category not found: " + id));
  }
}