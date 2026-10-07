# QuickNotes Architecture

## 1. Functional Requirements

QuickNotes should allow users to:

- Create an account and authenticate securely.
- Create notes with a title and optional body.
- View their notes.
- Update existing notes.
- Delete notes.
- Create and manage tags.
- Apply tags to notes.
- Search and filter their notes.
- Access only notes that belong to them.

## 2. Non-Functional Requirements

The system should:

- Support approximately 1 million registered users.
- Remain available if an individual application server fails.
- Provide low-latency reads for common note-list requests.
- Protect user data and require authentication for private operations.
- Scale horizontally as traffic increases.
- Keep database backups and provide a recovery strategy.
- Process background work asynchronously where possible.
- Monitor errors, latency, availability and resource usage.
- Avoid single points of failure in critical infrastructure.

## 3. Load Estimates

These are planning assumptions for a system with 1 million registered users.

### Assumptions

- 1,000,000 registered users.
- 10% are active on a typical day.
- 100,000 daily active users.
- Each active user reads their notes approximately 20 times per day.
- Each active user creates approximately 2 notes per day.
- An average stored note is approximately 2 KB including metadata.
- There are 86,400 seconds in a day.
- Storage estimates use 365 days per year.
- These estimates do not include backups, replicas, indexes or logs.

### Daily active users

```text
1,000,000 × 10% = 100,000 DAU
```

### Reads per day

```text
100,000 × 20 = 2,000,000 reads/day
```

Average reads per second:

```text
2,000,000 ÷ 86,400 ≈ 23 reads/second
```

For planning, the system should be able to handle considerably higher peak
traffic than this average.

### Writes per day

```text
100,000 × 2 = 200,000 writes/day
```

Average writes per second:

```text
200,000 ÷ 86,400 ≈ 2.3 writes/second
```

This shows that the workload is significantly more read-heavy than write-heavy.

### Storage per year

```text
200,000 notes/day × 2 KB = 400,000 KB/day
```

Approximately:

```text
400 MB/day
```

Annual storage:

```text
400 MB × 365 ≈ 146 GB/year
```

Therefore, the system should plan for approximately **146 GB of new note
data per year**, before adding database indexes, backups, replication, logs and
other operational data.

## 4. Architecture Diagram

```text
                         ┌──────────────┐
                         │    Client    │
                         │ Web / Mobile │
                         └──────┬───────┘
                                │
                                ▼
                         ┌──────────────┐
                         │     DNS      │
                         └──────┬───────┘
                                │
                                ▼
                         ┌──────────────┐
                         │     CDN      │
                         └──────┬───────┘
                                │
                                ▼
                      ┌────────────────────┐
                      │   Load Balancer    │
                      └─────────┬──────────┘
                                │
                 ┌──────────────┼──────────────┐
                 │              │              │
                 ▼              ▼              ▼
          ┌────────────┐ ┌────────────┐ ┌────────────┐
          │ App Server │ │ App Server │ │ App Server │
          │     #1     │ │     #2     │ │     #3     │
          └─────┬──────┘ └─────┬──────┘ └─────┬──────┘
                │              │              │
                └──────────────┼──────────────┘
                               │
             ┌─────────────────┼─────────────────┐
             │                 │                 │
             ▼                 ▼                 ▼
      ┌────────────┐   ┌──────────────┐   ┌────────────┐
      │   Cache    │   │ Primary DB   │   │   Queue    │
      │   Redis    │   │              │   │            │
      └────────────┘   └──────┬───────┘   └─────┬──────┘
                               │                 │
                               ▼                 ▼
                        ┌──────────────┐   ┌────────────┐
                        │ Read Replica │   │   Worker   │
                        └──────────────┘   └────────────┘
```

## 5. Component Responsibilities

### Client

The client provides the user interface for creating, viewing, updating and
deleting notes and sends HTTPS requests to the API.

### DNS

DNS maps the QuickNotes domain name to the public infrastructure so clients
can locate the service.

### CDN

The CDN caches and delivers static files such as JavaScript, CSS and images
from locations close to users, reducing latency and origin-server traffic.

### Load Balancer

The load balancer distributes API requests across multiple application
servers so one server does not become a bottleneck or single point of failure.

### App Servers

Application servers run the QuickNotes API, authenticate requests, validate
input and perform application logic. Multiple servers allow horizontal
scaling.

### Cache

A cache such as Redis stores frequently accessed data and reduces repeated
database queries, improving response time and protecting the database during
traffic spikes.

### Primary Database

The primary relational database stores authoritative QuickNotes data such as
users, notes, tags and note-tag relationships. Writes are sent to the primary
database.

### Read Replica

The read replica receives replicated database data and handles read queries,
allowing note-list requests to scale without sending every read to the primary
database.

### Queue

The queue stores background jobs so non-critical processing does not block
user-facing API requests.

### Worker

Workers process jobs from the queue, allowing background operations to run
independently from the API servers.

## 6. GET /notes Flow

1. The user opens QuickNotes and requests their notes.
2. DNS resolves the QuickNotes domain.
3. The request reaches the CDN and cached static assets can be served from
   there.
4. The API request reaches the load balancer.
5. The load balancer sends the request to one available application server.
6. The application server authenticates the user and validates the request.
7. The application checks the cache for the user's note list.
8. If the data is cached and valid, the application returns the cached result.
9. If the data is not cached, the application reads the notes from the read
   replica.
10. The application stores the result in the cache for future requests.
11. The API returns the notes to the client.

This design keeps common reads away from the primary database and reduces
latency for frequently requested data.

## 7. POST /notes Flow

1. The client sends a `POST /notes` request containing the title and optional
   body.
2. DNS resolves the service and the request reaches the load balancer.
3. The load balancer selects a healthy application server.
4. The application server authenticates the user.
5. The application validates the title and other input.
6. The application writes the new note to the primary database.
7. The application invalidates or updates the relevant cache entry so future
   reads can see the new note.
8. If background processing is required, the application places a job on the
   queue.
9. A worker processes the background job independently.
10. The API returns `201 Created` with the newly created note.
11. The client displays the new note to the user.

## 8. Trade-offs

### Cache performance vs. data freshness

Caching improves read performance and reduces database load, but cached note
lists can become temporarily stale. The system needs appropriate expiration
and cache invalidation when notes are created, updated or deleted.

### Read replicas vs. consistency

Read replicas allow many more read requests to be handled, but replication can
have a small delay. Immediately after a write, a user may briefly read older
data from a replica. Critical read-after-write operations can be directed to
the primary database when necessary.

### More servers vs. infrastructure cost

Running multiple application servers improves availability and allows
horizontal scaling, but it increases infrastructure cost and operational
complexity.

### Queue processing vs. immediate work

Using a queue keeps user-facing requests fast, but background jobs are
eventually consistent and require monitoring, retries and failure handling.

## 9. Avoiding Single Points of Failure

The system avoids single points of failure by running multiple application
servers behind a load balancer. If one application server fails, traffic can
be routed to healthy servers.

The cache should run with replication or a managed highly available service.
The database should use replication, automated backups and a read replica so
a failure does not leave the system without a recovery path.

The queue and worker system should support retries and multiple workers so a
single worker failure does not stop background processing.

DNS should use a reliable managed provider, and health checks should remove
unhealthy application servers from the load balancer.

Together, these measures make critical components redundant instead of
depending on a single server or process.
