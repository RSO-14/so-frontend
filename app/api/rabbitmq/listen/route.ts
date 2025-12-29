import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const AMQPClient = (await import('@cloudamqp/amqp-client')).AMQPClient;
        const amqp = new AMQPClient("amqp://localhost:5672");
        const conn = await amqp.connect();
        const ch = await conn.channel();
        const q = await ch.queue("tasks");
        
        await q.subscribe({ noAck: false }, async (msg) => {
          const message = msg.bodyToString();
          console.log("Received:", message);
          
          // Send message to client via Server-Sent Events
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ message })}\n\n`));
          await msg.ack();
        });

        // Keep connection alive
        request.signal.addEventListener('abort', () => {
          conn.close();
          controller.close();
        });
        
      } catch (error: any) {
        console.error("RabbitMQ error:", error);
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: error.message })}\n\n`));
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}