package de.hhn.it.devtools.javafx.quizapp.view;

import de.hhn.it.devtools.apis.exceptions.IllegalParameterException;
import de.hhn.it.devtools.apis.quizapp.Category;
import de.hhn.it.devtools.apis.quizapp.Question;
import de.hhn.it.devtools.apis.quizapp.Team;
import de.hhn.it.devtools.apis.quizapp.enums.GameState;
import de.hhn.it.devtools.apis.quizapp.interfaces.GameListener;
import de.hhn.it.devtools.components.quizapp.service.QuizGameService;
import de.hhn.it.devtools.components.quizapp.service.generator.QuizDataGenerator;
import java.util.List;
import javafx.application.Platform;
import javafx.beans.property.BooleanProperty;
import javafx.beans.property.IntegerProperty;
import javafx.beans.property.ObjectProperty;
import javafx.beans.property.SimpleBooleanProperty;
import javafx.beans.property.SimpleIntegerProperty;
import javafx.beans.property.SimpleObjectProperty;
import javafx.beans.property.SimpleStringProperty;
import javafx.beans.property.StringProperty;
import javafx.collections.FXCollections;
import javafx.collections.ObservableList;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * ViewModel for the Quiz application following MVVM pattern.
 * Acts as mediator between the UI (View) and the business logic (Service).
 * All UI state is updated exclusively through GameListener callbacks,
 * ensuring the service is the single source of truth.
 */
public class QuizViewModel implements GameListener {
  private static final Logger logger = LoggerFactory.getLogger(QuizViewModel.class);

  private final QuizGameService service;

  // Category selection
  private final ObservableList<Category> categories = FXCollections.observableArrayList();
  private final ObservableList<Category> packs = FXCollections.observableArrayList();
  private final ObjectProperty<Category> selectedCategory = new SimpleObjectProperty<>();
  private final ObjectProperty<Category> selectedPack = new SimpleObjectProperty<>();
  private final IntegerProperty availableQuestionCount = new SimpleIntegerProperty(0);

  // Observable properties for data binding
  private final StringProperty questionText = new SimpleStringProperty("");
  private final ObservableList<String> answerOptions = FXCollections.observableArrayList();
  private final IntegerProperty questionNumber = new SimpleIntegerProperty(0);
  private final IntegerProperty totalQuestions = new SimpleIntegerProperty(0);
  private final IntegerProperty timerSeconds = new SimpleIntegerProperty(0);
  private final StringProperty timerLabel = new SimpleStringProperty("--");

  // Team properties - updated only via callbacks
  private final StringProperty team1Name = new SimpleStringProperty("Team 1");
  private final StringProperty team2Name = new SimpleStringProperty("Team 2");
  private final IntegerProperty team1Score = new SimpleIntegerProperty(0);
  private final IntegerProperty team2Score = new SimpleIntegerProperty(0);
  private final StringProperty team1Color = new SimpleStringProperty("#FF5722");
  private final StringProperty team2Color = new SimpleStringProperty("#2196F3");

  // Game state properties
  private final ObjectProperty<GameState> gameState = new SimpleObjectProperty<>(GameState.LOBBY);
  private final StringProperty statusMessage = new SimpleStringProperty("Ready to start");
  private final StringProperty resultMessage = new SimpleStringProperty("");
  private final BooleanProperty showResult = new SimpleBooleanProperty(false);

  // Input state
  private final BooleanProperty buzzerEnabled = new SimpleBooleanProperty(false);
  private final BooleanProperty answerEnabled = new SimpleBooleanProperty(false);
  private final BooleanProperty textInputMode = new SimpleBooleanProperty(false);

  // Game over
  private final StringProperty winnerText = new SimpleStringProperty("");
  private final BooleanProperty gameOver = new SimpleBooleanProperty(false);

  // Team references
  private Team team1;
  private Team team2;
  private Team buzzingTeam;
  private Question currentQuestion;

  /**
   * Creates a new QuizViewModel and initializes the service.
   * Loads demo data and registers this ViewModel as a listener.
   */
  public QuizViewModel() {
    service = new QuizGameService();
    try {
      service.addCallback(this);
    } catch (IllegalParameterException e) {
      logger.error("Failed to register callback", e);
      throw new IllegalStateException("Failed to initialize ViewModel", e);
    }

    try {
      logger.info("Loading demo data from generator...");
      QuizDataGenerator.loadDemoData(service);
      logger.info("Data loaded successfully!");
    } catch (IllegalParameterException | IllegalStateException e) {
      logger.error("Failed to load demo data: {}", e.getMessage(), e);
      throw new IllegalStateException("Failed to load demo data", e);
    }

    loadCategories();

    // Listener for category changes
    selectedCategory.addListener((obs, old, newCat) -> {
      if (newCat != null) {
        loadPacks(newCat);
      }
    });

    selectedPack.addListener((obs, old, newPack) -> updateQuestionCount());
  }

