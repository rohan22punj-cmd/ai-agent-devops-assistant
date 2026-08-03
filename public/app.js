document.addEventListener('DOMContentLoaded', () => {
  const toggleBtn = document.getElementById('toggleBtn');
  const sidebar = document.getElementById('historySidebar');
  const logList = document.getElementById('logList');

  // Toggle sidebar open/close
  toggleBtn.addEventListener('click', () => {
    const isOpen = sidebar.classList.toggle('open');
    sidebar.classList.toggle('closed', !isOpen);
    toggleBtn.textContent = isOpen ? '✕' : '☰';
  });

  // Fetch logs and render
  // Fetch logs and render, with click handling for details
  async function fetchLogs() {
    try {
      const res = await fetch('/history');
      const logs = await res.json();
      logList.innerHTML = '';
      logs.forEach(log => {
        const li = document.createElement('li');
        const time = new Date(log.timestamp).toLocaleString();
        li.textContent = `${time} - ${log.question || ''}`;
        li.dataset.id = log._id; // store log id
        li.style.cursor = 'pointer';
        li.addEventListener('click', () => showLogDetail(log._id));
        logList.appendChild(li);
      });
    } catch (e) {
      console.error('Failed to fetch logs', e);
    }
  }

  // Fetch single log detail and display in the sidebar
  async function showLogDetail(id) {
    try {
      const res = await fetch(`/history/${id}`);
      if (!res.ok) throw new Error('Log not found');
      const log = await res.json();
      const detailDiv = document.getElementById('logDetail');
      const time = new Date(log.timestamp).toLocaleString();
      detailDiv.innerHTML = `<h3>Log Detail</h3>` +
        `<p><strong>Time:</strong> ${time}</p>` +
        `<p><strong>Question:</strong> ${log.question || ''}</p>` +
        `<p><strong>Tool Called:</strong> ${log.toolCalled || ''}</p>` +
        `<pre>${JSON.stringify(log.result, null, 2)}</pre>`;
    } catch (e) {
      console.error('Failed to fetch log detail', e);
    }
  }

  // Initial load and periodic refresh
  fetchLogs();
  setInterval(fetchLogs, 30000); // every 30 seconds
});
