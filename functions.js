/* Battle net Web Chat function module */

//Time stamp Chat Window
function $TimeStamp() {
    var d = new Date();
    var $ts = d.toLocaleTimeString();
    if($ts.length != 11)
    {
        return '[0' + $ts + ']';
    } else {
        return '[' + $ts + ']';
    }
}

//Get user id by username
function $GetUserID(username) {
    for(var thisobject in $users) {
        if($users[thisobject]["toon_name"].toLowerCase() == username.toLowerCase()) { return $users[thisobject]["user_id"]; }
    }
    return "-1";
}
function $GetUserIDsRegex(username) {
    var matches = [];

    for(var thisobject in $users) {
        if($users[thisobject]["toon_name"].toLowerCase().match(parseRegex(username))) { matches.push($users[thisobject]["user_id"]); }
    }
    return matches;
}
function ClearUsers() {
    for(var thisobject in $users) {
        delete $users[thisobject];
    }
}
function parseRegex(regex){
    return new RegExp(regex, 'i');
}

//Userlist Icon to use from the .CSS
function $IconIdString(gamestring) {
    if(gamestring == 'STAR') { return "icon-starcraft"; }
    if(gamestring == 'SEXP') { return "icon-broodwars"; }
    if(gamestring == 'CHAT') { return "icon-chat"; }
    if(gamestring == 'D2DV') { return "icon-diablo2"; }
    if(gamestring == 'D2XP') { return "icon-diablo2lod"; }
    if(gamestring == 'DRTL') { return "icon-diablo1"; }
    if(gamestring == 'DSHR') { return "icon-diablo1sw"; }
    if(gamestring == 'JSTR') { return "icon-starcraftj"; }
    if(gamestring == 'W2BN') { return "icon-warcraft2"; }
    if(gamestring == 'WAR3') { return "icon-warcraft3"; }
    if(gamestring == 'W3XP') { return "icon-warcraft3tft"; }
    return "icon-unknowen";
}

//Userlist Flag Icon to use from the .CSS
function $IconFlagIdString(flag) {
    if(flag == 'Moderator') { return "icon-moderator"; }
    NotificationMessage('warning', 'Unknowen/unimplemented flag [' + flag + ']');
    return "icon-unknowen";
}

//Statstring processor, Chat window
function $Statstring(gamestring) {
    if(gamestring == 'STAR') { return "Starcraft"; }
    if(gamestring == 'SEXP') { return "Starcraft Broodwars"; }
    if(gamestring == 'CHAT') { return "Web Chat Client"; }
    if(gamestring == 'D2DV') { return "Diablo 2"; }
    if(gamestring == 'D2XP') { return "Diablo 2 Lords of Destruction"; }
    if(gamestring == 'DRTL') { return "Diablo Retail"; }
    if(gamestring == 'DSHR') { return "Diablo Shareware"; }
    if(gamestring == 'JSTR') { return "Starcraft Japan"; }
    if(gamestring == 'W2BN') { return "Warcraft 2 Battle.net Edition"; }
    if(gamestring == 'WAR3') { return "Warcraft 3 Rein of Chaos"; }
    if(gamestring == 'W3XP') { return "Warcraft 3 The Frozen Throne"; }
    return "Unknown Game Type [" + gamestring + "]";
}

//
function OnEmote(username,message) {
    doLog(username + ': ' + message);
    return;
}

function OnWhisperFrom(username,message) {
    doLog(username + ': ' + message);
    return;
}

function OnWhisperTo(username,message) {
    doLog('>> ' + username + ': ' + message);
    return;
}

function OnChat(username,message) {
    doLog(username + ': ' + message);
    handleChat(username, message);
    return;
}

function OnChannel(channelname) {
    doLog('Joined channel: ' + channelname);
    return;
}

//obtained during inital login
function OnBotName(username) {
    loggedname = username;
    return;
}

//Self message out
function OnSelfMessage(username, message) {
    doLog('>> ' + username + ': ' + message);
    return;
}

//Notification class id to use from the .CSS
function $NotificationMessageType(messagetypestring) {
    if(messagetypestring == 'self') { return "self-message"; }
    if(messagetypestring == '1' || messagetypestring == 'good') { return "good-message"; }
    if(messagetypestring == '2' || messagetypestring == 'warning') { return "warning-message"; }
    if(messagetypestring == '3' || messagetypestring == 'error') { return "bad-message"; }
    if(messagetypestring == 'userinchannel') { return "userinchannel-message"; }
    if(messagetypestring == 'userjoinedchannel') { return "userjoinedchannel-message"; }
    if(messagetypestring == 'userleftchannel') { return "userleftchannel-message"; }
    return "icon-unknowen";
}
function NotificationMessage(messagetype, messageout) {
    doLog(messageout);
}

//Userlisting itself
function AddUser(indexvalue, username, game, flag) {
    return;
}
function UpdateIcon(indexvalue, username, flag) {
    return;
}
function OnUserJoin(indexvalue, username, game) {
    (botConfig['arkicklist'] || []).forEach((kick) => {
        if (username.toLowerCase().match(parseRegex(kick))){
            let userid = $GetUserID(username);

            if(userid == "-1") {
                return;
            }

            SendKickMessage(userid);
            return;
        }
    });

    var $messageout = username+' has joined the channel, on client: ' + $Statstring(game);
    NotificationMessage('userjoinedchannel', $messageout);
    AddUser(indexvalue, username, game, "");
}
function OnUserInChannel(userid, username, gamestring) {
    var $messageout = username + ' is here in the channel. using: ' + $Statstring(gamestring);
    NotificationMessage('userinchannel', $messageout);
    AddUser(userid, username, gamestring, "");
}
function OnUserFlagUpdate(userid, username, flag) {
    UpdateIcon(userid, username, flag);
}

function DoError(verror, command) {
    var $errormessage = "";
    if(verror['area'] == 8 && verror['code'] == 1) {
        $errormessage = ": Not Connected to chat";
    } else if(verror['area'] == 8 && verror['code'] == 2) {
        $errormessage = ": Bad request";
    } else if(verror['area'] == 6 && verror['code'] == 5) {
        $errormessage = ": Request timed out";
    } else if(verror['area'] == 6 && verror['code'] == 8) {
        $errormessage = ": Hit rate limit";
    } else {
        $errormessage = " Unknowen: " + JSON.stringify(verror);
    }
    NotificationMessage('error', command + ' Error' + $errormessage);
}
