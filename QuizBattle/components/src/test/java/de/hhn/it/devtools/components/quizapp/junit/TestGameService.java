package de.hhn.it.devtools.components.quizapp.junit;

import de.hhn.it.devtools.apis.exceptions.IllegalParameterException;
import de.hhn.it.devtools.apis.quizapp.Team;
import de.hhn.it.devtools.apis.quizapp.enums.GameState;
import de.hhn.it.devtools.apis.quizapp.interfaces.AdminGameService;
import de.hhn.it.devtools.apis.quizapp.interfaces.GameListener;
import de.hhn.it.devtools.apis.quizapp.interfaces.GameService;
import de.hhn.it.devtools.components.quizapp.service.QuizGameService;
import de.hhn.it.devtools.components.quizapp.service.generator.QuizDataGenerator;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Test GameService gameplay functionality")
public class TestGameService {


  AdminGameService adminGameService;
  GameService gameService;
  TestGameListener listener;

  @BeforeEach
  void setup() {
    QuizGameService quizGameService = new QuizGameService();
    adminGameService = quizGameService;
    gameService = quizGameService;
    listener = new TestGameListener();

    try {
      QuizDataGenerator.loadDemoData(adminGameService);
    } catch (IllegalParameterException e) {
      e.printStackTrace();
    }
  }

  @Test
  @DisplayName("Add callback successfully")
  public void addCallback() throws IllegalParameterException {
    assertDoesNotThrow(() -> gameService.addCallback(listener));
  }

  @Test
  @DisplayName("Add null callback throws exception")
  public void addNullCallback() {
    assertThrows(IllegalParameterException.class,
            () -> gameService.addCallback(null));
  }

  @Test
  @DisplayName("Add same callback twice throws exception")
  public void addDuplicateCallback() throws IllegalParameterException {
    gameService.addCallback(listener);
    assertThrows(IllegalParameterException.class,
            () -> gameService.addCallback(listener));
  }

  @Test
  @DisplayName("Remove callback successfully")
  public void removeCallback() throws IllegalParameterException {
    gameService.addCallback(listener);
    assertDoesNotThrow(() -> gameService.removeCallback(listener));
  }

  @Test
  @DisplayName("Remove null callback throws exception")
  public void removeNullCallback() {
    assertThrows(IllegalParameterException.class,
            () -> gameService.removeCallback(null));
  }

  @Test
  @DisplayName("Remove non-registered callback throws exception")
  public void removeNonRegisteredCallback() {
    assertThrows(IllegalParameterException.class,
            () -> gameService.removeCallback(listener));
  }

  @Test
  @DisplayName("Start game without teams throws exception")
  public void startGameWithoutTeams() throws IllegalParameterException {
    adminGameService.configureRandomGame(5);
    assertThrows(IllegalStateException.class,
            () -> gameService.startGame());
  }

  @Test
  @DisplayName("Start game with only one team throws exception")
  public void startGameWithOneTeam() throws Exception {
    adminGameService.addTeam("Team Alpha", "#FF0000");
    adminGameService.configureRandomGame(5);
    assertThrows(IllegalStateException.class,
            () -> gameService.startGame());
  }

  @Test
  @DisplayName("Start game without configuration throws exception")
  public void startGameWithoutConfiguration() throws Exception {
    adminGameService.addTeam("Team Alpha", "#FF0000");
    adminGameService.addTeam("Team Beta", "#0000FF");
    assertThrows(IllegalStateException.class,
            () -> gameService.startGame());
  }

  @Test
  @DisplayName("Start game successfully")
  public void startGameSuccessfully() throws Exception {
    gameService.addCallback(listener);
    adminGameService.addTeam("Team Alpha", "#FF0000");
    adminGameService.addTeam("Team Beta", "#0000FF");
    adminGameService.configureRandomGame(5);

    assertDoesNotThrow(() -> gameService.startGame());
    assertTrue(listener.gameReadyCalled);
    assertEquals(5, listener.totalQuestions);
  }

  @Test
  @DisplayName("Start game twice throws exception")
  public void startGameTwice() throws Exception {
    adminGameService.addTeam("Team Alpha", "#FF0000");
    adminGameService.addTeam("Team Beta", "#0000FF");
    adminGameService.configureRandomGame(5);
    gameService.startGame();

    assertThrows(IllegalStateException.class,
            () -> gameService.startGame());
  }

