const addList = document.getElementById('add-list')
const search = document.getElementById('search')
const mainContainer = document.getElementById('app-main-container')
const baseUrl = 'http://localhost:8000/'
let allList

// function to create elements
function createElement (type, props, ...children) {
  const dom = document.createElement(type)
  if (props) Object.assign(dom, props)
  for (const child of children) {
    if (typeof child !== 'string') dom.appendChild(child)
    else dom.appendChild(document.createTextNode(child))
  }
  return dom
}

// function to dynamically provide arguments to fetch
async function fetchData (url, method, header, body) {
  const response = await window.fetch(url, {
    method,
    headers: {
      'Content-Type': header
    },
    body
  })
  return response
}

// for displaying all list after loading
async function showAllList () {
  const response = await fetchData(baseUrl + 'list', 'GET', 'application/json')
  if (response.status === 200) {
    const result = await response.json()
    for (const list of result) {
      renderList(list)
    }
  }
}

// function written for supporting search
// allList will have all lists
async function loadAllList () {
  const response = await fetchData(baseUrl + 'list', 'GET', 'application/json')
  if (response.status === 200) {
    allList = await response.json()
  }
}

// to edit list
function editList (event) {
  event.target.parentNode.parentNode.querySelector('input').className =
    'list-input-edit-active'
  event.target.parentNode.parentNode.querySelector('input').onclick = event =>
    event.stopPropagation()
  event.target.parentNode.parentNode.querySelector('input').disabled = false
  event.stopPropagation()
}

async function updateList (event) {
  if (event.keyCode === 13) {
    if (event.target.value === '') return
    event.target.disabled = true
    event.target.className = 'list-input-edit'
    const listName = event.target.value
    await fetchData(`${baseUrl}list/${event.target.id.slice(2)}`, 'PUT', 'application/json', JSON.stringify({
      listName
    }))
  }
}

// to delete list
async function deleteList (event) {
  const id = event.target.id.slice(2)
  const response = await fetchData(
    `${baseUrl}list/${id}`,
    'DELETE',
    'application/json'
  )
  if (response.status === 200) {
    document.getElementById('lc' + id).remove()
  }
  event.stopPropagation()
}

// to render list
function renderList (list) {
  mainContainer.appendChild(
    createElement(
      'div',
      {
        id: `lc${list.id}`,
        className: 'list-container'
      },
      createElement(
        'div',
        {
          id: `lh${list.id}`,
          className: 'list-header',
          onclick: showTask
        },
        createElement('input', {
          id: `hd${list.id}`,
          className: 'list-input-edit',
          type: 'text',
          disabled: 'disabled',
          value: list.listname,
          onkeydown: updateList
        }),
        createElement(
          'div',
          {
            className: 'list-operations'
          },
          createElement('i', {
            id: `ed${list.id}`,
            className: 'far fa-edit',
            onclick: editList
          }),
          createElement('i', {
            id: `dl${list.id}`,
            className: 'fas fa-trash-alt',
            onclick: deleteList
          })
        )
      ),
      createElement('div', { id: `to${list.id}`, className: 'list-todos' })
    )
  )
}

// to render todos
function rendertodo (todo) {
  let complete
  todo.completed ? (complete = 'line-through') : (complete = 'none')
  document.getElementById('todo' + todo.listid).appendChild(
    createElement(
      'div',
      { id: `toct${todo.id}`, className: `todo-container ${todo.priority}` },
      createElement(
        'div',
        {},
        createElement('input', {
          type: 'checkbox',
          checked: todo.completed,
          name: 'todo-complete',
          onclick: todoComplete
        })
      ),
      createElement(
        'div',
        {},
        createElement('input', {
          id: `tx${todo.id}`,
          type: 'text',
          value: todo.todoname,
          className: 'task-input',
          style: `text-decoration: ${complete};`,
          disabled: 'disabled',
          onkeydown: updateTask
        })
      ),
      createElement(
        'div',
        { className: 'todo-operations' },
        createElement('i', {
          id: `cl${todo.id}`,
          className: 'far fa-calendar'
        }),
        createElement('input', {
          id: `in${todo.id}`,
          type: 'date',
          value: todo.scheduled,
          min: `${new Date().getFullYear()}-${'0' +
            String(new Date().getMonth() + 1).slice(
              -2
            )}-${new Date().getDate()}`,
          className: 'calendar',
          onchange: schedule
        }),
        createElement('i', {
          id: `nt${todo.id}`,
          className: 'far fa-clipboard',
          onclick: showNote
        }),
        createElement('textarea', {
          id: `no${todo.id}`,
          onchange: textinput
        }),
        createElement('i', {
          id: `ed${todo.id}`,
          className: 'far fa-edit',
          onclick: editTask
        }),
        createElement('i', {
          id: `ed${todo.id}`,
          className: 'far fa-flag'
        }),
        createElement(
          'select',
          {
            id: `ed${todo.id}`,
            className: 'dropdown',
            onclick: setPriority
          },
          createElement('option', {}, 'low'),
          createElement('option', {}, 'medium'),
          createElement('option', {}, 'high')
        ),
        createElement('i', {
          id: `ed${todo.id}`,
          className: 'fas fa-trash-alt',
          onclick: deleteTask
        })
      )
    )
  )
}

