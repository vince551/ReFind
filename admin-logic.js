let currentMentorPhoto = ""; 

function setAdminView(id, el) {
    // Hide all views
    document.querySelectorAll('.view').forEach(v => v.style.display = 'none');
    
    // Show target view
    const targetSection = document.getElementById(id);
    if (targetSection) {
        targetSection.style.display = 'block';
    } else {
        console.error("View ID not found: " + id);
        return;
    }

    // Update Sidebar
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    if (el) el.classList.add('active');

    // Context-specific loading
    if (id === 'mentor-mgmt' || id === 'overview') {
        if (typeof displayAdminMentors === 'function') displayAdminMentors();
    }
    if (id === 'inbox') {
        if (typeof loadRequests === 'function') loadRequests();
    }
}

// Mentor Management Logic
function previewImage(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const preview = document.getElementById('photo-preview');
            preview.innerHTML = `<img src="${e.target.result}" style="width:100%; height:100%; border-radius:12px; object-fit:cover;">`;
            currentMentorPhoto = e.target.result;
        };
        reader.readAsDataURL(input.files[0]);
    }
}

function registerMentor() {
    const name = document.getElementById('m-name').value;
    const edu = document.getElementById('m-edu').value;
    const age = document.getElementById('m-age').value;

    if(!name || !edu || !age || !currentMentorPhoto) {
        alert("Incomplete Profile! Please add a photo and fill all fields.");
        return;
    }

    const newMentor = { name, edu, age, img: currentMentorPhoto };
    let mentors = JSON.parse(localStorage.getItem('joboMentors')) || [];
    mentors.push(newMentor);
    localStorage.setItem('joboMentors', JSON.stringify(mentors));

    alert("System Synchronized: " + name + " is now live.");
    location.reload(); // Refresh to clear form and update list
}

function displayAdminMentors() {
    const list = document.getElementById('admin-mentor-list');
    if (!list) return;
    const mentors = JSON.parse(localStorage.getItem('joboMentors')) || [];
    
    if(mentors.length === 0) {
        list.innerHTML = "<p style='color:#555'>No mentors registered yet.</p>";
        return;
    }

    list.innerHTML = ""; 
    mentors.forEach((m, index) => {
        const item = document.createElement('div');
        item.className = "request-card"; // Reusing existing card styles
        item.style.display = "flex";
        item.style.justifyContent = "space-between";
        item.innerHTML = `
            <span><strong>${m.name}</strong> (${m.edu})</span>
            <button class="btn-outline" style="border-color:#ff4444; color:#ff4444; width:auto;" 
                    onclick="deleteMentor(${index})">Remove</button>
        `;
        list.appendChild(item);
    });
}

function deleteMentor(index) {
    if(confirm("Are you sure you want to remove this mentor?")) {
        let mentors = JSON.parse(localStorage.getItem('joboMentors')) || [];
        mentors.splice(index, 1);
        localStorage.setItem('joboMentors', JSON.stringify(mentors));
        displayAdminMentors();
    }
}

// Request Inbox Logic
function loadRequests() {
    const list = document.getElementById('admin-request-list');
    if (!list) return;
    const requests = JSON.parse(localStorage.getItem('mentorRequests')) || [];
    
    list.innerHTML = requests.length === 0 ? "<p>No pending requests.</p>" : "";
    requests.forEach((req) => {
        const div = document.createElement('div');
        div.className = 'request-card';
        div.innerHTML = `
            <span class="status-badge">${req.priority}</span>
            <strong>From: ${req.userName}</strong><br>
            <p>"${req.problem}"</p>
            <small>${req.time}</small>
        `;
        list.prepend(div);
    });
}

// Broadcast Logic
function sendGlobalAlert() {
    const text = document.getElementById('broadcast-msg').value;
    const type = document.getElementById('broadcast-type').value;

    if(!text) return alert("Please enter a message!");

    const alertData = { message: text, style: type, timestamp: Date.now() };
    localStorage.setItem('jobo_global_alert', JSON.stringify(alertData));
    
    alert("Broadcast Launched!");
    document.getElementById('broadcast-msg').value = ""; 
}

