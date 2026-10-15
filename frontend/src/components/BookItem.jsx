export default function BookItem({ book, onRead, onDelete }) {
  return (
    <article className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-2xl">
          📘
        </div>

        <div className="min-w-0">
          <h3
            className={`break-words text-lg font-bold ${
              book.status === "read"
                ? "text-slate-400 line-through"
                : "text-slate-800"
            }`}
          >
            {book.title}
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            by {book.author}
          </p>

          <span
            className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold ${
              book.status === "read"
                ? "bg-emerald-100 text-emerald-700"
                : "bg-amber-100 text-amber-700"
            }`}
          >
            {book.status === "read" ? "✓ Read" : "Unread"}
          </span>
        </div>
      </div>

      <div className="flex shrink-0 gap-2">
        {book.status !== "read" && (
          <button
            onClick={() => onRead(book.id)}
            className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700"
          >
            Mark Read
          </button>
        )}

        <button
          onClick={() => onDelete(book.id)}
          className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
        >
          Delete
        </button>
      </div>
    </article>
  );
}