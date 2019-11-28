(() => {
  const FAKEAUTH_URL = 'http://www.mocky.io/v2/5dba690e3000008c00028eb6';

  const request = (url, { method }) => {
    return (
      fetch(
        url,
        {
          method,
          headers: new Headers({
            'Content-Type': 'application/json',
          })
        },
      ).then(
        (response) => response.json()
      ).catch((error) => error)
    )
  }

  const selector = selector => document.querySelector(selector);
  const create = element => document.createElement(element);

  const app = selector('#app');

  const Login = create('div');
  Login.classList.add('login');

  const Logo = create('img');
  Logo.src = './assets/images/logo.svg';
  Logo.classList.add('logo');

  const Form = create('form');
  Form.classList.add('form');

  const FormContent = `
    <input class="form__input" name="email" type="email" minlength="5" placeholder="Entre com seu e-mail">
    <input class="form__input" name="password" type="password" placeholder="Digite sua senha supersecreta">
    <button class="form__button" type="submit" disabled>Entrar</button>
  `;

  Form.onsubmit = async e => {
    e.preventDefault();
    const [email, password] = e.target.children;
    const { url } = await fakeAuthenticate(email.value, password.value);
    location.href = '#users';
    const users = await getDevelopersList(url);
    renderPageUsers(users);
  };

  Form.oninput = e => {
    const [email, password, button] = e.target.parentElement.children;
    (!email.validity.valid || !email.value || password.value.length <= 5)
      ? button.setAttribute('disabled', 'disabled')
      : button.removeAttribute('disabled');
  };

  Form.innerHTML = FormContent
  app.appendChild(Logo);
  Login.appendChild(Form);

  async function fakeAuthenticate(email, password) {
    const data = await request(FAKEAUTH_URL, { method: 'GET' })

    const fakeJwtToken = `${btoa(email + password)}.${btoa(data.url)}.${(new Date()).getTime() + 300000}`;
    localStorage.setItem('token', fakeJwtToken);

    return data;
  }

  async function getDevelopersList(url) {
    const data = await request(url, { method: 'GET' })

    return data;
  }

  function renderPageUsers(users) {
    const Ul = create('ul');
    app.classList.add('logged');
    Login.style.display = 'none';
    Ul.classList.add('container');
    let items = '';

    users.forEach(item => {
      const { avatar_url: avatar, login } = item;

      items += `
        <li class="container__item">
          <a href="#users" class="container__item_link">
            <img class="container__avatar" src="${avatar}">
            <p class="container__text">
              ${login}
            </p>
          </a>
        </li>
      `
    });

    Ul.innerHTML = items;
    app.appendChild(Ul)
  }

  // init
  (async function () {
    const rawToken = localStorage.getItem('token');
    const token = rawToken ? rawToken.split('.') : null;
    const tokenTime = token && token[2];
    const tokenIsExpired = !token || tokenTime < (new Date()).getTime()

    if (tokenIsExpired) {
      localStorage.removeItem('token');
      location.href = '#login';
      app.appendChild(Login);
    } else {
      location.href = '#users';
      const users = await getDevelopersList(atob(token[1]));
      renderPageUsers(users);
    }
  })()
})()