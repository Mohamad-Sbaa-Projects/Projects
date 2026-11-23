package de.hhn.it.devtools.apis.quizapp.interfaces;

import de.hhn.it.devtools.apis.exceptions.IllegalParameterException;
import de.hhn.it.devtools.apis.quizapp.Category;
import de.hhn.it.devtools.apis.quizapp.Question;
import de.hhn.it.devtools.apis.quizapp.Team;
import java.util.List;

/**
 * Administrative interface for game setup and configuration before the game starts.
 * Allows adding teams, selecting categories, and configuring the question pool.
 */
public interface AdminGameService {

  /**
   * Adds a new team to the game.
   *
   * @param name  The display name of the team. Must not be null or empty.
   * @param color The color code (e.g., Hex String) representing the team.
   * @return The created Team object with a unique ID.
   * @throws IllegalParameterException If name is invalid or a team with that name already exists.
   */
  Team addTeam(String name, String color) throws IllegalParameterException;

  /**
   * Removes a team from the game by its unique ID.
   *
   * @param teamId The unique ID of the team to remove.
   * @throws IllegalParameterException If no team with the given ID exists.
   * @throws IllegalStateException     If teams cannot be changed during a running game.
   */
  void removeTeam(int teamId) throws IllegalParameterException, IllegalStateException;

  /**
   * Retrieves a list of all currently registered teams.
   *
   * @return An unmodifiable list of Team objects.
   */
  List<Team> getTeams();

  /**
   * Configures the game to use questions from a specific top-level category.
   *
   * @param category The category to select questions from.
   * @param count    The number of questions to play.
   * @throws IllegalParameterException If the category is invalid or there are not enough questions.
   * @throws IllegalStateException     If the game is currently running.
   */
  void configureGame(Category category, int count)
          throws IllegalParameterException, IllegalStateException;

  /**
   * Manually configures the game with a specific list of questions.
   *
   * @param questions The list of questions to use. Must not be null or empty.
   * @throws IllegalParameterException If the list is null or empty.
   * @throws IllegalStateException     If the game is currently running.
   */
  void configureGame(List<Question> questions)
          throws IllegalParameterException, IllegalStateException;

  /**
   * Configures the game to use questions from a specific question pack (sub-category).
   *
   * @param packId The ID of the question pack.
   * @param count  The number of questions to play.
   * @throws IllegalParameterException If the pack ID is invalid or there are not enough questions.
   * @throws IllegalStateException     If the game is currently running.
   */
  void configureGameFromPack(String packId, int count)
          throws IllegalParameterException, IllegalStateException;

  /**
   * Configures the game with a random selection of questions from all available categories.
   *
   * @param count The number of questions to play. Must be greater than 0.
   * @throws IllegalParameterException If the count is invalid (e.g., smaller or equal to 0).
   * @throws IllegalStateException     If the game is currently running.
   */
  void configureRandomGame(int count) throws IllegalParameterException, IllegalStateException;

  /**
   * Adds a new question to a specific question pack.
   *
   * @param packId   The ID of the question pack to add the question to.
   * @param question The question object to add. Must not be null.
   * @throws IllegalParameterException If the packId is invalid or the question is null/invalid.
   */
  void addQuestion(String packId, Question question) throws IllegalParameterException;

  /**
   * Returns the total number of questions available for a specific category or pack.
   *
   * @param categoryId The ID of the category or pack.
   * @return The number of available questions.
   */
  int getQuestionCount(String categoryId);

  /**
   * Loads category structure from external source.
   * Must be called BEFORE {@link #loadQuestions(List)}.
   *
   * @param categories List of categories to load. Must not be null.
   * @throws IllegalParameterException If categories are invalid or null.
   * @throws IllegalStateException     If game is running.
   */
  void loadCategories(List<Category> categories)
          throws IllegalParameterException, IllegalStateException;

  /**
   * Loads questions from an external source.
   * Called externally (e.g., by generators or file loaders).
   *
   * @param questions List of questions to load. Must not be null or empty.
   * @throws IllegalParameterException If questions are invalid or null.
   * @throws IllegalStateException     If questions are already loaded or game is running.
   */
  void loadQuestions(List<Question> questions)
          throws IllegalParameterException, IllegalStateException;

  /**
   * Retrieves all available top-level categories.
   *
   * @return An unmodifiable list of categories.
   */
  List<Category> getCategories();

  /**
   * Retrieves all specific question packs available under a parent category.
   *
   * @param parentCategoryId The ID of the parent category.
   * @return An unmodifiable list of sub-categories (packs).
   * @throws IllegalParameterException If the parentCategoryId is unknown.
   */
  List<Category> getPacks(String parentCategoryId) throws IllegalParameterException;

  /**
   * Resets the entire game state, clearing teams, scores, and selected questions.
   * Returns the game to the initial LOBBY state.
   */
  void resetGame();

  /**
   * Resets all team scores to 0 without removing teams or questions.
   * Only allowed in LOBBY state.
   *
   * @throws IllegalStateException If not LOBBY state
   */
  void resetScores() throws IllegalStateException;
}