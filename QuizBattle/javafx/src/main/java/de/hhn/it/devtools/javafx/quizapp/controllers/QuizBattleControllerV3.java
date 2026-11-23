package de.hhn.it.devtools.javafx.quizapp.controllers;

import de.hhn.it.devtools.apis.quizapp.Category;
import de.hhn.it.devtools.apis.quizapp.enums.GameState;
import de.hhn.it.devtools.javafx.quizapp.view.QuizViewModel;
import java.net.URL;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.ResourceBundle;
import javafx.animation.FadeTransition;
import javafx.animation.ScaleTransition;
import javafx.application.Platform;
import javafx.fxml.FXML;
import javafx.fxml.Initializable;
import javafx.geometry.Pos;
import javafx.scene.control.Button;
import javafx.scene.control.CheckBox;
import javafx.scene.control.Label;
import javafx.scene.control.TextField;
import javafx.scene.image.Image;
import javafx.scene.image.ImageView;
import javafx.scene.input.KeyCode;
import javafx.scene.input.KeyEvent;
import javafx.scene.layout.BorderPane;
import javafx.scene.layout.HBox;
import javafx.scene.layout.StackPane;
import javafx.scene.layout.VBox;
import javafx.util.Duration;

public class QuizBattleControllerV3 implements Initializable {
  private static final org.slf4j.Logger logger =
          org.slf4j.LoggerFactory.getLogger(QuizBattleControllerV3.class);

  // ==================== FXML ELEMENTS ====================

  // Icons for categories
  private static final Map<String, String> CATEGORY_ICONS = new HashMap<>() {
    {
      put("geography", "");
      put("science", "");
      put("math", "");
      put("mathematics", "");
      put("programming", "");
      put("databases", "");
      put("history", "");
      put("sports", "");
      put("music", "");
      put("movies", "");
      put("art", "");
      put("tech", "");
    }
  };
  @FXML
  private BorderPane rootPane;
  // Header
  @FXML
  private StackPane logoIcon;
  @FXML
  private Label logoLabel;
  @FXML
  private Label questionNumberLabel;
  @FXML
  private StackPane timerCircle;
  @FXML
  private Label timerLabel;
  @FXML
  private Label statusLabel;
  // Team Panels
  @FXML
  private VBox team1Panel;
  @FXML
  private VBox team2Panel;
  @FXML
  private Label team1Icon;
  @FXML
  private Label team2Icon;
  @FXML
  private Label team1NameLabel;
  @FXML
  private Label team2NameLabel;
  @FXML
  private Label team1ScoreLabel;
  @FXML
  private Label team2ScoreLabel;
  @FXML
  private Button buzzer1Button;
  @FXML
  private Button buzzer2Button;
  // Setup Pane
  @FXML
  private VBox setupPane;
  @FXML
  private TextField team1NameField;
  @FXML
  private TextField team2NameField;
  @FXML
  private CheckBox randomModeCheckBox;
  @FXML
  private HBox categoryCardsBox;
  @FXML
  private StackPane team1PreviewIcon;
  @FXML
  private StackPane team2PreviewIcon;
  @FXML
  private VBox packSection;
  @FXML
  private Label packSectionLabel;
  @FXML
  private HBox packCardsBox;
  @FXML
  private Label selectionInfoLabel;
  @FXML
  private Label roundsValue;
  @FXML
  private Button startButton;
  // Game Pane
  @FXML
  private VBox gamePane;
  @FXML
  private StackPane questionCard;
  @FXML
  private Label categoryBadge;
  @FXML
  private Label questionLabel;
  @FXML
  private Label resultLabel;
  @FXML
  private VBox answersBox;
  @FXML
  private HBox textInputBox;
  @FXML
  private TextField textAnswerField;
  @FXML
  private Button submitTextButton;
  @FXML
  private HBox buzzIndicator;
  @FXML
  private Label buzzedTeamLabel;
  // Game Over Pane
  @FXML
  private VBox gameOverPane;
  @FXML
  private Label winnerLabel;
  @FXML
  private Label finalTeam1Name;
  @FXML
  private Label finalTeam2Name;
  @FXML
  private Label finalTeam1Score;
  @FXML
  private Label finalTeam2Score;

