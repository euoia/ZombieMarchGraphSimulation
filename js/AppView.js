$(document).ready (function () {
  AppView = Backbone.View.extend({
    el: 'body',

    events: {
      'click .generateNewMapButton': 'generateNewMap',
      'change .maxRooms': function(event) {
        this.zone.set({maxRooms: parseInt($(event.srcElement).val(), 10)});
      },
      'change .width': function(event) {
        this.zone.set({width: parseInt($(event.srcElement).val(), 10)});
      },
      'change .height': function(event) {
        this.zone.set({height: parseInt($(event.srcElement).val(), 10)});
      },
      'change .showGrid': function(event) {
        this.zoneView.showGrid = $(event.srcElement).is(':checked') ? true : false;
        this.zoneView.render();
      },
      'click .newRoom': function(event) {
        var x = this.zoneView.selectedGrid.x;
        var y = this.zoneView.selectedGrid.y;

        this.zoneView.selectedRoom = this.zone.addRoom(x, y);
        this.zoneView.render();
      },
      'click .deleteExit': function(event) {
        this.zone.deleteExit(this.zoneView.selectedExit);
      },
      'click .deleteRoom': function(event) {
        this.zone.deleteRoom(this.zoneView.selectedRoom);
      },
      'keydown': function(event) {
        console.log("event.keyCode", event.keyCode);
        switch (event.keyCode) {
          case 90: // z
            this.zoneView.selectedRoom = this.zone.addExitToRoom(
              this.zoneView.selectedRoom,
              directions.toGrid('southwest'));
            break;
          case 88:
          case 98:
            // Numpad 2
            this.zoneView.selectedRoom = this.zone.addExitToRoom(
              this.zoneView.selectedRoom,
              directions.toGrid('south'));
            break;
          case 67: // c
          case 99: // Numpad 3
            this.zoneView.selectedRoom = this.zone.addExitToRoom(
              this.zoneView.selectedRoom,
              directions.toGrid('southeast'));
            break;
          case 65: // a
          case 100: // Numpad 4
            this.zoneView.selectedRoom = this.zone.addExitToRoom(
              this.zoneView.selectedRoom,
              directions.toGrid('west'));
            break;
          case 101:
            // Numpad 5
            break;
          case 68: // e
          case 102: // Numpad 6
            this.zoneView.selectedRoom = this.zone.addExitToRoom(
              this.zoneView.selectedRoom,
              directions.toGrid('east'));
            break;
          case 81: // q
          case 103: // Numpad 7
            this.zoneView.selectedRoom = this.zone.addExitToRoom(
              this.zoneView.selectedRoom,
              directions.toGrid('northwest'));
            break;
          case 87: // w
            this.zoneView.selectedRoom = this.zone.addExitToRoom(
              this.zoneView.selectedRoom,
              directions.toGrid('north'));
            break;
          case 69: // e 9
          case 105: // Numpad 9
            this.zoneView.selectedRoom = this.zone.addExitToRoom(
              this.zoneView.selectedRoom,
              directions.toGrid('northeast'));
            break;
          case 8: // backspace.
            if (this.zoneView.selectedRoom !== null) {
              this.zone.deleteRoom(this.zoneView.selectedRoom);
            }

            if (this.zoneView.selectedExit !== null) {
              this.zone.deleteExit(this.zoneView.selectedExit);
            }

            event.preventDefault();

            break;
        }

        this.zoneView.render();
      }
    },

    initialize: function() {
      this.zone = new Zone({
        height: $('.height').val(),
        width:  $('.width').val(),
        maxRooms:  $('#maxRooms').val(),
        allowDiagonals: $('#allowDiagonals').is(':checked') ? true : false
      });

      this.zoneView = new ZoneView({model: this.zone});
      this.zoneView.showGrid = $('.showGrid').is(':checked') ? true : false;
    },

    generateNewMap: function(event) {
      $('#randomSeed').val(Date.now());
      seed($('#randomSeed').val());

      this.zone.initialize();
      this.zone.generateRandomMap();

      //cg.generateFromMap(map, $('#areaName').val(), $('#zonePrefix').val());
    }
  });
});
