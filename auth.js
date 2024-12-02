document.addEventListener('DOMContentLoaded', () => {
 
    const clearMessages = (formId) => {
        document.getElementById(formId + 'Error').textContent = '';
        document.getElementById(formId + 'Success').textContent = '';
    };

    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            clearMessages('signup');

            const username = document.getElementById('username').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            try {
                const response = await fetch('http://localhost:3000/public/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, email, password })
                });

                if (response.ok) {
                    const data = await response.json();
                    document.getElementById('signupSuccess').textContent = 'Signup successful! Redirecting to login page...';
                    setTimeout(() => {
                        window.location.href = 'login.html';
                    }, 2000);
                } else {
                    const errorData = await response.json();
                    document.getElementById('signupError').textContent = errorData.message || 'Something went wrong';
                }
            } catch (error) {
                console.error('Signup request failed:', error);
                document.getElementById('signupError').textContent = 'An error occurred during signup. Please try again.';
            }
        });
    }

    // Login functionality ka code hai ye 
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            clearMessages('login');

            const username = document.getElementById('username').value; //  email ko  username keliye lengy //
            const password = document.getElementById('password').value;

            try {
                const response = await fetch('http://localhost:3000/public/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });

                if (response.ok) {
                    const data = await response.json();

                    if (data.token) {
                        localStorage.setItem('token', data.token); // Store the JWT token in localStorage
                        document.getElementById('loginSuccess').textContent = 'Login successful! Redirecting to dashboard...';
                        setTimeout(() => {
                            window.location.href = 'dashboard.html';
                        }, 2000);
                    } else {
                        document.getElementById('loginError').textContent = 'No token received from server.';
                    }
                } else {
                    const errorData = await response.json();
                    document.getElementById('loginError').textContent = errorData.message || 'Something went wrong';
                }
            } catch (error) {
                console.error('Login request failed:', error);
                document.getElementById('loginError').textContent = 'An error occurred during login. Please try again.';
            }
        });
    }

    // Redirect to dashboard if already logged in
    if (localStorage.getItem('token')) {
        window.location.href = 'dashboard.html';
    }
});
