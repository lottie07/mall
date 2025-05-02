package com.rabbiter.em.controller;

import com.rabbiter.em.annotation.Authority;
import com.rabbiter.em.common.Result;
import com.rabbiter.em.entity.AuthorityType;
import com.rabbiter.em.entity.Shops;
import com.rabbiter.em.service.ShopService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class ShopController {
    private static final Logger log = LoggerFactory.getLogger(ShopController.class);

    @Autowired
    private ShopService shopService;

    @Authority(AuthorityType.noRequire)
    @GetMapping("/shops")
    public Result getAllShops() {
        List<Shops> shops = shopService.getAllShops();
        log.info("shop");
        return Result.success(shops);
    }
    @Authority(AuthorityType.noRequire)
    @PostMapping("/shops")
    public Result addShops(@RequestBody List<Shops> shops) {
        shopService.batchInsertShops(shops);
        return Result.success();
    }
}