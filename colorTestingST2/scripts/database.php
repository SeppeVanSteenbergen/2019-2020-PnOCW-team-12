<?php
    $serverName = "localhost";
    $username = "peno";
    $password = "peno";
    $dbName = "peno_st2";

    $conn = new mysqli($serverName, $username, $password, $dbName);

    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error);
    }

    $expColor = $_GET["Color"];
    $detColor = $_GET["colorName"];
    $colorSpace = $_GET["colorSpace"];
    $detColor1 = $_GET["colorValue1"];
    $detColor2 = $_GET["colorValue2"];
    $detColor3 = $_GET["colorValue3"];
    $distance = $_GET["distance"];
    $coverage = $_GET["coverage"];
    $environment = $_GET["Environment"];

    $sql = "INSERT INTO `onecolor`(`ExpColor`, `DetColor`, `ColorSpace`, `DetColor1`, `DetColor2`, `DetColor3`, `Distance`, `Coverage`, `Environment`)
    VALUES ('$expColor', '$detColor', '$colorSpace', '$detColor1', '$detColor2', '$detColor3', '$distance', '$coverage', '$environment')";

    if ($conn->query($sql) === TRUE) {
        $conn->close();
        header('Location: ' . $_SERVER['HTTP_REFERER']);
    } else {
        echo "Error: " . $sql . "<br>" . $conn->error;
    }

?>