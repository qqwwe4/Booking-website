// --- booking-site main logic ---
let hotels = [];
let currentUser = null;
const app = document.getElementById('app');
let lastSearch = null;

function isAdmin() {
	return currentUser && currentUser.role === 'admin';
}
function ensureAdminUser() {
	let users = JSON.parse(localStorage.getItem('users') || '[{"id":1,"username":"user1","password":"1234","bookings":[]}]');
	if (!users.find(u => u.role === 'admin')) {
		users.push({ id: 9999, username: 'admin', password: 'admin', role: 'admin', bookings: [] });
		localStorage.setItem('users', JSON.stringify(users));
	}
}
async function loadHotels() {
	if (hotels.length) return hotels;
	const res = await fetch('data/hotels.json');
	hotels = await res.json();
	return hotels;
}
function saveUser(user) { localStorage.setItem('user', JSON.stringify(user)); }
function loadUser() {
	const u = localStorage.getItem('user');
	if (u) currentUser = JSON.parse(u); else currentUser = null;
}
function logout() {
	localStorage.removeItem('user');
	currentUser = null;
	window.location.hash = '#login';
}

function renderHome() {
	const today = new Date();
	const yyyy = today.getFullYear();
	const mm = String(today.getMonth() + 1).padStart(2, '0');
	const dd = String(today.getDate()).padStart(2, '0');
	const minDate = `${yyyy}-${mm}-${dd}`;
	app.innerHTML = `
	<div class="home-hero" style="background-image:url('img/bg.jpg');">
		<div class="home-hero-overlay">
			<h1 class="home-title">Бронирование отелей и апартаментов онлайн</h1>
			<class="home-subtitle">Лучшие предложения для вашего отдыха и командировок в Казахстане.</p>
			<form id="searchForm" class="search-form home-search-form">
				<div class="search-row">
					<div class="search-col search-col-city">
						<span class="search-icon"><svg width="22" height="22" fill="none" stroke="#222" stroke-width="2" viewBox="0 0 24 24"><path d="M19 10c0 5-7 12-7 12S5 15 5 10a7 7 0 1 1 14 0z"/><circle cx="12" cy="10" r="3"/></svg></span>
						<select name="city" required style="min-width:160px;">
							<option value="">Выберите город</option>
							<option value="Алматы">Алматы</option>
							<option value="Астана">Астана</option>
						</select>
					</div>
					<div class="search-col search-col-dates">
						<span class="search-icon"><svg width="22" height="22" fill="none" stroke="#222" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="4"/><path d="M16 2v4M8 2v4M3 10h18"/></svg></span>
						<input type="date" name="checkin" id="checkinInput" required min="${minDate}" placeholder="Дата заезда">
						<span style="margin:0 0.5em;">—</span>
						<input type="date" name="checkout" id="checkoutInput" required min="${minDate}" placeholder="Дата отъезда">
					</div>
					<!-- Гости убраны -->
					<div class="search-col search-col-btn">
						<button type="submit" class="search-btn">Найти</button>
					</div>
				</div>
			</form>
		</div>
	</div>
	`;

	// Динамически обновлять min для даты выезда
	const checkinInput = document.getElementById('checkinInput');
	const checkoutInput = document.getElementById('checkoutInput');
	checkinInput.addEventListener('change', function() {
		if (this.value) {
			const minCheckout = new Date(this.value);
			minCheckout.setDate(minCheckout.getDate() + 1);
			const yyyy = minCheckout.getFullYear();
			const mm = String(minCheckout.getMonth() + 1).padStart(2, '0');
			const dd = String(minCheckout.getDate()).padStart(2, '0');
			checkoutInput.min = `${yyyy}-${mm}-${dd}`;
			checkoutInput.value = '';
		} else {
			checkoutInput.min = checkinInput.min;
			checkoutInput.value = '';
		}
	});
	document.getElementById('searchForm').onsubmit = async function(e) {
		e.preventDefault();
		const city = this.city.value;
		const checkin = this.checkin.value;
		const checkout = this.checkout.value;
		if (!city || !checkin || !checkout) {
			toastr.error('Заполните все поля!');
			return;
		}
		const checkinDate = new Date(checkin + 'T00:00:00');
		const checkoutDate = new Date(checkout + 'T00:00:00');
		const today = new Date();
		today.setHours(0,0,0,0);
		if (isNaN(checkinDate) || isNaN(checkoutDate)) {
			toastr.error('Некорректная дата!');
			return;
		}
		if (checkinDate < today) {
			toastr.error('Дата заезда не может быть в прошлом!');
			return;
		}
		if (checkoutDate <= checkinDate) {
			toastr.error('Дата выезда должна быть позже даты заезда!');
			return;
		}
		lastSearch = { city, checkin, checkout };
		hotelsPageState.city = city;
		window.location.hash = '#hotels';
	};
}

