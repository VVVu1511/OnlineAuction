import db from '../utils/db.js'

export async function addNewCategory(description) {
    try {
        await db('CATEGORY')
            .insert({description: description});    
            
    } catch (err) {
        console.error('Cannot add new category', err);
        throw err;
    }
}

export async function updateCategory(data) {
    try {
        await db('CATEGORY')
            .where({id: data.id})
            .update({description: data.description});
            
    } catch (err) {
        console.error('Cannot update category', err);
        throw err;
    }
}

export async function deleteCategory(id) {
    try {
        await db('CATEGORY')
            .where({id: id})
            .delete();
            
    } catch (err) {
        console.error('Cannot delete category', err);
        throw err;
    }
}

export async function getAll() {
    try {
        return await db('CATEGORY')
            .select('*');
            
    } catch (err) {
        console.error('Cannot get all categories', err);
        throw err;
    }
}

export async function getChild(parent_id) {
    try {
        return await db('CATEGORY_PARENT')
            .select('child_id')
            .where({parent_id: parent_id});
            
    } catch (err) {
        console.error('Cannot get all categories', err);
        throw err;
    }
}

export async function getParent() {
    try {
        return await db('CATEGORY_PARENT')
            .join('CATEGORY', 'CATEGORY_PARENT.parent_id', 'CATEGORY.id') 
            .distinct('CATEGORY_PARENT.parent_id') 
            .select('CATEGORY.*'); 
    } catch (err) {
        console.error('Cannot get parent categories', err);
        throw err;
    }
}
