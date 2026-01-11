import { formatPhoneNumber } from '@/lib/utils';
import AfricasTalking from 'africastalking';

const africasTalking = AfricasTalking({
    apiKey: process.env.AT_API_KEY!,
    username: process.env.AT_USERNAME!,
});

export async function sendViaAfricasTalking(phoneNumber: string, message: string) {
    try {
        const formattedPhone = formatPhoneNumber(phoneNumber);
        
        console.warn('=== Africa\'s Talking SMS Attempt ===');
        console.warn('Phone:', formattedPhone);
        console.warn('Message:', message);
        console.warn('API Key exists:', !!process.env.AT_API_KEY);
        console.warn('Username:', process.env.AT_USERNAME);
        
        const result = await africasTalking.SMS.send({
            to: formattedPhone,
            message
        });
        
        console.warn('=== Africa\'s Talking Response ===');
        console.warn(JSON.stringify(result, null, 2));
        
        return result;
    } catch (error) {
        console.error('=== Africa\'s Talking Error ===');
        console.error('Error type:', error instanceof Error ? error.name : typeof error);
        console.error('Error message:', error instanceof Error ? error.message : error);
        console.error('Full error:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
        throw error;
    }
}