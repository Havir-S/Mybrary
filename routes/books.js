const express = require('express');
const router = express.Router();
// const multer = require('multer');
// const path = require('path'); // NO LONGER NEEDED SINCE MULTER IS NO MORE
// const fs = require('fs'); // FILESYSTEM

const Book = require('../models/book')
const Author = require('../models/author')

// const uploadPath = path.join('public', Book.coverImageBasePath) //FOR WHEN WE USED MULTER
const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif']
// const upload = multer({
//   dest: uploadPath,
//   fileFilter: (req, file, callback) => {
//     callback(null, imageMimeTypes.includes(file.mimetype))
//   }
// })

//ALL Books ROUTE
router.get('/',  async (req, res) => {
    let query = Book.find();
    if (req.query.title != null && req.query.title != "") {
        query = query.regex('title', new RegExp(req.query.title, 'i'))
    }
    if (req.query.publishedBefore != null && req.query.publishedBefore != "") {
        query = query.lte('publishDate', req.query.publishedBefore)   //LESS THAN IT COMPARES BOTH DATES
    }
    if (req.query.publishedAfter != null && req.query.publishedAfter != "") {
        query = query.gte('publishDate', req.query.publishedAfter)    //GREATER THAN
    }
    try {
        const books = await query.exec()
        res.render('books/index', {
            books: books,
            searchOptions: req.query
        })
    } catch {
        res.redirect('/')
    }
    
})

// New book route
router.get('/new', async (req, res) => {
    renderNewPage(res, new Book())
})


// Create book route
router.post('/', async (req, res) => {    
    const fileName = req.file != null ? req.file.filename : null;
    const book = new Book({             //WE USE REQ.BODY BECAUSE IT'S A POST ROUTE
        title: req.body.title,
        author: req.body.author,
        publishDate: new Date(req.body.publishDate),
        pageCount: req.body.pageCount,
        coverImageName: fileName,
        description: req.body.description
    })            
    
    saveCover(book, req.body.cover)
    try {
        const newBook = await book.save();
        // res.redirect(`books/${newBook.id}`)
        res.redirect(`books`)
    } catch {
        // if (book.coverImageName != null) {
        //     removeBookCover(book.coverImageName);   // BOOK COVERS WILL UPLOAD EVEN IF A NEW AUDITION IS AN ERROR SO WE NEED TO MANUALLY REMOVE IT
        // }
        renderNewPage(res, book, true)
    }
})

// function removeBookCover(fileName) {             //WE ARE NO LONGER STORING IT LOCALLY
//     fs.unlink(path.join(uploadPath, fileName), err => {
//         if (err) console.err(err);
//     })
// }

async function renderNewPage(res, book, hasError = false) {
    try {
        const authors = await Author.find({})
        const params = {
            authors: authors,
            book: book
        }
        if (hasError) params.errorMessage = 'Error Creating Book'
        res.render('books/new', params )
    } catch {
        res.redirect('/books')

    }
}

function saveCover(book, coverEncoded) {
    if (coverEncoded == null) return
    const cover = JSON.parse(coverEncoded)
    if (cover != null && imageMimeTypes.includes(cover.type)) {
        book.coverImage = new Buffer.from(cover.data, 'base64');
        book.coverImageType = cover.type
    }
}

module.exports = router;