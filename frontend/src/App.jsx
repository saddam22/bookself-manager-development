
import { useCallback, useEffect, useMemo, useState } from "react";
import BookForm from "./components/BookForm";
import "./App.css";

const API_URL = `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/books`;

async function readResponse(response) {
  const contentType = response.headers.get("content-type") || "";

  if (!contentType.includes("application/json")) {
    throw new Error(
      `Server returned an unexpected response (${response.status}). Check the backend server and API URL.`
    );
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
}

function getBookId(book) {
  return book.id || book._id;
}

export default function App() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [category, setCategory] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editingBook, setEditingBook] = useState(null);

  const loadBooks = useCallback(async () => {
    setLoading(true);

    try {
      const response = await fetch(API_URL);
      const data = await readResponse(response);

      if (!Array.isArray(data)) {
        throw new Error("Invalid books data received from server");
      }

      setBooks(data);
      setError("");
    } catch (err) {
      setError(err.message || "Cannot connect to backend");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function fetchBooks() {
      try {
        const response = await fetch(API_URL);
        const data = await readResponse(response);

        if (!Array.isArray(data)) {
          throw new Error("Invalid books data received from server");
        }

        if (!cancelled) {
          setBooks(data);
          setError("");
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Cannot connect to backend");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchBooks();

    return () => {
      cancelled = true;
    };
  }, []);

  async function addBook(bookData) {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bookData),
    });

    const data = await readResponse(response);

    setBooks((current) => [data, ...current]);
    setError("");
    setShowForm(false);
    setEditingBook(null);
  }

  async function updateBook(bookData) {
    const id = editingBook ? getBookId(editingBook) : null;

    if (!id) {
      throw new Error("Book ID is missing");
    }

    const response = await fetch(`${API_URL}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bookData),
    });

    const data = await readResponse(response);

    setBooks((current) =>
      current.map((book) =>
        String(getBookId(book)) === String(id) ? data : book
      )
    );

    setError("");
    setShowForm(false);
    setEditingBook(null);
  }

  async function markAsRead(book) {
    const id = getBookId(book);

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
      });

      const data = await readResponse(response);

      setBooks((current) =>
        current.map((item) =>
          String(getBookId(item)) === String(id) ? data : item
        )
      );

      setError("");
    } catch (err) {
      setError(err.message || "Failed to update book");
    }
  }

  async function deleteBook(book) {
    const id = getBookId(book);

    if (!window.confirm("এই বইটি মুছে ফেলতে চান?")) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      await readResponse(response);

      setBooks((current) =>
        current.filter(
          (item) => String(getBookId(item)) !== String(id)
        )
      );

      setError("");
    } catch (err) {
      setError(err.message || "Failed to delete book");
    }
  }

  const readCount = books.filter(
    (book) => book.status === "read"
  ).length;

  const categories = [
    ...new Set(books.map((book) => book.category).filter(Boolean)),
  ];

  const filteredBooks = useMemo(() => {
    const q = query.toLowerCase().trim();

    return books.filter((book) => {
      const searchableText =
        `${book.title || ""} ${book.author || ""}`.toLowerCase();

      const matchesQuery = !q || searchableText.includes(q);
      const matchesStatus =
        statusFilter === "all" || book.status === statusFilter;
      const matchesCategory =
        category === "all" || book.category === category;

      return matchesQuery && matchesStatus && matchesCategory;
    });
  }, [books, query, statusFilter, category]);

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#" aria-label="Bookworm home">
          <span className="brand-mark">B</span>
          <span>Bookworm</span>
        </a>

        <nav className="nav-menu" aria-label="Main navigation">
          <button
            className="nav-item"
            onClick={() => {
              setStatusFilter("all");
              setQuery("");
              setCategory("all");
            }}
          >
            <span>⌂</span> Home
          </button>

          <button
            className="nav-item active"
            onClick={() => {
              setStatusFilter("all");
              setCategory("all");
            }}
          >
            <span>▣</span> Library
          </button>
        </nav>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <label className="search-box">
            <span>⌕</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search books by title or author..."
              aria-label="Search books"
            />
          </label>

          <button
            className="filter-button"
            onClick={() =>
              setStatusFilter((current) =>
                current === "all"
                  ? "unread"
                  : current === "unread"
                    ? "read"
                    : "all"
              )
            }
          >
            ☷ <span>Filter</span>
          </button>

          <button
            className="notification"
            aria-label="Reload library"
            title="Reload library"
            onClick={loadBooks}
          >
            ↻
          </button>
        </header>

        <div className="library-content">
          <div className="heading-row">
            <h1>
              Library <span>({books.length})</span>
            </h1>

            <div className="controls">
              <div className="status-tabs">
                {[
                  ["all", "All Books"],
                  ["read", "Read"],
                  ["unread", "Unread"],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    className={statusFilter === value ? "selected" : ""}
                    onClick={() => setStatusFilter(value)}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                aria-label="Filter by category"
              >
                <option value="all">All Categories</option>
                {categories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="summary-line">
            <span>{filteredBooks.length} books in your collection</span>
            <span>
              {readCount} read · {books.length - readCount} unread
            </span>
          </div>

          {error && (
            <div className="error-banner" role="alert">
              <span>{error}</span>
              <button onClick={loadBooks}>Retry</button>
            </div>
          )}

          {loading ? (
            <div className="empty-state">Loading your library…</div>
          ) : (
            <div className="book-grid">
              {filteredBooks.map((book) => {
                const id = getBookId(book);
                const isRead = book.status === "read";
                const cover =
                  book.coverUrl ||
                  book.imageUrl ||
                  book.cover ||
                  book.image;

                return (
                  <article className="book-card" key={id}>
                    <div className="cover-stage">
                      {cover ? (
                        <img
                          className="book-cover"
                          src={cover}
                          alt={`${book.title || "Book"} cover`}
                          onError={(event) => {
                            event.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        <div
                          className={`cover-placeholder cover-${
                            ((book.title || "book").length % 4) + 1
                          }`}
                        >
                          <span>{book.title || "BOOK"}</span>
                          <small>{book.author || "BOOKWORM EDITION"}</small>
                        </div>
                      )}

                      <button
                        className="card-menu"
                        aria-label={`Delete ${book.title || "book"}`}
                        title="Delete book"
                        onClick={() => deleteBook(book)}
                      >
                        ⋮
                      </button>
                    </div>

                    <div className="book-info">
                      <h2 title={book.title}>{book.title}</h2>
                      <p>{book.author || "Unknown author"}</p>

                      <span className={`status-pill ${isRead ? "read" : ""}`}>
                        {isRead ? "Read" : "Unread"}
                      </span>

                      <div className="card-actions">
                        <button
                          className="icon-button"
                          title="Edit book"
                          aria-label={`Edit ${book.title || "book"}`}
                          onClick={() => {
                            setEditingBook(book);
                            setShowForm(true);
                          }}
                        >
                          ✎
                        </button>

                        <button
                          className="icon-button delete-icon"
                          title="Delete book"
                          aria-label={`Delete ${book.title || "book"}`}
                          onClick={() => deleteBook(book)}
                        >
                          ♜
                        </button>

                        <button
                          className={`read-button ${isRead ? "done" : ""}`}
                          onClick={() => {
                            if (!isRead) markAsRead(book);
                          }}
                          disabled={isRead}
                        >
                          {isRead ? "Read Book" : "Mark as Read"}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}

              <button
                className="add-card"
                onClick={() => {
                  setEditingBook(null);
                  setShowForm(true);
                }}
              >
                <span className="plus">+</span>
                <strong>Add New Book</strong>
                <small>
                  Add a new book to
                  <br /> your library
                </small>
              </button>
            </div>
          )}

          {!loading && filteredBooks.length === 0 && (
            <div className="empty-state">
              No books found. Try another search or add a new book.
            </div>
          )}

          <footer className="footer-note">
            Bookworm · Your personal reading space
          </footer>
        </div>
      </section>

      {showForm && (
        <div
          className="modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowForm(false);
              setEditingBook(null);
            }
          }}
        >
          <div className="book-modal">
            <button
              className="modal-close"
              onClick={() => {
                setShowForm(false);
                setEditingBook(null);
              }}
              aria-label="Close"
            >
              ×
            </button>

            <h2>{editingBook ? "Edit book" : "Add a new book"}</h2>

            <p className="modal-subtitle">
              {editingBook
                ? "Update your book details."
                : "Add a title to your personal library."}
            </p>

            <BookForm
              key={editingBook ? getBookId(editingBook) : "new-book"}
              initialBook={editingBook}
              onAdd={editingBook ? updateBook : addBook}
              onCancel={() => {
                setShowForm(false);
                setEditingBook(null);
              }}
            />
          </div>
        </div>
      )}
    </main>
  );
}
