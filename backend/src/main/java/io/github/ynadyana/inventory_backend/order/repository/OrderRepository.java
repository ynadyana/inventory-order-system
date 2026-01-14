package io.github.ynadyana.inventory_backend.order.repository;

import io.github.ynadyana.inventory_backend.order.model.Order;
import io.github.ynadyana.inventory_backend.user.AppUser;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUser(AppUser user);
}