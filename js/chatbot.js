// Chatbot Module - AI Assistant powered by Claude 4.5
const Chatbot = {
    isOpen: false,
    isProcessing: false,

    // Initialize chatbot
    init() {
        this.setupEventListeners();
    },

    // Setup event listeners
    setupEventListeners() {
        const toggle = document.getElementById('chatbot-toggle');
        const close = document.getElementById('chatbot-close');
        const input = document.getElementById('chatbot-input');
        const send = document.getElementById('chatbot-send');

        toggle.addEventListener('click', () => this.toggle());
        close.addEventListener('click', () => this.close());
        send.addEventListener('click', () => this.sendMessage());
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
    },

    // Toggle chatbot window
    toggle() {
        this.isOpen = !this.isOpen;
        const window = document.getElementById('chatbot-window');
        const toggle = document.getElementById('chatbot-toggle');

        if (this.isOpen) {
            window.classList.remove('hidden');
            toggle.style.display = 'none';
            document.getElementById('chatbot-input').focus();
        } else {
            this.close();
        }
    },

    // Close chatbot
    close() {
        this.isOpen = false;
        document.getElementById('chatbot-window').classList.add('hidden');
        document.getElementById('chatbot-toggle').style.display = 'flex';
    },

    // Send message
    async sendMessage() {
        const input = document.getElementById('chatbot-input');
        const message = input.value.trim();

        if (!message || this.isProcessing) return;

        // Clear input
        input.value = '';

        // Add user message
        this.addMessage(message, 'user');

        // Show typing indicator
        this.showTyping();

        // Process message
        this.isProcessing = true;

        try {
            let response;
            if (CONFIG.demoMode) {
                response = await this.processLocalQuery(message);
            } else {
                response = await API.chat.send(message, this.getContext());
            }
            this.hideTyping();
            this.addMessage(response, 'bot');
        } catch (error) {
            this.hideTyping();
            this.addMessage('Sorry, I encountered an error. Please try again.', 'bot');
        }

        this.isProcessing = false;
    },

    // Add message to chat
    addMessage(content, type) {
        const messages = document.getElementById('chatbot-messages');
        const div = document.createElement('div');
        div.className = `message ${type}-message`;

        if (type === 'bot') {
            div.innerHTML = this.formatBotMessage(content);
        } else {
            div.innerHTML = `<p>${this.escapeHtml(content)}</p>`;
        }

        messages.appendChild(div);
        messages.scrollTop = messages.scrollHeight;
    },

    // Format bot message (convert markdown-like syntax)
    formatBotMessage(content) {
        if (typeof content === 'object') {
            return this.formatDataResponse(content);
        }

        // Simple markdown formatting
        let html = this.escapeHtml(content);
        html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
        html = html.replace(/`(.*?)`/g, '<code>$1</code>');
        html = html.replace(/\n/g, '<br>');

        return `<p>${html}</p>`;
    },

    // Format structured data response
    formatDataResponse(data) {
        if (data.type === 'table') {
            let html = '<table class="chat-data-table"><thead><tr>';
            data.headers.forEach(h => html += `<th>${h}</th>`);
            html += '</tr></thead><tbody>';
            data.rows.forEach(row => {
                html += '<tr>';
                row.forEach(cell => html += `<td>${cell}</td>`);
                html += '</tr>';
            });
            html += '</tbody></table>';
            return html;
        }

        if (data.type === 'list') {
            let html = `<p>${data.title}</p><ul>`;
            data.items.forEach(item => html += `<li>${item}</li>`);
            html += '</ul>';
            return html;
        }

        if (data.type === 'card') {
            return `
                <div class="chat-data-card">
                    <div class="label">${data.label}</div>
                    <div class="value">${data.value}</div>
                </div>
            `;
        }

        return `<p>${JSON.stringify(data)}</p>`;
    },

    // Show typing indicator
    showTyping() {
        const messages = document.getElementById('chatbot-messages');
        const typing = document.createElement('div');
        typing.id = 'typing-indicator';
        typing.className = 'message bot-message typing';
        typing.innerHTML = `
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
        `;
        messages.appendChild(typing);
        messages.scrollTop = messages.scrollHeight;
    },

    // Hide typing indicator
    hideTyping() {
        const typing = document.getElementById('typing-indicator');
        if (typing) typing.remove();
    },

    // Get context for API
    getContext() {
        return {
            usecases: DataStore.getAll('usecases'),
            agents: DataStore.getAll('agents'),
            persons: DataStore.getAll('persons'),
            testcases: DataStore.getAll('testcases')
        };
    },

    // Process query locally (demo mode)
    async processLocalQuery(query) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

        const q = query.toLowerCase();
        const usecases = DataStore.getAll('usecases');
        const agents = DataStore.getAll('agents');
        const persons = DataStore.getAll('persons');
        const testcases = DataStore.getAll('testcases');

        // Statistics queries
        if (q.includes('how many') || q.includes('count') || q.includes('total')) {
            if (q.includes('use case') || q.includes('usecase')) {
                return `There are **${usecases.length} use cases** in the system.`;
            }
            if (q.includes('agent')) {
                return `There are **${agents.length} agents** across all use cases.`;
            }
            if (q.includes('team') || q.includes('member') || q.includes('person') || q.includes('people')) {
                return `There are **${persons.length} team members** in the system.`;
            }
            if (q.includes('test')) {
                return `There are **${testcases.length} test cases** defined.`;
            }
            return `Current totals:\n- Use Cases: ${usecases.length}\n- Agents: ${agents.length}\n- Team Members: ${persons.length}\n- Test Cases: ${testcases.length}`;
        }

        // Status queries
        if (q.includes('status') || q.includes('in dev') || q.includes('in test') || q.includes('ready')) {
            const statusCounts = {};
            CONFIG.statuses.agent.forEach(s => {
                statusCounts[s.label] = agents.filter(a => a.status === s.value).length;
            });

            let response = '**Agent Status Overview:**\n';
            Object.entries(statusCounts).forEach(([label, count]) => {
                response += `- ${label}: ${count}\n`;
            });
            return response;
        }

        // Use case specific queries
        const ucMatch = q.match(/uc(\d+)|use case (\d+)/);
        if (ucMatch) {
            const ucNum = ucMatch[1] || ucMatch[2];
            const uc = usecases.find(u => u.code === `UC${ucNum}`);
            if (uc) {
                const ucAgents = agents.filter(a => a.usecaseId === uc.id);
                let response = `**${uc.code}: ${uc.name}**\n`;
                response += `Status: ${getStatusLabel(uc.status)}\n`;
                response += `Description: ${uc.description || 'No description'}\n\n`;
                response += `**Agents (${ucAgents.length}):**\n`;
                ucAgents.forEach(a => {
                    const assignedNames = a.assignedTo?.map(pId => {
                        const person = persons.find(p => p.id === pId);
                        return person?.name || 'Unknown';
                    }).join(', ') || 'Unassigned';
                    response += `- ${a.name} (${getStatusLabel(a.status)}) - Assigned to: ${assignedNames}\n`;
                });
                return response;
            }
            return `I couldn't find UC${ucNum}. Available use cases are: ${usecases.map(u => u.code).join(', ')}`;
        }

        // Person specific queries
        const personNames = persons.map(p => p.name.toLowerCase());
        const matchedPerson = persons.find(p => q.includes(p.name.toLowerCase()) || q.includes(p.email.toLowerCase().split('@')[0]));
        if (matchedPerson || q.includes('who is') || q.includes('working on')) {
            if (matchedPerson) {
                const assignments = agents.filter(a => a.assignedTo?.includes(matchedPerson.id));
                let response = `**${matchedPerson.name}**\n`;
                response += `Email: ${matchedPerson.email}\n`;
                response += `Role: ${getRoleLabel(matchedPerson.role)}\n\n`;
                response += `**Assignments (${assignments.length}):**\n`;
                assignments.forEach(a => {
                    const uc = usecases.find(u => u.id === a.usecaseId);
                    response += `- ${a.name} (${uc?.code || 'N/A'}) - ${getStatusLabel(a.status)}\n`;
                });
                return response;
            }
        }

        // Agent specific queries
        if (q.includes('agent')) {
            const agentKeywords = ['io agent', 'bgp', 'qos', 'l2vpn', 'l3vpn', 'mra', 'toxic', 'drift', 'audit', 'intent'];
            const matchedKeyword = agentKeywords.find(kw => q.includes(kw));
            if (matchedKeyword) {
                const matchedAgents = agents.filter(a => a.name.toLowerCase().includes(matchedKeyword));
                if (matchedAgents.length > 0) {
                    let response = `**Agents matching "${matchedKeyword}":**\n\n`;
                    matchedAgents.forEach(a => {
                        const uc = usecases.find(u => u.id === a.usecaseId);
                        const assignedNames = a.assignedTo?.map(pId => {
                            const person = persons.find(p => p.id === pId);
                            return person?.name || 'Unknown';
                        }).join(', ') || 'Unassigned';
                        response += `**${a.name}** (${uc?.code || 'N/A'})\n`;
                        response += `- Status: ${getStatusLabel(a.status)}\n`;
                        response += `- Assigned to: ${assignedNames}\n`;
                        response += `- Description: ${a.description || 'No description'}\n\n`;
                    });
                    return response;
                }
            }
        }

        // List queries
        if (q.includes('list') || q.includes('show all') || q.includes('all')) {
            if (q.includes('use case') || q.includes('usecase')) {
                let response = '**All Use Cases:**\n';
                usecases.forEach(uc => {
                    const agentCount = agents.filter(a => a.usecaseId === uc.id).length;
                    response += `- ${uc.code}: ${uc.name} (${agentCount} agents, ${getStatusLabel(uc.status)})\n`;
                });
                return response;
            }
            if (q.includes('team') || q.includes('member') || q.includes('person')) {
                let response = '**Team Members:**\n';
                persons.forEach(p => {
                    const assignmentCount = agents.filter(a => a.assignedTo?.includes(p.id)).length;
                    response += `- ${p.name} (${getRoleLabel(p.role)}) - ${assignmentCount} assignments\n`;
                });
                return response;
            }
        }

        // Test case queries
        if (q.includes('test case') || q.includes('testcase')) {
            const stats = {
                pending: testcases.filter(tc => tc.status === 'pending').length,
                inProgress: testcases.filter(tc => tc.status === 'in-progress').length,
                passed: testcases.filter(tc => tc.status === 'passed').length,
                failed: testcases.filter(tc => tc.status === 'failed').length
            };
            return `**Test Case Status:**\n- Pending: ${stats.pending}\n- In Progress: ${stats.inProgress}\n- Passed: ${stats.passed}\n- Failed: ${stats.failed}\n\nTotal: ${testcases.length} test cases`;
        }

        // Help / default response
        if (q.includes('help') || q.includes('what can you')) {
            return `I can help you with information about the Agent Management Portal. Try asking:\n
- "How many use cases are there?"
- "What's the status of all agents?"
- "Tell me about UC1"
- "Who is working on BGP agent?"
- "Show all team members"
- "What are the test case statistics?"
- "List all use cases"
- "Tell me about Rajeshwari BU"`;
        }

        // Default response
        return `I'm not sure I understand that query. Try asking about:
- Use cases (e.g., "Tell me about UC1")
- Agents (e.g., "What's the status of IO Agent?")
- Team members (e.g., "Who is Arjun Sawant?")
- Statistics (e.g., "How many agents are there?")

Type "help" for more examples.`;
    },

    // Escape HTML
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

window.Chatbot = Chatbot;
