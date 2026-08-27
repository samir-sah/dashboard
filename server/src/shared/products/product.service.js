const productModels = require("../../models/product.model");
const ApiError = require("../../utils/ApiError");

const addProduct = async (productData) => {
    const { id, name, sku, hsn, price, stock } = productData;
    
    if (!id || !name || !sku || !hsn || price == null || stock == null) {
        throw ApiError.badRequest("Id,name,sku,hsn,price,stock are required fields");
    }

    const addQuery = {
        productId: id,
        productName: name,
        sku,
        hsnCode: hsn,
        price,
        stock
    };

    const addedProduct = await productModels.create(addQuery);
    return addedProduct;
};

const getProducts = async () => {
    const products = await productModels.find().sort({ createdAt: -1 });
    return products;
};

const getProductById = async (id) => {
    let product = await productModels.findById(id).catch(() => null);
    if (!product) {
        product = await productModels.findOne({ productId: id });
    }

    if (!product) {
        throw ApiError.notFound(`Product not found: ${id}`);
    }

    return product;
};

const updateProduct = async (id, updateData) => {
    const ALLOWED_FIELDS = [
        'productName', 'sku', 'hsnCode', 'price', 'taxRate',
        'stock', 'maxCapacity', 'reorderPoint', 'lowStockThreshold',
        'isActive', 'lastRestockedAt', 'nextRestockDate'
    ];

    const updates = {};
    for (const field of ALLOWED_FIELDS) {
        if (updateData[field] !== undefined) {
            updates[field] = updateData[field];
        }
    }

    if (Object.keys(updates).length === 0) {
        throw ApiError.badRequest("No valid fields to update");
    }

    if (updates.stock !== undefined) {
        updates.outOfStock = updates.stock <= 0;
        const current = await productModels.findById(id).select('stock').lean();
        if (current && updates.stock > current.stock) {
            updates.lastRestockedAt = new Date();
        }
    }

    let product = await productModels.findByIdAndUpdate(
        id,
        { $set: updates },
        { new: true, runValidators: true }
    );

    if (!product) {
        product = await productModels.findOneAndUpdate(
            { productId: id },
            { $set: updates },
            { new: true, runValidators: true }
        );
    }

    if (!product) {
        throw ApiError.notFound(`Product not found: ${id}`);
    }

    return product;
};

module.exports = { addProduct, getProducts, getProductById, updateProduct };
