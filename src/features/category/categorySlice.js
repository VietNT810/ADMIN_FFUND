import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// GET Categories with Subcategories from API
export const getCategoriesContent = createAsyncThunk(
    'category/getCategoriesContent',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get('https://quanbeo.duckdns.org/api/v1/category/all');
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to fetch categories and subcategories.');
        }
    }
);

// De-active Category
export const deleteCategory = createAsyncThunk(
    'category/deleteCategory',
    async (categoryId, { rejectWithValue }) => {
        try {
            const response = await axios.patch(`https://quanbeo.duckdns.org/api/v1/category/delete/${categoryId}`);
            return categoryId;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || error.message || 'Failed to delete category.');
        }
    }
);

// POST New Category
export const createCategory = createAsyncThunk(
    'category/createCategory',
    async (newCategory, { rejectWithValue }) => {
        try {
            const formattedCategory = {
                categoryName: newCategory.categoryName,
                categoryDescription: newCategory.categoryDescription || '',
                subCategories: newCategory.subCategories.map(sub => ({
                    subCategoryName: sub.subCategoryName,
                    subCategoryDescription: sub.subCategoryDescription || ''
                }))
            };

            const response = await axios.post('https://quanbeo.duckdns.org/api/v1/category/create', formattedCategory);

            return response.data.data;
        } catch (error) {
            if (error.response?.data?.error && typeof error.response?.data?.error === 'object') {
                let errorMessages = [];
                for (const [field, message] of Object.entries(error.response?.data?.error)) {
                    errorMessages.push(`${field}: ${message}`);
                }
                return rejectWithValue(errorMessages.join(', '));
            }
            return rejectWithValue(error.response?.data?.error || 'Failed to create category.');
        }
    }
);

// PUT Update Category
export const updateCategory = createAsyncThunk(
    'category/updateCategory',
    async (updatedCategory, { rejectWithValue }) => {
        try {
            const formattedCategory = {
                categoryName: updatedCategory.categoryName,
                categoryDescription: updatedCategory.categoryDescription || '',
                subCategories: updatedCategory.subCategories?.map(sub => ({
                    subCategoryName: sub.subCategoryName,
                    subCategoryDescription: sub.subCategoryDescription || ''
                })) || []
            };

            const response = await axios.put(`https://quanbeo.duckdns.org/api/v1/category/update/${updatedCategory.id}`, formattedCategory);

            return response.data.data;
        } catch (error) {
            if (error.response?.data?.error && typeof error.response?.data?.error === 'object') {
                let errorMessages = [];
                for (const [field, message] of Object.entries(error.response?.data?.error)) {
                    errorMessages.push(`${field}: ${message}`);
                }
                return rejectWithValue(errorMessages.join(', '));
            }
            return rejectWithValue(error.response?.data?.error || 'Failed to update category.');
        }
    }
);

const categorySlice = createSlice({
    name: 'category',
    initialState: {
        categories: [],
        status: 'idle',
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getCategoriesContent.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(getCategoriesContent.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.categories = action.payload.map(category => ({
                    id: category.id,
                    categoryName: category.name,
                    categoryDescription: category.description,
                    subCategories: category.subCategories.map(sub => ({
                        subCategoryName: sub.name,
                        subCategoryDescription: sub.description
                    }))
                }));
            })
            .addCase(getCategoriesContent.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            .addCase(deleteCategory.fulfilled, (state, action) => {
                state.categories = state.categories.filter(category => category.id !== action.payload);
            })
            .addCase(deleteCategory.rejected, (state, action) => {
                state.error = `Error: ${action.payload}`;
            })
            .addCase(createCategory.fulfilled, (state, action) => {
                state.categories.push(action.payload);
            })
            .addCase(updateCategory.fulfilled, (state, action) => {
                const index = state.categories.findIndex(category => category.id === action.payload.id);
                if (index >= 0) {
                    state.categories[index] = action.payload;
                }
            });
    },
});

export default categorySlice.reducer;
