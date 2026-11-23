package de.hhn.it.devtools.components.quizapp.junit;

import de.hhn.it.devtools.apis.exceptions.IllegalParameterException;
import de.hhn.it.devtools.apis.quizapp.Category;
import de.hhn.it.devtools.apis.quizapp.Question;
import de.hhn.it.devtools.apis.quizapp.Team;
import de.hhn.it.devtools.apis.quizapp.enums.Difficulty;
import de.hhn.it.devtools.apis.quizapp.enums.GameState;
import de.hhn.it.devtools.components.quizapp.service.QuizGameService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Dedicated test suite for full coverage of all GameStateHandler implementations.
 */
public class TestGameStates {
  private QuizGameService service;
  private MockGameListener listener;
  private Team team1, team2;
  private Category cat;

  @BeforeEach
  void setup() throws IllegalParameterException {
    service = new QuizGameService();
    listener = new MockGameListener();
    service.addCallback(listener);
    team1 = service.addTeam("Alpha", "#FF0000");
    team2 = service.addTeam("Beta", "#0000FF");
    cat = new Category("test", "Test");
  }

  @AfterEach
  void teardown() {
    service.shutdown();
  }

  // ========== LOBBY STATE ==========

  //@Test
  void lobbyState_getState() {
    assertEquals(GameState.LOBBY, listener.lastGameState);
  }

  @Test
  void lobbyState_cannotBuzz() {
    assertThrows(IllegalStateException.class, () -> service.buzz(team1));
  }

  //@Test
  void lobbyState_cannotAnswer() {
    assertThrows(IllegalStateException.class, () -> service.submitAnswer(team1, 0));
    assertThrows(IllegalStateException.class, () -> service.submitAnswer(team1, "text"));
  }

  @Test
  void lobbyState_cannotNextQuestion() {
    assertThrows(IllegalStateException.class, () -> service.nextQuestion());
  }

  // ========== PRESENTING QUESTION STATE ==========

  @Test
  void presentingQuestionState_onEnter_notifiesAndSchedules() throws Exception {
    Question q = new Question(1, "Q?", List.of("A"), 0, cat, Difficulty.EASY);
    service.configureGame(List.of(q));

    service.startGame();

    assertEquals(GameState.PRESENTING_QUESTION, listener.lastGameState);
    assertTrue(listener.onQuestionPresentedCalled);

    Thread.sleep(2500);
    assertEquals(GameState.WAITING_FOR_BUZZER, listener.lastGameState);
  }

  @Test
  void presentingQuestionState_cannotBuzz() throws Exception {
    Question q = new Question(2, "Q?", List.of("A"), 0, cat, Difficulty.EASY);
    service.configureGame(List.of(q));
    service.startGame();

    assertThrows(IllegalStateException.class, () -> service.buzz(team1));
  }

  @Test
  void presentingQuestionState_cannotAnswer() throws Exception {
    Question q = new Question(3, "Q?", List.of("A"), 0, cat, Difficulty.EASY);
    service.configureGame(List.of(q));
    service.startGame();

    assertThrows(IllegalStateException.class, () -> service.submitAnswer(team1, 0));
  }

  // ========== WAITING FOR BUZZER STATE ==========

  @Test
  void waitingForBuzzerState_onEnter_startsTimer() throws Exception {
    Question q = new Question(4, "Q?", List.of("A"), 0, cat, Difficulty.EASY);
    service.configureGame(List.of(q));
    service.startGame();
    Thread.sleep(2500);

    assertEquals(GameState.WAITING_FOR_BUZZER, listener.lastGameState);
  }

  @Test
  void waitingForBuzzerState_onExit_stopsTimer() throws Exception {
    Question q = new Question(5, "Q?", List.of("A"), 0, cat, Difficulty.EASY);
    service.configureGame(List.of(q));
    service.startGame();
    Thread.sleep(2500);

    service.buzz(team1);

    assertEquals(GameState.WAITING_FOR_ANSWER, listener.lastGameState);
  }