  // ==================== INSTANCE VARIABLES ====================
  @FXML
  private Button restartButton;
  private QuizViewModel viewModel;
  private int questionCount = 5;
  // Track selected cards
  private VBox selectedCategoryCard = null;
  private VBox selectedPackCard = null;
  private Category selectedCategory = null;
  private Category selectedPack = null;

  // ==================== INITIALIZATION ====================

  @Override
  public void initialize(URL location, ResourceBundle resources) {
    // Load stylesheets with fallback (DRY).
    loadStylesheets("/css/quizbattle-v3.css");

    // Create ViewModel
    viewModel = new QuizViewModel();

    // Load images
    loadTeamImages();

    // Setup UI
    createCategoryCards();
    setupBindings();
    setupEventHandlers();
    setupKeyboardBindings();

    showScreen("setup");
  }

  /**
   * Attempts to load the first available stylesheet from the provided resource paths.
   *
   * @param stylesheetResources Classpath resource paths to CSS files.
   */
  private void loadStylesheets(String... stylesheetResources) {
    for (String cssResource : stylesheetResources) {
      URL url = getClass().getResource(cssResource);
      if (url != null) {
        rootPane.getStylesheets().add(url.toExternalForm());
        logger.info("Loaded stylesheet: {}", cssResource);
        return;
      }
    }
    logger.warn("No stylesheet found. Tried: {}", java.util.Arrays.toString(stylesheetResources));
  }

  /**
   * Loads team images from resources.
   */
  private void loadTeamImages() {
    // Load team images
    try {
      URL img1Url = getClass().getResource("/images/team1.png");
      if (img1Url != null) {
        Image img1 = new Image(img1Url.toExternalForm());

        // Side panel icon
        ImageView iv1 = new ImageView(img1);
        iv1.setFitWidth(80);
        iv1.setFitHeight(80);
        iv1.setPreserveRatio(true);
        team1Icon.setGraphic(iv1);
        team1Icon.setText("");

        // Setup preview icon
        if (team1PreviewIcon != null) {
          ImageView previewIv1 = new ImageView(img1);
          previewIv1.setFitWidth(70);
          previewIv1.setFitHeight(70);
          previewIv1.setPreserveRatio(true);
          team1PreviewIcon.getChildren().clear();
          team1PreviewIcon.getChildren().add(previewIv1);
        }
      }
    } catch (Exception e) {
      return;
    }

    try {
      URL img2Url = getClass().getResource("/images/team2.png");
      if (img2Url != null) {
        Image img2 = new Image(img2Url.toExternalForm());

        // Side panel icon
        ImageView iv2 = new ImageView(img2);
        iv2.setFitWidth(80);
        iv2.setFitHeight(80);
        iv2.setPreserveRatio(true);
        team2Icon.setGraphic(iv2);
        team2Icon.setText("");

        // Setup preview icon
        if (team2PreviewIcon != null) {
          ImageView previewIv2 = new ImageView(img2);
          previewIv2.setFitWidth(70);
          previewIv2.setFitHeight(70);
          previewIv2.setPreserveRatio(true);
          team2PreviewIcon.getChildren().clear();
          team2PreviewIcon.getChildren().add(previewIv2);
        }
      }
    } catch (Exception e) {
      return;
    }
  }

  private void createCategoryCards() {
    categoryCardsBox.getChildren().clear();

    List<Category> categories = viewModel.getCategories();

    for (Category category : categories) {
      VBox card = createCategoryCard(category);
      categoryCardsBox.getChildren().add(card);
    }

    // Auto-select first category
    if (!categories.isEmpty() && categoryCardsBox.getChildren().size() > 0) {
      VBox firstCard = (VBox) categoryCardsBox.getChildren().get(0);
      selectCategory(firstCard, categories.get(0));
    }
  }

