// INITIALIZE PLATFORM
function launchPlatform() {
    const nameInput = document.getElementById('reg-name');
    if(!nameInput || nameInput.value.trim() === "") {
        alert("Please enter your name to initialize!");
        return;
    }
    
    // Set user name
    const userDisplay = document.getElementById('user-display');
    if(userDisplay) userDisplay.innerText = nameInput.value;

    // Switch the screens
    document.getElementById('login-screen').style.display = 'none';
    const mainApp = document.getElementById('main-app');
    if(mainApp) mainApp.style.display = 'flex';
    
    // Run initial renders
    if (typeof renderMindLibrary === 'function') renderMindLibrary();
}

// NAVIGATION ENGINE
function setView(viewId, el) {
    // 1. Hide all views
    document.querySelectorAll('.view').forEach(v => {
        v.classList.remove('active-view');
        v.style.display = 'none';
    });
    
    // 2. Update active state in sidebar
    document.querySelectorAll('.nav-item, .sub-menu li').forEach(item => {
        item.classList.remove('active');
        // If element was passed directly, use it; otherwise find by viewId
        if (el) {
            el.classList.add('active');
        } else if (item.getAttribute('onclick') && item.getAttribute('onclick').includes(viewId)) {
            item.classList.add('active');
        }
    });

    // 3. Show selected view
    const activeView = document.getElementById(viewId);
    if (activeView) {
        activeView.style.display = 'block';
        setTimeout(() => activeView.classList.add('active-view'), 10);
    }

    // 4. Contextual Logic
    if(viewId === 'game-view') initGame();
    if(viewId === 'mentor-view' || viewId === 'mentors-hub') displayMentors();
}

// MENTOR REQUEST LOGIC
function submitRequest() {
    const problemField = document.getElementById('problem-desc');
    const urgencyField = document.getElementById('urgency');
    const userDisplay = document.getElementById('user-display');

    if(!problemField || problemField.value.length < 10) {
        alert("Please describe your problem more clearly (min 10 chars).");
        return;
    }

    const newRequest = {
        userName: userDisplay ? userDisplay.innerText : "Unknown User",
        problem: problemField.value,
        priority: urgencyField ? urgencyField.value : "standard",
        time: new Date().toLocaleTimeString()
    };

    // Save to localStorage
    let allRequests = JSON.parse(localStorage.getItem('mentorRequests')) || [];
    allRequests.push(newRequest);
    localStorage.setItem('mentorRequests', JSON.stringify(allRequests));

    if (typeof notify === 'function') {
        notify("Securely sent! Mentor has received your message.");
    } else {
        alert("Message sent successfully!");
    }
    
    // Reset and Redirect
    problemField.value = "";
    const bookingForm = document.getElementById('booking-form');
    if(bookingForm) bookingForm.style.display = 'none';
    setTimeout(() => setView('profile-view'), 2000);
}

// Ensure broadcasts are checked
setInterval(() => {
    if (typeof listenForBroadcasts === 'function') listenForBroadcasts();
}, 3000);

// NAVIGATION ENGINE
function toggleMenu(id) {
    const menu = document.getElementById(id);
    menu.classList.toggle('show-menu');
}


// FUNTABU GAME LOGIC
let score = 0;
let gameActive = false;

function initGame() {
    if(gameActive) return; // Prevent multiple loops
    gameActive = true;
    const canvas = document.getElementById('game-canvas');
    
    setInterval(() => {
        const currentView = document.getElementById('game-view');
        if(currentView.style.display === 'block') {
            spawnAtom(canvas);
        }
    }, 1200);
}

function spawnAtom(canvas) {
    const atom = document.createElement('div');
    atom.className = 'atom';
    
    // Random position logic
    const maxX = canvas.offsetWidth - 50;
    const maxY = canvas.offsetHeight - 50;
    atom.style.left = Math.floor(Math.random() * maxX) + 'px';
    atom.style.top = Math.floor(Math.random() * maxY) + 'px';
    
    atom.onclick = () => {
        score += 10;
        document.getElementById('score-val').innerText = score;
        atom.remove();
    };
    
    canvas.appendChild(atom);
    
    // Auto-remove if not clicked
    setTimeout(() => { if(atom.parentElement) atom.remove(); }, 2000);
}

function joinMeeting() {
    alert("Connection established. Virtual Meeting Hub is ready for 1,000 peers.");
}

let selectedMentor = "";

function openBooking(mentorName) {
    selectedMentor = mentorName;
    const form = document.getElementById('booking-form');
    document.getElementById('booking-title').innerText = "Message to " + mentorName;
    
    // Smooth scroll to form
    form.style.display = 'block';
    form.scrollIntoView({ behavior: 'smooth' });
    
    notify("Secure portal opened with " + mentorName);
}

// Update character count live
function updateCount() {
    const input = document.getElementById('life-story-input');
    const countDisplay = document.getElementById('current-chars');
    countDisplay.innerText = input.value.length;
}

function saveStory() {
    const input = document.getElementById('life-story-input');
    const display = document.getElementById('bio-display');
    
    if (input.value.trim() !== "") {
        display.innerText = input.value;
        // Visual feedback
        input.style.borderColor = "var(--accent)";
        setTimeout(() => { input.value = ""; }, 500);
        alert("NARRATIVE SYNCED TO FEED");
    }
}

function submitRequest() {
    const problem = document.getElementById('problem-desc').value;
    const userName = document.getElementById('user-display').innerText;
    
    const newRequest = {
        userName: userName,
        problem: problem,
        priority: document.getElementById('urgency').value,
        time: new Date().toLocaleTimeString()
    };

    // Save to localStorage (The "Link" between pages)
    let allRequests = JSON.parse(localStorage.getItem('mentorRequests')) || [];
    allRequests.push(newRequest);
    localStorage.setItem('mentorRequests', JSON.stringify(allRequests));

    notify("Securely sent! Mentor Ambani has received your message.");
}

function goToAdmin() {
    // Basic Security: You can add a prompt here
    const pass = prompt("Enter Admin Access Code:");
    
    if (pass === "JOBO2026") { // You can change this code
        notify("Access Granted. Initializing Admin Mode...");
        setTimeout(() => {
            window.location.href = 'admin.html';
        }, 1000);
    } else {
        alert("Unauthorized Access Attempt Detected.");
    }
}

