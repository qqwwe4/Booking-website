// Модуль для управления модальным окном бронирования
window.showBookingModal = function(room, hotel, onBook) {
  let modal = document.getElementById('booking-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'booking-modal';
    modal.className = 'modal micromodal-slide';
    modal.tabIndex = -1;
    modal.innerHTML = `
      <div class="modal__overlay" tabindex="-1" data-micromodal-close>
        <div class="modal__container" role="dialog" aria-modal="true" aria-labelledby="modal-title">
          <header class="modal__header">
            <h2 class="modal__title" id="modal-title">Бронирование номера</h2>
            <button class="modal__close" aria-label="Закрыть" data-micromodal-close></button>
          </header>
          <main class="modal__content" id="modal-content"></main>
          <footer class="modal__footer">
            <button class="btn btn-primary" id="modal-book-btn">Забронировать</button>
            <button class="btn btn-secondary" data-micromodal-close>Отмена</button>
          </footer>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }
  document.getElementById('modal-content').innerHTML = `
    <div><b>Отель:</b> ${hotel.name}</div>
    <div><b>Номер:</b> ${room.type}</div>
    <div><b>Цена:</b> ${room.price}₸</div>
    <div><b>Описание:</b> ${hotel.description}</div>
  `;
  document.getElementById('modal-book-btn').onclick = function() {
    onBook();
    MicroModal.close('booking-modal');
  };
  MicroModal.show('booking-modal');
};