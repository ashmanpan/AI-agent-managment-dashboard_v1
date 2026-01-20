// Authentication Module
const Auth = {
    currentUser: null,

    // Initialize authentication
    init() {
        // Check for existing session
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
            return true;
        }
        return false;
    },

    // Login with Cognito (Demo mode uses local validation)
    async login(email, password) {
        if (CONFIG.demoMode) {
            return this.demoLoginEnhanced(email, password);
        }

        // Real Cognito authentication would go here
        try {
            const response = await fetch(`${CONFIG.api.baseUrl}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            if (!response.ok) {
                throw new Error('Authentication failed');
            }

            const data = await response.json();
            this.currentUser = data.user;
            localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
            localStorage.setItem('authToken', data.token);
            return { success: true, user: this.currentUser };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // Demo login for testing without AWS
    demoLogin(email, password) {
        // Demo users based on email
        const demoUsers = {
            'kpanse@cisco.com': {
                id: 'u1',
                name: 'Krishnaji Panse',
                email: 'kpanse@cisco.com',
                role: 'root-admin'
            },
            'rrajeshw@cisco.com': {
                id: 'u2',
                name: 'Rajeshwari BU',
                email: 'rrajeshw@cisco.com',
                role: 'tech-lead'
            },
            'rangunaw@cisco.com': {
                id: 'u3',
                name: 'Randy Gunawan',
                email: 'rangunaw@cisco.com',
                role: 'dev-test'
            },
            'utkarss2@cisco.com': {
                id: 'u4',
                name: 'Utkarsh Singh',
                email: 'utkarss2@cisco.com',
                role: 'dev-test'
            },
            'prpanchi@cisco.com': {
                id: 'u5',
                name: 'Pritesh Panchigar',
                email: 'prpanchi@cisco.com',
                role: 'dev-test'
            },
            'arjsawan@cisco.com': {
                id: 'u6',
                name: 'Arjun Sawant',
                email: 'arjsawan@cisco.com',
                role: 'sa'
            },
            'ddamani@cisco.com': {
                id: 'u7',
                name: 'Dhruv Damani',
                email: 'ddamani@cisco.com',
                role: 'ai-engineer'
            },
            'swarocha@cisco.com': {
                id: 'u8',
                name: 'Swaroop Chandre',
                email: 'swarocha@cisco.com',
                role: 'dev-test'
            },
            'bgangshe@cisco.com': {
                id: 'u9',
                name: 'Bhalchandra Gangshettiwar',
                email: 'bgangshe@cisco.com',
                role: 'dev-test'
            },
            'saumycha@cisco.com': {
                id: 'u10',
                name: 'Saumya Chaurasia',
                email: 'saumycha@cisco.com',
                role: 'dev-test'
            },
            'ssawantd@cisco.com': {
                id: 'u11',
                name: 'Saloni Sawantdesai',
                email: 'ssawantd@cisco.com',
                role: 'testing'
            },
            'akasyada@cisco.com': {
                id: 'u12',
                name: 'Akash Yadav',
                email: 'akasyada@cisco.com',
                role: 'ai-engineer'
            },
            'prasambr@cisco.com': {
                id: 'u13',
                name: 'Prathamesh Sambrekar',
                email: 'prasambr@cisco.com',
                role: 'ai-engineer'
            },
            'azakazi@cisco.com': {
                id: 'u14',
                name: 'Azaruddin Kazi',
                email: 'azakazi@cisco.com',
                role: 'dev-test'
            },
            'sabashai@cisco.com': {
                id: 'u15',
                name: 'Saba Shaikh',
                email: 'sabashai@cisco.com',
                role: 'dev-test'
            },
            'susinha2@cisco.com': {
                id: 'u16',
                name: 'Supriya Sinha',
                email: 'susinha2@cisco.com',
                role: 'dev-test'
            },
            // Demo accounts for each role
            'pm@cisco.com': {
                id: 'u17',
                name: 'Demo PM',
                email: 'pm@cisco.com',
                role: 'pm'
            },
            'sa@cisco.com': {
                id: 'u18',
                name: 'Demo SA',
                email: 'sa@cisco.com',
                role: 'sa'
            },
            'psa@cisco.com': {
                id: 'u19',
                name: 'Demo PSA',
                email: 'psa@cisco.com',
                role: 'psa'
            },
            'techlead@cisco.com': {
                id: 'u20',
                name: 'Demo Tech Lead',
                email: 'techlead@cisco.com',
                role: 'tech-lead'
            }
        };

        const user = demoUsers[email.toLowerCase()];

        if (user && password === 'demo123') {
            this.currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
            return { success: true, user: this.currentUser };
        }

        // Allow any cisco.com email with demo123 password
        if (email.endsWith('@cisco.com') && password === 'demo123') {
            const newUser = {
                id: 'u' + Date.now(),
                name: email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
                email: email.toLowerCase(),
                role: 'dev-test'
            };
            this.currentUser = newUser;
            localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
            return { success: true, user: this.currentUser };
        }

        return { success: false, error: 'Invalid email or password. Use demo123 as password.' };
    },

    // Logout
    logout() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        localStorage.removeItem('authToken');
    },

    // Get current user
    getUser() {
        return this.currentUser;
    },

    // Check if user has permission
    hasPermission(permission) {
        if (!this.currentUser) return false;
        const role = CONFIG.roles[this.currentUser.role];
        if (!role) return false;
        return role.permissions.includes('all') || role.permissions.includes(permission);
    },

    // Check if user can change status
    canChangeStatus() {
        if (!this.currentUser) return false;
        const role = CONFIG.roles[this.currentUser.role];
        return role?.canChangeStatus || false;
    },

    // Check if user can manage users
    canManageUsers() {
        if (!this.currentUser) return false;
        const role = CONFIG.roles[this.currentUser.role];
        return role?.canManageUsers || false;
    },

    // Check if user can delete data
    canDeleteData() {
        if (!this.currentUser) return false;
        const role = CONFIG.roles[this.currentUser.role];
        return role?.canDeleteData || false;
    },

    // Check if user is root admin
    isRootAdmin() {
        return this.currentUser?.role === 'root-admin';
    },

    // Get auth token
    getToken() {
        return localStorage.getItem('authToken');
    },

    // Signup - Register new user (Demo mode)
    async signup(name, email, password, role = 'dev-test') {
        // Validate cisco.com email
        if (!email.toLowerCase().endsWith('@cisco.com')) {
            return { success: false, error: 'Only @cisco.com email addresses are allowed.' };
        }

        // Validate password
        if (password.length < 6) {
            return { success: false, error: 'Password must be at least 6 characters.' };
        }

        // Check if user already exists
        const registeredUsers = this.getRegisteredUsers();
        if (registeredUsers[email.toLowerCase()]) {
            return { success: false, error: 'User already exists. Please login instead.' };
        }

        // Create new user
        const newUser = {
            id: 'u' + Date.now(),
            name: name.trim(),
            email: email.toLowerCase(),
            role: role,
            password: password, // In real app, this would be hashed
            createdAt: new Date().toISOString()
        };

        // Save to registered users
        registeredUsers[email.toLowerCase()] = newUser;
        localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));

        // Also add to persons in DataStore for assignment purposes
        if (typeof DataStore !== 'undefined') {
            const persons = DataStore.getAll('persons');
            const existingPerson = persons.find(p => p.email.toLowerCase() === email.toLowerCase());
            if (!existingPerson) {
                DataStore.create('persons', {
                    name: newUser.name,
                    email: newUser.email,
                    role: newUser.role
                });
            }
        }

        // Auto-login after signup
        this.currentUser = { ...newUser };
        delete this.currentUser.password;
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));

        return { success: true, user: this.currentUser };
    },

    // Get registered users from localStorage
    getRegisteredUsers() {
        const users = localStorage.getItem('registeredUsers');
        return users ? JSON.parse(users) : {};
    },

    // Enhanced demo login that checks registered users first
    demoLoginEnhanced(email, password) {
        const emailLower = email.toLowerCase();

        // Check registered users first
        const registeredUsers = this.getRegisteredUsers();
        if (registeredUsers[emailLower]) {
            if (registeredUsers[emailLower].password === password) {
                const user = { ...registeredUsers[emailLower] };
                delete user.password;
                this.currentUser = user;
                localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
                return { success: true, user: this.currentUser };
            }
            return { success: false, error: 'Invalid password.' };
        }

        // Fall back to built-in demo users
        return this.demoLogin(email, password);
    }
};

window.Auth = Auth;
