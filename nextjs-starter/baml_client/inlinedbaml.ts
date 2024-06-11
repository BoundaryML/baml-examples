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
const fileMap = {
  
  "analyze_books.baml": "\nclass Score {\n  year int @description(#\"\n    The year you're giving the score for.\n  \"#)\n  score int @description(#\"\n    1 to 100\n  \"#)\n}\n\nclass PopularityOverTime {\n  bookName string\n  scores Score[]\n}\n\nclass WordCount {\n  bookName string\n  count int\n}\n\nclass Ranking {\n  bookName string\n  score int @description(#\"\n    1 to 100 of your own personal score of this book\n  \"#)\n}\n \nclass BookAnalysis {\n  bookNames string[] @description(#\"\n    The list of book names  provided\n  \"#)\n  popularityOverTime PopularityOverTime[] @description(#\"\n    Print the popularity of EACH BOOK over time.\n    Make sure you add datapoints up to the current year. Try to use a max of 10 datapoints to \n    represent the whole timeline for all books (so 10 handpicked years).\n  \"#) @alias(popularityData)\n  popularityRankings Ranking[] @description(#\"\n    A list of the book's popularity rankings over time. \n    The first element is the top ranking.\n  \"#)\n  wordCounts WordCount[]\n} \n  \nfunction AnalyzeBooks(input: string) -> BookAnalysis {\n  client GPT4o\n  prompt #\"\n    Analyze the following book list and provide the information in the schema. If you don't know the exact answer, take a guess.\n    BOOK_LIST: \n    {{ input }}\n\n    {{ ctx.output_format }}\n  \"#\n} \n\ntest TestName {\n  functions [AnalyzeBooks]\n  args {\n    input #\"\n      brave new world\n      the lord of the rings\n      three body problem\n      stormlight archive\n    \"#\n  }\n}\n",
  "classify_message.baml": "enum Category {\n    Refund\n    CancelOrder\n    TechnicalSupport\n    AccountIssue\n    Question\n}\n\nclass Message {\n  role Role\n  content string\n}\n\nenum Role {\n  Customer\n  Assistant\n}\n  \n  \ntemplate_string PrintMessage(msg: Message, prefix: string?) #\"\n  {{ _.chat('user' if msg.role == \"Customer\" else 'assistant') }}\n  {% if prefix %}\n  {{ prefix }}\n  {% endif %}\n  {{ msg.content }} \n\"# \n\nfunction ClassifyMessage(convo: Message[]) -> Category[] {\n  client GPT4\n  prompt #\"\n    {# \n      Prompts are auto-dedented and trimmed.\n      We use JINJA for our prompt syntax\n      (but we added some static analysis to make sure it's valid!)\n    #}\n\n    {{ ctx.output_format(prefix=\"Classify with the following json:\") }}\n\n    {% for c in convo %}\n    {{ PrintMessage(c, \n      'This is the message to classify:' if loop.last and convo|length > 1 else null\n    ) }}\n    {% endfor %}\n\n    {{ _.chat('assistant') }}\n    JSON array of categories that match:\n  \"#\n}\n\ntest blue_dolphin {\n  functions [ClassifyMessage]\n  args {\n    convo [\n      { \n        role Customer\n        content \"I would like to cancel my order.\"\n      }\n      { \n        role Assistant\n        content \"I'm sorry to hear that. Can you provide me with your order number?\"\n      }\n    ]\n  }\n}\n\n",
  "clients.baml": "client<llm> GPT4 {\n  provider openai\n  options {\n    model gpt-4\n    api_key env.OPENAI_API_KEY\n  }\n}\n\nclient<llm> GPT4Turbo {\n  provider openai\n  options {\n    model gpt-4-turbo\n    api_key env.OPENAI_API_KEY\n  }\n}\n\nclient<llm> GPT4o {\n  provider openai\n  options {\n    model gpt-4o\n    api_key env.OPENAI_API_KEY\n  }\n}\n\n\nclient<llm> GPT3 {\n  provider baml-openai-chat\n  options {\n    model gpt-3.5-turbo\n    api_key env.OPENAI_API_KEY\n  }\n}   ",
  "describe_image.baml": "\nclass CharacterDescription {\n  name string\n  clothingItems string[]\n  hairColor string? @description(#\"\n    The color of the character's hair.\n  \"#)\n  smellDescription string\n  spells Spells[]\n}\n\nclass Spells {\n  name string\n  description string\n\n} \n\nfunction DescribeCharacter(first_image: image) -> CharacterDescription {\n  client GPT4o\n  prompt #\"\n    {{ _.role(\"user\")}}\n    \n    Describe the characters in the image:\n    {{ first_image }}\n\n\n    {{ ctx.output_format }}\n\n    Before you answer, explain your reasoning in 3 sentences.\n  \"#\n}\n \ntest TestName {\n  functions [DescribeCharacter]\n  args {\n    first_image { url \"https://upload.wikimedia.org/wikipedia/en/4/4d/Shrek_%28character%29.png\"} \n    // second_image { url \"https://upload.wikimedia.org/wikipedia/en/3/3d/The_Lion_King_poster.jpg\"}\n  }\n}\n\n\n",
  "extract_resume.baml": "class Resume {\n  name string\n  education Education[]\n  skills string[]\n}\n\nclass Education {\n  school string\n  degree string\n  year int\n}\n\n\nfunction ExtractResume(raw_text: string) -> Resume {\n  client GPT4\n  prompt #\"\n    Parse the following resume and return a structured representation of the data in the schema below.\n\n    Resume:\n    ---\n    {{raw_text}}\n    ---\n\n    Output JSON format (only include these fields, and no others):\n    {{ ctx.output_format(prefix=null) }}\n  \"#\n}\n \n        \ntest sarah {\n  functions [ExtractResume]\n  args {\n    raw_text #\"\n      Sarah Montez\n      Harvard University\n      May 2015-2019\n      3.92 GPA\n      Google\n      Software Engineer\n      June 2019-Present\n      - Backend engineer\n      - Rewrote search and uplifted metrics by 120%\n      - Used C++ and Python\n      Microsoft\n      Software Intern\n      June 2018-August 2018\n      - Worked on the Windows team\n      - Updated the UI\n      - Used C++  \n    \"#\n  }\n}  \n \ntest jason {\n  functions [ExtractResume]\n  args {\n    raw_text #\"\n    Jason Doe\n    Python, Rust\n    University of California, Berkeley, B.S.\n    in Computer Science, 2020\n    Also an expert in Tableau, SQL, and C++\n    \"#\n  }\n}\n\ntest vaibhav {\n  functions [ExtractResume]\n  args { \n    raw_text #\"\n    Vaibhav Guptalinkedin/vaigup(972) 400-5279vaibhavtheory@gmail.comEXPERIENCEGoogle,Software EngineerDec 2018-PresentSeattle, WA•Augmented Reality,Depth Team•Technical Lead for on-device optimizations•Optimized and designed frontfacing depth algorithmon Pixel 4•Focus: C++ and SIMD on custom siliconLife Plus Plus,FounderJuly 2018-July 2019Seattle, WA•Bootcamp for landing people jobs in the computer science industry•Designed the curriculumn and sourced students to join the program•Organically grew to$50k in profit with 3 out of 4 people landing jobsMicrosoft,Program ManagerSep 2017-July 2018Redmond, WA•Microsoft Mixed Reality (HoloLens + VR), 6DoF Tracking•Worked to establish the VR Arcade space with external enterprises•Guided various prototypes from concept stage to enterpise APIsMicrosoft,Software EngineerJul 2015-Sep 2017Redmond, WA•Microsoft HoloLens, Scene Reconstruction•Architected, implemented, tested fault resistent storage pipeline for mesh data across 2 teams•Scoped, designed, and implemented mesh delivery API surface with a team of 2•Responsible for runtime bring up on new hardware with custom instruction set and power constraints•Focus: C++ and SIMD on custom siliconLyte Labs,FounderMar 2014-Jul 2015Austin, TX•Developed prototype hardware to noninvasively measure blood glucose levels•Led a team of 7 across engineering, data collection, and bio-research•Managed data collection across 50 weekly syncs with patients•Raised$50k from multiple funding sources, for research and data collectionOneApp,Co-FounderDec 2011-Aug 2012http://oneapp.googlecode.com•Created an online form generator for K-12 organizations used by 250 students•Focus: PHP, MYSQL, HTML, JavascriptRESEARCHARiSE Pharos Lab,Undergraduate Research AssistantSept 2012-May 2013Prof. Christine Julien, University of Texas at Austin•Implemented coarse localization using indoor wifi signals for triangulation•Focus: Objective CComputation & Neural Systems,Summer InternJune 2012-Aug 2012Prof. Ralph Adolphs, California Institute of Technology•Researched the role of the amygdala in patients•Focus: Signal Processing MATLAB Libraries, RMulti-scale Surface Science and Engineering Cluster,Undergraduate ResearcherMarch 2011-May 2012Dr. Peter Collins, University of North Texas•Used Neural Nets to predict yeild strength of different alloys•Work presented at Materials Science & Technology 2012 Conference•Focus: MATLAB, C++PROJECTS•leapofcode: Website to educate for computer science education with secure remote code execution•rezi.io- Ex-CTO: Website to build and update resumes - over 1,000,000 resumes builtEDUCATIONUniversity of Texas at AustinAug 2012-May 2015Bachelors of Engineering, Integrated CircuitsBachelors of Computer Science\n    \"#\n  }\n}\n",
  "get_recipe.baml": "class Recipe {\n    number_of_servings int @description(#\"\n        Best estimate\n    \"#)\n    ingredients (PartIngredient[] | Ingredient[]) @description(#\"\n        Ingredients can be grouped by parts like 'For the sauce' or 'For the dough'\n    \"#)\n    instructions (PartSteps[] | string[]) @description(#\"\n        Instructions can be grouped by parts like 'For the sauce' or 'For the dough'\n    \"#)\n    serving_tips string[] @description(#\"\n        Tips for serving the dish\n    \"#)\n}\n\nclass PartIngredient {\n    title string\n    ingredients Ingredient[]\n}\n\nclass PartSteps {\n    title string\n    steps string[]\n}\n\nclass Ingredient {\n    name string\n    amount float\n    unit string\n    description string? @description(#\"\n        Optional description of the ingredient like 'diced' or 'chopped'\n    \"#)\n}  \n \nfunction GetRecipe(arg: string) -> Recipe {\n    client GPT4o\n    prompt #\"\n        Generate a recipe for a {{arg}}.\n\n        {{ ctx.output_format }}\n    \"#\n}\n\ntest ApplePie {\n    functions [GetRecipe]\n    args {\n        arg \"apple pie\"\n    }\n}\n\ntest Shaksuka {\n    functions [GetRecipe]\n    args {\n        arg \"shakshuka\"\n    }\n}",
  "main.baml": "generator lang_typescript {\n  output_type \"typescript\"\n  output_dir \"../\"\n}\n ",
  "rag.baml": "class Citation {\n  documentTitle string\n  sourceLink string\n  relevantTextFromDocument string\n  number int @description(#\"\n    the index in this array\n  \"#)\n}\n\nclass Answer {\n  answersInText Citation[]\n  answer string @description(#\"\n    When you answer, ensure to add citations from the documents in the CONTEXT with a number that corresponds to the answersInText array.\n  \"#)\n}\n\n\nclass Document {\n  title string\n  text string\n  link string\n}\nclass Context {\n  documents Document[]\n}\n\nfunction AnswerQuestion(question: string, context: Context) -> Answer {\n  client GPT4\n  prompt #\"\n    Answer the following question using the given context below.\n    CONTEXT:\n    {% for document in context.documents %}\n    ----\n    DOCUMENT TITLE: {{  document.title }}\n    {{ document.text }}\n    DOCUMENT LINK: {{ document.link }}\n    ----\n    {% endfor %}\n\n    {{ ctx.output_format }}\n\n    {{ _.role(\"user\") }}\n    QUESTION: {{ question }}\n\n    ANSWER:\n  \"#\n}\n\n// open this in the playground to run it instantly\ntest SampleTest {\n  functions [AnswerQuestion]\n  args {\n    question #\"\n      what achievements did spacex accomplish before anyone else?\n    \"#\n    context {\n      documents [\n        {\n    title \"SpaceX Overview\"\n    link \"https://en.wikipedia.org/wiki/SpaceX\"\n    text #\"\n    Space Exploration Technologies Corporation, commonly referred to as SpaceX, is an American spacecraft manufacturer, launch service provider and satellite communications company headquartered in Hawthorne, California. The company was founded in 2002 by Elon Musk with the goal of reducing space transportation costs and ultimately developing a sustainable colony on Mars. The company currently produces and operates the Falcon 9 and Falcon Heavy rockets along with the Dragon and Starship spacecraft.\n\nThe company offers internet service via its Starlink subsidiary, which became the largest-ever satellite constellation in January 2020 and, as of April 2024, comprised more than 6,000 small satellites in orbit.[8]\n\nMeanwhile, the company is developing Starship, a human-rated, fully-reusable, super heavy-lift launch system for interplanetary and orbital spaceflight. On its first flight in April 2023, it became the largest and most powerful rocket ever flown. The rocket reached space on its second flight that took place in November 2023.\n\nSpaceX is the first private company to develop a liquid-propellant rocket that has reached orbit; to launch, orbit, and recover a spacecraft; to send a spacecraft to the International Space Station; and to send astronauts to the International Space Station. It is also the first organization of any type to achieve a vertical propulsive landing of an orbital rocket booster and the first to reuse such a booster. The company's Falcon 9 rockets have landed and flown again more than 300 times.[9] As of December 2023, SpaceX has around US$180 billion valuation.[10][11]\nHistory\nMain article: History of SpaceX\nSee also: List of Falcon 9 and Falcon Heavy launches\n\n    \"#\n  }\n  \n      ]\n    }\n  }\n}\n\n",
}
export const getBamlFiles = () => {
    return fileMap;
}