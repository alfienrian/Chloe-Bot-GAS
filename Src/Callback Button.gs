bot.action(/((?:email|short|date|multi)Answer)\:(true|false)\:([^\d]+)\:(\d)/, async ctx => {
  const cb = ctx.callbackQuery;
  try {
    const dataForm = cb.message.reply_markup.inline_keyboard;
    const idKey = ctx.match[4];
    const boolForm = ctx.match[2];

    const cbdata = dataForm[idKey][0].callback_data;
    const cbtext = dataForm[idKey][0].text;

    if (cbtext === "Keterangan Hadir ✅") {
      let delText = "Untuk sementara opsi ini harus dinyalakan agar bisa melihat status kehadiran"
      return bot.tg.answerCallbackQuery(cb.id, delText, { show_alert: true })
    }

    switch (boolForm) {
      case "true":
        dataForm[idKey][0].callback_data = cbdata.replace("true", "false");
        dataForm[idKey][0].text = cbtext.replace(/✅/, "❌");
        break;
      case "false":
        dataForm[idKey][0].callback_data = cbdata.replace("false", "true");
        dataForm[idKey][0].text = cbtext.replace(/❌/, "✅");
        break;
    }

    await bot.telegram.editMessageText(cb.message.chat.id, cb.message.message_id, false, cb.message.text,
      { reply_markup: { inline_keyboard: dataForm } })
    await bot.tg.answerCallbackQuery(cb.id)
    // bot.tg.sendMessage(debugChatId, JSON.stringify(cb, false, 1))
  } catch (err) {
    return false
  }

})

bot.action("batal_buatForm", ctx => {
  const cb = ctx.callbackQuery;

  bot.tg.answerCallbackQuery(cb.id)
  bot.telegram.editMessageText(cb.message.chat.id, cb.message.message_id, false, "Pembuatan form dibatalkan...")
})

bot.action("lanjut_buatForm", ctx => {
  const dbForm = db.key(ctx.from.id)
  const cb = ctx.callbackQuery;
  const btnForm = cb.message.reply_markup.inline_keyboard;
  const dataForm = [];

  // convert data dari button ke data lain
  for (i = 0; i < btnForm.length - 1; i++) {
    dataForm.push(btnForm[i][0].callback_data.slice(0, -2).split(":"))
  }

  bot.telegram.editMessageText(cb.message.chat.id, cb.message.message_id, false, "Sedang membuat form... tunggu bentar ya Chloe sedang melakukan magic 💫")
  const hasilForm = buatAbsenForm(dbForm.data[3], ctx.from.id, dbForm.data[4], dataForm);
  bot.telegram.editMessageText(cb.message.chat.id, cb.message.message_id, false, hasilForm)
})

bot.action("del_Form", ctx => {
  const cb = ctx.callbackQuery;
  const dbForm = db.key(cb.from.id)
  const help_key = [];

  help_key[0] = [
    button.text("Iya saya sangat yakin!", "del_confirm")
  ]
  help_key[1] = [
    button.text("Jangan dulu saya belum siap!", "del_cancel")
  ]

  if (dbForm.data[3] == "-") {
    let delText = "Tidak ada absen yang sedang aktif!, silahkan buat form lagi dengan ketik /buatform"
    return bot.tg.answerCallbackQuery(cb.id, delText, { show_alert: true })
  } else {
    let delText = `Apakah kamu yakin ingin menghapus Form "${dbForm.data[3]}"? *Tindakan ini tidak dapat dikembalikan setelah dihapus!*\n\n_Tips : pastikan kamu sudah /export sebelum menghapus Google Form._`

    bot.tg.answerCallbackQuery(cb.id)
    return bot.telegram.editMessageText(cb.message.chat.id, cb.message.message_id, false, delText,
      {
        parse_mode: "markdown",
        reply_markup: markup.inlineKeyboard(help_key)
      })
  }
})


