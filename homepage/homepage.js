let last_pressed;
let session;

window.addEventListener('load', async (e) => {
    let email = localStorage.getItem('join_email');
    await downloadFromServer();
    if (email === null || !jsonFromServer[email]) return window.location.href = './startpage.html';
    session = jsonFromServer[email];
    initiateHomepage();
    initiateBoard();
});

/**
 * Function that executes JavaScript for "homepage.html"
 */
function initiateHomepage() {
    const log_out = document.getElementById('log-out');
    log_out.addEventListener('click', (e) => {
        if (localStorage.getItem('remember') === 'false' || !localStorage.getItem('remember')) {
            localStorage.removeItem('join_email');
            localStorage.removeItem('join_password');
            localStorage.removeItem('remember');
        }
        window.location.href = './startpage.html';
    });

    const summary = document.getElementById('summary');
    summary.addEventListener('click', (e) => {
        initiateSummary();
    });

    const board = document.getElementById('board');
    board.addEventListener('click', (e) => {
        initiateBoard();
    });

    const add_task = document.getElementById('add-task');
    add_task.addEventListener('click', (e) => {
        initiateAddTask();
    });

    const contacts = document.getElementById('contacts');
    contacts.addEventListener('click', (e) => {
        initiateContacts();
    });

    const legal_notice = document.getElementById('legal-notice');
    legal_notice.addEventListener('click', (e) => {
        initiateLegalNotice();
    });

    const questionmark = document.getElementById('questionmark');
    questionmark.addEventListener('click', (e) => {
        initiateHelp();
    });
}

/**
 * Function that executes JavaScript for "help.html"
 */
async function initiateHelp() {
    await loadHTML('./homepage/help.html', 1);
    const back_arrow = document.getElementById('back-arrow');
    back_arrow.addEventListener('click', (e) => {
        switch (last_pressed) {
            case 'summary':
                initiateSummary();
                break;
            case 'board':
                initiateBoard();
                break;
            case 'add-task':
                initiateAddTask();
                break;
            case 'contacts':
                initiateContacts();
                break;
            case 'legal-notice':
                initiateLegalNotice();
                break;
        }
    });
    document.getElementById('questionmark').classList.add('display-none');
    document.getElementById('summary').classList.remove('nav-button-color');
    document.getElementById('board').classList.remove('nav-button-color');
    document.getElementById('add-task').classList.remove('nav-button-color');
    document.getElementById('contacts').classList.remove('nav-button-color');
    document.getElementById('legal-notice').classList.remove('nav-button-color');
}

/**
 * Function that executes JavaScript for "legal_notice.html"
 */
async function initiateLegalNotice() {
    await loadHTML('./homepage/legal_notice.html', 1);
    last_pressed = 'legal-notice';
    document.getElementById('questionmark').classList.remove('display-none');
    document.getElementById('summary').classList.remove('nav-button-color');
    document.getElementById('board').classList.remove('nav-button-color');
    document.getElementById('add-task').classList.remove('nav-button-color');
    document.getElementById('contacts').classList.remove('nav-button-color');
    document.getElementById('legal-notice').classList.add('nav-button-color');
}

/**
 * Function that executes JavaScript for 'summary.html'
 */