function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    sidebar.classList.toggle('collapsed');
}

// Initial Load
window.onload = () => {
    displayAdminMentors();
    setInterval(loadRequests, 5000);
};

function registerMentor() {
    const name = document.getElementById('m-name').value;
    const edu = document.getElementById('m-edu').value;
    const age = document.getElementById('m-age').value;
    const category = document.getElementById('m-category').value; // New Field

    if (!name || !edu || !currentMentorPhoto) return alert("Complete all fields!");

    const mentors = JSON.parse(localStorage.getItem('joboMentors')) || [];
    mentors.push({ 
        name, 
        edu, 
        age, 
        category, // Saved to database
        img: currentMentorPhoto,
        id: Date.now() 
    });

    localStorage.setItem('joboMentors', JSON.stringify(mentors));
    alert("Mentor Deployed to Social Feed!");
    location.reload();
}

function setAdminView(viewId, clickedElement) {
    // 1. Hide all sections
    document.querySelectorAll('.view').forEach(view => {
        view.style.display = 'none';
    });

    // 2. Show the one we want
    const activeView = document.getElementById(viewId);
    if (activeView) activeView.style.display = 'block';

    // 3. Highlight the button in the sidebar
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    if (clickedElement) clickedElement.classList.add('active');
    
    // 4. Auto-load data if needed
    if (viewId === 'mentor-mgmt') displayAdminMentors();
    if (viewId === 'inbox') loadRequests();
}

function sendGlobalAlert() {
    const text = document.getElementById('broadcast-msg').value;
    const type = document.getElementById('broadcast-type').value;

    if(!text) {
        alert("CRITICAL_ERROR: Transmission content cannot be empty.");
        return;
    }

    // Saving to localStorage for index.html to pick up
    const alertData = { 
        message: text, 
        style: type, 
        timestamp: new Date().toLocaleTimeString(),
        id: Date.now()
    };
    
    localStorage.setItem('jobo_global_alert', JSON.stringify(alertData));
    
    // Satisfying feedback
    const btn = document.querySelector('.broadcast-btn');
    const originalText = btn.innerHTML;
    btn.innerHTML = "📡 TRANSMITTING...";
    btn.style.background = "#00ff00";

    setTimeout(() => {
        alert("SUCCESS: Signal Broadcasted to Network.");
        btn.innerHTML = originalText;
        btn.style.background = "var(--primary)";
        document.getElementById('broadcast-msg').value = ""; 
    }, 1500);
}

// --- Place this at the end of admin-logic.js ---

function displayAdminMentors() {
    const list = document.getElementById('admin-mentor-list');
    
    // Safety check: only run if the list exists on the current page
    if (!list) return;

    // Get mentors from storage
    const mentors = JSON.parse(localStorage.getItem('mentors')) || [];

    // 1. Clear the list completely (removes the "extra" hardcoded cards)
    list.innerHTML = ""; 

    if (mentors.length === 0) {
        // 2. Add a cute "empty" message if no one is registered
        list.innerHTML = `
            <div style="text-align:center; padding:20px; opacity:0.6; font-style:italic;">
                No mentors in the neural network yet... ✨
            </div>`;
        return;
    }

    // 3. Loop through and create the mini-cards
    mentors.forEach((m, index) => {
        const card = document.createElement('div');
        card.className = "mentor-card-mini"; 
        card.innerHTML = `
            <img src="${m.photo || 'default-avatar.png'}" class="admin-avatar">
            <div class="admin-mentor-info">
                <h4>${m.name}</h4>
                <span>${m.role}</span>
            </div>
            <button class="delete-btn" onclick="deleteMentor(${index})">✕</button>
        `;
        list.appendChild(card);
    });
}

// Ensure the list refreshes when the admin page first loads
window.addEventListener('DOMContentLoaded', displayAdminMentors);