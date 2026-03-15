  // ── TOASTR ──
  const toastr = {
    _show(msg, cls) {
      const c = document.getElementById('toast-container');
      const d = document.createElement('div');
      d.className = 'toast ' + cls;
      d.textContent = msg;
      c.appendChild(d);
      setTimeout(() => d.remove(), 3200);
    },
    success(m) { this._show(m, 'toast-success'); },
    error(m)   { this._show(m, 'toast-error'); },
    info(m)    { this._show(m, 'toast-info'); }
  };

  // ── MODAL ──
  window.showBookingModal = function(room, hotel, checkin, checkout, onBook) {
    let el = document.getElementById('__modal');
    if (el) el.remove();
    const nights = checkin && checkout
      ? Math.round((new Date(checkout) - new Date(checkin)) / 86400000)
      : null;
    const total = nights ? room.price * nights : null;
    el = document.createElement('div');
    el.id = '__modal';
    el.className = 'modal-overlay';
    el.innerHTML = `
      <div class="modal-box">
        <div class="modal-header">
          <h2>Подтверждение брони</h2>
          <button class="modal-close" id="__mclose">&times;</button>
        </div>
        <div class="modal-body">
          <div class="modal-row"><span>Отель</span><span>${hotel.name}</span></div>
          <div class="modal-row"><span>Номер</span><span>${room.type}</span></div>
          <div class="modal-row"><span>Цена/ночь</span><span>${room.price.toLocaleString()}₸</span></div>
          ${checkin  ? `<div class="modal-row"><span>Заезд</span><span>${checkin}</span></div>` : ''}
          ${checkout ? `<div class="modal-row"><span>Выезд</span><span>${checkout}</span></div>` : ''}
          ${nights   ? `<div class="modal-row"><span>Ночей</span><span>${nights}</span></div>` : ''}
          ${total    ? `<div class="modal-row"><span>Итого</span><span style="color:var(--blue);font-size:1.05em;">${total.toLocaleString()}₸</span></div>` : ''}
        </div>
        <div class="modal-footer">
          <button class="btn-modal-cancel" id="__mcancel">Отмена</button>
          <button class="btn-modal-book" id="__mbook">Забронировать</button>
        </div>
      </div>`;
    document.body.appendChild(el);
    const close = () => el.remove();
    document.getElementById('__mclose').onclick = close;
    document.getElementById('__mcancel').onclick = close;
    el.addEventListener('click', e => { if (e.target === el) close(); });
    document.getElementById('__mbook').onclick = () => { onBook(); close(); };
  };

  // ── ДАННЫЕ ──
  const HOTELS_DATA = [
    {"id":1,"name":"Almaty Grand Hotel","city":"Алматы","description":"Современный отель в центре Алматы.","promo":true,"rating":8.7,"emoji":"🏨","rooms":[{"id":101,"type":"Стандарт","price":20000,"available":true},{"id":102,"type":"Люкс","price":35000,"available":true}]},
    {"id":2,"name":"Astana Palace","city":"Астана","description":"Роскошный отель в деловом районе Астаны.","promo":true,"rating":9.1,"emoji":"🏰","rooms":[{"id":201,"type":"Стандарт","price":18000,"available":true},{"id":202,"type":"Люкс","price":32000,"available":true}]},
    {"id":3,"name":"Almaty Mountain View","city":"Алматы","description":"Отель с видом на горы.","promo":true,"rating":8.3,"emoji":"🏔️","rooms":[{"id":103,"type":"Стандарт","price":17000,"available":true},{"id":104,"type":"Люкс","price":30000,"available":true}]},
    {"id":4,"name":"Astana River Hotel","city":"Астана","description":"Уютный отель у реки.","promo":true,"rating":8.8,"emoji":"🌊","rooms":[{"id":203,"type":"Стандарт","price":16000,"available":true},{"id":204,"type":"Люкс","price":28000,"available":true}]},
    {"id":5,"name":"Almaty City Center","city":"Алматы","description":"Отель в самом центре города.","promo":true,"rating":9.0,"emoji":"🌆","rooms":[{"id":105,"type":"Стандарт","price":21000,"available":true},{"id":106,"type":"Люкс","price":36000,"available":true}]},
    {"id":6,"name":"Astana Expo Hotel","city":"Астана","description":"Современный отель рядом с Экспо.","promo":true,"rating":8.5,"emoji":"🎪","rooms":[{"id":205,"type":"Стандарт","price":19000,"available":true},{"id":206,"type":"Люкс","price":34000,"available":true}]},
    {"id":7,"name":"Almaty Park Hotel","city":"Алматы","description":"Отель рядом с парком.","rating":8.1,"emoji":"🌳","rooms":[{"id":107,"type":"Стандарт","price":16000,"available":true},{"id":108,"type":"Люкс","price":27000,"available":true}]},
    {"id":8,"name":"Astana Central","city":"Астана","description":"Центральный отель города.","rating":8.4,"emoji":"🏙️","rooms":[{"id":207,"type":"Стандарт","price":20000,"available":true},{"id":208,"type":"Люкс","price":35000,"available":true}]},
    {"id":9,"name":"Almaty Boutique","city":"Алматы","description":"Бутик-отель с индивидуальным подходом.","rating":9.2,"emoji":"✨","rooms":[{"id":109,"type":"Стандарт","price":23000,"available":true},{"id":110,"type":"Люкс","price":39000,"available":true}]},
    {"id":10,"name":"Astana Comfort","city":"Астана","description":"Комфортный отель для деловых поездок.","rating":8.6,"emoji":"💼","rooms":[{"id":209,"type":"Стандарт","price":17000,"available":true},{"id":210,"type":"Люкс","price":31000,"available":true}]},
    {"id":11,"name":"Almaty Plaza","city":"Алматы","description":"Современный отель с бассейном.","rating":8.9,"emoji":"🏊","rooms":[{"id":111,"type":"Стандарт","price":25000,"available":true},{"id":112,"type":"Люкс","price":40000,"available":true}]},
    {"id":12,"name":"Astana Green","city":"Астана","description":"Эко-отель в зелёной зоне.","rating":8.2,"emoji":"🌿","rooms":[{"id":211,"type":"Стандарт","price":15000,"available":true},{"id":212,"type":"Люкс","price":26000,"available":true}]},
    {"id":13,"name":"Almaty Art Hotel","city":"Алматы","description":"Отель с художественной атмосферой.","rating":8.7,"emoji":"🎨","rooms":[{"id":113,"type":"Стандарт","price":22000,"available":true},{"id":114,"type":"Люкс","price":37000,"available":true}]},
    {"id":14,"name":"Astana Sky","city":"Астана","description":"Отель с панорамным видом на город.","rating":9.0,"emoji":"🌇","rooms":[{"id":213,"type":"Стандарт","price":21000,"available":true},{"id":214,"type":"Люкс","price":36000,"available":true}]},
    {"id":15,"name":"Almaty Family","city":"Алматы","description":"Семейный отель с детской зоной.","rating":8.5,"emoji":"👨‍👩‍👧","rooms":[{"id":115,"type":"Стандарт","price":18000,"available":true},{"id":116,"type":"Люкс","price":32000,"available":true}]},
    {"id":16,"name":"Astana Plaza","city":"Астана","description":"Большой отель для групп.","rating":8.3,"emoji":"🏢","rooms":[{"id":215,"type":"Стандарт","price":22000,"available":true},{"id":216,"type":"Люкс","price":37000,"available":true}]},
    {"id":17,"name":"Almaty Business","city":"Алматы","description":"Бизнес-отель с конференц-залами.","rating":8.8,"emoji":"📊","rooms":[{"id":117,"type":"Стандарт","price":24000,"available":true},{"id":118,"type":"Люкс","price":41000,"available":true}]},
    {"id":18,"name":"Astana Lux","city":"Астана","description":"Люксовый отель с СПА.","rating":9.3,"emoji":"💆","rooms":[{"id":217,"type":"Стандарт","price":25000,"available":true},{"id":218,"type":"Люкс","price":42000,"available":true}]},
    {"id":19,"name":"Almaty Airport Hotel","city":"Алматы","description":"Отель рядом с аэропортом.","rating":8.0,"emoji":"✈️","rooms":[{"id":119,"type":"Стандарт","price":15000,"available":true},{"id":120,"type":"Люкс","price":25000,"available":true}]},
    {"id":20,"name":"Astana Express","city":"Астана","description":"Быстрый сервис и удобное расположение.","rating":8.4,"emoji":"⚡","rooms":[{"id":219,"type":"Стандарт","price":16000,"available":true},{"id":220,"type":"Люкс","price":27000,"available":true}]}
  ];

  // ── СОСТОЯНИЕ ──
  let currentUser = null;
  let lastSearch = null;
  let hotelsPageState = { page:1, city:'', search:'', onlyAvailable:false, sort:'', roomType:'', priceMin:null, priceMax:null };
  const HOTELS_PER_PAGE = 6;
  const app = document.getElementById('app');

  function isAdmin() { return currentUser && currentUser.role === 'admin'; }

  function ensureAdminUser() {
    let users = JSON.parse(localStorage.getItem('users') || '[]');
    if (!users.length) users = [{"id":1,"username":"user1","password":"1234","bookings":[]}];
    if (!users.find(u => u.role === 'admin')) {
      users.push({ id: 9999, username: 'admin', password: 'admin', role: 'admin', bookings: [] });
      localStorage.setItem('users', JSON.stringify(users));
    }
  }

  function getUsers() {
    const stored = localStorage.getItem('users');
    if (stored) return JSON.parse(stored);
    const defaults = [{"id":1,"username":"user1","password":"1234","bookings":[]}];
    localStorage.setItem('users', JSON.stringify(defaults));
    return defaults;
  }

  function saveUser(u) { localStorage.setItem('user', JSON.stringify(u)); }
  function loadUser() {
    const u = localStorage.getItem('user');
    currentUser = u ? JSON.parse(u) : null;
  }
  function logout() {
    localStorage.removeItem('user');
    currentUser = null;
    window.location.hash = '#login';
  }

  function updateNav() {
    const btn = document.getElementById('navLoginBtn');
    if (!btn) return;
    if (currentUser) {
      btn.textContent = 'Выйти';
      btn.onclick = e => { e.preventDefault(); logout(); };
    } else {
      btn.textContent = 'Вход';
      btn.href = '#login';
      btn.onclick = null;
    }
  }

  function setMain(html, fullWidth = false) {
    let m = document.querySelector('#app > main, #app > div.page-root');
    if (!m) {
      m = document.createElement(fullWidth ? 'div' : 'main');
      m.className = fullWidth ? 'page-root' : '';
      app.innerHTML = '';
      app.appendChild(m);
    }
    if (fullWidth) {
      app.innerHTML = `<div class="page-root">${html}</div>`;
    } else {
      app.innerHTML = `<main>${html}</main>`;
    }
  }

  // ── ГЛАВНАЯ ──
  function renderHome() {
    const today = new Date();
    const minDate = today.toISOString().split('T')[0];
    app.innerHTML = `
      <div class="home-hero">
        <div class="home-hero-overlay">
          <h1 class="home-title">Бронирование отелей<br>в Казахстане онлайн</h1>
          <p class="home-subtitle">Лучшие предложения для вашего отдыха и командировок</p>
          <div class="search-form-wrap">
            <form id="searchForm">
              <div class="search-row">
                <div class="search-field">
                  <label>Город</label>
                  <select name="city" required>
                    <option value="">Выберите город</option>
                    <option value="Алматы">Алматы</option>
                    <option value="Астана">Астана</option>
                  </select>
                </div>
                <div class="search-field">
                  <label>Дата заезда</label>
                  <input type="date" name="checkin" id="checkinInput" required min="${minDate}">
                </div>
                <div class="search-field">
                  <label>Дата выезда</label>
                  <input type="date" name="checkout" id="checkoutInput" required min="${minDate}">
                </div>
                <button type="submit" class="search-btn">🔍 Найти</button>
              </div>
            </form>
          </div>
        </div>
      </div>`;

    const checkinInput = document.getElementById('checkinInput');
    const checkoutInput = document.getElementById('checkoutInput');
    checkinInput.addEventListener('change', function() {
      if (this.value) {
        const d = new Date(this.value);
        d.setDate(d.getDate() + 1);
        checkoutInput.min = d.toISOString().split('T')[0];
        if (checkoutInput.value && checkoutInput.value <= this.value) checkoutInput.value = '';
      }
    });

    document.getElementById('searchForm').onsubmit = function(e) {
      e.preventDefault();
      const city = this.city.value;
      const checkin = this.checkin.value;
      const checkout = this.checkout.value;
      if (!city || !checkin || !checkout) { toastr.error('Заполните все поля!'); return; }
      const ci = new Date(checkin + 'T00:00:00');
      const co = new Date(checkout + 'T00:00:00');
      const tod = new Date(); tod.setHours(0,0,0,0);
      if (ci < tod) { toastr.error('Дата заезда не может быть в прошлом!'); return; }
      if (co <= ci) { toastr.error('Дата выезда должна быть позже даты заезда!'); return; }
      lastSearch = { city, checkin, checkout };
      window.location.hash = '#searchresults';
    };
  }

  // ── РЕЗУЛЬТАТЫ ПОИСКА (со слайдером) ──
  function renderSearchResults() {
    if (!lastSearch) { window.location.hash = '#home'; return; }
    const filtered = HOTELS_DATA.filter(h => h.city === lastSearch.city);
    const promoHotels = HOTELS_DATA.filter(h => h.promo);
    const nights = Math.round((new Date(lastSearch.checkout) - new Date(lastSearch.checkin)) / 86400000);

    let promoHtml = '';
    if (promoHotels.length) {
      promoHtml = `
        <div class="promo-section">
          <div class="section-title">🔥 Акционные предложения</div>
          <div class="promo-slider-wrap">
            <button class="slider-arrow" id="promoPrev">&#8592;</button>
            <div class="promo-slider-viewport">
              <div class="promo-slider-track" id="promoTrack">
                ${promoHotels.map(h => `
                <div class="promo-card">
                  <div class="promo-card-img">${h.emoji || '🏨'}</div>
                  <div class="promo-card-body">
                    <span class="promo-badge">Акция</span>
                    <h3>${h.name}</h3>
                    <p>${h.description}</p>
                    <div style="display:flex;align-items:center;gap:0.5em;margin-top:0.2em;">
                      <span class="rating-pill">${h.rating?.toFixed(1)}</span>
                      <span style="font-size:0.82em;color:var(--gray-text);">от <b style="color:var(--blue)">${Math.min(...h.rooms.map(r=>r.price)).toLocaleString()}₸</b></span>
                    </div>
                    <button class="promo-card-btn" onclick="openHotel(${h.id})">Смотреть</button>
                  </div>
                </div>`).join('')}
              </div>
            </div>
            <button class="slider-arrow" id="promoNext">&#8594;</button>
          </div>
        </div>`;
    }

    const resultsHtml = `
      <div class="results-wrap">
        <div class="results-header">
          <h1>Отели в городе ${lastSearch.city}</h1>
          <span class="dates-badge">📅 ${lastSearch.checkin} — ${lastSearch.checkout} (${nights} ночей)</span>
          <button class="btn-back" onclick="window.location.hash='#home'">← Изменить поиск</button>
        </div>
        ${filtered.length ? `<div class="hotel-grid">${filtered.map(h => hotelCardHtml(h)).join('')}</div>`
          : `<div class="empty-state"><div class="empty-icon">🏚️</div><p>В городе ${lastSearch.city} отелей не найдено</p></div>`}
      </div>`;

    app.innerHTML = promoHtml + resultsHtml;

    // Слайдер логика
    if (promoHotels.length) {
      let idx = 0;
      const track = document.getElementById('promoTrack');
      const cards = track.querySelectorAll('.promo-card');
      const visible = window.innerWidth < 680 ? 1 : 2;
      const maxIdx = Math.max(0, cards.length - visible);
      function updateSlider() {
        const w = cards[0].offsetWidth + 16; // 16 = gap
        track.style.transform = `translateX(-${idx * w}px)`;
      }
      document.getElementById('promoPrev').onclick = () => { if (idx > 0) { idx--; updateSlider(); } };
      document.getElementById('promoNext').onclick = () => { if (idx < maxIdx) { idx++; updateSlider(); } };
    }
  }

  // ── КАРТОЧКА ОТЕЛЯ ──
  function hotelCardHtml(h) {
    const minPrice = Math.min(...h.rooms.map(r => r.price));
    return `<div class="hotel-card">
      <div class="hotel-card-img">${h.emoji || '🏨'}</div>
      <div class="hotel-card-body">
        <div class="hotel-card-meta">
          ${h.rating ? `<span class="rating-pill">${h.rating.toFixed(1)}</span>` : ''}
          <span class="city-pill">${h.city}</span>
        </div>
        <h3>${h.name}</h3>
        <p>${h.description}</p>
        <div class="hotel-price">от <b>${minPrice.toLocaleString()}₸</b> / ночь</div>
        <button class="btn-primary" onclick="openHotel(${h.id})">Смотреть номера</button>
      </div>
    </div>`;
  }

  function openHotel(id) { window.location.hash = '#hotel-' + id; }

  // ── СПИСОК ГОСТИНИЦ ──
  function renderHotels() {
    const city = hotelsPageState.city;
    const search = hotelsPageState.search.trim().toLowerCase();
    let filtered = HOTELS_DATA.filter(h => {
      if (city && h.city !== city) return false;
      if (search && !(h.name.toLowerCase().includes(search) || h.description.toLowerCase().includes(search))) return false;
      if (hotelsPageState.roomType && !h.rooms.some(r => r.type === hotelsPageState.roomType)) return false;
      if (hotelsPageState.priceMin != null && hotelsPageState.priceMin !== '') {
        if (!h.rooms.some(r => r.price >= hotelsPageState.priceMin)) return false;
      }
      if (hotelsPageState.priceMax != null && hotelsPageState.priceMax !== '') {
        if (!h.rooms.some(r => r.price <= hotelsPageState.priceMax)) return false;
      }
      return true;
    });
    if (hotelsPageState.onlyAvailable) filtered = filtered.filter(h => h.rooms.some(r => r.available));
    if (hotelsPageState.sort === 'price-asc')  filtered.sort((a,b) => Math.min(...a.rooms.map(r=>r.price)) - Math.min(...b.rooms.map(r=>r.price)));
    if (hotelsPageState.sort === 'price-desc') filtered.sort((a,b) => Math.min(...b.rooms.map(r=>r.price)) - Math.min(...a.rooms.map(r=>r.price)));

    const total = Math.max(1, Math.ceil(filtered.length / HOTELS_PER_PAGE));
    if (hotelsPageState.page > total) hotelsPageState.page = total;
    const slice = filtered.slice((hotelsPageState.page-1)*HOTELS_PER_PAGE, hotelsPageState.page*HOTELS_PER_PAGE);

    app.innerHTML = `<main>
      <div class="page-title">Все гостиницы</div>
      <div class="filter-bar">
        <div class="filter-field">
          <label>Город</label>
          <select id="f_city">
            <option value="">Все города</option>
            <option value="Алматы"${city==='Алматы'?' selected':''}>Алматы</option>
            <option value="Астана"${city==='Астана'?' selected':''}>Астана</option>
          </select>
        </div>
        <div class="filter-field">
          <label>Поиск</label>
          <input type="text" id="f_search" placeholder="Название..." value="${hotelsPageState.search||''}">
        </div>
        <div class="filter-field">
          <label>Тип номера</label>
          <select id="f_type">
            <option value="">Любой</option>
            <option value="Стандарт"${hotelsPageState.roomType==='Стандарт'?' selected':''}>Стандарт</option>
            <option value="Люкс"${hotelsPageState.roomType==='Люкс'?' selected':''}>Люкс</option>
          </select>
        </div>
        <div class="filter-field">
          <label>Цена от</label>
          <input type="number" id="f_min" min="0" style="width:90px" value="${hotelsPageState.priceMin||''}">
        </div>
        <div class="filter-field">
          <label>до</label>
          <input type="number" id="f_max" min="0" style="width:90px" value="${hotelsPageState.priceMax||''}">
        </div>
        <div class="filter-check">
          <input type="checkbox" id="f_avail" ${hotelsPageState.onlyAvailable?'checked':''}>
          <label for="f_avail">Только свободные</label>
        </div>
        <div class="filter-field">
          <label>Сортировка</label>
          <select id="f_sort">
            <option value="">По умолчанию</option>
            <option value="price-asc"${hotelsPageState.sort==='price-asc'?' selected':''}>Цена ↑</option>
            <option value="price-desc"${hotelsPageState.sort==='price-desc'?' selected':''}>Цена ↓</option>
          </select>
        </div>
        <button class="btn-filter" id="f_apply">Применить</button>
      </div>
      ${slice.length
        ? `<div class="hotel-grid">${slice.map(h => hotelCardHtml(h)).join('')}</div>`
        : `<div class="empty-state"><div class="empty-icon">🔍</div><p>По вашему запросу ничего не найдено</p></div>`}
      <div id="pagination" style="margin-top:1.5em;"></div>
    </main>`;

    if (total > 1) {
      let p = '<ul class="pagination">';
      for (let i = 1; i <= total; i++)
        p += `<li class="page-item${i===hotelsPageState.page?' active':''}"><a href="#" onclick="gotoPage(${i});return false;">${i}</a></li>`;
      document.getElementById('pagination').innerHTML = p + '</ul>';
    }

    document.getElementById('f_apply').onclick = () => {
      hotelsPageState.city    = document.getElementById('f_city').value;
      hotelsPageState.search  = document.getElementById('f_search').value;
      hotelsPageState.roomType= document.getElementById('f_type').value;
      hotelsPageState.sort    = document.getElementById('f_sort').value;
      hotelsPageState.onlyAvailable = document.getElementById('f_avail').checked;
      const mn = document.getElementById('f_min').value.trim();
      const mx = document.getElementById('f_max').value.trim();
      hotelsPageState.priceMin = mn !== '' ? Number(mn) : null;
      hotelsPageState.priceMax = mx !== '' ? Number(mx) : null;
      hotelsPageState.page = 1;
      renderHotels();
    };
  }

  window.gotoPage = p => { hotelsPageState.page = p; renderHotels(); };

  // ── СТРАНИЦА ОТЕЛЯ ──
  function renderHotel(id) {
    const hotel = HOTELS_DATA.find(h => h.id == id);
    if (!hotel) { app.innerHTML = '<main><p>Отель не найден</p></main>'; return; }

    let rooms = hotel.rooms;
    if (lastSearch) {
      const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
      rooms = hotel.rooms.filter(r =>
        !bookings.some(b => b.hotelId === hotel.id && b.roomId === r.id && b.status !== 'отменено')
      );
    }

    const backHash = lastSearch ? '#searchresults' : '#hotels';
    app.innerHTML = `<main>
      <button class="btn-back" onclick="window.location.hash='${backHash}'" style="margin-bottom:1.5em;">← Назад</button>
      <div class="hotel-detail">
        <div class="hotel-detail-img">${hotel.emoji || '🏨'}</div>
        <div class="hotel-detail-body">
          <h1>${hotel.name}</h1>
          <div style="display:flex;align-items:center;gap:0.6em;margin-bottom:0.8em;">
            ${hotel.rating ? `<span class="rating-pill">${hotel.rating.toFixed(1)}</span>` : ''}
            <span class="city-pill">${hotel.city}</span>
          </div>
          <p>${hotel.description}</p>
          <h2 style="font-size:1.1em;margin-bottom:0.8em;">Номера</h2>
          <ul class="room-list">
            ${rooms.length
              ? rooms.map(r => `<li class="room-item">
                  <span>${r.type} — <b>${r.price.toLocaleString()}₸</b> / ночь</span>
                  <button class="btn-book" onclick="bookRoom(${hotel.id},${r.id})">Забронировать</button>
                </li>`).join('')
              : '<li class="room-item">Нет свободных номеров на выбранные даты</li>'}
          </ul>
        </div>
      </div>
    </main>`;
  }

  function bookRoom(hotelId, roomId) {
    if (!currentUser) { toastr.info('Сначала войдите в аккаунт!'); window.location.hash = '#login'; return; }
    const hotel = HOTELS_DATA.find(h => h.id === hotelId);
    const room = hotel.rooms.find(r => r.id === roomId);
    window.showBookingModal(room, hotel, lastSearch?.checkin, lastSearch?.checkout, () => {
      const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
      bookings.push({
        userId: currentUser.id, hotelId, roomId,
        checkin: lastSearch?.checkin, checkout: lastSearch?.checkout,
        date: new Date().toISOString(), status: 'ожидает'
      });
      localStorage.setItem('bookings', JSON.stringify(bookings));
      toastr.success('Бронирование оформлено!');
      window.location.hash = '#profile';
    });
  }

  // ── ПРОФИЛЬ ──
  function renderProfile() {
    if (!currentUser) { window.location.hash = '#login'; return; }
    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]')
      .map((b, i) => ({...b, idx: i}))
      .filter(b => b.userId === currentUser.id);

    const statusClass = s => s === 'подтверждено' ? 'status-ok' : s === 'отменено' ? 'status-cancel' : 'status-wait';
    const statusText  = s => s || 'ожидает';

    app.innerHTML = `<main>
      <div class="profile-header">
        <div class="avatar">${currentUser.username[0].toUpperCase()}</div>
        <div>
          <div class="profile-name">${currentUser.username}</div>
          <div class="profile-role">${isAdmin() ? '👑 Администратор' : 'Пользователь'}</div>
        </div>
        <button class="btn-logout" onclick="logout()">Выйти</button>
      </div>
      ${isAdmin() ? '<a href="#admin" class="admin-link">⚙️ Панель администратора</a>' : ''}
      <div class="page-title" style="font-size:1.1em;">Мои бронирования</div>
      ${bookings.length ? bookings.map(b => {
        const hotel = HOTELS_DATA.find(h => h.id === b.hotelId);
        const room  = hotel?.rooms.find(r => r.id === b.roomId);
        return `<div class="booking-card">
          <div class="booking-info">
            <strong>${hotel ? hotel.emoji + ' ' + hotel.name : 'Отель #' + b.hotelId}</strong>
            <small>${room ? room.type + ' — ' + room.price.toLocaleString() + '₸/ночь' : ''}</small>
            ${b.checkin ? `<br><small>📅 ${b.checkin} → ${b.checkout}</small>` : ''}
            <br><small style="color:#94a3b8">Оформлено: ${new Date(b.date).toLocaleDateString('ru')}</small>
          </div>
          <span class="status-badge ${statusClass(b.status)}">${statusText(b.status)}</span>
          ${b.status !== 'отменено' ? `<button class="btn-cancel" onclick="cancelBooking(${b.idx})">Отменить</button>` : ''}
        </div>`;
      }).join('')
      : `<div class="empty-state"><div class="empty-icon">🛎️</div><p>У вас пока нет бронирований</p></div>`}
    </main>`;
  }

  window.cancelBooking = idx => {
    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    bookings[idx].status = 'отменено';
    localStorage.setItem('bookings', JSON.stringify(bookings));
    toastr.info('Бронирование отменено');
    renderProfile();
  };

  // ── АДМИН ──
  function renderAdmin() {
    if (!isAdmin()) { app.innerHTML = '<main><h1>Нет доступа</h1></main>'; return; }
    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    const users = getUsers();
    const statusClass = s => s === 'подтверждено' ? 'status-ok' : s === 'отменено' ? 'status-cancel' : 'status-wait';

    app.innerHTML = `<main>
      <button class="btn-back" onclick="window.location.hash='#profile'" style="margin-bottom:1.2em;">← В профиль</button>
      <div class="page-title">Панель администратора</div>
      <p style="color:var(--gray-text);margin-bottom:1.2em;">Всего бронирований: <b>${bookings.length}</b></p>
      ${bookings.length ? bookings.map((b, i) => {
        const user  = users.find(u => u.id === b.userId);
        const hotel = HOTELS_DATA.find(h => h.id === b.hotelId);
        const room  = hotel?.rooms.find(r => r.id === b.roomId);
        return `<div class="booking-card">
          <div class="booking-info">
            <strong>${user ? '👤 ' + user.username : 'ID ' + b.userId}</strong>
            <small>${hotel ? hotel.name : 'Отель #' + b.hotelId} — ${room ? room.type : 'Номер #' + b.roomId}</small>
            ${b.checkin ? `<br><small>📅 ${b.checkin} → ${b.checkout}</small>` : ''}
          </div>
          <span class="status-badge ${statusClass(b.status)}">${b.status || 'ожидает'}</span>
          <button onclick="adminApprove(${i})" style="padding:0.4em 0.9em;background:var(--green);color:#fff;border:none;border-radius:6px;font-size:0.82em;cursor:pointer;">✓</button>
          <button onclick="adminCancel(${i})" style="padding:0.4em 0.9em;background:var(--red);color:#fff;border:none;border-radius:6px;font-size:0.82em;cursor:pointer;">✗</button>
        </div>`;
      }).join('')
      : `<div class="empty-state"><div class="empty-icon">📋</div><p>Бронирований пока нет</p></div>`}
    </main>`;
  }

  window.adminApprove = i => {
    const b = JSON.parse(localStorage.getItem('bookings') || '[]');
    b[i].status = 'подтверждено';
    localStorage.setItem('bookings', JSON.stringify(b));
    toastr.success('Бронирование подтверждено');
    renderAdmin();
  };
  window.adminCancel = i => {
    const b = JSON.parse(localStorage.getItem('bookings') || '[]');
    b[i].status = 'отменено';
    localStorage.setItem('bookings', JSON.stringify(b));
    toastr.info('Бронирование отменено');
    renderAdmin();
  };

  // ── ВХОД ──
  function renderLogin() {
    app.innerHTML = `<main>
      <div class="auth-wrap">
        <h1>Вход в аккаунт</h1>
        <form class="auth-form" id="loginForm">
          <div class="form-group">
            <label>Логин</label>
            <input name="login" placeholder="Введите логин" required autocomplete="username">
          </div>
          <div class="form-group">
            <label>Пароль</label>
            <input name="password" type="password" placeholder="Введите пароль" required autocomplete="current-password">
          </div>
          <button type="submit" class="btn-auth">Войти</button>
        </form>
        <div class="auth-footer">Нет аккаунта? <a href="#register">Зарегистрироваться</a></div>
        <div class="auth-hint">Администратор: <b>admin</b> / <b>admin</b></div>
      </div>
    </main>`;
    document.getElementById('loginForm').onsubmit = function(e) {
      e.preventDefault();
      const users = getUsers();
      const user = users.find(u => u.username === this.login.value && u.password === this.password.value);
      if (user) { currentUser = user; saveUser(user); updateNav(); toastr.success('Добро пожаловать, ' + user.username + '!'); window.location.hash = '#profile'; }
      else toastr.error('Неверный логин или пароль');
    };
  }

  // ── РЕГИСТРАЦИЯ ──
  function renderRegister() {
    app.innerHTML = `<main>
      <div class="auth-wrap">
        <h1>Регистрация</h1>
        <form class="auth-form" id="registerForm">
          <div class="form-group">
            <label>Логин</label>
            <input name="login" placeholder="Придумайте логин" required autocomplete="username">
          </div>
          <div class="form-group">
            <label>Пароль</label>
            <input name="password" type="password" placeholder="Придумайте пароль" required autocomplete="new-password">
          </div>
          <button type="submit" class="btn-auth">Зарегистрироваться</button>
        </form>
        <div class="auth-footer">Уже есть аккаунт? <a href="#login">Войти</a></div>
      </div>
    </main>`;
    document.getElementById('registerForm').onsubmit = function(e) {
      e.preventDefault();
      const login = this.login.value.trim();
      const password = this.password.value;
      if (login.length < 3) { toastr.error('Логин должен быть не короче 3 символов'); return; }
      if (password.length < 4) { toastr.error('Пароль должен быть не короче 4 символов'); return; }
      const users = getUsers();
      if (users.find(u => u.username === login)) { toastr.error('Пользователь с таким логином уже существует'); return; }
      users.push({ id: Date.now(), username: login, password, bookings: [] });
      localStorage.setItem('users', JSON.stringify(users));
      toastr.success('Регистрация успешна! Теперь войдите.');
      window.location.hash = '#login';
    };
  }

  // ── РОУТЕР ──
  async function renderPage() {
    ensureAdminUser();
    loadUser();
    updateNav();
    const hash = window.location.hash || '#home';
    if (hash.startsWith('#hotel-')) { renderHotel(hash.replace('#hotel-', '')); return; }
    switch (hash) {
      case '#home':          renderHome();           break;
      case '#searchresults': renderSearchResults();  break;
      case '#hotels':        renderHotels();         break;
      case '#profile':       renderProfile();        break;
      case '#login':         renderLogin();          break;
      case '#register':      renderRegister();       break;
      case '#admin':         renderAdmin();          break;
      default: app.innerHTML = '<main><div class="empty-state"><div class="empty-icon">🤔</div><p>Страница не найдена</p></div></main>';
    }
  }

  window.addEventListener('hashchange', renderPage);
  window.addEventListener('DOMContentLoaded', renderPage);