  // ========== CATEGORY MANAGEMENT ==========

  /**
   * Loads all top-level categories from the service.
   */
  private void loadCategories() {
    categories.clear();
    categories.addAll(service.getCategories());
    if (!categories.isEmpty()) {
      selectedCategory.set(categories.get(0));
    }
  }

  /**
   * Loads packs (subcategories) for the given category.
   *
   * @param category The parent category
   */
  private void loadPacks(Category category) {
    packs.clear();
    try {
      List<Category> categoryPacks = service.getPacks(category.getId());
      packs.addAll(categoryPacks);
      if (!packs.isEmpty()) {
        selectedPack.set(packs.get(0));
      }
      updateQuestionCount();
    } catch (IllegalParameterException e) {
      statusMessage.set("Error loading packs: " + e.getMessage());
      logger.error("Failed to load packs for category {}", category.getId(), e);
    }
  }

  /**
   * Updates the available question count for the selected pack.
   */
  private void updateQuestionCount() {
    Category pack = selectedPack.get();
    if (pack != null) {
      int count = service.getQuestionCount(pack.getId());
      availableQuestionCount.set(count);
    }
  }

  // ========== SETUP METHODS ==========

  /**
   * Sets up teams in the service.
   * Team names and colors are updated via the onTeamAdded callback.
   *
   * @param name1  Name of team 1
   * @param color1 Color of team 1
   * @param name2  Name of team 2
   * @param color2 Color of team 2
   * @throws IllegalParameterException if parameters are invalid
   */
  public void setupTeams(String name1, String color1, String name2, String color2)
          throws IllegalParameterException {
    service.addTeam(name1, color1);
    service.addTeam(name2, color2);
  }

  /**
   * Configures the game with random questions.
   *
   * @param count Number of questions
   * @throws IllegalParameterException if count is invalid
   */
  public void configureRandomGame(int count) throws IllegalParameterException {
    service.configureRandomGame(count);
  }

  /**
   * Configures the game from a specific pack.
   *
   * @param count Number of questions
   * @throws IllegalParameterException if count is invalid or no pack is selected
   */
  public void configureGameFromPack(int count) throws IllegalParameterException {
    Category pack = selectedPack.get();
    if (pack == null) {
      throw new IllegalParameterException("No pack selected");
    }
    service.configureGameFromPack(pack.getId(), count);
  }

  /**
   * Starts the game.
   */
  public void startGame() {
    service.startGame();
  }

  // ========== PLAYER ACTIONS ==========

  /**
   * Team 1 presses the buzzer.
   */
  public void buzzTeam1() {
    buzzTeam(team1);
  }

  /**
   * Team 2 presses the buzzer.
   */
  public void buzzTeam2() {
    buzzTeam(team2);
  }

  /**
   * Helper method to handle buzzing for any team.
   * Reduces code duplication (DRY principle).
   *
   * @param team The team that buzzed
   */
  private void buzzTeam(Team team) {
    if (team != null && buzzerEnabled.get()) {
      try {
        service.buzz(team);
      } catch (IllegalParameterException | IllegalStateException e) {
        statusMessage.set("Error: " + e.getMessage());
        logger.warn("Buzz rejected for team {}: {}", team.name(), e.getMessage());
      } catch (RuntimeException e) {
        // Programming errors must not be swallowed.
        logger.error("Unexpected error while buzzing", e);
        throw e;
      }
    }
  }

  /**
   * Submits a multiple-choice answer.
   *
   * @param index The selected option index
   */
  public void submitAnswer(int index) {
    if (buzzingTeam == null) {
      logger.error("submitAnswer called with null buzzingTeam - this should not happen");
      throw new IllegalStateException("No team has buzzed");
    }

    if (answerEnabled.get()) {
      try {
        service.submitAnswer(buzzingTeam, index);
      } catch (IllegalParameterException | IllegalStateException e) {
        statusMessage.set("Error: " + e.getMessage());
        logger.warn("Answer submission rejected: {}", e.getMessage());
      } catch (RuntimeException e) {
        logger.error("Unexpected error while submitting answer", e);
        throw e;
      }
    }
  }

  /**
   * Submits a text answer.
   *
   * @param answer The text answer
   */
  public void submitTextAnswer(String answer) {
    if (buzzingTeam == null) {
      logger.error("submitTextAnswer called with null buzzingTeam - this should not happen");
      throw new IllegalStateException("No team has buzzed");
    }

    if (answerEnabled.get()) {
      try {
        service.submitAnswer(buzzingTeam, answer);
      } catch (IllegalParameterException | IllegalStateException e) {
        statusMessage.set("Error: " + e.getMessage());
        logger.warn("Text answer submission rejected: {}", e.getMessage());
      } catch (RuntimeException e) {
        logger.error("Unexpected error while submitting text answer", e);
        throw e;
      }
    }
  }

