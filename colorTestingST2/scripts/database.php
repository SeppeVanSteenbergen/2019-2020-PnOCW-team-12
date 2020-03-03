<?php
    $serverName = "localhost";
    $username = "peno";
    $password = "peno";
    $dbName = "peno_st2";

    $conn = new mysqli($serverName, $username, $password, $dbName);

    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error);
    }

    $expColor = json_decode($_POST["expColor"]);
    $foundColor = json_decode($_POST["foundColor"]);
    $detColor1 = json_decode($_POST["colorValue1"]);
    $detColor2 = json_decode($_POST["colorValue2"]);
    $detColor3 = json_decode($_POST["colorValue3"]);
    $colorSpace = json_decode($_POST["colorSpace"]);
    $distance = json_decode($_POST["distance"]);
    $coverageExp = json_decode($_POST["coverageExp"]);
    $coverageFound = json_decode($_POST["coverageFound"]);
    $environment = json_decode($_POST["environment"]);
    $light = json_decode($_POST["light"]);
    $brightness = json_decode($_POST["brightness"]);

    $sql = "INSERT INTO `onecolor`(`ExpColor`, `DetColor`, `ColorSpace`, `DetColor1`, `DetColor2`, `DetColor3`,
                                    `Distance`, `CoverageExpColor`, `CoverageDetectedColor`, `Environment`, `Light`, `Brightness`)
    VALUES ('$expColor','$foundColor','$colorSpace','$detColor1','$detColor2','$detColor3',
            '$distance','$coverageExp','$coverageFound','$environment','$light','$brightness')";

    if ($conn->query($sql) === TRUE) {
        $conn->close();
        header('Location: ' . $_SERVER['HTTP_REFERER']);
    } else {
        echo "Error: " . $sql . "<br>" . $conn->error;
    }

?>