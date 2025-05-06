drop table if exists todos;

create table todos (
  id string PRIMARY KEY,
  title string NOT NULL,
  created_at int NOT NULL,
  completed_at int,
  deleted bool,
  tags string[]
);

drop table if exists user_todos;
  
create table user_todos (
  user string NOT NULL,
  todo string NOT NULL,
  PRIMARY KEY (user, todo),
  FOREIGN KEY (todo) REFERENCES todos(id) ON DELETE CASCADE
);

CREATE INDEX idx_user_todos_user ON user_todos(user);
CREATE INDEX idx_user_todos_todo ON user_todos(todo);