bot.action("del_confirm", ctx => {
  const cb = ctx.callbackQuery;
  const dbForm = db.key(cb.from.id);

  if (dbForm.data[3] != "-") {
    const delText = "Absen Google Form telah dihapus! jika kamu mau bikin form lagi silahkan ketik /buatform lagi ;)"

    db.setValues(`D${dbForm.row}:J${dbForm.row}`, [['-', '-', '-', '-', '-', '-', '-']])
    tutupAbsenForm(dbForm.data[7])
    bot.tg.answerCallbackQuery(cb.id)
    return bot.telegram.editMessageText(cb.message.chat.id, cb.message.message_id, false, delText,
      { parse_mode: "markdown" })
  } else {
    let delText = "Kamu belum membuat absen! Buat absen dengan mengetik /buatform";
    bot.tg.answerCallbackQuery(cb.id, delText, { show_alert: true })
  }
})


bot.action(/(?:(reload_Form)|del_cancel)/, ctx => {
  const cb = ctx.callbackQuery;
  const dbForm = db.key(cb.from.id);
  try {
    const keyboard = []

    if (dbForm.data[2] == true && dbForm.data[3] != "-") {
      let file = FormApp.openById(dbForm.data[7]);
      const dataForm = getAbsen(dbForm.data[7], cb.from.id)

      keyboard[0] = [
        button.text("🔄 Refresh Absen", "reload_Form")
      ];

      keyboard[1] = [
        (file.isAcceptingResponses() === false) ? button.text("🔓 Buka Absen", "buka_form")
                                                : button.text("🔐 Tutup Absen", "kunci_form"),
        button.text("🗑 Hapus Absen", "del_Form")
      ];

      bot.tg.answerCallbackQuery(cb.id, (ctx.match[1]) ? "Form Absen telah di Refresh..." : "")
      return bot.telegram.editMessageText(cb.message.chat.id, cb.message.message_id, false,
        dataForm.replace(/\b0\b/g, "Tidak ada"),
        {
          parse_mode: "html",
          reply_markup: markup.inlineKeyboard(keyboard)
        })
    } else {
      bot.tg.answerCallbackQuery(cb.id)
      return bot.telegram.editMessageText(cb.message.chat.id, cb.message.message_id, false, "Kamu belum membuat absen! Buat absen dengan mengetik /buatform")
    }
  } catch (e) {
    return false
  }
})

bot.action(/(buka|kunci)_form/, ctx => {
  const cb = ctx.callbackQuery;
  const dbForm = db.key(cb.from.id);
  let file = FormApp.openById(dbForm.data[7]);

  // absen terkunci!!!
  ctx.match[1] === "kunci" ? file.setAcceptingResponses(false) : file.setAcceptingResponses(true)

  var keyboard = []

  keyboard[0] = [
    button.text("🔄 Refresh Absen", "reload_Form")
  ];

  keyboard[1] = [
    ctx.match[1] === "kunci" ? button.text("🔓 Buka Absen", "buka_form")
                             : button.text("🔒 Tutup Absen", "kunci_form"),
        button.text("🗑 Hapus Absen", "del_Form")
  ];

  let formText = ctx.match[1] === "kunci"
    ? `Absen telah terkunci! responden sekarang tidak bisa mengisi link form...`
    : `Absen telah terbuka! responden sekarang bisa mengisi link form...`;
  bot.tg.answerCallbackQuery(cb.id, formText, { show_alert: true });
  return bot.telegram.editMessageText(cb.message.chat.id, cb.message.message_id, false, cb.message.text, {reply_markup: markup.inlineKeyboard(keyboard)})
})

bot.action(/save_(pdf|xlsx)/, ctx => {
  const cb = ctx.callbackQuery;
  const dbForm = db.key(cb.from.id);

  if (dbForm.data[2] == true) {
    bot.telegram.editMessageText(cb.message.chat.id, cb.message.message_id, false,
      `_Sedang mengirim file absen dalam format ${ctx.match[1]}..._`,
      { parse_mode: "markdown" })

    let excel = /^http:\/\//.exec(dbForm.data[8])
      ? dbForm.data[8]
      : getFormSpreadSheet(dbForm.data[7], dbForm.data[3], ctx.from.id)

    downloadAbsen(excel, cb.from.id, dbForm.data[3], ctx.match[1])
  } else {
    let delText = "Kamu belum membuat absen! Buat absen dengan mengetik /buatform";
    bot.tg.answerCallbackQuery(cb.id, delText, { show_alert: true })
  }
})
