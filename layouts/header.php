<!doctype html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport"
          content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <link rel="shortcut icon" href="webapp/favicon.ico">
    <link rel="apple-touch-icon" sizes="180x180" href="webapp/images/apple-touch-icon.png">
    <link rel="icon" type="image/png" sizes="32x32" href="webapp/images/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="webapp/images/favicon-16x16.png">
    <title>Pod Draw Login</title>
    <style>
        body {
            direction: ltr;
            font-family: "Iranian Sans","Tahoma";
        }
        h1 {
            color: #ff8000;
            font-size: 48px;
        }
        #body-overlay {
            position: fixed;
            width:100%;
            height: 100%;
            top: 0;
            left: 0;
            margin: 0;
            display: flex;
            align-items: center;
        }
        .bg {
            width: 100%;
            height: 100%;

            position: absolute;
            top: 0;
            left: 0;
            z-index: -1;

            background: url('images/bg1.jpg') no-repeat center center;
            background-size: cover;
            opacity: 0.9;
            transform: scale(1.1);
        }
        .bg2 {
            width: 100%;
            height: 100%;
            position: absolute;
            top: 0;
            left: 0;
            z-index: 0;
            background: url("images/overlay.svg") no-repeat center center;
            background-size: cover;
        }
        #content {
            margin: 0 0 0 100px;
            max-width: 600px;
            z-index: 10;
        }
        #big-title {
            margin-top: 0;
            margin-bottom: 100px;
        }
        #content p {
            line-height: 1.5em;
            color: #222;
        }
        #pod-login {
            background-color: #ff8000;
            padding: 12px 30px;
            color: #fff;
            text-decoration: none;
            -webkit-border-radius: 2px;
            -moz-border-radius: 2px;
            border-radius: 2px;
            margin: 80px 0 0;
            display: inline-block;
            -webkit-transition: all .3s;
            -moz-transition: all .3s;
            -ms-transition: all .3s;
            -o-transition: all .3s;
            transition: all .3s;
        }
        #pod-login:hover {
            background-color: #ff4040;
            -webkit-transform: scale(1.05);
            -moz-transform: scale(1.05);
            -ms-transform: scale(1.05);
            -o-transform: scale(1.05);
            transform: scale(1.05);
        }
        #fanap-logo {
            width: 80px;
            height:150px;
            position: fixed;
            bottom: 50px;
            right: 60px;
            background-image: url("images/logo.svg");
            background-size: contain;
            background-repeat: no-repeat;
        }
    </style>
</head>
<body dir="ltr">
