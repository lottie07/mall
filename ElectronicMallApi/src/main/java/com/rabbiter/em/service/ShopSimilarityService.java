package com.rabbiter.em.service;

import com.rabbiter.em.entity.Good;
import com.rabbiter.em.service.GoodService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ShopSimilarityService {

    @Autowired
    private GoodService goodService;

    // 计算两个店铺的相似度
    public double calculateSimilarity(Long shopId1, Long shopId2) {
        List<Good> goods1 = getGoodsByShopId(shopId1);
        List<Good> goods2 = getGoodsByShopId(shopId2);

        Map<Long, Integer> vector1 = getGoodVector(goods1);
        Map<Long, Integer> vector2 = getGoodVector(goods2);

        return cosineSimilarity(vector1, vector2);
    }

    // 获取某个店铺的商品列表
    private List<Good> getGoodsByShopId(Long id) {
        // 这里需要根据实际情况实现获取某个店铺商品列表的逻辑
        // 假设已经有相应的方法可以根据店铺 ID 获取商品列表
        return (List<Good>) goodService.getGoodById(id);
    }

    // 将商品列表转换为向量
    private Map<Long, Integer> getGoodVector(List<Good> goods) {
        Map<Long, Integer> vector = new HashMap<>();
        for (Good good : goods) {
            vector.put(good.getId(), 1);
        }
        return vector;
    }

    // 计算余弦相似度
    private double cosineSimilarity(Map<Long, Integer> vector1, Map<Long, Integer> vector2) {
        double dotProduct = 0;
        double norm1 = 0;
        double norm2 = 0;

        for (Map.Entry<Long, Integer> entry : vector1.entrySet()) {
            Long goodId = entry.getKey();
            int value1 = entry.getValue();
            norm1 += value1 * value1;
            if (vector2.containsKey(goodId)) {
                int value2 = vector2.get(goodId);
                dotProduct += value1 * value2;
            }
        }

        for (Map.Entry<Long, Integer> entry : vector2.entrySet()) {
            int value2 = entry.getValue();
            norm2 += value2 * value2;
        }

        if (norm1 == 0 || norm2 == 0) {
            return 0;
        }

        return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
    }
}