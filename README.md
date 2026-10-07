# QuickNotes System Design

QuickNotes is a browser-based notes application designed as a starting point
for a real online service. This project demonstrates how a front-end client
can communicate with a REST API using JSONPlaceholder and documents how the
full QuickNotes system could be designed to support 1 million users.

The project includes a working API client for loading, creating and deleting
notes, plus API, database and architecture designs for a production system.

## How to Run the API Client

No backend server is required for the current client because it uses the
JSONPlaceholder practice API.

You can run the client by opening `index.html` in a web browser.

For a better local development experience, use a local static server such as
VS Code Live Server or another simple HTTP server.

The API client uses:

```text
https://jsonplaceholder.typicode.com/posts
```

The browser client supports:

* Loading 10 notes with GET.
* Creating a note with POST.
* Deleting a note with DELETE.
* Loading, success, error and empty states.
* Client-side title validation.
* Disabled buttons while requests are running.

## Design Documents

* [API Design](docs/api-design.md) — REST endpoints, request and response
  examples, authentication and error codes.
* [Data Model](docs/data-model.md) — SQL tables, relationships, queries,
  indexes and the SQL vs NoSQL decision.
* [Architecture](docs/architecture.md) — requirements, scaling estimates,
  system architecture, request flows, trade-offs and availability.

## What I Learned

### 1. Designing REST APIs

I learned how HTTP methods such as GET, POST, PUT and DELETE map to resources
and how status codes communicate the result of an API request.

### 2. Connecting JavaScript to APIs

I learned how to use `fetch`, async/await, error handling and request states
to build a browser client that communicates with an API.

### 3. Relational database design

I learned how primary keys, foreign keys, one-to-many relationships and
many-to-many relationships can be used to design structured application data.

### 4. Designing for scale

I learned that a system for 1 million users needs more than application code.
Caching, load balancing, database replicas, queues and multiple application
servers can help improve performance and availability.

### 5. Trade-offs matter

I learned that scalable architecture involves trade-offs. For example,
caching improves performance but can introduce stale data, while read
replicas increase read capacity but can introduce replication lag.

## Git History

The project was built incrementally using meaningful commits for each major
task:

1. Add API client with GET
2. Add create note with POST
3. Add delete with DELETE
4. Add API design doc
5. Add data model doc
6. Add architecture doc
7. Add README

## Project Structure

```text
quicknotes-system-design/
├── index.html
├── api.js
├── style.css
├── README.md
└── docs/
    ├── api-design.md
    ├── data-model.md
    └── architecture.md
```
