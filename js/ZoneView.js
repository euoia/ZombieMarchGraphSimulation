// Handle the d3 / svg suff.
ZoneView = Backbone.View.extend({
  className: 'zoneView',

  initialize: function() {
    this.listenTo(this.model, 'change', this.render);
    this.pixelsPerTile = 26;
    this.roomRadius = 10;
    this.selectedRoom = null;
    this.selectedExit = null;
    this.selectedGrid = null;

    this.grid = [];
    for (var x = 0; x < this.model.get('width'); x += 1) {
      for (var y = 0; y < this.model.get('height'); y += 1) {
        this.grid.push({x: x, y: y});
      }
    }
  },

  render: function() {
    if (this.svg !== undefined) {
      this.svg.remove();
      delete this.svg;
    }

    this.svg = d3.select('body').append('svg');

    var pixelsPerTile = this.pixelsPerTile;
    var width = this.model.get('width') * pixelsPerTile + pixelsPerTile;
    var height = this.model.get('height') * pixelsPerTile + pixelsPerTile;

    // Define the tree params.
    var tree = d3.layout.tree()
      .separation(function(a, b) { return a.parent === b.parent ? 1 : 0.5; })
      .size([width, height]);

    // Draw the grid.
    // Create a group to hold the text and the circle.
    if (this.showGrid === true) {
      this.svg.selectAll('circle')
        .data(this.grid)
        .enter()
        .append('circle') // svg:g is a group.
        .attr('r', this.roomRadius)
        .attr('class', function (grid) {
          if (this.selectedGrid !== null &&
              this.selectedGrid === grid
          ) {
            return 'selectedGrid';
          }

          return 'grid';
        }.bind(this))
        .attr('transform', function(grid) {
          return 'translate(' +
            (grid.x * pixelsPerTile + pixelsPerTile) + ',' +
            (grid.y * pixelsPerTile + pixelsPerTile) + ')';
        })
        .on('click', this.selectGrid.bind(this));
      }

    // Draw the exits.
    var exits = _.flatten(_.map(this.model.get('rooms').pluck('exits'), function (exits) {
      return exits.models;
    }));

    var svgLinks = this.svg.selectAll('line')
      .data(exits)
      .enter().append('line')
      .style('stroke-width', '5')
      .attr('class', function (exit) {
        if (this.selectedExit !== null &&
            this.selectedExit === exit
        ) {
          return 'selectedExit';
        }

        return 'exit';
      }.bind(this))
      .on('click', this.selectExit.bind(this));

    svgLinks
      .attr('x1', function(exit) {
          return this.model.get('rooms').get(exit.get('source')).get('x') * pixelsPerTile + pixelsPerTile;
      }.bind(this))
      .attr('y1', function(exit) {
          return this.model.get('rooms').get(exit.get('source')).get('y') * pixelsPerTile + pixelsPerTile;
      }.bind(this))
      .attr('x2', function(exit) {
          return this.model.get('rooms').get(exit.get('target')).get('x') * pixelsPerTile + pixelsPerTile;
      }.bind(this))
      .attr('y2', function(exit) {
          return this.model.get('rooms').get(exit.get('target')).get('y') * pixelsPerTile + pixelsPerTile;
      }.bind(this));

    var rooms = this.model.get('rooms').models;

    // Draw the rooms.
    // Create a group to hold the text and the circle.
    var svgRooms = this.svg.selectAll('g.room')
      .data(rooms)
      .enter()
      .append('svg:g') // svg:g is a group.
      .attr('class','room')
      .attr('transform', function(room) {
        return 'translate(' +
          (room.get('x') * pixelsPerTile + pixelsPerTile) + ',' +
          (room.get('y') * pixelsPerTile + pixelsPerTile) + ')';
      }.bind(this))
      .on('click', this.selectRoom.bind(this));

    // Create the circle that represents the room.
    svgRooms
      .append('circle')
      .attr('r', this.roomRadius)
      .attr('class', function (room) {
        if (this.selectedRoom !== null &&
            this.selectedRoom.id === room.id
        ) {
          return 'selectedRoom';
        }

        return 'room';
      }.bind(this))
      .style('stroke-width', '2')
      .style('stroke', 'black');

    // Write something inside the room circle.
    svgRooms
      .append('svg:text')
      .attr('class', 'roomText')
      .text(function(room) {
        return room.id;
      });

    if (this.selectedRoom !== null) {
      $('.roomID').html('id:' + this.selectedRoom.get('id') +
                        ' x:' + this.selectedRoom.get('x') +
                        ' y:' + this.selectedRoom.get('y'));
    } else if (this.selectedGrid !== null) {
      $('.roomID').html(' x:' + this.selectedGrid.x +
                        ' y:' + this.selectedGrid.y);
    }
  },

  selectExit: function(exit) {
    this.selectedExit = exit;
    this.selectedRoom = null;
    this.selectedGrid = null;
    this.render();
  },

  selectRoom: function(room) {
    this.selectedRoom = room;
    this.selectedExit = null;
    this.selectedGrid = null;
    this.render();
  },

  selectGrid: function(grid) {
    console.log("select grid");
    this.selectedRoom = null;
    this.selectedExit = null;
    this.selectedGrid = grid;
    this.render();
  }
});
