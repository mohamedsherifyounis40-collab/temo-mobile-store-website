// ==========================================================================
// Temo Mobile Store — Contact page: build a WhatsApp message from the form
// ==========================================================================

const CONTACT_WHATSAPP_NUMBER = '201000000000';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('contactName').value.trim();
    const phone = document.getElementById('contactPhone').value.trim();
    const message = document.getElementById('contactMessage').value.trim();

    const text = encodeURIComponent(
      `مرحبًا، أنا ${name}\nرقم الهاتف: ${phone}\n\n${message}`
    );

    window.open(`https://wa.me/${CONTACT_WHATSAPP_NUMBER}?text=${text}`, '_blank', 'noopener');
  });
});
