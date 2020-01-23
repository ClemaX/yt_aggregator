#!/usr/bin/env node
require('log-timestamp');
const fs = require('fs');
const PubSub = require('./pubsub');
const fetchPlaylists = require('./fetch-playlists');

const configPath = 'config.json';
const config = JSON.parse(fs.readFileSync(configPath));

if (!config.apiKey) throw (Error('No api key in ' + configPath + '!'));
if (!config.playlists) throw (Error('No playlists in ' + configPath + '!'));
if (!config.channelIds) throw (Error('No channels in ' + configPath + '!'));
if (!config.pubSubOptions) throw (Error('No PubSub-config in ' + configPath + '!'));

process.on('SIGINT', () => process.exit(2));
process.on('uncaughtException', (e) => {
    console.error(e.stack);
    process.exit(99);
});

const pubsub = PubSub.init(config);

process.on('exit', PubSub.unsubscribe);
pubsub.listen(config.pubSubOptions.port);

pubsub.on('feed', (data) => {
    console.log('Received data: %s', data.body);
    fetchPlaylists(config);
});

fetchPlaylists(config);
