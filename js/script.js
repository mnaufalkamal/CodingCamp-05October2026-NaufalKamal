let state = {
    userName: localStorage.getItem('lifeflow_username') || 'Explorer',
    theme: localStorage.getItem('lifeflow_theme') || 'dark',
    pomodoro: {
        workTime: parseInt(localStorage.getItem('lifeflow_work_time')) || 25,
        shortBreak: parseInt(localStorage.getItem('lifeflow_short_time')) || 5,
        longBreak: parseInt(localStorage.getItem('lifeflow_long_time')) || 15,
        currentMode: 'work',
        timeLeft: 25 * 60,
        isRunning: false,
        timerId: null
    },
    tasks: JSON.parse(localStorage.getItem('lifeflow_tasks')) || [
        { id: '1', title: 'Belajar', completed: false, priority: 'high', dueDate: new Date().toISOString().split('T')[0] },
        { id: '2', title: 'Ngoding', completed: false, priority: 'medium', dueDate: new Date().toISOString().split('T')[0] },
        { id: '3', title: 'Bermain', completed: false, priority: 'low', dueDate: new Date().toISOString().split('T')[0] }
    ],
    taskFilter: 'all',
    taskSort: 'default',
    quickLinks: JSON.parse(localStorage.getItem('lifeflow_links')) || [
        { id: 'l1', name: 'GitHub', url: 'https://github.com', icon: 'fa-brands fa-github' },
        { id: 'l2', name: 'ChatGPT', url: 'https://chat.openai.com', icon: 'fa-solid fa-robot' },
        { id: 'l3', name: 'YouTube', url: 'https://youtube.com', icon: 'fa-brands fa-youtube' },
        { id: 'l4', name: 'Google', url: 'https://google.com', icon: 'fa-brands fa-google' }
    ]
};

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initClock();
    initGreeting();
    initPomodoro();
    renderTasks();
    renderQuickLinks();
    setupEventListeners();
});

function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('aside');
    
    let bgClass = 'bg-slate-900 text-white border-slate-800';
    let icon = 'fa-circle-info text-indigo-400';
    if (type === 'success') {
        bgClass = 'bg-emerald-900 text-emerald-100 border-emerald-700';
        icon = 'fa-circle-check text-emerald-400';
    } else if (type === 'error') {
        bgClass = 'bg-rose-900 text-rose-100 border-rose-700';
        icon = 'fa-triangle-exclamation text-rose-400';
    }

    toast.className = `pointer-events-auto flex items-center space-x-3 px-4 py-3 rounded-2xl shadow-xl border text-sm font-medium transition-all transform translate-y-2 opacity-0 animate-fade-in ${bgClass}`;
    toast.innerHTML = `<i class="fa-solid ${icon} text-base"></i><span>${message}</span>`;
    
    container.appendChild(toast);
    setTimeout(() => toast.classList.remove('translate-y-2', 'opacity-0'), 10);
    setTimeout(() => {
        toast.classList.add('opacity-0', 'translate-y-2');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function initTheme() {
    if (state.theme === 'dark') {
        document.documentElement.classList.add('dark');
        document.getElementById('theme-icon').className = 'fa-solid fa-sun';
        document.getElementById('theme-text').innerText = 'Light';
    } else {
        document.documentElement.classList.remove('dark');
        document.getElementById('theme-icon').className = 'fa-solid fa-moon';
        document.getElementById('theme-text').innerText = 'Dark';
    }
}

function initClock() {
    updateClockAndGreeting();
    setInterval(updateClockAndGreeting, 1000);
}

function updateClockAndGreeting() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    const timeStr = `${String(hours % 12 || 12).padStart(2, '0')}:${minutes}:${seconds} ${hours >= 12 ? 'PM' : 'AM'}`;
    document.getElementById('live-time').innerText = timeStr;

    const options = { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' };
    document.getElementById('live-date').innerText = now.toLocaleDateString(undefined, options);

    let greetingText = 'Good evening';
    let iconClass = 'fa-moon text-indigo-300';
    if (hours >= 4 && hours < 12) {
        greetingText = 'Good morning';
        iconClass = 'fa-sun text-amber-300';
    } else if (hours >= 12 && hours < 17) {
        greetingText = 'Good afternoon';
        iconClass = 'fa-cloud-sun text-amber-200';
    }

    document.getElementById('greeting-time-text').innerText = greetingText;
    document.querySelector('#greeting-badge i').className = `fa-solid ${iconClass}`;
}

function initGreeting() {
    document.getElementById('user-name-span').innerText = state.userName;
    document.getElementById('user-name-input').value = state.userName;

    const editBtn = document.getElementById('edit-name-btn');
    const nameContainer = document.getElementById('edit-name-container');
    const saveBtn = document.getElementById('save-name-btn');
    const nameInput = document.getElementById('user-name-input');

    editBtn.addEventListener('click', () => {
        nameContainer.classList.toggle('hidden');
        nameInput.focus();
    });

    saveBtn.addEventListener('click', () => {
        const newName = nameInput.value.trim();
        if (newName) {
            state.userName = newName;
            localStorage.setItem('lifeflow_username', newName);
            document.getElementById('user-name-span').innerText = newName;
            nameContainer.classList.add('hidden');
            showToast('Greeting name updated successfully!', 'success');
        }
    });

    nameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') saveBtn.click();
    });
}

