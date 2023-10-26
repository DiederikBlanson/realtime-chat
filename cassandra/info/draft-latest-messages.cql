-- Create a table
DROP TABLE IF EXISTS chat.latest_messages;
CREATE TABLE IF NOT EXISTS chat.latest_messages (
    username text,
    target_user text,
    sent bigint,
    message text,
    id bigint,
    created_at timestamp,
    PRIMARY KEY(username, target_user)
);

INSERT INTO chat.latest_messages (username, target_user, sent, message, id, created_at) VALUES ('rafa', 'roger', 1, 'hey roger whats going on?', '53223', toTimeStamp(now()));
INSERT INTO chat.latest_messages (username, target_user, sent, message, id, created_at) VALUES ('roger', 'rafa', 0, 'hey roger whats going on?', '53223', toTimeStamp(now()));
INSERT INTO chat.latest_messages (username, target_user, sent, message, id, created_at) VALUES ('roger', 'rafa', 1, 'hey raf everything allright!', '53223', toTimeStamp(now()));
INSERT INTO chat.latest_messages (username, target_user, sent, message, id, created_at) VALUES ('rafa', 'roger', 0, 'hey raf everything allright!', '53223', toTimeStamp(now()));

//await rabbitMQChannel.sendToQueue(`${msg.data.from}-messages`, Buffer.from(JSON.stringify(received)))
// await client.execute("INSERT INTO chat.latest_messages (username, target_user, sent, message, id, created_at) VALUES (?, ?, 1, ?, ?, ?)", [
//     parseBuffer.from.toString(), parseBuffer.to.toString(), parseBuffer.text.toString(), parseBuffer.id, new Date(parseBuffer.timestamp)
// ])
// await client.execute("INSERT INTO chat.latest_messages (username, target_user, sent, message, id, created_at) VALUES (?, ?, 0, ?, ?, ?)", [
//     parseBuffer.to.toString(), parseBuffer.from.toString(), parseBuffer.text.toString(), parseBuffer.id, new Date(parseBuffer.timestamp)
// ])

// const latest_messages = (await client.execute(`SELECT * FROM chat.latest_messages WHERE username=? LIMIT 10`, [name])).rows.map(m => ({ // todo: perform sorting somehwere
        //     id: m.id,
        //     from: m.sent? name : m.target_user,
        //     to:  !m.sent ? name : m.target_user,
        //     text: m.message,
        //     timestamp: m.created_at
        // }))