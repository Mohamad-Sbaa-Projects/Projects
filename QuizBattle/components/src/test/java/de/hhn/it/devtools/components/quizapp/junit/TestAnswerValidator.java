package de.hhn.it.devtools.components.quizapp.junit;

import de.hhn.it.devtools.apis.quizapp.Category;
import de.hhn.it.devtools.apis.quizapp.Question;
import de.hhn.it.devtools.apis.quizapp.enums.Difficulty;
import de.hhn.it.devtools.components.quizapp.service.AnswerValidator;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class TestAnswerValidator {
  private final Category cat = new Category("geo", "Geography");

  @Test
  void multipleChoiceCorrectIndexIsTrue() {
    Question q = new Question(1, "Capital?", List.of("Paris", "London"), 0, cat, Difficulty.EASY);
    assertTrue(AnswerValidator.checkMultipleChoice(q, 0));
    assertFalse(AnswerValidator.checkMultipleChoice(q, 1));
  }

  @Test
  void multipleChoiceWrongTypeIsFalse() {
    Question q = new Question(2, "Capital?", "Paris", cat, Difficulty.EASY); // TEXT_INPUT
    assertFalse(AnswerValidator.checkMultipleChoice(q, 0));
  }

  @Test
  void textInputNullAnswerIsFalse() {
    Question q = new Question(3, "Capital?", "Paris", cat, Difficulty.EASY);
    assertFalse(AnswerValidator.checkTextInput(q, null));
  }

  @Test
  void textInputNormalizationTrimsLowercasesAndRemovesPunctuation() {
    Question q = new Question(4, "Capital?", "Paris", cat, Difficulty.EASY);
    assertTrue(AnswerValidator.checkTextInput(q, "  paRis!! "));
    assertTrue(AnswerValidator.checkTextInput(q, "paris."));
    assertFalse(AnswerValidator.checkTextInput(q, "london"));
  }

  @Test
  void textInputAcceptsAlternativesSeparatedByPipe() {
    Question q = new Question(5, "City?", "Rome|Roma", cat, Difficulty.EASY);
    assertTrue(AnswerValidator.checkTextInput(q, "roma"));
    assertTrue(AnswerValidator.checkTextInput(q, " Rome "));
    assertFalse(AnswerValidator.checkTextInput(q, "Milan"));
  }

  @Test
  void textInputWrongTypeIsFalse() {
    Question q = new Question(6, "Capital?", List.of("Paris", "London"), 0, cat, Difficulty.EASY);
    assertFalse(AnswerValidator.checkTextInput(q, "Paris"));
  }
}