  private VBox createCategoryCard(Category category) {
    VBox card = new VBox();
    card.getStyleClass().add("category-card");
    card.setAlignment(Pos.CENTER);
    card.setSpacing(5);

    StackPane iconContainer = new StackPane();
    iconContainer.setMinSize(50, 50);
    iconContainer.setMaxSize(50, 50);

    try {
      String imagePath = "/images/categories/" + category.getId().toLowerCase() + ".png";
      URL imageUrl = getClass().getResource(imagePath);

      if (imageUrl != null) {
        Image categoryImage = new Image(imageUrl.toExternalForm());
        ImageView imageView = new ImageView(categoryImage);
        imageView.setFitWidth(45);
        imageView.setFitHeight(45);
        imageView.setPreserveRatio(true);
        iconContainer.getChildren().add(imageView);
      } else {
        // Fallback to emoji
        String icon = CATEGORY_ICONS.getOrDefault(category.getId().toLowerCase(), "📁");
        Label iconLabel = new Label(icon);
        iconLabel.getStyleClass().add("cat-icon");
        iconContainer.getChildren().add(iconLabel);
      }
    } catch (Exception e) {
      // Fallback to emoji on error
      String icon = CATEGORY_ICONS.getOrDefault(category.getId().toLowerCase(), "📁");
      Label iconLabel = new Label(icon);
      iconLabel.getStyleClass().add("cat-icon");
      iconContainer.getChildren().add(iconLabel);
    }

    // Name
    Label nameLabel = new Label(category.getName());
    nameLabel.getStyleClass().add("cat-name");

    card.getChildren().addAll(iconContainer, nameLabel);

    // Click handler
    card.setOnMouseClicked(e -> selectCategory(card, category));

    return card;
  }

  /**
   * Handles category selection - shows pack cards.
   */
  private void selectCategory(VBox card, Category category) {
    // Deselect previous
    if (selectedCategoryCard != null) {
      selectedCategoryCard.getStyleClass().remove("category-card-selected");
    }

    // Select new
    selectedCategoryCard = card;
    selectedCategory = category;
    card.getStyleClass().add("category-card-selected");

    // Update ViewModel
    viewModel.selectedCategoryProperty().set(category);

    // Animation
    ScaleTransition pop = new ScaleTransition(Duration.millis(150), card);
    pop.setFromX(1.0);
    pop.setFromY(1.0);
    pop.setToX(1.08);
    pop.setToY(1.08);
    pop.setAutoReverse(true);
    pop.setCycleCount(2);
    pop.play();

    // Show pack cards
    createPackCards(category);
  }

  /**
   * Creates pack cards for the selected category.
   */
  private void createPackCards(Category category) {
    packCardsBox.getChildren().clear();
    selectedPackCard = null;
    selectedPack = null;

    List<Category> packs = viewModel.getPacks();

    if (packs.isEmpty()) {
      packSection.setVisible(false);
      packSection.setManaged(false);
      selectionInfoLabel.setText("Selected: " + category.getName() + " (no subpackages)");
      return;
    }

    packSection.setVisible(true);
    packSection.setManaged(true);

    for (Category pack : packs) {
      VBox packCard = createPackCard(pack);
      packCardsBox.getChildren().add(packCard);
    }

    // Auto-select first pack
    if (!packs.isEmpty() && packCardsBox.getChildren().size() > 0) {
      VBox firstPackCard = (VBox) packCardsBox.getChildren().get(0);
      selectPack(firstPackCard, packs.get(0));
    }
  }

  /**
   * Creates a single pack card.
   */
  private VBox createPackCard(Category pack) {
    VBox card = new VBox();
    card.getStyleClass().add("pack-card");
    card.setAlignment(Pos.CENTER);
    card.setSpacing(3);

    // Name
    Label nameLabel = new Label(pack.getName());
    nameLabel.getStyleClass().add("pack-name");

    // Question count
    int count = viewModel.availableQuestionCountProperty().get();
    Label countLabel = new Label(count + " Questions");
    countLabel.getStyleClass().add("pack-count");

    card.getChildren().addAll(nameLabel, countLabel);

    // Click handler
    card.setOnMouseClicked(e -> selectPack(card, pack));

    return card;
  }

  /**
   * Handles pack selection.
   */
  private void selectPack(VBox card, Category pack) {
    // Deselect previous
    if (selectedPackCard != null) {
      selectedPackCard.getStyleClass().remove("pack-card-selected");
    }

    // Select new
    selectedPackCard = card;
    selectedPack = pack;
    card.getStyleClass().add("pack-card-selected");

    // Update ViewModel
    viewModel.selectedPackProperty().set(pack);

    // Update info label
    updateSelectionInfo();

    // Animation
    ScaleTransition pop = new ScaleTransition(Duration.millis(100), card);
    pop.setFromX(1.0);
    pop.setFromY(1.0);
    pop.setToX(1.05);
    pop.setToY(1.05);
    pop.setAutoReverse(true);
    pop.setCycleCount(2);
    pop.play();
  }

