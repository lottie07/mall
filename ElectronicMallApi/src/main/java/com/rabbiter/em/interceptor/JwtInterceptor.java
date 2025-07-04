package com.rabbiter.em.interceptor;

import com.auth0.jwt.JWT;
import com.auth0.jwt.JWTVerifier;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.rabbiter.em.constants.Constants;
import com.rabbiter.em.constants.RedisConstants;
import com.rabbiter.em.entity.User;
import com.rabbiter.em.exception.ServiceException;
import com.rabbiter.em.service.UserService;
import com.rabbiter.em.utils.UserHolder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.concurrent.TimeUnit;

/*
第一层拦截器，验证用户token,把redis中的user存到threadlocal
 */
@Component
public class JwtInterceptor implements HandlerInterceptor {
    @Autowired
    private UserService userService;
    @Resource
    RedisTemplate<String, User> redisTemplate;
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        String token = request.getHeader("token");
        String requestURI = request.getRequestURI();

        //如果不是映射到方法，直接通过
        if ("/api/shops".equals(requestURI)) {
            return true;
        }
        if ("/alipay/pay".equals(requestURI)) {
            return true;
        }
        if(!(handler instanceof HandlerMethod)){
            return true;
        }
        //验证是否有token
        if(!StringUtils.hasLength(token)){
            throw  new ServiceException(Constants.TOKEN_ERROR,"token失效,请重新登陆");
        }
        //通过token，将redis中的user存到threadlocal（UserHolder）
        User user = redisTemplate.opsForValue().get(RedisConstants.USER_TOKEN_KEY + token);

        if(user == null){
            throw  new ServiceException(Constants.TOKEN_ERROR,"token失效,请重新登陆");
        }
        UserHolder.saveUser(user);
        //重置过期时间
        redisTemplate.expire(RedisConstants.USER_TOKEN_KEY +token, RedisConstants.USER_TOKEN_TTL, TimeUnit.MINUTES);
        //验证token
        JWTVerifier jwtVerifier = JWT.require(Algorithm.HMAC256(user.getUsername())).build();
        try {
            jwtVerifier.verify(token);
        }catch (JWTVerificationException e){
            throw new ServiceException(Constants.TOKEN_ERROR,"token验证失败，请重新登陆");
        }
        return true;
    }
}
