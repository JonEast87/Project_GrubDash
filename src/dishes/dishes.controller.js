const path = require('path')

// Use the existing dishes data
const dishes = require(path.resolve('src/data/dishes-data'))

// Use this function to assign ID's when necessary
const nextId = require('../utils/nextId')

// TODO: Implement the /dishes handlers needed to make the tests pass

// --- Validation handlers ---

// checks to see if an order exists with a find method
function bodyHasDish(req, res, next) {
	const { dishId } = req.params
	const foundDish = dishes.find((dish) => dish.id === dishId)
	if (foundDish) {
		res.locals.dish = foundDish
		return next()
	}
	next({
		status: 404,
		message: `Dish id is not found: ${dishId}.`,
	})
}

// checks to see if the necessary property exists in the req.body
function bodyHasData(propertyName) {
	return function (req, res, next) {
		const { data = {} } = req.body
		if (data[propertyName] && data['price'] > 0) {
			next()
		}
		if (data['price'] < 1 || !data['price']) {
			next({ status: 400, message: 'Dish must include a price.' })
		}
		next({ status: 400, message: `Dish must include a ${propertyName}.` })
	}
}

function bodyHasID(req, res, next) {
	const { dishId } = req.params
	const {
		data: { id },
	} = req.body
	if (!id || Number(id) === Number(dishId)) {
		// res.locals.dishId = dishId
		return next()
	}
	next({
		status: 400,
		message: `Dish id does not match route id. Dish ${id}. Route ${dishId}.`,
	})
}

function bodyIDisNumber(req, res, next) {
	const dish = res.locals.dish
	if (typeof dish.price !== 'string') {
		return next()
	}
	next({ status: 400, message: 'Updated dish price must be a number.' })
}

// --- HTTP handlers ---

// create handler
function create(req, res) {
	const { data: { name, description, price, image_url } = {} } = req.body
	const newDish = {
		id: nextId(),
		name,
		description,
		price,
		image_url,
	}
	dishes.push(newDish)
	res.status(201).json({ data: newDish })
}

// read handler
function read(req, res) {
	res.json({ data: res.locals.dish })
}

// update handler
function update(req, res, next) {
	const dish = res.locals.dish
	const { dishId } = req.params
	// const foundDish = dishes.find((dish) => dish.id === dishId)
	const {
		data: { id, name, description, price, image_url },
	} = req.body

	if (id !== dishId) {
		next({ status: 400 })
	}

	dish.name = name
	dish.description = description
	dish.price = price
	dish.image_url = image_url

	res.json({ data: dish })
}

// list handler
function list(req, res) {
	res.json({ data: dishes })
}

module.exports = {
	list,
	read: [bodyHasDish, read],
	create: [
		bodyHasData('name'),
		bodyHasData('description'),
		bodyHasData('price'),
		bodyHasData('image_url'),
		create,
	],
	update: [
		bodyHasDish,
		bodyHasID,
		bodyHasData('name'),
		bodyHasData('description'),
		bodyHasData('price'),
		bodyHasData('image_url'),
		bodyIDisNumber,
		update,
	],
}
