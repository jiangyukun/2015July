require.config({
    baseUrl: '../../static/js',
    paths: {}
});

require(['jquery', 'underscore', 'backbone'], function ($, _, Backbone) {
    var User = Backbone.Model.extend({
        name: '123'
    });

    var Users = Backbone.Collection.extend({
        model: User
    });

    var UserView = Backbone.View.extend({
        el: $('.bb'),
        render: function () {
            this.el.html('xbv');
            return this;
        }
    });

    new UserView();
});