async function initiateSummary() {
    await loadHTML('./homepage/summary.html', 1);
    const user = document.getElementById('user');
    const date = document.getElementById('date');
    user.innerHTML = session.name + " " + session.surname;
    const time = new Date().getHours();
    if (time > 00) date.innerHTML = 'Good Morning,';
    if (time > 12) date.innerHTML = 'Good Afternoon,';
    if (time > 18) date.innerHTML = 'Good Evening,';
    last_pressed = 'summary';
    document.getElementById('questionmark').classList.remove('display-none');
    document.getElementById('summary').classList.add('nav-button-color');
    document.getElementById('board').classList.remove('nav-button-color');
    document.getElementById('add-task').classList.remove('nav-button-color');
    document.getElementById('contacts').classList.remove('nav-button-color');
    document.getElementById('legal-notice').classList.remove('nav-button-color');
    let inProgress = document.getElementById('in-progress');
    let totalTasks = document.getElementById('total-tasks');
    let awaitingFeedback = document.getElementById('awaiting-feedback');
    /**
 * Function that counts the existing tasks
 */
    function counting(status) {
        let count = 0;
        for (let x = 0; x < jsonFromServer.tasks.length; x++) {
            let task = jsonFromServer.tasks[x];
            if (task.status === status) {
                count++;
            }
            if (task.priority === status) {
                count++;
            }
        }
        return count;
    }
    totalTasks.innerHTML = jsonFromServer.tasks.length;
    inProgress.innerHTML = counting('inProgress');
    awaitingFeedback.innerHTML = counting('awaitingFeedback');
    let urgentCount = document.getElementById('urgent-count');
    urgentCount.innerHTML = counting('urgent');
    let toDo = document.getElementById('toDo');
    toDo.innerHTML = counting('toDo');
    let done = document.getElementById('done');
    done.innerHTML = counting('done');
    let dates = [];
    for (task of jsonFromServer.tasks) {
        dates.push(task.dueDate);
    }
    dates.sort(function (a, b) {
        return new Date(b.date) - new Date(a.date);
    });
    let dueDate = document.getElementById('dueDate');
    dueDate.innerHTML = dates[dates.length - 1] || '-';
}

/**
 * Function that renders the tasks inside the board
 */
function renderTasks() {
    let tasks = backend.getItem('tasks');
    let search = document.getElementById('search');
    document.getElementById('toDo').innerHTML = "";
    document.getElementById('inProgress').innerHTML = "";
    document.getElementById('awaitingFeedback').innerHTML = "";
    document.getElementById('done').innerHTML = "";
    for (let task of tasks) {
        let injection = "";
        for (let user of task.assignedTo) {
            if (session.contacts.includes(user)) {
                injection +=
                    `
                    <div style='background-color: ${backend.getItem(`${user}`).color}' class="circle-small">${backend.getItem(`${user}`).letters}</div>
                `;
            } else {
                task.assignedTo.splice(task.assignedTo.indexOf(user), 1);
            }
        }
        const location = task.status;
        if (task.title.toLowerCase().includes(search.value.toLowerCase()) || task.description.toLowerCase().includes(search.value.toLowerCase()) || search.value === "") {
            document.getElementById(location).innerHTML +=
                `
            <div ondragover="this.parentElement.style.backgroundColor = '#091931'" id="${tasks.indexOf(task)}" ondragstart="drag(event)" draggable="true" onclick="boardDetail(${tasks.indexOf(task)})" class="draggable-card gap10">
                                <div class="display-flex">
                                    <span class="padding3-5" style="background-color: ${pickColor(task.category)}; border-radius: 5px;">${task.category}</span>
                                </div>
                                <div>
                                    <b class="break-word">${task.title}</b>
                                </div>
                                <p style="color: #D1D1D1" class="break-word">${task.description}</p>
                                <div id="${jsonFromServer.tasks.indexOf(task) + 'id'}" class="display-flex align-center space-between">
                                <div class="progress-bar">
                                    <div class="progress" style="width: ${task.doneSubtasks.length/task.subtasks.length*100}%"></div>
                                </div>
                                <p class="display-flex align-center gap5 howmuch"><span>${task.doneSubtasks.length} / ${task.subtasks.length}</span>Done</p>
                                </div>
                                <div class="display-flex space-between align-center">
                                    <div class="display-flex align-center">
                                    ${injection}
                                    </div>
                                    <img draggable="false" src="./images/board/${task.priority}.svg" alt="priority">
                                </div>
                            </div>
            `;
            injection = "";
            if (task.subtasks.length === 0) {
                document.getElementById(jsonFromServer.tasks.indexOf(task) + 'id').classList.add('display-none')
            }
        }
    }
}

/**
 * Function that executes JavaScript for 'board.html'
 */
