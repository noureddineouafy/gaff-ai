import moment from 'moment-timezone'

let handler = async (m, { conn, usedPrefix }) => {
    let d = new Date()
    let time = moment().tz('Africa/Casablanca').format('HH:mm:ss')
    let date = d.toLocaleDateString('ar-MA', { day: '2-digit', month: 'long', year: 'numeric' })
    
    const bgImage = 'https://files.catbox.moe/i8ntv0.jpg'

    let tags = {
        'downloade': '⬇️ downloade Commnds',
        'download': '⬇️ downloade Commnds',
        'ai': '🤖 AI Commnds',
        'sticker': '🎭 Sticker Commnds', 
        'group': '👥 Group Commnds',
        'owner': '👑 Owner Commnds',
        'main': '📜 Main Commnds',
        'game': '🎮 Game Commnds',
        'info': 'ℹ️ Info Commnds',
        'tool': '🛠️ Tools Commnds',
        'uploader': '📤 Uploader Commnds',
        'editor': '🎨 Editor Commnds',
    }

    let help = Object.values(global.plugins).filter(plugin => !plugin.disabled && plugin.help && plugin.tags)
    
    let totalCmds = help.reduce((acc, cur) => acc + (Array.isArray(cur.help) ? cur.help.length : 1), 0)
    
    let menu = `╭─━─━─━─━─━─━─━─━─━─━╮\n`
    menu += `│ < All Commnds /> │\n`
    menu += `╰─━─━─━─━─━─━─━─━─━─━╯\n\n`
    
    menu += `📆 Date : ${date}\n`
    menu += `⏰ Time : ${time} WAT\n`
    menu += `📊 Total : ${totalCmds} Commands | ${Object.keys(tags).length} Categories\n`
    menu += `╰──────────────────╯\n\n`

    // 1. جمع الأوامر العادي بالتاغ
    for (let tag in tags) {
        let commands = help.filter(v => {
            let pluginTags = Array.isArray(v.tags) ? v.tags : [v.tags]
            return pluginTags.includes(tag)
        })
        
        if (commands.length === 0) continue;

        menu += `╭─ ${tags[tag]} ─╮\n`
        for (let plugin of commands) {
            let cmds = Array.isArray(plugin.help) ? plugin.help : [plugin.help]
            for (let cmd of cmds) {
                menu += `│ □ /${cmd}\n`
            }
        }
        menu += `╰──────────────────╯\n\n`
    }

    // 2. المهم: زيد الميزات يدويا إلا مابانوش 👇👇
    menu += `╭─ 🛠️ Tools Commnds ─╮\n`
    menu += `│ □ /fakechat\n`
    menu += `│ □ /fetch\n`
    menu += `│ □ /get\n`
    menu += `│ □ /hd\n`
    menu += `│ □ /landsat\n`
    menu += `│ □ /qrcode\n`
    menu += `│ □ /quoted\n`
    menu += `│ □ /rvo\n`
    menu += `│ □ /ssweb\n`
    menu += `╰──────────────────╯\n\n`

    menu += `╭─ ℹ️ Info Commnds ─╮\n`
    menu += `│ □ /dashboard\n`
    menu += `│ □ /owner\n`
    menu += `│ □ /ping\n`
    menu += `│ □ /register\n`
    menu += `│ □ /totalfeatures\n`
    menu += `│ □ /totaluser\n`
    menu += `│ □ /unregister\n`
    menu += `╰──────────────────╯\n\n`

    menu += `╭─━─━─━─━─━─━─━─━─━─━╮\n`
    menu += `│   Bot By : YourName   │\n`
    menu += `╰─━─━─━─━─━─━─━─━─━─━╯`

    await conn.sendMessage(m.chat, {
        image: { url: bgImage },
        caption: menu,
        mentions: [m.sender]
    }, { quoted: m })
}

handler.help = ['menu']
handler.tags = ['main']
handler.command = /^(menu|\.)$/i
handler.exp = 3

export default handler
