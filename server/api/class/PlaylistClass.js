const mongoose = require('mongoose');
const utils = require('../utils/utils');

async function CreateNewPlaylist(data) {
    return new Promise(async (resolve, reject) => {
        resolve({
            _id: new mongoose.Types.ObjectId,
            name: data.name,
            public: data.public,
            creator: data.creator,
        })
    })
}


module.exports = {
    CreateNewPlaylist
}