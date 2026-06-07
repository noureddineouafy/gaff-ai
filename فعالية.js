```js
// index.js
const { default: makeWASocket, useSingleFileAuthState, fetchLatestBaileysVersion, DisconnectReason } = require('@adiwajshing/baileys');
const { state, saveState } = useSingleFileAuthState('./auth_info.json');
const qrcode = require('qrcode-terminal');

(async () => {
  const { version, isLatest } = await fetchLatestBaileysVersion();
  const sock = makeWASocket({
    version,
    auth: state,
    printQRInTerminal: true
  });

  sock.ev.on('creds.update', saveState);

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;
    if (qr) qrcode.generate(qr, { small: true });
    if (connection === 'close') {
      const code = lastDisconnect?.error?.output?.statusCode;
      if (code !== DisconnectReason.loggedOut) start(); // reconnect
    }
    if (connection === 'open') console.log('✅ Connected');
  });

  // قائمة أسماء أنمي (ضيف أو عدّل كما تحب)
  const names = [
    "إيتاتشي",
    "ناروتو",
    "لوفي",
    "ساسكي",
    "ميكاسا",
    "غوكو",
    "لذا" // أضف المزيد
  ];

  // حالة اللعبة لكل مجموعة
  const games = {}; // { [chatId]: { running: bool, currentName: string, timeout: Timeout, points: Map } }

  function pickName() {
    return names[Math.floor(Math.random() * names.length)];
  }

  async function sendText(jid, text, mentions=[]) {
    await sock.sendMessage(jid, { text, mentions });
  }

  sock.ev.on('messages.upsert', async (m) => {
    if (!m.messages) return;
    for (const msg of m.messages) {
      if (!msg.message || msg.key.fromMe) continue;
      const jid = msg.key.remoteJid;
      if (!jid || !jid.endsWith('@g.us')) continue; // فقط مجموعات
      const sender = msg.key.participant || msg.key.remoteJid;
      const text = (msg.message.conversation || msg.message.extendedTextMessage?.text || '').trim();
      if (!text) continue;

      // أوامر
      if (text === '.فعالية الكتابة') {
        if (!games[jid]) games[jid] = { running: false, currentName: null, timeout: null, points: new Map() };
        if (games[jid].running) {
          await sendText(jid, 'فيه فعالية شغالة بالفعل ✅');
          continue;
        }
        games[jid].running = true;
        games[jid].points = games[jid].points || new Map();
        // بدء أول جولة
        startRound(jid);
        continue;
      }

      if (text === '.وقف اللعبة') {
        if (!games[jid] || !games[jid].running) {
          await sendText(jid, 'ما في لعبة شغالة حاليا.');
          continue;
        }
        // إيقاف
        clearTimeout(games[jid].timeout);
        games[jid].running = false;
        games[jid].currentName = null;
        await sendText(jid, '🔴 تم إيقاف اللعبة.');
        continue;
      }

      // معالجة إجابات خلال الجولة
      const g = games[jid];
      if (g && g.running && g.currentName) {
        // مقارنة نصية: نأخذ المطابقة بدون حساسية لحروف المسافات الصغيرة
        if (text === g.currentName) {
          // فائز
          clearTimeout(g.timeout);
          const winnerJid = sender;
          // تحديث نقاط
          const prev = g.points.get(winnerJid) || 0;
          g.points.set(winnerJid, prev + 3000); // 3K نقاط
          // صيغة المنشن المطلوبة
          const mentionTag = '@' + winnerJid.split('@')[0];
          const winMsg = `*🏆 ${mentionTag} فائز 🎉*`;
          const prizeMsg = `*الجائزه 🎊 3K 📩*`;
          await sendText(jid, `${winMsg}\n${prizeMsg}`, [winnerJid]);
          // فوراً جولة جديدة إذا اللعبة ما توقفت
          if (g.running) {
            // تأخير بسيط 800ms قبل الكلمة التالية لإعطاء وقت للرسائل
            setTimeout(() => startRound(jid), 800);
          }
        }
      }
    }
  });

  async function startRound(jid) {
