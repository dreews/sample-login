((global) => {
  global.Helper = {
    selector: selector => document.querySelector(selector),
    create: element => document.createElement(element),
    request: (url, { method }) => (
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
    ),
  }

  const App = function () {
    const FAKEAUTH_URL = 'http://www.mocky.io/v2/5dba690e3000008c00028eb6';

    const createLogin = () => {
      const Login = global.Helper.create('div');
      Login.classList.add('login');

      return Login;
    };

    const createLogo = () => {
      const Logo = global.Helper.create('img');
      Logo.src = './assets/images/logo.svg';
      Logo.classList.add('logo');
      return Logo;
    };

    const createForm = () => {
      Form = global.Helper.create('form');
      Form.classList.add('form');

      const FormContent = `
        <input class="form__input" name="email" type="email" minlength="5" placeholder="Entre com seu e-mail">
        <input class="form__input" name="password" type="password" placeholder="Digite sua senha supersecreta">
        <button class="form__button" type="submit" disabled>Entrar</button>
      `;

      Form.innerHTML = FormContent;

      return Form;
    };

    this.renderPageUsers = (users) => {
      let items = '';
      const Ul = global.Helper.create('ul');
      Ul.classList.add('container');

      this.app.classList.add('logged');
      this.login.style.display = 'none';

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
      this.app.appendChild(Ul)
    }

    this.fakeAuthenticate = async (email, password) => {
      const data = await global.Helper.request(FAKEAUTH_URL, { method: 'GET' })

      const fakeJwtToken = `${btoa(email + password)}.${btoa(data.url)}.${(new Date()).getTime() + 300000}`;
      localStorage.setItem('token', fakeJwtToken);

      return data;
    };

    this.getDevelopersList = async (url) => {
      const data = await global.Helper.request(url, { method: 'GET' })

      return data;
    };

    this.binds = () => {
      this.form.onsubmit = async e => {
        e.preventDefault();
        const [email, password] = e.target.children;
        const { url } = await this.fakeAuthenticate(email.value, password.value);
        location.href = '#users';
        const users = await this.getDevelopersList(url);
        this.renderPageUsers(users);
      };

      this.form.oninput = e => {
        const [email, password, button] = e.target.parentElement.children;
        (!email.validity.valid || !email.value || password.value.length <= 5)
          ? button.setAttribute('disabled', 'disabled')
          : button.removeAttribute('disabled');
      };
    }

    this.render = () => {
      this.app.appendChild(this.logo);
      this.login.appendChild(this.form);
    }

    this.token = () => {
      const rawToken = localStorage.getItem('token');
      const token = rawToken ? rawToken.split('.') : null;
      const tokenTime = token && token[2];
      const isExpired = !token || tokenTime < (new Date()).getTime();

      return {
        isExpired,
        developersApi: !isExpired ? atob(token[1]) : null
      }
    }

    this.init = async () => {
      this.app = global.Helper.selector('#app');
      this.login = createLogin();
      this.logo = createLogo();
      this.form = createForm();
      this.binds();
      this.render();

      const token = this.token();

      if (token) {
        if (token.isExpired) {
          localStorage.removeItem('token');
          location.href = '#login';
          this.app.appendChild(this.login);
        } else {
          location.href = '#users';
          const users = await this.getDevelopersList(token.developersApi);
          this.renderPageUsers(users);
        }
      }

    }
  };

  const app = new App()
  app.init();

  global.SampleLoginApp = App;
})(window);
