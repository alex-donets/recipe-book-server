const Yup = require('yup');

const FILE_SIZE = 512000; // 500 kB

const addValidationSchema = Yup.object().shape({
    name: Yup.string()
        .trim()
        .max(50, 'Category name should be no more than 500 characters')
        .required('Please enter a category name'),
    photo: Yup.mixed()
        .required('Please add a photo')
        .test(
            'fileType',
            'Unsupported File Format.  Please, upload .jpg, .gif or .png',
            (value) => value && value.mimetype && value.mimetype === 'image/jpeg'
        )
        .test('fileSize', 'File size is too large', (value) => {
            return value && value.size && value.size <= FILE_SIZE;
        }),
});

const updateValidationSchema = Yup.object().shape({
    id: Yup.string()
        .required('Id is required'),
    name: Yup.string()
        .max(50, 'Category name should be no more than 50 characters')
        .required('Please enter a category name'),
    photo: Yup.mixed()
        .notRequired()
        .test(
            'fileType',
            'Unsupported File Format',
            (value) => {
                if (value) {
                    return value.mimetype && value.mimetype === 'image/jpeg';
                }

                return true;
            },
        )
        .test(
            'fileSize',
            'File size is too large',
            (value) => {
                if (value) {
                    return value.size && value.size <= FILE_SIZE;
                }

                return true;
            }
        ),
});

module.exports = {
    addValidationSchema,
    updateValidationSchema
};
