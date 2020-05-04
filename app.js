const express = require('express');
const app = express();
const fs = require('fs');
const multer = require('multer');
const {TesseractWorker} = require('tesseract.js');
const worker = new TesseractWorker();

//storage
const storage = multer.diskStorage({
    destination: (req, res, cb) => {
        cb(null, "./uploads");
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
})
const upload = multer({storage: storage}).single('avatar');

app.set("view engine", "ejs");
app.use(express.static("public"));

//Routes
app.get("/", (req, res) => {
    res.render('index');
})

app.post('/upload', (req, res) => {
    upload(req, res, err => {
        console.log(req.file)
        fs.readFile(`./uploads/${req.file.originalname}`, (err, data)=>{
            if(err) return console.log("ERROR: ", err);
       
                worker
                .recognize(data, "eng", {tessjs_create_pdf: "1"})
                .progress(progress => {
                    console.log(progress);
                })
            .then(result => {
                res.redirect("/download")
            })
            .finally(()=>worker.terminate());
        });
    })
})

app.get("/download", (req, res) => {
    const file = `${__dirname}/tesseract.js-ocr-result.pdf`
    res.download(file);
})

app.listen(process.env.PORT || 3000, process.env.IP, () => {
    console.log("server is running");
})