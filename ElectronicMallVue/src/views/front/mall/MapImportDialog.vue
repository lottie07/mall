<template>
    <el-dialog
        title="导入"
        :visible.sync="visible"
        width="80%"
        @close="handleClose"
    >
        <el-upload
            class="upload-demo"
            action="#"
            :show-file-list="false"
            :auto-upload="false"
            :on-change="handleImageUpload"
            accept="image/*"
        >
            <el-button size="small" type="primary">点击上传</el-button>
            <div slot="tip" class="el-upload__tip">
                支持JPG/PNG格式图片，最大5MB
            </div>
        </el-upload>
        <div class="editor-container" v-if="imageUrl">
            <div
                class="image-container"
                ref="imageContainer"
                @mousemove="handleDrag"
                @mouseup="stopDrag"
                @mouseleave="stopDrag"
            >
                <img
                    :src="imageUrl"
                    alt="上传的图片"
                    ref="image"
                    @load="initFirstShop"
                >
                <!-- 遍历所有店铺 -->
                <div
                    v-for="(shop, shopIndex) in shops"
                    :key="'shop-' + shopIndex"
                    class="shop-container"
                >
                    <!-- 控制点 -->
                    <div
                        v-for="(point, pointIndex) in shop.points"
                        :key="'point-' + shopIndex + '-' + pointIndex"
                        class="control-point"
                        :style="{
                            left: point.x + 'px',
                            top: point.y + 'px',
                            backgroundColor: colors[shopIndex % colors.length]
                        }"
                        @mousedown="startDrag(shopIndex, pointIndex, $event)"
                    ></div>
                    <!-- 多边形 -->
                    <svg class="polygon" v-if="shop.points.length > 1">
                        <polygon
                            :points="getShopPolygon(shopIndex)"
                            :fill="`rgba(${hexToRgb(colors[shopIndex % colors.length])}, 0.3)`"
                            :stroke="colors[shopIndex % colors.length]"
                        />
                    </svg>
                </div>
            </div>
            <div class="property-sidebar">
                <div class="tabs-container">
                    <el-tabs v-model="activeShop" type="card">
                        <el-tab-pane
                            v-for="(shop, index) in shops"
                            :key="index"
                            :label="'店铺' + (index + 1)"
                            :name="index.toString()"
                        >
                            <el-form label-position="top">
                                <el-form-item :label="'店铺' + (index + 1) + 'X坐标'">
                                    <el-input v-model.number="shop.shopX" @input="updatePointsFromShopData(index)"></el-input>
                                </el-form-item>
                                <el-form-item :label="'店铺' + (index + 1) + 'Y坐标'">
                                    <el-input v-model.number="shop.shopY" @input="updatePointsFromShopData(index)"></el-input>
                                </el-form-item>
                                <el-form-item :label="'店铺' + (index + 1) + '长度'">
                                    <el-input v-model.number="shop.shopWidth" @input="updatePointsFromShopData(index)"></el-input>
                                </el-form-item>
                                <el-form-item :label="'店铺' + (index + 1) + '宽度'">
                                    <el-input v-model.number="shop.shopHeight" @input="updatePointsFromShopData(index)"></el-input>
                                </el-form-item>
                                <el-form-item :label="'店铺' + (index + 1) + '名称'">
                                    <el-input v-model="shop.shopName"></el-input>
                                </el-form-item>
                                <el-form-item :label="'店铺' + (index + 1) + '楼层'">
                                    <el-input v-model="shop.shopFloor"></el-input>
                                </el-form-item>
                            </el-form>
                        </el-tab-pane>
                    </el-tabs>
                </div>
                <div class="button-group">
                    <el-button type="primary" @click="addNewShop">添加</el-button>
                    <el-button type="success" class="confirm-btn" @click="confirmShops">确认导入</el-button>
                </div>
            </div>
        </div>
    </el-dialog>
</template>

