const { Client, MessageEmbed, MessageAttachment } = require('discord.js')
const client = new Client()
const config = require('./config.json')
const station = require('./stations.json')
const prefix = config.prefix
const deleteafter = 5000
const cron = require("cron")
const { Canvas } = require("canvacord")


function restart() {
    process.exit();
}

let reset = new cron.CronJob('00 30 03 * * *', restart)


let y = 1
let stacje = ''
while (y < 12) {
    stacja = `${y}, ${station[y].name}`
    stacje = stacje.concat(`**${y}** - ${station[y].name}\n`)
    y++
}
embedStacje = new MessageEmbed()
    .setTitle(`Lista stacji:`)
    .setDescription(stacje)
    .setColor("GREEN")



client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`)
    setInterval(() => {
        client.user.setPresence({
            status: 'available',
            activity: {
                name: `🎶serwery: ${client.guilds.cache.size} | gram dla: ${client.users.cache.size} osób🎶`,
                type: 'LISTENING',
                url: 'https://discord.com'
            }
        })
    }, 120000)

    reset.start()
})


//================================== K O M E N D Y ======================================
client.on('message', async message => {
    const args = message.content.slice(prefix.length).trim().split(/ +/g)

    const logi = client.channels.cache.get(`812374120327020635`)

    if (message.content == `${prefix}stop`) {
        const channel = message.member.voice.channel
        if (channel) {
            await channel.leave()
            const embedS = new MessageEmbed()
                .setTitle(`**${client.user.username}**`)
                .setDescription(`Dziękujemy za słuchanie! 👋 Widzimy się wkrótce 🤪`)
                .setColor("GREEN")
            message.channel.send(embedS).then(msg => {
                msg.delete({ timeout: deleteafter }).catch(error => { console.error(`error: `, error) })
            })
            message.delete({ timeout: deleteafter }).catch(error => { console.error(`error: `, error) })
        } else message.channel.send(`**Musisz być na kanale!**`).then(msg => {
            msg.delete({ timeout: deleteafter }).catch(error => { console.error(`error: `, error) })
        })
    }

    if (message.content.startsWith(`${prefix}slap`)) {
        const user = message.mentions.users.first()
        if (!user) return message.reply("Please mention a user")

        const avatar = user.displayAvatarURL({ format: "png" })

        const slap = await Canvas.slap(message.author.displayAvatarURL({ format: "png" }), avatar)
        message.channel.send(new MessageAttachment(slap, "slap.png")).catch(() => `Przepraszam, ale nie mogłem wysłać tutaj obrazka.`)
    }

    if (message.content == `${prefix}serwcheck`) {
        if (message.author.id !== `329944112386015233`) return
        let serverlist = ''
        client.guilds.cache.forEach(guild => {
            serverlist = serverlist.concat(`**${guild.name}**, lista użytkowników: **${guild.memberCount}**, owner: **${guild.owner}**;\n`)
        })
        const embed = new MessageEmbed()
            .setTitle(`Lista serwerów:`)
            .setDescription(serverlist)
            .setColor("GREEN")
        await message.channel.send(embed).then(msg => {
            msg.delete({ timeout: deleteafter }).catch(error => { console.error(`error: `, error) })
        })
        message.delete()
    }

    if (message.content == `${prefix}addme`) {
        const user = message.author
        user.send(`Witam!👋 Widzę, że chciałbyś mnie dodać na swój serwer! 🤖📻\nPoniżej zostawiam \`link\`, dzięki któremu możesz mnie zaprosić na swój serwer: 😊\nhttps://discord.com/api/oauth2/authorize?client_id=810576235289378836&permissions=8&scope=bot`).catch(() => message.channel.send(`Hej <@${message.author.id}>, niestety nie mogę napisać do Ciebie na wiadomości prywatnej.\nAbym mógł wysłać wiadomość, musisz wejść w:\n\n\`Ustawienia\` => \`Prywatność i bezpieczeństwo\`, a następnie włączyć \`Zezwalaj na wiadomości prywatne od członków serwerów\`.`))

        logi.send(`Użytkownik \`${user.tag}\` podjął próbę dodania mnie na serwer...`)
    }

    if (message.content == `${prefix}serwery`) {
        let serverlist = ''
        const msg = await message.channel.send(`Wczytuję listę serwerów...`)
        client.guilds.cache.forEach(guild => {
            serverlist = serverlist.concat(`**${guild.name}**, lista użytkowników: **${guild.memberCount}**;\n`)
        })
        const embed = new MessageEmbed()
            .setTitle(`Lista serwerów:`)
            .setDescription(serverlist)
            .setColor("GREEN")
        msg.edit(embed)
        msg.edit('\u200b')
    }

    if (message.content == `${prefix}ping`) {
        const msg = await message.channel.send("Pinging...");
        const embed = new MessageEmbed()
            .setTitle("Ping:")
            .setAuthor(`${message.author.username}`, message.author.displayAvatarURL())
            .setDescription(
                `⌛ Latency is ${Math.floor(
                    msg.createdTimestamp - message.createdTimestamp
                )}ms\n⏲️ API Ping is ${Math.round(client.ws.ping)}`
            )
            .setColor('#fb644c');
        msg.edit(embed);
        msg.edit("\u200b");
    }

    if (message.content == `${prefix}restart`) {
        if (message.author.id == '329944112386015233' /* moje id */ || message.author.id == '804374241906524210' /* bot id */ ) {
            await message.channel.send(`Restarting bot...`)
            process.exit();
        } else return message.channel.send(`Nie możesz użyć tej komendy!`)
    }

    if (message.content.startsWith(`${prefix}play`)) {
        let wybor = args.slice(1)
        const channel = message.member.voice.channel
        const bot = client.voice.channel

        if (channel) {
            if (wybor <= 11 && wybor >= 1) {
                var connection = await channel.join()
                await connection.voice.setSelfDeaf(true)
                connection.play(station[wybor].streamurl).setVolumeLogarithmic(1)
                const embedP = new MessageEmbed()
                    .setTitle(`**${station[wybor].name}**`)
                    .setDescription(`🎶 Zapraszamy do słuchania **najlepszej muzyki!!!** 🔊`)
                    .setColor("GREEN")
                message.channel.send(embedP)
                    .then(msg => {
                        msg.delete({ timeout: deleteafter }).catch(error => { console.error(`error: `, error) })
                    })
            } else message.channel.send(embedStacje).then(msg => {
                msg.delete({ timeout: deleteafter }).catch(error => {
                    console.error(`error: `, error);
                    logi.send(`error: ` + error)
                })
            })
        } else message.channel.send(`Musisz być na kanale!`).then(msg => {
            msg.delete({ timeout: deleteafter }).catch(error => { console.error(`error: `, error) })
        })
    }

    if (message.content == `${prefix}stacje`) {
        message.channel.send(embedStacje)

    }

    if (message.content == `test`) {
        const embed = new MessageEmbed()
            .setTitle(`Dzień dobry, 😁`)
            .setDescription(`Dziękuje za dodanie mnie na serwer! ✨
            👋 Na początku się przedstawie, jestem **${client.user.tag}** i zostałem stworzony do grania radia! 🤖🎶\n
    📻 Znajdziesz tu stacje typu: 
    **Radio Party**, **RMF FM**, **Radio Zet** i wiele innych! \n
    
    ❓ Aby zacząć rozrywkę -> zapoznaj się z komendami wpisując: **${prefix}help** ❓\n
    
    **Małe uwagi dotyczące mnie:**\n
    **-** restartuje się co 24h, ponieważ linki streamów radia lubią się zacinać co pare dni 🛠,\n
    **-** nie mam w sobie opcji zostania na jednym kanale, tzn. gdy już jestem na kanale i ktoś na innym kanale mnie wezwie - idę właśnie tam 😥,\n
    **-** z racji tego, że eska ma zmienne linki streamu radia, czasami może nie działać. Staram się to naprawiać na bierząco! 😋.\n
    **-** jeśli bot nie gra muzyki, polecam zatrzymać bota wpisując - ${prefix}stop, po czym można na nowo słuchać muzyki 🤙.\n
    Tyle z uwag ode mnie..\n
 
    P.S.
    W razie problemów proszę pisać do mego twórcy -> **SharixVent#4865**\n
    
    Jeszcze raz dziękuję za dodanie mnie! 💚`)
            .setColor("GREEN")
            .setThumbnail(client.user.displayAvatarURL())
            .setTimestamp()
        message.channel.send(embed)
    }

    if (message.content == `${prefix}help`) {
        const embedH = new MessageEmbed()
            .setTitle(`**${client.user.username}**`)
            .setDescription(`Mało skomplikowany bot, dzięki któremu posłuchasz **Radia** na wybranym kanale!\n **Lista Komend:**\n`)
            .addFields({ name: `**${prefix}help**`, value: '⚙ Tu jesteś 📑', inline: true }, { name: `**${prefix}stacje**`, value: '⚙ Lista stacji 📑', inline: true }, { name: `**${prefix}play**`, value: '📻🔊 Radio gra! 🎶', inline: true }, { name: `**${prefix}stop**`, value: '📻🔈 Radio przestaje grać! 👋', inline: true }, { name: `**${prefix}serwery**`, value: '📑 Pokazuje liste serwerów, na których jest bot! 🤖', inline: true }, { name: `**${prefix}ping**`, value: '📑 Pokazuje ping oraz opóźnienia bota. 🤖', inline: true }, { name: `**${prefix}addme**`, value: '📣 Pozwala na dodanie bota na swój serwer. ✨', inline: true }, { name: `**${prefix}slap**`, value: '😅 Możesz strzelić komuś z liścia. 💪✋', inline: true }, )
            .setColor("GREEN")
            .setFooter(`${client.user.username}`, client.user.displayAvatarURL({ dynamic: true }))
            .setTimestamp()
        message.channel.send(embedH).then(msg => {
            msg.delete({ timeout: deleteafter }).catch(error => { console.error(`error: `, error) })
        })
        message.delete({ timeout: deleteafter }).catch(error => { console.error(`error: `, error) })
    }
})

//======================================= N O W Y   S E R W E R =========================================


//cos tam cos tam

client.login(config.token)