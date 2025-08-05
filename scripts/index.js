// Enhanced Contact Form Logic
if (contactForm) {
    // Dynamic field handling
    contactType.addEventListener('change', (e) => {
        datetimeGroup.classList.toggle('hidden', e.target.value !== 'call');
        document.getElementById('urgency-group').style.display = 
            ['web-dev', 'security'].includes(e.target.value) ? 'block' : 'none';
    });

    // Character counter
    const textarea = messageGroup.querySelector('textarea');
    const charCounter = messageGroup.querySelector('.char-counter');
    textarea.addEventListener('input', () => {
        document.getElementById('char-count').textContent = textarea.value.length;
    });

    // Form submission
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = contactForm.querySelector('.submit-btn');
        const btnText = submitBtn.querySelector('.btn-text');
        const spinner = submitBtn.querySelector('.loading-spinner');
        
        // UI Feedback
        btnText.classList.add('hidden');
        spinner.classList.remove('hidden');
        submitBtn.disabled = true;

        try {
            const response = await fetch(contactForm.action, {
                method: 'POST',
                body: new FormData(contactForm),
                headers: { 'Accept': 'application/json' }
            });
            
            if (response.ok) {
                showToast('Message sent successfully!', 'success');
                contactForm.reset();
                document.getElementById('char-count').textContent = '0';
            } else {
                throw new Error(await response.text());
            }
        } catch (error) {
            console.error('Submission error:', error);
            showToast('Failed to send. Please try again or contact via LinkedIn.', 'error');
        } finally {
            btnText.classList.remove('hidden');
            spinner.classList.add('hidden');
            submitBtn.disabled = false;
        }
    });

    // Input validation
    contactForm.querySelectorAll('[required]').forEach(input => {
        input.addEventListener('blur', () => {
            input.parentElement.classList.toggle('error', !input.checkValidity());
            input.parentElement.classList.toggle('success', input.checkValidity());
        });
    });
}

// Enhanced Toast
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <span class="toast-icon">${type === 'success' ? '✓' : '✗'}</span>
        <span>${message}</span>
    `;
    document.body.appendChild(toast);
    
    setTimeout(() => toast.classList.add('show'), 50);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 5000);
}
