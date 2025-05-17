// Let's grab those elements from our HTML, like setting up our tools
const notesContainer = document.getElementById('notes-container');
const emptyState = document.getElementById('empty-state');
const addNoteBtn = document.getElementById('add-note-btn');
const addNoteModal = document.getElementById('add-note-modal');
const closeModalBtn = document.getElementById('close-modal');
const addNoteForm = document.getElementById('add-note-form');
const searchInput = document.getElementById('search-input');
const themeToggle = document.getElementById('theme-toggle');
const filterTabs = document.getElementById('filter-tabs');
const toggleViewBtn = document.getElementById('toggle-view');
const toggleSortBtn = document.getElementById('toggle-sort');
const filterBtn = document.getElementById('filter-btn');
const filterDropdown = document.getElementById('filter-dropdown');
const userMenuBtn = document.getElementById('user-menu-btn');
const userDropdown = document.getElementById('user-dropdown');
const noteFormTabs = document.getElementById('note-form-tabs');
const chooseImageBtn = document.getElementById('choose-image-btn');
const imageInput = document.getElementById('image-input');
const imagePreview = document.getElementById('image-preview');
const noteTemplate = document.getElementById('note-template');

// Some variables to keep track of things
let notes = []; // Our notes will be stored here
let activeFilter = 'all'; // Which filter is active (all, pinned, category)
let viewMode = 'grid'; // Grid or list view
let sortOrder = 'newest'; // Newest or oldest first
let activeTab = 'content'; // Which tab in the note form is active
let selectedImageData = null; // Holds the image data for a note
let isDragging = false; // Flag to check note is dragging or not
let draggedNote = null; // Which note is being dragged
let initialX = 0; // Initial X position of the mouse during drag
let initialY = 0; // Initial Y position of the mouse during drag
let currentX = 0; // Current X position of the note
let currentY = 0; // Current Y position of the note
let offsetX = 0; // Offset between mouse and note during drag
let offsetY = 0; // Offset between mouse and note during drag

// List of pastel colors
const pastelColors = [
    '#FFD1DC', // pastel pink
    '#B5EAD7', // pastel mint
    '#FFDAC1', // pastel peach
    '#C7CEEA', // pastel lavender
    '#E2F0CB', // pastel green
    '#FFF1BA', // pastel yellow
    '#B5D8FA', // pastel blue
    '#FFB7B2', // pastel coral
    '#D5C6E0', // pastel purple
    '#F3B0C3'  // pastel rose
];

function getRandomPastelColor() {
    return pastelColors[Math.floor(Math.random() * pastelColors.length)];
}

// Add playful font
const playfulFont = "'Fredoka One', 'Comic Sans MS', 'Baloo', 'cursive', 'sans-serif'";

// Utility to get a strong, high-contrast dark color for text/icons
function getContrastColor(hex) {
    // Convert hex to RGB
    let col = hex.replace('#', '');
    if (col.length === 3) col = col.split('').map(x => x + x).join('');
    let num = parseInt(col, 16);
    let r = (num >> 16) & 0xFF;
    let g = (num >> 8) & 0xFF;
    let b = num & 0xFF;
    // Calculate luminance
    let luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    // If luminance is high, return a strong dark color, else return white
    return luminance > 0.6 ? '#222' : '#fff';
}

// Utility to convert hex color to rgba with alpha
function hexToRgba(hex, alpha = 0.35) {
    let c = hex.replace('#', '');
    if (c.length === 3) c = c.split('').map(x => x + x).join('');
    const num = parseInt(c, 16);
    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;
    return `rgba(${r},${g},${b},${alpha})`;
}

