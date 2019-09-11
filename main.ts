import * as fs from "fs";
import * as moment from 'moment'
import _ = require("lodash");
import { OnDisconnectRequest, OnChatDisconnect, OnChatSendOpResponse, OnChatSendKickUserResponse, OnChatSendUnbanUserResponse, OnChatSendBanUserResponse, OnChatSendEmoteResponse, OnChatSendMessageResponse, OnChatSendWhisperResponse, OnUserLeaveEvent, OnAuthResponse, OnChatConnectResponse, OnChatConnect, OnMessageEvent, OnUserUpdateEvent, SendWhisperMessage, SendEmoteMessage, SendOpMessage, SendDisconnectMessage, SendBanMessage, SendUnbanMessage, SendKickMessage } from "./bnetcontrol";
import { $GetUserID, NotificationMessage, $GetUserIDsRegex, OnSelfMessage, ClearUsers } from "./functions";
import WebSocket = require("ws");

const config = require("./config.json");

let args = process.argv.slice(2);

if (!args.length || !Object.keys(config).includes(args[0])){
    console.log('Invalid user. Available: ' + Object.keys(config).join(', '));
    process.exit(1);
}

let botKey = args[0];

function getConfig(){
    return config[botKey];
}


// const config_db = require("./db.json");
// const mysql = require('mysql');

// let con = mysql.createConnection({
//     host: config_db.database..host,
//     user: config_db.database..username,
//     password: config_db.database..password,
//     database: config_db.database..database
// });

//con.connect(function(err) {
//    if (err) {
//        console.log(err);
//    }else{
//        console.log("Connected!");
//    }
//});

// function query(sql, params, func){
//     return con.query(sql, params, function (err, result) {
//         if (err) {
//             console.log(err);
//         }else{
//             func(result);
//         }
//     });
// }





export let botConfig = loadData() || {};
export let botQuotes = loadQuotes() || {};

[/*'exit', */'SIGINT', 'SIGUSR1', 'SIGUSR2', 'SIGTERM'].forEach((eventType: NodeJS.Signals) => {
    process.on(eventType, () => {
        console.log('Exit triggered by: ' + eventType);
        saveData();
        process.exit(1);
    });
});


if (!fs.existsSync('./data/')){
    fs.mkdirSync('./data/');
}

if (!fs.existsSync('./data/' + botKey)){
    fs.mkdirSync('./data/' + botKey);
}

let stream = fs.createWriteStream("./data/" + botKey + "/log.txt", {flags:'a'});

export function doLog(data){
    if (data == '[object Object]'){
        data = JSON.stringify(data);
    }

    console.log(moment().format('YYYY-MM-DD HH:mm:ss') + ' ' + data);
    stream.write(moment().format('YYYY-MM-DD HH:mm:ss') + ' ' + data + "\n");
}

function saveData(){
    writeFile("./data/" + botKey + "/state.json", botConfig);
    console.log("The file was saved!");
}

function loadData(){
    let result = readFile("./data/" + botKey + "/state.json");

    if (result !== null){
        console.log("The file was loaded!")
    }

    return result;
}

function loadQuotes(){
    return readFile("./data/" + botKey + "/quotes.json")
}

function addQuote(quote, username){
    if (!botQuotes['quotes']){
        botQuotes['quotes'] = []
    }

    botQuotes['quotes'].push({'quote': quote, username: username, date: moment()});
    writeFile("./data/" + botKey + "/quotes.json", botQuotes);
}

function writeFile(file, data){
    fs.writeFileSync(file, JSON.stringify(data));
    return true;
}

function readFile(file){
    if (fs.existsSync(file)){
        let data = fs.readFileSync(file);

        if (data.length){
            return JSON.parse(data.toString());
        }
    }

    return null;
}

export function isOptionEnabled(opt){
    return botConfig['options'] && botConfig['options'][opt] === true;
}



let wsUri = "wss://37.244.28.110/v1/rpc/chat";
let wsProto = "json";
let apiKey = getConfig()['key'];
let output: any;
let lastRequestId = 0;
let connected = false;
export let loggedonname = false;
export let loggedname = "";
export let endofuserlisting = false;
export let $users = {};

export const nextRequestId = () => {
    return lastRequestId++
}

export const setLoggedName = (v: string) => {
    loggedname = v
}

export const setLoggedOnName = (v: boolean) => {
    loggedonname = v
}

export const setEndOfUserListening = (v: boolean) => {
    endofuserlisting = v
}

