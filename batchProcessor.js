// const db = require('./clicks.db');

class BatchProcessor {
    constructor() {
        this.clicks = {};
        this.batchSize = 100; // Adjust batch size as needed
        this.batchInterval = 5000; // Adjust interval as needed (in ms)
        this.db;
    }

    addClick(userId) {
        if (!this.clicks[userId]) {
            this.clicks[userId] = 0;
        }
        this.clicks[userId]++;
    }

    processBatch() {
        this.db.serialize(() => {
            const updates = [];
            for (const [user_id, clicks] of Object.entries(this.clicks)) {
                updates.push([user_id, clicks]);
            }

            if (updates.length > 0) {
                const stmt = db.prepare(
                    "INSERT INTO clicks (user_id, click_count) VALUES (?, ?) ON CONFLICT(user_id) DO UPDATE SET click_count = click_count + excluded.click_count",
                );

                updates.forEach((update) => {
                    stmt.run(update[0], update[1]);
                });

                stmt.finalize((err) => {
                    if (err) {
                        console.error("Error processing batch:", err);
                    } else {
                        console.log(
                            `Processed batch of ${updates.length} updates.`,
                        );
                    }
                });
            }

            this.clicks = {};
        });
    }

    start() {
        setInterval(() => this.processBatch(), this.batchInterval);
    }
}

module.exports = new BatchProcessor();