// Utility to darken a hex color
function darkenHex(hex, amount = 40) {
    let c = hex.replace('#', '');
    if (c.length === 3) c = c.split('').map(x => x + x).join('');
    let num = parseInt(c, 16);
    let r = Math.max(0, ((num >> 16) & 255) - amount);
    let g = Math.max(0, ((num >> 8) & 255) - amount);
    let b = Math.max(0, (num & 255) - amount);
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

// Let's get this show on the road!
function init() {
    loadNotes(); // Load notes from local storage
    renderNotes(); // Display the notes
    setupEventListeners(); // Set up all the things that respond to clicks and stuff
}

// Load notes from localStorage
function loadNotes() {
    const savedNotes = localStorage.getItem('sticky-notes');
    if (savedNotes) {
        try {
            notes = JSON.parse(savedNotes);
        } catch (error) {
            console.error('Failed to parse notes from localStorage:', error);
            notes = [];
        }
    }
}

// Save notes to localStorage
function saveNotes() {
    localStorage.setItem('sticky-notes', JSON.stringify(notes));
}

// Display the notes on the page
function renderNotes() {
    notesContainer.innerHTML = ''; // Clear out the old notes
    
    // Filter the notes based on the active filter
    let filteredNotes = notes.filter(note => {
        if (activeFilter === 'all') return true; // Show all notes
        if (activeFilter === 'pinned') return note.isPinned; // Show only pinned notes
        return note.category.toLowerCase() === activeFilter.toLowerCase(); // Show notes from a specific category
    });
    
    // Sort the notes
    filteredNotes.sort((a, b) => {
        if (sortOrder === 'newest') {
            return b.createdAt - a.createdAt; // Newest first
        } else {
            return a.createdAt - b.createdAt; // Oldest first
        }
    });
    
    // If there are no notes, show the empty state message
    if (filteredNotes.length === 0) {
        emptyState.style.display = 'flex';
    } else {
        emptyState.style.display = 'none';
        
        // Create a note element for each note and add it to the container
        filteredNotes.forEach(note => {
            const noteElement = createNoteElement(note);
            notesContainer.appendChild(noteElement);
        });
    }
}

// Create a note element from template
function createNoteElement(note) {
    const noteElement = document.importNode(noteTemplate.content, true).querySelector('.note-card');
    
    // Set note data attribute
    noteElement.dataset.id = note.id;
    
    // Set category class
    if (note.category) {
        noteElement.classList.add(note.category.toLowerCase());
    }
    
    // Set pinned state
    if (note.isPinned) {
        noteElement.classList.add('pinned');
        const pinBtn = noteElement.querySelector('.pin-btn');
        pinBtn.classList.add('active');
        pinBtn.innerHTML = '<i class="fas fa-thumbtack"></i>';
    }
    
    // Set position if available
    if (note.x !== undefined && note.y !== undefined) {
        noteElement.style.transform = `translate(${note.x}px, ${note.y}px)`;
    }
    
    // Set content
    const titleElement = noteElement.querySelector('.note-title');
    const contentElement = noteElement.querySelector('.note-text');
    const dateElement = noteElement.querySelector('.note-date');
    const imageElement = noteElement.querySelector('.note-image');
    const imageContainer = noteElement.querySelector('.note-image-container');
    
    titleElement.textContent = note.title || 'Untitled Note';
    contentElement.textContent = note.content;
    dateElement.textContent = new Date(note.createdAt).toLocaleDateString();
    
    // Handle image
    if (note.image) {
        imageElement.src = note.image;
        imageContainer.style.display = 'block';
    } else {
        imageContainer.style.display = 'none';
        imageElement.src = ''; // Clear the src attribute instead of using placeholder
    }
    
    // Set background and text color
    const bg = note.bgColor || '#f8faff';
    noteElement.style.background = hexToRgba(bg, 0.35);
    // Set border to a darker version of the background color
    noteElement.style.border = `1px solid ${darkenHex(bg, 60)}`;
    // Use strong contrast color for text/icons
    const contrastColor = getContrastColor(bg);
    noteElement.style.color = contrastColor;
    noteElement.style.fontFamily = note.fontFamily || playfulFont;
    
    // Add hover effect with pastel color shadow
    noteElement.addEventListener('mouseenter', () => {
        noteElement.style.boxShadow = `0 16px 48px 0 ${hexToRgba(bg, 0.4)}, 0 2px 8px ${hexToRgba(bg, 0.2)}`;
        noteElement.style.transform = 'translateY(-2px) scale(1.012)';
    });
    
    noteElement.addEventListener('mouseleave', () => {
        noteElement.style.boxShadow = '';
        noteElement.style.transform = '';
    });
    
    // Set icon color for actions and footer
    const actions = noteElement.querySelector('.note-actions');
    if (actions) actions.style.color = contrastColor;
    const footer = noteElement.querySelector('.note-footer');
    if (footer) footer.style.color = contrastColor;
    
    // Setup event listeners for the note
    setupNoteEventListeners(noteElement, note);
    
    // Animate note appearance with GSAP
    setTimeout(() => {
        if (window.gsap) {
            gsap.fromTo(noteElement, {y: 40, opacity: 0}, {y: 0, opacity: 1, duration: 0.7, ease: 'power3.out'});
        }
    }, 0);
    
    return noteElement;
}

// Set up the event listeners for a single note
function setupNoteEventListeners(noteElement, note) {
    const pinBtn = noteElement.querySelector('.pin-btn');
    const duplicateBtn = noteElement.querySelector('.duplicate-btn');
    const deleteBtn = noteElement.querySelector('.delete-btn');
    const closeBtn = noteElement.querySelector('.close-btn');
    const contentElement = noteElement.querySelector('.note-text');
    const titleElement = noteElement.querySelector('.note-title');
    
    // When the pin button is clicked, toggle the note's pinned state
    pinBtn.addEventListener('click', () => {
        note.isPinned = !note.isPinned;
        updateNote(note);
        renderNotes();
    });
    
    // When the duplicate button is clicked, duplicate the note
    duplicateBtn.addEventListener('click', () => {
        duplicateNote(note);
    });
    
    // When the delete button is clicked, delete the note
    deleteBtn.addEventListener('click', () => {
        deleteNote(note.id);
    });
    
    closeBtn.addEventListener('click', () => {
        deleteNote(note.id);
    });
    
    // Direct edit for title
    titleElement.addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'text';
        input.value = note.title;
        input.className = 'edit-title-input';
        input.style.width = '100%';
        input.style.fontWeight = 'bold';
        input.style.fontSize = '1.1rem';
        input.style.marginBottom = '0.5rem';
        input.style.color = titleElement.style.color;
        input.style.background = note.bgColor || '#f8faff';
        titleElement.replaceWith(input);
        input.focus();
        input.addEventListener('blur', () => {
            note.title = input.value;
            updateNote(note);
            renderNotes();
        });
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                input.blur();
            }
        });
    });

    // Direct edit for content
    contentElement.addEventListener('click', () => {
        const textarea = document.createElement('textarea');
        textarea.value = note.content;
        textarea.className = 'edit-textarea';
        textarea.style.width = '100%';
        textarea.style.minHeight = '100px';
        textarea.style.padding = '0.5rem';
        textarea.style.border = '1px solid #e0e0e0';
        textarea.style.backgroundColor = note.bgColor || '#f8faff';
        textarea.style.color = contentElement.style.color;
        textarea.style.resize = 'vertical';
        textarea.style.fontFamily = 'inherit';
        textarea.style.fontSize = '1rem';
        textarea.style.marginBottom = '0.5rem';
        contentElement.replaceWith(textarea);
        textarea.focus();
        textarea.addEventListener('blur', () => {
            note.content = textarea.value;
            updateNote(note);
            renderNotes();
        });
        textarea.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                textarea.blur();
                e.preventDefault();
            }
        });
    });
    
    // Drag functionality
    noteElement.addEventListener('mousedown', (e) => {
        if (e.target === contentElement || e.target.closest('.note-actions')) {
            return;
        }
        
        isDragging = true;
        draggedNote = noteElement;
        
        // Get initial positions
        const rect = noteElement.getBoundingClientRect();
        initialX = e.clientX;
        initialY = e.clientY;
        
        // Calculate offset from the mouse position to the top-left corner of the note
        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;
        
        // Get current transform values
        const transform = window.getComputedStyle(noteElement).getPropertyValue('transform');
        const matrix = new DOMMatrix(transform);
        currentX = matrix.m41;
        currentY = matrix.m42;
        
        noteElement.classList.add('dragging');
        
        // Add global event listeners
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    });
}

