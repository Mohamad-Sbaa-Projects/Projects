package de.hhn.it.devtools.apis.quizapp.interfaces;

import de.hhn.it.devtools.apis.quizapp.Question;
import de.hhn.it.devtools.apis.quizapp.Team;
import de.hhn.it.devtools.apis.quizapp.enums.GameState;

/**
 * Callback interface for receiving game events.
 * Implementations of this interface (e.g., the UI/ViewModel) should update their view
 * based on these methods. The GameService pushes all state changes here.
 */
public interface GameListener {

  /**
   * Called when the global game state changes (e.g., from LOBBY to PRESENTING_QUESTION).
   *
   * @param newState The new state of the game.
   */
  default void onGameStateChanged(GameState newState) {
  }

  /**
   * Called when the game setup is complete and the game is about to start.
   *
   * @param totalQuestions The total number of questions in this game session.
   */
  default void onGameReady(int totalQuestions) {
  }

  /**
   * Called when the game has finished.
   *
   * @param winningTeam The team with the highest score, or null in case of a draw.
   * @param winnerScore The score of the winning team (or the tie score).
   */
  default void onGameFinished(Team winningTeam, int winnerScore) {
  }

  /**
   * Called when a new question is presented to the players.
   *
   * @param question       The question object containing text and options.
   * @param questionNumber The current question number (1-based).
   * @param totalQuestions The total number of questions.
   */
  default void onQuestionPresented(Question question, int questionNumber, int totalQuestions) {
  }

  /**
   * Called every second during the buzzing phase to update the countdown.
   *
   * @param secondsRemaining The time remaining to buzz.
   */
  default void onBuzzerTimerTick(int secondsRemaining) {
  }

  /**
   * Called when the time to buzz has expired without any team buzzing.
   */
  default void onBuzzerTimerExpired() {
  }

  /**
   * Called every second during the answering phase (after a buzzer press).
   *
   * @param secondsRemaining The time remaining for the team to answer.
   */
  default void onAnswerTimerTick(int secondsRemaining) {
  }

  /**
   * Called when a team failed to answer within the time limit.
   *
   * @param team The team that failed to answer.
   */
  default void onAnswerTimerExpired(Team team) {
  }

  /**
   * Called immediately after a team has successfully pressed the buzzer.
   *
   * @param team            The team that buzzed.
   * @param secondsToAnswer The amount of time given to answer.
   */
  default void onTeamBuzzed(Team team, int secondsToAnswer) {
  }

  /**
   * Called after an answer has been submitted and validated.
   *
   * @param team          The team that answered.
   * @param correct       True if the answer was correct, false otherwise.
   * @param pointsAwarded The points added (or subtracted) from the score.
   * @param newTeamScore  The updated total score of the team.
   */
  default void onAnswerResult(Team team, boolean correct, int pointsAwarded, int newTeamScore) {
  }

  /**
   * Called whenever a team's score changes (e.g., due to penalties or correct answers).
   *
   * @param team     The team whose score changed.
   * @param newScore The new total score.
   * @param delta    The amount changed (positive or negative).
   */
  default void onScoreChanged(Team team, int newScore, int delta) {
  }

  /**
   * Called when a team is added to the game.
   * This ensures the UI can update team displays via callbacks instead of manual management.
   *
   * @param team The team that was added.
   */
  default void onTeamAdded(Team team) {
  }

  /**
   * Called when a team is removed from the game.
   *
   * @param team The team that was removed.
   */
  default void onTeamRemoved(Team team) {
  }

  /**
   * Called when all teams are cleared (e.g., during reset).
   */
  default void onTeamsCleared() {
  }

  /**
   * Called when an internal error occurs or an invalid action was attempted.
   *
   * @param message Error description.
   */
  default void onError(String message) {
  }
}