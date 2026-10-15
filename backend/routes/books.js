
import express from "express";
import mongoose from "mongoose";
import Book from "../models/Book.js";

const router = express.Router();

// GET /books - Get all books
router.get("/", async (req, res, next) => {
  try {
    const books = await Book.find().sort({ createdAt: -1 });
    res.status(200).json(books);
  } catch (error) {
    next(error);
  }
});

// POST /books - Add a new book
router.post("/", async (req, res, next) => {
  try {
    const title =
      typeof req.body.title === "string"
        ? req.body.title.trim()
        : "";

    const author =
      typeof req.body.author === "string"
        ? req.body.author.trim()
        : "";

    if (!title || !author) {
      return res.status(400).json({
        message: "Title and author are required",
      });
    }

    const book = await Book.create({
      title,
      author,
    });

    return res.status(201).json(book);
  } catch (error) {
    next(error);
  }
});

// PATCH /books/:id - Update book details
router.patch("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid book ID",
      });
    }

    const updates = {};

    if (typeof req.body.title === "string") {
      updates.title = req.body.title.trim();
    }

    if (typeof req.body.author === "string") {
      updates.author = req.body.author.trim();
    }

    if (
      ("title" in updates && !updates.title) ||
      ("author" in updates && !updates.author)
    ) {
      return res.status(400).json({
        message: "Title and author cannot be empty",
      });
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        message: "No valid fields provided to update",
      });
    }

    const book = await Book.findByIdAndUpdate(
      id,
      { $set: updates },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!book) {
      return res.status(404).json({
        message: "Book not found",
      });
    }

    return res.status(200).json(book);
  } catch (error) {
    next(error);
  }
});

// PUT /books/:id - Mark a book as read
router.put("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid book ID",
      });
    }

    const book = await Book.findByIdAndUpdate(
      id,
      { $set: { status: "read" } },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!book) {
      return res.status(404).json({
        message: "Book not found",
      });
    }

    return res.status(200).json(book);
  } catch (error) {
    next(error);
  }
});

// DELETE /books/:id - Delete a book
router.delete("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid book ID",
      });
    }

    const book = await Book.findByIdAndDelete(id);

    if (!book) {
      return res.status(404).json({
        message: "Book not found",
      });
    }

    return res.status(200).json({
      message: "Book deleted successfully",
      id: book.id,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