function displayMentors() {
    const grid = document.querySelector('.mentor-grid');
    if(!grid) return; 

    // Clear the grid first
    grid.innerHTML = "";

    // Pull registered mentors from storage
    const mentors = JSON.parse(localStorage.getItem('joboMentors')) || [];

    mentors.forEach(m => {
        const card = document.createElement('div');
        card.className = 'mentor-card glass-card';
        card.innerHTML = `
            <div class="mentor-pic" style="background-image: url('${m.img}'); background-size: cover;"></div>
            <h3>${m.name}</h3>
            <p class="specialty">${m.edu}</p>
            <p style="font-size: 0.8rem; color: #888;">Age: ${m.age}</p>
            <button class="btn-shine small" onclick="openBooking('${m.name}')">Book Session</button>
        `;
        grid.appendChild(card);
    });
}

// Run this function whenever the Find Mentor section is opened
function setView(id) {
    document.querySelectorAll('.view').forEach(v => v.style.display = 'none');
    document.getElementById(id).style.display = 'block';
    
    if(id === 'mentor-view') {
        displayMentors();
    }
}

// This function checks for new broadcasts every 2 seconds
function listenForBroadcasts() {
    const lastSeenAlert = localStorage.getItem('last_seen_alert_time');
    const globalAlertRaw = localStorage.getItem('jobo_global_alert');

    if (globalAlertRaw) {
        const alertData = JSON.parse(globalAlertRaw);

        // If the timestamp is newer than the one we last saw, show it
        if (!lastSeenAlert || alertData.timestamp > lastSeenAlert) {
            
            // Trigger our high-end notification system
            triggerGlobalToast(alertData.message, alertData.style);
            
            // Mark this alert as "seen" on this specific computer
            localStorage.setItem('last_seen_alert_time', alertData.timestamp);
        }
    }
}

// Custom Toast for Global Alerts
function triggerGlobalToast(msg, style) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    
    // Set style based on Admin choice
    let borderColor = "var(--accent)";
    if(style === 'urgent') borderColor = "var(--primary)";
    if(style === 'emergency') borderColor = "#ff4444";

    toast.className = 'toast';
    toast.style.borderLeft = `4px solid ${borderColor}`;
    toast.innerHTML = `<strong>📢 ADMIN BROADCAST:</strong><br>${msg}`;
    
    container.appendChild(toast);

    // Play a subtle sound effect if you like, then remove
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 500);
    }, 6000); // Global alerts stay longer (6 seconds)
}


// Update setView to handle the active color on the sub-items
function setView(id) {
    // Hide all views
    document.querySelectorAll('.view').forEach(v => v.style.display = 'none');
    document.getElementById(id).style.display = 'block';

    // Update active state in sidebar
    document.querySelectorAll('.nav-item, .sub-menu li').forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('onclick') && item.getAttribute('onclick').includes(id)) {
            item.classList.add('active');
        }
    });
}

// Add this to both script files
function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const btn = document.querySelector('.collapse-btn');
    sidebar.classList.toggle('collapsed');
    
    // Flip the arrow
    btn.innerText = sidebar.classList.contains('collapsed') ? '▶' : '◀';
}

// Updated setView to handle 'active' highlight
function setView(id, el) {
    document.querySelectorAll('.view').forEach(v => v.style.display = 'none');
    document.getElementById(id).style.display = 'block';
    
    document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
    if(el) el.classList.add('active');
}


// Add this to the bottom of script.js
setInterval(listenForBroadcasts, 3000);

// Ensure the find-mentor view pulls the latest data
function setView(id, el) {
    document.querySelectorAll('.view').forEach(v => v.style.display = 'none');
    document.getElementById(id).style.display = 'block';
    
    document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
    if(el) el.classList.add('active');

    if(id === 'mentor-view') displayMentors();
}

// --- TIC TAC TOE ENGINE ---
let tttState = ["", "", "", "", "", "", "", "", ""];
let isGameActive = true;
let userPlayer = "X";
let aiPlayer = "O";
let credits = localStorage.getItem('neuralCredits') || 0;

function handleMove(index) {
    const cells = document.querySelectorAll('.cell');
    if (tttState[index] !== "" || !isGameActive) return;

    // Player Move
    executeMove(index, userPlayer);
    
    if (checkWinner(userPlayer)) {
        endGame("Victory! +50 Credits");
        updateCredits(50);
    } else if (tttState.includes("")) {
        // AI Turn
        setTimeout(aiThink, 600);
    } else {
        endGame("Equilibrium Reached (Draw)");
    }
}

function executeMove(index, player) {
    tttState[index] = player;
    const cells = document.querySelectorAll('.cell');
    cells[index].innerText = player;
    cells[index].classList.add('taken', player.toLowerCase());
}

function aiThink() {
    if (!isGameActive) return;
    let available = tttState.map((v, i) => v === "" ? i : null).filter(v => v !== null);
    let move = available[Math.floor(Math.random() * available.length)];
    
    executeMove(move, aiPlayer);
    
    if (checkWinner(aiPlayer)) {
        endGame("AI Override: Link Severed.");
    }
}

function checkWinner(p) {
    const wins = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    return wins.some(cond => cond.every(idx => tttState[idx] === p));
}

function endGame(msg) {
    isGameActive = false;
    document.getElementById('game-status').innerText = msg;
}

function updateCredits(amt) {
    credits = parseInt(credits) + amt;
    localStorage.setItem('neuralCredits', credits);
    document.getElementById('neural-credits').innerText = credits;
}

function resetTTT() {
    tttState = ["", "", "", "", "", "", "", "", ""];
    isGameActive = true;
    document.getElementById('game-status').innerText = "Your Turn (X)";
    document.querySelectorAll('.cell').forEach(c => {
        c.innerText = "";
        c.className = "cell";
    });
}

// --- FIXING THE NAVIGATION FLOW ---
function setView(id, el) {
    // Hide all
    document.querySelectorAll('.view').forEach(v => v.style.display = 'none');
    // Show target
    document.getElementById(id).style.display = 'block';
    
    // Sidebar highlight
    document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
    if(el) el.classList.add('active');

    // Run specific logic per view
    if(id === 'game-view') resetTTT();
    if(id === 'mentor-view') displayMentors();
}


function resetTTT() {
    tttState = ["", "", "", "", "", "", "", "", ""];
    isGameActive = true;
    
    // Reset status and visuals
    const statusEl = document.getElementById('game-status');
    statusEl.innerText = "Your Turn (X)";
    statusEl.style.color = "white"; // Reset color if it changed on win/loss

    document.querySelectorAll('.cell').forEach(c => {
        c.innerText = "";
        c.className = "cell";
    });
}

