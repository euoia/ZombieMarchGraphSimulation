function Map(options) {
  // Maximum size of the grid.
  var maxWidth = this.maxWidth = options.maxWidth;
  var maxHeight = this.maxHeight = options.maxHeight;
  var maxRooms = this.maxRooms = options.maxRooms;
  var allowDiagonals = this.allowDiagonals = options.allowDiagonals;
  var pixelsPerTile = this.pixelsPerTile = 35;
  var roomRadius = this.roomRadius = 10;

  this.reversedDirs = {
    north: "south",
    northeast: "southwest",
    east: "west",
    southeast:"northwest",
    south: "north",
    southwest: "northeast",
    west: "east",
    northwest: "southeast"
  };

  this.allowedExits = [
    "north",
    "south",
    "east",
    "west"];

  if (this.allowDiagonals === true) {
    this.allowedExits.push("northeast");
    this.allowedExits.push("southeast");
    this.allowedExits.push("southwest");
    this.allowedExits.push("northwest");
  }


  this.neighbourDirections = [
    {xd: -1, yd: -1, dir: "northwest"},
    {xd: 0, yd: -1, dir: "north"},
    {xd: 1, yd: -1, dir: "northeast"},
    {xd: 1, yd: 0, dir: "east"},
    {xd: 1, yd: 1, dir: "southeast"},
    {xd: 0, yd: 1, dir: "south"},
    {xd: -1, yd: 1, dir: "southwest"},
    {xd: -1, yd: 0, dir: "west"}
  ];
}

Map.prototype.initRoom = function(xPos, yPos) {
    this.grid[xPos][yPos] = {
      x: xPos,
      y: yPos,
      exits: [],
      roomIdx: null
    };
};

Map.prototype.init = function () {
  var middleStart = function (maxWidth, maxHeight) {
    return {
      x: Math.floor(maxWidth / 2),
      y: Math.floor(maxHeight / 2)
    };
  };

  var leftMiddleStart = function (maxWidth, maxHeight) {
    return {
      x: 0,
      y: Math.floor(maxHeight / 2)
    };
  };

  this.pickStart = middleStart;

  this.grid = new Array(this.maxWidth);
  for (var x = 0; x < this.maxWidth; x++) {
    this.grid[x] = new Array(this.maxHeight);
    for (var y = 0; y < this.maxHeight; y++) {
      this.initRoom(x, y);
    }
  }

  this.rooms = [];
  this.selectedRoom = null;
  this.selectedExit = null;
};


Map.prototype.addExitToSelectedRoom = function (exitDir) {
  var newExitDir = exitDir;
  if (newExitDir === "") {
    alert("Must enter an exit direction! E.g. east, southeast, etc...");
    return 1;
  }

  if (this.selectedRoom === null) {
    alert("Select a room first!");
    return 1;
  }

  var newExitPoint = this.getPointFromRoomAndExitDir(this.selectedRoom, newExitDir);
  var newExit = {
    x: newExitPoint.x,
    y: newExitPoint.y,
    dir: newExitDir
  };

  // check whether this grid position has already been assigned.
  if (this.grid[newExitPoint.x][newExitPoint.y].roomIdx === null) {
    console.log('Adding a new room');
    this.grid[newExitPoint.x][newExitPoint.y].roomIdx = this.rooms.length;
    this.rooms.push(this.grid[newExitPoint.x][newExitPoint.y]);
  }

  this.addTwoWayExit(this.selectedRoom, newExit);

  console.log('Added a exit');
  console.log(this.grid);
  this.redrawMap();
};

Map.prototype.addExitToSelectedRoomAndMove = function(direction) {
  this.addExitToSelectedRoom(direction);
  this.moveSelection(direction);
};

Map.prototype.getPointFromRoomAndExitDir = function(room, exitDir) {
  var neighbourDir = null;
  for (var ndx in this.neighbourDirections) {
    if (exitDir === this.neighbourDirections[ndx].dir) {
      neighbourDir = this.neighbourDirections[ndx];
    }
  }

  if (neighbourDir === null) {
    throw new Error ('Exit direction \'' + exitDir + '\' is not valid.');
  }

  // TODO: Check boundaries.
  return {
    x: room.x + neighbourDir.xd,
    y: room.y + neighbourDir.yd
  };

};

Map.prototype.selectRoom = function(room) {
  this.selectedRoom = room;
  $("#roomID").html(room.roomIdx);
  this.redrawMap();
};

Map.prototype.selectExit = function(exit) {
  this.selectedExit = exit;
  this.redrawMap();
};

Map.prototype.moveSelection = function(exitDir) {
  var nextPoint = this.getPointFromRoomAndExitDir(this.selectedRoom, exitDir);

  this.selectRoom(this.rooms[this.grid[nextPoint.x][nextPoint.y].roomIdx]);
};

Map.prototype.createMap = function() {
  var currentPoint = this.pickStart(this.maxWidth, this.maxHeight);

  this.extendMapFromPoint(currentPoint);
};

Map.prototype.addExit = function(room, exit) {
  var roomExit;

  for (var eIdx in room.exits) {
    roomExit = room.exits[eIdx];
    if (exit.x === roomExit.x && exit.y === roomExit.y) {
      // Already had this exit.
      return;
    }
  }

  room.exits.push(exit);
};

Map.prototype.addTwoWayExit = function(room, exit) {
  this.addExit(room, exit);
  this.addExit(this.grid[exit.x][exit.y], {x: room.x, y: room.y, dir: this.reverseDir(exit.dir)});
};

Map.prototype.reverseDir = function(dir) {
  if (this.reversedDirs[dir]) {
    return this.reversedDirs[dir];
  }

  throw new Error("Cannot reverse " + dir + ".");
};

