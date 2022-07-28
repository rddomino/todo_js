// получение элементов со страницы
const form = document.querySelector('#form');
const taskInput = document.querySelector('#taskInput');
const taskList = document.querySelector('#taskList');
const countLable = document.querySelector('.header');
const allNotDoneBtn = document.querySelector('#allnotdone');
const allDoneBtn = document.querySelector('#alldone');
const allDeleteBtn = document.querySelector('#alldelete');
const filterSelect = document.querySelector('#action__filter');
const pagParent = document.querySelector('.pagination');

let btnPrev = document.getElementById("btn_prev");
let pageSpan = document.getElementById("page");

let currentPage = 1;
let recordsPerPage = 3;

let tasks = [];

// рендер списка дел
const renderTasks = (task) => {     
    if (!task) {
        return;
    }

    const ccsClass = task.done ? "list__item list__item_done" : "list__item";

    const taskHTML = `
        <li id="${task.id}" class="${ccsClass}" id="listItem">
            <p class="list__item__label" data-action="edit">${task.text}</p>
            <div class="list__btn-group">
                <input type="checkbox" class="list__item__checkbox" data-action="done"/>
                <button class="btn-trash" type="button" data-action="delete">
                    <i class="fa fa-trash-o" data-action="delete"></i>
                </button>
            
            </div>
        </li>
    `;
    taskList.insertAdjacentHTML('beforeend', taskHTML);
};

// подсчет количества выпол/невыпол задач
const changeTasksCount = () => {
    const doneCount = tasks.filter((task) => task.done).length;
    const notDoneCount = tasks.length - doneCount;
    const countLableText = document.querySelector('.header__descr');
    
    countLableText.innerHTML = `выполнено ${doneCount}, не выполнено ${notDoneCount}`;    
};

// установка флажков
const checkFlag = (task) => {
    if (!task) {
        return;
    }

    parentCheckbox = document.getElementById(`${task.id}`);

    if (parentCheckbox === null) {
        return;
    }

    if (task.done) {
        parentCheckbox.children[1].firstElementChild.checked = true;
    } else {
        parentCheckbox.children[1].firstElementChild.checked = false;
    }
};

// вывод всех задач и пересчет количества
const renderAllTasks = (tasks) => {
    tasks.forEach((task) => {
        renderTasks(task);
        checkFlag(task);
    });
    changeTasksCount() ;
};

// загрузка массива дел из localStorage
if (localStorage.getItem('tasks')) {
    tasks = JSON.parse(localStorage.getItem('tasks'));
    renderAllTasks(tasks);
}

// сохранение в localStorage
const saveToLocalStorage = () => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
};

// отображение элементов, когда нет ничего в списке дел
const checkEmptyList = (tasks) => {
    if (tasks.length === 0) {
        const emptyListHTML = `
            <li class="list__item" id="emptyList">
                <span class="list__item__label">
                    Список дел пуст...
                </span>
            </li>
        `;
        taskList.insertAdjacentHTML('afterbegin', emptyListHTML);

        btnPrev.style.visibility = "hidden";
        
    } else if (tasks.length > 0) {
        const emptyListElement = document.querySelector('#emptyList');
        if (emptyListElement) {
            emptyListElement.remove();
        }
    }
};
checkEmptyList(tasks);

// добавление задачи
const addTask = (event) => {    
    event.preventDefault();

    const taskText = taskInput.value;
    
    if (taskText === '') {
        return;
    }
    
    const newTask = {
        id: Date.now(),
        text: taskText,
        done: false
    };
    tasks.push(newTask);

    saveToLocalStorage();

    renderTasks(newTask);
    checkFlag(newTask);
    taskInput.value = "";
    taskInput.focus();

    changeTasksCount();
    changePage(currentPage);
};
form.addEventListener('submit', addTask);


//удаление задачи
const deleteTask = (event) => {
    if (event.target.dataset.action === 'delete') {
       const parentNode = event.target.closest('.list__item');  
       const id = Number(parentNode.id);
       
       tasks = tasks.filter((task) => task.id !== id);

       saveToLocalStorage();
       
       parentNode.remove();

       filterFunc();
       changeTasksCount();
       changePage(currentPage);
    }     
};
taskList.addEventListener('click', deleteTask);


