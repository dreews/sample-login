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

  const FormContent = `
    <input name="email" type="email" minlength="5" placeholder="email">
    <input name="password" type="password" placeholder="senha">
    <button type="submit">Enviar</button>
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
    let all = '';

    users.forEach(item => {
      all += `
        <li>
          <p>
            ${item.login}
          </p>
        </li>
      `
    });

    Ul.innerHTML = all;
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