function sortTodo (tasks) {
  tasks.sort((a, b) => {
    if (new Date(a.scheduled) < new Date()) return 1
    if (new Date(b.scheduled) < new Date()) return -1
    return new Date(a.scheduled) - new Date(b.scheduled)
  })
  tasks.sort((a, b) => {
    if (a.priority === b.priority) return 1
    if (a.priority === 'low') return 1
    if (a.priority === 'high') return -1
    if (b.priority === 'low') return -1
    return a.priority - b.priority
  })
}

// for adding todo
async function addtodo (event) {
  if (event.keyCode === 13) {
    if (event.target.value === '') return
    const response = await fetchData(baseUrl + 'todo/' + event.target.id.slice(4), 'POST', 'application/json', JSON.stringify({
      todoName: event.target.value
    }))
    event.target.value = ''
    const result = await response.json()
    rendertodo(result)
  }
}

// to display add task input bar
function showTaskInput (todoContainer, id) {
  todoContainer.appendChild(
    createElement(
      'div',
      {
        id: `todo${id}`,
        className: 'todo'
      },
      createElement(
        'div',
        {},
        createElement('input', {
          id: `inpt${id}`,
          className: 'todo-input',
          type: 'text',
          placeholder: 'Add new todo',
          onkeydown: addtodo
        })
      )
    )
  )
}

// for displaying all todo
async function showTask (event) {
  const id = event.target.id.slice(2)
  const todoContainer = document.getElementById('to' + id)
  if (document.getElementById(`todo${id}`) !== null) {
    document.getElementById(`todo${id}`).remove()
  } else {
    showTaskInput(todoContainer, id)
    const response = await fetchData(baseUrl + 'todo/' + id, 'GET', 'application/json')
    const todos = await response.json()
    // Call sort todo fn
    sortTodo(todos)
    for (const todo of todos) {
      rendertodo(todo)
    }
  }
}

// for displaying input box for todo name
function editTask (event) {
  event.target.parentNode.parentNode.querySelectorAll(
    'input'
  )[1].disabled = false
  event.target.parentNode.parentNode.querySelectorAll('input')[1].className =
    'task-input-edit'
}

// for updating todoname
async function updateTask (event) {
  if (event.keyCode === 13) {
    if (event.target.value === '') return
    event.target.disabled = true
    event.target.className = 'task-input'
    console.log(baseUrl + 'todo/' + event.target.id.slice(2))
    const response = await fetchData(baseUrl + 'todo/' + event.target.id.slice(2), 'PUT', 'application/json', JSON.stringify({
      column: 'todoname',
      value: event.target.value
    }))
    const result = await response.json()
    console.log(result)
  }
}

// function to delete a todo
async function deleteTask (event) {
  const response = await fetchData(baseUrl + 'todo/' + event.target.id.slice(2), 'DELETE', 'application/json')
  const result = await response.json()
  console.log(result)
  event.target.parentNode.parentNode.remove()
}

// to render note block
async function showNote (event) {
  const note = event.target.parentNode.querySelector('textarea')
  if (
    note.style.display === 'none'
  ) {
    const id = event.target.parentNode.parentNode.parentNode.id.slice(4)
    const response = await fetchData(baseUrl + 'todo/' + id, 'GET', 'application/json')
    const result = await response.json()
    console.log(result)
    result.forEach(element => {
      if (element.id === parseInt(event.target.id.slice(2))) note.value = element.note
    })
    note.style.display = 'block'
  } else {
    note.style.display = 'none'
  }
}

