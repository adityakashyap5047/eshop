"use server"
import { createProducer } from "packages/utils/kafka"

export async function sendKafkaEvent(eventData: {
    userId?: string;
    productId?: string;
    shopId?: string;
    action: string;
    device?: string;
    country?: string;
    city?: string;
}) {
    let producer = null;
    try {
        console.log('📤 Sending Kafka event:', eventData.action);
        producer = await createProducer();

        await producer.send({
            topic: 'users-events',
            messages: [{value: JSON.stringify(eventData)}],
        });
        
        console.log('✅ Kafka event sent successfully');
    } catch (error) {
        console.error("❌ Error sending Kafka event:", error);
        throw error; // Re-throw to let caller handle
    } finally {
        if (producer) {
            try {
                await producer.disconnect();
            } catch (disconnectError) {
                console.error("❌ Error disconnecting producer:", disconnectError);
            }
        }
    }
}