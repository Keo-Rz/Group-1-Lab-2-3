document.addEventListener("DOMContentLoaded", function() {
    document.getElementById('sign-up-button').addEventListener('click', function() {
        // Hide the signup section
        document.querySelector('.signup').style.display = 'none';

        // Show the signup form
        document.getElementById('signup-form').style.display = 'flex';
    });

    document.getElementById('back-button').addEventListener('click', function() {
        // Show the signup section
        document.querySelector('.signup').style.display = 'flex';

        // Hide the signup form
        document.getElementById('signup-form').style.display = 'none';

        // Clear all fields
        clearSignupFields();
    });

    document.getElementById('signup-form-content').addEventListener('submit', function(event) {
        event.preventDefault();

        const recaptchaResponse = grecaptcha.getResponse();

        // Check if reCAPTCHA is successfully verified
        if (!recaptchaResponse) {
            alert("Please complete the CAPTCHA verification.");
            return;
        }

        // Fetch values from the signup form
        const firstname = document.getElementById('signup-first-name').value.trim();
        const lastname = document.getElementById('signup-last-name').value.trim();
        const email = document.getElementById('signup-email').value.trim();
        const username = document.getElementById('signup-username').value.trim();
        const password = document.getElementById('signup-password').value.trim();
        const confirmpassword = document.getElementById('signup-confirm-password').value.trim();
        const agreeterms = document.getElementById('signup-terms').checked;

        // Password requirements
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

        // Validation
        if (!firstname || !lastname || !email || !username || !password || !confirmpassword || !agreeterms) {
            alert("Please fill in all fields and agree to the terms and conditions.");
            return;
        }

        if (password !== confirmpassword) {
            alert("Passwords do not match.");
            // Clear password and confirm password fields
            clearPasswordFields();
            return;
        }

        if (username.length < 5) {
            alert("Username must be at least 5 characters long.");
            return;
        }

        if (!isValidUsername(username)) {
            alert("Invalid username. Please use letters and numbers only.");
            return;
        }

        if (isUsernameTaken(username)) {
            alert("Username already exists. Please choose another one.");
            return;
        }

        if (!passwordRegex.test(password)) {
            alert("Password must be at least 8 characters long and include a combination of lowercase and uppercase letters, special characters, and numbers.");
            // Clear password field
            clearPasswordFields();
            return;
        }

        // Save user account locally
        const user = {
            firstname,
            lastname,
            email,
            username,
            password
        };

        // Get existing users or initialize empty array
        let users = JSON.parse(localStorage.getItem('users')) || [];
        // Add new user
        users.push(user);
        // Save updated users array
        localStorage.setItem('users', JSON.stringify(users));

        // Alert sign up successful
        alert("Sign up successful!");

        // Go back to the signup section
        document.querySelector('.signup').style.display = 'flex';
        document.getElementById('signup-form').style.display = 'none';

        // Clear signup form fields
        clearSignupFields();
    });

    document.getElementById('log-in-button').addEventListener('click', function() {
        // Fetch values from the login form
        const username = document.getElementById('login-username').value.trim();
        const password = document.getElementById('login-password').value.trim();

        // Validation
        if (!username && !password) {
            alert("Please enter both username and password.");
            // Clear terms and conditions checkbox
            document.getElementById('login-terms').checked = false;
            return;
        }

        if (!username) {
            alert("Please enter your username.");
            // Clear terms and conditions checkbox
            document.getElementById('login-terms').checked = false;
            return;
        }

        if (!password) {
            alert("Please enter your password.");
            // Clear terms and conditions checkbox
            document.getElementById('login-terms').checked = false;
            return;
        }

        // Get existing users from local storage
        const users = JSON.parse(localStorage.getItem('users')) || [];

        // Find user by username and password
        const user = users.find(u => u.username === username && u.password === password);

        // Validation
        if (!user) {
            alert("Incorrect username or password. Please try again.");
            // Clear password field
            document.getElementById('login-password').value = '';
            // Clear terms and conditions checkbox
            document.getElementById('login-terms').checked = false;
            return;
        }

        // Alert login successful
        alert("Login successful!");
    });
});

