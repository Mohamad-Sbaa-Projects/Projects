package de.hhn.it.devtools.components.quizapp.service.gamestates;

import de.hhn.it.devtools.apis.quizapp.enums.GameState;
import de.hhn.it.devtools.components.quizapp.service.QuizGameService;

/** Presenting-question state: shows the current question and prepares the next phase. */
public class PresentingQuestionState extends GameStateHandler {
  public PresentingQuestionState(QuizGameService game) {
    super(GameState.PRESENTING_QUESTION, game);
  }

  @Override
  public void onEnter() {
    game.notifyQuestionPresented();
    game.scheduleStateTransition(GameState.WAITING_FOR_BUZZER, 2000);
  }
}
