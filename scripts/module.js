// Differentiate attack/damage rolls
Hooks.on("preCreateChatMessage", (a, b, c) => {
  if(!a || !a.data || !a.data.flags || !a.data.flags.dnd5e || !a.data.flags.dnd5e.roll)
    return;
  if(a.data.flags.dnd5e.roll.type === "attack") {
    var newFlavourHTML = "<span class='atk-flavor-txt'>" + a.data.flavor + "</span>"
    a.data.flavor = newFlavourHTML;
    a.data._source.flavor = newFlavourHTML;
  } 
  else if(a.data.flags.dnd5e.roll.type === "damage") {
    var newFlavourHTML = "<span class='dmg-flavor-txt'>" + a.data.flavor + "</span>"
    a.data.flavor = newFlavourHTML;
    a.data._source.flavor = newFlavourHTML;
  } 
});

/** Rest a user's current Actor event */
function RestUser(e) {
  console.log("RESTUSER", e);
  
  var userId;
  // Get user's id from class (button can't have custom attributes, so we're doing it this way)
  e.currentTarget.classList.forEach( (clas) => {
    if(clas.indexOf("userid-") != -1)
      userId = clas.split("userid-")[1];
  });

  var messageId = e.currentTarget.parentElement.parentElement.parentElement.attributes['data-message-id'].value;
  if(userId) {
    // If Yes button clicked, allow rest and update message saying so (userid- class only exists on Yes button)
    var newDayChecked = e.currentTarget.parentElement.parentElement.querySelector("[name='newDay']")?.checked;
    game.users.map( (usr) => {
      if(usr.id == userId) {
        // Rest the passed user.id -> user
        if(usr.character) {
          usr.character._rest(true, newDayChecked, true);
        }
      }
    });
    var newMessageContent = "<div class=\"secret-gm__block\">"
    + "✔️ Long rest request approved."
    + "</div>"
    + "<div class=\"secret-player__flex ve-muted italic help--hover ve-flex-vh-center\" title=\"Long rest approved!\" >"
    + "✔️ Your long rest request was approved by the GM."
    + "</div>";
    CONFIG.DatabaseBackend.update(ChatMessage, {
      "updates": [
          {
              "content": newMessageContent,
              "_id": messageId
          }
      ],
      "options": {},
      "parent": null,
      "pack": null
    });
  } else {
    // If No button clicked, update message saying so
    var newMessageContent = "<div class=\"secret-gm__block\">"
    + "❌ Long rest request denied."
    + "</div>"
    + "<div class=\"secret-player__flex ve-muted italic help--hover ve-flex-vh-center\" >"
    + "❌ Your long rest request was denied by the GM."
    + "</div>";
    // This only updates locally... Use ChatMessage.updateDocuments() ?
    //ui.chat.updateMessage(newMessage);
    CONFIG.DatabaseBackend.update(ChatMessage, {
      "updates": [
          {
              "content": newMessageContent,
              "_id": messageId
          }
      ],
      "options": {},
      "parent": null,
      "pack": null
    });
  }

}

// Setup chat buttons click
$(document.body).on("click", `.restUserButton`, RestUser);

// Long Rest GM Consent
var _GM;
Hooks.on("renderLongRestDialog", (a, b, c) => {
  console.log("ISAAC", a, b, c);
  if(game.user.isGM)
    return;
  a.data.buttons.rest.callback = () => {
    game.users.map( (usr) => {
      if(usr.isGM) _GM = usr;
    });
    var chatMessageData = {
      "content": "<div class=\"secret-gm__block\">"
        + "Allow " + game.user.name + " [" + game.user.character.name + "] to Long Rest?"
        + "\n\t\t\t\t\t\t\t \n\t\t\t\t\t\t\t"
        + "<button class=\"restUserButton userid-" + game.user.id + "\">Yes</button>"
        + "<button class=\"restUserButton\">No</button>"
        + "</div>"
        + "<div class=\"secret-player__flex ve-muted italic help--hover ve-flex-vh-center\" title=\"Wait for GM's response\">"
        + "Long Rest request for " + game.user.character.name + " sent to GM..."
        + "</div>",
      "blind": true,
      "user": game.user.id,
      "type": 4,
      "whisper": [
        _GM.id
      ]
    };
    ChatMessage.create(chatMessageData, {});
  };
  // " Rest " button text... Overriding the render button label doesn't work since it always runs before the overload (lol)
  document.querySelectorAll("button[data-button='rest'").forEach( (restButton) => {restButton.childNodes[2].data = "Request Rest from GM"} );
});
