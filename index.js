const fs = require('fs');
const {google} = require('googleapis');
const pubSubHubbub = require('pubsubhubbub');

const configPath = 'config.json'
const config = JSON.parse(fs.readFileSync(configPath));

if (!config.apiKey) throw (Error('No api key in ' + configPath + '!'));
if (!config.playlists) throw (Error('No playlists in ' + configPath + '!'));
if (!config.pubSubOptions) throw (Error('No PubSub-config in ' + configPath + '!'));

const pubsub = pubSubHubbub.createServer(config.pubSubOptions);
const topics = config.playlists.map((id) => 'https://www.youtube.com/feeds/videos.xml?playlist_id=' + id);
const hub = 'http://pubsubhubbub.appspot.com';

pubsub.on("subscribe", (data) => console.log(data.topic + " subscribed"));

pubsub.on('listen', () => {
    console.log("PubSub listening on port %s with callback %s", pubsub.port, pubsub.callbackUrl);
    topics.forEach((topic) => {
        pubsub.subscribe(topic, hub, (err) => {
            if(err) console.log('Failed subscribing');
            else console.log('Subscribing to %s', topic);
        });
    });
});

pubsub.on("error", (error) => {
    console.log("Error");
    console.log(error);
});

pubsub.listen(config.pubSubOptions.port);

const promises = config.playlists.map((id) => getPlaylistItems(id, config.itemCount));

Promise.all(promises).then((playlists) => {
    uploads = parsePlaylists(playlists);
    uploads.sort((a, b) => Date.parse(b.uploadTime) - Date.parse(a.uploadTime));
    fs.writeFileSync(config.outputPath, JSON.stringify(uploads));
}).catch((error) => {throw (Error(error));});

function getPlaylistItems(id, count) {
    return new Promise((resolve, reject) => {
        google.youtube('v3').playlistItems.list({
            key: config.apiKey,
            part: 'snippet',
            maxResults: count,
            playlistId: id
        }, (err, response) => {
            if (err) reject('The API returned an error: ' + err);
            resolve(response.data.items);
        });
    });
}

function parsePlaylists(playlists) {
    var items = [];

    playlists.forEach((playlist) => {
        playlist.forEach((item) => {
            if (item.kind === 'youtube#playlistItem') {
                items.push({
                    name: item.snippet.title,
                    channel: item.snippet.channelTitle,
                    thumbnail: item.snippet.thumbnails.maxres.url,
                    uploadTime: item.snippet.publishedAt
                });
            }
        });
    });
    return items;
}
