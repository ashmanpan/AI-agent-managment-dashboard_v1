// Main Application Entry Point
const App = {
    // Initialize the application
    async init() {
        console.log('Initializing Agent Management Portal...');

        // Initialize data store (demo mode)
        DataStore.init();

        // Check for existing auth session
        const isLoggedIn = Auth.init();

        if (isLoggedIn) {
            this.showApp();
        } else {
            this.showLogin();
        }
    },

    // Show login screen
    showLogin() {
        document.getElementById('login-screen').classList.remove('hidden');
        document.getElementById('app-container').classList.add('hidden');

        // Setup auth tab switching
        this.setupAuthTabs();

        // Setup login form handler
        const loginForm = document.getElementById('login-form');
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleLogin();
        });

        // Setup signup form handler
        const signupForm = document.getElementById('signup-form');
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleSignup();
        });
    },

    // Setup auth tabs
    setupAuthTabs() {
        const tabs = document.querySelectorAll('.auth-tab');
        const loginForm = document.getElementById('login-form');
        const signupForm = document.getElementById('signup-form');

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // Update active tab
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                // Show/hide forms
                if (tab.dataset.tab === 'login') {
                    loginForm.classList.remove('hidden');
                    signupForm.classList.add('hidden');
                } else {
                    loginForm.classList.add('hidden');
                    signupForm.classList.remove('hidden');
                }
            });
        });
    },

    // Handle login
    async handleLogin() {
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;

        // Validate Cisco email domain
        if (!email.endsWith('@cisco.com')) {
            alert('Only @cisco.com email addresses are allowed.');
            return;
        }

        const result = await Auth.login(email, password);

        if (result.success) {
            this.showApp();
        } else {
            alert(result.error || 'Login failed. Please try again.');
        }
    },

    // Handle signup
    async handleSignup() {
        const name = document.getElementById('signup-name').value.trim();
        const email = document.getElementById('signup-email').value.trim();
        const password = document.getElementById('signup-password').value;
        const role = document.getElementById('signup-role').value;

        // Validate Cisco email domain
        if (!email.endsWith('@cisco.com')) {
            alert('Only @cisco.com email addresses are allowed.');
            return;
        }

        const result = await Auth.signup(name, email, password, role);

        if (result.success) {
            alert('Account created successfully! Welcome, ' + result.user.name);
            this.showApp();
        } else {
            alert(result.error || 'Signup failed. Please try again.');
        }
    },

    // Show main application
    async showApp() {
        document.getElementById('login-screen').classList.add('hidden');
        document.getElementById('app-container').classList.remove('hidden');

        // Initialize UI
        await UI.init();

        // Initialize Chatbot
        Chatbot.init();

        console.log('Agent Management Portal initialized successfully');
    }
};

// Start the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

// Export for global access
window.App = App;
