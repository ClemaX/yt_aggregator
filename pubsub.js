const pubSubHubbub = require('pubsubhubbub');

const hub = 'http://pubsubhubbub.appspot.com';
var pubsub = null;
var topics = [];

function init(config) {
    pubsub = pubSubHubbub.createServer(config.pubSubOptions);
    topics = config.playlists.map((id) => 'https://www.youtube.com/feeds/videos.xml?playlist_id=' + id);

    pubsub.on('subscribe', (data) => console.log(data.topic + ' subscribed'));
    pubsub.on('unsubscribe', (data) => console.log(data.topic + ' unsubscribed'));

    pubsub.on('listen', () => {
        topics.forEach((topic) => {
            pubsub.subscribe(topic, hub, (err) => {
                if(err) console.log('Failed subscribing');
            });
        });
    });

    pubsub.on('error', (error) => {
        console.error('PubSub Error: ');
        console.error(error);
        process.exit(99);
    });

    return pubsub;
}

function unsubscribe() {
    topics.forEach((topic) => pubsub.unsubscribe(topic));
}

module.exports = {
    init,
    unsubscribe
};