const { exeQuery } = require('../models/model')

const createError = (status, message) => {
  return { status, message }
}

/*
createTodo
showAllTodo
updateTodo
deleteTodo
*/

const createTodo = async (req, res) => {
  const listId = req.params.list_id
  const todoName = req.body.todoName
  const query =
    'INSERT INTO todo (listid, todoname) VALUES ($1, $2) RETURNING *'
  try {
    const result = await exeQuery(query, [listId, todoName])
    res.status(200).json(result.rows[0])
  } catch (e) {
    res.status(500).json(createError(500, 'todo creation failed'))
  }
}

const showAllTodo = async (req, res) => {
  const listId = req.params.list_id
  const query = 'SELECT * FROM todo WHERE listid = $1'
  try {
    const result = await exeQuery(query, [listId])
    if (result.rowCount > 0) res.status(200).json(result.rows)
    else res.status(200).json({ message: 'todo is empty' })
  } catch (e) {
    res.status(500).json(createError(500, 'fetch failed'))
  }
}

const deleteTodo = async (req, res) => {
  const todoId = req.params.todo_id
  const query = 'DELETE FROM todo WHERE id = $1 RETURNING *'
  try {
    const result = await exeQuery(query, [todoId])
    if (result.rowCount > 0) res.status(200).json(result.rows[0])
    else res.status(404).json(createError(404, 'todo not found'))
  } catch (e) {
    res.status(500).json(createError(500, 'todo deletion failed'))
  }
}

const updateTodo = async (req, res) => {
  const todoId = req.params.todo_id
  const column = req.body.column
  const value = req.body.value
  const query = `UPDATE todo SET ${column} = $1 WHERE id = $2 RETURNING *`
  try {
    const result = await exeQuery(query, [value, todoId])
    if (result.rowCount > 0) res.status(200).json(result.rows[0])
    else res.status(404).json(createError(404, 'todo not found'))
  } catch (e) {
    res.status(500).json(createError(500, 'updation failed'))
  }
}

module.exports = { showAllTodo, createTodo, updateTodo, deleteTodo }
