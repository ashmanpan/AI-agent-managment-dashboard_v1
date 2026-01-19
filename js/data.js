// Data Store Module - Local storage management for demo mode
const DataStore = {
    // Initialize data store with seed data
    init() {
        if (!localStorage.getItem('dataInitialized')) {
            this.seedData();
            localStorage.setItem('dataInitialized', 'true');
        }
    },

    // Reset and reseed data
    reset() {
        localStorage.removeItem('usecases');
        localStorage.removeItem('agents');
        localStorage.removeItem('persons');
        localStorage.removeItem('testcases');
        localStorage.removeItem('activity');
        localStorage.removeItem('dataInitialized');
        this.init();
    },

    // Get all items from a collection
    getAll(collection) {
        const data = localStorage.getItem(collection);
        return data ? JSON.parse(data) : [];
    },

    // Get item by ID
    getById(collection, id) {
        const items = this.getAll(collection);
        return items.find(item => item.id === id);
    },

    // Create new item
    create(collection, data) {
        const items = this.getAll(collection);
        const newItem = {
            ...data,
            id: data.id || `${collection.slice(0, 2)}_${Date.now()}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        items.push(newItem);
        localStorage.setItem(collection, JSON.stringify(items));
        this.logActivity('create', collection, newItem);
        return newItem;
    },

    // Update item
    update(collection, id, data) {
        const items = this.getAll(collection);
        const index = items.findIndex(item => item.id === id);
        if (index !== -1) {
            items[index] = {
                ...items[index],
                ...data,
                updatedAt: new Date().toISOString()
            };
            localStorage.setItem(collection, JSON.stringify(items));
            this.logActivity('update', collection, items[index]);
            return items[index];
        }
        return null;
    },

    // Delete item
    delete(collection, id) {
        const items = this.getAll(collection);
        const filtered = items.filter(item => item.id !== id);
        localStorage.setItem(collection, JSON.stringify(filtered));
        this.logActivity('delete', collection, { id });
        return { success: true };
    },

    // Log activity
    logActivity(action, collection, item) {
        const activities = this.getAll('activity');
        activities.unshift({
            id: `act_${Date.now()}`,
            action,
            collection,
            itemId: item.id,
            itemName: item.name || item.title || item.code,
            timestamp: new Date().toISOString(),
            userId: Auth.getUser()?.id
        });
        // Keep only last 50 activities
        localStorage.setItem('activity', JSON.stringify(activities.slice(0, 50)));
    },

    // Get recent activity
    getRecentActivity(limit = 10) {
        return this.getAll('activity').slice(0, limit);
    },

    // Seed initial data from the provided matrix
    seedData() {
        // Seed Use Cases
        const usecases = [
            { id: 'uc1', code: 'UC1', name: 'Incident Management', status: 'dev', description: 'Automated incident detection and response management' },
            { id: 'uc2', code: 'UC2', name: 'RCA', status: 'dev', description: 'Root Cause Analysis automation' },
            { id: 'uc3', code: 'UC3', name: 'EXP Management', status: 'dev', description: 'Experience management and monitoring' },
            { id: 'uc4', code: 'UC4', name: 'Image Upgrade', status: 'dev', description: 'Automated network device image upgrades' },
            { id: 'uc5', code: 'UC5', name: 'Toxic Factor Detection', status: 'dev', description: 'Detection of toxic configuration factors' },
            { id: 'uc6', code: 'UC6', name: 'Config Drift Detection', status: 'dev', description: 'Configuration drift monitoring and alerts' },
            { id: 'uc7', code: 'UC7', name: 'Audit Agent', status: 'dev', description: 'Automated configuration auditing' },
            { id: 'uc8', code: 'UC8', name: 'Intent-driven Use Case Integration', status: 'dev', description: 'Intent-driven use case integration with IO agent' },
            { id: 'uc9', code: 'UC9', name: 'PSRIT', status: 'dev', description: 'PSRIT integration and automation' },
            { id: 'uc10', code: 'UC10', name: 'Zero Trust Config Guardian', status: 'dev', description: 'Zero trust configuration validation and enforcement' },
            { id: 'uc11', code: 'UC11', name: 'AI NetAdvisor Digital Twin Lite', status: 'dev', description: 'AI-powered network advisor with digital twin capabilities' }
        ];

        // Seed Persons (Team Members)
        const persons = [
            { id: 'p1', name: 'Rajeshwari BU', email: 'rrajeshw@cisco.com', role: 'tech-lead' },
            { id: 'p2', name: 'Randy Gunawan', email: 'rangunaw@cisco.com', role: 'dev-test' },
            { id: 'p3', name: 'Utkarsh Singh', email: 'utkarss2@cisco.com', role: 'dev-test' },
            { id: 'p4', name: 'Pritesh Panchigar', email: 'prpanchi@cisco.com', role: 'dev-test' },
            { id: 'p5', name: 'Arjun Sawant', email: 'arjsawan@cisco.com', role: 'sa' },
            { id: 'p6', name: 'Dhruv Damani', email: 'ddamani@cisco.com', role: 'ai-engineer' },
            { id: 'p7', name: 'Swaroop Chandre', email: 'swarocha@cisco.com', role: 'dev-test' },
            { id: 'p8', name: 'Bhalchandra Gangshettiwar', email: 'bgangshe@cisco.com', role: 'dev-test' },
            { id: 'p9', name: 'Saumya Chaurasia', email: 'saumycha@cisco.com', role: 'dev-test' },
            { id: 'p10', name: 'Saloni Sawantdesai', email: 'ssawantd@cisco.com', role: 'testing' },
            { id: 'p11', name: 'Akash Yadav', email: 'akasyada@cisco.com', role: 'ai-engineer' },
            { id: 'p12', name: 'Prathamesh Sambrekar', email: 'prasambr@cisco.com', role: 'ai-engineer' },
            { id: 'p13', name: 'Azaruddin Kazi', email: 'azakazi@cisco.com', role: 'dev-test' },
            { id: 'p14', name: 'Saba Shaikh', email: 'sabashai@cisco.com', role: 'dev-test' },
            { id: 'p15', name: 'Supriya Sinha', email: 'susinha2@cisco.com', role: 'dev-test' }
        ];

        // Helper to generate dates
        const today = new Date();
        const addDays = (date, days) => {
            const result = new Date(date);
            result.setDate(result.getDate() + days);
            return result.toISOString().split('T')[0];
        };

        // Seed Agents (with assignments from the matrix)
        const agents = [
            // UC1 - Incident Management (some with dates, some overdue)
            { id: 'a1', name: 'IO Agent', usecaseId: 'uc1', assignedTo: ['p1'], status: 'test', description: 'Intelligent Operations Agent for incident management',
              statusDates: {
                dev: { targetDate: addDays(today, -30), completedDate: addDays(today, -25) },
                test: { targetDate: addDays(today, -5) }, // OVERDUE
                'final-test': { targetDate: addDays(today, 15) },
                'customer-lab': { targetDate: addDays(today, 30) },
                'final-tested': { targetDate: addDays(today, 45) },
                'ready-prod': { targetDate: addDays(today, 60) }
              }
            },
            { id: 'a2', name: 'BGP', usecaseId: 'uc1', assignedTo: ['p2'], status: 'dev', description: 'BGP protocol monitoring agent',
              statusDates: {
                dev: { targetDate: addDays(today, -10) }, // OVERDUE
                test: { targetDate: addDays(today, 10) },
                'final-test': { targetDate: addDays(today, 25) },
                'customer-lab': { targetDate: addDays(today, 40) },
                'final-tested': { targetDate: addDays(today, 55) },
                'ready-prod': { targetDate: addDays(today, 70) }
              }
            },
            { id: 'a3', name: 'QOS', usecaseId: 'uc1', assignedTo: ['p3'], status: 'dev', description: 'Quality of Service monitoring agent',
              statusDates: {
                dev: { targetDate: addDays(today, 5) }, // Due soon
                test: { targetDate: addDays(today, 20) },
                'final-test': { targetDate: addDays(today, 35) },
                'customer-lab': { targetDate: addDays(today, 50) },
                'final-tested': { targetDate: addDays(today, 65) },
                'ready-prod': { targetDate: addDays(today, 80) }
              }
            },
            { id: 'a4', name: 'L2VPN', usecaseId: 'uc1', assignedTo: ['p4'], status: 'final-test', description: 'Layer 2 VPN monitoring agent',
              statusDates: {
                dev: { targetDate: addDays(today, -60), completedDate: addDays(today, -55) },
                test: { targetDate: addDays(today, -40), completedDate: addDays(today, -35) },
                'final-test': { targetDate: addDays(today, 3) }, // Due soon
                'customer-lab': { targetDate: addDays(today, 20) },
                'final-tested': { targetDate: addDays(today, 35) },
                'ready-prod': { targetDate: addDays(today, 50) }
              }
            },
            { id: 'a5', name: 'L3VPN', usecaseId: 'uc1', assignedTo: ['p5'], status: 'customer-lab', description: 'Layer 3 VPN monitoring agent',
              statusDates: {
                dev: { targetDate: addDays(today, -90), completedDate: addDays(today, -85) },
                test: { targetDate: addDays(today, -70), completedDate: addDays(today, -65) },
                'final-test': { targetDate: addDays(today, -50), completedDate: addDays(today, -45) },
                'customer-lab': { targetDate: addDays(today, -7) }, // OVERDUE
                'final-tested': { targetDate: addDays(today, 10) },
                'ready-prod': { targetDate: addDays(today, 25) }
              }
            },
            { id: 'a6', name: 'Layer2', usecaseId: 'uc1', assignedTo: ['p8'], status: 'dev', description: 'Layer 2 network monitoring agent' },
            { id: 'a7', name: 'Layer1', usecaseId: 'uc1', assignedTo: ['p9'], status: 'dev', description: 'Layer 1 physical monitoring agent' },
            { id: 'a8', name: 'IGP(ISIS)', usecaseId: 'uc1', assignedTo: ['p11'], status: 'dev', description: 'IGP ISIS protocol monitoring agent' },

            // UC2 - RCA
            { id: 'a9', name: 'IO Agent', usecaseId: 'uc2', assignedTo: ['p1'], status: 'dev', description: 'Intelligent Operations Agent for RCA' },
            { id: 'a10', name: 'Config Changes', usecaseId: 'uc2', assignedTo: ['p3'], status: 'dev', description: 'Configuration change tracking agent' },
            { id: 'a11', name: 'MRA', usecaseId: 'uc2', assignedTo: ['p5'], status: 'dev', description: 'Multi-Resource Analysis agent' },
            { id: 'a12', name: 'Telemetry', usecaseId: 'uc2', assignedTo: ['p6'], status: 'dev', description: 'Telemetry data collection agent' },
            { id: 'a13', name: 'Fault Agent', usecaseId: 'uc2', assignedTo: ['p10'], status: 'dev', description: 'Fault detection and analysis agent' },
            { id: 'a14', name: 'Syslog Analysis', usecaseId: 'uc2', assignedTo: ['p12'], status: 'dev', description: 'Syslog parsing and analysis agent' },

            // UC3 - EXP Management
            { id: 'a15', name: 'Event Correlator', usecaseId: 'uc3', assignedTo: ['p1'], status: 'dev', description: 'Event correlation and analysis agent' },
            { id: 'a16', name: 'Restoration Monitor', usecaseId: 'uc3', assignedTo: ['p2'], status: 'dev', description: 'Service restoration monitoring agent' },
            { id: 'a17', name: 'Tunnel Provisioning', usecaseId: 'uc3', assignedTo: ['p3'], status: 'dev', description: 'Tunnel provisioning automation agent' },
            { id: 'a18', name: 'Orchestrator', usecaseId: 'uc3', assignedTo: ['p5'], status: 'dev', description: 'Workflow orchestration agent' },
            { id: 'a19', name: 'Notification', usecaseId: 'uc3', assignedTo: ['p6'], status: 'dev', description: 'Notification and alerting agent' },
            { id: 'a20', name: 'Path Computation', usecaseId: 'uc3', assignedTo: ['p7'], status: 'dev', description: 'Network path computation agent' },
            { id: 'a21', name: 'Service Impact', usecaseId: 'uc3', assignedTo: ['p8'], status: 'dev', description: 'Service impact analysis agent' },
            { id: 'a22', name: 'Traffic Analytics', usecaseId: 'uc3', assignedTo: ['p9'], status: 'dev', description: 'Traffic analytics and monitoring agent' },
            { id: 'a23', name: 'Audit', usecaseId: 'uc3', assignedTo: ['p10'], status: 'dev', description: 'Configuration audit agent' },

            // UC4 - Image Upgrade
            { id: 'a24', name: 'IO Agent', usecaseId: 'uc4', assignedTo: ['p1'], status: 'dev', description: 'Intelligent Operations Agent for image upgrade' },
            { id: 'a25', name: 'CWM', usecaseId: 'uc4', assignedTo: ['p2'], status: 'dev', description: 'Change Window Management agent' },
            { id: 'a26', name: 'MRA', usecaseId: 'uc4', assignedTo: ['p5'], status: 'dev', description: 'Multi-Resource Analysis agent for upgrades' },
            { id: 'a27', name: 'Pre-Check and Post-Check', usecaseId: 'uc4', assignedTo: ['p9'], status: 'dev', description: 'Pre and post upgrade validation agent' },

            // UC5 - Toxic Factor Detection
            { id: 'a28', name: 'Toxic Factor', usecaseId: 'uc5', assignedTo: ['p13', 'p14', 'p15'], status: 'dev', description: 'Toxic configuration factor detection agent' },

            // UC6 - Config Drift Detection
            { id: 'a29', name: 'Config Drift', usecaseId: 'uc6', assignedTo: ['p13', 'p14', 'p15'], status: 'dev', description: 'Configuration drift detection agent' },

            // UC7 - Audit Agent
            { id: 'a30', name: 'Audit Agent', usecaseId: 'uc7', assignedTo: ['p11'], status: 'dev', description: 'Comprehensive audit agent' },
            { id: 'a31', name: 'Intent Agent', usecaseId: 'uc7', assignedTo: ['p12'], status: 'dev', description: 'Intent-based audit agent' },

            // UC8 - Intent-driven Integration
            { id: 'a32', name: 'IO Agent', usecaseId: 'uc8', assignedTo: ['p1'], status: 'dev', description: 'IO Agent for intent integration' },
            { id: 'a33', name: 'MRA', usecaseId: 'uc8', assignedTo: ['p5'], status: 'dev', description: 'MRA for intent integration' },
            { id: 'a34', name: 'Intent Agent', usecaseId: 'uc8', assignedTo: ['p12'], status: 'dev', description: 'Intent processing agent' },

            // UC9 - PSRIT
            { id: 'a35', name: 'PSRIT', usecaseId: 'uc9', assignedTo: ['p4'], status: 'dev', description: 'PSRIT integration agent' },
            { id: 'a36', name: 'Intent Agent', usecaseId: 'uc9', assignedTo: ['p12'], status: 'dev', description: 'Intent agent for PSRIT' },

            // UC10 - Zero Trust Config Guardian
            { id: 'a37', name: 'Zero Trust Config Guardian', usecaseId: 'uc10', assignedTo: ['p3'], status: 'dev', description: 'Zero trust configuration validation agent' },

            // UC11 - AI NetAdvisor Digital Twin Lite
            { id: 'a38', name: 'Netadvisor Agent', usecaseId: 'uc11', assignedTo: ['p11'], status: 'dev', description: 'AI-powered network advisor agent' }
        ];

        // Seed some test cases
        const testcases = [
            { id: 'tc1', title: 'IO Agent - Basic Connectivity Test', usecaseId: 'uc1', agentId: 'a1', assignedTo: 'p1', status: 'pending', steps: '1. Start IO Agent\n2. Verify connectivity\n3. Check response time', expected: 'Agent connects within 5 seconds' },
            { id: 'tc2', title: 'BGP Session Establishment', usecaseId: 'uc1', agentId: 'a2', assignedTo: 'p2', status: 'pending', steps: '1. Initialize BGP agent\n2. Establish peer session\n3. Verify route exchange', expected: 'BGP session established successfully' },
            { id: 'tc3', title: 'Config Drift Detection Accuracy', usecaseId: 'uc6', agentId: 'a29', assignedTo: 'p13', status: 'pending', steps: '1. Introduce config change\n2. Run drift detection\n3. Verify detection', expected: 'Drift detected within 1 minute' }
        ];

        // Save to localStorage
        localStorage.setItem('usecases', JSON.stringify(usecases));
        localStorage.setItem('persons', JSON.stringify(persons));
        localStorage.setItem('agents', JSON.stringify(agents));
        localStorage.setItem('testcases', JSON.stringify(testcases));
        localStorage.setItem('activity', JSON.stringify([]));
    },

    // Export all data
    exportData() {
        return {
            usecases: this.getAll('usecases'),
            persons: this.getAll('persons'),
            agents: this.getAll('agents'),
            testcases: this.getAll('testcases'),
            exportedAt: new Date().toISOString()
        };
    },

    // Import data
    importData(data) {
        if (data.usecases) localStorage.setItem('usecases', JSON.stringify(data.usecases));
        if (data.persons) localStorage.setItem('persons', JSON.stringify(data.persons));
        if (data.agents) localStorage.setItem('agents', JSON.stringify(data.agents));
        if (data.testcases) localStorage.setItem('testcases', JSON.stringify(data.testcases));
        localStorage.setItem('dataInitialized', 'true');
    },

    // Get statistics
    getStats() {
        const usecases = this.getAll('usecases');
        const agents = this.getAll('agents');
        const persons = this.getAll('persons');
        const testcases = this.getAll('testcases');

        // Status counts
        const statusCounts = {};
        CONFIG.statuses.agent.forEach(s => {
            statusCounts[s.value] = agents.filter(a => a.status === s.value).length;
        });

        // Get overdue agents
        const overdueAgents = this.getOverdueAgents();

        return {
            totalUseCases: usecases.length,
            totalAgents: agents.length,
            totalPersons: persons.length,
            totalTestCases: testcases.length,
            statusCounts,
            overdueCount: overdueAgents.length,
            overdueAgents,
            testCaseStats: {
                pending: testcases.filter(tc => tc.status === 'pending').length,
                inProgress: testcases.filter(tc => tc.status === 'in-progress').length,
                passed: testcases.filter(tc => tc.status === 'passed').length,
                failed: testcases.filter(tc => tc.status === 'failed').length
            }
        };
    },

    // Calculate completion percentage for an agent based on status
    getCompletionPercentage(agent) {
        const statusOrder = ['dev', 'test', 'final-test', 'customer-lab', 'final-tested', 'ready-prod'];
        const currentIndex = statusOrder.indexOf(agent.status);
        if (currentIndex === -1) return 0;
        return Math.round(((currentIndex + 1) / statusOrder.length) * 100);
    },

    // Check if agent is overdue for current status
    isOverdue(agent) {
        if (!agent.statusDates) return false;
        const targetDate = agent.statusDates[agent.status]?.targetDate;
        if (!targetDate) return false;
        return new Date(targetDate) < new Date() && agent.status !== 'ready-prod';
    },

    // Get days overdue (negative means days remaining)
    getDaysOverdue(agent) {
        if (!agent.statusDates) return null;
        const targetDate = agent.statusDates[agent.status]?.targetDate;
        if (!targetDate) return null;
        const target = new Date(targetDate);
        const today = new Date();
        const diffTime = today - target;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    },

    // Get all overdue agents
    getOverdueAgents() {
        const agents = this.getAll('agents');
        const usecases = this.getAll('usecases');
        const persons = this.getAll('persons');

        return agents
            .filter(a => this.isOverdue(a))
            .map(a => {
                const uc = usecases.find(u => u.id === a.usecaseId);
                const assignedNames = (a.assignedTo || []).map(pId => {
                    const person = persons.find(p => p.id === pId);
                    return person?.name || 'Unknown';
                });
                return {
                    ...a,
                    usecaseCode: uc?.code || 'N/A',
                    usecaseName: uc?.name || 'Unknown',
                    assignedNames,
                    daysOverdue: this.getDaysOverdue(a),
                    completionPercentage: this.getCompletionPercentage(a)
                };
            })
            .sort((a, b) => b.daysOverdue - a.daysOverdue); // Most overdue first
    },

    // Get upcoming deadlines (within next 7 days)
    getUpcomingDeadlines(days = 7) {
        const agents = this.getAll('agents');
        const usecases = this.getAll('usecases');
        const persons = this.getAll('persons');
        const today = new Date();
        const futureDate = new Date();
        futureDate.setDate(today.getDate() + days);

        return agents
            .filter(a => {
                if (!a.statusDates) return false;
                const targetDate = a.statusDates[a.status]?.targetDate;
                if (!targetDate) return false;
                const target = new Date(targetDate);
                return target >= today && target <= futureDate;
            })
            .map(a => {
                const uc = usecases.find(u => u.id === a.usecaseId);
                const assignedNames = (a.assignedTo || []).map(pId => {
                    const person = persons.find(p => p.id === pId);
                    return person?.name || 'Unknown';
                });
                return {
                    ...a,
                    usecaseCode: uc?.code || 'N/A',
                    usecaseName: uc?.name || 'Unknown',
                    assignedNames,
                    daysRemaining: -this.getDaysOverdue(a),
                    completionPercentage: this.getCompletionPercentage(a)
                };
            })
            .sort((a, b) => a.daysRemaining - b.daysRemaining); // Soonest first
    }
};

window.DataStore = DataStore;
