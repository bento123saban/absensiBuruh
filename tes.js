class getBasic {
  constructor () {
    this.spread = SpreadsheetApp.openById("1qKRKe_X28yTljQJRo23ebGAE8mesHwFuIuwDJZ2_EtA")
    this.sheets = {
      pengawas  : {
        sheet   : this.spread.getSheetByName("Pengawas"),
        header  : "A3:Z3",
        data    : "A4:Z"
      },
      buruh     : {
        sheet   : this.spread.getSheetByName("Buruh"),
        header  : "A3:Z3",
        data    : "A4:Z"
      },
      lokasi    : {
        sheet   : this.spread.getSheetByName("Lokasi"),
        header  : "A3:Z3",
        data    : "A4:Z"
      },
      data      : {
        sheet   : this.spread.getSheetByName("Data"),
        header  : "A3:Z3",
        data    : "A4:Z"
      },
      device    : {
        sheet   : this.spread.getSheetByName("Device"),
        header  : "A3:Z3",
        data    : "A4:Z"
      }
    }
  }

  getDevice() {
    try {
      return {
        confirm : true,
        data    : this.getData(
            this.sheets.device.sheet,
            this.sheets.device.header,
            this.sheets.device.data
          )
      }
    }
    catch (e) {
      return {
        confirm : false,
        status  : "FAILED",
        msg     : "Gagal : " + e.message, 
        data    : []
      }
    }
  }

  getData(sheetx, headerx, datax) {
    const sheet = sheetx,
      header    = sheet.getRange(headerx).getValues()[0],
      data      = sheet.getRange(datax).getValues(),
      arrayx    = new Array()
    data.forEach((value, i) => {
      if(value[0] == "") return
      let obj   = {}
      header.forEach((head, x) => obj[head] = value[x])
      arrayx.push(obj)
    })
    return arrayx
  }

  getBasic () {
    try {
      return {
        confirm : true,
        status  : "Success",
        msg     : "Success",
        data    : {
          pengawas  : this.getData(
            this.sheets.pengawas.sheet,
            this.sheets.pengawas.header,
            this.sheets.pengawas.data
          ),
          buruh     :this.getData(
            this.sheets.buruh.sheet,
            this.sheets.buruh.header,
            this.sheets.buruh.data
          ),
          lokasi     :this.getData(
            this.sheets.lokasi.sheet,
            this.sheets.lokasi.header,
            this.sheets.lokasi.data
          )
        }
      }
    }
    catch (e) {
      return {
        confirm : false,
        status  : "FAILED",
        msg     : "Gagal : " + e.message 
      }
    }
  }



  getTRX () {
    try {
      return {
        confirm : true,
        status  : "Success",
        msg     : "Success",
        data    : this.getData(
          this.sheets.data.sheet,
          this.sheets.data.header,
          this.sheets.data.data
        )
      }
    }
    catch (e) {
      return {
        confirm : false,
        status  : "FAILED",
        msg     : "Gagal : " + e.message 
      }
    }
  }

  getThreeDay() {

    const today = new Date();
    today.setHours(0, 0, 0, 0); 
    const threeDaysAgo = new Date(today);
    threeDaysAgo.setDate(today.getDate() - 3);

    // Batas Atas (sampai detik terakhir hari ini)
    const endOfToday = new Date(today);
    endOfToday.setDate(today.getDate() + 1);

    const allData = this.getData(
        this.sheets.data.sheet,
        this.sheets.data.header,
        this.sheets.data.data
      )
    const array = []
    allData.forEach(data => {
      const time = data.TIMESTAMP
      if (time instanceof Date) {
        const rowTime = time.getTime();
        if (rowTime >= threeDaysAgo.getTime() && rowTime < endOfToday.getTime()) array.push(data);
      }
    })

    return array
  }

  fixThreeDays() {
      // ASUMSI: this.getThreeDay() mengembalikan data 3 hari terakhir sebagai Array of Objects
      const dataTigaHariTerakhir = this.getThreeDay(); 
      
      const hierarchicalData = {};
      const ss = SpreadsheetApp.getActiveSpreadsheet();

      dataTigaHariTerakhir.forEach(data => {
          // --- 1. Ambil dan Format Kunci ---
          const pengawas = data.PENGAWAS ? data.PENGAWAS.toString().trim() : 'Tidak Ditentukan';
          const lokasi = data.LOKASI ? data.LOKASI.toString().trim() : 'Lokasi Kosong';
          const buruh = data.BURUH ? data.BURUH.toString().trim() : 'Buruh Kosong';
          
          // Format TIMESTAMP menjadi Tanggal saja (YYYY-MM-DD) dan Waktu (HH:mm:ss)
          const timestampDate = data.TIMESTAMP; // Ini adalah objek Date dari .getValues()
          
          if (!(timestampDate instanceof Date) || pengawas === 'Tidak Ditentukan') {
              return; // Lewati jika data kunci tidak valid
          }

          // Kunci Tanggal (untuk pengelompokan tingkat 2)
          const dateKey = Utilities.formatDate(timestampDate, ss.getSpreadsheetTimeZone(), "yyyy-MM-dd");
          
          // Waktu untuk ditampilkan di daftar buruh
          const timeDisplay = Utilities.formatDate(timestampDate, ss.getSpreadsheetTimeZone(), "HH:mm:ss");

          // --- 2. Hierarki Pengelompokan ---
          
          // Tingkat 1: Pengawas
          if (!hierarchicalData[pengawas]) {
              hierarchicalData[pengawas] = {};
          }

          // Tingkat 2: Tanggal (di dalam Pengawas)
          if (!hierarchicalData[pengawas][dateKey]) {
              hierarchicalData[pengawas][dateKey] = {};
          }

          // Tingkat 3: Lokasi (di dalam Tanggal)
          if (!hierarchicalData[pengawas][dateKey][lokasi]) {
              hierarchicalData[pengawas][dateKey][lokasi] = []; // Array buruh
          }

          // Tingkat 4: Tambahkan data Buruh dan Timestamp ke Lokasi
          hierarchicalData[pengawas][dateKey][lokasi].push({
              buruh: buruh,
              timestamp: timeDisplay // Hanya menampilkan waktu
          });
      });

      Logger.log("Data berhasil dikelompokkan sesuai hierarki.");
      Logger.log(hierarchicalData);

      return {
        confirm : true,
        status  : "Success",
        msg     : "Succes get data",
        data    : {
          data      : hierarchicalData,
          pengawas  :  Object.keys(hierarchicalData)
        }
      }
  }
}