// Handle mouse move during drag
function handleMouseMove(e) {
    if (!isDragging) return;
    const dx = e.clientX - initialX;
    const dy = e.clientY - initialY;
    let newX = currentX + dx;
    let newY = currentY + dy;
    // Get window and note dimensions
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const noteRect = draggedNote.getBoundingClientRect();
    const noteWidth = noteRect.width;
    const noteHeight = noteRect.height;
    // Margin to keep note visible
    const margin = 12;
    // Constrain horizontally
    newX = Math.max(margin, Math.min(newX, windowWidth - noteWidth - margin));
    // Constrain vertically (allow anywhere in viewport)
    newY = Math.max(margin, Math.min(newY, windowHeight - noteHeight - margin));
    // Use GSAP for smooth dragging
    if (window.gsap) {
        gsap.to(draggedNote, { x: newX, y: newY, duration: 0.18, overwrite: 'auto', ease: 'power2.out' });
    } else {
        draggedNote.style.transform = `translate(${newX}px, ${newY}px)`;
    }
}

// Handle mouse up after drag
function handleMouseUp(e) {
    if (!isDragging) return;
    
    isDragging = false;
    draggedNote.classList.remove('dragging');
    
    // Update note position
    const transform = window.getComputedStyle(draggedNote).getPropertyValue('transform');
    const matrix = new DOMMatrix(transform);
    const noteId = draggedNote.dataset.id;
    const note = notes.find(n => n.id === noteId);
    
    if (note) {
        note.x = matrix.m41;
        note.y = matrix.m42;
        updateNote(note);
    }
    
    // Remove global event listeners
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
}

