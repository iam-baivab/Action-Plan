document.addEventListener("DOMContentLoaded", () => {
  const cookieModal = document.getElementById("cookieModal");
  const acceptCookiesBtn = document.getElementById("acceptCookiesBtn");
  const cookiesAccepted = localStorage.getItem("cookiesAccepted");

  if (!cookiesAccepted) {
    $("#cookieModal").modal("show");
  }

  acceptCookiesBtn.addEventListener("click", () => {
    localStorage.setItem("cookiesAccepted", true);
    $("#cookieModal").modal("hide");
  });

  const noteInput = document.getElementById("noteInput");
  const noteDate = document.getElementById("noteDate");
  const noteTime = document.getElementById("noteTime");
  const addNoteBtn = document.getElementById("addNoteBtn");
  const noteList = document.getElementById("noteList");

  let notes = JSON.parse(localStorage.getItem("notes")) || [];
  let trash = JSON.parse(localStorage.getItem("trash")) || [];

  function saveToLocalStorage() {
    localStorage.setItem("notes", JSON.stringify(notes));
    localStorage.setItem("trash", JSON.stringify(trash));
  }

  function renderNotes() {
    if (noteList) {
      noteList.innerHTML = "";
      notes.forEach((note, index) => {
        const li = document.createElement("li");
        li.className = `list-group-item ${note.completed ? "completed" : ""}`;
        li.dataset.index = index;
        li.draggable = true;

        let noteContent = `${note.content}`;
        if (note.date || note.time) {
          noteContent += `<br><small>${note.date || ""} ${
            note.time || ""
          }</small>`;
        }

        li.innerHTML = `
            ${noteContent}
            <button class="btn btn-sm btn-primary float-right save-btn d-none">Save</button>
            <button class="btn btn-sm btn-secondary float-right edit-btn">Edit</button>
            <button class="btn btn-sm btn-success float-right done-btn">Done</button>
            <button class="btn btn-sm btn-danger float-right delete-btn">Delete</button>
          `;
        noteList.appendChild(li);
      });
    }
  }

  function showToast(message, type) {
    Toastify({
      text: message,
      duration: 3000,
      close: true,
      gravity: "top",
      position: "right",
      backgroundColor: type === "error" ? "#FF0000" : "#5cb85c",
    }).showToast();
  }

  let hoverTimeout;
  noteList.addEventListener("mouseover", (e) => {
    if (e.target.tagName === "LI") {
      hoverTimeout = setTimeout(() => {
        Toastify({
          text: "Tip: You can change the position of any notes by dragging them.",
          duration: 5000,
          gravity: "bottom",
          position: "center",
          backgroundColor: "linear-gradient(to right, #00bcd4, #03a9f4)",
          style: {
            margin: '20px',
          },
        }).showToast();
      }, 3000);
    }
  });

  noteList.addEventListener("mouseout", (e) => {
    if (e.target.tagName === "LI") {
      clearTimeout(hoverTimeout);
    }
  });

  if (addNoteBtn) {
    addNoteBtn.addEventListener("click", () => {
      const noteContent = noteInput.value.trim();
      const noteDateValue = noteDate.value;
      const noteTimeValue = noteTime.value;

      if (!localStorage.getItem("cookiesAccepted")) {
        showToast("Please accept cookies to save notes.", "error");
      } else if (!noteContent) {
        showToast("Note cannot be empty.", "error");
      } else {
        notes.push({
          content: noteContent,
          date: noteDateValue,
          time: noteTimeValue,
          completed: false,
        });
        noteInput.value = "";
        noteDate.value = "";
        noteTime.value = "";
        saveToLocalStorage();
        renderNotes();
      }
    });
  }

  if (noteList) {
    noteList.addEventListener("click", (e) => {
      const index = e.target.parentElement.dataset.index;

      if (e.target.classList.contains("delete-btn")) {
        const note = notes.splice(index, 1)[0];
        note.trashDate = new Date().toISOString();
        trash.push(note);
        saveToLocalStorage();
        renderNotes();
      }

      if (e.target.classList.contains("done-btn")) {
        notes[index].completed = !notes[index].completed;
        saveToLocalStorage();
        renderNotes();
      }

      if (e.target.classList.contains("edit-btn")) {
        const li = e.target.parentElement;
        li.innerHTML = `
            <input type="text" class="form-control edit-content" value="${notes[index].content}">
            <input type="date" class="form-control edit-date" value="${notes[index].date}">
            <input type="time" class="form-control edit-time" value="${notes[index].time}">
            <button class="btn btn-sm btn-primary float-right save-btn">Save</button>
            <button class="btn btn-sm btn-secondary float-right cancel-btn">Cancel</button>
          `;
      }

      if (e.target.classList.contains("save-btn")) {
        const li = e.target.parentElement;
        const newContent = li.querySelector(".edit-content").value;
        const newDate = li.querySelector(".edit-date").value;
        const newTime = li.querySelector(".edit-time").value;

        notes[index].content = newContent;
        notes[index].date = newDate;
        notes[index].time = newTime;

        saveToLocalStorage();
        renderNotes();
      }

      if (e.target.classList.contains("cancel-btn")) {
        renderNotes();
      }
    });

    new Sortable(noteList, {
      animation: 150,
      onEnd: () => {
        notes = Array.from(noteList.children).map(
          (li) => notes[li.dataset.index]
        );
        saveToLocalStorage();
      },
    });
  }

  renderNotes();
});
