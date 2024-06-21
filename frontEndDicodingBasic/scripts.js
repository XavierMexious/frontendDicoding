document.addEventListener("DOMContentLoaded", function() {
  const addBookButton = document.getElementById("addBookButton");
  const bookModal = document.getElementById("bookModal");
  const backgroundOverlay = document.getElementById("backgroundOverlay");
  const cancelBookButton = document.getElementById("cancelBookButton");
  const bookForm = document.getElementById("bookForm");
  const unreadSection = document.getElementById("unreadSection");
  const readSection = document.getElementById("readSection");
  const tabUnread = document.getElementById("tabUnread");
  const tabRead = document.getElementById("tabRead");
  const searchInput = document.getElementById("searchInput");

  let books = []; // Array untuk menyimpan data buku
  let editIndex = -1; // Indeks buku yang sedang diedit

  const toggleModal = function(modal, isOpen) {
    if (isOpen) {
      modal.style.display = "block";
      backgroundOverlay.classList.add("overlay-active");
    } else {
      modal.style.display = "none";
      backgroundOverlay.classList.remove("overlay-active");
    }
  };

  const renderBooks = function(filteredBooks = books) {
    const unreadBooksContainer = unreadSection.querySelector(".unread-books");
    const readBooksContainer = readSection.querySelector(".read-books");

    unreadBooksContainer.innerHTML = "";
    readBooksContainer.innerHTML = "";

    filteredBooks.forEach(function(book, index) {
      const bookElement = document.createElement("div");
      bookElement.classList.add("book-list");

      bookElement.innerHTML = `
        <div class="book-info">
          <h3>${book.title}</h3>
          <p>Author: ${book.author}</p>
          <p>Year: ${book.year}</p>
          <p>Created At: ${moment(book.createdAt).format('MMMM Do YYYY, h:mm:ss a')}</p>
        </div>
        <div class="book-status">
          <button class="${book.isComplete ? "read-status-button" : "book-status-button"}">${book.isComplete ? "Read" : "Unread"}</button>
          <button class="edit-button"></button>
          <button class="trash-button"></button>
        </div>
      `;

      const statusButton = bookElement.querySelector("button:first-child");
      const editButton = bookElement.querySelector(".edit-button");
      const trashButton = bookElement.querySelector(".trash-button");

      statusButton.addEventListener("click", function() {
        toggleReadStatus(index);
      });
      editButton.addEventListener("click", function() {
        openEditModal(index);
      });
      trashButton.addEventListener("click", function() {
        deleteBook(index);
      });

      if (book.isComplete) {
        readBooksContainer.appendChild(bookElement);
      } else {
        unreadBooksContainer.appendChild(bookElement);
      }
    });

    updateLocalStorage();
  };

  const toggleReadStatus = function(index) {
    books[index].isComplete = !books[index].isComplete;
    renderBooks();
  };

  const deleteBook = function(index) {
    books.splice(index, 1);
    renderBooks();
    alert("Buku berhasil dihapus"); // Alert untuk delete
  };

  const openEditModal = function(index) {
    editIndex = index;
    const book = books[index];
    document.getElementById("editTitleInput").value = book.title;
    document.getElementById("editAuthorInput").value = book.author;
    document.getElementById("editYearInput").value = book.year;
    document.getElementById("editReadCheckbox").checked = book.isComplete;
    toggleModal(document.getElementById("editBookModal"), true);
  };

  const handleEditBook = function(e) {
    e.preventDefault();
    const editedBook = {
      id: books[editIndex].id,
      title: document.getElementById("editTitleInput").value,
      author: document.getElementById("editAuthorInput").value,
      year: parseInt(document.getElementById("editYearInput").value),
      isComplete: document.getElementById("editReadCheckbox").checked,
      createdAt: books[editIndex].createdAt // Tetap gunakan createdAt yang sudah ada
    };
    books[editIndex] = editedBook;
    renderBooks();
    toggleModal(document.getElementById("editBookModal"), false);
    alert("Buku berhasil dimodifikasi"); // Alert untuk edit
  };

  const addNewBook = function(newBook) {
    // Generate unique ID based on timestamp
    newBook.id = +new Date(); // Convert date to timestamp

    // Tambahkan createdAt menggunakan Moment.js
    newBook.createdAt = moment().format(); // Format default ISO8601

    books.push(newBook);
    renderBooks();
    toggleModal(bookModal, false);
    bookForm.reset();
    alert("Buku berhasil ditambahkan"); // Alert untuk add
  };

  const searchBooks = function() {
    const query = searchInput.value.toLowerCase();
    const filteredBooks = books.filter(function(book) {
      return book.title.toLowerCase().includes(query);
    });
    renderBooks(filteredBooks);
  };

  const updateLocalStorage = function() {
    localStorage.setItem("books", JSON.stringify(books));
  };

  // Ambil data dari data.json menggunakan fetch
  fetch("./assets/utils/data.json")
    .then(response => response.json())
    .then(data => {
      // Tambahkan data buku dari data.json ke dalam array books
      books.push(data);
      renderBooks(); // Render ulang buku setelah data ditambahkan
    })
    .catch(error => console.error("Error fetching data:", error));

  addBookButton.addEventListener("click", function() {
    toggleModal(bookModal, true);
  });
  cancelBookButton.addEventListener("click", function() {
    toggleModal(bookModal, false);
  });

  bookForm.addEventListener("submit", function(e) {
    e.preventDefault();
    const newBook = {
      title: document.getElementById("titleInput").value,
      author: document.getElementById("authorInput").value,
      year: parseInt(document.getElementById("yearInput").value),
      isComplete: document.getElementById("readCheckbox").checked
    };
    addNewBook(newBook);
  });

  document.getElementById("editBookForm").addEventListener("submit", handleEditBook);
  document.getElementById("cancelEditButton").addEventListener("click", function() {
    toggleModal(document.getElementById("editBookModal"), false);
  });

  searchInput.addEventListener("input", searchBooks);

  tabUnread.addEventListener("click", function() {
    unreadSection.classList.add("tab-active");
    readSection.classList.remove("tab-active");
    tabUnread.classList.add("tab-active");
    tabRead.classList.remove("tab-active");
  });

  tabRead.addEventListener("click", function() {
    unreadSection.classList.remove("tab-active");
    readSection.classList.add("tab-active");
    tabUnread.classList.remove("tab-active");
    tabRead.classList.add("tab-active");
  });

  renderBooks(); // Render buku saat halaman dimuat
});
