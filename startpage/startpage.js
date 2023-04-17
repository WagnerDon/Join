let quick_save_email;
const l_email = localStorage.getItem('join_email');
const l_password = localStorage.getItem('join_password');

window.addEventListener('load', async (e) => {
    await downloadFromServer();
    await loadHTML('./startpage/log_in.html', 0);
    initiateLogIn();
    playAnimation();
});

/**
 * Function that executes JavaScript for "log_in.html"
 */
function initiateLogIn() {
    document.getElementById('password').value = l_email && l_password;
    document.getElementById('email').value = l_password && l_email;

    const checkbox = document.getElementById('checkbox');
    const checkbox_child = checkbox.children[0];
    checkbox_child.addEventListener('click', e => e.stopPropagation());
    checkbox.addEventListener('click', (e) => {
        if (checkbox_child.checked) {
            return checkbox_child.checked = false
        }
        checkbox_child.checked = true;
    });

    /**
     * Function that saves or deletes user data in local storage dependent on checkbox setting.
     */
    function rememberMe() {
        localStorage.setItem('join_email', document.getElementById('email').value);
        localStorage.setItem('join_password', password.value);
        if (checkbox_child.checked) return localStorage.setItem('remember', 'true');
        localStorage.setItem('remember', 'false');
    }

    const password = document.getElementById('password');
    const url_closed_eye = 'url("./images/input/closed_eye.svg")';
    const url_opened_eye = 'url("./images/input/opened_eye.svg")';

    password.addEventListener('dblclick', function (e) {
        if (!this.value) return;
        if (this.style.backgroundImage === url_opened_eye) {
            this.setAttribute('type', 'password');
            this.blur(); this.focus();
            return this.style.backgroundImage = url_closed_eye;
        }
        this.style.backgroundImage = url_opened_eye;
        this.setAttribute('type', 'text');
        this.blur(); this.focus();
    });

    const url_password = 'url("./images/input/password.svg")';

    password.addEventListener('input', function (e) {
        if (this.value) {
            if (!this.style.backgroundImage || this.style.backgroundImage === url_password) return this.style.backgroundImage = url_closed_eye;
            return;
        }
        this.style.backgroundImage = url_password;
        this.setAttribute('type', 'password');
        this.blur(); this.focus();
    });

    const form = document.getElementById('form');
    form.addEventListener('submit', (e) => {
        const email = document.getElementById('email');
        const password = document.getElementById('password');
        if (!jsonFromServer[email.value.toLowerCase()] || password.value !== jsonFromServer[email.value.toLowerCase()].password) return document.getElementById('wrong-password').classList.remove('display-none');
        rememberMe();
        window.location.href = './homepage.html';
    });

    const guest = document.getElementById('guest-log-in');
    guest.addEventListener('click', (e) => {
        localStorage.setItem('remember', 'false')
        window.location.href = './homepage.html';
        localStorage.setItem('join_email', 'muster@muster');
        localStorage.setItem('join_password', 'Maxmuster1');
    });

    const sign_up = document.getElementById('sign-up');
    sign_up.addEventListener('click', async (e) => {
        await loadHTML('./startpage/sign_up.html', 0);
        initiateSignUp();
    });

    const forgot_password = document.getElementById('forgot-password');
    forgot_password.addEventListener('click', async (e) => {
        await loadHTML('./startpage/forgot_password.html', 0);
        initiateForgotPassword();
    });
}

/**
 * Function that executes JavaScript for "sign_up.html"
 */
function initiateSignUp() {
    const back_arrow = document.getElementById('back-arrow');
    back_arrow.addEventListener('click', async (e) => {
        await loadHTML('./startpage/log_in.html', 0);
        initiateLogIn();
    });

    const form = document.getElementById('form');
    form.addEventListener('submit', async (e) => {
        let message = `<p><span>${document.getElementById('name').value}</span> Has Been Successfully Registered.<p>`
        let wrong_password = document.getElementById('wrong-password');
        if (addUser() === false) return wrong_password.classList.remove('display-none');
        animation(message, '[w3-include-html]');
        setTimeout(async () => {
            await loadHTML('./startpage/log_in.html', 0);
            initiateLogIn();
        }, 3000);
    });

    const password = document.getElementById('password');
    const url_closed_eye = 'url("./images/input/closed_eye.svg")';
    const url_opened_eye = 'url("./images/input/opened_eye.svg")';

    password.addEventListener('dblclick', function (e) {
        if (!this.value) return;
        if (this.style.backgroundImage === url_opened_eye) {
            this.setAttribute('type', 'password');
            this.blur(); this.focus();
            return this.style.backgroundImage = url_closed_eye;
        }
        this.style.backgroundImage = url_opened_eye;
        this.setAttribute('type', 'text');
        this.blur(); this.focus();
    });

    const url_password = 'url("./images/input/password.svg")';

    password.addEventListener('input', function (e) {
        if (this.value) {
            if (!this.style.backgroundImage || this.style.backgroundImage === url_password) return this.style.backgroundImage = url_closed_eye;
            return;
        }
        this.style.backgroundImage = url_password;
        this.setAttribute('type', 'password');
        this.blur(); this.focus();
    });
}

/**
 * Function that executes JavaScript for "forgot_password.html"
 */
function initiateForgotPassword() {
    const back_arrow = document.getElementById('back-arrow');
    back_arrow.addEventListener('click', async (e) => {
        await loadHTML('./startpage/log_in.html', 0);
        initiateLogIn();
    });

    const form = document.getElementById('form');
    form.addEventListener('submit', async (e) => {
        const email = document.getElementById('email');
        if (!jsonFromServer[email.value.toLowerCase()]) return document.getElementById('wrong-password').classList.remove('display-none');
        let message =
            `
        <img class="icon" src="./images/icons/sent.svg">
        <p>An Email Has Been Sent To You.</p>
        `;
        animation(message, '[w3-include-html]');
        const button = document.getElementById('form-submit');
        button.setAttribute('disabled', 'true');

        setTimeout(async () => {
            await loadHTML('./startpage/reset_password.html', 0);
            initiateResetPassword();
        }, 3000);
        quick_save_email = email.value.toLowerCase();
    })
}

/**
 * Function that executes JavaScript for "reset_password.html"
 */
function initiateResetPassword() {
    document.getElementById('user').innerHTML = jsonFromServer[quick_save_email].name;
    const form = document.getElementById('form');
    const password1 = document.getElementById('password1');
    const password2 = document.getElementById('password2');
    const wrong_password = document.getElementById('wrong-password')
    const button = document.getElementById('form-submit');
    const message =
        `
<img class="icon" src="./images/input/password.svg">
<p>Password Changed.</p>
`;
    form.addEventListener('submit', (e) => {
        if (password1.value === password2.value) {
            button.setAttribute('disabled', 'true')
            jsonFromServer[quick_save_email].password = password1.value;
            backend.setItem(quick_save_email, jsonFromServer[quick_save_email]);
            setTimeout(async () => {
                await loadHTML('./startpage/log_in.html', 0);
                initiateLogIn();
            }, 3000);
            return animation(message, '[w3-include-html]');
        }
        wrong_password.classList.remove('display-none');
    });
}
/**
 * Function to start the Join-Logo animation in the beginning
 */
function playAnimation() {
    if (!document.getElementById('animation-background')) return;
    const background = document.getElementById('animation-background');
    const logo = document.getElementById('join-logo');
    background.classList.remove('pause');
    background.classList.add('played');
    logo.classList.remove('pause');
    logo.classList.add('played');
    setTimeout(() => background.remove(), 1000);
}