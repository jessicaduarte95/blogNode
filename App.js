// Carregando módulos

const express = require('express')
const handlebars = require('express-handlebars')
const bodyParser = require('body-parser')
const app = express()
const admin = require('./Routes/Admin')
const path = require('path') // Sever para manipular pastas, trabalhar com diretótios.
const mongoose = require('mongoose')
const session = require('express-session')
const flash = require('connect-flash')
require("./Models/Postagem")
const Postagem = mongoose.model("postagens")

// Configurações

    // Sessão
        app.use(session({
            secret: 'cursodenode', // É como se fosse uma chave para gerar uma sessão.
            resave: true,
            saveUninitialized: true
        }))
        app.use(flash()) // O flash tem que ficar abaixo da sessão.
    
    // Middlewares
        app.use((req, res, next) => {
            res.locals.success_msg = req.flash('success_msg')  // Serve para criar variáveis globais. (res.locals.)
            res.locals.error_msg = req.flash('error_msg')
            next()
        })

    // Body Parser
        app.use(bodyParser.urlencoded({extended: true}))
        app.use(bodyParser.json())

    // Handlebars
        app.engine('handlebars', handlebars.engine({defaultLayout: 'main'}))
        app.set('view engine', 'handlebars')

    // Mongoose
        mongoose.Promise = global.Promise
        mongoose.connect('mongodb://localhost/blogapp').then(() => {
            console.log('Conectado ao mongodb.')
        }).catch((erro) => {
            console.log('Erro ao se conectar: ' + erro)
        })

    // Public
        /* A pasta que está guardando todos os arquivos estáticos
        é a pasta public.*/
        app.use(express.static(path.join(__dirname,'public')))
        app.use((req,res,next) => {
            console.log('Oi eu sou o middlewares.')
            next() // Manda passar.
        }) // Criando o Middlewares (Funciona como um intermediário entre cliente e servidor.)
        // O middlewares será usado para fazer sistema de autenticação.

// Rotas
    // O express traz um componente chamado router.
    // As rotas geralmente ficam em outros arquivos para melhor organização.
    // Chamar as rotas abaixo das configurações.

    app.get('/', (req,res) => {
        Postagem.find().lean().populate("categoria").sort({data: "desc"}).then((postagens) => {
            res.render("index", {postagens:postagens})
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro interno")
            res.redirect("/404")
        })   
    })

    app.get("/404", (req,res) => {
        res.redirect("/404")
    })

    app.get('/posts', (req,res) => {
        res.send("Lista Posts")
    })

    app.use('/admin', admin)

// Outros
const PORT = 8081
app.listen(PORT, () => {
    console.log('Servidor Rodando!')
})
