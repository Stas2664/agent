<?php
if ($_POST) {
    $name = strip_tags(trim($_POST["name"]));
    $phone = strip_tags(trim($_POST["phone"]));
    $email = filter_var(trim($_POST["email"]), FILTER_SANITIZE_EMAIL);
    $message = strip_tags(trim($_POST["message"]));

    // Validate form data
    if (empty($name) || empty($phone) || empty($message) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo "Пожалуйста, заполните все поля корректно.";
        exit;
    }

    // Email settings
    $recipient = "elitstroyservice123@bk.ru";
    $subject = "Новая заявка с сайта Home Service Rostov";

    // Email content
    $email_content = "Имя: $name\n";
    $email_content .= "Телефон: $phone\n";
    $email_content .= "Email: $email\n\n";
    $email_content .= "Сообщение:\n$message\n";

    // Email headers
    $email_headers = "From: $name <$email>\r\n";
    $email_headers .= "Reply-To: $email\r\n";
    $email_headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

    // Send email
    if (mail($recipient, $subject, $email_content, $email_headers)) {
        http_response_code(200);
        echo "Спасибо! Ваша заявка отправлена. Мы свяжемся с вами в ближайшее время.";
    } else {
        http_response_code(500);
        echo "Произошла ошибка при отправке сообщения. Попробуйте позже.";
    }
} else {
    http_response_code(403);
    echo "Доступ запрещен.";
}
?>