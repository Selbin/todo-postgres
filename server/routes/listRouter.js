const express = require('express')
const router = express.Router()
const listHandler = require('../controller/listHandler')

// shows all list
router.get('/', listHandler.showAllList)

// creates a new list
router.post('/', listHandler.createList)

// updates a existing list
router.put('/:list_id', listHandler.updateList)

// delete a list
router.delete('/:list_id', listHandler.deleteList)

module.exports = router
