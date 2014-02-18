function CodeGenerator() {
}

CodeGenerator.prototype.generateFromMap = function(map, areaName, zonePrefix) {
  var rooms = map.rooms;

  var output = '';

  // TODO: switch on room ID.
  output += 'makezone ' + areaName + ' ' + zonePrefix + '\n';
  output += '#include <ansi.h>\n';
  output += '#include <mudlib.h>\n';
  output += '\n';
  output += 'inherit ZONE;\n';
  output += '\n';

  // Zone reset function.
  output += 'void reset(status arg) {\n';
  output += '    set_num_rooms(' + rooms.length + ');\n';
  output += '    set_area_name("' + areaName + '");\n';
  output += '    set_zone_prefix("' + zonePrefix + '");\n';
  output += '    ::reset();\n';
  output += '}\n';

  // Reset room function, each room in the zone calls this when it resets.
  output += 'void reset_room(object room, status arg) {\n';
  output += '    switch (room->query_room_id()) {\n';
  for (var rIdx = 0; rIdx < rooms.length; rIdx += 1) {
    var room = rooms[rIdx];
    output += '        case ' + rIdx + ':\n';

    for (var exitIdx = 0; exitIdx < room.exits.length; exitIdx += 1) {
      var exit = room.exits[exitIdx];
      output += '            room->add_exit(get_area_path() + "/' + zonePrefix + '-' + map.grid[exit.x][exit.y].roomIdx + '.c", "' + exit.dir + '");\n';
    }

    output += '            break;\n';
  }

  output += '    }\n';
  output += '}\n';

  output += '**\n'; // End of "paste area code"

  $('#generatedCode').val(output);
};

