// AWS Configuration
// Update these values after deploying AWS infrastructure
const CONFIG = {
    // AWS Region
    region: 'us-east-1',

    // Cognito Configuration
    cognito: {
        userPoolId: 'YOUR_USER_POOL_ID',
        clientId: 'YOUR_CLIENT_ID',
        domain: 'YOUR_COGNITO_DOMAIN'
    },

    // API Gateway Configuration
    api: {
        baseUrl: 'YOUR_API_GATEWAY_URL',
        endpoints: {
            usecases: '/usecases',
            agents: '/agents',
            persons: '/persons',
            testcases: '/testcases',
            chat: '/chat',
            users: '/users'
        }
    },

    // User Personas/Roles
    roles: {
        'root-admin': {
            name: 'Root Admin',
            permissions: ['all'],
            canChangeStatus: true,
            canManageUsers: true,
            canDeleteData: true
        },
        'pm': {
            name: 'Project Manager',
            permissions: ['read', 'write', 'assign'],
            canChangeStatus: true,
            canManageUsers: false,
            canDeleteData: false
        },
        'sa': {
            name: 'Solution Architect',
            permissions: ['read', 'write'],
            canChangeStatus: true,
            canManageUsers: false,
            canDeleteData: false
        },
        'psa': {
            name: 'Principal SA',
            permissions: ['read', 'write', 'assign'],
            canChangeStatus: true,
            canManageUsers: false,
            canDeleteData: false
        },
        'tech-lead': {
            name: 'Tech Lead',
            permissions: ['read', 'write'],
            canChangeStatus: true,
            canManageUsers: false,
            canDeleteData: false
        },
        'dev-test': {
            name: 'Dev-Test Engineer',
            permissions: ['read', 'write'],
            canChangeStatus: false,
            canManageUsers: false,
            canDeleteData: false
        },
        'ai-engineer': {
            name: 'AI Engineer',
            permissions: ['read', 'write'],
            canChangeStatus: false,
            canManageUsers: false,
            canDeleteData: false
        },
        'testing': {
            name: 'Testing Engineer',
            permissions: ['read', 'write'],
            canChangeStatus: false,
            canManageUsers: false,
            canDeleteData: false
        }
    },

    // Status Configurations
    statuses: {
        agent: [
            { value: 'dev', label: 'Development', color: '#6c757d' },
            { value: 'test', label: 'Testing', color: '#17a2b8' },
            { value: 'final-test', label: 'Final Test', color: '#ffc107' },
            { value: 'customer-lab', label: 'Customer Lab', color: '#fd7e14' },
            { value: 'final-tested', label: 'Final Tested', color: '#20c997' },
            { value: 'ready-prod', label: 'Ready for Production', color: '#28a745' }
        ],
        testcase: [
            { value: 'pending', label: 'Pending', color: '#6c757d' },
            { value: 'in-progress', label: 'In Progress', color: '#17a2b8' },
            { value: 'passed', label: 'Passed', color: '#28a745' },
            { value: 'failed', label: 'Failed', color: '#dc3545' }
        ]
    },

    // Demo Mode (set to true to use local storage instead of AWS)
    demoMode: true
};

// Status label helpers
function getStatusLabel(status) {
    const allStatuses = [...CONFIG.statuses.agent, ...CONFIG.statuses.testcase];
    const found = allStatuses.find(s => s.value === status);
    return found ? found.label : status;
}

function getRoleLabel(role) {
    return CONFIG.roles[role]?.name || role;
}

// Export for use in other modules
window.CONFIG = CONFIG;
window.getStatusLabel = getStatusLabel;
window.getRoleLabel = getRoleLabel;
