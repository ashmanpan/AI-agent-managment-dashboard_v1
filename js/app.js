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

        // Setup login form handler
        const loginForm = document.getElementById('login-form');
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleLogin();
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
