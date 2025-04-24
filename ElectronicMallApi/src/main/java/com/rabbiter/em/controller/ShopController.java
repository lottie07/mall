package com.rabbiter.em.controller;

import com.rabbiter.em.common.Result;
import com.rabbiter.em.entity.Shops;
import com.rabbiter.em.service.ShopService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
public class ShopController {

    @Autowired
    private ShopService shopService;

    @GetMapping("/shops")
    public Result getAllShops() {
        List<Shops> shops = shopService.getAllShops();
        return Result.success(shops); // 使用统一响应格式
    }
}