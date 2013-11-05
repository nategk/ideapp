var app = require('derby').createApp(module)
  .use(require('derby-ui-boot'))
  .use(require('../../ui'))


// ROUTES //

// Derby routes are rendered on the client and the server
app.get('/', function(page) {
  page.render('home');
});

app.get('/list', function(page, model, params, next) {
  // This value is set on the server in the `createUserId` middleware
  var userId = model.get('_session.userId');

  // Create a scoped model, which sets the base path for all model methods
  var user = model.at('users.' + userId);

  // Create a mongo query that gets the current user's notes
  var notesQuery = model.query('notes', {userId: userId});

  // Get the inital data and subscribe to any updates
  model.subscribe(user, notesQuery, function(err) {
    if (err) return next(err);

    // Create references that can be used in templates or controller methods
    model.ref('_page.user', user);
    notesQuery.ref('_page.notes');

    user.increment('visits');
    page.render('list');
  });
});

app.get('/note/:id', function(page, model, params, next) {
  // Create a scoped model, which sets the base path for all model methods
  var note = model.at('notes.' + params.id);
  // Get the inital data and subscribe to any updates
  model.subscribe(note, function(err) {
    if (err) return next(err);
    if (!note.get()) return next()
    model.ref('_page.note', note)
    note.ref('_page.note');
    console.log(note)
    page.render('note');
  });
});


// CONTROLLER FUNCTIONS //

app.fn('list.add', function(e, el) {
  var newNote = this.model.del('_page.newNote');
  if (!newNote) return;
  newNote.userId = this.model.get('_session.userId');
  this.model.add('notes', newNote);
});

app.fn('list.remove', function(e) {
  var note = e.get(':note');
  this.model.del('notes.' + note.id);
});