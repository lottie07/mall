<template>
  <div class="payment-container">
    <table class="order-info">
      <tr>
        <th>订单号</th>
        <td>{{ orderNo }}</td>
      </tr>
      <tr>
        <th>金额</th>
        <td>{{ money }} 元</td>
      </tr>
    </table>
    <hr class="divider">
    <div class="payment-methods">
      <h3>支付方式：</h3>
      <div class="payment-icons">
        <img 
          src="../../../resource/img/微信支付.png" 
          alt="微信支付"
          class="payment-icon"
          @click="handleWechatPay"
        >
        <img 
          src="../../../resource/img/支付宝.png" 
          alt="支付宝"
          class="payment-icon"
          @click="handleAlipay"
        >
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "PaymentPage",
  data() {
    return {
      orderNo: '',
      money: 0
    }
  },
  created() {
    this.initPaymentData()
  },
  methods: {
    initPaymentData() {
      const { money, orderNo } = this.$route.query
      this.orderNo = orderNo || ''
      this.money = parseFloat(money || 0).toFixed(2)
    },

    async handleAlipay() {
      const timestamp = new Date().getTime();
      const paymentUrl = `http://localhost:9191/alipay/pay?id=${this.orderNo}&_t=${timestamp}`
      this.request.get(paymentUrl)
      window.open(paymentUrl)
    },

    async handleWechatPay() {
      try {
        const { code, msg } = await this.request.get(`/api/order/paid/${this.orderNo}`)
        
        if (code === 200) {
          this.$message.success(`支付成功 ¥${this.money}`)
          this.$router.replace("/orderlist")
        } else {
          this.$message.error(msg || '支付失败，请重试')
        }
      } catch (error) {
        console.error('支付请求失败:', error)
        this.$message.error('支付请求失败，请检查网络')
      }
    }
  }
}
</script>

<style scoped>
.payment-container {
  width: 50%;
  margin: 20px auto;
  padding: 20px;
  background-color: white;
  text-align: center;
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
  border-radius: 8px;
}

.order-info {
  margin: 20px auto;
  border-collapse: collapse;
}

.order-info th,
.order-info td {
  padding: 12px 24px;
  border-bottom: 1px solid #eee;
}

.order-info th {
  font-weight: 600;
  color: #666;
}

.divider {
  width: 80%;
  margin: 20px auto;
  border: 0;
  border-top: 1px solid #eee;
}

.payment-methods {
  margin-top: 24px;
}

.payment-icons {
  display: flex;
  justify-content: center;
  gap: 60px;
  margin-top: 16px;
}

.payment-icon {
  width: 50px;
  height: 50px;
  cursor: pointer;
  transition: transform 0.2s;
}

.payment-icon:hover {
  transform: scale(1.1);
}
</style>