let messageHandlers = {
    "Botapichat.DisconnectResponse": OnDisconnectRequest,
    "Botapichat.DisconnectEventRequest": OnChatDisconnect,
    "Botapichat.SendSetModeratorResponse": OnChatSendOpResponse,
    "Botapichat.KickUserResponse": OnChatSendKickUserResponse,
    "Botapichat.UnbanUserResponse": OnChatSendUnbanUserResponse,
    "Botapichat.BanUserResponse": OnChatSendBanUserResponse,
    "Botapichat.SendEmoteResponse": OnChatSendEmoteResponse,
    "Botapichat.SendMessageResponse": OnChatSendMessageResponse,
    "Botapichat.SendWhisperResponse": OnChatSendWhisperResponse,
    "Botapichat.UserLeaveEventRequest": OnUserLeaveEvent,
    "Botapiauth.AuthenticateResponse": OnAuthResponse,
    "Botapichat.ConnectResponse": OnChatConnectResponse,
    "Botapichat.ConnectEventRequest": OnChatConnect,
    "Botapichat.MessageEventRequest": OnMessageEvent,
    "Botapichat.UserUpdateEventRequest": OnUserUpdateEvent
};

export function ProcessSendMessage(text) {
    if(text == undefined) { return; } //text is null
    if(text.length < 1) { return; } //no text in the buffer
    let $tempbuffer = "";
    let userid;
    let res = text.split(" ");
    if(res[0].toLowerCase() == "/w" || res[0].toLowerCase() == "/whisper") {
        //0 = command
        if(text.length < res[0].length + 1 || text.length == res[0].length + 1) { return; } //empty whisper command
        $tempbuffer = text.substring(res[0].length + 1);
        //1 = username
        //get id from this name
        userid = $GetUserID(res[1]);
        if(userid == "-1") {
            NotificationMessage('error', 'While you are able to whisper users, they must be in your channel for you to do so (Battle.Net Classic Chat API Cons).');
            return;
        } //non existant/visable user
        if($tempbuffer.length < res[1].length + 1 || $tempbuffer.length == res[1].length + 1) {
            NotificationMessage('error', 'Error: Missing message for intended whispered user.');
            NotificationMessage('error', 'Error: Message can not be blank.');
            return;
        } //no message to be sent
        $tempbuffer = $tempbuffer.substring(res[1].length + 1);

        //whisper message
        SendWhisperMessage(userid,$tempbuffer);
        return;
    }
    if(res[0].toLowerCase() == "/me" || res[0].toLowerCase() == "/emote") {
        if(text.length < res[0].length + 1 || text.length == res[0].length + 1) { return; } //empty command
        $tempbuffer = text.substring(res[0].length + 1);
        SendEmoteMessage($tempbuffer);
        return;
    }

    if(res[0].toLowerCase() == "/op") {
        if(text.length < res[0].length + 1 || text.length == res[0].length + 1) { return; } //empty command
        $tempbuffer = text.substring(res[0].length + 1);
        userid = $GetUserID($tempbuffer);
        if(userid == "-1") {
            NotificationMessage('error', 'If you cant see them you cant Op them. (Battle.Net Classic Chat API Cons).');
            return;
        } //non existant/visable user
        SendOpMessage(userid);
        return;
    }
    if(res[0].toLowerCase() == "/disconnect") {
        SendDisconnectMessage();
        return;
    }
    if(res[0].toLowerCase() == "/?" || res[0].toLowerCase() == "/help") {
        NotificationMessage('warning', 'Current Commands allowed at this moment:');
        NotificationMessage('warning', '(/? || /help)');
        NotificationMessage('warning', '(/w || /whisper) username message');
        NotificationMessage('warning', '(/me || /emote) message');
        NotificationMessage('warning', '(/ban) username');
        NotificationMessage('warning', '(/unban) username');
        NotificationMessage('warning', '(/kick) username');
        NotificationMessage('warning', '(/op) username');
        NotificationMessage('warning', '(/disconnect)');
        NotificationMessage('warning', 'Hint: You dont have to hit send, you can also hit enter.');
        return;
    }

    ProcessCommand(text);
    SendTextMessage(text);
}

