/**
 * ============================================================================
 * TO-DO LIST FRONTEND LOGIC & BACKEND API INTEGRATION
 * ============================================================================
 * This file connects our interactive user interface with the Spring Boot REST API
 * running on the backend. All functions include human-readable comments so you can
 * easily understand how data flows between the browser and Java server.
 */

// 1. BASE API CONFIGURATION
// Since this HTML/JS is served directly by Spring Boot, relative URL "/api/tasks" 
// connects seamlessly to http://localhost:8080/api/tasks
const API_URL = '/api/tasks';

// Global state variables
let tasks = [];           // Holds all task objects fetched from the database
let currentFilter = 'all';// Active filter tab: 'all', 'pending', or 'completed'

// DOM Elements
const taskListElement = document.getElementById('taskList');
const addTaskForm = document.getElementById('addTaskForm');
const taskInput = document.getElementById('taskInput');
const emptyStateElement = document.getElementById('emptyState');
const loadingSkeleton = document.getElementById('loadingSkeleton');

// Dashboard Stat Elements
const totalCountElement = document.getElementById('totalCount');
const completedCountElement = document.getElementById('completedCount');
const completionPercentElement = document.getElementById('completionPercent');
const progressBarElement = document.getElementById('progressBar');
const badgeAll = document.getElementById('badgeAll');
const badgePending = document.getElementById('badgePending');
const badgeCompleted = document.getElementById('badgeCompleted');

/**
 * ============================================================================
 * STEP 1: FETCH ALL TASKS FROM SPRING BOOT BACKEND (GET /api/tasks)
 * ============================================================================
 * This function sends an HTTP GET request to the backend. The backend retrieves
 * all tasks from the H2 database via TaskRepository and returns them as a JSON list.
 */
async function fetchTasks() {
    try {
        // Send GET request to Spring Boot TaskController (@GetMapping)
        const response = await fetch(API_URL);

        // Check if the HTTP response status is OK (200)
        if (!response.ok) {
            throw new Error(`Failed to load tasks from server (Status: ${response.status})`);
        }

        // Parse JSON array returned by Spring Boot into our JS array
        tasks = await response.json();

        // Update the user interface with the fetched tasks
        renderTasks();
        updateDashboardStats();

    } catch (error) {
        console.error('Error fetching tasks from backend:', error);
        showToast('Error connecting to backend server', 'error');
    } finally {
        // Hide loading skeleton placeholder
        if (loadingSkeleton) loadingSkeleton.style.display = 'none';
    }
}

/**
 * ============================================================================
 * STEP 2: CREATE A NEW TASK (POST /api/tasks)
 * ============================================================================
 * Triggered when the user submits the task input form. Sends a JSON payload to
 * Spring Boot (@PostMapping), which saves the new task into the database.
 */
async function addTask(title) {
    try {
        // Prepare task data matching Java Task model (title & completed status)
        const newTaskData = {
            title: title.trim(),
            completed: false
        };

        // Send POST request with JSON body and Content-Type header
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json' // Instructs Spring Boot to parse JSON payload
            },
            body: JSON.stringify(newTaskData)
        });

        if (!response.ok) {
            throw new Error('Failed to create task');
        }

        // Backend returns the newly created Task entity (with database-assigned ID)
        const createdTask = await response.json();

        // Add new task to local tasks array and refresh UI
        tasks.push(createdTask);
        renderTasks();
        updateDashboardStats();

        // Clear input field and notify user
        taskInput.value = '';
        showToast('Task added successfully!', 'success');

    } catch (error) {
        console.error('Error adding task:', error);
        showToast('Failed to add task. Please check server connection.', 'error');
    }
}

/**
 * ============================================================================
 * STEP 3: TOGGLE TASK COMPLETION STATUS (PUT /api/tasks/{id})
 * ============================================================================
 * Triggered when the user clicks a checkbox. Sends HTTP PUT request to Spring Boot
 * (@PutMapping("/{id}")) to flip the 'completed' field in the database.
 */
async function toggleTask(id, currentCompletedStatus) {
    try {
        // Find task in local list
        const taskToUpdate = tasks.find(t => t.id === id);
        if (!taskToUpdate) return;

        // Create payload with updated completion status
        const updatedData = {
            title: taskToUpdate.title,
            completed: !currentCompletedStatus
        };

        // Optimistic UI update (update locally immediately for instant responsiveness)
        taskToUpdate.completed = !currentCompletedStatus;
        renderTasks();
        updateDashboardStats();

        // Send PUT request to Spring Boot backend
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedData)
        });

        if (!response.ok) {
            // Rollback if request failed
            taskToUpdate.completed = currentCompletedStatus;
            renderTasks();
            updateDashboardStats();
            throw new Error('Failed to update task completion status');
        }

        showToast(taskToUpdate.completed ? 'Task marked as completed!' : 'Task marked as pending', 'info');

    } catch (error) {
        console.error('Error toggling task:', error);
        showToast('Could not update task status on server.', 'error');
    }
}

