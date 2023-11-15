//localStorage.clear();

document.addEventListener('DOMContentLoaded', () => {
    loadTasksFromLocalStorage();
});

let taskIdCounter = 1;

function addTask() {
    const taskInput = document.getElementById('newTask');
    const dueDateInput = document.getElementById('dueDate');

    const task = taskInput.value.trim();
    const dueDate = dueDateInput.value || '';

    if (validateTask(task) && validateDueDate(dueDate)) {
        const taskList = document.getElementById('taskList');
        const li = document.createElement('li');
        const taskId = taskIdCounter++;

        li.innerHTML = `<input type="checkbox" onclick="editTask(this)">
                        <span class="task">${task}</span>
                        <span class="due-date">${dueDate}</span>
                        <button onclick="deleteTask(this)">X</button>`;
        taskList.appendChild(li);

        saveTaskToLocalStorage(taskId, task, dueDate);
        taskInput.value = '';
        dueDateInput.value = '';
    }
}
function validateDueDate(dueDate) {
    const currentDate = new Date();
    const selectedDate = new Date(dueDate);

    if (selectedDate < currentDate) {
        alert('Nie można wybrać daty z przeszłości.');
        return false;
    }
    return true;
}
function editTask(checkbox) {
    const li = checkbox.parentNode;
    const taskSpan = li.querySelector('.task');
    const dueDateSpan = li.querySelector('.due-date');

    if (checkbox.checked) {
        taskSpan.setAttribute('contenteditable', 'true');
        dueDateSpan.innerHTML = `<input type="date" value="${dueDateSpan.textContent}">`;
        const saveButton = document.createElement('button');
		
        saveButton.textContent = 'Zapisz';
        saveButton.classList.add('edit-save');
        saveButton.addEventListener('click', function () {
            checkbox.checked = false;
            editTask(checkbox);
        });
        li.appendChild(saveButton);
    } else {
        taskSpan.setAttribute('contenteditable', 'false');
        const dateInput = dueDateSpan.querySelector('input[type="date"]');
        
		if (dateInput) {
            const newDate = dateInput.value;
            dueDateSpan.textContent = newDate;
        }

        const saveButton = li.querySelector('.edit-save');
        if (saveButton) {
            saveButton.remove();
        }
        saveTaskToLocalStorage();
    }
}
function deleteTask(button) {
    const li = button.parentNode;
    removeFromLocalStorage(li);
    li.remove();
}
function validateTask(task) {
    if (task.length < 3 || task.length > 255) {
        alert('Zadanie musi mieć od 3 do 255 znaków.');
        return false;
    }
    return true;
}
function saveTaskToLocalStorage(taskId, task, dueDate) {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks.push({ id: taskId, task: task, dueDate: dueDate });
    localStorage.setItem('tasks', JSON.stringify(tasks));
}
function loadTasksFromLocalStorage() {
    const taskList = document.getElementById('taskList');
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];

    tasks.forEach(task => {
        const li = document.createElement('li');
        li.innerHTML = `<input type="checkbox" onclick="editTask(this)">
                        <span class="task">${task.task}</span>
                        <span class="due-date">${task.dueDate}</span>
                        <button onclick="deleteTask(this)">X</button>`;
        taskList.appendChild(li);
    });
}
function removeFromLocalStorage(li) {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const taskId = tasks[Array.from(li.parentNode.children).indexOf(li)].id;

    if (taskId !== undefined) {
        const filteredTasks = tasks.filter(task => task.id !== taskId);
        localStorage.setItem('tasks', JSON.stringify(filteredTasks));
    }
}
document.getElementById('searchInput').addEventListener('input', function () {
    const searchValue = this.value.trim().toLowerCase(); 
    
    if (searchValue.length >= 2) {
        const tasks = document.querySelectorAll('li');
        tasks.forEach(task => {
            const taskText = task.querySelector('.task').textContent.toLowerCase();
            const dueDateText = task.querySelector('.due-date').textContent.toLowerCase();

            if (taskText.includes(searchValue) || dueDateText.includes(searchValue)) {
                task.style.display = 'flex';
                highlightSearchResult(task, searchValue);
            } else {
                task.style.display = 'none';
            }
        });
    } else {
        document.querySelectorAll('li').forEach(task => {
            task.style.display = 'flex';
            clearHighlight(task);
        });
    }
});

function highlightSearchResult(task, searchValue) {
    const taskSpan = task.querySelector('.task');
    const dueDateSpan = task.querySelector('.due-date');

    highlightText(taskSpan, searchValue);
    highlightText(dueDateSpan, searchValue);
}

function highlightText(element, searchValue) {
    const text = element.textContent.toLowerCase();
    const index = text.indexOf(searchValue);

    if (index !== -1) {
        const before = text.substring(0, index);
        const match = text.substring(index, index + searchValue.length);
        const after = text.substring(index + searchValue.length);

        element.innerHTML = `${before}<span class="highlight">${match}</span>${after}`;
    }
}

function clearHighlight(task) {
    const taskSpan = task.querySelector('.task');
    const dueDateSpan = task.querySelector('.due-date');

    clearTextHighlight(taskSpan);
    clearTextHighlight(dueDateSpan);
}

function clearTextHighlight(element) {
    element.innerHTML = element.textContent;
}
