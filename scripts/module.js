Hooks.on("preCreateChatMessage", (a, b, c) => {
  console.log("ISAAC", a);

  if(a.data.flags.dnd5e.roll.type === "attack") {
    console.log("%cATK","color:#CCCCCC");
    var newFlavourHTML = "<span class='atk-flavor-txt'>" + a.data.flavor + "</span>"
    a.data.flavor = newFlavourHTML;
    a.data._source.flavor = newFlavourHTML;
  } 
  if(a.data.flags.dnd5e.roll.type === "damage") {
    console.log("%cDMG","color:red");
    var newFlavourHTML = "<span class='dmg-flavor-txt'>" + a.data.flavor + "</span>"
    a.data.flavor = newFlavourHTML;
    a.data._source.flavor = newFlavourHTML;
  } 
});