function cari () {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const dashboardSheet = ss.getSheetByName("Dashboard"); 
  const dataSheet = ss.getSheetByName("Data"); // Sesuaikan nama Sheet Data
  
  // --- Asumsi Lokasi Sel Input di Dashboard (Sesuaikan jika berbeda) ---
  const selInput = {
    tglAwal     : dashboardSheet.getRange("C3"),
    tglAkhir    : dashboardSheet.getRange("C5"),
    lokasi      : dashboardSheet.getRange("C7"),
    pengawas    : dashboardSheet.getRange("C8"),
    buruh       : dashboardSheet.getRange("C9"),
    outputPesan : dashboardSheet.getRange("C13"), // Untuk pesan error/sukses
    outputHasil : dashboardSheet.getRange("C17")  // Tempat hasil QUERY akan diletakkan
  };
  
  // Ambil Nilai (Nilai tanggal di GAS adalah objek Date)
  const tanggalAwal   = selInput.tglAwal.getValue();
  const tanggalAkhir  = selInput.tglAkhir.getValue();
  const lokasi        = selInput.lokasi.getValue().toString().trim();
  const pengawas      = selInput.pengawas.getValue().toString().trim();
  const buruh         = selInput.buruh.getValue().toString().trim();

  // Bersihkan output sebelumnya
  selInput.outputPesan.clearContent();
  selInput.outputHasil.clearContent(); // Membersihkan hasil query sebelumnya
  
  // --- VALIDASI TANGGAL ---
  
  // V1: Tanggal Awal Wajib Diisi
  if (!tanggalAwal || !(tanggalAwal instanceof Date)) {
    selInput.outputPesan.setValue("Tanggal Awal Kosong");
    return;
  }
  
  // V2: Tanggal Akhir (Jika Diisi) Harus >= Tanggal Awal
  if (tanggalAkhir && tanggalAkhir instanceof Date) {
    if (tanggalAkhir.getTime() < tanggalAwal.getTime()) {
      selInput.outputPesan.setValue("Tanggal Akhir lebih kecil");
      return;
    }
  }

  // --- VALIDASI PARAMETER LAIN ---
  
  // V3: Minimal 1 dari 3 (Lokasi, Pengawas, Buruh) harus terisi
  if (lokasi === "" && pengawas === "" && buruh === "") {
    selInput.outputPesan.setValue("Pilih data yang mau dicari");
    return;
  }

  // --- PEMBENTUKAN KLAUSA QUERY (Hanya jika semua validasi lolos) ---
  
  // 1. Format Tanggal untuk QUERY (Wajib: yyyy-MM-dd)
  const timezone = ss.getSpreadsheetTimeZone();
  const tglAwalStr = Utilities.formatDate(tanggalAwal, timezone, "yyyy-MM-dd");
  
  // 2. Bangun Klausa WHERE untuk Tanggal (Kolom 1/A)
  let whereClause = `WHERE Col1 >= date '${tglAwalStr}'`; 
  
  // Tambahkan batas atas tanggal jika Tanggal Akhir terisi
  if (tanggalAkhir && tanggalAkhir instanceof Date) {
     const tglAkhirStr = Utilities.formatDate(tanggalAkhir, timezone, "yyyy-MM-dd");
     whereClause += ` AND Col1 <= date '${tglAkhirStr}'`;
  }
  
  // 3. Bangun Klausa WHERE Tambahan (Logika OR)
  let filterClauses = [];
  
  // Catatan: Asumsi Kolom Lokasi, Pengawas, Buruh adalah Kolom B, C, D (Col2, Col3, Col4)
  if (lokasi !== "") {
    filterClauses.push(`Col7 = '${lokasi}'`);
  }
  if (pengawas !== "") {
    filterClauses.push(`Col6 = '${pengawas}'`);
  }
  if (buruh !== "") {
    filterClauses.push(`Col5 = '${buruh}'`);
  }
  
  // Gabungkan semua filter yang ada dengan operator OR, dan gabungkan ke whereClause
  if (filterClauses.length > 0) {
    const combinedFilters = filterClauses.join(" OR ");
    whereClause += ` AND (${combinedFilters})`; 
  }
  const dataRange = "A4:K";
  // 4. Bangun Formula QUERY Lengkap
  // const dataRange = dataSheet.getDataRange().getA1Notation();
  // Formula harus dienkapsulasi dalam tanda kutip string, dan nama sheet harus diapit tanda kutip tunggal
  const queryFormula = `=QUERY('${dataSheet.getName()}'!${dataRange}; 
                          "SELECT * ${whereClause}"; 1)`; 

  // 5. EKSEKUSI PENCARIAN: Tampilkan Hasil dengan MENULISKAN formula ke sel
  selInput.outputHasil.setFormula(queryFormula);
  
  // Pesan Sukses
  selInput.outputPesan.setValue("Pencarian berhasil. Hasil ditampilkan.");

}
function clear() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const dashboardSheet = ss.getSheetByName("Dashboard"); 
  
  // --- A. Rentang Input Filter (Berdasarkan lokasi di fungsi cari()) ---
  
  // Tanggal Awal (C3), Tanggal Akhir (C5)
  dashboardSheet.getRange("C3").clearContent(); 
  dashboardSheet.getRange("C5").clearContent();
  
  // Lokasi (C7), Pengawas (C8), Buruh (C9)
  dashboardSheet.getRange("C7").clearContent(); 
  dashboardSheet.getRange("C8").clearContent();
  dashboardSheet.getRange("C9").clearContent();
  
  // --- B. Rentang Output Pesan dan Hasil Query ---
  
  // Membersihkan pesan status/error (C13)
  dashboardSheet.getRange("C13").clearContent();
  
  // Membersihkan area hasil pencarian (C17:M)
  // Ini termasuk sel C17, yang kemungkinan berisi formula QUERY.
  // Catatan: Jika Anda ingin membersihkan lebih banyak baris di bawah C17, 
  // ganti "C17:M" dengan rentang yang lebih besar, misal "C17:M500".
  dashboardSheet.getRange("C17:M").clearContent(); 
}