function updateCredits(amt) {
    credits = parseInt(credits) + amt;
    localStorage.setItem('neuralCredits', credits);
    
    // Formats numbers to look like 0050 instead of 50
    document.getElementById('neural-credits').innerText = credits.toString().padStart(4, '0');
}

function resetTTT() {
    tttState = ["", "", "", "", "", "", "", "", ""];
    isGameActive = true;
    
    // Customized turn message
    const statusEl = document.getElementById('game-status');
    statusEl.innerText = "USER_TURN_PROMPT >";
    statusEl.style.color = "#fff";

    document.querySelectorAll('.cell').forEach(c => {
        c.innerText = "";
        c.className = "cell";
    });
}

function endGame(msg, color) {
    isGameActive = false;
    const statusEl = document.getElementById('game-status');
    statusEl.innerText = msg;
    statusEl.style.color = color;
}

// In your handleMove or checkWinner, use these strings:
// Win: endGame("LINK_SUCCESS // +50 NC", "#00f2ff");
// Loss: endGame("CORE_ERROR // LINK_SEVERED", "#ff0055");
// Draw: endGame("DATA_STASIS // NO_WINNER", "#aaa");



function displayMentors() {
    const container = document.getElementById('mentor-list'); // Ensure this ID exists in index.html
    if (!container) return;

    // Pull from the same key used in admin-logic.js
    const mentors = JSON.parse(localStorage.getItem('joboMentors')) || [];
    
    if (mentors.length === 0) {
        container.innerHTML = `
            <div class="glass-card" style="text-align:center; padding: 2rem;">
                <p>No Mentors are currently online. Check back shortly.</p>
            </div>`;
        return;
    }

    container.innerHTML = ""; // Clear existing
    mentors.forEach((m) => {
        const card = document.createElement('div');
        card.className = "mentor-card glass-card";
        card.innerHTML = `
            <div class="mentor-img" style="background-image: url('${m.img}')"></div>
            <div class="mentor-info">
                <h3>${m.name}</h3>
                <p class="specialty">${m.edu}</p>
                <button class="btn-shine small-btn" onclick="openBooking('${m.name}')">Request Session</button>
            </div>
        `;
        container.appendChild(card);
    });
}


function setView(id, el) {
    // 1. Hide all views
    document.querySelectorAll('.view').forEach(v => v.style.display = 'none');
    
    // 2. Show the target view
    const target = document.getElementById(id);
    if(target) target.style.display = 'block';

    // 3. Highlight the sidebar
    document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
    if(el) el.classList.add('active');

    // 4. THE FIX: If switching to mentors, load them!
    if(id === 'mentor-view') {
        displayMentors();
    }
}



let selectedMentorName = "";

// Open the Secure Form
function openBooking(mentorName) {
    selectedMentorName = mentorName;
    const form = document.getElementById('booking-form');
    const title = document.getElementById('booking-title');
    
    title.innerHTML = `<span style="color:var(--accent)">ENCRYPTED_UPLINK:</span><br>${mentorName}`;
    form.style.display = 'block';
    
    // Add a dark overlay to the background if you want
    document.body.style.overflow = 'hidden'; 
}