async function initiateBoard() {
    await loadHTML('./homepage/board.html', 1);
    last_pressed = 'board';
    document.getElementById('questionmark').classList.remove('display-none');
    document.getElementById('summary').classList.remove('nav-button-color');
    document.getElementById('board').classList.add('nav-button-color');
    document.getElementById('add-task').classList.remove('nav-button-color');
    document.getElementById('contacts').classList.remove('nav-button-color');
    document.getElementById('legal-notice').classList.remove('nav-button-color');
    renderTasks();
}
/**
 * Function which is responsible for picking the color of a category
 */
function pickColor(x) {
    switch (x) {
        case 'Sales':
            return 'pink';
        case 'Backoffice':
            return 'lightgreen';
        case 'Marketing':
            return 'lightblue';
        case 'Media':
            return 'yellow';
        case 'Design':
            return 'orange';
        default:
            return '#ff0000a6';
    }
};
/**
 * Function the renders a PopUp Message
 */
async function popUpAddTask(state) {
    let response = await fetch('./homepage/add_task.html');
    if (response.ok) {
        let content = await response.text();
        document.body.insertAdjacentHTML("beforeend", `
        <div onclick="this.remove()" id="animation2" class="display-flex justify-center align-center global-animation-background global-animation-darken animation-duration">
            <div class="animation-div max-mobile global-animation-slide-in animation-duration">${content}</div>
        </div>
        `);
    }
    document.getElementById('clear').remove();
    document.querySelectorAll('.main')[1].classList.remove('main');
    document.querySelector('.animation-div').children[0].style.padding = "1.25rem";
    document.querySelector('.animation-div').children[0].style.position = "relative";
    document.querySelector('.animation-div').addEventListener('click', (event) => event.stopPropagation()
    );
    addTaskData(state);
}

let data;

/**
 * On Drag Function
 */
function drag(event) {
    data = event.target;
}

/**
 * On Drop Function
 */
async function drop(event, target) {
    event.preventDefault();
    target.append(data);
    let tasks = await backend.getItem('tasks');
    tasks[data.id].status = target.id;
    await backend.setItem('tasks', tasks);
}

let currentTask;
/**
 * Function that executes JavaScript for 'board_detail.html'
 */
async function boardDetail(task) {
    document.getElementById('overlay').classList.remove('display-none');
    await loadHTML('./homepage/overlays/board_detail.html', 0);
    const category = document.getElementById('category');
    const headline = document.getElementById('headline');
    const description = document.getElementById('description');
    const dueDate = document.getElementById('due-date');
    const priority = document.getElementById('priority');
    const prioritySymbol = document.getElementById('priority-symbol');
    const priorityBackground = document.getElementById('priority-background');
    let tasks = backend.getItem('tasks');
    category.innerHTML = tasks[task].category;
    priorityBackground.classList.add(tasks[task].priority);
    headline.innerHTML = tasks[task].title;
    description.innerHTML = tasks[task].description;
    dueDate.innerHTML = tasks[task].dueDate;
    priority.innerHTML = tasks[task].priority.slice(0, 1).toUpperCase() + tasks[task].priority.slice(1);
    prioritySymbol.src = `./images/board/${tasks[task].priority}.svg`;
    const assignedTo = document.getElementById('assigned-to');
    for (user of tasks[task].assignedTo) {
        if (session.contacts.includes(user)) {
            assignedTo.insertAdjacentHTML('beforeend', `
        <div class="display-flex align-center gap10">
                <div id="letters" style="background-color: ${backend.getItem(user).color}" class="circle-small">${backend.getItem(user).letters}</div> 
                <span id="names">${backend.getItem(user).name + " " + backend.getItem(user).surname}</span>
            </div>
        `);
        }
    }
    const subtasks = document.getElementById('subtasks');
    if (tasks[task].subtasks.length === 0) {
        subtasks.innerHTML = "-";
    }
    for (let subtask of tasks[task].subtasks) {
        subtasks.insertAdjacentHTML('beforeend',
        `<div onclick="changeSubtask(this, ${task})" class="cursor-pointer display-flex space-between align-center">
            <span>${subtask}</span>
            <input id="${tasks[task].subtasks.indexOf(subtask)}" onclick="preventDefault(); Stop propagtion" disabled type="checkbox">
        </div>`)
        if (tasks[task].doneSubtasks.includes(subtask)) {
            document.getElementById(tasks[task].subtasks.indexOf(subtask)).checked = true
        }
    }
    currentTask = task;
    category.style.background = pickColor(category.innerHTML);
    function pickColor(x) {
        switch (x) {
            case 'Sales':
                return 'pink';
            case 'Backoffice':
                return 'lightgreen';
            case 'Marketing':
                return 'lightblue';
            case 'Media':
                return 'yellow';
            case 'Design':
                return 'orange';
            default:
                return '#ff0000a6';
        }
    };
}

