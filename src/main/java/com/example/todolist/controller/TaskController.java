package com.example.todolist.controller;

import com.example.todolist.model.Task;
import com.example.todolist.service.TaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(origins = "*") // Allows your frontend to communicate with this backend without CORS blocking
public class TaskController {

    @Autowired
    private TaskService taskService;

    // 1. GET /api/tasks -> Fetch all tasks
    @GetMapping
    public List<Task> getTasks() {
        return taskService.getAllTasks();
    }

    // 2. POST /api/tasks -> Create a new task
    @PostMapping
    public ResponseEntity<Task> addTask(@RequestBody Task task) {
        Task createdTask = taskService.createTask(task);
        return new ResponseEntity<>(createdTask, HttpStatus.CREATED);
    }

    // 3. PUT /api/tasks/{id} -> Update an existing task (toggle completion or change title)
    @PutMapping("/{id}")
    public ResponseEntity<Task> updateTask(@PathVariable Long id, @RequestBody Task updatedTask) {
        return taskService.updateTask(id, updatedTask)
                .map(task -> ResponseEntity.ok(task)) // Return 200 OK with updated task data
                .orElse(ResponseEntity.notFound().build()); // Return 404 Not Found if ID does not exist
    }

    // 4. DELETE /api/tasks/{id} -> Delete a task by ID
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id) {
        boolean deleted = taskService.deleteTask(id);
        if (deleted) {
            return ResponseEntity.noContent().build(); // Return 204 No Content on successful deletion
        }
        return ResponseEntity.notFound().build(); // Return 404 Not Found if ID does not exist
    }
}