function ProcessCommand(text) {
    if (text == undefined) {
        return;
    } //text is null
    if (text.length < 1) {
        return;
    } //no text in the buffer
    let $tempbuffer = "";
    let userid;
    let res = text.split(" ");

    if (res[0].toLowerCase() == "/rban") { // regex ban
        if (text.length < res[0].length + 1 || text.length == res[0].length + 1) {
            return;
        } //empty command

        $tempbuffer = text.substring(res[0].length + 1);
        let userids = $GetUserIDsRegex($tempbuffer);
        if (!userids.length) {
            NotificationMessage('error', 'If you cant see them you cant ban them. (Battle.Net Classic Chat API Cons).');
            return;
        } //non existant/visable user

        userids.forEach(function (userid) {
            SendBanMessage(userid);
        });
        return;
    }
    if (res[0].toLowerCase() == "/ban") {
        if (text.length < res[0].length + 1 || text.length == res[0].length + 1) {
            return;
        } //empty command

        $tempbuffer = text.substring(res[0].length + 1);
        userid = $GetUserID($tempbuffer);
        if (userid == "-1") {
            NotificationMessage('error', 'If you cant see them you cant ban them. (Battle.Net Classic Chat API Cons).');
            return;
        } //non existant/visable user
        SendBanMessage(userid);
        return;
    }
    if (res[0].toLowerCase() == "/unban") {
        if (text.length < res[0].length + 1 || text.length == res[0].length + 1) {
            return;
        } //empty command

        $tempbuffer = text.substring(res[0].length + 1);
        SendUnbanMessage($tempbuffer);
        return;
    }
    if (res[0].toLowerCase() == "/kick") {
        if (text.length < res[0].length + 1 || text.length == res[0].length + 1) {
            return;
        } //empty command

        $tempbuffer = text.substring(res[0].length + 1);
        userid = $GetUserID($tempbuffer);
        if (userid == "-1") {
            NotificationMessage('error', 'If you cant see them you cant kick them. (Battle.Net Classic Chat API Cons).');
            return;
        } //non existant/visable user
        SendKickMessage(userid);
        return;
    }
    if (res[0].toLowerCase() == "/rkick") { // regex kick
        if (text.length < res[0].length + 1 || text.length == res[0].length + 1) {
            return;
        } //empty command

        $tempbuffer = text.substring(res[0].length + 1);
        let userids = $GetUserIDsRegex($tempbuffer);
        if (!userids.length) {
            NotificationMessage('error', 'If you cant see them you cant kick them. (Battle.Net Classic Chat API Cons).');
            return;
        } //non existant/visable user

        userids.forEach(function (userid) {
            SendKickMessage(userid);
        });
        return;
    }
    if (res[0].toLowerCase() == "/arkick") { // auto regex kick
        if (text.length < res[0].length + 1 || text.length == res[0].length + 1) {
            return;
        } //empty command

        $tempbuffer = text.substring(res[0].length + 1);

        if (!botConfig['arkicklist']) {
            botConfig['arkicklist'] = []
        }

        botConfig['arkicklist'].push($tempbuffer);

        saveData();
        ProcessSendMessage("Added: '" + $tempbuffer + "' to kicklist.");

        let userids = $GetUserIDsRegex($tempbuffer);
        if (!userids.length) {
            NotificationMessage('error', 'If you cant see them you cant kick them. (Battle.Net Classic Chat API Cons).');
            return;
        } //non existant/visable user

        userids.forEach(function (userid) {
            SendKickMessage(userid);
        });
        return;
    }

    if (isOptionEnabled('cmd_nab') && res[0].toLowerCase() == "/nab") {
        ProcessSendMessage("#####            ###              #####                 ########");
        ProcessSendMessage("### ###        ###            ###   ###              ###          ##");
        ProcessSendMessage("###  ###       ###          ###       ###            ###          ##");
        ProcessSendMessage("###    ###     ###        ###           ###          ########");
        ProcessSendMessage("###      ###   ###      ############       ###          ##");
        ProcessSendMessage("###        ### ###    ###                   ###      ###          ##");
        ProcessSendMessage("###          #####    ###                       ###   ########");

        return;
    }
	
	if (isOptionEnabled('cmd_gay') && res[0].toLowerCase() == "/gay") {
        ProcessSendMessage("      #####                  ###            ##             ##");
        ProcessSendMessage("   ##        ##             ##  ##             ##       ##");
        ProcessSendMessage(" ##                          ##       ##             ## ##");
        ProcessSendMessage("##      ####         ########              ##");
        ProcessSendMessage(" ##          ##       ##              ##             ##");
        ProcessSendMessage("    ######       ##                  ##           ##");

        return;
    }
	
	if (isOptionEnabled('cmd_glue') && res[0].toLowerCase() == "/glue") {
        ProcessSendMessage("    ##       ##");
		ProcessSendMessage(" #     #  #     #");
		ProcessSendMessage("#        #        #");
		ProcessSendMessage("  #              #");
		ProcessSendMessage("     #        #");
		ProcessSendMessage("          #");

        return;
    }
	
	
}
function ProcessCommandQuotes(text, username) {
    if (text == undefined) {
        return;
    } //text is null
    if (text.length < 1) {
        return;
    } //no text in the buffer
    let $tempbuffer = "";
    let userid;
    let res = text.split(" ");

    if (res[0].toLowerCase() == "/qu") {
        if (!botQuotes['quotes']){
            return
        }

        let quote = _.sample(botQuotes['quotes'].map((q, k) => {return {k: k+1, quote: q.quote}}));
        ProcessSendMessage("/me " + quote.quote); // + " (" + quote.k + "/" + botQuotes['quotes'].length + ")");
        return;
    }

    if (res[0].toLowerCase() == "/qa") {
        let args = text.substring(res[0].length + 1);

        if (args.trim().length){
            addQuote(args, username);
            ProcessSendMessage("/me Quote added.");
        }

        return;
    }

    // if (res[0].toLowerCase() == "/ql") {
    //     ProcessSendMessage("/me There are " + botQuotes['quotes'].length + " quotes.");
    //
    //     return;
    // }
}

