require.config({
    baseUrl: '../../static/js',
    paths: {}
});

require(['jquery', 'underscore', 'backbone'], function ($, _, Backbone) {
    var primary = Backbone.sync;
    Backbone.sync = function () {
        return primary.apply(Backbone, arguments);
    };
    var User = Backbone.Model.extend({
        urlRoot: '/backbone/user',
        defaults: {
            name: 'j',
            age: '20'
        }
    });

    var Users = Backbone.Collection.extend({
        model: User
    });

    var UserView = Backbone.View.extend({
        el: $('body'),
        events: {
            'click button': 'add'
        },
        initialize: function () {
            this.index = 1;
            this.users = new Users();
            this.users.on('add', this.addItem);
            this.users.on('change', this.change);
            this.render();
        },
        render: function () {
            this.$el.append($('<button>').text('addItem'));
            this.$el.append($('<ul>').attr('id', 'ul'));
        },
        add: function () {
            var user = new User({
                name: '[ tt' + this.index++ + ' ]',
                age: 20
            });
            this.users.add(user);
            user.fetch({
                success: function () {
                    console.log(arguments);
                }
            });
        },
        addItem: function (item) {
            $('#ul').append($('<li>').append($('<span>').html(item.get('name'))).append($('<span>').html(item.get('age'))));
        },
        change: function (item) {
            console.log(item);
        }
    });

    new UserView();
});