async function renderSearchResults() {
	if (!lastSearch) { window.location.hash = '#home'; return; }
	const hotels = await loadHotels();
	const filtered = hotels.filter(h => h.city === lastSearch.city);
		// Акционные отели (promo: true)
		const promoHotels = hotels.filter(h => h.promo);
		app.innerHTML = `
				<h1>Доступные отели в городе ${lastSearch.city}</h1>
				<div class="search-dates">Период: <b>${lastSearch.checkin}</b> — <b>${lastSearch.checkout}</b></div>
				${promoHotels.length ? `
				<div class="promo-hotels-slider-block">
					<h2 style="margin-top:1em;">🔥 Отели с акциями</h2>
					<div class="promo-hotels-slider" id="promoSlider">
						<button class="slider-arrow" id="promoPrev">&#8592;</button>
						<div class="promo-hotels-list" id="promoList">
							${promoHotels.map(h => `
								<div class="promo-hotel-card">
									<div class="hotel-img">${h.image ? `<img src="${h.image}" alt="${h.name}" loading="lazy">` : ''}</div>
									<div class="hotel-info">
										<div class="hotel-rating"><span class="hotel-rating-circle">${h.rating?.toFixed(1) ?? ''}</span></div>
										<h3>${h.name}</h3>
										<p>${h.description}</p>
										<div class="hotel-promo-label">Акция!</div>
										<button onclick="openHotelWithSearch(${h.id})">Подробнее</button>
									</div>
								</div>
							`).join('')}
						</div>
						<button class="slider-arrow" id="promoNext">&#8594;</button>
					</div>
				</div>
				` : ''}
				<div id="searchResults"></div>
				<button onclick="window.location.hash='#home'">Изменить поиск</button>
		`;
		// Слайдер promo
		if (promoHotels.length > 0) {
			let promoIndex = 0;
			const promoList = document.getElementById('promoList');
			const promoCards = promoList.querySelectorAll('.promo-hotel-card');
			function updatePromoSlider() {
				promoCards.forEach((el, i) => {
					el.style.display = (i >= promoIndex && i < promoIndex+2) ? 'block' : 'none';
				});
			}
			updatePromoSlider();
			document.getElementById('promoPrev').onclick = () => {
				if (promoIndex > 0) { promoIndex--; updatePromoSlider(); }
			};
			document.getElementById('promoNext').onclick = () => {
				if (promoIndex < promoCards.length-2) { promoIndex++; updatePromoSlider(); }
			};
		}
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
				<div class="hotel-rating"><span class="hotel-rating-circle">${h.rating?.toFixed(1) ?? ''}</span></div>
				<h3>${h.name}</h3>
				<p>${h.description}</p>
				<div class="hotel-reviews">${h.reviews ? `${h.reviews.length} отзывов` : 'Нет отзывов'}</div>
				<button onclick="openHotelWithSearch(${h.id})">Смотреть номера</button>
			</div>
		</div>
	`).join('')}</div>`;
// Рейтинг теперь только кружочек с числом
}
function openHotelWithSearch(id) { window.location.hash = `#hotel-${id}`; }

