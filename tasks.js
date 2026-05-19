// Tasks Management with Auto-Completion Detection

document.addEventListener('DOMContentLoaded', loadTasks);

// Add task
document.getElementById('addTaskBtn').addEventListener('click', addTask);
document.getElementById('taskInput').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') addTask();
});

async function addTask() {
  const titleInput = document.getElementById('taskInput');
  const categorySelect = document.getElementById('categorySelect');
  
  const title = titleInput.value.trim();
  if (!title) {
    alert('Please enter a task title');
    return;
  }
  
  const task = {
    title,
    category: categorySelect.value
  };
  
  await chrome.runtime.sendMessage({ 
    action: 'addTask', 
    task 
  });
  
  titleInput.value = '';
  loadTasks();
}

async function loadTasks() {
  const response = await chrome.runtime.sendMessage({ action: 'getTasks' });
  const tasks = response.tasks || [];
  
  renderTasks(tasks);
}

function renderTasks(tasks) {
  const container = document.getElementById('tasksList');
  
  if (tasks.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📋</div>
        <p><strong>No tasks yet</strong></p>
        <p>Add your first task above and Signal Pulse will detect when you complete it!</p>
      </div>
    `;
    return;
  }
  
  // Sort: pending first, then completed
  const sortedTasks = tasks.sort((a, b) => {
    if (a.completed === b.completed) return b.createdAt - a.createdAt;
    return a.completed ? 1 : -1;
  });
  
  container.innerHTML = sortedTasks.map(task => {
    const categoryClass = `category-${task.category}`;
    const completedClass = task.completed ? 'completed' : '';
    const checkIcon = task.completed ? '✓' : '';
    
    let status = 'Pending';
    let statusClass = 'status-pending';
    if (task.completed) {
      status = 'Completed';
      statusClass = 'status-completed';
    } else if (task.startedWorking) {
      status = 'In Progress';
      statusClass = 'status-in-progress';
    }
    
    const timeInfo = task.completed ? 
      `Completed ${getTimeAgo(task.completedAt)}` :
      task.startedWorking ? 
        `Started ${getTimeAgo(task.lastWorkedOn)}` :
        `Created ${getTimeAgo(task.createdAt)}`;
    
    return `
      <div class="task-item ${completedClass}">
        <div class="task-checkbox ${task.completed ? 'checked' : ''}" onclick="toggleTask('${task.id}')">
          ${checkIcon}
        </div>
        <div class="task-content">
          <div class="task-title">${task.title}</div>
          <div class="task-meta">
            <span class="task-category ${categoryClass}">${task.category}</span>
            <span class="task-status ${statusClass}">${status}</span>
            <span style="margin-left: 10px; font-size: 12px;">${timeInfo}</span>
          </div>
        </div>
        <button class="delete-btn" onclick="deleteTask('${task.id}')">Delete</button>
      </div>
    `;
  }).join('');
}

async function toggleTask(taskId) {
  await chrome.runtime.sendMessage({ 
    action: 'toggleTask', 
    taskId 
  });
  loadTasks();
}

async function deleteTask(taskId) {
  if (confirm('Delete this task?')) {
    await chrome.runtime.sendMessage({ 
      action: 'deleteTask', 
      taskId 
    });
    loadTasks();
  }
}

function getTimeAgo(timestamp) {
  const now = Date.now();
  const diff = now - timestamp;
  
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'just now';
}

// Refresh every 30 seconds to show status updates
setInterval(loadTasks, 30000);