/**
 * Function that checks a checkbox when pressing the parent element
 */
function changeSubtask(x, task) {
    x.children[1].checked = !x.children[1].checked
    let oldTask = jsonFromServer['tasks'][task]
    if (x.children[1].checked) {
        oldTask.doneSubtasks.push(x.children[0].innerHTML)
    } else if (x.children[1].checked === false) {
        oldTask.doneSubtasks.splice(oldTask.doneSubtasks.indexOf(x.children[0].innerHTML), 1)
    }
    newTasks = backend.getItem('tasks')
    newTasks[task] = oldTask
    backend.setItem('tasks', newTasks)
    initiateBoard()
}

/**
 * Function that executes JavaScript for 'board_detail_edit.html'
 */
async function boardDetailEdit() {
    await loadHTML('./homepage/overlays/board_detail_edit.html', 0);
    let tasks = backend.getItem('tasks');
    const headline = document.getElementById('headline');
    const description = document.getElementById('description');
    const dueDate = document.getElementById('due-date');
    let markedButton = tasks[currentTask].priority;
    const urgent = document.getElementById('urgent');
    const medium = document.getElementById('medium');
    const low = document.getElementById('low');
    const select = document.getElementById('select');
    document.getElementById(tasks[currentTask].priority).classList.add(tasks[currentTask].priority);
    urgent.addEventListener('click', (e) => {
        medium.classList.remove('medium');
        low.classList.remove('low');
        urgent.classList.add('urgent');
        markedButton = 'urgent';
    }
    );
    medium.addEventListener('click', (e) => {
        medium.classList.add('medium');
        low.classList.remove('low');
        urgent.classList.remove('urgent');
        markedButton = 'medium';
    }
    );
    low.addEventListener('click', (e) => {
        medium.classList.remove('medium');
        low.classList.add('low');
        urgent.classList.remove('urgent');
        markedButton = 'low';
    }
    );
    const OPTIONS = document.getElementById('contacts-dropdown');
    for (let contact of session.contacts) {
        OPTIONS.insertAdjacentHTML('beforeend', `
        <div onclick="check(this, '${jsonFromServer[contact].email}', 'assigned-contacts')" class="cursor-pointer space-between align-center fake-option">
            <div class="display-flex align-center gap10">
                <div style="background-color: ${jsonFromServer[contact].color};" class="circle-small">${jsonFromServer[contact].letters}</div>
                <span id="name">${jsonFromServer[contact].name + " " + jsonFromServer[contact].surname}</span>
            </div>
            <input disabled id="${contact + 'input'}" class="cursor-pointer" type="checkbox">
        </div>`);
        if (tasks[currentTask].assignedTo.includes(contact)) {
            document.getElementById(contact + 'input').checked = true;
            if (!assignments.includes(contact)) {
                assignments.push(contact);
            }
        }
    }
    const assignedTo = document.getElementById('assigned-contacts');
    for (user of tasks[currentTask].assignedTo) {
        if (session.contacts.includes(user)) {
            assignedTo.innerHTML +=
                `
            <div id="${jsonFromServer[user].email + 'letter'}" style="background-color: ${backend.getItem(user).color}" class="circle-small">${backend.getItem(user).letters}</div> 
    `;
        }
    }
    select.value = tasks[currentTask].status;
    dueDate.min = new Date().toISOString().split("T")[0];
    headline.value = tasks[currentTask].title;
    description.value = tasks[currentTask].description;
    dueDate.value = tasks[currentTask].dueDate;
    let confirmButton = document.getElementById('confirm-change');
    confirmButton.addEventListener('submit', async (e) => {
        e.preventDefault();
        let save = await backend.getItem('tasks');
        save[currentTask].title = headline.value;
        save[currentTask].description = description.value;
        save[currentTask].dueDate = dueDate.value;
        save[currentTask].priority = markedButton;
        save[currentTask].assignedTo = assignments;
        save[currentTask].status = select.value;
        assignments = [];
        await backend.setItem('tasks', save);
        initiateBoard();
        boardDetail(currentTask);
    });
}

