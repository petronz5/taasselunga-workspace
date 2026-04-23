const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const amqp = require('amqplib');

const app = express();
const server = http.createServer(app);

// 1. Configuriamo il WebSocket per permettere a React (porta 3000) di connettersi
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

// 2. Connessione a RabbitMQ per ascoltare gli allarmi del magazzino
async function connectRabbitMQ() {
    try {
        const connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://guest:guest@rabbitmq:5672');
        const channel = await connection.createChannel();
        const queue = 'stock.alerts.queue';

        await channel.assertQueue(queue, { durable: true });
        console.log("🐰 Node.js è in ascolto sulla coda:", queue);

        // Quando arriva un messaggio...
        channel.consume(queue, (msg) => {
            if (msg !== null) {
                const messageContent = msg.content.toString();
                console.log("🔔 Allarme ricevuto dal magazzino:", messageContent);

                // 3. LA MAGIA: Inviamo il messaggio in tempo reale al Frontend React!
                io.emit('stock_alert', messageContent);

                channel.ack(msg); // Confermiamo la lettura
            }
        });
    } catch (error) {
        console.error("⏳ Errore RabbitMQ, riprovo tra 5 secondi...", error.message);
        setTimeout(connectRabbitMQ, 5000);
    }
}

// Log visivo quando la pagina React si collega
io.on('connection', (socket) => {
    console.log('💻 Un utente si è connesso alla Dashboard (ID:', socket.id, ')');
});

// Avviamo il server
server.listen(8083, () => {
    console.log('🚀 Notification Service online sulla porta 8083');
    connectRabbitMQ();
});