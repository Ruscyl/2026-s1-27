document.getElementById('unsubscribeForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value.trim().toLowerCase();
  const messageDiv = document.getElementById('message');

  messageDiv.textContent = 'Unsubscribing...';
  messageDiv.className = 'message';

  try {
    const response = await fetch('/api/subscribers', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email })
    });

    const data = await response.json();

    if (response.ok) {
      messageDiv.textContent = 'Successfully unsubscribed. You will no longer receive our newsletter.';
      messageDiv.className = 'message success';
      document.getElementById('unsubscribeForm').reset();
    } else {
      messageDiv.textContent = data.error || 'Failed to unsubscribe. Please check your email address.';
      messageDiv.className = 'message error';
    }
  } catch (error) {
    messageDiv.textContent = 'Network error. Please try again.';
    messageDiv.className = 'message error';
  }
});