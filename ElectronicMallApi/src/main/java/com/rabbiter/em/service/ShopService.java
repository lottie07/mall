package com.rabbiter.em.service;

import com.rabbiter.em.entity.Shops;
import com.rabbiter.em.mapper.ShopMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ShopService {

    @Autowired
    private ShopMapper shopMapper;

    /**
     * 获取所有店铺信息
     * @return 店铺信息列表
     */
    public List<Shops> getAllShops() {

        return shopMapper.getAllShops();
    }

    /**
     * 根据 ID 获取单个店铺信息
     * @param id 店铺 ID
     * @return 对应 ID 的店铺信息，如果未找到则返回 null
     */
    /*public Shops getShopById(Integer id) {
        // 这里假设在 ShopMapper 中添加了 getShopById 方法
        // 你可以按需补充该方法的 SQL 实现
        return shopMapper.getShopById(id);
    }*/


}    