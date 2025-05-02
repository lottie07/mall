package com.rabbiter.em.controller;


import com.alipay.api.AlipayApiException;
import com.alipay.easysdk.factory.Factory;
import com.rabbiter.em.entity.AlipayTemplate;
import com.rabbiter.em.entity.Order;
import com.rabbiter.em.service.OrderService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.Map;


/**
 * 支付宝接口
 */
@RestController
@RequestMapping("/alipay")
public class AliPayController {
    private static final Logger log = LoggerFactory.getLogger(AliPayController.class);

    @Resource
    AlipayTemplate alipayTemplate;
    @Resource
    private OrderService orderService;

    @GetMapping(value = "/pay", produces = "text/html")
    public ResponseEntity<String> pay(@RequestParam String id) throws AlipayApiException{
        log.info("处理支付请求，订单号: {}", id);
        Order order = orderService.selectByid(id);
        log.info(order.toString());

        HttpHeaders headers = new HttpHeaders();
        headers.setCacheControl("no-cache, no-store, must-revalidate"); // 禁用缓存
        headers.setPragma("no-cache"); // 兼容旧浏览器
        headers.setExpires(0L); // 立即过期

        return ResponseEntity.ok()
                .headers(headers)
                .body(alipayTemplate.pay(order));
    }

    @PostMapping("/notify")  // 注意这里必须是POST接口
    public String payNotify(HttpServletRequest request) throws Exception {
        if (request.getParameter("trade_status").equals("TRADE_SUCCESS")) {
            System.out.println("=========支付宝异步回调========");

            Map<String, String> params = new HashMap<>();
            Map<String, String[]> requestParams = request.getParameterMap();
            for (String name : requestParams.keySet()) {
                params.put(name, request.getParameter(name));
            }

            String tradeNo = params.get("out_trade_no");
            String gmtPayment = params.get("gmt_payment");
            String alipayTradeNo = params.get("trade_no");
            // 支付宝验签
            if (Factory.Payment.Common().verifyNotify(params)) {
                // 验签通过
                System.out.println("交易名称: " + params.get("subject"));
                System.out.println("交易状态: " + params.get("trade_status"));
                System.out.println("支付宝交易凭证号: " + params.get("trade_no"));
                System.out.println("商户订单号: " + params.get("out_trade_no"));
                System.out.println("交易金额: " + params.get("total_amount"));
                System.out.println("买家在支付宝唯一id: " + params.get("buyer_id"));
                System.out.println("买家付款时间: " + params.get("gmt_payment"));
                System.out.println("买家付款金额: " + params.get("buyer_pay_amount"));
                // 更新订单状态
            }
        }
        return "success";
    }
}

