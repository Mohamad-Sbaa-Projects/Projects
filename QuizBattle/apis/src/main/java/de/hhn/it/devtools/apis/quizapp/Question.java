package de.hhn.it.devtools.apis.quizapp;

import de.hhn.it.devtools.apis.quizapp.enums.Difficulty;
import de.hhn.it.devtools.apis.quizapp.enums.QuestionType;
import java.util.List;
import java.util.Objects;

/**
 * Represents a quiz question.
 * Supports both Multiple Choice and Text Input types.
 *
 * @param id            Unique identifier.
 * @param text          The question text.
 * @param options       List of possible answers (for Multiple Choice).
 * @param correctIndex  The index of the correct answer in {@code options}.
 * @param correctAnswer The correct text answer (for Text Input).
 * @param category      The category this question belongs to.
 * @param difficulty    The difficulty level.
 * @param type          The type of question (MC or Text).
 */
public record Question(
        int id, String text, List<String> options, int correctIndex,
        String correctAnswer, Category category, Difficulty difficulty, QuestionType type
) {
  /**
   * Creates a new Question and normalizes fields depending on the question type.
   * For MULTIPLE_CHOICE the options list must not be null and will be copied.
   * For TEXT_INPUT the options list will be set to an empty list.
   *
   * @param id Unique identifier of the question.
   * @param text The question text. Must not be null.
   * @param options List of answer options for multiple choice questions.
   * @param correctIndex Index of the correct option (only relevant for multiple choice).
   * @param correctAnswer Correct answer text (only relevant for text input).
   * @param category Category of the question. Must not be null.
   * @param difficulty Difficulty level. Must not be null.
   * @param type Question type. Must not be null.
   * @throws NullPointerException If texted, category, difficulty, or type is null.
   *         Also thrown if type is MULTIPLE_CHOICE and options is null.
   */
  public Question {
    Objects.requireNonNull(text);
    Objects.requireNonNull(category);
    Objects.requireNonNull(difficulty);
    Objects.requireNonNull(type);
    if (type == QuestionType.MULTIPLE_CHOICE) {
      Objects.requireNonNull(options);
      options = List.copyOf(options);
    } else {
      options = List.of();
    }
  }

  /**
   * Creates a multiple choice question.
   *
   * @param id Unique identifier of the question.
   * @param text The question text. Must not be null.
   * @param options List of possible answers. Must not be null.
   * @param correctIndex Index of the correct answer in the options list.
   * @param category Category of the question. Must not be null.
   * @param difficulty Difficulty level. Must not be null.
   * @throws NullPointerException If text, options, category, or difficulty is null.
   */
  public Question(int id, String text, List<String> options, int correctIndex,
                  Category category, Difficulty difficulty) {
    this(id, text, options, correctIndex, null, category, difficulty, QuestionType.MULTIPLE_CHOICE);
  }

  /**
   * Creates a text input question.
   *
   * @param id Unique identifier of the question.
   * @param text The question text. Must not be null.
   * @param correctAnswer The correct answer text.
   * @param category Category of the question. Must not be null.
   * @param difficulty Difficulty level. Must not be null.
   * @throws NullPointerException If text, category, or difficulty is null.
   */
  public Question(int id, String text, String correctAnswer, Category category,
                  Difficulty difficulty) {
    this(id, text, List.of(), -1, correctAnswer, category, difficulty, QuestionType.TEXT_INPUT);
  }

  /**
   * Getter Method for points
   *
   * @return The points awarded for this question based on its difficulty.
   */
  public int getPoints() {
    return difficulty.getPoints();
  }
}