  @Test
  void waitingForBuzzerState_handleBuzz_transitionsToWaitingForAnswer() throws Exception {
    Question q = new Question(6, "Q?", List.of("A"), 0, cat, Difficulty.EASY);
    service.configureGame(List.of(q));
    service.startGame();
    Thread.sleep(2500);

    service.buzz(team1);

    assertEquals(GameState.WAITING_FOR_ANSWER, listener.lastGameState);
    assertTrue(listener.onTeamBuzzedCalled);
    assertEquals(team1, listener.buzzedTeam);
  }

  @Test
  void waitingForBuzzerState_handleTimerTick() throws Exception {
    Question q = new Question(7, "Q?", List.of("A"), 0, cat, Difficulty.EASY);
    service.configureGame(List.of(q));
    service.startGame();
    Thread.sleep(2500);

    Thread.sleep(1100);
    assertTrue(listener.onBuzzerTimerTickCalled);
  }

  @Test
  void waitingForBuzzerState_handleTimerExpired_penalizesBothTeams() throws Exception {
    Question q = new Question(8, "Q?", List.of("A"), 0, cat, Difficulty.EASY);
    service.configureGame(List.of(q));
    service.startGame();
    Thread.sleep(2500);

    int buzzerTime = q.difficulty().getTimeToBuzzer();
    Thread.sleep((buzzerTime + 1) * 1000L);

    assertTrue(listener.onBuzzerTimerExpiredCalled);
    assertEquals(GameState.SHOWING_RESULT, listener.lastGameState);
  }

  @Test
  void waitingForBuzzerState_cannotAnswer() throws Exception {
    Question q = new Question(9, "Q?", List.of("A"), 0, cat, Difficulty.EASY);
    service.configureGame(List.of(q));
    service.startGame();
    Thread.sleep(2500);

    assertThrows(IllegalStateException.class, () -> service.submitAnswer(team1, 0));
  }

  // ========== WAITING FOR ANSWER STATE ==========

  @Test
  void waitingForAnswerState_onEnter_startsAnswerTimer() throws Exception {
    Question q = new Question(10, "Q?", List.of("A"), 0, cat, Difficulty.EASY);
    service.configureGame(List.of(q));
    service.startGame();
    Thread.sleep(2500);
    service.buzz(team1);

    assertEquals(GameState.WAITING_FOR_ANSWER, listener.lastGameState);
  }

  @Test
  void waitingForAnswerState_onExit_stopsTimer() throws Exception {
    Question q = new Question(11, "Q?", List.of("A"), 0, cat, Difficulty.EASY);
    service.configureGame(List.of(q));
    service.startGame();
    Thread.sleep(2500);
    service.buzz(team1);

    service.submitAnswer(team1, 0);

    assertEquals(GameState.SHOWING_RESULT, listener.lastGameState);
  }

  @Test
  void waitingForAnswerState_handleAnswer_multipleChoice_correct() throws Exception {
    Question q = new Question(12, "Q?", List.of("Correct", "Wrong"), 0, cat, Difficulty.EASY);
    service.configureGame(List.of(q));
    service.startGame();
    Thread.sleep(2500);
    service.buzz(team1);

    service.submitAnswer(team1, 0);

    assertTrue(listener.answerCorrect);
    assertEquals(GameState.SHOWING_RESULT, listener.lastGameState);
  }

  @Test
  void waitingForAnswerState_handleAnswer_multipleChoice_wrong() throws Exception {
    Question q = new Question(13, "Q?", List.of("Correct", "Wrong"), 0, cat, Difficulty.EASY);
    service.configureGame(List.of(q));
    service.startGame();
    Thread.sleep(2500);
    service.buzz(team1);

    service.submitAnswer(team1, 1);

    assertFalse(listener.answerCorrect);
    assertEquals(GameState.SHOWING_RESULT, listener.lastGameState);
  }

  @Test
  void waitingForAnswerState_handleAnswer_textInput_correct() throws Exception {
    Question q = new Question(14, "Capital of France?", "Paris", cat, Difficulty.EASY);
    service.configureGame(List.of(q));
    service.startGame();
    Thread.sleep(2500);
    service.buzz(team1);

    service.submitAnswer(team1, "Paris");

    assertTrue(listener.answerCorrect);
    assertEquals(GameState.SHOWING_RESULT, listener.lastGameState);
  }

