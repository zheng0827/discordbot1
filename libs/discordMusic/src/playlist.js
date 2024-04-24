const EventEmitter = require("events");
const fs = require("fs");
const path = require("path")

class playList {
    /**
     * 
     * @param {*} type 
     * @param {*} userId 
     * @returns {Array} list
     */
    static getPlaylists(type = "PUBLIC", userId = null) {
        let file = JSON.parse(fs.readFileSync(path.join(__dirname, "playlists.json"), 'utf-8')) || [];
        let list = [];

        switch (type) {
            case 'PUBLIC':
                list = file.filter(data => data.public);
                break;
            case 'USER':
                list = file.filter(data => data.creator === userId);
                break;
            case 'ALL':
                list = file;
                break;
        }

        return list;
    }

    static getPlaylist(playlistId) {
        if (!playlistId) throw new Error("錯誤的歌單ID");

        let lists = this.getPlaylists("ALL")
        let list = lists.find(data => data.id === playlistId) || {};

        return list;
    }

    static create(name, setPublic, creator) {
        let lists = this.getPlaylists("ALL");

        let playlistId = makeid(10);
        for (var i = 0; lists.map(playlist => playlist.id).includes(playlistId); i++) {
            playlistId = makeid(10);
        }
        
        let data = {
            name,
            id: playlistId,
            songs: [],
            creator,
            public: setPublic ?? false,
            createdTimestamp: Date.now()
        };

        lists.push(data)
        fs.writeFileSync(
            path.join(__dirname, "playlists.json"),
            JSON.stringify(lists, null, 2)
            , "utf-8"
        )
        return data;
    }

    static delete(playlistId) {
        let lists = this.getPlaylists("ALL");

        let playlist = lists.find(data => data.id === playlistId) || {};
        lists = lists.filter(data => data.id !== playlistId);

        fs.writeFileSync(path.join(__dirname, "playlists.json"), JSON.stringify(lists, null, 2), 'utf-8');
        return playlist;
    }

    static async add(playlistId, tracks) {
        if (!playlistId) throw new Error("錯誤的歌單ID");

        let lists = this.getPlaylists("ALL");
        let playlist = await lists.find(data => data.id === playlistId || (data.name === playlistId)) || {};
        let indexOf = lists.indexOf(playlist);

        tracks.forEach(async track => {
            let data = {};
            data["title"] = track["title"];
            data["author"] = track["author"];
            data["url"] = track["url"];
            data["thumbnail"] = track["thumbnail"];
            data["duration"] = track["duration"];
            data["playlist"] = track["playlist"];
            
            await playlist["songs"].push(data)
        });
        lists[indexOf] = playlist;

        fs.writeFileSync(path.join(__dirname, "playlists.json"), JSON.stringify(lists, null, 2), 'utf-8')
        return playlist;
    }

    static remove(playlistId, songTitle) {
        if (!playlistId) throw new Error("錯誤的歌單ID");

        let lists = this.getPlaylists("ALL");
        let playlist = lists.find(data => data.id === playlistId) || {};
        let indexOf = lists.indexOf(playlist);

        lists[indexOf] = playlist.filter(track => track.title !== songTitle);

        fs.writeFileSync(path.join(__dirname, "playlists.json"), JSON.stringify(lists, null, 2), 'utf-8')
        return playlist;
    }

    static shuffle(playlistId) {
        if (!playlistId) throw new Error("錯誤的歌單ID");
        
        let shuffled = [];
        let lists = this.getPlaylists("ALL");
        let playlist = lists.find(data => data.id === playlistId) || {};
        let indexOf = lists.indexOf(playlist);
        let shuffleArray = (arr) => arr.sort(() => 0.5 - Math.random());

        shuffled = shuffleArray(playlist["songs"]);
        playlist["songs"] = shuffled;
        lists[indexOf] = playlist;

        fs.writeFileSync(path.join(__dirname, "playlists.json"), JSON.stringify(lists, null, 2), 'utf-8')
        return playlist;
    }
}

function makeid(length) {
    var result = '';
    var characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * 36));
    }
    return result;
}

module.exports = playList;