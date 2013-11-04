var app;

app = require('derby').createApp(module).use(require('../../ui/index.js'));

app.get("/notes/:id", function(page, model, params, next) {
  var note;
  note = model.at("notes." + params.id);
  return model.subscribe(note, function(err) {
    if (err) {
      return next(err);
    }
    if (!note.get()) {
      return next();
    }
    model.ref("_page.note", note);
    return page.render("note");
  });
});

app.get("/", function(page, model) {
  var note;
  note = model.add('notes', {
    name: "Write a note"
  }, console.log(note));
  return page.redirect("/notes/" + note);
});