  // ========== GAME LISTENER CALLBACKS ==========

  @Override
  public void onGameStateChanged(GameState newState) {
    Platform.runLater(() -> {
      gameState.set(newState);
      buzzerEnabled.set(newState == GameState.WAITING_FOR_BUZZER);
      answerEnabled.set(newState == GameState.WAITING_FOR_ANSWER);
      showResult.set(newState == GameState.SHOWING_RESULT);
      gameOver.set(newState == GameState.GAME_OVER);

      if (newState == GameState.LOBBY) {
        resetUiForLobby();
      }
    });
  }

  /**
   * Resets all non-team UI state for the lobby screen.
   * Must only be called on the JavaFX thread.
   */
  private void resetUiForLobby() {
    currentQuestion = null;
    buzzingTeam = null;

    questionText.set("");
    answerOptions.clear();
    questionNumber.set(0);
    totalQuestions.set(0);

    timerSeconds.set(0);
    timerLabel.set("--");

    resultMessage.set("");
    winnerText.set("");
    statusMessage.set("Ready to start");

    textInputMode.set(false);
  }

  @Override
  public void onGameReady(int total) {
    Platform.runLater(() -> {
      totalQuestions.set(total);
      statusMessage.set("Game ready - " + total + " questions");
    });
  }

  @Override
  public void onQuestionPresented(Question question, int numQ, int total) {
    Platform.runLater(() -> {
      currentQuestion = question;
      questionText.set(question.text());
      questionNumber.set(numQ);
      totalQuestions.set(total);

      boolean isTextInput = (question.options() == null || question.options().isEmpty());
      textInputMode.set(isTextInput);

      answerOptions.clear();
      if (!isTextInput) {
        answerOptions.addAll(question.options());
      }

      statusMessage.set("Question " + numQ + "/" + total + " - Buzzer ready!");
      resultMessage.set("");
    });
  }

  @Override
  public void onBuzzerTimerTick(int seconds) {
    Platform.runLater(() -> {
      timerSeconds.set(seconds);
      timerLabel.set(seconds + "s");
    });
  }

  @Override
  public void onBuzzerTimerExpired() {
    Platform.runLater(() -> {
      statusMessage.set("Time's up! Nobody buzzed.");
      resultMessage.set("⏰ Both teams lose points!");
      timerLabel.set("--");
    });
  }

  @Override
  public void onTeamBuzzed(Team team, int secondsToAnswer) {
    Platform.runLater(() -> {
      buzzingTeam = team;
      statusMessage.set(team.name() + " buzzed! " + secondsToAnswer + "s to answer.");
      timerSeconds.set(secondsToAnswer);
      timerLabel.set(secondsToAnswer + "s");
    });
  }

  @Override
  public void onAnswerTimerTick(int seconds) {
    Platform.runLater(() -> {
      timerSeconds.set(seconds);
      timerLabel.set(seconds + "s");
    });
  }

  @Override
  public void onAnswerTimerExpired(Team team) {
    Platform.runLater(() -> {
      statusMessage.set(team.name() + " didn't answer in time!");
      resultMessage.set("⏰ " + team.name() + " loses points!");
      timerLabel.set("--");
      buzzingTeam = null;
    });
  }

  @Override
  public void onAnswerResult(Team team, boolean correct, int points, int newScore) {
    Platform.runLater(() -> {
      String emoji = correct ? "✅" : "❌";
      String pointsStr = points >= 0 ? "+" + points : String.valueOf(points);
      resultMessage.set(emoji + " " + team.name() + ": " + (correct ? "CORRECT!" : "WRONG!")
              + " (" + pointsStr + " points)");
      statusMessage.set(correct ? "Correct!" : "Unfortunately wrong.");
      timerLabel.set("--");
      buzzingTeam = null;
    });
  }

  @Override
  public void onScoreChanged(Team team, int newScore, int delta) {
    Platform.runLater(() -> {
      if (team1 != null && team.equals(team1)) {
        team1Score.set(newScore);
      } else if (team2 != null && team.equals(team2)) {
        team2Score.set(newScore);
      }
    });
  }

  @Override
  public void onTeamAdded(Team team) {
    Platform.runLater(() -> {
      if (team1 == null) {
        team1 = team;
        team1Name.set(team.name());
        team1Color.set(team.color());
        return;
      }
      if (team2 == null) {
        team2 = team;
        team2Name.set(team.name());
        team2Color.set(team.color());
      }
    });
  }

