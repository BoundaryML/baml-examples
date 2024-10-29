class Resume {
  name string
  links Link[] @description(#"
    Any links to the candidate's online profiles (e.g. LinkedIn, GitHub, Email).
    For twitter, just use the format twitter@PROFILE_NAME.
    For other links, convert them into valid URLs.
  "#)
  education Education[]
  experience Experience[]
  skills string[]
  why_hire string[] @description(#"
    3 points of why the candidate is a great hire (use fun and exciting language!).
  "#)
}

class Link {
  url string @check(valid_link, {{ this|regex_match("[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)") }})
}

class Education {
  school string
  degree string
  year int
}

class Experience {
  company string
  title string?
  start_date string
  end_date string?
  description string[]
  company_url string? @description(#"
    Best guess of the company's website URL.
  "#)
}

function IsResume(raw_text: string) -> bool {
  client "openai/gpt-4o-mini"
  prompt #"
    Determine if the following text is a resume or not.
    {{ ctx.output_format }}

    {{ _.role('user') }}
    {{raw_text}}
  "#
}

function ExtractResume(raw_text: string) -> Resume {
  client GPT4o
  prompt #"
    Parse the following resume and return a structured representation of the data in the schema below.
    {{ ctx.output_format(prefix="Output format:\n") }}

    {{ _.role('user') }}
    {{raw_text}}
  "#
}
 

function ExtractResumeNoStructure(raw_text: string) -> string {
  client GPT4o
  prompt #"
    Parse the following resume and return their education, experience, and skills.

    {{ _.role('user') }}
    {{raw_text}}
  "#
}
 

        
test sarah {
  functions [ExtractResume, ExtractResumeNoStructure]
  args {
    raw_text #"
      Sarah Montez
      Harvard University
      May 2015-2019
      3.92 GPA
      Google
      Software Engineer
      June 2019-Present
      - Backend engineer
      - Rewrote search and uplifted metrics by 120%
      - Used C++ and Python
      Microsoft
      Software Intern
      June 2018-August 2018
      - Worked on the Windows team
      - Updated the UI
      - Used C++  
    "#
  }
}  
 
test jason {
  functions [ExtractResume]
  args {
    raw_text #"
    Jason Doe
    Python, Rust
    University of California, Berkeley, B.S.
    in Computer Science, 2020
    Also an expert in Tableau, SQL, and C++
    "#
  }
}

test vaibhav {
  functions [ExtractResume]
  args { 
    raw_text #"
    Vaibhav Guptalinkedin/vaigup(972) 400-5279vaibhavtheory@gmail.comEXPERIENCEGoogle,Software EngineerDec 2018-PresentSeattle, WA•Augmented Reality,Depth Team•Technical Lead for on-device optimizations•Optimized and designed frontfacing depth algorithmon Pixel 4•Focus: C++ and SIMD on custom siliconLife Plus Plus,FounderJuly 2018-July 2019Seattle, WA•Bootcamp for landing people jobs in the computer science industry•Designed the curriculumn and sourced students to join the program•Organically grew to$50k in profit with 3 out of 4 people landing jobsMicrosoft,Program ManagerSep 2017-July 2018Redmond, WA•Microsoft Mixed Reality (HoloLens + VR), 6DoF Tracking•Worked to establish the VR Arcade space with external enterprises•Guided various prototypes from concept stage to enterpise APIsMicrosoft,Software EngineerJul 2015-Sep 2017Redmond, WA•Microsoft HoloLens, Scene Reconstruction•Architected, implemented, tested fault resistent storage pipeline for mesh data across 2 teams•Scoped, designed, and implemented mesh delivery API surface with a team of 2•Responsible for runtime bring up on new hardware with custom instruction set and power constraints•Focus: C++ and SIMD on custom siliconLyte Labs,FounderMar 2014-Jul 2015Austin, TX•Developed prototype hardware to noninvasively measure blood glucose levels•Led a team of 7 across engineering, data collection, and bio-research•Managed data collection across 50 weekly syncs with patients•Raised$50k from multiple funding sources, for research and data collectionOneApp,Co-FounderDec 2011-Aug 2012http://oneapp.googlecode.com•Created an online form generator for K-12 organizations used by 250 students•Focus: PHP, MYSQL, HTML, JavascriptRESEARCHARiSE Pharos Lab,Undergraduate Research AssistantSept 2012-May 2013Prof. Christine Julien, University of Texas at Austin•Implemented coarse localization using indoor wifi signals for triangulation•Focus: Objective CComputation & Neural Systems,Summer InternJune 2012-Aug 2012Prof. Ralph Adolphs, California Institute of Technology•Researched the role of the amygdala in patients•Focus: Signal Processing MATLAB Libraries, RMulti-scale Surface Science and Engineering Cluster,Undergraduate ResearcherMarch 2011-May 2012Dr. Peter Collins, University of North Texas•Used Neural Nets to predict yeild strength of different alloys•Work presented at Materials Science & Technology 2012 Conference•Focus: MATLAB, C++PROJECTS•leapofcode: Website to educate for computer science education with secure remote code execution•rezi.io- Ex-CTO: Website to build and update resumes - over 1,000,000 resumes builtEDUCATIONUniversity of Texas at AustinAug 2012-May 2015Bachelors of Engineering, Integrated CircuitsBachelors of Computer Science
    "#
  }
}
