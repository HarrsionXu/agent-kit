# 交付与验证记录

日期：2026-09-20。环境：本地 macOS、Node v24.5.0。

## 范围

本记录按小节保留各轮工具、资料和显式接入的验证历史。是否接入及哪些检查通过，以对应小节为准，不能把工具检查视为业务验收。

## 已执行

- `npm run check`：资料/链接校验通过，30 项 Node 自动回归全部通过，无跳过。
- 资料检查覆盖 8 profiles、9 rules、7 Skills、版本一致性和本地 Markdown 链接。
- 回归用例包含：默认只读、保留原 AGENTS/手写配置、重复安装、规则漂移、Skills 冲突、override、符号链接、路径越界、版本冲突、升级备份、scope 隔离、显式执行、失败/超时、离线 runtime。
- 三个现有工程分别以 Vue、Vue+admin、backend 做安装预览，均生成计划，`applied: false`；未实际接入。
- Skill Creator 的 `quick_validate.py`：7 个 Skills 均返回 `Skill is valid!`；这证明格式有效，不证明模型执行质量。
- 依据本仓库 kit-review Skill 做了自查，不称为独立 QA。三个参考仓库最终 Git 状态与开始时的文件清单一致；没有把用户原有改动归为本次工作。

## 不属于本次通过范围

- Node 22/Linux 的 CI 已配置，但本地未模拟其运行，也未推送触发远程 CI。
- 没有在参考工程执行真实接口、数据库迁移、审批、发布。
- 没有宣称 Angular/Vue/React 应用构建、浏览器交互、微前端集成测试已完成。
- 行为评估场景已编写，未运行独立模型评估；不提供“规范服从率”。

## 实施发现与处理

- 安装器预检不仅检测符号链接，也检测父路径被普通文件占用，避免写入中途才发现路径冲突。
- 初始项目配置不具备质量门禁，doctor/verify 明确失败，要求补充真实项目命令。
- 已安装版本的内容发生变化必须提升版本；同版本更新被拒绝。
- Skills 独立格式校验需要 PyYAML，系统 Python 与应用 Python 均未预装；使用临时 venv 补充该校验依赖，不把 Python 引入本项目运行时。

## 0.1.1 中性命名与结构说明

- 工程目录、包名、CLI、Skill 描述和安装生成的标题/标记统一为 Agent Kit；工程维护文件检索未发现原公司名称残留。Git 内部元数据不作为批量改写对象。
- 新增 docs/structure.md，逐项说明源工程与接入后目标工程的文件职责。
- `npm run check`：资料/链接校验通过，32 项测试全部通过。新增测试验证历史命名空间标记的升级兼容与摘要保护，版本升级测试不再绑定固定的下一版本号。
- 修改过的 kit-task Skill 再次通过 Skill Creator 的 quick_validate.py 格式校验。
- 本轮未接入、修改或运行三个参考业务工程；没有提交、推送或发布。

## README 结构同步检查

- 完整结构说明移入 README，docs/structure.md 保留旧链接入口；AGENTS 要求结构或职责变化在同一次变更中同步说明。
- 新增结构比对检查并接入现有 `npm run check`，覆盖源文件和目录的遗漏、过期、类型不符，以及结构标记、文件说明缺失等错误；职责描述的语义准确性仍需审查。
- 本地 `npm run check` 通过：37 个源文件与 README 一致，39 项测试全部通过，无跳过。7 项新增测试包含模拟结构漂移报错、更新说明后重新通过、隐藏文件与生成/私有文件排除。
- 补充业务文档归属、catalog 与项目配置的分工、ticket 的适用范围；未创建业务 ticket，也未改变 catalog 格式或分发内容，版本仍为 0.1.1。
- 这次按 kit-task/kit-review 完成任务闭环与自查，未运行远程 CI、独立 Agent 行为评估或业务工程验收；未修改业务工程。

## 结构说明的最终归属

- 按最新确认，逐文件说明统一维护在 docs/structure.md，README 只保留概览和链接；历史小节记录此前调整，不代表当前维护入口。
- 同步迁移 AGENTS 规则、结构检查的读取路径、错误提示和测试 fixture。新增测试确认 README 中的旧树不能替代 docs/structure.md。
- 本地 `npm run check` 通过：37 个源文件与结构说明一致，40 项测试全部通过，无跳过；文档链接检查通过。
- 本轮按 kit-task/kit-review 自查迁移完整性；不涉及业务工程、分发内容或远程发布。

## 0.1.2 风险分级流程明确化

