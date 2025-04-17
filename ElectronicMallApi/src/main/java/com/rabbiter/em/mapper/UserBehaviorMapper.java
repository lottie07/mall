package com.rabbiter.em.mapper;

import org.apache.ibatis.annotations.Select;
import java.util.List;
import java.util.Map;

public interface UserBehaviorMapper {

    @Select("SELECT good_id, COUNT(*) as count FROM user_behavior WHERE user_id = #{userId} GROUP BY good_id")
    List<Map<String, Object>> getUserBehaviorByUserId(Long userId);

    @Select("SELECT user_id, COUNT(*) as count FROM user_behavior WHERE good_id = #{goodId} GROUP BY user_id")
    List<Map<String, Object>> getUsersByGoodId(Long goodId);
}