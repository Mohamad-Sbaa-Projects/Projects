package de.hhn.it.devtools.components.quizapp.junit;

import de.hhn.it.devtools.apis.quizapp.Category;
import de.hhn.it.devtools.apis.quizapp.Question;
import de.hhn.it.devtools.apis.quizapp.Team;
import de.hhn.it.devtools.apis.quizapp.enums.Difficulty;
import de.hhn.it.devtools.apis.quizapp.enums.GameState;
import de.hhn.it.devtools.apis.quizapp.enums.QuestionType;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Test data models (records and classes)")
public class TestModels {

  @Test
  @DisplayName("Create Team with valid parameters")
  public void createTeamValid() {
    Team team = new Team(1, "Team Alpha", "#FF0000");
    assertEquals(1, team.id());
    assertEquals("Team Alpha", team.name());
    assertEquals("#FF0000", team.color());
  }

  @Test
  @DisplayName("Create Team with null color defaults to black")
  public void createTeamNullColor() {
    Team team = new Team(1, "Team Alpha", null);
    assertEquals("#000000", team.color());
  }

  @Test
  @DisplayName("Create Team with null name throws exception")
  public void createTeamNullName() {
    assertThrows(NullPointerException.class,
            () -> new Team(1, null, "#FF0000"));
  }

  @Test
  @DisplayName("Create Team with blank name throws exception")
  public void createTeamBlankName() {
    assertThrows(IllegalArgumentException.class,
            () -> new Team(1, "   ", "#FF0000"));
  }

  @Test
  @DisplayName("Create Team with empty name throws exception")
  public void createTeamEmptyName() {
    assertThrows(IllegalArgumentException.class,
            () -> new Team(1, "", "#FF0000"));
  }

  @Test
  @DisplayName("Team withId creates new instance with different ID")
  public void teamWithId() {
    Team team1 = new Team(1, "Team Alpha", "#FF0000");
    Team team2 = team1.withId(2);

    assertEquals(2, team2.id());
    assertEquals(team1.name(), team2.name());
    assertEquals(team1.color(), team2.color());
    assertNotSame(team1, team2);
  }

  @Test
  @DisplayName("Team toString returns name")
  public void teamToString() {
    Team team = new Team(1, "Team Alpha", "#FF0000");
    assertEquals("Team Alpha", team.toString());
  }

  @Test
  @DisplayName("Create Category as top-level")
  public void createTopLevelCategory() {
    Category cat = new Category("geo", "Geography");
    assertEquals("geo", cat.getId());
    assertEquals("Geography", cat.getName());
    assertNull(cat.getParentId());
    assertTrue(cat.isTopLevel());
  }

  @Test
  @DisplayName("Create Category with parent")
  public void createSubCategory() {
    Category cat = new Category("geo-countries", "Countries", "geo");
    assertEquals("geo-countries", cat.getId());
    assertEquals("Countries", cat.getName());
    assertEquals("geo", cat.getParentId());
    assertFalse(cat.isTopLevel());
  }

  @Test
  @DisplayName("Create Category with null ID throws exception")
  public void createCategoryNullId() {
    assertThrows(NullPointerException.class,
            () -> new Category(null, "Geography"));
  }

  @Test
  @DisplayName("Create Category with null name throws exception")
  public void createCategoryNullName() {
    assertThrows(NullPointerException.class,
            () -> new Category("geo", null));
  }

  @Test
  @DisplayName("Category equals based on ID")
  public void categoryEquals() {
    Category cat1 = new Category("geo", "Geography");
    Category cat2 = new Category("geo", "Different Name");
    Category cat3 = new Category("history", "History");

    assertEquals(cat1, cat2);
    assertNotEquals(cat1, cat3);
  }

  @Test
  @DisplayName("Category hashCode based on ID")
  public void categoryHashCode() {
    Category cat1 = new Category("geo", "Geography");
    Category cat2 = new Category("geo", "Different Name");

    assertEquals(cat1.hashCode(), cat2.hashCode());
  }

  @Test
  @DisplayName("Category toString returns name")
  public void categoryToString() {
    Category cat = new Category("geo", "Geography");
    assertEquals("Geography", cat.toString());
  }

  @Test
  @DisplayName("Create Multiple Choice Question")
  public void createMultipleChoiceQuestion() {
    Category cat = new Category("geo", "Geography");
    List<String> options = List.of("Paris", "London", "Berlin", "Madrid");
    Question q = new Question(1, "What is the capital of France?",
            options, 0, cat, Difficulty.EASY);

    assertEquals(1, q.id());
    assertEquals("What is the capital of France?", q.text());
    assertEquals(4, q.options().size());
    assertEquals(0, q.correctIndex());
    assertEquals(QuestionType.MULTIPLE_CHOICE, q.type());
    assertEquals(100, q.getPoints());
  }