function initPomodoro() {
    setTimerMode('work', false);

    document.getElementById('timer-start-btn').addEventListener('click', toggleTimer);
    document.getElementById('timer-reset-btn').addEventListener('click', resetTimer);

    const toggleCustomBtn = document.getElementById('toggle-custom-timer');
    const customPanel = document.getElementById('custom-timer-panel');
    toggleCustomBtn.addEventListener('click', () => {
        customPanel.classList.toggle('hidden');
    });

    document.getElementById('apply-custom-timer').addEventListener('click', () => {
        const w = parseInt(document.getElementById('custom-work-input').value);
        const s = parseInt(document.getElementById('custom-short-input').value);
        const l = parseInt(document.getElementById('custom-long-input').value);

        if (w > 0 && s > 0 && l > 0) {
            state.pomodoro.workTime = w;
            state.pomodoro.shortBreak = s;
            state.pomodoro.longBreak = l;

            localStorage.setItem('lifeflow_work_time', w);
            localStorage.setItem('lifeflow_short_time', s);
            localStorage.setItem('lifeflow_long_time', l);

            setTimerMode(state.pomodoro.currentMode, false);
            customPanel.classList.add('hidden');
            showToast('Custom Pomodoro times applied!', 'success');
        } else {
            showToast('Please enter valid positive numbers for minutes.', 'error');
        }
    });

    document.getElementById('custom-work-input').value = state.pomodoro.workTime;
    document.getElementById('custom-short-input').value = state.pomodoro.shortBreak;
    document.getElementById('custom-long-input').value = state.pomodoro.longBreak;
}

function setTimerMode(mode) {
    clearInterval(state.pomodoro.timerId);
    state.pomodoro.isRunning = false;
    state.pomodoro.currentMode = mode;

    let mins = state.pomodoro.workTime;
    if (mode === 'shortBreak') mins = state.pomodoro.shortBreak;
    if (mode === 'longBreak') mins = state.pomodoro.longBreak;

    state.pomodoro.timeLeft = mins * 60;
    updateTimerDisplay();
    updateTimerButtonsUI();

    ['work', 'short', 'long'].forEach(m => {
        const btn = document.getElementById(`mode-${m}-btn`);
        if (btn) {
            if ((m === 'work' && mode === 'work') || (m === 'short' && mode === 'shortBreak') || (m === 'long' && mode === 'longBreak')) {
                btn.className = 'px-3 py-1.5 rounded-lg bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm transition-all';
            } else {
                btn.className = 'px-3 py-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 transition-all';
            }
        }
    });
}

