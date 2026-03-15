// Проверка, является ли пользователь админом
function isAdmin() {
  return currentUser && currentUser.role === 'admin';
}

// Добавить учетку админа, если ее нет
function ensureAdminUser() {
  let users = JSON.parse(localStorage.getItem('users') || '[{"id":1,"username":"user1","password":"1234","bookings":[]}]');
  if (!users.find(u => u.role === 'admin')) {
    users.push({ id: 9999, username: 'admin', password: 'admin', role: 'admin', bookings: [] });
    localStorage.setItem('users', JSON.stringify(users));
  }
}
// Полноценная логика сайта бронирования гостиниц
const app = document.getElementById('app');
let hotels = [];
let currentUser = null;

// Загрузка данных гостиниц
async function loadHotels() {
  if (hotels.length) return hotels;
  const res = await fetch('data/hotels.json');
  hotels = await res.json();
  return hotels;
}

function saveUser(user) {
  localStorage.setItem('user', JSON.stringify(user));
}
function loadUser() {
  const u = localStorage.getItem('user');
  if (u) currentUser = JSON.parse(u);
  else currentUser = null;
}

function logout() {
  localStorage.removeItem('user');
  currentUser = null;
  window.location.hash = '#login';
}

let lastSearch = null;
function renderHome() {
  // Получить сегодняшнюю дату в формате yyyy-mm-dd
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const minDate = `${yyyy}-${mm}-${dd}`;
  app.innerHTML = `
    <h1>Поиск гостиницы</h1>
    <form id="searchForm" class="search-form">
      <label>Город:
        <select name="city" required>
          <option value="">Выберите город</option>
          <option value="Алматы">Алматы</option>
          <option value="Астана">Астана</option>
        </select>
      </label>
      <label>Дата заезда:
        <input type="date" name="checkin" required min="${minDate}">
      </label>
      <label>Дата выезда:
        <input type="date" name="checkout" required min="${minDate}">
      </label>
      <button type="submit">Найти</button>
    </form>
  `;
  document.getElementById('searchForm').onsubmit = async function(e) {
    e.preventDefault();
    const city = this.city.value;
    const checkin = this.checkin.value;
    const checkout = this.checkout.value;
    if (!city || !checkin || !checkout) {
      alert('Заполните все поля!');
      return;
    }
    if (checkout <= checkin) {
      alert('Дата выезда должна быть позже даты заезда!');
      return;
    }
    lastSearch = { city, checkin, checkout };
    window.location.hash = '#searchresults';
  };
}

async function renderSearchResults() {
  if (!lastSearch) {
    window.location.hash = '#home';
    return;
  }
  const hotels = await loadHotels();
  const filtered = hotels.filter(h => h.city === lastSearch.city);
  app.innerHTML = `
    <h1>Доступные отели в городе ${lastSearch.city}</h1>
    <div class="search-dates">Период: <b>${lastSearch.checkin}</b> — <b>${lastSearch.checkout}</b></div>
    <div id="searchResults"></div>
    <button onclick="window.location.hash='#home'">Изменить поиск</button>
  `;
  renderHotelCards(filtered, true);
}

function renderHotelCards(hotels, withSearch) {
  const container = document.getElementById('searchResults');
  if (!hotels.length) {
    container.innerHTML = '<p>Нет отелей по вашему запросу.</p>';
    return;
  }
  container.innerHTML = `<div class="hotel-cards">${hotels.map(h => `
    <div class="hotel-card">
      <div class="hotel-img">${h.image ? `<img src="${h.image}" alt="${h.name}" loading="lazy">` : ''}</div>
      <div class="hotel-info">
        <h3>${h.name}</h3>
        <p>${h.description}</p>
        <button onclick="openHotelWithSearch(${h.id})">Смотреть номера</button>
      </div>
    </div>
  `).join('')}</div>`;
}

function openHotelWithSearch(id) {
  window.location.hash = `#hotel-${id}`;
}

async function renderHotels() {
  const hotels = await loadHotels();
  app.innerHTML = `<h1>Список гостиниц</h1><ul>${hotels.map(h => `<li><a href="#hotel-${h.id}">${h.name} (${h.city})</a></li>`).join('')}</ul>`;
}

