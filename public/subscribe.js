document.getElementById('subscribeForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim().toLowerCase();
  const messageDiv = document.getElementById('message');

  messageDiv.textContent = 'Subscribing...';
  messageDiv.className = 'message';

  try {
    const response = await fetch('/api/subscribers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, email })
    });

    const data = await response.json();

    if (response.ok) {
      messageDiv.textContent = 'Successfully subscribed! Welcome to CEO Advantage.';
      messageDiv.className = 'message success';
      document.getElementById('subscribeForm').reset();
    } else {
      messageDiv.textContent = data.error || 'Failed to subscribe. Please try again.';
      messageDiv.className = 'message error';
    }
  } catch (error) {
    messageDiv.textContent = 'Network error. Please try again.';
    messageDiv.className = 'message error';
  }
});