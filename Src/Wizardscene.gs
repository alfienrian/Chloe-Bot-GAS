const { Scene, Stage } = WizardDua;

// create new session
const session = new Scene(
  "session_one",// id to define the session you can fill with anything 
  // step handle 
  (ctx) => {
    ctx.data = {} // create temp database
    ctx.replyIt("Masukkan judul form...")
    return ctx.wizard.next()
  },
  (ctx) => {
    if (!ctx.message.text) {
      return ctx.replyIt("Mohon masukkan teks untuk judul form...")
    } else if (ctx.message.text == "/batal") {
      ctx.replyIt("Buat absen telah dibatalkan...")
      return ctx.wizard.leave()
    } else if (ctx.message.text.length > 100) {
      return ctx.replyIt("Judul yang dibuat terlalu panjang! silahkan coba lagi...")
    } else {
      ctx.data.judul = ctx.message.text.replace(/(^\w)|(\s+\w)/g, letter => letter.toUpperCase());
      ctx.replyIt("Masukkan deskripsi form....\n ketik /skip untuk melewati")
      return ctx.wizard.next()
    }
  },
  (ctx) => {
    try {
    if (!ctx.message.text) {
      return ctx.replyIt("Mohon masukkan teks untuk deskripsi form...")
    } else if (ctx.message.text == "/skip" || ctx.message.text.length < 500) {
      const dbForm = db.key(ctx.from.id)
      db.setValues(`D${dbForm.row}:E${dbForm.row}`, [[ctx.data.judul, ctx.message.text]])

      ctx.replyIt("Pilih opsi pertanyaan yang kamu inginkan...", { reply_markup: markup.inlineKeyboard(formKeyboard()) })
      return ctx.wizard.leave()
    } else {
      ctx.reply("Gagal membuat Google Form harap hubungi " + usernameSudo)
      //buatAbsenForm(ctx.data.judul, ctx.from.id, ctx.message.text, formKeyboard);
      return ctx.wizard.leave()
      }
    } catch (e) {
      errorSend(ctx.chat.id, String(e))
    }
  }
)


// const session_two = new Scene(
//   "session_two",
//   (ctx) => {
    
    
//     ctx.wizard.leave();
//   },
// )

// create new stage. you can fill with multiple stage. 
const stage = new Stage([session])

// use stage as middleware. 
bot.use(stage.middleware())

// if user send /buatform bot will running the current stage. 
bot.cmd("buatform", (ctx) => {
  try {
    const dbForm = db.key(ctx.from.id)
    const namaUser = ctx.from.last_name ? ctx.from.first_name + " " + ctx.from.last_name : ctx.from.first_name;

    if (dbForm.data[1] != namaUser) 
      db.setValue(`B${dbForm.row}`, namaUser)

    switch (dbForm.data[2]) {
      case false:
        stage.enter("session_one");
        break;
      default:
        ctx.replyIt("Kamu sudah membuat absen! ketik /status untuk melihat absen yang aktif")
        break;
      }
    } catch (err) {
      errorSend(ctx.chat.id, err)
  }
})
