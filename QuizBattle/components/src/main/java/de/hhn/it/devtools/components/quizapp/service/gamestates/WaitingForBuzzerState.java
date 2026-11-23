package de.hhn.it.devtools.components.quizapp.service.gamestates;

import de.hhn.it.devtools.apis.quizapp.Team;
import de.hhn.it.devtools.apis.quizapp.enums.GameState;
import de.hhn.it.devtools.components.quizapp.service.QuizGameService;

/** Waiting-for-buzzer state: accepts buzzes and handles buzzer timeout/penalties. */
public class WaitingForBuzzerState extends GameStateHandler {
  public WaitingForBuzzerState(QuizGameService game) {
    super(GameState.WAITING_FOR_BUZZER, game);
  }

  @Override
  public void onEnter() {
    int time = game.getCurrentQuestion().difficulty().getTimeToBuzzer();
    game.startBuzzerTimer(time);
  }

  @Override
  public void onExit() {
    game.stopTimer();
  }

  @Override
  public void handleBuzz(Team team) {
    game.stopTimer();
    game.setBuzzingTeam(team);
    int answerTime = game.getCurrentQuestion().difficulty().getTimeToAnswer();
    game.notifyTeamBuzzed(team, answerTime);
    game.transitionTo(GameState.WAITING_FOR_ANSWER);
  }

  @Override
  public void handleTimerTick(int seconds) {
    game.notifyBuzzerTimerTick(seconds);
  }

  @Override
  public void handleTimerExpired() {
    game.penalizeBothTeams();
    game.notifyBuzzerTimerExpired();
    game.transitionTo(GameState.SHOWING_RESULT);
  }
}
