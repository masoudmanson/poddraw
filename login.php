<?php
include 'config.php';
session_start();

if(isset($_SESSION['access_token'])){
    header("Location: {$config['home']}index.php");
}
else {
    header("Location: {$config['sso']}authorize/?client_id={$config['client_id']}&response_type=code&redirect_uri={$config['home']}return.php&scope=profile email");
}