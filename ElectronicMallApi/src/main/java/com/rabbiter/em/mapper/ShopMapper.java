package com.rabbiter.em.mapper;

import com.rabbiter.em.entity.Shops;
import org.apache.ibatis.annotations.Select;

import java.util.List;

public interface ShopMapper {
    @Select("select * from shops")
    List<Shops> getAllShops();
}    