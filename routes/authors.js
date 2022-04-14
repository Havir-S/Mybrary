const express = require('express');
const router = express.Router();
const Author = require('../models/author')

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
             // res.redirect(`authors/${newAuthor.id}`)
              res.redirect(`authors`)
    } catch {
            res.render('authors/new', {
                author: author,
                errorMessage: 'Error creating author'
            })
    }

})



module.exports = router;