var express = require('express');
var bodyParser = require('body-parser');
var _  = require('underscore');
var db = require('./db.js');

var app = express();
var PORT = process.env.PORT || 3000;
var todos = [];
var todoNextId = 1;

//Every time a json request comes in
//express is going to parse it and we can access it via "req.body"
app.use(bodyParser.json());

app.get('/', function (req, res) {
    res.send('Todo API Root');
});

// GET /todos?completed=true&q=work
app.get('/todos', function (req, res) {
    var query = req.query;//url query parameter: req.query => key: "value" (value is a always a string!)
    console.log(query); //e.g. { completed: 'false', q: 'walk' }
    var where = {};

    if(query.hasOwnProperty('completed') && query.completed === 'true'){
        where.completed = true;
    } else if (query.hasOwnProperty('completed') && query.completed === 'false') {
        where.completed = false;
    }

    if(query.hasOwnProperty('q') && query.q.length > 0){
        where.description = {
            $like: '%%' + query.q + '%%'
        }
    }

    db.todo.findAll({where: where}).then(function (todos) {
        res.json(todos)
    }, function (e) {
        res.status(500).send();
    });

});

// GET /todos/:id
app.get('/todos/:id', function (req, res) {
    var todoId = parseInt(req.params.id, 10);

    db.todo.findById(todoId).then(function (todo) {
        //take and value (e.g. an object) that is not a boolean and convert it into
        // its truthy version
        if(!!todo) {
            res.json(todo.toJSON());
        } else {
            res.status(404).json(e);
        }

    }, function (e) {
        res.status(500).json(e);
    });
});


// POST /todos
app.post('/todos', function (req, res) {

    //send stuff to server via request
    //eg. json object
    //Return a copy of the object: picks out only the completed and description values of the object; 
    //all other chunky fields will be filtered
    var body = _.pick(req.body, 'completed', 'description');
    // e.g. { completed: false, description: 'walk the dog' }
    // so body can be passed to db.to.create (because its an object)

    db.todo.create(body).then(function (todo) { // you can now access the newly created todo via the variable todo
        res.json(todo.toJSON());
    }, function (e) {
        res.status(400).json(e);
    });

    /*if (!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length === 0) {
        return res.status(404).send();
    }

    body.description = body.description.trim();

    body.id = todoNextId++;
    todos.push(body);

    //get stuff from server
    //with modified json object
    res.json(body);*/
});

// DELETE /todos/:id
app.delete('/todos/:id', function (req, res) {
    var todoId = parseInt(req.params.id, 10);

    db.todo.destroy({
        where: {
            id: todoId
        }
    }).then(function (rowsDeleted) {
        if (rowsDeleted === 0) {
            res.status(404).json({
                error: 'no todo with id'
            });
        } else {
            //Erverything is ok, nothing to send back
            res.status(204).send();
        }
    }, function (e) {
        res.status(500).json(e);
    });

});



// PUT  /todos/:id
app.put('/todos/:id', function (req, res) {
    var todoId = parseInt(req.params.id, 10);
    var matchedTodo = _.findWhere(todos, {id: todoId});
    var body = _.pick(req.body, 'completed', 'description');
    var validAttributes = {};

    if(!matchedTodo) {
        return res.status(404).send();
    }

    if(body.hasOwnProperty('completed') && _.isBoolean(body.completed)) {
        validAttributes.completed = body.completed;
    } else if (body.hasOwnProperty('completed')) {
        return res.status(400).send();
    }

    if(body.hasOwnProperty('description') && _.isString(body.description) && body.description.trim().length > 0) {
        validAttributes.description = body.description;
    } else if (body.hasOwnProperty('description')) {
        return res.status(400).send();
    }
    //updates matchedTody object via overriding already existing properties
    _.extend(matchedTodo, validAttributes);

    res.json(matchedTodo);


});

// "sequelize.sync" will, based on the model definitions, create any missing tables
// when done server is starting
db.sequelize.sync().then(function () {
    app.listen(PORT, function () {
        console.log('Express listening on port ' + PORT + '!');
    });
});
