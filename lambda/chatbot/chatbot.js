/**
 * Chatbot Lambda Function - Powered by Claude 4.5
 * Queries DynamoDB and uses Claude to answer questions about the Agent Portal data
 */

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand } = require('@aws-sdk/lib-dynamodb');
const Anthropic = require('@anthropic-ai/sdk');

const ddbClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(ddbClient);

const anthropic = new Anthropic({
    apiKey: process.env.CLAUDE_API_KEY
});

const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Methods': 'POST,OPTIONS'
};

exports.handler = async (event) => {
    console.log('Chatbot event:', JSON.stringify(event, null, 2));

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    try {
        const body = JSON.parse(event.body);
        const userMessage = body.message;

        if (!userMessage) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Message is required' })
            };
        }

        // Fetch all data from DynamoDB
        const [usecases, agents, persons, testcases] = await Promise.all([
            fetchTable(process.env.USECASES_TABLE),
            fetchTable(process.env.AGENTS_TABLE),
            fetchTable(process.env.PERSONS_TABLE),
            fetchTable(process.env.TESTCASES_TABLE)
        ]);

        // Build context for Claude
        const context = buildContext(usecases, agents, persons, testcases);

        // Call Claude 4.5
        const response = await callClaude(userMessage, context);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ response })
        };

    } catch (error) {
        console.error('Chatbot error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Failed to process request', details: error.message })
        };
    }
};

async function fetchTable(tableName) {
    try {
        const result = await docClient.send(new ScanCommand({ TableName: tableName }));
        return result.Items || [];
    } catch (error) {
        console.error(`Error fetching ${tableName}:`, error);
        return [];
    }
}

function buildContext(usecases, agents, persons, testcases) {
    // Status mapping
    const statusLabels = {
        'dev': 'Development',
        'test': 'Testing',
        'final-test': 'Final Test',
        'customer-lab': 'Customer Lab',
        'final-tested': 'Final Tested',
        'ready-prod': 'Ready for Production',
        'pending': 'Pending',
        'in-progress': 'In Progress',
        'passed': 'Passed',
        'failed': 'Failed'
    };

    const roleLabels = {
        'root-admin': 'Root Admin',
        'pm': 'Project Manager',
        'sa': 'Solution Architect',
        'psa': 'Principal SA',
        'tech-lead': 'Tech Lead',
        'dev-test': 'Dev-Test Engineer',
        'ai-engineer': 'AI Engineer',
        'testing': 'Testing Engineer'
    };

    // Build use cases summary
    const usecasesSummary = usecases.map(uc => {
        const ucAgents = agents.filter(a => a.usecaseId === uc.id);
        return `- ${uc.code}: ${uc.name} (Status: ${statusLabels[uc.status] || uc.status}, ${ucAgents.length} agents)`;
    }).join('\n');

    // Build agents summary with assignments
    const agentsSummary = agents.map(a => {
        const uc = usecases.find(u => u.id === a.usecaseId);
        const assignedNames = (a.assignedTo || []).map(pId => {
            const person = persons.find(p => p.id === pId);
            return person?.name || 'Unknown';
        }).join(', ') || 'Unassigned';
        return `- ${a.name} (${uc?.code || 'N/A'}) - Status: ${statusLabels[a.status] || a.status}, Assigned to: ${assignedNames}`;
    }).join('\n');

    // Build persons summary
    const personsSummary = persons.map(p => {
        const assignmentCount = agents.filter(a => a.assignedTo?.includes(p.id)).length;
        return `- ${p.name} (${p.email}) - Role: ${roleLabels[p.role] || p.role}, ${assignmentCount} assignments`;
    }).join('\n');

    // Build test cases summary
    const testcasesSummary = testcases.map(tc => {
        const uc = usecases.find(u => u.id === tc.usecaseId);
        const agent = agents.find(a => a.id === tc.agentId);
        return `- ${tc.id}: ${tc.title} (${uc?.code || 'N/A'}, ${agent?.name || 'N/A'}) - Status: ${statusLabels[tc.status] || tc.status}`;
    }).join('\n');

    // Statistics
    const stats = {
        totalUseCases: usecases.length,
        totalAgents: agents.length,
        totalPersons: persons.length,
        totalTestCases: testcases.length,
        agentsByStatus: {},
        testcasesByStatus: {}
    };

    agents.forEach(a => {
        stats.agentsByStatus[a.status] = (stats.agentsByStatus[a.status] || 0) + 1;
    });

    testcases.forEach(tc => {
        stats.testcasesByStatus[tc.status] = (stats.testcasesByStatus[tc.status] || 0) + 1;
    });

    return `
You are an AI assistant for the Agent Management Portal at Cisco. You help users query information about use cases, agents, team members, and test cases.

CURRENT DATA:

STATISTICS:
- Total Use Cases: ${stats.totalUseCases}
- Total Agents: ${stats.totalAgents}
- Total Team Members: ${stats.totalPersons}
- Total Test Cases: ${stats.totalTestCases}

Agent Status Distribution:
${Object.entries(stats.agentsByStatus).map(([status, count]) => `  - ${statusLabels[status] || status}: ${count}`).join('\n')}

Test Case Status Distribution:
${Object.entries(stats.testcasesByStatus).map(([status, count]) => `  - ${statusLabels[status] || status}: ${count}`).join('\n')}

USE CASES:
${usecasesSummary || 'No use cases found'}

AGENTS:
${agentsSummary || 'No agents found'}

TEAM MEMBERS:
${personsSummary || 'No team members found'}

TEST CASES:
${testcasesSummary || 'No test cases found'}

INSTRUCTIONS:
- Answer questions based on the data above
- Be concise but informative
- If asked about something not in the data, say so
- Format responses for readability (use bullet points, bold for emphasis)
- When mentioning status, use the human-readable labels
- Help users understand the current state of agents and use cases
`;
}

async function callClaude(userMessage, context) {
    const message = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: context,
        messages: [
            { role: 'user', content: userMessage }
        ]
    });

    // Extract text from response
    const responseText = message.content
        .filter(block => block.type === 'text')
        .map(block => block.text)
        .join('\n');

    return responseText;
}