let assignments = [];
/**
 * Function for checking Input by pressing on parent Div
 */
function check(x, email, id) {
    x.children[1].checked = !x.children[1].checked;
    let place = document.getElementById(id)
    if (x.children[1].checked) {
        assignments.push(email);
        return place.insertAdjacentHTML('beforeend', `
        <div name="${email}" id="${email + 'letter'}" style="background-color: ${jsonFromServer[email].color}" class="circle-small">${jsonFromServer[email].letters}</div> 
`);
    }
    assignments.splice(assignments.indexOf(email), 1);
    document.getElementById(email + 'letter').remove();
}

let chosen = [];
/**
 * Function that executes JavaScript for 'add_task.html'
 */
async function initiateAddTask() {
    await loadHTML('./homepage/add_task.html', 1);
    chosen = [];
    last_pressed = 'add-task';
    document.getElementById('questionmark').classList.remove('display-none');
    document.getElementById('summary').classList.remove('nav-button-color');
    document.getElementById('board').classList.remove('nav-button-color');
    document.getElementById('add-task').classList.add('nav-button-color');
    document.getElementById('contacts').classList.remove('nav-button-color');
    document.getElementById('legal-notice').classList.remove('nav-button-color');
    addTaskData();
}

/**
 * Function that executes JavaScript for 'add_task.html' in a seperate Function since it is used more than one time
 */
function addTaskData(state) {
    chosen = [];
    const DUE_DATE = document.getElementById('due-date');
    DUE_DATE.min = new Date().toISOString().split("T")[0];
    DUE_DATE.value = new Date().toISOString().split("T")[0];
    let priority = 'medium';
    urgent.addEventListener('click', (e) => {
        medium.classList.remove('medium');
        low.classList.remove('low');
        urgent.classList.add('urgent');
        priority = 'urgent';
    }
    );
    medium.addEventListener('click', (e) => {
        medium.classList.add('medium');
        low.classList.remove('low');
        urgent.classList.remove('urgent');
        priority = 'medium';
    }
    );
    low.addEventListener('click', (e) => {
        medium.classList.remove('medium');
        low.classList.add('low');
        urgent.classList.remove('urgent');
        priority = 'low';
    }
    );

    // let select = document.getElementById('select');
    // for (let x = 0; x < jsonFromServer.categories.length; x++) {
    //     select.innerHTML += `
    // <option value="${jsonFromServer.categories[x]}">${jsonFromServer.categories[x]}</option>
    // `;
    // }

    let dropDown = document.getElementById('fake-dropdown');
    for (let x = 0; x < jsonFromServer.categories.length; x++) {
        dropDown.innerHTML += `
    <div onclick="category('${jsonFromServer.categories[x]}')" class="fake-option gap10 cursor-pointer transition">${jsonFromServer.categories[x]} <div style="background-color: ${pickColor(jsonFromServer.categories[x])}" class="circle-mini"></div></div>
    `;
    }
    const LIST = document.getElementById('contacts-dropdown');
    for (let contact of session.contacts) {
        LIST.insertAdjacentHTML('beforeend', `
        <div onclick="check(this, '${jsonFromServer[contact].email}', 'assigned-contacts')" class="space-between cursor-pointer fake-option">
            <div class="display-flex align-center gap10">
                <div style="background-color: ${jsonFromServer[contact].color};" class="circle-small">${jsonFromServer[contact].letters}</div>
                <span id="name">${jsonFromServer[contact].name + " " + jsonFromServer[contact].surname}</span>
            </div>
            <input disabled id="${contact + 'input'}" class="cursor-pointer" type="checkbox">
        </div>`);
    }
    contacts.addEventListener('change', (e) => {
        let place = document.getElementById('contact');
        if (!chosen.includes(contacts.value)) {
            chosen.push(contacts.value);
            place.innerHTML += `
        <div name="${jsonFromServer[contacts.value].email}" onclick="this.remove(); chosen.splice(${chosen.indexOf(contacts.value)},1)" style="background-color: ${jsonFromServer[contacts.value].color}" class="cursor-pointer circle-small">
            ${jsonFromServer[contacts.value].name[0] + jsonFromServer[contacts.value].surname[0]}
        </div>
    `;
        }
        contacts.children[0].selected = true;
    });
    let check2 = document.getElementById('check2');
    let check2Input = document.getElementById('check2-input');
    let check2Div = document.getElementById('check2-div');
    let subArr = [];
    check2.addEventListener('click', (e) => {
        check2Div.innerHTML += `<span onclick="this.remove()" class="cursor-pointer">${check2Input.value}</span>`;
        subArr.push(check2Input.value);
        check2Input.value = "";
    });
    let form = document.getElementById('form');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        addTask(subArr);
        if (last_pressed === 'add-task') initiateAddTask();
        initiateBoard();
        playPopup('Task Was Added To Board!');
    })
    /**
 * Function that adds a new task to the backend
 */
    function addTask(subArr) {
        const title = document.getElementById('title');
        const description = document.getElementById('description');
        const category = document.getElementById('selected-category').firstChild;
        const assignedTo = document.getElementById('assigned-contacts');
        const dueDate = document.getElementById('due-date');
        const subtasks = subArr;
        let arr = [];
        for (x = 0; x < assignedTo.children.length; x++) {
            arr.push(assignedTo.children[x].getAttribute('name'));
        }
        const task = {
            title: title.value,
            description: description.value,
            category: category.data.trim(),
            assignedTo: arr || '',
            dueDate: dueDate.value,
            priority: priority,
            subtasks: subtasks,
            doneSubtasks: [],
            status: state || 'toDo',
        }
        if (backend.getItem('tasks') === null) backend.setItem('tasks', []);
        let tasks = backend.getItem('tasks');
        tasks.push(task);
        backend.setItem('tasks', tasks);
    }
}

