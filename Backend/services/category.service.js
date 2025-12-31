import db from '../utils/db.js';

/**
 * Add new category
 */
export async function addNewCategory(description) {
    try {
        const [category] = await db('CATEGORY')
            .insert({ description })
            .returning(['id', 'description']);

        return category;
    } catch (err) {
        console.error('Cannot add new category', err);
        throw err;
    }
}

/**
 * Update category
 */
export async function updateCategory(data) {
    try {
        const [updated] = await db('CATEGORY')
            .where({ id: data.id })
            .update({ description: data.description })
            .returning(['id', 'description']);

        return updated;
    } catch (err) {
        console.error('Cannot update category', err);
        throw err;
    }
}

/**
 * Delete category
 */
export async function deleteCategory(id) {
    try {
        const deleted = await db('CATEGORY')
            .where({ id })
            .del();

        return {
            deleted: deleted > 0
        };
    } catch (err) {
        console.error('Cannot delete category', err);
        throw err;
    }
}

/**
 * Get all categories
 */
export async function getAll() {
    try {
        const data = await db('CATEGORY').select('*');
        return data;
    } catch (err) {
        console.error('Cannot get all categories', err);
        throw err;
    }
}

/**
 * Get child categories by parent_id
 */
export async function getChild(parent_id) {
    try {
        const data = await db('CATEGORY_PARENT')
            .where({ parent_id })
            .join('CATEGORY', 'CATEGORY.id', 'CATEGORY_PARENT.child_id')
            .select('CATEGORY.*');

        return data;
    } catch (err) {
        console.error('Cannot get child categories', err);
        throw err;
    }
}

/**
 * Get parent categories
 */
export async function getParent() {
    try {
        const data = await db('CATEGORY_PARENT')
            .join('CATEGORY', 'CATEGORY_PARENT.parent_id', 'CATEGORY.id')
            .distinct('CATEGORY_PARENT.parent_id')
            .select('CATEGORY.*');

        return data;
    } catch (err) {
        console.error('Cannot get parent categories', err);
        throw err;
    }
}

/**
 * Get category by id
 */
export async function getCategoryById(id) {
    try {
        const category = await db('CATEGORY')
            .where({ id })
            .first();

        return category;
    } catch (err) {
        console.error('Cannot get category by id', err);
        throw err;
    }
}
