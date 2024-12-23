组件库：element-plus
目标文档：需求文档和用户故事文档
页面设计规范：design_guideline/page_design_guideline.md文档
具体页面分析目录：page_analysis，比如用户指定了login页面，就阅读和login相关的文档。
api文档目录：api_specs,api文档里声明的api，都已经在{工程项目}/src/api目录下实现了。无需再实现。
代码实现目录：{工程项目}/src

阅读上述提到的相关文档，理解页面设计规范，根据用户指定要实现的页面，以及要在哪个工程底下实现。 完成页面功能实现。
 - 理解项目整体结构，确保在正确的目录下实现页面。
 - 页面里要通过API交互的地方，都通过api/api-config.js来获取API对象去处理。注意传入的参数类型要和api里的声明一致。
    - 仔细阅读下api-config.js，确保使用的是正确的API对象。
    - api文件之前都已经完整构建，你无需考虑如何改动它，只需要使用它。
