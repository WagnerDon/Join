/**
 * Function to insert HTML into specific location
 */
async function loadHTML(file, include) {
    let element = document.querySelectorAll('[w3-include-html]')[include];
    if (!file) {
        file = element.getAttribute('w3-include-html');
    }
    let response = await fetch(file);
    if (response.ok) return element.innerHTML = await response.text();
    element.innerHTML = 'Page Not Found';
}

/**
 * Function to play display animations
 */
function animation(text, target) {
    document.body.style.overflow = 'hidden';
    const location = document.querySelector([target]);
    const background = document.createElement('div');
    background.classList.add('global-animation-background');
    background.classList.add('animation-duration');
    const message = document.createElement('div');
    message.classList.add('global-animation-up');
    message.classList.add('animation-duration');
    message.innerHTML =
        `
    <div class="button-dark-white radius transition two-element">
    ${text}
    </div>
    `;
    location.append(background);
    location.append(message);
    setTimeout(() => { background.remove(); document.body.style.overflow = 'auto'; }, 1000);
}

/**
 * Function to add an user
 */
function addUser() {
    const name = document.getElementById('name');
    const surname = document.getElementById('surname');
    const email = document.getElementById('email');
    const password = document.getElementById('password');
    const user = {
        name: name.value.trim(),
        surname: surname.value.trim(),
        email: email.value.toLowerCase(),
        password: password.value,
        color: `rgb(${Math.floor(Math.random() * 255)},${Math.floor(Math.random() * 255)},${Math.floor(Math.random() * 255)})`,
        contacts: ['muster@muster'],
    }
    user.letters = user.name[0] + user.surname[0];
    if (!jsonFromServer[email.value.toLowerCase()]) return backend.setItem(`${email.value.toLowerCase()}`, user);
    return false;
}

/**
 * Function to clear the backend
 */
function clear(target) {
    if (target) return backend.deleteItem(target);

    for (let object in jsonFromServer) {
        backend.deleteItem(object);
    }
    console.log(jsonFromServer);
}

/**
 * Function to add a task
 */
function addTask() {
    const title = document.getElementById('title');
    const description = document.getElementById('description');
    const category = document.getElementById('category');
    const assignedTo = document.getElementById('assiged-to');
    const dueDate = document.getElementById('due-date');
    const priority = document.getElementById('priority');
    const subtasks = document.getElementById('subtasks');
    const task = {
        title: title,
        description: description,
        category: category,
        assignedTo: assignedTo,
        dueDate: dueDate,
        priority: priority,
        subtasks: subtasks,
        status: 'toDo',
    }
    if (backend.getItem('tasks') === null) backend.setItem('tasks', []);
    let tasks = backend.getItem('tasks');
    tasks.push(task);
    backend.setItem('tasks', tasks);
}

/**
 * Function to default Categories
 */
function categoriesReset() {
    backend.setItem('categories', ['Sales', 'Backoffice', 'Marketing', 'Media', 'Design']);
}