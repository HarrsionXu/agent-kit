# 微前端边界

这是架构/验收配置集，不负责安装 Federation 插件或选择构建工具。

- 按业务域和独立发布需要拆分，不按单个页面/每个按钮拆微应用。
- Shell 管顶层导航、应用加载和会话协调；子应用拥有内部路由与状态。统一 base path、深链刷新、返回与卸载协议。
- 跨框架复用纯 TS 契约、业务规则和设计 token；不要共享可变全局 Store、DI 容器或跨框架组件实例。
- mount/unmount（或 Web Component）约定 props、事件、版本兼容和资源清理。样式隔离与安全隔离不是同一回事。
- 依赖共享使用明确 allowlist 和版本政策；shareAll/singleton 不是无需成本的默认答案，实测首载与冲突。
- 每个远程有加载超时、失败兜底、重试策略、不可变资源版本和回滚路径。manifest 更新与缓存策略必须配套。
- API host、资源 public path、CORS 和认证域分别验证；前端微应用不是权限沙箱。
- Angular CLI/Native Federation 与 Vite/Module Federation 的组合必须 PoC，不能按名称认为协议互通。
- 最小集成验收：独立启动、组合加载、生产构建、深链刷新、切换/卸载、远程失效、版本兼容、回滚；不因开发 HMR 正常就视为上线可用。
