let notes = JSON.parse(localStorage.getItem('notes')) || [];
let currentNoteId = null;

const notesContainer = document.getElementById('notesContainer');
const editorModal = document.getElementById('editorModal');
const searchInput = document.getElementById('searchInput');

// Event Listeners
document.getElementById('newNoteBtn').addEventListener('click', () => openEditor());
document.getElementById('saveNoteBtn').addEventListener('click', saveNote);
document.querySelector('.close').addEventListener('click', () => closeEditor());
searchInput.addEventListener('input', filterNotes);

// Initialize
renderNotes();

function openEditor(note = null) {
    currentNoteId = note?.id || Date.now().toString();
    document.getElementById('noteTitle').value = note?.title || '';
    document.getElementById('noteContent').value = note?.content || '';
    editorModal.style.display = 'block';
}

function closeEditor() {
    editorModal.style.display = 'none';
    currentNoteId = null;
}

function saveNote() {
    const note = {
        id: currentNoteId,
        title: document.getElementById('noteTitle').value,
        content: document.getElementById('noteContent').value,
        color: document.querySelector('.color-option.selected')?.style.backgroundColor || '#fff',
        date: new Date().toISOString()
    };

    const existingNoteIndex = notes.findIndex(n => n.id === note.id);
    if (existingNoteIndex > -1) {
        notes[existingNoteIndex] = note;
    } else {
        notes.push(note);
    }

    localStorage.setItem('notes', JSON.stringify(notes));
    renderNotes();
    closeEditor();
}

function deleteNote(id) {
    notes = notes.filter(note => note.id !== id);
    localStorage.setItem('notes', JSON.stringify(notes));
    renderNotes();
}

function renderNotes() {
    notesContainer.innerHTML = '';
    notes.forEach(note => {
        const noteElement = document.createElement('div');
        noteElement.className = 'note-card';
        noteElement.style.backgroundColor = note.color;
        noteElement.innerHTML = `
            <div class="note-header">
                <h3>${note.title}</h3>
                <button class="delete-btn" onclick="deleteNote('${note.id}')">×</button>
            </div>
            <p>${note.content}</p>
            <small>${new Date(note.date).toLocaleDateString()}</small>
        `;
        noteElement.addEventListener('dblclick', () => openEditor(note));
        notesContainer.appendChild(noteElement);
    });
}

// function filterNotes() {
//     const searchTerm = searchInput.value.toLowerCase();
//     const filteredNotes = notes.filter(note => 
//         note.title.toLowerCase().includes(searchTerm) ||
//         note.content.toLowerCase().includes(searchTerm)
//     );
//     notesContainer.innerHTML = '';
//     filteredNotes.forEach(note => {
//         // Render filtered notes (same as renderNotes)
//     });
// }

// Close modal when clicking outside
window.onclick = function(event) {
    if (event.target === editorModal) {
        closeEditor();
    }
}

// Color picker functionality
document.querySelectorAll('.color-option').forEach(option => {
    option.addEventListener('click', function() {
        document.querySelectorAll('.color-option').forEach(opt => 
            opt.classList.remove('selected'));
        this.classList.add('selected');
    });
});// View all saved notes
const savedNotes = localStorage.getItem('notes');
console.log('Saved notes:', JSON.parse(savedNotes));

// Check localStorage size
const size = JSON.stringify(localStorage).length;
console.log('Storage used:', size, 'bytes');





let searchTimeout;

function filterNotes() {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        const searchTerm = searchInput.value.toLowerCase();
        const searchType = document.getElementById('searchType').value;
        
        const filteredNotes = notes.filter(note => {
            switch(searchType) {
                case 'title':
                    return note.title.toLowerCase().includes(searchTerm);
                case 'content':
                    return note.content.toLowerCase().includes(searchTerm);
                case 'date':
                    return new Date(note.date).toLocaleDateString().toLowerCase().includes(searchTerm);
                default:
                    return note.title.toLowerCase().includes(searchTerm) ||
                           note.content.toLowerCase().includes(searchTerm) ||
                           new Date(note.date).toLocaleDateString().toLowerCase().includes(searchTerm);
            }
        });

        notesContainer.innerHTML = '';
        
        if (filteredNotes.length === 0) {
            notesContainer.innerHTML = '<div class="no-results">No matching notes found</div>';
            return;
        }

        filteredNotes.forEach(note => {
            const noteElement = document.createElement('div');
            noteElement.className = 'note-card';
            noteElement.style.backgroundColor = note.color;
            noteElement.innerHTML = `
                <div class="note-header">
                    <h3>${highlightText(note.title, searchTerm)}</h3>
                    <button class="delete-btn" onclick="deleteNote('${note.id}')">×</button>
                </div>
                <p>${highlightText(note.content, searchTerm)}</p>
                <small>${new Date(note.date).toLocaleDateString()}</small>
            `;
            noteElement.addEventListener('dblclick', () => openEditor(note));
            notesContainer.appendChild(noteElement);
        });
    }, 300); // Debounce delay
}

function highlightText(text, searchTerm) {
    if (!searchTerm) return text;
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
}

// Add event listener for search type
document.getElementById('searchType').addEventListener('change', filterNotes);