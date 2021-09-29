const { Client, Intents, MessageEmbed, MessageActionRow, MessageButton} = require("discord.js");
const https = require("https");
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES]});
const Config = require("./Config.json");

client.login(Config.TOKEN);
client.on('ready', () => {
  console.log(`login!!(${client.user.tag})`);
});

client.on('messageCreate', message => {
	if (message.content.startsWith(`${Config.Command} `) && !message.author.bot) {
		const time = new Date();
		const player_text = message.content.split(' ')[1];
		let url = `https://api.mojang.com/users/profiles/minecraft/${player_text}`;
		const req1 = https.request(url, (res1) => {
			res1.on("data", (playerUUID) => {
				message.channel.sendTyping()
				url = `https://api.mojang.com/user/profiles/${JSON.parse(playerUUID).id}/names`
				const req2 = https.request(url, (res2) => {
					res2.on("data", (playerNamesJson) => {
						url = `https://sessionserver.mojang.com/session/minecraft/profile/${JSON.parse(playerUUID).id}`
						const req3 = https.request(url, (res3) => {
							res3.on("data", (playerProfileJson) => {
								const playerProfileJson_base64 = JSON.parse(Buffer.from(JSON.parse(playerProfileJson).properties[0].value, 'base64'));
								console.log(JSON.parse(playerUUID));
								console.log(JSON.parse(playerNamesJson));
								console.log(playerProfileJson_base64);
								let {playerNames,date,playerTimes} = ``;
								for(let loop = 0;loop < JSON.parse(playerNamesJson).length;loop ++){
									if(loop==0){
										playerNames = `${loop+1}. ${JSON.parse(playerNamesJson)[loop].name}`;
										playerTimes = `none`;
									}else{
										date = new Date(Number(JSON.parse(playerNamesJson)[loop].changedToAt));
										playerNames = `${playerNames}\n${loop+1}. ${JSON.parse(playerNamesJson)[loop].name}`;
										playerTimes = `${playerTimes}\n${date.getFullYear()}/${date.getMonth()+1}/${date.getDate()}/${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`
									}
								}
								const minecraft_player_embed = new MessageEmbed()
								.setColor('0xb33737')
								.setTitle(`${JSON.parse(playerProfileJson).name}`)
								.setDescription(`UUID : ${JSON.parse(playerProfileJson).id}`)
								.addFields(
									{ name: `Rename history`, value: `${playerNames}`, inline: true },
									{ name: `Rename time`, value: `${playerTimes}`, inline: true }
								)
								.setThumbnail(`https://www.mc-heads.net/player/${JSON.parse(playerUUID).id}`)
								message.channel.send({ embeds: [minecraft_player_embed], components: [new MessageActionRow().addComponents(new MessageButton().setURL(`${playerProfileJson_base64.textures.SKIN.url}`).setLabel(`SkinTexture`).setStyle(`LINK`))] });
							});
						})
						req3.end();
					});
				})
				req2.end();
			})
		});
		req1.end();
	}
});
