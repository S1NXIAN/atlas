(function() {
  const WS_URL = 'ws://' + window.location.host;
  let ws = null;
  let eventQueue = [];

  function connect() {
    ws = new WebSocket(WS_URL);
    ws.onopen = () => {
      eventQueue.forEach(e => ws.send(JSON.stringify(e)));
      eventQueue = [];
    };
    ws.onmessage = (msg) => {
      const data = JSON.parse(msg.data);
      if (data.type === 'reload') window.location.reload();
    };
    ws.onclose = () => setTimeout(connect, 1000);
  }

  function sendEvent(event) {
    event.timestamp = Date.now();
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(event));
    } else {
      eventQueue.push(event);
    }
  }

  document.addEventListener('click', (e) => {
    const target = e.target.closest('[data-choice]');
    if (!target) return;
    sendEvent({
      type: 'click',
      text: target.textContent.trim(),
      choice: target.dataset.choice
    });
  });

  window.toggleSelect = function(el) {
    const container = el.closest('.options') || el.closest('.cards');
    const multi = container && container.dataset.multiselect !== undefined;
    if (container && !multi) {
      container.querySelectorAll('.option, .card').forEach(o => o.classList.remove('selected'));
    }
    el.classList.toggle('selected');
  };

  connect();
})();
