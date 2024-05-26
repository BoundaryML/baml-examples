/*************************************************************************************************

Welcome to Baml! To use this generated code, please run one of the following:

$ npm install @boundaryml/baml
$ yarn add @boundaryml/baml
$ pnpm add @boundaryml/baml

*************************************************************************************************/

// This file was generated by BAML: do not edit it. Instead, edit the BAML
// files and re-generate this code.
//
// tslint:disable
// @ts-nocheck
// biome-ignore format: autogenerated code
/* eslint-disable */
// This file has the baml files represented as base64 strings for easier bundling in NextJS and other platforms. You can ignore this.
export function b64DecodeUnicode(str: string) {
  return decodeURIComponent(
    Array.prototype.map
      .call(atob(str), function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
      })
      .join(''),
  )
}

export const bamlFiles = `{\"clients.baml\":\"client<llm> GPT4 {\\n  provider baml-openai-chat\\n  options {\\n    model gpt-4\\n    api_key env.OPENAI_API_KEY\\n  }\\n}\\n\\nclient<llm> GPT4Turbo {\\n  provider baml-openai-chat\\n  options {\\n    model gpt-4-1106-preview\\n    api_key env.OPENAI_API_KEY\\n  }\\n}\\n\\nclient<llm> GPT3 {\\n  provider baml-openai-chat\\n  options {\\n    model gpt-3.5-turbo\\n    api_key env.OPENAI_API_KEY\\n  }\\n}  \",\"example_2.baml\":\"enum Category {\\n    Refund\\n    CancelOrder\\n    TechnicalSupport\\n    AccountIssue\\n    Question\\n}\\n\\nclass Message {\\n  role Role\\n  content string\\n}\\n\\nenum Role {\\n  Customer\\n  Assistant\\n}  \\n  \\n\\ntemplate_string PrintMessage(msg: Message, prefix: string?) #\\\"\\n  {{ _.chat('user' if msg.role == \\\"Customer\\\" else 'assistant') }}\\n  {% if prefix %}\\n  {{ prefix }}\\n  {% endif %}\\n  {{ msg.content }}\\n\\\"#\\n\\nfunction ClassifyMessage(convo: Message[]) -> Category[] {\\n  client GPT4\\n  prompt #\\\"\\n    {# \\n      Prompts are auto-dedented and trimmed.\\n      We use JINJA for our prompt syntax\\n      (but we added some static analysis to make sure it's valid!)\\n    #} \\n \`\`\`hello\\n    {{ ctx.output_format(prefix=\\\"Classify with the following json:\\\") }}\\n\\n    {% for c in convo %}\\n    {{ PrintMessage(c, \\n      'This is the message to classify:' if loop.last and convo|length > 1 else null\\n    ) }}\\n    {% endfor %}\\n\\n    {{ _.chat('assistant') }}\\n    Here's a short hakiu to help you remember the categories before you classify:\\n  \\\"#\\n}\\n\\ntest blue_dolphin {\\n  functions [ClassifyMessage]\\n  args {\\n    convo [\\n      { \\n        role Customer\\n        content \\\"I would like to cancel my order.\\\"\\n      }\\n      { \\n        role Assistant\\n        content \\\"I'm sorry to hear that. Can you provide me with your order number?\\\"\\n      }\\n    ]\\n  }\\n}\",\"main.baml\":\"generator lang_typescript {\\n  output_type \\\"typescript\\\"\\n  output_dir \\\"../\\\"\\n}\\n  \",\"example_1.baml\":\"class Resume {\\n  name string\\n  education Education[]\\n  skills string[]\\n}\\n\\nclass Education {\\n  school string\\n  degree string\\n  year int\\n}\\n \\n\\nfunction ExtractResume(raw_text: string) -> Resume {\\n  client GPT4\\n  prompt #\\\"\\n    Parse the following resume and return a structured representation of the data in the schema below.\\n\\n    Resume:\\n    ---\\n    {{raw_text}}\\n    ---\\n\\n    Output JSON format (only include these fields, and no others):\\n    {{ ctx.output_format(prefix=null) }}\\n  \\\"#\\n}\\n \\n        \\ntest sarah {\\n  functions [ExtractResume]\\n  args {\\n    raw_text #\\\"\\n      Sarah Montez\\n      Harvard University\\n      May 2015-2019\\n      3.92 GPA\\n      Google\\n      Software Engineer\\n      June 2019-Present\\n      - Backend engineer\\n      - Rewrote search and uplifted metrics by 120%\\n      - Used C++ and Python\\n      Microsoft\\n      Software Intern\\n      June 2018-August 2018\\n      - Worked on the Windows team\\n      - Updated the UI\\n      - Used C++  \\n    \\\"#\\n  }\\n}  \\n \\ntest jason {\\n  functions [ExtractResume]\\n  args {\\n    raw_text #\\\"\\n    Jason Doe\\n    Python, Rust\\n    University of California, Berkeley, B.S.\\n    in Computer Science, 2020\\n    Also an expert in Tableau, SQL, and C++\\n    \\\"#\\n  }\\n}\",\"hi/thing.baml\":\"// hello\"}` 
export const getBamlFiles = () => {
    const fileMap = JSON.parse((bamlFiles))
    for (const [path, content] of Object.entries(fileMap)) {
        fileMap[path] = content
    }
    return fileMap
}