- 保留产品、架构、实现、验证四种职责，取消默认逐角色停顿；明确按任务风险裁剪流程、用户分步要求、关键决策与外部授权边界，以及“继续”的恢复语义。
- 工作区入口 `/Users/xuhongzhuang/Documents/GitHub/AGENTS.md` 同步写入默认流程并保留原工程路由；Kit 自身入口增加 workflow 必读。业务工程、全局 Codex 配置和 Skills 正文未修改，未自动向相邻项目分发。
- README 和架构说明引用 workflow，结构说明同步职责与评估数量。分发规范发生变化，package.json/catalog.json 同步升至 0.1.2；版本仅在本地更新，未发布。
- 新增 3 个行为评估定义：小修改连续交付、用户明确要求分步时暂停、未确定安全边界需要确认。连同既有诊断只读和迁移授权场景，共 11 个定义；未运行独立模型行为评估。
- 按 kit-task/kit-review 完成闭环与自查。本地 `npm run check` 通过：40 项工具/结构测试全部通过，无跳过；8 profiles、9 rules、7 Skills、11 个评估定义、本地文档链接和 37 个源文件结构校验通过。
- 对工作区入口、Kit 规范/文档及参考工程根 AGENTS 做旧强制停顿措辞检索，未发现所检索的强制语句；这不是所有历史对话、全局配置或嵌套规则的完整审计。
- 未做业务构建、浏览器验收或远程 CI。新规范不自动覆盖已安装的固定版本或旧对话指令；目标项目需显式升级并核对实际有效规则。

## 0.1.2 两个前端工程的本地接入

- 本轮经用户明确授权接入 Supply Chain Front 与 Apps；未接入 Operation/Backend，未发布、推送、提交或修改全局配置。
- 两个目标分别使用 common/frontend/vue 与 common/frontend/angular/microfrontend，均固定 0.1.2，安装 4 个 Kit Skills。保留既有规则和 Skills，统一项目入口中的历史流程措辞，未改变框架、包管理器或业务实现。
- Front 填写 3 个目录 scopes、3 个必需检查；Apps 填写 40 个 scopes、2 个必需检查，微前端范围与 36 个实际 Federation 应用逐项一致。项目事实、验收结论和局限保留在各自 .agent-kit/project.md 与 onboarding.md；公共规则未增加业务专属配置。
- 两边完整性、doctor、只读 verify 预览通过；配置状态为 configured，不把该状态称为业务通过。再次安装预览均为 applied=false、files=[]，手写配置未被重置。
- Front 显式 verify 返回 passed=false、退出码 1：diff-hygiene 通过，采购静态检查有 4 处既有间距违规；core 测试 85 项通过，4 个测试文件因无扩展名 TypeScript 导入而加载失败，无跳过。未删测试、放宽检查或改业务文件。
- Apps 显式 verify 返回 passed=true、退出码 0：diff-hygiene 和 EPC Shell 2 个套件的 26 项测试通过，无跳过。禁用 Nx daemon、本地/远程任务缓存；并非全部应用、模板构建或 Federation 集成通过。
- Front 接入前 25 个用户改动/新增文件逐一 SHA-256 比对未变；Apps 原 Nx 自动管理区块逐字保留。原 AGENTS 已由安装器备份。
- 本地 npm run check 通过：40 项工具/结构测试、资料及链接检查通过。安装副本可在本项目离线运行，不依赖中央工程路径。
- 按 kit-task/kit-review 完成接入闭环与自查，未做独立 Agent 行为评估、全量业务构建、浏览器验收、真实接口或远程 CI。Front 基线缺口保留为后续独立任务，不因本轮接入扩大修改范围。

## 0.1.3 前端编码与设计要求

- 日期：2026-09-21。按用户八项要求扩展 frontend 规范：Tailwind 优先及自定义样式注释、需求指定页面标题、克制视觉风格、状态与 UI 分离、TypeScript 模型、禁止技术/业务硬编码、复杂逻辑注释及维护复用；补充逐项审查表和合理例外。
- 同步 kit-ui-review、README、来源与结构说明；package.json/catalog.json 升至 0.1.3。新增 4 个行为评估定义，共 15 个；未把定义校验称为模型行为通过。
- `npm run check` 通过：40 项工具/结构测试全部通过，无跳过；8 profiles、9 rules、7 Skills、15 个评估定义、本地文档链接和 37 个源文件结构校验通过。既有工具测试在隔离临时项目验证安装、摘要和升级行为。
- Skill Creator 的 `quick_validate.py` 对修改后的 kit-ui-review 返回 `Skill is valid!`；`git diff --check` 通过。按 kit-task/kit-review 对八项覆盖、框架规则兼容性和例外边界做自查，不称为独立审查。
- 本轮只修改 Kit 规范与配套资料，未改工具运行逻辑；未运行独立模型行为评估、业务应用构建或浏览器验收。未升级相邻工程的固定副本，未提交、推送或发布。

## 0.1.4 中文文档与注释统一