  /**
   * Updates the selection info label.
   */
  private void updateSelectionInfo() {
    if (selectedCategory != null && selectedPack != null) {
      int count = viewModel.availableQuestionCountProperty().get();
      selectionInfoLabel.setText("Selected: " + selectedCategory.getName()
              + " → " + selectedPack.getName() + " (" + count + " Questions)");
    } else if (selectedCategory != null) {
      selectionInfoLabel.setText("Selected: " + selectedCategory.getName());
    } else {
      selectionInfoLabel.setText("");
    }
  }

  // ==================== BINDINGS ====================

  private void setupBindings() {
    // Question bindings
    questionLabel.textProperty().bind(viewModel.questionTextProperty());
    questionNumberLabel.textProperty().bind(
            viewModel.questionNumberProperty().asString()
                    .concat("/")
                    .concat(viewModel.totalQuestionsProperty().asString()));

    // Hide buzz indicator when new question loads
    viewModel.questionTextProperty().addListener((obs, oldQ, newQ) -> {
      if (newQ != null && !newQ.isEmpty()) {
        buzzIndicator.setVisible(false);
        buzzIndicator.setManaged(false);
      }
    });

    viewModel.questionNumberProperty().addListener((obs, oldVal, newVal) -> {
      textAnswerField.clear();
    });

    // Timer
    timerLabel.textProperty().bind(viewModel.timerLabelProperty());
    viewModel.timerSecondsProperty().addListener((obs, old, newVal) -> {
      int seconds = newVal.intValue();
      timerCircle.getStyleClass().removeAll("timer-circle-warning", "timer-circle-danger");
      if (seconds <= 5 && seconds > 0) {
        timerCircle.getStyleClass().add("timer-circle-danger");
        pulseTimer();
      } else if (seconds <= 10) {
        timerCircle.getStyleClass().add("timer-circle-warning");
      }
    });

    statusLabel.textProperty().bind(viewModel.statusMessageProperty());
    resultLabel.textProperty().bind(viewModel.resultMessageProperty());
    resultLabel.visibleProperty().bind(viewModel.showResultProperty());

    // In case of german words
    viewModel.resultMessageProperty().addListener((obs, oldVal, newVal) -> {
      resultLabel.getStyleClass().removeAll("result-correct", "result-wrong");
      if (newVal != null) {
        if (newVal.toLowerCase().contains("richtig") || newVal.toLowerCase().contains("correct")) {
          resultLabel.getStyleClass().add("result-correct");
        } else if (newVal.toLowerCase().contains("falsch")
                || newVal.toLowerCase().contains("wrong")) {
          resultLabel.getStyleClass().add("result-wrong");
        }
      }
    });

    team1NameLabel.textProperty().bind(viewModel.team1NameProperty());
    team2NameLabel.textProperty().bind(viewModel.team2NameProperty());
    team1ScoreLabel.textProperty().bind(viewModel.team1ScoreProperty().asString());
    team2ScoreLabel.textProperty().bind(viewModel.team2ScoreProperty().asString());

    // Buzzer state
    buzzer1Button.disableProperty().bind(viewModel.buzzerEnabledProperty().not());
    buzzer2Button.disableProperty().bind(viewModel.buzzerEnabledProperty().not());

    // Text input
    textInputBox.visibleProperty().bind(
            viewModel.textInputModeProperty().and(viewModel.answerEnabledProperty()));
    textInputBox.managedProperty().bind(textInputBox.visibleProperty());

    // Winner
    winnerLabel.textProperty().bind(viewModel.winnerTextProperty());

    // Answer options
    viewModel.getAnswerOptions().addListener(
            (javafx.collections.ListChangeListener<String>) c -> updateAnswerButtons());

    // Also update answer buttons when switching between text input and multiple choice
    viewModel.textInputModeProperty().addListener((obs, oldVal, newVal) -> updateAnswerButtons());

    // Game state
    viewModel.gameStateProperty().addListener((obs, old, newState) -> {
      Platform.runLater(() -> updateUiForState(newState));
    });

    // Random mode
    randomModeCheckBox.selectedProperty().addListener((obs, old, isRandom) -> {
      categoryCardsBox.setDisable(isRandom);
      categoryCardsBox.setOpacity(isRandom ? 0.4 : 1.0);
      packSection.setDisable(isRandom);
      packSection.setOpacity(isRandom ? 0.4 : 1.0);

      if (isRandom) {
        selectionInfoLabel.setText("Random mode: All categories");
      } else {
        updateSelectionInfo();
      }
    });

    // Buzz indicator visibility
    viewModel.buzzerEnabledProperty().addListener((obs, old, enabled) -> {
      if (enabled) {
        buzzIndicator.setVisible(false);
        buzzIndicator.setManaged(false);
      }
    });

    viewModel.availableQuestionCountProperty().addListener((obs, old, newVal) -> {
      updateSelectionInfo();
    });
  }

