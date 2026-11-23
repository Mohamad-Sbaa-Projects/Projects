package de.hhn.it.devtools.apis.quizapp;

import java.util.Objects;

/**
 * Represents a category for quiz questions.
 * Categories can be hierarchical: A category can be a top-level category (e.g., "Science")
 * or a specific question pack (e.g., "Physics") belonging to a parent category.
 */
public final class Category {
  private final String id;
  private final String name;
  private final String parentId;

  /**
   * Creates a new top-level category.
   *
   * @param id   The unique identifier for this category.
   * @param name The human-readable display name.
   */
  public Category(String id, String name) {
    this(id, name, null);
  }

  /**
   * Creates a new category or question pack.
   *
   * @param id       The unique identifier for this category.
   * @param name     The human-readable display name.
   * @param parentId The ID of the parent category, or null if this is a top-level category.
   */
  public Category(String id, String name, String parentId) {
    this.id = Objects.requireNonNull(id);
    this.name = Objects.requireNonNull(name);
    this.parentId = parentId;
  }

  /**
   * Getter Method for id
   *
   * @return The unique identifier of the category.
   */
  public String getId() {
    return id;
  }

  /**
   * Getter method for name
   *
   * @return The display name of the category.
   */
  public String getName() {
    return name;
  }

  /**
   * Getter method for parent id
   *
   * @return The ID of the parent category, or {@code null} if this is a top-level category.
   */
  public String getParentId() {
    return parentId;
  }

  /**
   * Checks if this category is a top-level category (has no parent).
   *
   * @return {@code true} if it's a top-level category, {@code false} if it's a sub-category (pack).
   */
  public boolean isTopLevel() {
    return parentId == null;
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) {
      return true;
    }
    if (!(o instanceof Category c)) {
      return false;
    }
    return id.equals(c.id);
  }

  @Override
  public int hashCode() {
    return Objects.hash(id);
  }

  @Override
  public String toString() {
    return name;
  }
}