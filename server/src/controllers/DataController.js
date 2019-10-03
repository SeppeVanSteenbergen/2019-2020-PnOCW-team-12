const dataHelper = require('../helpers/dataHelper')

module.exports = {
	getAllRooms(req, res) {
		const rooms = dataHelper.getAllRooms()

		res.send(rooms)
	}
}