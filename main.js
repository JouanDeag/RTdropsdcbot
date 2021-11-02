const Discord = require('discord.js');
const client = new Discord.Client();
var settings = require('./vitals.json'); //Imports settings file.
const fs = require('fs'); //Imports Module for JSON file system handling.
var badwordsArray = require('badwords/array');
var badwordUsers = require('./badwordusers.json');
var guild;
var memberrole;

//When bot is ready, do this:
client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}!`); //Logs client.user.tag and notfies of succesful login.
	console.log(new Date());
	guild = client.guilds.cache.get(settings.guildid);
	memberrole = guild.roles.cache.get(settings.defaultroleid);
	console.log(settings); //Logs setting file for debug.
});

client.on('guildMemberAdd', (guildMember) => {
	guildMember.roles.add(memberrole);
	console.log(`Added role "Member" to ${guildMember.user.username}`);
});

client.on('guildMemberRemove', (guildMember) => {
	console.log(`${guildMember.user.username} has left the server.`);
});

client.on('message', async (message) => {
	var args = message.content.toLowerCase().substring(settings.prefix.length).split(' ');
	var supportchannel = message.guild.channels.cache.find((channel) => channel.name === settings.supportchannelname);
	var modchannel = message.guild.channels.cache.find((channel) => channel.name === settings.modchannelname);

	if (message.author.bot) return; //Ignores messages from bots

	//Checks if badwordfiler is on, then loops through array of bad words and if message contains any of those. Then it deletes it and warns the user.
	if (settings.badwordfilter == true) {
		for (var i = 0; i < badwordsArray.length; i++) {
			if (message.content.includes(badwordsArray[i])) {
				message.delete(); //If message contains any word from the badwords array, delete it.
				message.channel.send(`${message.author} Nope, your message contained a bad word. Stop that!`); //Sends warning message to user
			}
		}
	}

	if (!message.content.startsWith(settings.prefix)) return; //Ignores messages that doesn't start with the prefix.


	//Logging what user ran what command and where
	if (message.member.roles.cache.has(settings.adminroleid)) {
		console.log(
			`Elevated User ${message.author.username} has run the command "${args}" in channel "${message.channel.name}"`); //For elevated users
	}
	else {
		console.log(`User ${message.author.username} has run the command "${args}" in channel "${message.channel.name}"`); //For standard users
	}

	//Commands that can be run without elevated permissions.
	switch (args[0]) {
		case 'ping': //Ping Command
			message.delete(); //Deletes command
			const m = await message.channel.send('Ping?'); //Sends starting message
			m.edit(`:ping_pong: Pong! Latency is **${m.createdTimestamp - message.createdTimestamp}ms**.`).then((msg) => msg.delete({ timeout: 5000 })); //Send API latency back to chat and deletes it after 5 seconds.
			console.log(`API latency is ${m.createdTimestamp - message.createdTimestamp}ms`); //Logs API latency
			break;

		case 'help':
			break;

		default:
			break;
	}

	//Commands that need to be ran with elevated permissions.
	if (message.member.roles.cache.has(settings.adminroleid)) {
		switch (args[0]) {
			case 'createticketarea': //Initilizes support ticket area.
				message.delete(); //Deletes command
				embed = new Discord.MessageEmbed() //Creates embed.
					.setTitle('Create Support Ticket') //Sets embed title.
					.setColor('#8ac5d2') //Sets embed color.
					.addField('Instructions to create a ticket:', 'Just react to this message, as simple as that!'); //Adds a field to the embed.
				supportchannel.send(embed); //Sends the final embed.
				break;

			case 'clearchat': //Command used to clear chat.
				message.channel.bulkDelete(200); //Deletes the last 200 messages.
				message.channel.send('Chat cleared!').then((msg) => msg.delete({ timeout: 5000 })); //Sends a confirmation to be deleted after 5 seconds.
				break;

			case 'createreceipt': //Makes a new receipt to store
				message.delete(); //Deletes command
				if (args[1] == '?') {
					message.channel.send('Usage: !createreceipt *username* *productindex* *amountpaid*').then((msg) => msg.delete({ timeout: 10000 }));
				} else {
					embed = new Discord.MessageEmbed() //Creates embed.
						.setTitle(`Reciept for user: "${args[1]}"`)
						.setColor('#8ac5d2') //Sets embed color.
						.addField(`Bought:`, `"${args[2]}"`)
						.addField(`And Paid:`, `"${args[3]}"`)
						.addField(`Other info:`, `"${getUserInfo(args[1])}"`);
					modchannel.send(embed);
				};

				break;

			case 'elevatedhelp':
				break;

			default:
				break;
		}
	}
});

function getUserInfo(user) {

}

function addUserInfo(message) {

}

function addUser(message) {
	
}

client.login(settings.token);
