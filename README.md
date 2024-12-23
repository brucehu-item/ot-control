# OT-Control 前端项目构建方法论

## ⚠️ 重要提示

重要的事情说3遍，唯一重要的事情说300遍：

当你使用AI完成了一个步骤之后，一定要花费精力去和AI生成的结果对齐，确保生成的内容是符合你预期的。不对齐的结果是后续的步骤会基于前面错误的结果持续进行，导致你得花费更多的时间去修正。🔁 x300

## 📖 项目简介

这个项目描述了一个框架逻辑，用于实现从需求文档到前端代码的完整实现。整个过程涉及多个步骤，每个步骤都使用特定的prompt来指导AI完成。

目前这套方法论可以帮助完成构建一个前端项目80%-85%的工作量。框架结构和每个步骤的提示词都还有优化空间，这将是一个不断迭代的过程。

已实现的项目：
- `ot-control-bruce`：使用此方法论构建的完整前端项目，实现了需求文档中的绝大多数功能
- `ot-control-init`：空项目模板，供需要尝试这套方法论的人使用

## 🗂️ 项目结构

```
ot-control-web/
├── 🏭 ot-control-bruce/  Bruce按照方法论实现加班管理系统的前端项目目录
├── 📝 docs/              一些补充性的文档目录
├── 🎯 api_specs/         API接口说明书，前后端的"合同"
├── 🧩 domain_analysis/   领域分析文档，通往代码实现的桥梁
├── 🎨 design_guideline/  设计规范指南，包含前端和API的规范
├── 📊 page_analysis/     页面分析文档, 每个前端页面的实现说明书
├── 🤖 prompt/            AI提示词相关文档
├── 🎭 mock_data/         模拟数据，可以让前端独立于后端进行测试
├── 🌱 ot-control-init/   初始化项目工程，供需要使用这套方法论的人使用
├── 📋 requirement.md     需求文档
└── 📚 user_stories.md    用户故事文档
```

## 🚀 构建步骤

1. **项目初始化**
   - 根据选择的技术栈生成空项目结构
   - 可选技术栈：
     - 前端构建工具: vite
     - 组件库: element-plus
     - 状态管理: pinia
     - 路由: vue-router
     - 请求: axios
     - 其他
   - 或直接使用提供的 `ot-control-init` 项目模板

2. **领域分析与设计**
   - 使用 `prompt/1_domain_analysis_prompt.md` 生成领域建模设计
   - 使用 `prompt/2_user_story_prompt.md` 生成用户故事

3. **API设计与实现**
   - 使用 `prompt/3_build_api_specs_prompt.md` 生成API文档
   - 使用 `prompt/6_develop_api_prompt.md` 实现API（包含真实和mock两套实现）

4. **页面设计与实现**
   - 使用 `prompt/4_build_page_guideline_prompt.md` 生成页面设计规范
   - 使用 `prompt/5_build_mock_data_prompt.md` 生成Mock数据
   - 使用 `prompt/7_build_page_prompt.md` 实现具体页面

5. **调试优化**
   - 根据错误信息让AI调整实现

## 🔍 本地运行

如果你想在本地运行 `ot-control-bruce` 项目，请参考 `ot-control-bruce/README.md`
