// Carregando módulos

const express = require('express')
const handlebars = require('express-handlebars')
const bodyParser = require('body-parser')
const app = express()
const admin = require('./Routes/Admin')
const path = require('path') // Serve para manipular pastas, trabalhar com diretótios.
const mongoose = require('mongoose')
const session = require('express-session')
const flash = require('connect-flash')
require("./Models/Postagem")
const Postagem = mongoose.model("postagens")
require("./Models/Categoria")
const Categoria = mongoose.model("categorias")
const usuarios = require("./Routes/Usuario")
const passport = require('passport')
require("./Config/Auth")(passport)

// Configurações

    // Sessão
        app.use(session({
            secret: 'cursodenode', // É como se fosse uma chave para gerar uma sessão.
            resave: true,
            saveUninitialized: true
        }))

        app.use(passport.initialize())
        app.use(passport.session())

        app.use(flash()) // O flash tem que ficar abaixo da sessão.
    
    // Middlewares
        app.use((req, res, next) => {
            res.locals.success_msg = req.flash('success_msg')  // Serve para criar variáveis globais. (res.locals.)
            res.locals.error_msg = req.flash('error_msg')
            res.locals.error = req.flash("error")
            res.locals.user = req.user || null
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

    app.get("/postagem/:slug", (req,res) => {
        Postagem.findOne({slug: req.params.slug}).lean().then((postagem) => {
            if(postagem){
                res.render("postagem/index", {postagem: postagem})
            }else{
                req.flash("error_msg", "Esta postagem não existe.")
                res.redirect("/")
            }
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro interno.")
            res.redirect("/")
        })
    })

    app.get("/categorias", (req,res) => {
        Categoria.find().lean().then((categorias) => {
            res.render("categorias/index", {categorias: categorias})
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro interno ao listar as categorias.")
            res.redirect("/")
        })
    })

    app.get("/categorias/:slug", (req,res) => {
        Categoria.findOne({slug: req.params.slug}).lean().then((categoria) => {
            if(categoria){
                
                Postagem.find({categoria: categoria._id}).lean().then((postagens) => {
                    res.render("categorias/postagens", {postagens: postagens, categoria: categoria})
                }).catch((err) => {
                    req.flash("error_msg", "Houve um erro ao listar os posts!")
                    res.redirect("/")
                })

            }else{
                req.flash("error_msg", "Esta categoria não existe.")
                res.redirect("/")
            }
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro interno ao carregar a página desta categoria.")
            res.redirect("/")
        })
    })

    app.get("/404", (req,res) => {
        res.redirect("/404")
    })

    app.use('/admin', admin)
    app.use('/usuarios', usuarios)

// Outros
const PORT = 8081
app.listen(PORT, () => {
    console.log('Servidor Rodando!')
})
