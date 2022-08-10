const button = lumpia.button;
const markup = lumpia.markup;


bot.start(ctx => {
  const dbForm = db.key(ctx.from.id)
  const keyboard = [];

  keyboard[0] = [
    button.url("📪 Channel", "t.me/AboutTheSlayer"),
    button.url("🌐 Source Code", "https://github.com/LibreWitch/Chloe-Bot-GAS")
  ];

  try {
  if (dbForm === false) {
    let namaUser = ctx.from.last_name ? ctx.from.first_name + " " + ctx.from.last_name : ctx.from.first_name;
    db.add(ctx.from.id, namaUser, 
          `=AND(ISURL(F${db.last_row + 1}); ISURL(G${db.last_row + 1}))`, '-', '-', '-', '-', '-', '-', '-', '')
  }

  bot.telegram.sendSticker(ctx.chat.id, "CAACAgIAAxkBAAIF1mHBg0Hbqn0RRyui5DG_u2I082zCAAJGZAAC4KOCBxOp6dDgBHP4IwQ")
  ctx.reply(waktuSekarang(ctx.from.first_name) + " " + "\nSalam kenal namaku Chloe, aku akan membantu kamu membuat absen Google Form dengan cepat dan mudah! Jika kamu butuh bantuan ketik /help \n\nDibuat dengan 💙 oleh " + usernameSudo, {reply_markup: markup.inlineKeyboard(keyboard)})
  } catch (err) {
    errorSend(ctx.chat.id. String(err))
  }
})


bot.cmd("ping", ctx => {
  ctx.replyIt("Pong!!");
})


bot.cmd("help", ctx => {
  ctx.reply("Command yang tersedia pada Chloe : \n" +
    "/buatform : Membuat link Google Form.\n" +
    "/status : Melihat rekapan secara langsung.\n" +
    "/export : Donwload absen dalam bentuk file.\n" +
    "/hapusform : Menghapus form yang sudah kamu buat.")
})


bot.cmd("export", ctx => {
  try {
    const dbForm = db.key(ctx.from.id)
    var keyboard = []

    keyboard[0] = [
      button.text("📗 Excel", "save_xlsx"),
      button.text("📕 Pdf", "save_pdf")
    ];

    if (dbForm.data[2] == true) {
     ctx.replyIt("Kamu mau export format form absen dalam bentuk apa?", 
                {reply_markup : markup.inlineKeyboard(keyboard)})
    } else {
      ctx.replyIt("Hadeh.. Buat absen terlebih dahulu sebelum mengexport Absen ke Excel.")
      bot.telegram.sendSticker(ctx.chat.id, 
          "CAACAgIAAxkBAAIF2GHD-L2d3Z6_a-fT7c_uj52QobxnAAJqZAAC4KOCB3i6NoHV0xUnIwQ")
    }
  } catch (err) {
    errorSend(ctx.chat.id,String(err))
  }
})

bot.cmd("status", ctx => {
  try {
    const dbForm = db.key(ctx.from.id)
    var keyboard = []

    if (dbForm.data[2] == true) {
       let file = FormApp.openById(dbForm.data[7]);
       let teks = getAbsen(dbForm.data[7], ctx.from.id)

      keyboard[0] = [
      button.text("🔄 Refresh Absen", "reload_Form")
      ];

      keyboard[1] = [
      (file.isAcceptingResponses() === false) ? button.text("🔓 Buka Absen", "buka_form") 
                                              : button.text("🔐 Tutup Absen", "kunci_form"),
      button.text("🗑 Hapus Absen", "del_Form")
      ];

       ctx.replyIt(teks.replace(/\b0\b/g, "Tidak ada"), 
                  { parse_mode: "html", 
                  reply_markup: markup.inlineKeyboard(keyboard) })
    } else {
      ctx.replyIt("Kamu belum membuat form! Buat absen dengan mengetik /buatform")
    }
  } catch(err) {
    errorSend(ctx.chat.id,String(err))
  }
})

bot.cmd("hapusform", ctx => {
  try {
  const dbForm = db.key(ctx.from.id)
  const help_key = [];

  help_key[0] = [
    button.text("Iya saya sangat yakin!", "del_confirm")
  ]
  help_key[1] = [
    button.text("Jangan dulu saya belum siap!", "del_cancel")
  ]

  const delText = `Apakah kamu yakin ingin menghapus Form "${dbForm.data[3]}"? *Tindakan ini tidak dapat dikembalikan setelah dihapus!*\n\n_Tips : pastikan kamu sudah /export sebelum menghapus Google Form._`

  if (dbForm.data[6] != "-") {
    return ctx.replyIt(delText, { parse_mode: "markdown", reply_markup: markup.inlineKeyboard(help_key) })
  } else {
    ctx.replyIt("Hmmm... saya tidak menemukan absen kamu, mungkin sudah kamu hapus formnya?")
    ctx.replyWithSticker("CAACAgIAAxkBAAIF2mHFi7Bb3KdV37KU_uqP6Vsid66IAAJoZAAC4KOCB7ydW7Imi0tHIwQ")
  }
  } catch(err) {
    errorSend(ctx.chat.id,String(err))
  }
})