app.controller("DashboardShowCtrl", ["$scope", "$rootScope", "$routeParams", "$location", "$timeout", "$dialog", "$window", "Dashboard", "Widget", "Sources", function($scope, $rootScope, $routeParams, $location, $timeout, $dialog, $window, Dashboard, Widget, Sources) {

  $rootScope.resolved = false;

  $scope.dashboard = Dashboard.get({ id: $routeParams.id });
  $scope.widgets   = Widget.query({ dashboard_id: $routeParams.id }, function() {
    $rootScope.resolved = true;
  });

  // defined in application.html.erb
  $scope.available_widgets = $.available_widgets;

  function saveDashboardChanges() {
    $scope.dashboard.$update();
  }

  function destroyDashboard() {
    $scope.dashboard.$destroy(function() {
      $location.url("/dashboards");
    });
  }

  function destroyWidget(widget) {
    // temporary fix until there's a final angular.js 1.2 release
    $scope.$apply(function() {
      Widget.destroy({ dashboard_id: widget.dashboard_id, id: widget.id }, function() {
        $scope.widgets.splice(_.indexOf($scope.widgets, widget), 1);
      });
    });

  }

  function replaceWidget(id, widget) {
    var w = _.findWhere($scope.widgets, { id: widget.id });
    _.extend(w, widget);
  }

  $scope.addWidget = function(kind) {
    var widget = new Widget({ kind: kind, dashboard_id: $scope.dashboard.id, row: null, col: null });
    var dialogOptions = {
      templateUrl: 'templates/widget/edit.html', controller: "WidgetEditCtrl",
      resolve: { widget: function() { return widget; } }
    };

    var dialog = $dialog.dialog(dialogOptions);

    dialog.open().then(function(result) {
      if (result) $scope.widgets.push(dialog.$scope.widget);
    });
  };

  $scope.editWidget = function(widget) {
    var dialogOptions = {
      templateUrl: 'templates/widget/edit.html', controller: "WidgetEditCtrl",
      resolve: { widget: function() { return angular.copy(widget); } }
    };

    var dialog = $dialog.dialog(dialogOptions);

    dialog.open().then(function(result) {
      if (result) replaceWidget(widget.id, dialog.$scope.widget);
    });
  };

  $scope.removeWidget = function(widget) {
    var text = "Want to delete widget?";
    $window.bootbox.animate(false);
    $window.bootbox.confirm(text, "Cancel", "Delete", function(result) {
      if (result) destroyWidget(widget);
    });
  };

  $scope.deleteDashboard = function() {
    var text = "Want to delete Dashboard?";
    $window.bootbox.animate(false);
    $window.bootbox.confirm(text, "Cancel", "Delete", function(result) {
      if (result) destroyDashboard();
    });
  };

  $scope.save = function() {
    saveDashboardChanges();
  };

}]);
