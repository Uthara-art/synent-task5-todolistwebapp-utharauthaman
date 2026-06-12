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

    // Core Functions
    function addTask() {
        const text = taskInput.value.trim();
        if (!text) return;

        const newTask = {
            id: Date.now().toString(),
            text: text,
            priority: priorityInput.value,
            date: dateInput.value,
            completed: false,
            createdAt: new Date()
        };

        tasks.unshift(newTask); // Add to beginning
        
        // Reset input
        taskInput.value = '';
        taskInput.focus();

        updateStats();
        renderTasks();
    }

    function toggleTask(id) {
        tasks = tasks.map(task => {
            if (task.id === id) {
                return { ...task, completed: !task.completed };
            }
            return task;
        });
        updateStats();
        renderTasks();
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
                `;

                // Add event listeners to generated elements
                const checkbox = li.querySelector('.task-checkbox');
                checkbox.addEventListener('change', () => toggleTask(task.id));

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
