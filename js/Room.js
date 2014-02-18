Room = Backbone.Model.extend({
  defaults: {
    id: null,
    x: null,
    y: null,
    exits: null
  },
  initialize: function() {
    this.set({exits: new ExitCollection()});
  },
  addExit: function(e) {
    this.get('exits').add(e);
  }
});
