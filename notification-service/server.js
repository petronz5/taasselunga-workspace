const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const amqp = require("amqplib");

// Importo le funzioni database per salvare e leggere le notifiche
const {
    initNotificationsTable,
    createNotification,
    getNotificationsByRole,
    markNotificationAsRead,
    deleteNotificationsByRole,
} = require("./db/notificationRepository");

const app = express();
const server = http.createServer(app);

// Permetto al server di leggere JSON nelle richieste HTTP
app.use(express.json());

// CORS per permettere al frontend React/Next di chiamare le API
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "http://localhost:3000");
    res.header("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

    if (req.method === "OPTIONS") {
        return res.sendStatus(204);
    }

    next();
});

// WebSocket per permettere al frontend React di ricevere notifiche realtime
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST", "PATCH", "DELETE"],
    },
});

// URL RabbitMQ (in Docker tramite variabile d'ambiente || in locale con localhost)
const RABBITMQ_URL =
    process.env.RABBITMQ_URL || "amqp://guest:guest@localhost:5672";

// Exchange condiviso dai microservizi
const EXCHANGE_NAME = "taasselunga-exchange";

// Routing key ascoltate dal Notification Service
const STOCK_ROUTING_KEY = "stock.low";
const POS_ROUTING_KEY = "pos";
const PROCUREMENT_ROUTING_KEY = "purchase.order.created";

// Coda dedicata alle notifiche
const NOTIFICATION_QUEUE = "notification.stock.queue";

/*
    Recupero tutte le notifiche Procurement.

    Il frontend chiamerà questa API quando Alessia
    apre la pagina notifiche.
*/
app.get("/notifications/procurement", async (req, res) => {
    try {
        const notifications = await getNotificationsByRole("PROCUREMENT");

        res.json(notifications);
    } catch (error) {
        console.error("Errore recupero notifiche:", error);

        res.status(500).json({
            error: "Errore recupero notifiche",
        });
    }
});

/*
    Segno una notifica come letta.

    Il frontend chiamerà questa API quando Alessia
    clicca sul check "Segna come letta".
*/
app.patch("/notifications/:id/read", async (req, res) => {
    try {
        const { id } = req.params;

        const notification = await markNotificationAsRead(id);

        res.json(notification);
    } catch (error) {
        console.error("Errore aggiornamento notifica:", error);

        res.status(500).json({
            error: "Errore aggiornamento notifica",
        });
    }
});

/*
    Cancello tutte le notifiche Procurement.

    Serve per il bottone "Svuota notifiche".
*/
app.delete("/notifications/procurement", async (req, res) => {
    try {
        await deleteNotificationsByRole("PROCUREMENT");

        res.sendStatus(204);
    } catch (error) {
        console.error("Errore cancellazione notifiche:", error);

        res.status(500).json({
            error: "Errore cancellazione notifiche",
        });
    }
});

/*
    Converto la routing key RabbitMQ in ruolo destinatario.

    Così domani puoi avere:
    - PROCUREMENT
    - POS
    - INVENTORY
    senza riscrivere tutta la logica.
*/
function getTargetRoleFromRoutingKey(routingKey) {
    if (routingKey === PROCUREMENT_ROUTING_KEY) {
        return "PROCUREMENT";
    }

    if (routingKey === POS_ROUTING_KEY) {
        return "POS";
    }

    if (routingKey === STOCK_ROUTING_KEY) {
        return "PROCUREMENT";
    }

    return "GENERAL";
}

/*
    Creo un titolo leggibile in base al tipo di evento.

    Il messaggio arriva da RabbitMQ,
    il titolo invece lo gestiamo qui.
*/
function getTitleFromRoutingKey(routingKey) {
    if (routingKey === PROCUREMENT_ROUTING_KEY) {
        return "Nuovo ordine procurement";
    }

    if (routingKey === POS_ROUTING_KEY) {
        return "Nuovo evento POS";
    }

    if (routingKey === STOCK_ROUTING_KEY) {
        return "Stock basso";
    }

    return "Nuova notifica";
}

// Connessione a RabbitMQ e ascolto degli eventi
async function connectRabbitMQ() {
    try {
        const connection = await amqp.connect(RABBITMQ_URL);
        const channel = await connection.createChannel();

        // Exchange topic condiviso con Inventory, POS e Procurement
        await channel.assertExchange(EXCHANGE_NAME, "topic", { durable: true });

        // Definiamo la coda durable così da mantenere i messaggi finché non vengono consumati
        await channel.assertQueue(NOTIFICATION_QUEUE, { durable: true });

        // La coda riceve eventi di stock basso
        await channel.bindQueue(
            NOTIFICATION_QUEUE,
            EXCHANGE_NAME,
            STOCK_ROUTING_KEY
        );

        // La coda riceve eventi generati dal POS
        await channel.bindQueue(
            NOTIFICATION_QUEUE,
            EXCHANGE_NAME,
            POS_ROUTING_KEY
        );

        // La coda riceve eventi generati da Procurement
        await channel.bindQueue(
            NOTIFICATION_QUEUE,
            EXCHANGE_NAME,
            PROCUREMENT_ROUTING_KEY
        );

        console.log("Notification Service in ascolto sulla coda:", NOTIFICATION_QUEUE);
        console.log(
            "Routing keys ascoltate:",
            STOCK_ROUTING_KEY,
            POS_ROUTING_KEY,
            PROCUREMENT_ROUTING_KEY
        );

        channel.consume(NOTIFICATION_QUEUE, async (msg) => {
            if (msg !== null) {
                try {
                    const messageContent = msg.content.toString();
                    const routingKey = msg.fields.routingKey;

                    console.log("Notifica ricevuta:", messageContent);
                    console.log("Routing key ricevuta:", routingKey);

                    // Capisco a quale ruolo/microservizio appartiene la notifica
                    const targetRole = getTargetRoleFromRoutingKey(routingKey);

                    // Creo un titolo leggibile per la UI
                    const title = getTitleFromRoutingKey(routingKey);

                    // Salvo la notifica nel database
                    const notification = await createNotification({
                        targetRole,
                        title,
                        message: messageContent,
                    });

                    // Invio la notifica salvata in realtime al frontend
                    io.emit("stock_alert", notification);

                    // Confermo a RabbitMQ che il messaggio è stato gestito
                    channel.ack(msg);
                } catch (error) {
                    console.error("Errore gestione notifica:", error);

                    // Rimetto il messaggio in coda se il salvataggio fallisce
                    channel.nack(msg, false, true);
                }
            }
        });
    } catch (error) {
        console.error(
            "Errore RabbitMQ, riprovo tra 5 secondi...",
            error.message
        );

        setTimeout(connectRabbitMQ, 5000);
    }
}

// Log connessione frontend via WebSocket
io.on("connection", (socket) => {
    console.log("Un utente si è connesso alla Dashboard. ID:", socket.id);
});

// Avvio server Node
server.listen(8083, async () => {
    console.log("Notification Service online sulla porta 8083");

    // Creo la tabella notifications se non esiste
    await initNotificationsTable();

    // Avvio l’ascolto degli eventi RabbitMQ
    connectRabbitMQ();
});