let hotelsPageState = { page: 1, city: '', search: '', onlyAvailable: false, sort: '', roomType: '', priceMin: '', priceMax: '' };
const HOTELS_PER_PAGE = 6;
async function renderHotels() {
	const allHotels = await loadHotels();
	// Фильтры
	const city = hotelsPageState.city;
	const search = hotelsPageState.search.trim().toLowerCase();
	let filtered = allHotels.filter(h => {
		if (city && h.city !== city) return false;
		if (search && !(h.name.toLowerCase().includes(search) || h.description.toLowerCase().includes(search))) return false;
		// Фильтр по типу номера
		if (hotelsPageState.roomType) {
			if (!h.rooms.some(r => r.type === hotelsPageState.roomType)) return false;
		}
		// Фильтр по цене
		if (hotelsPageState.priceMin !== null && hotelsPageState.priceMin !== '' && !isNaN(hotelsPageState.priceMin)) {
			if (!h.rooms.some(r => typeof r.price === 'number' && r.price >= hotelsPageState.priceMin)) return false;
		}
		if (hotelsPageState.priceMax !== null && hotelsPageState.priceMax !== '' && !isNaN(hotelsPageState.priceMax)) {
			if (!h.rooms.some(r => typeof r.price === 'number' && r.price <= hotelsPageState.priceMax)) return false;
		}
		return true;
	});
	// Фильтр по доступности
	if (hotelsPageState.onlyAvailable) {
		filtered = filtered.filter(h => h.rooms.some(r => r.available));
	}
    // Сортировка по цене (минимальная цена номера)
    if (hotelsPageState.sort === 'price-asc') {
        filtered = filtered.slice().sort((a, b) => Math.min(...b.rooms.map(r=>r.price)) - Math.min(...a.rooms.map(r=>r.price)));
    } else if (hotelsPageState.sort === 'price-desc') {
        filtered = filtered.slice().sort((a, b) => Math.min(...a.rooms.map(r=>r.price)) - Math.min(...b.rooms.map(r=>r.price)));
    }
	// Пагинация
	const totalPages = Math.max(1, Math.ceil(filtered.length / HOTELS_PER_PAGE));
	if (hotelsPageState.page > totalPages) hotelsPageState.page = totalPages;
	const start = (hotelsPageState.page - 1) * HOTELS_PER_PAGE;
	const end = start + HOTELS_PER_PAGE;
	const hotels = filtered.slice(start, end);
	// HTML
	app.innerHTML = `
		<h1>Список гостиниц</h1>
		<form id="hotelsFilterForm" class="search-form" style="margin-bottom:1.5em;">
			<label>Город:
				<select name="city">
					<option value="">Все города</option>
					<option value="Алматы"${city==="Алматы"?' selected':''}>Алматы</option>
					<option value="Астана"${city==="Астана"?' selected':''}>Астана</option>
				</select>
			</label>
			<label>Поиск:
				<input type="text" name="search" placeholder="Название или описание" value="${hotelsPageState.search||''}">
			</label>
			<label>Тип номера:
				<select name="roomType">
					<option value="">Любой</option>
					<option value="Стандарт"${hotelsPageState.roomType==='Стандарт'?' selected':''}>Стандарт</option>
					<option value="Люкс"${hotelsPageState.roomType==='Люкс'?' selected':''}>Люкс</option>
				</select>
			</label>
			<label>Цена от:
				<input type="number" name="priceMin" min="0" value="${hotelsPageState.priceMin||''}" style="width:6em;">
			</label>
			<label>до:
				<input type="number" name="priceMax" min="0" value="${hotelsPageState.priceMax||''}" style="width:6em;">
			</label>
			<label style="align-items:center;gap:0.5em;display:flex;">
				<input type="checkbox" name="onlyAvailable" ${hotelsPageState.onlyAvailable?'checked':''}>
				Доступные
			</label>
			<label>Сортировка:
				<select name="sort">
					<option value="">Без сортировки</option>
					<option value="price-asc"${hotelsPageState.sort==='price-asc'?' selected':''}>Цена ↑</option>
					<option value="price-desc"${hotelsPageState.sort==='price-desc'?' selected':''}>Цена ↓</option>
				</select>
			</label>
			<button type="submit">Применить</button>
		</form>
		<div id="hotelsList"></div>
		<div id="hotelsPagination" style="margin-top:1.5em;"></div>
	`;
	// Список отелей
	const list = document.getElementById('hotelsList');
	if (!hotels.length) {
		list.innerHTML = '<p>Нет гостиниц по выбранным фильтрам.</p>';
	} else {
		list.innerHTML = `<div class="hotel-cards">${hotels.map(h => {
			const minPrice = h.rooms && h.rooms.length ? Math.min(...h.rooms.map(r => r.price)) : null;
			return `
			<div class="hotel-card">
				<div class="hotel-img">${h.image ? `<img src="${h.image}" alt="${h.name}" loading="lazy">` : ''}</div>
				<div class="hotel-info">
					<h3>${h.name}</h3>
					<p>${h.description}</p>
					<span class="badge bg-secondary mb-2">${h.city}</span>
					${minPrice !== null ? `<div class='hotel-price'>от <b>${minPrice}₸</b> за номер</div>` : ''}
					<button onclick="openHotelWithSearch(${h.id})">Смотреть номера</button>
				</div>
			</div>
		`;
		}).join('')}</div>`;
	}
	// Пагинация
	const pag = document.getElementById('hotelsPagination');
	if (totalPages > 1) {
		let pagHtml = '<nav><ul class="pagination">';
		for (let i = 1; i <= totalPages; i++) {
			pagHtml += `<li class="page-item${i===hotelsPageState.page?' active':''}"><a class="page-link" href="#" onclick="changeHotelsPage(${i});return false;">${i}</a></li>`;
		}
		pagHtml += '</ul></nav>';
		pag.innerHTML = pagHtml;
	}
	// Обработчик фильтра
	document.getElementById('hotelsFilterForm').onsubmit = function(e) {
		e.preventDefault();
		hotelsPageState.city = this.city.value;
		hotelsPageState.search = this.search.value;
		hotelsPageState.roomType = this.roomType.value;
		const min = this.priceMin.value.trim();
		const max = this.priceMax.value.trim();
		hotelsPageState.priceMin = min !== '' ? Number(min) : null;
		hotelsPageState.priceMax = max !== '' ? Number(max) : null;
		hotelsPageState.onlyAvailable = this.onlyAvailable.checked;
		hotelsPageState.sort = this.sort.value;
		hotelsPageState.page = 1;
		renderHotels();
	};
}
window.changeHotelsPage = function(page) {
	hotelsPageState.page = page;
	renderHotels();
}

