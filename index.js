const fs = require('fs');
const {google} = require('googleapis');

const configPath = 'config.json'
const config = JSON.parse(fs.readFileSync(configPath));

if (!config.apiKey) throw (Error("No api key in " + configPath + '!'));
if (!config.playlists) throw (Error('No playlists in ' + configPath + '!'))

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
        }, function(err, response) {
            if (err) reject('The API returned an error: ' + err);
            resolve(response.data.items);
        });
    });
}

function parsePlaylists(playlists) {
    var items = [];

    playlists.forEach((playlist) => {
        playlist.forEach((item) => {
            if (item.kind === "youtube#playlistItem")
            {
                items.push({
                    name: item.snippet.title,
                    channel: item.snippet.channelTitle,
                    thumbnail: item.snippet.thumbnails.standard.url,
                    uploadTime: item.snippet.publishedAt
                });
            }
        });
    });
    return items;
}
