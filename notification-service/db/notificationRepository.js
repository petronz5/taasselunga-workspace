const pool = require("./postgres");

// Creo la tabella notifications per salvare le notifiche in modo permanente nel database.

async function initNotificationsTable() {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS notifications (
            id SERIAL PRIMARY KEY,

            -- Microservizio / ruolo destinatario
            target_role VARCHAR(50) NOT NULL,

            -- Titolo notifica
            title VARCHAR(255) NOT NULL,

            -- Messaggio notifica
            message TEXT NOT NULL,

            -- Stato lettura
            is_read BOOLEAN NOT NULL DEFAULT FALSE,

            -- Data creazione notifica
            created_at TIMESTAMP NOT NULL DEFAULT NOW()
        );
    `);
}

/*
    Salvo una nuova notifica nel database.

    Questa funzione verrà chiamata quando:
    - arriva un evento RabbitMQ
    - un microservizio genera una notifica
*/
async function createNotification({
                                      targetRole,
                                      title,
                                      message,
                                  }) {
    const result = await pool.query(
        `
        INSERT INTO notifications (
            target_role,
            title,
            message,
            is_read
        )
        VALUES ($1, $2, $3, $4)

        RETURNING
            id,
            target_role AS "targetRole",
            title,
            message,
            is_read AS "read",
            created_at AS "createdAt";
        `,
        [
            targetRole,
            title,
            message,
            false,
        ]
    );

    return result.rows[0];
}

/*
    Recupero le notifiche di uno specifico microservizio / ruolo.

    Esempi:
    - PROCUREMENT
    - POS
    - WAREHOUSE
*/
async function getNotificationsByRole(role) {
    const result = await pool.query(
        `
        SELECT
            id,
            target_role AS "targetRole",
            title,
            message,
            is_read AS "read",
            created_at AS "createdAt"

        FROM notifications

        WHERE target_role = $1

        ORDER BY created_at DESC;
        `,
        [role]
    );

    return result.rows;
}

/*
    Segno una notifica come letta.

    Verrà chiamata quando l’utente clicca:
    "Segna come letta"
*/
async function markNotificationAsRead(id) {
    const result = await pool.query(
        `
        UPDATE notifications

        SET is_read = TRUE

        WHERE id = $1

        RETURNING
            id,
            target_role AS "targetRole",
            title,
            message,
            is_read AS "read",
            created_at AS "createdAt";
        `,
        [id]
    );

    return result.rows[0];
}

/*
    Cancello tutte le notifiche
    di uno specifico ruolo/microservizio.

    Serve per:
    - procurement
    - pos
    - warehouse
    ecc.
*/
async function deleteNotificationsByRole(role) {
    await pool.query(
        `
        DELETE FROM notifications
        WHERE target_role = $1;
        `,
        [role]
    );
}

/*
    Esporto tutte le funzioni repository.

    Verranno usate in server.js
    per separare:
    - logica database
    - logica API/socket/rabbitmq
*/
module.exports = {
    initNotificationsTable,
    createNotification,
    getNotificationsByRole,
    markNotificationAsRead,
    deleteNotificationsByRole,
};