/**
 * Function that adds a new category
 */
async function check1() {
    let checkInput = document.getElementById('check1-input');
    let dropDown = document.getElementById('fake-dropdown');
    if (checkInput.value.length < 1) return;
    let save = await backend.getItem('categories');
    save.push(checkInput.value);
    await backend.setItem('categories', save);
    dropDown.innerHTML += `
        <div onclick="category('${checkInput.value}')" class="fake-option gap10 cursor-pointer transition">${checkInput.value} <div style="background-color: red" class="circle-mini"></div></div>
    `;
    document.getElementById('selected-category').innerHTML = `${checkInput.value} <div style="background-color: red" class="circle-mini"></div>`;
    checkInput.value = "";
}

/**
 * Function that creates a new category
 */
function addNewCategory() {
    let selectInput = document.getElementById('select-input');
    document.getElementById('fake-dropdown-full').classList.add('display-none');
    selectInput.classList.remove('display-none');
    selectInput.children[0].focus();
    toggleDropDown();
    selectInput.addEventListener('focusout', (e) => {
        setTimeout(() => {
            document.getElementById('fake-dropdown-full').classList.remove('display-none');
            selectInput.classList.add('display-none');
        }, 125);
    });
}

/**
 * Function that shows the selected category at the top
 */
function category(x) {
    document.getElementById('selected-category').innerHTML = `${x} <div style="background-color: ${pickColor(x)}" class="circle-mini"></div>`;
    toggleDropDown();
}

/**
 * Function that toggles the dropdown
 */
function toggleDropDown() {
    document.getElementById('fake-dropdown').classList.toggle('display-none');
    document.getElementById('arrow').classList.toggle('inverted');
}

/**
 * Function that toggles the second dropdown
 */
function toggleDropDown2() {
    document.getElementById('contacts-dropdown').classList.toggle('display-none');
    document.getElementById('arrow2').classList.toggle('inverted');
}

