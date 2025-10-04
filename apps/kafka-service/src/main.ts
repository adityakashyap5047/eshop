import { createConsumer, testKafkaConnection } from "@packages/utils/kafka";
import { updateUserAnalytics } from "./services/analytics.service";

let consumer: any = null;

const eventQueue: any[] = [];

const processQueue = async() => {
  if (eventQueue.length === 0) return;
  
  const events = [...eventQueue];
  eventQueue.length = 0;

  for(const event of events) {
    if (event.action === "shop_visit") {
      // update shop analytics
    }

    const validActions = [
      "add_to_wishlist",
      "add_to_cart",
      "product_view",
      "remove_from_cart",
      "remove_from_wishlist",
    ];

    if(!event.action || !validActions.includes(event.action)) {
      continue;
    }

    try {
      await updateUserAnalytics(event);
    } catch (error) {
      console.error("Error Processing Event: ", error);
    }
  }
}

setInterval(processQueue, 3000);


// Kafka Consumer for user events
export const consumeKafkaMessages = async() => {
  try {
    // Test connection first
    console.log('🔍 Testing Kafka connection...');
    const isConnected = await testKafkaConnection();
    
    if (!isConnected) {
      console.error('❌ Failed to establish Kafka connection. Retrying in 30 seconds...');
      setTimeout(consumeKafkaMessages, 30000);
      return;
    }

    // Create consumer with enhanced configuration
    console.log('📡 Creating Kafka consumer...');
    consumer = await createConsumer("user-events-group");
    
    console.log('📋 Subscribing to topic: users-events');
    await consumer.subscribe({topic: "users-events", fromBeginning: false});

    console.log('🚀 Starting consumer...');
    await consumer.run({
      eachMessage: async({message}: {message: any}) => {
        try {
          if (!message.value) return;
          const event = JSON.parse(message.value.toString());
          eventQueue.push(event);
          console.log('📨 Received event:', event.action);
        } catch (error) {
          console.error('❌ Error processing message:', error);
        }
      }
    });

    console.log('✅ Kafka consumer started successfully');

  } catch (error) {
    console.error('❌ Error in consumeKafkaMessages:', error);
    
    // Attempt to disconnect and retry
    if (consumer) {
      try {
        await consumer.disconnect();
      } catch (disconnectError) {
        console.error('Error disconnecting consumer:', disconnectError);
      }
    }
    
    // Retry after 30 seconds
    console.log('🔄 Retrying Kafka connection in 30 seconds...');
    setTimeout(consumeKafkaMessages, 30000);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('🛑 Received SIGINT, shutting down gracefully...');
  if (consumer) {
    try {
      await consumer.disconnect();
      console.log('✅ Kafka consumer disconnected');
    } catch (error) {
      console.error('❌ Error disconnecting consumer:', error);
    }
  }
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('🛑 Received SIGTERM, shutting down gracefully...');
  if (consumer) {
    try {
      await consumer.disconnect();
      console.log('✅ Kafka consumer disconnected');
    } catch (error) {
      console.error('❌ Error disconnecting consumer:', error);
    }
  }
  process.exit(0);
});

consumeKafkaMessages().catch(console.error);