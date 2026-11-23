package de.hhn.it.devtools.components.quizapp.service.gamestates;

import de.hhn.it.devtools.apis.quizapp.Team;
import de.hhn.it.devtools.apis.quizapp.enums.GameState;
import de.hhn.it.devtools.components.quizapp.service.QuizGameService;

/** Abstract base for concrete quiz game states with common helper behavior. */
public abstract class GameStateHandler {
  protected final GameState state;
  protected final QuizGameService game;

  protected GameStateHandler(GameState state, QuizGameService game) {
    this.state = state;
    this.game = game;
  }

  public GameState getState() {
    return state;
  }

  public void onEnter() {
  }

  public void onExit() {
  }

  public void handleBuzz(Team team) throws IllegalStateException {
    throw new IllegalStateException("Cannot buzz in state: " + state);
  }

  public void handleAnswer(Team team, int index) throws IllegalStateException {
    throw new IllegalStateException("Cannot answer in state: " + state);
  }

  public void handleAnswer(Team team, String answer) throws IllegalStateException {
    throw new IllegalStateException("Cannot answer in state: " + state);
  }

  public void handleTimerTick(int seconds) {
  }

  public void handleTimerExpired() {
  }

  public void handleNextQuestion() throws IllegalStateException {
    throw new IllegalStateException("Cannot advance in state: " + state);
  }
}