async function renderHotel(id) {
	const hotels = await loadHotels();
	const hotel = hotels.find(h => h.id == id);
	if (!hotel) { app.innerHTML = '<h1>Гостиница не найдена</h1>'; return; }
	let availableRooms = hotel.rooms;
	if (lastSearch) {
		let bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
		availableRooms = hotel.rooms.filter(r => {
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
		toastr.info('Сначала войдите в аккаунт!');
		window.location.hash = '#login';
		return;
	}
	loadHotels().then(hotels => {
		const hotel = hotels.find(h => h.id === hotelId);
		const room = hotel.rooms.find(r => r.id === roomId);
		window.showBookingModal(room, hotel, function() {
			let bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
			bookings.push({ userId: currentUser.id, hotelId, roomId, date: new Date().toISOString() });
			localStorage.setItem('bookings', JSON.stringify(bookings));
			toastr.success('Бронирование успешно!');
			window.location.hash = '#profile';
		});
	});
}

function renderProfile() {
	if (!currentUser) { window.location.hash = '#login'; return; }
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
	if (!isAdmin()) { app.innerHTML = '<h1>Нет доступа</h1>'; return; }
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
			toastr.error('Неверный логин или пароль');
		}
	};
}
function renderRegister() {
	app.innerHTML = `<h1>Регистрация</h1>
		<form id=\"registerForm\">
			<input name=\"login\" placeholder=\"Логин\" required><br>
			<input name=\"password\" type=\"password\" placeholder=\"Пароль\" required><br>
			<button type=\"submit\">Зарегистрироваться</button>
		</form>
		<p>Уже есть аккаунт? <a href=\"#login\">Войти</a></p>`;
	document.getElementById('registerForm').onsubmit = function(e) {
		e.preventDefault();
		const login = this.login.value;
		const password = this.password.value;
		let users = JSON.parse(localStorage.getItem('users') || '[{"id":1,"username":"user1","password":"1234","bookings":[]}]');
		if (users.find(u => u.username === login)) {
			toastr.error('Пользователь уже существует');
			return;
		}
		const newUser = { id: Date.now(), username: login, password, bookings: [] };
		users.push(newUser);
		localStorage.setItem('users', JSON.stringify(users));
		toastr.success('Регистрация успешна! Теперь войдите.');
		window.location.hash = '#login';
	};
}
async function renderPage() {
	ensureAdminUser();
	loadUser();
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
	if (hash === '#searchresults') { await renderSearchResults(); return; }
	if (hash === '#admin' && isAdmin()) { renderAdmin(); return; }
	switch (hash) {
		case '#home': renderHome(); break;
		case '#hotels': await renderHotels(); break;
		case '#profile': renderProfile(); break;
		case '#login': renderLogin(); break;
		case '#register': renderRegister(); break;
		default: app.innerHTML = `<h1>Страница не найдена</h1>`;
	}
}
window.addEventListener('hashchange', renderPage);
window.addEventListener('DOMContentLoaded', renderPage);
