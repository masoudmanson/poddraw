<?php
include "config.php";
session_start();
include "layouts/header.php";

if(isset($_GET['token']) && strlen($_GET['token']) > 0) {
    $_SESSION['access_token'] = $_GET['token'];
}

if (isset($_SESSION['access_token'])) {
    header("Location: {$config['home']}webapp/index.php");
} else {
    ?>
    <div id="body-overlay">
        <div class="bg"></div>
        <div class="bg2"></div>
        <div id="content">
            <h1 id="big-title">PodDraw</h1>
            <p>PodDraw is a free online diagramming application and flowchart maker . You can use it to create UML, entity relationship, org charts, BPMN and BPM, database schema and networks. Also possible are telecommunication network, workflow, flowcharts, maps overlays and GIS, electronic circuit and social network diagrams.</p>
            <a id="pod-login" href="login.php">Log in with SSO</a>
        </div>
    </div>
    <div id="fanap-logo"></div>
    <?php
}

include "layouts/footer.php";