<script>
import API from '@/utils/request';
export default {
    props: {
        visible: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            imageUrl: '',
            shops: [],
            activeShop: '0',
            draggingShop: 0,
            draggingIndex: -1,
            containerRect: null,
            colors: ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#909399']
        }
    },
    computed: {
        currentShop() {
            return this.shops[parseInt(this.activeShop)] || {}
        }
    },
    watch: {
        currentShop: {
            handler(newVal) {
                if (!newVal.points) return;
                const points = newVal.points;
                if (points.length < 1) return;

                newVal.shopX = Math.min(...points.map(p => p.x));
                newVal.shopY = Math.min(...points.map(p => p.y));
                newVal.shopWidth = Math.max(...points.map(p => p.x)) - newVal.shopX;
                newVal.shopHeight = Math.max(...points.map(p => p.y)) - newVal.shopY;
            },
            deep: true
        }
    },
    methods: {
        confirmShops() {
        const shopsToSend = this.shops.map(shop => ({
            floor: String(shop.shopFloor || ''), 
            shopName: shop.shopName || '',
            x: Number(shop.shopX) || 0,
            y: Number(shop.shopY) || 0,
            width: Math.max(0, Number(shop.shopWidth)) || 0,
            height: Math.max(0, Number(shop.shopHeight)) || 0,
            shape: 'rect'
        }));

        const loading = this.$loading({
            lock: true,
            text: '保存中...',
            spinner: 'el-icon-loading'
        });

        this.request.post('/api/shops', shopsToSend)
            .then(response => {
            loading.close();
            if (response.code == 200) { 
                this.$message.success(response.msg || '保存成功');
                this.handleClose();
                this.$emit('shops-saved'); 
                console.log("保存成功")
            } else {
                this.$message.error(response.msg || '保存失败');
            }
            })
            .catch(error => {
            loading.close();
            console.error('请求失败:', error);
            
            let errorMsg = '请求失败';
            if (error.response) {
                errorMsg = `服务器错误: ${error.response.status}`;
            } else if (error.request) {
                errorMsg = '网络连接失败';
            }
            
            this.$message.error(errorMsg);
            });
        },
        handleClose() {
            this.$emit('update:visible', false);
            this.imageUrl = '';
            this.shops = [];
        },

        addNewShop() {
            const basePoints = this.shops[0]?.points || [];
            const newShop = {
                points: JSON.parse(JSON.stringify(basePoints)),
                shopX: 0,
                shopY: 0,
                shopWidth: 0,
                shopHeight: 0,
                shopName: '',
                shopFloor: 1
            };
            this.shops.push(newShop);
            this.activeShop = (this.shops.length - 1).toString();
        },

        getShopPolygon(index) {
            return this.shops[index].points.map(p => `${p.x},${p.y}`).join(' ');
        },

        hexToRgb(hex) {
            const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result
              ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
                : '64, 158, 255';
        },

        startDrag(shopIndex, pointIndex, e) {
            this.draggingShop = shopIndex;
            this.draggingIndex = pointIndex;
            e.preventDefault();
        },

        handleDrag(e) {
            if (this.draggingIndex === -1) return;

            const container = this.$refs.imageContainer;
            const rect = container.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            this.shops[this.draggingShop].points.splice(this.draggingIndex, 1, {
                x: Math.max(0, Math.min(x, container.clientWidth)),
                y: Math.max(0, Math.min(y, container.clientHeight))
            });
            this.updateShopDataFromPoints(this.draggingShop);
        },

        stopDrag() {
            this.draggingIndex = -1;
        },

        handleImageUpload(file) {
            const isImage = file.raw.type.startsWith('image/');
            const isLt5M = file.raw.size / 1024 / 1024 < 5;

            if (!isImage) {
                this.$message.error('只能上传图片文件!');
                return false;
            }
            if (!isLt5M) {
                this.$message.error('图片大小不能超过5MB!');
                return false;
            }

            this.imageUrl = URL.createObjectURL(file.raw);
            return false;
        },

        initFirstShop() {
            const img = this.$refs.image;
            this.containerRect = this.$refs.imageContainer.getBoundingClientRect();

            // 初始化第一个店铺
            const initialPoints = [
                { x: 10, y: 10 },
                { x: img.width - 10, y: 10 },
                { x: img.width - 10, y: img.height - 10 },
                { x: 10, y: img.height - 10 }
            ];

            this.shops = [{
                points: initialPoints,
                shopX: 10,
                shopY: 10,
                shopWidth: img.width - 20,
                shopHeight: img.height - 20,
                shopName: '',
                shopFloor: 1
            }];
        },
        updateShopDataFromPoints(shopIndex) {
            const shop = this.shops[shopIndex];
            const points = shop.points;
            if (points.length < 1) return;

            shop.shopX = Math.min(...points.map(p => p.x));
            shop.shopY = Math.min(...points.map(p => p.y));
            shop.shopWidth = Math.max(...points.map(p => p.x)) - shop.shopX;
            shop.shopHeight = Math.max(...points.map(p => p.y)) - shop.shopY;
        },
        updatePointsFromShopData(shopIndex) {
            const shop = this.shops[shopIndex];
            const points = shop.points;
            if (points.length < 1) return;

            points[0].x = shop.shopX;
            points[0].y = shop.shopY;
            points[1].x = shop.shopX + shop.shopWidth;
            points[1].y = shop.shopY;
            points[2].x = shop.shopX + shop.shopWidth;
            points[2].y = shop.shopY + shop.shopHeight;
            points[3].x = shop.shopX;
            points[3].y = shop.shopY + shop.shopHeight;
        }
    }
}
</script>

<style scoped>
.editor-container {
    display: flex;
    gap: 20px;
    margin-top: 20px;
    height: 80vh;
    align-items: stretch;
}

.image-container {
    flex: 1;
    border: 1px dashed #ddd;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
    position: relative;
    margin: 0;
    height: 100%;
}

.property-sidebar {
    width: 300px;
    height: 100%;
    display: flex;
    flex-direction: column;
    border-left: 1px solid #ebeef5;
}

.tabs-container {
    flex: 1;
    overflow-y: auto;
}

.control-point {
    position: absolute;
    width: 12px;
    height: 12px;
    border: 2px solid white;
    border-radius: 50%;
    cursor: move;
    transform: translate(-50%, -50%);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    z-index: 2;
}

.polygon {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
}

.button-group {
    display: flex;
    gap: 10px;
    padding: 20px 0;
    background: white;
    border-top: 1px solid #ebeef5;
    margin-top: auto; 
}

.confirm-btn {
    flex-shrink: 0;
}
</style>    