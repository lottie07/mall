package com.rabbiter.em.service;

import com.rabbiter.em.entity.Good;
import com.rabbiter.em.service.GoodService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategoryRecommendationService {

    @Autowired
    private GoodService goodService;

    // 根据分类 ID 推荐商品
    public List<Good> recommendGoodsByCategory(Long categoryId) {
        return (List<Good>) goodService.getGoodById(categoryId);
    }
}