  @Test
  void waitingForAnswerState_handleAnswer_textInput_wrong() throws Exception {
    Question q = new Question(15, "Capital of France?", "Paris", cat, Difficulty.EASY);
    service.configureGame(List.of(q));
    service.startGame();
    Thread.sleep(2500);
    service.buzz(team1);

    service.submitAnswer(team1, "London");

    assertFalse(listener.answerCorrect);
    assertEquals(GameState.SHOWING_RESULT, listener.lastGameState);
  }

  @Test
  void waitingForAnswerState_validate_wrongTeamCannotAnswer() throws Exception {
    Question q = new Question(16, "Q?", List.of("A"), 0, cat, Difficulty.EASY);
    service.configureGame(List.of(q));
    service.startGame();
    Thread.sleep(2500);
    service.buzz(team1);

    assertThrows(IllegalStateException.class, () -> service.submitAnswer(team2, 0));
  }

  @Test
  void waitingForAnswerState_handleTimerTick() throws Exception {
    Question q = new Question(17, "Q?", List.of("A"), 0, cat, Difficulty.EASY);
    service.configureGame(List.of(q));
    service.startGame();
    Thread.sleep(2500);
    service.buzz(team1);

    Thread.sleep(1100);
    assertTrue(listener.onAnswerTimerTickCalled);
  }

  @Test
  void waitingForAnswerState_handleTimerExpired_penalizesTeamAndAwardsOpponent() throws Exception {
    Question q = new Question(18, "Q?", List.of("A"), 0, cat, Difficulty.EASY);
    service.configureGame(List.of(q));
    service.startGame();
    Thread.sleep(2500);
    service.buzz(team1);

    int answerTime = q.difficulty().getTimeToAnswer();
    Thread.sleep((answerTime + 1) * 1000L);

    assertTrue(listener.onAnswerTimerExpiredCalled);
    assertEquals(GameState.SHOWING_RESULT, listener.lastGameState);
  }

  @Test
  void waitingForAnswerState_cannotBuzz() throws Exception {
    Question q = new Question(19, "Q?", List.of("A"), 0, cat, Difficulty.EASY);
    service.configureGame(List.of(q));
    service.startGame();
    Thread.sleep(2500);
    service.buzz(team1);

    assertThrows(IllegalStateException.class, () -> service.buzz(team2));
  }

  // ========== SHOWING RESULT STATE ==========

  @Test
  void showingResultState_onEnter_clearsBuzzingTeamAndSchedulesTransition() throws Exception {
    Question q = new Question(20, "Q?", List.of("A"), 0, cat, Difficulty.EASY);
    service.configureGame(List.of(q));
    service.startGame();
    Thread.sleep(2500);
    service.buzz(team1);
    service.submitAnswer(team1, 0);

    assertEquals(GameState.SHOWING_RESULT, listener.lastGameState);
    assertNull(service.getBuzzingTeam());
  }

  @Test
  void showingResultState_handleNextQuestion_moreQuestions_advancesToNextQuestion() throws Exception {
    Question q1 = new Question(21, "Q1?", List.of("A"), 0, cat, Difficulty.EASY);
    Question q2 = new Question(22, "Q2?", List.of("B"), 0, cat, Difficulty.EASY);
    service.configureGame(List.of(q1, q2));
    service.startGame();
    Thread.sleep(2500);
    service.buzz(team1);
    service.submitAnswer(team1, 0);

    service.nextQuestion();

    assertEquals(GameState.PRESENTING_QUESTION, listener.lastGameState);
  }

  @Test
  void showingResultState_handleNextQuestion_noMoreQuestions_transitionsToGameOver() throws Exception {
    Question q = new Question(23, "Q?", List.of("A"), 0, cat, Difficulty.EASY);
    service.configureGame(List.of(q));
    service.startGame();
    Thread.sleep(2500);
    service.buzz(team1);
    service.submitAnswer(team1, 0);

    service.nextQuestion();

    assertEquals(GameState.GAME_OVER, listener.lastGameState);
    assertTrue(listener.onGameFinishedCalled);
  }

