package de.hhn.it.devtools.apis.quizapp.enums;

/**
 * Defines the different types of questions available in the quiz.
 */
public enum QuestionType {
  /**
   * A question with multiple predefined options (usually 4),
   * where only one option is correct.
   */
  MULTIPLE_CHOICE,

  /**
   * A free-text question where the player must type the answer.
   * The input is validated against a correct answer string.
   */
  TEXT_INPUT
}