  private void setupEventHandlers() {
    buzzer1Button.setOnAction(e -> onBuzz1());
    buzzer2Button.setOnAction(e -> onBuzz2());

    submitTextButton.setOnAction(e -> onSubmitText());
    textAnswerField.setOnAction(e -> onSubmitText());

    startButton.setOnAction(e -> onStartGame());
    restartButton.setOnAction(e -> onRestart());
  }

  private void setupKeyboardBindings() {
    rootPane.setFocusTraversable(true);

    rootPane.sceneProperty().addListener((obs, oldScene, newScene) -> {
      if (newScene != null) {
        newScene.removeEventFilter(KeyEvent.KEY_PRESSED, this::handleKeyPressed);
        newScene.addEventFilter(KeyEvent.KEY_PRESSED, this::handleKeyPressed);
        Platform.runLater(() -> rootPane.requestFocus());
        logger.debug("Keyboard handler attached to scene");
      }
    });
  }

  private void handleKeyPressed(KeyEvent event) {
    // Don't buzz while typing
    if (team1NameField.isFocused()
            || team2NameField.isFocused()
            || textAnswerField.isFocused()) {
      return;
    }

    if (viewModel.buzzerEnabledProperty().get()) {
      if (event.getCode() == KeyCode.Q) {
        onBuzz1();
        event.consume();
        return;
      }
      if (event.getCode() == KeyCode.P) {
        onBuzz2();
        event.consume();
        return;
      }
    }

    if (viewModel.answerEnabledProperty().get()
            && !viewModel.textInputModeProperty().get()) {

      int index = switch (event.getCode()) {
        case DIGIT1, NUMPAD1, A -> 0;
        case DIGIT2, NUMPAD2, B -> 1;
        case DIGIT3, NUMPAD3, C -> 2;
        case DIGIT4, NUMPAD4, D -> 3;
        default -> -1;
      };

      if (index >= 0 && index < viewModel.getAnswerOptions().size()) {
        viewModel.submitAnswer(index);
        event.consume();
      }
    }
  }

  private void updateUiForState(GameState state) {
    switch (state) {
      case LOBBY -> showScreen("setup");
      case GAME_OVER -> {
        updateFinalScores();
        showScreen("gameover");
      }
      default -> showScreen("game");
    }

    if (state == GameState.PRESENTING_QUESTION || state == GameState.WAITING_FOR_BUZZER) {
      if (selectedPack != null) {
        categoryBadge.setText(selectedPack.getName().toUpperCase());
      } else if (selectedCategory != null) {
        categoryBadge.setText(selectedCategory.getName().toUpperCase());
      } else {
        categoryBadge.setText("QUIZ");
      }
    }
  }

  private void showScreen(String screen) {
    setupPane.setVisible("setup".equals(screen));
    setupPane.setManaged("setup".equals(screen));
    gamePane.setVisible("game".equals(screen));
    gamePane.setManaged("game".equals(screen));
    gameOverPane.setVisible("gameover".equals(screen));
    gameOverPane.setManaged("gameover".equals(screen));
  }

  private void updateAnswerButtons() {
    answersBox.getChildren().clear();

    if (viewModel.textInputModeProperty().get()) {
      return;
    }

    for (int i = 0; i < viewModel.getAnswerOptions().size(); i++) {
      final int index = i;
      String option = viewModel.getAnswerOptions().get(i);
      char letter = (char) ('A' + i);

      Button btn = new Button(letter + ")  " + option);
      btn.getStyleClass().add("answer-btn");
      btn.setMaxWidth(Double.MAX_VALUE);

      btn.disableProperty().bind(viewModel.answerEnabledProperty().not());

      btn.setOnAction(e -> {
        viewModel.submitAnswer(index);
        btn.getStyleClass().add("answer-selected");
      });

      answersBox.getChildren().add(btn);
    }
  }

