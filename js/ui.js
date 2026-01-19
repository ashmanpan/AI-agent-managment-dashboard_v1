// UI Module - Rendering and interaction handling
const UI = {
    // Current state
    currentView: 'dashboard',
    data: {
        usecases: [],
        agents: [],
        persons: [],
        testcases: []
    },

    // Initialize UI
    async init() {
        await this.loadData();
        this.renderDashboard();
        this.setupEventListeners();
        this.updateUserInfo();
    },

    // Load all data
    async loadData() {
        this.data.usecases = await API.usecases.getAll();
        this.data.agents = await API.agents.getAll();
        this.data.persons = await API.persons.getAll();
        this.data.testcases = await API.testcases.getAll();
    },

    // Update user info in header
    updateUserInfo() {
        const user = Auth.getUser();
        if (user) {
            document.getElementById('user-info').textContent = user.name;
            document.getElementById('user-role').textContent = getRoleLabel(user.role);

            // Show/hide admin tab based on permissions
            const adminTab = document.getElementById('admin-tab');
            if (Auth.canManageUsers() || Auth.isRootAdmin()) {
                adminTab.classList.remove('hidden');
            } else {
                adminTab.classList.add('hidden');
            }
        }
    },

    // Setup event listeners
    setupEventListeners() {
        // Navigation tabs
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const view = e.target.dataset.view;
                this.switchView(view);
            });
        });

        // Add buttons
        document.getElementById('add-usecase-btn').addEventListener('click', () => this.showModal('usecase'));
        document.getElementById('add-person-btn').addEventListener('click', () => this.showModal('person'));
        document.getElementById('add-agent-btn').addEventListener('click', () => this.showModal('agent'));
        document.getElementById('add-testcase-btn').addEventListener('click', () => this.showModal('testcase'));

        // Modal close buttons
        document.querySelectorAll('.modal-close, .modal-cancel').forEach(btn => {
            btn.addEventListener('click', () => this.hideAllModals());
        });

        // Form submissions
        document.getElementById('usecase-form').addEventListener('submit', (e) => this.handleUseCaseSubmit(e));
        document.getElementById('person-form').addEventListener('submit', (e) => this.handlePersonSubmit(e));
        document.getElementById('agent-form').addEventListener('submit', (e) => this.handleAgentSubmit(e));
        document.getElementById('testcase-form').addEventListener('submit', (e) => this.handleTestCaseSubmit(e));

        // Filters
        document.getElementById('uc-status-filter').addEventListener('change', () => this.renderUseCases());
        document.getElementById('person-role-filter').addEventListener('change', () => this.renderPersons());
        document.getElementById('agent-status-filter').addEventListener('change', () => this.renderAgents());
        document.getElementById('tc-usecase-filter').addEventListener('change', () => this.renderTestCases());
        document.getElementById('tc-status-filter').addEventListener('change', () => this.renderTestCases());

        // Admin buttons
        document.getElementById('export-data-btn')?.addEventListener('click', () => this.exportData());
        document.getElementById('import-data-btn')?.addEventListener('click', () => document.getElementById('import-file').click());
        document.getElementById('import-file')?.addEventListener('change', (e) => this.importData(e));
        document.getElementById('sync-data-btn')?.addEventListener('click', () => this.syncData());

        // Logout
        document.getElementById('logout-btn').addEventListener('click', () => {
            Auth.logout();
            window.location.reload();
        });

        // Click outside modal to close
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideAllModals();
                }
            });
        });
    },

    // Switch view
    switchView(view) {
        this.currentView = view;

        // Update tabs
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.view === view);
        });

        // Update views
        document.querySelectorAll('.view').forEach(v => {
            v.classList.toggle('active', v.id === `${view}-view`);
        });

        // Render view content
        switch (view) {
            case 'dashboard':
                this.renderDashboard();
                break;
            case 'usecases':
                this.renderUseCases();
                break;
            case 'persons':
                this.renderPersons();
                break;
            case 'agents':
                this.renderAgents();
                break;
            case 'testcases':
                this.renderTestCases();
                break;
            case 'admin':
                this.renderAdmin();
                break;
        }
    },

    // Render Dashboard
    renderDashboard() {
        const stats = DataStore.getStats();

        document.getElementById('stat-usecases').textContent = stats.totalUseCases;
        document.getElementById('stat-agents').textContent = stats.totalAgents;
        document.getElementById('stat-members').textContent = stats.totalPersons;
        document.getElementById('stat-testcases').textContent = stats.totalTestCases;

        // Overdue and upcoming stats
        const overdueAgents = DataStore.getOverdueAgents();
        const upcomingDeadlines = DataStore.getUpcomingDeadlines(7);

        const overdueStatEl = document.getElementById('stat-overdue');
        const upcomingStatEl = document.getElementById('stat-upcoming');

        if (overdueStatEl) {
            overdueStatEl.textContent = overdueAgents.length;
        }
        if (upcomingStatEl) {
            upcomingStatEl.textContent = upcomingDeadlines.length;
        }

        // Status overview
        const statusHtml = CONFIG.statuses.agent.map(status => `
            <div class="status-item">
                <span class="label">${status.label}</span>
                <span class="count">${stats.statusCounts[status.value] || 0}</span>
            </div>
        `).join('');
        document.getElementById('status-overview').innerHTML = statusHtml;

        // Overdue agents alert section
        const overdueSection = document.getElementById('overdue-section');
        if (overdueSection) {
            if (overdueAgents.length > 0) {
                overdueSection.classList.remove('hidden');
                const overdueListEl = document.getElementById('overdue-agents-list');
                overdueListEl.innerHTML = overdueAgents.map(agent => {
                    const uc = this.data.usecases.find(u => u.id === agent.usecaseId);
                    const daysOverdue = DataStore.getDaysOverdue(agent);
                    const assignedNames = agent.assignedTo?.map(pId => {
                        const person = this.data.persons.find(p => p.id === pId);
                        return person?.name || 'Unknown';
                    }).join(', ') || 'Unassigned';

                    return `
                        <div class="alert-item">
                            <div class="alert-item-header">
                                <strong>${agent.name}</strong>
                                <span class="overdue-badge">${daysOverdue} days overdue</span>
                            </div>
                            <div class="alert-item-details">
                                <span>Use Case: ${uc?.code || 'N/A'}</span>
                                <span>Status: <span class="status-badge ${agent.status}">${getStatusLabel(agent.status)}</span></span>
                                <span>Assigned: ${assignedNames}</span>
                            </div>
                        </div>
                    `;
                }).join('');
            } else {
                overdueSection.classList.add('hidden');
            }
        }

        // Upcoming deadlines section
        const upcomingSection = document.getElementById('upcoming-section');
        if (upcomingSection) {
            if (upcomingDeadlines.length > 0) {
                upcomingSection.classList.remove('hidden');
                const upcomingListEl = document.getElementById('upcoming-agents-list');
                upcomingListEl.innerHTML = upcomingDeadlines.map(agent => {
                    const uc = this.data.usecases.find(u => u.id === agent.usecaseId);
                    const daysRemaining = -DataStore.getDaysOverdue(agent);
                    const targetDate = agent.statusDates?.[agent.status]?.targetDate;

                    return `
                        <div class="alert-item alert-item-warning">
                            <div class="alert-item-header">
                                <strong>${agent.name}</strong>
                                <span class="upcoming-badge">${daysRemaining} days left</span>
                            </div>
                            <div class="alert-item-details">
                                <span>Use Case: ${uc?.code || 'N/A'}</span>
                                <span>Status: <span class="status-badge ${agent.status}">${getStatusLabel(agent.status)}</span></span>
                                <span>Due: ${targetDate ? new Date(targetDate).toLocaleDateString() : 'N/A'}</span>
                            </div>
                        </div>
                    `;
                }).join('');
            } else {
                upcomingSection.classList.add('hidden');
            }
        }

        // Recent activity
        const activities = DataStore.getRecentActivity(5);
        const activityHtml = activities.length ? activities.map(act => `
            <div class="activity-item">
                <div><strong>${act.action}</strong> ${act.collection}: ${act.itemName || act.itemId}</div>
                <div class="time">${new Date(act.timestamp).toLocaleString()}</div>
            </div>
        `).join('') : '<p class="empty-state">No recent activity</p>';
        document.getElementById('recent-activity').innerHTML = activityHtml;
    },

    // Render Use Cases
    renderUseCases() {
        const statusFilter = document.getElementById('uc-status-filter').value;
        let usecases = this.data.usecases;

        if (statusFilter) {
            usecases = usecases.filter(uc => uc.status === statusFilter);
        }

        const html = usecases.map(uc => {
            const agents = this.data.agents.filter(a => a.usecaseId === uc.id);
            const agentsHtml = agents.slice(0, 3).map(a => `
                <div class="agent-item">
                    <span>${a.name}</span>
                    <span class="status-badge ${a.status}">${getStatusLabel(a.status)}</span>
                </div>
            `).join('');

            return `
                <div class="card" data-id="${uc.id}">
                    <div class="card-header">
                        <h4>${uc.code}: ${uc.name}</h4>
                        <span class="status-badge ${uc.status}">${getStatusLabel(uc.status)}</span>
                    </div>
                    <div class="card-body">
                        <p>${uc.description || 'No description'}</p>
                        <div class="uc-agents">
                            <h5>Agents (${agents.length})</h5>
                            <div class="agent-list">${agentsHtml}</div>
                            ${agents.length > 3 ? `<small>+${agents.length - 3} more</small>` : ''}
                        </div>
                    </div>
                    <div class="card-footer">
                        <button class="btn btn-sm btn-outline" onclick="UI.viewUseCaseDetails('${uc.id}')">View Details</button>
                        <div class="actions">
                            <button class="btn btn-sm btn-secondary" onclick="UI.editUseCase('${uc.id}')">Edit</button>
                            ${Auth.canDeleteData() ? `<button class="btn btn-sm btn-danger" onclick="UI.deleteUseCase('${uc.id}')">Delete</button>` : ''}
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        document.getElementById('usecases-grid').innerHTML = html || '<div class="empty-state"><h3>No use cases found</h3></div>';
    },

    // Render Persons
    renderPersons() {
        const roleFilter = document.getElementById('person-role-filter').value;
        let persons = this.data.persons;

        if (roleFilter) {
            persons = persons.filter(p => p.role === roleFilter);
        }

        const html = persons.map(person => {
            const assignments = this.data.agents.filter(a => a.assignedTo?.includes(person.id));
            const assignmentsHtml = assignments.slice(0, 3).map(a => {
                const uc = this.data.usecases.find(u => u.id === a.usecaseId);
                return `<span class="assignment-tag">${a.name} (${uc?.code || 'N/A'})</span>`;
            }).join('');

            return `
                <div class="card" data-id="${person.id}">
                    <div class="card-header">
                        <h4>${person.name}</h4>
                        <span class="role-badge">${getRoleLabel(person.role)}</span>
                    </div>
                    <div class="card-body">
                        <p>${person.email}</p>
                        <div class="person-assignments">
                            <h5>Assignments (${assignments.length})</h5>
                            <div class="assignment-tags">${assignmentsHtml}</div>
                            ${assignments.length > 3 ? `<small>+${assignments.length - 3} more</small>` : ''}
                        </div>
                    </div>
                    <div class="card-footer">
                        <button class="btn btn-sm btn-outline" onclick="UI.viewPersonDetails('${person.id}')">View Details</button>
                        <div class="actions">
                            <button class="btn btn-sm btn-secondary" onclick="UI.editPerson('${person.id}')">Edit</button>
                            ${Auth.canDeleteData() ? `<button class="btn btn-sm btn-danger" onclick="UI.deletePerson('${person.id}')">Delete</button>` : ''}
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        document.getElementById('persons-grid').innerHTML = html || '<div class="empty-state"><h3>No team members found</h3></div>';
    },

    // Render Agents
    renderAgents() {
        const statusFilter = document.getElementById('agent-status-filter').value;
        let agents = this.data.agents;

        if (statusFilter) {
            agents = agents.filter(a => a.status === statusFilter);
        }

        const html = agents.map(agent => {
            const uc = this.data.usecases.find(u => u.id === agent.usecaseId);
            const assignedPersons = agent.assignedTo?.map(pId => {
                const person = this.data.persons.find(p => p.id === pId);
                return person?.name || 'Unknown';
            }).join(', ') || 'Unassigned';

            const canChangeStatus = Auth.canChangeStatus();
            const completion = DataStore.getCompletionPercentage(agent);
            const isOverdue = DataStore.isOverdue(agent);
            const daysOverdue = DataStore.getDaysOverdue(agent);
            const rowClass = isOverdue ? 'row-overdue' : '';

            // Progress bar color based on completion
            let progressClass = 'progress-low';
            if (completion >= 80) progressClass = 'progress-high';
            else if (completion >= 50) progressClass = 'progress-medium';

            // Deadline info
            let deadlineHtml = '';
            const targetDate = agent.statusDates?.[agent.status]?.targetDate;
            if (targetDate) {
                if (isOverdue) {
                    deadlineHtml = `<span class="deadline-overdue">${daysOverdue}d overdue</span>`;
                } else if (daysOverdue !== null && daysOverdue > -7) {
                    deadlineHtml = `<span class="deadline-warning">${-daysOverdue}d left</span>`;
                } else {
                    deadlineHtml = `<span class="deadline-normal">${new Date(targetDate).toLocaleDateString()}</span>`;
                }
            }

            return `
                <tr data-id="${agent.id}" class="${rowClass}">
                    <td>
                        <strong>${agent.name}</strong>
                        ${isOverdue ? '<span class="overdue-indicator" title="Overdue">!</span>' : ''}
                    </td>
                    <td>${uc?.code || 'N/A'}: ${uc?.name || 'Unknown'}</td>
                    <td>${assignedPersons}</td>
                    <td>
                        ${canChangeStatus ? `
                            <select class="status-select" onchange="UI.updateAgentStatus('${agent.id}', this.value)">
                                ${CONFIG.statuses.agent.map(s => `
                                    <option value="${s.value}" ${agent.status === s.value ? 'selected' : ''}>${s.label}</option>
                                `).join('')}
                            </select>
                        ` : `
                            <span class="status-badge ${agent.status}">${getStatusLabel(agent.status)}</span>
                        `}
                    </td>
                    <td>
                        <div class="progress-cell">
                            <div class="progress-bar-container">
                                <div class="progress-bar ${progressClass}" style="width: ${completion}%"></div>
                            </div>
                            <span class="progress-text">${completion}%</span>
                        </div>
                    </td>
                    <td>${deadlineHtml}</td>
                    <td class="actions">
                        <button class="btn btn-sm btn-outline" onclick="UI.viewAgentDetails('${agent.id}')">View</button>
                        <button class="btn btn-sm btn-secondary" onclick="UI.editAgent('${agent.id}')">Edit</button>
                        ${Auth.canDeleteData() ? `<button class="btn btn-sm btn-danger" onclick="UI.deleteAgent('${agent.id}')">Delete</button>` : ''}
                    </td>
                </tr>
            `;
        }).join('');

        document.getElementById('agents-table-body').innerHTML = html || '<tr><td colspan="7" class="empty-state">No agents found</td></tr>';
    },

    // Render Test Cases
    renderTestCases() {
        const ucFilter = document.getElementById('tc-usecase-filter').value;
        const statusFilter = document.getElementById('tc-status-filter').value;
        let testcases = this.data.testcases;

        // Populate use case filter
        const ucSelect = document.getElementById('tc-usecase-filter');
        if (ucSelect.options.length <= 1) {
            this.data.usecases.forEach(uc => {
                const option = document.createElement('option');
                option.value = uc.id;
                option.textContent = `${uc.code}: ${uc.name}`;
                ucSelect.appendChild(option);
            });
        }

        if (ucFilter) {
            testcases = testcases.filter(tc => tc.usecaseId === ucFilter);
        }
        if (statusFilter) {
            testcases = testcases.filter(tc => tc.status === statusFilter);
        }

        const html = testcases.map(tc => {
            const uc = this.data.usecases.find(u => u.id === tc.usecaseId);
            const agent = this.data.agents.find(a => a.id === tc.agentId);
            const person = this.data.persons.find(p => p.id === tc.assignedTo);

            return `
                <tr data-id="${tc.id}">
                    <td><strong>${tc.id}</strong></td>
                    <td>${tc.title}</td>
                    <td>${uc?.code || 'N/A'}</td>
                    <td>${agent?.name || 'N/A'}</td>
                    <td>${person?.name || 'Unassigned'}</td>
                    <td>
                        <select class="status-select" onchange="UI.updateTestCaseStatus('${tc.id}', this.value)">
                            ${CONFIG.statuses.testcase.map(s => `
                                <option value="${s.value}" ${tc.status === s.value ? 'selected' : ''}>${s.label}</option>
                            `).join('')}
                        </select>
                    </td>
                    <td class="actions">
                        <button class="btn btn-sm btn-outline" onclick="UI.viewTestCaseDetails('${tc.id}')">View</button>
                        <button class="btn btn-sm btn-secondary" onclick="UI.editTestCase('${tc.id}')">Edit</button>
                        ${Auth.canDeleteData() ? `<button class="btn btn-sm btn-danger" onclick="UI.deleteTestCase('${tc.id}')">Delete</button>` : ''}
                    </td>
                </tr>
            `;
        }).join('');

        document.getElementById('testcases-table-body').innerHTML = html || '<tr><td colspan="7" class="empty-state">No test cases found</td></tr>';
    },

    // Render Admin
    renderAdmin() {
        const persons = this.data.persons;
        const html = persons.map(person => `
            <div class="user-item">
                <div class="user-details">
                    <div class="user-name">${person.name}</div>
                    <div class="user-email">${person.email}</div>
                </div>
                <select onchange="UI.updatePersonRole('${person.id}', this.value)">
                    ${Object.entries(CONFIG.roles).map(([key, role]) => `
                        <option value="${key}" ${person.role === key ? 'selected' : ''}>${role.name}</option>
                    `).join('')}
                </select>
            </div>
        `).join('');

        document.getElementById('users-list').innerHTML = html || '<p>No users found</p>';
    },

    // Show modal
    showModal(type, id = null) {
        const modal = document.getElementById(`${type}-modal`);
        const title = document.getElementById(`${type}-modal-title`);

        if (id) {
            title.textContent = `Edit ${type.charAt(0).toUpperCase() + type.slice(1)}`;
            this.populateModalForm(type, id);
        } else {
            title.textContent = `Add ${type.charAt(0).toUpperCase() + type.slice(1)}`;
            document.getElementById(`${type}-form`).reset();
            document.getElementById(`${type.slice(0, type.length > 5 ? 2 : type.length)}-id`)?.setAttribute('value', '');
        }

        // Populate dropdowns
        this.populateFormDropdowns(type);

        modal.classList.remove('hidden');
    },

    // Hide all modals
    hideAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.add('hidden');
        });
    },

    // Populate form dropdowns
    populateFormDropdowns(type) {
        if (type === 'agent') {
            // Use cases dropdown
            const ucSelect = document.getElementById('agent-usecase');
            ucSelect.innerHTML = this.data.usecases.map(uc => `
                <option value="${uc.id}">${uc.code}: ${uc.name}</option>
            `).join('');

            // Persons dropdown (multi-select)
            const personSelect = document.getElementById('agent-assigned');
            personSelect.innerHTML = this.data.persons.map(p => `
                <option value="${p.id}">${p.name}</option>
            `).join('');
        }

        if (type === 'usecase') {
            const ownerSelect = document.getElementById('uc-owner');
            ownerSelect.innerHTML = '<option value="">Select Owner</option>' +
                this.data.persons.map(p => `
                    <option value="${p.id}">${p.name}</option>
                `).join('');
        }

        if (type === 'testcase') {
            // Use cases dropdown
            const ucSelect = document.getElementById('tc-usecase');
            ucSelect.innerHTML = this.data.usecases.map(uc => `
                <option value="${uc.id}">${uc.code}: ${uc.name}</option>
            `).join('');

            // Agents dropdown (will be filtered by use case)
            const agentSelect = document.getElementById('tc-agent');
            agentSelect.innerHTML = '<option value="">Select Agent</option>' +
                this.data.agents.map(a => `
                    <option value="${a.id}">${a.name}</option>
                `).join('');

            // Persons dropdown
            const personSelect = document.getElementById('tc-assigned');
            personSelect.innerHTML = '<option value="">Unassigned</option>' +
                this.data.persons.map(p => `
                    <option value="${p.id}">${p.name}</option>
                `).join('');
        }
    },

    // Populate modal form for editing
    populateModalForm(type, id) {
        let item;
        switch (type) {
            case 'usecase':
                item = this.data.usecases.find(uc => uc.id === id);
                if (item) {
                    document.getElementById('uc-id').value = item.id;
                    document.getElementById('uc-code').value = item.code;
                    document.getElementById('uc-name').value = item.name;
                    document.getElementById('uc-description').value = item.description || '';
                    document.getElementById('uc-status').value = item.status;
                }
                break;
            case 'person':
                item = this.data.persons.find(p => p.id === id);
                if (item) {
                    document.getElementById('person-id').value = item.id;
                    document.getElementById('person-name').value = item.name;
                    document.getElementById('person-email').value = item.email;
                    document.getElementById('person-role').value = item.role;
                }
                break;
            case 'agent':
                item = this.data.agents.find(a => a.id === id);
                if (item) {
                    document.getElementById('agent-id').value = item.id;
                    document.getElementById('agent-name').value = item.name;
                    document.getElementById('agent-usecase').value = item.usecaseId;
                    document.getElementById('agent-status').value = item.status;
                    document.getElementById('agent-description').value = item.description || '';
                    // Multi-select assigned persons
                    const assignedSelect = document.getElementById('agent-assigned');
                    Array.from(assignedSelect.options).forEach(opt => {
                        opt.selected = item.assignedTo?.includes(opt.value);
                    });
                    // Populate status date fields
                    const statusKeys = ['dev', 'test', 'final-test', 'customer-lab', 'final-tested', 'ready-prod'];
                    statusKeys.forEach(status => {
                        const dateInput = document.getElementById(`agent-date-${status}`);
                        if (dateInput && item.statusDates?.[status]?.targetDate) {
                            dateInput.value = item.statusDates[status].targetDate.split('T')[0];
                        } else if (dateInput) {
                            dateInput.value = '';
                        }
                    });
                }
                break;
            case 'testcase':
                item = this.data.testcases.find(tc => tc.id === id);
                if (item) {
                    document.getElementById('tc-id').value = item.id;
                    document.getElementById('tc-title').value = item.title;
                    document.getElementById('tc-usecase').value = item.usecaseId;
                    document.getElementById('tc-agent').value = item.agentId || '';
                    document.getElementById('tc-assigned').value = item.assignedTo || '';
                    document.getElementById('tc-status').value = item.status;
                    document.getElementById('tc-steps').value = item.steps || '';
                    document.getElementById('tc-expected').value = item.expected || '';
                }
                break;
        }
    },

    // Form submission handlers
    async handleUseCaseSubmit(e) {
        e.preventDefault();
        const id = document.getElementById('uc-id').value;
        const data = {
            code: document.getElementById('uc-code').value,
            name: document.getElementById('uc-name').value,
            description: document.getElementById('uc-description').value,
            status: document.getElementById('uc-status').value,
            owner: document.getElementById('uc-owner').value
        };

        if (id) {
            await API.usecases.update(id, data);
        } else {
            await API.usecases.create(data);
        }

        this.hideAllModals();
        await this.loadData();
        this.renderUseCases();
    },

    async handlePersonSubmit(e) {
        e.preventDefault();
        const id = document.getElementById('person-id').value;
        const data = {
            name: document.getElementById('person-name').value,
            email: document.getElementById('person-email').value,
            role: document.getElementById('person-role').value
        };

        if (id) {
            await API.persons.update(id, data);
        } else {
            await API.persons.create(data);
        }

        this.hideAllModals();
        await this.loadData();
        this.renderPersons();
    },

    async handleAgentSubmit(e) {
        e.preventDefault();
        const id = document.getElementById('agent-id').value;
        const assignedSelect = document.getElementById('agent-assigned');
        const assignedTo = Array.from(assignedSelect.selectedOptions).map(opt => opt.value);

        // Collect status dates
        const statusKeys = ['dev', 'test', 'final-test', 'customer-lab', 'final-tested', 'ready-prod'];
        const statusDates = {};

        // Get existing agent data to preserve completedDates
        let existingAgent = null;
        if (id) {
            existingAgent = this.data.agents.find(a => a.id === id);
        }

        statusKeys.forEach(status => {
            const dateInput = document.getElementById(`agent-date-${status}`);
            if (dateInput && dateInput.value) {
                statusDates[status] = {
                    targetDate: dateInput.value
                };
                // Preserve existing completedDate if any
                if (existingAgent?.statusDates?.[status]?.completedDate) {
                    statusDates[status].completedDate = existingAgent.statusDates[status].completedDate;
                }
            } else if (existingAgent?.statusDates?.[status]) {
                // Keep existing dates if input is empty but data exists
                statusDates[status] = existingAgent.statusDates[status];
            }
        });

        const data = {
            name: document.getElementById('agent-name').value,
            usecaseId: document.getElementById('agent-usecase').value,
            assignedTo,
            status: document.getElementById('agent-status').value,
            description: document.getElementById('agent-description').value,
            statusDates
        };

        if (id) {
            await API.agents.update(id, data);
        } else {
            await API.agents.create(data);
        }

        this.hideAllModals();
        await this.loadData();
        this.renderAgents();
    },

    async handleTestCaseSubmit(e) {
        e.preventDefault();
        const id = document.getElementById('tc-id').value;
        const data = {
            title: document.getElementById('tc-title').value,
            usecaseId: document.getElementById('tc-usecase').value,
            agentId: document.getElementById('tc-agent').value,
            assignedTo: document.getElementById('tc-assigned').value,
            status: document.getElementById('tc-status').value,
            steps: document.getElementById('tc-steps').value,
            expected: document.getElementById('tc-expected').value
        };

        if (id) {
            await API.testcases.update(id, data);
        } else {
            await API.testcases.create(data);
        }

        this.hideAllModals();
        await this.loadData();
        this.renderTestCases();
    },

    // Edit handlers
    editUseCase(id) { this.showModal('usecase', id); },
    editPerson(id) { this.showModal('person', id); },
    editAgent(id) { this.showModal('agent', id); },
    editTestCase(id) { this.showModal('testcase', id); },

    // Delete handlers
    async deleteUseCase(id) {
        if (confirm('Are you sure you want to delete this use case?')) {
            await API.usecases.delete(id);
            await this.loadData();
            this.renderUseCases();
        }
    },

    async deletePerson(id) {
        if (confirm('Are you sure you want to delete this team member?')) {
            await API.persons.delete(id);
            await this.loadData();
            this.renderPersons();
        }
    },

    async deleteAgent(id) {
        if (confirm('Are you sure you want to delete this agent?')) {
            await API.agents.delete(id);
            await this.loadData();
            this.renderAgents();
        }
    },

    async deleteTestCase(id) {
        if (confirm('Are you sure you want to delete this test case?')) {
            await API.testcases.delete(id);
            await this.loadData();
            this.renderTestCases();
        }
    },

    // Status update handlers
    async updateAgentStatus(id, newStatus) {
        const agent = this.data.agents.find(a => a.id === id);
        const statusOrder = ['dev', 'test', 'final-test', 'customer-lab', 'final-tested', 'ready-prod'];
        const oldStatusIndex = statusOrder.indexOf(agent.status);
        const newStatusIndex = statusOrder.indexOf(newStatus);

        // Prepare update data
        const updateData = { status: newStatus };

        // If moving forward, mark previous status as completed
        if (newStatusIndex > oldStatusIndex && agent.statusDates) {
            const statusDates = { ...agent.statusDates };
            // Mark the old status as completed
            if (statusDates[agent.status]) {
                statusDates[agent.status] = {
                    ...statusDates[agent.status],
                    completedDate: new Date().toISOString()
                };
            }
            updateData.statusDates = statusDates;
        }

        await API.agents.update(id, updateData);
        await this.loadData();
        this.renderDashboard(); // Refresh dashboard for overdue counts
    },

    async updateTestCaseStatus(id, status) {
        await API.testcases.update(id, { status });
        await this.loadData();
    },

    async updatePersonRole(id, role) {
        await API.persons.update(id, { role });
        await this.loadData();
    },

    // View details handlers
    viewUseCaseDetails(id) {
        const uc = this.data.usecases.find(u => u.id === id);
        const agents = this.data.agents.filter(a => a.usecaseId === id);

        const agentsHtml = agents.map(a => {
            const assignedNames = a.assignedTo?.map(pId => {
                const person = this.data.persons.find(p => p.id === pId);
                return person?.name || 'Unknown';
            }).join(', ') || 'Unassigned';

            return `
                <li>
                    <strong>${a.name}</strong> -
                    <span class="status-badge ${a.status}">${getStatusLabel(a.status)}</span>
                    <br><small>Assigned to: ${assignedNames}</small>
                </li>
            `;
        }).join('');

        const html = `
            <div class="detail-section">
                <h4>Code</h4>
                <p>${uc.code}</p>
            </div>
            <div class="detail-section">
                <h4>Name</h4>
                <p>${uc.name}</p>
            </div>
            <div class="detail-section">
                <h4>Status</h4>
                <p><span class="status-badge ${uc.status}">${getStatusLabel(uc.status)}</span></p>
            </div>
            <div class="detail-section">
                <h4>Description</h4>
                <p>${uc.description || 'No description provided'}</p>
            </div>
            <div class="detail-section">
                <h4>Agents (${agents.length})</h4>
                <ul class="detail-list">${agentsHtml || '<li>No agents assigned</li>'}</ul>
            </div>
        `;

        this.showDetailsModal(`Use Case: ${uc.code}`, html);
    },

    viewPersonDetails(id) {
        const person = this.data.persons.find(p => p.id === id);
        const assignments = this.data.agents.filter(a => a.assignedTo?.includes(id));

        const assignmentsHtml = assignments.map(a => {
            const uc = this.data.usecases.find(u => u.id === a.usecaseId);
            return `
                <li>
                    <strong>${a.name}</strong> (${uc?.code || 'N/A'}) -
                    <span class="status-badge ${a.status}">${getStatusLabel(a.status)}</span>
                </li>
            `;
        }).join('');

        const html = `
            <div class="detail-section">
                <h4>Name</h4>
                <p>${person.name}</p>
            </div>
            <div class="detail-section">
                <h4>Email</h4>
                <p>${person.email}</p>
            </div>
            <div class="detail-section">
                <h4>Role</h4>
                <p><span class="role-badge">${getRoleLabel(person.role)}</span></p>
            </div>
            <div class="detail-section">
                <h4>Assignments (${assignments.length})</h4>
                <ul class="detail-list">${assignmentsHtml || '<li>No assignments</li>'}</ul>
            </div>
        `;

        this.showDetailsModal(`Team Member: ${person.name}`, html);
    },

    viewAgentDetails(id) {
        const agent = this.data.agents.find(a => a.id === id);
        const uc = this.data.usecases.find(u => u.id === agent.usecaseId);
        const assignedNames = agent.assignedTo?.map(pId => {
            const person = this.data.persons.find(p => p.id === pId);
            return person?.name || 'Unknown';
        }).join(', ') || 'Unassigned';

        const testcases = this.data.testcases.filter(tc => tc.agentId === id);
        const testcasesHtml = testcases.map(tc => `
            <li>
                <strong>${tc.title}</strong> -
                <span class="status-badge ${tc.status}">${getStatusLabel(tc.status)}</span>
            </li>
        `).join('');

        // Completion and overdue info
        const completion = DataStore.getCompletionPercentage(agent);
        const isOverdue = DataStore.isOverdue(agent);
        const daysOverdue = DataStore.getDaysOverdue(agent);

        // Status timeline HTML
        const statusOrder = ['dev', 'test', 'final-test', 'customer-lab', 'final-tested', 'ready-prod'];
        const statusLabels = {
            'dev': 'Development',
            'test': 'Testing',
            'final-test': 'Final Test',
            'customer-lab': 'Customer Lab',
            'final-tested': 'Final Tested',
            'ready-prod': 'Ready for Prod'
        };
        const currentStatusIndex = statusOrder.indexOf(agent.status);

        const timelineHtml = statusOrder.map((status, index) => {
            const statusDate = agent.statusDates?.[status];
            const isCompleted = index < currentStatusIndex;
            const isCurrent = index === currentStatusIndex;
            const isPending = index > currentStatusIndex;

            let statusClass = 'timeline-pending';
            if (isCompleted) statusClass = 'timeline-completed';
            else if (isCurrent) statusClass = isOverdue ? 'timeline-overdue' : 'timeline-current';

            let dateInfo = '';
            if (statusDate) {
                const targetDate = statusDate.targetDate ? new Date(statusDate.targetDate).toLocaleDateString() : 'No target';
                const completedDate = statusDate.completedDate ? new Date(statusDate.completedDate).toLocaleDateString() : null;

                if (isCompleted && completedDate) {
                    dateInfo = `<span class="timeline-date completed">Completed: ${completedDate}</span>`;
                } else if (isCurrent) {
                    if (isOverdue) {
                        dateInfo = `<span class="timeline-date overdue">Target: ${targetDate} (${daysOverdue}d overdue)</span>`;
                    } else if (daysOverdue !== null) {
                        dateInfo = `<span class="timeline-date">${-daysOverdue}d remaining - Target: ${targetDate}</span>`;
                    } else {
                        dateInfo = `<span class="timeline-date">Target: ${targetDate}</span>`;
                    }
                } else {
                    dateInfo = `<span class="timeline-date">Target: ${targetDate}</span>`;
                }
            }

            return `
                <div class="timeline-item ${statusClass}">
                    <div class="timeline-marker"></div>
                    <div class="timeline-content">
                        <strong>${statusLabels[status]}</strong>
                        ${dateInfo}
                    </div>
                </div>
            `;
        }).join('');

        const html = `
            <div class="detail-section">
                <h4>Name</h4>
                <p>${agent.name}</p>
            </div>
            <div class="detail-section">
                <h4>Use Case</h4>
                <p>${uc?.code}: ${uc?.name || 'Unknown'}</p>
            </div>
            <div class="detail-section">
                <h4>Current Status</h4>
                <p>
                    <span class="status-badge ${agent.status}">${getStatusLabel(agent.status)}</span>
                    ${isOverdue ? '<span class="overdue-badge" style="margin-left: 8px;">Overdue</span>' : ''}
                </p>
            </div>
            <div class="detail-section">
                <h4>Completion Progress</h4>
                <div class="progress-bar-large">
                    <div class="progress-bar-container">
                        <div class="progress-bar ${completion >= 80 ? 'progress-high' : completion >= 50 ? 'progress-medium' : 'progress-low'}" style="width: ${completion}%"></div>
                    </div>
                    <span class="progress-text-large">${completion}% Complete</span>
                </div>
            </div>
            <div class="detail-section">
                <h4>Status Timeline</h4>
                <div class="status-timeline">
                    ${timelineHtml}
                </div>
            </div>
            <div class="detail-section">
                <h4>Assigned To</h4>
                <p>${assignedNames}</p>
            </div>
            <div class="detail-section">
                <h4>Description</h4>
                <p>${agent.description || 'No description provided'}</p>
            </div>
            <div class="detail-section">
                <h4>Test Cases (${testcases.length})</h4>
                <ul class="detail-list">${testcasesHtml || '<li>No test cases</li>'}</ul>
            </div>
        `;

        this.showDetailsModal(`Agent: ${agent.name}`, html);
    },

    viewTestCaseDetails(id) {
        const tc = this.data.testcases.find(t => t.id === id);
        const uc = this.data.usecases.find(u => u.id === tc.usecaseId);
        const agent = this.data.agents.find(a => a.id === tc.agentId);
        const person = this.data.persons.find(p => p.id === tc.assignedTo);

        const html = `
            <div class="detail-section">
                <h4>Title</h4>
                <p>${tc.title}</p>
            </div>
            <div class="detail-section">
                <h4>Use Case</h4>
                <p>${uc?.code}: ${uc?.name || 'Unknown'}</p>
            </div>
            <div class="detail-section">
                <h4>Agent</h4>
                <p>${agent?.name || 'N/A'}</p>
            </div>
            <div class="detail-section">
                <h4>Assigned To</h4>
                <p>${person?.name || 'Unassigned'}</p>
            </div>
            <div class="detail-section">
                <h4>Status</h4>
                <p><span class="status-badge ${tc.status}">${getStatusLabel(tc.status)}</span></p>
            </div>
            <div class="detail-section">
                <h4>Test Steps</h4>
                <pre>${tc.steps || 'No steps defined'}</pre>
            </div>
            <div class="detail-section">
                <h4>Expected Result</h4>
                <p>${tc.expected || 'No expected result defined'}</p>
            </div>
        `;

        this.showDetailsModal(`Test Case: ${tc.id}`, html);
    },

    showDetailsModal(title, content) {
        document.getElementById('details-modal-title').textContent = title;
        document.getElementById('details-modal-body').innerHTML = content;
        document.getElementById('details-modal').classList.remove('hidden');
    },

    // Data export
    exportData() {
        const data = DataStore.exportData();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `agent-portal-export-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    },

    // Data import
    importData(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = async (event) => {
                try {
                    const data = JSON.parse(event.target.result);
                    DataStore.importData(data);
                    await this.loadData();
                    this.renderDashboard();
                    alert('Data imported successfully!');
                } catch (error) {
                    alert('Error importing data: ' + error.message);
                }
            };
            reader.readAsText(file);
        }
    },

    // Sync with DynamoDB
    async syncData() {
        if (!CONFIG.demoMode) {
            alert('Syncing with DynamoDB...');
            // Real sync logic would go here
        } else {
            alert('Demo mode: Data is stored locally. Deploy to AWS for DynamoDB sync.');
        }
    }
};

window.UI = UI;
