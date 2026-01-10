package io.github.ynadyana.inventory_backend.order.repository;

import io.github.ynadyana.inventory_backend.order.model.Order;
import io.github.ynadyana.inventory_backend.user.AppUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    // This allows the service to find orders by the AppUser object
    List<Order> findByUser(AppUser user); 
}