package de.hhn.it.devtools.apis.quizapp;

import java.util.Objects;

/**
 * Represents a team participating in the quiz.
 *
 * @param id    Unique identifier for the team.
 * @param name  Display name of the team.
 * @param color Visual color representation (e.g. Hex Code).
 */
public record Team(int id, String name, String color) {
  /**
   * Canonical constructor with validation.
   *
   * @param id    Unique ID.
   * @param name  Team name (must not be null or blank).
   * @param color Team color (defaults to black if null).
   */
  public Team {
    Objects.requireNonNull(name);
    if (name.isBlank()) {
      throw new IllegalArgumentException("name required");
    }
    if (color == null) {
      color = "#000000";
    }
  }

  /**
   * Creates a copy of this team with a new ID.
   *
   * @param newId The new ID to assign.
   * @return A new Team instance.
   */
  public Team withId(int newId) {
    return new Team(newId, name, color);
  }

  @Override
  public String toString() {
    return name;
  }
}