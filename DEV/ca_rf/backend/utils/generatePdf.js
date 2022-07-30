const Html_Pdf = require('html-pdf');
// const PDFDocument = require('pdfkit');


function _createPdfStream(html) {
    return new Promise(function (resolve, reject) {
        let options = {
            format: 'letter'
        };
        Html_Pdf.create(html, options).toStream(function (err, stream) {
            if (err) {
                return reject(err);
            }
            return resolve(stream);
        })

    })
}

function _streamToBuffer(stream, cb) {
    const chunks = [];
    stream.on('data', (chunk) => {
        chunks.push(chunk);
    });
    stream.on('end', () => {
        return cb(null, Buffer.concat(chunks));
    });
    stream.on('error', (e) => {
        return cb(e);
    })
}

    // console.log(path.join(__dirname, '..','controllers','sample.pdf'));
    // let pdfPath = path.join(__dirname, '..','controllers','sample.pdf')
    // let pdfDoc = new PDFDocument;
    // pdfDoc.pipe(fs.createWriteStream(pdfPath));
    // pdfDoc.text(data);
    // pdfDoc.end();

module.exports = {

    _createPdfStream, 
    _streamToBuffer,

};