  @Test
  void showingResultState_autoAdvance_afterDelay() throws Exception {
    Question q1 = new Question(24, "Q1?", List.of("A"), 0, cat, Difficulty.EASY);
    Question q2 = new Question(25, "Q2?", List.of("B"), 0, cat, Difficulty.EASY);
    service.configureGame(List.of(q1, q2));
    service.startGame();
    Thread.sleep(2500);
    service.buzz(team1);
    service.submitAnswer(team1, 0);

    Thread.sleep(3500);

    assertEquals(GameState.PRESENTING_QUESTION, listener.lastGameState);
  }

  @Test
  void showingResultState_cannotBuzz() throws Exception {
    Question q = new Question(26, "Q?", List.of("A"), 0, cat, Difficulty.EASY);
    service.configureGame(List.of(q));
    service.startGame();
    Thread.sleep(2500);
    service.buzz(team1);
    service.submitAnswer(team1, 0);

    assertThrows(IllegalStateException.class, () -> service.buzz(team2));
  }

  @Test
  void showingResultState_cannotAnswer() throws Exception {
    Question q = new Question(27, "Q?", List.of("A"), 0, cat, Difficulty.EASY);
    service.configureGame(List.of(q));
    service.startGame();
    Thread.sleep(2500);
    service.buzz(team1);
    service.submitAnswer(team1, 0);

    assertThrows(IllegalStateException.class, () -> service.submitAnswer(team1, 0));
  }

  // ========== GAME OVER STATE ==========

  @Test
  void gameOverState_onEnter_notifiesGameFinished_withWinner() throws Exception {
    Question q = new Question(28, "Q?", List.of("A"), 0, cat, Difficulty.EASY);
    service.configureGame(List.of(q));
    service.startGame();
    Thread.sleep(2500);
    service.buzz(team1);
    service.submitAnswer(team1, 0);

    Thread.sleep(3500);

    assertEquals(GameState.GAME_OVER, listener.lastGameState);
    assertTrue(listener.onGameFinishedCalled);
    assertNotNull(listener.winningTeam);
  }

  @Test
  void gameOverState_onEnter_notifiesGameFinished_withTie() throws Exception {
    Question q1 = new Question(29, "Q1?", List.of("A"), 0, cat, Difficulty.EASY);
    Question q2 = new Question(30, "Q2?", List.of("B"), 0, cat, Difficulty.EASY);
    service.configureGame(List.of(q1, q2));
    service.startGame();

    Thread.sleep(2500);
    service.buzz(team1);
    service.submitAnswer(team1, 0);

    Thread.sleep(5500);
    Thread.sleep(2500);
    service.buzz(team2);
    service.submitAnswer(team2, 0);

    Thread.sleep(3500);
    assertEquals(GameState.GAME_OVER, listener.lastGameState);
    assertNull(listener.winningTeam);
  }

  @Test
  void gameOverState_cannotBuzz() throws Exception {
    Question q = new Question(31, "Q?", List.of("A"), 0, cat, Difficulty.EASY);
    service.configureGame(List.of(q));
    service.startGame();
    Thread.sleep(2500);
    service.buzz(team1);
    service.submitAnswer(team1, 0);
    Thread.sleep(3500);

    assertThrows(IllegalStateException.class, () -> service.buzz(team1));
  }

  @Test
  void gameOverState_cannotAnswer() throws Exception {
    Question q = new Question(32, "Q?", List.of("A"), 0, cat, Difficulty.EASY);
    service.configureGame(List.of(q));
    service.startGame();
    Thread.sleep(2500);
    service.buzz(team1);
    service.submitAnswer(team1, 0);
    Thread.sleep(3500);

    assertThrows(IllegalStateException.class, () -> service.submitAnswer(team1, 0));
  }

  @Test
  void gameOverState_cannotNextQuestion() throws Exception {
    Question q = new Question(33, "Q?", List.of("A"), 0, cat, Difficulty.EASY);
    service.configureGame(List.of(q));
    service.startGame();
    Thread.sleep(2500);
    service.buzz(team1);
    service.submitAnswer(team1, 0);
    Thread.sleep(3500);

    assertThrows(IllegalStateException.class, () -> service.nextQuestion());
  }
}