function toggleTimer() {
    if (state.pomodoro.isRunning) {
        clearInterval(state.pomodoro.timerId);
        state.pomodoro.isRunning = false;
        updateTimerButtonsUI();
    } else {
        state.pomodoro.isRunning = true;
        updateTimerButtonsUI();
        state.pomodoro.timerId = setInterval(() => {
            if (state.pomodoro.timeLeft > 0) {
                state.pomodoro.timeLeft--;
                updateTimerDisplay();
            } else {
                clearInterval(state.pomodoro.timerId);
                state.pomodoro.isRunning = false;
                updateTimerButtonsUI();
                playAlarmSound();
                showToast(`Pomodoro session finished! Take a break.`, 'success');
            }
        }, 1000);
    }
}

function resetTimer() {
    clearInterval(state.pomodoro.timerId);
    state.pomodoro.isRunning = false;
    setTimerMode(state.pomodoro.currentMode);
    showToast('Timer reset', 'info');
}

function updateTimerDisplay() {
    const mins = Math.floor(state.pomodoro.timeLeft / 60);
    const secs = state.pomodoro.timeLeft % 60;
    document.getElementById('timer-display').innerText = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function updateTimerButtonsUI() {
    const btnText = document.getElementById('timer-start-text');
    const btnIcon = document.getElementById('timer-start-icon');
    if (state.pomodoro.isRunning) {
        btnText.innerText = 'Pause';
        btnIcon.className = 'fa-solid fa-pause';
    } else {
        btnText.innerText = 'Start Focus';
        btnIcon.className = 'fa-solid fa-play';
    }
}

function playAlarmSound() {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, ctx.currentTime);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.8);
    } catch (e) {
        console.log('Audio notification prevented');
    }
}

function setupEventListeners() {
    document.getElementById('theme-toggle').addEventListener('click', () => {
        state.theme = state.theme === 'dark' ? 'light' : 'dark';
        localStorage.setItem('lifeflow_theme', state.theme);
        initTheme();
        showToast(`Switched to ${state.theme} mode`, 'success');
    });

    document.getElementById('reset-data-btn').addEventListener('click', () => {
        if (confirm('Are you sure you want to reset all dashboard data to default?')) {
            localStorage.clear();
            location.reload();
        }
    });

    const taskForm = document.getElementById('add-task-form');
    taskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const titleInput = document.getElementById('task-title-input');
        const priorityInput = document.getElementById('task-priority-input');
        const dueDateInput = document.getElementById('task-duedate-input');

        const title = titleInput.value.trim();
        const priority = priorityInput.value;
        const dueDate = dueDateInput.value || new Date().toISOString().split('T')[0];

        if (!title) return;

        // Challenge: Duplicate prevention
        const isDuplicate = state.tasks.some(t => t.title.toLowerCase() === title.toLowerCase());
        if (isDuplicate) {
            showToast('Duplicate task! A task with this name already exists.', 'error');
            return;
        }

        const newTask = {
            id: Date.now().toString(),
            title,
            completed: false,
            priority,
            dueDate
        };

        state.tasks.push(newTask);
        saveTasks();
        renderTasks();

        titleInput.value = '';
        dueDateInput.value = '';
        showToast('Task added successfully!', 'success');
    });

    document.getElementById('task-sort-select').addEventListener('change', (e) => {
        state.taskSort = e.target.value;
        renderTasks();
    });

    document.getElementById('clear-completed-tasks').addEventListener('click', () => {
        state.tasks = state.tasks.filter(t => !t.completed);
        saveTasks();
        renderTasks();
        showToast('Cleared completed tasks', 'info');
    });

    const linkModal = document.getElementById('link-modal');
    document.getElementById('open-add-link-modal').addEventListener('click', () => {
        document.getElementById('link-modal-title').innerText = 'Add Quick Link';
        document.getElementById('link-edit-id').value = '';
        document.getElementById('link-name-input').value = '';
        document.getElementById('link-url-input').value = '';
        document.getElementById('link-icon-input').value = 'fa-solid fa-globe';
        linkModal.classList.remove('hidden');
        linkModal.classList.add('flex');
    });

    document.getElementById('close-link-modal').addEventListener('click', () => {
        linkModal.classList.add('hidden');
        linkModal.classList.remove('flex');
    });
    document.getElementById('cancel-link-modal').addEventListener('click', () => {
        linkModal.classList.add('hidden');
        linkModal.classList.remove('flex');
    });

    document.getElementById('link-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('link-edit-id').value;
        const name = document.getElementById('link-name-input').value.trim();
        const url = document.getElementById('link-url-input').value.trim();
        const icon = document.getElementById('link-icon-input').value.trim() || 'fa-solid fa-globe';

        if (!name || !url) return;

        if (id) {
            const link = state.quickLinks.find(l => l.id === id);
            if (link) {
                link.name = name;
                link.url = url;
                link.icon = icon;
            }
            showToast('Quick link updated!', 'success');
        } else {
            state.quickLinks.push({
                id: 'l_' + Date.now(),
                name,
                url,
                icon
            });
            showToast('Quick link added!', 'success');
        }

        saveLinks();
        renderQuickLinks();
        linkModal.classList.add('hidden');
        linkModal.classList.remove('flex');
    });
}

