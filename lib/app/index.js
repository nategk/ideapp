var app = require('derby').createApp(module)
  //.use(require('derby-ui-boot'))
  .use(require('../../ui'))


// ROUTES //

// Derby routes are rendered on the client and the server
app.get('/', function(page) {
  page.redirect('/list');
});

// SESSIONS

app.get('/sessions', function(page, model, params, next) {
  // This value is set on the server in the `createUserId` middleware
  //var userId = model.get('_session.userId');
  // Create a scoped model, which sets the base path for all model methods
  //var user = model.at('users.' + userId);
  var sessionsQuery = model.query('sessions', {});
  // Get the inital data and subscribe to any updates
  model.subscribe(sessionsQuery, function(err) {
    if (err) return next(err);
    // Create references that can be used in templates or controller methods
    // model.ref('_page.user', user);
    sessionsQuery.ref('_page.sessions');
    // user.increment('visits');
    page.render('sessions');
  });
});

// CONTROLLER FUNCTIONS //

app.fn('session.add', function(e, el) {
  var newSession = this.model.del('_page.newSession');
  if (!newSession) return;
  newSession.userId = this.model.get('_session.userId');
  this.model.add('sessions', newSession);
  console.log(newSession);
});

app.fn('session.remove', function(e) {
  var session = e.get(':session');
  this.model.del('sessions.' + session.id);
});

// NOTES

app.get('/list', function(page, model, params, next) {
  // This value is set on the server in the `createUserId` middleware
  // var userId = model.get('_session.userId');
  // Create a scoped model, which sets the base path for all model methods
  // var user = model.at('users.' + userId);
  // Create a mongo query that gets the current user's notes if add {userId: userId}
  var notesQuery = model.query('notes', {});
  // Get the inital data and subscribe to any updates
  model.subscribe(notesQuery, function(err) {
    if (err) return next(err);
    // Create references that can be used in templates or controller methods
    // model.ref('_page.user', user);
    notesQuery.ref('_page.notes');
    // user.increment('visits');
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
    // note.ref('_page.note');
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
  console.log(newNote);
});

app.fn('list.remove', function(e) {
  var note = e.get(':note');
  this.model.del('notes.' + note.id);
});