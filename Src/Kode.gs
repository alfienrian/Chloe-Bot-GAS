// library GAS v2 = 11LhYmqUg8UVtqMg3rPaau5uHwCMtsE_0RwUQim4ZY-OCfDe_YyIYKPSP (new editor)
// library lumpia = 1Yo6vQRwjG5Gl9jeEF0g2tBTUa0XN5MyT4G_HeDpRr9DvabxhRcSdhPNj (new editor)
// library Cheerio = 1ReeQ6WO8kKNxoaA_O0XEQ589cIrRvEBA9qcWpNqdOP17i47u6N9M5Xh0
// Library miniSheetDB = 1wMvpNwIL8fCMS7gN5XKPY7P-w4MmKT9yt_g2eXDGBtDErOIPq2vcNxIN (new editor)

// Isi token bot dari Botfather
const token = '12345678:AABBCCDDEEFFGG0_129492'
const bot = new lumpia.init(token);

//bot.options.log_id = -100114780665
bot.options.prefix_command = '!/'

function doPost(e) {

  bot.doPost(e);
}

/// --------------- ISI SEMUA VARIABEL INI ---------------

// Database Spreadsheet
// contoh : https://docs.google.com/spreadsheets/d/ABCDFGHIJKL1234567890 --> ssid1 = ABCDFGHIJKL1234567890
const ssid1 = 'ID_SPREADSHEET_KAMU';

const usernamebot = ''; // misal: var usernamebot = 'gedebugbot';
const usernameSudo = ''
const useridbot = 12345678;     // variable penampung user id bot
const debugChatId = -1001234567;   // chat id grup yang digunakan sebagai debugging bot
const punyaAkses = []  // User id atau grup yang ingin ditambahkan sebagai sudo
const gdriveFolderId = "ID_FOLDER_GDRIVE" // ID folder Google Drive untuk menyimpan form
const webhookUrl = "URL_HASIL_DEPLOY_WEBAPPS" // taruh link webhook disini

/// --------------- BATAS AKHIR ---------------


function getMe() {
  let result = bot.telegram.getMe();
  Logger.log(result);
}

function setWebHook() {
  let result = bot.telegram.setWebhook(webhookUrl);
  Logger.log(result);
}

function deleteWebHook() {
  let result = bot.telegram.deleteWebhook();
  Logger.log(result);
}

function getWebHook() {
  let result = bot.tg.getWebhookInfo();
  Logger.log(result);
}

function getFileLink(file_id) {
  let file = bot.telegram.getFile(file_id);
  let fileUrl = "https://api.telegram.org/file/bot" + token + "/" + file.result.file_path
  return fileUrl

}

function waktuSekarang(user_name) {
  let pagi = `Selamat pagi ${user_name} 🌅`;
  let siang = `Selamat siang ${user_name} ☀️`;
  let sore = `Selamat sore ${user_name} 🌆`;
  let malam = `Selamat malam ${user_name} 🌙`;

  let date = new Date();
  var jam = Utilities.formatDate(date, "GMT+7", "HH");
  if (jam >= 5 && jam < 9) {
    return pagi;
  }
  else if (jam >= 9 && jam < 15) {
    return siang;
  }
  else if (jam >= 15 && jam < 19) {
    return sore;
  } else {
    return malam;
  }
}

function waktuHariIni() {
  const hari = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"]
  let date = new Date()
  let hariIni = hari[date.getDay()]
  var jam = Utilities.formatDate(date, "GMT+7", 'dd MMMM yyyy');
  console.log(hariIni)
  return hariIni + ", " + jam + ' WIB'
}

function waktuHariIniForm() {
  const hari = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"]
  let date = new Date()
  let hariIni = hari[date.getDay()]
  var jam = Utilities.formatDate(date, "GMT+7", 'dd MMMM yyyy HH:mm:ss');
  return hariIni + ", " + jam + ' WIB' 
}

function diizinkan(id) {
    if (punyaAkses.indexOf(id) > -1) {
        return true;
    } else {
        return false;
    }          
}

function errorSend(chat_id, errmsg) {
  const errorMsg = "Ups, saya mengalami error 😓\n" +
                   "Coba ketik /start lalu coba lagi, jika masih bermasalah silahkan kontak " + usernameSudo

  bot.tg.sendMessage(chat_id, errorMsg);
  bot.tg.sendMessage(debugChatId, errmsg);
}

// fungsi untuk mengecek user admin di Grup
function adminCheck(chat_id, user_id) {
  let admin = bot.telegram.getChatMember(chat_id, user_id);
  let result = admin.result;
  if (result.status == "administrator" || result.status == "creator") {
    return true;
  } else {
    return false;
  }
}
