package com.rabbiter.em.mapper;

import com.rabbiter.em.entity.Shops;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

public interface ShopMapper {
    @Select("select * from shops")
    List<Shops> getAllShops();

    @Insert("<script>" +
            "INSERT INTO shops (floor, shop_name, x, y, width, height, shape) " +
            "VALUES " +
            "<foreach collection='shops' item='shop' separator=','>" +
            "(#{shop.floor}, #{shop.shopName}, #{shop.x}, #{shop.y}, " +
            "#{shop.width}, #{shop.height}, 'rect')" +
            "</foreach>" +
            "</script>")
    void batchInsert(@Param("shops") List<Shops> shops);
}    