// Add a new note to our list
function addNote(noteData) {
    const newNote = {
        id: generateId(),
        title: noteData.title || 'Untitled Note',
        content: noteData.content,
        category: noteData.category.toLowerCase(),
        createdAt: Date.now(),
        isPinned: false,
        x: Math.random() * 50,
        y: Math.random() * 50,
        image: noteData.image,
        bgColor: getRandomPastelColor(),
        textColor: noteData.textColor || '#222222',
        fontFamily: playfulFont
    };
    notes.push(newNote);
    saveNotes();
    renderNotes();
}

// Update an existing note
function updateNote(updatedNote) {
    const index = notes.findIndex(note => note.id === updatedNote.id);
    if (index !== -1) {
        notes[index] = { ...notes[index], ...updatedNote, editedAt: Date.now() };
        saveNotes();
    }
}

// Remove a note from our list
function deleteNote(id) {
    notes = notes.filter(note => note.id !== id); // Filter out the note with the given ID
    saveNotes(); // Save the changes
    renderNotes(); // Update the display
}

// Duplicate a note
function duplicateNote(note) {
    const duplicatedNote = {
        ...note,
        id: generateId(),
        title: `${note.title} (Copy)`,
        createdAt: Date.now(),
        isPinned: false,
        x: (note.x || 0) + 20,
        y: (note.y || 0) + 20,
        bgColor: getRandomPastelColor(),
        fontFamily: playfulFont
    };
    
    notes.push(duplicatedNote);
    saveNotes();
    renderNotes();
    
    // Visual feedback
    const originalElement = document.querySelector(`.note-card[data-id="${note.id}"]`);
    if (originalElement) {
        const rect = originalElement.getBoundingClientRect();
        const ghost = document.createElement('div');
        ghost.style.position = 'absolute';
        ghost.style.top = `${rect.top}px`;
        ghost.style.left = `${rect.left}px`;
        ghost.style.width = `${rect.width}px`;
        ghost.style.height = `${rect.height}px`;
        ghost.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
        ghost.style.borderRadius = '8px';
        ghost.style.zIndex = '9999';
        ghost.style.transition = 'all 0.3s ease';
        
        document.body.appendChild(ghost);
        
        setTimeout(() => {
            ghost.style.transform = 'translate(20px, 20px)';
            ghost.style.opacity = '0';
        }, 10);
        
        setTimeout(() => {
            document.body.removeChild(ghost);
        }, 300);
    }
}

