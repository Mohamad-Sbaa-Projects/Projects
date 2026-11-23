package de.hhn.it.devtools.components.quizapp.service;

import de.hhn.it.devtools.apis.exceptions.IllegalParameterException;
import de.hhn.it.devtools.apis.quizapp.Category;
import de.hhn.it.devtools.apis.quizapp.Question;
import de.hhn.it.devtools.apis.quizapp.Team;
import de.hhn.it.devtools.apis.quizapp.enums.GameState;
import de.hhn.it.devtools.apis.quizapp.enums.QuestionType;
import de.hhn.it.devtools.apis.quizapp.interfaces.AdminGameService;
import de.hhn.it.devtools.apis.quizapp.interfaces.GameListener;
import de.hhn.it.devtools.apis.quizapp.interfaces.GameService;
import de.hhn.it.devtools.components.quizapp.service.gamestates.GameOverState;
import de.hhn.it.devtools.components.quizapp.service.gamestates.GameStateHandler;
import de.hhn.it.devtools.components.quizapp.service.gamestates.LobbyState;
import de.hhn.it.devtools.components.quizapp.service.gamestates.PresentingQuestionState;
import de.hhn.it.devtools.components.quizapp.service.gamestates.ShowingResultState;
import de.hhn.it.devtools.components.quizapp.service.gamestates.WaitingForAnswerState;
import de.hhn.it.devtools.components.quizapp.service.gamestates.WaitingForBuzzerState;
import java.util.ArrayList;
import java.util.Collections;
import java.util.EnumMap;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.TimeUnit;
import java.util.function.Consumer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Main facade/service for the QuizApp game logic.
 * Manages teams, questions, game state transitions, timers, scoring, and listener callbacks.
 * This service is the single source of truth for all game state.
 */
public class QuizGameService implements GameService, AdminGameService {
  private static final Logger logger = LoggerFactory.getLogger(QuizGameService.class);

  private static final int NO_BUZZ_PENALTY = 50;
  private static final int WRONG_PENALTY_PERCENT = 50;

  private final QuestionDatabase questionDatabase = new QuestionDatabase();
  private final ScheduledExecutorService scheduler = Executors.newSingleThreadScheduledExecutor();
  private final List<GameListener> listeners = new ArrayList<>();
  private final Map<Integer, Team> teamsById = new HashMap<>();
  private final Map<Integer, Integer> scores = new HashMap<>();
  private final Map<GameState, GameStateHandler> states = new EnumMap<>(GameState.class);

  private List<Question> gameQuestions = new ArrayList<>();
  private int currentQuestionIndex = -1;
  private Question currentQuestion;
  private Team buzzingTeam;
  private GameStateHandler currentState;
  private ScheduledFuture<?> timerFuture;
  private ScheduledFuture<?> transitionFuture;
  private int nextTeamId = 1;
  private boolean questionsLoaded = false;

  /**
   * Creates a new game service and initializes all state handlers.
   * Starts in gameState LOBBY.
   */
  public QuizGameService() {
    states.put(GameState.LOBBY, new LobbyState(this));
    states.put(GameState.PRESENTING_QUESTION, new PresentingQuestionState(this));
    states.put(GameState.WAITING_FOR_BUZZER, new WaitingForBuzzerState(this));
    states.put(GameState.WAITING_FOR_ANSWER, new WaitingForAnswerState(this));
    states.put(GameState.SHOWING_RESULT, new ShowingResultState(this));
    states.put(GameState.GAME_OVER, new GameOverState(this));
    currentState = states.get(GameState.LOBBY);
  }

  private void log(String method, Object... params) {
    if (params == null || params.length == 0) {
      logger.info("{}()", method);
      return;
    }
    logger.info("{}({})", method, java.util.Arrays.toString(params));
  }

  // ==================== CALLBACK MANAGEMENT ====================

  @Override
  public void addCallback(GameListener listener) throws IllegalParameterException {
    log("addCallback", listener);
    if (listener == null) {
      throw new IllegalParameterException("Listener must not be null");
    }
    if (listeners.contains(listener)) {
      throw new IllegalParameterException("Listener already registered");
    }
    listeners.add(listener);
    logger.debug("Callback registered successfully");
  }

  @Override
  public void removeCallback(GameListener listener) throws IllegalParameterException {
    log("removeCallback", listener);
    if (listener == null) {
      throw new IllegalParameterException("Listener must not be null");
    }
    if (!listeners.remove(listener)) {
      throw new IllegalParameterException("Listener not registered");
    }
    logger.debug("Callback removed successfully");
  }

