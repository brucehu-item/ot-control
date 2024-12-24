# OT-Control Frontend Project Building Methodology

## ⚠️ Important Notice

Important things need to be said 3 times, the only important thing needs to be said 300 times:

When you complete a step using AI, you must spend effort to align with the AI-generated results and ensure the generated content meets your expectations. Misaligned results will cause subsequent steps to continue based on previous incorrect results, forcing you to spend more time making corrections. 🔁 x300

## 📖 Project Introduction

This project describes a framework logic for implementing complete frontend code from requirement documents. The entire process involves multiple steps, with each step using specific prompts to guide AI completion.

Currently, this methodology can help complete 80%-85% of the work in building a frontend project. The framework structure and prompts for each step still have room for optimization, which will be an ongoing iterative process.

## 🚀 Implemented Projects

### `ot-control-bruce`
A complete frontend project built using this methodology, implementing most of the functionalities in the requirement document.

### `ot-control-init`
Empty project template for those who want to try this methodology.

## 🗂️ Project Structure

```
ot-control-web/
├── 🏭 ot-control-bruce/  Bruce's frontend project directory for overtime management system
├── 📝 docs/              Supplementary documentation directory
├── 🎯 api_specs/         API specification documents, the "contract" between frontend and backend
├── 🧩 domain_analysis/   Domain analysis documents, the bridge to code implementation
├── 🎨 design_guideline/  Design specification guide, including frontend and API standards
├── 📊 page_analysis/     Page analysis documents, implementation specifications for each frontend page
├── 🤖 prompt/            AI prompt-related documents
├── 🎭 mock_data/         Mock data for frontend testing independent of backend
├── 🌱 ot-control-init/   Initial project template for those who want to use this methodology
├── 📋 requirement.md     Requirement document
└── 📚 user_stories.md    User stories document
```

## 🚀 Building Steps

1. **Project Initialization**
   - Generate empty project structure based on chosen tech stack
   - Available tech stack:
     - Frontend build tool: vite
     - Component library: element-plus
     - State management: pinia
     - Router: vue-router
     - HTTP client: axios
     - Others
   - Or directly use the provided `ot-control-init` project template

2. **Domain Analysis and Design**
   - Use `prompt/1_domain_analysis_prompt.md` to generate domain modeling design
   - Use `prompt/2_user_story_prompt.md` to generate user stories

3. **API Design and Implementation**
   - Use `prompt/3_build_api_specs_prompt.md` to generate API documentation
   - Use `prompt/5_build_mock_data_prompt.md` to generate mock data
   - Use `prompt/6_develop_api_prompt.md` to implement APIs (including both real and mock implementations)

4. **Page Design and Implementation**
   - Use `prompt/4_build_page_guideline_prompt.md` to generate page design specifications
   - Use `prompt/7_build_page_prompt.md` to implement specific pages

5. **Debugging and Optimization**
   - Adjust implementation based on error messages using AI

## 🔍 Local Development

If you want to run the `ot-control-bruce` project locally, please refer to `ot-control-bruce/README.md`
