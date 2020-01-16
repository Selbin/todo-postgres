const { exeQuery } = require('../models/model')

/*
createList
showAllList
updateList
deleteList
*/

const createError = (status, message) => {
  return { status, message }
}

const createList = async (req, res) => {
  const { listName } = req.body
  const query = 'INSERT INTO list (listname) VALUES ($1) RETURNING id, listname'
  try {
    const result = await exeQuery(query, [listName])
    res.status(200).json(result.rows[0])
  } catch (e) {
    res.status(500).json(createError(500, 'list creation failed'))
  }
}

const showAllList = async (req, res) => {
  const query = ' SELECT * FROM list'
  try {
    const result = await exeQuery(query)
    if (result.rowCount > 0) res.status(200).json(result.rows)
    else res.status(200).json({ message: 'no list present' })
  } catch (e) {
    res.status(500).json(createError(500, 'fetch failed'))
  }
}

const updateList = async (req, res) => {
  const { id, listName } = req.body
  const query =
    'UPDATE list SET listname = $1 WHERE id = $2 RETURNING id, listname'
  try {
    const result = await exeQuery(query, [listName, id])
    if (result.rowCount > 0) res.status(200).json(result.rows[0])
    else res.status(404).json(createError(404, 'list not found'))
  } catch (e) {
    res.status(500).json(createError(500, 'list updation failed'))
  }
}

const deleteList = async (req, res) => {
  const { id } = req.body
  const query = 'DELETE FROM list WHERE id = $1'
  try {
    const result = await exeQuery(query, [id])
    if (result.rowCount > 0) res.status(200).json({ message: 'deleted' })
    else res.status(404).json({ message: 'list not found' })
  } catch (e) {
    res.status(500).json(createError(500, 'list deletion failed'))
  }
}
