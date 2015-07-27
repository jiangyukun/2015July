require.config({
    baseUrl: '../../static/js',
    paths: {}
});

require(['jquery', 'underscore', 'backbone'], function ($, _, Backbone) {
    var model = new Backbone.Model();
    var collection = new Backbone.Collection();
    var view = new Backbone.View();

    /*console.log(model);
    console.log(collection);
    console.log(view);*/

    var User = Backbone.Model.extend({
        name: '123'
    });

    var Users = Backbone.Collection.extend({
        model: User
    });

    var UserView = Backbone.View.extend({
        tagName: 'div',
        events: {
            'click': 'add'
        },
        initialize: function () {
            console.log(this.model);
            this.render();
        },
        render: function () {
            this.$el.html('xbv');
        },
        add: function () {
            console.log(this);
        }
    });

    new UserView();
});
