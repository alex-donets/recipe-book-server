const express = require('express');
const multer = require('multer');
const fs = require('fs');

const router = express.Router();

const Photo = require('../models/photo');

let upload = multer({
    dest: 'uploads/',
});

router.get('/list', (req, res, next) => {
    Photo.getAllPhotos((err, photosList) => {
        if (err) {
            res.json({ success: false, msg: 'Failed to get photos - ' + err });

        } else {
            // TODO: return base64, not a text array
            res.json({ success: true, list: photosList });
        }
    });
});

router.get('/get/id/:photoid', (req, res) => {
    // console.log(req.params);
    Photo.getPhotoById(req.params.photoid, (err, photo) => {
        if (err) {
            res.json({ success: false, msg: 'Failed to get photo by Id' + err });
        } else {
            res.writeHead(200, {'Content-Type': 'image/jpeg' });
            res.end(photo.photo.data, 'binary');            
            // res.json({ success: true, photo: photo });
        }
    });
});

router.post('/save', upload.single('photo'), (req, res) => {
    // console.log("Req: ", req.body);
    let newPhoto = new Photo({
        _id: req.body._id,
        name: req.body.name,
    });

    if (req.file) {
        newPhoto.photo.data = fs.readFileSync(req.file.path);
        newPhoto.photo.contentType = 'image/png';
    }

    Photo.addPhoto(newPhoto, (err, photo) => {
        if (err) {
            res.json({ success: false, msg: 'Failed to save photo - ' + err });
        } else {
            res.json({ success: true, msg: 'Photo saved.' });
        }
    });
});


router.delete('/remove/:id', (req, res) => {
    // console.log("Req: ", req.params);
    Photo.removePhoto(req.params.id, (err) => {
        if (err) {
            res.json({ success: false, msg: 'Failed to delete photo - ' + err });
        } else {
            res.json({ success: true, msg: 'Photo deleted.' });
        }
    });
});

module.exports = router;
