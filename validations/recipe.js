const Yup = require('yup');

const FILE_SIZE = 512000; // 500 kB

const addValidationSchema = Yup.object().shape({
    name: Yup.string()
        .max(50, 'Recipe name should be no more than 500 characters')
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
    categoryId: Yup.string().required('Please select a category'),
    userId: Yup.string().required('User Id is required'),
    directions: Yup.string()
        .required('Please enter directions')
        .max(5000, 'Directions should be no more than 5000 characters'),
    ingredients: Yup.array().of(
        Yup.object().shape({
            name: Yup.string()
                .required('Please enter an ingredient name')
                .max(50, 'Name should be no more than 50 characters'),
            quantity: Yup.number()
                .required('Please enter directions')
                .max(999, 'Quantity should be no more than 999 pcs')
                .min(1, 'Quantity should not be no less than 1 pcs'),
            measure: Yup.string().required('Please select a category'),
        })
    )
});

const updateValidationSchema = Yup.object().shape({
    id: Yup.string()
        .required('Id is required'),
    name: Yup.string()
        .max(50, 'Recipe name should be no more than 50 characters')
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
    categoryId: Yup.string().required('Please select a category'),
    userId: Yup.string().required('User Id is required'),
    directions: Yup.string()
        .required('Please enter directions')
        .max(5000, 'Directions should be no more than 5000 characters'),
    ingredients: Yup.array().of(
        Yup.object().shape({
            name: Yup.string()
                .required('Please enter an ingredient name')
                .max(50, 'Name should be no more than 50 characters'),
            quantity: Yup.number()
                .required('Quantity is required')
                .max(999, 'Quantity should be no more than 999 pcs')
                .min(1, 'Quantity should not be no less than 1 pcs'),
            measure: Yup.string().required('Please select a measure'),
        })
    )
});

module.exports = {
    addValidationSchema,
    updateValidationSchema
};
