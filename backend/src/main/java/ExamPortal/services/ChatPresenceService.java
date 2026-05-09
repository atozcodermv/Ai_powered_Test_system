package ExamPortal.services;

import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Service
public class ChatPresenceService {

    private final Map<String, Integer> sessionToUser = new ConcurrentHashMap<>();
    private final Map<Integer, String> userRoles = new ConcurrentHashMap<>();
    private final Map<Integer, AtomicInteger> activeSessions = new ConcurrentHashMap<>();

    public boolean registerConnection(String sessionId, Integer userId, String role) {
        if (sessionId == null || userId == null || role == null || role.isBlank()) {
            return false;
        }

        sessionToUser.put(sessionId, userId);
        userRoles.put(userId, role);
        AtomicInteger counter = activeSessions.computeIfAbsent(userId, key -> new AtomicInteger(0));
        return counter.getAndIncrement() == 0;
    }

    public boolean unregisterConnection(String sessionId) {
        if (sessionId == null) {
            return false;
        }

        Integer userId = sessionToUser.remove(sessionId);
        if (userId == null) {
            return false;
        }

        AtomicInteger counter = activeSessions.get(userId);
        if (counter == null) {
            return false;
        }

        int remaining = counter.decrementAndGet();
        if (remaining <= 0) {
            activeSessions.remove(userId);
            return true;
        }

        return false;
    }

    public boolean isOnline(Integer userId) {
        if (userId == null) {
            return false;
        }

        AtomicInteger counter = activeSessions.get(userId);
        return counter != null && counter.get() > 0;
    }

    public Map<Integer, Boolean> getPresenceSnapshot(List<Integer> userIds) {
        Map<Integer, Boolean> snapshot = new LinkedHashMap<>();
        if (userIds == null) {
            return snapshot;
        }

        for (Integer userId : userIds) {
            if (userId != null) {
                snapshot.put(userId, isOnline(userId));
            }
        }

        return snapshot;
    }

    public String getRole(Integer userId) {
        return userRoles.get(userId);
    }
}
