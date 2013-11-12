var app = require('derby').createApp(module)
  //.use(require('derby-ui-boot'))
  .use(require('../../ui'))


// ROUTES //

// Home
app.get('/', function(page, model) {
  function goToSession() {
    page.redirect('/session/'+session);
  }
  session = model.add('sessions', {title: "Ideation Session"}, goToSession);
  //session = model.add('sessions', {title: "Test"});
});

// var user = model.at('users.' + userId);
// user.subscribe(function(err) {
//   if (err) return next(err);
//   var todosQuery = model.query('todos', {creatorId: userId});
//   todosQuery.subscribe(function(err) {
//     if (err) return next(err);
//     model.ref('_page.user', user);
//     todosQuery.ref('_page.todosList');
//     page.render();
//   });
// });

app.get('/session/:id', function(page, model, params, next) {
  // Create a scoped model, which sets the base path for all model methods
  var session = model.at('sessions.' + params.id);
  //var notesQuery = model.query('session.notes', {sessionId: sessionId});
  // Get the inital data and subscribe to any updates
  model.subscribe(session, function(err) {
    if (err) return next(err);
    if (!session.get()) return next()
    console.log("found session " + session.id.to_s);
    // var sessionId = session.path();
    //console.log("set session ID " + sessionId);
    //var notes = session.at('notes');
    //console.log(notes);
    //note = model.add('notes', {text:  "New note", session: session.id.to_s});
    //console.log(note);
    var notesQuery = model.query('notes', {session: session});
    notesQuery.subscribe(function(err) {
      if (err) return next(err);
      model.ref('_page.session', session);
      notesQuery.ref('_page.notes');
      page.render('session');
    });
  });
});

app.fn('note.add', function(e, el) {
  var newNote = this.model.del('_page.newNote');
  if (!newNote) return;
  console.log(this);
  newNote.session = session.path();
  this.model.add('notes', newNote);
});

app.fn('note.remove', function(e) {
  var note = e.get(':note');
  this.model.del('notes.' + note.id);
});

// ADMIN VIEW: SESSIONS

app.get('/sessions', function(page, model, params, next) {
  var sessionsQuery = model.query('sessions', {});
  var notesQuery = model.query('notes', {});
  // Get the inital data and subscribe to any updates
  model.subscribe(sessionsQuery, notesQuery, function(err) {
    if (err) return next(err);
    // Create references that can be used in templates or controller methods
    sessionsQuery.ref('_page.sessions');
    notesQuery.ref('_page.notes');
    page.render('sessions');
  });
});

// var user = model.at('users.' + userId);
// user.subscribe(function(err) {
//   if (err) return next(err);
//   var todosQuery = model.query('todos', {creatorId: userId});
//   todosQuery.subscribe(function(err) {
//     if (err) return next(err);
//     model.ref('_page.user', user);
//     todosQuery.ref('_page.todosList');
//     page.render();
//   });
// });



// NOTES

app.get('/notes', function(page, model, params, next) {
  var notesQuery = model.query('notes', {});
  model.subscribe(notesQuery, function(err) {
    if (err) return next(err);
    notesQuery.ref('_page.notes');
    page.render('notes');
  });
});

app.get('/note/:id', function(page, model, params, next) {
  var note = model.at('notes.' + params.id);
  model.subscribe(note, function(err) {
    if (err) return next(err);
    if (!note.get()) return next()
    model.ref('_page.note', note)
    console.log(note)
    page.render('note');
  });
});


// CONTROLLER FUNCTIONS //

app.fn('session.add', function(e, el) {
  var newSession = this.model.del('_page.newSession');
  if (!newSession) return;
  //newSession.userId = this.model.get('_session.userId');
  this.model.add('sessions', newSession);
});

app.fn('session.remove', function(e) {
  var session = e.get(':session');
  this.model.del('sessions.' + session.id);
});


// REFERENCE
//
// app.get('/list', function(page, model, params, next) {
//   // This value is set on the server in the `createUserId` middleware
//   var userId = model.get('_session.userId');
//   if (! userId) {
//     return page.redirect('/');
//   }
//   // Create a scoped model, which sets the base path for all model methods
//   var user = model.at('users.' + userId);
//   // Create a mongo query that gets the current user's items
//   var itemsQuery = model.query('items', {userId: userId});
//   // Get the inital data and subscribe to any updates
//   model.subscribe(user, itemsQuery, function(err) {
//     if (err) return next(err);
//     // Create references that can be used in templates or controller methods
//     model.ref('_page.user', user);
//     itemsQuery.ref('_page.items');
//     user.increment('visits');
//     page.render('list');
//   });
// });

// // CONTROLLER FUNCTIONS //
// app.fn('list.add', function(e, el) {
//   var newItem = this.model.del('_page.newItem');
//   if (!newItem) return;
//   newItem.userId = this.model.get('_session.userId');
//   this.model.add('items', newItem);
// });
// app.fn('list.remove', function(e) {
//   var id = e.get(':item.id');
//   this.model.del('items.' + id);
// });