function saveTasks() {
    localStorage.setItem('lifeflow_tasks', JSON.stringify(state.tasks));
}

function setTaskFilter(filter) {
    state.taskFilter = filter;
    ['all', 'active', 'completed'].forEach(f => {
        const btn = document.getElementById(`filter-${f}-btn`);
        if (btn) {
            if (f === filter) {
                btn.className = 'px-3 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold';
            } else {
                btn.className = 'px-3 py-1 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200';
            }
        }
    });
    renderTasks();
}

function renderTasks() {
    const container = document.getElementById('task-list-container');
    container.innerHTML = '';

    let filtered = state.tasks.filter(t => {
        if (state.taskFilter === 'active') return !t.completed;
        if (state.taskFilter === 'completed') return t.completed;
        return true;
    });

    // Challenge: Sorting options
    filtered.sort((a, b) => {
        if (state.taskSort === 'priority') {
            const weight = { high: 3, medium: 2, low: 1 };
            return (weight[b.priority] || 1) - (weight[a.priority] || 1);
        } else if (state.taskSort === 'dueDate') {
            return new Date(a.dueDate || '9999-12-31') - new Date(b.dueDate || '9999-12-31');
        } else if (state.taskSort === 'alphabetical') {
            return a.title.localeCompare(b.title);
        } else if (state.taskSort === 'status') {
            return (a.completed === b.completed) ? 0 : a.completed ? 1 : -1;
        }
        return 0;
    });

    const completedCount = state.tasks.filter(t => t.completed).length;
    document.getElementById('task-counter').innerText = `${completedCount} completed of ${state.tasks.length}`;

    if (filtered.length === 0) {
        container.innerHTML = `
            <li class="text-center py-12 text-slate-400 list-none">
                <i class="fa-solid fa-clipboard-list text-3xl mb-2 opacity-50"></i>
                <p class="text-sm">No tasks found here.</p>
            </li>
        `;
        return;
    }

    filtered.forEach(task => {
        const item = document.createElement('li');
        item.className = `group flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
            task.completed 
                ? 'bg-slate-50 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800/60 opacity-75' 
                : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/60 hover:shadow-sm'
        }`;

        let priorityBadgeColor = 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300';
        if (task.priority === 'high') priorityBadgeColor = 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300';
        if (task.priority === 'medium') priorityBadgeColor = 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300';

        item.innerHTML = `
            <section class="flex items-center space-x-3 overflow-hidden pr-2">
                <button onclick="toggleTaskCompletion('${task.id}')" class="w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 transition-colors ${
                    task.completed 
                        ? 'bg-indigo-600 border-indigo-600 text-white' 
                        : 'border-slate-300 dark:border-slate-600 hover:border-indigo-500'
                }">
                    ${task.completed ? '<i class="fa-solid fa-check text-xs"></i>' : ''}
                </button>
                <section class="truncate">
                    <p class="text-sm font-medium truncate ${task.completed ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-700 dark:text-slate-200'}">${escapeHtml(task.title)}</p>
                    <section class="flex items-center space-x-2 mt-0.5">
                        <span class="text-[10px] px-2 py-0.5 rounded-md font-semibold uppercase tracking-wider ${priorityBadgeColor}">${task.priority}</span>
                        <span class="text-[10px] text-slate-400"><i class="fa-regular fa-calendar mr-1"></i>${task.dueDate || 'No date'}</span>
                    </section>
                </section>
            </section>
            <nav class="flex items-center space-x-1 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity shrink-0" aria-label="Task item actions">
                <button onclick="deleteTask('${task.id}')" class="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors" title="Delete task">
                    <i class="fa-solid fa-trash-can text-xs"></i>
                </button>
            </nav>
        `;
        container.appendChild(item);
    });
}

