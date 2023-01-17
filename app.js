const express = require('express')
const path = require('path')
const dotenv = require('dotenv')
const mongoose = require('mongoose')
const morgan = require('morgan')                //logs a requests to a page
const exphbs = require('express-handlebars')
const connectDB = require('./config/db.js')
const methodOverride = require('method-override')
const passport = require('passport')
const session = require('express-session')
const MongoStore = require('connect-mongo')

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

//Load Config
dotenv.config({ path: './config/.env' })

// Passport Config
require('./config/passport')(passport)

connectDB()

const app = express()

// Body parser
app.use(express.urlencoded({ extended: false }))
app.use(express.json())

// Method override
app.use(
  methodOverride(function (req, res) {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
      // look in urlencoded POST bodies and delete it
      let method = req.body._method
      delete req.body._method
      return method
    }
  })
)

//Logging | Morgan
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'))
}

// Handlebars Helpers
const {
    formatDate,
    stripTags,
    truncate,
    editIcon,
    select,
  } = require('./helpers/hbs')

// Handlebars
app.engine(
    '.hbs',
    exphbs.engine({
      helpers: {
        formatDate,
        stripTags,
        truncate,
        editIcon,
        select,
      },
      defaultLayout: 'main',
      extname: '.hbs',
    })
  )
  app.set('view engine', '.hbs')



// Middleware
app.use(session({
    secret: 'Smokeylol',
    resave: false,         
    saveUninitialized: false,   //false means - don't create a session until something is stored
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI })
}))

app.use(passport.initialize())
app.use(passport.session())

// Set global var
app.use(function (req, res, next) {
    res.locals.user = req.user || null
    next()
  })

// Static Folder
app.use(express.static(path.join(__dirname, 'public')))

//Routes
app.use('/', require('./routes/index'))
app.use('/auth', require('./routes/auth'))
app.use('/stories', require('./routes/stories'))

const PORT = process.env.PORT || 3002

app.listen(PORT, console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`))