-- Create a keyspace for the chats
CREATE KEYSPACE IF NOT EXISTS chat WITH REPLICATION = { 'class' : 'SimpleStrategy', 'replication_factor' : '1' };

DROP TABLE IF EXISTS chat.messages;
CREATE TABLE IF NOT EXISTS chat.messages (
    from_user text,
    to_user text,
    message text,
    id text,
    status text,
    created_at timestamp,
    PRIMARY KEY((from_user, to_user), id)
);
CREATE INDEX chat_messages_to_user ON chat.messages (to_user);
CREATE INDEX chat_messages_from_user ON chat.messages (from_user);

-- Create a keyspace for the presence tables
CREATE KEYSPACE IF NOT EXISTS presence WITH REPLICATION = { 'class' : 'SimpleStrategy', 'replication_factor' : '1' };

DROP TABLE IF EXISTS presence.status;
CREATE TABLE IF NOT EXISTS presence.status (
    user text,
    status text,
    last_active_at timestamp,
    PRIMARY KEY(user)
);

-- Dummy data
-- INSERT INTO chat.messages (from_user, to_user, message, id, status, created_at) VALUES ('rafa', 'roger', 'Hey Roger, what is going on?', '1', 'READ', '2023-01-15 09:30:00');
-- INSERT INTO chat.messages (from_user, to_user, message, id, status, created_at) VALUES ('roger', 'rafa', 'Not much, Rafa! Just practicing my serve.', '2', 'READ', '2023-01-15 10:15:00');
-- INSERT INTO chat.messages (from_user, to_user, message, id, status, created_at) VALUES ('rafa', 'roger', 'Good to hear, Roger! How is your form?', '3', 'READ', '2023-01-15 11:20:00');
-- INSERT INTO chat.messages (from_user, to_user, message, id, status, created_at) VALUES ('roger', 'rafa', 'I am feeling great. Ready for the next tournament.', '4', 'READ', '2023-01-15 12:45:00');
-- INSERT INTO chat.messages (from_user, to_user, message, id, status, created_at) VALUES ('rafa', 'roger', 'That is the spirit, Roger! Keep it up.', '5', 'READ', '2023-01-15 14:10:00');
-- INSERT INTO chat.messages (from_user, to_user, message, id, status, created_at) VALUES ('rafa', 'roger', 'How is your family doing?', '6', 'READ', '2023-01-15 15:30:00');
-- INSERT INTO chat.messages (from_user, to_user, message, id, status, created_at) VALUES ('roger', 'rafa', 'My family is doing well, thanks for asking.', '7', 'READ', '2023-01-15 16:45:00');
-- INSERT INTO chat.messages (from_user, to_user, message, id, status, created_at) VALUES ('rafa', 'roger', 'Glad to hear that. Mine is good too.', '8', 'READ', '2023-01-15 17:15:00');
-- INSERT INTO chat.messages (from_user, to_user, message, id, status, created_at) VALUES ('roger', 'rafa', 'How is your training going?', '9', 'READ', '2023-01-15 18:00:00');
-- INSERT INTO chat.messages (from_user, to_user, message, id, status, created_at) VALUES ('rafa', 'roger', 'Training is tough, but it is going well.', '10', 'READ', '2023-01-15 19:30:00');

