const express = require("express");
const router = express.Router() // Componente usado para criar rotas em arquivos separados.
const mongoose = require("mongoose")
require("../Models/Categoria")
const Categoria = mongoose.model("categorias")
require("../Models/Postagem")
const Postagem = mongoose.model("postagens")
const {eAdmin} = require("../Helpers/eAdmin")

// Em arquivo separado ao invés de usar app.get, usa-se router.get.
router.get('/', eAdmin, (req,res) => {
    res.render('admin/index')
})

router.get('/posts', eAdmin, (req,res) => {
    res.send('Página de Posts.')
})

router.get('/categorias', eAdmin, (req,res) => {
    Categoria.find().lean().sort({date:'desc'}).then((categorias) => {
        res.render('admin/categorias', {categorias: categorias}) // Traz o arquivo.
    }).catch((erro) => {
        req.flash('error_msg', 'Houve um erro ao listar as categorias.')
        res.redirect('/admin')
    }) // find -> serve para listar todos os documentos que existem.
})

router.post('/categorias/nova', eAdmin, (req,res) => {

    // Sistema de Validação
    var erros =[]

    if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
        erros.push({texto: 'Nome inválido'}) // push -> Serve para colocar um dado dentro do array.
    }

    if (!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
        erros.push({texto: 'Slug Inválido'})
    }

    if (erros.length > 0){
        res.render("admin/addcategoria", {erros: erros})
    }else{
        const novaCategoria = {
            nome: req.body.nome,
            slug: req.body.slug
        }
    
        new Categoria(novaCategoria).save().then(() => {
            req.flash('success_msg', 'Categoria criada com sucesso!') // Exibir mensagem de que a categoria foi registrada com sucesso.
            res.redirect('/admin/categorias')
        }).catch((erro) => {
            req.flash('erro_msg', 'Houve um erro ao salvar a categoria, tente novamente!')
            res.redirect('/admin')
        })
    }


})

router.get("/categorias/edit/:id", eAdmin, (req,res) => {
    Categoria.findOne({_id:req.params.id}).lean().then((categoria) => {
        res.render('admin/editcategorias', {categoria: categoria})
    }).catch((err) => {
        req.flash("error_msg", "Esta categoria não existe.")
        res.redirect("/admin/categorias")
    })
})

router.post("/categorias/edit", eAdmin, (req, res) => {
    Categoria.findOne({_id: req.body.id}).then((categoria) => {

        categoria.nome = req.body.nome
        categoria.slug = req.body.slug

        categoria.save().then(() => {
            req.flash('success', 'Categoria editada com sucesso.')
            res.redirect('/admin/categorias')
        }).catch((err) => {
            req.flash('error_msg', 'Houve um erro interno ao salvar a edição da categoria.')
            res.redirect('/admin/categorias')
        })

    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro ao editar a categoria.')
        res.redirect('/admin/categorias')
    })
})

router.post("/categorias/deletar", eAdmin, (req,res) => {
    Categoria.deleteOne({_id: req.body.id}).then(() => {
        req.flash("success_msg", "Categoria deletada com sucesso!")
        res.redirect("/admin/categorias")
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao deletar categoria!")
        res.redirect("/admin/categorias")
    })
})

router.get('/categorias/add', eAdmin, (req,res) => {
    res.render('admin/addcategoria')
})

router.get('/postagens', eAdmin, (req,res) => {
    Postagem.find().lean().populate("categoria").sort({data:"desc"}).then((postagens) => {
        res.render("admin/postagens", {postagens: postagens})
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao listar as postagens.")
        res.redirect("/admin")
    })
})

router.get('/postagens/add', eAdmin, (req,res) => {
    Categoria.findOne().then((categorias) => {
        res.render("admin/addPostagem", {categorias:categorias})
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao carregar o formulário.")
        res.redirect("/admin")
    })
})

router.post('/postagens/nova', eAdmin, (req,res) => {
    var erros = []

    if (req.body.categoria == "0"){
        erros.push({texto: "Categoria inválida, registre uma categoria."})
    }if (erros.length > 0){
        res.render("admin/addpostagem", {erros: erros})
    }else {
        const novaPostagem = {
            titulo: req.body.titulo,
            descricao: req.body.descricao,
            conteudo: req.body.conteudo,
            categoria: req.body.categoria,
            slug: req.body.slug
        }

        new Postagem(novaPostagem).save().then(() => {
            req.flash("success_msg", "Postagem criada com sucesso!")
            res.redirect("admin/postagens")
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro durante o salvamento da postagem!")
            res.redirect("admin/postagens")
        })
    }
})

router.get("/postagens/edit/:id", eAdmin, (req,res) => {

    Postagem.findOne({_id: req.params.id}).lean().then((postagem) => {
        Categoria.findOne().lean().then((categorias) => {
            res.render("admin/editpostagens", {categorias: categorias, postagem: postagem})
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro ao listar as categorias.")
            res.redirect("/admin/postagens")
        })

    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao carregar o formulário de edição.")
        res.redirect("/admin/postagens")
    })    
})

router.post("/postagem/edit", eAdmin, (req,res) => {

    Postagem.findOne({_id: req.body.id}).lean().then((postagem) => {

        postagem.titulo = req.body.titulo
        postagem.slug = req.body.slug
        postagem.descricao = req.body.descricao
        postagem.conteudo = req.body.conteudo
        postagem.categoria = req.body.categoria

        postagem.save().then(() => {
            req.flash("success_msg", "Postagem editada com sucesso.")
            res.redirect("/admin/postagens")
        }).catch((err) => {
            req.flash("error_msg", "Erro interno.")
            res.redirect("/admin/postagens")
        })

    }).catch((err) => {
        console.log(err)
        req.flash("error_msg", "Houve um erro ao salvar a edição.")
        res.redirect("/admin/postagens")
    })

})

router.get("/postagens/deletar/:id", eAdmin, (req,res) => {
    Postagem.deleteOne({_id: req.params.id}).lean().then(() => {
        req.flash("success_msg", "Postagem deletada com sucesso.")
        res.redirect("/admin/postagens")
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro interno.")
        res.redirect("/admin/postagens")
    })
})

module.exports = router // É necessário exportar no final do arquivo.