// Close the Form
function closeBooking() {
    document.getElementById('booking-form').style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Handle Submission
function submitRequest() {
    const problem = document.getElementById('problem-desc').value;
    const urgency = document.getElementById('urgency').value;
    const userName = document.getElementById('user-display').innerText;

    if (!problem) return alert("Please describe your challenge.");

    const requestData = {
        mentorName: selectedMentorName,
        userName: userName,
        problem: problem,
        priority: urgency,
        time: new Date().toLocaleTimeString()
    };

    // Save to localStorage for Admin to see
    let requests = JSON.parse(localStorage.getItem('mentorRequests')) || [];
    requests.push(requestData);
    localStorage.setItem('mentorRequests', JSON.stringify(requests));

    // Success Animation/Feedback
    alert("TRANSMISSION_SUCCESS: Your mentor has been notified.");
    closeBooking();
    document.getElementById('problem-desc').value = ""; // Clear form
}





// ==========================================
// NOVEL SYSTEM ENGINE
// ==========================================

const novels = {
    'dreamer': {
        title: "The Dreamer",
        description: "Amira's art is being mocked. Will she quit?",
        category: "PERSEVERANCE",
        color: "#ff00ff",
        xp: "+500 XP",
        startNode: 'start',
        nodes: {
            'start': { text: "Friends laugh at your art. 'Waste of time!' they say.", choices: [{ text: "Keep Drawing", nextNode: 'win' }, { text: "Quit", nextNode: 'lose' }] },
            'win': { text: "You became a pro! THE END.", choices: [] },
            'lose': { text: "You gave up on your talent. THE END.", choices: [] }
        }
    },
    'robot': {
        title: "Robot Failure",
        description: "Daniel's robot exploded. Now what?",
        category: "RESILIENCE",
        color: "#00f2ff",
        xp: "+600 XP",
        startNode: 'start',
        nodes: {
            'start': { text: "The robot is sparking on the floor. Judges are watching.", choices: [{ text: "Fix it", nextNode: 'win' }, { text: "Cry", nextNode: 'lose' }] },
            'win': { text: "You won the trophy! THE END.", choices: [] },
            'lose': { text: "You left in shame. THE END.", choices: [] }
        }
    }
};

function openNovel(storyKey) {
    const story = novels[storyKey];
    const modal = document.getElementById('novel-modal');
    const container = document.getElementById('novel-reader-content');

    if (!story || !modal) return;

    // Show the modal
    modal.style.display = 'flex';

    // Start the story at the 'start' node
    renderNode(storyKey, story.startNode);
}

function renderNode(storyKey, nodeKey) {
    const story = novels[storyKey];
    const node = story.nodes[nodeKey];
    const container = document.getElementById('novel-reader-content');

    if (!node || !container) {
        console.error("Missing node or container!");
        return;
    }

    // 1. Create the Title and Story Text
    let html = `
        <h2 style="color: var(--accent); margin-bottom: 10px;">${story.title}</h2>
        <hr style="border: 0; border-top: 1px solid rgba(255,255,255,0.1); margin-bottom: 20px;">
        <p class="terminal-text" style="font-size: 1.1rem; line-height: 1.6; margin-bottom: 30px;">
            ${node.text}
        </p>
    `;

    // 2. Create the Choice Buttons
    html += `<div class="choice-stack" style="display: flex; flex-direction: column; gap: 12px;">`;
    
    if (node.choices.length > 0) {
        node.choices.forEach(choice => {
            html += `
                <button class="btn-shine" onclick="renderNode('${storyKey}', '${choice.nextNode}')">
                    ${choice.text}
                </button>`;
        });
    } else {
        // If the story is over
        html += `
            <p style="color: #888; font-style: italic;">--- End of Simulation ---</p>
            <button class="btn-shine" onclick="closeNovel()" style="background: var(--primary);">
                RETURN TO LIBRARY
            </button>`;
    }

    html += `</div>`;

    // 3. Paste it into the modal
    container.innerHTML = html;
}
function closeNovel() {
    document.getElementById('novel-modal').style.display = 'none';
}

function renderNode(novelKey, nodeKey) {
    const node = novels[novelKey].nodes[nodeKey];
    const container = document.getElementById('reader-content');
    const title = document.getElementById('reader-title');
    
    if (!node) return;

    title.innerText = novels[novelKey].title;
    
    // Injecting the text and a new choice box
    container.innerHTML = `<p class="story-text animate-text" style="font-size: 1.2rem; line-height: 1.8; margin-bottom: 30px;">${node.text}</p>`;
    
    const choiceBox = document.createElement('div');
    choiceBox.className = "choice-container";
    choiceBox.style.display = "flex";
    choiceBox.style.flexDirection = "column";
    choiceBox.style.gap = "10px";
    
    node.choices.forEach(choice => {
        const btn = document.createElement('button');
        btn.className = "btn-shine small-btn";
        btn.style.width = "100%";
        btn.innerText = choice.text;
        btn.onclick = () => renderNode(novelKey, choice.next);
        choiceBox.appendChild(btn);
    });

    container.appendChild(choiceBox);
}

function closeNovel() {
    document.getElementById('novel-reader').style.display = 'none';
    document.body.style.overflow = 'auto';
}

function startCareerSim() {
    const interest = prompt("Identify interest sector (e.g., TECH, BIO, DESIGN):");
    if (interest) {
        // Utilizing your existing notification system style
        alert(`ACCESSING_ARCHIVES... Generating ${interest.toUpperCase()} career roadmap.`);
        console.log(`Career simulation started for: ${interest}`);
    }
}

function startCareerSim() {
    const btn = event.target;
    const originalText = btn.innerText;
    
    // Visual feedback
    btn.innerText = "BYPASSING FIREWALL...";
    btn.style.background = "#ff0055";
    
    setTimeout(() => {
        const choice = prompt("ENTER TARGET SECTOR: (e.g. CYBERSECURITY, DIGITAL_ART, NEUROSCIENCE)");
        if(choice) {
            notify(`UPLINK_ESTABLISHED: Mapping ${choice.toUpperCase()} trajectory...`);
            // Here you could later redirect or show a modal with results
        }
        btn.innerText = originalText;
        btn.style.background = "";
    }, 1200);
}

function updateProfilePicture(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('profile-display').innerHTML = `<img src="${e.target.result}">`;
            localStorage.setItem('userAvatar', e.target.result);
            notify("IMAGE_UPLOADED: Identity confirmed.");
        };
        reader.readAsDataURL(input.files[0]);
    }
}

function saveFullProfile() {
    const story = document.getElementById('life-story-input').value;
    const bio = document.getElementById('user-bio').value;
    const loc = document.getElementById('user-location').value;

    const profileData = { story, bio, loc };
    localStorage.setItem('userProfileData', JSON.stringify(profileData));
    
    notify("DATA_SYNCED: Profile archive updated.");
}

// Update the launchPlatform to also fill in the profile name
const originalLaunch = launchPlatform;
launchPlatform = function() {
    originalLaunch();
    const name = document.getElementById('reg-name').value;
    document.getElementById('display-name-profile').innerText = name.toUpperCase();
    
    // Load existing data
    const saved = JSON.parse(localStorage.getItem('userProfileData'));
    if(saved) {
        document.getElementById('life-story-input').value = saved.story || "";
        document.getElementById('user-bio').value = saved.bio || "";
        document.getElementById('user-location').value = saved.loc || "";
    }
    const avatar = localStorage.getItem('userAvatar');
    if(avatar) document.getElementById('profile-display').innerHTML = `<img src="${avatar}">`;
};

function saveFullProfile() {
    const btn = event.target;
    const originalText = btn.innerHTML;
    
    // Change button to "Uploading" state
    btn.innerHTML = "UPLOADING DATA...";
    btn.style.opacity = "0.7";

    const story = document.getElementById('life-story-input').value;
    const bio = document.getElementById('user-bio').value;
    const loc = document.getElementById('user-location').value;

    const profileData = { story, bio, loc };
    localStorage.setItem('userProfileData', JSON.stringify(profileData));
    
    // Artificial delay for "Coolness"
    setTimeout(() => {
        btn.innerHTML = "DATA ARCHIVED ✓";
        btn.style.color = "#00ff88"; // Success green
        
        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.style.color = "";
            btn.style.opacity = "1";
        }, 2000);
        
        notify("PROFILE_SYNC: Archive successfully updated.");
    }, 800);
}

function renderMindLibrary() {
    console.log("Attempting to render library..."); // Check your console for this!
    const grid = document.querySelector('.novel-grid');
    
    if (!grid) {
        console.error("HTML Error: .novel-grid not found!");
        return;
    }
    
    grid.innerHTML = ""; 

    Object.keys(novels).forEach(key => {
        const story = novels[key];
        const card = document.createElement('div');
        card.className = "glass-card novel-card";
        card.style.borderTop = `4px solid ${story.color}`;
        
        card.innerHTML = `
            <div class="novel-info">
                <span class="status-chip" style="color:${story.color}">${story.category}</span>
                <h3 style="margin:10px 0">${story.title}</h3>
                <p style="font-size:0.8rem; color:#bbb; margin-bottom:15px">${story.description}</p>
                <button class="btn-shine small-btn" onclick="openNovel('${key}')">START STORY</button>
            </div>
        `;
        grid.appendChild(card);
    });
    console.log("Library Render Complete.");
}