async function renderHotel(id) {
  const hotels = await loadHotels();
  const hotel = hotels.find(h => h.id == id);
  if (!hotel) {
    app.innerHTML = '<h1>Гостиница не найдена</h1>';
    return;
  }
  // Фильтрация доступных номеров по датам (заглушка: если есть статус "отменено" или нет брони на эти даты — номер доступен)
  let availableRooms = hotel.rooms;
  if (lastSearch) {
    let bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    availableRooms = hotel.rooms.filter(r => {
      // Проверяем, есть ли бронь на этот номер в выбранный период и не отменена ли она
      return !bookings.some(b => b.hotelId === hotel.id && b.roomId === r.id && b.status !== 'отменено');
    });
  }
  app.innerHTML = `
    <div class="hotel-detail">
      <div class="hotel-img-large">${hotel.image ? `<img src="${hotel.image}" alt="${hotel.name}" loading="lazy">` : ''}</div>
      <div class="hotel-info-large">
        <h1>${hotel.name}</h1>
        <p>${hotel.description}</p>
        <h2>Каталог номеров</h2>
        <ul class="room-list">${availableRooms.length ? availableRooms.map(r => `<li>${r.type} — ${r.price}₸ <button onclick=\"bookRoom(${hotel.id},${r.id})\">Забронировать</button></li>`).join('') : '<li>Нет доступных номеров на выбранные даты</li>'}</ul>
        <button onclick="window.location.hash='${lastSearch ? '#searchresults' : '#home'}'">Назад к списку</button>
      </div>
    </div>
  `;
}

function bookRoom(hotelId, roomId) {
  if (!currentUser) {
    alert('Сначала войдите в аккаунт!');
    window.location.hash = '#login';
    return;
  }
  // Сохраняем бронирование в localStorage
  let bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
  bookings.push({ userId: currentUser.id, hotelId, roomId, date: new Date().toISOString() });
  localStorage.setItem('bookings', JSON.stringify(bookings));
  alert('Бронирование успешно!');
  window.location.hash = '#profile';
}



function renderProfile() {
  if (!currentUser) {
    window.location.hash = '#login';
    return;
  }
  let bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
  bookings = bookings.map((b, i) => ({...b, idx: i})).filter(b => b.userId === currentUser.id);
  app.innerHTML = `<h1>Профиль пользователя</h1>
    <p>Логин: ${currentUser.username}</p>
    <button onclick="logout()">Выйти</button>
    ${isAdmin() ? '<p><a href=\"#admin\">Панель администратора</a></p>' : ''}
    <h2>Мои бронирования</h2>
    <ul>${bookings.length ? bookings.map(b => `<li>Гостиница #${b.hotelId}, номер #${b.roomId}, дата: ${new Date(b.date).toLocaleString()}<br>Статус: <span id='status-user-${b.idx}'>${b.status || 'ожидает'}</span> ${b.status !== 'отменено' ? `<button onclick='userCancelBooking(${b.idx})'>Отменить</button>` : ''}</li>`).join('') : '<li>Нет бронирований</li>'}</ul>`;
}

function userCancelBooking(idx) {
  let bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
  bookings[idx].status = 'отменено';
  localStorage.setItem('bookings', JSON.stringify(bookings));
  document.getElementById('status-user-' + idx).innerText = 'отменено';
  renderProfile();
}

function renderAdmin() {
  let bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
  let users = JSON.parse(localStorage.getItem('users') || '[]');
  if (!isAdmin()) {
    app.innerHTML = '<h1>Нет доступа</h1>';
    return;
  }
  app.innerHTML = `<h1>Панель администратора</h1>
    <button onclick=\"window.location.hash='#profile'\">Назад в профиль</button>
    <h2>Все бронирования</h2>
    <ul>${bookings.length ? bookings.map((b, i) => {
      const user = users.find(u => u.id === b.userId);
      return `<li>
        Пользователь: ${user ? user.username : 'неизвестно'}, Гостиница #${b.hotelId}, номер #${b.roomId}, дата: ${new Date(b.date).toLocaleString()}<br>
        Статус: <span id=\"status-${i}\">${b.status || 'ожидает'}</span>
        <button onclick=\"adminApproveBooking(${i})\">Подтвердить</button>
        <button onclick=\"adminCancelBooking(${i})\">Отменить</button>
      </li>`;
    }).join('') : '<li>Нет бронирований</li>'}</ul>`;
}

function adminApproveBooking(idx) {
  let bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
  bookings[idx].status = 'подтверждено';
  localStorage.setItem('bookings', JSON.stringify(bookings));
  document.getElementById('status-' + idx).innerText = 'подтверждено';
  renderAdmin();
}

function adminCancelBooking(idx) {
  let bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
  bookings[idx].status = 'отменено';
  localStorage.setItem('bookings', JSON.stringify(bookings));
  document.getElementById('status-' + idx).innerText = 'отменено';
  renderAdmin();
}

function renderLogin() {
  app.innerHTML = `<h1>Вход</h1>
    <form id=\"loginForm\">
      <input name=\"login\" placeholder=\"Логин\" required><br>
      <input name=\"password\" type=\"password\" placeholder=\"Пароль\" required><br>
      <button type=\"submit\">Войти</button>
    </form>
    <p>Нет аккаунта? <a href=\"#register\">Зарегистрироваться</a></p>
    <p><b>Для входа администратора используйте логин: admin, пароль: admin</b></p>`;
  document.getElementById('loginForm').onsubmit = function(e) {
    e.preventDefault();
    const login = this.login.value;
    const password = this.password.value;
    let users = JSON.parse(localStorage.getItem('users') || '[{"id":1,"username":"user1","password":"1234","bookings":[]}]');
    const user = users.find(u => u.username === login && u.password === password);
    if (user) {
      currentUser = user;
      saveUser(user);
      window.location.hash = '#profile';
    } else {
      alert('Неверный логин или пароль');
    }
  };
}

function renderRegister() {
  app.innerHTML = `<h1>Регистрация</h1>
    <form id="registerForm">
      <input name="login" placeholder="Логин" required><br>
      <input name="password" type="password" placeholder="Пароль" required><br>
      <button type="submit">Зарегистрироваться</button>
    </form>
    <p>Уже есть аккаунт? <a href="#login">Войти</a></p>`;
  document.getElementById('registerForm').onsubmit = function(e) {
    e.preventDefault();
    const login = this.login.value;
    const password = this.password.value;
    let users = JSON.parse(localStorage.getItem('users') || '[{"id":1,"username":"user1","password":"1234","bookings":[]} ]');
    if (users.find(u => u.username === login)) {
      alert('Пользователь уже существует');
      return;
    }
    const newUser = { id: Date.now(), username: login, password, bookings: [] };
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    alert('Регистрация успешна! Теперь войдите.');
    window.location.hash = '#login';
  };
}

async function renderPage() {
  ensureAdminUser();
  loadUser();
  // Меняем кнопку входа/выхода в меню
  const nav = document.querySelector('nav');
  if (nav) {
    const loginBtn = nav.querySelector('a[href="#login"]');
    if (loginBtn) {
      if (currentUser) {
        loginBtn.textContent = 'Выйти';
        loginBtn.onclick = (e) => { e.preventDefault(); logout(); };
      } else {
        loginBtn.textContent = 'Вход';
        loginBtn.onclick = null;
      }
    }
  }
  const hash = window.location.hash || '#home';
  if (hash.startsWith('#hotel-')) {
    const id = hash.replace('#hotel-', '');
    await renderHotel(id);
    return;
  }
  if (hash === '#searchresults') {
    await renderSearchResults();
    return;
  }
  if (hash === '#admin' && isAdmin()) {
    renderAdmin();
    return;
  }
  switch (hash) {
    case '#home':
      renderHome(); break;
    case '#hotels':
      await renderHotels(); break;
    case '#profile':
      renderProfile(); break;
    case '#login':
      renderLogin(); break;
    case '#register':
      renderRegister(); break;
    default:
      app.innerHTML = `<h1>Страница не найдена</h1>`;
  }
}

window.addEventListener('hashchange', renderPage);
window.addEventListener('DOMContentLoaded', renderPage);
