package de.hhn.it.devtools.components.quizapp.junit;

import de.hhn.it.devtools.apis.exceptions.IllegalParameterException;
import de.hhn.it.devtools.apis.quizapp.Category;
import de.hhn.it.devtools.apis.quizapp.Question;
import de.hhn.it.devtools.apis.quizapp.interfaces.AdminGameService;
import de.hhn.it.devtools.components.quizapp.service.generator.QuizDataGenerator;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class QuizDataGeneratorTest {
  @Test
  void createDemoCategories_hasExpectedStructure() {
    List<Category> categories = QuizDataGenerator.createDemoCategories();

    // total count: 5 top-level + 9 packs = 14
    assertEquals(14, categories.size(), "Unexpected number of demo categories");

    // check some specific IDs
    assertTrue(categories.stream().anyMatch(c -> c.getId().equals("geography")));
    assertTrue(categories.stream().anyMatch(c -> c.getId().equals("geo-countries")));
    assertTrue(categories.stream().anyMatch(c -> c.getId().equals("pro-java")));

    // top-level vs pack (parentId null vs non-null)
    Category geography = categories.stream()
            .filter(c -> c.getId().equals("geography"))
            .findFirst()
            .orElseThrow();
    assertTrue(geography.isTopLevel());
    assertNull(geography.getParentId());

    Category geoCountries = categories.stream()
            .filter(c -> c.getId().equals("geo-countries"))
            .findFirst()
            .orElseThrow();
    assertFalse(geoCountries.isTopLevel());
    assertEquals("geography", geoCountries.getParentId());
  }

  @Test
  void createDemoQuestions_usesAllKnownCategories_andHasExpectedCounts() {
    List<Category> categories = QuizDataGenerator.createDemoCategories();
    List<Question> questions = QuizDataGenerator.createDemoQuestions(categories);

    // 8 packs * 20 questions each = 160
    assertEquals(160, questions.size(), "Unexpected number of demo questions");

    // all questions reference one of the known categories
    for (Question q : questions) {
      String catId = q.category().getId();
      assertTrue(
              categories.stream().anyMatch(c -> c.getId().equals(catId)),
              () -> "Unknown category in question: " + catId
      );
    }

    // a couple of sanity checks for content
    assertTrue(
            questions.stream().anyMatch(q -> q.text().contains("capital of Germany")),
            "Missing Germany capital question"
    );
    assertTrue(
            questions.stream().anyMatch(q -> q.text().contains("What does SQL stand for?")),
            "Missing SQL question"
    );
  }

  @Test
  void loadDemoData_callsServiceWithGeneratedCategoriesAndQuestions() throws Exception {
    FakeAdminGameService service = new FakeAdminGameService();

    QuizDataGenerator.loadDemoData(service);

    // loadDemoData must call loadCategories and loadQuestions with the generated data
    assertNotNull(service.loadedCategories);
    assertNotNull(service.loadedQuestions);

    assertEquals(14, service.loadedCategories.size(), "Service did not receive all categories");
    assertEquals(160, service.loadedQuestions.size(), "Service did not receive all questions");

    // ensure categories passed to questions are the same instances as in loadedCategories
    for (Question q : service.loadedQuestions) {
      Category inQuestion = q.category();
      assertTrue(
              service.loadedCategories.contains(inQuestion),
              () -> "Question category not in loaded categories: " + inQuestion.getId()
      );
    }
  }

  @Test
  void createDemoQuestions_throwsWhenCategoryMissing() {
    // use an empty category list so findCategory fails
    List<Category> empty = new ArrayList<>();

    IllegalArgumentException ex = assertThrows(
            IllegalArgumentException.class,
            () -> QuizDataGenerator.createDemoQuestions(empty)
    );
    assertTrue(ex.getMessage().contains("Category not found"));
  }

  static class FakeAdminGameService implements AdminGameService {
    List<Category> loadedCategories = new ArrayList<>();
    List<Question> loadedQuestions = new ArrayList<>();
    boolean resetCalled = false;

    @Override
    public void loadCategories(List categories) {
      this.loadedCategories = new ArrayList<>((List<Category>) categories);
    }

    @Override
    public void loadQuestions(List questions) {
      this.loadedQuestions = new ArrayList<>((List<Question>) questions);
    }

    @Override
    public de.hhn.it.devtools.apis.quizapp.Team addTeam(String name, String color)
            throws IllegalParameterException {
      throw new UnsupportedOperationException("not needed in this test");
    }

    @Override
    public void removeTeam(int teamId) {
      throw new UnsupportedOperationException("not needed in this test");
    }

    @Override
    public List getTeams() {
      throw new UnsupportedOperationException("not needed in this test");
    }

    @Override
    public void configureGame(Category category, int count) {
      throw new UnsupportedOperationException("not needed in this test");
    }

    @Override
    public void configureGameFromPack(String packId, int count) {
      throw new UnsupportedOperationException("not needed in this test");
    }

    @Override
    public void configureRandomGame(int count) {
      throw new UnsupportedOperationException("not needed in this test");
    }

    @Override
    public void configureGame(List questions) {
      throw new UnsupportedOperationException("not needed in this test");
    }

    @Override
    public List getCategories() {
      throw new UnsupportedOperationException("not needed in this test");
    }

    @Override
    public List getPacks(String parentCategoryId) {
      throw new UnsupportedOperationException("not needed in this test");
    }

    @Override
    public int getQuestionCount(String categoryId) {
      throw new UnsupportedOperationException("not needed in this test");
    }

    @Override
    public void addQuestion(String packId, Question question) {
      throw new UnsupportedOperationException("not needed in this test");
    }

    @Override
    public void resetGame() {
      resetCalled = true;
    }

    @Override
    public void resetScores() throws IllegalStateException {

    }
  }
}

