package com.rabbiter.em.service;

import com.rabbiter.em.mapper.UserBehaviorMapper;
import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class CollaborativeFilteringService {

    private final UserBehaviorMapper userBehaviorMapper;

    public CollaborativeFilteringService(UserBehaviorMapper userBehaviorMapper) {
        this.userBehaviorMapper = userBehaviorMapper;
    }

    public List<Long> recommendGoods(Long userId, int num) {
        // 获取目标用户的行为数据
        List<Map<String, Object>> targetUserBehavior = userBehaviorMapper.getUserBehaviorByUserId(userId);
        Map<Long, Integer> targetUserGoods = new HashMap<>();
        for (Map<String, Object> behavior : targetUserBehavior) {
            Long goodId = Long.parseLong(behavior.get("good_id").toString());
            int count = Integer.parseInt(behavior.get("count").toString());
            targetUserGoods.put(goodId, count);
        }

        // 计算用户相似度
        Map<Long, Double> userSimilarity = new HashMap<>();
        for (Map.Entry<Long, Integer> entry : targetUserGoods.entrySet()) {
            Long goodId = entry.getKey();
            List<Map<String, Object>> usersByGoodId = userBehaviorMapper.getUsersByGoodId(goodId);
            for (Map<String, Object> user : usersByGoodId) {
                Long otherUserId = Long.parseLong(user.get("user_id").toString());
                if (!otherUserId.equals(userId)) {
                    userSimilarity.put(otherUserId, userSimilarity.getOrDefault(otherUserId, 0.0) + 1);
                }
            }
        }

        // 找出最相似的用户
        List<Map.Entry<Long, Double>> sortedUserSimilarity = new ArrayList<>(userSimilarity.entrySet());
        sortedUserSimilarity.sort((o1, o2) -> o2.getValue().compareTo(o1.getValue()));
        List<Long> similarUserIds = new ArrayList<>();
        for (int i = 0; i < Math.min(5, sortedUserSimilarity.size()); i++) {
            similarUserIds.add(sortedUserSimilarity.get(i).getKey());
        }

        // 从相似用户中找出目标用户未购买过的商品
        Map<Long, Integer> recommendedGoods = new HashMap<>();
        for (Long similarUserId : similarUserIds) {
            List<Map<String, Object>> similarUserBehavior = userBehaviorMapper.getUserBehaviorByUserId(similarUserId);
            for (Map<String, Object> behavior : similarUserBehavior) {
                Long goodId = Long.parseLong(behavior.get("good_id").toString());
                if (!targetUserGoods.containsKey(goodId)) {
                    recommendedGoods.put(goodId, recommendedGoods.getOrDefault(goodId, 0) + 1);
                }
            }
        }

        // 排序并选择推荐商品
        List<Map.Entry<Long, Integer>> sortedRecommendedGoods = new ArrayList<>(recommendedGoods.entrySet());
        sortedRecommendedGoods.sort((o1, o2) -> o2.getValue().compareTo(o1.getValue()));
        List<Long> result = new ArrayList<>();
        for (int i = 0; i < Math.min(num, sortedRecommendedGoods.size()); i++) {
            result.add(sortedRecommendedGoods.get(i).getKey());
        }
        return result;
    }
}