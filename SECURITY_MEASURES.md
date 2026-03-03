# Security Measures

This document outlines the key security measures implemented in this application to protect against common web vulnerabilities.

## Authentication and Session Management

*   **JWT-based Authentication:** The application uses JSON Web Tokens (JWT) for authentication. After a user successfully logs in, a JWT is generated and stored in a secure, HTTP-only cookie. This token is then used to authenticate subsequent requests.
*   **Route Protection:** The `protect` middleware is used to secure routes that require authentication. This middleware checks for the presence of a valid JWT in either the `Authorization` header or the request cookies. If a valid token is not found, the request is rejected.
*   **Password Hashing:** The `bcryptjs` library is used to hash user passwords before they are stored in the database. This prevents attackers from accessing user passwords in plain text, even if they gain access to the database.

## Secure Headers

The application uses the `helmet` library to set various security-related HTTP headers:

*   **Content Security Policy (CSP):** A strict CSP is implemented to prevent Cross-Site Scripting (XSS) and other code injection attacks. The CSP restricts the sources from which scripts, styles, fonts, and other resources can be loaded.
*   **X-Frame-Options:** The `X-Frame-Options` header is set to `DENY` to prevent clickjacking attacks.
*   **Referrer-Policy:** The `Referrer-Policy` header is set to `strict-origin-when-cross-origin` to control the information sent in the `Referer` header.
*   **HTTP Strict Transport Security (HSTS):** The `Strict-Transport-Security` header is set to enforce the use of HTTPS.

## Other Security Measures

*   **HTTPS Redirect:** In a production environment, all HTTP requests are automatically redirected to HTTPS.
*   **Rate Limiting:** The `express-rate-limit` library is used to limit the number of requests that can be made to the API. This helps to prevent brute-force and denial-of-service attacks.
*   **Input Validation:** The `express-validator` library is used to validate and sanitize user input. This helps to prevent a variety of attacks, including SQL injection and XSS.
*   **CORS:** Cross-Origin Resource Sharing (CORS) is configured to restrict which origins can access the API.
