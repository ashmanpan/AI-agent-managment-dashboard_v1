# Agent Management Portal - Deployment Guide

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        AWS Amplify (Frontend)                        │
│                    HTML/CSS/JavaScript Application                   │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         AWS Cognito                                  │
│           User Authentication (cisco.com only)                       │
│  Groups: root-admin, pm, sa, psa, tech-lead, dev-test,              │
│          ai-engineer, testing                                        │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       API Gateway                                    │
│                    REST API Endpoints                                │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    ▼               ▼               ▼
            ┌───────────┐   ┌───────────┐   ┌───────────┐
            │  Lambda   │   │  Lambda   │   │  Lambda   │
            │   CRUD    │   │  Chatbot  │   │   Auth    │
            └───────────┘   └───────────┘   └───────────┘
                    │               │               │
                    ▼               ▼               │
            ┌───────────────────────────────┐      │
            │         DynamoDB              │      │
            │  - usecases                   │      │
            │  - agents                     │      │
            │  - persons                    │◄─────┘
            │  - testcases                  │
            └───────────────────────────────┘
                            │
                            ▼
                    ┌───────────────┐
                    │  Claude 4.5   │
                    │  (Anthropic)  │
                    └───────────────┘
```

## Prerequisites

1. **AWS CLI** installed and configured
2. **AWS SAM CLI** installed
3. **Node.js 18.x** or later
4. **Anthropic API Key** for Claude 4.5

## Deployment Steps

### Step 1: Install Dependencies

```bash
# Install Lambda dependencies
cd lambda/api && npm install && cd ../..
cd lambda/chatbot && npm install && cd ../..
cd lambda/auth && npm install && cd ../..
```

### Step 2: Deploy AWS Infrastructure

```bash
# Navigate to infrastructure directory
cd infrastructure

# Build the SAM application
sam build

# Deploy (first time - guided)
sam deploy --guided

# For subsequent deployments
sam deploy
```

During guided deployment, you'll be prompted for:
- Stack name: `agent-portal-dev`
- Region: Your preferred AWS region
- ClaudeApiKey: Your Anthropic API key
- Confirm changes before deploy: Y
- Allow SAM CLI IAM role creation: Y

### Step 3: Note the Outputs

After deployment, note these outputs:
- **UserPoolId**: Cognito User Pool ID
- **UserPoolClientId**: Cognito Client ID
- **ApiUrl**: API Gateway URL

### Step 4: Update Frontend Configuration

Edit `js/config.js` and update:

```javascript
const CONFIG = {
    region: 'YOUR_REGION',
    cognito: {
        userPoolId: 'YOUR_USER_POOL_ID',
        clientId: 'YOUR_CLIENT_ID',
        domain: 'YOUR_COGNITO_DOMAIN'
    },
    api: {
        baseUrl: 'YOUR_API_GATEWAY_URL',
        // ...
    },
    demoMode: false  // Set to false for production
};
```

### Step 5: Deploy Frontend to Amplify

#### Option A: AWS Amplify Console

1. Go to AWS Amplify Console
2. Click "New app" > "Host web app"
3. Connect to your Git repository or upload the folder
4. Configure build settings (not needed for static HTML)
5. Deploy

#### Option B: Amplify CLI

```bash
# Install Amplify CLI
npm install -g @aws-amplify/cli

# Initialize Amplify
amplify init

# Add hosting
amplify add hosting

# Publish
amplify publish
```

### Step 6: Create Root Admin User

```bash
# Create the root admin user in Cognito
aws cognito-idp admin-create-user \
    --user-pool-id YOUR_USER_POOL_ID \
    --username kpanse@cisco.com \
    --user-attributes Name=email,Value=kpanse@cisco.com \
    --temporary-password TempPass123!

# Add user to root-admin group
aws cognito-idp admin-add-user-to-group \
    --user-pool-id YOUR_USER_POOL_ID \
    --username kpanse@cisco.com \
    --group-name root-admin
```

### Step 7: Seed Initial Data

Run the seed script to populate DynamoDB with initial data:

```bash
cd data
node seed.js
```

## User Personas & Permissions

| Role | Permissions |
|------|-------------|
| root-admin | Full access, manage users, delete data |
| pm | Read, write, assign, change status |
| sa | Read, write, change status |
| psa | Read, write, assign, change status |
| tech-lead | Read, write, change status |
| dev-test | Read, write |
| ai-engineer | Read, write |
| testing | Read, write |

## Security Features

1. **Email Domain Restriction**: Only @cisco.com emails can register
2. **Cognito Groups**: Role-based access control
3. **API Gateway Authorizer**: JWT validation
4. **CORS**: Configured for security

## Environment Variables

Lambda functions use these environment variables:
- `USECASES_TABLE`: DynamoDB table name for use cases
- `AGENTS_TABLE`: DynamoDB table name for agents
- `PERSONS_TABLE`: DynamoDB table name for persons
- `TESTCASES_TABLE`: DynamoDB table name for test cases
- `CLAUDE_API_KEY`: Anthropic API key for chatbot

## Troubleshooting

### Cognito Sign-up Fails
- Ensure email ends with @cisco.com
- Check Lambda CloudWatch logs for pre-signup trigger

### API Returns 401
- Verify JWT token is included in Authorization header
- Check Cognito authorizer configuration

### Chatbot Not Responding
- Verify CLAUDE_API_KEY is set correctly
- Check chatbot Lambda CloudWatch logs
- Ensure DynamoDB tables have data

## Local Development

For local testing with demo mode:

1. Set `demoMode: true` in `js/config.js`
2. Open `index.html` directly in browser
3. Login with any @cisco.com email and password `demo123`

## Cleanup

To remove all AWS resources:

```bash
cd infrastructure
sam delete --stack-name agent-portal-dev
```

## Cost Estimation

- **DynamoDB**: Pay per request (minimal for low usage)
- **Lambda**: First 1M requests free per month
- **API Gateway**: First 1M API calls free per month
- **Cognito**: First 50,000 MAU free
- **Amplify Hosting**: Free tier available

Estimated monthly cost for small team: **$0 - $10**