  @Test
  @DisplayName("Create Text Input Question")
  public void createTextInputQuestion() {
    Category cat = new Category("geo", "Geography");
    Question q = new Question(2, "What is the capital of France?",
            "Paris", cat, Difficulty.MEDIUM);

    assertEquals(2, q.id());
    assertEquals("What is the capital of France?", q.text());
    assertEquals("Paris", q.correctAnswer());
    assertEquals(QuestionType.TEXT_INPUT, q.type());
    assertTrue(q.options().isEmpty());
    assertEquals(200, q.getPoints());
  }

  @Test
  @DisplayName("Create Question with null text throws exception")
  public void createQuestionNullText() {
    Category cat = new Category("geo", "Geography");
    assertThrows(NullPointerException.class,
            () -> new Question(1, null, "Paris", cat, Difficulty.EASY));
  }

  @Test
  @DisplayName("Create Question with null category throws exception")
  public void createQuestionNullCategory() {
    assertThrows(NullPointerException.class,
            () -> new Question(1, "What is the capital?", "Paris", null, Difficulty.EASY));
  }

  @Test
  @DisplayName("Create Question with null difficulty throws exception")
  public void createQuestionNullDifficulty() {
    Category cat = new Category("geo", "Geography");
    assertThrows(NullPointerException.class,
            () -> new Question(1, "What is the capital?", "Paris", cat, null));
  }

  @Test
  @DisplayName("Multiple Choice Question options are immutable")
  public void questionOptionsImmutable() {
    Category cat = new Category("geo", "Geography");
    List<String> options = List.of("Paris", "London", "Berlin", "Madrid");
    Question q = new Question(1, "Capital?", options, 0, cat, Difficulty.EASY);

    assertThrows(UnsupportedOperationException.class,
            () -> q.options().add("Rome"));
  }

  @Test
  @DisplayName("Test Difficulty EASY properties")
  public void difficultyEasyProperties() {
    assertEquals("Easy", Difficulty.EASY.getDisplayName());
    assertEquals(100, Difficulty.EASY.getPoints());
    assertEquals("#4CAF50", Difficulty.EASY.getColor());
    assertEquals(30, Difficulty.EASY.getTimeToBuzzer());
    assertEquals(7, Difficulty.EASY.getTimeToAnswer());
    assertEquals("Easy", Difficulty.EASY.toString());
  }

  @Test
  @DisplayName("Test Difficulty MEDIUM properties")
  public void difficultyMediumProperties() {
    assertEquals("Medium", Difficulty.MEDIUM.getDisplayName());
    assertEquals(200, Difficulty.MEDIUM.getPoints());
    assertEquals("#FF9800", Difficulty.MEDIUM.getColor());
    assertEquals(30, Difficulty.MEDIUM.getTimeToBuzzer());
    assertEquals(10, Difficulty.MEDIUM.getTimeToAnswer());
  }

  @Test
  @DisplayName("Test Difficulty HARD properties")
  public void difficultyHardProperties() {
    assertEquals("Hard", Difficulty.HARD.getDisplayName());
    assertEquals(300, Difficulty.HARD.getPoints());
    assertEquals("#F44336", Difficulty.HARD.getColor());
    assertEquals(30, Difficulty.HARD.getTimeToBuzzer());
    assertEquals(15, Difficulty.HARD.getTimeToAnswer());
  }

  @Test
  @DisplayName("All GameState values exist")
  public void gameStateValues() {
    GameState[] states = GameState.values();
    assertTrue(states.length >= 6);

    assertNotNull(GameState.valueOf("LOBBY"));
    assertNotNull(GameState.valueOf("PRESENTING_QUESTION"));
    assertNotNull(GameState.valueOf("WAITING_FOR_BUZZER"));
    assertNotNull(GameState.valueOf("WAITING_FOR_ANSWER"));
    assertNotNull(GameState.valueOf("SHOWING_RESULT"));
    assertNotNull(GameState.valueOf("GAME_OVER"));
  }

  @Test
  @DisplayName("All QuestionType values exist")
  public void questionTypeValues() {
    QuestionType[] types = QuestionType.values();
    assertEquals(2, types.length);

    assertNotNull(QuestionType.valueOf("MULTIPLE_CHOICE"));
    assertNotNull(QuestionType.valueOf("TEXT_INPUT"));
  }

  @Test
  @DisplayName("All Difficulty values exist")
  public void difficultyValues() {
    Difficulty[] difficulties = Difficulty.values();
    assertEquals(3, difficulties.length);

    assertNotNull(Difficulty.valueOf("EASY"));
    assertNotNull(Difficulty.valueOf("MEDIUM"));
    assertNotNull(Difficulty.valueOf("HARD"));
  }
}