Map.prototype.extendMapFromPoint = function(point) {
  // Check whether this grid position has already been assigned.
  if (this.grid[point.x][point.y].roomIdx === null) {
    this.grid[point.x][point.y].roomIdx = this.rooms.length;
    this.rooms.push(this.grid[point.x][point.y]);
  }

  if (this.maxRooms > 0 && this.rooms.length >= this.maxRooms) {
    return;
  }

  if (point.x === 0 || point.x === this.maxWidth -1) {
    return;
  }

  if (point.y === 0 || point.y === this.maxHeight -1) {
    return;
  }


  var nextPoint = this.pickRandomNeighbour(point);

  console.log('Extending from ' + point.x + ':' + point.y + ' to ' + nextPoint.x + ':' + nextPoint.y + 
             ' (there are now ' + this.rooms.length + ' rooms)');
  this.addTwoWayExit(this.grid[point.x][point.y], {x: nextPoint.x, y: nextPoint.y, dir: nextPoint.dir});

  this.extendMapFromPoint(nextPoint);
};

Map.prototype.pickRandomNeighbour = function(point) {
  var randomNeighbourIndex = Math.floor(random() * this.neighbourDirections.length);
  var randomNeighbour = this.neighbourDirections[randomNeighbourIndex];

  // TODO: This is a bit inefficient.
  while (this.allowedExits.indexOf(randomNeighbour.dir) == -1) {
    randomNeighbourIndex = Math.floor(random() * this.neighbourDirections.length);
    randomNeighbour = this.neighbourDirections[randomNeighbourIndex];
  }


  return {
    x: point.x + randomNeighbour.xd,
    y: point.y + randomNeighbour.yd,
    dir: randomNeighbour.dir
  };
};

// Handle the d3 / svg stuff.
Map.prototype.drawMap = function() {
  var pixelsPerTile = this.pixelsPerTile;
  var svg = this.svg = d3.select("body")
    .append("svg")
    .attr("width", this.maxWidth * this.pixelsPerTile + this.pixelsPerTile)
    .attr("height", this.maxHeight * this.pixelsPerTile + this.pixelsPerTile);

  // Generate the links.
  var links = [];
  var rooms = this.rooms;
  var room, exit;

  for (var rIdx in this.rooms) {
    room = rooms[rIdx];

    for (var eIdx in room.exits) {
      exit = room.exits[eIdx];
      var exitRoomIdx = this.grid[exit.x][exit.y].roomIdx;

      if (exitRoomIdx === null) {
        alert("The exit has no roomIdx! source=" + room.roomIdx + " exitRoomIdx=" + exitRoomIdx);
      }

      links.push({
        source: room.roomIdx,
        target: exitRoomIdx
      });
    }
  }

  // Define the tree params.
  var tree = d3.layout.tree()
    .separation(function(a, b) { return a.parent === b.parent ? 1 : 0.5; })
    .size([this.maxHeight * this.pixelsPerTile, this.maxWidth * this.pixelsPerTile]);

  // Draw the exits.
  var svgLinks = this.svg.selectAll("line")
    .data(links)
    .enter().append("line")
    .style("stroke-width", "5")
    .attr("class", function (e) {
      if (this.selectedExit &&
          this.selectedExit.source === e.source &&
          this.selectedExit.target === e.target
      ) {
        return "selectedExit";
      }

      return "exit";
    }.bind(this))
    .on("click", this.selectExit.bind(this));

  svgLinks
    .attr("x1", function(d) {
        return rooms[d.source].x * pixelsPerTile + pixelsPerTile;
    })
    .attr("y1", function(d) {
      return rooms[d.source].y * pixelsPerTile + pixelsPerTile;
    })
    .attr("x2", function(d) {
      return rooms[d.target].x * pixelsPerTile + pixelsPerTile;
    })
    .attr("y2", function(d) {
      return rooms[d.target].y * pixelsPerTile + pixelsPerTile;
    });

  var grid = this.grid;

  // Draw the rooms.
  var svgRooms = svg.selectAll("g.room")
      .data(rooms)
      .enter()
      .append("svg:g") // svg:g is a group.
      .attr("class","room")
      .attr("transform", function(d) {
        return "translate(" +
          (d.x * pixelsPerTile + pixelsPerTile) + "," +
          (d.y * pixelsPerTile + pixelsPerTile) + ")";
      })
      .on("click", this.selectRoom.bind(this));

  svgRooms
    .append('circle')
    .attr("r", this.roomRadius)
    .attr("class", function (d) {
      if (this.selectedRoom && d.roomIdx === this.selectedRoom.roomIdx) {
        return "selectedRoom";
      }

      return "room";
    }.bind(this))
    .style("stroke-width", "2")
    .style("stroke", "black");

  svgRooms
    .append("svg:text")
    .attr("class", "roomText")
    .text(function(d, i) {
      return d.roomIdx;
    });
};


Map.prototype.redrawMap = function () {
  d3.select("svg").remove();
  this.drawMap();
};

Map.prototype.createAndDrawMap = function () {
  this.init();
  d3.select("svg").remove();
  this.createMap();
  this.redrawMap();
};

Map.prototype.deleteRoomExit = function(room, x, y) {
  for (var i = room.exits.length - 1; i >= 0; i -= 1) {
    var exit = room.exits[i];
    if (exit.x === x && exit.y === y) {
      room.exits.splice(i, 1);
    }
  }
};

Map.prototype.deleteSelectedExit = function() {
  var room1 = this.rooms[this.selectedExit.source];
  var room2 = this.rooms[this.selectedExit.target];

  this.deleteRoomExit(room1, room2.x, room2.y);
  this.deleteRoomExit(room2, room1.x, room1.y);
  this.redrawMap();
};
