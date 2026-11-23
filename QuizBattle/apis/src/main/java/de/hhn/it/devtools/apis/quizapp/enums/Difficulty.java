package de.hhn.it.devtools.apis.quizapp.enums;

/**
 * Defines the difficulty levels for quiz questions.
 * Each level determines the points awarded and the time limits for the game phases.
 */
public enum Difficulty {
  /**
   * Easy difficulty: 100 points, 30s to buzz, 7s to answer.
   */
  EASY("Easy", 100, "#4CAF50", 30, 7),

  /**
   * Medium difficulty: 200 points, 30s to buzz, 10s to answer.
   */
  MEDIUM("Medium", 200, "#FF9800", 30, 10),

  /**
   * Hard difficulty: 300 points, 30s to buzz, 15s to answer.
   */
  HARD("Hard", 300, "#F44336", 30, 15);

  private final String displayName;
  private final int points;
  private final String color;
  private final int timeToBuzzer;
  private final int timeToAnswer;

  /**
   * Constructs a difficulty level.
   *
   * @param displayName  The human-readable name of the difficulty.
   * @param points       The score awarded for a correct answer.
   * @param color        The color code associated with this difficulty (e.g., for UI).
   * @param timeToBuzzer The time in seconds allowed for the buzzer phase.
   * @param timeToAnswer The time in seconds allowed for the answer phase.
   */
  Difficulty(String displayName, int points, String color, int timeToBuzzer, int timeToAnswer) {
    this.displayName = displayName;
    this.points = points;
    this.color = color;
    this.timeToBuzzer = timeToBuzzer;
    this.timeToAnswer = timeToAnswer;
  }

  /**
   * Getter method for display name
   *
   * @return The display name of the difficulty.
   */
  public String getDisplayName() {
    return displayName;
  }

  /**
   * Getter method for points
   *
   * @return The points awarded for a correct answer of this difficulty.
   */
  public int getPoints() {
    return points;
  }

  /**
   * Getter method for hex color
   *
   * @return The hex color code representing this difficulty.
   */
  public String getColor() {
    return color;
  }

  /**
   * Getter method for time to buzzer
   *
   * @return The maximum time in seconds players have to press the buzzer.
   */
  public int getTimeToBuzzer() {
    return timeToBuzzer;
  }

  /**
   * Getter method for time to answer
   *
   * @return The maximum time in seconds players have to submit an answer after buzzing.
   */
  public int getTimeToAnswer() {
    return timeToAnswer;
  }

  @Override
  public String toString() {
    return displayName;
  }
}