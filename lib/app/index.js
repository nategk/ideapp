var app = require('derby').createApp(module)
  //.use(require('derby-ui-boot'))
  .use(require('../../ui'))

app.on('model', function(model) {
  // Sort the players by score and return the top X players. The
  // function will automatically update the value of '_page.leaders'
  // as players are added and removed, their scores change, and the
  // cutoff value changes.
  model.fn('likes', function(notes) {
    // Note that the input array is copied with slice before sorting
    // it. The function should not modify the values of its inputs.
    console.log(likes.count);
    return likes.count;
  });
});

// ROUTES //

// Home — Create a new session
app.get('/', function(page, model) {
  function goToSession() {
    page.redirect('/session/'+session);
  }
  session = model.add('sessions', {title: "Session", dateCreated: +(new Date)}, goToSession);
});

// Session
app.get('/session/:id', function(page, model, params, next) {
  // Create a scoped model, which sets the base path for all model methods
  var session = model.at('sessions.' + params.id);
  // Get the inital data and subscribe to any updates
  session.subscribe(function(err) {
    if (err) return next(err);
    if (!session.get()) return next()
    console.log("Session ID " + session.get('id'));
    // Get current user from middleware
    var user = model.ref('_page.user', 'users.' + model.get('_session.userId'));
    if (user.get()) {
      console.log("User ID " + user.get(id));
    } else {
      // console.log("User ID " + user);
    }
    // Query notes that belong to this session
    var notesQuery = model.query('notes', {
      sessionId: session.get('id'),
      $orderby: {likesCount: -1, dateCreated: -1}
    });
    notesQuery.subscribe(function(err) {
      if (err) return next(err);
      model.ref('_page.session', session);
      model.ref('_page.user', user);
      notesQuery.ref('_page.notes');
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

app.fn('title.edit', function(e, el) {

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
  //newNote.likes.push(userId);
  // create note
  this.model.add('notes', newNote);
  console.log("Created note '" + newNote.text + "' with session " + session.id);
});

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
  console.log(likeIdx);
  if (likeIdx != -1) {
    note.likes.splice(likeIdx,1);
  } else {
    note.likes.push(userId);
  }
  // Update like count
  note.likesCount= note.likes.length;
  this.model.set('notes.'+noteEl.id, note);
});



// Add session
app.fn('session.add', function(e, el, next) {
  // Pull newNote object from view
  var newSession = this.model.del('_page.newSession');
  if (!newSession) return;
  this.model.add('sessions', newSession);
  console.log("Created session '" + newSession.id + "'");
});

// Delete session
app.fn('session.remove', function(e) {
  var session = e.get(':session');
  this.model.del('sessions.' + session.id);
  console.log("Deleted session '" + session.id + "'");
});

