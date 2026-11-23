package de.hhn.it.devtools.components.quizapp.service;

import de.hhn.it.devtools.apis.quizapp.Category;
import de.hhn.it.devtools.apis.quizapp.Question;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * In-memory storage for {@link Category} and {@link Question} objects used by the quiz game.
 * Provides access to top-level categories, packs (subcategories), and questions by category.
 */
public class QuestionDatabase {
  private static final Logger logger = LoggerFactory.getLogger(QuestionDatabase.class);

  private final Map<Integer, Question> questionsById = new HashMap<>();
  private final Map<String, List<Question>> questionsByCategory = new HashMap<>();
  private final Map<String, Category> categoriesById = new HashMap<>();
  private final List<Category> topLevelCategories = new ArrayList<>();
  private final Map<String, List<Category>> packsByParent = new HashMap<>();
  private final Random random = new Random();

  public QuestionDatabase() {
  }

  /**
   * Returns all top-level categories.
   *
   * @return An unmodifiable list of top-level categories.
   */
  public List<Category> getTopLevelCategories() {
    return Collections.unmodifiableList(topLevelCategories);
  }

  /**
   * Returns all packs (sub-categories) for a given parent category.
   *
   * @param parentId The ID of the parent category.
   * @return An unmodifiable list of packs, or an empty list if none exist.
   */
  public List<Category> getPacks(String parentId) {
    return Collections.unmodifiableList(packsByParent.getOrDefault(parentId, List.of()));
  }

  /**
   * Returns the category with the given ID.
   *
   * @param id The category ID.
   * @return The category, or {@code null} if it is not known.
   */
  public Category getCategory(String id) {
    return categoriesById.get(id);
  }

  /**
   * Returns up to count questions from the given category.
   * Questions are randomly selected if more than count are available.
   *
   * @param categoryId The category ID.
   * @param count      The maximum number of questions to return.
   * @return A list containing up to count questions.
   */
  public List<Question> getQuestions(String categoryId, int count) {
    List<Question> available = questionsByCategory.getOrDefault(categoryId, new ArrayList<>());
    if (available.isEmpty() || available.size() <= count) {
      return new ArrayList<>(available);
    }
    List<Question> shuffled = new ArrayList<>(available);
    Collections.shuffle(shuffled, random);
    return shuffled.subList(0, count);
  }

  /**
   * Adds a question to a pack.
   *
   * @param packId   The pack/category ID.
   * @param question The question to add.
   * @throws IllegalArgumentException If packId does not exist.
   */
  public void addQuestion(String packId, Question question) {
    if (!categoriesById.containsKey(packId)) {
      throw new IllegalArgumentException("Pack not found: " + packId);
    }
    questionsById.put(question.id(), question);
    questionsByCategory.computeIfAbsent(question.category().getId(), k ->
            new ArrayList<>()).add(question);
  }

  /**
   * Registers the given categories in the database.
   *
   * @param categories The categories to register.
   */
  public void registerCategories(List<Category> categories) {
    for (Category cat : categories) {
      categoriesById.put(cat.getId(), cat);
      if (cat.isTopLevel()) {
        topLevelCategories.add(cat);
      } else {
        packsByParent
                .computeIfAbsent(cat.getParentId(), k -> new ArrayList<>())
                .add(cat);
      }
    }
    logger.info("Successfully registered {} categories", categoriesById.size());
  }

  /**
   * Returns a random subset of questions from all stored questions.
   *
   * @param count The maximum number of questions to return.
   * @return A list containing up to count randomly selected questions.
   */
  public List<Question> getRandomQuestions(int count) {
    List<Question> all = new ArrayList<>(questionsById.values());
    Collections.shuffle(all, random);
    return all.subList(0, Math.min(count, all.size()));
  }

  /**
   * Returns the number of questions available for a given category.
   *
   * @param categoryId The category ID.
   * @return The number of questions.
   */
  public int getQuestionCount(String categoryId) {
    List<Question> list = questionsByCategory.getOrDefault(categoryId, List.of());
    return list.size();
  }
}