// Make a unique ID for each note
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Set up the event listeners for the whole page
function setupEventListeners() {
    // When the add note button is clicked, show the add note modal
    if (addNoteBtn) {
        addNoteBtn.addEventListener('click', () => {
            addNoteModal.classList.add('active');
            if (window.gsap) {
                gsap.fromTo('.modal-content', {scale: 0.85, opacity: 0}, {scale: 1, opacity: 1, duration: 0.5, ease: 'power2.out'});
            }
        });
    }
    
    // When the close modal button is clicked, hide the add note modal
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            if (window.gsap) {
                gsap.to('.modal-content', {scale: 0.85, opacity: 0, duration: 0.4, ease: 'power2.in', onComplete: () => {
                    addNoteModal.classList.remove('active');
                    resetForm();
                }});
            } else {
                addNoteModal.classList.remove('active');
                resetForm();
            }
        });
    }
    
    // If you click outside the modal, hide it
    if (addNoteModal) {
        addNoteModal.addEventListener('click', (e) => {
            if (e.target === addNoteModal) {
                addNoteModal.classList.remove('active');
                resetForm();
            }
        });
    }
    
    // When the add note form is submitted, add the note
    if (addNoteForm) {
        addNoteForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const title = document.getElementById('note-title').value;
            const content = document.getElementById('note-content').value;
            const categoryRadios = document.getElementsByName('category');
            let category = 'personal';
            for (const radio of categoryRadios) {
                if (radio.checked) {
                    category = radio.value;
                    break;
                }
            }
            const bgColor = document.getElementById('note-bg-color').value;
            const textColor = document.getElementById('note-text-color').value;
            if (content.trim()) {
                addNote({
                    title,
                    content,
                    category,
                    image: selectedImageData,
                    bgColor,
                    textColor
                });
                addNoteModal.classList.remove('active');
                resetForm();
            }
        });
    }
    
    // When the search input changes, filter the notes
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase(); // Get the search query
            
            // Filter the notes based on the search query
            const filteredNotes = notes.filter(note => {
                return note.title.toLowerCase().includes(query) || 
                       note.content.toLowerCase().includes(query);
            });
            
            renderFilteredNotes(filteredNotes); // Display the filtered notes
        });
    }
    
    // When the theme toggle is clicked, switch the theme
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-theme'); // Add or remove the dark-theme class
            
            const isDark = document.body.classList.contains('dark-theme'); // Check if we're in dark mode
            themeToggle.innerHTML = isDark ? 
                '<i class="fas fa-moon"></i>' : 
                '<i class="fas fa-sun"></i>'; // Update the icon
            
            localStorage.setItem('theme', isDark ? 'dark' : 'light'); // Save the theme preference
        });
    }
    
    // When a filter tab is clicked, filter the notes
    if (filterTabs) {
        filterTabs.addEventListener('click', (e) => {
            if (e.target.classList.contains('tab')) {
                const tabs = filterTabs.querySelectorAll('.tab');
                tabs.forEach(tab => tab.classList.remove('active'));
                
                e.target.classList.add('active');
                activeFilter = e.target.dataset.filter;
                
                renderNotes();
            }
        });
    }
    
    // When the toggle view button is clicked, switch the view mode
    if (toggleViewBtn) {
        toggleViewBtn.addEventListener('click', () => {
            viewMode = viewMode === 'grid' ? 'list' : 'grid'; // Toggle the view mode
            notesContainer.className = `notes-container ${viewMode}-view`; // Update the container class
            
            toggleViewBtn.innerHTML = viewMode === 'grid' ? 
                '<i class="fas fa-th-large"></i>' : 
                '<i class="fas fa-list"></i>'; // Update the icon
        });
    }
    
    // When the toggle sort button is clicked, switch the sort order
    if (toggleSortBtn) {
        toggleSortBtn.addEventListener('click', () => {
            sortOrder = sortOrder === 'newest' ? 'oldest' : 'newest'; // Toggle the sort order
            
            toggleSortBtn.innerHTML = sortOrder === 'newest' ? 
                '<i class="fas fa-sort-amount-down"></i>' : 
                '<i class="fas fa-sort-amount-up"></i>'; // Update the icon
            
            renderNotes(); // Re-render the notes with the new sort order
        });
    }
    
    // When the filter button is clicked, show/hide the filter dropdown
    if (filterBtn && filterDropdown) {
        filterBtn.addEventListener('click', () => {
            filterDropdown.classList.toggle('active');
        });
    }
    
    // When the user menu button is clicked, show/hide the user dropdown
    if (userMenuBtn && userDropdown) {
        userMenuBtn.addEventListener('click', () => {
            userDropdown.classList.toggle('active');
        });
    }
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', (e) => {
        if (filterDropdown && !e.target.closest('#filter-btn') && !e.target.closest('#filter-dropdown')) {
            filterDropdown.classList.remove('active');
        }
        
        if (userDropdown && !e.target.closest('#user-menu-btn') && !e.target.closest('#user-dropdown')) {
            userDropdown.classList.remove('active');
        }
    });
    
    // Note form tabs
    if (noteFormTabs) {
        noteFormTabs.addEventListener('click', (e) => {
            if (e.target.classList.contains('tab')) {
                const tabs = noteFormTabs.querySelectorAll('.tab');
                tabs.forEach(tab => tab.classList.remove('active'));
                
                e.target.classList.add('active');
                activeTab = e.target.dataset.tab;
                
                const tabContents = document.querySelectorAll('.tab-content');
                tabContents.forEach(content => content.classList.remove('active'));
                
                const activeTabContent = document.getElementById(`${activeTab}-tab`);
                if (activeTabContent) {
                    activeTabContent.classList.add('active');
                }
            }
        });
    }
    
    // Image upload
    if (chooseImageBtn && imageInput) {
        chooseImageBtn.addEventListener('click', () => {
            imageInput.click();
        });
    }
    
    if (imageInput && imagePreview) {
        imageInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            // Check file size (limit to 5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert('Image size should be less than 5MB');
                return;
            }
            
            const reader = new FileReader();
            reader.onload = (event) => {
                selectedImageData = event.target.result;
                
                // Show preview
                imagePreview.innerHTML = `
                    <img src="${selectedImageData}" alt="Preview">
                    <button class="close-btn" id="remove-image">
                        <i class="fas fa-times"></i>
                    </button>
                `;
                imagePreview.style.display = 'block';
                
                // Setup remove button
                const removeImageBtn = document.getElementById('remove-image');
                if (removeImageBtn) {
                    removeImageBtn.addEventListener('click', () => {
                        selectedImageData = null;
                        imagePreview.innerHTML = '';
                        imagePreview.style.display = 'none';
                        imageInput.value = '';
                    });
                }
            };
            reader.readAsDataURL(file);
        });
    }
    
    // Emoji buttons
    const emojiButtons = document.querySelectorAll('.emoji-btn');
    emojiButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const contentTextarea = document.getElementById('note-content');
            if (contentTextarea) {
                contentTextarea.value += btn.textContent;
            }
        });
    });
    
    // Load theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light' && themeToggle) {
        document.body.classList.remove('dark-theme');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }
}

