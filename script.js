document.addEventListener("DOMContentLoaded", function () {

    const themeToggle = document.getElementById("themeToggle")
    const body = document.body;
    const addNoteWrapperContainer = document.querySelector('.wrapper-container');
    // Changed to select the wrapper-main for the hover effect

    const noteContentWrapper = document.querySelector('.note-content-wrapper');
    const noteContentContainer = document.querySelector('.content-container');
    const noteForm = document.querySelector('.note-content');

    const viewNoteWrapper = document.querySelector('.view-note-wrapper');
    const viewNoteContainer = document.querySelector('.view-note-container');

    const closeFormBtn = document.getElementById('close');
    const addNote = document.querySelector(".add-note");
    const closeViewBtn = document.getElementById("closeView");
    const submitBtn = document.getElementById('submit'); // Get submit button for dynamic text

    const search = document.getElementById("search-input")
    const selectTag = document.getElementById("select-tag")
    const searchBtn = document.getElementById("search-btn")

    let notes = JSON.parse(localStorage.getItem('notes')) || [];
    let isEditMode = false;
    let noteToEditIndex = -1;

    // --- Search Button Functionality ---
    searchBtn.addEventListener("click", (e) => {
        let searchinput = search.value
        let selectval = selectTag.value
        // console.log(searchinput , selectval);
        if(selectval === "all"){
            // console.log("this is all" , selectval)
            renderNotes()
            return
        }
        renderNotes(searchinput, selectval === "-1" ? "" : selectval);
    })
    // --- Theme toggle functionality ---
    // Initialize theme based on localStorage
    if (localStorage.getItem('theme') === 'light') { // Assuming default in CSS is dark, so 'light' means toggle is active
        body.classList.add('light-theme'); // Add a class for light theme
        themeToggle.innerHTML = '<i class="fa-solid fa-sun" style="color: #f7b731;"></i>'; // Sun icon for light
    } else {
        themeToggle.innerHTML = '<i class="fa-solid fa-moon" style="color: #7873f5;"></i>'; // Moon icon for dark
    }

    themeToggle.addEventListener('click', () => {
        body.classList.toggle('light-theme'); // Toggle the light-theme class
        if (body.classList.contains('light-theme')) {
            localStorage.setItem('theme', 'light');
            themeToggle.innerHTML = '<i class="fa-solid fa-sun" style="color: #f7b731;"></i>';
        } else {
            localStorage.setItem('theme', 'dark');
            themeToggle.innerHTML = '<i class="fa-solid fa-moon" style="color: #7873f5;"></i>';
        }
    });



    // Add Event Delegation On Parent of Button for Note Opens New Popup to add Note
    addNoteWrapperContainer.addEventListener("click", (e) => {
        const noteElement = e.target.closest(".note-mssg");

        if (e.target.closest(".add-note")) {
            noteContentWrapper.classList.add("active");
        }
        // console.log(e.target ,e.target.classList.contains("note-mssg"));
        if (noteElement) {
            const index = noteElement.dataset.index;   // get the originalIndex we stored
            handleView(index);
        }

        if (e.target.closest("button")) {
            const btn = e.target.closest("button"); // get the button element 
            // so inside button we have icon so if we click on icon then it give us the closest parent of that ocon which is button 

            const index = btn.dataset.index;   // get the originalIndex we stored

            if (btn.classList.contains("view") || e.target.classList.contains("note-mssg")) {
                handleView(index);
            }
            else if (btn.classList.contains("edit")) {
                handleEdit(index);
            }
            else if (btn.classList.contains("delete")) {
                handleDelete(index);
            }
        }
    });

    // addNote.addEventListener("click", (e) => {
    //     console.log("hii")
    //     noteContentWrapper.classList.add("active");
    // }) Ye remove ho ja raha tha jb mai innertext change kr raha 
    //    tha niche in renderNotes kyuki DOM chnage hogaya tha Thats why we put event delegation 

    // Close the popup after u done the adding of Note
    closeFormBtn.addEventListener("click", (e) => {
        e.preventDefault()
        noteContentWrapper.classList.remove("active");
    });

    //add Event Delegation on this so that user can close popup 
    // if they click anywhere expect popup
    noteContentContainer.addEventListener("click", (e) => {
        if (e.target === noteContentContainer) {
            noteContentWrapper.classList.remove("active");
        }
    })

    //  Close ViewNote Popup if user clicks on Cross mark
    closeViewBtn.addEventListener("click", () => {
        viewNoteWrapper.classList.remove("active");
    });

    // also Close ViewNote Popup if user clicks outside
    viewNoteWrapper.addEventListener("click", (e) => {
        if (e.target === viewNoteWrapper) {
            viewNoteWrapper.classList.remove("active");
        }
    });

    // Now Submit The Note From Popup
    submitBtn.addEventListener("click", (e) => {
        e.preventDefault()
        let title = document.getElementById("title").value
        let message = document.getElementById("message").value
        const selectedTag = document.querySelector('input[name="noteTag"]:checked');
        const tag = selectedTag ? selectedTag.value : 'personal'; // Default tag
        if (!title.trim() || !message.trim()) {
            alert('Please enter both a title and content for your note.');
            return;
        }

        const noteval = {
            title,
            message,
            tag,
            timestamp: new Date().toISOString()
        }

        if (isEditMode && noteToEditIndex !== -1) {
            // Editing the Exsisting Note
            notes[noteToEditIndex] = { title, message, tag, timestamp: new Date().toISOString() };
            isEditMode = false;
            noteToEditIndex = -1;
        }
        else {
            notes.push(noteval)
        }
        localStorage.setItem("notes", JSON.stringify(notes))
        renderNotes()
        noteContentWrapper.classList.remove("active"); // close popup
    })

    // code to Render all Notes
    function renderNotes(filterTitle = "", filterTag = "") {
        addNoteWrapperContainer.innerHTML = `<div class="wrapper-main">
            <div class="wrapper flex">
                <div class="add-note flex">
                    <i class="fa-solid fa-plus"></i>
                </div>
                <div class="wrapper-text">
                    <h2>Add Notes</h2>
                </div>
            </div>
        </div>`
        if (notes.length === 0) {
            addNoteWrapperContainer.innerHTML += `<p class="empty-notes-message">No notes yet. Click "Add Notes" to create one!</p>';`
            return
        }
        let sortedNotes = [...notes].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))

        // Filter Functionality For Searching

        if (filterTag !== "" && filterTitle !== "") {
            sortedNotes = notes.filter(note =>
                note.title.toLowerCase().includes(filterTitle) &&
                note.tag === filterTag
            );
        } else if (filterTitle !== "") {
            sortedNotes = notes.filter(note =>
                note.title.toLowerCase().includes(filterTitle)
            );
        } else if (filterTag !== "") {
            sortedNotes = notes.filter(note =>
                note.tag === filterTag
            );
        }

        sortedNotes.forEach((note, index) => {
            // Return First Index that meet This Condition 1.e Original Index
            const originalIndex = notes.findIndex(n =>
                n.timestamp === note.timestamp && n.title === note.title
            )
            const tag = getTagIcon(note.tag)
            const title = note.title
            const message = note.message
            addNoteWrapperContainer.innerHTML += `<div class="wrapper-main">
            <div class="wrapper flex">
                <h3 class="note-title">${title}</h3>
                <div class="note-mssg" data-index="${originalIndex}">
                    <p>${message}</p>
                </div>
                <div class="note-control">
                                ${tag}
                    <div class="controls">
                        <button class="view" data-index="${originalIndex}" title="View"><i class="fa-solid fa-eye"></i></button>
                        <button class="edit" data-index="${originalIndex}" title="Edit"><i class="fa-solid fa-pen"></i></button>
                        <button class="delete" data-index="${originalIndex}" title="Delete"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </div>
            </div>
        </div>`
        })

    }

    // Handle the View button inside Note
    function handleView(index) {
        const note = notes[index];

        // Fill popup fields
        document.getElementById("viewTitle").innerText = note.title;
        document.getElementById("viewMessage").innerText = note.message;
        document.getElementById("viewTag").innerHTML = getTagIcon(note.tag);
        document.getElementById("viewDate").innerText =
            "Created on: " + new Date(note.timestamp).toLocaleString();

        // Show popup
        document.querySelector(".view-note-wrapper").classList.add("active");
    }


    // Handle the Edit button inside Note
    function handleEdit(index) {
        let note = notes[index]
        title.value = note.title
        message.value = note.message
        document.querySelector(`input[name="noteTag"][value="${note.tag}"]`).checked = true;
        noteContentWrapper.classList.add("active");
        isEditMode = true
        noteToEditIndex = index
    }


    // Handle the Delete button inside Note
    function handleDelete(index) {
        if ((confirm("Are you sure you want to delete this note?"))) {
            notes.splice(index, 1)
            localStorage.setItem("notes", JSON.stringify(notes))
            renderNotes()
        }
    }

    // Function To get the icon Based on Tag Name
    function getTagIcon(tag) {
        switch (tag) {
            case 'work': return `<span class="tag-label tag-work">
                                <i class="fa-solid fa-briefcase"></i> Work
                            </span>`;
            case 'personal': return ` <span class="tag-label tag-personal">
                                <i class="fa-solid fa-user"></i> Personal
                            </span>`;
            case 'idea': return `<span class="tag-label tag-idea">
                                <i class="fa-solid fa-lightbulb"></i> Idea
                            </span>`;
            case 'reminder': return `<span class="tag-label tag-rem">
                                <i class="fa-solid fa-bell"></i> Reminder
                            </span>`;
            default: return `<i class="fa-solid fa-user"></i> Personal`; // Default icon
        }
    }
    renderNotes()
});