- 日期：2026-09-21。用户确认采用中文正文、保留英文技术标识；7 个 Skill 的 description、标题和操作说明全部转为中文，保留上一轮新增的前端审查要求。根 AGENTS.md 增加持续维护约定，README、来源及结构说明同步。
- 翻译 4 个源码/测试文件中的解释性注释。去除独立行注释后与 Git HEAD 逐文件比对，内容完全一致；没有改动可执行逻辑、错误消息、诊断字段或测试断言。package.json/catalog.json 同步升至 0.1.4。
- `npm run check` 通过：40 项工具/结构测试全部通过，无跳过；8 profiles、9 rules、7 Skills、15 个评估定义、文档链接和 37 个源文件结构校验通过。Skill Creator 的 `quick_validate.py` 对 7 个 Skill 均返回 `Skill is valid!`；`git diff --check` 通过。
- 按 kit-task、kit-review 和 Skill Creator 对原文/译文做语义自查，检查触发条件、规则力度、授权与例外、验证要求；不是独立审查，也未运行中英文模型行为对照评估，不能据此宣称两种语言的执行效果完全相同。
- 未自动升级业务工程或第三方 Skill，未修改全局配置，未提交、推送或发布。

## 0.1.5 新工程工具链与存量边界

- 日期：2026-09-21。用户确认新建 JS/TS 工程默认 pnpm、存量工程不迁移。新增 tooling 标准，明确按工程形态选择构建链、Node/工具版本锁定、锁文件、CI 不可变安装、脚本和产物验收；现有仓库中的新模块继续沿用根工具链。
- common 配置集新增 tooling，安装生成的 AGENTS 入口同步；更新框架规范、项目事实模板、kit-task/kit-review 和相关文档。package.json/catalog.json 同步升至 0.1.5，Kit 自身继续使用 npm，未安装任何新运行时依赖。
- `npm run check` 通过：41 项工具/结构测试全部通过，无跳过；8 profiles、10 rules、7 Skills、18 个行为评估定义、文档链接和 38 个源文件结构校验通过。新增隔离回归验证 tooling 被分发和锁定、重复接入幂等，且存量 npm 工程的 package.json、package-lock.json、Webpack 和 CI 文件逐字保留，没有新增 pnpm/Vite 配置。
- 修改的 kit-task、kit-review 均通过 Skill Creator 的 quick_validate.py；`git diff --check` 通过。按上述 Skills 自查新旧工程边界、默认值、规则加载路径和文档一致性，不称为独立审查。
- 新增 3 个模型行为评估定义，分别覆盖新工程默认选型、存量工具链保留和 Angular 构建边界；未运行独立模型行为评估，也未实际创建/构建业务应用。官方技术文档核对不等于已经验证所有版本组合。
- 未修改相邻业务仓库、全局包管理器或配置，未自动升级已接入副本，未提交、推送或发布。

## 0.1.6 UI / UX 设计流程与按需参考

- 日期：2026-09-22。用户确认保留 ui-ux-pro-max，但取消全 UI 必用要求，采用项目基线、设计流程和真实验收。新增 frontend-design 规则、kit-ui-design、design-baseline/ui-design 空白模板；kit-ui-review 聚焦验收，task/review 同步路由。frontend 配置集包含新规则和 Skill，版本升至 0.1.6；未改变安装器执行逻辑或新增运行时依赖。
- 新页面和关键交互的新设计先交付可操作原型，已有确认不重复索取；小调整沿用基线连续完成。默认在浏览器设计，原型使用隔离合成数据，不引入专业设计工具。样板必须有认可依据；模板存在不代表基线已确认。
- 同步 Supply Chain Front 的 AGENTS 与 frontend-design-principles 两处项目文档，取消强制引用并补充项目设计流程；通过明确项目例外替代旧规则，而非篡改受管理副本。已安装 Kit 仍为 0.1.2，中央 CLI 的 check 返回 intact；未分发新版 Skill 到业务工程，也未升级其他项目。
- 修改前快照比对显示，该业务工程原有 22 个无关的未提交/新增文件字节未变；只改两份指定文档。第三方 ui-ux-pro-max 目录相对 Git 无差异，保留其原始文件。项目文档链接和两仓库的 git diff --check 通过。
- `npm run check` 通过：42 项工具/结构测试全部通过，无跳过；8 profiles、11 rules、8 Skills、23 个行为评估定义、文档链接和 42 个源文件结构校验通过。新增隔离测试验证前端设计资源分发与摘要、项目自有基线/第三方 Skill 保留、重复接入幂等，以及后端配置不安装设计 Skill。
- 新增/修改的 kit-ui-design、kit-ui-review、kit-task、kit-review 均通过 Skill Creator 的 quick_validate.py。初次执行因当前 Python 缺少 PyYAML 失败，随后在临时 venv 安装固定版本 PyYAML 6.0.2 后重验通过；未改全局 Python 或业务依赖。
- 按 kit-task、kit-review 和 Skill Creator 对引用、设计确认边界、无样板回退、原型隔离、可选参考与只读审查进行自查；不是独立审查。新增 5 个行为评估定义，未运行独立模型行为评估；本轮无业务 UI 改动，未做业务应用构建或浏览器验收，不宣称已验证实际设计效果。未提交、推送或发布。