  /**
   * Notifies all listeners with the given action.
   * Catches and logs exceptions from individual listeners to prevent cascading failures.
   *
   * @param action The action to perform on each listener.
   */
  private void notify(Consumer<GameListener> action) {
    for (GameListener listener : listeners) {
      try {
        action.accept(listener);
      } catch (Exception e) {
        logger.error("Listener notification failed", e);
        // Continue notifying other listeners
      }
    }
  }

  // ==================== GAME FLOW CONTROL ====================

  @Override
  public void startGame() throws IllegalStateException {
    log("startGame");
    if (currentState.getState() != GameState.LOBBY) {
      throw new IllegalStateException("Game is already running");
    }
    if (teamsById.size() < 2) {
      throw new IllegalStateException("Need at least 2 teams to start");
    }
    if (gameQuestions.isEmpty()) {
      throw new IllegalStateException("No questions configured");
    }

    // Reset all scores to 0 and notify listeners
    resetScores();

    notify(listener -> listener.onGameReady(gameQuestions.size()));
    currentQuestionIndex = 0;
    currentQuestion = gameQuestions.get(0);
    transitionTo(GameState.PRESENTING_QUESTION);
  }

  @Override
  public void endGame() {
    log("endGame");
    cancelAll();
    transitionTo(GameState.GAME_OVER);
  }

  @Override
  public void buzz(Team team) throws IllegalParameterException, IllegalStateException {
    log("buzz", team);
    validateTeam(team);
    currentState.handleBuzz(team);
  }

  @Override
  public void submitAnswer(Team team, int index) throws IllegalParameterException,
          IllegalStateException {
    log("submitAnswer", team, index);
    validateTeam(team);
    if (currentQuestion.type() != QuestionType.MULTIPLE_CHOICE) {
      throw new IllegalParameterException("Question is not multiple choice");
    }
    if (index < 0 || index >= currentQuestion.options().size()) {
      throw new IllegalParameterException("Invalid answer index: " + index);
    }
    currentState.handleAnswer(team, index);
  }

  @Override
  public void submitAnswer(Team team, String answer) throws IllegalParameterException,
          IllegalStateException {
    log("submitAnswer", team, answer);
    validateTeam(team);
    if (answer == null || answer.isBlank()) {
      throw new IllegalParameterException("Answer cannot be empty");
    }
    if (currentQuestion.type() != QuestionType.TEXT_INPUT) {
      throw new IllegalParameterException("Question is not text input");
    }
    currentState.handleAnswer(team, answer);
  }

  @Override
  public void nextQuestion() throws IllegalStateException {
    log("nextQuestion");
    currentState.handleNextQuestion();
  }

  // ==================== TEAM MANAGEMENT ====================

  @Override
  public Team addTeam(String name, String color) throws IllegalParameterException {
    log("addTeam", name, color);
    if (name == null || name.isBlank()) {
      throw new IllegalParameterException("Team name is required");
    }
    for (Team existingTeam : teamsById.values()) {
      if (existingTeam.name().equalsIgnoreCase(name)) {
        throw new IllegalParameterException("Team name already exists: " + name);
      }
    }
    Team team = new Team(nextTeamId++, name, color);
    teamsById.put(team.id(), team);
    scores.put(team.id(), 0);

    // Notify listeners about the new team
    notify(listener -> listener.onTeamAdded(team));
    notify(listener -> listener.onScoreChanged(team, 0, 0));

    logger.info("Team added: {} (ID: {})", team.name(), team.id());
    return team;
  }

  @Override
  public void removeTeam(int teamId) throws IllegalParameterException, IllegalStateException {
    log("removeTeam", teamId);
    if (currentState.getState() != GameState.LOBBY) {
      throw new IllegalStateException("Cannot remove teams while game is running");
    }
    Team team = teamsById.get(teamId);
    if (team == null) {
      throw new IllegalParameterException("Team not found: " + teamId);
    }
    teamsById.remove(teamId);
    scores.remove(teamId);

    // Notify listeners about team removal
    notify(listener -> listener.onTeamRemoved(team));

    logger.info("Team removed: {} (ID: {})", team.name(), teamId);
  }

  @Override
  public List<Team> getTeams() {
    return new ArrayList<>(teamsById.values());
  }

  // ==================== GAME CONFIGURATION ====================

  @Override
  public void configureGame(Category category, int count) throws IllegalParameterException,
          IllegalStateException {
    log("configureGame", category, count);
    validateConfiguration();
    if (category == null) {
      throw new IllegalParameterException("Category must not be null");
    }
    gameQuestions = questionDatabase.getQuestions(category.getId(), count);
    if (gameQuestions.isEmpty()) {
      throw new IllegalParameterException("No questions found for category: " + category.getName());
    }
    logger.info("Game configured with {} questions from category: {}", gameQuestions.size(),
            category.getName());
  }

