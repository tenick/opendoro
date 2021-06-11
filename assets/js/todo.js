var todoInput = document.getElementById('add-todo-input');
var todoBtn = document.getElementById('add-todo-btn');
var todos = document.getElementById('todos');

function onTodoCheckboxClick() {
    var textDecoration = 'none';
    if (this.checked) 
        textDecoration = 'line-through'
    this.nextSibling.style.textDecoration = textDecoration;
}

function onDeleteBtnClick() {
    this.parentElement.remove();
}

todoInput.addEventListener('keyup', (e) => {
    if (e.code == "Enter")
        todoBtn.click();
});

todoBtn.addEventListener('click', (e) => {
    // add a new todo item in this format:
    // <div class="todo-item">
    //     <input class="todo-checkbox" type="checkbox">
    //     <span class='todo-text'>han loha nlohan lohanlo hanloh anloha nlohan lohan loh anl ohan lohanl oha nloha nloha nlohanlo</span>
    //     <span class="todo-delete fas fa-trash-alt"></span>
    // </div>
    if (todoInput.value != '') {
        var todoItem = document.createElement('div');
        todoItem.className = "todo-item";

        var checkBox = document.createElement('input');
        checkBox.setAttribute('type', 'checkbox');
        checkBox.className = 'todo-checkbox';
        checkBox.addEventListener('click', onTodoCheckboxClick);

        var text = document.createElement('span');
        text.className = 'todo-text';
        text.innerHTML = todoInput.value;

        var deleteBtn = document.createElement('span');
        deleteBtn.className = 'todo-delete fas fa-trash-alt';
        deleteBtn.addEventListener('click', onDeleteBtnClick);

        todoItem.appendChild(checkBox);
        todoItem.appendChild(text);
        todoItem.appendChild(deleteBtn);

        todos.appendChild(todoItem);

        todoInput.value = '';
    }
});