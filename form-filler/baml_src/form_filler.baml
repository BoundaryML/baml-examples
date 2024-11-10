class Message {
  role "user" | "assistant"
  content string
}

class Form {
  leaveType ("annual" | "sick" | "personal" | "parental")? @description("Type of leave requested") 
  fromDate string? @description("Start date of leave in DD-MM-YYYY format")
  toDate string? @description("End date of leave in DD-MM-YYYY format")
  reason string? @description("Reason for taking leave")
  salaryAdvance bool? @description("Whether salary advance is requested")
  confidence ("high" | "medium" | "low")? @description("Confidence in the extracted information")
}

class UpdateForm {
  action "update_form" @description("when new information is provided")
  form Form
  completed bool @description("whether the form is complete / if the user has given everything they are able to")
  next_question string? @alias("best_follow_up") @description("if the form is incomplete")
}

class RespondToUser {
  action "reply_to_user" @description("address any related questions the user may ask")
  message string
}

class Action {
  action "cancel"
}

function Chat(current_form: Form, chat: Message[]) -> UpdateForm | RespondToUser | Action {
  client "openai/gpt-4o"
  prompt #"
     You are attempting the user to gather all the requirements for a form. Help them as much as possible.

     Form so far:
     {{ current_form }}

     {% for m in chat %}
     {{ _.role(m.role) }} 
     {{ m.content }}
     {% endfor %}

    {{ _.role('system') }}
     {{ ctx.output_format }}
  "#
}

test TestAnnualLeave {
  functions [Chat]
  args {
    current_form {
      leaveType "annual",
      fromDate "01-12-2023",
      toDate "10-12-2023",
      reason "Vacation",
      salaryAdvance false,
      confidence "high"
    },
    chat [
      { role "user", content "I need to take some annual leave in December." },
      { role "assistant", content "Sure, I can help with that. Can you provide the start and end dates?" },
      { role "user", content "From 1st December to 10th December." },
      { role "assistant", content "Got it. What is the reason for your leave?" },
      { role "user", content "Vacation." }
    ]
  }
}

test TestSickLeave {
  functions [Chat]
  args {
    current_form {
      leaveType "sick",
      fromDate "15-11-2023",
      toDate "20-11-2023",
      reason "Flu",
      salaryAdvance null,
      confidence "medium"
    },
    chat [
      { role "user", content "I am feeling unwell and need to take sick leave." },
      { role "assistant", content "I'm sorry to hear that. Can you provide the start and end dates?" },
      { role "user", content "From 15th November to 20th November." },
      { role "assistant", content "Thank you. What is the reason for your leave?" },
      { role "user", content "I have the flu." }
    ]
  }
}