  @Override
  public void configureGame(List<Question> questions) throws IllegalParameterException,
          IllegalStateException {
    log("configureGame", questions);
    validateConfiguration();
    if (questions == null || questions.isEmpty()) {
      throw new IllegalParameterException("Question list cannot be null or empty");
    }
    gameQuestions = new ArrayList<>(questions);
    logger.info("Game configured with {} manually selected questions", gameQuestions.size());
  }

  @Override
  public void configureGameFromPack(String packId, int count) throws IllegalParameterException,
          IllegalStateException {
    log("configureGameFromPack", packId, count);
    validateConfiguration();
    if (packId == null || packId.isBlank()) {
      throw new IllegalParameterException("Pack ID cannot be null or empty");
    }
    if (questionDatabase.getCategory(packId) == null) {
      throw new IllegalParameterException("Pack not found: " + packId);
    }
    gameQuestions = questionDatabase.getQuestions(packId, count);
    if (gameQuestions.isEmpty()) {
      throw new IllegalParameterException("No questions found for pack: " + packId);
    }
    logger.info("Game configured with {} questions from pack: {}", gameQuestions.size(), packId);
  }

  @Override
  public void configureRandomGame(int count) throws IllegalParameterException,
          IllegalStateException {
    log("configureRandomGame", count);
    validateConfiguration();
    if (count <= 0) {
      throw new IllegalParameterException("Question count must be positive: " + count);
    }
    gameQuestions = questionDatabase.getRandomQuestions(count);
    if (gameQuestions.isEmpty()) {
      throw new IllegalParameterException("No questions available in database");
    }
    logger.info("Game configured with {} random questions", gameQuestions.size());
  }

  @Override
  public void addQuestion(String packId, Question question) throws IllegalParameterException {
    log("addQuestion", packId, question);
    if (packId == null || packId.isBlank()) {
      throw new IllegalParameterException("Pack ID cannot be null or empty");
    }
    if (question == null) {
      throw new IllegalParameterException("Question cannot be null");
    }
    questionDatabase.addQuestion(packId, question);
    logger.debug("Question added to pack: {}", packId);
  }

  @Override
  public int getQuestionCount(String categoryId) {
    return questionDatabase.getQuestionCount(categoryId);
  }

  @Override
  public void loadCategories(List<Category> categories) throws IllegalParameterException,
          IllegalStateException {
    log("loadCategories");
    if (currentState.getState() != GameState.LOBBY) {
      throw new IllegalStateException("Cannot load categories while game is running");
    }
    if (categories == null || categories.isEmpty()) {
      throw new IllegalParameterException("Categories list cannot be null or empty");
    }
    questionDatabase.registerCategories(categories);
    logger.info("Loaded {} categories", categories.size());
  }

  @Override
  public void loadQuestions(List<Question> questions) throws IllegalParameterException,
          IllegalStateException {
    log("loadQuestions");
    if (currentState.getState() != GameState.LOBBY) {
      throw new IllegalStateException("Cannot load questions while game is running");
    }
    if (questionsLoaded) {
      throw new IllegalStateException("Questions already loaded");
    }
    if (questions == null || questions.isEmpty()) {
      throw new IllegalParameterException("Questions list cannot be null or empty");
    }

    for (Question question : questions) {
      questionDatabase.addQuestion(question.category().getId(), question);
    }
    questionsLoaded = true;
    logger.info("Loaded {} questions", questions.size());
  }

  @Override
  public List<Category> getCategories() {
    return questionDatabase.getTopLevelCategories();
  }

  @Override
  public List<Category> getPacks(String parentCategoryId) throws IllegalParameterException {
    if (parentCategoryId == null || parentCategoryId.isBlank()) {
      throw new IllegalParameterException("Parent category ID cannot be null or empty");
    }
    return questionDatabase.getPacks(parentCategoryId);
  }

  @Override
  public void resetGame() {
    log("resetGame");
    cancelAll();
    teamsById.clear();
    scores.clear();
    gameQuestions.clear();
    currentQuestionIndex = -1;
    currentQuestion = null;
    buzzingTeam = null;
    nextTeamId = 1;
    questionsLoaded = false;
    currentState = states.get(GameState.LOBBY);

    // Notify listeners about reset
    notify(GameListener::onTeamsCleared);
    notify(listener -> listener.onGameStateChanged(GameState.LOBBY));

    logger.info("Game reset to LOBBY state");
  }