/**
 * Function that shows a custom PopUp Message
 */
function playPopup(message) {
    document.body.insertAdjacentHTML('beforeend', `<div id="animation" class="global-animation-background animation-duration">
    <div class="global-animation-up animation-duration button-dark-white radius">${message}</div>
</div>`)
    setTimeout(() => {
        document.getElementById('animation').remove();
        if (document.getElementById('animation2')) document.getElementById('animation2').remove();
    }, 2000);
}

/**
 * Function that executes JavaScript for 'contacts.html'
 */
async function initiateContacts() {
    await loadHTML('./homepage/contacts.html', 1);
    last_pressed = 'contacts';
    document.getElementById('questionmark').classList.remove('display-none');
    document.getElementById('summary').classList.remove('nav-button-color');
    document.getElementById('board').classList.remove('nav-button-color');
    document.getElementById('add-task').classList.remove('nav-button-color');
    document.getElementById('contacts').classList.add('nav-button-color');
    document.getElementById('legal-notice').classList.remove('nav-button-color');
    let contactDiv = document.getElementById('contact-stuff');
    let sorted = session.contacts.sort();
    for (contact of sorted) {
        contact = jsonFromServer[contact];
        let bigLetter = document.getElementById(contact.name[0]);
        let template = `
        <div id="${contact.email}" onclick="contactsMark(this); document.getElementById('hide2').classList.add('glitch'); document.getElementById('hide').classList.remove('glitch')" class="contact cursor-pointer radius transition">
            <div style="background-color: ${contact.color};" class="circle-small">${contact.name[0] + "" + contact.surname[0]}</div>
            <div class="display-flex justify-center flex-column">
                <span>${contact.name + " " + contact.surname}</span>
                <span class="forgot-my-password small-font">${contact.email}</span>
            </div>
        </div>
        `;
        let letterTemplate = `
        <span id="${contact.name[0]}" class="letter underlineV2">${contact.name[0].toUpperCase()}</span>
        `;
        if (bigLetter) {
            bigLetter.insertAdjacentHTML('afterend', template);
        } else {
            contactDiv.insertAdjacentHTML('beforeend', letterTemplate);
            let bigLetter = document.getElementById(contact.name[0]);
            bigLetter.insertAdjacentHTML('afterend', template);
        }
    }
    contactsMark(document.getElementById(session.contacts[0]));
}

/**
 * Function which is responsible for rendering the right side of contacts
 */
function contactDetail(user) {
    document.getElementById('hide').classList.remove('mobile-none');
    const name = document.getElementById('name');
    const number = document.getElementById('number');
    const email = document.getElementById('email');
    const letters = document.getElementById('letters');
    const currentSelected = jsonFromServer[user];
    let editContact = document.getElementById('edit-contact');
    name.innerHTML = currentSelected.name + " " + currentSelected.surname;
    letters.innerHTML = currentSelected.letters;
    letters.style.backgroundColor = `${currentSelected.color}`;
    email.innerHTML = currentSelected.email;
    number.innerHTML = currentSelected.number || '+123 456 789';
    let clone = editContact.cloneNode(true);
    editContact.remove();
    document.getElementById('clone').insertAdjacentElement('beforeend', clone);
    clone.addEventListener('click', () => edit(currentSelected));
}

/**
 * Function that renders the edit contact HTML
 */
function edit(user) {
    document.body.insertAdjacentHTML("beforeend", `
    <div onclick="this.remove()" id="animation2" class="padding5 display-flex justify-center align-center global-animation-background global-animation-darken animation-duration">
        <div onclick="event.stopPropagation()" class="animation-div global-animation-slide-in animation-duration display-flex">
            <div class="mobile-none gap20 display-flex radius padding20 flex-column justify-center add-contact1">
                <img class="join-logo" src="./images/join_logoV2.svg">
                <h2 class="underlineV3">Edit Contact</h2>
            </div>
                <div class="display-flex align-center padding20 gap20">
                <div class="circle-large" style="background-color: ${user.color}">${user.letters}</div>
                <form onsubmit="confirmContact('${user.email}');return false" class="gap20 align-center display-flex flex-column space-evenly">
                    <input value="${user.name}" required type="text" id="iname" placeholder="Name" class="name radius input">
                    <input value="${user.surname}" required type="text" id="isurname" placeholder="Surname" class="name radius input">
                    <input value="${user.email}" required type="email" id="iemail" placeholder="E-Mail" class="email radius input">
                    <input pattern="[0-9, +]+" value="${user.number || '+123 123 123'}" required type="text" id="inumber" placeholder="Phone Number" class="phone radius input">
                    <button type="submit" class="cursor-pointer button-dark-white radius">Confirm Changes ✓</button>
                </form>
                </div>
        </div>
    </div>
    `);
}

