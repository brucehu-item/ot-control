阅读需求文档和用户故事文档，阅读api_specs目录下的api文档，帮我分析我们需要实现哪些页面。

组件库:element plus
前端框架:vue
主色系：紫色

页面主要在电脑端访问，设计规范除了考虑功能性，还应尽可能保证页面看起来简洁大气。
页面在颜色，字体，组件样式，布局规则等设计语言上保持统一。以确保各个页面在效果和风格上保持统一性和一致性。
对于一些很多页面都共有的部分，比如用户信息，登出，导航栏，侧边栏等，每个页面要保持一致。
对于每个页面需要遵循的规范，生成一个page_design_guideline.md文档，文档放在design_guideline目录下。

每个页面需要描述的功能包括：
  - 页面名称
  - 页面功能
  - 页面布局
  - 页面导航
  - 页面元素
  - 页面交互效果
  - 页面数据与api的对接
每个页面生成一个描述文档，文档放在page_analysis目录下，文档名称为页面名称.md。比如login页面，就生成login.md文档。

额外说明：
  - 如果你使用颜色代码来描述颜色，请附加说明这个代码代表的是什么颜色。
  - 在你得出最终的设计规范之前，请你结合我们的目标，一步一步给出你的分析，你给的这个方案是如何达成我们的目标的。