function SendTextMessage(text) {
    let textmessage = {
        "command": "Botapichat.SendMessageRequest",
        "request_id": ++lastRequestId,
        "payload": {
            "message": text,
        }
    };
    OnSelfMessage(loggedname, text);
    doSend(JSON.stringify(textmessage));
}

function init()
{
    testWebSocket();
}

export let websocket;

function testWebSocket()
{
    process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
    websocket = new WebSocket(wsUri, wsProto);
    websocket.onopen = e => { onOpen(e) };
    websocket.onclose = e => { onClose(e) };
    websocket.onmessage = e => { onMessage(e) };
    websocket.onerror = e => { doLog(e) };
}

function onOpen(evt)
{
    connected = true;

    doLog('Connected.');

    let auth = {
        "command": "Botapiauth.AuthenticateRequest",
        "request_id": ++lastRequestId,
        "payload": {
            "api_key": apiKey,
        }
    };
    doSend(JSON.stringify(auth));
}

function onClose(evt)
{
    connected = false;
    loggedonname = false;
    endofuserlisting = false;
    ClearUsers();

    doLog('Disconnected.');

    if (websocket){
        websocket.close();
    }

    websocket = null;

    setTimeout(function (){
        init();
    }, 1000);
}

function onMessage(evt)
{
    let msg = JSON.parse(evt.data);

    let handler = messageHandlers[msg["command"]];

    if (handler) {
        handler(msg["status"], msg["payload"]);
    } else {
        doLog('Recved unknown message: ' + msg["command"]);
        doLog('RESPONSE: ' + evt.data);
    }
}

function onError(evt) {
    doLog(evt);
}

export function doSend(message)
{
    websocket.send(message);
}

export function writeToScreen(message)
{
    doLog(message);
}




function parseMessages(matches, limit){
    if (limit){
        return matches.map((match) => '[' + match.realm + '] ' + match.name + ' (' + match.playersa + '/' + match.playersb + ')').slice(1, limit).join(', ').match(/.{1,128}/g) || [];
    }else{
        return matches.map((match) => '[' + match.realm + '] ' + match.name + ' (' + match.playersa + '/' + match.playersb + ')').join(', ').match(/.{1,128}/g) || [];
    }
}


export function handleChat(username, message){
    if(message.indexOf(getConfig().trigger) !== 0) return;

    const args = message.slice(getConfig().trigger.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    // if (command === 'test'){
    //     query('SELECT value FROM auth_settings WHERE value = ?', args.join(' '), function (result){
    //         ProcessSendMessage('Test: ' + (result[0] || []).value);
    //     });
    // }

    if (getConfig()['root'] && getConfig()['root'].map((r) => r.toLowerCase()).includes(username.toLowerCase())){
        if (command === 'say'){
            ProcessSendMessage(args.join(' '));
        }

        ProcessCommand('/' + command + ' ' + args.join(' '));
    }

    if (getConfig()['quotes'] && getConfig()['quotes'].map((r) => r.toLowerCase()).includes(username.toLowerCase())){
        ProcessCommandQuotes('/' + command + ' ' + args.join(' '), username.toLowerCase());
    }
}


let stdin = process.openStdin();

stdin.addListener("data", function(d) {
    ProcessSendMessage(d.toString().trim());
});


init();