  @Override
  public void resetScores() throws IllegalStateException {
    log("resetScores");
    if (currentState.getState() != GameState.LOBBY) {
      throw new IllegalStateException("Cannot reset scores during game");
    }

    for (Team t : teamsById.values()) {
      int old = scores.getOrDefault(t.id(), 0);
      scores.put(t.id(), 0);

      // Single source of truth: UI gets the reset through callback
      notify(l -> l.onScoreChanged(t, 0, -old));
    }
  }


  private void validateConfiguration() throws IllegalStateException {
    if (currentState.getState() != GameState.LOBBY) {
      throw new IllegalStateException("Cannot configure game while it is running");
    }
  }

  // ==================== STATE MANAGEMENT ====================

  /**
   * Switches to the given GameState.
   * Calls exit/enter hooks on handlers and notifies listeners about the state change.
   *
   * @param newState The next state to enter.
   */
  public void transitionTo(GameState newState) {
    currentState.onExit();
    currentState = states.get(newState);
    currentState.onEnter();
    GameState oldState = currentState.getState();
    notify(listener -> listener.onGameStateChanged(newState));
    logger.info("State transition: {} -> {}", oldState, newState);
  }

  /**
   * Schedules a transition to the given game state after the specified delay.
   * If another transition was already scheduled, it will be cancelled first.
   *
   * @param state The target state to transition to.
   * @param milliseconds Delay in milliseconds before the transition is executed.
   */
  public void scheduleStateTransition(GameState state, int milliseconds) {
    cancelScheduledTransition();
    transitionFuture = scheduler.schedule(() -> transitionTo(state), milliseconds,
            TimeUnit.MILLISECONDS);
  }

  public void scheduleStateTransition(Runnable runnable, int milliseconds) {
    cancelScheduledTransition();
    transitionFuture = scheduler.schedule(runnable, milliseconds, TimeUnit.MILLISECONDS);
  }

  /**
   * Cancels a pending scheduled state transition, if one is currently active.
   */
  public void cancelScheduledTransition() {
    if (transitionFuture != null && !transitionFuture.isDone()) {
      transitionFuture.cancel(false);
    }
  }

  // ==================== TIMER MANAGEMENT ====================

  public void startBuzzerTimer(int seconds) {
    startTimer(seconds, true);
  }

  public void startAnswerTimer(int seconds) {
    startTimer(seconds, false);
  }

  private void startTimer(int seconds, boolean isBuzzer) {
    stopTimer();
    final int[] remaining = {seconds};
    if (isBuzzer) {
      notify(listener -> listener.onBuzzerTimerTick(seconds));
    } else {
      notify(listener -> listener.onAnswerTimerTick(seconds));
    }

    timerFuture = scheduler.scheduleAtFixedRate(() -> {
      remaining[0]--;
      if (remaining[0] > 0) {
        currentState.handleTimerTick(remaining[0]);
      } else {
        stopTimer();
        currentState.handleTimerExpired();
      }
    }, 1, 1, TimeUnit.SECONDS);
  }

  /**
   * Stops the currently running timer (buzzer/answer) if active.
   * Does nothing if no timer is scheduled.
   */
  public void stopTimer() {
    if (timerFuture != null && !timerFuture.isDone()) {
      timerFuture.cancel(false);
    }
  }

  private void cancelAll() {
    stopTimer();
    cancelScheduledTransition();
  }

  // ==================== QUESTION & BUZZER MANAGEMENT ====================

  public Question getCurrentQuestion() {
    return currentQuestion;
  }

  public boolean hasMoreQuestions() {
    return currentQuestionIndex < gameQuestions.size() - 1;
  }

  public void advanceToNextQuestion() {
    currentQuestion = gameQuestions.get(++currentQuestionIndex);
  }

  public Team getBuzzingTeam() {
    return buzzingTeam;
  }

  public void setBuzzingTeam(Team team) {
    buzzingTeam = team;
  }

  public void clearBuzzingTeam() {
    buzzingTeam = null;
  }

  // ==================== SCORING ====================

  private void awardPoints(Team team, int points) {
    int currentScore = scores.get(team.id());
    int newScore = currentScore + points;
    scores.put(team.id(), newScore);
    notify(listener -> listener.onScoreChanged(team, newScore, points));
    logger.debug("Team {} score: {} -> {} (delta: {})", team.name(), currentScore, newScore,
            points);
  }

