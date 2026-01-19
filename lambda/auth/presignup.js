/**
 * Pre-Signup Lambda Trigger
 * Validates that only @cisco.com email addresses can register
 */

exports.handler = async (event) => {
    console.log('Pre-signup event:', JSON.stringify(event, null, 2));

    const email = event.request.userAttributes.email;

    // Validate email domain - only allow cisco.com
    if (!email || !email.toLowerCase().endsWith('@cisco.com')) {
        throw new Error('Only @cisco.com email addresses are allowed to register.');
    }

    // Auto-confirm and auto-verify email for cisco.com users
    event.response.autoConfirmUser = true;
    event.response.autoVerifyEmail = true;

    console.log('User approved:', email);

    return event;
};