function clearSignupFields() {
    document.getElementById('signup-first-name').value = '';
    document.getElementById('signup-last-name').value = '';
    document.getElementById('signup-email').value = '';
    document.getElementById('signup-username').value = '';
    document.getElementById('signup-password').value = '';
    document.getElementById('signup-confirm-password').value = '';
    document.getElementById('signup-terms').checked = false;
}

function clearPasswordFields() {
    document.getElementById('signup-password').value = '';
    document.getElementById('signup-confirm-password').value = '';
}

function isValidUsername(username) {
    // Regular expression to match letters and numbers only
    const regex = /^[a-zA-Z0-9]+$/;
    return regex.test(username);
}

function isUsernameTaken(username) {
    // Get existing users from local storage
    const users = JSON.parse(localStorage.getItem('users')) || [];
    // Check if username already exists
    return users.some(user => user.username === username);
}

document.getElementById('signup-password').addEventListener('input', function() {
    const password = this.value.trim();
    const strengthIndicator = document.getElementById('password-strength');

    if (password.length === 0) {
        strengthIndicator.textContent = '';
        strengthIndicator.style.color = '';
        return;
    }

    const passwordStrength = calculatePasswordStrength(password);
    strengthIndicator.textContent = getPasswordStrengthLabel(passwordStrength);
    strengthIndicator.style.color = getPasswordStrengthColor(passwordStrength);
});

function calculatePasswordStrength(password) {
    // Length-based score
    let score = password.length;

    // Check if password contains only letters, only numbers, or just special characters
    const isOnlyLetters = /^[a-zA-Z]+$/.test(password);
    const isOnlyNumbers = /^\d+$/.test(password);
    const isOnlySpecialChars = /^[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]+$/.test(password);

    if (isOnlyLetters || isOnlyNumbers || isOnlySpecialChars) {
        return 'weak';
    }

    // Complexity-based score
    const hasLowercase = /[a-z]/.test(password);
    const hasUppercase = /[A-Z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChars = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);

    // Increment score for each complexity criteria met
    if (hasLowercase && hasUppercase && hasNumbers) score += 10;
    if (hasLowercase && hasUppercase && hasSpecialChars) score += 10;
    if (hasNumbers && hasSpecialChars) score += 10;

    // Uniqueness-based score (number of unique characters)
    const uniqueChars = new Set(password).size;
    score += uniqueChars * 5;

    // Normalize score to a percentage (0% to 100%)
    const normalizedScore = Math.min((score / 100) * 100, 100);

    // Password strength categories
    if (normalizedScore < 40) {
        return 'weak';
    } else if (normalizedScore < 70) {
        return 'moderate';
    } else {
        return 'strong';
    }
}

function getPasswordStrengthLabel(strength) {
    switch (strength) {
        case 'weak':
            return 'Weak password';
        case 'moderate':
            return 'Moderate password';
        case 'strong':
            return 'Strong password';
        default:
            return '';
    }
}

function getPasswordStrengthColor(strength) {
    switch (strength) {
        case 'weak':
            return 'red';
        case 'moderate':
            return 'yellow';
        case 'strong':
            return 'green';
        default:
            return '';
    }
}

// JavaScript to toggle password visibility
document.querySelectorAll('.toggle-login-password').forEach(function(icon) {
    const passwordInput = icon.previousElementSibling;

    // Initially set the eye icon to crossed-eye icon and hide the password
    passwordInput.setAttribute('type', 'password');
    icon.classList.add('fa-eye-slash');

    icon.addEventListener('click', function() {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);

        // Toggle eye icon classes
        if (type === 'password') {
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        } else {
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
    });
});

// JavaScript to toggle password visibility
document.querySelectorAll('.toggle-signup-password').forEach(function(icon) {
    const passwordInput = icon.previousElementSibling;

    // Initially set the eye icon to crossed-eye icon and hide the password
    passwordInput.setAttribute('type', 'password');
    icon.classList.add('fa-eye-slash');

    icon.addEventListener('click', function() {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);

        // Toggle eye icon classes
        if (type === 'password') {
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        } else {
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
    });
});

