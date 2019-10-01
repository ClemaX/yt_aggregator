const fs = require('fs');
const {google} = require('googleapis');

module.exports = fetchPlaylists;

function fetchPlaylists(config) {
    const promises = config.playlists.map((id) => getPlaylistItems(config.apiKey, id, config.itemCount));
    var uploads = [];

    Promise.all(promises).then((playlists) => {
        uploads = parsePlaylists(playlists);
        uploads.sort((a, b) => Date.parse(b.uploadTime) - Date.parse(a.uploadTime));
        console.log('Updated database');
        fs.writeFileSync(config.outputPath, JSON.stringify(uploads));
    }).catch((error) => {throw (Error(error));});
}

function getPlaylistItems(apiKey, id, count) {
    return new Promise((resolve, reject) => {
        google.youtube('v3').playlistItems.list({
            key: apiKey,
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
                    uploadTime: item.snippet.publishedAt,
                    id: item.snippet.resourceId.videoId
                });
            }
        });
    });
    return items;
}