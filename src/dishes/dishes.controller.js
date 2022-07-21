const path = require('path')

// Use the existing dishes data
const dishes = require(path.resolve('src/data/dishes-data'))

// Use this function to assign ID's when necessary
const nextId = require('../utils/nextId')

// TODO: Implement the /dishes handlers needed to make the tests pass
// Validation handlers
// dishExists
function dishExists(req, res, next) {
	const dishId = Number(req.params.dishId)
	const foundDish = dishes.find((dish) => dish.id === dishId)
	if (foundDish) {
		res.locals.dish = foundDish
		return next()
	}
	next({
		status: 404,
		message: `Dish id is not found: ${req.params.dishId}`,
	})
}

// dataExists
function dataExists(propertyName) {
	return function (req, res, next) {
		const { data = {} } = req.body
		if (data[propertyName]) return next()
		next({ status: 400, message: `Must include a ${propertyName}` })
	}
}

// HTTP handlers

// listDishes
function list(req, res) {
	res.json({ data: dishes })
}

// readDishes
function read(req, res) {
	const dishId = req.params.dishId
	const foundDish = dishes.find((dish) => dish.id === dishId)
	res.json({ data: res.locals.foundDish })
}

// createDishes
function create(req, res) {
	const { data: { name, description, price, img } = {} } = req.body
	const newDish = {
		id: nextId(),
		name,
		description,
		price,
		img,
	}
	dishes.push(newDish)
	res.status(201).json({ data: newDish })
}

// updateDishes
function update(req, res) {
	const dishId = Number(req.params.dishId)
	const foundDish = dishes.find((dish) => dish.id === dishId)

	const { data: { name, description, price, img } = {} } = req.body
	foundDish.name = name
	foundDish.description = description
	foundDish.price = price
	foundDish.img = img

	res.json({ data: foundDish })
}

module.exports ==
	{
		list,
		read: [dishExists, read],
		create: [
			dataExists('name'),
			dataExists('description'),
			dataExists('price'),
			dataExists('imgage_url'),
			create,
		],
		update: [
			dataExists('name'),
			dataExists('description'),
			dataExists('price'),
			dataExists('imgage_url'),
			update,
		],
	}
