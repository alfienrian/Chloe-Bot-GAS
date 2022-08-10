const quoteMsg = [
    'Fokuslah menjadi produktif, bukan sekedar sibuk saja – Tim Ferris',
    'Agama tanpa ilmu pengetahuan adalah buta. Dan ilmu pengetahuan tanpa agama adalah lumpuh.',
    'Wisuda adalah impian setiap mahasiswa. Namun kita perlu berjuang semester demi semester untuk mewujudkannya. Jangan pernah mengeluh.',
    'Mengumpulkan tugas itu adalah suatu keharusan, sedangkan nilai bagus itu hanyalah bonus makanya kalau ada tugas segera dikerjakan.',
    'Masih ada waktu kamu lulus tahun ini, kejarlah, raihlah, dan wujudkan. Dosen pembimbingmu telah menungumu',
    'Baik atau buruknya dosen pembimbing, bukanlah hal yang perlu dipikirkan, terima saja apa adanya karena setiap manusia itu unik.',
    'Cobaan memang datang silih berganti, tapi percayalah hasilnya akan sepadan dengan perjuangan yang kau lakukan.',
    'Jangan pernah meninggalkan meeting zoom saat kuliah ya, kecuali ke toilet.',
    'Selalu berdoa untuk kelancaran dalam menerima materi dari dosen dan segala kegiatan di kampus.',
    'Cara paling mudah untuk menjadi mahasiswa pandai adalah dengan belajar dari hal-hal terbodoh yang pernah kamu lakukan.',
    'Bukan ujian akhir semester nanti yang harus kamu khawatirkan. Akan tetapi ujian hidup yang akan kamu lalui setelah lulus wisuda kelak.',
    'Mahasiswa yang sukses tidak selalu mahasiswa yang pintar. Akan tetapi mahasiswa yang sukses adalah mereka yang selalu gigih dan pantang menyerah',
    '"Beristirahatlah saat kau merasa lelah. Segarkan dan perbarui dirimu, tubuhmu, serta semangatmu. Lalu kembalilah bekerja." - Ralph Marston',
    '"Saya tahu jika saya gagal, saya tidak akan pernah menyesalinya. Tetapi saya tahu satu hal yang mungkin saya sesali adalah, tidak pernah mencobanya." - Jeff Bezos',
    'Uang bisa dicari, ilmu bisa digali. Namun kesempatan untuk membahagiakan orang tua tidak akan terulang kembali',
    'B.A.H.A.G.I.A itu adalah ketika kuliah bareng, ngerjain tugas bareng. Nongkrong bareng. Nikmatilah kebersamaan ini sebelum semuanya berakhir.',
    'Pernah gak kamu suka ngiri dengan orang - orang yang mengisi kekosongan waktunya dengan belajar. Sementara kita sibuk dengan gadget dan kebanyakan nongkrongnya.'
  ]
  
  /**
  * @param {string} judulForm
  * @param {any} user_id
  * @param {undefined[]} dataForm
  */
  function buatAbsenForm(judulForm, user_id, description, dataForm) {
    const dbForm = db.key(user_id)
    const form = new FormApp.create(`${judulForm} (${dbForm.data[1]})`);
  
    // buat judul dan deskripsi form yang dibuat
    form.setDescription(description == "/skip" ? waktuHariIni() : description)
        .setConfirmationMessage('Terima kasih sudah mengisi form.. \n\nQuote:\n' + 
                                lumpia.helper.random(quoteMsg) + 
                                "\n\nForm ini dibuat oleh @SekretarisChloe_bot")
        .setTitle(judulForm)
        .setPublishingSummary(false)
        .setShowLinkToRespondAgain(false)
  
    
    dataForm.forEach(formdata => { 
      switch (formdata[0]) {
        case "emailAnswer":
          if (formdata[1] == "true") {
          form.setCollectEmail(true)
            break;
          }
  
        case "shortAnswer":
          if (formdata[1] == "true") {
          form.addTextItem()
            .setTitle(formdata[2])
            .setRequired(true);
            break;
          }
  
        case "multiAnswer":
          if (formdata[1] == "true") { 
            form.addMultipleChoiceItem()
            .setTitle(formdata[2])
            .setChoiceValues(['Hadir', 'Izin', 'Sakit'])
            .showOtherOption(true)
            .setRequired(true);
            break; 
          }
  
        case "dateAnswer":
         if (formdata[1] == "true") {
          form.addDateItem()
            .setTitle(formdata[2])
            .setRequired(true);
          break;
        }
      }    
    })
  
    let linkForm = form.getPublishedUrl();
    const formShort = form.shortenFormUrl(linkForm)
  
    // memindahkan file gform ke folder lain
    moveAbsenForm(form.getId(), user_id);
  
    db.setValues(`F${dbForm.row}:I${dbForm.row}`, [
      [
        linkForm,                       // link absen yang telah dibuat (link panjang)
        formShort,                      // link pendek Google Form yang dibuat
        form.getId(),                   // Id Google Form
        waktuHariIniForm()              // waktu dibuatnya Google Form
      ]
    ]);
  
    //db.setValue(`J${dbForm.row}`, dbForm.data[9] + 1);
    return "Yayy... Link absen berhasil dibuat! 😎\n\n" +
      "Link absen (panjang) : \n" + linkForm +
      "\n\nLink absen (pendek) : \n" + formShort;
  }
  
  
  function moveAbsenForm(fileAbsenForm, user_id) {
    // ambil data dari database
    const dbForm = db.key(user_id)
  
    // buat folder baru lalu pindahkan di gdrive
    if (!dbForm.data[10]) {
      const folderGd = DriveApp.createFolder(`${dbForm.data[1]} (${dbForm.data[0]})`).getId();
      const chloeFolder = DriveApp.getFolderById(gdriveFolderId);
      const resFolder = DriveApp.getFolderById(folderGd).moveTo(chloeFolder).getId();
  
      // masukkan id folder kedalam database
      db.setValue(`K${dbForm.row}`, resFolder);
  
      // pindahkan file gform ke dalam folder yang sudah dibuat tadi
      const fileGd = DriveApp.getFileById(fileAbsenForm)
      const targetFolder = DriveApp.getFolderById(resFolder)
      let folder = fileGd.moveTo(targetFolder)
      return folder
    } else {
      // pindahkan file gform ke dalam folder yang sudah dibuat tadi
      const fileGd = DriveApp.getFileById(fileAbsenForm)
      const targetFolder = DriveApp.getFolderById(dbForm.data[10])
      let folder = fileGd.moveTo(targetFolder)
      return folder
    }
  }
  
  
  function tutupAbsenForm(formId) {
    let file = FormApp.openById(formId);
    file.setAcceptingResponses(false)
    let fileDrive = DriveApp.getFileById(formId)
    fileDrive.setName(`[Closed] ${fileDrive.getName()}`)
  }
  
  
  function getFormSpreadSheet(formId, judul, user_id) {
    let dbForm = db.key(user_id)
    // Open a form by ID and create a new spreadsheet.
    var form = FormApp.openById(formId);
    var ss = SpreadsheetApp.create(judul);
        
    ss.setSpreadsheetLocale('en')
  
    // Update the form's response destination.
    form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());
    const targetFolder = DriveApp.getFolderById(dbForm.data[10])
    DriveApp.getFileById(ss.getId()).moveTo(targetFolder)
    db.setValue(`J${dbForm.row}`, ss.getUrl())
    return ss.getUrl();
  }
  
  
  function getAbsen(formId, user_id) {
    // mengambil data dari database
    const dbForm = db.key(user_id)
  
    // Open a form by ID and log the responses to each question.
    var form = FormApp.openById(formId);
    var formResponses = form.getResponses();
    const daftarHadir = [];
    const daftarIzin = [];
    for (var i = 0; i < formResponses.length; i++) {
      var formResponse = formResponses[i];
      var itemResponses = formResponse.getItemResponses();
      var itemResponse = itemResponses[3];
      let keterangan = itemResponse.getResponse();
      keterangan.includes("Sakit", "Izin") ? daftarIzin.push(keterangan) : daftarHadir.push(keterangan)
    }
    return `Berikut status rekapan absen kamu :
    🖋 Jumlah yang sudah mengisi : ${formResponses.length}
    👨🏼‍🏫 Responden yang hadir : ${daftarHadir.length}
    😿 Jumlah Responden yang sakit/izin : ${daftarIzin.length}
    📋 Link Gform : ${dbForm.data[6]} (<a href="${dbForm.data[5]}">link asli</a>)`
  }
  
  
  function downloadAbsen(formUrl, user_id, judul, file_format) {
    var spreadSheet = SpreadsheetApp.openByUrl(formUrl);
    var ssID = spreadSheet.getId();
  
    Logger.log(ssID);
  
    var url = "https://docs.google.com/spreadsheets/d/" + ssID + "/export?format=" + file_format;
    var params = { method: "GET", headers: { "authorization": "Bearer " + ScriptApp.getOAuthToken() } };
    var response = UrlFetchApp.fetch(url, params);
    bot.tg.sendDocument(user_id, response.getBlob().setName(`[Jawaban] ${judul}.${file_format}`))
  
    // save to drive
    //DriveApp.createFile(response);
  
  }
  
  function formKeyboard() {
    const help_key = [];
    const choiceSet = [
                {formtype: "emailAnswer", qs: "Email", defaultSet: true},
                {formtype: "shortAnswer", qs: "Nama", defaultSet: true}, 
                {formtype: "shortAnswer", qs: "NIM", defaultSet: true}, 
                {formtype: "dateAnswer", qs: "Tanggal", defaultSet: false}, 
                {formtype: "shortAnswer", qs: "Prodi", defaultSet: true}, 
                {formtype: "shortAnswer", qs: "Kelas", defaultSet: false}, 
                {formtype: "multiAnswer", qs: "Keterangan Hadir", defaultSet: true}
                ];
  
    choiceSet.forEach((formData, i) => {
      if (choiceSet[i].defaultSet == true) {
        help_key.push([button.text(`${choiceSet[i].qs} ✅`, `${choiceSet[i].formtype}:true:${choiceSet[i].qs}:${i}`)])
      } else {
        help_key.push([button.text(`${choiceSet[i].qs} ❌`, `${choiceSet[i].formtype}:false:${choiceSet[i].qs}:${i}`)])
      }
    })
    help_key.push([button.text("Batal", "batal_buatForm"), button.text("Lanjutkan", "lanjut_buatForm")])
  
      return help_key;
  }
  
  function cbFormKeyboard(dataForm, idKey, bool) {
    
    //bot.tg.sendMessage(debugChatId, dataForm)
      const cbdata = dataForm[idKey][0].callback_data
      const cbtext = dataForm[idKey][0].text
  
      switch (bool) {
        case "true":
          dataForm[idKey][0].callback_data =  cbdata.replace("true", "false");
          dataForm[idKey][0].text = cbtext.replace(/✅/, "❌");
          break;
        case "false":
          dataForm[idKey][0].callback_data =  cbdata.replace("false", "true");
          dataForm[idKey][0].text = cbtext.replace(/❌/, "✅");
          break;
      }
      return dataForm;
  }