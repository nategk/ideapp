var app = require('derby').createApp(module)
  //.use(require('derby-ui-boot'))
  .use(require('../../ui'))
var moniker = require('moniker');

// ROUTES //

app.get('/', function(page, model) {
  // User ID from middleware
  var userId = model.get('_session.userId');
  var user = model.at('users.' + userId);
  function goToSession() {
    page.redirect('/session/'+session);
  };
  // Get the inital data and subscribe to any updates
  model.subscribe(user, function(err) {
    if (err) return next(err);  
    // Store user if doesn't exist
    if (!user.get('id')) {
      model.add('users', {id: userId, name: moniker.choose()});
      console.log("Created new user " + user.get('id') + " name " + user.get('name'));
    } else {
      console.log("Found user in session " + user.get('id') + " name " + user.get('name'));
    }
    model.ref('_page.user', user);
    page.render('home')
  });
})

// Home — Create a new session
// app.get('/', function(page, model) {
//   function goToSession() {
//     page.redirect('/session/'+session);
//   }
//   session = model.add('sessions', {
//     title: "Session", 
//     dateCreated: +(new Date), 
//     userId: model.get('_session.userId')
//   }, goToSession);
// });

// Session
app.get('/session/:id', function(page, model, params, next) {
  // Create a scoped model, which sets the base path for all model methods
  var session = model.at('sessions.' + params.id);
  // User ID from middleware
  var userId = model.get('_session.userId');
  var user = model.at('users.' + userId);
  // Get the inital data and subscribe to any updates
  model.subscribe(session, user, function(err) {
    if (err) return next(err);
    // Subscribed to session
    console.log("Session ID " + session.get('id'));    
    // Store user if doesn't exist
    if (!user.get('id')) {
      model.add('users', {id: userId, name: moniker.choose()});
      console.log("Created new user " + user.get('id') + " name " + user.get('name'));
    } else {
      console.log("Found user in session " + user.get('id') + " name " + user.get('name'));
    }
    // Query notes
    var notesQuery = model.query('notes', {
      sessionId: session.get('id'),
      $orderby: {likesCount: -1, dateCreated: -1}
    });
    notesQuery.subscribe(function(err) {
      if (err) return next(err);
      notesQuery.ref('_page.notes');
      model.ref('_page.user', user);
      model.ref('_page.session', session);
      page.render('session');
    });
  });
});

// Note
app.get('/note/:id', function(page, model, params, next) {
  var note = model.at('notes.' + params.id);
  model.subscribe(note, function(err) {
    if (err) return next(err);
    if (!note.get()) return next()
    model.ref('_page.note', note)
    page.render('note');
  });
});

// Admin view
app.get('/admin', function(page, model, params, next) {
  var sessionsQuery = model.query('sessions', {});
  var notesQuery = model.query('notes', {});
  // Get the inital data and subscribe to any updates
  model.subscribe(sessionsQuery, notesQuery, function(err) {
    if (err) return next(err);
    // Create references that can be used in templates or controller methods
    sessionsQuery.ref('_page.sessions');
    notesQuery.ref('_page.notes');
    page.render('admin');
  });
});

// CONTROLLER FUNCTIONS

// app.goToSession = function(session) {
//   console.log(this, session);
//   //app.history.back()
// }

app.fn('session.add', function(e, el, next) {
  // Pull newNote object from view
  var newSession = this.model.del('_page.newSession');
  if (!newSession) return;
  // Add data
  newSession.dateCreated = +(new Date);
  newSession.userId = this.model.get('_session.userId');
  session = this.model.add('notes', newSession, function() {
    console.log('created');
  });

// View helper for session: check if note was liked
app.view.fn('isLiked', function(note, user) {
  var userId = user.id;
  var likeIdx = note.likes.indexOf(userId);
  if (likeIdx != -1) {
    return true;
  } else {
    return false;
  }
});

// Add note to session
app.fn('note.add', function(e, el, next) {
  // Pull newNote object from view
  var newNote = this.model.del('_page.newNote');
  if (!newNote) return;
  // get session from view
  var session = this.model.get('_page.session');
  // get user ID
  var userId = this.model.get('_session.userId');
  // add this session ID to note
  newNote.sessionId = session.id;
  // add current user ID to note
  newNote.userId = userId;
  // add created time
  newNote.dateCreated = +(new Date);
  // add temp likes
  newNote.likes = [];
  newNote.likesCount = 0;
  // create note
  this.model.add('notes', newNote);
  console.log("Created note '" + newNote.text + "' with session " + session.id);
});

// Draft enter key listener for form (may not be ideal UX)
// app.fn('note.listenEnter', function (e, el) {
//   var key = e.which || e.keyCode;
//   if (key == 13) { // 13 is enter
//     // code for enter
//     console.log("enter press");
//     document.addNote.submit();
//   }
// });

// Delete note
app.fn('note.remove', function(e) {
  var note = e.get(':note');
  this.model.del('notes.' + note.id);
  console.log("Deleted note '" + note.text + "'");
});

// Add or remove like
app.fn('likeUnlike', function(e, el, next) {
  // Get note element
  var noteEl = e.get(':note');
  // Get note object from el id
  var note = this.model.get('notes.' + noteEl.id);
  // Get user ID from session
  var userId = this.model.get('_session.userId');
  // See if this user has liked
  var likeIdx = note.likes.indexOf(userId);
  if (likeIdx != -1) {
    note.likes.splice(likeIdx,1);
    console.log("User " + userId + " unliked note " + noteEl.id);
  } else {
    note.likes.push(userId);
    console.log("User " + userId + " liked note " + noteEl.id);
  }
  // Update like count
  note.likesCount= note.likes.length;
  this.model.set('notes.'+noteEl.id, note);
});


// Delete session
app.fn('session.remove', function(e) {
  var session = e.get(':session');
  this.model.del('sessions.' + session.id);
  console.log("Deleted session '" + session.id + "'");
});