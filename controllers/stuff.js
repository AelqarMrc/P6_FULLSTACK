const { log } = require('console');
const Book = require('../models/Book')
const fs = require('fs');


exports.getAllBook = (req, res, next) => {
  Book.find()
    .then(books => res.status(200).json(books))
    .catch(error => res.status(404).json({ error }));
}


exports.createBook = (req, res, next) => {
  const bookObject = JSON.parse(req.body.book);
    delete bookObject._id;
    delete bookObject._userId;
  const book = new Book({
    ...bookObject,
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  });

  book.save()
    .then(() => { res.status(201).json({ message: 'Objet enregistré !' }) })
    .catch(error => { res.status(400).json({ error }) })
};


exports.getOneBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
  .then(book => res.status(200).json(book))
  .catch(error => res.status(404).json({ error }));
}


exports.rateBook = async (req, res, next) => {
  const { userId, rating } = req.body;
  const bookId = req.params.id;

  if (rating < 0 || rating > 5) {
    return res.status(400).json({ message: 'La note doit être comprise entre 0 et 5' });
  }

  try {
    // Trouver le livre par ID
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Livre non trouvé' });
    }

    // Vérifier si l'utilisateur a déjà noté ce livre
    const existingRating = book.ratings.find(r => r.userId === userId);
    if (existingRating) {
      return res.status(400).json({ message: 'Vous avez déjà noté ce livre' });
    }

    // Ajouter la nouvelle note
    book.ratings.push({ userId, rating });

    // Recalculer la note moyenne
    book.averageRating = await Book.calculateAverageRating(bookId);

    // Sauvegarder le livre mis à jour
    book.save();
    res.status(200).json(book);
  } catch (error) {
    console.error('Erreur lors de la notation du livre:', error);
    res.status(500).json({ message: 'Erreur lors de la notation du livre', error });
  }
};

exports.getBestRating = async (req, res, next) => {
  try {
    const bestRating = await Book.find().sort({ averageRating: -1 }).limit(3);
    res.status(200).json(bestRating);
  } catch (error) {
    console.error('Erreur lors de la récupération des livres les mieux notés:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des livres les mieux notés', error });
  }
};


exports.modifyBook = (req, res, next) => {
  const bookObject = req.file ? {
    ...JSON.parse(req.body.book),
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  } : { ...req.body };

  delete bookObject._userId;
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (book.userId != req.auth.userId) {
        res.status(401).json({ message: 'Not authorized' });
      } else {
        Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id })
          .then(() => res.status(200).json({ message: 'Objet modifié!' }))
          .catch(error => res.status(401).json({ error }));
      }
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};



exports.deleteBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then(book => {
      if (book.userId != req.auth.userId) {
        res.status(401).json({ message: 'Not authorized' });
      } else {
        const filename = book.imageUrl.split('/images/')[1];
        fs.unlink(`images/${filename}`, () => {
          Book.deleteOne({ _id: req.params.id })
            .then(() => { res.status(200).json({ message: 'Objet supprimé !' }) })
            .catch(error => res.status(401).json({ error }));
        });
      }
    })
    .catch(error => {
      res.status(500).json({ error });
    });
};
