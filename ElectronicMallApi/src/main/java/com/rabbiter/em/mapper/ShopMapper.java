package com.rabbiter.em.mapper;

import com.rabbiter.em.entity.Shops;
import org.apache.ibatis.annotations.Select;

import java.util.List;

public interface ShopMapper {
    /**
     * 查询所有店铺信息
     * @return 店铺信息列表
     */

    @Select("select * from shops")
    List<Shops> getAllShops();
}    