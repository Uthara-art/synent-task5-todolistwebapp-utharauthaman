document.addEventListener('DOMContentLoaded', () => {
    // State
    let tasks = [];
    let currentFilter = 'all';
    let currentSearch = '';

    // DOM Elements
    const taskInput = document.getElementById('task-input');
    const priorityInput = document.getElementById('priority-input');
    const dateInput = document.getElementById('date-input');
    const addBtn = document.getElementById('add-btn');
    const taskList = document.getElementById('task-list');
    const emptyState = document.getElementById('empty-state');
    const searchInput = document.getElementById('search-input');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const themeToggleBtn = document.getElementById('theme-toggle');
    const modeToggleBtn = document.getElementById('mode-toggle');
    const appSubtitle = document.getElementById('app-subtitle');

    // Initialization
    loadTheme();
    loadAppMode();
    loadTasks();

    // Stats Elements
    const statTotal = document.querySelector('#stat-total .stat-number');
    const statCompleted = document.querySelector('#stat-completed .stat-number');
    const statPending = document.querySelector('#stat-pending .stat-number');

    // Default Date to Today
    dateInput.valueAsDate = new Date();

    // Event Listeners
    addBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTask();
    });

    searchInput.addEventListener('input', (e) => {
        currentSearch = e.target.value.toLowerCase();
        renderTasks();
    });

    filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            filterBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentFilter = e.target.dataset.filter;
            renderTasks();
        });
    });

    // Theme logic
    function loadTheme() {
        const savedTheme = localStorage.getItem('taskMasterTheme');
        if (savedTheme === 'light') {
            document.body.classList.add('light-theme');
            if (themeToggleBtn) themeToggleBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';
        } else {
            document.body.classList.remove('light-theme');
            if (themeToggleBtn) themeToggleBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
        }
    }

    function toggleTheme() {
        document.body.classList.toggle('light-theme');
        const isLight = document.body.classList.contains('light-theme');
        
        if (isLight) {
            localStorage.setItem('taskMasterTheme', 'light');
            themeToggleBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';
        } else {
            localStorage.setItem('taskMasterTheme', 'dark');
            themeToggleBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
        }
    }

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', toggleTheme);
    }

    // Subtitle Quote logic
    const adultQuotes = [
        "\"Focus on being productive instead of busy.\" – Tim Ferriss",
        "\"The secret of getting ahead is getting started.\" – Mark Twain",
        "\"Nothing is less productive than to make more efficient what should not be done at all.\" – Peter Drucker",
        "\"It’s not always that we need to do more but rather that we need to focus on less.\" – Nathan W. Morris",
        "\"Amateurs sit and wait for inspiration, the rest of us just get up and go to work.\" – Stephen King",
        "\"Action is the foundational key to all success.\" – Pablo Picasso",
        "\"Either you run the day or the day runs you.\" – Jim Rohn"
    ];

    function updateSubtitle() {
        if (!appSubtitle) return;
        
        const isKids = document.body.classList.contains('kids-mode');
        appSubtitle.style.opacity = 0;
        
        setTimeout(() => {
            if (isKids) {
                appSubtitle.innerText = "Let's have fun organizing our tasks! 🎈";
            } else {
                const randomQuote = adultQuotes[Math.floor(Math.random() * adultQuotes.length)];
                appSubtitle.innerText = randomQuote;
            }
            appSubtitle.style.opacity = 1;
        }, 300);
    }

    // App Mode logic
    function loadAppMode() {
        const savedMode = localStorage.getItem('taskMasterAppMode');
        if (savedMode === 'kids') {
            document.body.classList.add('kids-mode');
            if (modeToggleBtn) modeToggleBtn.innerHTML = '<i class="fa-solid fa-user-tie"></i>';
        } else {
            document.body.classList.remove('kids-mode');
            if (modeToggleBtn) modeToggleBtn.innerHTML = '<i class="fa-solid fa-child"></i>';
        }
        updateSubtitle();
    }

    function toggleAppMode() {
        document.body.classList.toggle('kids-mode');
        const isKids = document.body.classList.contains('kids-mode');
        
        if (isKids) {
            localStorage.setItem('taskMasterAppMode', 'kids');
            modeToggleBtn.innerHTML = '<i class="fa-solid fa-user-tie"></i>';
        } else {
            localStorage.setItem('taskMasterAppMode', 'adult');
            modeToggleBtn.innerHTML = '<i class="fa-solid fa-child"></i>';
        }

        // Reload tasks for the new mode
        loadTasks();
        updateStats();
        renderTasks();
        updateSubtitle();
    }

    if (modeToggleBtn) {
        modeToggleBtn.addEventListener('click', toggleAppMode);
    }

    // Core Functions
    
    /**
     * Saves the current tasks array to localStorage.
     * This function serializes the tasks array to a JSON string and saves it.
     */
    function getStorageKey() {
        return document.body.classList.contains('kids-mode') ? 'taskMasterTasks_kids' : 'taskMasterTasks';
    }

    function saveTasks() {
        localStorage.setItem(getStorageKey(), JSON.stringify(tasks));
    }

    /**
     * Loads tasks from localStorage and updates the tasks array.
     * It parses the saved JSON string back into an array of task objects.
     */
    function loadTasks() {
        const savedTasks = localStorage.getItem(getStorageKey());
        if (savedTasks) {
            tasks = JSON.parse(savedTasks);
        } else {
            tasks = [];
        }
    }

    function addTask() {
        const text = taskInput.value.trim();
        if (!text) {
            alert('Please enter a task description.');
            return;
        }

        const newTask = {
            id: Date.now().toString(),
            text: text,
            priority: priorityInput.value,
            date: dateInput.value,
            completed: false,
            createdAt: new Date()
        };

        tasks.unshift(newTask); // Add to beginning
        saveTasks(); // Save tasks whenever a task is added
        
        // Reset input
        taskInput.value = '';
        taskInput.focus();

        updateStats();
        renderTasks();
    }

    function toggleTask(id) {
        let justCompleted = false;
        
        tasks = tasks.map(task => {
            if (task.id === id) {
                const newStatus = !task.completed;
                if (newStatus) justCompleted = true;
                return { ...task, completed: newStatus };
            }
            return task;
        });
        
        saveTasks(); // Save tasks whenever a task is marked as completed or incomplete
        updateStats();
        renderTasks();

        if (justCompleted && document.body.classList.contains('kids-mode')) {
            triggerCelebration();
        }
    }

    function triggerCelebration() {
        const container = document.getElementById('celebration-container');
        if (!container) return;

        const messages = ['Great job!', 'You did it!', 'Awesome!', 'Super star!', 'Way to go!'];
        const randomMsg = messages[Math.floor(Math.random() * messages.length)];

        const celebDiv = document.createElement('div');
        celebDiv.className = 'celebration-message';
        celebDiv.innerHTML = `<i class="fa-solid fa-star"></i> <span>${randomMsg}</span> <i class="fa-solid fa-star"></i>`;
        
        container.appendChild(celebDiv);

        setTimeout(() => {
            if (container.contains(celebDiv)) {
                container.removeChild(celebDiv);
            }
        }, 2000);
    }

    function deleteTask(id, element) {
        // Animate out
        element.style.animation = 'slideOut 0.3s ease forwards';
        
        setTimeout(() => {
            tasks = tasks.filter(task => task.id !== id);
            saveTasks(); // Save tasks whenever a task is deleted
            updateStats();
            renderTasks();
        }, 300);
    }

    function getFilteredTasks() {
        return tasks.filter(task => {
            const matchesSearch = task.text.toLowerCase().includes(currentSearch);
            const matchesFilter = 
                currentFilter === 'all' ? true :
                currentFilter === 'completed' ? task.completed :
                !task.completed;
            
            return matchesSearch && matchesFilter;
        });
    }

    function updateStats() {
        const total = tasks.length;
        const completed = tasks.filter(t => t.completed).length;
        const pending = total - completed;

        animateValue(statTotal, parseInt(statTotal.innerText), total, 300);
        animateValue(statCompleted, parseInt(statCompleted.innerText), completed, 300);
        animateValue(statPending, parseInt(statPending.innerText), pending, 300);
    }

    function animateValue(obj, start, end, duration) {
        if (start === end) return;
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            obj.innerHTML = Math.floor(progress * (end - start) + start);
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
        
        // Add a little pop effect
        obj.style.transform = 'scale(1.2)';
        obj.style.color = 'var(--accent-color)';
        setTimeout(() => {
            obj.style.transform = 'scale(1)';
            obj.style.color = '';
        }, 150);
    }

    function renderTasks() {
        const filteredTasks = getFilteredTasks();
        taskList.innerHTML = '';

        if (filteredTasks.length === 0) {
            emptyState.classList.add('visible');
        } else {
            emptyState.classList.remove('visible');
            
            filteredTasks.forEach(task => {
                const li = document.createElement('li');
                li.className = `task-item ${task.completed ? 'completed' : ''}`;
                li.dataset.priority = task.priority;
                li.dataset.id = task.id;

                const dateObj = new Date(task.date);
                const dateString = isNaN(dateObj.getTime()) ? 'No Date' : dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

                li.innerHTML = `
                    <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
                    <div class="task-content">
                        <span class="task-text">${escapeHTML(task.text)}</span>
                        <div class="task-meta">
                            <span class="priority-badge">${task.priority}</span>
                            <span><i class="fa-regular fa-calendar"></i> ${dateString}</span>
                        </div>
                    </div>
                    <button class="delete-btn" title="Delete Task">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                `;

                // Add event listeners to generated elements
                const checkbox = li.querySelector('.task-checkbox');
                checkbox.addEventListener('change', () => toggleTask(task.id));

                const delBtn = li.querySelector('.delete-btn');
                delBtn.addEventListener('click', () => deleteTask(task.id, li));

                taskList.appendChild(li);
            });
        }
    }

    // Utility to prevent XSS
    function escapeHTML(str) {
        return str.replace(/[&<>'"]/g, 
            tag => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            }[tag])
        );
    }

    // Initial render
    updateStats();
    renderTasks();
});
