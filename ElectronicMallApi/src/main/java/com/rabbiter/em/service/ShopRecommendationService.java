package com.rabbiter.em.service;

import com.rabbiter.em.entity.Good;
import com.rabbiter.em.service.GoodService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class ShopRecommendationService {

    @Autowired
    private ShopSimilarityService shopSimilarityService;
    @Autowired
    private GoodService goodService;

    // 根据店铺 ID 推荐商品
    public List<Good> recommendGoods(Long shopId, int numRecommendations) {
        // 获取所有店铺 ID
        List<Long> allShopIds = getAllShopIds();

        // 计算目标店铺与其他店铺的相似度
        Map<Long, Double> similarities = new HashMap<>();
        for (Long otherShopId : allShopIds) {
            if (!otherShopId.equals(shopId)) {
                double similarity = shopSimilarityService.calculateSimilarity(shopId, otherShopId);
                similarities.put(otherShopId, similarity);
            }
        }

        // 按相似度排序
        List<Map.Entry<Long, Double>> sortedSimilarities = new ArrayList<>(similarities.entrySet());
        sortedSimilarities.sort((e1, e2) -> Double.compare(e2.getValue(), e1.getValue()));

        // 推荐商品
        Set<Long> recommendedGoodIds = new HashSet<>();
        for (Map.Entry<Long, Double> entry : sortedSimilarities) {
            Long similarShopId = entry.getKey();
            List<Good> goods = (List<Good>) goodService.getGoodById(similarShopId);
            for (Good good : goods) {
                if (!recommendedGoodIds.contains(good.getId())) {
                    recommendedGoodIds.add(good.getId());
                    if (recommendedGoodIds.size() >= numRecommendations) {
                        break;
                    }
                }
            }
            if (recommendedGoodIds.size() >= numRecommendations) {
                break;
            }
        }

        // 获取推荐商品列表
        List<Good> recommendedGoods = new ArrayList<>();
        for (Long goodId : recommendedGoodIds) {
            recommendedGoods.add(goodService.getGoodById(goodId));
        }

        return recommendedGoods;
    }

    // 获取所有店铺 ID
    private List<Long> getAllShopIds() {
        // 这里需要根据实际情况实现获取所有店铺 ID 的逻辑
        // 假设已经有相应的方法可以获取所有店铺 ID
        return null;
    }
}