// This forces the library to render as soon as the script loads
document.addEventListener('DOMContentLoaded', () => {
    if (typeof novels !== 'undefined') {
        renderMindLibrary();
    }
});

// This runs the moment the page loads
window.onload = () => {
    renderMindLibrary();
};
document.querySelectorAll('.read-more-btn').forEach(button => {
    button.addEventListener('click', (e) => {
        // Prevent the card from flipping back when clicking the button
        e.stopPropagation(); 
        
        const storyTitle = button.parentElement.querySelector('h4').innerText;
        const storyText = button.parentElement.querySelector('p').innerText;
        
        alert(`ACCESSING ARCHIVE: ${storyTitle}\n\n${storyText}\n\nRemember: Your choices define your journey.`);
    });
});

function openStory(title, category, fullText) {
    document.getElementById('reader-title').innerText = title;
    document.getElementById('reader-category').innerText = category;
    document.getElementById('reader-text').innerText = fullText;
    
    document.getElementById('story-reader-overlay').style.display = 'flex';
    document.getElementById('comment-list').innerHTML = ""; // Reset comments for new story
}

function closeStory() {
    document.getElementById('story-reader-overlay').style.display = 'none';
}

function postComment() {
    const input = document.getElementById('comment-input');
    if(input.value.trim() === "") return;
    
    const list = document.getElementById('comment-list');
    const newComment = document.createElement('div');
    newComment.style.marginBottom = "10px";
    newComment.innerHTML = `<b style="color:var(--accent)">YOU:</b> ${input.value}`;
    list.prepend(newComment);
    input.value = "";
}

function rate(stars) {
    notify(`Rating of ${stars} stars saved to neural link.`);
}

function openStoryFromCard(button) {
    // 1. Find the card this button belongs to
    const cardBack = button.parentElement;
    
    // 2. Grab the info from the HTML elements
    const title = cardBack.querySelector('h4').innerText;
    const category = cardBack.parentElement.querySelector('.badge').innerText;
    const fullText = cardBack.querySelector('.full-story-metadata').innerHTML;

    // 3. Send it to the Reader Modal
    document.getElementById('reader-title').innerText = title;
    document.getElementById('reader-category').innerText = category;
    document.getElementById('reader-text').innerHTML = fullText;
    
    // 4. Show the Modal
    document.getElementById('story-reader-overlay').style.display = 'flex';
}

function openGame(gameUrl) {
    const modal = document.getElementById('game-modal');
    const frame = document.getElementById('game-frame');
    
    if (modal && frame) {
        frame.src = gameUrl; // This must match the filename exactly, e.g., 'chess.html'
        modal.style.display = 'flex';
    } else {
        console.error("Error: Modal or Frame not found in index.html");
    }
}

// Dynamic Content Arrays
const dailyContent = {
    motivations: [
        "Your potential is endless. Go do what you were created to do.",
        "Small progress is still progress. Keep moving!",
        "You don't have to be perfect to be amazing."
    ],
    tips: [
        "The Feynman Technique: Teach what you learned to someone else to master it.",
        "Eat the Frog: Do your hardest task first thing in the morning.",
        "Hydration check! Your brain is 75% water."
    ]
};

// 1. Daily Boost Logic (Rotates based on Date)
function updateDailyBoost() {
    const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
    const index = dayOfYear % dailyContent.motivations.length;
    
    document.getElementById('daily-motivation').innerText = dailyContent.motivations[index];
    document.getElementById('daily-tip').innerText = "💡 Tip of the day: " + dailyContent.tips[index];
}

// 2. Tabbed Interface for Subjects
function showEduTab(subject) {
    const content = {
        math: "<b>Math Trick:</b> To multiply any 2-digit number by 11, add the two digits and put the sum in the middle! (e.g., 24 x 11 = 2[2+4]4 = 264).",
        science: "<b>Science Shortcut:</b> Remember the order of planets with: 'My Very Educated Mother Just Served Us Noodles'.",
        writing: "<b>Writing Tip:</b> Use the 'Show, Don't Tell' rule. Instead of saying 'He was nervous', say 'His hands were shaking'."
    };
    document.getElementById('edu-tab-content').innerHTML = content[subject];
}

// 3. Pomodoro Timer
let timer;
let timeLeft = 1500; // 25 minutes
function startPomodoro() {
    if (timer) clearInterval(timer);
    timer = setInterval(() => {
        if (timeLeft <= 0) {
            clearInterval(timer);
            alert("Break time! You did great.");
            return;
        }
        timeLeft--;
        const mins = Math.floor(timeLeft / 60);
        const secs = timeLeft % 60;
        document.getElementById('timer-display').innerText = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }, 1000);
}

// Initialize on Load
window.addEventListener('DOMContentLoaded', () => {
    updateDailyBoost();
    showEduTab('math');
});

// --- Education Hub Content ---
const eduData = {
    tabs: {
        math: "<b>TRICK:</b> To square a number ending in 5 (e.g. 35), multiply the first digit by the next number (3x4=12) and add 25 at the end. Result: 1225.",
        science: "<b>MNEMONIC:</b> 'Dear King Philip Came Over For Good Soup' (Domain, Kingdom, Phylum, Class, Order, Family, Genus, Species).",
        writing: "<b>STYLE:</b> Eliminate 'filler' words like 'very', 'really', and 'just' to increase the impact of your arguments by 40%."
    },
    skills: {
        'Focus': "<b>Pomodoro:</b> Work for 25 mins, break for 5. It prevents neural fatigue and keeps dopamine levels steady.",
        'Memory': "<b>Spaced Repetition:</b> Review info at 1 day, 7 days, and 30 days to move it from short-term to long-term memory.",
        'Notes': "<b>Active Recall:</b> Instead of re-reading, close the book and write down everything you remember. This strengthens neural pathways."
    }
};

function showEduTab(subject, btn) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('edu-tab-content').innerHTML = eduData.tabs[subject];
}

function openEduModal(skill) {
    // Reusing your existing story-reader-overlay for consistency
    const overlay = document.getElementById('story-reader-overlay');
    document.getElementById('reader-title').innerText = skill + " Module";
    document.getElementById('reader-text').innerHTML = eduData.skills[skill];
    overlay.style.display = 'flex';
}

