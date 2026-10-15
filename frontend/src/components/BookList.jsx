import BookItem from "./BookItem";

export default function BookList({ books, onRead, onDelete }) {
  if (books.length === 0) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-10 text-center">
        <div className="text-5xl">📚</div>
        <h3 className="mt-4 text-lg font-bold text-slate-700">
          No books yet
        </h3>
        <p className="mt-2 text-sm text-slate-500">
          Add your first book to start your reading journey.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {books.map((book) => (
        <BookItem
          key={book.id}
          book={book}
          onRead={onRead}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}