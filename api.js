const API_URL = "https://jsonplaceholder.typicode.com/posts";

const loadButton = document.querySelector("#load-btn");
const status = document.querySelector("#status");
const notesList = document.querySelector("#notes-list");

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

loadButton.addEventListener("click", loadNotes);
