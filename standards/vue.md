# Vue 实现标准

适用 Vue 路径。Vue 版本、Options/Composition API、Pinia 及组件库遵从目标工程，不自动批量重构。

新建客户端 SPA 按 [工具链标准](tooling.md) 使用 pnpm、Vite 和 TypeScript；SSR/SSG 使用所选框架官方构建链。存量工程保留原有工具。

- HTTP：复用集中客户端/API 模块；不在页面另建 axios 或复制 token/签名。PureHttp 与 libs/core 客户端是不同项目的适配，不互相覆盖。
- 路由：Vue Router 按业务域组织；明确 params/query 与状态来源，列表返回保留筛选分页，动态权限菜单与 guard 一致。
- 状态：ref/computed 管局部，Pinia 管需要共享的客户端状态；服务端缓存及刷新策略单独定义，避免 Store 堆积全部响应。
- composable 以 use 开头，封装有边界的交互/适配，不在跨框架共享纯规则中引入 Vue 响应式依赖。
- watch、监听和上传任务处理竞态与清理；异步结果不能覆盖已切换的资源。
- 组件 PascalCase，props/emits 明确类型，避免子组件修改父级状态与隐式全局事件总线。
- 表单遵循项目组件库，显式 payload allowlist，处理二次提交、字段错误、取消与 staged 资源删除。
- 验证包括 vue-tsc/项目等效检查、业务映射测试及实际 DOM 交互；Vite 转译不是类型验证。

不要将供应链前台的 20px root、Element Plus 白名单或后台中文限定推广到其他 Vue 工程。