  @Override
  public void onTeamsCleared() {
    Platform.runLater(() -> {
      team1 = null;
      team2 = null;
      buzzingTeam = null;
      currentQuestion = null;

      // Reset all team-related UI state.
      team1Name.set("Team 1");
      team2Name.set("Team 2");
      team1Color.set("#FF5722");
      team2Color.set("#2196F3");

      // Reset general UI state.
      gameState.set(GameState.LOBBY);
      questionText.set("");
      answerOptions.clear();
      questionNumber.set(0);
      totalQuestions.set(0);
      timerSeconds.set(0);
      timerLabel.set("--");
      resultMessage.set("");
      winnerText.set("");
      showResult.set(false);
      gameOver.set(false);
      buzzerEnabled.set(false);
      answerEnabled.set(false);
      textInputMode.set(false);
      statusMessage.set("Ready to start");
    });
  }

  @Override
  public void onGameFinished(Team winner, int winnerScore) {
    Platform.runLater(() -> {
      if (winner != null) {
        winnerText.set("🏆 " + winner.name() + " wins with " + winnerScore + " points!");
      } else {
        winnerText.set("🤝 It's a tie!");
      }
    });
  }

  @Override
  public void onError(String message) {
    Platform.runLater(() -> {
      statusMessage.set("Error: " + message);
      logger.error("Game error: {}", message);
    });
  }

  // ========== PROPERTY GETTERS ==========

  public ObservableList<Category> getCategories() {
    return categories;
  }

  public ObservableList<Category> getPacks() {
    return packs;
  }

  public ObjectProperty<Category> selectedCategoryProperty() {
    return selectedCategory;
  }

  public ObjectProperty<Category> selectedPackProperty() {
    return selectedPack;
  }

  public IntegerProperty availableQuestionCountProperty() {
    return availableQuestionCount;
  }

  public StringProperty questionTextProperty() {
    return questionText;
  }

  public ObservableList<String> getAnswerOptions() {
    return answerOptions;
  }

  public IntegerProperty questionNumberProperty() {
    return questionNumber;
  }

  public IntegerProperty totalQuestionsProperty() {
    return totalQuestions;
  }

  public IntegerProperty timerSecondsProperty() {
    return timerSeconds;
  }

  public StringProperty timerLabelProperty() {
    return timerLabel;
  }

  public StringProperty team1NameProperty() {
    return team1Name;
  }

  public StringProperty team2NameProperty() {
    return team2Name;
  }

  public IntegerProperty team1ScoreProperty() {
    return team1Score;
  }

  public IntegerProperty team2ScoreProperty() {
    return team2Score;
  }

  public StringProperty team1ColorProperty() {
    return team1Color;
  }

  public StringProperty team2ColorProperty() {
    return team2Color;
  }

  public ObjectProperty<GameState> gameStateProperty() {
    return gameState;
  }

  public StringProperty statusMessageProperty() {
    return statusMessage;
  }

  public StringProperty resultMessageProperty() {
    return resultMessage;
  }

  public BooleanProperty showResultProperty() {
    return showResult;
  }

  public BooleanProperty buzzerEnabledProperty() {
    return buzzerEnabled;
  }

  public BooleanProperty answerEnabledProperty() {
    return answerEnabled;
  }

  public BooleanProperty textInputModeProperty() {
    return textInputMode;
  }

  public StringProperty winnerTextProperty() {
    return winnerText;
  }

  public BooleanProperty gameOverProperty() {
    return gameOver;
  }

  public Team getBuzzingTeam() {
    return buzzingTeam;
  }

  public Team getTeam1() {
    return team1;
  }

  public Team getTeam2() {
    return team2;
  }

  // ========== ADMIN OPERATIONS ==========

  /**
   * Adds a question to a pack.
   *
   * @param packId   The pack ID
   * @param question The question to add
   * @throws IllegalParameterException if parameters are invalid
   */
  public void addQuestion(String packId, Question question) throws IllegalParameterException {
    service.addQuestion(packId, question);
    updateQuestionCount();
  }

  /**
   * Gets packs for a specific category.
   *
   * @param categoryId The category ID
   * @return Observable list of packs
   */
  public ObservableList<Category> getPacksForCategory(String categoryId) {
    try {
      return FXCollections.observableArrayList(service.getPacks(categoryId));
    } catch (IllegalParameterException e) {
      statusMessage.set("Invalid category: " + e.getMessage());
      logger.error("Failed to get packs for category {}", categoryId, e);
      return FXCollections.observableArrayList();
    }
  }

  /**
   * Resets the game state without clearing teams or questions.
   * Allows starting a new game with the same configuration.
   */
  public void resetGameOnly() {
    service.resetGame();
  }

  /**
   * Shuts down the service and releases resources.
   * Should be called when the application closes.
   */
  public void shutdown() {
    service.shutdown();
  }
}