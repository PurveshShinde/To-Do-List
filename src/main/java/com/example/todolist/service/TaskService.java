package com.example.todolist.service;

import com.example.todolist.model.Task;
import com.example.todolist.repository.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TaskService {

    @Autowired
    private TaskRepository taskRepository;

    // Fetch all tasks from the database
    public List<Task> getAllTasks() {
        return taskRepository.findAll();
    }

    // Save a new task to the database
    public Task createTask(Task task) {
        return taskRepository.save(task);
    }

    // Update an existing task's title or completed status
    public Optional<Task> updateTask(Long id, Task updatedTask) {
        return taskRepository.findById(id).map(existingTask -> {
            // Update title if provided
            if (updatedTask.getTitle() != null) {
                existingTask.setTitle(updatedTask.getTitle());
            }
            // Update completed status
            existingTask.setCompleted(updatedTask.isCompleted());
            return taskRepository.save(existingTask);
        });
    }

    // Delete a task by ID
    public boolean deleteTask(Long id) {
        if (taskRepository.existsById(id)) {
            taskRepository.deleteById(id);
            return true;
        }
        return false;
    }
}
