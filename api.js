const API_URL = "https://jsonplaceholder.typicode.com/posts";

const loadButton = document.querySelector("#load-btn");
const status = document.querySelector("#status");
const notesList = document.querySelector("#notes-list");
const noteForm = document.querySelector("#note-form");
const titleInput = document.querySelector("#title-input");
const bodyInput = document.querySelector("#body-input");
const submitButton = document.querySelector("#submit-btn");

let notes = [];

async function request(url, options = {}) {
  const response = await fetch(url, options);

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response;
}

function renderNotes(list) {
  notesList.textContent = "";

  if (list.length === 0) {
    const emptyMessage = document.createElement("li");
    emptyMessage.textContent = "No notes found.";
    notesList.appendChild(emptyMessage);
    return;
  }

  list.forEach((note) => {
    const listItem = document.createElement("li");

    const title = document.createElement("h2");
    title.textContent = note.title;

    const body = document.createElement("p");
    body.textContent = note.body;

    listItem.appendChild(title);
    listItem.appendChild(body);

    notesList.appendChild(listItem);
  });
}

async function loadNotes() {
  loadButton.disabled = true;
  status.textContent = "Loading notes...";
  status.className = "";

  try {
    const response = await request(`${API_URL}?_limit=10`);
    notes = await response.json();

    renderNotes(notes);

    if (notes.length === 0) {
      status.textContent = "No notes were returned.";
      status.className = "success";
    } else {
      status.textContent = `Loaded ${notes.length} notes from the server.`;
      status.className = "success";
    }
  } catch (error) {
    notesList.textContent = "";
    status.textContent = "Unable to load notes. Please try again.";
    status.className = "error";
    console.error(error);
  } finally {
    loadButton.disabled = false;
  }
}

async function createNote(event) {
  event.preventDefault();

  const title = titleInput.value.trim();
  const body = bodyInput.value.trim();

  if (!title) {
    status.textContent = "Title is required.";
    status.className = "error";
    return;
  }

  if (title.length > 100) {
    status.textContent = "Title must be 100 characters or fewer.";
    status.className = "error";
    return;
  }

  submitButton.disabled = true;
  status.textContent = "Creating note...";
  status.className = "";

  try {
    const response = await request(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=UTF-8",
      },
      body: JSON.stringify({
        title,
        body,
        userId: 1,
      }),
    });

    if (response.status !== 201) {
      throw new Error(`Expected status 201, received ${response.status}`);
    }

    const createdNote = await response.json();

    notes.unshift(createdNote);
    renderNotes(notes);
    noteForm.reset();

    status.textContent = `Note created with ID ${createdNote.id}.`;
    status.className = "success";
  } catch (error) {
    status.textContent = "Unable to create note. Please try again.";
    status.className = "error";
    console.error(error);
  } finally {
    submitButton.disabled = false;
  }
}

loadButton.addEventListener("click", loadNotes);
noteForm.addEventListener("submit", createNote);
