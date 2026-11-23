package de.hhn.it.devtools.components.quizapp.junit;

import de.hhn.it.devtools.apis.exceptions.IllegalParameterException;
import de.hhn.it.devtools.apis.quizapp.Category;
import de.hhn.it.devtools.apis.quizapp.Question;
import de.hhn.it.devtools.apis.quizapp.Team;
import de.hhn.it.devtools.apis.quizapp.enums.Difficulty;
import de.hhn.it.devtools.apis.quizapp.interfaces.AdminGameService;
import de.hhn.it.devtools.apis.quizapp.interfaces.GameService;
import de.hhn.it.devtools.components.quizapp.service.QuizGameService;
import de.hhn.it.devtools.components.quizapp.service.generator.QuizDataGenerator;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertTrue;


import java.util.List;

import static org.junit.jupiter.api.Assertions.assertThrows;

@DisplayName("Test the admin interface with bad cases.")
public class TestAdminInterfaceBadCases {


  AdminGameService adminGameService;
  GameService gameService;

  @BeforeEach
  void setup() {
    QuizGameService quizGameService = new QuizGameService();
    adminGameService = quizGameService;
    gameService = quizGameService;
    try {
      QuizDataGenerator.loadDemoData(adminGameService);
    } catch (IllegalParameterException e) {
      e.printStackTrace();
    }
  }

  @Test
  @DisplayName("Adding team with null name throws exception")
  public void addTeamWithNullName() {
    assertThrows(IllegalParameterException.class,
            () -> adminGameService.addTeam(null, "#FF0000"));
  }

  @Test
  @DisplayName("Adding team with empty name throws exception")
  public void addTeamWithEmptyName() {
    assertThrows(IllegalParameterException.class,
            () -> adminGameService.addTeam("", "#FF0000"));
  }

  @Test
  @DisplayName("Adding team with blank name throws exception")
  public void addTeamWithBlankName() {
    assertThrows(IllegalParameterException.class,
            () -> adminGameService.addTeam("   ", "#FF0000"));
  }

  @Test
  @DisplayName("Adding duplicate team name throws exception")
  public void addDuplicateTeamName() throws IllegalParameterException {
    adminGameService.addTeam("Team Alpha", "#FF0000");
    assertThrows(IllegalParameterException.class,
            () -> adminGameService.addTeam("Team Alpha", "#0000FF"));
  }

  @Test
  @DisplayName("Removing non-existent team throws exception")
  public void removeNonExistentTeam() {
    assertThrows(IllegalParameterException.class,
            () -> adminGameService.removeTeam(999));
  }

  @Test
  @DisplayName("Removing team during game throws IllegalStateException")
  public void removeTeamDuringGame() throws Exception {
    Team team = adminGameService.addTeam("Team Alpha", "#FF0000");
    adminGameService.addTeam("Team Beta", "#0000FF");
    adminGameService.configureRandomGame(5);
    gameService.startGame();

    assertThrows(IllegalStateException.class,
            () -> adminGameService.removeTeam(team.id()));
  }

  @Test
  @DisplayName("Configure game with null category throws exception")
  public void configureGameWithNullCategory() {
    assertThrows(IllegalParameterException.class,
            () -> adminGameService.configureGame((Category) null, 5));
  }

  @Test
  @DisplayName("Configure game with invalid count throws exception")
  public void configureGameWithInvalidCount() throws IllegalParameterException {
    Category cat = adminGameService.getCategories().get(0);
    assertThrows(IllegalParameterException.class,
            () -> adminGameService.configureGame(cat, 0));
    assertThrows(IllegalParameterException.class,
            () -> adminGameService.configureGame(cat, -1));
  }

  @Test
  @DisplayName("Configure game with too many questions throws exception")
  public void configureGameWithTooManyQuestions() throws IllegalParameterException {
    Category cat = adminGameService.getCategories().get(0);
    int maxQuestions = adminGameService.getQuestionCount(cat.getId());
    assertThrows(IllegalParameterException.class,
            () -> adminGameService.configureGame(cat, maxQuestions + 100));
  }

  @Test
  @DisplayName("Configure game from invalid pack throws exception")
  public void configureGameFromInvalidPack() {
    assertThrows(IllegalParameterException.class,
            () -> adminGameService.configureGameFromPack("invalid-pack-id", 5));
  }

  @Test
  @DisplayName("Configure random game with invalid count throws exception")
  public void configureRandomGameWithInvalidCount() {
    assertThrows(IllegalParameterException.class,
            () -> adminGameService.configureRandomGame(0));
    assertThrows(IllegalParameterException.class,
            () -> adminGameService.configureRandomGame(-5));
  }

  @Test
  @DisplayName("Configure game with null questions throws exception")
  public void configureGameWithNullQuestions() {
    assertThrows(IllegalParameterException.class,
            () -> adminGameService.configureGame(null));
  }

  @Test
  @DisplayName("Configure game with empty questions throws exception")
  public void configureGameWithEmptyQuestions() {
    assertThrows(IllegalParameterException.class,
            () -> adminGameService.configureGame(List.of()));
  }

  @Test
  @DisplayName("Configure game during active game throws IllegalStateException")
  public void configureGameDuringActiveGame() throws Exception {
    adminGameService.addTeam("Team Alpha", "#FF0000");
    adminGameService.addTeam("Team Beta", "#0000FF");
    adminGameService.configureRandomGame(5);
    gameService.startGame();

    Category cat = adminGameService.getCategories().get(0);
    assertThrows(IllegalStateException.class,
            () -> adminGameService.configureGame(cat, 3));
  }

  @Test
  @DisplayName("Get packs with invalid category ID returns empty list")
  public void getPacksWithInvalidCategoryId() {
    assertDoesNotThrow(() -> {
      List<Category> packs = adminGameService.getPacks("invalid-category-id");
      assertTrue(packs.isEmpty());
    });
  }

  @Test
  @DisplayName("Get packs with null category ID throws exception")
  public void getPacksWithNullCategoryId() {
    assertThrows(IllegalParameterException.class,
            () -> adminGameService.getPacks(null));
  }

  @Test
  @DisplayName("Add question with null pack ID throws exception")
  public void addQuestionWithNullPackId() {
    Category cat = adminGameService.getCategories().get(0);
    Question q = new Question(999, "Test?", "Answer", cat, Difficulty.EASY);

    assertThrows(IllegalParameterException.class,
            () -> adminGameService.addQuestion(null, q));
  }

  @Test
  @DisplayName("Add question with invalid pack ID throws exception")
  public void addQuestionWithInvalidPackId() throws IllegalParameterException {
    Category cat = adminGameService.getCategories().get(0);
    Question q = new Question(999, "Test?", "Answer", cat, Difficulty.EASY);
    assertThrows(IllegalArgumentException.class,
            () -> adminGameService.addQuestion("invalid-pack", q));
  }

  @Test
  @DisplayName("Add null question throws exception")
  public void addNullQuestion() throws IllegalParameterException {
    Category cat = adminGameService.getCategories().get(0);
    String packId = adminGameService.getPacks(cat.getId()).get(0).getId();
    assertThrows(IllegalParameterException.class,
            () -> adminGameService.addQuestion(packId, null));
  }
}