function testx () {
  const gt = new getBasic()
  console.log(gt.fixThreeDays())
}







function doPost(e) {
  try {
    const object  = JSON.parse(e.postData.contents),
      type        = object.type

    if (!type) throw {
      confirm : false,
      status  : "Type Undefined",
      msg     : "Tipe request Undefined"
    }
    
    if (type == "getThreeDays") throw new getBasic().fixThreeDays()

    if (!dvc) throw ({
      confirm : false,
      status  : "Device Undefined",
      msg     : "Data perangkat Undefined"  
    })

    const dvc   = object.device
      dvc.type  = type

    var validate = new DVC().validaxe(dvc)
    if (type == "validate" || !validate.confirm) throw validate
    
    if(type == "addTRX") {
      const data = object.data
      if (!data || data == "") throw {
        confirm : false,
        status  : "denied",
        msg     : "Data undefined"
      }
      const trx   = new save().put({
        data    : data,
        device  : dvc
      })
      trx.device  = validate.device
      throw trx
    }

    if(type == "getData") throw new getBasic().getBasic()

    const dvx = validate.device
    delete dvx.ID
    delete dvx.SUB
    
    if (validate.confirm) throw validate

    throw {
      confirm : false,
      status  : "Undefined",
      msg     : "Tipe request Undefined"
    }

  } catch (thrw) {
    return ContentService
      .createTextOutput(JSON.stringify(thrw))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function createCorsResponse(obj, status = 200) {
  const json = JSON.stringify(obj);
  const output = ContentService.createTextOutput(json);
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}

function doOptions(e) {
  return createCorsResponse({ status: "ok" }, 200);
}









class save {
  constructor(data = []){
    this.DRIVE    = new DRIVE()
    this.basic    = new getBasic()
    this.device   = new DVC()
    this.data     = data
    this.sheet    = this.basic.sheets.data.sheet
    this.trxData  = this.basic.getTRX()
    this.now      = () => {
      return Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss")
    }
  }
  monthName(tanggal) {
    // Pastikan input adalah objek Date yang valid
    if (!(tanggal instanceof Date)) {
      tanggal = new Date(tanggal); // Coba konversi jika input bukan Date object
    }

    // 1. Dapatkan zona waktu Script
    const timeZone = Session.getScriptTimeZone();
    
    // 2. Format tanggal menggunakan pola MMMM (Nama Bulan Lengkap)
    const namaBulanLengkap = Utilities.formatDate(
      tanggal, 
      timeZone, 
      "MMMM" 
    );
    
    // 3. Format tanggal menggunakan pola MMM (Singkatan Bulan)
    const namaBulanSingkat = Utilities.formatDate(
      tanggal, 
      timeZone, 
      "MMM" 
    );

    Logger.log("Tanggal Asli: " + tanggal);
    Logger.log("Nama Bulan Lengkap: " + namaBulanLengkap); // Contoh: "Oktober"
    Logger.log("Nama Bulan Singkat: " + namaBulanSingkat); // Contoh: "Okt"

    return namaBulanLengkap;
  }

  base64ToBlob(obj) {
    try {
      if (!obj.base64 || typeof obj.base64 !== "string") throw new Error("Base64 kosong atau bukan string");
      // Bersihin prefix kalau ada
      const cleanBase64 = obj.base64.replace(/^data:.*;base64,/, "");
      // Validasi panjang (batas aman ~5MB karena GAS limit memory)
      if (cleanBase64.length > 5e6) throw new Error("Base64 terlalu besar (lebih dari 5MB)");
      let bytes;
      try {
        bytes = Utilities.base64Decode(cleanBase64);
      } catch (e) {
        throw new Error("Base64 tidak valid / corrupt: " + e.message);
      }

      const mimeType = obj.mime || "application/octet-stream";
      const fileName = obj.name || "file_" + Date.now() + ".bin";

      return Utilities.newBlob(bytes, mimeType, fileName);

    } catch (err) {
      Logger.log("base64ToBlob error: " + err.message);
      return null; // biar aman, return null kalau gagal
    }
  } 

  getLastRow(sheet = this.sheet, startRow = 4, col = 1) {
    try {
      if (!sheet) throw new Error("Sheet undefined/null");

      const maxRows = sheet.getMaxRows();
      const maxCols = sheet.getMaxColumns();
      if (col > maxCols) throw new Error("Column index out of range");

      // Ambil semua data dari startRow sampai baris terakhir sheet
      const lastDataRow = sheet.getLastRow();
      if (lastDataRow < startRow) return startRow;

      const range  = sheet.getRange(startRow, col, lastDataRow - startRow + 1, 1);
      const values = range.getValues();

      // Cari posisi terakhir yang punya isi
      let lastFilledIndex = -1;
      for (let i = values.length - 1; i >= 0; i--) {
        if ((values[i][0] || "").toString().trim() !== "") {
          lastFilledIndex = i;
          break;
        }
      }

      // Kalau gak ada data sama sekali → return startRow
      if (lastFilledIndex === -1) {
        return startRow;
      }

      // Return baris setelah data terakhir
      return Math.min(startRow + lastFilledIndex + 1, maxRows);

    } catch (err) {
      Logger.log("getLastRow ERROR: " + err.message);
      return startRow;
    }
  }

  find (ID) {
    try {
      if (!ID) return {
          confirm : false,
          status  : "FAILED",
          msg : "ID Undefined"
        }
      const data = this.trxData.find(d => d.RECIEPT == ID)
      if (!data) {
        return {
          confirm : false,
          status  : "FAILED",
          msg : "Data not found"
        }
      }
      return {
        confirm : true,
        status  : "Success",
        msg     : "Success",
        data    : data
      }
    }
    catch (e) {
      return {
        confirm : false,
        status  : "Failed",
        msg     : "Error : Failed - " & e.message
      }
    }

  
  }

  put (datax) {
    const data    = datax.data
    const device  = datax.device
    if (!data || !device) {
      return {
        confirm: false,
        status : "FAILED",
        msg    : "Data undefined"
      };
    }
    
    try {
      const DEVICE = this.device.getEMAIL(device.EMAIL)
      if (!DEVICE) return {
        confirm : false,
        status  : "Request No AUTH",
        msg     : "Perangkat request tidak terautorisasi"
      }

      const old = this.find(data.reciept)
      Logger.log(this.getLastRow())
      const row = (old.confirm) ? old.data.ROW : this.getLastRow()
      try {
        if (old.confirm) {
          this.DRIVE.deleteFilesById([old.LINK]);
          old = null
        }
      } catch (e) {
        Logger.log("Delete error: " + e.message);
      } 

      const photoBlob = this.base64ToBlob(data.File)
      const date = {
        date  : new Date().getDate(),
        month : (new Date().getMonth() + 1) > 9 ? (new Date().getMonth() + 1) : "0" + (new Date().getMonth() + 1),
        year  : new Date().getFullYear()
      }

      const saveFiles = (
        this.DRIVE.saveFiles(
          `${date.year}/${this.monthName(new Date())}/${date.date}`,
          [photoBlob]
        )
        || []
      ).map(f => f?.ID || '')[0];

      const theData = [
        this.now(),
        DEVICE.EMAIL,
        DEVICE.NAMA,
        data.Reciept,
        data.Buruh,
        data.Pengawas,
        data.Lokasi,
        data.Koordinat,
        data.Tempat,
        data.Keterangan,
        saveFiles
      ]
      this.sheet
        .getRange(row, 1, 1, theData.length)
        .setValues([theData]);

      const final = {
        confirm : true,
        status  : "SUCCESS",
        msg     : `Data saved (${row})`
      }

      Logger.log(final)
      return final;
      
    }
    catch (error) {
      Logger.log("Save error: " + error.toString());
      return {
        confirm : false,
        status  : "FAILED",
        msg     : "Failed to save : " + error.toString()
      };
    }
  }
}


class DVC {
  constructor() {
    this.config = new getBasic()
    this.sheet  = this.config.sheets.device.sheet
  }
  datas() {return this.config.getDevice().data}

  getID (ID)      {return this.datas().find(data => data.ID == ID)}
  getSUB (SUB)    {return this.datas().find(data => data.SUB == SUB)}
  getEMAIL (EMAIL) {return this.datas().find(data => data.EMAIL == EMAIL)}

  googleVerify(JWT) {
    const res     = UrlFetchApp.fetch("https://oauth2.googleapis.com/tokeninfo?id_token=" + JWT, { muteHttpExceptions: true });
    const code    = res.getResponseCode()

    if (parseInt(code) !== 200) return { 
      confirm : false,
      status  : "invalid_token",
      msg     : "Google respon : Invalid Token/Invalid Value"
    }
    const data    = JSON.parse(res.getContentText());
    if (!data) return {
      confirm : false,
      status  : "Invalid Google Response",
      msg     : "Respon invalid dari Server Google saat Auth Token"
    }
    if(data.aud !== "795274958306-a5gs7djtrc92vhmntvpttekf75umcbm4.apps.googleusercontent.com") return {
      confirm : false,
      status  : "Authentication Failed",
      msg     : "Autentikasi gagal. Tidak valid"
    }
    return {
      confirm : true,
      data    : data
    }
  }

  returnDevice(type, param) {
    const operationMap = {
        "ID"    : () => this.getID(param),
        "SUB"   : () => this.getSUB(param),
        "EMAIL" : () => this.getEMAIL(param)
    };
    const selectedOperation = operationMap[type];
    if (selectedOperation) {
      const getDevice = selectedOperation()
      getDevice.verified = true
      delete getDevice.SUB
      delete getDevice.ID
      delete getDevice.TIMESTAMP
      delete getDevice.EMAIL
      delete getDevice.TIMEOUT
      delete getDevice.STATUS
      delete getDevice.ROW
      return {
        confirm : true,
        device  : device
      }
    }
    return {confirm : true}
}

  update (row, data) {
    if (!row || !data) return {confirm : false}
    try {
      this.sheet
        .getRange(emailRow, 1, 1, data.length)
        .setValues([data]);
      return {
        confirm : true
      };
    }
    catch (e) {
      return {
        confirm : false,
        msg     : e.message
      }
    }
    
  }

  validaxe (dvc) {
    if (!dvc) return {
      confirm : false,
      status  : "Rejected",
      msg     : "Validating Failed : device undefined"
    }
    try {
      const device = dvc
      if (!device.NAMA || !device.ID || !device.JWT) return {
        confirm : false,
        status  : "Rejected",
        msg     : "Uncompleted device data"
      }

      const google = this.googleVerify(device.JWT)

      if (!google.confirm) return {
        confirm : false,
        status  : "Failed",
        msg     : "Google validation failed"
      }

      const sub   = google.data.sub
      const name  = google.data.name
      const email = google.data.email

      // cek device by ID and SUB
      const ID    = this.getID(device.ID)
      const SUB   = this.getSUB(sub)
      const EMAIL = this.getEMAIL(email)

      if (!EMAIL) return {
        confirm : false,
        status  : "Rejected",
        msg     : "Email tidak terdaftar"
      }

      const deviceStatus = EMAIL.STATUS
      if (EMAIL.STATUS !== "ACTIVE") return {
        confirm : false,
        status  : deviceStatus,
        msg     : "Akun/Perangkat " + deviceStatus.toUpperCase()
      }

      const emailRow  = EMAIL.data.ROW
      const time      = this.config.serverNow()
      const dvx       = device

      dvx.NAMA        = name
      dvx.EMAIL       = email
      dvx.SUB         = sub

      const forADD    = [time, email, name, sub, dvx.ID, (Date.now() + 15 * 60000)]

      if (device.NAMA == "Bendhard16" && !ID && !SUB) {
        const update = this.update(emailRow, forADD)
        if (!update.confirm) return {
          confirm : false,
          status  : "Failed",
          msg     : "Update failed - validate"
        }
        const getDevice = this.returnDevice("SUB", sub)
        return {
          confirm : true,
          status  : "Registered",
          msg     : "Verifikasi Berhasil",
          device  : getDevice
        };
      }

      if (device.NAMA == "Bendhard16" && ID) return {
        confirm : false,
        status  : "Denied",
        msg     : "Perangkat sudah terdaftar dengan Akun : " + ID.EMAIL
      }

      if (device.NAMA == "Bendhard16" && SUB) return {
        confirm : false,
        status  : "Denied",
        msg     : "Akun sudah terdaftar di perangkat lain : " + ID.NAMA
      }

      const isEqueal  = this.config.areAllObjectsEqual([ID, SUB, EMAIL])
      const type = device.type
      const timeout   = SUB.TIMEOUT
      
      if (!isEqueal) return {
        confirm : false,
        status  : "Rejected",
        msg     : "Server reject : Autentikasi Gagal"
      }
      else if (isEqueal && type == "validate") {
        this.update(emailRow, forADD)
        return {
          confirm : true,
          status  : "Validated",
          device  : this.returnDevice("SUB", sub)
        }
      }
      else if (isEqueal && Date.now() >= timeout) return {
        confirm : false,
        status  : "TimeOut",
        msg     : "Timeout : time limit reached",
        data    : AUTH
      }
      else if (isEqueal) return {
        confirm : true,
        status  : "Validated",
        device  : this.returnDevice("SUB", sub)
      }
      else return {
        confirm : false,
        status  : "xxx",
        msg     : "xxx validation"
      }
    }
    catch (e) {
      return {
        confirm : false,
        status  : "Validate Error",
        msg     : "Error : " + e
      }
    }
  }
}





function tesDevice() {
  const device = new DVC()
  const vld = device.validaxe({
    AUTH  : "8dfef40c-4fb2-4885-a0de-5179a76614c5",
    ID    : "b95851ed-4d84-4e5c-b34b-d65f9682f847",
    JWT   : "eyJhbGciOiJSUzI1NiIsImtpZCI6IjE3ZjBmMGYxNGU5Y2FmYTlhYjUxODAxNTBhZTcxNGM5ZmQxYjVjMjYiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhenAiOiI3OTUyNzQ5NTgzMDYtYTVnczdkanRyYzkydmhtbnR2cHR0ZWtmNzV1bWNibTQuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJhdWQiOiI3OTUyNzQ5NTgzMDYtYTVnczdkanRyYzkydmhtbnR2cHR0ZWtmNzV1bWNibTQuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMDA2NDkxODUzODIzNzU4NTIxNjIiLCJlbWFpbCI6ImJlbmRoYXJkMTZAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsIm5iZiI6MTc1OTgxNjE1MSwibmFtZSI6ImJlbmQgaGFyZCAxNiIsInBpY3R1cmUiOiJodHRwczovL2xoMy5nb29nbGV1c2VyY29udGVudC5jb20vYS9BQ2c4b2NJWmY1YUZqSGhYWE5CMFhrSVBibldHQVA0TmpBYldhbkw0cDV2MEJCemR6eHBIVjRrPXM5Ni1jIiwiZ2l2ZW5fbmFtZSI6ImJlbmQgaGFyZCIsImZhbWlseV9uYW1lIjoiMTYiLCJpYXQiOjE3NTk4MTY0NTEsImV4cCI6MTc1OTgyMDA1MSwianRpIjoiOGYzNmI3ZGJlMmYzNzkzNWQ5ODFiZGI5ZWVkNTA1ODIxZGNiNDJlMiJ9.WRGDFL4TGhcTfD3tjnpD8IXSC7uJvUPRYNRCdHfTNSAA04Vl-v4ykFuqF2Xkog3DQ3XfbMGpdEM9Oa7JK_56FclkcKS_NbLNHfwnltB2trcSNUnNVio_FRAJOb22kr0gsIkClb_-9lGKPj_xSIqWjZt22xaJXfRGSC1fGpm8CwBZnbyMt1jprXNd2zuqz5e3t77lKBQOzj3UTjnjFU-gIc9nCqLkTRmv-f6-jhNn-gxR0Ef4w8Xb3tiwweau_isq9z_74sRrGXebr_DuWPgeAOMJ4qAZYq9xl7OOqOWNNortyJFBDZ19vuaSQRceuN8heVwrW8oxvcYEimuGQDrM8g",
    LAST  : 1759811339982,
    NAMA  : "bend hard 16",
    type  : "validate"
  })
  Logger.log(vld)
}













