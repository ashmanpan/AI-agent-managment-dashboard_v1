/**
 * Seed Script - Populate DynamoDB with initial data
 *
 * Usage: node seed.js
 *
 * Set environment variables:
 * - AWS_REGION (default: us-east-1)
 * - ENVIRONMENT (default: dev)
 */

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');

const region = process.env.AWS_REGION || 'us-east-1';
const env = process.env.ENVIRONMENT || 'dev';

const client = new DynamoDBClient({ region });
const docClient = DynamoDBDocumentClient.from(client);

// Table names
const TABLES = {
    usecases: `agent-portal-usecases-${env}`,
    agents: `agent-portal-agents-${env}`,
    persons: `agent-portal-persons-${env}`,
    testcases: `agent-portal-testcases-${env}`
};

// Seed Data

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

const agents = [
    // UC1 - Incident Management
    { id: 'a1', name: 'IO Agent', usecaseId: 'uc1', assignedTo: ['p1'], status: 'dev', description: 'Intelligent Operations Agent for incident management' },
    { id: 'a2', name: 'BGP', usecaseId: 'uc1', assignedTo: ['p2'], status: 'dev', description: 'BGP protocol monitoring agent' },
    { id: 'a3', name: 'QOS', usecaseId: 'uc1', assignedTo: ['p3'], status: 'dev', description: 'Quality of Service monitoring agent' },
    { id: 'a4', name: 'L2VPN', usecaseId: 'uc1', assignedTo: ['p4'], status: 'dev', description: 'Layer 2 VPN monitoring agent' },
    { id: 'a5', name: 'L3VPN', usecaseId: 'uc1', assignedTo: ['p5'], status: 'dev', description: 'Layer 3 VPN monitoring agent' },
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

const testcases = [
    { id: 'tc1', title: 'IO Agent - Basic Connectivity Test', usecaseId: 'uc1', agentId: 'a1', assignedTo: 'p1', status: 'pending', steps: '1. Start IO Agent\n2. Verify connectivity\n3. Check response time', expected: 'Agent connects within 5 seconds' },
    { id: 'tc2', title: 'BGP Session Establishment', usecaseId: 'uc1', agentId: 'a2', assignedTo: 'p2', status: 'pending', steps: '1. Initialize BGP agent\n2. Establish peer session\n3. Verify route exchange', expected: 'BGP session established successfully' },
    { id: 'tc3', title: 'Config Drift Detection Accuracy', usecaseId: 'uc6', agentId: 'a29', assignedTo: 'p13', status: 'pending', steps: '1. Introduce config change\n2. Run drift detection\n3. Verify detection', expected: 'Drift detected within 1 minute' }
];

// Seed function
async function seed() {
    console.log('Starting seed process...\n');
    console.log(`Environment: ${env}`);
    console.log(`Region: ${region}\n`);

    // Seed Use Cases
    console.log('Seeding Use Cases...');
    for (const item of usecases) {
        await putItem(TABLES.usecases, {
            ...item,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });
    }
    console.log(`  ✓ ${usecases.length} use cases seeded\n`);

    // Seed Persons
    console.log('Seeding Persons...');
    for (const item of persons) {
        await putItem(TABLES.persons, {
            ...item,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });
    }
    console.log(`  ✓ ${persons.length} persons seeded\n`);

    // Seed Agents
    console.log('Seeding Agents...');
    for (const item of agents) {
        await putItem(TABLES.agents, {
            ...item,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });
    }
    console.log(`  ✓ ${agents.length} agents seeded\n`);

    // Seed Test Cases
    console.log('Seeding Test Cases...');
    for (const item of testcases) {
        await putItem(TABLES.testcases, {
            ...item,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });
    }
    console.log(`  ✓ ${testcases.length} test cases seeded\n`);

    console.log('Seed completed successfully!');
}

async function putItem(tableName, item) {
    try {
        await docClient.send(new PutCommand({
            TableName: tableName,
            Item: item
        }));
    } catch (error) {
        console.error(`Error putting item to ${tableName}:`, error.message);
        throw error;
    }
}

// Run seed
seed().catch(console.error);
