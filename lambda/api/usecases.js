/**
 * Use Cases CRUD Lambda Function
 */

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, PutCommand, DeleteCommand, ScanCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');
const { v4: uuidv4 } = require('uuid');

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.USECASES_TABLE;

// CORS headers
const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
};

exports.handler = async (event) => {
    console.log('Event:', JSON.stringify(event, null, 2));

    const method = event.httpMethod;
    const id = event.pathParameters?.id;

    try {
        switch (method) {
            case 'GET':
                return id ? await getOne(id) : await getAll();
            case 'POST':
                return await create(JSON.parse(event.body));
            case 'PUT':
                return await update(id, JSON.parse(event.body));
            case 'DELETE':
                return await remove(id);
            case 'OPTIONS':
                return { statusCode: 200, headers, body: '' };
            default:
                return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
        }
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: error.message })
        };
    }
};

async function getAll() {
    const result = await docClient.send(new ScanCommand({ TableName: TABLE_NAME }));
    return {
        statusCode: 200,
        headers,
        body: JSON.stringify(result.Items || [])
    };
}

async function getOne(id) {
    const result = await docClient.send(new GetCommand({
        TableName: TABLE_NAME,
        Key: { id }
    }));

    if (!result.Item) {
        return { statusCode: 404, headers, body: JSON.stringify({ error: 'Not found' }) };
    }

    return {
        statusCode: 200,
        headers,
        body: JSON.stringify(result.Item)
    };
}

async function create(data) {
    const item = {
        id: data.id || `uc_${uuidv4()}`,
        code: data.code,
        name: data.name,
        description: data.description || '',
        status: data.status || 'dev',
        owner: data.owner || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    await docClient.send(new PutCommand({
        TableName: TABLE_NAME,
        Item: item
    }));

    return {
        statusCode: 201,
        headers,
        body: JSON.stringify(item)
    };
}

async function update(id, data) {
    const updateExpressions = [];
    const expressionAttributeNames = {};
    const expressionAttributeValues = {};

    Object.entries(data).forEach(([key, value]) => {
        if (key !== 'id' && value !== undefined) {
            updateExpressions.push(`#${key} = :${key}`);
            expressionAttributeNames[`#${key}`] = key;
            expressionAttributeValues[`:${key}`] = value;
        }
    });

    // Always update updatedAt
    updateExpressions.push('#updatedAt = :updatedAt');
    expressionAttributeNames['#updatedAt'] = 'updatedAt';
    expressionAttributeValues[':updatedAt'] = new Date().toISOString();

    const result = await docClient.send(new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { id },
        UpdateExpression: `SET ${updateExpressions.join(', ')}`,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: 'ALL_NEW'
    }));

    return {
        statusCode: 200,
        headers,
        body: JSON.stringify(result.Attributes)
    };
}

async function remove(id) {
    await docClient.send(new DeleteCommand({
        TableName: TABLE_NAME,
        Key: { id }
    }));

    return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true })
    };
}