// Timer Logic
let ptimer;
let pTimeLeft = 1500;
function startPomodoro() {
    clearInterval(ptimer);
    ptimer = setInterval(() => {
        pTimeLeft--;
        const mins = Math.floor(pTimeLeft / 60);
        const secs = pTimeLeft % 60;
        document.getElementById('timer-display').innerText = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
        if (pTimeLeft <= 0) {
            clearInterval(ptimer);
            notify("Focus Session Complete. Take a break!");
        }
    }, 1000);
}

function resetPomodoro() {
    clearInterval(ptimer);
    pTimeLeft = 1500;
    document.getElementById('timer-display').innerText = "25:00";
}

// Initial Load
document.addEventListener('DOMContentLoaded', () => {
    updateDailyBoost(); // Use your existing daily logic
    showEduTab('math', document.querySelector('.tab-btn'));
});



// ==========================================
// MENTOR HUB: SOCIAL FEED SYSTEM
// ==========================================

/**
 * Renders the Mentors Hub as a Social Media Feed
 * This should be triggered whenever 'mentors-hub' view is opened.
 */
function renderMentors() {
    const feedContainer = document.getElementById('mentor-social-feed');
    if (!feedContainer) return;
    
    // Fetch mentors from the same storage used by admin.html
    const mentors = JSON.parse(localStorage.getItem('joboMentors')) || [];
    
    // Clear current feed
    feedContainer.innerHTML = ""; 

    if (mentors.length === 0) {
        feedContainer.innerHTML = `
            <div class="feed-post" style="border: 1px dashed var(--primary); text-align: center;">
                <div class="post-content">
                    <p style="color: #666; padding: 40px;">
                        <span style="display:block; font-size: 2rem; margin-bottom: 10px;">📡</span>
                        No active mentors found in the neural network.<br>
                        Add mentors via the Admin Portal to populate this feed.
                    </p>
                </div>
            </div>`;
        return;
    }

    // Generate Social Posts for each Mentor
    mentors.forEach((m, index) => {
        const post = document.createElement('div');
        post.className = "feed-post mentor-card-glow animate-fadeIn";
        post.style.animationDelay = `${index * 0.1}s`;
        
        post.innerHTML = `
            <div class="post-header">
                <div class="post-author">
                    <div class="mentor-avatar" style="background-image: url('${m.img || 'https://via.placeholder.com/50'}')"></div>
                    <div class="author-info">
                        <span class="mentor-name">${m.name}</span>
                        <span class="mentor-meta">${m.edu} • Verified Expert</span>
                    </div>
                </div>
                <button class="follow-btn" onclick="this.innerText='FOLLOWED'; this.style.color='var(--accent)'">FOLLOW</button>
            </div>
            
            <div class="post-content">
                <p>Hello Network! I'm specializing in <b>${m.edu}</b>. If you're looking to optimize your skills or need a project review, feel free to reach out. I'm currently accepting new students for 1-on-1 guidance.</p>
                <div class="post-tags">
                    <span class="tag">#${m.edu.replace(/\s+/g, '')}</span>
                    <span class="tag">#CareerGrowth</span>
                    <span class="tag">#Mentorship</span>
                </div>
            </div>

            <div class="post-actions">
                <button class="action-btn neon-btn-small" onclick="initiateMentorChat('${m.name}')">
                    <span class="btn-icon">💬</span> INITIATE_CHAT
                </button>
                <button class="action-btn" onclick="toggleLike(this)">❤️ <span class="count">24</span></button>
                <button class="action-btn">🔖 SAVE</button>
            </div>
        `;
        feedContainer.appendChild(post);
    });
}

/**
 * Handles the "Like" interaction
 */
function toggleLike(btn) {
    const countSpan = btn.querySelector('.count');
    let count = parseInt(countSpan.innerText);
    if (!btn.classList.contains('liked')) {
        btn.classList.add('liked');
        btn.style.color = "var(--primary)";
        countSpan.innerText = count + 1;
    } else {
        btn.classList.remove('liked');
        btn.style.color = "#888";
        countSpan.innerText = count - 1;
    }
}

/**
 * Handles the transition to a chat interface
 */
function initiateMentorChat(name) {
    notify(`Establishing secure link to ${name}...`);
    // Here you can redirect to a chat view or open a modal
    setTimeout(() => {
        alert(`Request sent to ${name}. They will respond to your dashboard soon.`);
    }, 1000);
}

// Update your main setView function logic
// Look for where your 'setView' function is and ensure it calls renderMentors()
const originalSetView = setView; 
setView = function(viewId) {
    originalSetView(viewId); // Run the existing code
    if (viewId === 'mentors-hub') {
        renderMentors();
    }
};

// --- MENTOR CHAT SYSTEM ---

function initiateMentorChat(mentorName) {
    const overlay = document.getElementById('story-reader-overlay');
    const readerTitle = document.getElementById('reader-title');
    const readerText = document.getElementById('reader-text');
    
    if (!overlay) return;

    // Set up the Chat Interface
    readerTitle.innerText = `DIRECT_LINK: ${mentorName}`;
    readerText.innerHTML = `
        <div id="chat-history" style="height: 300px; overflow-y: auto; background: rgba(0,0,0,0.3); padding: 15px; border-radius: 10px; margin-bottom: 15px; border: 1px solid var(--primary);">
            <div class="msg" style="color: var(--accent); margin-bottom: 10px;"><b>${mentorName}:</b> Connection established. How can I assist with your trajectory today?</div>
        </div>
        <div style="display: flex; gap: 10px;">
            <input type="text" id="user-msg-input" placeholder="Type your transmission..." style="flex: 1; background: #000; border: 1px solid var(--accent); color: white; padding: 10px; border-radius: 5px;">
            <button class="btn-shine small-btn" onclick="sendToMentor('${mentorName}')">SEND</button>
        </div>
    `;
    
    overlay.style.display = 'flex';
}

function sendToMentor(mentorName) {
    const input = document.getElementById('user-msg-input');
    const history = document.getElementById('chat-history');
    
    if (!input.value.trim()) return;

    // 1. Show User Message
    const userMsg = document.createElement('div');
    userMsg.style.marginBottom = "10px";
    userMsg.innerHTML = `<b style="color: #fff;">YOU:</b> ${input.value}`;
    history.appendChild(userMsg);

    const userText = input.value;
    input.value = "";
    history.scrollTop = history.scrollHeight;

    // 2. Simulated Mentor "Neural" Reply
    setTimeout(() => {
        const reply = document.createElement('div');
        reply.style.marginBottom = "10px";
        reply.style.color = "var(--accent)";
        
        // Basic AI Logic for reply
        let response = "I've received your data. Let's analyze this further.";
        if (userText.toLowerCase().includes("hello")) response = "Greetings. Neural links are stable.";
        if (userText.toLowerCase().includes("help")) response = "Acknowledged. Specify the module or project you're struggling with.";
        
        reply.innerHTML = `<b>${mentorName}:</b> ${response}`;
        history.appendChild(reply);
        history.scrollTop = history.scrollHeight;
        
        // Notify the user
        notify("Incoming Transmission...");
    }, 1500);
}