/**
 * Function that confirms the changes done to a contact
 */
function confirmContact(mail) {
    const name = document.getElementById('iname');
    const number = document.getElementById('inumber');
    const surname = document.getElementById('isurname');
    const email = document.getElementById('iemail');
    const letter = name.value[0] + surname.value[0];
    if (mail !== email.value) {
        session.contacts.splice(session.contacts.indexOf(mail), 1)
        session.contacts.push(email.value)
        backend.deleteItem(mail);
    }
    const updatedContact = {
        name: name.value,
        surname: surname.value,
        email: email.value,
        number: number.value,
        color: `rgb(${Math.floor(Math.random() * 255)},${Math.floor(Math.random() * 255)},${Math.floor(Math.random() * 255)})`,
        letters: letter,
    }
    backend.setItem(email.value, updatedContact);
    document.getElementById('animation2').remove();
    initiateContacts();
    playPopup('Contact Sucessfully Edited!');
}

/**
 * Function which is responsible for marking the contacts
 */
function contactsMark(target) {
    let contacts = document.querySelectorAll('.contact');
    for (let contact of contacts) {
        contact.style.backgroundColor = 'white';
        contact.style.color = 'black';
    }
    target.style.backgroundColor = '#2A3647';
    target.style.color = 'white';
    contactDetail(target.id);
}

/**
 * Function that renders HTML to add a new contact
 */
function addContact() {
    document.body.insertAdjacentHTML("beforeend", `
    <div onclick="this.remove()" id="animation2" class="padding5 display-flex justify-center align-center global-animation-background global-animation-darken animation-duration">
        <div onclick="event.stopPropagation()" class="animation-div global-animation-slide-in animation-duration display-flex">
            <div class="mobile-none gap20 display-flex radius padding20 flex-column justify-center add-contact1">
                <img class="join-logo" src="./images/join_logoV2.svg">
                <h2>Add Contact</h2>
                <p class="underlineV3">Tasks Are Better With A Team!</p>
            </div>
                <form onsubmit="addContactAdd();return false" class="gap20 align-center padding20 display-flex flex-column space-evenly">
                    <input required type="text" id="iname" placeholder="Name" class="name radius input">
                    <input required type="text" id="isurname" placeholder="Surname" class="name radius input">
                    <input required type="email" id="iemail" placeholder="E-Mail" class="email radius input">
                    <input pattern="[0-9, +]+" required type="text" id="inumber" placeholder="Phone Number" class="phone radius input">
                    <button class="cursor-pointer button-dark-white radius">Create Contact ✓</button>
                </form>
        </div>
    </div>
    `);
}

/**
 * Function that confirms the creation of a new contact
 */
function addContactAdd() {
    const name = document.getElementById('iname');
    const number = document.getElementById('inumber');
    const surname = document.getElementById('isurname');
    const email = document.getElementById('iemail');
    const letter = name.value[0] + surname.value[0];
    const fakeContact = {
        name: name.value,
        surname: surname.value,
        email: email.value,
        number: number.value,
        color: `rgb(${Math.floor(Math.random() * 255)},${Math.floor(Math.random() * 255)},${Math.floor(Math.random() * 255)})`,
        letters: letter,
    }
    backend.setItem(email.value, fakeContact);
    const updated = session;
    updated.contacts.push(email.value);
    backend.setItem(session.email, updated);
    document.getElementById('animation2').remove();
    initiateContacts();
    playPopup('Contact Sucessfully Added!');
}