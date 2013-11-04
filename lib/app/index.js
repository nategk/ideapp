var app = require('derby').createApp(module)

app
  .use(require('derby-ui-boot'))
  .use(require('../../ui'))

// Show all notes
app.get('/notes', function(page, model, params, next) {
  var notesQuery = model.query('notes', {})
  notesQuery.subscribe(function(err) {
    if (err) return next(err)
    notesQuery.ref('_page.notes');
    page.render('notes')
  })
})

// Render a note
app.get('/notes/:id', function(page, model, params, next) {
  if (params.id === 'new') {
    return page.render('edit')
  }
  var note = model.at('notes.' + params.id)
  model.subscribe(note, function(err) {
    if (err) return next(err)
    if (!note.get()) return next()
    model.ref('_page.note', note)
    page.render('edit')
  })
})

// Add or update a record
app.done = function() {
  var model = this.model;
  var note = model.at('_page.note')
  if (!note.get('name')) {
    var checkName = note.on('change', 'name', function(value) {
      if (!value) return
      model.del('_page.nameError')
      model.removeListener('change', checkName)
    })
    model.set('_page.nameError', true)
    document.getElementById('name').focus()
    return
  }
  if (!note.get('id')) {
    model.add('notes', note.get())
  }
  app.history.push('/notes')
}

// Cancel a request
app.cancel = function() {
  app.history.back()
}

// Delete a note
app.deleteNote = function() {
  // Update model without emitting events so that the page doesn't update
  this.model.silent().del('_page.edit')
  app.history.back()
}

/*
TEMP Reminder notes

How to query all objects on model
app.get('/people', function(page, model, params, next) {
  var peopleQuery = model.query('people', {})
  peopleQuery.subscribe(function(err) {
    if (err) return next(err)
    peopleQuery.ref('_page.people');
    page.render('people')
  })
})

How to get a person
app.get('/people/:id', function(page, model, params, next) {
  if (params.id === 'new') {
    return page.render('edit')
  }
  var person = model.at('people.' + params.id)
  model.subscribe(person, function(err) {
    if (err) return next(err)
    if (!person.get()) return next()
    model.ref('_page.person', person)
    page.render('edit')
  })
})

How to add or update a record
app.done = function() {
  var model = this.model;
  var person = model.at('_page.person')
  if (!person.get('name')) {
    var checkName = person.on('change', 'name', function(value) {
      if (!value) return
      model.del('_page.nameError')
      model.removeListener('change', checkName)
    })
    model.set('_page.nameError', true)
    document.getElementById('name').focus()
    return
  }

  if (!person.get('id')) {
    model.add('people', person.get())
  }
  app.history.push('/people')
}

*/