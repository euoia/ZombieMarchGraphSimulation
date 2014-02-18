pickLocation = {};
pickLocation.middle = function (width, height) {
  return {
    x: Math.floor(width / 2),
    y: Math.floor(height / 2)
  };
};

pickLocation.leftMiddle = function (width, height) {
  return {
    x: 0,
    y: Math.floor(height / 2)
  };
};

