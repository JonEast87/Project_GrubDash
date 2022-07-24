const path = require('path')

// Use the existing order data
const orders = require(path.resolve('src/data/orders-data'))

// Use this function to assigh ID's when necessary
const nextId = require('../utils/nextId')

// TODO: Implement the /orders handlers needed to make the tests pass

// --- Validation handlers ---

// checks to see if an order exists with a find method
function orderExists(req, res, next) {
	const { orderId } = req.params
	const foundOrder = orders.find((order) => order.id === orderId)
	if (foundOrder) {
		res.locals.order = foundOrder
		return next()
	}
	next({
		status: 404,
		message: `Order id is not found: ${orderId}`,
	})
}

// checks to see if the necessary properties exists in the req.body
function bodyExists(req, res, next) {
	const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body
	if (!deliverTo || deliverTo === '') {
		next({
			status: 400,
			message: 'Order must include a deliverTo.',
		})
	}
	if (!mobileNumber || mobileNumber === '') {
		next({
			status: 400,
			message: 'Order must include a mobileNumber.',
		})
	}
	if (!Array.isArray(dishes) || dishes.length === 0) {
		next({
			status: 400,
			message: 'Order must include at least one dish.',
		})
	}
	dishes.map((dish, index) => {
		if (
			!dish.quantity ||
			!Number.isInteger(dish.quantity) ||
			!dish.quantity > 0
		) {
			return next({
				status: 400,
				message: `Dish ${index} must have a quantity that is an integer greater than 0.`,
			})
		}
	})
	res.locals.order = req.body.data
	next()
}

function statusExists(req, res, next) {
	const { orderId } = req.params
	const { data: { id, status } = {} } = req.body

	if (id && id !== orderId) {
		return next({
			status: 400,
			message: `Order id does not match route id. Order ${id}, Route: ${orderId}`,
		})
	} else if (
		!status ||
		status === '' ||
		(status !== 'pending' &&
			status !== 'preparing' &&
			status !== 'out-for-delivery')
	) {
		return next({
			status: 400,
			message:
				'Order must have a status of pending, preparing, out-for-delivery, delivered.',
		})
	} else if (status === 'delivered') {
		return next({
			status: 400,
			message: 'A delivered order cannot be changed.',
		})
	}
	next()
}

function pendingExists(req, res, next) {
	if (res.locals.order.status !== 'pending') {
		return next({
			status: 400,
			message: 'An order cannot be deleted unless it is in pending.',
		})
	}
	next()
}

// --- HTTP handlers ---

// create handler
function create(req, res) {
	const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body
	const newOrder = {
		id: nextId(),
		deliverTo: deliverTo,
		mobileNumber: mobileNumber,
		status: status,
		dishes: dishes,
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
	const originalOrder = res.locals.order
	const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body
	res.locals.order = {
		id: originalOrder.id,
		deliverTo: deliverTo,
		mobileNumber: mobileNumber,
		dishes: dishes,
		status: status,
	}

	res.json({ data: res.locals.order })
}

// delete handler
function destroy(req, res) {
	const index = orders.indexOf(res.locals.order)
	orders.splice(index, 1)
	res.sendStatus(204)
}

// list handler
function list(req, res) {
	res.json({ data: orders })
}

module.exports = {
	list,
	create: [bodyExists, create],
	read: [orderExists, read],
	update: [bodyExists, orderExists, statusExists, update],
	delete: [orderExists, pendingExists, destroy],
}
