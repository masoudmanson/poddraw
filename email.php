<?php
if (isset($_POST["email"])) {
    $to_email = 'masoudmanson@gmail.com';
    $from_email = $_POST["email"];
    $subject = 'Poddraw Feedback';
    $body = $_POST["body"];
    $headers = "MIME-Version: 1.0" . "\r\n";
    $headers .= 'From: <'.$from_email.'>' . "\r\n";

    if (mail($to_email, $subject, $body, $headers)) {
        echo("Email successfully sent to $to_email...");
    } else {
        echo("Email sending failed...");
    }
}
?>
