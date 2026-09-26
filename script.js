/* =========================================
   DATABASE
========================================= */

let academicRecords =
    JSON.parse(localStorage.getItem("academicRecords")) || [];

let generalFiles =
    JSON.parse(localStorage.getItem("generalFiles")) || [];

let profilePicture =
    localStorage.getItem("profilePicture") || "";

let currentCategory = "Quiz";


/* =========================================
   PROFILE PICTURE
========================================= */

const profileUpload =
    document.getElementById("profileUpload");

const profileImage =
    document.getElementById("profileImage");


if (profilePicture) {
    profileImage.src = profilePicture;
}


profileUpload.addEventListener("change", function () {

    const file = this.files[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {

        alert("Please select an image.");

        return;
    }

    const reader = new FileReader();

    reader.onload = function (event) {

        profileImage.src = event.target.result;

        localStorage.setItem(
            "profilePicture",
            event.target.result
        );

    };

    reader.readAsDataURL(file);

});


/* =========================================
   CATEGORY BUTTONS
========================================= */

const categoryButtons =
    document.querySelectorAll(".category-btn");


categoryButtons.forEach(button => {

    button.addEventListener("click", function () {

        categoryButtons.forEach(btn =>
            btn.classList.remove("active")
        );

        this.classList.add("active");

        currentCategory =
            this.dataset.category;

        renderAcademicRecords();

    });

});


/* =========================================
   ACADEMIC FILE UPLOAD
========================================= */

const academicUpload =
    document.getElementById("academicUpload");


academicUpload.addEventListener("change", async function () {

    const files = Array.from(this.files);

    for (const file of files) {

        const base64 =
            await fileToBase64(file);

        academicRecords.push({

            id:
                Date.now() +
                Math.random(),

            category:
                currentCategory,

            name:
                file.name,

            type:
                file.type,

            size:
                file.size,

            data:
                base64,

            date:
                new Date().toLocaleString()

        });

    }

    saveAcademicRecords();

    renderAcademicRecords();

    this.value = "";

});


/* =========================================
   GENERAL FILE UPLOAD
========================================= */

const generalFileUpload =
    document.getElementById("generalFileUpload");


generalFileUpload.addEventListener(
    "change",
    async function () {

        const files =
            Array.from(this.files);

        for (const file of files) {

            const base64 =
                await fileToBase64(file);

            generalFiles.push({

                id:
                    Date.now() +
                    Math.random(),

                name:
                    file.name,

                type:
                    file.type,

                size:
                    file.size,

                data:
                    base64,

                date:
                    new Date().toLocaleString()

            });

        }

        saveGeneralFiles();

        renderGeneralFiles();

        this.value = "";

    }
);


/* =========================================
   FILE READER
========================================= */

function fileToBase64(file) {

    return new Promise((resolve, reject) => {

        const reader =
            new FileReader();

        reader.onload = () =>
            resolve(reader.result);

        reader.onerror = reject;

        reader.readAsDataURL(file);

    });

}


/* =========================================
   SAVE
========================================= */

function saveAcademicRecords() {

    try {

        localStorage.setItem(
            "academicRecords",
            JSON.stringify(academicRecords)
        );

    } catch (error) {

        alert(
            "Browser storage is full. Try deleting some old files."
        );

    }

}


function saveGeneralFiles() {

    try {

        localStorage.setItem(
            "generalFiles",
            JSON.stringify(generalFiles)
        );

    } catch (error) {

        alert(
            "Browser storage is full. Try deleting some old files."
        );

    }

}


/* =========================================
   RENDER ACADEMIC RECORDS
========================================= */

function renderAcademicRecords() {

    const container =
        document.getElementById(
            "recordsContainer"
        );

    const search =
        document.getElementById(
            "searchInput"
        ).value.toLowerCase();


    container.innerHTML = "";


    const filtered =
        academicRecords.filter(record => {

            const categoryMatch =
                record.category === currentCategory;

            const searchMatch =
                record.name
                    .toLowerCase()
                    .includes(search);

            return categoryMatch && searchMatch;

        });


    if (filtered.length === 0) {

        container.innerHTML = `
            <div class="empty-message">
                <h3>No ${currentCategory} records yet.</h3>
                <p>Upload your results above.</p>
            </div>
        `;

        return;

    }


    filtered.forEach(record => {

        const card =
            document.createElement("div");

        card.className = "record-card";


        let preview = "";


        if (
            record.type &&
            record.type.startsWith("image/")
        ) {

            preview = `
                <div class="record-preview">

                    <img
                        src="${record.data}"
                        alt="${escapeHTML(record.name)}"
                        onclick="previewImage('${record.id}')"
                    >

                </div>
            `;

        } else {

            preview = `
                <div class="record-preview">

                    <div class="file-preview">
                        📄
                    </div>

                </div>
            `;

        }


        card.innerHTML = `

            ${preview}

            <div class="record-info">

                <h4 title="${escapeHTML(record.name)}">
                    ${escapeHTML(record.name)}
                </h4>

                <p>
                    ${formatFileSize(record.size)}
                    • ${record.date}
                </p>

                <div class="record-actions">

                    <button
                        onclick="previewRecord('${record.id}')"
                    >
                        👁 View
                    </button>

                    <a
                        href="${record.data}"
                        download="${escapeHTML(record.name)}"
                    >
                        ⬇ Download
                    </a>

                    <button
                        onclick="deleteAcademicRecord('${record.id}')"
                    >
                        🗑
                    </button>

                </div>

            </div>

        `;


        container.appendChild(card);

    });

}


/* =========================================
   SEARCH
========================================= */

document
    .getElementById("searchInput")
    .addEventListener(
        "input",
        renderAcademicRecords
    );


/* =========================================
   VIEW IMAGE
========================================= */

function previewImage(id) {

    const record =
        academicRecords.find(
            item => String(item.id) === String(id)
        );

    if (!record) return;


    const modal =
        document.getElementById("previewModal");

    const content =
        document.getElementById("previewContent");


    content.innerHTML = `

        <img
            src="${record.data}"
            alt="${escapeHTML(record.name)}"
        >

        <h3 style="margin-top:20px;">
            ${escapeHTML(record.name)}
        </h3>

    `;


    modal.classList.add("show");

}


/* =========================================
   VIEW RECORD
========================================= */

function previewRecord(id) {

    const record =
        academicRecords.find(
            item => String(item.id) === String(id)
        );

    if (!record) return;


    if (
        record.type &&
        record.type.startsWith("image/")
    ) {

        previewImage(id);

        return;

    }


    const newWindow =
        window.open();

    newWindow.document.write(`

        <html>

        <head>

            <title>
                ${escapeHTML(record.name)}
            </title>

            <style>

                body {
                    margin: 0;
                    background: #111;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    height: 100vh;
                }

                iframe {
                    width: 95%;
                    height: 95%;
                    border: none;
                }

            </style>

        </head>

        <body>

            <iframe
                src="${record.data}">
            </iframe>

        </body>

        </html>

    `);

}


/* =========================================
   DELETE ACADEMIC RECORD
========================================= */

function deleteAcademicRecord(id) {

    const confirmDelete =
        confirm(
            "Delete this academic record?"
        );

    if (!confirmDelete) return;


    academicRecords =
        academicRecords.filter(
            record =>
                String(record.id) !== String(id)
        );


    saveAcademicRecords();

    renderAcademicRecords();

}


/* =========================================
   GENERAL FILES
========================================= */

function renderGeneralFiles() {

    const container =
        document.getElementById(
            "generalFilesContainer"
        );

    container.innerHTML = "";


    if (generalFiles.length === 0) {

        container.innerHTML = `

            <div class="empty-message">

                <h3>No files uploaded.</h3>

                <p>
                    Your documents will appear here.
                </p>

            </div>

        `;

        return;

    }


    generalFiles.forEach(file => {

        const item =
            document.createElement("div");

        item.className = "file-item";


        item.innerHTML = `

            <div class="file-item-info">

                <div class="file-icon">
                    ${getFileIcon(file.name)}
                </div>

                <div>

                    <div
                        class="file-item-name"
                        title="${escapeHTML(file.name)}"
                    >
                        ${escapeHTML(file.name)}
                    </div>

                    <small>
                        ${formatFileSize(file.size)}
                        • ${file.date}
                    </small>

                </div>

            </div>


            <div class="file-actions">

                <button
                    onclick="previewGeneralFile('${file.id}')"
                >
                    👁 View
                </button>

                <a
                    href="${file.data}"
                    download="${escapeHTML(file.name)}"
                >
                    ⬇ Download
                </a>

                <button
                    onclick="deleteGeneralFile('${file.id}')"
                >
                    🗑
                </button>

            </div>

        `;


        container.appendChild(item);

    });

}


/* =========================================
   VIEW GENERAL FILE
========================================= */

function previewGeneralFile(id) {

    const file =
        generalFiles.find(
            item => String(item.id) === String(id)
        );

    if (!file) return;


    if (
        file.type &&
        file.type.startsWith("image/")
    ) {

        const modal =
            document.getElementById(
                "previewModal"
            );

        const content =
            document.getElementById(
                "previewContent"
            );


        content.innerHTML = `

            <img
                src="${file.data}"
                alt="${escapeHTML(file.name)}"
            >

        `;


        modal.classList.add("show");

        return;

    }


    const newWindow =
        window.open();

    newWindow.document.write(`

        <html>

        <head>

            <title>
                ${escapeHTML(file.name)}
            </title>

            <style>

                body {
                    margin: 0;
                    background: #111;
                    height: 100vh;
                }

                iframe {
                    width: 100%;
                    height: 100%;
                    border: none;
                }

            </style>

        </head>

        <body>

            <iframe
                src="${file.data}">
            </iframe>

        </body>

        </html>

    `);

}


/* =========================================
   DELETE GENERAL FILE
========================================= */

function deleteGeneralFile(id) {

    if (
        !confirm("Delete this file?")
    ) return;


    generalFiles =
        generalFiles.filter(
            file =>
                String(file.id) !== String(id)
        );


    saveGeneralFiles();

    renderGeneralFiles();

}


/* =========================================
   MODAL
========================================= */

document
    .getElementById("closeModal")
    .addEventListener(
        "click",
        closeModal
    );


document
    .getElementById("previewModal")
    .addEventListener(
        "click",
        function (event) {

            if (
                event.target === this
            ) {

                closeModal();

            }

        }
    );


function closeModal() {

    document
        .getElementById("previewModal")
        .classList.remove("show");

    document
        .getElementById("previewContent")
        .innerHTML = "";

}


/* =========================================
   MUSIC
========================================= */

const music =
    document.getElementById(
        "backgroundMusic"
    );

const musicButton =
    document.getElementById(
        "musicButton"
    );


let musicPlaying = false;


musicButton.addEventListener(
    "click",
    function () {

        if (musicPlaying) {

            music.pause();

            musicPlaying = false;

            musicButton.textContent =
                "🎵 Music";

        } else {

            music.play()
                .then(() => {

                    musicPlaying = true;

                    musicButton.textContent =
                        "🔊 Playing";

                })
                .catch(() => {

                    alert(
                        "Please make sure background-music.mp3 exists in the website folder."
                    );

                });

        }

    }
);


/* =========================================
   TYPING ANIMATION
========================================= */

const typingElement =
    document.querySelector(
        ".typing-text"
    );


const typingWords = [

    "Computer Science Student",
    "Future Software Developer",
    "Web Developer",
    "Programmer",
    "Technology Enthusiast"

];


let wordIndex = 0;
let letterIndex = 0;
let deleting = false;


function typeEffect() {

    const currentWord =
        typingWords[wordIndex];


    if (!deleting) {

        typingElement.textContent =
            currentWord.substring(
                0,
                letterIndex + 1
            );

        letterIndex++;


        if (
            letterIndex ===
            currentWord.length
        ) {

            deleting = true;

            setTimeout(
                typeEffect,
                1600
            );

            return;

        }

    } else {

        typingElement.textContent =
            currentWord.substring(
                0,
                letterIndex - 1
            );

        letterIndex--;


        if (letterIndex === 0) {

            deleting = false;

            wordIndex++;

            if (
                wordIndex >=
                typingWords.length
            ) {

                wordIndex = 0;

            }

        }

    }


    setTimeout(
        typeEffect,
        deleting ? 45 : 90
    );

}


typeEffect();


/* =========================================
   HELPERS
========================================= */

function formatFileSize(bytes) {

    if (bytes === 0)
        return "0 Bytes";


    const units = [
        "Bytes",
        "KB",
        "MB",
        "GB"
    ];


    const index =
        Math.floor(
            Math.log(bytes) /
            Math.log(1024)
        );


    return (
        parseFloat(
            (
                bytes /
                Math.pow(
                    1024,
                    index
                )
            ).toFixed(2)
        ) +
        " " +
        units[index]
    );

}


function getFileIcon(name) {

    const extension =
        name
            .split(".")
            .pop()
            .toLowerCase();


    if (
        ["jpg","jpeg","png","gif","webp"]
            .includes(extension)
    )
        return "🖼️";


    if (extension === "pdf")
        return "📕";


    if (
        ["doc","docx"]
            .includes(extension)
    )
        return "📘";


    if (
        ["ppt","pptx"]
            .includes(extension)
    )
        return "📙";


    if (
        ["xls","xlsx"]
            .includes(extension)
    )
        return "📗";


    if (
        ["zip","rar"]
            .includes(extension)
    )
        return "🗜️";


    return "📄";

}


function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent = text;

    return div.innerHTML;

}


/* =========================================
   YEAR
========================================= */

document.getElementById(
    "year"
).textContent =
    new Date().getFullYear();


/* =========================================
   INITIAL LOAD
========================================= */

renderAcademicRecords();

renderGeneralFiles();