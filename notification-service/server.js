const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const amqp = require('amqplib');

const app = express();
const server = http.createServer(app);

// WebSocket per permettere al frontend React di ricevere notifiche realtime
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

// URL RabbitMQ (in Docker tramite variabile d'ambiente || in locale con localhost)
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';

// Exchange condiviso dai microservizi
const EXCHANGE_NAME = 'taasselunga-exchange';

// Routing key ascoltate dal Notification Service
const STOCK_ROUTING_KEY = 'stock.low';
const POS_ROUTING_KEY = 'pos';
const PROCUREMENT_ROUTING_KEY = 'purchase.order.created';

// Coda dedicata alle notifiche
const NOTIFICATION_QUEUE = 'notification.stock.queue';

// Connessione a RabbitMQ e ascolto degli eventi
async function connectRabbitMQ() {
    try {
        const connection = await amqp.connect(RABBITMQ_URL);
        const channel = await connection.createChannel();

        // Exchange topic condiviso con Inventory, POS e Procurement
        await channel.assertExchange(EXCHANGE_NAME, 'topic', { durable: true });

        // Definiamo le code durable così da mantenere i messaggi finché non vengono consumati
        await channel.assertQueue(NOTIFICATION_QUEUE, { durable: true });

        // La coda riceve eventi di stock basso
        await channel.bindQueue(NOTIFICATION_QUEUE, EXCHANGE_NAME, STOCK_ROUTING_KEY);

        // La coda riceve eventi generati dal POS
        await channel.bindQueue(NOTIFICATION_QUEUE, EXCHANGE_NAME, POS_ROUTING_KEY);

        // La coda riceve eventi generati da Procurement
        await channel.bindQueue(NOTIFICATION_QUEUE, EXCHANGE_NAME, PROCUREMENT_ROUTING_KEY);

        console.log("Notification Service in ascolto sulla coda:", NOTIFICATION_QUEUE);
        console.log("Routing keys ascoltate:", STOCK_ROUTING_KEY, POS_ROUTING_KEY, PROCUREMENT_ROUTING_KEY);

        channel.consume(NOTIFICATION_QUEUE, (msg) => {
            if (msg !== null) {
                const messageContent = msg.content.toString();

                console.log("Notifica ricevuta:", messageContent);

                // Invio della notifica vera e propira in realtime al frontend tramite WebSocket
                io.emit('stock_alert', messageContent);

                channel.ack(msg);
            }
        });

    } catch (error) {
        console.error("Errore RabbitMQ, riprovo tra 5 secondi...", error.message);
        setTimeout(connectRabbitMQ, 5000);
    }
}

// Log connessione frontend via WebSocket
io.on('connection', (socket) => {
    console.log('Un utente si è connesso alla Dashboard. ID:', socket.id);
});

// Avvio server Node
server.listen(8083, () => {
    console.log('Notification Service online sulla porta 8083');
    connectRabbitMQ();
});