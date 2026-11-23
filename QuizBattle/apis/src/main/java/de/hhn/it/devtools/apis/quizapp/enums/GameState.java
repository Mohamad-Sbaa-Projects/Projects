package de.hhn.it.devtools.apis.quizapp.enums;

/**
 * Represents the various states of the quiz game lifecycle.
 * The game transitions sequentially through these states for each question.
 */
public enum GameState {
  /**
   * The initial state where teams are added and the game is configured.
   * No questions are active.
   */
  LOBBY,

  /**
   * A question is currently being displayed to the players.
   * No interaction (buzzing) is allowed yet.
   */
  PRESENTING_QUESTION,

  /**
   * The buzzer is unlocked. Teams can attempt to buzz in to answer.
   * A timer counts down the available time to buzz.
   */
  WAITING_FOR_BUZZER,

  /**
   * A team has successfully buzzed and must now provide an answer.
   * All other inputs are blocked. A timer counts down the answer time.
   */
  WAITING_FOR_ANSWER,

  /**
   * The answer has been evaluated (correct/wrong) or a timeout occurred.
   * The result is displayed before moving to the next question or ending the game.
   */
  SHOWING_RESULT,

  /**
   * The game has finished. The winner is announced.
   * From here, the game can be reset to the {@link #LOBBY}.
   */
  GAME_OVER
}