// 1. Unified Render Function (The "Engine")
// This handles both the initial showing and the filtering
function renderMentors(filterCategory = 'all') {
    const feed = document.getElementById('mentor-social-feed');
    if (!feed) return;
    
    // Get the data
    const allMentors = JSON.parse(localStorage.getItem('joboMentors')) || [];
    
    // Clear the current view
    feed.innerHTML = "";

    // Apply Filter Logic
    const filteredMentors = filterCategory === 'all' 
        ? allMentors 
        : allMentors.filter(m => m.category === filterCategory);

    if (filteredMentors.length === 0) {
        feed.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: #666; padding: 50px;">
            No experts found in the ${filterCategory} sector.
        </p>`;
        return;
    }

    // Draw the Instagram-style Cards
    filteredMentors.forEach(m => {
        const card = document.createElement('div');
        card.className = "mentor-social-card animate-fadeIn";
        
        // High-quality fallback image
        const bgImg = m.img || 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&w=1000&q=80';
        
        card.innerHTML = `
            <div class="card-image-bg" style="background-image: url('${bgImg}')"></div>
            <div class="card-info-overlay">
                <div class="mentor-name-tag">
                    @${m.name.replace(/\s+/g, '_').toLowerCase()} <span class="verified-check">✓</span>
                </div>
                <p style="font-size: 0.8rem; opacity: 0.8; margin: 5px 0;">${m.edu}</p>
                <div style="display: flex; gap: 10px; margin-top: 10px;">
                    <button class="btn-shine small-btn" style="padding: 5px 15px;" onclick="initiateMentorChat('${m.name}')">MESSAGE</button>
                    <button class="action-btn" onclick="this.style.color='var(--primary)'">❤️</button>
                </div>
            </div>
        `;
        feed.appendChild(card);
    });
}

// 2. Updated Filter Function (The "Trigger")
function filterMentors(cat) {
    // Run the render engine with the chosen category
    renderMentors(cat);
    
    // Update the visual "active" state of the story circles
    document.querySelectorAll('.story-circle').forEach(el => {
        el.classList.remove('active-story');
        // Match the text inside the span to the category
        if (el.innerText.toLowerCase().includes(cat.toLowerCase()) || (cat === 'all' && el.innerText.toLowerCase() === 'all')) {
            el.classList.add('active-story');
        }
    });

    notify(`Filtering network: ${cat.toUpperCase()}`);
}

// --- GLOBAL SIGNAL RECEIVER ---

// --- NOTIFICATION ARCHIVE SYSTEM ---

function listenForBroadcasts() {
    setInterval(() => {
        const signal = localStorage.getItem('jobo_global_alert');
        if (signal) {
            const data = JSON.parse(signal);
            const lastSeenId = localStorage.getItem('jobo_last_signal_id');

            if (data.id != lastSeenId) {
                // 1. Save to History
                saveToNotificationHistory(data);
                // 2. Show Popup
                displayGlobalNotification(data);
                // 3. Show Red Dot on Bell
                document.getElementById('nav-notif-dot').style.display = 'block';
                
                localStorage.setItem('jobo_last_signal_id', data.id);
            }
        }
    }, 3000);
}

function saveToNotificationHistory(data) {
    let history = JSON.parse(localStorage.getItem('jobo_notification_history')) || [];
    // Add to the beginning of the array (newest first)
    history.unshift(data);
    // Keep only the last 20 notifications
    if (history.length > 20) history.pop();
    localStorage.setItem('jobo_notification_history', JSON.stringify(history));
}

function renderNotifications() {
    const list = document.getElementById('notifications-list');
    const emptyMsg = document.getElementById('empty-notifications');
    const history = JSON.parse(localStorage.getItem('jobo_notification_history')) || [];

    if (history.length === 0) {
        emptyMsg.style.display = 'block';
        list.innerHTML = "";
        return;
    }

    emptyMsg.style.display = 'none';
    list.innerHTML = history.map(item => `
        <div class="signal-card">
            <div class="signal-icon-box">${item.style === 'emergency' ? '🚨' : '📡'}</div>
            <div class="signal-content">
                <h4 style="color: ${getPriorityColor(item.style)}">${item.style}_OVERRIDE</h4>
                <div class="signal-text">${item.message}</div>
                <div class="signal-date">${new Date(item.id).toLocaleString()}</div>
            </div>
        </div>
    `).join('');

    // Hide the red dot when they view notifications
    document.getElementById('nav-notif-dot').style.display = 'none';
}

function getPriorityColor(style) {
    if (style === 'urgent') return 'var(--primary)';
    if (style === 'emergency') return '#ff4757';
    return 'var(--accent)';
}

// Update setView to trigger the render
const prevSetView = setView;
setView = function(viewId) {
    if (typeof prevSetView === 'function') prevSetView(viewId);
    if (viewId === 'notifications-view') renderNotifications();
};

// Initial call
listenForBroadcasts();

function displayGlobalNotification(data) {
    // Create a high-aesthetic notification toast
    const toast = document.createElement('div');
    toast.className = `broadcast-toast ${data.style}`; // Styles: info, urgent, emergency
    
    toast.innerHTML = `
        <div class="toast-icon">📡</div>
        <div class="toast-body">
            <div class="toast-header">INCOMING_TRANSMISSION</div>
            <div class="toast-msg">${data.message}</div>
            <div class="toast-time">${data.timestamp}</div>
        </div>
        <button class="toast-close" onclick="this.parentElement.remove()">✕</button>
    `;

    document.body.appendChild(toast);

    // Auto-remove after 10 seconds if not closed
    setTimeout(() => {
        if(toast) toast.classList.add('fade-out');
        setTimeout(() => toast.remove(), 500);
    }, 10000);
}

// Start listening when the app launches
// --- NOTIFICATION ARCHIVE SYSTEM ---

function listenForBroadcasts() {
    setInterval(() => {
        const signal = localStorage.getItem('jobo_global_alert');
        if (signal) {
            const data = JSON.parse(signal);
            const lastSeenId = localStorage.getItem('jobo_last_signal_id');

            if (data.id != lastSeenId) {
                // 1. Save to History
                saveToNotificationHistory(data);
                // 2. Show Popup
                displayGlobalNotification(data);
                // 3. Show Red Dot on Bell
                document.getElementById('nav-notif-dot').style.display = 'block';
                
                localStorage.setItem('jobo_last_signal_id', data.id);
            }
        }
    }, 3000);
}

function saveToNotificationHistory(data) {
    let history = JSON.parse(localStorage.getItem('jobo_notification_history')) || [];
    // Add to the beginning of the array (newest first)
    history.unshift(data);
    // Keep only the last 20 notifications
    if (history.length > 20) history.pop();
    localStorage.setItem('jobo_notification_history', JSON.stringify(history));
}

function renderNotifications() {
    const list = document.getElementById('notifications-list');
    const emptyMsg = document.getElementById('empty-notifications');
    const history = JSON.parse(localStorage.getItem('jobo_notification_history')) || [];

    if (history.length === 0) {
        emptyMsg.style.display = 'block';
        list.innerHTML = "";
        return;
    }

    emptyMsg.style.display = 'none';
    list.innerHTML = history.map(item => `
        <div class="signal-card">
            <div class="signal-icon-box">${item.style === 'emergency' ? '🚨' : '📡'}</div>
            <div class="signal-content">
                <h4 style="color: ${getPriorityColor(item.style)}">${item.style}_OVERRIDE</h4>
                <div class="signal-text">${item.message}</div>
                <div class="signal-date">${new Date(item.id).toLocaleString()}</div>
            </div>
        </div>
    `).join('');

    // Hide the red dot when they view notifications
    document.getElementById('nav-notif-dot').style.display = 'none';
}

function getPriorityColor(style) {
    if (style === 'urgent') return 'var(--primary)';
    if (style === 'emergency') return '#ff4757';
    return 'var(--accent)';
}

// SAFER NAVIGATION INTEGRATION
function setView(viewId) {
    // 1. Hide all views
    document.querySelectorAll('.view').forEach(v => {
        v.style.display = 'none';
        v.classList.remove('active-view');
    });
    
    // 2. Show the target view
    const target = document.getElementById(viewId);
    if(target) {
        target.style.display = 'block';
        target.classList.add('active-view');
    }

    // 3. Update Sidebar Active State
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });

    // 4. Trigger Specific Page Renders
    if (viewId === 'notifications-view') renderNotifications();
    if (viewId === 'mentors-hub') renderMentors();
}

// Initial call
listenForBroadcasts();
// Add this inside your launchPlatform() function
function syncTopBar() {
    const name = document.getElementById('reg-name').value;
    const topName = document.getElementById('user-display-top');
    if(topName) topName.innerText = name;
    
    // Check if an avatar is already saved in memory
    const savedAvatar = localStorage.getItem('user_avatar_main');
    if(savedAvatar) {
        document.getElementById('top-right-avatar').style.backgroundImage = `url(${savedAvatar})`;
    }
}

// Update the Profile Picture handler
function updateProfilePicture(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const dataUrl = e.target.result;
            
            // 1. Update the Main Profile Page
            const profileDisplay = document.getElementById('profile-display');
            if(profileDisplay) {
                profileDisplay.style.backgroundImage = `url(${dataUrl})`;
                profileDisplay.innerHTML = ''; 
            }

            // 2. Update the Top Right Shortcut
            const topAvatar = document.getElementById('top-right-avatar');
            if(topAvatar) {
                topAvatar.style.backgroundImage = `url(${dataUrl})`;
            }

            // 3. Save to Local Storage
            localStorage.setItem('user_avatar_main', dataUrl);
        };
        reader.readAsDataURL(input.files[0]);
    }
}

// Handles Profile Picture & Syncs with Top Bar
function updateProfilePicture(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const dataUrl = e.target.result;
            
            // 1. Update Profile Page Circle
            const profileDisplay = document.getElementById('profile-display');
            if(profileDisplay) {
                profileDisplay.style.backgroundImage = `url(${dataUrl})`;
                profileDisplay.innerText = ""; // Clear the "Upload" text
            }

            // 2. Update Top Right Avatar (Small circle)
            const topAvatar = document.getElementById('top-right-avatar');
            if(topAvatar) topAvatar.style.backgroundImage = `url(${dataUrl})`;

            // 3. Save to memory
            localStorage.setItem('user_avatar', dataUrl);
        };
        reader.readAsDataURL(input.files[0]);
    }
}

// Saves Bio to LocalStorage
function saveProfile() {
    const bio = document.getElementById('profile-bio').value;
    localStorage.setItem('user_bio', bio);
    
    // Feedback effect
    const btn = document.querySelector('.save-btn');
    btn.innerText = "SYNCED ✓";
    btn.style.background = "#00ff00";
    setTimeout(() => {
        btn.innerText = "SYNC CHANGES";
        btn.style.background = "";
    }, 2000);
}

// Load profile data on startup
window.addEventListener('load', () => {
    const savedBio = localStorage.getItem('user_bio');
    if(savedBio) document.getElementById('profile-bio').value = savedBio;
    
    const savedImg = localStorage.getItem('user_avatar');
    if(savedImg) {
        document.getElementById('profile-display').style.backgroundImage = `url(${savedImg})`;
        document.getElementById('profile-display').innerText = "";
    }
});

window.addEventListener('DOMContentLoaded', () => {
    // Change the placeholder text to be cuter
    const uploadText = document.getElementById('profile-display');
    if (uploadText && uploadText.innerText === "UPLOAD PHOTO") {
        uploadText.innerText = "Click to Sparkle ✨";
        uploadText.style.fontSize = "0.8rem";
        uploadText.style.fontWeight = "bold";
    }

    // Add a cute greeting in the console (for fun)
    console.log("%c ✨ Neural System Initialized... Stay Cute! ✨", "color: #ff9ecd; font-size: 20px; font-weight: bold;");
    
    // Smoothly round the profile names if they are empty
    const userDisplay = document.getElementById('user-display');
    if (userDisplay && userDisplay.innerText === "Agent Name") {
        userDisplay.innerText = "New Star ✨";
    }
});