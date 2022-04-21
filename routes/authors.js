const express = require('express');
const router = express.Router();
const Author = require('../models/author')
const Book = require('../models/book')

//ALL AUTHORS ROUTE
router.get('/',  async(req, res) => {
    let searchOptions = {};
    if (req.query.name != null && req.query.name !== '') {       //USING QUERY BECAUSE IT'S IN THE PARAMETHERS /AUTHORS?name=John, WE DO THAT ONLY IN GET REQUESTS 
        searchOptions.name = new RegExp(req.query.name, 'i')
    }             
    try {
        const authors = await Author.find(searchOptions)
        res.render('authors/index', {
            authors: authors, 
            searchOptions: req.query
        })
    }catch {
        res.redirect('/')
    }
    
})

// New author route
router.get('/new', (req, res) => {
    res.render('authors/new', { author: new Author() })
})


// Create author route
router.post('/', async (req, res) => {                      //WE USE REQ.BODY BECAUSE IT'S A POST ROUTE
    const author = new Author({
        name: req.body.name
    })

    try {
        const newAuthor = await author.save();
             res.redirect(`authors/${author.id}`)

    } catch {
            res.render('authors/new', {
                author: author,
                errorMessage: 'Error creating author'
            })
    }

})

router.get('/:id', async (req,res)  => {
    try {
        const author = await Author.findById(req.params.id)
        const books = await Book.find({author: author.id}).limit(6).exec();
        res.render('authors/show', {
            author: author,
            booksByAuthor: books
        })
    } catch (err) {
        // console.log(err);
        res.redirect('/')
    }
})

router.get('/:id/edit', async (req,res) => {

    try {
        const author = await Author.findById(req.params.id)
        res.render('authors/edit', { author: author })
    } catch {
        res.redirect('/authors')
    }
    
})

router.put('/:id', async (req,res) => {
    let author;
    try {
        author = await Author.findById(req.params.id);
        author.name = req.body.name;
        await author.save();
             res.redirect(`/authors/${author.id}`)

    } catch {
        if (author == null) {
            res.redirect('/');
        } else {
            res.render('authors/edit', {
                author: author,
                errorMessage: 'Error updating author'
           })
        }
         
    }
})

router.delete('/:id', async (req,res) => {
    let author;
    try {
        author = await Author.findById(req.params.id);
        // await Author.deleteOne(req.params.id);
        await author.remove();
        res.redirect(`/authors`)

    } catch {
        if (author == null) {
            res.redirect('/');
        } else {
            res.redirect(`/authors/${author.id}`)
        }
         
    }
})


module.exports = router;