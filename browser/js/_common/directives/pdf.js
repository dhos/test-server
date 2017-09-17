app.directive('pdf', function() {
    return {
        restrict: 'E',
        link: function(scope, element, attrs) {
            element.replaceWith(`<object type="application/pdf" data="uploads/${attrs.source}" width="100%" height="70vh">
                                <p>Alternative text - include a link <a href="uploads/${attrs.source}">to the PDF!</a></p></object>'`);
        }
    };
});