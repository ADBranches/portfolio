// Set current year and last modified date
document.getElementById('currentyear').textContent = new Date().getFullYear();
document.getElementById('lastModified').textContent = `Last Modified: ${document.lastModified}`;

// Toast notification system
const toastQueue = [];
let isToastShowing = false;

function showToast(message, type = 'success') {
    toastQueue.push({ message, type });
    if (!isToastShowing) processToastQueue();
}

function processToastQueue() {
    if (toastQueue.length === 0) {
        isToastShowing = false;
        return;
    }

    isToastShowing = true;
    const { message, type } = toastQueue.shift();
    
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
        setTimeout(() => {
            toast.remove();
            processToastQueue();
        }, 300);
    }, 5000);
}

// Check for success redirect
if (window.location.search.includes('formsuccess=true')) {
    showToast('Message sent successfully!', 'success');
    // Clean URL without reload
    history.replaceState(null, '', window.location.pathname);
}

document.addEventListener('DOMContentLoaded', () => {
    // Projects link toast
    document.querySelectorAll('.projects-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            showToast('Projects section coming soon!', 'info');
        });
    });

    // Enhanced Contact Form Logic
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        const contactType = document.getElementById('contact-type');
        const datetimeGroup = document.getElementById('datetime-group');
        const urgencyGroup = document.getElementById('urgency-group');

        // Dynamic field handling
        contactType.addEventListener('change', (e) => {
            const isCall = e.target.value === 'call';
            datetimeGroup.classList.toggle('hidden', !isCall);
            urgencyGroup.style.display = 
                ['web-dev', 'security'].includes(e.target.value) ? 'block' : 'none';
        });

        // Character counter
        const textarea = document.getElementById('message');
        if (textarea) {
            textarea.addEventListener('input', () => {
                const counter = document.getElementById('char-count');
                if (counter) counter.textContent = textarea.value.length;
            });
        }

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
                const formData = {
                    name: contactForm.querySelector('#name').value,
                    email: contactForm.querySelector('#email').value,
                    contactType: contactForm.querySelector('#contact-type').value,
                    message: contactForm.querySelector('#message').value,
                    datetime: contactForm.querySelector('#datetime')?.value
                };

                // Send to both Formspree and our email handler
                const [formspreeResponse, emailResponse] = await Promise.all([
                    fetch(contactForm.action, {
                        method: 'POST',
                        body: new FormData(contactForm),
                        headers: { 'Accept': 'application/json' }
                    }),
                    fetch('/.netlify/functions/email-handler', {
                        method: 'POST',
                        body: JSON.stringify(formData),
                        headers: { 'Content-Type': 'application/json' }
                    })
                ]);
                
                if (!emailResponse.ok) throw new Error('Email failed');
                if (!formspreeResponse.ok) throw new Error('Formspree failed');

                window.location.href = 'thanks.html?formsuccess=true';
            } catch (error) {
                console.error('Submission error:', error);
                showToast(error.message || 'Message received! You may get a delayed confirmation.', 'warning');
            } finally {
                btnText.classList.remove('hidden');
                spinner.classList.add('hidden');
                submitBtn.disabled = false;
            }
        });

        // Input validation
        contactForm.querySelectorAll('[required]').forEach(input => {
            input.addEventListener('blur', () => {
                const isValid = input.checkValidity();
                input.parentElement.classList.toggle('error', !isValid);
                input.parentElement.classList.toggle('success', isValid);
            });
        });
    }
});
