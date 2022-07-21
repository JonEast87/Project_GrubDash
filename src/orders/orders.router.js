const router = require('express').Router()
const controller = require('./orders.controller')
const methodNotAllowed = require('../errors/methodNotAllowed')

// TODO: Implement the /orders routes needed to make the tests pass
// /orders/:orderId (attach create, read, update, delete)
router
	.route('/:orderId')
	.get(controller.read)
	.put(controller.update)
	.delete(controller.delete)
	.all(methodNotAllowed)

// /orders route (azttach listOrders)
router
	.route('/')
	.get(controller.list)
	.post(controller.create)
	.all(methodNotAllowed)

module.exports = router
