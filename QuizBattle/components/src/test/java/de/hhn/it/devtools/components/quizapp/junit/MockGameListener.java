package de.hhn.it.devtools.components.quizapp.junit;

import de.hhn.it.devtools.apis.quizapp.Question;
import de.hhn.it.devtools.apis.quizapp.Team;
import de.hhn.it.devtools.apis.quizapp.enums.GameState;
import de.hhn.it.devtools.apis.quizapp.interfaces.GameListener;

public class MockGameListener implements GameListener {
  boolean onGameStateChangedCalled = false;
  boolean onGameReadyCalled = false;
  boolean onGameFinishedCalled = false;
  boolean onQuestionPresentedCalled = false;
  boolean onBuzzerTimerTickCalled = false;
  boolean onBuzzerTimerExpiredCalled = false;
  boolean onAnswerTimerTickCalled = false;
  boolean onAnswerTimerExpiredCalled = false;
  boolean onTeamBuzzedCalled = false;
  boolean onAnswerResultCalled = false;
  boolean onScoreChangedCalled = false;
  boolean onErrorCalled = false;

  GameState lastGameState;
  int totalQuestions;
  Team winningTeam;
  int winnerScore;
  Question presentedQuestion;
  int questionNumber;
  int secondsRemaining;
  Team buzzedTeam;
  boolean answerCorrect;
  int pointsAwarded;
  String errorMessage;

  @Override
  public void onGameStateChanged(GameState newState) {
    onGameStateChangedCalled = true;
    lastGameState = newState;
  }

  @Override
  public void onGameReady(int totalQuestions) {
    onGameReadyCalled = true;
    this.totalQuestions = totalQuestions;
  }

  @Override
  public void onGameFinished(Team winningTeam, int winnerScore) {
    onGameFinishedCalled = true;
    this.winningTeam = winningTeam;
    this.winnerScore = winnerScore;
  }

  @Override
  public void onQuestionPresented(Question question, int questionNumber, int totalQuestions) {
    onQuestionPresentedCalled = true;
    this.presentedQuestion = question;
    this.questionNumber = questionNumber;
  }

  @Override
  public void onBuzzerTimerTick(int secondsRemaining) {
    onBuzzerTimerTickCalled = true;
    this.secondsRemaining = secondsRemaining;
  }

  @Override
  public void onBuzzerTimerExpired() {
    onBuzzerTimerExpiredCalled = true;
  }

  @Override
  public void onAnswerTimerTick(int secondsRemaining) {
    onAnswerTimerTickCalled = true;
    this.secondsRemaining = secondsRemaining;
  }

  @Override
  public void onAnswerTimerExpired(Team team) {
    onAnswerTimerExpiredCalled = true;
  }

  @Override
  public void onTeamBuzzed(Team team, int secondsToAnswer) {
    onTeamBuzzedCalled = true;
    this.buzzedTeam = team;
  }

  @Override
  public void onAnswerResult(Team team, boolean correct, int pointsAwarded, int newTeamScore) {
    onAnswerResultCalled = true;
    this.answerCorrect = correct;
    this.pointsAwarded = pointsAwarded;
  }

  @Override
  public void onScoreChanged(Team team, int newScore, int delta) {
    onScoreChangedCalled = true;
  }

  @Override
  public void onError(String message) {
    onErrorCalled = true;
    this.errorMessage = message;
  }
}
