require.config({
    baseUrl: '../../static/js',
    paths: {
    }
});

require(['../../html/js/main', 'underscore', 'backbone'], function (main) {
    main();

});