  @Test
  @DisplayName("End game successfully")
  public void endGameSuccessfully() throws Exception {
    gameService.addCallback(listener);
    adminGameService.addTeam("Team Alpha", "#FF0000");
    adminGameService.addTeam("Team Beta", "#0000FF");
    adminGameService.configureRandomGame(5);
    gameService.startGame();

    assertDoesNotThrow(() -> gameService.endGame());
    assertTrue(listener.gameFinishedCalled);
  }

  @Test
  @DisplayName("Buzz with null team throws exception")
  public void buzzWithNullTeam() throws Exception {
    adminGameService.addTeam("Team Alpha", "#FF0000");
    adminGameService.addTeam("Team Beta", "#0000FF");
    adminGameService.configureRandomGame(5);
    gameService.startGame();

    assertThrows(IllegalParameterException.class,
            () -> gameService.buzz(null));
  }

  @Test
  @DisplayName("Buzz with unknown team throws exception")
  public void buzzWithUnknownTeam() throws Exception {
    Team team1 = adminGameService.addTeam("Team Alpha", "#FF0000");
    adminGameService.addTeam("Team Beta", "#0000FF");
    adminGameService.configureRandomGame(5);
    gameService.startGame();

    Team unknownTeam = new Team(999, "Unknown", "#000000");
    assertThrows(IllegalParameterException.class,
            () -> gameService.buzz(unknownTeam));
  }

  @Test
  @DisplayName("Buzz in wrong state throws exception")
  public void buzzInWrongState() throws Exception {
    Team team = adminGameService.addTeam("Team Alpha", "#FF0000");
    adminGameService.addTeam("Team Beta", "#0000FF");
    adminGameService.configureRandomGame(5);

    assertThrows(IllegalStateException.class,
            () -> gameService.buzz(team));
  }

  @Test
  @DisplayName("Submit answer with null team throws exception")
  public void submitAnswerWithNullTeam() throws Exception {
    adminGameService.addTeam("Team Alpha", "#FF0000");
    adminGameService.addTeam("Team Beta", "#0000FF");
    adminGameService.configureRandomGame(5);
    gameService.startGame();

    assertThrows(IllegalParameterException.class,
            () -> gameService.submitAnswer(null, 0));
  }

  @Test
  @DisplayName("Submit text answer with null throws exception")
  public void submitNullTextAnswer() throws Exception {
    Team team = adminGameService.addTeam("Team Alpha", "#FF0000");
    adminGameService.addTeam("Team Beta", "#0000FF");
    adminGameService.configureRandomGame(5);
    gameService.startGame();

    assertThrows(IllegalParameterException.class,
            () -> gameService.submitAnswer(team, (String) null));
  }

  @Test
  @DisplayName("Submit empty text answer throws exception")
  public void submitEmptyTextAnswer() throws Exception {
    Team team = adminGameService.addTeam("Team Alpha", "#FF0000");
    adminGameService.addTeam("Team Beta", "#0000FF");
    adminGameService.configureRandomGame(5);
    gameService.startGame();

    assertThrows(IllegalParameterException.class,
            () -> gameService.submitAnswer(team, ""));
  }

  //@Test
  @DisplayName("Submit answer in wrong state throws exception")
  public void submitAnswerInWrongState() throws Exception {
    Team team = adminGameService.addTeam("Team Alpha", "#FF0000");
    adminGameService.addTeam("Team Beta", "#0000FF");
    adminGameService.configureRandomGame(5);
    gameService.startGame();

    assertThrows(IllegalStateException.class,
            () -> gameService.submitAnswer(team, 0));
  }

  @Test
  @DisplayName("Next question in wrong state throws exception")
  public void nextQuestionInWrongState() {
    assertThrows(IllegalStateException.class,
            () -> gameService.nextQuestion());
  }


  private static class TestGameListener implements GameListener {
    boolean gameReadyCalled = false;
    boolean gameFinishedCalled = false;
    int totalQuestions = 0;
    GameState currentState = GameState.LOBBY;

    @Override
    public void onGameReady(int totalQuestions) {
      this.gameReadyCalled = true;
      this.totalQuestions = totalQuestions;
    }

    @Override
    public void onGameFinished(Team winningTeam, int winnerScore) {
      this.gameFinishedCalled = true;
    }

    @Override
    public void onGameStateChanged(GameState newState) {
      this.currentState = newState;
    }
  }
}