  /**
   * Evaluates a multiple-choice answer for the given team and updates scores.
   * Applies penalties for wrong answers and notifies listeners about the result.
   *
   * @param team  The answering team.
   * @param index The chosen option index.
   */
  public void evaluateMultipleChoiceAnswer(Team team, int index) {
    boolean correct = AnswerValidator.checkMultipleChoice(currentQuestion, index);
    int points = correct ? currentQuestion.getPoints() : -calculatePenalty();
    awardPoints(team, points);
    if (!correct) {
      awardPointsToOpponent(team, currentQuestion.getPoints());
    }
    int score = scores.get(team.id());
    notify(listener -> listener.onAnswerResult(team, correct, points, score));
  }

  /**
   * Evaluates a text answer for the given team and updates scores.
   * Applies penalties for wrong answers and notifies listeners about the result.
   *
   * @param team   The answering team.
   * @param answer The submitted answer text.
   */
  public void evaluateTextAnswer(Team team, String answer) {
    boolean correct = AnswerValidator.checkTextInput(currentQuestion, answer);
    int points = correct ? currentQuestion.getPoints() : -calculatePenalty();
    awardPoints(team, points);
    if (!correct) {
      awardPointsToOpponent(team, currentQuestion.getPoints());
    }
    int score = scores.get(team.id());
    notify(listener -> listener.onAnswerResult(team, correct, points, score));
  }

  public void penalizeTeam(Team team) {
    awardPoints(team, -calculatePenalty());
  }

  public void awardPointsToOpponent(Team excludeTeam) {
    awardPointsToOpponent(excludeTeam, currentQuestion.getPoints());
  }

  private void awardPointsToOpponent(Team excludeTeam, int points) {
    teamsById.values().stream()
            .filter(team -> !team.equals(excludeTeam))
            .forEach(team -> awardPoints(team, points));
  }

  public void penalizeBothTeams() {
    teamsById.values().forEach(team -> awardPoints(team, -NO_BUZZ_PENALTY));
  }

  private int calculatePenalty() {
    return (currentQuestion.getPoints() * WRONG_PENALTY_PERCENT) / 100;
  }

  public int getTeamScore(Team team) {
    return scores.getOrDefault(team.id(), 0);
  }

  /**
   * Determines the winning team based on current scores.
   *
   * @return The winner, or {@code null} if there is a tie.
   */
  public Team determineWinner() {
    Team winner = null;
    int bestScore = Integer.MIN_VALUE;
    boolean tie = false;

    for (Map.Entry<Integer, Integer> entry : scores.entrySet()) {
      int score = entry.getValue();
      if (score > bestScore) {
        bestScore = score;
        winner = teamsById.get(entry.getKey());
        tie = false;
      } else if (score == bestScore) {
        tie = true;
      }
    }
    return tie ? null : winner;
  }

  // ==================== LISTENER NOTIFICATIONS ====================

  /**
   * Notifies all registered listeners that the current question is now presented.
   * Provides the 1-based question number and the total number of questions.
   */
  public void notifyQuestionPresented() {
    int questionNumber = currentQuestionIndex + 1;
    int total = gameQuestions.size();
    notify(listener -> listener.onQuestionPresented(currentQuestion, questionNumber, total));
  }

  public void notifyBuzzerTimerTick(int seconds) {
    notify(listener -> listener.onBuzzerTimerTick(seconds));
  }

  public void notifyBuzzerTimerExpired() {
    notify(GameListener::onBuzzerTimerExpired);
  }

  public void notifyAnswerTimerTick(int seconds) {
    notify(listener -> listener.onAnswerTimerTick(seconds));
  }

  public void notifyAnswerTimerExpired(Team team) {
    notify(listener -> listener.onAnswerTimerExpired(team));
  }

  public void notifyTeamBuzzed(Team team, int seconds) {
    notify(listener -> listener.onTeamBuzzed(team, seconds));
  }

  public void notifyGameFinished(Team winner, int score) {
    notify(listener -> listener.onGameFinished(winner, score));
  }

  // ==================== VALIDATION ====================

  private void validateTeam(Team team) throws IllegalParameterException {
    if (team == null) {
      throw new IllegalParameterException("Team must not be null");
    }
    if (!teamsById.containsKey(team.id())) {
      throw new IllegalParameterException("Unknown team: " + team.name());
    }
  }

  // ==================== SHUTDOWN ====================

  /**
   * Shuts down the service, canceling all timers and the scheduler.
   * Should be called when the application exits.
   */
  public void shutdown() {
    logger.info("Shutting down QuizGameService");
    cancelAll();
    scheduler.shutdown();
    try {
      if (!scheduler.awaitTermination(2, TimeUnit.SECONDS)) {
        scheduler.shutdownNow();
      }
    } catch (InterruptedException e) {
      scheduler.shutdownNow();
      Thread.currentThread().interrupt();
    }
  }
}