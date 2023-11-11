const books = [];
const RENDER_EVENT = 'render-book';
const SAVED_EVENT = 'saved-book';
const STORAGE_KEY = 'BOOK_APPS';

function isStorageExist() {
    if (typeof(Storage) == undefined) {
        alert('Browser kamu tidak mendukung local storage');
        return false;
    }
    return true;
}

document.addEventListener('DOMContentLoaded', function () {
    const submitForm = document.getElementById('inputBook');
    submitForm.addEventListener('submit', function (event) {
        event.preventDefault();
        addBook();
    });

    if (isStorageExist()) {
        loadDataFromStorage();
    }
});

function addBook() {
    const title = document.getElementById('inputBookTitle').value;
    const author = document.getElementById('inputBookAuthor').value;
    const year = parseInt(document.getElementById('inputBookYear').value);
    const isCompleted = document.getElementById('inputBookIsComplete').checked;
    const generatedID = generateId();
    const bookObject = generateBookObject(generatedID, title, author, year, isCompleted);
    books.push(bookObject);

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function generateId() {
    return +new Date();
}

function generateBookObject(id, title, author, year, isCompleted) {
    return {
        id,
        title,
        author,
        year,
        isCompleted
    }
}

document.addEventListener(RENDER_EVENT, function () {
    // console.log(books);

    const uncompletedBookList = document.getElementById('incompleteBookshelfList');
    uncompletedBookList.innerHTML = '';

    const completeBookList = document.getElementById('completeBookshelfList');
    completeBookList.innerHTML = '';

    for (const bookItem of books) {
        const bookElement = makeBook(bookItem);
        if (!bookItem.isCompleted)
            uncompletedBookList.append(bookElement);
        else
            completeBookList.append(bookElement)
    }
});


function makeBook(bookObject) {
    const title = document.createElement('h3');
    title.innerHTML = bookObject.title;

    const author = document.createElement('p');
    author.innerHTML = 'Penulis: ' + bookObject.author;

    const year = document.createElement('p');
    year.innerHTML = 'Tahun: ' + bookObject.year;

    const container = document.createElement('article');
    container.classList.add('book_item');
    container.append(title, author, year);
    container.setAttribute('id', `book-${bookObject.id}`);

    if (bookObject.isCompleted) {
        const unreadButton = document.createElement('button');
        unreadButton.classList.add('green');
        unreadButton.innerHTML = 'Belum Selesai dibaca';

        const deleteButton = document.createElement('button');
        deleteButton.classList.add('red');
        deleteButton.innerHTML = 'Hapus buku';

        const buttonContainer = document.createElement('div');
        buttonContainer.classList.add('action');
        buttonContainer.append(unreadButton, deleteButton);

        unreadButton.addEventListener('click', function () {
            checkBookFromCompleted(bookObject.id);
        });

        deleteButton.addEventListener('click', function () {
            removeBookFromComplted(bookObject.id);
        });

        container.append(buttonContainer)
    } else {
        readButton = document.createElement('button');
        readButton.classList.add('green');
        readButton.innerHTML = 'Selesai di Baca';

        const deleteButton = document.createElement('button');
        deleteButton.classList.add('red');
        deleteButton.innerHTML = 'Hapus buku';

        const buttonContainer = document.createElement('div');
        buttonContainer.classList.add('action');
        buttonContainer.append(readButton, deleteButton);

        readButton.addEventListener('click', function () {
            addBookToCompleted(bookObject.id);
        });

        deleteButton.addEventListener('click', function () {
            removeBookFromComplted(bookObject.id);
        });

        container.append(buttonContainer);
    }

    return container
}

function addBookToCompleted(bookId) {
    const bookTarget = findBook(bookId);

    if (bookTarget == null) return;

    bookTarget.isCompleted = true;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function findBook(bookId) {
    for (const bookItem of books) {
        if (bookItem.id === bookId) {
            return bookItem
        }
    }
    return null;
}

function removeBookFromComplted(bookId) {
    const bookTarget = findBookIndex(bookId);

    if (bookTarget === -1) return;

    books.splice(bookTarget, 1);
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function checkBookFromCompleted(bookId) {
    const bookTarget = findBook(bookId);

    if (bookTarget == null) return;

    bookTarget.isCompleted = false;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function findBookIndex(bookId) {
    for (const index in books) {
        if (books[index].id === bookId) {
            return index;
        }
    }
    return -1
}

function saveData() {
    if (isStorageExist()) {
        const parsed = JSON.stringify(books);
        localStorage.setItem(STORAGE_KEY, parsed);
        document.dispatchEvent(new Event(SAVED_EVENT));
    }
}

document.addEventListener(SAVED_EVENT, function () {
    console.log(localStorage.getItem(STORAGE_KEY));
});

function loadDataFromStorage() {
    const serializedData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(serializedData);

    if (data !== null) {
        for (const book of data) {
            books.push(book);
        }
    }

    document.dispatchEvent(new Event(RENDER_EVENT));
}

const searchInput = document.getElementById('searchBookTitle');
searchInput.addEventListener('input', function () {
    renderFilteredBooks(searchInput.value);
});

function renderFilteredBooks(searchText) {
    const uncompletedBookList = document.getElementById('incompleteBookshelfList');
    uncompletedBookList.innerHTML = '';

    const completeBookList = document.getElementById('completeBookshelfList');
    completeBookList.innerHTML = '';

    for (const bookItem of books) {
        if (bookItem.title.toLowerCase().includes(searchText.toLowerCase())) {
            const bookElement = makeBook(bookItem);
            if (!bookItem.isCompleted)
                uncompletedBookList.append(bookElement);
            else
                completeBookList.append(bookElement);
        }
    }
}