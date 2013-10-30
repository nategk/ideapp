app = require('derby').createApp(module)
  .use(require '../../ui/index.coffee')

app.get "/notes/:id", (page, model, params, next) ->
  return page.render("new")  if params.id is "new"
  note = model.at("notes." + params.id)
  model.subscribe note, (err) ->
    return next(err)  if err
    return next()  unless note.get()
    model.ref "_page.note", note
    page.render "note"

app.get "/", (page, model) ->
  note = model.add 'notes', {name: "Write a note"}, 
  console.log note
  # note — this redirect is sometimes working, sometimes not; is the record not fully written by the time the redirect occurs?
  page.redirect "/notes/" + note