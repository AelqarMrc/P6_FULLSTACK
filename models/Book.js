const mongoose = require('mongoose');

const bookSchema = mongoose.Schema({
    userId: { type: String, required: true },
    title: { type: String, required: true },
    author: { type: String, required: true },
    imageUrl: { type: String, required: true },
    year: { type: Number, required: true },
    genre: { type: String, required: true },
    ratings: [
        {
            userId: String,
            rating: Number
        }
    ],
    averageRating: { type: Number, required: true, }
});


bookSchema.statics.calculateAverageRating = async function (bookId) {
    const book = await this.findById(bookId);
    if (!book || book.ratings.length === 0) {
        return 0;
    }
    const total = book.ratings.reduce((sum, rating) => sum + rating.rating, 0);
    const average = total / book.ratings.length;
    return isNaN(average) ? 0 : average;
};

module.exports = mongoose.model('Book', bookSchema);