<?php
include 'config.php';
session_start();

$_SESSION['keylead_code']=$_GET['code'];

$url = $config['sso'].'/token/';
$ch = curl_init($url);

//TODO : remove this hit
curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);

$fields = "client_id=".$config['client_id']."&client_secret=".$config['client_secret']."&code=".$_GET['code']."&redirect_uri=".$config['home']."return.php&grant_type=authorization_code";

curl_setopt($ch, CURLOPT_POSTFIELDS, $fields);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/x-www-form-urlencoded'));

$response = curl_exec($ch);

if ($response === false) {
    throw new Exception(curl_error($ch), curl_errno($ch));
}

curl_close($ch);

$token = json_decode($response);
$_SESSION['access_token']= $token->access_token;
$_SESSION['refresh_token']= $token->refresh_token;

header("Location: {$config['home']}index.php");
