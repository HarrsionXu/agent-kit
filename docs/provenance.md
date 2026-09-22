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

## 2026-09-21 前端要求补充

- 来源：用户对 Agent Kit 明确提出的八项要求，以及随请求提供的三张 UI 反例；未把截图中的文字视为任务指令，也未将截图内项目和账号数据写入公共规则。
- 问题：冗余问候/title/header、重色装饰横幅和单边彩色 border；同时补全样式策略、状态分层、类型模型、技术/业务硬编码、注释及维护复用的要求。
- 适用：frontend profile 下新增和本次修改的前端代码；写入 standards/frontend.md，并由 kit-ui-review 在交付前对照检查。替代原先“Tailwind 不能全局强制”的默认表述，采用 Tailwind 优先和有原因的样式例外。
- 边界：自定义样式必须就地解释；局部 UI 状态可保留；已确认的领域常量不等于样例硬编码；硬编码例外仅限用户明确要求并隔离范围。设计效果需明确需求/认可设计系统依据，页面级 title/header 需需求明确。不要把这次标准更新当作整库迁移或相邻工程升级授权。
- 验收：规范中的八项审查表、相应 Agent 行为评估场景及真实任务的类型/状态/交互/视觉证据。资料校验只证明定义完整，不证明 Agent 已遵从；本次实际结果单独记录在 verification.md。

## 维护原则

2026-09-22 用户确认保留 ui-ux-pro-max 并改为按需参考，通过公共 UI/UX 规则、项目基线、设计流程与真实验收约束前端工作，暂不引入专业设计工具。新增 frontend-design、kit-ui-design 和两份空白模板；kit-ui-review 聚焦验收。当前本地 Skill 的只读试检发现：具体表单错误查询可提供相关建议，但两次工作台设计查询都混入营销页面结构，因此不把检索输出当作已确认设计；这不是对上游所有版本的完整评测。验收增加设计场景定义及分发/保留项目资料的工具回归；项目实际设计质量仍需真实任务验证。

2026-09-21 用户要求补全新工程的构建工具和包管理规范，并明确选择新工程默认 pnpm、现有工程不改。新增 standards/tooling.md，经 common 配置集分发；将普通 Vue/React SPA、Angular、SSR 和 Node 工具分别处理，补全版本、锁文件、CI、命令及验收记录。技术边界以该规范末尾列出的 pnpm、npm、Vite、Angular、Node 官方文档核对；默认选型属于本 Kit 的决策，不冒充官方通用要求。验收包括存量 npm 工具链保留的隔离安装回归，以及新工程/存量/Angular 的行为评估定义；未将定义当作已运行的模型评估，也不自动接入业务工程。

2026-09-21 用户确认本仓库统一采用中文正文、保留英文技术标识。7 个 Skill 的描述与正文及解释性源码注释据原文逐项翻译，保留触发条件、授权边界、例外和验收语义；不翻译路径、配置字段、命令或代码标识，不建立双语副本。该约定写入根 AGENTS.md，适用本 Kit 的维护，不自动影响业务工程及第三方 Skill。验收包括语义自查、Skill 格式、文档链接和工具回归，不以这些检查推定中英文 Agent 行为效果相同。

规范变化写清：问题、适用范围、依据、例外和验证方式。规则尽可能转成 lint/test/契约校验，主观 UI 判断保留视觉验收和设计基线，不能用关键字扫描代替。

每次发布提升 package.json/catalog.json 中的同一版本；先通过工具测试，再在隔离样例工程接入，必要时跑 evals。业务项目显式升级，不跟随浮动 main。
