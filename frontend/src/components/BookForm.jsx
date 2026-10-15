
import { useState } from "react";

export default function BookForm({
  onAdd,
  initialBook = null,
  onCancel,
}) {
  const [title, setTitle] = useState(() => initialBook?.title || "");
  const [author, setAuthor] = useState(() => initialBook?.author || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    const trimmedTitle = title.trim();
    const trimmedAuthor = author.trim();

    if (!trimmedTitle || !trimmedAuthor) {
      setError("Book title and author are required.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await onAdd({
        title: trimmedTitle,
        author: trimmedAuthor,
      });
    } catch (err) {
      setError(err.message || "Unable to save this book.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="book-form" onSubmit={handleSubmit}>
      <label>
        Book title
        <input
          type="text"
          name="title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="e.g. Atomic Habits"
          maxLength={200}
          autoComplete="off"
          required
        />
      </label>

      <label>
        Author name
        <input
          type="text"
          name="author"
          value={author}
          onChange={(event) => setAuthor(event.target.value)}
          placeholder="e.g. James Clear"
          maxLength={120}
          autoComplete="off"
          required
        />
      </label>

      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}

      <div className="form-actions">
        <button type="submit" disabled={loading}>
          {loading
            ? "Saving..."
            : initialBook
              ? "Save Changes"
              : "+ Add Book"}
        </button>

        {onCancel && (
          <button
            type="button"
            className="cancel-button"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
