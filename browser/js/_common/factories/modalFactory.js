app.factory('openModal', function($mdDialog) {
    return function(title, text, label, msgType) {

        function afterShowAnimation() {
            var $dialog = angular.element(document.querySelector('md-dialog'));
            var $actionsSection = $dialog.find('md-dialog-actions');
            var $cancelButton = $actionsSection.children()[0];
            var $confirmButton = $actionsSection.children()[1];

            if (msgType.toLowerCase() === "warning")
                angular.element($confirmButton).addClass('md-raised md-warn');
        };
        var dialog = $mdDialog.confirm({
                onComplete: afterShowAnimation
            })
            .title(title)
            .content(text)
            .ariaLabel(label)
            .ok('Ok')
            .clickOutsideToClose(true)
        if (msgType.toLowerCase() === "confirm") dialog.cancel('Cancel')
        return $mdDialog.show(dialog);
    }
});