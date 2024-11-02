// login.js
class LoginManager {
    constructor() {
        this.phoneNumber = '';
        this.pin = '';
        this.isTermsAccepted = false;
        this.apiUrl = 'https://bridge-test-api.herokuapp.com';
        
        this.initializeElements();
        this.initializePinInput();
        this.setupEventListeners();
    }

    initializeElements() {
        this.elements = {
            phoneInput: document.getElementById('phoneNumber'),
            loginButton: document.getElementById('loginButton'),
            termsCheckbox: document.getElementById('termsCheckbox'),
            phoneError: document.getElementById('phoneError'),
            pinError: document.getElementById('pinError'),
            termsError: document.getElementById('termsError')
        };
    }

    initializePinInput() {
        this.pinInput = new PincodeInput('#pin', {
            count: 4,
            secure: true,
            previewDuration: 200,
            onInput: (value) => {
                this.pin = value;
                this.validateForm();
            }
        });
    }

    setupEventListeners() {
        this.elements.phoneInput.addEventListener('input', (e) => {
            this.phoneNumber = e.target.value;
            this.validateForm();
        });

        this.elements.termsCheckbox.addEventListener('change', (e) => {
            this.isTermsAccepted = e.target.checked;
            this.validateForm();
        });

        this.elements.loginButton.addEventListener('click', () => this.handleLogin());
    }

    validateForm() {
        let isValid = true;
        this.clearErrors();

        // Validate phone number
        if (!/^[0-9]{10}$/.test(this.phoneNumber)) {
            this.elements.phoneError.textContent = 'Please enter a valid 10-digit phone number';
            isValid = false;
        }

        // Validate PIN
        if (this.pin.length !== 4) {
            this.elements.pinError.textContent = 'Please enter a 4-digit PIN';
            isValid = false;
        }

        // Validate terms acceptance
        if (!this.isTermsAccepted) {
            this.elements.termsError.textContent = 'Please accept the terms and conditions';
            isValid = false;
        }

        this.elements.loginButton.disabled = !isValid;
        return isValid;
    }

    clearErrors() {
        this.elements.phoneError.textContent = '';
        this.elements.pinError.textContent = '';
        this.elements.termsError.textContent = '';
    }

    async handleLogin() {
        try {
            const response = await fetch(`${this.apiUrl}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    phone: this.phoneNumber,
                    pin: this.pin
                })
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('jwt', data.token);
                window.location.href = '/index.html';
            } else {
                throw new Error(data.message || 'Login failed');
            }
        } catch (error) {
            this.showError('Login failed: ' + error.message);
        }
    }

    showError(message) {
        // You can implement a more sophisticated error display mechanism
        alert(message);
    }
}

// Initialize login manager when document is ready
document.addEventListener('DOMContentLoaded', () => {
    const loginManager = new LoginManager();
});

// Prevent going back to login page if already logged in
if (localStorage.getItem('jwt')) {
    window.location.href = '/index.html';
}