// Display the filtered notes on the page
function renderFilteredNotes(filteredNotes) {
    notesContainer.innerHTML = ''; // Clear out the old notes
    
    // If there are no notes, show the empty state message
    if (filteredNotes.length === 0) {
        emptyState.style.display = 'flex';
    } else {
        emptyState.style.display = 'none';
        
        // Create a note element for each note and add it to the container
        filteredNotes.forEach(note => {
            const noteElement = createNoteElement(note);
            notesContainer.appendChild(noteElement);
        });
    }
}

// Clear out the add note form
function resetForm() {
    document.getElementById('note-title').value = ''; // Clear the title
    document.getElementById('note-content').value = ''; // Clear the content
    document.querySelector('input[name="category"][value="Personal"]').checked = true; // Reset the category
    
    selectedImageData = null;
    imagePreview.innerHTML = '';
    imagePreview.style.display = 'none';
    imageInput.value = '';
    
    // Reset tabs
    const tabs = noteFormTabs.querySelectorAll('.tab');
    tabs.forEach(tab => tab.classList.remove('active'));
    tabs[0].classList.add('active');
    
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => content.classList.remove('active'));
    document.getElementById('content-tab').classList.add('active');
}

// Auto arrange notes: reset all x/y to 0 and re-render
function autoArrangeNotes() {
    notes.forEach(note => {
        note.x = 0;
        note.y = 0;
    });
    saveNotes();
    renderNotes();
}

