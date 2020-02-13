<?php
    $serverName = "localhost";
    $username = "peno";
    $password = "peno";

    $conn = new mysqli($serverName, $username, $password);

    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error);
    }
?>