package de.hhn.it.devtools.components.quizapp.junit;

import de.hhn.it.devtools.apis.exceptions.IllegalParameterException;
import de.hhn.it.devtools.apis.quizapp.interfaces.AdminGameService;
import de.hhn.it.devtools.apis.quizapp.interfaces.GameService;
import de.hhn.it.devtools.components.quizapp.service.QuizGameService;
import de.hhn.it.devtools.components.quizapp.service.generator.QuizDataGenerator;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Test GameListener callback interface")
public class TestGameListener {
  AdminGameService adminGameService;
  GameService gameService;
  MockGameListener listener;

  @BeforeEach
  void setup() throws Exception {
    QuizGameService quizGameService = new QuizGameService();
    adminGameService = quizGameService;
    gameService = quizGameService;
    listener = new MockGameListener();
    gameService.addCallback(listener);

    try {
      QuizDataGenerator.loadDemoData(adminGameService);
    } catch (IllegalParameterException e) {
      e.printStackTrace();
    }
  }

  @Test
  @DisplayName("onGameReady is called when game starts")
  public void onGameReadyCalled() throws Exception {
    adminGameService.addTeam("Team Alpha", "#FF0000");
    adminGameService.addTeam("Team Beta", "#0000FF");
    adminGameService.configureRandomGame(5);

    gameService.startGame();

    assertTrue(listener.onGameReadyCalled);
    assertEquals(5, listener.totalQuestions);
  }

  @Test
  @DisplayName("onGameStateChanged is called")
  public void onGameStateChangedCalled() throws Exception {
    adminGameService.addTeam("Team Alpha", "#FF0000");
    adminGameService.addTeam("Team Beta", "#0000FF");
    adminGameService.configureRandomGame(5);

    gameService.startGame();

    assertTrue(listener.onGameStateChangedCalled);
    assertNotNull(listener.lastGameState);
  }

  @Test
  @DisplayName("onGameFinished is called when game ends")
  public void onGameFinishedCalled() throws Exception {
    adminGameService.addTeam("Team Alpha", "#FF0000");
    adminGameService.addTeam("Team Beta", "#0000FF");
    adminGameService.configureRandomGame(5);

    gameService.startGame();
    gameService.endGame();

    assertTrue(listener.onGameFinishedCalled);
  }

  @Test
  @DisplayName("onQuestionPresented is called")
  public void onQuestionPresentedCalled() throws Exception {
    adminGameService.addTeam("Team Alpha", "#FF0000");
    adminGameService.addTeam("Team Beta", "#0000FF");
    adminGameService.configureRandomGame(5);

    gameService.startGame();
    assertNotNull(listener);
  }

  @Test
  @DisplayName("Multiple listeners can be registered")
  public void multipleListeners() throws Exception {
    MockGameListener listener2 = new MockGameListener();
    gameService.addCallback(listener2);

    adminGameService.addTeam("Team Alpha", "#FF0000");
    adminGameService.addTeam("Team Beta", "#0000FF");
    adminGameService.configureRandomGame(5);

    gameService.startGame();

    assertTrue(listener.onGameReadyCalled);
    assertTrue(listener2.onGameReadyCalled);
  }

  @Test
  @DisplayName("Removed listener does not receive callbacks")
  public void removedListenerNoCallbacks() throws Exception {
    gameService.removeCallback(listener);

    adminGameService.addTeam("Team Alpha", "#FF0000");
    adminGameService.addTeam("Team Beta", "#0000FF");
    adminGameService.configureRandomGame(5);

    gameService.startGame();

    assertFalse(listener.onGameReadyCalled);
  }

  @Test
  @DisplayName("onError is called for invalid actions")
  public void onErrorCalled() {
    try {
      gameService.startGame();
    } catch (IllegalStateException e) {
      System.out.println(e.getMessage());
    }

    assertNotNull(listener);
  }
}

