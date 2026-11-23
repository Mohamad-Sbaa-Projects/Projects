package de.hhn.it.devtools.components.quizapp.service.gamestates;

import de.hhn.it.devtools.apis.quizapp.enums.GameState;
import de.hhn.it.devtools.components.quizapp.service.QuizGameService;

/** Showing-result state: displays whether the answer was correct and updates scores. */
public class ShowingResultState extends GameStateHandler {
  public ShowingResultState(QuizGameService game) {
    super(GameState.SHOWING_RESULT, game);
  }

  @Override
  public void onEnter() {
    game.clearBuzzingTeam();
    game.scheduleStateTransition(this::advance, 3000);
  }

  @Override
  public void handleNextQuestion() {
    game.cancelScheduledTransition();
    advance();
  }

  private void advance() {
    if (game.hasMoreQuestions()) {
      game.advanceToNextQuestion();
      game.transitionTo(GameState.PRESENTING_QUESTION);
    } else {
      game.transitionTo(GameState.GAME_OVER);
    }
  }
}
