var Sequelize =  require('sequelize');
var sequelize = new Sequelize(undefined, undefined, undefined, {
    'dialect': 'sqlite',
    'storage': __dirname + '/basic-sqlite-database.sqlite'
});

var Todo = sequelize.define('todo', {
    description: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            len: [1, 250]
        }
    },
    completed: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
});

sequelize.sync(/*{force: true}*/).then(function () {
    console.log('Everything is synced');

    Todo.findById(2).then(function (item) {
        if(item) {
            console.log(item.toJSON());
        } else {
            console.log('Todo not found');
        }

    });

    /*Todo.create({
        description: 'Walking my dog',
        completed: false
    }).then(function (todo) {

        return Todo.create({
            description: 'Clean office'
        });

    }).then(function () {
        //return Todo.findById(1);
        return Todo.findAll({
            where: {
                description: {
                    $like: '%clean%'
                }
            }
        })
    }).then(function (todos) {
        if (todos){
            todos.forEach(function (todo) {
                console.log(todo.toJSON());
            })

        } else {
            console.log('No todo found');
        }
    }).catch(function (e) {
        console.log(e);
    });*/
});
