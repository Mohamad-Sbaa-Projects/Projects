package de.hhn.it.devtools.javafx;

import de.hhn.it.devtools.javafx.quizapp.controllers.QuizBattleControllerV3;
import javafx.application.Application;
import javafx.fxml.FXMLLoader;
import javafx.scene.Parent;
import javafx.scene.Scene;
import javafx.stage.Stage;

/** Entry point for the standalone QuizBattle application. */
public class Main extends Application {

    private QuizBattleControllerV3 controller;

    public static void main(String[] args) {
        launch(args);
    }

    @Override
    public void start(Stage stage) throws Exception {
        FXMLLoader loader = new FXMLLoader(getClass().getResource("/fxml/quizapp/QuizBattleV3.fxml"));
        Parent root = loader.load();
        controller = loader.getController();

        stage.setTitle("QuizBattle");
        stage.setScene(new Scene(root, 1280, 760));
        stage.setMinWidth(1024);
        stage.setMinHeight(700);
        stage.show();
    }

    @Override
    public void stop() {
        if (controller != null) {
            controller.shutdown();
        }
    }
}
