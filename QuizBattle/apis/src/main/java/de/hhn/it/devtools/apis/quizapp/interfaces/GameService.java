package de.hhn.it.devtools.apis.quizapp.interfaces;

import de.hhn.it.devtools.apis.exceptions.IllegalParameterException;
import de.hhn.it.devtools.apis.quizapp.Team;

/**
 * Primary interface for controlling the active gameplay.
 * The service drives the game logic, while the UI reacts to events via {@link GameListener}.
 * Scoring is handled internally by the service and cannot be modified directly via this interface.
 */
public interface GameService {

  /**
   * Registers a listener to receive game events (e.g., state changes, timer ticks).
   *
   * @param listener The listener to add.
   * @throws IllegalParameterException If the listener is null or already registered.
   */
  void addCallback(GameListener listener) throws IllegalParameterException;

  /**
   * Unregisters a previously added listener.
   *
   * @param listener The listener to remove.
   * @throws IllegalParameterException If the listener is null or was not registered.
   */
  void removeCallback(GameListener listener) throws IllegalParameterException;

  /**
   * Starts the game, transitioning from the LOBBY to the first question.
   * Requires at least two teams and a configured question set.
   *
   * @throws IllegalStateException If the game is not in the LOBBY state or not properly configured.
   */
  void startGame() throws IllegalStateException;

  /**
   * Forces the game to end immediately, transitioning to the GAME_OVER state.
   */
  void endGame();

  /**
   * Triggered when a team activates their buzzer.
   * Only valid during the
   * {@link de.hhn.it.devtools.apis.quizapp.enums.GameState#WAITING_FOR_BUZZER} state.
   *
   * @param team The team that buzzed.
   * @throws IllegalParameterException If the team is unknown.
   * @throws IllegalStateException If called in an invalid game state (e.g. not waiting for buzzer).
   */
  void buzz(Team team) throws IllegalParameterException, IllegalStateException;

  /**
   * Submits a selected answer index for a Multiple Choice question.
   * Only valid during the
   * {@link de.hhn.it.devtools.apis.quizapp.enums.GameState#WAITING_FOR_ANSWER} state.
   *
   * @param team          The team submitting the answer.
   * @param selectedIndex The index of the selected option (0-based).
   * @throws IllegalParameterException If the team is invalid.
   * @throws IllegalParameterException if the current question is not Multiple Choice.
   * @throws IllegalStateException If it is not currently this team's turn or the wrong game state.
   */
  void submitAnswer(Team team, int selectedIndex)
          throws IllegalParameterException, IllegalStateException;

  /**
   * Submits a text answer for a Text Input question.
   * Only valid during the
   * {@link de.hhn.it.devtools.apis.quizapp.enums.GameState#WAITING_FOR_ANSWER} state.
   *
   * @param team   The team submitting the answer.
   * @param answer The answer string entered by the user.
   * @throws IllegalParameterException If the answer is empty.
   * @throws IllegalParameterException if the current question is not Text Input.
   * @throws IllegalStateException If it is not currently this team's turn or the wrong game state.
   */
  void submitAnswer(Team team, String answer)
          throws IllegalParameterException, IllegalStateException;

  /**
   * Manually advances to the next question.
   * Usually handled automatically by the service after the result phase.
   *
   * @throws IllegalStateException If the action is not allowed in the current state.
   */
  void nextQuestion() throws IllegalStateException;
}