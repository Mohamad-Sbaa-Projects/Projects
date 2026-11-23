module devtools.javafx {
    requires org.slf4j;
    requires devtools.apis;
    requires devtools.components;
    requires javafx.controls;
    requires javafx.fxml;

    exports de.hhn.it.devtools.javafx;
    opens de.hhn.it.devtools.javafx.quizapp.controllers to javafx.fxml;
}
