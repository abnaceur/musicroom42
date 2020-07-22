const playListService = require('../services/playListServices/index');

const getPlaylistById = (req, res, next) => {
    let id = req.params.id
    playListService.getPlaylistService.getPlaylistById(res, id);
}

const getAllPublicPlaylist = (req, res, next) => {
    playListService.getPlaylistService.getAllPublicPlaylist(res);
}

const getMine = (req, res, next) => {
    let user = req.user
    playListService.getPlaylistService.getMine(user, res);
}

const createPlaylist = (req, res, next) => {
    let data = req.body
    let user = req.user
    
    playListService.createPlaylistService.createPlaylist(req, res, data, user);
}

const updatePlaylist = (req, res, next) => {
    let data = req.body
    let user = req.user
    playListService.updatePlaylistService.updatePlaylist(req, res, data, user);
}

const deletePlaylist = (req, res, next) => {
    let data = req.body
    let user = req.user
    playListService.updatePlaylistService.deletePlaylist(req, res, data, user);
}

likePlaylist = (req, res, next) => {
    let user = req.user;
    let data = req.body;
    playListService.likePlaylistTrackService.likePlaylistTrack(res, user, data);
}

positionPlaylist = (req, res, next) => {
    let user = req.user;
    let data = req.body;
    playListService.positionPlaylistTrackService.positionPlaylistTrack(res, user, data);
}

newEvent = (req, res, next) => {
    let user = req.user;
    let data = req.body;
    playListService.createNewEventService.createEvent(res, user, data);
}

const getListPlaylist = (req, res, next) => {
    let user = req.user
    playListService.getListPlaylistService.getListPlaylist(res, user);
}

getAllEvents = (req, res, next) => {
    let user = req.user
    playListService.getEventsService.getEvents(res, user);
}

module.exports = {
    getAllEvents,
    likePlaylist,
    positionPlaylist,
    newEvent,
    getPlaylistById,
    getMine,
    getAllPublicPlaylist,
    getListPlaylist,
    createPlaylist,
    updatePlaylist,
    deletePlaylist
}