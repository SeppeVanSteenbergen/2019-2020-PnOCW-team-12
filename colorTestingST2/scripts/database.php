<?php
    $serverName = "localhost";
    $username = "peno";
    $password = "peno";
    $dbName = "peno_st2";

    $conn = new mysqli($serverName, $username, $password, $dbName);

    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error);
    }
    $light = json_decode($_POST["light"]);
    $method = json_decode($_POST["method"]);
    $expColor = json_decode($_POST["Color"]);
    $detColor = json_decode($_POST["colorName"]);
    $colorSpace = json_decode($_POST["colorSpace"]);
    $detColor1 = json_decode($_POST["colorValue1"]);
    $detColor2 = json_decode($_POST["colorValue2"]);
    $detColor3 = json_decode($_POST["colorValue3"]);
    $distance = json_decode($_POST["distance"]);
    $coverage = json_decode($_POST["coverage"]);
    $environment = json_decode($_POST["Environment"]);
    $brightness = json_decode($_POST["brightness"]);

    $sql = "INSERT INTO `onecolor`(`ExpColor`, `DetColor`, `ColorSpace`, `DetColor1`, `DetColor2`, `DetColor3`, `Distance`, `Coverage`, `Environment`, `Light`, `Brightness`)
    VALUES ('$expColor', '$detColor', '$colorSpace', '$detColor1', '$detColor2', '$detColor3', '$distance', '$coverage', '$environment', '$light', '$brightness')";

    if ($conn->query($sql) === TRUE) {
        $conn->close();
        header('Location: ' . $_SERVER['HTTP_REFERER']);
    } else {
        echo "Error: " . $sql . "<br>" . $conn->error;
    }

?>