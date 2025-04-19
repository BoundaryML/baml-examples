class ContentAnalysis {
  technicalQuestionsAnswered Question[]
  
  commercialElements CommercialElements

  valueRatio "mostly-educational" | "balanced" | "mostly-promotional" @description("The overall balance between educational and promotional content")
  
  keyInsights string[] @description("Main educational takeaways from the content")

    primaryIntent "educational" | "advertisement" @description("The dominant purpose of the content")
  
  educationalDepth "surface" | "intermediate" | "deep" @description("How thoroughly the content explains concepts")

}

class Question {
  question string
  depth "surface" | "deep_technical"
}

class CommercialElements {
    productMentions string[] @description("Products or services mentioned")
    integrationStyle "natural" | "forced" | "balanced" @description("How naturally commercial elements fit into the educational content")
    isDisruptive bool @description("Whether commercial elements interrupt the learning flow")
}

class ContentType {
    title string
    type "blog_post" | "article" | "other"
}

function IsBlogPost(content: string) -> ContentType {
  client "openai/gpt-4o-mini"
  prompt #"
    What is this content?
    {{ ctx.output_format }}

    {{ _.role("user") }}
    {{ content }}
  "#
}

function AnalyzeContentDepth(content: string) -> ContentAnalysis {
  client "openai/gpt-4o"
  prompt #"
    Analyze this content carefully. Pay special attention to:
    - The depth of educational concepts covered
    - How commercial elements are integrated
    - Whether the educational value stands on its own merit
    - The balance between teaching and selling

    Focus on identifying whether the educational content is substantive and valuable, even if commercial elements are present.

    {{ ctx.output_format }}

    {{ _.role("user") }} {{ content }}
  "#
}

test DeepEducationalWithProductTest {
  functions [AnalyzeContentDepth]
  args {
    content #"
      Understanding GPU Architecture: A Deep Dive

      Modern GPU computing relies on parallel processing units that handle multiple tasks simultaneously. The architecture consists of thousands of smaller cores, unlike CPUs which have fewer but more powerful cores. This parallel architecture makes GPUs ideal for matrix operations and deep learning workloads.

      While we'll use NVIDIA's RTX 4090 as an example throughout this article (available at our store for $1599), the concepts apply to all modern GPUs. The RTX 4090's AD102 chip demonstrates perfect parallel execution with its 16,384 CUDA cores...

      [Detailed technical explanation continues for several paragraphs...]
    "#
  }
}

test CrewAI {
  functions [AnalyzeContentDepth]
  args {
  content #"
    On Prem Agentic AI Infrastructure: HPE and CrewAI
HPE and CrewAI Launch Purpose-Built Hardware for Enterprise AI

João (Joe) Moura
João (Joe) Moura
Mar 26, 2025
2 min
On Prem Agentic AI Infrastructure: HPE and CrewAI
Photo by İsmail Enes Ayhan / Unsplash
Today we announce an exciting new partnership with Hewlett Packard Enterprise (HPE), bringing dedicated Agentic AI infrastructure directly to enterprises across diverse industries. This collaboration delivers HPE’s powerful hardware pre-installed with CrewAI Enterprise—ready to revolutionize how businesses adopt and scale AI agents.

It's incredible to see how quickly the landscape has evolved. We’ve witnessed thousands of AI agent use cases already, and this new collaboration with HPE is set to accelerate that growth. Enterprises in finance, healthcare, defense, retail, manufacturing, telecom, energy, and beyond now have the perfect combination: powerful on-premises infrastructure optimized for CrewAI.

Tackling Real Enterprise Challenges
Businesses across sectors face significant hurdles in adopting AI at scale:

Performance bottlenecks that limit responsiveness and agility.
Data sovereignty concerns that create compliance and security headaches.
Scaling and cost challenges associated with traditional cloud solutions.
The CrewAI and HPE integration directly addresses these issues head-on. With our purpose-built hardware solutions, we're not just easing adoption—we’re transforming what's possible.

Real-World Solutions for Critical Industries
Here’s where things get exciting. Imagine:

Financial institutions securely deploying risk assessment and compliance agents on-premises, ensuring data never leaves their control.
Healthcare providers delivering AI-driven diagnostics with HIPAA compliance baked right in, fully secure and on-site.
Defense and government agencies leveraging powerful AI capabilities without compromising operational security or performance.
Retailers streamlining inventory management, personalized customer service, and predictive logistics.
Manufacturing firms optimizing production processes, predictive maintenance, and quality assurance.
Telecommunications companies enhancing network management, predictive network maintenance, and customer experience.
Energy companies implementing intelligent grid management, predictive analytics, and environmental compliance.
Why CrewAI + HPE Is Different
This integration offers more than just hardware. It’s a complete enterprise-ready solution that delivers:

Reduced latency, for lightning-fast AI agent interactions.
Military-grade security, essential for sensitive industries.
Reliable, offline-capable performance, crucial for mission-critical deployments.
Enterprise-grade infrastructure, featuring HPE servers, NVIDIA GPUs, massive storage capabilities, and high-performance networking—all fine-tuned for CrewAI workloads.
Unmatched data sovereignty and control, ensuring your data and models remain completely yours.
More Than Just Infrastructure
This isn’t simply hardware. It’s about empowering businesses to scale intelligent workflows seamlessly, securely, and rapidly. It’s about enabling teams to move from experimental AI deployments to robust, scalable solutions that can truly transform operations and outcomes.

While the market debates the theoretical potential, CrewAI is shipping tangible solutions right now—solutions designed specifically to fit seamlessly within your existing infrastructure and processes. This partnership marks a decisive step forward, making intelligent AI infrastructure not just viable, but immediately deployable.

See It Live
Don’t just take our word for it. Join us at Enterprise AI Agent Week (March 31–April 4), held in over 20 cities globally, and experience firsthand everything CrewAI is building for support agents on massive settings.

Register now and be part of the transforming how businesses build their agentic future.
    "#
  }
  
}

test PromotionalWithBasicsTest {
  functions [AnalyzeContentDepth]
  args {
    content #"
      Why You Need Our New AI Training Course

      Machine learning is revolutionizing technology! Our comprehensive course teaches you everything about neural networks. Sign up now for $499 (50% off!) and learn from industry experts.

      Neural networks are like the human brain - they process information in layers. Our course covers basic concepts and advanced techniques. Enroll today and get a free GPU upgrade!

      Modern GPU computing relies on parallel processing units that handle multiple tasks simultaneously. The architecture consists of thousands of smaller cores, unlike CPUs which have fewer but more powerful cores. This parallel architecture makes GPUs ideal for matrix operations and deep learning workloads.

      While we'll use NVIDIA's RTX 4090 as an example throughout this article (available at our store for $1599), the concepts apply to all modern GPUs. The RTX 4090's AD102 chip demonstrates perfect parallel execution with its 16,384 CUDA cores...

    "#
  }
}