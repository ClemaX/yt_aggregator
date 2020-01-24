const pubSubHubbub = require('websub');

const hub = 'http://pubsubhubbub.appspot.com';
var pubsub = null;
var channels = [];

function init(config) {
    pubsub = pubSubHubbub.createServer(config.pubSubOptions);
    channels = config.channelIds.map((id) => 'https://www.youtube.com/xml/feeds/videos.xml?channel_id=' + id);

    pubsub.on('subscribe', (data) => console.log(data.topic + ' subscribed'));
    pubsub.on('unsubscribe', (data) => console.log(data.topic + ' unsubscribed'));

    pubsub.on('listening', () => {
        channels.forEach((topic) => {
            pubsub.subscribe(topic, hub);
        });
    });

    pubsub.on('error', (error) => {
        console.error('PubSub Error: ');
        console.error(error);
        process.exit(99);
    });

    pubsub.on('denied', (data) => {
        console.log('Access denied: %s', data);
    });

    return pubsub;
}

async function unsubscribe() {
    await Promise.all(channels.map((topic) => {
        pubsub.unsubscribe(topic, hub, (err) => {
            if (err) console.error('Error while unsubscribing from %s', topic);
        });
    }));
}

module.exports = {
    init,
    unsubscribe
};