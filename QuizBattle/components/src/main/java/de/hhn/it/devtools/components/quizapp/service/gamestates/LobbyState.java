package de.hhn.it.devtools.components.quizapp.service.gamestates;

import de.hhn.it.devtools.apis.quizapp.enums.GameState;
import de.hhn.it.devtools.components.quizapp.service.QuizGameService;

/** Lobby state: teams are managed and the game can be configured and started. */
public class LobbyState extends GameStateHandler {
  public LobbyState(QuizGameService game) {
    super(GameState.LOBBY, game);
  }
}
