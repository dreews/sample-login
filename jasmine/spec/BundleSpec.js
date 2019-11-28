window.Helper.request = () => { }

describe("#app", function () {
  let token;
  window.localStorage.getItem = () => token
  window.localStorage.setItem = (name, newToken) => token = newToken
  window.localStorage.removeItem = () => token = null

  beforeEach(() => {
    const app = document.querySelector('#app')
    app.innerHTML = '';
    window.localStorage.removeItem();
  })

  describe("#init", function () {
    it("Should call methods", function () {
      const sampleLoginApp = new SampleLoginApp();

      spyOn(sampleLoginApp, 'token');
      spyOn(sampleLoginApp, 'binds');
      spyOn(sampleLoginApp, 'render');

      sampleLoginApp.init();

      expect(sampleLoginApp.token).toHaveBeenCalled();
      expect(sampleLoginApp.binds).toHaveBeenCalled();
      expect(sampleLoginApp.render).toHaveBeenCalled();
    });

    it("if token expired", async function () {
      const sampleLoginApp = new SampleLoginApp();
      sampleLoginApp.init();

      expect(await document.querySelector('.login').nodeType).toBe(1);
      expect(location.hash).toEqual('#login');
      expect(sampleLoginApp.token().isExpired).toBe(true);
    });

    it("if token not expired", async function () {
      const sampleLoginApp = new SampleLoginApp();

      localStorage.setItem('token', `${btoa('t@t.com' + '1234')}.${btoa('http://www')}.${(new Date()).getTime() + 30000}`);

      spyOn(sampleLoginApp, 'getDevelopersList');
      spyOn(sampleLoginApp, 'renderPageUsers');

      sampleLoginApp.init();

      expect(await document.querySelector('.login')).toBe(null);
      expect(location.hash).toEqual('#users');
      expect(sampleLoginApp.token().isExpired).toBe(false);
      expect(sampleLoginApp.getDevelopersList).toHaveBeenCalledWith('http://www')
      expect(sampleLoginApp.renderPageUsers).toHaveBeenCalled()
    });
  });

  describe("#render", function () {
    it("Should append childs", async function () {
      const sampleLoginApp = new SampleLoginApp();
      sampleLoginApp.init();

      expect(await document.querySelector('.logo').nodeType).toBe(1);
      expect(await document.querySelector('.form').nodeType).toBe(1);
    });
  });

  describe("#token", function () {
    it("Should return not expired", function () {
      const sampleLoginApp = new SampleLoginApp();
      localStorage.setItem('token', `${btoa('t@t.com' + '1234')}.${btoa('http')}.${(new Date()).getTime() + 300000}`);

      expect(sampleLoginApp.token().isExpired).toBe(false)
    });

    it("Should return expired", function () {
      const sampleLoginApp = new SampleLoginApp();
      localStorage.setItem('token', `${btoa('t@t.com' + '1234')}.${btoa('http')}.${(new Date()).getTime() - 1}`);

      expect(sampleLoginApp.token().isExpired).toBe(true)
    });

    it("Should contain url of api", async function () {
      const sampleLoginApp = new SampleLoginApp();

      localStorage.setItem('token', `${btoa('t@t.com' + '1234')}.${btoa('http')}.${(new Date()).getTime()}`);

      expect(await sampleLoginApp.token().developersApi).toEqual('http')
    });
  });

  describe("#getDevelopersList", function () {
    it("Should return data of request", async function () {
      const sampleLoginApp = new SampleLoginApp();

      window.Helper.request = () => [{ login: 'foo', avatar_url: 'foo.jpg' }]

      const data = await sampleLoginApp.getDevelopersList('http://www')

      expect(data[0]).toEqual(
        jasmine.objectContaining({
          login: 'foo',
          avatar_url: 'foo.jpg',
        })
      )
    });
  });

  describe("#fakeAuthenticate", function () {
    it("Should return data of request", async function () {
      const sampleLoginApp = new SampleLoginApp();

      window.Helper.request = () => ({ url: 'http://foo' })

      const data = await sampleLoginApp.fakeAuthenticate('t@t.com', '123')
      localStorage.setItem('token', `${btoa('t@t.com' + '1234')}.${btoa('http')}.123`);
      const token = localStorage.getItem().split('.')

      expect(data.url).toEqual('http://foo')
      expect(token[0]).toEqual('dEB0LmNvbTEyMzQ=')
      expect(token[1]).toEqual('aHR0cA==')
      expect(token[2]).toEqual('123')
    });
  });

  describe("#renderPageUsers", function () {
    it("Should render ul container", async function () {
      const sampleLoginApp = new SampleLoginApp();
      sampleLoginApp.init();

      sampleLoginApp.renderPageUsers([{ login: 'foo', avatar_url: 'foo.jpg' }])

      expect(await document.querySelector('.container').nodeType).toEqual(1)
    });

    it("Should render first item with infos of users", async function () {
      const sampleLoginApp = new SampleLoginApp();
      sampleLoginApp.init();

      sampleLoginApp.renderPageUsers([{ login: 'foo', avatar_url: 'foo.jpg' }])

      expect(await document.querySelector('.container').children[0].textContent).toContain('foo')
      expect(await document.querySelector('.container').querySelector('img').src).toContain('foo.jpg')
    });
  });
});
