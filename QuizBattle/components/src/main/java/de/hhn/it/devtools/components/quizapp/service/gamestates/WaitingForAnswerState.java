package de.hhn.it.devtools.components.quizapp.service.gamestates;

import de.hhn.it.devtools.apis.quizapp.Team;
import de.hhn.it.devtools.apis.quizapp.enums.GameState;
import de.hhn.it.devtools.components.quizapp.service.QuizGameService;

/** Waiting-for-answer state: accepts an answer from the buzzing team within a time limit. */
public class WaitingForAnswerState extends GameStateHandler {
  public WaitingForAnswerState(QuizGameService game) {
    super(GameState.WAITING_FOR_ANSWER, game);
  }

  @Override
  public void onEnter() {
    int time = game.getCurrentQuestion().difficulty().getTimeToAnswer();
    game.startAnswerTimer(time);
  }

  @Override
  public void onExit() {
    game.stopTimer();
  }

  @Override
  public void handleAnswer(Team team, int index) {
    validate(team);
    game.stopTimer();
    game.evaluateMultipleChoiceAnswer(team, index);
    game.transitionTo(GameState.SHOWING_RESULT);
  }

  @Override
  public void handleAnswer(Team team, String answer) {
    validate(team);
    game.stopTimer();
    game.evaluateTextAnswer(team, answer);
    game.transitionTo(GameState.SHOWING_RESULT);
  }

  @Override
  public void handleTimerTick(int seconds) {
    game.notifyAnswerTimerTick(seconds);
  }

  @Override
  public void handleTimerExpired() {
    Team t = game.getBuzzingTeam();
    game.penalizeTeam(t);
    game.awardPointsToOpponent(t);
    game.notifyAnswerTimerExpired(t);
    game.transitionTo(GameState.SHOWING_RESULT);
  }

  private void validate(Team team) {
    if (!team.equals(game.getBuzzingTeam())) {
      throw new IllegalStateException("Not this team's turn");
    }
  }
}