/**
 * ============================================================================
 * STEP 4: UPDATE TASK TITLE (PUT /api/tasks/{id})
 * ============================================================================
 * Allows editing task text directly. Sends PUT request to save new title in database.
 */
async function updateTaskTitle(id, newTitle) {
    const trimmedTitle = newTitle.trim();
    if (!trimmedTitle) return;

    try {
        const taskToUpdate = tasks.find(t => t.id === id);
        if (!taskToUpdate || taskToUpdate.title === trimmedTitle) return;

        const updatedData = {
            title: trimmedTitle,
            completed: taskToUpdate.completed
        };

        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedData)
        });

        if (!response.ok) {
            throw new Error('Failed to update title');
        }

        const savedTask = await response.json();
        taskToUpdate.title = savedTask.title;
        renderTasks();
        showToast('Task updated!', 'success');

    } catch (error) {
        console.error('Error updating task title:', error);
        showToast('Could not save updated title.', 'error');
    }
}

/**
 * ============================================================================
 * STEP 5: DELETE A TASK (DELETE /api/tasks/{id})
 * ============================================================================
 * Triggered when user clicks the trash icon. Sends HTTP DELETE request to Spring Boot
 * (@DeleteMapping("/{id}")), which removes the task from the database.
 */
async function deleteTask(id) {
    try {
        // Send DELETE request to Spring Boot backend
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error('Failed to delete task from backend');
        }

        // Filter out deleted task locally and update UI
        tasks = tasks.filter(t => t.id !== id);
        renderTasks();
        updateDashboardStats();

        showToast('Task deleted', 'warning');

    } catch (error) {
        console.error('Error deleting task:', error);
        showToast('Could not delete task from server.', 'error');
    }
}

/**
 * ============================================================================
 * USER INTERFACE RENDERING & DOM MANIPULATION
 * ============================================================================
 * Renders the list of tasks according to the active filter tab ('all', 'pending', 'completed')
 */
function renderTasks() {
    taskListElement.innerHTML = '';

    // Filter tasks based on selected tab
    const filteredTasks = tasks.filter(task => {
        if (currentFilter === 'pending') return !task.completed;
        if (currentFilter === 'completed') return task.completed;
        return true; // 'all'
    });

    // Handle empty list view
    if (filteredTasks.length === 0) {
        emptyStateElement.classList.remove('hidden');
        emptyStateElement.classList.add('flex');
    } else {
        emptyStateElement.classList.add('hidden');
        emptyStateElement.classList.remove('flex');
    }

    // Render each task card
    filteredTasks.forEach(task => {
        const li = document.createElement('li');
        li.className = `group bg-slate-900/80 hover:bg-slate-900 border ${task.completed ? 'border-slate-800/50 opacity-75' : 'border-slate-800'} rounded-xl p-4 flex items-center justify-between gap-4 transition-all duration-200 shadow-md hover:shadow-indigo-500/5`;

        li.innerHTML = `
            <!-- Checkbox and Task Title -->
            <div class="flex items-center gap-3.5 flex-1 min-w-0">
                <button 
                    onclick="toggleTask(${task.id}, ${task.completed})"
                    class="w-6 h-6 rounded-lg border ${task.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-700 hover:border-indigo-500 bg-slate-950'} flex items-center justify-center transition-all cursor-pointer flex-shrink-0"
                    title="${task.completed ? 'Mark as pending' : 'Mark as completed'}"
                >
                    ${task.completed ? '<i class="fa-solid fa-check text-xs"></i>' : ''}
                </button>

                <span 
                    id="title-${task.id}"
                    ondblclick="enableInlineEdit(${task.id})"
                    class="text-sm md:text-base ${task.completed ? 'line-through text-slate-500' : 'text-slate-200'} truncate flex-1 cursor-pointer select-none"
                >
                    ${escapeHtml(task.title)}
                </span>
            </div>

            <!-- Action Buttons (Edit & Delete) -->
            <div class="flex items-center gap-2 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                    onclick="enableInlineEdit(${task.id})"
                    class="p-2 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-lg transition-all text-xs"
                    title="Edit Title"
                >
                    <i class="fa-solid fa-pen"></i>
                </button>
                <button 
                    onclick="deleteTask(${task.id})"
                    class="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-all text-xs"
                    title="Delete Task"
                >
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </div>
        `;

        taskListElement.appendChild(li);
    });
}

