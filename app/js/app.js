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

function todoComplete (event) {
  const parent = event.target.parentNode.parentNode
  const id = parent.id.slice(4)
  const todoContainer = event.target.parentNode.parentNode.parentNode.parentNode
  const containerId = todoContainer.id.slice(2)
  const list = JSON.parse(window.localStorage.getItem(containerId))
  const tasks = list.todo
  console.log(document.getElementById('tx' + id).style.textDecoration)
  if (document.getElementById('tx' + id).style.textDecoration === 'none') {
    document.getElementById('tx' + id).style.textDecoration = 'line-through'
    for (const task of tasks) {
      if (task.id === Number(id)) {
        task.complete = true
      }
    }
  } else {
    document.getElementById('tx' + id).style.textDecoration = 'none'
    for (const task of tasks) {
      if (task.id === Number(id)) {
        task.complete = false
      }
    }
  }
  list.todo = tasks
  window.localStorage.setItem(containerId, JSON.stringify(list))
}
// to render todos
function rendertodo (id, todo, lastId) {
  let complete
  todo.complete ? (complete = 'line-through') : (complete = 'none')
  document.getElementById('todo' + id).appendChild(
    createElement(
      'div',
      { id: `toct${lastId}`, className: `todo-container ${todo.priority}` },
      createElement(
        'div',
        {},
        createElement('input', {
          type: 'checkbox',
          checked: todo.complete,
          name: 'todo-complete',
          onclick: todoComplete
        })
      ),
      createElement(
        'div',
        {},
        createElement('input', {
          id: `tx${lastId}`,
          type: 'text',
          value: todo.name,
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
          id: `cl${lastId}`,
          className: 'far fa-calendar'
        }),
        createElement('input', {
          id: `in${lastId}`,
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
          id: `nt${lastId}`,
          className: 'far fa-clipboard',
          onclick: showNote
        }),
        createElement('textarea', {
          id: `no${lastId}`,
          onchange: textinput
        }),
        createElement('i', {
          id: `ed${lastId}`,
          className: 'far fa-edit',
          onclick: editTask
        }),
        createElement('i', {
          id: `ed${lastId}`,
          className: 'far fa-flag'
        }),
        createElement(
          'select',
          {
            id: `ed${lastId}`,
            className: 'dropdown',
            onclick: setPriority
          },
          createElement('option', {}, 'low'),
          createElement('option', {}, 'medium'),
          createElement('option', {}, 'high')
        ),
        createElement('i', {
          id: `ed${lastId}`,
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

function schedule (event) {
  const todoContainer = event.target.parentNode.parentNode.parentNode.parentNode
  const id = todoContainer.id.slice(2)
  const list = JSON.parse(window.localStorage.getItem(id))
  const tasks = list.todo
  for (const task of tasks) {
    if (task.id === Number(event.target.id.slice(2))) {
      task.scheduled = event.target.value
    }
  }
  list.todo = tasks
  window.localStorage.setItem(id, JSON.stringify(list))
  todoContainer.innerHTML = ''
  sortTodo(tasks)
  showTaskInput(todoContainer, id)
  for (const task of tasks) {
    rendertodo(id, task, task.id)
  }
  // main div.innerhtml = ''
  // Pass to sort fn
  // send the sored array to render fn
}
// for adding tasks
function addtodo (event) {
  if (event.keyCode === 13) {
    if (event.target.value === '') return
    const todo = JSON.parse(
      window.localStorage.getItem(event.target.id.slice(4))
    ).todo
    let lastId
    if (todo.length === 0) {
      lastId = 1
    } else {
      lastId = todo[todo.length - 1].id + 1
    }
    // creating new todo object
    const newTodo = {
      id: lastId,
      name: event.target.value,
      complete: false,
      scheduled: false,
      priority: 'low',
      note: ''
    }
    rendertodo(event.target.id.slice(4), newTodo, lastId)
    event.target.value = ''
    const currentList = JSON.parse(
      window.localStorage.getItem(event.target.id.slice(4))
    )
    currentList.todo.push(newTodo)
    window.localStorage.setItem(
      event.target.id.slice(4),
      JSON.stringify(currentList)
    )
  }
}

// for editing task
function editTask (event) {
  event.target.parentNode.parentNode.querySelectorAll(
    'input'
  )[1].disabled = false
  event.target.parentNode.parentNode.querySelectorAll('input')[1].className =
    'task-input-edit'
}

function deleteTask (event) {
  const list = JSON.parse(
    window.localStorage.getItem(
      event.target.parentNode.parentNode.parentNode.id.slice(4)
    )
  )
  const tasks = list.todo
  for (const task of tasks) {
    if (task.id === Number(event.target.id.slice(2))) {
      tasks.splice(tasks.indexOf(task), 1)
    }
  }
  list.todo = tasks
  window.localStorage.setItem(
    event.target.parentNode.parentNode.parentNode.id.slice(4),
    JSON.stringify(list)
  )
  event.target.parentNode.parentNode.remove()
}

function textinput (event) {
  const list = JSON.parse(
    window.localStorage.getItem(
      event.target.parentNode.parentNode.parentNode.id.slice(4)
    )
  )
  const tasks = list.todo
  for (const task of tasks) {
    if (task.id === Number(event.target.id.slice(2))) {
      task.note = event.target.value
    }
  }
  list.todo = tasks
  window.localStorage.setItem(
    event.target.parentNode.parentNode.parentNode.id.slice(4),
    JSON.stringify(list)
  )
  event.target.style.display = 'none'
}

function updateTask (event) {
  if (event.keyCode === 13) {
    if (event.target.value === '') return
    event.target.disabled = true
    event.target.className = 'task-input'
    const list = JSON.parse(
      window.localStorage.getItem(
        event.target.parentNode.parentNode.parentNode.id.slice(4)
      )
    )
    const tasks = list.todo
    for (const task of tasks) {
      if (task.id === Number(event.target.id.slice(2))) {
        task.name = event.target.value
      }
    }
    list.todo = tasks
    window.localStorage.setItem(
      event.target.parentNode.parentNode.parentNode.id.slice(4),
      JSON.stringify(list)
    )
  }
}

function showNote (event) {
  if (
    event.target.parentNode.querySelector('textarea').style.display === 'none'
  ) {
    const tasks = JSON.parse(
      window.localStorage.getItem(
        event.target.parentNode.parentNode.parentNode.id.slice(4)
      )
    ).todo
    for (const task of tasks) {
      if (task.id === Number(event.target.id.slice(2))) {
        event.target.parentNode.querySelector('textarea').value = task.note
      }
    }
    event.target.parentNode.querySelector('textarea').style.display = 'block'
  } else {
    event.target.parentNode.querySelector('textarea').style.display = 'none'
  }
}

function setPriority (event) {
  const todoContainer = event.target.parentNode.parentNode.parentNode.parentNode
  const id = todoContainer.id.slice(2)
  if (event.target.value === 'low') {
    event.target.parentNode.parentNode.style.color = 'whitesmoke'
  }
  if (event.target.value === 'medium') {
    event.target.parentNode.parentNode.style.color = '#c7822f'
  }
  if (event.target.value === 'high') {
    event.target.parentNode.parentNode.style.color = 'rgb(189,60,60)'
  }
  const list = JSON.parse(
    window.localStorage.getItem(
      event.target.parentNode.parentNode.parentNode.id.slice(4)
    )
  )
  const tasks = list.todo
  for (const task of tasks) {
    if (task.id === Number(event.target.id.slice(2))) {
      task.priority = event.target.value
    }
  }
  list.todo = tasks
  window.localStorage.setItem(
    event.target.parentNode.parentNode.parentNode.id.slice(4),
    JSON.stringify(list)
  )
  sortTodo(tasks)
  todoContainer.innerHTML = ''
  showTaskInput(todoContainer, id)
  for (const task of tasks) {
    rendertodo(id, task, task.id)
  }
}

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

function showTask (event) {
  const id = event.target.id.slice(2)
  const todoContainer = document.getElementById('to' + id)
  if (document.getElementById(`todo${id}`) !== null) {
    document.getElementById(`todo${id}`).remove()
  } else {
    showTaskInput(todoContainer, id)
    const tasks = JSON.parse(window.localStorage.getItem(id)).todo
    // Call sort todo fn
    sortTodo(tasks)
    for (const task of tasks) {
      rendertodo(id, task, task.id)
    }
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
