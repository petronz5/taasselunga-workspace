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

// URL RabbitMQ: in Docker arriva da variabile d'ambiente, in locale usa localhost
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';

// Exchange usato dai microservizi per pubblicare eventi di dominio
const EXCHANGE_NAME = 'taasselunga-exchange';

// Routing key dell'evento "stock sotto soglia"
const ROUTING_KEY = 'stock.low';

// Coda dedicata alle notifiche stock
const NOTIFICATION_QUEUE = 'notification.stock.queue';

// Connessione a RabbitMQ e ascolto degli eventi
async function connectRabbitMQ() {
    try {
        // Connessione al broker RabbitMQ
        const connection = await amqp.connect(RABBITMQ_URL);

        // Creazione del canale di comunicazione
        const channel = await connection.createChannel();

        // Exchange topic condiviso con Inventory
        await channel.assertExchange(EXCHANGE_NAME, 'topic', { durable: true });

        // Coda durable per mantenere i messaggi finché non vengono consumati
        await channel.assertQueue(NOTIFICATION_QUEUE, { durable: true });

        // Binding della coda agli eventi di stock basso
        await channel.bindQueue(NOTIFICATION_QUEUE, EXCHANGE_NAME, ROUTING_KEY);

        console.log("Notification Service in ascolto sulla coda:", NOTIFICATION_QUEUE);

        // Consumo dei messaggi dalla coda
        channel.consume(NOTIFICATION_QUEUE, (msg) => {
            if (msg !== null) {

                // Conversione del messaggio da Buffer a stringa
                const messageContent = msg.content.toString();

                console.log("Notifica stock ricevuta:", messageContent);

                // Invio realtime al frontend tramite WebSocket
                io.emit('stock_alert', messageContent);

                // Conferma elaborazione messaggio a RabbitMQ
                channel.ack(msg);
            }
        });

    } catch (error) {
        // Retry automatico se RabbitMQ non è ancora disponibile
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