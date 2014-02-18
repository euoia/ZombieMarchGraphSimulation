directions = {};
directions.toGrid = function(direction) {
  var neighbourDirections = {
    northwest       : {xd: -1, yd: -1},
    north           : {xd: 0, yd: -1},
    northeast       : {xd: 1, yd: -1},
    east            : {xd: 1, yd: 0},
    southeast       : {xd: 1, yd: 1},
    south           : {xd: 0, yd: 1},
    southwest       : {xd: -1, yd: 1},
    west            : {xd: -1, yd: 0}
  };

  return neighbourDirections[direction];
};
