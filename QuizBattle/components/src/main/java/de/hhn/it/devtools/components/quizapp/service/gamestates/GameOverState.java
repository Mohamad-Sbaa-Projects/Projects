package de.hhn.it.devtools.components.quizapp.service.gamestates;

import de.hhn.it.devtools.apis.quizapp.Team;
import de.hhn.it.devtools.apis.quizapp.enums.GameState;
import de.hhn.it.devtools.components.quizapp.service.QuizGameService;

/** Game-over state: finalizes the game and exposes the final result/winner. */
public class GameOverState extends GameStateHandler {
  public GameOverState(QuizGameService game) {
    super(GameState.GAME_OVER, game);
  }

  @Override
  public void onEnter() {
    Team winner = game.determineWinner();
    int score = winner != null ? game.getTeamScore(winner) : 0;
    game.notifyGameFinished(winner, score);
  }
}
