function MonsterCreator() {
}

MonsterCreator.prototype.initAfterLoad = function() {
  this.refreshRoomAddMonsterSelect();
  this.refreshMonsterEditSelect();
};

MonsterCreator.prototype.saveMonster = function(monster) {
  var monsters = JSON.parse(localStorage.getItem('monsters'));
  if (monsters === null) {
    monsters = [];
  }

  // Check if this monster ID already exists and if so remove it.
  var existing_monster = null;
  for (var mIdx in monsters) {

    existing_monster = monsters[mIdx];
    console.log("removing mIdx=" + mIdx);
    console.log("existing_monster");
    console.log(existing_monster);
    if (existing_monster.id === monster.id) {
      monsters.splice(mIdx, 1);
    }
  }

  console.log(monsters);
  monsters.push (monster);

  localStorage.setItem('monsters', JSON.stringify(monsters));

  this.refreshRoomAddMonsterSelect();
  this.refreshMonsterEditSelect();
  this.loadMonster(monster.id);
};

MonsterCreator.prototype.loadMonster = function(monsterID) {
  console.log("Loading " + monsterID);
  var monsters = JSON.parse(localStorage.getItem('monsters'));
  if (monsters === null) {
    monsters = [];
  }

  var monster = null;
  for (var mIdx in monsters) {
    monster = monsters[mIdx];
    if (monster.id === monsterID) {
      break;
    }
  }

  if (monster === null) {
    alert("Monster " + monsterID + " not found!");
    return;
  }

  $("#monsterID").val(monster.id);
  $("#monsterLevel").val(monster.level);
  $("#monsterShort").val(monster.short);
  $("#monsterLong").val(monster.long);

};

MonsterCreator.prototype.refreshRoomAddMonsterSelect = function() {
  var monsters = JSON.parse(localStorage.getItem('monsters'));
  if (monsters === null) {
    monsters = [];
  }

  $('#roomAddMonster').html("");
  $('#roomAddMonster')
      .append($("<option></option>")
        .attr("disabled",true)
        .text("select a monster"));

  for (var mIdx in monsters) {
    var monster = monsters[mIdx];
    var selected;

    // Select the latest one.
    // Why does this need 2 == and not 3?
    if (mIdx == monsters.length - 1) {
      selected = true;
    } else {
      selected = false;
    }

    $('#roomAddMonster')
        .append($("<option></option>")
          .attr("value",monster.id)
          .attr("selected",selected)
          .text(monster.id + " (" + monster.short + ")"));
  }
};

MonsterCreator.prototype.refreshMonsterEditSelect = function() {
  var monsters = JSON.parse(localStorage.getItem('monsters'));
  if (monsters === null) {
    monsters = [];
  }

  $('#monsterSelectMonster').html("");
  $('#monsterSelectMonster')
      .append($("<option></option>")
        .attr("disabled",true)
        .text("select a monster"));

  for (var mIdx in monsters) {
    var monster = monsters[mIdx];
    var selected;

    $('#monsterSelectMonster')
        .append($("<option></option>")
        .attr("value",monster.id)
        .text(monster.id + " (" + monster.short + ")"));
  }
};
