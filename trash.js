document.addEventListener('DOMContentLoaded', () => {
  const trashList = document.getElementById('trashList');

  let trash = JSON.parse(localStorage.getItem('trash')) || [];
  let notes = JSON.parse(localStorage.getItem('notes')) || [];

  function saveToLocalStorage() {
    localStorage.setItem('trash', JSON.stringify(trash));
    localStorage.setItem('notes', JSON.stringify(notes));
  }

  function renderTrash() {
    if (trashList) {
      trashList.innerHTML = '';
      trash.forEach((note, index) => {
        const li = document.createElement('li');
        li.className = 'list-group-item';
        li.dataset.index = index;

        let noteContent = `${note.content}`;
        if (note.date || note.time) {
          noteContent += `<br><small>${note.date || ''} ${note.time || ''}</small>`;
        }

        const daysLeft = Math.max(0, 30 - Math.floor((new Date() - new Date(note.trashDate)) / (1000 * 60 * 60 * 24)));

        li.innerHTML = `
          ${noteContent}
          <br><small>Deletes in: ${daysLeft} days</small>
          <button class="btn btn-sm btn-success float-right restore-btn">Restore</button>
        `;
        trashList.appendChild(li);
      });
    }
  }

  function cleanUpTrash() {
    const now = new Date();
    trash = trash.filter(note => {
      const trashDate = new Date(note.trashDate);
      const daysInTrash = Math.floor((now - trashDate) / (1000 * 60 * 60 * 24));
      return daysInTrash < 30;
    });
    saveToLocalStorage();
    renderTrash();
  }

  if (trashList) {
    trashList.addEventListener('click', (e) => {
      if (e.target.classList.contains('restore-btn')) {
        const index = e.target.parentElement.dataset.index;
        const note = trash.splice(index, 1)[0];
        delete note.trashDate;
        notes.push(note); // Move the note from trash to notes array
        saveToLocalStorage();
        cleanUpTrash(); // Clean up the trash list
        renderTrash(); // Refresh the trash list
      }
    });

    cleanUpTrash();
    renderTrash();
  }
});
