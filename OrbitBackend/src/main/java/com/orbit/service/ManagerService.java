package com.orbit.service;

import java.util.List;
import com.orbit.entity.Manager;

public interface ManagerService {

    Manager saveManager(Manager manager);

    List<Manager> getAllManagers();

    Manager getManagerById(Long id);

    Manager updateManager(Long id, Manager manager);

    void deleteManager(Long id);

    Manager getManagerByEmail(String email);
}