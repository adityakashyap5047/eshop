import { Kafka } from 'kafkajs';

export const kafka = new Kafka({
    clientId: "kafka-service",
    brokers: [process.env.KAFKA_BROKER!],
    ssl: {
        rejectUnauthorized: true,
    },
    sasl: {
        mechanism: 'plain',
        username: process.env.KAFKA_API_KEY!,
        password: process.env.KAFKA_API_SECRET!
    },
    connectionTimeout: 30000, // 30 seconds
    authenticationTimeout: 30000, // 30 seconds
    reauthenticationThreshold: 10000, // 10 seconds
    retry: {
        initialRetryTime: 100,
        retries: 8,
        multiplier: 2,
        maxRetryTime: 30000,
    }
});

// Helper function to test connection
export const testKafkaConnection = async () => {
    try {
        const admin = kafka.admin();
        await admin.connect();
        console.log('✅ Kafka connection successful');
        await admin.disconnect();
        return true;
    } catch (error) {
        console.error('❌ Kafka connection failed:', error);
        return false;
    }
};

// Enhanced producer with retry logic
export const createProducer = async () => {
    const producer = kafka.producer({
        allowAutoTopicCreation: false,
        transactionTimeout: 30000,
        retry: {
            initialRetryTime: 100,
            retries: 5,
            multiplier: 2,
            maxRetryTime: 30000,
        }
    });
    
    await producer.connect();
    return producer;
};

// Enhanced consumer with proper configuration
export const createConsumer = async (groupId: string) => {
    const consumer = kafka.consumer({
        groupId,
        sessionTimeout: 30000,
        rebalanceTimeout: 60000,
        heartbeatInterval: 3000,
        retry: {
            initialRetryTime: 100,
            retries: 5,
            multiplier: 2,
            maxRetryTime: 30000,
        }
    });
    
    await consumer.connect();
    return consumer;
};
