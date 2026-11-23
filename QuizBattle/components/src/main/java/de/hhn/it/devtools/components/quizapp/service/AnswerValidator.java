package de.hhn.it.devtools.components.quizapp.service;

import de.hhn.it.devtools.apis.quizapp.Question;
import de.hhn.it.devtools.apis.quizapp.enums.QuestionType;
import java.util.Arrays;

/**
 * Utility class for validating answers to quiz questions.
 * Supports both multiple choice and text input question types.
 */
public final class AnswerValidator {

  private AnswerValidator() {
    // Utility class - prevent instantiation
  }

  /**
   * Validates a multiple choice answer against the question's correct answer.
   *
   * @param question The question to validate against. Must not be null.
   * @param index    The index of the selected option (0-based).
   * @return {@code true} if the answer is correct, {@code false} otherwise.
   * @throws IllegalArgumentException If question is null or not of type MULTIPLE_CHOICE.
   */
  public static boolean checkMultipleChoice(Question question, int index) {
    if (question == null) {
      throw new IllegalArgumentException("Question must not be null");
    }
    if (question.type() != QuestionType.MULTIPLE_CHOICE) {
      return false;
    }
    if (index < 0 || index >= question.options().size()) {
      return false;
    }
    return index == question.correctIndex();
  }

  /**
   * Validates a text input answer against the question's correct answer.
   * Supports multiple correct answers separated by "|".
   * Normalization removes punctuation, extra whitespace, and is case-insensitive.
   *
   * @param question The question to validate against. Must not be null.
   * @param answer   The user-provided answer. Null or empty answers are considered incorrect.
   * @return {@code true} if the answer matches (after normalization), {@code false} otherwise.
   * @throws IllegalArgumentException If question is null or not of type TEXT_INPUT.
   * @throws IllegalStateException    If the question has no correct answer defined.
   */
  public static boolean checkTextInput(Question question, String answer) {
    // Validate question
    if (question == null) {
      throw new IllegalArgumentException("Question must not be null");
    }
    if (question.type() != QuestionType.TEXT_INPUT) {
      return false;
    }

    String correctAnswer = question.correctAnswer();
    if (correctAnswer == null || correctAnswer.trim().isEmpty()) {
      throw new IllegalStateException("Question has no correct answer defined");
    }

    // Null or empty user answers are incorrect
    if (answer == null || answer.trim().isEmpty()) {
      return false;
    }

    double tol = 0.0;
    String baseCorrect = correctAnswer;

    String lower = correctAnswer.toLowerCase();
    int tolPos = lower.indexOf(";tol=");
    if (tolPos >= 0) {
      baseCorrect = correctAnswer.substring(0, tolPos).trim();
      String tolPart = correctAnswer.substring(tolPos + 5).trim();
      tolPart = tolPart.replace(',', '.');
      try {
        tol = Math.abs(Double.parseDouble(tolPart));
      } catch (NumberFormatException e) {
        tol = 0.0;
        baseCorrect = correctAnswer;
      }
    }

    if (tolPos >= 0) {
      Double userVal = tryParseDouble(answer);
      if (userVal == null) {
        return false;
      }

      String[] solutions = baseCorrect.split("\\|");
      for (String s : solutions) {
        Double sol = tryParseDouble(s);
        if (sol == null) {
          continue;
        }
        if (Math.abs(userVal - sol) <= tol) {
          return true;
        }
      }
      return false;
    }

    String normalizedUserAnswer = normalize(answer);

    // Support multiple correct answers separated by |
    if (correctAnswer.contains("|")) {
      return Arrays.stream(correctAnswer.split("\\|"))
              .map(AnswerValidator::normalize)
              .anyMatch(normalizedUserAnswer::equals);
    }

    return normalizedUserAnswer.equals(normalize(correctAnswer));
  }

  private static Double tryParseDouble(String text) {
    if (text == null) {
      return null;
    }
    String t = text.trim();
    if (t.isEmpty()) {
      return null;
    }
    t = t.replace(',', '.');
    try {
      return Double.parseDouble(t);
    } catch (NumberFormatException e) {
      return null;
    }
  }

  /**
   * Normalizes a string for answer comparison.
   * - Trims whitespace
   * - Converts to lowercase
   * - Removes common punctuation marks
   * - Collapses multiple spaces into one
   *
   * @param text The text to normalize. Null values return empty string.
   * @return The normalized text.
   */
  private static String normalize(String text) {
    if (text == null) {
      return "";
    }
    return text.trim()
            .toLowerCase()
            .replaceAll("[.,;:!?]", "")
            .replaceAll("\\s+", " ");
  }
}