function toggleTaskCompletion(id) {
    const task = state.tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        saveTasks();
        renderTasks();
    }
}

function deleteTask(id) {
    state.tasks = state.tasks.filter(t => t.id !== id);
    saveTasks();
    renderTasks();
    showToast('Task deleted', 'info');
}

function saveLinks() {
    localStorage.setItem('lifeflow_links', JSON.stringify(state.quickLinks));
}

function renderQuickLinks() {
    const grid = document.getElementById('quick-links-grid');
    grid.innerHTML = '';

    state.quickLinks.forEach(link => {
        const card = document.createElement('article');
        card.className = `group relative flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 hover:border-indigo-500/50 hover:shadow-md transition-all text-center`;
        
        card.innerHTML = `
            <a href="${escapeHtml(link.url)}" target="_blank" rel="noopener noreferrer" class="flex flex-col items-center w-full">
                <figure class="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-slate-200/60 dark:border-slate-700 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-xl mb-2 group-hover:scale-110 transition-transform m-0">
                    <i class="${escapeHtml(link.icon)}"></i>
                </figure>
                <span class="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate w-full">${escapeHtml(link.name)}</span>
            </a>
            <nav class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1" aria-label="Quick link actions">
                <button onclick="editQuickLink('${link.id}')" class="p-1 rounded-lg bg-white dark:bg-slate-700 text-slate-500 hover:text-indigo-600 shadow-sm text-[10px]" title="Edit link">
                    <i class="fa-solid fa-pen"></i>
                </button>
                <button onclick="deleteQuickLink('${link.id}')" class="p-1 rounded-lg bg-white dark:bg-slate-700 text-slate-500 hover:text-red-500 shadow-sm text-[10px]" title="Delete link">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </nav>
        `;
        grid.appendChild(card);
    });
}

function editQuickLink(id) {
    const link = state.quickLinks.find(l => l.id === id);
    if (link) {
        document.getElementById('link-modal-title').innerText = 'Edit Quick Link';
        document.getElementById('link-edit-id').value = link.id;
        document.getElementById('link-name-input').value = link.name;
        document.getElementById('link-url-input').value = link.url;
        document.getElementById('link-icon-input').value = link.icon;
        const modal = document.getElementById('link-modal');
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }
}

function deleteQuickLink(id) {
    state.quickLinks = state.quickLinks.filter(l => l.id !== id);
    saveLinks();
    renderQuickLinks();
    showToast('Quick link removed', 'info');
}

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}