package com.orbit.controller;

import java.util.List;

import org.springframework.web.bind.annotation.*;

import com.orbit.entity.Manager;
import com.orbit.service.ManagerService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/managers")
@CrossOrigin("*")
@RequiredArgsConstructor

public class ManagerController {

    private final ManagerService managerService;

    // ✅ Create Manager
    @PostMapping
    public Manager createManager(@RequestBody Manager manager) {
        return managerService.saveManager(manager);
    }

    // ✅ Get All
    @GetMapping
    public List<Manager> getAllManagers() {
        return managerService.getAllManagers();
    }

    // ✅ Get By ID
    @GetMapping("/{id}")
    public Manager getManager(@PathVariable Long id) {
        return managerService.getManagerById(id);
    }

    // ✅ Update
    @PutMapping("/{id}")
    public Manager updateManager(@PathVariable Long id, @RequestBody Manager manager) {
        return managerService.updateManager(id, manager);
    }

    // ✅ Delete
    @DeleteMapping("/{id}")
    public String deleteManager(@PathVariable Long id) {
        managerService.deleteManager(id);
        return "Manager deleted successfully";
    }

    // 🔍 Find by email
    @GetMapping("/email/{email}")
    public Manager getManagerByEmail(@PathVariable String email) {
        return managerService.getManagerByEmail(email);
    }
}