/* Progressive enhancement for Netlify Forms: submit in place and show the
   result inline. Without JS the form still posts and Netlify shows its own
   confirmation page. */

document.querySelectorAll<HTMLFormElement>('form[data-enhance="netlify"]').forEach((form) => {
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const status = form.querySelector<HTMLElement>('[data-status]');
    const button = form.querySelector<HTMLButtonElement>('button[type="submit"]');
    if (button) button.disabled = true;

    try {
      const body = new URLSearchParams(new FormData(form) as unknown as Record<string, string>).toString();
      const response = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
      });
      if (!response.ok) throw new Error(`Form post failed: ${response.status}`);
      form.reset();
      form.dataset.state = 'success';
      if (status) status.textContent = form.dataset.success ?? 'Sent.';
    } catch {
      form.dataset.state = 'error';
      if (status) status.textContent = form.dataset.error ?? 'That didn’t go through. Please try again.';
    } finally {
      if (button) button.disabled = false;
    }
  });
});

// Copy-to-clipboard buttons (Contact page email).
document.querySelectorAll<HTMLButtonElement>('[data-copy]').forEach((button) => {
  const label = button.querySelector<HTMLElement>('[data-copy-label]');
  const original = label?.textContent ?? '';
  button.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(button.dataset.copy ?? '');
      button.dataset.copied = 'true';
      if (label) label.textContent = 'Copied';
      window.setTimeout(() => {
        delete button.dataset.copied;
        if (label) label.textContent = original;
      }, 2000);
    } catch {
      if (label) label.textContent = 'Press Ctrl+C to copy';
    }
  });
});
