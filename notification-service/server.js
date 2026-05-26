const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const amqp = require("amqplib");

const {
    initNotificationsTable,
    createNotification,
    getNotificationsByRole,
    markNotificationAsRead,
    deleteNotificationsByRole,
} = require("./db/notificationRepository");

const app = express();
const server = http.createServer(app);

app.use(express.json());

const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST", "PATCH", "DELETE"],
    },
});

const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://guest:guest@localhost:5672";
const EXCHANGE_NAME = "taasselunga-exchange";

const STOCK_ROUTING_KEY = "stock.low";
const POS_ROUTING_KEY = "pos";
const PROCUREMENT_ROUTING_KEY = "purchase.order.created";

const NOTIFICATION_QUEUE = "notification.stock.queue";

app.post("/notifications", async (req, res) => {
    try {
        const { targetRole, title, message } = req.body;

        if (!targetRole || !title || !message) {
            return res.status(400).json({
                error: "targetRole, title e message sono obbligatori",
            });
        }

        const notification = await createNotification({
            targetRole,
            title,
            message,
        });

        io.emit("stock_alert", notification);

        res.status(201).json(notification);
    } catch (error) {
        console.error("Errore creazione notifica:", error);

        res.status(500).json({
            error: "Errore creazione notifica",
        });
    }
});

app.get("/notifications/procurement", async (req, res) => {
    try {
        const notifications = await getNotificationsByRole("PROCUREMENT");
        res.json(notifications);
    } catch (error) {
        console.error("Errore recupero notifiche procurement:", error);
        res.status(500).json({ error: "Errore recupero notifiche procurement" });
    }
});

app.get("/notifications/inventory", async (req, res) => {
    try {
        const notifications = await getNotificationsByRole("INVENTORY");
        res.json(notifications);
    } catch (error) {
        console.error("Errore recupero notifiche inventory:", error);
        res.status(500).json({ error: "Errore recupero notifiche inventory" });
    }
});

app.patch("/notifications/:id/read", async (req, res) => {
    try {
        const { id } = req.params;
        const notification = await markNotificationAsRead(id);
        res.json(notification);
    } catch (error) {
        console.error("Errore aggiornamento notifica:", error);
        res.status(500).json({ error: "Errore aggiornamento notifica" });
    }
});

app.delete("/notifications/procurement", async (req, res) => {
    try {
        await deleteNotificationsByRole("PROCUREMENT");
        res.sendStatus(204);
    } catch (error) {
        console.error("Errore cancellazione notifiche procurement:", error);
        res.status(500).json({ error: "Errore cancellazione notifiche procurement" });
    }
});

app.delete("/notifications/inventory", async (req, res) => {
    try {
        await deleteNotificationsByRole("INVENTORY");
        res.sendStatus(204);
    } catch (error) {
        console.error("Errore cancellazione notifiche inventory:", error);
        res.status(500).json({ error: "Errore cancellazione notifiche inventory" });
    }
});

app.get("/notifications/pos", async (req, res) => {
    try {
        const notifications = await getNotificationsByRole("POS");
        res.json(notifications);
    } catch (error) {
        console.error("Errore recupero notifiche POS:", error);
        res.status(500).json({ error: "Errore recupero notifiche POS" });
    }
});

app.delete("/notifications/pos", async (req, res) => {
    try {
        await deleteNotificationsByRole("POS");
        res.sendStatus(204);
    } catch (error) {
        console.error("Errore cancellazione notifiche POS:", error);
        res.status(500).json({ error: "Errore cancellazione notifiche POS" });
    }
});

function getTargetRoleFromRoutingKey(routingKey) {
    if (routingKey === PROCUREMENT_ROUTING_KEY) {
        return "INVENTORY";
    }

    if (routingKey === POS_ROUTING_KEY) {
        return "INVENTORY";
    }

    if (routingKey === STOCK_ROUTING_KEY) {
        return "PROCUREMENT";
    }

    return "GENERAL";
}

function getTitleFromRoutingKey(routingKey) {
    if (routingKey === PROCUREMENT_ROUTING_KEY) {
        return "Nuovo ordine in arrivo";
    }

    if (routingKey === POS_ROUTING_KEY) {
        return "Nuova richiesta POS";
    }

    if (routingKey === STOCK_ROUTING_KEY) {
        return "Stock basso";
    }

    return "Nuova notifica";
}

async function connectRabbitMQ() {
    try {
        const connection = await amqp.connect(RABBITMQ_URL);
        const channel = await connection.createChannel();

        await channel.assertExchange(EXCHANGE_NAME, "topic", { durable: true });
        await channel.assertQueue(NOTIFICATION_QUEUE, { durable: true });

        await channel.bindQueue(NOTIFICATION_QUEUE, EXCHANGE_NAME, STOCK_ROUTING_KEY);
        await channel.bindQueue(NOTIFICATION_QUEUE, EXCHANGE_NAME, POS_ROUTING_KEY);
        await channel.bindQueue(NOTIFICATION_QUEUE, EXCHANGE_NAME, PROCUREMENT_ROUTING_KEY);

        console.log("Notification Service in ascolto sulla coda:", NOTIFICATION_QUEUE);
        console.log("Routing keys ascoltate:", STOCK_ROUTING_KEY, POS_ROUTING_KEY, PROCUREMENT_ROUTING_KEY);

        channel.consume(NOTIFICATION_QUEUE, async (msg) => {
            if (msg !== null) {
                try {
                    console.log("RAW MESSAGE:", msg.content.toString());

                    const messageContent = msg.content.toString();
                    const routingKey = msg.fields.routingKey;

                    console.log("Notifica ricevuta:", messageContent);
                    console.log("Routing key ricevuta:", routingKey);

                    if (routingKey === PROCUREMENT_ROUTING_KEY) {
                        const inventoryNotification = await createNotification({
                            targetRole: "INVENTORY",
                            title: "Nuovo ordine in arrivo",
                            message: messageContent,
                        });

                        const procurementNotification = await createNotification({
                            targetRole: "PROCUREMENT",
                            title: "Ordine inviato",
                            message: messageContent,
                        });

                        io.emit("stock_alert", inventoryNotification);
                        io.emit("stock_alert", procurementNotification);
                    } else {
                        const targetRole = getTargetRoleFromRoutingKey(routingKey);
                        const title = getTitleFromRoutingKey(routingKey);

                        const notification = await createNotification({
                            targetRole,
                            title,
                            message: messageContent,
                        });

                        io.emit("stock_alert", notification);
                    }

                    channel.ack(msg);
                } catch (error) {
                    console.error("Errore gestione notifica:", error);
                    channel.nack(msg, false, true);
                }
            }
        });
    } catch (error) {
        console.error("Errore RabbitMQ, riprovo tra 5 secondi...", error.message);
        setTimeout(connectRabbitMQ, 5000);
    }
}

io.on("connection", (socket) => {
    console.log("Un utente si è connesso alla Dashboard. ID:", socket.id);
});

server.listen(8083, async () => {
    console.log("Notification Service online sulla porta 8083");

    await initNotificationsTable();
    connectRabbitMQ();
});