enum Category {
    Refund
    CancelOrder
    TechnicalSupport
    AccountIssue
    Question
}
 
class Message {
  role Role
  content string
}

enum Role {
  Customer
  Assistant
}
  
  
template_string PrintMessage(msg: Message, prefix: string?) #"
  {{ _.chat('user' if msg.role == "Customer" else 'assistant') }}
  {% if prefix %}
  {{ prefix }}
  {% endif %}
  {{ msg.content }} 
"# 
 
function ClassifyMessage(convo: Message[]) -> Category[] {
  client GPT4
  prompt #"
    {# 
      Prompts are auto-dedented and trimmed.
      We use JINJA for our prompt syntax
      (but we added some static analysis to make sure it's valid!)
    #}

    "Classify the following messages into categories."
    """hi there
    {{ ctx.output_format(prefix="Classify with the following json:") }}

    {% for c in convo %}
    {{ PrintMessage(c, 
      'This is the message to classify:' if loop.last and convo|length > 1 else null
    ) }}
    {% endfor %}

    {{ _.chat('assistant') }}
    JSON array of categories that match:
  "#
}