// отмечаем задачу завершенной
const doneTask = (event) => {
    if (event.target.dataset.action === 'done') {
        const parentNode = event.target.closest('.list__item');
        const id = Number(parentNode.id);
        
        if (event.target.checked) {            
            parentNode.classList.add('list__item_done');
        } else {      
            parentNode.classList.remove('list__item_done');
        }

        const task = tasks.find((task) => task.id === id);
        task.done = !task.done;
        saveToLocalStorage();       
        checkFlag(task);
        changeTasksCount();
        filterFunc();  
    }
};
taskList.addEventListener('change', doneTask);

// отметить, что все задачи не выполнены
allNotDoneBtn.addEventListener('click', (event) => {
    tasks.forEach((task) => { 
        task.done = false;   
        checkFlag(task);
    });
    for (let i = 0; i < taskList.children.length; i++) {
        let child = taskList.children[i];
        if (child.tagName == 'LI') {
            child.classList.remove('list__item_done');
        }
    }
    saveToLocalStorage();
    changeTasksCount();
    filterFunc();
});

// отметить, что все задачи выполнены
allDoneBtn.addEventListener('click', () => {    
    tasks.forEach((task) => { 
        task.done = true;   
        checkFlag(task);
    });
    for (let i = 0; i < taskList.children.length; i++) {
        let child = taskList.children[i];
        if (child.tagName == 'LI') {
            child.classList.add('list__item_done');
        }
    }    
    saveToLocalStorage();
    changeTasksCount();
    changePage(currentPage);
    filterFunc();
    
});

// удалить все выполненные задачи
allDeleteBtn.addEventListener('click', () => { 
    tasks = tasks.filter((task) => task.done !== true);

    taskList.innerHTML = "";

    filterFunc();
    saveToLocalStorage();
    changeTasksCount();
    changePage(currentPage);
});

// фильтр
const filterFunc = () => {
    taskList.innerHTML = "";

    switch (filterSelect.value) {
        case "all":
            newTasks = tasks;
            changePage(currentPage, newTasks);
            break;
        case "done":
            newTasks = tasks.filter((task) => task.done === true) ;     
            changePage(currentPage, newTasks);
            break;
        case "notdone":
            newTasks = tasks.filter((task) => task.done === false);
            changePage(currentPage, newTasks);
            break;
    }
};
filterSelect.addEventListener('change', filterFunc);

// редактирование задачи по двойному клику
const editText = (event) => {
    if (event.target.dataset.action === 'edit') {
        const parentNode = event.target.closest('.list__item__label');
        const preParentNode = event.target.closest('.list__item');
        const id = Number(preParentNode.id);
        
        const input = document.createElement('input');
        input.value = parentNode.innerHTML;
        parentNode.innerHTML = "";
        parentNode.appendChild(input);
        input.focus();

        let inputText = "";

        input.addEventListener('blur', () => {
            inputText = input.value;
            parentNode.innerHTML = inputText;

            const task = tasks.find((task) => task.id === id);
            task.text = inputText;
            saveToLocalStorage();
        });

        input.addEventListener('keydown', (event) => {
            if (event.code === "Enter") {
                input.blur();
            }
        });
    }
};
taskList.addEventListener('dblclick', editText);

//пагинация
let numPages = Math.ceil(tasks.length / recordsPerPage);

const prevPage = () => {
    if (currentPage > 1) {
        currentPage--;
        changePage(currentPage);
        filterFunc();
    }
};

const nextPage = () => {
    if (currentPage < numPages) {
        currentPage++;
        changePage(currentPage);
        filterFunc();
    }
};
    
const changePage = (page, notes = tasks) => {
    let btnNext = document.getElementById("btn_next");

    numPages = Math.ceil(notes.length / recordsPerPage);
 
    // валидация страницы
    if (page < 1) {
        page = 1;
    }
    if (page > numPages) {
        page = numPages;
    }        

    taskList.innerHTML = "";
    
    let start = (page - 1) * recordsPerPage;
    let end = start + recordsPerPage;

    for (let i = start; i < (end); i++) {
        renderTasks(notes[i]);
        checkFlag(notes[i]);
    }
    checkEmptyList(notes);
    pageSpan.innerHTML = page;
    
    if (page == numPages) {
        btnNext.style.visibility = "hidden";
    } else {
        btnNext.style.visibility = "visible";
    }

    if (page == 1) {
        btnPrev.style.visibility = "hidden";
    } else if (page > 1) {
        btnPrev.style.visibility = "visible";
    }    

    return numPages;
};

changePage(1);