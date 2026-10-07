# QuickNotes Data Model

QuickNotes uses a relational SQL database because the application has clear
relationships between users, notes and tags. SQL provides foreign keys,
constraints, joins and transactions that fit these relationships well.

## 1. Entities and Columns

### Users

| Column | Type | Key / Constraint |
|---|---|---|
| id | INTEGER | Primary key |
| email | VARCHAR(255) | Unique, not null |
| name | VARCHAR(100) | Not null |
| password_hash | VARCHAR(255) | Not null |
| created_at | TIMESTAMP | Not null |

### Notes

| Column | Type | Key / Constraint |
|---|---|---|
| id | INTEGER | Primary key |
| user_id | INTEGER | Foreign key to users.id, not null |
| title | VARCHAR(100) | Not null |
| body | TEXT | Nullable |
| created_at | TIMESTAMP | Not null |
| updated_at | TIMESTAMP | Not null |

### Tags

| Column | Type | Key / Constraint |
|---|---|---|
| id | INTEGER | Primary key |
| user_id | INTEGER | Foreign key to users.id, not null |
| name | VARCHAR(50) | Not null |

### Note Tags

| Column | Type | Key / Constraint |
|---|---|---|
| note_id | INTEGER | Foreign key to notes.id |
| tag_id | INTEGER | Foreign key to tags.id |

The combination of `note_id` and `tag_id` is the primary key.

## 2. Relationships

A user can create many notes, so `users` and `notes` have a one-to-many
relationship. Each note belongs to one user.

A user can also create many tags, so `users` and `tags` have a one-to-many
relationship.

Notes and tags have a many-to-many relationship. One note can have many tags,
and one tag can be applied to many notes. The `note_tags` table is a join table
that represents this many-to-many relationship.

## 3. CREATE TABLE Statements

```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notes (
    id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL,
    title VARCHAR(100) NOT NULL,
    body TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE tags (
    id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL,
    name VARCHAR(50) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE note_tags (
    note_id INTEGER NOT NULL,
    tag_id INTEGER NOT NULL,
    PRIMARY KEY (note_id, tag_id),
    FOREIGN KEY (note_id) REFERENCES notes(id),
    FOREIGN KEY (tag_id) REFERENCES tags(id)
);
```

## 4. Example SQL Queries

### Query 1: Find all notes for a user

```sql
SELECT id, title, body, created_at
FROM notes
WHERE user_id = 1
ORDER BY created_at DESC;
```

### Query 2: Find all tags belonging to a user

```sql
SELECT id, name
FROM tags
WHERE user_id = 1
ORDER BY name;
```

### Query 3: Find notes with their tags

```sql
SELECT
    notes.id,
    notes.title,
    tags.name AS tag
FROM notes
JOIN note_tags ON notes.id = note_tags.note_id
JOIN tags ON note_tags.tag_id = tags.id
WHERE notes.user_id = 1
ORDER BY notes.created_at DESC;
```

This JOIN query connects notes to tags through the `note_tags` join table.

### Query 4: Count notes for each user

```sql
SELECT
    users.id,
    users.name,
    COUNT(notes.id) AS note_count
FROM users
LEFT JOIN notes ON users.id = notes.user_id
GROUP BY users.id, users.name;
```

## 5. Indexes

An index should be added to `notes.user_id`:

```sql
CREATE INDEX idx_notes_user_id
ON notes(user_id);
```

This makes queries that retrieve all notes belonging to a particular user
faster, which is important because `/api/v1/notes` is expected to be a common
read operation.

Another useful index is on `note_tags.tag_id`:

```sql
CREATE INDEX idx_note_tags_tag_id
ON note_tags(tag_id);
```

This helps when finding all notes associated with a particular tag.

## 6. SQL or NoSQL?

I would choose SQL for QuickNotes because the data has clear and important
relationships between users, notes and tags. A relational database can enforce
foreign keys, unique values and primary keys while making JOIN queries
straightforward.

SQL also provides transactions, which are useful when operations need several
database changes to succeed together. NoSQL could scale for some workloads, but
the structured relationships in QuickNotes make a relational SQL database the
better starting choice.