// Add event listener for auto-arrange button
const autoArrangeBtn = document.getElementById('auto-arrange-btn');
if (autoArrangeBtn) {
    autoArrangeBtn.addEventListener('click', autoArrangeNotes);
}

// When the page loads, initialize the app
document.addEventListener('DOMContentLoaded', () => {
    init();
    // Vanta.js NOISE effect for background
    if (window.VANTA && window.VANTA.NOISE) {
        window.VANTA.NOISE({
            el: '#bg-canvas',
            mouseControls: true,
            touchControls: true,
            minHeight: 200.00,
            minWidth: 200.00,
            scale: 1.0,
            scaleMobile: 1.0,
            color: 0xffdac1,
            color2: 0xb5ead7,
            backgroundColor: 0xffffff,
            points: 12.0,
            maxDistance: 18.0,
            spacing: 18.0,
            showDots: false,
            highlightColor: 0xc7ceea,
            midtoneColor: 0xffd1dc,
            lowlightColor: 0xb5d8fa,
            baseColor: 0xffffff,
            zoom: 1.2
        });
    }
});

// Custom cursor
const cursor = document.querySelector('.cursor');
const cursorDot = document.querySelector('.cursor-dot');
const cursorOutline = document.querySelector('.cursor-outline');

document.addEventListener('mousemove', (e) => {
    const posX = e.clientX;
    const posY = e.clientY;

    cursorDot.style.left = `${posX}px`;
    cursorDot.style.top = `${posY}px`;

    cursorOutline.animate({
        left: `${posX}px`,
        top: `${posY}px`
    }, {
        duration: 500,
        fill: "forwards"
    });
});

// Scroll progress indicator
const scrollProgress = document.querySelector('.scroll-progress');

window.addEventListener('scroll', () => {
    const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (window.scrollY / windowHeight) * 100;
    scrollProgress.style.transform = `scaleX(${scrolled / 100})`;
});

// Scroll to top button
const scrollTopBtn = document.querySelector('.scroll-top-btn');

window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
        scrollTopBtn.classList.add('visible');
    } else {
        scrollTopBtn.classList.remove('visible');
    }
});

scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// Text reveal animation
const revealTexts = document.querySelectorAll('.reveal-text');

const revealText = (entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
        }
    });
};

const textObserver = new IntersectionObserver(revealText, {
    threshold: 0.1
});

revealTexts.forEach(text => {
    textObserver.observe(text);
});

// Magnetic button effect
const magneticButtons = document.querySelectorAll('.magnetic-button');

magneticButtons.forEach(button => {
    button.addEventListener('mousemove', (e) => {
        const rect = button.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        button.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
    });

    button.addEventListener('mouseleave', () => {
        button.style.transform = 'translate(0px, 0px)';
    });
});

// Mobile menu
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const mobileMenu = document.querySelector('.mobile-menu');

mobileMenuBtn.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
});

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

// Add hover effect to cards
const cards = document.querySelectorAll('.feature-card, .workflow-card');

cards.forEach(card => {
    card.addEventListener('mouseenter', () => {
        card.classList.add('hover');
    });

    card.addEventListener('mouseleave', () => {
        card.classList.remove('hover');
    });
});

// Initialize animations when page loads
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
});