  private void updateFinalScores() {
    finalTeam1Name.setText(viewModel.team1NameProperty().get());
    finalTeam2Name.setText(viewModel.team2NameProperty().get());
    finalTeam1Score.setText(String.valueOf(viewModel.team1ScoreProperty().get()));
    finalTeam2Score.setText(String.valueOf(viewModel.team2ScoreProperty().get()));
  }

  private void pulseTimer() {
    ScaleTransition pulse = new ScaleTransition(Duration.millis(200), timerCircle);
    pulse.setFromX(1.0);
    pulse.setFromY(1.0);
    pulse.setToX(1.15);
    pulse.setToY(1.15);
    pulse.setAutoReverse(true);
    pulse.setCycleCount(2);
    pulse.play();
  }

  // ==================== ACTIONS ====================

  @FXML
  private void onStartGame() {
    try {
      String name1 = team1NameField.getText().isBlank() ? "Team 1" : team1NameField.getText();
      String name2 = team2NameField.getText().isBlank() ? "Team 2" : team2NameField.getText();

      if (name1.equalsIgnoreCase(name2)) {
        viewModel.statusMessageProperty().set("Team names must be different!");
        return;
      }

      viewModel.setupTeams(
              name1, viewModel.team1ColorProperty().get(),
              name2, viewModel.team2ColorProperty().get()
      );

      if (randomModeCheckBox.isSelected()) {
        viewModel.configureRandomGame(questionCount);
      } else {
        viewModel.configureGameFromPack(questionCount);
      }

      viewModel.startGame();

    } catch (de.hhn.it.devtools.apis.exceptions.IllegalParameterException
             | IllegalStateException e) {
      viewModel.statusMessageProperty().set("Error: " + e.getMessage());
      logger.warn("Start game rejected: {}", e.getMessage());
    } catch (RuntimeException e) {
      // Programming errors must not be swallowed.
      logger.error("Unexpected error while starting the game", e);
      throw e;
    }
  }

  @FXML
  private void increaseRounds() {
    questionCount = Math.min(20, questionCount + 1);
    roundsValue.setText(String.valueOf(questionCount));
  }

  @FXML
  private void decreaseRounds() {
    questionCount = Math.max(1, questionCount - 1);
    roundsValue.setText(String.valueOf(questionCount));
  }

  @FXML
  public void onBuzz1() {
    if (viewModel.buzzerEnabledProperty().get()) {
      viewModel.buzzTeam1();
      showBuzzIndicator(viewModel.team1NameProperty().get(), 1);
    }
  }

  @FXML
  public void onBuzz2() {
    if (viewModel.buzzerEnabledProperty().get()) {
      viewModel.buzzTeam2();
      showBuzzIndicator(viewModel.team2NameProperty().get(), 2);
    }
  }

  private void showBuzzIndicator(String teamName, int teamNumber) {
    buzzedTeamLabel.setText(teamName);

    // Set team-colored style
    buzzIndicator.getStyleClass()
            .removeAll("buzz-indicator", "buzz-indicator-orange", "buzz-indicator-blue");
    if (teamNumber == 1) {
      buzzIndicator.getStyleClass().add("buzz-indicator-orange");
    } else {
      buzzIndicator.getStyleClass().add("buzz-indicator-blue");
    }

    buzzIndicator.setVisible(true);
    buzzIndicator.setManaged(true);

    FadeTransition flash = new FadeTransition(Duration.millis(100), buzzIndicator);
    flash.setFromValue(0);
    flash.setToValue(1);
    flash.setCycleCount(4);
    flash.setAutoReverse(true);
    flash.setOnFinished(e -> buzzIndicator.setOpacity(1));
    flash.play();
  }

  @FXML
  private void onSubmitText() {
    String answer = textAnswerField.getText();
    if (answer != null && !answer.isBlank()) {
      viewModel.submitTextAnswer(answer);
      textAnswerField.clear();
    }
  }

  @FXML
  private void onRestart() {
    viewModel.resetGameOnly();
    createCategoryCards();
    showScreen("setup");
  }

  public void triggerBuzzer1() {
    onBuzz1();
  }

  public void triggerBuzzer2() {
    onBuzz2();
  }

  public void shutdown() {
    if (viewModel != null) {
      viewModel.shutdown();
    }
  }
}
