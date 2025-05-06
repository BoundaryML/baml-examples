drop table if exists todos;

-- Represent todo items.
create table todos (
  id text PRIMARY KEY,
  title text NOT NULL,
  created_at int NOT NULL,
  completed_at int,
  deleted bool,
  tags text not null,
  embedding FLOAT32(1536) not null
);

create index idx_todos_embedding on todos (
  libsql_vector_idx(
    embedding,
    'type=diskann',
    'metric=cosine'
  )
);

drop table if exists user_todos;
  
-- Associate users with todos.
create table user_todos (
  user string NOT NULL,
  todo string NOT NULL,
  PRIMARY KEY (user, todo),
  FOREIGN KEY (todo) REFERENCES todos(id) ON DELETE CASCADE
);

CREATE INDEX idx_user_todos_user ON user_todos(user);
CREATE INDEX idx_user_todos_todo ON user_todos(todo);

-- Create a view of todos without the embedding column for simpler queries
CREATE VIEW todos_simple AS
SELECT 
    id,
    title,
    created_at,
    completed_at,
    deleted,
    tags
FROM todos;

