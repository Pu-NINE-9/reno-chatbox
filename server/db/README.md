
# Drizzle ORM MySQL 通用完整查询语句（Markdown注释版）

## 完整万能查询模板（包含所有常用查询语法）

```typescript
// 通用完整 SELECT 查询语法，覆盖单表、联表、条件、分页、排序、分组、去重
await db.select({
    // 自定义返回字段，不传对象直接 db.select() 查询表全部字段
    id: user.id,
    username: user.username,
    age: user.age,
    createTime: user.createTime
})
.distinct() // 可选：数据去重，删除重复行
.from(user) // 必填：主查询数据表
.leftJoin(order, eq(user.id, order.userId)) // 可选联表：left左连接 / inner内连接 / right右连接
.where(
    // 条件过滤核心，and同时满足、or满足任意一条
    and(
        eq(user.status, 1),        // 等于
        ne(user.age, 0),           // 不等于
        gte(user.age, 18),        // 大于等于
        lt(user.age, 60),          // 小于
        like(user.username, "%云%"), // 模糊匹配
        inArray(user.id, [1, 2, 3]),// in 多值匹配
        isNotNull(user.phone)      // 不为空 / isNull 为空
    )
)
.groupBy(user.status) // 可选：分组统计，搭配count/sum/avg等聚合函数
.having(gt(count(), 5)) // 可选：分组后过滤，仅支持聚合字段条件
.orderBy(user.createTime.desc, user.id.asc) // 排序：desc降序、asc升序，多字段逗号分隔
.limit(10)  // 分页：每页展示条数
.offset(0)  // 分页偏移量，第1页0、第2页10、第3页20
.first();   // 简写：只取匹配第一条，等同于 limit(1)
```

## 配套条件运算符导入

```typescript
// 查询条件函数统一引入
import {
    eq, ne, gt, gte, lt, lte,
    and, or, like, inArray, isNull, isNotNull, count
} from "drizzle-orm";
```

## 关键避坑注释

1. 禁止将 `db`、数据表 `user` 对象直接接口返回，存在循环引用，JSON序列化报错
2. `delete` / `update` 不加 where 会清空/修改整张表，生产环境慎用
3. `.first()` 返回单条对象，不加则返回数组
4. `having` 只能写在 `groupBy` 之后，仅能过滤聚合统计字段
