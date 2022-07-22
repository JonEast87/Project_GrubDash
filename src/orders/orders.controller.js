const path = require('path')

// Use the existing order data
const orders = require(path.resolve('src/data/orders-data'))

// Use this function to assigh ID's when necessary
const nextId = require('../utils/nextId')

// TODO: Implement the /orders handlers needed to make the tests pass

// --- Validation handlers ---

// checks to see if an order exists with a find method
function orderExists() {
	const orderId = Number(req.params.orderId)
	const foundOrder = orders.find((order) => order.id === orderId)
	if (foundOrder) {
		res.locals.url = foundOrder
		return next()
	}
	next({
		status: 404,
		message: `Order id is not found: ${req.params.orderId}`,
	})
}

// checks to see if the necessary property exists in the req.body
function dataExists(propertyName) {
	return function (req, res, next) {
		const { data = {} } = req.body
		if (data[propertyName]) return next()
		next({ status: 400, message: `Must include a ${propertyName}` })
	}
}

// --- HTTP handlers ---

// create handler
function create(req, res) {
	const { data: { deliverTo, mobileNumber, status } = {} } = req.body
	const newOrder = {
		id: nextId(),
		deliverTo,
		mobileNumber,
		status,
	}
	orders.push(newOrder)
	res.status(201).json({ data: newOrder })
}

// read handler
function read(req, res) {
	res.json({ data: res.locals.order })
}

// update handler
function update(req, res) {
	const orderId = Number(req.params.orderId)
	const foundOrder = orders.find((order) => order.id === orderId)

	const { data: { deliverTo, mobileNumber, status } = {} } = req.body

	foundOrder.deliverTo = deliverTo
	foundOrder.mobileNumber = mobileNumber
	foundOrder.status = status

	res.json({ data: foundOrder })
}

// delete handler
function destroy(req, res) {
	const { orderId } = req.params
	const index = orders.findIndex((order) => order.id === Number(orderId))
	if (index > -1) {
		orders.splice(index, 1)
	}
	res.sendStatus(204)
}

// list handler
function list(req, res) {
	res.json({ data: orders })
}

module.exports = {
	read: [orderExists, read],
	update: [
		dataExists('deliverTo'),
		dataExists('mobileNumber'),
		dataExists('status'),
		update,
	],
	delete: destroy,
	list,
	create: [
		dataExists('deliverTo'),
		dataExists('mobileNumber'),
		dataExists('status'),
		// dataExists('dishes'),
		create,
	],
}