/**
 * Enable Inline Title Editing
 */
function enableInlineEdit(id) {
    const titleSpan = document.getElementById(`title-${id}`);
    if (!titleSpan) return;

    const currentTitle = tasks.find(t => t.id === id)?.title || titleSpan.innerText;
    
    const input = document.createElement('input');
    input.type = 'text';
    input.value = currentTitle;
    input.className = 'w-full bg-slate-950 border border-indigo-500 rounded px-2 py-1 text-sm text-slate-100 focus:outline-none';

    titleSpan.replaceWith(input);
    input.focus();

    // Save on Enter or Blur
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            updateTaskTitle(id, input.value);
        } else if (e.key === 'Escape') {
            renderTasks();
        }
    });

    input.addEventListener('blur', () => {
        updateTaskTitle(id, input.value);
    });
}

/**
 * Update Dashboard Statistics & Progress Bar
 */
function updateDashboardStats() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pending = total - completed;

    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

    totalCountElement.innerText = total;
    completedCountElement.innerText = completed;
    completionPercentElement.innerText = `${percent}%`;
    progressBarElement.style.width = `${percent}%`;

    badgeAll.innerText = `(${total})`;
    badgePending.innerText = `(${pending})`;
    badgeCompleted.innerText = `(${completed})`;
}

/**
 * Handle Filter Tab Switching
 */
function setFilter(filter) {
    currentFilter = filter;
    
    const btnAll = document.getElementById('filterAll');
    const btnPending = document.getElementById('filterPending');
    const btnCompleted = document.getElementById('filterCompleted');

    // Reset button styles
    [btnAll, btnPending, btnCompleted].forEach(btn => {
        btn.className = 'px-4 py-1.5 rounded-lg font-medium text-slate-400 hover:text-slate-200 transition-all';
    });

    // Highlight active button
    if (filter === 'all') {
        btnAll.className = 'px-4 py-1.5 rounded-lg font-medium transition-all bg-indigo-600 text-white shadow-sm';
    } else if (filter === 'pending') {
        btnPending.className = 'px-4 py-1.5 rounded-lg font-medium transition-all bg-indigo-600 text-white shadow-sm';
    } else if (filter === 'completed') {
        btnCompleted.className = 'px-4 py-1.5 rounded-lg font-medium transition-all bg-indigo-600 text-white shadow-sm';
    }

    renderTasks();
}

/**
 * Toast Notification Helper (User Feedback Messages)
 */
function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) return;

    const toast = document.createElement('div');
    
    let bgColors = 'bg-slate-900 border-slate-700 text-slate-200';
    let icon = 'fa-circle-info text-indigo-400';

    if (type === 'success') {
        bgColors = 'bg-emerald-950/90 border-emerald-800 text-emerald-100';
        icon = 'fa-circle-check text-emerald-400';
    } else if (type === 'error') {
        bgColors = 'bg-rose-950/90 border-rose-800 text-rose-100';
        icon = 'fa-triangle-exclamation text-rose-400';
    } else if (type === 'warning') {
        bgColors = 'bg-amber-950/90 border-amber-800 text-amber-100';
        icon = 'fa-circle-exclamation text-amber-400';
    }

    toast.className = `${bgColors} border backdrop-blur-md px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 text-sm transition-all duration-300 transform translate-y-2 opacity-0 pointer-events-auto max-w-sm`;
    toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${escapeHtml(message)}</span>`;

    toastContainer.appendChild(toast);

    // Animate in
    setTimeout(() => {
        toast.classList.remove('translate-y-2', 'opacity-0');
    }, 10);

    // Auto remove after 3 seconds
    setTimeout(() => {
        toast.classList.add('opacity-0', 'translate-y-2');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

/**
 * Helper to escape HTML and prevent XSS
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.innerText = text;
    return div.innerHTML;
}

/**
 * EVENT LISTENERS INITIALIZATION
 */
addTaskForm.addEventListener('submit', (e) => {
    e.preventDefault(); // Prevent page refresh on form submission
    const title = taskInput.value;
    if (title.trim()) {
        addTask(title);
    }
});

// Fetch tasks immediately when page loads
document.addEventListener('DOMContentLoaded', fetchTasks);