-- INSERT INTO chat.messages (from_user, to_user, message, id, status, created_at) VALUES ('roger', 'novak', 'Hey Novak, have you ever tried playing tennis with a frying pan?', '51', 'READ', '2023-01-20 09:30:00');
-- INSERT INTO chat.messages (from_user, to_user, message, id, status, created_at) VALUES ('novak', 'roger', 'Haha! No, Roger, but I have heard it can be quite the racket!', '52', 'READ', '2023-01-20 10:15:00');
-- INSERT INTO chat.messages (from_user, to_user, message, id, status, created_at) VALUES ('roger', 'novak', 'Well, its a real smash hit at backyard parties!', '53', 'READ', '2023-01-20 11:20:00');
-- INSERT INTO chat.messages (from_user, to_user, message, id, status, created_at) VALUES ('novak', 'roger', 'Maybe I should give it a try and serve up some fried tennis!', '54', 'READ', '2023-01-20 12:45:00');
-- INSERT INTO chat.messages (from_user, to_user, message, id, status, created_at) VALUES ('roger', 'novak', 'Just make sure not to volley the eggs too far!', '55', 'READ', '2023-01-20 14:10:00');
-- INSERT INTO chat.messages (from_user, to_user, message, id, status, created_at) VALUES ('novak', 'roger', 'And be careful with the backhand, it could be quite the omelette maker!', '56', 'READ', '2023-01-20 15:30:00');
-- INSERT INTO chat.messages (from_user, to_user, message, id, status, created_at) VALUES ('roger', 'novak', 'Haha, true! Well revolutionize tennis cuisine!', '57', 'READ', '2023-01-20 16:45:00');
-- INSERT INTO chat.messages (from_user, to_user, message, id, status, created_at) VALUES ('novak', 'roger', 'A Grand Slam breakfast, anyone?', '58', 'READ', '2023-01-20 17:15:00');
-- INSERT INTO chat.messages (from_user, to_user, message, id, status, created_at) VALUES ('roger', 'novak', 'Aces, Novak! We could open a restaurant - "The Tennis Griddle."', '59', 'READ', '2023-01-20 18:00:00');
-- INSERT INTO chat.messages (from_user, to_user, message, id, status, created_at) VALUES ('novak', 'roger', 'Sounds like a smashing idea! But first, lets finish that match.', '60', 'READ', '2023-01-20 19:30:00');

-- INSERT INTO chat.messages (from_user, to_user, message, id, status, created_at) VALUES ('roger', 'carlos', 'Hey Carlos, have you ever tried playing tennis with a wooden spoon?', '61', 'READ', '2023-01-20 09:30:00');
-- INSERT INTO chat.messages (from_user, to_user, message, id, status, created_at) VALUES ('carlos', 'roger', 'Haha, no Roger, but I have heard it can be a real serving spoon!', '62', 'READ', '2023-01-20 10:15:00');
-- INSERT INTO chat.messages (from_user, to_user, message, id, status, created_at) VALUES ('roger', 'carlos', 'Well, it is perfect for a "grandslam-which" sandwich!', '63', 'READ', '2023-01-20 11:20:00');
-- INSERT INTO chat.messages (from_user, to_user, message, id, status, created_at) VALUES ('carlos', 'roger', 'Maybe I should give it a try and "deuce" up some fun on the court!', '64', 'READ', '2023-01-20 12:45:00');
-- INSERT INTO chat.messages (from_user, to_user, message, id, status, created_at) VALUES ('roger', 'carlos', 'Just be careful not to "lob" the salad too far!', '65', 'READ', '2023-01-20 14:10:00');
-- INSERT INTO chat.messages (from_user, to_user, message, id, status, created_at) VALUES ('carlos', 'roger', 'And avoid the "smash" potatoes, they might be quite the challenge!', '66', 'READ', '2023-01-20 15:30:00');
-- INSERT INTO chat.messages (from_user, to_user, message, id, status, created_at) VALUES ('roger', 'carlos', 'Haha, true! We will serve up some aces and "match" the flavors!', '67', 'READ', '2023-01-20 16:45:00');
-- INSERT INTO chat.messages (from_user, to_user, message, id, status, created_at) VALUES ('carlos', 'roger', 'A "slam-dunk" meal for sure, Roger!', '68', 'READ', '2023-01-20 17:15:00');
-- INSERT INTO chat.messages (from_user, to_user, message, id, status, created_at) VALUES ('roger', 'carlos', 'A "net-ritious" idea, Carlos! Lets open a restaurant - "The Tennis Spoon."', '69', 'READ', '2023-01-20 18:00:00');
-- INSERT INTO chat.messages (from_user, to_user, message, id, status, created_at) VALUES ('carlos', 'roger', 'Sounds like a smashing hit! But first, lets finish our match and then feast!', '70', 'READ', '2023-01-20 19:30:00');

INSERT INTO presence.status (user, status, last_active_at) VALUES ('roger', 'OFFLINE', '2023-10-18 16:30:00');
INSERT INTO presence.status (user, status, last_active_at) VALUES ('novak', 'OFFLINE', '2023-10-17 19:30:00');
INSERT INTO presence.status (user, status, last_active_at) VALUES ('carlos', 'OFFLINE', '2023-10-14 05:30:00');
INSERT INTO presence.status (user, status, last_active_at) VALUES ('andy', 'OFFLINE', '2023-09-12 16:30:00');