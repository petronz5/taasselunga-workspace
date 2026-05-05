const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const amqp = require('amqplib');
const app = express();
const server = http.createServer(app);

// Configuriamo il WebSocket per permettere a React di connettersi (sulla porta 3000)
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

// URL di connessione a RabbitMQ con variabile d’ambiente se presente, altrimenti trramite localhost
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';

// Nome dell’exchange usato da Inventory per pubblicare eventi
const EXCHANGE_NAME = 'taasselunga-exchange';

// Routing key per l’evento "stock sotto soglia"
const ROUTING_KEY = 'stock.low';

// Coda dedicata alle notifiche
const NOTIFICATION_QUEUE = 'notification.stock.queue';

// Funzione che gestisce la connessione a RabbitMQ
async function connectRabbitMQ() {
    try {
        // Connessione al broker RabbitMQ
        const connection = await amqp.connect(RABBITMQ_URL);

        // Creazione di un channel/topic di comunicazione
        const channel = await connection.createChannel();

        // Verifica che l’exchange esista (tipo topic per usare routing key)
        await channel.assertExchange(EXCHANGE_NAME, 'topic', { durable: true });

        // Crea la coda durable così da conservare i messaggi
        await channel.assertQueue(NOTIFICATION_QUEUE, { durable: true });

        // Binding per eventi da Inventory (stock basso)
        await channel.bindQueue(NOTIFICATION_QUEUE, EXCHANGE_NAME, 'stock.low');

        // Binding per eventi da Point of Sale
        await channel.bindQueue(NOTIFICATION_QUEUE, EXCHANGE_NAME, 'pos');

        console.log("Notification Service in ascolto sulla coda:", NOTIFICATION_QUEUE);

        // Inizia ad ascoltare i messaggi in arrivo dalla coda
        channel.consume(NOTIFICATION_QUEUE, (msg) => {
            if (msg !== null) {

                // Converte il messaggio da buffer a stringa leggibile
                const messageContent = msg.content.toString();

                // Log di debug
                console.log("Notifica stock ricevuta:", messageContent);

                // Invia il messaggio al frontend React in tempo reale tramite WebSocket
                io.emit('stock_alert', messageContent);

                // Conferma a RabbitMQ con un acknoeldgemnt che il messaggio è stato processato
                channel.ack(msg);
            }
        });

    } catch (error) {
        // Se RabbitMQ non è disponibile, riprova dopo 5 secondi
        console.error("Errore RabbitMQ, riprovo tra 5 secondi...", error.message);
        setTimeout(connectRabbitMQ, 5000);
    }
}

// Evento che si attiva quando un client (frontend React) si connette via WebSocket
io.on('connection', (socket) => {
    console.log('Un utente si è connesso alla Dashboard. ID:', socket.id);
});

// Avvio del server Node sulla porta 8083
server.listen(8083, () => {
    console.log('Notification Service online sulla porta 8083');

    // Avvia la connessione a RabbitMQ
    connectRabbitMQ();
});