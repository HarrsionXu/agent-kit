# 来源、抽象与保留差异

提炼日期：2026-09-20。来源是工作区当时的文件，不是声称它们永远最新；未修改来源仓库。它们存在用户未提交改动，不能将 Git HEAD 当作全部输入快照。

| 已读取来源 | 提炼到 | 未全局化的内容 |
| --- | --- | --- |
| front/AGENTS.md、front-ui/shared-core Skills、design-system、browser-compat | common、frontend、vue、kit-ui-review | OS 组件限定、固定根字号、具体浏览器版本 |
| front/docs/frontend-engineering-standards.md、frontend-design-principles.md、agent-development-workflow.md | workflow、frontend、task 模板 | 项目端口和某个模块专属门禁 |
| front/commit-message Skill 及 reference | common 的可读变更说明 | 单一提交语言硬约束 |
| operation/AGENTS.md、scaffold-crud、supplier-workbench | admin、kit-crud | Element Plus 作为全部项目默认库 |
| operation/import-troubleshoot | kit-import-diagnose | 具体供应商导入路径和数据 |
| backend/AGENTS.md、api-contract-sync | backend、kit-api-contract | 固定部署主机、认证服务策略 |
| backend/new-nest-module、prisma-migration | backend、kit-data-change | 固定迁移序号、跨环境自动迁移授权 |

表中 front/operation/backend 分别指用户指定的三个同级 Supply Chain 仓库。仅提炼方法和约束，没有整体复制所有 Skills；未把第三方 ui-ux-pro-max 或它的数据脚本打包进来。

Angular、React、微前端规范为此次补充的指导性配置集，不是从这三个 Vue/Nest 仓库证明出来的框架实现。不宣称已完成框架迁移或微前端 PoC。

## 维护原则

规范变化写清：问题、适用范围、依据、例外和验证方式。规则尽可能转成 lint/test/契约校验，主观 UI 判断保留视觉验收和设计基线，不能用关键字扫描代替。

每次发布提升 package.json/catalog.json 中的同一版本；先通过工具测试，再在隔离样例工程接入，必要时跑 evals。业务项目显式升级，不跟随浮动 main。
