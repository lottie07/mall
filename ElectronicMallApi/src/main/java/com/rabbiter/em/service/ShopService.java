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

}    