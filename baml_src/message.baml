enum MessageType {
  FeatureRequest
  BugReport
  Question
  Uncategorized
}

function ClassifyMessage(message: string) -> MessageType {
  client ClaudeSonnet
  prompt #"
    {{ _.role('system') }} We are developing a language called BAML and users
    give us feedback in a community chat. You have to classify the messages we
    receive from users.
    
    {{ _.role('user') }} Classify the following message from a user into one of
    the given categories:
    
    {{ message }}
    
    {{ ctx.output_format }}
  "#
}

test ClassifyMessageTest {
  functions [ClassifyMessage]
  args {
    message #"
      BAML should support recursive types.
    "#
  }
}
