Zone = Backbone.Model.extend({
  defaults: {
    width: 20,
    height: 20,
    maxRooms: 5,
    allowDiagonals: true
  },

  initialize: function() {
    this.nextRoomID = 0;
    this.set({rooms: new RoomCollection()});
  },

  generateRandomMap: function() {
    var randomIntBetween = function(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }.bind(this);

    var extendMapRandomlyToEdgeFrom = function (previousRoom, x, y) {
      var room = this.get('rooms').findWhere({x: x, y: y});

      // Check whether this grid position has already been assigned.
      if (room === undefined) {
        room = new Room({id: this.nextRoomID, x: x, y: y});
        this.nextRoomID += 1;
        this.get('rooms').add(room);
      }

      // Create the exit.
      previousRoom.addExit({source: previousRoom.id, target: room.id});

      // Reached maximum room limit.
      if (this.get('maxRooms') !== null && this.get('rooms').length >= this.get('maxRooms')) {
        return;
      }

      // Hit an edge.
      if (x === 0 || x === this.get('width') -1 ||
        y === 0 || y === this.get('height') -1
      ) {
        return;
      }

      // TODO: Restrict diagonals perhaps.
      var nextX = x + randomIntBetween(-1, 1);
      var nextY = y + randomIntBetween(-1, 1);

      // TODO: Using this.nextRoomID is a bit of a hack!
      extendMapRandomlyToEdgeFrom(room, nextX, nextY);
    }.bind(this);

    // There has to be a better way than this repeated code.
    var startPoint = pickLocation.middle(this.get('width'), this.get('height'));
    var room = new Room({id: this.nextRoomID, x: startPoint.x, y: startPoint.y});
    this.nextRoomID += 1;

    var nextX = startPoint.x + randomIntBetween(-1, 1);
    var nextY = startPoint.y + randomIntBetween(-1, 1);
    extendMapRandomlyToEdgeFrom(room, nextX, nextY);

    // Trigger the change event manually since the changes to rooms are not picked up.
    this.trigger('change');
  },
  addExitToRoom: function(room, offset) {
    var x = room.get('x') + offset.xd,
      y = room.get('y') + offset.yd;

    var nextRoom = this.get('rooms').findWhere({
      x: x,
      y: y
    });

    // Check whether this grid position has already been assigned.
    if (nextRoom === undefined) {
      nextRoom = new Room({id: this.nextRoomID, x: x, y: y});
      this.nextRoomID += 1;
      this.get('rooms').add(nextRoom);
    }

    var exit = room.get('exits').findWhere({
      source: room.get('id'),
      target: nextRoom.get('id')
    });

    if (exit === undefined) {
      room.addExit({source: room.get('id'), target: nextRoom.get('id')});
    }

    return nextRoom;
  },
  deleteExit: function(exit) {
    this.get('rooms').get(exit.get('source')).get('exits').remove(exit);
    this.trigger('change');
  },
  deleteRoom: function(roomToDelete) {
    // Delete any exits referencing this room. Ouch.
    this.get('rooms').forEach(function (room) {
      var exitsToRemove = room.get('exits').findWhere({target: roomToDelete.get('id')});
      room.get('exits').remove(exitsToRemove);
    });

    this.get('rooms').remove(roomToDelete);
    this.trigger('change');
  }
});
