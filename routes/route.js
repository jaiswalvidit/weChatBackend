const express = require('express');
const { addUser, getUser, specificUser, checkUser, getConversation, addMessage, getMessage, getChat, newChat, changeUser, getConvo } = require('../controllers/userControllers');
const { uploadImage,getImage } = require('../controllers/FileControllers'); // Import only uploadImage handler

const storage= require('../utils/upload');
const { newGroup, getGroup, specificGroup, deleteUsers, addUsers, LeaveGroup } = require('../controllers/GroupControllers');
const { route } = require('./storeData');
// const { getGroups } = require('../../client/src/services/api');
const router = express.Router();

router.post('/users', addUser);

router.get('/users', getUser);
router.patch('/users',changeUser);

router.get('/users/:id', specificUser);

router.post('/login', checkUser);

router.post('/chat/add',newChat);
router.post('/chat/get',getChat);
router.post('/message/add', addMessage);
router.get('/group/add/:id',getGroup);
router.get('/convo/:id',getConvo);
router.get('/message/get/:id', getMessage);
router.get('/group/specific/:groupId', specificGroup);
router.patch('/group/specific/users',deleteUsers);
router.patch('/group/specific/add',addUsers);
router.patch('/group/leave',LeaveGroup);


router.post('/file/upload', storage.single("file"), uploadImage);
router.get('/file/:filename',getImage);
module.exports = router;