// event to add note
async function textinput (event) {
  const id = event.target.id.slice(2)
  const response = await fetchData(baseUrl + 'todo/' + id, 'PUT', 'application/json', JSON.stringify({
    column: 'note',
    value: event.target.value
  }))
  const result = await response.json()
  console.log(result)
  event.target.style.display = 'none'
}

// to set date
async function schedule (event) {
  const todoContainer = event.target.parentNode.parentNode.parentNode.parentNode
  const id = event.target.id.slice(2)
  await fetchData(baseUrl + 'todo/' + id, 'PUT', 'application/json', JSON.stringify({
    column: 'scheduled',
    value: event.target.value
  }))
  let todos = await fetchData(baseUrl + 'todo/' + todoContainer.id.slice(2), 'GET', 'application/json')
  todos = await todos.json()
  todoContainer.innerHTML = ''
  sortTodo(todos)
  showTaskInput(todoContainer, todoContainer.id.slice(2))
  for (const todo of todos) {
    rendertodo(todo)
  }
}

// to complete todo
async function todoComplete (event) {
  const parent = event.target.parentNode.parentNode
  const id = parent.id.slice(4)
  if (document.getElementById('tx' + id).style.textDecoration === 'none') {
    document.getElementById('tx' + id).style.textDecoration = 'line-through'
    await fetchData(baseUrl + 'todo/' + id, 'PUT', 'application/json', JSON.stringify({
      column: 'completed', value: true
    }))
  } else {
    document.getElementById('tx' + id).style.textDecoration = 'none'
    await fetchData(baseUrl + 'todo/' + id, 'PUT', 'application/json', JSON.stringify({
      column: 'completed', value: false
    }))
  }
}

async function setPriority (event) {
  const todoContainer = event.target.parentNode.parentNode.parentNode.parentNode
  const id = event.target.id.slice(2)
  if (event.target.value === 'low') {
    event.target.parentNode.parentNode.style.color = 'whitesmoke'
  }
  if (event.target.value === 'medium') {
    event.target.parentNode.parentNode.style.color = '#c7822f'
  }
  if (event.target.value === 'high') {
    event.target.parentNode.parentNode.style.color = 'rgb(189,60,60)'
  }
  await fetchData(baseUrl + 'todo/' + id, 'PUT', 'application/json', JSON.stringify({
    column: 'priority',
    value: event.target.value
  }))
  let todos = await fetchData(baseUrl + 'todo/' + todoContainer.id.slice(2), 'GET', 'application/json')
  todos = await todos.json()
  sortTodo(todos)
  todoContainer.innerHTML = ''
  showTaskInput(todoContainer, todoContainer.id.slice(2))
  for (const todo of todos) {
    rendertodo(todo)
  }
}

showAllList()

addList.addEventListener('click', event => {
  event.target.parentNode.parentNode.querySelector('input').style.display = 'block'
  event.target.parentNode.parentNode
    .querySelector('input')
    .addEventListener('keydown', async event => {
      if (event.keyCode === 13) {
        if (event.target.value === '') {
          event.target.parentNode.parentNode.querySelector(
            'input'
          ).style.display = 'none'
          return
        }
        const listName = event.target.value
        event.target.value = ''
        const response = await fetchData(`${baseUrl}list/`, 'POST', 'application/json', JSON.stringify({ listName }))
        if (response.status !== 200) return
        renderList(await response.json())
        event.target.parentNode.parentNode.querySelector(
          'input'
        ).style.display = 'none'
      }
    })
})

search.addEventListener('click', event => {
  loadAllList()
  if (document.getElementById('list-search').style.display === 'block') {
    document.getElementById('list-search').style.display = 'none'
  } else {
    document.getElementById('list-search').style.display = 'block'
    document.getElementById('list-search').oninput = event => {
      const regex = new RegExp(`^${event.target.value}.+`)
      mainContainer.innerHTML = ''
      if (event.target.value === '') {
        showAllList()
        return
      }
      for (const list of allList) {
        if (regex.test(list.listname)) {
          mainContainer.innerHTML = ''
          renderList(list)
        }
      }
    }
  }
})
