// inquiry-modal.js

// 1. Inject Supabase SDK
const supabaseScript = document.createElement('script');
supabaseScript.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
document.head.appendChild(supabaseScript);

// Wait for Supabase to load
supabaseScript.onload = () => {
    // Replace with actual Supabase URL and Anon Key later
    const SUPABASE_URL = 'https://rtjdqcztahwyivnyrwvp.supabase.co';
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ0amRxY3p0YWh3eWl2bnlyd3ZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk3MTY2NTksImV4cCI6MjA5NTI5MjY1OX0.kx5qZJoi_4myOei_CyENVpj4znDLHaI5ubn2KawbWz8';
    
    // Check if placeholders are still present to avoid crashing if user hasn't set them yet
    let supabase = null;
    if (SUPABASE_URL !== 'https://YOUR_SUPABASE_PROJECT.supabase.co') {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    }

    // 2. Inject Modal HTML
    const modalHTML = `
    <div id="inquiry-modal" class="fixed inset-0 z-[100] hidden flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity duration-300 opacity-0">
        <div class="relative w-full max-w-lg p-8 bg-surface border border-primary/20 shadow-2xl rounded-sm transform scale-95 transition-transform duration-300">
            <button id="close-inquiry" class="absolute top-4 right-4 text-white hover:text-primary transition-colors">
                <span class="material-symbols-outlined">close</span>
            </button>
            <h2 class="text-headline-md font-headline-md text-primary mb-2 uppercase tracking-widest">Inquire Now</h2>
            <p class="text-body-md font-body-md text-white/70 mb-6">Tell us about your project and we'll get back to you shortly.</p>
            
            <form id="inquiry-form" class="space-y-4">
                <div>
                    <label class="block text-label-md font-label-md text-white mb-1 uppercase tracking-wide">Name</label>
                    <input type="text" id="inq-name" required class="w-full bg-surface-container border border-primary/30 text-white px-4 py-2 focus:outline-none focus:border-primary transition-colors">
                </div>
                <div>
                    <label class="block text-label-md font-label-md text-white mb-1 uppercase tracking-wide">Email</label>
                    <input type="email" id="inq-email" required class="w-full bg-surface-container border border-primary/30 text-white px-4 py-2 focus:outline-none focus:border-primary transition-colors">
                </div>
                <div>
                    <label class="block text-label-md font-label-md text-white mb-1 uppercase tracking-wide">Project Type</label>
                    <select id="inq-service" class="w-full bg-surface-container border border-primary/30 text-white px-4 py-2 focus:outline-none focus:border-primary transition-colors">
                        <option value="Residential">Residential</option>
                        <option value="Commercial">Commercial</option>
                        <option value="Restaurant">Restaurant</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
                <div>
                    <label class="block text-label-md font-label-md text-white mb-1 uppercase tracking-wide">Message</label>
                    <textarea id="inq-message" rows="4" required class="w-full bg-surface-container border border-primary/30 text-white px-4 py-2 focus:outline-none focus:border-primary transition-colors resize-none"></textarea>
                </div>
                
                <div id="inq-status" class="hidden text-sm py-2"></div>

                <button type="submit" id="inq-submit" class="w-full bg-primary text-on-primary font-label-caps text-label-caps px-6 py-3 uppercase hover:bg-primary-fixed transition-colors mt-4">
                    Send Inquiry
                </button>
            </form>
        </div>
    </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    const modal = document.getElementById('inquiry-modal');
    const modalContent = modal.querySelector('div.relative');
    const closeBtn = document.getElementById('close-inquiry');
    const form = document.getElementById('inquiry-form');
    const statusDiv = document.getElementById('inq-status');
    const submitBtn = document.getElementById('inq-submit');

    // 3. Attach Event Listeners to Buttons
    const openButtons = document.querySelectorAll('.open-inquiry-modal');
    openButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            modal.classList.remove('hidden');
            // Trigger reflow
            void modal.offsetWidth;
            modal.classList.remove('opacity-0');
            modalContent.classList.remove('scale-95');
        });
    });

    // Close logic
    const closeModal = () => {
        modal.classList.add('opacity-0');
        modalContent.classList.add('scale-95');
        setTimeout(() => {
            modal.classList.add('hidden');
            form.reset();
            statusDiv.classList.add('hidden');
        }, 300);
    };

    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    // Form Submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const name = document.getElementById('inq-name').value;
        const email = document.getElementById('inq-email').value;
        const service = document.getElementById('inq-service').value;
        const message = document.getElementById('inq-message').value;

        submitBtn.disabled = true;
        submitBtn.innerText = 'SENDING...';
        submitBtn.classList.add('opacity-70', 'cursor-not-allowed');

        statusDiv.classList.add('hidden');

        if (!supabase) {
            // Mock error/success if user hasn't set keys
            setTimeout(() => {
                statusDiv.innerText = "Error: Supabase keys not configured yet. (Mock mode)";
                statusDiv.className = 'text-error font-body-sm py-2';
                statusDiv.classList.remove('hidden');
                submitBtn.disabled = false;
                submitBtn.innerText = 'SEND INQUIRY';
                submitBtn.classList.remove('opacity-70', 'cursor-not-allowed');
            }, 1000);
            return;
        }

        try {
            const { error } = await supabase
                .from('inquiries')
                .insert([{ Name: name, Email: email, Service: service, Message: message }]);

            if (error) throw error;

            statusDiv.innerText = "Inquiry sent successfully! We'll be in touch.";
            statusDiv.className = 'text-primary font-body-sm py-2';
            statusDiv.classList.remove('hidden');
            
            setTimeout(() => {
                closeModal();
                submitBtn.disabled = false;
                submitBtn.innerText = 'SEND INQUIRY';
                submitBtn.classList.remove('opacity-70', 'cursor-not-allowed');
            }, 2000);

        } catch (error) {
            statusDiv.innerText = "Failed to send inquiry: " + error.message;
            statusDiv.className = 'text-error font-body-sm py-2';
            statusDiv.classList.remove('hidden');
            submitBtn.disabled = false;
            submitBtn.innerText = 'SEND INQUIRY';
            submitBtn.classList.remove('opacity-70', 'cursor-not-allowed');
        }
    });
};
