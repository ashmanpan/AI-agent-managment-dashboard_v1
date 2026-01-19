// API Module for DynamoDB operations via Lambda
const API = {
    // Make authenticated API request
    async request(endpoint, method = 'GET', data = null) {
        if (CONFIG.demoMode) {
            return this.demoRequest(endpoint, method, data);
        }

        const url = `${CONFIG.api.baseUrl}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json'
        };

        const token = Auth.getToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const options = {
            method,
            headers
        };

        if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
            options.body = JSON.stringify(data);
        }

        try {
            const response = await fetch(url, options);
            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    // Demo mode - use local storage
    demoRequest(endpoint, method, data) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const result = this.handleLocalStorage(endpoint, method, data);
                resolve(result);
            }, 100); // Simulate network delay
        });
    },

    handleLocalStorage(endpoint, method, data) {
        const parts = endpoint.split('/').filter(p => p);
        const resource = parts[0];
        const id = parts[1];

        switch (method) {
            case 'GET':
                if (id) {
                    return DataStore.getById(resource, id);
                }
                return DataStore.getAll(resource);

            case 'POST':
                return DataStore.create(resource, data);

            case 'PUT':
            case 'PATCH':
                return DataStore.update(resource, id, data);

            case 'DELETE':
                return DataStore.delete(resource, id);

            default:
                return null;
        }
    },

    // Use Cases API
    usecases: {
        getAll: () => API.request('/usecases'),
        getById: (id) => API.request(`/usecases/${id}`),
        create: (data) => API.request('/usecases', 'POST', data),
        update: (id, data) => API.request(`/usecases/${id}`, 'PUT', data),
        delete: (id) => API.request(`/usecases/${id}`, 'DELETE')
    },

    // Agents API
    agents: {
        getAll: () => API.request('/agents'),
        getById: (id) => API.request(`/agents/${id}`),
        create: (data) => API.request('/agents', 'POST', data),
        update: (id, data) => API.request(`/agents/${id}`, 'PUT', data),
        delete: (id) => API.request(`/agents/${id}`, 'DELETE'),
        getByUseCase: (ucId) => API.request(`/agents?usecaseId=${ucId}`),
        getByPerson: (personId) => API.request(`/agents?personId=${personId}`)
    },

    // Persons API
    persons: {
        getAll: () => API.request('/persons'),
        getById: (id) => API.request(`/persons/${id}`),
        create: (data) => API.request('/persons', 'POST', data),
        update: (id, data) => API.request(`/persons/${id}`, 'PUT', data),
        delete: (id) => API.request(`/persons/${id}`, 'DELETE')
    },

    // Test Cases API
    testcases: {
        getAll: () => API.request('/testcases'),
        getById: (id) => API.request(`/testcases/${id}`),
        create: (data) => API.request('/testcases', 'POST', data),
        update: (id, data) => API.request(`/testcases/${id}`, 'PUT', data),
        delete: (id) => API.request(`/testcases/${id}`, 'DELETE'),
        getByAgent: (agentId) => API.request(`/testcases?agentId=${agentId}`)
    },

    // Chat API (for Claude 4.5 chatbot)
    chat: {
        send: (message, context = {}) => API.request('/chat', 'POST', { message, context })
    }
};

window.API = API;
